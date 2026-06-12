"""
Academic API Integration
Fetches publication statistics and citations for lecturers from OpenAlex (primary) and Google Scholar (fallback).
"""

from flask import Blueprint, jsonify
from scholarly import scholarly
import urllib.parse
import requests
import unicodedata

academic_bp = Blueprint("academic", __name__, url_prefix="/api/academic")

def strip_accents(text):
    """
    Loại bỏ dấu tiếng Việt khỏi chuỗi để chuẩn hóa tìm kiếm.
    """
    text = unicodedata.normalize('NFD', text)
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    text = text.replace('đ', 'd').replace('Đ', 'D')
    return text

def get_openalex_stats(name):
    """
    Truy vấn OpenAlex API (một nguồn học thuật mở, không bị chặn IP)
    để lấy thống kê số lượng bài báo, trích dẫn, h-index của tác giả.
    Sử dụng thuật toán chấm điểm độ khớp tên và cơ quan để tìm chính xác giảng viên NTU.
    """
    url = "https://api.openalex.org/authors"
    # Chuẩn hóa tên bỏ dấu để nâng cao khả năng khớp của OpenAlex
    search_name = strip_accents(name)
    params = {
        "search": search_name,
        "mailto": "nguyenknowledge@ntu.edu.vn"  # Thuộc nhóm lịch sự để tăng độ ưu tiên và độ tin cậy
    }
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) NTUKnowledge/1.0"
    }
    try:
        res = requests.get(url, params=params, headers=headers, timeout=12)
        if res.status_code == 200:
            data = res.json()
            results = data.get("results", [])
            if results:
                # Thuật toán chấm điểm để tìm tác giả phù hợp nhất
                scored_authors = []
                q_norm = search_name.lower()
                
                for author in results[:10]:
                    disp_name = author.get("display_name", "")
                    disp_norm = strip_accents(disp_name).lower()
                    
                    score = 0
                    
                    # 1. Chấm điểm khớp tên
                    if q_norm == disp_norm:
                        score += 150  # Khớp tên chính xác
                    else:
                        alts = [strip_accents(alt).lower() for alt in author.get("display_name_alternatives", [])]
                        if q_norm in alts:
                            score += 100
                        elif disp_norm in q_norm or q_norm in disp_norm:
                            score += 30
                            
                    # 2. Chấm điểm khớp trường (Nha Trang University / NTU)
                    last_inst = author.get("last_known_institution")
                    if last_inst and "nha trang" in last_inst.get("display_name", "").lower():
                        score += 200
                        
                    affiliations = author.get("affiliations", [])
                    for aff in affiliations:
                        inst = aff.get("institution", {})
                        if inst and "nha trang" in inst.get("display_name", "").lower():
                            score += 100  # affiliation cũ
                            break
                            
                    scored_authors.append((score, author))
                
                # Sắp xếp và chọn tác giả có số điểm cao nhất
                scored_authors.sort(key=lambda x: x[0], reverse=True)
                best_score, author = scored_authors[0]
                
                # Chỉ lấy nếu điểm số đủ độ tin cậy (khớp tên hoặc khớp trường)
                if best_score >= 100 or len(results) == 1:
                    summary_stats = author.get("summary_stats", {})
                    hindex = summary_stats.get("h_index", 0)
                    i10index = summary_stats.get("i10_index", 0)
                    
                    ids = author.get("ids", {})
                    orcid = ids.get("orcid", "")
                    
                    return {
                        "name": author.get("display_name", name),
                        "affiliation": author.get("last_known_institution", {}).get("display_name") if author.get("last_known_institution") else "OpenAlex Open Access",
                        "citedby": author.get("cited_by_count", 0),
                        "hindex": hindex,
                        "i10index": i10index,
                        "publications_count": author.get("works_count", 0),
                        "profile_id": orcid or author.get("id").split('/')[-1] if author.get("id") else "",
                        "profile_url": f"https://openalex.org/{author.get('id').split('/')[-1]}" if author.get("id") else None
                    }
    except Exception as e:
        print(f"[ERROR] OpenAlex fallback failed: {e}")
    return None

@academic_bp.route("/<name>")
def get_academic_stats(name):
    """
    Lấy thông tin thống kê bài báo của giảng viên.
    Sử dụng OpenAlex API làm nguồn chính (nhanh, đáng tin cậy, không chặn IP).
    Nếu không tìm thấy hoặc lỗi, fallback sang Google Scholar (scholarly scraper).
    """
    decoded_name = urllib.parse.unquote(name)
    
    # 1. Thử lấy từ OpenAlex trước
    try:
        openalex_data = get_openalex_stats(decoded_name)
        if openalex_data:
            return jsonify({"status": "ok", "data": openalex_data, "source": "OpenAlex"})
    except Exception as e:
        print(f"[INFO] OpenAlex query failed, trying Google Scholar: {e}")
        
    # 2. Fallback sang Google Scholar (scholarly)
    try:
        # Các cụm từ khóa tìm kiếm ưu tiên kèm tên trường để tránh trùng tên
        search_queries = [
            f"{decoded_name} Nha Trang University",
            f"{decoded_name} Dai hoc Nha Trang",
            f"{decoded_name} NTU",
            decoded_name # Fallback: tìm theo tên trần nếu không thấy có tên trường
        ]
        
        author = None
        for query in search_queries:
            try:
                search_iterator = scholarly.search_author(query)
                author = next(search_iterator)
                break # Nếu tìm thấy thì thoát vòng lặp
            except StopIteration:
                continue
                
        if not author:
            return jsonify({"status": "error", "message": f"Không tìm thấy hồ sơ của '{decoded_name}' trên hệ thống dữ liệu học thuật."}), 404

        # Lấy thêm các thông số chi tiết (chỉ lấy metrics và số lượng bài báo để tránh tốn thời gian)
        author = scholarly.fill(author, sections=['indices', 'counts', 'publications'])
        
        stats = {
            "name": author.get("name", decoded_name),
            "affiliation": author.get("affiliation", ""),
            "citedby": author.get("citedby", 0),
            "hindex": author.get("hindex", 0),
            "i10index": author.get("i10index", 0),
            "publications_count": len(author.get("publications", [])),
            "profile_id": author.get("scholar_id", ""),
            "profile_url": f"https://scholar.google.com/citations?user={author.get('scholar_id')}" if author.get("scholar_id") else None
        }
        
        return jsonify({"status": "ok", "data": stats, "source": "Google Scholar"})
        
    except Exception as e:
        return jsonify({
            "status": "error", 
            "message": "Không thể kết nối đến hệ thống dữ liệu học thuật. Vui lòng thử lại sau.", 
            "error_detail": str(e)
        }), 500
