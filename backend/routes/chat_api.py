"""
Chat API - Hỏi Đáp Nghiên cứu (v2)
Xử lý câu hỏi bằng ngôn ngữ tự nhiên (tiếng Việt), phân tích intent
và truy vấn Neo4j để trả về câu trả lời dạng text thân thiện.

Cải tiến v2:
- Thêm intents: bộ môn, cấp đề tài, tạp chí, top GV, chủ nhiệm, thông tin GV
- Keyword matching đa dạng hơn với nhiều biến thể từ
- extract_name() linh hoạt hơn, có fallback dựa vào cụm từ viết hoa
- Smart fallback: tự tìm kiếm tổng quát trước khi báo không hiểu
- Hợp tác qua cả công trình lẫn đề tài
"""

import re
import json
import os
from flask import Blueprint, jsonify, request
from rapidfuzz import fuzz
from pyvi import ViPosTagger
from backend.services.neo4j_connection import get_neo4j_connection

chat_api_bp = Blueprint("chat_api", __name__)

CONFIG_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'config', 'chat_intents.json')
with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
    CHAT_CONFIG = json.load(f)

# ============================================================
# INTENT DETECTION (v2 - mở rộng)
# ============================================================

def detect_intent(question: str) -> str:
    """
    Phân tích câu hỏi và trả về intent.
    Sử dụng HỆ THỐNG SCORING để tính điểm cho từng intent thay vì dùng rule tuần tự.
    Giúp giải quyết việc đụng độ keyword (VD: 'có tên -> auto teacher intent').
    """
    q = question.lower()
    
    # 0. HARD RULES (Ưu tiên tuyệt đối cho các câu hỏi phổ biến, không dùng scoring)
    if "thuộc bộ môn nào" in q or "ở bộ môn nào" in q or "thuộc khoa nào" in q:
        return "lecturer_info"
    if re.search(r"có bao nhiêu (đề tài|dự án|công trình|bài báo|giảng viên|thầy|cô|người)", q):
        return "statistics"
    if "ai là chủ nhiệm" in q or "chủ nhiệm là ai" in q or "ai phụ trách" in q:
        return "who_leads"

    scores = {intent: 0 for intent in CHAT_CONFIG["intents"].keys()}

    # 1. Tính điểm cơ bản dựa trên keyword matching
    for intent, keywords in CHAT_CONFIG["intents"].items():
        for kw in keywords:
            kw_lower = kw.lower()
            if kw_lower in q:
                # Match chính xác chuỗi con: keyword càng dài điểm càng cao (số lượng từ * 10)
                scores[intent] += len(kw_lower.split()) * 10
            else:
                # Match mờ (fuzz)
                score = fuzz.partial_ratio(kw_lower, q)
                if score > 85:
                    scores[intent] += 5

    # 2. Phân tích theo Pattern câu hỏi (Question patterns)
    if re.search(r"bao nhiêu|có mấy|đếm|thống kê|số lượng|tổng số|tất cả bao nhiêu", q):
        scores["statistics"] += 40
    if re.search(r"ai là chủ nhiệm|ai phụ trách|ai dẫn dắt|ai đứng đầu|chủ nhiệm là ai", q):
        scores["who_leads"] += 40
    if re.search(r"cùng nghiên cứu|hợp tác với|làm việc chung|viết chung|cùng viết|cộng tác", q):
        scores["collaboration"] += 40
    if re.search(r"(top|nhất|cao nhất|hàng đầu|nhiều nhất) (giảng viên|thầy|cô|gv)", q):
        scores["top_lecturers"] += 40

    # 3. Extract thêm entities (Year, Name) và áp dụng Strong Rules
    year = extract_year(question)
    name = extract_name(question)
    
    if year:
        # Nếu có 'năm' và có dấu hiệu hỏi về 'đề tài' -> Tăng mạnh điểm search_project
        if scores.get("search_project", 0) > 0:
            scores["search_project"] += 50
            
        # Nếu có 'năm' và dấu hiệu hỏi về 'công trình'
        if scores.get("search_publication", 0) > 0:
            scores["search_publication"] += 50
            
        # Thống kê thường gắn liền với năm
        if scores.get("statistics", 0) > 0:
            scores["statistics"] += 20

    if name:
        # Tăng điểm khi có NAME để chatbot nhạy bén hơn
        scores["search_lecturer"] += 30
        
        # Boost thêm cho các intent mang tính chuyên biệt nếu đã xuất hiện keyword
        if scores.get("search_project", 0) > 0:
            scores["search_project"] += 30
        if scores.get("search_publication", 0) > 0:
            scores["search_publication"] += 30
        if scores.get("who_leads", 0) > 0:
            scores["who_leads"] += 30
        if scores.get("collaboration", 0) > 0:
            scores["collaboration"] += 30
        if scores.get("lecturer_info", 0) > 0 or re.search(r"thông tin|giới thiệu|email|số điện thoại|liên hệ", q):
            scores["lecturer_info"] += 50

    # 4. Phân tích ngữ cảnh chồng chéo keyword & GIẢM điểm intent tổng quát
    # - Nếu tìm "top" + "đề tài" -> chuyển thành top_by_projects 
    if scores.get("top_lecturers", 0) > 0 and scores.get("top_by_projects", 0) > 0:
        scores["top_by_projects"] += 100
        scores["top_lecturers"] -= 50 # Giảm điểm tổng quát

    # - Nếu nhắc "đề tài" + "thầy|cô" -> Ưu tiên "đề tài", giảm điểm "search_lecturer"
    if scores.get("search_project", 0) > 0 and scores.get("search_lecturer", 0) > 0:
        scores["search_project"] += 20
        scores["search_lecturer"] -= 40 # Phạt nặng intent giảng viên chung chung

    # - Nếu nhắc "công trình/bài báo" + "thầy|cô" -> Ưu tiên "công trình", giảm điểm "search_lecturer"
    if scores.get("search_publication", 0) > 0 and scores.get("search_lecturer", 0) > 0:
        scores["search_publication"] += 20
        scores["search_lecturer"] -= 40

    # - Nếu hỏi "ai chủ nhiệm" / "thầy cô" / "đề tài" -> Chủ nhiệm là cụ thể nhất
    if scores.get("who_leads", 0) > 0:
        if scores.get("search_lecturer", 0) > 0:
            scores["search_lecturer"] -= 40
        if scores.get("search_project", 0) > 0:
            scores["who_leads"] += 20 # Chủ nhiệm đi liền với dự án
            scores["search_project"] -= 20

    # 5. Filter ra intent lớn nhất
    top_intent = "unknown"
    max_score = 0
    for intent, score in scores.items():
        if score > max_score and score > 0:
            max_score = score
            top_intent = intent

    return top_intent


# ============================================================
# ENTITY EXTRACTORS
# ============================================================

