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

    if (role !== 'lecturer' && role !== 'admin') {

        window.location.href = '/user/login.html';

        return;

    }

    // Thêm link quay lại Admin nếu vai trò là admin
    if (role === 'admin') {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.style.borderTop = '1px dashed rgba(255,255,255,0.15)';
            li.style.marginTop = '10px';
            li.style.paddingTop = '10px';
            li.innerHTML = `
                <a href="/admin/index.html" class="nav-link" style="color: #3b82f6;">
                    <i class="fas fa-user-shield"></i>
                    <span>Khu vực Admin</span>
                </a>
            `;
            const logoutItem = navMenu.querySelector('li:last-child');
            if (logoutItem) {
                navMenu.insertBefore(li, logoutItem);
            } else {
                navMenu.appendChild(li);
            }
        }
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

        if (typeof initLecturerProfile === 'function') { initLecturerProfile(); } else { elWelcome.textContent = `Xin chào, ${userInfo.name}`; }

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
            { name: 'noi_xuat_ban', label: 'Nơi xuất bản', type: 'text' },

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

                const statusClass = ct.trang_thai === 'Hoàn thành' ? 'status-completed' : (ct.trang_thai === 'Đang thực hiện' ? 'status-ongoing' : (ct.trang_thai === 'Yêu cầu xóa' ? 'status-request' : ''));

                const isPending = ct.trang_thai === 'Yêu cầu xóa';

                

                return `

                <tr>

                    <td>${ct.id}</td>

                    <td><strong style="color: var(--text-primary);">${ct.ten_cong_trinh}</strong></td>

                    <td>${ct.nam_xuat_ban || ''}</td>

                    <td style="text-align: center;"><span class="status-badge ${statusClass}">${ct.trang_thai || 'Đang thực hiện'}</span></td>

                    <td style="text-align: center;">

                        <button class="btn btn-sm" title="Xem chi tiết" onclick="viewPublicationDetail('${ct.id}')" style="background:#f39c12;color:#fff;border:none;margin-right:4px;"><i class="fas fa-eye"></i></button>

                        <button class="btn btn-sm btn-view" title="Chỉnh sửa" onclick="openLecturerModal('cong-trinh', '${ct.id}')" style="background: rgba(79,142,247,0.1); color: #4F8EF7; border: none; margin-right:4px;" ${isPending ? 'disabled style="opacity:0.5"' : ''}><i class="fas fa-edit"></i></button>

                        <button class="btn btn-sm" title="Đổi trạng thái" onclick="openStatusChangeModal('cong-trinh', '${ct.id}')" style="background: rgba(139,92,246,0.1); color: #8B5CF6; border: none; margin-right:4px;" ${isPending ? 'disabled style="opacity:0.5"' : ''}><i class="fas fa-exchange-alt"></i></button>

                        <button class="btn btn-sm" style="color:var(--accent-red); background: rgba(231,76,60,0.1); border:none;" title="Xóa" onclick="requestDeleteLecturerEntity('cong-trinh', '${ct.id}')" ${isPending ? 'disabled style="opacity:0.5"' : ''}><i class="fas fa-trash"></i></button>

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

                const statusClass = dt.trang_thai === 'Hoàn thành' ? 'status-completed' : (dt.trang_thai === 'Đang thực hiện' ? 'status-ongoing' : (dt.trang_thai === 'Yêu cầu xóa' ? 'status-request' : ''));

                const isPending = dt.trang_thai === 'Yêu cầu xóa';



                return `

                <tr>

                    <td>${dt.id}</td>

                    <td><strong style="color: var(--text-primary);">${dt.ten_de_tai}</strong></td>

                    <td><span style="background: var(--bg-hover); padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 500;">${dt.vai_tro === 'CHU_NHIEM' ? 'Chủ nhiệm' : 'Thành viên'}</span></td>

                    <td>${dt.cap_de_tai || 'N/A'}</td>

                    <td style="text-align: center;"><span class="status-badge ${statusClass}">${dt.trang_thai || 'Đang thực hiện'}</span></td>

                    <td style="text-align: center;">

                        <button class="btn btn-sm" title="Xem chi tiết" onclick="viewProjectDetail('${dt.id}')" style="background:#f39c12;color:#fff;border:none;margin-right:4px;"><i class="fas fa-eye"></i></button>

                        <button class="btn btn-sm btn-view" title="Chỉnh sửa" onclick="openLecturerModal('de-tai', '${dt.id}')" style="background: rgba(79,142,247,0.1); color: #4F8EF7; border: none; margin-right:4px;" ${isPending ? 'disabled style="opacity:0.5"' : ''}><i class="fas fa-edit"></i></button>

                        <button class="btn btn-sm" title="Đổi trạng thái" onclick="openStatusChangeModal('de-tai', '${dt.id}')" style="background: rgba(139,92,246,0.1); color: #8B5CF6; border: none; margin-right:4px;" ${isPending ? 'disabled style="opacity:0.5"' : ''}><i class="fas fa-exchange-alt"></i></button>

                        <button class="btn btn-sm" style="color:var(--accent-red); background: rgba(231,76,60,0.1); border:none;" title="Xóa" onclick="requestDeleteLecturerEntity('de-tai', '${dt.id}')" ${isPending ? 'disabled style="opacity:0.5"' : ''}><i class="fas fa-trash"></i></button>

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

        } else if (f.type === 'url' && f.name === 'link') {

            inputHtml = `

            <div style="display: flex; gap: 10px; flex-wrap: wrap;">

                <input type="url" id="field_${f.name}" name="${f.name}" ${f.required ? 'required' : ''} style="flex: 1; min-width: 200px;" placeholder="Nhập URL hoặc upload PDF">

                <input type="file" id="upload_pdf_${f.name}" accept=".pdf" style="display: none;" onchange="uploadPdfForLink(this, 'field_${f.name}')">

                <button type="button" class="btn" style="background: #10b981; color: white; border: none; border-radius: 4px; padding: 0 15px; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap;" onclick="document.getElementById('upload_pdf_${f.name}').click()">

                    <i class="fas fa-file-pdf"></i> Upload PDF

                </button>

            </div>

            <div id="upload_status_${f.name}" style="margin-top: 5px; font-size: 13px;"></div>

            `;

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



// Hàm Gửi yêu cầu xóa tới Admin

async function requestDeleteLecturerEntity(type, id) {

    if (!confirm('Bạn có chắc muốn xóa mục này? Yêu cầu sẽ được gửi tới Admin phê duyệt.')) return;



    try {

        const res = await fetch(`${API_LECTURER_BASE}/${type}/${id}?gv_id=${userInfo.id}`, {

            method: 'DELETE'

        });

        const data = await res.json();

        if (data.status === 'ok') {

            alert('Đã gửi yêu cầu xóa tới Admin. Vui lòng chờ phê duyệt.');

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



async function loadLecturerTrash() {

    const tbody = document.getElementById('lecturerTrashBody');

    if (!tbody) return;



    try {

        const res = await fetch(`${API_LECTURER_BASE}/trash?id=${userInfo.id}`);

        const data = await res.json();



        if (data.status === 'ok') {

            if (data.data.length === 0) {

                tbody.innerHTML = '<tr><td colspan="5" class="trash-empty-state"><div><i class="fas fa-trash-alt"></i><p>Thùng rác trống</p></div></td></tr>';

                return;

            }



            tbody.innerHTML = data.data.map(item => {

                const date = new Date(item.deleted_at).toLocaleString('vi-VN');

                const typeLabel = item.type === 'cong-trinh' ? 'Công trình' : 'Đề tài';

                const title = item.ten_cong_trinh || item.ten_de_tai || 'N/A';

                

                let statusHtml = '';

                let isPendingRestore = item.trang_thai === 'Yêu cầu khôi phục';



                if (isPendingRestore) {

                    statusHtml = '<span class="status-badge status-request"><i class="fas fa-clock"></i> Đang chờ Admin duyệt khôi phục</span>';

                } else {

                    statusHtml = '<span class="status-badge status-trash"><i class="fas fa-trash"></i> Trong thùng rác</span>';

                }



                const actionButtons = isPendingRestore 

                    ? `<button class="btn btn-sm" disabled style="opacity:0.6; cursor:not-allowed;"><i class="fas fa-hourglass-half"></i> Chờ duyệt</button>`

                    : `

                        <button class="btn btn-sm" onclick="restoreLecturerEntity('${item.type}', '${item.id}')" style="background:#2ecc71; color:#fff; border:none; margin-right:5px;" title="Yêu cầu khôi phục">

                            <i class="fas fa-undo"></i> Khôi phục

                        </button>

                    `;



                return `

                    <tr>

                        <td><span style="font-size:12px; font-weight:600; color:var(--accent-blue);">${typeLabel}</span></td>

                        <td><strong style="color:var(--text-primary);">${title}</strong></td>

                        <td><span style="font-size:13px; color:var(--text-muted);">${date}</span></td>

                        <td style="text-align:center;">${statusHtml}</td>

                        <td style="text-align:center;">${actionButtons}</td>

                    </tr>

                `;

            }).join('');

        }

    } catch (err) {

        console.error(err);

        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Lỗi khi tải dữ liệu thùng rác.</td></tr>';

    }

}



async function restoreLecturerEntity(type, id) {

    if (!confirm('Bạn có muốn yêu cầu khôi phục mục này? Admin sẽ duyệt yêu cầu của bạn.')) return;



    try {

        const res = await fetch(`${API_LECTURER_BASE}/trash/${type}/${id}/restore?gv_id=${userInfo.id}`, {

            method: 'PUT'

        });

        const data = await res.json();

        if (data.status === 'ok') {

            alert('Đã gửi yêu cầu khôi phục tới Admin.');

            loadLecturerTrash();

        } else {

            alert('Lỗi: ' + data.message);

        }

    } catch (err) {

        console.error(err);

        alert('Có lỗi xảy ra.');

    }

}



async function requestPermanentDelete(type, id) {

    if (!confirm('Yêu cầu này sẽ được gửi tới Admin để phê duyệt xóa vĩnh viễn. Bạn chắc chắn chứ?')) return;



    try {

        const res = await fetch(`${API_LECTURER_BASE}/trash/${type}/${id}/request-delete?gv_id=${userInfo.id}`, {

            method: 'PUT'

        });

        const data = await res.json();

        if (data.status === 'ok') {

            alert(data.message);

            loadLecturerTrash();

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

// XEM CHI TIẾT ĐỀ TÀI

// ============================================================



async function viewProjectDetail(dtId) {

    const overlay = document.getElementById('lecturerStatsModalOverlay');

    const titleEl = document.getElementById('lecturerStatsModalTitle');

    const bodyEl  = document.getElementById('statsFormBody');



    titleEl.textContent = 'Chi tiết ĐỀ TÀI';

    bodyEl.innerHTML = '<div style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin" style="font-size:22px;color:var(--accent-blue);"></i><br><span style="color:var(--text-muted);font-size:13px;margin-top:8px;display:block;">Đang tải dữ liệu...</span></div>';

    overlay.classList.add('active');



    try {

        const res  = await fetch(`/api/de-tai/${dtId}`);

        const data = await res.json();



        if (data.status !== 'ok') {

            bodyEl.innerHTML = `<div style="color:var(--accent-red);text-align:center;padding:20px;"><i class="fas fa-exclamation-circle"></i> ${data.message || 'Không tải được dữ liệu.'}</div>`;

            return;

        }



        const dt = data.data;

        const trangThai = dt.trang_thai || 'Chưa xác định';

        let stColor = '#6c757d', stBg = 'rgba(108,117,125,0.1)';

        if (trangThai === 'Hoàn thành')          { stColor = '#28a745'; stBg = 'rgba(40,167,69,0.1)'; }

        else if (trangThai === 'Đang thực hiện') { stColor = '#007bff'; stBg = 'rgba(0,123,255,0.1)'; }

        else if (trangThai === 'Chờ duyệt')     { stColor = '#fd7e14'; stBg = 'rgba(253,126,20,0.1)'; }



        const linkHtml = dt.link

            ? `<a href="${dt.link}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-blue);">${dt.link}</a>`

            : 'N/A';



        // API public trả về thanh_vien: [{ten, vai_tro}]

        const thanhVien = (dt.thanh_vien || []).filter(tv => tv && tv.ten);

        const membersHtml = thanhVien.length > 0

            ? `<ul style="margin-left:20px;margin-top:10px;line-height:1.8;">${thanhVien.map(tv => {

                const vt = tv.vai_tro === 'CHU_NHIEM' ? 'Chủ nhiệm' : 'Thành viên';

                return `<li><b>${tv.ten}</b> <span style="color:var(--text-muted);font-size:12px;">(Vai trò: <b>${vt}</b>)</span></li>`;

              }).join('')}</ul>`

            : '<p style="color:var(--text-muted);font-size:13px;margin-top:5px;">Chưa có thành viên nào được gán.</p>';



        const tgnList = dt.tac_gia_ngoai || [];

        const tgnHtml = tgnList.length > 0

            ? `<ul style="margin-left:20px;margin-top:10px;line-height:1.8;">${tgnList.map(tgn => {

                const dv = tgn.don_vi ? ` <span style="color:var(--text-muted);font-size:12px;">— ${tgn.don_vi}</span>` : '';

                return `<li><i class="fas fa-user-friends" style="color:#e67e22;font-size:11px;margin-right:4px;"></i><b>${tgn.ten}</b>${dv}</li>`;

              }).join('')}</ul>`

            : '<p style="color:var(--text-muted);font-size:13px;margin-top:5px;">Không có tác giả ngoài.</p>';



        bodyEl.innerHTML = `

        <div style="margin-bottom:15px;background:rgba(0,0,0,0.02);padding:15px;border-radius:8px;">

            <p style="margin-bottom:8px;font-size:16px;"><b>${dt.ten_de_tai || 'N/A'}</b>

                <span style="background:${stBg};color:${stColor};border:1px solid ${stColor};padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;margin-left:8px;">${trangThai}</span>

            </p>

            <p style="margin-bottom:5px;"><b>Cấp đề tài:</b> ${dt.cap_de_tai || 'N/A'}</p>

            <p style="margin-bottom:5px;"><b>Thời gian:</b> ${dt.nam_bat_dau || '?'} – ${dt.nam_ket_thuc || '?'}</p>

            <p style="margin-bottom:5px;"><b>Người tạo:</b> ${dt.nguoi_tao || 'N/A'}</p>

            <p style="margin-bottom:5px;"><b>Link:</b> ${linkHtml}</p>

            <p style="margin-bottom:0;margin-top:10px;"><b>Tóm tắt:</b> ${dt.tom_tat || 'Đang cập nhật...'}</p>

        </div>

        <h4 style="margin-top:20px;color:var(--accent-orange,#f59e0b);padding-bottom:5px;border-bottom:1px solid var(--border-color);">

            <i class="fas fa-users"></i> Thành viên tham gia (${thanhVien.length})

        </h4>

        ${membersHtml}

        <h4 style="margin-top:20px;color:#e67e22;padding-bottom:5px;border-bottom:1px solid var(--border-color);">

            <i class="fas fa-user-friends"></i> Tác giả ngoài (${tgnList.length})

        </h4>

        ${tgnHtml}`;



        titleEl.textContent = 'Chi tiết ĐỀ TÀI';

    } catch (err) {

        console.error(err);

        bodyEl.innerHTML = '<div style="color:var(--accent-red);text-align:center;padding:20px;"><i class="fas fa-exclamation-circle"></i> Có lỗi khi tải dữ liệu.</div>';

    }

}



// ============================================================

// XEM CHI TIẾT CÔNG TRÌNH

// ============================================================



async function viewPublicationDetail(ctId) {

    const overlay = document.getElementById('lecturerStatsModalOverlay');

    const titleEl = document.getElementById('lecturerStatsModalTitle');

    const bodyEl  = document.getElementById('statsFormBody');



    titleEl.textContent = 'Chi tiết Công trình';

    bodyEl.innerHTML = '<div style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin" style="font-size:22px;color:var(--accent-blue);"></i><br><span style="color:var(--text-muted);font-size:13px;margin-top:8px;display:block;">Đang tải dữ liệu...</span></div>';

    overlay.classList.add('active');



    try {

        const res  = await fetch(`/api/cong-trinh/${ctId}`);

        const data = await res.json();



        if (data.status !== 'ok') {

            bodyEl.innerHTML = `<div style="color:var(--accent-red);text-align:center;padding:20px;"><i class="fas fa-exclamation-circle"></i> ${data.message || 'Không tải được dữ liệu.'}</div>`;

            return;

        }



        const ct = data.data;

        const trangThai = ct.trang_thai || 'Chưa xác định';

        let stColor = '#6c757d', stBg = 'rgba(108,117,125,0.1)';

        if (trangThai === 'Hoàn thành')          { stColor = '#28a745'; stBg = 'rgba(40,167,69,0.1)'; }

        else if (trangThai === 'Đang thực hiện') { stColor = '#007bff'; stBg = 'rgba(0,123,255,0.1)'; }

        else if (trangThai === 'Chờ duyệt')     { stColor = '#fd7e14'; stBg = 'rgba(253,126,20,0.1)'; }



        const linkHtml = ct.link

            ? `<a href="${ct.link}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-blue);">${ct.link}</a>`

            : 'N/A';



        // API public trả về tac_gia: mảng object {ten, vai_tro}

        const tacGia = (ct.tac_gia || []).filter(tg => tg && tg.ten);

        const tacGiaHtml = tacGia.length > 0

            ? `<ul style="margin-left:20px;margin-top:10px;line-height:1.8;">${tacGia.map(tg => {

                let roleLabel = '';

                if (tg.vai_tro === 'TAC_GIA_CHINH') roleLabel = ' <span style="color:#4F8EF7; font-size:11px;">(Tác giả chính)</span>';

                else if (tg.vai_tro === 'CONG_SU' || tg.vai_tro === 'LA_TAC_GIA_CUA') roleLabel = ' <span style="color:#10b981; font-size:11px;">(Cộng sự)</span>';

                

                return `<li><i class="fas fa-user-tie" style="color:#4F8EF7;font-size:11px;margin-right:4px;"></i><b>${tg.ten}</b>${roleLabel}</li>`;

              }).join('')}</ul>`

            : '<p style="color:var(--text-muted);font-size:13px;margin-top:5px;">Chưa có tác giả nào được gán.</p>';



        const tgnList = ct.tac_gia_ngoai || [];

        const tgnHtml = tgnList.length > 0

            ? `<ul style="margin-left:20px;margin-top:10px;line-height:1.8;">${tgnList.map(tgn => {

                const dv = tgn.don_vi ? ` <span style="color:var(--text-muted);font-size:12px;">— ${tgn.don_vi}</span>` : '';

                return `<li><i class="fas fa-user-friends" style="color:#e67e22;font-size:11px;margin-right:4px;"></i><b>${tgn.ten}</b>${dv}</li>`;

              }).join('')}</ul>`

            : '<p style="color:var(--text-muted);font-size:13px;margin-top:5px;">Không có tác giả ngoài.</p>';



        bodyEl.innerHTML = `

        <div style="margin-bottom:15px;background:rgba(0,0,0,0.02);padding:15px;border-radius:8px;">

            <p style="margin-bottom:8px;font-size:16px;"><b>${ct.ten_cong_trinh || 'N/A'}</b>

                <span style="background:${stBg};color:${stColor};border:1px solid ${stColor};padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;margin-left:8px;">${trangThai}</span>

            </p>

            <p style="margin-bottom:5px;"><b>Năm xuất bản:</b> ${ct.nam_xuat_ban || 'N/A'}</p>
            <p style="margin-bottom:5px;"><b>Nơi xuất bản:</b> ${ct.noi_xuat_ban || 'N/A'}</p>

            <p style="margin-bottom:5px;"><b>Người tạo:</b> ${ct.nguoi_tao || 'Hệ thống / Admin'}</p>

            <p style="margin-bottom:5px;"><b>Link:</b> ${linkHtml}</p>

            <p style="margin-bottom:0;margin-top:10px;"><b>Tóm tắt:</b> ${ct.tom_tat || 'Đang cập nhật...'}</p>

        </div>

        <h4 style="margin-top:20px;color:var(--accent-blue);padding-bottom:5px;border-bottom:1px solid var(--border-color);">

            <i class="fas fa-users"></i> Tác giả nội bộ (${tacGia.length})

        </h4>

        ${tacGiaHtml}

        <h4 style="margin-top:20px;color:#e67e22;padding-bottom:5px;border-bottom:1px solid var(--border-color);">

            <i class="fas fa-user-friends"></i> Tác giả ngoài (${tgnList.length})

        </h4>

        ${tgnHtml}`;



        titleEl.textContent = 'Chi tiết Công trình';

    } catch (err) {

        console.error(err);

        bodyEl.innerHTML = '<div style="color:var(--accent-red);text-align:center;padding:20px;"><i class="fas fa-exclamation-circle"></i> Có lỗi khi tải dữ liệu.</div>';

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



// ============================================================

// STATUS CHANGE REQUEST

// ============================================================



function openStatusChangeModal(type, id) {

    const item = currentEntitiesData[type].find(x => x.id == id);

    if (!item) return;



    // Inject status change modal if not exists

    if (!document.getElementById('statusChangeModalOverlay')) {

        const modalHtml = `

            <div class="modal-overlay" id="statusChangeModalOverlay">

                <div class="modal" style="max-width: 400px; padding: 0; overflow: hidden; border-radius: 16px;">

                    <div class="modal-header" style="background: var(--gradient-primary); color: white; border-radius: 0; padding: 18px 24px;">

                        <h2 style="font-size: 18px; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 10px;">

                            <i class="fas fa-exchange-alt"></i> Đề xuất Đổi trạng thái

                        </h2>

                        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2); border:none; color:white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="closeStatusChangeModal()">&times;</button>

                    </div>

                    <div class="modal-body" style="padding: 24px;">

                        <div style="background: var(--bg-hover); padding: 15px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid var(--accent-blue);">

                            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Đối tượng đề xuất:</p>

                            <p style="font-size: 14px; color: var(--text-primary); font-weight: 700; line-height: 1.4; margin: 0;">${item.ten_cong_trinh || item.ten_de_tai}</p>

                        </div>

                        

                        <div class="form-group">

                            <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Trạng thái mới đề xuất:</label>

                            <select id="newStatusSelect" class="filter-select" style="width: 100%; padding: 12px; border-radius: 10px; background: white; border: 1.5px solid var(--border-color); font-size: 14px; outline: none; transition: all 0.2s;">

                                ${type === 'de-tai' ? `

                                    <option value="Đang thực hiện">Đang thực hiện</option>

                                    <option value="Hoàn thành">Hoàn thành</option>

                                    <option value="Hủy bỏ">Hủy bỏ</option>

                                ` : `

                                    <option value="Đang thực hiện">Đang thực hiện</option>

                                    <option value="Hoàn thành">Hoàn thành</option>

                                `}

                            </select>

                        </div>



                        <div style="margin-top: 28px; display: flex; gap: 12px;">

                            <button type="button" class="btn" style="flex: 1; padding: 12px; border-radius: 10px; font-weight: 600;" onclick="closeStatusChangeModal()">Hủy</button>

                            <button type="button" class="btn btn-primary" style="flex: 2; padding: 12px; border-radius: 10px; font-weight: 600; background: var(--gradient-primary); border: none;" onclick="submitStatusChangeRequest('${type}', '${id}')">Gửi yêu cầu</button>

                        </div>

                        <p style="font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 15px; font-style: italic;">

                            <i class="fas fa-info-circle"></i> Yêu cầu sẽ được chuyển tới Admin phê duyệt.

                        </p>

                    </div>

                </div>

            </div>

        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

    } else {

        const titleEl = document.querySelector('#statusChangeModalOverlay p[style*="font-weight: 700"]');

        if (titleEl) titleEl.textContent = item.ten_cong_trinh || item.ten_de_tai;

        

        const select = document.getElementById('newStatusSelect');

        if (select) {

            select.innerHTML = type === 'de-tai' ? `

                <option value="Đang thực hiện">Đang thực hiện</option>

                <option value="Hoàn thành">Hoàn thành</option>

                <option value="Hủy bỏ">Hủy bỏ</option>

            ` : `

                <option value="Đang thực hiện">Đang thực hiện</option>

                <option value="Hoàn thành">Hoàn thành</option>

            `;

        }

    }



    document.getElementById('statusChangeModalOverlay').classList.add('active');

}



function closeStatusChangeModal() {

    const el = document.getElementById('statusChangeModalOverlay');

    if (el) el.classList.remove('active');

}



async function submitStatusChangeRequest(type, id) {

    const newStatus = document.getElementById('newStatusSelect').value;

    if (!newStatus) return;



    try {

        const res = await fetch(`${API_LECTURER_BASE}/${type}/${id}/request-status-change`, {

            method: 'PUT',

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({ 

                giang_vien_id: userInfo.id,

                new_status: newStatus 

            })

        });

        const data = await res.json();

        if (data.status === 'ok') {

            alert(data.message);

            closeStatusChangeModal();

            if (type === 'cong-trinh') loadPublications();

            else if (type === 'de-tai') loadProjects();

        } else {

            alert('Lỗi: ' + data.message);

        }

    } catch (err) {

        console.error(err);

        alert('Có lỗi xảy ra khi gửi yêu cầu.');

    }

}



async function uploadPdfForLink(input, targetId) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.type !== "application/pdf") {
        alert("Vui lòng chọn file PDF.");
        return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    
    const statusDiv = document.getElementById("upload_status_" + targetId.replace("field_", ""));
    if (statusDiv) statusDiv.innerHTML = "<i class=\"fas fa-spinner fa-spin\"></i> Đang tải lên...";
    
    try {
        const res = await fetch("/api/upload/pdf", {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        
        if (data.status === "success") {
            const field = document.getElementById(targetId);
            if (field) {
                // Determine origin dynamically and prepend it if missing
                const origin = window.location.origin;
                field.value = data.url.startsWith("http") ? data.url : origin + data.url;
            }
            if (statusDiv) statusDiv.innerHTML = "<span style=\"color: #10b981;\"><i class=\"fas fa-check\"></i> Tải lên thành công!</span>";
        } else {
            alert("Lỗi: " + data.message);
            if (statusDiv) statusDiv.innerHTML = "<span style=\"color: #ef4444;\"><i class=\"fas fa-times\"></i> Lỗi tải lên.</span>";
        }
    } catch (err) {
        console.error("Lỗi upload PDF:", err);
        alert("Có lỗi xảy ra khi upload file.");
        if (statusDiv) statusDiv.innerHTML = "<span style=\"color: #ef4444;\"><i class=\"fas fa-times\"></i> Lỗi mạng.</span>";
    }
}

// Dynamic Scroll to Top Button for Lecturer Panel
document.addEventListener("DOMContentLoaded", function() {
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.id = 'scrollToTopBtn';
    scrollToTopBtn.className = 'scroll-to-top-btn';
    scrollToTopBtn.title = 'Lên đầu trang';
    scrollToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    document.body.appendChild(scrollToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});

/* ============================================================
   LECTURER PROFILE AVATAR DROPDOWN & DIALOGS
   ============================================================ */

window.initLecturerProfile = function() {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const welcomeParent = document.getElementById('welcomeText')?.parentElement;
    
    if (welcomeParent) {
        const avatarUrl = userInfo.avatar || '';
        const avatarHtml = avatarUrl 
            ? `<img src="${avatarUrl}" alt="Avatar">` 
            : `<i class="fas fa-chalkboard-teacher" style="font-size: 16px; color: var(--text-secondary);"></i>`;
            
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'profile-dropdown-container';
        dropdownContainer.id = 'profileDropdownContainer';
        dropdownContainer.innerHTML = `
            <button class="profile-avatar-btn" onclick="toggleProfileDropdown(event)">
                ${avatarHtml}
            </button>
            <div class="profile-menu">
                <div class="profile-menu-header">
                    <div class="profile-menu-name" title="${userInfo.name || 'Giảng viên'}">${userInfo.name || 'Giảng viên'}</div>
                    <div class="profile-menu-role">Giảng viên</div>
                </div>
                <button onclick="openProfileModal(event)" class="profile-menu-item">
                    <i class="fas fa-user-edit"></i> Chỉnh sửa thông tin
                </button>
                <button onclick="openChangePasswordModal(event)" class="profile-menu-item">
                    <i class="fas fa-key"></i> Đổi mật khẩu
                </button>
                <div style="border-top: 1px solid var(--border-color); margin: 6px 0;"></div>
                <button onclick="logoutUser()" class="profile-menu-item logout-item">
                    <i class="fas fa-sign-out-alt"></i> Đăng xuất
                </button>
            </div>
        `;
        welcomeParent.replaceWith(dropdownContainer);
    }

    if (!document.getElementById('profile-settings-modals-container')) {
        const modalContainer = document.createElement('div');
        modalContainer.id = 'profile-settings-modals-container';
        modalContainer.innerHTML = `
            <!-- Profile Modal -->
            <div class="modal-overlay" id="profileModal" style="display:none; z-index: 1050; justify-content: center; align-items: center;">
                <div class="modal" style="max-width: 440px; width: 90%;">
                    <div class="modal-header">
                        <h2><i class="fas fa-user-edit"></i> Chỉnh sửa thông tin</h2>
                        <button class="modal-close" onclick="closeProfileModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="profileForm" onsubmit="handleProfileUpdate(event)">
                            <div class="form-group" style="text-align: center; margin-bottom: 20px;">
                                <div style="position: relative; display: inline-block; width: 90px; height: 90px; margin: 0 auto;">
                                    <img id="profileModalAvatarPreview" src="/uploads/avatars/default.png" alt="Avatar" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-blue);">
                                    <label for="profileAvatarInput" style="position: absolute; bottom: 0; right: 0; background: var(--accent-blue); color: white; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
                                        <i class="fas fa-camera" style="font-size: 12px;"></i>
                                    </label>
                                    <input type="file" id="profileAvatarInput" accept="image/*" style="display: none;" onchange="uploadAvatarImage(this)">
                                </div>
                                <div style="font-size: 11px; color: var(--text-muted); margin-top: 8px;">Chọn tệp ảnh để thay đổi ảnh đại diện</div>
                            </div>
                            <div class="form-group">
                                <label for="profileName">Họ và tên</label>
                                <input type="text" id="profileName" required placeholder="Họ và tên" style="width:100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; box-sizing: border-box; font-family: inherit;">
                            </div>
                            <div class="form-group">
                                <label for="profileEmail">Email</label>
                                <input type="email" id="profileEmail" required placeholder="Địa chỉ email" style="width:100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; box-sizing: border-box; font-family: inherit;">
                            </div>
                            <div id="profileMsg" style="margin-top: 10px; display: none; font-size: 13px; font-weight: 500;"></div>
                            <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                                <button type="button" class="btn" onclick="closeProfileModal()">Hủy</button>
                                <button type="submit" class="btn btn-primary">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Change Password Modal -->
            <div class="modal-overlay" id="changePasswordModal" style="display:none; z-index: 1050; justify-content: center; align-items: center;">
                <div class="modal" style="max-width: 400px; width: 90%;">
                    <div class="modal-header">
                        <h2><i class="fas fa-key"></i> Đổi mật khẩu</h2>
                        <button class="modal-close" onclick="closeChangePasswordModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        <form id="changePasswordForm" onsubmit="handleChangePassword(event)">
                            <div class="form-group">
                                <label for="oldPassword">Mật khẩu hiện tại</label>
                                <input type="password" id="oldPassword" required placeholder="Nhập mật khẩu hiện tại" style="width:100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; box-sizing: border-box; font-family: inherit;">
                            </div>
                            <div class="form-group">
                                <label for="newPassword">Mật khẩu mới</label>
                                <input type="password" id="newPassword" required placeholder="Mật khẩu mới (tối thiểu 6 ký tự)" style="width:100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; box-sizing: border-box; font-family: inherit;">
                            </div>
                            <div class="form-group">
                                <label for="confirmNewPassword">Xác nhận mật khẩu mới</label>
                                <input type="password" id="confirmNewPassword" required placeholder="Xác nhận mật khẩu mới" style="width:100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; box-sizing: border-box; font-family: inherit;">
                            </div>
                            <div id="passwordMsg" style="margin-top: 10px; display: none; font-size: 13px; font-weight: 500;"></div>
                            <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                                <button type="button" class="btn" onclick="closeChangePasswordModal()">Hủy</button>
                                <button type="submit" class="btn btn-primary">Đổi mật khẩu</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modalContainer);
    }
};

let uploadedAvatarUrl = '';

window.toggleProfileDropdown = function(e) {
    e.stopPropagation();
    const dropdown = document.getElementById('profileDropdownContainer');
    if (dropdown) dropdown.classList.toggle('active');
};

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('profileDropdownContainer');
    if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

window.openProfileModal = function(e) {
    if (e) e.stopPropagation();
    const role = localStorage.getItem('userRole');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userId = userInfo.id;

    if (!role || userId === undefined) return;

    const dropdown = document.getElementById('profileDropdownContainer');
    if (dropdown) dropdown.classList.remove('active');

    fetch(`/api/auth/profile?id=${userId}&role=${role}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
                document.getElementById('profileName').value = data.data.ho_va_ten || '';
                document.getElementById('profileEmail').value = data.data.email || '';
                uploadedAvatarUrl = data.data.avatar || '';
                document.getElementById('profileModalAvatarPreview').src = uploadedAvatarUrl || '/uploads/avatars/default.png';
                
                const modal = document.getElementById('profileModal');
                if (modal) modal.style.display = 'flex';
            } else {
                alert('Lỗi: ' + data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert('Không thể kết nối đến máy chủ.');
        });
};

window.closeProfileModal = function() {
    const modal = document.getElementById('profileModal');
    if (modal) modal.style.display = 'none';
    const msg = document.getElementById('profileMsg');
    if (msg) msg.style.display = 'none';
};

window.uploadAvatarImage = function(input) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    
    const formData = new FormData();
    formData.append('file', file);

    fetch('/api/upload/image', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'success') {
            uploadedAvatarUrl = data.url;
            document.getElementById('profileModalAvatarPreview').src = data.url;
        } else {
            alert('Lỗi: ' + data.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert('Lỗi kết nối khi tải ảnh lên.');
    });
};

window.handleProfileUpdate = function(e) {
    e.preventDefault();
    const role = localStorage.getItem('userRole');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userId = userInfo.id;

    const name = document.getElementById('profileName').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const msg = document.getElementById('profileMsg');

    if (!name || !email) {
        msg.style.color = '#ef4444';
        msg.textContent = 'Vui lòng nhập đầy đủ thông tin.';
        msg.style.display = 'block';
        return;
    }

    fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: userId,
            role: role,
            ho_va_ten: name,
            email: email,
            avatar: uploadedAvatarUrl
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'ok') {
            msg.style.color = '#10b981';
            msg.textContent = 'Cập nhật thông tin thành công!';
            msg.style.display = 'block';
            
            userInfo.name = data.data.name;
            userInfo.email = data.data.email;
            userInfo.avatar = data.data.avatar;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));

            const btn = document.querySelector('.profile-avatar-btn');
            if (btn) {
                btn.innerHTML = data.data.avatar 
                    ? `<img src="${data.data.avatar}" alt="Avatar">` 
                    : `<i class="fas fa-chalkboard-teacher" style="font-size: 16px; color: var(--text-secondary);"></i>`;
            }
            const nameEl = document.querySelector('.profile-menu-name');
            if (nameEl) nameEl.textContent = data.data.name;

            setTimeout(() => {
                closeProfileModal();
                window.location.reload();
            }, 1000);
        } else {
            msg.style.color = '#ef4444';
            msg.textContent = data.message;
            msg.style.display = 'block';
        }
    })
    .catch(err => {
        console.error(err);
        msg.style.color = '#ef4444';
        msg.textContent = 'Không thể kết nối đến máy chủ.';
        msg.style.display = 'block';
    });
};

window.openChangePasswordModal = function(e) {
    if (e) e.stopPropagation();
    
    const dropdown = document.getElementById('profileDropdownContainer');
    if (dropdown) dropdown.classList.remove('active');

    document.getElementById('changePasswordForm').reset();
    
    const modal = document.getElementById('changePasswordModal');
    if (modal) modal.style.display = 'flex';
};

window.closeChangePasswordModal = function() {
    const modal = document.getElementById('changePasswordModal');
    if (modal) modal.style.display = 'none';
    const msg = document.getElementById('passwordMsg');
    if (msg) msg.style.display = 'none';
};

window.handleChangePassword = function(e) {
    e.preventDefault();
    const role = localStorage.getItem('userRole');
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userId = userInfo.id;

    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const msg = document.getElementById('passwordMsg');

    if (newPassword !== confirmNewPassword) {
        msg.style.color = '#ef4444';
        msg.textContent = 'Mật khẩu mới không trùng khớp.';
        msg.style.display = 'block';
        return;
    }

    if (newPassword.length < 6) {
        msg.style.color = '#ef4444';
        msg.textContent = 'Mật khẩu mới phải có ít nhất 6 ký tự.';
        msg.style.display = 'block';
        return;
    }

    fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            id: userId,
            role: role,
            old_password: oldPassword,
            new_password: newPassword
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'ok') {
            msg.style.color = '#10b981';
            msg.textContent = 'Đổi mật khẩu thành công!';
            msg.style.display = 'block';
            setTimeout(() => {
                closeChangePasswordModal();
            }, 1500);
        } else {
            msg.style.color = '#ef4444';
            msg.textContent = data.message;
            msg.style.display = 'block';
        }
    })
    .catch(err => {
        console.error(err);
        msg.style.color = '#ef4444';
        msg.textContent = 'Không thể kết nối đến máy chủ.';
        msg.style.display = 'block';
    });
};


