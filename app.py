from flask import Flask, jsonify, render_template
from flask_cors import CORS
from routes.pois import pois_bp
from routes.tags import tags_bp

app = Flask(__name__)

# Option 1: Use wildcard for Vercel subdomains
CORS(
    app,
    origins=[
        "https://www.poitracker.org",
        "https://*.vercel.app",      # This should work for all Vercel subdomains
        "http://localhost:3000"
    ],
    supports_credentials=True
)

app.register_blueprint(pois_bp)
app.register_blueprint(tags_bp)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(debug=True)