def extract_name(question: str) -> str:
    """
    Trích xuất tên người từ câu hỏi.
    Dùng Pyvi (ViPosTagger) cho Natural Language Processing và Rapidfuzz kết hợp DB Neo4j.
    """
    q = question.strip()
    q_lower = q.lower()

    # 1. Thử dùng Pyvi lấy Proper Noun (Np)
    try:
        tagged_words, tagged_pos = ViPosTagger.postagging(q)
        np_words = []
        for word, pos in zip(tagged_words, tagged_pos):
            if pos == 'Np':
                np_words.append(word.replace("_", " "))
        
        if np_words:
            # Chọn cụm Np dài nhất (vì có thể có nhiều tên riêng được nhận diện)
            # Hoặc kết hợp các Np liên tiếp, nhưng ở đây có thể nối hoặc lấy tên đầu.
            return " ".join(np_words)
    except Exception:
        pass

    # 2. Database Fuzzy Matching
    try:
        conn = get_neo4j_connection()
        results = conn.query("MATCH (gv:GiangVien) WHERE coalesce(gv.is_deleted, false) = false RETURN gv.ho_va_ten AS ten")
        if results:
            names = [r['ten'] for r in results if r.get('ten')]
            # Ưu tiên các tên dài (tránh trường hợp tên ngắn khớp một phần trong từ khác)
            names.sort(key=len, reverse=True)
            
            best_match = None
            highest_score = 0
            for ten in names:
                ten_lower = ten.lower()
                # Thử tìm trực tiếp chuỗi họ tên con trong câu
                if ten_lower in q_lower:
                    return ten
                
                score = fuzz.partial_ratio(ten_lower, q_lower)
                if score > 85 and score > highest_score:
                    highest_score = score
                    best_match = ten
                    
            if best_match:
                return best_match
    except Exception:
        pass

    # 3. Fallback: Rule-based (Tránh trường hợp DB lỗi)
    triggers = [
        "thầy", "cô", "gv", "giảng viên", "giáo viên",
        "tiến sĩ", "ts.", "ts ", "pgs.", "pgs ", "gs.", "gs ",
        "phó giáo sư", "giáo sư", "thạc sĩ", "ths.", "ths ",
        "giới thiệu về", "thông tin về", "của thầy", "của cô",
        "hợp tác với", "làm việc với", "cùng với",
        "chủ nhiệm là", "phụ trách bởi",
    ]

    for trigger in triggers:
        idx = q_lower.find(trigger)
        if idx != -1:
            after = q[idx + len(trigger):].strip()
            words = after.split()
            name_parts = []
            for w in words:
                clean = re.sub(r"[^a-zA-ZÀ-ỹ]", "", w)
                if clean and (clean[0].isupper() or (name_parts and len(clean) > 1)):
                    name_parts.append(clean)
                else:
                    if name_parts:
                        break
            if name_parts and len(" ".join(name_parts)) > 1:
                return " ".join(name_parts)

    return ""


def extract_year(question: str) -> str:
    """Trích xuất năm từ câu hỏi."""
    match = re.search(r"\b(20\d{2}|19\d{2})\b", question)
    return match.group(1) if match else ""


def extract_field(question: str) -> str:
    """Trích xuất từ khóa lĩnh vực từ câu hỏi."""
    q = question.lower()
    
    tech_kws = CHAT_CONFIG["keywords"].get("tech_kws", [])
    for kw in tech_kws:
        if kw in q or fuzz.partial_ratio(kw, q) > 85:
            return kw

    triggers = ["nghiên cứu về", "chuyên về", "lĩnh vực", "về lĩnh vực", "thuộc lĩnh vực", "mảng"]
    for t in triggers:
        idx = q.find(t)
        if idx != -1:
            after = question[idx + len(t):].strip()
            words = after.split()
            result = []
            for w in words[:4]:
                clean = w.strip("?.,!")
                if clean.lower() in ["có", "là", "nào", "không", "gì", "đó", "nhỉ", "để", "thì"]:
                    break
                result.append(clean)
            if result:
                return " ".join(result).strip()
    return ""


def extract_department(question: str) -> str:
    """Trích xuất tên bộ môn từ câu hỏi."""
    q = question.lower()
    triggers = ["bộ môn", "thuộc bộ môn", "trong bộ môn", "của bộ môn"]
    for t in triggers:
        idx = q.find(t)
        if idx != -1:
            after = question[idx + len(t):].strip()
            words = after.split()
            result = []
            for w in words[:5]:
                clean = w.strip("?.,!")
                if clean.lower() in ["có", "là", "gồm", "nào", "thì", "không", "ai"]:
                    break
                result.append(clean)
            return " ".join(result).strip()
    return ""


def extract_project_level(question: str) -> str:
    """Trích xuất cấp đề tài."""
    level_map = {
        "cấp nhà nước": "nhà nước",
        "cấp bộ": "bộ",
        "cấp tỉnh": "tỉnh",
        "cấp trường": "trường",
        "cấp cơ sở": "cơ sở",
    }
    q = question.lower()
    for key, val in level_map.items():
        if key in q:
            return val
    return ""


def extract_journal(question: str) -> str:
    """Trích xuất tên tạp chí/hội thảo từ câu hỏi."""
    q = question.lower()
    triggers = ["tạp chí", "hội thảo", "hội nghị", "đăng trên", "xuất bản trên"]
    for t in triggers:
        idx = q.find(t)
        if idx != -1:
            after = question[idx + len(t):].strip()
            words = after.split()
            result = []
            for w in words[:5]:
                clean = w.strip("?.,!")
                if clean.lower() in ["có", "là", "nào", "không"]:
                    break
                result.append(clean)
            return " ".join(result).strip()
            
    journal_kws = CHAT_CONFIG["keywords"].get("journal_kws", [])
    for kw in journal_kws:
        if kw in q or fuzz.partial_ratio(kw, q) > 85:
            return kw
    return ""


# ============================================================
# HANDLERS (v2)
# ============================================================

