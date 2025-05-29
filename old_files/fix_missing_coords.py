import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

DB_URL = os.getenv("DATABASE_URL_nonsqlalchemy")
conn = psycopg2.connect(DB_URL)
cursor = conn.cursor()

# Map of known national parks to coordinates
park_coords = {
    "Yosemite National Park": (37.8651, -119.5383),
    "Grand Canyon National Park": (36.1069, -112.1129),
    "Zion National Park": (37.2982, -113.0263),
    "Rocky Mountain National Park": (40.3428, -105.6836),
    "Yellowstone National Park": (44.4280, -110.5885),
    "Arches National Park": (38.7331, -109.5925),
    "Acadia National Park": (44.3386, -68.2733),
    "Everglades National Park": (25.2866, -80.8987),
    "Big Bend National Park": (29.1275, -103.2425),
    "Bryce Canyon National Park": (37.5930, -112.1871),
    "Death Valley National Park": (36.5323, -116.9325),
    "Glacier National Park": (48.6968, -113.7183),
    "Joshua Tree National Park": (33.8734, -115.9010),
    "Great Smoky Mountains": (35.6532, -83.5070),
    "Cuyahoga Valley National Park": (41.2808, -81.5678)
}

# Find all POIs missing lat/lng
cursor.execute("SELECT id, place_name FROM pois WHERE lat IS NULL OR lng IS NULL;")
rows = cursor.fetchall()
updated = 0

for poi_id, name in rows:
    base_park = next((park for park in park_coords if park in name), None)
    if base_park:
        lat, lng = park_coords[base_park]
        cursor.execute("UPDATE pois SET lat = %s, lng = %s WHERE id = %s", (lat, lng, poi_id))
        updated += 1
        print(f"Updated {name} → ({lat}, {lng})")

conn.commit()
cursor.close()
conn.close()

print(f"✅ Patched {updated} POIs with missing coordinates.")
