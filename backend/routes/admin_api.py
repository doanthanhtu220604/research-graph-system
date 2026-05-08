"""
Admin API Routes cho Knowledge Map.
Cung cấp endpoints để thêm, sửa, xóa dữ liệu (CRUD).
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_api_bp = Blueprint("admin_api", __name__, url_prefix="/api/admin")

# ============================================================
# GIẢNG VIÊN (CRUD)
# ============================================================

@admin_api_bp.route("/giang-vien", methods=["POST"])
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
                chuyen_nganh: $chuyen_nganh
            })
            RETURN id(gv) AS id
        """, data)
        gv_id = result[0]["id"] if result else None

        # Nếu có chọn Bộ môn, tạo Relationship (giả định bo_mon là tên)
        if data.get("bo_mon"):
            conn.write("""
                MATCH (gv:GiangVien) WHERE id(gv) = $gv_id
                MERGE (bm:BoMon {ten_bo_mon: $bo_mon})
                MERGE (gv)-[:THUOC_BO_MON]->(bm)
            """, {"gv_id": gv_id, "bo_mon": data.get("bo_mon")})

        return jsonify({"status": "ok", "message": "Thêm giảng viên thành công", "id": gv_id})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_api_bp.route("/giang-vien/<int:id>", methods=["PUT"])
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
                gv.chuyen_nganh = $chuyen_nganh
        """, {"id": id, **data})

        if "bo_mon" in data:
            # Xóa quan hệ bộ môn cũ và tạo mới
            conn.write("""
                MATCH (gv:GiangVien)-[r:THUOC_BO_MON]->(:BoMon)
                WHERE id(gv) = $id
                DELETE r
            """, {"id": id})

            if data["bo_mon"]:
                conn.write("""
                    MATCH (gv:GiangVien) WHERE id(gv) = $id
                    MERGE (bm:BoMon {ten_bo_mon: $bo_mon})
                    MERGE (gv)-[:THUOC_BO_MON]->(bm)
                """, {"id": id, "bo_mon": data.get("bo_mon")})

        return jsonify({"status": "ok", "message": "Cập nhật thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_api_bp.route("/giang-vien/<int:id>", methods=["DELETE"])
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

# ============================================================
# CÔNG TRÌNH NGHIÊN CỨU (CRUD)
# ============================================================

@admin_api_bp.route("/cong-trinh", methods=["POST"])
def create_cong_trinh():
    data = request.json
    conn = get_neo4j_connection()
    try:
        result = conn.write("""
            CREATE (ct:CongTrinhNghienCuu {
                ten_cong_trinh: $ten_cong_trinh,
                nam_xuat_ban: $nam_xuat_ban
            })
            RETURN id(ct) AS id
        """, data)
        return jsonify({"status": "ok", "message": "Thêm công trình thành công", "id": result[0]["id"]})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_api_bp.route("/cong-trinh/<int:id>", methods=["PUT"])
def update_cong_trinh(id):
    data = request.json
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (ct:CongTrinhNghienCuu) WHERE id(ct) = $id
            SET ct.ten_cong_trinh = $ten_cong_trinh,
                ct.nam_xuat_ban = $nam_xuat_ban
        """, {"id": id, **data})
        return jsonify({"status": "ok", "message": "Cập nhật thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_api_bp.route("/cong-trinh/<int:id>", methods=["DELETE"])
def delete_cong_trinh(id):
    conn = get_neo4j_connection()
    try:
        conn.write("MATCH (ct:CongTrinhNghienCuu) WHERE id(ct) = $id DETACH DELETE ct", {"id": id})
        return jsonify({"status": "ok", "message": "Xóa thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# ============================================================
# ĐỀ TÀI NGHIÊN CỨU (CRUD)
# ============================================================

@admin_api_bp.route("/de-tai", methods=["POST"])
def create_de_tai():
    data = request.json
    conn = get_neo4j_connection()
    try:
        result = conn.write("""
            CREATE (dt:DeTaiNghienCuu {
                ten_de_tai: $ten_de_tai,
                cap_de_tai: $cap_de_tai,
                nam_bat_dau: $nam_bat_dau,
                nam_ket_thuc: $nam_ket_thuc
            })
            RETURN id(dt) AS id
        """, data)
        return jsonify({"status": "ok", "message": "Thêm đề tài thành công", "id": result[0]["id"]})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_api_bp.route("/de-tai/<int:id>", methods=["PUT"])
def update_de_tai(id):
    data = request.json
    conn = get_neo4j_connection()
    try:
        conn.write("""
            MATCH (dt:DeTaiNghienCuu) WHERE id(dt) = $id
            SET dt.ten_de_tai = $ten_de_tai,
                dt.cap_de_tai = $cap_de_tai,
                dt.nam_bat_dau = $nam_bat_dau,
                dt.nam_ket_thuc = $nam_ket_thuc
        """, {"id": id, **data})
        return jsonify({"status": "ok", "message": "Cập nhật thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_api_bp.route("/de-tai/<int:id>", methods=["DELETE"])
def delete_de_tai(id):
    conn = get_neo4j_connection()
    try:
        conn.write("MATCH (dt:DeTaiNghienCuu) WHERE id(dt) = $id DETACH DELETE dt", {"id": id})
        return jsonify({"status": "ok", "message": "Xóa thành công"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