def handle_statistics(question: str):
    """Xử lý câu hỏi thống kê."""
    conn = get_neo4j_connection()
    q = question.lower()
    year = extract_year(question)

    if "giảng viên" in q or "gv" in q or "giáo viên" in q:
        r = conn.query_single("MATCH (n:GiangVien) WHERE coalesce(n.is_deleted, false) = false RETURN count(n) AS count")
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
                "MATCH (n:CongTrinhNghienCuu) WHERE n.nam_xuat_ban = $year AND coalesce(n.is_deleted, false) = false RETURN count(n) AS count",
                {"year": int(year)}
            )
            count = int(r["count"]) if r else 0
            return f"Năm **{year}**, khoa CNTT có **{count} công trình nghiên cứu** được xuất bản."
        else:
            r = conn.query_single("MATCH (n:CongTrinhNghienCuu) WHERE coalesce(n.is_deleted, false) = false RETURN count(n) AS count")
            count = int(r["count"]) if r else 0
            return f"Tổng cộng hệ thống có **{count} công trình nghiên cứu** đã xuất bản."

    if "đề tài" in q or "dự án" in q or "nckh" in q:
        if year:
            r = conn.query_single(
                "MATCH (n:DeTaiNghienCuu) WHERE (n.nam_bat_dau = $year OR n.nam_ket_thuc = $year) AND coalesce(n.is_deleted, false) = false RETURN count(n) AS count",
                {"year": int(year)}
            )
            count = int(r["count"]) if r else 0
            return f"Năm **{year}**, khoa có **{count} đề tài nghiên cứu** liên quan."
        else:
            r = conn.query_single("MATCH (n:DeTaiNghienCuu) WHERE coalesce(n.is_deleted, false) = false RETURN count(n) AS count")
            count = int(r["count"]) if r else 0
            return f"Tổng cộng hệ thống có **{count} đề tài nghiên cứu**."

    # Thống kê tổng quan
    gv = conn.query_single("MATCH (n:GiangVien) RETURN count(n) AS count")
    ct = conn.query_single("MATCH (n:CongTrinhNghienCuu) RETURN count(n) AS count")
    dt = conn.query_single("MATCH (n:DeTaiNghienCuu) RETURN count(n) AS count")
    bm = conn.query_single("MATCH (n:BoMon) RETURN count(n) AS count")
    lv = conn.query_single("MATCH (n:LinhVucNghienCuu) RETURN count(n) AS count")
    return (
        f"📊 **Thống kê tổng quan Khoa CNTT:**\n"
        f"- 👨‍🏫 Giảng viên: **{int(gv['count']) if gv else 0}**\n"
        f"- 📄 Công trình: **{int(ct['count']) if ct else 0}**\n"
        f"- 🔬 Đề tài: **{int(dt['count']) if dt else 0}**\n"
        f"- 🏢 Bộ môn: **{int(bm['count']) if bm else 0}**\n"
        f"- 🌐 Lĩnh vực nghiên cứu: **{int(lv['count']) if lv else 0}**"
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
            WHERE toLower(gv.ho_va_ten) CONTAINS toLower($name) AND coalesce(gv.is_deleted, false) = false
            OPTIONAL MATCH (gv)-[:THUOC_BO_MON]->(bm:BoMon)
            OPTIONAL MATCH (gv)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu) WHERE coalesce(ct.is_deleted, false) = false
            OPTIONAL MATCH (gv)-[:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu) WHERE coalesce(dt.is_deleted, false) = false
            RETURN coalesce(gv.id, 'gv_' + toString(id(gv))) AS id, gv.ho_va_ten AS ten, gv.hoc_vi AS hoc_vi, gv.chuc_danh AS chuc_danh, gv.chuc_vu AS chuc_vu,
                   bm.ten_bo_mon AS bo_mon, count(DISTINCT ct) AS so_cong_trinh,
                   count(DISTINCT dt) AS so_de_tai
            ORDER BY gv.ho_va_ten
            LIMIT 5
            """,
            {"name": name}
        )
        if results:
            parts = []
            for r in results:
                info = f"**[{r['ten']}](javascript:showLecturerDetail('{r['id']}'))**"
                if r.get("hoc_vi"): info += f" ({r['hoc_vi']})"
                if r.get("chuc_danh") and r["chuc_danh"] != r.get("hoc_vi"):
                    info += f", {r['chuc_danh']}"
                if r.get("chuc_vu"):
                    info += f", {r['chuc_vu']}"
                if r.get("bo_mon"): info += f"\n  🏢 {r['bo_mon']}"
                extras = []
                if r.get("so_cong_trinh"): extras.append(f"📄 {r['so_cong_trinh']} công trình")
                if r.get("so_de_tai"): extras.append(f"🔬 {r['so_de_tai']} đề tài")
                if extras: info += f"\n  {' | '.join(extras)}"
                parts.append(info)
            return f"Tìm thấy giảng viên với từ khóa **\"{name}\"**:\n" + "\n".join(f"- {p}" for p in parts)
        return f"Không tìm thấy giảng viên nào với tên **\"{name}\"**. Bạn có thể thử tên khác."

    # Tìm theo học vị/chức danh
    for hoc_vi, label in [("giáo sư", "Giáo sư"), ("phó giáo sư", "Phó Giáo sư"),
                           ("tiến sĩ", "Tiến sĩ"), ("thạc sĩ", "Thạc sĩ")]:
        if hoc_vi in q:
            results = conn.query(
                """
                MATCH (gv:GiangVien)
                WHERE (toLower(coalesce(gv.hoc_vi,'')) CONTAINS $hv
                   OR toLower(coalesce(gv.chuc_danh,'')) CONTAINS $hv
                   OR toLower(coalesce(gv.chuc_vu,'')) CONTAINS $hv)
                   AND coalesce(gv.is_deleted, false) = false
                OPTIONAL MATCH (gv)-[:THUOC_BO_MON]->(bm:BoMon)
                RETURN coalesce(gv.id, 'gv_' + toString(id(gv))) AS id, gv.ho_va_ten AS ten, gv.hoc_vi AS hoc_vi, bm.ten_bo_mon AS bo_mon
                ORDER BY gv.ho_va_ten
                LIMIT 20
                """,
                {"hv": hoc_vi}
            )
            if results:
                count = len(results)
                names = [f"**[{r['ten']}](javascript:showLecturerDetail('{r['id']}'))**" + (f" — {r['bo_mon']}" if r.get("bo_mon") else "") for r in results[:10]]
                suffix = f"\n_...và {count - 10} người khác_" if count > 10 else ""
                return f"Có **{count} giảng viên** với học vị **{label}**:\n" + "\n".join(f"- {n}" for n in names) + suffix
            return f"Không tìm thấy giảng viên nào với học vị **{label}** trong hệ thống."

    # Fallback: top giảng viên theo công trình
    results = conn.query("""
        MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
        RETURN coalesce(gv.id, 'gv_' + toString(id(gv))) AS id, gv.ho_va_ten AS ten, count(ct) AS so_cong_trinh
        ORDER BY so_cong_trinh DESC
        LIMIT 5
    """)
    if results:
        parts = [f"**[{r['ten']}](javascript:showLecturerDetail('{r['id']}'))** ({r['so_cong_trinh']} công trình)" for r in results]
        return "Top 5 giảng viên có nhiều công trình nhất:\n" + "\n".join(f"- {p}" for p in parts)

    return "Vui lòng cung cấp thêm thông tin (tên, học vị...) để tôi tìm kiếm chính xác hơn."


def handle_search_publication(question: str):
    """Tìm kiếm công trình nghiên cứu."""
    conn = get_neo4j_connection()
    name = extract_name(question)
    year = extract_year(question)

    if name:
        results = conn.query(
            """
            MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
            WHERE toLower(gv.ho_va_ten) CONTAINS toLower($name)
              AND coalesce(gv.is_deleted, false) = false
              AND coalesce(ct.is_deleted, false) = false
            RETURN coalesce(ct.id, 'ct_' + toString(id(ct))) AS id, ct.ten_cong_trinh AS ten, ct.nam_xuat_ban AS nam,
                   ct.tap_chi AS tap_chi, ct.loai_cong_trinh AS loai
            ORDER BY ct.nam_xuat_ban DESC
            LIMIT 8
            """,
            {"name": name}
        )
        if results:
            count = len(results)
            titles = []
            for r in results[:5]:
                line = f"**[{r['ten']}](javascript:showPublicationDetail('{r['id']}'))** ({r['nam'] or 'N/A'})"
                if r.get("tap_chi"): line += f"\n    📰 {r['tap_chi']}"
                titles.append(line)
            suffix = f"\n_...và {count - 5} công trình khác_" if count >= 5 else ""
            return (
                f"Tìm thấy **{count} công trình** của **{name}**:\n"
                + "\n".join(f"- {t}" for t in titles) + suffix
            )
        return f"Không tìm thấy công trình nào của **{name}** trong hệ thống."

    if year:
        results = conn.query(
            """
            MATCH (ct:CongTrinhNghienCuu)
            WHERE ct.nam_xuat_ban = $year AND coalesce(ct.is_deleted, false) = false
            OPTIONAL MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct)
            WHERE coalesce(gv.is_deleted, false) = false
            RETURN coalesce(ct.id, 'ct_' + toString(id(ct))) AS id, ct.ten_cong_trinh AS ten, collect(gv.ho_va_ten) AS tac_gia
            LIMIT 8
            """,
            {"year": int(year)}
        )
        if results:
            count = len(results)
            parts = [
                f"**[{r['ten']}](javascript:showPublicationDetail('{r['id']}'))**" + (f" — {', '.join(r['tac_gia'][:2])}" if r.get("tac_gia") else "")
                for r in results[:5]
            ]
            suffix = f"\n_...và {count - 5} công trình khác_" if count >= 5 else ""
            return f"Năm **{year}** có **{count}** công trình:\n" + "\n".join(f"- {p}" for p in parts) + suffix
        return f"Không tìm thấy công trình nào xuất bản năm **{year}**."

    # Công trình mới nhất
    results = conn.query("""
        MATCH (ct:CongTrinhNghienCuu)
        OPTIONAL MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct)
        RETURN coalesce(ct.id, 'ct_' + toString(id(ct))) AS id, ct.ten_cong_trinh AS ten, ct.nam_xuat_ban AS nam, collect(gv.ho_va_ten) AS tac_gia
        ORDER BY ct.nam_xuat_ban DESC
        LIMIT 5
    """)
    if results:
        parts = [f"**[{r['ten']}](javascript:showPublicationDetail('{r['id']}'))** ({r['nam'] or 'N/A'})" for r in results]
        return "5 công trình nghiên cứu mới nhất:\n" + "\n".join(f"- {p}" for p in parts)

    return "Không tìm thấy công trình nào. Hãy thử cung cấp tên tác giả hoặc năm xuất bản."


def handle_search_project(question: str):
    """Tìm kiếm đề tài nghiên cứu."""
    conn = get_neo4j_connection()
    name = extract_name(question)
    year = extract_year(question)

    if name:
        results = conn.query(
            """
            MATCH (gv:GiangVien)-[r:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)
            WHERE toLower(gv.ho_va_ten) CONTAINS toLower($name)
              AND coalesce(gv.is_deleted, false) = false
              AND coalesce(dt.is_deleted, false) = false
            RETURN coalesce(dt.id, 'dt_' + toString(id(dt))) AS id, dt.ten_de_tai AS ten, dt.cap_de_tai AS cap, type(r) AS vai_tro,
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
                line = f"**[{r['ten']}](javascript:showProjectDetail('{r['id']}'))**"
                if r.get("cap"): line += f" [{r['cap']}]"
                vai = "Chủ nhiệm" if r.get("vai_tro") == "CHU_NHIEM" else "Thành viên"
                line += f" ({vai})"
                if r.get("nam_bd"): line += f" — {r['nam_bd']}"
                if r.get("nam_kt"): line += f"–{r['nam_kt']}"
                parts.append(line)
            suffix = f"\n_...và {count - 5} đề tài khác_" if count >= 5 else ""
            return (
                f"Giảng viên **{name}** tham gia **{count} đề tài**:\n"
                + "\n".join(f"- {p}" for p in parts) + suffix
            )
        return f"Không tìm thấy đề tài nào liên quan đến **{name}**."

    if year:
        results = conn.query(
            """
            MATCH (dt:DeTaiNghienCuu)
            WHERE dt.nam_bat_dau = $year OR dt.nam_ket_thuc = $year
            OPTIONAL MATCH (gv:GiangVien)-[:CHU_NHIEM]->(dt)
            RETURN coalesce(dt.id, 'dt_' + toString(id(dt))) AS id, dt.ten_de_tai AS ten, dt.cap_de_tai AS cap, gv.ho_va_ten AS chu_nhiem
            LIMIT 8
            """,
            {"year": int(year)}
        )
        if results:
            count = len(results)
            parts = [
                f"**[{r['ten']}](javascript:showProjectDetail('{r['id']}'))**" + (f" (CN: {r['chu_nhiem']})" if r.get("chu_nhiem") else "")
                for r in results[:5]
            ]
            suffix = f"\n_...và {count - 5} đề tài khác_" if count >= 5 else ""
            return f"Năm **{year}** có **{count} đề tài**:\n" + "\n".join(f"- {p}" for p in parts) + suffix
        return f"Không tìm thấy đề tài nào thuộc năm **{year}**."

    # Danh sách đề tài gần đây
    results = conn.query("""
        MATCH (dt:DeTaiNghienCuu)
        OPTIONAL MATCH (gv:GiangVien)-[:CHU_NHIEM]->(dt)
        RETURN coalesce(dt.id, 'dt_' + toString(id(dt))) AS id, dt.ten_de_tai AS ten, dt.cap_de_tai AS cap, gv.ho_va_ten AS chu_nhiem
        ORDER BY dt.nam_bat_dau DESC
        LIMIT 5
    """)
    if results:
        parts = [f"**[{r['ten']}](javascript:showProjectDetail('{r['id']}'))**" + (f" — CN: {r['chu_nhiem']}" if r.get("chu_nhiem") else "") for r in results]
        return "5 đề tài nghiên cứu gần đây:\n" + "\n".join(f"- {p}" for p in parts)

    return "Không tìm thấy đề tài nào phù hợp."


