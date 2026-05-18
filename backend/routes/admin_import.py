"""
Admin API - Import dữ liệu từ file Excel/CSV
Hỗ trợ import: Giảng viên, Công trình, Đề tài, Bộ môn
"""

import io
import math
import pandas as pd
from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

admin_import_bp = Blueprint("admin_import_api", __name__)

# ─────────────────────────────────────────────
#  Helper utilities
# ─────────────────────────────────────────────

def safe_str(val) -> str:
    """Chuyển giá trị thành string sạch, bỏ NaN/None."""
    if val is None:
        return ""
    if isinstance(val, float) and math.isnan(val):
        return ""
    return str(val).strip()


def parse_list_field(val) -> list[str]:
    """Chuyển chuỗi phân cách bởi dấu '|' hoặc ',' thành list."""
    s = safe_str(val)
    if not s:
        return []
    sep = "|" if "|" in s else ","
    return [x.strip() for x in s.split(sep) if x.strip()]


def read_file_to_df(file_storage) -> pd.DataFrame:
    """Đọc file upload (xlsx/csv) thành DataFrame."""
    filename = file_storage.filename.lower()
    content = file_storage.read()
    if filename.endswith(".csv"):
        # Thử utf-8, fallback utf-8-sig (Excel VN)
        try:
            df = pd.read_csv(io.BytesIO(content), encoding="utf-8-sig", dtype=str)
        except Exception:
            df = pd.read_csv(io.BytesIO(content), encoding="cp1252", dtype=str)
    else:
        df = pd.read_excel(io.BytesIO(content), dtype=str)

    # Chuẩn hóa tên cột: strip spaces, lower
    df.columns = [c.strip() for c in df.columns]
    # Bỏ các dòng hoàn toàn rỗng
    df.dropna(how="all", inplace=True)
    return df


# ─────────────────────────────────────────────
#  Import theo loại
# ─────────────────────────────────────────────

def import_giang_vien(df: pd.DataFrame, conn) -> dict:
    """
    Cột bắt buộc: ho_va_ten
    Cột tuỳ chọn: ma_gv, hoc_vi, chuc_danh, chuc_vu, email,
                  dien_thoai, chuyen_nganh, trang_thai_cong_tac,
                  bo_mon, linh_vuc_nghien_cuu (phân cách '|')
    """
    created, updated, errors = 0, 0, []

    rows = df.to_dict(orient="records")
    for idx, row in enumerate(rows, start=2):   # start=2 vì dòng 1 là header
        ho_va_ten = safe_str(row.get("ho_va_ten"))
        if not ho_va_ten:
            errors.append(f"Dòng {idx}: thiếu họ và tên – bỏ qua.")
            continue

        props = {
            "ho_va_ten": ho_va_ten,
            "ma_gv":                safe_str(row.get("ma_gv")),
            "hoc_vi":               safe_str(row.get("hoc_vi")),
            "chuc_danh":            safe_str(row.get("chuc_danh")),
            "chuc_vu":              safe_str(row.get("chuc_vu")),
            "email":                safe_str(row.get("email")),
            "dien_thoai":           safe_str(row.get("dien_thoai")),
            "chuyen_nganh":         safe_str(row.get("chuyen_nganh")),
            "trang_thai_cong_tac":  safe_str(row.get("trang_thai_cong_tac")) or "Đang công tác",
            "anh_dai_dien":         safe_str(row.get("anh_dai_dien")),
        }

        try:
            # MERGE theo email nếu có, ngược lại MERGE theo ho_va_ten
            merge_key = "email" if props["email"] else "ho_va_ten"
            result = conn.write(f"""
                MERGE (gv:GiangVien {{{merge_key}: ${merge_key}}})
                ON CREATE SET
                    gv.id = 'gv_' + toString(id(gv)),
                    gv.created_at = timestamp(),
                    gv += $props
                ON MATCH SET
                    gv += $props
                RETURN gv.id AS gv_id,
                       (CASE WHEN gv.created_at = timestamp() THEN 'created' ELSE 'updated' END) AS action
            """, {merge_key: props[merge_key], "props": props})

            gv_id   = result[0]["gv_id"]
            action  = result[0]["action"]
            if action == "created":
                created += 1
            else:
                updated += 1

            # Xử lý Bộ môn
            bo_mon = safe_str(row.get("bo_mon"))
            if bo_mon:
                conn.write("""
                    MATCH (gv:GiangVien) WHERE gv.id = $gv_id
                    MERGE (bm:BoMon {ten_bo_mon: $bo_mon})
                    ON CREATE SET bm.id = 'bm_' + toString(id(bm))
                    MERGE (gv)-[:THUOC_BO_MON]->(bm)
                """, {"gv_id": gv_id, "bo_mon": bo_mon})

            # Xử lý Lĩnh vực nghiên cứu
            linh_vucs = parse_list_field(row.get("linh_vuc_nghien_cuu"))
            for lv_name in linh_vucs:
                conn.write("""
                    MATCH (gv:GiangVien) WHERE gv.id = $gv_id
                    MERGE (lv:LinhVucNghienCuu {ten_linh_vuc: $lv_name})
                    ON CREATE SET lv.id = 'lv_' + toString(id(lv))
                    MERGE (gv)-[:NGHIEN_CUU]->(lv)
                """, {"gv_id": gv_id, "lv_name": lv_name})

        except Exception as e:
            errors.append(f"Dòng {idx} ({ho_va_ten}): {str(e)}")

    return {"created": created, "updated": updated, "errors": errors}


