"""
Google Scholar API Integration
Fetches publication statistics and citations for lecturers.
"""

from flask import Blueprint, jsonify
from scholarly import scholarly
import urllib.parse
import threading

scholar_bp = Blueprint("scholar", __name__, url_prefix="/api/scholar")

@scholar_bp.route("/<name>")
def get_scholar_stats(name):
    """
    Tìm kiếm thông tin giảng viên trên Google Scholar.
    Lấy số lượng bài báo, trích dẫn, h-index, i10-index.
    """
    try:
        decoded_name = urllib.parse.unquote(name)
        
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
            return jsonify({"status": "error", "message": f"Không tìm thấy hồ sơ của '{decoded_name}' trên Google Scholar"}), 404

            
        # Lấy thêm các thông số chi tiết (chỉ lấy metrics và số lượng bài báo để tránh tốn thời gian)
        author = scholarly.fill(author, sections=['indices', 'counts', 'publications'])
        
        stats = {
            "name": author.get("name", decoded_name),
            "affiliation": author.get("affiliation", ""),
            "citedby": author.get("citedby", 0),
            "hindex": author.get("hindex", 0),
            "i10index": author.get("i10index", 0),
            "publications_count": len(author.get("publications", [])),
            "scholar_id": author.get("scholar_id", ""),
            "scholar_url": f"https://scholar.google.com/citations?user={author.get('scholar_id')}" if author.get("scholar_id") else None
        }
        
        return jsonify({"status": "ok", "data": stats})
        
    except Exception as e:
        import traceback
        return jsonify({
            "status": "error", 
            "message": "Không thể kết nối đến Google Scholar (có thể bị chặn do query quá nhiều). Vui lòng thử lại sau.", 
            "error_detail": str(e)
        }), 500
