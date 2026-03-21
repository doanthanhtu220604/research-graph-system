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
            { name: 'loai_an_pham', label: 'Loại ấn phẩm', type: 'text' }
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
            { name: 'nam_ket_thuc', label: 'Năm kết thúc', type: 'number' }
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
                        <button class="btn btn-sm btn-view" onclick="openAdminModal('giang-vien', ${gv.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" onclick="deleteEntity('giang-vien', ${gv.id})"><i class="fas fa-trash"></i></button>
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
                        <button class="btn btn-sm btn-view" onclick="openAdminModal('cong-trinh', ${ct.id || i+1}, ${i})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" onclick="deleteEntity('cong-trinh', ${ct.id || i+1})"><i class="fas fa-trash"></i></button>
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
                        <button class="btn btn-sm btn-view" onclick="openAdminModal('de-tai', ${dt.id || i+1}, ${i})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" onclick="deleteEntity('de-tai', ${dt.id || i+1})"><i class="fas fa-trash"></i></button>
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
    container.innerHTML = config.fields.map(f => `
        <div class="form-group">
            <label for="field_${f.name}">${f.label} ${f.required ? '<span style="color:red">*</span>' : ''}</label>
            <input type="${f.type}" id="field_${f.name}" name="${f.name}" ${f.required ? 'required' : ''}>
        </div>
    `).join('');

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
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra khi xóa dữ liệu.');
    }
}

// ============================================================
// AUTHENTICATION
// ============================================================

window.logoutAdmin = function() {
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
};
