/* ============================================================
   KNOWLEDGE MAP ADMIN - Main JavaScript
   ============================================================ */

const API_BASE = '/api';
const ADMIN_API_BASE = '/api/admin';

// Cấu hình chung cho toàn bộ module quản trị
const ENTITY_CONFIG = {
    'giang-vien': {
        title: 'Giảng viên',
        apiUrl: `${API_BASE}/giang-vien`,
        adminApiUrl: `${ADMIN_API_BASE}/giang-vien`,
        fields: [
            { name: 'ho_va_ten', label: 'Họ và tên', type: 'text', required: true },
            { name: 'hoc_vi', label: 'Học vị', type: 'text' },
            { name: 'chuc_danh', label: 'Chức danh', type: 'text' },
            { name: 'bo_mon', label: 'Tên Bộ môn', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'dien_thoai', label: 'Điện thoại', type: 'text' },
            { name: 'chuyen_mon', label: 'Chuyên môn', type: 'text' }
        ]
    },
    'cong-trinh': {
        title: 'Công trình',
        apiUrl: `${API_BASE}/cong-trinh`,
        adminApiUrl: `${ADMIN_API_BASE}/cong-trinh`,
        fields: [
            { name: 'ten_cong_trinh', label: 'Tên công trình', type: 'text', required: true },
            { name: 'nam_xuat_ban', label: 'Năm xuất bản', type: 'number' },
            { name: 'loai_an_pham', label: 'Loại ấn phẩm', type: 'text' },
            { name: 'tom_tat', label: 'Tóm tắt nội dung', type: 'textarea' },
            { name: 'link', label: 'Link bài viết', type: 'url' }
        ]
    },
    'de-tai': {
        title: 'Đề tài',
        apiUrl: `${API_BASE}/de-tai`,
        adminApiUrl: `${ADMIN_API_BASE}/de-tai`,
        fields: [
            { name: 'ten_de_tai', label: 'Tên đề tài', type: 'text', required: true },
            { name: 'cap_de_tai', label: 'Cấp đề tài', type: 'text' },
            { name: 'nam_bat_dau', label: 'Năm bắt đầu', type: 'number' },
            { name: 'nam_ket_thuc', label: 'Năm kết thúc', type: 'number' },
            { name: 'tom_tat', label: 'Tóm tắt nội dung', type: 'textarea' },
            { name: 'link', label: 'Link đề tài', type: 'url' }
        ]
    },
    'linh-vuc': {
        title: 'Lĩnh vực nghiên cứu',
        apiUrl: `${API_BASE}/linh-vuc`,
        adminApiUrl: `${ADMIN_API_BASE}/linh-vuc`,
        fields: [
            { name: 'ten_linh_vuc', label: 'Tên Lĩnh vực', type: 'text', required: true }
        ]
    }
};

let currentEntitiesData = {};

