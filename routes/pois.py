from flask import Blueprint, jsonify
from services.supabase_client import supabase
from flask import request

pois_bp = Blueprint('pois', __name__)

def format_poi(poi):
    city = poi.get("cities") or {}
    state = city.get("states") or {}
    subregion = state.get("sub_regions") or {}
    region = subregion.get("regions") or {}

    return {
        "name": poi.get("place_name"),
        "description": poi.get("description"),
        "lat": poi.get("lat"),
        "lng": poi.get("lng"),
        "city": city.get("name", ""),
        "state": state.get("name", ""),
        "subregion": subregion.get("name", ""),
        "region": region.get("name", ""),
        "tags": [pt["tags"]["name"] for pt in poi.get("poi_tags", []) if pt.get("tags")]
    }

def non_empty(values):
    return [v for v in values if v]

@pois_bp.route("/pois/<int:poi_id>")
def get_poi(poi_id):
    try:
        res = supabase.table("pois").select("*").eq("id", poi_id).execute()
        if not res.data:
            return jsonify({"error": "POI not found"}), 404
        return jsonify(format_poi(res.data[0]))
    except Exception as e:
        print(f"❌ ERROR in /pois/{poi_id}:", str(e))
        return jsonify({"error": str(e)}), 500

@pois_bp.route("/pois", endpoint="pois_index")
def get_pois():
    try:
        query = supabase.table("pois").select("""
            id,
            place_name,
            description,
            lat,
            lng,
            cities (
                name,
                states (
                    name,
                    sub_regions (
                        name,
                        regions (name)
                    )
                )
            ),
            poi_tags (
                tags (
                    name
                )
            )
        """)

        states = request.args.getlist("state")
        cities = request.args.getlist("city")
        subregions = request.args.getlist("subregion")
        regions = request.args.getlist("region")
        tags = request.args.getlist("tag")

        # Keep basic logging for monitoring
        print("🔍 Filters:", {
            "states": states,
            "cities": cities,
            "subregions": subregions,
            "regions": regions,
            "tags": tags
        })

        res = query.execute()

        data = []
        for poi in res.data:
            city = poi.get("cities") or {}
            state = city.get("states") or {}
            subregion = state.get("sub_regions") or {}
            region = subregion.get("regions") or {}

            # Manual filtering
            if states and state.get("name") not in states:
                continue
            if cities and city.get("name") not in cities:
                continue
            if subregions and subregion.get("name") not in subregions:
                continue
            if regions and region.get("name") not in regions:
                continue

            poi_tags = [t["tags"]["name"] for t in poi.get("poi_tags", [])]
            if tags and not any(tag in poi_tags for tag in tags):
                continue

            data.append(format_poi(poi))

        print(f"✅ Returning {len(data)} POIs")
        return jsonify(data)

    except Exception as e:
        print("❌ ERROR in /pois:", str(e))
        return jsonify({"error": str(e)}), 500