def import_cong_trinh(df: pd.DataFrame, conn) -> dict:
    """
    Cột bắt buộc: ten_cong_trinh
    Cột tuỳ chọn: nam_xuat_ban, tom_tat, trang_thai, link,
                  tac_gia_giang_vien (email hoặc tên, phân cách '|'),
                  tac_gia_ngoai (tên, phân cách '|')
    """
    created, updated, errors = 0, 0, []
    rows = df.to_dict(orient="records")

    for idx, row in enumerate(rows, start=2):
        ten = safe_str(row.get("ten_cong_trinh"))
        if not ten:
            errors.append(f"Dòng {idx}: thiếu tên công trình – bỏ qua.")
            continue

        nam_xuat_ban_str = safe_str(row.get("nam_xuat_ban"))
        nam_xuat_ban = int(nam_xuat_ban_str) if nam_xuat_ban_str.isdigit() else None

        props = {
            "ten_cong_trinh": ten,
            "nam_xuat_ban":   nam_xuat_ban,
            "tom_tat":        safe_str(row.get("tom_tat")),
            "trang_thai":     safe_str(row.get("trang_thai")) or "Hoàn thành",
            "link":           safe_str(row.get("link")),
        }

        try:
            result = conn.write("""
                MERGE (ct:CongTrinhNghienCuu {ten_cong_trinh: $ten_cong_trinh})
                ON CREATE SET
                    ct.id = 'ct_' + toString(id(ct)),
                    ct.created_at = timestamp(),
                    ct += $props
                ON MATCH SET ct += $props
                RETURN ct.id AS ct_id
            """, {"ten_cong_trinh": ten, "props": props})

            ct_id = result[0]["ct_id"]
            created += 1   # MERGE nên tính là đã xử lý

            # Tác giả là Giảng viên
            tac_gia_gv = parse_list_field(row.get("tac_gia_giang_vien"))
            for tg in tac_gia_gv:
                # Tìm theo email trước, nếu không có thì theo tên
                if "@" in tg:
                    conn.write("""
                        MATCH (gv:GiangVien {email: $key}),
                              (ct:CongTrinhNghienCuu {id: $ct_id})
                        MERGE (gv)-[:LA_TAC_GIA_CUA]->(ct)
                    """, {"key": tg, "ct_id": ct_id})
                else:
                    conn.write("""
                        MATCH (gv:GiangVien {ho_va_ten: $key}),
                              (ct:CongTrinhNghienCuu {id: $ct_id})
                        MERGE (gv)-[:LA_TAC_GIA_CUA]->(ct)
                    """, {"key": tg, "ct_id": ct_id})

            # Tác giả ngoài
            tac_gia_ngoai = parse_list_field(row.get("tac_gia_ngoai"))
            for ten_tgn in tac_gia_ngoai:
                conn.write("""
                    MERGE (tgn:TacGiaNgoai {ho_va_ten: $ten})
                    ON CREATE SET tgn.id = 'tgn_' + toString(id(tgn))
                    WITH tgn
                    MATCH (ct:CongTrinhNghienCuu {id: $ct_id})
                    MERGE (tgn)-[:DONG_TAC_GIA]->(ct)
                """, {"ten": ten_tgn, "ct_id": ct_id})

        except Exception as e:
            errors.append(f"Dòng {idx} ({ten}): {str(e)}")

    return {"created": created, "updated": 0, "errors": errors}