def handle_search_by_field(question: str, include_pubs: bool = True):
    """Tìm giảng viên và công trình theo lĩnh vực."""
    conn = get_neo4j_connection()
    field = extract_field(question)

    if not field:
        results = conn.query("""
            MATCH (lv:LinhVucNghienCuu)
            OPTIONAL MATCH (gv:GiangVien)-[:NGHIEN_CUU]->(lv)
            RETURN lv.ten_linh_vuc AS ten, count(gv) AS so_gv
            ORDER BY so_gv DESC, ten
            LIMIT 12
        """)
        if results:
            fields = [f"**{r['ten']}** ({r['so_gv']} GV)" for r in results]
            return "Các lĩnh vực nghiên cứu hiện có:\n" + "\n".join(f"- {f}" for f in fields)
        return "Bạn muốn tìm lĩnh vực nào? Ví dụ: AI, Machine Learning, Bảo mật, IoT..."

    lecturers = conn.query(
        """
        MATCH (gv:GiangVien)-[:NGHIEN_CUU]->(lv:LinhVucNghienCuu)
        WHERE toLower(lv.ten_linh_vuc) CONTAINS toLower($field)
           OR toLower($field) CONTAINS toLower(lv.ten_linh_vuc)
        OPTIONAL MATCH (gv)-[:THUOC_BO_MON]->(bm:BoMon)
        RETURN coalesce(gv.id, 'gv_' + toString(id(gv))) AS id, gv.ho_va_ten AS ten, lv.ten_linh_vuc AS linh_vuc, bm.ten_bo_mon AS bo_mon
        ORDER BY gv.ho_va_ten
        LIMIT 10
        """,
        {"field": field}
    )

    if include_pubs:
        pubs = conn.query(
            """
            MATCH (ct:CongTrinhNghienCuu)
            WHERE toLower(coalesce(ct.tu_khoa,'')) CONTAINS toLower($field)
               OR toLower($field) CONTAINS toLower(coalesce(ct.tu_khoa,''))
               OR toLower(coalesce(ct.ten_cong_trinh,'')) CONTAINS toLower($field)
               OR toLower($field) CONTAINS toLower(coalesce(ct.ten_cong_trinh,''))
            RETURN coalesce(ct.id, 'ct_' + toString(id(ct))) AS id, ct.ten_cong_trinh AS ten, ct.nam_xuat_ban AS nam
            ORDER BY ct.nam_xuat_ban DESC
            LIMIT 5
            """,
            {"field": field}
        )
    else:
        pubs = []

    parts = []
    if lecturers:
        lv_name = lecturers[0].get("linh_vuc", field)
        names = [
            f"**[{r['ten']}](javascript:showLecturerDetail('{r['id']}'))**" + (f" — {r['bo_mon']}" if r.get("bo_mon") else "")
            for r in lecturers
        ]
        parts.append(f"👨‍🏫 **{len(names)} giảng viên** nghiên cứu về **{lv_name}**:\n" + "\n".join(f"- {n}" for n in names))
    if pubs:
        pub_list = [f"**[{r['ten']}](javascript:showPublicationDetail('{r['id']}'))** ({r['nam'] or 'N/A'})" for r in pubs]
        parts.append(f"\n📄 **Công trình liên quan:**\n" + "\n".join(f"- {p}" for p in pub_list))

    if parts:
        return "\n".join(parts)

    return f"Chưa tìm thấy dữ liệu về lĩnh vực **\"{field}\"**. Hãy thử từ khóa khác."


