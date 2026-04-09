"""
Chat API - Hỏi Đáp Nghiên cứu
Xử lý câu hỏi bằng ngôn ngữ tự nhiên (tiếng Việt), phân tích intent
và truy vấn Neo4j để trả về câu trả lời dạng text thân thiện.
"""

from flask import Blueprint, jsonify, request
from backend.services.neo4j_connection import get_neo4j_connection

chat_api_bp = Blueprint("chat_api", __name__)


# ============================================================
# INTENT DETECTION
# ============================================================

def detect_intent(question: str) -> str:
    """
    Phân tích câu hỏi và trả về intent.
    Sử dụng keyword-matching đơn giản trên tiếng Việt.
    """
    q = question.lower()

    # Thống kê / đếm số lượng
    if any(kw in q for kw in ["bao nhiêu", "tổng số", "thống kê", "tổng cộng", "đếm", "số lượng"]):
        return "statistics"

    # Hợp tác / cùng nghiên cứu
    if any(kw in q for kw in ["hợp tác", "cùng nghiên cứu", "cộng tác", "cùng tác giả"]):
        return "collaboration"

    # Tìm theo lĩnh vực nghiên cứu
    if any(kw in q for kw in ["nghiên cứu về", "chuyên về", "lĩnh vực", "chuyên ngành", "mảng"]):
        return "search_by_field"

    # Tìm giảng viên theo tên
    if any(kw in q for kw in ["giảng viên", "thầy", "cô", "gv", "giáo viên", "giảng sư", "tiến sĩ", "phó giáo sư", "giáo sư"]):
        return "search_lecturer"

    # Tìm công trình / bài báo
    if any(kw in q for kw in ["công trình", "bài báo", "xuất bản", "publication", "tạp chí", "hội thảo", "bài viết"]):
        return "search_publication"

    # Tìm đề tài / dự án
    if any(kw in q for kw in ["đề tài", "dự án", "project", "nghiên cứu khoa học", "nckh", "đề tài khoa học"]):
        return "search_project"

    return "unknown"


def extract_name(question: str) -> str:
    """
    Cố gắng trích xuất tên người từ câu hỏi.
    Tìm cụm từ viết hoa liên tiếp sau các từ khoá về người.
    """
    import re
    q = question.strip()

    # Bỏ các từ cuối như "có bao nhiêu..." sau tên
    # Tìm pattern: (thầy|cô|gv|giảng viên) + tên
    triggers = ["thầy", "cô", "gv", "giảng viên", "giáo viên", "tiến sĩ", "ts.", "pgs", "gs"]
    q_lower = q.lower()

    for trigger in triggers:
        idx = q_lower.find(trigger)
        if idx != -1:
            after = q[idx + len(trigger):].strip()
            # Lấy các từ tiếp theo (tên người thường viết hoa)
            words = after.split()
            name_parts = []
            for w in words:
                clean = re.sub(r"[^a-zA-ZÀ-ỹ\s]", "", w)
                if clean and (clean[0].isupper() or len(name_parts) > 0):
                    name_parts.append(clean)
                else:
                    if name_parts:
                        break
            if name_parts:
                return " ".join(name_parts)
    return ""


def extract_year(question: str) -> str:
    """Trích xuất năm từ câu hỏi."""
    import re
    match = re.search(r"\b(20\d{2}|19\d{2})\b", question)
    return match.group(1) if match else ""


def extract_field(question: str) -> str:
    """
    Trích xuất từ khóa lĩnh vực từ câu hỏi.
    Lấy phần sau 'về', 'chuyên', 'lĩnh vực', v.v.
    """
    triggers = ["nghiên cứu về", "chuyên về", "lĩnh vực", "về lĩnh vực", "thuộc lĩnh vực"]
    q = question.lower()
    for t in triggers:
        idx = q.find(t)
        if idx != -1:
            after = question[idx + len(t):].strip()
            # Lấy tối đa 3 từ đầu tiên sau trigger
            words = after.split()
            return " ".join(words[:3]).strip("?.,!").strip()
    # Fallback: tất cả nội dung sau keyword quan trọng
    for kw in ["ai", "machine learning", "deep learning", "nlp", "xử lý ngôn ngữ", "mạng nơ-ron", "bảo mật", "iot", "blockchain", "cloud"]:
        if kw in q:
            return kw
    return ""


