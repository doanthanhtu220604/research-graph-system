"""
Admin API - Quản lý Giảng viên
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_lecturers_bp = Blueprint("admin_lecturers_api", __name__)

@admin_lecturers_bp.route("/giang-vien", methods=["POST"])
def create_giang_vien():
    data = request.json
    conn = get_neo4j_connection()
    try:
        # Tạo Node GiangVien
        result = conn.write("""
            CREATE (gv:GiangVien {
                ho_va_ten: $ho_va_ten,
                hoc_vi: $hoc_vi,
                chuc_danh: $chuc_danh,
                email: $email,
                dien_thoai: $dien_thoai,
                chuyen_mon: $chuyen_mon,
                anh_dai_dien: $anh_dai_dien
            })
            RETURN id(gv) AS id
        """, data)
        gv_id = result[0]["id"] if result else None

        # Thiết lập quan hệ Bộ môn (nếu có)
        if data.get("bo_mon"):
            conn.write("""
                MATCH (gv:GiangVien) WHERE id(gv) = $gv_id
                MERGE (bm:BoMon {ten_bo_mon: $bo_mon})
                MERGE (gv)-[:THUOC_BO_MON]->(bm)
            """, {"gv_id": gv_id, "bo_mon": data.get("bo_mon")})

        return jsonify({"status": "ok", "message": "Thêm giảng viên thành công", "id": gv_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_lecturers_bp.route("/giang-vien/<int:id>", methods=["PUT"])
def update_giang_vien(id):
    data = request.json
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (gv:GiangVien) WHERE id(gv) = $id
            SET gv.ho_va_ten = $ho_va_ten,
                gv.hoc_vi = $hoc_vi,
                gv.chuc_danh = $chuc_danh,
                gv.email = $email,
                gv.dien_thoai = $dien_thoai,
                gv.chuyen_mon = $chuyen_mon,
                gv.anh_dai_dien = $anh_dai_dien
        """, {"id": id, **data})

        if "bo_mon" in data:
            # Xóa quan hệ bộ môn cũ
            conn.write("""
                MATCH (gv:GiangVien)-[r:THUOC_BO_MON]->(:BoMon)
                WHERE id(gv) = $id
                DELETE r
            """, {"id": id})

            # Tạo quan hệ bộ môn mới (nếu có dữ liệu)
            if data["bo_mon"]:
                conn.write("""
                    MATCH (gv:GiangVien) WHERE id(gv) = $id
                    MERGE (bm:BoMon {ten_bo_mon: $bo_mon})
                    MERGE (gv)-[:THUOC_BO_MON]->(bm)
                """, {"id": id, "bo_mon": data.get("bo_mon")})

        return jsonify({"status": "ok", "message": "Cập nhật thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_lecturers_bp.route("/giang-vien/<int:id>", methods=["DELETE"])
def delete_giang_vien(id):
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (gv:GiangVien) WHERE id(gv) = $id
            DETACH DELETE gv
        """, {"id": id})
        return jsonify({"status": "ok", "message": "Xóa thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