document.addEventListener('DOMContentLoaded', () => {
    // Không cần logic click menu ẩn hiện thẻ vì giờ là Multi-Page (mỗi trang HTML riêng)
    
    // Kiểm tra xem đang ở trang nào đê tải dữ liệu tương ứng
    if (document.getElementById('page-admin-lecturers')) {
        loadLecturers();
    } else if (document.getElementById('page-admin-publications')) {
        loadPublications();
    } else if (document.getElementById('page-admin-projects')) {
        loadProjects();
    } else if (document.getElementById('page-admin-research-fields')) {
        loadResearchFields();
    }
    
    // Gắn sự kiện submit cho form nếu form tồn tại trong file HTML này
    const form = document.getElementById('adminForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// ============================================================
// LOAD DATA
// ============================================================

async function loadLecturers() {
    try {
        const res = await fetch(ENTITY_CONFIG['giang-vien'].apiUrl);
        const data = await res.json();
        const tbody = document.getElementById('adminLecturersBody');
        
        if (data.status === 'ok') {
            currentEntitiesData['giang-vien'] = data.data;
            tbody.innerHTML = data.data.map(gv => `
                <tr>
                    <td>${gv.id || 'N/A'}</td>
                    <td><strong>${gv.ho_va_ten || 'N/A'}</strong></td>
                    <td>${gv.hoc_vi || ''}</td>
                    <td>${gv.bo_mon || ''}</td>
                    <td>
                        <button class="btn btn-sm" style="background:#f39c12;color:#fff;border-color:#f39c12;" title="Xem chi tiết" onclick="viewLecturerStats(${gv.id})"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('giang-vien', ${gv.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('giang-vien', ${gv.id})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadPublications() {
    try {
        const res = await fetch(ENTITY_CONFIG['cong-trinh'].apiUrl);
        const data = await res.json();
        const tbody = document.getElementById('adminPublicationsBody');
        
        if (data.status === 'ok') {
            currentEntitiesData['cong-trinh'] = data.data;
            tbody.innerHTML = data.data.map((ct, i) => `
                <tr>
                    <td>${ct.id || i+1}</td>
                    <td><strong>${ct.ten_cong_trinh || 'N/A'}</strong></td>
                    <td>${ct.nam_xuat_ban || ''}</td>
                    <td>
                        <button class="btn btn-sm" style="background:#f39c12;color:#fff;border-color:#f39c12;" title="Xem chi tiết" onclick="viewPublicationStats(${ct.id || i+1})"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('cong-trinh', ${ct.id || i+1}, ${i})"><i class="fas fa-edit"></i></button>
                        ${ct.id ? `<button class="btn btn-sm" style="background:#17a2b8;color:#fff;border-color:#17a2b8;" title="Gán Tác giả" onclick="openRelationModal('cong-trinh', ${ct.id}, \`${(ct.ten_cong_trinh||'').replace(/`/g, '')}\`)"><i class="fas fa-link"></i></button>` : ''}
                        <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('cong-trinh', ${ct.id || i+1})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadProjects() {
    try {
        const res = await fetch(ENTITY_CONFIG['de-tai'].apiUrl);
        const data = await res.json();
        const tbody = document.getElementById('adminProjectsBody');
        
        if (data.status === 'ok') {
            currentEntitiesData['de-tai'] = data.data;
            tbody.innerHTML = data.data.map((dt, i) => `
                <tr>
                    <td>${dt.id || i+1}</td>
                    <td><strong>${dt.ten_de_tai || 'N/A'}</strong></td>
                    <td>${dt.cap_de_tai || ''}</td>
                    <td>
                        <button class="btn btn-sm" style="background:#f39c12;color:#fff;border-color:#f39c12;" title="Xem chi tiết" onclick="viewProjectStats(${dt.id || i+1})"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('de-tai', ${dt.id || i+1}, ${i})"><i class="fas fa-edit"></i></button>
                        ${dt.id ? `<button class="btn btn-sm" style="background:#17a2b8;color:#fff;border-color:#17a2b8;" title="Gán Chủ nhiệm/Thành viên" onclick="openRelationModal('de-tai', ${dt.id}, \`${(dt.ten_de_tai||'').replace(/`/g, '')}\`)"><i class="fas fa-link"></i></button>` : ''}
                        <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('de-tai', ${dt.id || i+1})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadResearchFields() {
    try {
        const res = await fetch(ENTITY_CONFIG['linh-vuc'].apiUrl);
        const data = await res.json();
        const tbody = document.getElementById('adminResearchFieldsBody');
        
        if (data.status === 'ok') {
            currentEntitiesData['linh-vuc'] = data.data;
            tbody.innerHTML = data.data.map((lv, i) => `
                <tr>
                    <td>${lv.id || i+1}</td>
                    <td><strong>${lv.ten_linh_vuc || 'N/A'}</strong></td>
                    <td>
                        <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('linh-vuc', ${lv.id || i+1}, ${i})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('linh-vuc', ${lv.id || i+1})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error(err);
    }
}

// ============================================================
// MODAL FORMS
// ============================================================

function openAdminModal(type, id = null, index = null) {
    const config = ENTITY_CONFIG[type];
    if (!config) return;

    document.getElementById('formEntityType').value = type;
    document.getElementById('formEntityId').value = id || '';
    
    const container = document.getElementById('formFieldsContainer');
    if (!container) return;
    
    container.innerHTML = config.fields.map(f => {
        let inputHtml = '';
        if (f.type === 'textarea') {
            inputHtml = `<textarea id="field_${f.name}" name="${f.name}" ${f.required ? 'required' : ''} style="min-height: 100px; width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--border-color);"></textarea>`;
        } else {
            inputHtml = `<input type="${f.type}" id="field_${f.name}" name="${f.name}" ${f.required ? 'required' : ''}>`;
        }
        return `
        <div class="form-group">
            <label for="field_${f.name}">${f.label} ${f.required ? '<span style="color:red">*</span>' : ''}</label>
            ${inputHtml}
        </div>
        `;
    }).join('');

    document.getElementById('adminModalTitle').textContent = `Thêm mới ${config.title}`;
    
    if (id) {
        document.getElementById('adminModalTitle').textContent = `Chỉnh sửa ${config.title} (#${id})`;
        
        let item = null;
        if (index !== null && currentEntitiesData[type][index]) {
            item = currentEntitiesData[type][index];
        } else if (currentEntitiesData[type]) {
            item = currentEntitiesData[type].find(x => x.id === id);
        }

        if (item) {
            config.fields.forEach(f => {
                const input = document.getElementById(`field_${f.name}`);
                if (input && item[f.name] !== undefined) {
                    input.value = item[f.name] || '';
                }
            });
        }
    }

    document.getElementById('adminModalOverlay').classList.add('active');
}

function closeAdminModal() {
    document.getElementById('adminModalOverlay').classList.remove('active');
    document.getElementById('adminForm').reset();
}

// ============================================================
// CRUD OPERATIONS
// ============================================================

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const type = document.getElementById('formEntityType').value;
    const id = document.getElementById('formEntityId').value;
    const config = ENTITY_CONFIG[type];
    
    const formData = {};
    config.fields.forEach(f => {
        const val = document.getElementById(`field_${f.name}`).value;
        if (f.type === 'number') {
            formData[f.name] = val ? parseInt(val, 10) : null;
        } else {
            formData[f.name] = val;
        }
    });

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${config.adminApiUrl}/${id}` : config.adminApiUrl;

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await res.json();
        if (data.status === 'ok') {
            closeAdminModal();
            // Tải lại đúng trang đang đứng
            if (type === 'giang-vien') loadLecturers();
            else if (type === 'cong-trinh') loadPublications();
            else if (type === 'de-tai') loadProjects();
            else if (type === 'linh-vuc') loadResearchFields();
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra khi lưu dữ liệu.');
    }
}

async function deleteEntity(type, id) {
    if (!id) {
        alert("Bản ghi này hiện không có ID trên Neo4j để thao tác.");
        return;
    }
    
    if (!confirm('Bạn có chắc chắn muốn xóa dữ liệu này? Hành động này không thể hoàn tác!')) {
        return;
    }

    const config = ENTITY_CONFIG[type];
    try {
        const res = await fetch(`${config.adminApiUrl}/${id}`, {
            method: 'DELETE'
        });
        
        const data = await res.json();
        if (data.status === 'ok') {
            if (type === 'giang-vien') loadLecturers();
            else if (type === 'cong-trinh') loadPublications();
            else if (type === 'de-tai') loadProjects();
            else if (type === 'linh-vuc') loadResearchFields();
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra khi xóa dữ liệu.');
    }
}

// ============================================================
// QUẢN LÝ LIÊN KẾT (RELATIONSHIP MANAGEMENT)
// ============================================================

async function openRelationModal(type, entityId, entityName) {
    if (!document.getElementById('adminRelationModalOverlay')) {
        createRelationModalHtml();
    }
    document.getElementById('relEntityType').value = type;
    document.getElementById('relEntityId').value = entityId;
    document.getElementById('adminRelationModalTitle').textContent = `Liên kết: ${entityName}`;
    document.getElementById('adminRelationModalOverlay').classList.add('active');
    document.getElementById('relFormBody').innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Đang tải danh sách giảng viên...</p>';
    
    try {
        const gvRes = await fetch(`${API_BASE}/giang-vien`);
        const gvData = await gvRes.json();
        const allGVs = gvData.data || [];
        
        if (type === 'cong-trinh') {
            const relRes = await fetch(`${ADMIN_API_BASE}/relations/cong-trinh/${entityId}/giang-vien`);
            const relData = await relRes.json();
            const selectedIds = (relData.data || []).map(r => r.id);
            
            let html = `<p style="margin-bottom:10px; color:var(--text-primary);"><b>Chọn Tác giả bài báo:</b></p>
            <div style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border-color); padding: 10px; border-radius: 6px;">`;
            allGVs.forEach(gv => {
                const checked = selectedIds.includes(gv.id) ? 'checked' : '';
                html += `<div style="margin-bottom: 8px;">
                            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary);">
                                <input type="checkbox" name="gv_tac_gia" value="${gv.id}" ${checked}>
                                <span>${gv.ho_va_ten} (${gv.bo_mon || 'Không rõ bộ môn'})</span>
                            </label>
                         </div>`;
            });
            html += `</div>`;
            document.getElementById('relFormBody').innerHTML = html;
        } else if (type === 'de-tai') {
            const relRes = await fetch(`${ADMIN_API_BASE}/relations/de-tai/${entityId}/giang-vien`);
            const relData = await relRes.json();
            
            const chuNhiemIds = (relData.data || []).filter(r => r.vai_tro === 'CHU_NHIEM').map(r => r.id);
            const thamGiaIds = (relData.data || []).filter(r => r.vai_tro === 'THAM_GIA').map(r => r.id);
            
            let html = `<div style="display:flex; gap: 20px; flex-wrap: wrap;">
                <div style="flex:1; min-width: 250px;">
                    <p style="margin-bottom:10px; color:var(--text-primary);"><b>Chọn Chủ nhiệm:</b></p>
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border-color); padding: 10px; border-radius: 6px;">
                    ${allGVs.map(gv => `
                        <div style="margin-bottom: 8px;">
                            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary);">
                                <input type="checkbox" name="gv_chu_nhiem" value="${gv.id}" ${chuNhiemIds.includes(gv.id) ? 'checked' : ''}>
                                <span>${gv.ho_va_ten}</span>
                            </label>
                        </div>
                    `).join('')}
                    </div>
                </div>
                <div style="flex:1; min-width: 250px;">
                    <p style="margin-bottom:10px; color:var(--text-primary);"><b>Chọn Thành viên:</b></p>
                    <div style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border-color); padding: 10px; border-radius: 6px;">
                    ${allGVs.map(gv => `
                        <div style="margin-bottom: 8px;">
                            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary);">
                                <input type="checkbox" name="gv_tham_gia" value="${gv.id}" ${thamGiaIds.includes(gv.id) ? 'checked' : ''}>
                                <span>${gv.ho_va_ten}</span>
                            </label>
                        </div>
                    `).join('')}
                    </div>
                </div>
            </div>`;
            document.getElementById('relFormBody').innerHTML = html;
        }
    } catch (e) {
        document.getElementById('relFormBody').innerHTML = `<p style="color:red">Lỗi tải dữ liệu: ${e.message}</p>`;
    }
}

function closeRelationModal() {
    if(document.getElementById('adminRelationModalOverlay')) {
        document.getElementById('adminRelationModalOverlay').classList.remove('active');
    }
}

async function saveRelations(e) {
    if (e) e.preventDefault();
    const type = document.getElementById('relEntityType').value;
    const entityId = document.getElementById('relEntityId').value;
    
    try {
        if (type === 'cong-trinh') {
            const checkedBoxes = document.querySelectorAll('input[name="gv_tac_gia"]:checked');
            const gv_ids = Array.from(checkedBoxes).map(cb => parseInt(cb.value));
            
            const res = await fetch(`${ADMIN_API_BASE}/relations/cong-trinh/${entityId}/giang-vien`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ giang_vien_ids: gv_ids })
            });
            const data = await res.json();
            if(data.status==='ok') {
                closeRelationModal();
                loadPublications(); // reload table to maybe show updated count/authors if added
            } else alert("Lỗi: " + data.message);
        } else if (type === 'de-tai') {
            const cnBoxes = document.querySelectorAll('input[name="gv_chu_nhiem"]:checked');
            const tgBoxes = document.querySelectorAll('input[name="gv_tham_gia"]:checked');
            
            const chuNhiemIds = Array.from(cnBoxes).map(cb => parseInt(cb.value));
            const thamGiaIds = Array.from(tgBoxes).map(cb => parseInt(cb.value));
            
            const res = await fetch(`${ADMIN_API_BASE}/relations/de-tai/${entityId}/giang-vien`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chu_nhiem_ids: chuNhiemIds, tham_gia_ids: thamGiaIds })
            });
            const data = await res.json();
            if(data.status==='ok') {
                closeRelationModal();
                loadProjects();
            } else alert("Lỗi: " + data.message);
        }
    } catch (err) {
        alert("Có lỗi khi lưu quan hệ!");
    }
}

