/* ============================================================
   KNOWLEDGE MAP LECTURER - Main JavaScript
   ============================================================ */

const API_LECTURER_BASE = '/api/lecturer';
let userInfo = null;
let currentEntitiesData = {};
let allLecturers = [];

document.addEventListener('DOMContentLoaded', () => {
    // Check Auth
    const role = localStorage.getItem('userRole');
    if (role !== 'lecturer') {
        window.location.href = '/user/login.html';
        return;
    }
    
    try {
        userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo || !userInfo.id) throw new Error("Invalid UserInfo");
    } catch(e) {
        window.location.href = '/user/login.html';
        return;
    }

    // Set Welcome Text
    const elWelcome = document.getElementById('welcomeText');
    if (elWelcome) {
        elWelcome.textContent = `Xin chào, ${userInfo.name}`;
    }

    // Load data based on page
    if (document.getElementById('page-lecturer-overview')) {
        loadLecturerProfile();
    } else if (document.getElementById('page-lecturer-publications')) {
        loadPublications();
    } else if (document.getElementById('page-lecturer-projects')) {
        loadProjects();
    }
    
    // Binding form
    const form = document.getElementById('lecturerForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Load all lecturers for select fields
    loadAllLecturers();
});

async function loadAllLecturers() {
    try {
        const res = await fetch('/api/giang-vien');
        const data = await res.json();
        if (data.status === 'ok') {
            allLecturers = data.data;
        }
    } catch (e) {
        console.error(e);
    }
}

function logoutUser() {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userInfo');
    window.location.href = '/';
}

// ============================================================
// PROFILE / OVERVIEW
// ============================================================

async function loadLecturerProfile() {
    try {
        const res = await fetch(`${API_LECTURER_BASE}/me?id=${userInfo.id}`);
        const data = await res.json();
        
        if (data.status === 'ok') {
            const gv = data.data;
            document.getElementById('lecturerName').textContent = gv.ho_va_ten || 'N/A';
            document.getElementById('lecturerDept').textContent = gv.bo_mon || 'N/A';
            document.getElementById('lecturerEmail').textContent = gv.email || 'N/A';
            document.getElementById('lecturerDegree').textContent = gv.hoc_vi || 'N/A';
            document.getElementById('lecturerTitle').textContent = gv.chuc_danh || 'Khong co';
            
            if (gv.linh_vuc && gv.linh_vuc.length > 0) {
                document.getElementById('lecturerFields').innerHTML = gv.linh_vuc.map(lv => `<span style="display:inline-block;padding:2px 10px;background:rgba(26,188,156,0.1);color:#1ABC9C;border-radius:12px;font-size:12px;margin:2px 4px 2px 0;">${lv}</span>`).join('');
            } else {
                document.getElementById('lecturerFields').textContent = 'Chưa cập nhật';
            }
            
            if (gv.anh_dai_dien) {
                document.getElementById('lecturerAvatar').src = gv.anh_dai_dien;
            } else {
                document.getElementById('lecturerAvatar').src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(gv.ho_va_ten || 'GV') + '&background=random';
            }

            document.getElementById('countPublications').textContent = gv.cong_trinh ? gv.cong_trinh.length : 0;
            document.getElementById('countProjects').textContent = gv.de_tai ? gv.de_tai.length : 0;
        }
    } catch (err) {
        console.error(err);
    }
}

// ============================================================
// LECTURER PUBLICATIONS
// ============================================================