# ============================================================
# NEO4J QUERY HANDLERS
# ============================================================

def handle_statistics(question: str):
    """Xử lý câu hỏi thống kê."""
    conn = get_neo4j_connection()
    q = question.lower()

    year = extract_year(question)

    if "giảng viên" in q or "gv" in q or "giáo viên" in q:
        r = conn.query_single("MATCH (n:GiangVien) RETURN count(n) AS count")
        count = int(r["count"]) if r else 0
        return f"Hệ thống hiện có **{count} giảng viên** đang hoạt động nghiên cứu."

    if "bộ môn" in q:
        r = conn.query_single("MATCH (n:BoMon) RETURN count(n) AS count")
        count = int(r["count"]) if r else 0
        return f"Khoa CNTT có **{count} bộ môn**."

    if "lĩnh vực" in q or "chuyên ngành" in q:
        r = conn.query_single("MATCH (n:LinhVucNghienCuu) RETURN count(n) AS count")
        count = int(r["count"]) if r else 0
        return f"Hệ thống ghi nhận **{count} lĩnh vực nghiên cứu** khác nhau."

    if "công trình" in q or "bài báo" in q or "xuất bản" in q:
        if year:
            r = conn.query_single(
                "MATCH (n:CongTrinhNghienCuu) WHERE n.nam_xuat_ban = $year RETURN count(n) AS count",
                {"year": int(year)}
            )
            count = int(r["count"]) if r else 0
            return f"Năm **{year}**, khoa CNTT có **{count} công trình nghiên cứu** được xuất bản."
        else:
            r = conn.query_single("MATCH (n:CongTrinhNghienCuu) RETURN count(n) AS count")
            count = int(r["count"]) if r else 0
            return f"Tổng cộng hệ thống có **{count} công trình nghiên cứu** đã xuất bản."

    if "đề tài" in q or "dự án" in q or "nckh" in q:
        if year:
            r = conn.query_single(
                "MATCH (n:DeTaiNghienCuu) WHERE n.nam_bat_dau = $year OR n.nam_ket_thuc = $year RETURN count(n) AS count",
                {"year": int(year)}
            )
            count = int(r["count"]) if r else 0
            return f"Năm **{year}**, khoa có **{count} đề tài nghiên cứu** liên quan."
        else:
            r = conn.query_single("MATCH (n:DeTaiNghienCuu) RETURN count(n) AS count")
            count = int(r["count"]) if r else 0
            return f"Tổng cộng hệ thống có **{count} đề tài nghiên cứu**."

    # Thống kê tổng quan
    gv = conn.query_single("MATCH (n:GiangVien) RETURN count(n) AS count")
    ct = conn.query_single("MATCH (n:CongTrinhNghienCuu) RETURN count(n) AS count")
    dt = conn.query_single("MATCH (n:DeTaiNghienCuu) RETURN count(n) AS count")
    bm = conn.query_single("MATCH (n:BoMon) RETURN count(n) AS count")
    return (
        f"📊 **Thống kê tổng quan:**\n"
        f"- 👨‍🏫 Giảng viên: **{int(gv['count']) if gv else 0}**\n"
        f"- 📄 Công trình: **{int(ct['count']) if ct else 0}**\n"
        f"- 🔬 Đề tài: **{int(dt['count']) if dt else 0}**\n"
        f"- 🏢 Bộ môn: **{int(bm['count']) if bm else 0}**"
    )