def import_de_tai(df: pd.DataFrame, conn) -> dict:
    """
    Cột bắt buộc: ten_de_tai
    Cột tuỳ chọn: cap_de_tai, nam_bat_dau, nam_ket_thuc, tom_tat,
                  trang_thai, link,
                  chu_nhiem (email/tên GV, phân cách '|'),
                  thanh_vien (email/tên GV, phân cách '|'),
                  tac_gia_ngoai (tên, phân cách '|')
    """
    created, updated, errors = 0, 0, []
    rows = df.to_dict(orient="records")

    for idx, row in enumerate(rows, start=2):
        ten = safe_str(row.get("ten_de_tai"))
        if not ten:
            errors.append(f"Dòng {idx}: thiếu tên đề tài – bỏ qua.")
            continue

        nam_bat_dau_str = safe_str(row.get("nam_bat_dau"))
        nam_ket_thuc_str = safe_str(row.get("nam_ket_thuc"))
        nam_bat_dau = int(nam_bat_dau_str) if nam_bat_dau_str.isdigit() else None
        nam_ket_thuc = int(nam_ket_thuc_str) if nam_ket_thuc_str.isdigit() else None

        props = {
            "ten_de_tai":   ten,
            "cap_de_tai":   safe_str(row.get("cap_de_tai")),
            "nam_bat_dau":  nam_bat_dau,
            "nam_ket_thuc": nam_ket_thuc,
            "tom_tat":      safe_str(row.get("tom_tat")),
            "trang_thai":   safe_str(row.get("trang_thai")) or "Đang thực hiện",
            "link":         safe_str(row.get("link")),
        }

        try:
            result = conn.write("""
                MERGE (dt:DeTaiNghienCuu {ten_de_tai: $ten_de_tai})
                ON CREATE SET
                    dt.id = 'dt_' + toString(id(dt)),
                    dt.created_at = timestamp(),
                    dt += $props
                ON MATCH SET dt += $props
                RETURN dt.id AS dt_id
            """, {"ten_de_tai": ten, "props": props})

            dt_id = result[0]["dt_id"]
            created += 1

            def _link_gv(col: str, rel: str):
                for tg in parse_list_field(row.get(col)):
                    key_field = "email" if "@" in tg else "ho_va_ten"
                    conn.write(f"""
                        MATCH (gv:GiangVien {{{key_field}: $key}}),
                              (dt:DeTaiNghienCuu {{id: $dt_id}})
                        MERGE (gv)-[:{rel}]->(dt)
                    """, {"key": tg, "dt_id": dt_id})

            _link_gv("chu_nhiem", "CHU_NHIEM")
            _link_gv("thanh_vien", "THAM_GIA")

            for ten_tgn in parse_list_field(row.get("tac_gia_ngoai")):
                conn.write("""
                    MERGE (tgn:TacGiaNgoai {ho_va_ten: $ten})
                    ON CREATE SET tgn.id = 'tgn_' + toString(id(tgn))
                    WITH tgn
                    MATCH (dt:DeTaiNghienCuu {id: $dt_id})
                    MERGE (tgn)-[:DONG_TAC_GIA]->(dt)
                """, {"ten": ten_tgn, "dt_id": dt_id})

        except Exception as e:
            errors.append(f"Dòng {idx} ({ten}): {str(e)}")

    return {"created": created, "updated": 0, "errors": errors}


def import_bo_mon(df: pd.DataFrame, conn) -> dict:
    """
    Cột bắt buộc: ten_bo_mon
    Cột tuỳ chọn: mo_ta, truong_bo_mon (email/tên GV)
    """
    created, updated, errors = 0, 0, []
    rows = df.to_dict(orient="records")

    for idx, row in enumerate(rows, start=2):
        ten = safe_str(row.get("ten_bo_mon"))
        if not ten:
            errors.append(f"Dòng {idx}: thiếu tên bộ môn – bỏ qua.")
            continue

        props = {
            "ten_bo_mon": ten,
            "mo_ta":      safe_str(row.get("mo_ta")),
        }

        try:
            result = conn.write("""
                MERGE (bm:BoMon {ten_bo_mon: $ten_bo_mon})
                ON CREATE SET
                    bm.id = 'bm_' + toString(id(bm)),
                    bm.created_at = timestamp(),
                    bm += $props
                ON MATCH SET bm += $props
                RETURN bm.id AS bm_id
            """, {"ten_bo_mon": ten, "props": props})

            bm_id = result[0]["bm_id"]
            created += 1

            truong = safe_str(row.get("truong_bo_mon"))
            if truong:
                key_field = "email" if "@" in truong else "ho_va_ten"
                conn.write(f"""
                    MATCH (gv:GiangVien {{{key_field}: $key}}),
                          (bm:BoMon {{id: $bm_id}})
                    MERGE (gv)-[:TRUONG_BO_MON]->(bm)
                """, {"key": truong, "bm_id": bm_id})

        except Exception as e:
            errors.append(f"Dòng {idx} ({ten}): {str(e)}")

    return {"created": created, "updated": 0, "errors": errors}


