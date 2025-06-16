"""
National Parks Service Data Seeder for POI Tracker
Fetches park data from NPS API and uploads to Supabase
"""
import requests
import json
import time
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# --- CONFIG ---
NPS_API_KEY = os.getenv("NPS_API_KEY")
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL")
SUPABASE_API_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")
TABLE_NAME = "pois"

# Validate required environment variables
if not all([NPS_API_KEY, SUPABASE_URL, SUPABASE_API_KEY]):
    print("❌ Missing required environment variables:")
    print("   - NPS_API_KEY")
    print("   - VITE_SUPABASE_URL")
    print("   - VITE_SUPABASE_ANON_KEY")
    print("\nPlease check your .env file.")
    exit(1)

headers = {
    "apikey": SUPABASE_API_KEY,
    "Authorization": f"Bearer {SUPABASE_API_KEY}",
    "Content-Type": "application/json"
}

def extract_latlng(latlong):
    """Extract latitude and longitude from NPS latLong string"""
    if not latlong:
        return None, None
    try:
        parts = dict(item.split(":") for item in latlong.replace(" ", "").split(","))
        return float(parts.get("lat")), float(parts.get("long"))
    except Exception as e:
        print(f"⚠️  Could not parse coordinates: {latlong} - {e}")
        return None, None

def get_nps_parks():
    """Fetch all parks from the National Parks Service API"""
    all_pois = []
    start = 0
    limit = 50
    total_fetched = 0
    
    print("📥 Fetching parks from National Parks Service API...")
    
    while True:
        try:
            res = requests.get(
                "https://developer.nps.gov/api/v1/parks",
                params={
                    "limit": limit, 
                    "start": start, 
                    "api_key": NPS_API_KEY
                },
                timeout=30
            )
            res.raise_for_status()
            
            parks_data = res.json()
            parks = parks_data.get("data", [])
            
            if not parks:
                break
                
            for park in parks:
                lat, lng = extract_latlng(park.get("latLong", ""))
                
                # Create POI object
                poi = {
                    "place_name": park.get("fullName", "Unnamed Park"),
                    "description": park.get("description", ""),
                    "lat": lat,
                    "lng": lng,
                    "city_id": None,
                    "created_by": None,
                    "is_private": False,
                    # Add park-specific metadata
                    "park_code": park.get("parkCode"),
                    "states": park.get("states", ""),
                    "website": park.get("url", ""),
                    "phone": park.get("phoneNumber", ""),
                    "email": park.get("emailAddress", "")
                }
                
                # Only add POIs with valid coordinates
                if lat is not None and lng is not None:
                    all_pois.append(poi)
                    total_fetched += 1
                    
            print(f"   Fetched {len(parks)} parks (batch {start // limit + 1})")
            
            start += limit
            total_parks = int(parks_data.get("total", 0))
            
            if start >= total_parks:
                break
                
            # Rate limiting
            time.sleep(0.2)
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Error fetching parks: {e}")
            break
        except Exception as e:
            print(f"❌ Unexpected error: {e}")
            break
    
    print(f"✅ Total parks fetched with coordinates: {total_fetched}")
    return all_pois

def upload_to_supabase(pois):
    """Upload POIs to Supabase database"""
    print("📤 Uploading POIs to Supabase...")
    
    successful_uploads = 0
    failed_uploads = 0
    
    for i, poi in enumerate(pois, 1):
        try:
            res = requests.post(
                f"{SUPABASE_URL}/rest/v1/{TABLE_NAME}",
                headers=headers,
                data=json.dumps(poi),
                timeout=10
            )
            
            if res.ok:
                successful_uploads += 1
                print(f"✅ ({i}/{len(pois)}) {poi['place_name']}")
            else:
                failed_uploads += 1
                print(f"❌ ({i}/{len(pois)}) Failed: {poi['place_name']} - {res.status_code}: {res.text[:100]}")
                
        except requests.exceptions.RequestException as e:
            failed_uploads += 1
            print(f"❌ ({i}/{len(pois)}) Network error for {poi['place_name']}: {e}")
        except Exception as e:
            failed_uploads += 1
            print(f"❌ ({i}/{len(pois)}) Unexpected error for {poi['place_name']}: {e}")
            
        # Gentle throttling
        time.sleep(0.1)
        
        # Progress update every 25 items
        if i % 25 == 0:
            print(f"   Progress: {i}/{len(pois)} ({(i/len(pois)*100):.1f}%)")
    
    print(f"\n📊 Upload Summary:")
    print(f"   ✅ Successful: {successful_uploads}")
    print(f"   ❌ Failed: {failed_uploads}")
    print(f"   📈 Success Rate: {(successful_uploads/(successful_uploads + failed_uploads)*100):.1f}%")

def main():
    """Main execution function"""
    print("🗺️  POI Tracker - National Parks Data Seeder")
    print("=" * 50)
    
    try:
        # Fetch parks data
        pois = get_nps_parks()
        
        if not pois:
            print("❌ No POIs to upload. Exiting.")
            return
        
        print(f"\n📋 Ready to upload {len(pois)} POIs to Supabase")
        
        # Confirm upload
        confirm = input("Continue with upload? (y/N): ").strip().lower()
        if confirm not in ['y', 'yes']:
            print("❌ Upload cancelled by user.")
            return
        
        # Upload to Supabase
        upload_to_supabase(pois)
        
        print("\n🎉 Data seeding completed!")
        
    except KeyboardInterrupt:
        print("\n⏹️  Operation cancelled by user.")
    except Exception as e:
        print(f"\n❌ Unexpected error in main: {e}")

if __name__ == "__main__":
    main()
