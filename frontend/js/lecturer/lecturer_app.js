/* ============================================================
   KNOWLEDGE MAP LECTURER - Main JavaScript
   ============================================================ */

const API_LECTURER_BASE = '/api/lecturer';
let userInfo = null;
let currentEntitiesData = {};
let allLecturers = [];

// Collaborator suggestion state
let suggestDebounceTimer = null;
let suggestedSelected = {}; // { gv_id: true } - người đã được thêm qua gợi ý

/* ============================================================
   CSS STYLES FOR COLLABORATOR SUGGESTIONS (injected once)
   ============================================================ */
(function injectSuggestionStyles() {
    if (document.getElementById('collab-suggest-style')) return;
    const style = document.createElement('style');
    style.id = 'collab-suggest-style';
    style.textContent = `
        /* --- Suggestion Panel --- */
        .collab-suggest-panel {
            border: 1.5px dashed var(--border-glow, rgba(59,130,246,0.35));
            border-radius: 12px;
            background: linear-gradient(135deg, rgba(59,130,246,0.04) 0%, rgba(139,92,246,0.04) 100%);
            overflow: hidden;
            animation: fadeInSuggest 0.3s ease;
            height: 100%;
        }
        @keyframes fadeInSuggest {
            from { opacity: 0; transform: translateY(6px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        .collab-suggest-header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 14px 8px;
            font-size: 12px;
            font-weight: 700;
            color: var(--accent-blue, #3b82f6);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-bottom: 1px solid rgba(59,130,246,0.12);
        }
        .collab-suggest-header i { font-size: 13px; }
        .collab-suggest-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 8px;
            padding: 10px 12px 12px;
            max-height: 350px;
            overflow-y: auto;
        }
        .collab-card {
            background: white;
            border: 1px solid var(--border-color, rgba(0,0,0,0.08));
            border-radius: 10px;
            padding: 10px 12px;
            display: flex;
            align-items: center;
            gap: 10px;
            transition: all 0.2s ease;
            cursor: default;
            position: relative;
        }
        .collab-card:hover {
            border-color: rgba(59,130,246,0.4);
            box-shadow: 0 3px 12px rgba(59,130,246,0.12);
            transform: translateY(-1px);
        }
        .collab-card.collab-added {
            border-color: rgba(16,185,129,0.5);
            background: rgba(16,185,129,0.04);
        }
        .collab-avatar {
            width: 36px; height: 36px;
            border-radius: 50%;
            object-fit: cover;
            flex-shrink: 0;
            border: 2px solid rgba(59,130,246,0.2);
        }
        .collab-info { flex: 1; min-width: 0; }
        .collab-name {
            font-size: 13px; font-weight: 600;
            color: var(--text-primary, #1e293b);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .collab-meta {
            font-size: 11px; color: var(--text-muted, #94a3b8);
            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .collab-tags {
            display: flex; flex-wrap: wrap; gap: 3px; margin-top: 4px;
        }
        .collab-tag {
            padding: 1px 6px;
            border-radius: 8px;
            font-size: 10px; font-weight: 500;
            background: rgba(59,130,246,0.1);
            color: #3b82f6;
        }
        .collab-add-btn {
            width: 28px; height: 28px;
            border-radius: 50%;
            border: none;
            background: var(--gradient-primary, linear-gradient(135deg,#3b82f6,#8b5cf6));
            color: white;
            font-size: 14px;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            flex-shrink: 0;
            transition: all 0.2s;
        }
        .collab-add-btn:hover { transform: scale(1.15); }
        .collab-add-btn.added {
            background: linear-gradient(135deg,#10b981,#14b8a6);
            cursor: default;
        }
        .collab-suggest-loading {
            text-align: center; padding: 14px;
            color: var(--text-muted, #94a3b8);
            font-size: 13px;
        }
        .collab-suggest-empty {
            text-align: center; padding: 12px;
            color: var(--text-muted, #94a3b8);
            font-size: 12px; font-style: italic;
        }
    `;
    document.head.appendChild(style);
})();

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

    // Start Clock
    updateClock();
    setInterval(updateClock, 1000);
});

