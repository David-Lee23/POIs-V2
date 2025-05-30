from flask import Flask, jsonify, render_template
from flask_cors import CORS
from routes.pois import pois_bp
from routes.tags import tags_bp
import re

app = Flask(__name__)

from flask_cors import CORS

app = Flask(__name__)

from flask import Flask
from flask_cors import CORS

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/.*": {                 # every route
            "origins": [
                "https://www.poitracker.org",
                r"https://.*\.vercel\.app"   # wildcard sub-domains work here
            ]
        }
    },
    supports_credentials=True
)



app.register_blueprint(pois_bp)
app.register_blueprint(tags_bp)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(debug=True)