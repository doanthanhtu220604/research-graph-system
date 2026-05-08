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
            { name: 'chuc_vu', label: 'Chức vụ', type: 'text' },
            { name: 'bo_mon', label: 'Tên Bộ môn', type: 'select', options: [
                { value: '', label: '-- Chọn Bộ môn --' },
                { value: 'Bộ môn Công nghệ phần mềm', label: 'Bộ môn Công nghệ phần mềm' },
                { value: 'Bộ môn Hệ thống thông tin', label: 'Bộ môn Hệ thống thông tin' },
                { value: 'Bộ môn Mạng máy tính và truyền thông', label: 'Bộ môn Mạng máy tính và truyền thông' }
            ]},
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'dien_thoai', label: 'Điện thoại', type: 'text' },
            { name: 'chuyen_nganh', label: 'Chuyên ngành', type: 'text' },
            { name: 'anh_dai_dien', label: 'Link ảnh đại diện', type: 'url' }
        ]
    },
    'cong-trinh': {
        title: 'Công trình',
        apiUrl: `${API_BASE}/cong-trinh`,
        adminApiUrl: `${ADMIN_API_BASE}/cong-trinh`,
        fields: [
            { name: 'ten_cong_trinh', label: 'Tên công trình', type: 'text', required: true },
            { name: 'nam_xuat_ban', label: 'Năm xuất bản', type: 'number' },
            { name: 'tom_tat', label: 'Tóm tắt nội dung', type: 'textarea' },
            { name: 'trang_thai', label: 'Trạng thái', type: 'select', default: 'Đang thực hiện', options: [
                { value: 'Đang thực hiện', label: 'Đang thực hiện' },
                { value: 'Hoàn thành', label: 'Hoàn thành' }
            ]},
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
            { name: 'trang_thai', label: 'Trạng thái', type: 'select', default: 'Đang thực hiện', options: [
                { value: 'Đang thực hiện', label: 'Đang thực hiện' },
                { value: 'Hoàn thành', label: 'Hoàn thành' }
            ]},
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
    },
    'tac-gia-ngoai': {
        title: 'Tác giả ngoài',
        apiUrl: `${ADMIN_API_BASE}/tac-gia-ngoai`, // Using admin URL since it's only in admin for now
        adminApiUrl: `${ADMIN_API_BASE}/tac-gia-ngoai`,
        fields: [
            { name: 'ho_va_ten', label: 'Họ và tên', type: 'text', required: true },
            { name: 'don_vi_cong_tac', label: 'Đơn vị công tác', type: 'text' },
            { name: 'hoc_vi', label: 'Học vị', type: 'text' },
            { name: 'chuc_danh', label: 'Chức danh', type: 'text' },
            { name: 'chuc_vu', label: 'Chức vụ', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' }
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
    } else if (document.getElementById('page-admin-accounts')) {
        loadAccounts();
    } else if (document.getElementById('page-admin-external-authors')) {
        loadExternalAuthors();
    } else if (document.getElementById('page-admin-overview')) {
        initDashboardOverview();
    }
    
    // Khởi tạo Clock toàn cục
    updateClock();
    setInterval(updateClock, 1000);
    
    // Gắn sự kiện xuất CSV toàn cục nếu có nút
    const exportBtn = document.getElementById('exportCsvBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportDashboardCsv);
    }
    
    // Gắn sự kiện submit cho form nếu form tồn tại trong file HTML này
    const form = document.getElementById('adminForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// ─── Admin chart instances ───
let admChartCombined = null;
let admChartByLevel = null;

let rawCtNam = [];
let rawDtNam = [];

async function initDashboardOverview() {
    try {
        const res = await fetch(`${API_BASE}/stats/overview`);
        const data = await res.json();
        if (data.status !== 'ok') return;

        // ── 1. Animate stat cards ──────────────────────────────
        animateAdmCard('admCountGV', data.stats.giang_vien);
        animateAdmCard('admCountCT', data.stats.cong_trinh);
        animateAdmCard('admCountDT', data.stats.de_tai);
        animateAdmCard('admCountBM', data.stats.bo_mon);

        // ── 2. Combined Bar chart — publications & projects ───
        rawCtNam = data.cong_trinh_theo_nam || [];
        rawDtNam = data.de_tai_theo_nam || [];
        renderCombinedChart('all');

        // ── 3. Doughnut chart — projects by level ─────────────
        const dtCap = data.de_tai_theo_cap || [];
        const ctxDonut = document.getElementById('admChartByLevel');
        if (ctxDonut) {
            if (admChartByLevel) admChartByLevel.destroy();
            const palette = ['#4F8EF7','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899','#84cc16'];
            admChartByLevel = new Chart(ctxDonut, {
                type: 'doughnut',
                data: {
                    labels: dtCap.map(r => r.cap),
                    datasets: [{
                        data: dtCap.map(r => r.so_luong),
                        backgroundColor: palette.slice(0, dtCap.length),
                        borderColor: 'var(--surface, #ffffff)',
                        borderWidth: 3, hoverOffset: 8,
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '62%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#64748b', font: { family: 'Inter', size: 11 }, padding: 10, usePointStyle: true, pointStyleWidth: 8 }
                        },
                        tooltip: {
                            backgroundColor: '#1e293b', titleColor: '#f1f5f9',
                            bodyColor: '#94a3b8', padding: 10,
                            callbacks: { label: ctx => ` ${ctx.parsed} đề tài` }
                        }
                    },
                    animation: { duration: 800, easing: 'easeOutQuart' }
                }
            });
        }


        // ── 5. Top lecturers compact list ─────────────────────
        renderAdmTopLecturers(data.top_giang_vien || []);

    } catch (err) {
        console.error('[Admin Dashboard] Error:', err);
    }
}

function renderCombinedChart(filterYear) {
    const ctx = document.getElementById('admChartCombined');
    if (!ctx) return;
    
    let allYears = new Set();
    rawCtNam.forEach(r => allYears.add(r.nam));
    rawDtNam.forEach(r => allYears.add(r.nam));
    
    let sortedYears = Array.from(allYears).sort((a,b) => a - b);
    
    const select = document.getElementById('chartYearFilter');
    if (select && select.options.length === 1) {
        sortedYears.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = 'Năm ' + y;
            select.appendChild(opt);
        });
        select.addEventListener('change', (e) => {
            renderCombinedChart(e.target.value);
        });
    }
    
    let labels = sortedYears;
    if (filterYear !== 'all') {
        labels = [Number(filterYear)];
    }
    
    const ctData = labels.map(y => {
        const found = rawCtNam.find(r => r.nam === y);
        return found ? found.so_luong : 0;
    });
    const dtData = labels.map(y => {
        const found = rawDtNam.find(r => r.nam === y);
        return found ? found.so_luong : 0;
    });
    
    if (admChartCombined) admChartCombined.destroy();
    admChartCombined = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(String),
            datasets: [
                {
                    label: 'Công trình',
                    data: ctData,
                    backgroundColor: '#4F8EF7',
                    borderRadius: 4
                },
                {
                    label: 'Đề tài',
                    data: dtData,
                    backgroundColor: '#10b981',
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: '#64748b', font: { family: 'Inter', size: 12 }, usePointStyle: true, pointStyleWidth: 10 } },
                tooltip: {
                    backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', padding: 10,
                    mode: 'index', intersect: false
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, autoSkip: false, maxRotation: 45, minRotation: 45 } },
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, precision: 0 } }
            },
            animation: { duration: 800, easing: 'easeOutQuart' }
        }
    });
}