def handle_collaboration(question: str):
    """Tìm mối quan hệ hợp tác giữa các giảng viên (qua cả công trình lẫn đề tài)."""
    conn = get_neo4j_connection()
    name = extract_name(question)
    field = extract_field(question)

    # Tránh trường hợp extract_name lấy nhầm tên lĩnh vực làm tên người
    if name and field and name.lower() in field.lower():
        name = ""

    if field and not name:
        return handle_search_by_field(question, include_pubs=False)

    if name:
        # Hợp tác qua công trình
        results = conn.query(
            """
            MATCH (gv1:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)<-[:LA_TAC_GIA_CUA]-(gv2:GiangVien)
            WHERE toLower(gv1.ho_va_ten) CONTAINS toLower($name) AND gv1 <> gv2
            RETURN coalesce(gv2.id, 'gv_' + toString(id(gv2))) AS id, gv2.ho_va_ten AS dong_nghiep, count(ct) AS so_ct
            ORDER BY so_ct DESC
            LIMIT 8
            """,
            {"name": name}
        )
        if results:
            parts = [f"**[{r['dong_nghiep']}](javascript:showLecturerDetail('{r['id']}'))** ({r['so_ct']} công trình chung)" for r in results]
            return f"Giảng viên **{name}** đã hợp tác với:\n" + "\n".join(f"- {p}" for p in parts)

        # Thử hợp tác qua đề tài
        project_collab = conn.query(
            """
            MATCH (gv1:GiangVien)-[:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)<-[:CHU_NHIEM|THAM_GIA]-(gv2:GiangVien)
            WHERE toLower(gv1.ho_va_ten) CONTAINS toLower($name) AND gv1 <> gv2
            RETURN coalesce(gv2.id, 'gv_' + toString(id(gv2))) AS id, gv2.ho_va_ten AS dong_nghiep, count(dt) AS so_dt
            ORDER BY so_dt DESC
            LIMIT 8
            """,
            {"name": name}
        )
        if project_collab:
            parts = [f"**[{r['dong_nghiep']}](javascript:showLecturerDetail('{r['id']}'))** ({r['so_dt']} đề tài chung)" for r in project_collab]
            return f"Giảng viên **{name}** đã cùng tham gia đề tài với:\n" + "\n".join(f"- {p}" for p in parts)

        return f"Không tìm thấy mối quan hệ hợp tác nào cho giảng viên **{name}**."

    # Cặp hợp tác nhiều nhất
    results = conn.query("""
        MATCH (gv1:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)<-[:LA_TAC_GIA_CUA]-(gv2:GiangVien)
        WHERE id(gv1) < id(gv2)
        RETURN coalesce(gv1.id, 'gv_' + toString(id(gv1))) AS id1, coalesce(gv2.id, 'gv_' + toString(id(gv2))) AS id2, gv1.ho_va_ten AS gv1, gv2.ho_va_ten AS gv2, count(ct) AS so_ct
        ORDER BY so_ct DESC
        LIMIT 5
    """)
    if results:
        parts = [f"**[{r['gv1']}](javascript:showLecturerDetail('{r['id1']}'))** & **[{r['gv2']}](javascript:showLecturerDetail('{r['id2']}'))**: {r['so_ct']} công trình chung" for r in results]
        return "Top cặp giảng viên hợp tác nhiều nhất:\n" + "\n".join(f"- {p}" for p in parts)

    return "Chưa tìm thấy dữ liệu hợp tác. Thử cung cấp tên giảng viên cụ thể."


# ============================================================
# HANDLERS MỚI (v2)
# ============================================================

def handle_department(question: str):
    """Xử lý câu hỏi về bộ môn."""
    conn = get_neo4j_connection()
    dept_name = extract_department(question)

    if dept_name:
        results = conn.query(
            """
            MATCH (gv:GiangVien)-[:THUOC_BO_MON]->(bm:BoMon)
            WHERE toLower(bm.ten_bo_mon) CONTAINS toLower($dept)
            OPTIONAL MATCH (gv)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
            RETURN coalesce(gv.id, 'gv_' + toString(id(gv))) AS id, gv.ho_va_ten AS ten, gv.hoc_vi AS hoc_vi,
                   bm.ten_bo_mon AS bo_mon, count(DISTINCT ct) AS so_cong_trinh
            ORDER BY so_cong_trinh DESC, gv.ho_va_ten
            """,
            {"dept": dept_name}
        )
        if results:
            bm = results[0].get("bo_mon", dept_name)
            count = len(results)
            parts = []
            for r in results[:10]:
                line = f"**[{r['ten']}](javascript:showLecturerDetail('{r['id']}'))**"
                if r.get("hoc_vi"): line += f" ({r['hoc_vi']})"
                if r.get("so_cong_trinh"): line += f" — {r['so_cong_trinh']} CT"
                parts.append(line)
            suffix = f"\n_...và {count - 10} người khác_" if count > 10 else ""
            return (
                f"🏢 Bộ môn **{bm}** có **{count} giảng viên**:\n"
                + "\n".join(f"- {p}" for p in parts) + suffix
            )
        return f"Không tìm thấy bộ môn nào khớp với **\"{dept_name}\"**."

    # Liệt kê tất cả bộ môn
    results = conn.query("""
        MATCH (bm:BoMon)
        OPTIONAL MATCH (gv:GiangVien)-[:THUOC_BO_MON]->(bm)
        RETURN bm.ten_bo_mon AS ten, count(gv) AS so_gv
        ORDER BY so_gv DESC
    """)
    if results:
        parts = [f"**{r['ten']}** ({r['so_gv']} giảng viên)" for r in results]
        return f"Khoa CNTT có **{len(results)} bộ môn**:\n" + "\n".join(f"- {p}" for p in parts)
    return "Không tìm thấy thông tin bộ môn."


