import logging
from flask import Blueprint, request, jsonify
from backend.services.neo4j_connection import get_neo4j_connection

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth_routes', __name__)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'status': 'error', 'message': 'Không có dữ liệu đăng nhập'}), 400
            
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        
        if not username or not password:
            return jsonify({'status': 'error', 'message': 'Vui lòng nhập tài khoản và mật khẩu'}), 400
            
        # 1. Kiểm tra tài khoản Admin (tài khoản cứng)
        if username == 'admin' and password == 'admin':
            return jsonify({
                'status': 'ok',
                'data': {
                    'role': 'admin',
                    'user': {
                        'id': 0,
                        'name': 'Administrator',
                        'email': 'admin@system'
                    }
                }
            })
            
        # 2. Kiểm tra tài khoản Giảng viên (trên Neo4j)
        conn = get_neo4j_connection()
        query = """
        MATCH (g:GiangVien)
        WHERE (g.username = $username OR g.email = $username OR g.id = $username) AND g.password = $password
        RETURN g.id AS id, g.ho_va_ten AS ten, g.email AS email, g.bo_mon AS bo_mon, g.anh_dai_dien AS avatar
        """
        result = conn.query_single(query, parameters={'username': username, 'password': password})
        
        if result:
            return jsonify({
                'status': 'ok',
                'data': {
                    'role': 'lecturer',
                    'user': {
                        'id': result['id'],
                        'name': result['ten'],
                        'email': result['email'],
                        'department': result['bo_mon'],
                        'avatar': result['avatar']
                    }
                }
            })
            
        return jsonify({'status': 'error', 'message': 'Tài khoản hoặc mật khẩu không chính xác'}), 401
        
    except Exception as e:
        logger.error(f"Error in login: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