function animateAdmCard(id, endValue, duration = 1200) {
    const el = document.getElementById(id);
    if (!el) return;
    let start = null;
    const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.floor(eased * endValue);
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

function renderAdmTopLecturers(lecturers) {
    const el = document.getElementById('admTopLecturersList');
    if (!el) return;
    if (!lecturers.length) {
        el.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Chưa có dữ liệu.</p>';
        return;
    }
    const maxCount = Math.max(...lecturers.map(g => Number(g.so_cong_trinh) || 0)) || 1;
    const numClasses = ['gold', 'silver', 'bronze'];
    el.innerHTML = lecturers.map((gv, i) => {
        const count = Number(gv.so_cong_trinh) || 0;
        const name = String(gv.ten || 'N/A').replace(/</g, '&lt;');
        const numCls = numClasses[i] || '';
        const pct = Math.max(8, Math.round((count / maxCount) * 100));
        return `
            <div class="adm-rank-item" onclick="viewLecturerStats('${gv.id || ''}')">
                <div class="adm-rank-num ${numCls}">${i + 1}</div>
                <div class="adm-rank-info">
                    <div class="adm-rank-name" title="${name}">${name}</div>
                    <div class="adm-rank-sub">
                        <div style="width:${pct}%; height:3px; background:#4F8EF7; border-radius:2px; margin-top:4px; opacity:0.6;"></div>
                    </div>
                </div>
                <span class="adm-rank-badge">${count} CT</span>
            </div>
        `;
    }).join('');
}



function updateClock() {
    const clockEl = document.getElementById('realtimeClock');
    if (!clockEl) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour12: false });
    const dateStr = now.toLocaleDateString('vi-VN');
    clockEl.innerHTML = `<i class="far fa-clock"></i> ${timeStr} — ${dateStr}`;
}