def handle_top_lecturers(question: str):
    """Top giảng viên nổi bật theo công trình."""
    conn = get_neo4j_connection()
    results = conn.query("""
        MATCH (gv:GiangVien)
        OPTIONAL MATCH (gv)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
        OPTIONAL MATCH (gv)-[:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)
        OPTIONAL MATCH (gv)-[:THUOC_BO_MON]->(bm:BoMon)
        RETURN coalesce(gv.id, 'gv_' + toString(id(gv))) AS id, gv.ho_va_ten AS ten, gv.hoc_vi AS hoc_vi, bm.ten_bo_mon AS bo_mon,
               count(DISTINCT ct) AS so_ct, count(DISTINCT dt) AS so_dt
        ORDER BY so_ct DESC, so_dt DESC
        LIMIT 10
    """)
    if results:
        parts = []
        for i, r in enumerate(results, 1):
            line = f"**{i}. [{r['ten']}](javascript:showLecturerDetail('{r['id']}'))**"
            if r.get("hoc_vi"): line += f" ({r['hoc_vi']})"
            line += f"\n  📄 {r['so_ct']} công trình | 🔬 {r['so_dt']} đề tài"
            if r.get("bo_mon"): line += f" | 🏢 {r['bo_mon']}"
            parts.append(line)
        return "🏆 **Top 10 giảng viên nổi bật:**\n" + "\n".join(f"- {p}" for p in parts)
    return "Không có dữ liệu."


def handle_top_by_projects(question: str):
    """Top giảng viên theo số đề tài."""
    conn = get_neo4j_connection()
    results = conn.query("""
        MATCH (gv:GiangVien)-[:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)
        OPTIONAL MATCH (gv)-[:THUOC_BO_MON]->(bm:BoMon)
        RETURN coalesce(gv.id, 'gv_' + toString(id(gv))) AS id, gv.ho_va_ten AS ten, gv.hoc_vi AS hoc_vi,
               count(DISTINCT dt) AS so_de_tai, bm.ten_bo_mon AS bo_mon
        ORDER BY so_de_tai DESC
        LIMIT 8
    """)
    if results:
        parts = []
        for i, r in enumerate(results, 1):
            line = f"**{i}. [{r['ten']}](javascript:showLecturerDetail('{r['id']}'))**"
            if r.get("hoc_vi"): line += f" ({r['hoc_vi']})"
            line += f" — **{r['so_de_tai']} đề tài**"
            if r.get("bo_mon"): line += f" ({r['bo_mon']})"
            parts.append(line)
        return "🔬 **Top giảng viên có nhiều đề tài nhất:**\n" + "\n".join(f"- {p}" for p in parts)
    return "Không có dữ liệu về đề tài."


def handle_project_by_level(question: str):
    """Lọc đề tài theo cấp (Bộ, Tỉnh, Trường, ...)."""
    conn = get_neo4j_connection()
    level = extract_project_level(question)

    if level:
        results = conn.query(
            """
            MATCH (dt:DeTaiNghienCuu)
            WHERE toLower(coalesce(dt.cap_de_tai,'')) CONTAINS toLower($level)
            OPTIONAL MATCH (gv:GiangVien)-[:CHU_NHIEM]->(dt)
            RETURN coalesce(dt.id, 'dt_' + toString(id(dt))) AS id, dt.ten_de_tai AS ten, dt.cap_de_tai AS cap,
                   gv.ho_va_ten AS chu_nhiem, dt.nam_bat_dau AS nam_bd, dt.nam_ket_thuc AS nam_kt
            ORDER BY dt.nam_bat_dau DESC
            LIMIT 10
            """,
            {"level": level}
        )
        if results:
            count = len(results)
            parts = []
            for r in results[:8]:
                line = f"**[{r['ten']}](javascript:showProjectDetail('{r['id']}'))**"
                if r.get("chu_nhiem"): line += f"\n  👤 CN: {r['chu_nhiem']}"
                if r.get("nam_bd"): line += f" | {r['nam_bd']}"
                if r.get("nam_kt"): line += f"–{r['nam_kt']}"
                parts.append(line)
            suffix = f"\n_...và {count - 8} đề tài khác_" if count > 8 else ""
            return f"📋 Có **{count} đề tài cấp {level}**:\n" + "\n".join(f"- {p}" for p in parts) + suffix
        return f"Không tìm thấy đề tài nào ở **cấp {level}** trong hệ thống."

    # Thống kê theo cấp
    results = conn.query("""
        MATCH (dt:DeTaiNghienCuu)
        WHERE dt.cap_de_tai IS NOT NULL
        RETURN dt.cap_de_tai AS cap, count(dt) AS so_luong
        ORDER BY so_luong DESC
    """)
    if results:
        parts = [f"**{r['cap']}**: {r['so_luong']} đề tài" for r in results]
        return "📊 **Thống kê đề tài theo cấp:**\n" + "\n".join(f"- {p}" for p in parts)
    return "Không có dữ liệu phân cấp đề tài."


def handle_search_by_journal(question: str):
    """Tìm công trình theo tạp chí/hội thảo."""
    conn = get_neo4j_connection()
    journal = extract_journal(question)

    if journal:
        results = conn.query(
            """
            MATCH (ct:CongTrinhNghienCuu)
            WHERE toLower(coalesce(ct.tap_chi,'')) CONTAINS toLower($journal)
               OR toLower(coalesce(ct.loai_cong_trinh,'')) CONTAINS toLower($journal)
            OPTIONAL MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct)
            RETURN coalesce(ct.id, 'ct_' + toString(id(ct))) AS id, ct.ten_cong_trinh AS ten, ct.nam_xuat_ban AS nam,
                   ct.tap_chi AS tap_chi, collect(gv.ho_va_ten) AS tac_gia
            ORDER BY ct.nam_xuat_ban DESC
            LIMIT 8
            """,
            {"journal": journal}
        )
        if results:
            count = len(results)
            parts = []
            for r in results[:5]:
                line = f"**[{r['ten']}](javascript:showPublicationDetail('{r['id']}'))** ({r['nam'] or 'N/A'})"
                if r.get("tac_gia"): line += f"\n  👤 {', '.join(r['tac_gia'][:2])}"
                parts.append(line)
            suffix = f"\n_...và {count - 5} công trình khác_" if count >= 5 else ""
            return (
                f"📰 Tìm thấy **{count} công trình** liên quan đến **{journal}**:\n"
                + "\n".join(f"- {p}" for p in parts) + suffix
            )
        return f"Không tìm thấy công trình nào thuộc **{journal}** trong hệ thống."

    # Liệt kê tạp chí phổ biến
    results = conn.query("""
        MATCH (ct:CongTrinhNghienCuu)
        WHERE ct.tap_chi IS NOT NULL AND ct.tap_chi <> ''
        RETURN ct.tap_chi AS tap_chi, count(ct) AS so_ct
        ORDER BY so_ct DESC
        LIMIT 10
    """)
    if results:
        parts = [f"**{r['tap_chi']}** ({r['so_ct']} bài)" for r in results]
        return "📰 **Tạp chí/Hội thảo phổ biến nhất:**\n" + "\n".join(f"- {p}" for p in parts)
    return "Không có thông tin về tạp chí trong hệ thống."