def handle_search_lecturer(question: str):
    """Tìm kiếm giảng viên theo tên hoặc đặc điểm."""
    conn = get_neo4j_connection()
    name = extract_name(question)
    q = question.lower()

    if name:
        results = conn.query(
            """
            MATCH (gv:GiangVien)
            WHERE toLower(gv.ho_va_ten) CONTAINS toLower($name)
            OPTIONAL MATCH (gv)-[:THUOC_BO_MON]->(bm:BoMon)
            OPTIONAL MATCH (gv)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
            RETURN gv.ho_va_ten AS ten, gv.hoc_vi AS hoc_vi, gv.chuc_danh AS chuc_danh,
                   bm.ten_bo_mon AS bo_mon, count(ct) AS so_cong_trinh
            ORDER BY gv.ho_va_ten
            LIMIT 5
            """,
            {"name": name}
        )
        if results:
            parts = []
            for r in results:
                info = f"**{r['ten']}**"
                if r.get("hoc_vi"): info += f" ({r['hoc_vi']})"
                if r.get("bo_mon"): info += f" — {r['bo_mon']}"
                if r.get("so_cong_trinh"): info += f" — {r['so_cong_trinh']} công trình"
                parts.append(info)
            names_str = "\n".join(f"- {p}" for p in parts)
            return f"Tìm thấy giảng viên với tên **\"{name}\"**:\n{names_str}"
        else:
            return f"Không tìm thấy giảng viên nào với tên **\"{name}\"**. Bạn có thể thử tìm với tên khác."

    # Tìm theo học vị/chức danh
    for hoc_vi in ["giáo sư", "phó giáo sư", "tiến sĩ", "thạc sĩ"]:
        if hoc_vi in q:
            results = conn.query(
                """
                MATCH (gv:GiangVien)
                WHERE toLower(coalesce(gv.hoc_vi,'')) CONTAINS $hv OR toLower(coalesce(gv.chuc_danh,'')) CONTAINS $hv
                RETURN gv.ho_va_ten AS ten, gv.hoc_vi AS hoc_vi, gv.chuc_danh AS chuc_danh
                ORDER BY gv.ho_va_ten
                LIMIT 10
                """,
                {"hv": hoc_vi}
            )
            if results:
                names = [r["ten"] for r in results]
                count = len(names)
                names_str = ", ".join(names[:5])
                suffix = f" và {count - 5} người khác" if count > 5 else ""
                return f"Có **{count} giảng viên** với học vị/chức danh **{hoc_vi}**: {names_str}{suffix}."
            return f"Không tìm thấy giảng viên nào với học vị **{hoc_vi}** trong hệ thống."

    # Top giảng viên theo số công trình
    results = conn.query("""
        MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
        RETURN gv.ho_va_ten AS ten, count(ct) AS so_cong_trinh
        ORDER BY so_cong_trinh DESC
        LIMIT 5
    """)
    if results:
        parts = [f"**{r['ten']}** ({r['so_cong_trinh']} công trình)" for r in results]
        return "Top 5 giảng viên có nhiều công trình nhất:\n" + "\n".join(f"- {p}" for p in parts)

    return "Vui lòng cung cấp thêm thông tin (tên, học vị...) để tôi có thể tìm kiếm chính xác hơn."