# ─────────────────────────────────────────────
#  Dispatch map
# ─────────────────────────────────────────────
IMPORT_HANDLERS = {
    "giang-vien":  import_giang_vien,
    "cong-trinh":  import_cong_trinh,
    "de-tai":      import_de_tai,
    "bo-mon":      import_bo_mon,
}


# ─────────────────────────────────────────────
#  Endpoints
# ─────────────────────────────────────────────

@admin_import_bp.route("/import/upload", methods=["POST"])
def import_upload():
    """
    POST /api/admin/import/upload
    Form-data:
      - file      : file Excel hoặc CSV
      - data_type : 'giang-vien' | 'cong-trinh' | 'de-tai' | 'bo-mon'
    """
    if "file" not in request.files:
        return jsonify({"status": "error", "message": "Không tìm thấy file upload."}), 400

    file = request.files["file"]
    data_type = request.form.get("data_type", "").strip()

    if not file.filename:
        return jsonify({"status": "error", "message": "Tên file rỗng."}), 400

    ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ("xlsx", "xls", "csv"):
        return jsonify({"status": "error", "message": "Chỉ hỗ trợ file .xlsx, .xls hoặc .csv"}), 400

    if data_type not in IMPORT_HANDLERS:
        return jsonify({
            "status": "error",
            "message": f"Loại dữ liệu '{data_type}' không hợp lệ. "
                       f"Chọn một trong: {', '.join(IMPORT_HANDLERS.keys())}"
        }), 400

    try:
        df = read_file_to_df(file)
        if df.empty:
            return jsonify({"status": "error", "message": "File không có dữ liệu."}), 400

        total_rows = len(df)
        conn = get_neo4j_connection()
        result = IMPORT_HANDLERS[data_type](df, conn)

        return jsonify({
            "status": "ok",
            "message": "Import hoàn tất.",
            "total_rows": total_rows,
            "created":    result["created"],
            "updated":    result["updated"],
            "error_count": len(result["errors"]),
            "errors":     result["errors"][:50],   # tối đa 50 lỗi trả về
        })

    except Exception as e:
        return jsonify({"status": "error", "message": f"Lỗi xử lý file: {str(e)}"}), 500


@admin_import_bp.route("/import/template/<data_type>", methods=["GET"])
def download_template(data_type: str):
    """
    GET /api/admin/import/template/<data_type>
    Trả về file Excel mẫu để người dùng điền dữ liệu.
    """
    templates: dict[str, list[str]] = {
        "giang-vien": [
            "ho_va_ten", "ma_gv", "hoc_vi", "chuc_danh", "chuc_vu",
            "email", "dien_thoai", "chuyen_nganh", "trang_thai_cong_tac",
            "bo_mon", "linh_vuc_nghien_cuu"
        ],
        "cong-trinh": [
            "ten_cong_trinh", "nam_xuat_ban", "tom_tat", "trang_thai", "link",
            "tac_gia_giang_vien", "tac_gia_ngoai"
        ],
        "de-tai": [
            "ten_de_tai", "cap_de_tai", "nam_bat_dau", "nam_ket_thuc",
            "tom_tat", "trang_thai", "link",
            "chu_nhiem", "thanh_vien", "tac_gia_ngoai"
        ],
        "bo-mon": [
            "ten_bo_mon", "mo_ta", "truong_bo_mon"
        ],
    }

    if data_type not in templates:
        return jsonify({"status": "error", "message": "Loại không hợp lệ."}), 400

    columns = templates[data_type]
    df_template = pd.DataFrame(columns=columns)

    buf = io.BytesIO()
    with pd.ExcelWriter(buf, engine="openpyxl") as writer:  # type: ignore[arg-type]
        df_template.to_excel(writer, index=False, sheet_name="Data")
        # Định dạng header
        ws = writer.sheets["Data"]
        from openpyxl.styles import Font, PatternFill, Alignment  # type: ignore[import-untyped]
        header_font  = Font(bold=True, color="FFFFFF")
        header_fill  = PatternFill("solid", fgColor="3B82F6")
        header_align = Alignment(horizontal="center", vertical="center")
        for cell in ws[1]:
            cell.font      = header_font
            cell.fill      = header_fill
            cell.alignment = header_align
            ws.column_dimensions[cell.column_letter].width = max(len(str(cell.value)) + 6, 20)

    buf.seek(0)

    from flask import send_file
    return send_file(
        buf,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        as_attachment=True,
        download_name=f"template_{data_type}.xlsx"
    )
