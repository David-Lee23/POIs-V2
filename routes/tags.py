from flask import Blueprint, jsonify
from services.supabase_client import supabase


tags_bp = Blueprint('tags', __name__)



@tags_bp.route("/filters")
def get_filters():
    try:
        tags = [t["name"] for t in supabase.table("tags").select("name").execute().data]
        cities = [c["name"] for c in supabase.table("cities").select("name").execute().data]
        return jsonify({
            "tags": tags,
            "cities": cities
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@tags_bp.route("/tags")
def get_tags():
    try:
        res = supabase.table("tags").select("name").execute()
        tags = [tag["name"] for tag in res.data]
        return jsonify(tags)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
