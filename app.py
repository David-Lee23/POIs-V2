from flask import Flask, jsonify, render_template
from flask_cors import CORS
from routes.pois import pois_bp
from routes.tags import tags_bp



app = Flask(__name__)

CORS(
    app,
    origins=[
        "https://www.poitracker.org",
        r"https://*.vercel.app",      # all Vercel preview / prod sub-domains
        "http://localhost:3000"
    ],
    supports_credentials=True       # keeps you safe if you add cookies later
)

app.register_blueprint(pois_bp)
app.register_blueprint(tags_bp)


@app.route("/")
def index():
    return render_template("index.html")



if __name__ == '__main__':
    app.run(debug=True)
