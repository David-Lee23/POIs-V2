from flask import Flask, jsonify, render_template
from flask_cors import CORS
from routes.pois import pois_bp
from routes.tags import tags_bp
import re

app = Flask(__name__)

# Secure CORS configuration with proper Vercel subdomain handling
def check_origin(origin):
    if origin is None:
        return False
    
    print(f"🔍 Checking origin: {origin}")  # Keep debug logging for now
    
    # Exact matches for known domains
    exact_matches = [
        "https://www.poitracker.org",
        "http://localhost:3000"
    ]
    
    if origin in exact_matches:
        print(f"✅ Exact match allowed: {origin}")
        return True
    
    # Pattern matching for Vercel deployments
    vercel_patterns = [
        r"^https://poi-tracker-[a-zA-Z0-9]+-david-ls-projects-[a-zA-Z0-9]+\.vercel\.app$",
        r"^https://poi-tracker.*\.vercel\.app$"  # Broader pattern for any poi-tracker deployment
    ]
    
    for pattern in vercel_patterns:
        if re.match(pattern, origin):
            print(f"✅ Vercel pattern match allowed: {origin}")
            return True
    
    print(f"❌ Origin blocked: {origin}")
    return False

CORS(
    app,
    origins=check_origin,
    supports_credentials=True,
    methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allow_headers=['Content-Type', 'Authorization']
)

app.register_blueprint(pois_bp)
app.register_blueprint(tags_bp)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(debug=True)