function createRelationModalHtml() {
    const div = document.createElement('div');
    div.id = 'adminRelationModalOverlay';
    div.className = 'modal-overlay';
    div.innerHTML = `
        <div class="modal" style="max-width: 650px;">
            <div class="modal-header">
                <h2 id="adminRelationModalTitle" style="font-size:16px;">Biên tập Liên kết</h2>
                <button class="btn btn-sm" style="background:none;border:none;font-size:20px;" type="button" onclick="closeRelationModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="adminRelationForm" onsubmit="saveRelations(event)">
                    <input type="hidden" id="relEntityType">
                    <input type="hidden" id="relEntityId">
                    <div id="relFormBody" style="min-height: 100px; padding: 10px 0;"></div>
                    <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid var(--border-color); padding-top:15px;">
                        <button type="button" class="btn" onclick="closeRelationModal()">Đóng</button>
                        <button type="submit" class="btn btn-primary" style="background: var(--accent-blue);"><i class="fas fa-save"></i> Cập nhật Liên kết</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    document.body.appendChild(div);
}

// ============================================================
// LECTURER STATS VIEW IN ADMIN
// ============================================================
async function viewLecturerStats(gvId) {
    if (!document.getElementById('adminStatsModalOverlay')) {
        createStatsModalHtml();
    }
    document.getElementById('adminStatsModalOverlay').classList.add('active');
    const body = document.getElementById('statsFormBody');
    body.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...</p>';
    
    try {
        const res = await fetch(`${API_BASE}/giang-vien/${gvId}`);
        const data = await res.json();
        if (data.status === 'ok') {
            const gv = data.data;
            document.getElementById('adminStatsModalTitle').textContent = `Thông tin Chi tiết: ${gv.ho_va_ten}`;
            
            let html = `
                <div style="margin-bottom: 15px; background: rgba(0,0,0,0.02); padding: 15px; border-radius: 8px;">
                    <p style="margin-bottom: 5px;"><b>Học vị:</b> ${gv.hoc_vi || 'N/A'}</p>
                    <p style="margin-bottom: 5px;"><b>Chức danh:</b> ${gv.chuc_danh || 'N/A'}</p>
                    <p style="margin-bottom: 5px;"><b>Bộ môn:</b> ${gv.bo_mon || 'N/A'}</p>
                    <p style="margin-bottom: 5px;"><b>Email:</b> ${gv.email || 'N/A'}</p>
                </div>
            `;
            
            html += `<h4 style="margin-top:20px; color:var(--accent-blue); padding-bottom: 5px; border-bottom: 1px solid var(--border-color);"><i class="fas fa-file-alt"></i> Công trình nghiên cứu (${gv.cong_trinh ? gv.cong_trinh.length : 0})</h4>`;
            if (gv.cong_trinh && gv.cong_trinh.length > 0) {
                html += `<ul style="margin-left:20px; margin-bottom:15px; margin-top: 10px; line-height: 1.6;">`;
                gv.cong_trinh.forEach(ct => {
                    html += `<li><b>${ct.ten_cong_trinh}</b> <span style="color:var(--text-muted); font-size:12px;">(${ct.nam_xuat_ban || '?'})</span></li>`;
                });
                html += `</ul>`;
            } else {
                html += `<p style="color:var(--text-muted); font-size:13px; margin-bottom:15px; margin-top: 5px;">Chưa có công trình nào được gán.</p>`;
            }
            
            html += `<h4 style="margin-top:20px; color:var(--accent-orange); padding-bottom: 5px; border-bottom: 1px solid var(--border-color);"><i class="fas fa-flask"></i> Đề tài nghiên cứu (${gv.de_tai ? gv.de_tai.length : 0})</h4>`;
            if (gv.de_tai && gv.de_tai.length > 0) {
                html += `<ul style="margin-left:20px; margin-bottom:15px; margin-top: 10px; line-height: 1.6;">`;
                gv.de_tai.forEach(dt => {
                    const ten = dt.de_tai ? dt.de_tai.ten_de_tai : 'N/A';
                    html += `<li><b>${ten}</b> <span style="color:var(--text-muted); font-size:12px;">(Vai trò: <b>${dt.vai_tro === 'CHU_NHIEM' ? 'Chủ nhiệm' : 'Thành viên'}</b>)</span></li>`;
                });
                html += `</ul>`;
            } else {
                html += `<p style="color:var(--text-muted); font-size:13px; margin-bottom:15px; margin-top: 5px;">Chưa tham gia đề tài nào.</p>`;
            }
            
            body.innerHTML = html;
        } else {
            body.innerHTML = `<p style="color:red">Lỗi tải dữ liệu: ${data.message}</p>`;
        }
    } catch (e) {
        body.innerHTML = `<p style="color:red">Lỗi mạng: ${e.message}</p>`;
    }
}

// ============================================================
// PUBLICATION STATS VIEW IN ADMIN
// ============================================================
async function viewPublicationStats(ctId) {
    if (!document.getElementById('adminStatsModalOverlay')) {
        createStatsModalHtml();
    }
    document.getElementById('adminStatsModalOverlay').classList.add('active');
    const body = document.getElementById('statsFormBody');
    body.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...</p>';
    
    try {
        const res = await fetch(`${API_BASE}/cong-trinh/${ctId}`);
        const data = await res.json();
        if (data.status === 'ok') {
            const ct = data.data;
            document.getElementById('adminStatsModalTitle').textContent = `Chi tiết Công trình`;
            
            let html = `
                <div style="margin-bottom: 15px; background: rgba(0,0,0,0.02); padding: 15px; border-radius: 8px;">
                    <p style="margin-bottom: 8px; font-size: 16px;"><b>${ct.ten_cong_trinh || 'N/A'}</b></p>
                    <p style="margin-bottom: 5px;"><b>Năm xuất bản:</b> ${ct.nam_xuat_ban || 'N/A'}</p>
                    <p style="margin-bottom: 5px;"><b>Loại ấn phẩm:</b> ${ct.loai_an_pham || 'N/A'}</p>
                    <p style="margin-bottom: 5px;"><b>Link:</b> ${ct.link ? `<a href="${ct.link}" target="_blank" style="color:var(--accent-blue);">${ct.link}</a>` : 'N/A'}</p>
                    <p style="margin-bottom: 5px; margin-top: 10px;"><b>Tóm tắt:</b> ${ct.tom_tat || 'Đang cập nhật...'}</p>
                </div>
            `;
            
            html += `<h4 style="margin-top:20px; color:var(--accent-blue); padding-bottom: 5px; border-bottom: 1px solid var(--border-color);"><i class="fas fa-users"></i> Tác giả (${ct.tac_gia ? ct.tac_gia.length : 0})</h4>`;
            if (ct.tac_gia && ct.tac_gia.length > 0) {
                html += `<ul style="margin-left:20px; margin-bottom:15px; margin-top: 10px; line-height: 1.6;">`;
                ct.tac_gia.forEach(tg => {
                    html += `<li><b>${tg}</b></li>`;
                });
                html += `</ul>`;
            } else {
                html += `<p style="color:var(--text-muted); font-size:13px; margin-bottom:15px; margin-top: 5px;">Chưa có tác giả nào được gán.</p>`;
            }
            
            body.innerHTML = html;
        } else {
            body.innerHTML = `<p style="color:red">Lỗi tải dữ liệu: ${data.message}</p>`;
        }
    } catch (e) {
        body.innerHTML = `<p style="color:red">Lỗi mạng: ${e.message}</p>`;
    }
}

// ============================================================
// PROJECT STATS VIEW IN ADMIN
// ============================================================
async function viewProjectStats(dtId) {
    if (!document.getElementById('adminStatsModalOverlay')) {
        createStatsModalHtml();
    }
    document.getElementById('adminStatsModalOverlay').classList.add('active');
    const body = document.getElementById('statsFormBody');
    body.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...</p>';
    
    try {
        const res = await fetch(`${API_BASE}/de-tai/${dtId}`);
        const data = await res.json();
        if (data.status === 'ok') {
            const dt = data.data;
            document.getElementById('adminStatsModalTitle').textContent = `Chi tiết Đề tài`;
            
            let html = `
                <div style="margin-bottom: 15px; background: rgba(0,0,0,0.02); padding: 15px; border-radius: 8px;">
                    <p style="margin-bottom: 8px; font-size: 16px;"><b>${dt.ten_de_tai || 'N/A'}</b></p>
                    <p style="margin-bottom: 5px;"><b>Cấp đề tài:</b> ${dt.cap_de_tai || 'N/A'}</p>
                    <p style="margin-bottom: 5px;"><b>Thời gian:</b> ${dt.nam_bat_dau || '?'} - ${dt.nam_ket_thuc || '?'}</p>
                    <p style="margin-bottom: 5px;"><b>Link:</b> ${dt.link ? `<a href="${dt.link}" target="_blank" style="color:var(--accent-blue);">${dt.link}</a>` : 'N/A'}</p>
                    <p style="margin-bottom: 5px; margin-top: 10px;"><b>Tóm tắt:</b> ${dt.tom_tat || 'Đang cập nhật...'}</p>
                </div>
            `;
            
            html += `<h4 style="margin-top:20px; color:var(--accent-orange); padding-bottom: 5px; border-bottom: 1px solid var(--border-color);"><i class="fas fa-users"></i> Thành viên tham gia (${dt.thanh_vien ? dt.thanh_vien.length : 0})</h4>`;
            if (dt.thanh_vien && dt.thanh_vien.length > 0) {
                html += `<ul style="margin-left:20px; margin-bottom:15px; margin-top: 10px; line-height: 1.6;">`;
                dt.thanh_vien.forEach(tv => {
                    const vaiTroText = tv.vai_tro === 'CHU_NHIEM' ? 'Chủ nhiệm' : 'Thành viên';
                    html += `<li><b>${tv.ten}</b> <span style="color:var(--text-muted); font-size:12px;">(Vai trò: <b>${vaiTroText}</b>)</span></li>`;
                });
                html += `</ul>`;
            } else {
                html += `<p style="color:var(--text-muted); font-size:13px; margin-bottom:15px; margin-top: 5px;">Chưa có thành viên nào được gán.</p>`;
            }
            
            body.innerHTML = html;
        } else {
            body.innerHTML = `<p style="color:red">Lỗi tải dữ liệu: ${data.message}</p>`;
        }
    } catch (e) {
        body.innerHTML = `<p style="color:red">Lỗi mạng: ${e.message}</p>`;
    }
}

function closeStatsModal() {
    if(document.getElementById('adminStatsModalOverlay')) {
        document.getElementById('adminStatsModalOverlay').classList.remove('active');
    }
}

function createStatsModalHtml() {
    const div = document.createElement('div');
    div.id = 'adminStatsModalOverlay';
    div.className = 'modal-overlay';
    div.innerHTML = `
        <div class="modal" style="max-width: 650px;">
            <div class="modal-header">
                <h2 id="adminStatsModalTitle" style="font-size:18px;">Thông tin Chi tiết</h2>
                <button class="btn btn-sm" style="background:none;border:none;font-size:20px;" type="button" onclick="closeStatsModal()">&times;</button>
            </div>
            <div class="modal-body" style="max-height: 75vh; overflow-y: auto;">
                <div id="statsFormBody" style="min-height: 100px; padding: 10px 0; color: var(--text-primary);"></div>
                <div style="margin-top: 20px; display: flex; justify-content: flex-end; border-top: 1px solid var(--border-color); padding-top:15px;">
                    <button type="button" class="btn" onclick="closeStatsModal()">Đóng</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(div);
}

// ============================================================
// AUTHENTICATION
// ============================================================

window.logoutAdmin = function() {
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
};
