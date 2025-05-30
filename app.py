from flask import Flask, jsonify, render_template
from flask_cors import CORS
from routes.pois import pois_bp
from routes.tags import tags_bp
import re

app = Flask(__name__)

from flask_cors import CORS

app = Flask(__name__)

CORS(
    app,
    origins=[
        "https://www.poitracker.org",
        r"https://.*\.vercel\.app"        # any Vercel preview / prod URL
    ],
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)


app.register_blueprint(pois_bp)
app.register_blueprint(tags_bp)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(debug=True)