function updateClock() {
    const el = document.getElementById('realtimeClock');
    if (!el) return;
    const now = new Date();
    el.textContent = now.toLocaleString('vi-VN', { 
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        day: '2-digit', month: '2-digit', year: 'numeric' 
    });
}

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
            { name: 'link', label: 'Link đề tài', type: 'url' },
            { name: 'thanh_vien_ids', label: 'Thành viên tham gia (Tùy chọn)', type: 'lecturers-select' }
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
            tbody.innerHTML = data.data.map((ct) => {
                const statusClass = ct.trang_thai === 'Hoàn thành' ? 'status-completed' : (ct.trang_thai === 'Đang thực hiện' ? 'status-ongoing' : '');
                return `
                <tr>
                    <td>${ct.id}</td>
                    <td><strong style="color: var(--text-primary);">${ct.ten_cong_trinh}</strong></td>
                    <td>${ct.nam_xuat_ban || ''}</td>
                    <td style="text-align: center;"><span class="status-badge ${statusClass}">${ct.trang_thai || 'Đã duyệt'}</span></td>
                    <td style="text-align: center;">
                        <button class="btn btn-sm btn-view" title="Xem/Sửa thông tin" onclick="openLecturerModal('cong-trinh', '${ct.id}')" style="background: rgba(79,142,247,0.1); color: #4F8EF7; border: none;"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm" style="color:var(--accent-red); background: rgba(231,76,60,0.1); border:none;" title="Xóa bỏ liên kết/công trình" onclick="deleteLecturerEntity('cong-trinh', '${ct.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `}).join('');
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
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Bạn chưa tham gia đề tài nào.</td></tr>';
                return;
            }
            tbody.innerHTML = data.data.map((dt) => {
                const statusClass = dt.trang_thai === 'Hoàn thành' ? 'status-completed' : (dt.trang_thai === 'Đang thực hiện' ? 'status-ongoing' : '');
                return `
                <tr>
                    <td>${dt.id}</td>
                    <td><strong style="color: var(--text-primary);">${dt.ten_de_tai}</strong></td>
                    <td><span style="background: var(--bg-hover); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500;">${dt.vai_tro === 'CHU_NHIEM' ? 'Chủ nhiệm' : 'Thành viên'}</span></td>
                    <td>${dt.cap_de_tai || 'N/A'}</td>
                    <td style="text-align: center;"><span class="status-badge ${statusClass}">${dt.trang_thai || 'Đã duyệt'}</span></td>
                    <td style="text-align: center;">
                        <button class="btn btn-sm btn-view" title="Xem/Sửa thông tin" onclick="openLecturerModal('de-tai', '${dt.id}')" style="background: rgba(79,142,247,0.1); color: #4F8EF7; border: none;"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm" style="color:var(--accent-red); background: rgba(231,76,60,0.1); border:none;" title="Xóa bỏ liên kết/đề tài" onclick="deleteLecturerEntity('de-tai', '${dt.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `}).join('');
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

    // Reset suggestion state khi mở modal mới
    suggestedSelected = {};

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
                    .map(gv => `<div style="padding: 5px; border-bottom: 1px solid var(--border-color);"><label style="display:flex; align-items:center; gap: 8px; cursor: pointer; font-weight: normal; margin: 0;"><input type="checkbox" class="member-checkbox" name="${f.name}" value="${gv.id}"> ${gv.ho_va_ten} ${gv.bo_mon ? '('+gv.bo_mon+')' : ''}</label></div>`)
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

    // Gắn listener gợi ý cộng sự khi tạo mới (không phải edit)
    if (!id) {
        // Tên field tiêu đề tùy theo loại
        const titleFieldName = type === 'cong-trinh' ? 'ten_cong_trinh' : 'ten_de_tai';
        const titleInput = document.getElementById(`field_${titleFieldName}`);
        
        // Thêm panel gợi ý bên cạnh field thanh_vien_ids
        const memberFieldGroup = document.querySelector('#field_thanh_vien_ids')?.parentElement;
        if (memberFieldGroup) {
            // Thay vì để 150px, cho nó cao lên
            document.getElementById('field_thanh_vien_ids').style.maxHeight = '350px';
            document.getElementById('field_thanh_vien_ids').style.height = '100%';
            
            // Tạo một container bọc cả hai
            const wrapper = document.createElement('div');
            wrapper.style.display = 'grid';
            wrapper.style.gridTemplateColumns = '1fr 1fr';
            wrapper.style.gap = '20px';
            wrapper.style.alignItems = 'start';
            wrapper.style.marginTop = '15px';
            wrapper.style.paddingTop = '15px';
            wrapper.style.borderTop = '1px dashed var(--border-color)';
            
            // Lấy memberFieldGroup ra khỏi form và cho vào cột trái
            memberFieldGroup.parentElement.insertBefore(wrapper, memberFieldGroup);
            wrapper.appendChild(memberFieldGroup);
            memberFieldGroup.style.margin = '0'; // Xóa margin gốc
            
            // Tạo cột phải cho gợi ý
            const panelCol = document.createElement('div');
            panelCol.id = 'collab-suggest-panel';
            // Sửa CSS của panel một chút để vừa cột
            wrapper.appendChild(panelCol);

            // Bắt sự kiện gõ title
            if (titleInput) {
                titleInput.addEventListener('input', () => {
                    clearTimeout(suggestDebounceTimer);
                    const keywords = titleInput.value.trim();
                    if (keywords.length < 3) {
                        panelCol.innerHTML = '';
                        return;
                    }
                    panelCol.innerHTML = `<div class="collab-suggest-loading"><i class="fas fa-circle-notch fa-spin"></i> Đang tìm cộng sự phù hợp...</div>`;
                    suggestDebounceTimer = setTimeout(() => fetchSuggestions(keywords), 650);
                });

                if (titleInput.value.trim().length >= 3) {
                    fetchSuggestions(titleInput.value.trim());
                } else {
                    fetchSuggestions('');
                }
            }
        }
    }

    document.getElementById('lecturerModalOverlay').classList.add('active');
}

