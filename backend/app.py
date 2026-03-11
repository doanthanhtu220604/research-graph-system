"""
Flask Application - Knowledge Map NCKH Khoa CNTT
Ứng dụng web Bản đồ tri thức nghiên cứu khoa học.
"""

import os
import sys

# Thêm thư mục gốc vào Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
from backend.services.neo4j_connection import (
    get_neo4j_connection,
    close_neo4j_connection,
)
from backend.routes.api import api_bp


def create_app():
    """Factory pattern tạo Flask app."""
    app = Flask(__name__, static_folder=None)
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")

    # Cho phép CORS (frontend gọi API)
    CORS(app)

    # Đăng ký API Blueprint
    app.register_blueprint(api_bp)

    # ============================
    # Serve Frontend (static files)
    # ============================
    frontend_dir = os.path.join(os.path.dirname(__file__), "..", "frontend")

    @app.route("/")
    def serve_index():
        return send_from_directory(frontend_dir, "index.html")

    @app.route("/<path:filename>")
    def serve_static(filename):
        return send_from_directory(frontend_dir, filename)

    # ============================
    # Error handlers
    # ============================
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"status": "error", "message": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"status": "error", "message": "Internal server error"}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    print()
    print("=" * 55)
    print("  KNOWLEDGE MAP - KHOA CNTT, DH NHA TRANG")
    print("=" * 55)
    print("  Web app : http://localhost:5000")
    print("  API     : http://localhost:5000/api/stats/overview")
    print("  Graph   : http://localhost:5000/api/graph/all")
    print("=" * 55)
    print()
    app.run(debug=True, host="0.0.0.0", port=5000)