const ENTITY_CONFIG = {
    'cong-trinh': {
        title: 'Công trình',
        fields: [
            { name: 'ten_cong_trinh', label: 'Tên công trình', type: 'text', required: true },
            { name: 'nam_xuat_ban', label: 'Năm xuất bản', type: 'number' },
            { name: 'loai_an_pham', label: 'Loại ấn phẩm', type: 'text' },
            { name: 'tom_tat', label: 'Tóm tắt nội dung', type: 'textarea' },
            { name: 'link', label: 'Link bài viết', type: 'url' },
            { name: 'thanh_vien_ids', label: 'Thành viên tham gia (Tùy chọn)', type: 'lecturers-select' }
        ]
    },
    'de-tai': {
        title: 'Đề tài',
        fields: [
            { name: 'ten_de_tai', label: 'Tên đề tài', type: 'text', required: true },
            { name: 'cap_de_tai', label: 'Cấp đề tài', type: 'select', options: [
                { value: 'Cấp cơ sở', label: 'Cấp cơ sở' },
                { value: 'Cấp Bộ', label: 'Cấp Bộ' },
                { value: 'Cấp Tỉnh', label: 'Cấp Tỉnh' },
                { value: 'Cấp Nhà nước', label: 'Cấp Nhà nước' },
                { value: 'Khác', label: 'Khác' }
            ]},
            { name: 'vai_tro', label: 'Vai trò của bạn', type: 'select', required: true, options: [
                { value: 'CHU_NHIEM', label: 'Chủ nhiệm đề tài' },
                { value: 'THAM_GIA', label: 'Thành viên tham gia' }
            ]},
            { name: 'nam_bat_dau', label: 'Năm bắt đầu', type: 'number' },
            { name: 'nam_ket_thuc', label: 'Năm kết thúc', type: 'number' },
            { name: 'tom_tat', label: 'Tóm tắt nội dung', type: 'textarea' },
            { name: 'link', label: 'Link đề tài', type: 'url' }
        ]
    }
};