def handle_search_publication(question: str):
    """Tìm kiếm công trình nghiên cứu."""
    conn = get_neo4j_connection()
    q = question.lower()
    name = extract_name(question)
    year = extract_year(question)

    if name:
        # Tìm công trình của một giảng viên cụ thể
        results = conn.query(
            """
            MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
            WHERE toLower(gv.ho_va_ten) CONTAINS toLower($name)
            RETURN ct.ten_cong_trinh AS ten, ct.nam_xuat_ban AS nam, ct.tap_chi AS tap_chi
            ORDER BY ct.nam_xuat_ban DESC
            LIMIT 8
            """,
            {"name": name}
        )
        if results:
            count = len(results)
            titles = [f"**{r['ten']}** ({r['nam'] or 'N/A'})" for r in results[:5]]
            suffix = f"\n_...và {count - 5} công trình khác_" if count >= 5 else ""
            return (
                f"Tìm thấy **{count} công trình** của **{name}**:\n"
                + "\n".join(f"- {t}" for t in titles)
                + suffix
            )
        return f"Không tìm thấy công trình nào của **{name}** trong hệ thống."

    if year:
        results = conn.query(
            """
            MATCH (ct:CongTrinhNghienCuu)
            WHERE ct.nam_xuat_ban = $year
            OPTIONAL MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct)
            RETURN ct.ten_cong_trinh AS ten, collect(gv.ho_va_ten) AS tac_gia
            LIMIT 8
            """,
            {"year": int(year)}
        )
        if results:
            count = len(results)
            parts = [f"**{r['ten']}**" + (f" — {', '.join(r['tac_gia'][:2])}" if r.get("tac_gia") else "") for r in results[:5]]
            suffix = f"\n_...và {count - 5} công trình khác_" if count >= 5 else ""
            return (
                f"Năm **{year}** có **{count}** công trình được ghi nhận:\n"
                + "\n".join(f"- {p}" for p in parts)
                + suffix
            )
        return f"Không tìm thấy công trình nào xuất bản năm **{year}**."

    # Công trình mới nhất
    results = conn.query("""
        MATCH (ct:CongTrinhNghienCuu)
        OPTIONAL MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct)
        RETURN ct.ten_cong_trinh AS ten, ct.nam_xuat_ban AS nam, collect(gv.ho_va_ten) AS tac_gia
        ORDER BY ct.nam_xuat_ban DESC
        LIMIT 5
    """)
    if results:
        parts = [f"**{r['ten']}** ({r['nam'] or 'N/A'})" for r in results]
        return "5 công trình nghiên cứu mới nhất:\n" + "\n".join(f"- {p}" for p in parts)

    return "Không tìm thấy công trình nào. Hãy thử cung cấp tên tác giả hoặc năm xuất bản."


def handle_search_project(question: str):
    """Tìm kiếm đề tài nghiên cứu."""
    conn = get_neo4j_connection()
    name = extract_name(question)
    year = extract_year(question)
    q = question.lower()

    if name:
        results = conn.query(
            """
            MATCH (gv:GiangVien)-[r:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)
            WHERE toLower(gv.ho_va_ten) CONTAINS toLower($name)
            RETURN dt.ten_de_tai AS ten, dt.cap_de_tai AS cap, type(r) AS vai_tro,
                   dt.nam_bat_dau AS nam_bd, dt.nam_ket_thuc AS nam_kt
            ORDER BY dt.nam_bat_dau DESC
            LIMIT 8
            """,
            {"name": name}
        )
        if results:
            count = len(results)
            parts = []
            for r in results[:5]:
                line = f"**{r['ten']}**"
                if r.get("cap"): line += f" [{r['cap']}]"
                vai = "Chủ nhiệm" if r.get("vai_tro") == "CHU_NHIEM" else "Thành viên"
                line += f" ({vai})"
                parts.append(line)
            suffix = f"\n_...và {count - 5} đề tài khác_" if count >= 5 else ""
            return (
                f"Giảng viên **{name}** tham gia **{count} đề tài**:\n"
                + "\n".join(f"- {p}" for p in parts)
                + suffix
            )
        return f"Không tìm thấy đề tài nào liên quan đến **{name}**."

    # Lọc theo năm
    if year:
        results = conn.query(
            """
            MATCH (dt:DeTaiNghienCuu)
            WHERE dt.nam_bat_dau = $year OR dt.nam_ket_thuc = $year
            OPTIONAL MATCH (gv:GiangVien)-[:CHU_NHIEM]->(dt)
            RETURN dt.ten_de_tai AS ten, dt.cap_de_tai AS cap, gv.ho_va_ten AS chu_nhiem
            LIMIT 8
            """,
            {"year": int(year)}
        )
        if results:
            count = len(results)
            parts = [f"**{r['ten']}**" + (f" (CN: {r['chu_nhiem']})" if r.get("chu_nhiem") else "") for r in results[:5]]
            suffix = f"\n_...và {count - 5} đề tài khác_" if count >= 5 else ""
            return (
                f"Năm **{year}** có **{count} đề tài** nghiên cứu:\n"
                + "\n".join(f"- {p}" for p in parts)
                + suffix
            )
        return f"Không tìm thấy đề tài nào thuộc năm **{year}**."

    # Danh sách đề tài gần đây
    results = conn.query("""
        MATCH (dt:DeTaiNghienCuu)
        OPTIONAL MATCH (gv:GiangVien)-[:CHU_NHIEM]->(dt)
        RETURN dt.ten_de_tai AS ten, dt.cap_de_tai AS cap, gv.ho_va_ten AS chu_nhiem
        ORDER BY dt.nam_bat_dau DESC
        LIMIT 5
    """)
    if results:
        parts = [f"**{r['ten']}**" + (f" — CN: {r['chu_nhiem']}" if r.get("chu_nhiem") else "") for r in results]
        return "5 đề tài nghiên cứu gần đây:\n" + "\n".join(f"- {p}" for p in parts)

    return "Không tìm thấy đề tài nào phù hợp."


