from flask import Blueprint, jsonify
from services.supabase_client import supabase
from flask import request


pois_bp = Blueprint('pois', __name__)


def format_poi(poi):
    return {
        "name": poi.get("place_name"),
        "description": poi.get("description"),
        "lat": poi.get("lat"),  # Add these columns if you haven’t yet
        "lng": poi.get("lng"),
        "city": poi.get("cities", {}).get("name", ""),
        "state": poi.get("cities", {}).get("states", {}).get("name", ""),
        "tags": [pt["tags"]["name"] for pt in poi.get("poi_tags", []) if pt.get("tags")]
    }



@pois_bp.route("/pois/<int:poi_id>")
def get_poi(poi_id):
    try:
        res = supabase.table("pois").select("*").eq("id", poi_id).execute()
        if not res.data:
            return jsonify({"error": "POI not found"}), 404
        return jsonify(format_poi(res.data[0]))
    except Exception as e:
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

        city = request.args.get("city")
        state = request.args.get("state")
        subregion = request.args.get("subregion")
        region = request.args.get("region")
        tags = request.args.getlist("tag")  # ⬅️ gets multiple values

        if city:
            query = query.eq("cities.name", city)
        if state:
            query = query.eq("cities.states.name", state)
        if subregion:
            query = query.eq("cities.states.sub_regions.name", subregion)
        if region:
            query = query.eq("cities.states.sub_regions.regions.name", region)

        res = query.execute()

        # Manual filtering by tag list
        data = []
        for poi in res.data:
            poi_tags = [t["tags"]["name"] for t in poi.get("poi_tags", [])]
            if tags:
                if not any(tag in poi_tags for tag in tags):
                    continue
            data.append(format_poi(poi))

        return jsonify(data)

    except Exception as e:
        print("❌ ERROR in /pois:", str(e))
        return jsonify({"error": str(e)}), 500