async function loadPublications() {
    try {
        const res = await fetch(`${API_LECTURER_BASE}/cong-trinh?id=${userInfo.id}`);
        const data = await res.json();
        
        const tbody = document.getElementById('lecturerPublicationsBody');
        if (data.status === 'ok') {
            currentEntitiesData['cong-trinh'] = data.data;
            if(data.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 30px;">Bạn chưa có công trình nào.</td></tr>';
                return;
            }
            tbody.innerHTML = data.data.map((ct) => `
                <tr>
                    <td>${ct.id}</td>
                    <td><strong>${ct.ten_cong_trinh}</strong></td>
                    <td>${ct.nam_xuat_ban || ''}</td>
                    <td><span style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 4px; font-size: 13px;">${ct.trang_thai || 'Đã duyệt'}</span></td>
                    <td>
                        <button class="btn btn-sm btn-view" title="Xem/Sửa thông tin" onclick="openLecturerModal('cong-trinh', '${ct.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa bỏ liên kết/công trình" onclick="deleteLecturerEntity('cong-trinh', '${ct.id}')"><i class="fas fa-trash"></i></button>
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
        const res = await fetch(`${API_LECTURER_BASE}/de-tai?id=${userInfo.id}`);
        const data = await res.json();
        
        const tbody = document.getElementById('lecturerProjectsBody');
        if (data.status === 'ok') {
            currentEntitiesData['de-tai'] = data.data;
            if(data.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">Bạn chưa tham gia đề tài nào.</td></tr>';
                return;
            }
            tbody.innerHTML = data.data.map((dt) => `
                <tr>
                    <td>${dt.id}</td>
                    <td><strong>${dt.ten_de_tai}</strong></td>
                    <td><span style="background: var(--bg-card); border: 1px solid var(--border-color); padding: 4px 8px; border-radius: 4px; font-size: 13px;">${dt.vai_tro === 'CHU_NHIEM' ? 'Chủ nhiệm' : 'Thành viên'}</span></td>
                    <td>${dt.cap_de_tai || 'N/A'}</td>
                    <td>
                        <button class="btn btn-sm btn-view" title="Xem/Sửa thông tin" onclick="openLecturerModal('de-tai', '${dt.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa bỏ liên kết/đề tài" onclick="deleteLecturerEntity('de-tai', '${dt.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error(err);
    }
}

// ============================================================
// MODALS & FORMS
// ============================================================

function openLecturerModal(type, id = null) {
    const config = ENTITY_CONFIG[type];
    if (!config) return;

    document.getElementById('formEntityType').value = type;
    document.getElementById('formEntityId').value = id || '';
    
    const container = document.getElementById('formFieldsContainer');
    
    container.innerHTML = config.fields.map(f => {
        let inputHtml = '';
        if (f.type === 'textarea') {
            inputHtml = `<textarea id="field_${f.name}" name="${f.name}" ${f.required ? 'required' : ''} style="min-height: 100px; width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--border-color);"></textarea>`;
        } else if (f.type === 'select') {
            const optionsHtml = f.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');
            inputHtml = `<select id="field_${f.name}" name="${f.name}" ${f.required ? 'required' : ''}>${optionsHtml}</select>`;
        } else if (f.type === 'lecturers-select') {
            if (id) {
                inputHtml = `<div style="color:var(--text-muted); font-size: 13px; font-style: italic;">Tính năng sửa thành viên hiện chưa hỗ trợ. Vui lòng liên hệ Admin.</div>`;
            } else {
                const optionsHtml = allLecturers
                    .filter(gv => gv.id != userInfo.id)
                    .map(gv => `<div style="padding: 5px; border-bottom: 1px solid var(--border-color);"><label style="display:flex; align-items:center; gap: 8px; cursor: pointer; font-weight: normal; margin: 0;"><input type="checkbox" name="${f.name}" value="${gv.id}"> ${gv.ho_va_ten} ${gv.bo_mon ? '('+gv.bo_mon+')' : ''}</label></div>`)
                    .join('');
                inputHtml = `<div id="field_${f.name}" style="max-height: 150px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px; padding: 5px; background: white;">${optionsHtml}</div>`;
            }
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

    document.getElementById('lecturerModalTitle').textContent = id ? `Chỉnh sửa ${config.title}` : `Thêm mới ${config.title}`;
    
    if (id) {
        let item = currentEntitiesData[type].find(x => x.id == id);
        if (item) {
            config.fields.forEach(f => {
                const input = document.getElementById(`field_${f.name}`);
                if (input && item[f.name] !== undefined) {
                    input.value = item[f.name] || '';
                }
            });
        }
    }

    document.getElementById('lecturerModalOverlay').classList.add('active');
}

function closeLecturerModal() {
    document.getElementById('lecturerModalOverlay').classList.remove('active');
    document.getElementById('lecturerForm').reset();
}

async function handleFormSubmit(e) {
    e.preventDefault();
    
    const type = document.getElementById('formEntityType').value;
    const id = document.getElementById('formEntityId').value;
    const config = ENTITY_CONFIG[type];
    
    const formData = {
        giang_vien_id: userInfo.id // Luôn gửi kèm ID của GV hiện tại
    };
    
    config.fields.forEach(f => {
        if (f.type === 'lecturers-select') {
            if (!id) {
                const checkboxes = document.querySelectorAll(`input[name="${f.name}"]:checked`);
                formData[f.name] = Array.from(checkboxes).map(cb => cb.value);
            }
        } else {
            const val = document.getElementById(`field_${f.name}`).value;
            if (f.type === 'number') {
                formData[f.name] = val ? parseInt(val, 10) : null;
            } else {
                formData[f.name] = val;
            }
        }
    });

    try {
        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_LECTURER_BASE}/${type}/${id}` : `${API_LECTURER_BASE}/${type}`;

        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        const data = await res.json();
        if (data.status === 'ok') {
            closeLecturerModal();
            if (type === 'cong-trinh') loadPublications();
            else if (type === 'de-tai') loadProjects();
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra.');
    }
}

async function deleteLecturerEntity(type, id) {
    if (!confirm('Bạn có chắc muốn xóa dữ liệu này?')) return;

    try {
        const res = await fetch(`${API_LECTURER_BASE}/${type}/${id}?gv_id=${userInfo.id}`, {
            method: 'DELETE'
        });
        
        const data = await res.json();
        if (data.status === 'ok') {
            if (type === 'cong-trinh') loadPublications();
            else if (type === 'de-tai') loadProjects();
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra.');
    }
}

function closeStatsModal() {
    if(document.getElementById('lecturerStatsModalOverlay')) {
        document.getElementById('lecturerStatsModalOverlay').classList.remove('active');
    }
}
