import requests
import pandas as pd
from bs4 import BeautifulSoup
import re
import os

def remove_accents(input_str):
    s1 = u'ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠạẢảẤấẦầẨẩẪẫẬậẮắẰằẲẳẴẵẶặẸẹẺẻẼẽẾếỀềỂểỄễỆệỈỉỊịỌọỎỏỐốỒồỔổỖỗỘộỚớỜờỞởỠỡỢợỤụỦủỨứỪừỬửỮữỰựỲỳỴỵỶỷỸỹ'
    s0 = u'AAAAEEEIIOOOOUUYaaaaeeeiioooouuyAaDdIiUuOoUuAaAaAaAaAaAaAaAaAaAaAaAaEeEeEeEeEeEeEeEeIiIiOoOoOoOoOoOoOoOoOoOoOoOoUuUuUuUuUuUuUuYyYyYyYy'
    s = ''
    for c in input_str:
        if c in s1:
            s += s0[s1.index(c)]
        else:
            s += c
    return s

def normalize_name(name):
    name = re.sub(r'^(PGS\.|GS\.|TS\.|ThS\.|PGS\.TS\.|GS\.TS\.)\s*', '', name, flags=re.IGNORECASE)
    return name.strip()

def get_bomon_map():
    df_bm = pd.read_csv('neo4j_export/nodes_BoMon.csv')
    return dict(zip(df_bm['ten_bo_mon'], df_bm['id']))

def scrape_khoacntt_giangvien():
    url = "https://khoacntt.ntu.edu.vn/giang-vien"
    resp = requests.get(url, verify=False)
    soup = BeautifulSoup(resp.content, 'html.parser')
    
    lecturer_dept = {}
    current_dept = None
    
    for el in soup.find_all(['h2', 'h3', 'p', 'a']):
        text = el.get_text(strip=True)
        if text.startswith("1. Bộ môn") or text.startswith("2. Bộ môn") or text.startswith("3. Bộ môn"):
            current_dept = re.sub(r'^\d+\.\s*', '', text)
        elif el.name == 'a' and current_dept and 'GIANG-VIEN' in el.get('href', '').upper():
            lecturer_name = text
            if not lecturer_name or "http" in lecturer_name.lower():
                lecturer_name = el.get('href').split('/')[-1].replace('-', ' ')
            
            lecturer_dept[normalize_name(lecturer_name).lower()] = current_dept

    return lecturer_dept

def scrape_chuyengia():
    url = "https://chuyengia.ntu.edu.vn/chuyengia/timkiem/index/DV_13"
    resp = requests.get(url, verify=False)
    soup = BeautifulSoup(resp.content, 'html.parser')
    
    lecturers = {}
    
    for el in soup.find_all('a', href=True):
        if '/chuyengia/timkiem/PersonelInfo/' in el['href']:
            person_url = el['href']
            text = el.get_text(separator='|', strip=True)
            parts = text.split('|')
            if len(parts) > 0:
                raw_name = parts[0]
                name = normalize_name(raw_name)
                
                info = {
                    'ho_va_ten': name,
                    'anh_dai_dien': el.find('img')['src'] if el.find('img') else '',
                    'chuyen_nganh': '',
                    'chuc_danh': '',
                    'chuc_vu': '',
                    'email': ''
                }
                
                if info['anh_dai_dien'] and not info['anh_dai_dien'].startswith('http'):
                    info['anh_dai_dien'] = 'https://chuyengia.ntu.edu.vn' + info['anh_dai_dien']
                    
                person_id = person_url.split('/')[-1]
                info['anh_dai_dien'] = f"https://chuyengia.ntu.edu.vn/chuyengia/timkiem/PersonelImage/{person_id}"
                
                for part in parts[1:]:
                    part = part.strip()
                    if part.startswith('Ch.ngành:'):
                        info['chuyen_nganh'] = part.replace('Ch.ngành:', '').strip()
                    elif part.startswith('Chức danh:'):
                        cd = part.replace('Chức danh:', '').strip()
                        if cd == 'GV' or cd.lower() == 'giảng viên':
                            cd = 'Giảng viên'
                        elif cd == 'GVC' or cd.lower() == 'giảng viên chính':
                            cd = 'Giảng viên chính'
                        info['chuc_danh'] = cd
                    elif part.startswith('Chức vụ:'):
                        info['chuc_vu'] = part.replace('Chức vụ:', '').strip()
                    elif part.startswith('Email:'):
                        info['email'] = part.replace('Email:', '').strip()
                        
                if raw_name.startswith('TS.'): info['hoc_vi'] = 'Tiến sĩ'
                elif raw_name.startswith('ThS.'): info['hoc_vi'] = 'Thạc sĩ'
                elif raw_name.startswith('PGS.'): info['hoc_vi'] = 'Phó giáo sư'
                elif raw_name.startswith('GS.'): info['hoc_vi'] = 'Giáo sư'
                else: info['hoc_vi'] = ''
                
                lecturers[name.lower()] = info
                
    return lecturers