def handle_search_by_field(question: str):
    """Tìm giảng viên và công trình theo lĩnh vực."""
    conn = get_neo4j_connection()
    field = extract_field(question)

    if not field:
        results = conn.query("""
            MATCH (lv:LinhVucNghienCuu)
            RETURN lv.ten_linh_vuc AS ten
            ORDER BY ten
            LIMIT 10
        """)
        if results:
            fields = [r["ten"] for r in results]
            return "Các lĩnh vực nghiên cứu hiện có:\n" + "\n".join(f"- **{f}**" for f in fields)
        return "Bạn muốn tìm lĩnh vực nào? Ví dụ: AI, Machine Learning, Bảo mật, IoT..."

    # Tìm giảng viên nghiên cứu lĩnh vực này
    lecturers = conn.query(
        """
        MATCH (gv:GiangVien)-[:NGHIEN_CUU]->(lv:LinhVucNghienCuu)
        WHERE toLower(lv.ten_linh_vuc) CONTAINS toLower($field)
        RETURN gv.ho_va_ten AS ten, lv.ten_linh_vuc AS linh_vuc
        ORDER BY gv.ho_va_ten
        LIMIT 10
        """,
        {"field": field}
    )

    # Tìm công trình liên quan đến lĩnh vực
    pubs = conn.query(
        """
        MATCH (ct:CongTrinhNghienCuu)
        WHERE toLower(coalesce(ct.tu_khoa,'')) CONTAINS toLower($field)
           OR toLower(coalesce(ct.ten_cong_trinh,'')) CONTAINS toLower($field)
        RETURN ct.ten_cong_trinh AS ten
        LIMIT 5
        """,
        {"field": field}
    )

    parts = []
    if lecturers:
        names = [r["ten"] for r in lecturers]
        lv_name = lecturers[0].get("linh_vuc", field)
        parts.append(
            f"👨‍🏫 **{len(names)} giảng viên** nghiên cứu về **{lv_name}**:\n"
            + "\n".join(f"- {n}" for n in names)
        )
    if pubs:
        pub_list = [r["ten"] for r in pubs]
        parts.append(
            f"\n📄 **Công trình liên quan:**\n"
            + "\n".join(f"- {p}" for p in pub_list)
        )

    if parts:
        return "\n".join(parts)

    return f"Chưa tìm thấy dữ liệu về lĩnh vực **\"{field}\"** trong hệ thống. Hãy thử từ khóa khác."