/* ============================================================
   COLLABORATOR SUGGESTION FUNCTIONS
   ============================================================ */

async function fetchSuggestions(keywords) {
    const panel = document.getElementById('collab-suggest-panel');
    if (!panel) return;

    try {
        const params = new URLSearchParams({ gv_id: userInfo.id, keywords });
        const res = await fetch(`${API_LECTURER_BASE}/suggest-collaborators?${params}`);
        const data = await res.json();

        if (data.status === 'ok') {
            renderSuggestions(data.data, data.my_linh_vuc || []);
        } else {
            panel.innerHTML = '';
        }
    } catch (e) {
        panel.innerHTML = '';
        console.error('Suggest error:', e);
    }
}

function renderSuggestions(suggestions, myLinhVuc) {
    const panel = document.getElementById('collab-suggest-panel');
    if (!panel) return;

    if (!suggestions || suggestions.length === 0) {
        panel.innerHTML = `
            <div class="collab-suggest-panel">
                <div class="collab-suggest-header"><i class="fas fa-lightbulb"></i> Gợi ý cộng sự tiềm năng</div>
                <div class="collab-suggest-empty">Không tìm thấy cộng sự phù hợp. Thêm thủ công bên trên.</div>
            </div>`;
        return;
    }

    const cards = suggestions.map(s => {
        const isAdded = !!suggestedSelected[s.id];
        const avatar = s.anh_dai_dien
            ? `<img src="${s.anh_dai_dien}" class="collab-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(s.ho_va_ten)}&background=3b82f6&color=fff'">`
            : `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(s.ho_va_ten)}&background=3b82f6&color=fff" class="collab-avatar">`;

        // Tags: lĩnh vực chung
        const tags = (s.ly_do.linh_vuc_chung || []).slice(0, 2)
            .map(lv => `<span class="collab-tag">${lv}</span>`).join('');

        const meta = [
            s.hoc_vi || '',
            s.bo_mon || ''
        ].filter(Boolean).join(' · ');

        const btnIcon = isAdded ? 'fa-check' : 'fa-plus';
        const btnClass = isAdded ? 'added' : '';
        const btnTitle = isAdded ? 'Hủy thêm' : 'Thêm vào danh sách';

        return `
        <div class="collab-card ${isAdded ? 'collab-added' : ''}" id="collab-card-${s.id}">
            ${avatar}
            <div class="collab-info">
                <div class="collab-name" title="${s.ho_va_ten}">${s.ho_va_ten}</div>
                <div class="collab-meta">${meta || `${s.so_cong_trinh} CT · ${s.so_de_tai} ĐT`}</div>
                ${tags ? `<div class="collab-tags">${tags}</div>` : ''}
            </div>
            <button type="button" class="collab-add-btn ${btnClass}" title="${btnTitle}"
                onclick="toggleSuggestedCollaborator('${s.id}')">
                <i class="fas ${btnIcon}"></i>
            </button>
        </div>`;
    }).join('');

    panel.innerHTML = `
        <div class="collab-suggest-panel">
            <div class="collab-suggest-header">
                <i class="fas fa-user-friends"></i>
                Gợi ý cộng sự tiềm năng
                <span style="margin-left: auto; font-size: 10px; font-weight: 400; color: var(--text-muted); text-transform: none; letter-spacing: 0;">
                    ${myLinhVuc.length > 0 ? 'Dựa trên lĩnh vực: ' + myLinhVuc.slice(0,2).join(', ') : 'Dựa trên từ khóa đề tài'}
                </span>
            </div>
            <div class="collab-suggest-grid">${cards}</div>
        </div>`;
}