def handle_who_leads(question: str):
    """Ai là chủ nhiệm đề tài?"""
    conn = get_neo4j_connection()
    q = question.lower()

    # Trích xuất tên đề tài từ câu hỏi
    project_name = ""
    for t in ["đề tài", "dự án", "project", "đề án"]:
        idx = q.find(t)
        if idx != -1:
            after = question[idx + len(t):].strip()
            words = after.split()
            filtered = [w for w in words if w.lower() not in ["là", "ai", "của", "nào", "?"]]
            candidate = " ".join(filtered[:6]).strip("?.,!")
            if len(candidate) > 2:
                project_name = candidate
            break

    if project_name:
        results = conn.query(
            """
            MATCH (gv:GiangVien)-[:CHU_NHIEM]->(dt:DeTaiNghienCuu)
            WHERE toLower(dt.ten_de_tai) CONTAINS toLower($project)
            RETURN coalesce(gv.id, 'gv_' + toString(id(gv))) AS id, gv.ho_va_ten AS ten, gv.hoc_vi AS hoc_vi,
                   dt.ten_de_tai AS de_tai, dt.cap_de_tai AS cap, dt.nam_bat_dau AS nam_bd
            LIMIT 5
            """,
            {"project": project_name}
        )
        if results:
            parts = []
            for r in results:
                line = f"**[{r['ten']}](javascript:showLecturerDetail('{r['id']}'))**"
                if r.get("hoc_vi"): line += f" ({r['hoc_vi']})"
                line += f"\n  🔬 Chủ nhiệm: _{r['de_tai']}_"
                parts.append(line)
            return "👤 Kết quả tìm chủ nhiệm:\n" + "\n".join(f"- {p}" for p in parts)
        return f"Không tìm thấy chủ nhiệm cho đề tài liên quan đến **\"{project_name}\"**."

    # Fallback: tìm theo tên giảng viên
    name = extract_name(question)
    if name:
        return handle_search_project(question)

    # Top chủ nhiệm
    results = conn.query("""
        MATCH (gv:GiangVien)-[:CHU_NHIEM]->(dt:DeTaiNghienCuu)
        RETURN coalesce(gv.id, 'gv_' + toString(id(gv))) AS id, gv.ho_va_ten AS ten, count(dt) AS so_de_tai
        ORDER BY so_de_tai DESC
        LIMIT 8
    """)
    if results:
        parts = [f"**[{r['ten']}](javascript:showLecturerDetail('{r['id']}'))** (CN {r['so_de_tai']} đề tài)" for r in results]
        return "👤 **Top chủ nhiệm đề tài:**\n" + "\n".join(f"- {p}" for p in parts)
    return "Không có dữ liệu về chủ nhiệm đề tài."


def handle_lecturer_info(question: str):
    """Lấy thông tin chi tiết về một giảng viên."""
    conn = get_neo4j_connection()
    name = extract_name(question)

    if not name:
        return (
            "Bạn muốn xem thông tin của giảng viên nào? "
            "Ví dụ: _\"Thông tin thầy Nguyễn Văn A\"_."
        )

    results = conn.query(
        """
        MATCH (gv:GiangVien)
        WHERE toLower(gv.ho_va_ten) CONTAINS toLower($name)
        OPTIONAL MATCH (gv)-[:THUOC_BO_MON]->(bm:BoMon)
        OPTIONAL MATCH (gv)-[:NGHIEN_CUU]->(lv:LinhVucNghienCuu)
        OPTIONAL MATCH (gv)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
        OPTIONAL MATCH (gv)-[:CHU_NHIEM]->(dt:DeTaiNghienCuu)
        RETURN coalesce(gv.id, 'gv_' + toString(id(gv))) AS id, gv.ho_va_ten AS ten, gv.hoc_vi AS hoc_vi, gv.chuc_danh AS chuc_danh, gv.chuc_vu AS chuc_vu,
               gv.email AS email, bm.ten_bo_mon AS bo_mon,
               collect(DISTINCT lv.ten_linh_vuc) AS linh_vuc,
               count(DISTINCT ct) AS so_ct, count(DISTINCT dt) AS so_dt_cn
        LIMIT 3
        """,
        {"name": name}
    )

    if not results:
        return f"Không tìm thấy thông tin giảng viên với tên **\"{name}\"**."

    cards = []
    for r in results:
        card = [f"👨‍🏫 **[{r['ten']}](javascript:showLecturerDetail('{r['id']}'))**"]
        if r.get("hoc_vi"): card.append(f"📚 Học vị: **{r['hoc_vi']}**")
        if r.get("chuc_danh"): card.append(f"🎓 Chức danh: **{r['chuc_danh']}**")
        if r.get("chuc_vu"): card.append(f"💼 Chức vụ: **{r['chuc_vu']}**")
        if r.get("bo_mon"): card.append(f"🏢 Bộ môn: **{r['bo_mon']}**")
        if r.get("email"): card.append(f"📧 Email: {r['email']}")
        lvs = [lv for lv in (r.get("linh_vuc") or []) if lv][:4]
        if lvs: card.append(f"🌐 Lĩnh vực: {', '.join(lvs)}")
        card.append(f"📄 Công trình: **{r['so_ct']}** | 🔬 Đề tài chủ nhiệm: **{r['so_dt_cn']}**")
        cards.append("\n".join(card))

    return "\n\n---\n\n".join(cards)


def handle_unknown(question: str):
    """
    Smart fallback v2: Tự tìm kiếm tổng quát trên tất cả entities
    trước khi trả về hướng dẫn.
    """
    conn = get_neo4j_connection()
    q = question.strip()

    # Tìm giảng viên gần đúng
    gv_results = conn.query(
        """
        MATCH (gv:GiangVien)
        WHERE toLower(gv.ho_va_ten) CONTAINS toLower($q)
        OPTIONAL MATCH (gv)-[:THUOC_BO_MON]->(bm:BoMon)
        RETURN coalesce(gv.id, 'gv_' + toString(id(gv))) AS id, gv.ho_va_ten AS ten, gv.hoc_vi AS hoc_vi, bm.ten_bo_mon AS bo_mon
        LIMIT 3
        """,
        {"q": q}
    )

    # Tìm công trình gần đúng
    ct_results = conn.query(
        """
        MATCH (ct:CongTrinhNghienCuu)
        WHERE toLower(ct.ten_cong_trinh) CONTAINS toLower($q)
        OPTIONAL MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct)
        RETURN coalesce(ct.id, 'ct_' + toString(id(ct))) AS id, ct.ten_cong_trinh AS ten, ct.nam_xuat_ban AS nam, collect(gv.ho_va_ten) AS tac_gia
        LIMIT 3
        """,
        {"q": q}
    )

    # Tìm đề tài gần đúng
    dt_results = conn.query(
        """
        MATCH (dt:DeTaiNghienCuu)
        WHERE toLower(dt.ten_de_tai) CONTAINS toLower($q)
        OPTIONAL MATCH (gv:GiangVien)-[:CHU_NHIEM]->(dt)
        RETURN coalesce(dt.id, 'dt_' + toString(id(dt))) AS id, dt.ten_de_tai AS ten, gv.ho_va_ten AS chu_nhiem
        LIMIT 3
        """,
        {"q": q}
    )

    parts = []
    if gv_results:
        gvs = [
            f"**[{r['ten']}](javascript:showLecturerDetail('{r['id']}'))**" + (f" ({r['hoc_vi']})" if r.get("hoc_vi") else "")
            for r in gv_results
        ]
        parts.append("👨‍🏫 **Giảng viên liên quan:**\n" + "\n".join(f"- {g}" for g in gvs))
    if ct_results:
        cts = [f"**[{r['ten']}](javascript:showPublicationDetail('{r['id']}'))** ({r['nam'] or 'N/A'})" for r in ct_results]
        parts.append("📄 **Công trình liên quan:**\n" + "\n".join(f"- {c}" for c in cts))
    if dt_results:
        dts = [
            f"**[{r['ten']}](javascript:showProjectDetail('{r['id']}'))**" + (f" — CN: {r['chu_nhiem']}" if r.get("chu_nhiem") else "")
            for r in dt_results
        ]
        parts.append("🔬 **Đề tài liên quan:**\n" + "\n".join(f"- {d}" for d in dts))

    if parts:
        return (
            f"Tôi thử tìm kiếm với từ khóa **\"{q}\"** và tìm được:\n\n"
            + "\n\n".join(parts)
        )

    # Không tìm được gì → hướng dẫn
    return (
        "Xin lỗi, tôi chưa hiểu câu hỏi của bạn 😅\n\n"
        "Tôi có thể giúp bạn:\n"
        "- 👨‍🏫 Tìm **giảng viên** (vd: _\"Thầy Nguyễn Văn A\"_, _\"Tiến sĩ trong bộ môn X\"_)\n"
        "- 📄 Tìm **công trình** (vd: _\"Bài báo của cô Trần B\"_, _\"Công trình năm 2023\"_)\n"
        "- 🔬 Tìm **đề tài** (vd: _\"Đề tài của thầy A\"_, _\"Đề tài cấp Bộ\"_)\n"
        "- 🏢 Hỏi về **bộ môn** (vd: _\"Bộ môn KTPM có những ai?\"_)\n"
        "- 🌐 Tìm theo **lĩnh vực** (vd: _\"Nghiên cứu về AI\"_)\n"
        "- 📊 Xem **thống kê** (vd: _\"Có bao nhiêu giảng viên?\"_)\n"
        "- 🤝 Tìm **hợp tác** (vd: _\"Ai hợp tác với thầy A?\"_)\n"
        "- 🏆 **Xếp hạng** (vd: _\"Giảng viên nào có nhiều đề tài nhất?\"_)\n"
        "- 📰 Tìm theo **tạp chí** (vd: _\"Công trình đăng trên IEEE\"_)\n"
        "- 👤 **Chủ nhiệm** (vd: _\"Ai chủ nhiệm đề tài X?\"_)\n"
        "- ℹ️ **Thông tin GV** (vd: _\"Thông tin thầy Nguyễn Văn A\"_)"
    )