def handle_collaboration(question: str):
    """Tìm mối quan hệ hợp tác giữa các giảng viên."""
    conn = get_neo4j_connection()
    name = extract_name(question)

    if name:
        results = conn.query(
            """
            MATCH (gv1:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)<-[:LA_TAC_GIA_CUA]-(gv2:GiangVien)
            WHERE toLower(gv1.ho_va_ten) CONTAINS toLower($name) AND gv1 <> gv2
            RETURN gv2.ho_va_ten AS dong_nghiep, count(ct) AS so_ct
            ORDER BY so_ct DESC
            LIMIT 8
            """,
            {"name": name}
        )
        if results:
            parts = [f"**{r['dong_nghiep']}** ({r['so_ct']} công trình chung)" for r in results]
            return (
                f"Giảng viên **{name}** đã hợp tác với:\n"
                + "\n".join(f"- {p}" for p in parts)
            )
        return f"Không tìm thấy mối quan hệ hợp tác nào cho giảng viên **{name}**."

    # Cặp hợp tác nhiều nhất
    results = conn.query("""
        MATCH (gv1:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)<-[:LA_TAC_GIA_CUA]-(gv2:GiangVien)
        WHERE id(gv1) < id(gv2)
        RETURN gv1.ho_va_ten AS gv1, gv2.ho_va_ten AS gv2, count(ct) AS so_ct
        ORDER BY so_ct DESC
        LIMIT 5
    """)
    if results:
        parts = [f"**{r['gv1']}** & **{r['gv2']}**: {r['so_ct']} công trình chung" for r in results]
        return "Top cặp giảng viên hợp tác nhiều nhất:\n" + "\n".join(f"- {p}" for p in parts)

    return "Chưa tìm thấy dữ liệu hợp tác. Thử cung cấp tên giảng viên cụ thể."


def handle_unknown(question: str):
    """Trả về hướng dẫn khi không nhận ra câu hỏi."""
    return (
        "Xin lỗi, tôi chưa hiểu câu hỏi của bạn 😅\n\n"
        "Tôi có thể giúp bạn:\n"
        "- 👨‍🏫 Tìm **giảng viên** (vd: _\"Thầy Nguyễn Văn A\"_, _\"Giảng viên Tiến sĩ\"_)\n"
        "- 📄 Tìm **công trình** (vd: _\"Công trình của cô Trần B\"_, _\"Bài báo năm 2023\"_)\n"
        "- 🔬 Tìm **đề tài** (vd: _\"Đề tài nghiên cứu AI\"_, _\"Dự án năm 2022\"_)\n"
        "- 🌐 Tìm theo **lĩnh vực** (vd: _\"Nghiên cứu về Machine Learning\"_)\n"
        "- 📊 Xem **thống kê** (vd: _\"Có bao nhiêu giảng viên?\"_)\n"
        "- 🤝 Tìm **hợp tác** (vd: _\"Ai hợp tác với thầy A?\"_)"
    )


# ============================================================
# ROUTE CHÍNH
# ============================================================

@chat_api_bp.route("/ask", methods=["POST"])
def ask():
    """
    POST /api/chat/ask
    Body: { "question": "..." }
    Response: { "status": "ok", "answer": "...", "intent": "..." }
    """
    data = request.get_json(silent=True) or {}
    question = (data.get("question") or "").strip()

    if not question:
        return jsonify({
            "status": "error",
            "message": "Vui lòng nhập câu hỏi."
        }), 400

    try:
        intent = detect_intent(question)

        handler_map = {
            "statistics": handle_statistics,
            "search_lecturer": handle_search_lecturer,
            "search_publication": handle_search_publication,
            "search_project": handle_search_project,
            "search_by_field": handle_search_by_field,
            "collaboration": handle_collaboration,
            "unknown": handle_unknown,
        }

        handler = handler_map.get(intent, handle_unknown)
        answer = handler(question)

        return jsonify({
            "status": "ok",
            "answer": answer,
            "intent": intent,
        })

    except Exception as e:
        import traceback
        print(f"[CHAT ERROR] {e}\n{traceback.format_exc()}")
        return jsonify({
            "status": "error",
            "answer": "Đã xảy ra lỗi khi xử lý câu hỏi. Vui lòng thử lại sau.",
            "intent": "error",
        }), 500
