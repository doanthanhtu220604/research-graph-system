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
                ma_gv: $ma_gv,
                ho_va_ten: $ho_va_ten,
                hoc_vi: $hoc_vi,
                chuc_danh: $chuc_danh,
                chuc_vu: $chuc_vu,
                email: $email,
                dien_thoai: $dien_thoai,
                chuyen_nganh: $chuyen_nganh,
                anh_dai_dien: $anh_dai_dien
            })
            SET gv.id = 'gv_' + toString(id(gv))
            RETURN gv.id AS id
        """, data)
        gv_id = result[0]["id"] if result else None

        # Thiết lập quan hệ Bộ môn (nếu có)
        if data.get("bo_mon"):
            conn.write("""
                MATCH (gv:GiangVien) WHERE gv.id = $gv_id
                MERGE (bm:BoMon {ten_bo_mon: $bo_mon})
                MERGE (gv)-[:THUOC_BO_MON]->(bm)
            """, {"gv_id": gv_id, "bo_mon": data.get("bo_mon")})

        # Thiết lập quan hệ Lĩnh vực nghiên cứu (nếu có)
        if data.get("linh_vuc_ids"):
            for lv_id in data["linh_vuc_ids"]:
                conn.write("""
                    MATCH (gv:GiangVien) WHERE gv.id = $gv_id
                    MATCH (lv:LinhVucNghienCuu) WHERE lv.id = $lv_id
                    MERGE (gv)-[:NGHIEN_CUU]->(lv)
                """, {"gv_id": gv_id, "lv_id": lv_id})

        return jsonify({"status": "ok", "message": "Thêm giảng viên thành công", "id": gv_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_lecturers_bp.route("/giang-vien/<id>", methods=["PUT"])
def update_giang_vien(id):
    data = request.json
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (gv:GiangVien) WHERE gv.id = $id
            SET gv.ma_gv = $ma_gv,
                gv.ho_va_ten = $ho_va_ten,
                gv.hoc_vi = $hoc_vi,
                gv.chuc_danh = $chuc_danh,
                gv.chuc_vu = $chuc_vu,
                gv.email = $email,
                gv.dien_thoai = $dien_thoai,
                gv.chuyen_nganh = $chuyen_nganh,
                gv.anh_dai_dien = $anh_dai_dien
        """, {"id": id, **data})

        if "bo_mon" in data:
            # Xóa quan hệ bộ môn cũ
            conn.write("""
                MATCH (gv:GiangVien)-[r:THUOC_BO_MON]->(:BoMon)
                WHERE gv.id = $id
                DELETE r
            """, {"id": id})

            # Tạo quan hệ bộ môn mới (nếu có dữ liệu)
            if data["bo_mon"]:
                conn.write("""
                    MATCH (gv:GiangVien) WHERE gv.id = $id
                    MERGE (bm:BoMon {ten_bo_mon: $bo_mon})
                    MERGE (gv)-[:THUOC_BO_MON]->(bm)
                """, {"id": id, "bo_mon": data.get("bo_mon")})

        # Cập nhật quan hệ Lĩnh vực nghiên cứu
        if "linh_vuc_ids" in data:
            # Xóa quan hệ lĩnh vực cũ
            conn.write("""
                MATCH (gv:GiangVien)-[r:NGHIEN_CUU]->(:LinhVucNghienCuu)
                WHERE gv.id = $id
                DELETE r
            """, {"id": id})

            # Tạo quan hệ lĩnh vực mới
            for lv_id in data["linh_vuc_ids"]:
                conn.write("""
                    MATCH (gv:GiangVien) WHERE gv.id = $id
                    MATCH (lv:LinhVucNghienCuu) WHERE lv.id = $lv_id
                    MERGE (gv)-[:NGHIEN_CUU]->(lv)
                """, {"id": id, "lv_id": lv_id})

        return jsonify({"status": "ok", "message": "Cập nhật thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_lecturers_bp.route("/giang-vien/<id>", methods=["DELETE"])
def delete_giang_vien(id):
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (gv:GiangVien) WHERE gv.id = $id
            DETACH DELETE gv
        """, {"id": id})
        return jsonify({"status": "ok", "message": "Xóa thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
