from flask import Flask, jsonify, render_template
from flask_cors import CORS
from routes.pois import pois_bp
from routes.tags import tags_bp

app = Flask(__name__)

# Temporary fix: Allow all origins (for debugging)
# WARNING: This is less secure, use only for testing
CORS(
    app,
    origins="*",  # Allow all origins temporarily
    supports_credentials=False  # Must be False when using "*"
)

app.register_blueprint(pois_bp)
app.register_blueprint(tags_bp)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == '__main__':
    app.run(debug=True)