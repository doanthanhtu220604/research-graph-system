import logging
from flask import Blueprint, request, jsonify
from backend.services.neo4j_connection import get_neo4j_connection

logger = logging.getLogger(__name__)
lecturer_api_bp = Blueprint('lecturer_api', __name__)

@lecturer_api_bp.route('/me', methods=['GET'])
def get_me():
    gv_id = request.args.get('id')
    if not gv_id:
        return jsonify({'status': 'error', 'message': 'Thiếu tham số id'}), 400
        
    try:
        conn = get_neo4j_connection()
        query = """
        MATCH (g:GiangVien) WHERE g.id = $id
        OPTIONAL MATCH (g)-[:NGHIEN_CUU]->(lv:LinhVucNghienCuu)
        OPTIONAL MATCH (g)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
        OPTIONAL MATCH (g)-[r:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)
        RETURN 
            g {.*} as info,
            collect(DISTINCT lv.ten_linh_vuc) as linh_vuc,
            collect(DISTINCT ct {.*}) as cong_trinh,
            collect(DISTINCT dt {.*, vai_tro: type(r)}) as de_tai
        """
        result = conn.query_single(query, parameters={'id': gv_id})
        
        if result and result.get('info'):
            gv = result['info']
            gv['linh_vuc'] = result['linh_vuc']
            gv['cong_trinh'] = [ct for ct in result['cong_trinh'] if ct]
            gv['de_tai'] = [dt for dt in result['de_tai'] if dt]
            # Xóa password khỏi response để bảm mật
            if 'password' in gv:
                del gv['password']
            return jsonify({'status': 'ok', 'data': gv})
            
        return jsonify({'status': 'error', 'message': 'Không tìm thấy giảng viên'}), 404
    except Exception as e:
        logger.error(f"Error fetching lecturer profile: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@lecturer_api_bp.route('/cong-trinh', methods=['GET'])
def get_my_publications():
    gv_id = request.args.get('id')
    if not gv_id:
        return jsonify({'status': 'error', 'message': 'Thiếu tham số id'}), 400
        
    try:
        conn = get_neo4j_connection()
        query = """
        MATCH (g:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
        WHERE g.id = $id
        RETURN ct {.*} as cong_trinh
        ORDER BY ct.nam_xuat_ban DESC
        """
        results = conn.query(query, parameters={'id': gv_id})
        publications = [r['cong_trinh'] for r in results]
        return jsonify({'status': 'ok', 'data': publications})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@lecturer_api_bp.route('/cong-trinh', methods=['POST'])
def add_my_publication():
    data = request.get_json()
    gv_id = data.get('giang_vien_id')
    if not gv_id:
        return jsonify({'status': 'error', 'message': 'Thiếu giang_vien_id'}), 400
        
    thanh_vien_ids = data.get('thanh_vien_ids', [])
    if not isinstance(thanh_vien_ids, list):
        thanh_vien_ids = []
        
    try:
        conn = get_neo4j_connection()
        query = """
        // 1. Tìm người tạo dựa trên gv_id
        MATCH (creator:GiangVien) 
        WHERE creator.id = $gv_id
        WITH creator
        
        // 2. Tìm các thành viên đi kèm theo standardized ID
        OPTIONAL MATCH (member:GiangVien)
        WHERE member.id IN $thanh_vien_ids
        WITH creator, collect(member) AS members
        
        CREATE (ct:CongTrinhNghienCuu {
            ten_cong_trinh: $ten_ct,
            nam_xuat_ban: toInteger($nam_xb),
            loai_an_pham: $loai,
            tom_tat: $tom_tat,
            link: $link,
            trang_thai: 'Chờ duyệt',
            nguoi_tao: creator.ho_va_ten,
            created_at: timestamp()
        })
        WITH creator, members, ct
        SET ct.id = 'ct_' + toString(id(ct))
        
        CREATE (creator)-[:LA_TAC_GIA_CUA]->(ct)
        
        FOREACH (m IN members |
            FOREACH (_ IN CASE WHEN m.id <> creator.id THEN [1] ELSE [] END |
                CREATE (m)-[:LA_TAC_GIA_CUA]->(ct)
            )
        )
        RETURN ct {.*} as new_ct
        """
        result = conn.write(query, parameters={
            'gv_id': gv_id,
            'thanh_vien_ids': thanh_vien_ids,
            'ten_ct': data.get('ten_cong_trinh', ''),
            'nam_xb': data.get('nam_xuat_ban'),
            'loai': data.get('loai_an_pham', ''),
            'tom_tat': data.get('tom_tat', ''),
            'link': data.get('link', '')
        })
        return jsonify({'status': 'ok', 'data': result[0]['new_ct'] if result else None})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@lecturer_api_bp.route('/cong-trinh/<ct_id>', methods=['PUT', 'DELETE'])
def update_my_publication(ct_id):
    # Kiểm tra xem GV hiện tại có phải là tác giả công trình đó ko, tránh edit bậy
    gv_id = request.args.get('gv_id') or (request.get_json() or {}).get('giang_vien_id')
    if not gv_id:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
        
    conn = get_neo4j_connection()
    check_query = """MATCH (g:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu) 
                     WHERE g.id = $gv_id AND ct.id = $ct_id
                     RETURN ct"""
    allow = conn.query(check_query, parameters={'gv_id': gv_id, 'ct_id': ct_id})
    if not allow:
        return jsonify({'status': 'error', 'message': 'Bạn không có quyền thao tác trên công trình này'}), 403

    try:
        if request.method == 'DELETE':
            query = """
            MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $ct_id
            DETACH DELETE ct
            """
            conn.write(query, parameters={'ct_id': ct_id})
            return jsonify({'status': 'ok'})
            
        elif request.method == 'PUT':
            data = request.get_json()
            query = """
            MATCH (ct:CongTrinhNghienCuu) WHERE (ct.id IS NOT NULL AND toString(ct.id) = toString($ct_id)) OR (ct.id IS NULL AND toString(id(ct)) = toString($ct_id))
            SET ct.ten_cong_trinh = $ten_ct,
                ct.nam_xuat_ban = toInteger($nam_xb),
                ct.loai_an_pham = $loai,
                ct.tom_tat = $tom_tat,
                ct.link = $link
            RETURN ct
            """
            conn.write(query, parameters={
                'ct_id': ct_id,
                'ten_ct': data.get('ten_cong_trinh', ''),
                'nam_xb': data.get('nam_xuat_ban'),
                'loai': data.get('loai_an_pham', ''),
                'tom_tat': data.get('tom_tat', ''),
                'link': data.get('link', '')
            })
            return jsonify({'status': 'ok'})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


@lecturer_api_bp.route('/de-tai', methods=['GET'])
def get_my_projects():
    gv_id = request.args.get('id')
    try:
        conn = get_neo4j_connection()
        query = """
        MATCH (g:GiangVien)-[r:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)
        WHERE (g.id IS NOT NULL AND toString(g.id) = toString($id)) OR (g.id IS NULL AND toString(id(g)) = toString($id))
        RETURN dt {.*, id: coalesce(dt.id, 'dt_' + toString(id(dt))), vai_tro: type(r)} as de_tai
        ORDER BY dt.nam_bat_dau DESC
        """
        results = conn.query(query, parameters={'id': gv_id})
        projects = [r['de_tai'] for r in results]
        
        for p in projects:
            p['vai_tro'] = p.get('vai_tro', 'THAM_GIA')
                
        return jsonify({'status': 'ok', 'data': projects})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@lecturer_api_bp.route('/de-tai', methods=['POST'])
def add_my_project():
    data = request.get_json()
    gv_id = data.get('giang_vien_id')
    if not gv_id:
        return jsonify({'status': 'error', 'message': 'Thiếu giang_vien_id'}), 400
        
    thanh_vien_ids = data.get('thanh_vien_ids', [])
    if not isinstance(thanh_vien_ids, list):
        thanh_vien_ids = []
        
    vai_tro = data.get('vai_tro', 'THAM_GIA')
    rel_type = "CHU_NHIEM" if vai_tro == "CHU_NHIEM" else "THAM_GIA"
    
    try:
        conn = get_neo4j_connection()
        query = f"""
        MATCH (g:GiangVien) WHERE (g.id IS NOT NULL AND toString(g.id) = toString($gv_id)) OR (g.id IS NULL AND toString(id(g)) = toString($gv_id))
        WITH g
        
        OPTIONAL MATCH (member:GiangVien)
        WHERE member.id IN $thanh_vien_ids
        WITH g, collect(member) AS members
        
        CREATE (dt:DeTaiNghienCuu {{
            ten_de_tai: $ten_dt,
            cap_de_tai: $cap,
            nam_bat_dau: toInteger($nam_bd),
            nam_ket_thuc: toInteger($nam_kt),
            tom_tat: $tom_tat,
            link: $link,
            trang_thai: 'Chờ duyệt',
            nguoi_tao: g.ho_va_ten,
            created_at: timestamp()
        }})
        WITH g, members, dt
        SET dt.id = 'dt_' + toString(id(dt))
        
        CREATE (g)-[:{rel_type}]->(dt)
        
        FOREACH (m IN members |
            FOREACH (_ IN CASE WHEN m.id <> g.id THEN [1] ELSE [] END |
                CREATE (m)-[:THAM_GIA]->(dt)
            )
        )
        
        RETURN dt {{.*}} as new_dt
        """
        result = conn.write(query, parameters={
            'gv_id': gv_id,
            'thanh_vien_ids': thanh_vien_ids,
            'ten_dt': data.get('ten_de_tai', ''),
            'cap': data.get('cap_de_tai', ''),
            'nam_bd': data.get('nam_bat_dau'),
            'nam_kt': data.get('nam_ket_thuc'),
            'tom_tat': data.get('tom_tat', ''),
            'link': data.get('link', '')
        })
        return jsonify({'status': 'ok', 'data': result[0]['new_dt'] if result else None})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@lecturer_api_bp.route('/de-tai/<dt_id>', methods=['PUT', 'DELETE'])
def update_my_project(dt_id):
    gv_id = request.args.get('gv_id') or (request.get_json() or {}).get('giang_vien_id')
    if not gv_id:
        return jsonify({'status': 'error', 'message': 'Unauthorized'}), 401
        
    conn = get_neo4j_connection()
    check_query = """MATCH (g:GiangVien)-[:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu) 
                     WHERE ((g.id IS NOT NULL AND toString(g.id) = toString($gv_id)) OR (g.id IS NULL AND toString(id(g)) = toString($gv_id))) AND ((dt.id IS NOT NULL AND toString(dt.id) = toString($dt_id)) OR (dt.id IS NULL AND toString(id(dt)) = toString($dt_id)))
                     RETURN dt"""
    allow = conn.query(check_query, parameters={'gv_id': gv_id, 'dt_id': dt_id})
    if not allow:
        return jsonify({'status': 'error', 'message': 'Bạn không có quyền thao tác trên đề tài này'}), 403

    try:
        if request.method == 'DELETE':
            query = """
            MATCH (dt:DeTaiNghienCuu) WHERE (dt.id IS NOT NULL AND toString(dt.id) = toString($dt_id)) OR (dt.id IS NULL AND toString(id(dt)) = toString($dt_id))
            DETACH DELETE dt
            """
            conn.write(query, parameters={'dt_id': dt_id})
            return jsonify({'status': 'ok'})
            
        elif request.method == 'PUT':
            data = request.get_json()
            vai_tro = data.get('vai_tro')
            
            # Cập nhật thông tin cơ bản
            query = """
            MATCH (dt:DeTaiNghienCuu) WHERE (dt.id IS NOT NULL AND toString(dt.id) = toString($dt_id)) OR (dt.id IS NULL AND toString(id(dt)) = toString($dt_id))
            SET dt.ten_de_tai = $ten_dt,
                dt.cap_de_tai = $cap,
                dt.nam_bat_dau = toInteger($nam_bd),
                dt.nam_ket_thuc = toInteger($nam_kt),
                dt.tom_tat = $tom_tat,
                dt.link = $link
            RETURN dt
            """
            conn.write(query, parameters={
                'dt_id': dt_id,
                'ten_dt': data.get('ten_de_tai', ''),
                'cap': data.get('cap_de_tai', ''),
                'nam_bd': data.get('nam_bat_dau'),
                'nam_kt': data.get('nam_ket_thuc'),
                'tom_tat': data.get('tom_tat', ''),
                'link': data.get('link', '')
            })
            
            # Cập nhật vai trò nếu có
            if vai_tro:
                rel_type = "CHU_NHIEM" if vai_tro == "CHU_NHIEM" else "THAM_GIA"
                rel_query = f"""
                MATCH (g:GiangVien)-[r:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)
                WHERE ((g.id IS NOT NULL AND toString(g.id) = toString($gv_id)) OR (g.id IS NULL AND toString(id(g)) = toString($gv_id))) AND ((dt.id IS NOT NULL AND toString(dt.id) = toString($dt_id)) OR (dt.id IS NULL AND toString(id(dt)) = toString($dt_id)))
                DELETE r
                CREATE (g)-[:{rel_type}]->(dt)
                """
                conn.write(rel_query, parameters={'gv_id': gv_id, 'dt_id': dt_id})
                
            return jsonify({'status': 'ok'})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
