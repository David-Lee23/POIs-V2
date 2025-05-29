from flask import Blueprint, jsonify
from services.supabase_client import supabase


tags_bp = Blueprint('tags', __name__)


@tags_bp.route("/tags")
def get_tags():
    try:
        res = supabase.table("tags").select("name").execute()
        tags = [tag["name"] for tag in res.data]
        return jsonify(tags)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@tags_bp.route("/filters")
def get_filters():
    tags = [t["name"] for t in supabase.table("tags").select("name").execute().data]
    cities = [c["name"] for c in supabase.table("cities").select("name").execute().data]
    states = [s["name"] for s in supabase.table("states").select("name").execute().data]
    subregions = [sr["name"] for sr in supabase.table("sub_regions").select("name").execute().data]
    regions = [r["name"] for r in supabase.table("regions").select("name").execute().data]

    return jsonify({
        "tags": tags,
        "cities": cities,
        "states": states,
        "subregions": subregions,
        "regions": regions
    })