def update_data():
    dept_map = scrape_khoacntt_giangvien()
    expert_map = scrape_chuyengia()
    
    bomon_dict = get_bomon_map()
    
    df_gv = pd.read_csv('neo4j_export/nodes_GiangVien.csv', encoding='utf-8-sig', dtype={'password': str, 'dien_thoai': str})
    df_rels = pd.read_csv('neo4j_export/rels_THUOC_BO_MON.csv', encoding='utf-8-sig')
    
    new_rels = []
    
    max_neo4j_id = df_gv['neo4j_id'].max() if not df_gv.empty else 0
    max_id_num = 0
    for id_val in df_gv['id']:
        if isinstance(id_val, str) and id_val.startswith('gv_'):
            try:
                num = int(id_val[3:])
                if num > max_id_num:
                    max_id_num = num
            except:
                pass
                
    for index, row in df_gv.iterrows():
        name_lower = normalize_name(str(row['ho_va_ten'])).lower()
        gv_id = row['id']
        
        for ex_name, ex_info in expert_map.items():
            if ex_name == name_lower:
                for col in ['chuyen_nganh', 'chuc_danh', 'chuc_vu', 'email', 'anh_dai_dien', 'hoc_vi']:
                    if ex_info.get(col):
                        df_gv.at[index, col] = ex_info[col]
                break
                
        for dept_name, dept_str in dept_map.items():
            name_no_accent = remove_accents(name_lower)
            if name_no_accent == dept_name or (name_no_accent in dept_name):
                bm_id = bomon_dict.get(dept_str)
                if bm_id:
                    exists = df_rels[(df_rels['start_id'] == gv_id) & (df_rels['end_id'] == bm_id)].shape[0] > 0
                    if not exists:
                        new_rels.append({
                            'start_id': gv_id,
                            'end_id': bm_id,
                            'start_labels': 'GiangVien',
                            'rel_type': 'THUOC_BO_MON',
                            'end_labels': 'BoMon'
                        })
                break
                
    existing_names = [normalize_name(str(n)).lower() for n in df_gv['ho_va_ten']]
    for ex_name, ex_info in expert_map.items():
        if ex_name not in existing_names:
            max_neo4j_id += 1
            max_id_num += 1
            new_id = f"gv_{max_id_num}"
            new_row = {
                'neo4j_id': max_neo4j_id,
                'id': new_id,
                'ho_va_ten': ex_info['ho_va_ten'],
                'password': '1',
                'dien_thoai': '',
                'chuc_danh': ex_info['chuc_danh'],
                'hoc_vi': ex_info['hoc_vi'],
                'chuc_vu': ex_info['chuc_vu'],
                'anh_dai_dien': ex_info['anh_dai_dien'],
                'email': ex_info['email'],
                'chuyen_nganh': ex_info['chuyen_nganh']
            }
            df_gv = pd.concat([df_gv, pd.DataFrame([new_row])], ignore_index=True)
            
            for dept_name, dept_str in dept_map.items():
                name_no_accent = remove_accents(ex_name)
                if name_no_accent == dept_name or (name_no_accent in dept_name):
                    bm_id = bomon_dict.get(dept_str)
                    if bm_id:
                        new_rels.append({
                            'start_id': new_id,
                            'end_id': bm_id,
                            'start_labels': 'GiangVien',
                            'rel_type': 'THUOC_BO_MON',
                            'end_labels': 'BoMon'
                        })
                    break
                    
    if new_rels:
        df_rels = pd.concat([df_rels, pd.DataFrame(new_rels)], ignore_index=True)
        df_rels = df_rels.drop_duplicates(subset=['start_id', 'end_id', 'rel_type'])
        
    df_gv.to_csv('neo4j_export/nodes_GiangVien.csv', index=False, encoding='utf-8-sig')
    df_rels.to_csv('neo4j_export/rels_THUOC_BO_MON.csv', index=False, encoding='utf-8-sig')
    
    print(f"Updated {len(df_gv)} lecturers and {len(df_rels)} relationships.")
    print(f"New lecturers added: {len(df_gv) - len(existing_names)}")
    print(f"New rels added: {len(new_rels)}")

if __name__ == "__main__":
    update_data()
