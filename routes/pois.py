from flask import Blueprint, jsonify
from services.supabase_client import supabase

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

@pois_bp.route("/pois")
def get_pois():
    try:
        res = (
            supabase
            .table("pois")
            .select("""
                id,
                place_name,
                description,
                lat,
                lng,
                cities (
                    name,
                    states (
                        name
                    )
                ),
                poi_tags (
                    tags (
                        name
                    )
                )
            """)
            .execute()
        )
        flattened = [format_poi(poi) for poi in res.data]
        return jsonify(flattened)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@pois_bp.route("/pois/<int:poi_id>")
def get_poi(poi_id):
    try:
        res = supabase.table("pois").select("*").eq("id", poi_id).execute()
        if not res.data:
            return jsonify({"error": "POI not found"}), 404
        return jsonify(format_poi(res.data[0]))
    except Exception as e:
        return jsonify({"error": str(e)}), 500