function toggleSuggestedCollaborator(gvId) {
    const isCurrentlyAdded = !!suggestedSelected[gvId];
    
    // Toggle trạng thái checkbox
    const checkbox = document.querySelector(`input.member-checkbox[value="${gvId}"]`);
    if (checkbox) {
        checkbox.checked = !isCurrentlyAdded;
        if (!isCurrentlyAdded) {
            checkbox.closest('div')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // Toggle state
    suggestedSelected[gvId] = !isCurrentlyAdded;

    // Cập nhật UI thẻ
    const card = document.getElementById(`collab-card-${gvId}`);
    if (card) {
        const btn = card.querySelector('.collab-add-btn');
        if (!isCurrentlyAdded) {
            // Đang từ chưa thêm -> Đã thêm
            card.classList.add('collab-added');
            if (btn) {
                btn.classList.add('added');
                btn.innerHTML = '<i class="fas fa-check"></i>';
                btn.title = 'Hủy thêm';
            }
        } else {
            // Đang từ đã thêm -> Hủy thêm
            card.classList.remove('collab-added');
            if (btn) {
                btn.classList.remove('added');
                btn.innerHTML = '<i class="fas fa-plus"></i>';
                btn.title = 'Thêm vào danh sách';
            }
        }
    }
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

// ============================================================
// FILTERING LOGIC
// ============================================================

function filterProjects() {
    const nameVal = document.getElementById('filterProjName').value.toLowerCase();
    const levelVal = document.getElementById('filterProjLevel').value;
    const statusVal = document.getElementById('filterProjStatus').value;

    const rows = document.querySelectorAll('#lecturerProjectsBody tr');
    rows.forEach(row => {
        if (row.cells.length < 5) return;
        const name = row.cells[1].textContent.toLowerCase();
        const level = row.cells[3].textContent;
        const status = row.cells[4].textContent;

        let visible = true;
        if (nameVal && !name.includes(nameVal)) visible = false;
        if (levelVal && !level.includes(levelVal)) visible = false;
        if (statusVal && status !== statusVal) visible = false;

        row.style.display = visible ? '' : 'none';
    });
}

function filterPublications() {
    const nameVal = document.getElementById('filterPubName').value.toLowerCase();
    const yearVal = document.getElementById('filterPubYear').value;

    const rows = document.querySelectorAll('#lecturerPublicationsBody tr');
    rows.forEach(row => {
        if (row.cells.length < 4) return;
        const name = row.cells[1].textContent.toLowerCase();
        const year = row.cells[2].textContent;

        let visible = true;
        if (nameVal && !name.includes(nameVal)) visible = false;
        if (yearVal && !year.includes(yearVal)) visible = false;

        row.style.display = visible ? '' : 'none';
    });
}