# ============================================================
# ROUTE CHÍNH
# ============================================================

@chat_api_bp.route("/ask", methods=["POST"])
def ask():
    """
    POST /api/chat/ask
    Body: { "question": "..." }
    Response: { "status": "ok", "answer": "...", "intent": "...", "graph": {...} }
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
            "department": handle_department,
            "top_lecturers": handle_top_lecturers,
            "top_by_projects": handle_top_by_projects,
            "project_by_level": handle_project_by_level,
            "search_by_journal": handle_search_by_journal,
            "who_leads": handle_who_leads,
            "lecturer_info": handle_lecturer_info,
            "unknown": handle_unknown,
        }

        handler = handler_map.get(intent, handle_unknown)
        answer = handler(question)

        # Build mini graph from entities mentioned in answer
        graph = build_graph_for_answer(answer)

        return jsonify({
            "status": "ok",
            "answer": answer,
            "intent": intent,
            "graph": graph,
        })

    except Exception as e:
        import traceback
        print(f"[CHAT ERROR] {e}\n{traceback.format_exc()}")
        return jsonify({
            "status": "error",
            "answer": "Đã xảy ra lỗi khi xử lý câu hỏi. Vui lòng thử lại sau.",
            "intent": "error",
        }), 500

def build_graph_for_answer(answer: str) -> dict | None:
    """
    Parse entity IDs from answer text (javascript:showXxxDetail links),
    then fetch their 1-hop subgraph from Neo4j.
    Returns { nodes: [...], edges: [...] } or None if no entities found.
    """
    # Extract entity IDs from markdown links like: javascript:showLecturerDetail('gv_1')
    id_pattern = re.findall(
        r"javascript:show(?:Lecturer|Publication|Project)Detail\('([^']+)'\)",
        answer
    )
    node_ids = list(dict.fromkeys(id_pattern))  # deduplicate, preserve order
    if not node_ids:
        return None

    # Limit to first 5 entities to keep graph manageable
    node_ids = node_ids[:5]

    try:
        conn = get_neo4j_connection()
        label_config = {
            "GiangVien":         {"color": "#4F8EF7", "shape": "dot",      "size": 22},
            "CongTrinhNghienCuu":{"color": "#2ECC71", "shape": "diamond",  "size": 16},
            "DeTaiNghienCuu":    {"color": "#F39C12", "shape": "triangle", "size": 18},
            "BoMon":             {"color": "#E74C3C", "shape": "square",   "size": 18},
            "Khoa":              {"color": "#9B59B6", "shape": "star",     "size": 24},
            "LinhVucNghienCuu":  {"color": "#1ABC9C", "shape": "hexagon", "size": 18},
            "TacGiaNgoai":       {"color": "#8b5cf6", "shape": "dot",      "size": 14},
        }

        nodes_map = {}
        edges = []

        for node_id in node_ids:
            results = conn.query("""
                MATCH (center) WHERE center.id = $nid
                WITH center
                MATCH (center)-[r]-(neighbor)
                WHERE neighbor.id IS NOT NULL
                RETURN center, r, neighbor,
                       center.id AS cid, neighbor.id AS nid2,
                       labels(center) AS clabels, labels(neighbor) AS nlabels,
                       type(r) AS rel_type
                LIMIT 30
            """, {"nid": node_id})

            for row in results:
                # Center
                cid = row["cid"]
                if cid and cid not in nodes_map:
                    clabel = row["clabels"][0] if row["clabels"] else "Unknown"
                    cprops = dict(row["center"])
                    cfg = label_config.get(clabel, {"color": "#95A5A6", "shape": "dot", "size": 14})
                    nodes_map[cid] = {
                        "id": cid,
                        "label": (cprops.get("ho_va_ten") or cprops.get("ten_cong_trinh")
                                  or cprops.get("ten_de_tai") or cprops.get("ten_bo_mon")
                                  or cprops.get("ten_khoa") or cprops.get("ten_linh_vuc")
                                  or str(cprops.get("id", ""))),
                        "group": clabel,
                        "color": cfg["color"],
                        "shape": cfg["shape"],
                        "size": cfg["size"] + 6,  # center node slightly larger
                        "is_center": True,
                    }

                # Neighbor
                nid2 = row["nid2"]
                if nid2 and nid2 not in nodes_map:
                    nlabel = row["nlabels"][0] if row["nlabels"] else "Unknown"
                    nprops = dict(row["neighbor"])
                    cfg = label_config.get(nlabel, {"color": "#95A5A6", "shape": "dot", "size": 14})
                    nodes_map[nid2] = {
                        "id": nid2,
                        "label": (nprops.get("ho_va_ten") or nprops.get("ten_cong_trinh")
                                  or nprops.get("ten_de_tai") or nprops.get("ten_bo_mon")
                                  or nprops.get("ten_khoa") or nprops.get("ten_linh_vuc")
                                  or str(nprops.get("id", ""))),
                        "group": nlabel,
                        "color": cfg["color"],
                        "shape": cfg["shape"],
                        "size": cfg["size"],
                        "is_center": False,
                    }

                if cid and nid2:
                    edge_key = f"{cid}→{nid2}→{row['rel_type']}"
                    if edge_key not in [f"{e['from']}→{e['to']}→{e['label']}" for e in edges]:
                        edges.append({"from": cid, "to": nid2, "label": row["rel_type"]})

        if not nodes_map:
            return None

        return {
            "nodes": list(nodes_map.values()),
            "edges": edges,
            "legend": label_config,
        }

    except Exception as ex:
        print(f"[GRAPH BUILD ERROR] {ex}")
        return None