function exportDashboardCsv() {

    // Xác định đang ở trang nào để xuất dữ liệu tương ứng
    let csvContent = "data:text/csv;charset=utf-8,\ufeff";
    let filename = "export_admin.csv";

    if (document.getElementById('page-admin-overview')) {
        csvContent += "Bộ môn,Số lượng bài báo,Số lượng đề tài\n";
        csvContent += "Công nghệ phần mềm,15,5\n";
        csvContent += "Hệ thống thông tin,12,8\n";
        csvContent += "Mạng máy tính,8,3\n";
        filename = "thong_ke_he_thong.csv";
    } else if (document.getElementById('page-admin-lecturers')) {
        csvContent += "ID,Họ và tên,Học vị,Chức danh,Chức vụ,Bộ môn,Email\n";
        const list = currentEntitiesData['giang-vien'] || [];
        list.forEach(gv => {
            csvContent += `"${gv.id || ''}","${gv.ho_va_ten || ''}","${gv.hoc_vi || ''}","${gv.chuc_danh || ''}","${gv.chuc_vu || ''}","${gv.bo_mon || ''}","${gv.email || ''}"\n`;
        });
        filename = "danh_sach_giang_vien.csv";
    } else if (document.getElementById('page-admin-publications')) {
        csvContent += "ID,Tên công trình,Năm xuất bản\n";
        const list = currentEntitiesData['cong-trinh'] || [];
        list.forEach(ct => {
            csvContent += `"${ct.id || ''}","${(ct.ten_cong_trinh || '').replace(/"/g, '""')}","${ct.nam_xuat_ban || ''}"\n`;
        });
        filename = "danh_sach_cong_trinh.csv";
    } else if (document.getElementById('page-admin-projects')) {
        csvContent += "ID,Tên đề tài,Cấp đề tài,Năm bắt đầu,Năm kết thúc,Trạng thái\n";
        const list = currentEntitiesData['de-tai'] || [];
        list.forEach(dt => {
            csvContent += `"${dt.id || ''}","${(dt.ten_de_tai || '').replace(/"/g, '""')}","${dt.cap_de_tai || ''}","${dt.nam_bat_dau || ''}","${dt.nam_ket_thuc || ''}","${dt.trang_thai || ''}"\n`;
        });
        filename = "danh_sach_de_tai.csv";
    } else if (document.getElementById('page-admin-research-fields')) {
        csvContent += "ID,Tên lĩnh vực\n";
        const list = currentEntitiesData['linh-vuc'] || [];
        list.forEach((lv, i) => {
            csvContent += `"${lv.id || i+1}","${(lv.ten_linh_vuc || '').replace(/"/g, '""')}"\n`;
        });
        filename = "danh_sach_linh_vuc.csv";
    } else if (document.getElementById('page-admin-external-authors')) {
        csvContent += "ID,Họ và tên,Đơn vị công tác,Học vị,Chức danh,Email\n";
        const list = currentEntitiesData['tac-gia-ngoai'] || [];
        list.forEach(tgn => {
            csvContent += `"${tgn.id || ''}","${tgn.ho_va_ten || ''}","${tgn.don_vi_cong_tac || ''}","${tgn.hoc_vi || ''}","${tgn.chuc_danh || ''}","${tgn.email || ''}"\n`;
        });
        filename = "danh_sach_tac_gia_ngoai.csv";
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// ============================================================
// LOAD DATA
// ============================================================

async function loadLecturers() {
    try {
        const res = await fetch(ENTITY_CONFIG['giang-vien'].apiUrl);
        const data = await res.json();
        
        if (data.status === 'ok') {
            currentEntitiesData['giang-vien'] = data.data;
            renderLecturersTable(data.data);
        }
    } catch (err) {
        console.error(err);
    }
}

function renderLecturersTable(dataList) {
    const tbody = document.getElementById('adminLecturersBody');
    if (!tbody) return;
    
    if (dataList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">Không tìm thấy giảng viên phù hợp.</td></tr>';
        return;
    }
    
    tbody.innerHTML = dataList.map((gv) => `
        <tr>
            <td>${gv.id || 'N/A'}</td>
            <td>
                ${gv.anh_dai_dien
                    ? `<img src="${gv.anh_dai_dien}" alt="${gv.ho_va_ten}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;">`
                    : `<i class="fas fa-user-circle" style="font-size:32px;color:var(--text-muted);vertical-align:middle;margin-right:8px;"></i>`
                }
                <strong>${gv.ho_va_ten || 'N/A'}</strong>
            </td>
            <td>${gv.hoc_vi || ''}</td>
            <td>${gv.bo_mon || ''}</td>
            <td>
                <button class="btn btn-sm" style="background:#f39c12;color:#fff;border-color:#f39c12;" title="Xem chi tiết" onclick="viewLecturerStats('${gv.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('giang-vien', '${gv.id}', null)"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('giang-vien', '${gv.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function filterLecturers() {
    const list = currentEntitiesData['giang-vien'] || [];
    const nameFilter = (document.getElementById('filterName')?.value || '').toLowerCase();
    const deptFilter = document.getElementById('filterDepartment')?.value || '';
    const degreeFilter = document.getElementById('filterDegree')?.value || '';
    
    const filtered = list.filter(gv => {
        const matchName = (gv.ho_va_ten || '').toLowerCase().includes(nameFilter);
        const matchDept = deptFilter === '' || (gv.bo_mon === deptFilter);
        const matchDegree = degreeFilter === '' || (gv.hoc_vi && gv.hoc_vi.includes(degreeFilter));
        return matchName && matchDept && matchDegree;
    });
    
    renderLecturersTable(filtered);
}

async function loadPublications() {
    try {
        const res = await fetch(ENTITY_CONFIG['cong-trinh'].apiUrl);
        const data = await res.json();
        
        if (data.status === 'ok') {
            currentEntitiesData['cong-trinh'] = data.data;
            renderPublicationsTable(data.data);
        }
    } catch (err) {
        console.error(err);
    }
}

function renderPublicationsTable(dataList) {
    const tbody = document.getElementById('adminPublicationsBody');
    if (!tbody) return;
    
    if (dataList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 30px;">Không tìm thấy công trình phù hợp.</td></tr>';
        return;
    }
    
    tbody.innerHTML = dataList.map((ct) => {
        const originalIndex = currentEntitiesData['cong-trinh'].indexOf(ct);
        const trangThai = ct.trang_thai || 'Chưa xác định';
        let statusColor = '#6c757d';
        let statusBg = 'rgba(108,117,125,0.1)';
        if (trangThai === 'Hoàn thành')        { statusColor = '#28a745'; statusBg = 'rgba(40,167,69,0.1)'; }
        else if (trangThai === 'Đang thực hiện') { statusColor = '#007bff'; statusBg = 'rgba(0,123,255,0.1)'; }
        else if (trangThai === 'Chờ duyệt')     { statusColor = '#fd7e14'; statusBg = 'rgba(253,126,20,0.1)'; }
        return `
        <tr>
            <td>${ct.id || 'N/A'}</td>
            <td><strong>${ct.ten_cong_trinh || 'N/A'}</strong></td>
            <td>${ct.nam_xuat_ban || ''}</td>
            <td><span style="background:${statusBg}; color:${statusColor}; border:1px solid ${statusColor}; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; white-space:nowrap;">${trangThai}</span></td>
            <td>
                ${trangThai === 'Chờ duyệt' ? `<button class="btn btn-sm" style="background:#28a745;color:#fff;border-color:#28a745;" title="Duyệt công trình" onclick="approvePublication('${ct.id}')"><i class="fas fa-check"></i></button>` : ''}
                <button class="btn btn-sm" style="background:#f39c12;color:#fff;border-color:#f39c12;" title="Xem chi tiết" onclick="viewPublicationStats('${ct.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('cong-trinh', '${ct.id}', ${originalIndex})"><i class="fas fa-edit"></i></button>
                ${ct.id ? `<button class="btn btn-sm" style="background:#17a2b8;color:#fff;border-color:#17a2b8;" title="Gán Tác giả" onclick="openRelationModal('cong-trinh', '${ct.id}', \`${(ct.ten_cong_trinh||'').replace(/`/g, '')}\`)"><i class="fas fa-link"></i></button>` : ''}
                <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('cong-trinh', '${ct.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `}).join('');
}

function filterPublications() {
    const list = currentEntitiesData['cong-trinh'] || [];
    const titleFilter = (document.getElementById('filterPubTitle')?.value || '').toLowerCase();
    const yearFilter = document.getElementById('filterPubYear')?.value || '';
    
    const filtered = list.filter(ct => {
        const matchTitle = (ct.ten_cong_trinh || '').toLowerCase().includes(titleFilter);
        const matchYear = yearFilter === '' || (ct.nam_xuat_ban == yearFilter);
        return matchTitle && matchYear;
    });
    
    renderPublicationsTable(filtered);
}

async function approvePublication(id) {
    if (!confirm('Bạn có chắc muốn duyệt công trình này thành "Đang thực hiện"?')) return;
    try {
        const res = await fetch(`${ADMIN_API_BASE}/cong-trinh/${id}/approve`, {
            method: 'PUT'
        });
        const data = await res.json();
        if (data.status === 'ok') {
            loadPublications();
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi khi duyệt công trình.');
    }
}

async function approveProject(id) {
    if (!confirm('Bạn có chắc muốn duyệt đề tài này thành "Đang thực hiện"?')) return;
    try {
        const res = await fetch(`${ADMIN_API_BASE}/de-tai/${id}/approve`, {
            method: 'PUT'
        });
        const data = await res.json();
        if (data.status === 'ok') {
            loadProjects();
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi khi duyệt đề tài.');
    }
}

async function loadProjects() {
    try {
        const res = await fetch(ENTITY_CONFIG['de-tai'].apiUrl);
        const data = await res.json();
        
        if (data.status === 'ok') {
            currentEntitiesData['de-tai'] = data.data;
            renderProjectsTable(data.data);
        }
    } catch (err) {
        console.error(err);
    }
}

function renderProjectsTable(dataList) {
    const tbody = document.getElementById('adminProjectsBody');
    if (!tbody) return;
    
    if (dataList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Không tìm thấy đề tài phù hợp.</td></tr>';
        return;
    }
    
    tbody.innerHTML = dataList.map((dt) => {
        const originalIndex = currentEntitiesData['de-tai'].indexOf(dt);
        const namThucHien = (dt.nam_bat_dau && dt.nam_ket_thuc && dt.nam_bat_dau !== dt.nam_ket_thuc) 
            ? `${dt.nam_bat_dau} - ${dt.nam_ket_thuc}` 
            : (dt.nam_bat_dau || dt.nam_ket_thuc || '');
        const trangThai = dt.trang_thai || 'Chưa xác định';
        let statusColor = '#6c757d';
        let statusBg = 'rgba(108,117,125,0.1)';
        if (trangThai === 'Hoàn thành') { statusColor = '#28a745'; statusBg = 'rgba(40,167,69,0.1)'; }
        else if (trangThai === 'Đang thực hiện') { statusColor = '#007bff'; statusBg = 'rgba(0,123,255,0.1)'; }
        else if (trangThai === 'Chờ duyệt')     { statusColor = '#fd7e14'; statusBg = 'rgba(253,126,20,0.1)'; }
        return `
        <tr>
            <td>${dt.id || 'N/A'}</td>
            <td><strong>${dt.ten_de_tai || 'N/A'}</strong></td>
            <td>${dt.cap_de_tai || ''}</td>
            <td>${namThucHien}</td>
            <td><span style="background:${statusBg}; color:${statusColor}; border:1px solid ${statusColor}; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; white-space:nowrap;">${trangThai}</span></td>
            <td>
                ${trangThai === 'Chờ duyệt' ? `<button class="btn btn-sm" style="background:#28a745;color:#fff;border-color:#28a745;" title="Duyệt đề tài" onclick="approveProject('${dt.id}')"><i class="fas fa-check"></i></button>` : ''}
                <button class="btn btn-sm" style="background:#f39c12;color:#fff;border-color:#f39c12;" title="Xem chi tiết" onclick="viewProjectStats('${dt.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('de-tai', '${dt.id}', ${originalIndex})"><i class="fas fa-edit"></i></button>
                ${dt.id ? `<button class="btn btn-sm" style="background:#17a2b8;color:#fff;border-color:#17a2b8;" title="Gán Chủ nhiệm/Thành viên" onclick="openRelationModal('de-tai', '${dt.id}', \`${(dt.ten_de_tai||'').replace(/`/g, '')}\`)"><i class="fas fa-link"></i></button>` : ''}
                <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('de-tai', '${dt.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `}).join('');
}

function filterProjects() {
    const list = currentEntitiesData['de-tai'] || [];
    const nameFilter = (document.getElementById('filterProjName')?.value || '').toLowerCase();
    const levelFilter = document.getElementById('filterProjLevel')?.value || '';
    const statusFilter = document.getElementById('filterProjStatus')?.value || '';
    
    const filtered = list.filter(dt => {
        const matchName = (dt.ten_de_tai || '').toLowerCase().includes(nameFilter);
        const matchLevel = levelFilter === '' || (dt.cap_de_tai === levelFilter);
        const matchStatus = statusFilter === '' || (dt.trang_thai === statusFilter);
        return matchName && matchLevel && matchStatus;
    });
    
    renderProjectsTable(filtered);
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
                        <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('linh-vuc', '${lv.id}', ${i})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('linh-vuc', '${lv.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error(err);
    }
}

async function loadExternalAuthors() {
    try {
        const res = await fetch(ENTITY_CONFIG['tac-gia-ngoai'].apiUrl);
        const data = await res.json();
        
        if (data.status === 'ok') {
            currentEntitiesData['tac-gia-ngoai'] = data.data;
            renderExternalAuthorsTable(data.data);
        }
    } catch (err) {
        console.error(err);
    }
}

function renderExternalAuthorsTable(dataList) {
    const tbody = document.getElementById('adminExternalAuthorsBody');
    if (!tbody) return;
    
    if (dataList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">Không tìm thấy tác giả ngoài phù hợp.</td></tr>';
        return;
    }
    
    tbody.innerHTML = dataList.map((tgn, index) => `
        <tr>
            <td>${tgn.id || 'N/A'}</td>
            <td><strong>${tgn.ho_va_ten || 'N/A'}</strong></td>
            <td>${tgn.don_vi_cong_tac || ''}</td>
            <td>${[tgn.hoc_vi, tgn.chuc_danh].filter(Boolean).join(' / ')}</td>
            <td>
                <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('tac-gia-ngoai', '${tgn.id}', ${index})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('tac-gia-ngoai', '${tgn.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function filterExternalAuthors() {
    const list = currentEntitiesData['tac-gia-ngoai'] || [];
    const nameFilter = (document.getElementById('filterTgnName')?.value || '').toLowerCase();
    
    const filtered = list.filter(tgn => {
        return (tgn.ho_va_ten || '').toLowerCase().includes(nameFilter);
    });
    
    renderExternalAuthorsTable(filtered);
}

// ============================================================
// MODAL FORMS
// ============================================================

async function openAdminModal(type, id = null, index = null) {
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
        } else if (f.type === 'select') {
            const defaultVal = (!id && f.default) ? f.default : null;
            const optionsHtml = f.options.map(opt => `<option value="${opt.value}"${defaultVal === opt.value ? ' selected' : ''}>${opt.label}</option>`).join('');
            inputHtml = `<select id="field_${f.name}" name="${f.name}" ${f.required ? 'required' : ''}>${optionsHtml}</select>`;
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
            item = currentEntitiesData[type].find(x => x.id == id);
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

    // Thêm phần nhập Lĩnh vực nghiên cứu cho Giảng viên (dạng text tự do)
    if (type === 'giang-vien') {
        let currentLVText = '';
        if (id) {
            try {
                const gvRes = await fetch(`${API_BASE}/giang-vien/${id}`);
                const gvData = await gvRes.json();
                if (gvData.status === 'ok' && gvData.data.linh_vuc) {
                    currentLVText = gvData.data.linh_vuc.join(', ');
                }
            } catch (e) {
                console.error('Lỗi tải lĩnh vực:', e);
            }
        }
        const lvHtml = `
        <div class="form-group">
            <label for="field_linh_vuc_text">Lĩnh vực nghiên cứu <span style="color:var(--text-muted); font-size:12px; font-weight:normal;">(phân tách bằng dấu phẩy)</span></label>
            <input type="text" id="field_linh_vuc_text" name="linh_vuc_text" value="${currentLVText}" placeholder="VD: Trí tuệ nhân tạo, Học máy, Xử lý ngôn ngữ tự nhiên">
        </div>`;
        container.insertAdjacentHTML('beforeend', lvHtml);
    }

    // Thêm phần chọn Tác giả cho Công trình khi THÊM MỚI
    if (type === 'cong-trinh' && !id) {
        container.insertAdjacentHTML('beforeend', `
        <div class="form-group" id="authorPickerGroup">
            <label>Tác giả <span style="color:var(--text-muted); font-size:12px; font-weight:normal;">(có thể chọn sau)</span></label>
            <div id="authorPickerList" style="max-height:200px; overflow-y:auto; border:1px solid var(--border-color); border-radius:6px; padding:10px;">
                <p style="color:var(--text-muted); font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Đang tải danh sách giảng viên...</p>
            </div>
        </div>`);
        try {
            const gvRes = await fetch(`${API_BASE}/giang-vien`);
            const gvData = await gvRes.json();
            const allGVs = gvData.data || [];
            const listEl = document.getElementById('authorPickerList');
            if (allGVs.length === 0) {
                listEl.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Không có giảng viên nào.</p>';
            } else {
                listEl.innerHTML = allGVs.map(gv => `
                    <div style="margin-bottom:8px;">
                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary);">
                            <input type="checkbox" name="gv_tac_gia_new" value="${gv.id}">
                            <span>${gv.ho_va_ten}${gv.bo_mon ? ' <span style="color:var(--text-muted);font-size:12px;">(' + gv.bo_mon + ')</span>' : ''}</span>
                        </label>
                    </div>`).join('');
            }
        } catch (e) {
            document.getElementById('authorPickerList').innerHTML = '<p style="color:red;font-size:13px;">Lỗi tải danh sách giảng viên.</p>';
        }

        // Ô nhập tên tác giả ngoài
        container.insertAdjacentHTML('beforeend', `
        <div class="form-group" style="margin-top: 20px;">
            <label for="field_tac_gia_ngoai_ct">Tác giả ngoài <span style="color:var(--text-muted); font-size:12px; font-weight:normal;">(phân tách bằng dấu phẩy)</span></label>
            <input type="text" id="field_tac_gia_ngoai_ct" name="tac_gia_ngoai_ct"
                placeholder="VD: Nguyen Van A, John Smith, Tanaka Yuki">
        </div>`);
    }

    // Thêm phần chọn Chủ nhiệm / Thành viên cho Đề tài khi THÊM MỚI
    if (type === 'de-tai' && !id) {
        container.insertAdjacentHTML('beforeend', `
        <div class="form-group" id="memberPickerGroup">
            <label>Giảng viên tham gia <span style="color:var(--text-muted); font-size:12px; font-weight:normal;">(có thể chọn sau)</span></label>
            <div style="display:flex; gap:12px; flex-wrap:wrap;">
                <div style="flex:1; min-width:200px;">
                    <p style="font-size:13px; font-weight:600; color:var(--accent-blue); margin-bottom:6px;">
                        <i class="fas fa-user-tie"></i> Chủ nhiệm
                    </p>
                    <div id="chuNhiemPickerList" style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); border-radius:6px; padding:10px;">
                        <p style="color:var(--text-muted); font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>
                    </div>
                </div>
                <div style="flex:1; min-width:200px;">
                    <p style="font-size:13px; font-weight:600; color:#10b981; margin-bottom:6px;">
                        <i class="fas fa-users"></i> Thành viên
                    </p>
                    <div id="thamGiaPickerList" style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); border-radius:6px; padding:10px;">
                        <p style="color:var(--text-muted); font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>
                    </div>
                </div>
            </div>
        </div>`);
        try {
            const gvRes = await fetch(`${API_BASE}/giang-vien`);
            const gvData = await gvRes.json();
            const allGVs = gvData.data || [];
            const cnEl = document.getElementById('chuNhiemPickerList');
            const tgEl = document.getElementById('thamGiaPickerList');
            if (allGVs.length === 0) {
                cnEl.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Không có giảng viên.</p>';
                tgEl.innerHTML = cnEl.innerHTML;
            } else {
                const rowsHtml = (name) => allGVs.map(gv => `
                    <div style="margin-bottom:8px;">
                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary);">
                            <input type="checkbox" name="${name}" value="${gv.id}">
                            <span style="font-size:13px;">${gv.ho_va_ten}${gv.bo_mon ? '<br><span style="color:var(--text-muted);font-size:11px;">' + gv.bo_mon + '</span>' : ''}</span>
                        </label>
                    </div>`).join('');
                cnEl.innerHTML = rowsHtml('gv_chu_nhiem_new');
                tgEl.innerHTML = rowsHtml('gv_tham_gia_new');
            }
        } catch (e) {
            document.getElementById('chuNhiemPickerList').innerHTML = '<p style="color:red;font-size:13px;">Lỗi tải dữ liệu.</p>';
            document.getElementById('thamGiaPickerList').innerHTML = '<p style="color:red;font-size:13px;">Lỗi tải dữ liệu.</p>';
        }

        // Ô nhập tên tác giả ngoài
        container.insertAdjacentHTML('beforeend', `
        <div class="form-group" style="margin-top: 20px;">
            <label for="field_tac_gia_ngoai_dt">Tác giả ngoài <span style="color:var(--text-muted); font-size:12px; font-weight:normal;">(phân tách bằng dấu phẩy)</span></label>
            <input type="text" id="field_tac_gia_ngoai_dt" name="tac_gia_ngoai_dt"
                placeholder="VD: Nguyen Van A, John Smith, Tanaka Yuki">
        </div>`);
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

    // Thu thập lĩnh vực nghiên cứu từ text input (cho giảng viên)
    if (type === 'giang-vien') {
        const lvInput = document.getElementById('field_linh_vuc_text');
        if (lvInput && lvInput.value.trim()) {
            formData.linh_vuc_names = lvInput.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        } else {
            formData.linh_vuc_names = [];
        }
    }

    // Thu thập danh sách tác giả khi THÊM MỚI công trình
    if (type === 'cong-trinh' && !id) {
        const checked = document.querySelectorAll('input[name="gv_tac_gia_new"]:checked');
        formData.giang_vien_ids = Array.from(checked).map(cb => cb.value);
        const tgnInput = document.getElementById('field_tac_gia_ngoai_ct');
        formData.tac_gia_ngoai_names = tgnInput && tgnInput.value.trim()
            ? tgnInput.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
            : [];
    }

    // Thu thập Chủ nhiệm và Thành viên khi THÊM MỚI đề tài
    if (type === 'de-tai' && !id) {
        const cnChecked = document.querySelectorAll('input[name="gv_chu_nhiem_new"]:checked');
        const tgChecked = document.querySelectorAll('input[name="gv_tham_gia_new"]:checked');
        formData.chu_nhiem_ids = Array.from(cnChecked).map(cb => cb.value);
        formData.tham_gia_ids  = Array.from(tgChecked).map(cb => cb.value);
        const tgnInput = document.getElementById('field_tac_gia_ngoai_dt');
        formData.tac_gia_ngoai_names = tgnInput && tgnInput.value.trim()
            ? tgnInput.value.split(',').map(s => s.trim()).filter(s => s.length > 0)
            : [];
    }

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
            else if (type === 'tac-gia-ngoai') loadExternalAuthors();
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
            else if (type === 'tac-gia-ngoai') loadExternalAuthors();
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
            const gv_ids = Array.from(checkedBoxes).map(cb => cb.value);
            
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
            
            const chuNhiemIds = Array.from(cnBoxes).map(cb => cb.value);
            const thamGiaIds = Array.from(tgBoxes).map(cb => cb.value);
            
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
                    <p style="margin-bottom: 5px;"><b>Chức vụ:</b> ${gv.chuc_vu || 'N/A'}</p>
                    <p style="margin-bottom: 5px;"><b>Bộ môn:</b> ${gv.bo_mon || 'N/A'}</p>
                    <p style="margin-bottom: 5px;"><b>Chuyên ngành:</b> ${gv.chuyen_nganh || 'N/A'}</p>
                    <p style="margin-bottom: 5px;"><b>Email:</b> ${gv.email || 'N/A'}</p>
                    <p style="margin-bottom: 0;"><b>Lĩnh vực nghiên cứu:</b> ${
                        (gv.linh_vuc && gv.linh_vuc.length > 0)
                            ? gv.linh_vuc.map(lv => `<span style="display:inline-block;padding:2px 10px;background:rgba(26,188,156,0.12);color:#1ABC9C;border-radius:12px;font-size:12px;font-weight:600;margin:2px 4px 2px 0;">${lv}</span>`).join('')
                            : '<span style="color:var(--text-muted);">Chưa có</span>'
                    }</p>
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
                    <p style="margin-bottom: 5px;"><b>Người tạo:</b> ${ct.nguoi_tao || 'Hệ thống / Admin'}</p>
                    <p style="margin-bottom: 5px;"><b>Link:</b> ${ct.link ? `<a href="${ct.link}" target="_blank" style="color:var(--accent-blue);">${ct.link}</a>` : 'N/A'}</p>
                    <p style="margin-bottom: 5px; margin-top: 10px;"><b>Tóm tắt:</b> ${ct.tom_tat || 'Đang cập nhật...'}</p>
                </div>
            `;
            
            html += `<h4 style="margin-top:20px; color:var(--accent-blue); padding-bottom: 5px; border-bottom: 1px solid var(--border-color);"><i class="fas fa-users"></i> Tác giả nội bộ (${ct.tac_gia ? ct.tac_gia.length : 0})</h4>`;
            if (ct.tac_gia && ct.tac_gia.length > 0) {
                html += `<ul style="margin-left:20px; margin-bottom:15px; margin-top: 10px; line-height: 1.6;">`;
                ct.tac_gia.forEach(tg => {
                    html += `<li><i class="fas fa-user-tie" style="color:#4F8EF7; font-size:11px; margin-right:4px;"></i><b>${tg}</b></li>`;
                });
                html += `</ul>`;
            } else {
                html += `<p style="color:var(--text-muted); font-size:13px; margin-bottom:15px; margin-top: 5px;">Chưa có tác giả nào được gán.</p>`;
            }

            const tgnList = ct.tac_gia_ngoai || [];
            html += `<h4 style="margin-top:20px; color:#e67e22; padding-bottom: 5px; border-bottom: 1px solid var(--border-color);"><i class="fas fa-user-friends"></i> Tác giả ngoài (${tgnList.length})</h4>`;
            if (tgnList.length > 0) {
                html += `<ul style="margin-left:20px; margin-bottom:15px; margin-top: 10px; line-height: 1.8;">`;
                tgnList.forEach(tgn => {
                    const donVi = tgn.don_vi ? `<span style="color:var(--text-muted); font-size:12px;"> — ${tgn.don_vi}</span>` : '';
                    html += `<li><i class="fas fa-user-friends" style="color:#e67e22; font-size:11px; margin-right:4px;"></i><b>${tgn.ten}</b>${donVi}</li>`;
                });
                html += `</ul>`;
            } else {
                html += `<p style="color:var(--text-muted); font-size:13px; margin-bottom:15px; margin-top: 5px;">Không có tác giả ngoài.</p>`;
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

            const tgnList = dt.tac_gia_ngoai || [];
            html += `<h4 style="margin-top:20px; color:#e67e22; padding-bottom: 5px; border-bottom: 1px solid var(--border-color);"><i class="fas fa-user-friends"></i> Tác giả ngoài (${tgnList.length})</h4>`;
            if (tgnList.length > 0) {
                html += `<ul style="margin-left:20px; margin-bottom:15px; margin-top: 10px; line-height: 1.8;">`;
                tgnList.forEach(tgn => {
                    const donVi = tgn.don_vi ? `<span style="color:var(--text-muted); font-size:12px;"> — ${tgn.don_vi}</span>` : '';
                    html += `<li><i class="fas fa-user-friends" style="color:#e67e22; font-size:11px; margin-right:4px;"></i><b>${tgn.ten}</b>${donVi}</li>`;
                });
                html += `</ul>`;
            } else {
                html += `<p style="color:var(--text-muted); font-size:13px; margin-bottom:15px; margin-top: 5px;">Không có tác giả ngoài.</p>`;
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
// ACCOUNTS MANAGEMENT
// ============================================================
let allAccounts = [];

async function loadAccounts() {
    try {
        const res = await fetch(`${ADMIN_API_BASE}/accounts`);
        const data = await res.json();
        if (data.status === 'ok') {
            allAccounts = data.data || [];
            updateAccountStats();
            renderAccountsTable(allAccounts);
        }
    } catch(e) { console.error('Error loadAccounts', e); }
}

function renderAccountsTable(list) {
    const tbody = document.getElementById('adminAccountsBody');
    if (!tbody) return;
    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading-cell">Không có dữ liệu tài khoản</td></tr>';
        return;
    }
    
    tbody.innerHTML = list.map(acc => {
        let statusBadge = '';
        if (!acc.co_tai_khoan) {
            statusBadge = '<span class="account-badge badge-no-acct"><i class="fas fa-exclamation-circle"></i> Chưa tạo</span>';
        } else if (acc.trang_thai_tk === 'Hoạt động') {
            statusBadge = '<span class="account-badge badge-active"><i class="fas fa-check-circle"></i> Hoạt động</span>';
        } else {
            statusBadge = '<span class="account-badge badge-locked"><i class="fas fa-lock"></i> Bị khoá</span>';
        }
        
        let actions = '';
        const safeName = (acc.ho_va_ten || '').replace(/'/g, "\\'");
        const safeUsername = (acc.username || '').replace(/'/g, "\\'");
        const safeEmail = (acc.email || '').replace(/'/g, "\\'");
        const infoBtn = `<button class="btn btn-sm btn-view" title="Xem chi tiết thông tin" onclick="openInfoModal('${safeName}', '${safeUsername}', '${safeEmail}')"><i class="fas fa-eye"></i></button>`;

        if (!acc.co_tai_khoan) {
            actions = `
                ${infoBtn}
                <button class="btn btn-sm btn-primary" onclick="openPwModal('${acc.id}', 'set')"><i class="fas fa-key"></i> Tạo TK</button>
            `;
        } else {
            const lockIcon = acc.trang_thai_tk === 'Hoạt động' ? 'fa-lock' : 'fa-unlock';
            const lockBtnColor = acc.trang_thai_tk === 'Hoạt động' ? 'var(--accent-red)' : '#28a745';
            actions = `
                ${infoBtn}
                <button class="btn btn-sm btn-view" style="color: var(--accent-orange); border-color: rgba(245, 158, 11, 0.2); background: rgba(245, 158, 11, 0.1);" title="Đặt lại mật khẩu" onclick="openPwModal('${acc.id}', 'reset')"><i class="fas fa-redo"></i></button>
                <button class="btn btn-sm" style="color:${lockBtnColor}; border-color:${lockBtnColor};" title="${acc.trang_thai_tk === 'Hoạt động' ? 'Khoá' : 'Mở khoá'}" onclick="toggleAccountStatus('${acc.id}')"><i class="fas ${lockIcon}"></i></button>
            `;
        }
        
        return `
            <tr>
                <td>${acc.id}</td>
                <td><strong>${acc.ho_va_ten}</strong><div style="font-size:12px;color:var(--text-muted);">${acc.hoc_vi||''}</div></td>
                <td>${acc.username || acc.email || '<i style="color:#ccc">Trống</i>'}</td>
                <td>${acc.bo_mon || ''}</td>
                <td>${statusBadge}</td>
                <td>${actions}</td>
            </tr>
        `;
    }).join('');
}

function filterAccounts() {
    const searchText = (document.getElementById('filterAccName')?.value || '').toLowerCase();
    const statusVal = document.getElementById('filterAccStatus')?.value || '';
    
    const filtered = allAccounts.filter(acc => {
        const matchSearch = (acc.ho_va_ten || '').toLowerCase().includes(searchText) || (acc.email || '').toLowerCase().includes(searchText) || (acc.username || '').toLowerCase().includes(searchText);
        let matchStatus = true;
        if (statusVal === 'co_tai_khoan') matchStatus = acc.co_tai_khoan;
        else if (statusVal === 'chua_co') matchStatus = !acc.co_tai_khoan;
        else if (statusVal) matchStatus = acc.co_tai_khoan && (acc.trang_thai_tk === statusVal);
        
        return matchSearch && matchStatus;
    });
    renderAccountsTable(filtered);
}

async function toggleAccountStatus(id) {
    if(!confirm('Bạn có chắc muốn thay đổi trạng thái tài khoản này?')) return;
    try {
        const res = await fetch(`${ADMIN_API_BASE}/accounts/${id}/toggle-status`, { method: 'PUT' });
        const data = await res.json();
        if(data.status === 'ok') loadAccounts();
        else alert(data.message);
    } catch(e) { console.error(e); }
}

function updateAccountStats() {
    const total = allAccounts.length;
    const haveAccount = allAccounts.filter(a => a.co_tai_khoan).length;
    const noAccount = total - haveAccount;
    const locked = allAccounts.filter(a => a.co_tai_khoan && a.trang_thai_tk !== 'Hoạt động').length;

    if(document.getElementById('statTotal')) document.getElementById('statTotal').innerText = total;
    if(document.getElementById('statActive')) document.getElementById('statActive').innerText = haveAccount;
    if(document.getElementById('statNoAccount')) document.getElementById('statNoAccount').innerText = noAccount;
    if(document.getElementById('statLocked')) document.getElementById('statLocked').innerText = locked;
}

// ============================================================
// AUTHENTICATION
// ============================================================

window.logoutAdmin = function() {
    localStorage.removeItem('isAdmin');
    window.location.href = '/';
};
