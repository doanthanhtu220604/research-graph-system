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

            { name: 'ma_gv', label: 'Mã giảng viên', type: 'text', required: true },

            { name: 'ho_va_ten', label: 'Họ và tên', type: 'text', required: true },

            { name: 'hoc_vi', label: 'Học vị', type: 'text' },

            { name: 'chuc_danh', label: 'Chức danh', type: 'text' },

            { name: 'chuc_vu', label: 'Chức vụ', type: 'text' },

            { name: 'bo_mon', label: 'Tên Bộ môn', type: 'select', options: [] },

            { name: 'email', label: 'Email', type: 'email' },

            { name: 'dien_thoai', label: 'Điện thoại', type: 'text' },

            { name: 'chuyen_nganh', label: 'Chuyên ngành', type: 'text' },

            { name: 'trang_thai_cong_tac', label: 'Trạng thái công tác', type: 'select', default: 'Đang công tác', options: [

                { value: 'Đang công tác', label: 'Đang công tác' },

                { value: 'Nghỉ hưu', label: 'Nghỉ hưu' },

                { value: 'Chuyển công tác', label: 'Chuyển công tác' },

                { value: 'Nghiên cứu sinh', label: 'Nghiên cứu sinh' }

            ]},

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
            { name: 'noi_xuat_ban', label: 'Nơi xuất bản', type: 'text' },

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

    },

    'bo-mon': {

        title: 'Bộ môn',

        apiUrl: `${ADMIN_API_BASE}/bo-mon`, // Admin can see all departments

        adminApiUrl: `${ADMIN_API_BASE}/bo-mon`,

        fields: [

            { name: 'ten_bo_mon', label: 'Tên Bộ môn', type: 'text', required: true }

        ]

    }

};



let currentEntitiesData = {};



document.addEventListener('DOMContentLoaded', () => {

    // Kiểm tra quyền truy cập Admin

    const userRole = localStorage.getItem('userRole');

    if (userRole !== 'admin') {

        window.location.href = '/user/login.html';

        return;

    }



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

    } else if (document.getElementById('page-admin-departments')) {

        loadDepartments();

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



    // Sidebar toggle (mobile)

    const menuToggle  = document.getElementById('menuToggle');

    const sidebar     = document.getElementById('sidebar');

    const mainContent = document.getElementById('mainContent');

    if (menuToggle && sidebar) {

        menuToggle.addEventListener('click', () => {

            sidebar.classList.toggle('collapsed');

            mainContent?.classList.toggle('expanded');

        });

    }



    // Tải badge số lượng thùng rác trên sidebar (áp dụng toàn bộ trang admin)

    updateTrashBadge();



    // Thêm nút Back to Top

    const bttBtn = document.createElement('button');

    bttBtn.className = 'back-to-top';

    bttBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';

    document.body.appendChild(bttBtn);



    if (mainContent) {

        mainContent.addEventListener('scroll', () => {

            if (mainContent.scrollTop > 300) {

                bttBtn.classList.add('visible');

            } else {

                bttBtn.classList.remove('visible');

            }

        });

    }



    bttBtn.addEventListener('click', () => {

        if (mainContent) {

            mainContent.scrollTo({ top: 0, behavior: 'smooth' });

        } else {

            window.scrollTo({ top: 0, behavior: 'smooth' });

        }

    });

    // Xử lý tham số tìm kiếm từ URL (khi nhảy từ chi tiết giảng viên sang)

    const urlParams = new URLSearchParams(window.location.search);

    const searchTerm = urlParams.get('search');

    if (searchTerm) {

        if (document.getElementById('page-admin-publications')) {

            const input = document.getElementById('filterPubTitle');

            if (input) input.value = searchTerm;

        } else if (document.getElementById('page-admin-projects')) {

            const input = document.getElementById('filterProjName');

            if (input) input.value = searchTerm;

        }

    }

});



function navigateToManage(type, name) {

    const pageMap = {

        'cong-trinh': 'publications.html',

        'de-tai': 'projects.html'

    };

    const page = pageMap[type];

    if (page) {

        window.location.href = `${page}?search=${encodeURIComponent(name)}`;

    }

}





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

        // Khớp đúng với template import giang-vien (11 cột, không có ID)

        csvContent += "ho_va_ten,ma_gv,hoc_vi,chuc_danh,chuc_vu,email,dien_thoai,chuyen_nganh,trang_thai_cong_tac,bo_mon,linh_vuc_nghien_cuu\n";

        const list = currentEntitiesData['giang-vien'] || [];

        list.forEach(gv => {

            const linhVuc = Array.isArray(gv.linh_vuc) ? gv.linh_vuc.join('|') : (gv.linh_vuc || '');

            csvContent += `"${gv.ho_va_ten || ''}","${gv.ma_gv || ''}","${gv.hoc_vi || ''}","${gv.chuc_danh || ''}","${gv.chuc_vu || ''}","${gv.email || ''}","${gv.dien_thoai || ''}","${gv.chuyen_nganh || ''}","${gv.trang_thai_cong_tac || ''}","${gv.bo_mon || ''}","${linhVuc}"\n`;

        });

        filename = "danh_sach_giang_vien.csv";

    } else if (document.getElementById('page-admin-publications')) {

        // Khớp đúng với template import cong-trinh (7 cột)

        csvContent += "ten_cong_trinh,nam_xuat_ban,tom_tat,trang_thai,link,tac_gia_giang_vien,tac_gia_ngoai\n";

        const list = currentEntitiesData['cong-trinh'] || [];

        list.forEach(ct => {

            const tacGiaGV = Array.isArray(ct.tac_gia) ? ct.tac_gia.join('|') : (ct.tac_gia || '');

            const tacGiaNgoai = Array.isArray(ct.tac_gia_ngoai) ? ct.tac_gia_ngoai.join('|') : (ct.tac_gia_ngoai || '');

            csvContent += `"${(ct.ten_cong_trinh || '').replace(/"/g, '""')}","${ct.nam_xuat_ban || ''}","${(ct.tom_tat || '').replace(/"/g, '""')}","${ct.trang_thai || ''}","${ct.link || ''}","${tacGiaGV}","${tacGiaNgoai}"\n`;

        });

        filename = "danh_sach_cong_trinh.csv";

    } else if (document.getElementById('page-admin-projects')) {

        // Khớp đúng với template import de-tai (10 cột)

        csvContent += "ten_de_tai,cap_de_tai,nam_bat_dau,nam_ket_thuc,tom_tat,trang_thai,link,chu_nhiem,thanh_vien,tac_gia_ngoai\n";

        const list = currentEntitiesData['de-tai'] || [];

        list.forEach(dt => {

            const chuNhiem = Array.isArray(dt.chu_nhiem) ? dt.chu_nhiem.join('|') : (dt.chu_nhiem || '');

            const thanhVien = Array.isArray(dt.thanh_vien) ? dt.thanh_vien.join('|') : (dt.thanh_vien || '');

            const tacGiaNgoai = Array.isArray(dt.tac_gia_ngoai) ? dt.tac_gia_ngoai.join('|') : (dt.tac_gia_ngoai || '');

            csvContent += `"${(dt.ten_de_tai || '').replace(/"/g, '""')}","${dt.cap_de_tai || ''}","${dt.nam_bat_dau || ''}","${dt.nam_ket_thuc || ''}","${(dt.tom_tat || '').replace(/"/g, '""')}","${dt.trang_thai || ''}","${dt.link || ''}","${chuNhiem}","${thanhVien}","${tacGiaNgoai}"\n`;

        });

        filename = "danh_sach_de_tai.csv";

    } else if (document.getElementById('page-admin-research-fields')) {

        csvContent += "ten_linh_vuc\n";

        const list = currentEntitiesData['linh-vuc'] || [];

        list.forEach((lv) => {

            csvContent += `"${(lv.ten_linh_vuc || '').replace(/"/g, '""')}"\n`;

        });

        filename = "danh_sach_linh_vuc.csv";

    } else if (document.getElementById('page-admin-external-authors')) {

        csvContent += "ho_va_ten,don_vi_cong_tac,hoc_vi,chuc_danh,chuc_vu,email\n";

        const list = currentEntitiesData['tac-gia-ngoai'] || [];

        list.forEach(tgn => {

            csvContent += `"${tgn.ho_va_ten || ''}","${tgn.don_vi_cong_tac || ''}","${tgn.hoc_vi || ''}","${tgn.chuc_danh || ''}","${tgn.chuc_vu || ''}","${tgn.email || ''}"\n`;

        });

        filename = "danh_sach_tac_gia_ngoai.csv";

    } else if (document.getElementById('page-admin-departments')) {

        // Khớp đúng với template import bo-mon (3 cột)

        csvContent += "ten_bo_mon,mo_ta,truong_bo_mon\n";

        const list = currentEntitiesData['bo-mon'] || [];

        list.forEach(bm => {

            csvContent += `"${bm.ten_bo_mon || ''}","${(bm.mo_ta || '').replace(/"/g, '""')}","${bm.truong_bo_mon || ''}"\n`;

        });

        filename = "danh_sach_bo_mon.csv";

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

            await loadFilterDepartments(); // Tải danh sách bộ môn vào bộ lọc

            filterLecturers(); // Áp dụng bộ lọc hiện tại thay vì render tất cả

        }

    } catch (err) {

        console.error(err);

    }

}



function renderLecturersTable(dataList) {

    const tbody = document.getElementById('adminLecturersBody');

    if (!tbody) return;

    

    if (dataList.length === 0) {

        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">Không tìm thấy giảng viên phù hợp.</td></tr>';

        return;

    }

    

    tbody.innerHTML = dataList.map((gv) => `

        <tr>

            <td>${gv.id || 'N/A'}</td>

            <td>${gv.ma_gv || 'N/A'}</td>

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

                ${gv.trang_thai_cong_tac === 'Đang công tác' ? '<span class="badge" style="background:#10b981;color:white;">Đang công tác</span>' : 

                  gv.trang_thai_cong_tac === 'Nghỉ hưu' ? '<span class="badge badge-gray">Nghỉ hưu</span>' : 

                  gv.trang_thai_cong_tac === 'Chuyển công tác' ? '<span class="badge" style="background:#f59e0b;color:white;">Chuyển công tác</span>' : 

                  gv.trang_thai_cong_tac === 'Nghiên cứu sinh' ? '<span class="badge badge-blue">Nghiên cứu sinh</span>' : 

                  '<span class="badge" style="background:#10b981;color:white;">Đang công tác</span>'}

            </td>

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

    const nameFilter = (document.getElementById('filterName')?.value || '').normalize('NFC').toLowerCase().trim();

    const deptFilter = document.getElementById('filterDepartment')?.value || '';

    const degreeFilter = document.getElementById('filterDegree')?.value || '';

    

    const filtered = list.filter(gv => {

        const name = (gv.ho_va_ten || '').normalize('NFC').toLowerCase();

        const matchName = name.includes(nameFilter);

        const matchDept = deptFilter === '' || (gv.bo_mon === deptFilter);

        const matchDegree = degreeFilter === '' || (gv.hoc_vi && gv.hoc_vi.includes(degreeFilter));

        return matchName && matchDept && matchDegree;

    });

    

    renderLecturersTable(filtered);

}



async function loadFilterDepartments() {

    const select = document.getElementById('filterDepartment');

    if (!select) return;

    

    try {

        const res = await fetch(`${ADMIN_API_BASE}/bo-mon`);

        const data = await res.json();

        if (data.status === 'ok') {

            const currentVal = select.value;

            let html = '<option value="">-- Chọn Bộ môn --</option>';

            data.data.forEach(bm => {

                html += `<option value="${bm.ten_bo_mon}">${bm.ten_bo_mon}</option>`;

            });

            select.innerHTML = html;

            select.value = currentVal;

        }

    } catch (e) {

        console.error('Lỗi tải bộ môn cho bộ lọc:', e);

    }

}



async function loadPublications() {

    try {

        const res = await fetch(ENTITY_CONFIG['cong-trinh'].apiUrl);

        const data = await res.json();

        

        if (data.status === 'ok') {

            currentEntitiesData['cong-trinh'] = data.data;

            populatePublicationYearFilter(data.data);

            filterPublications(); // Áp dụng bộ lọc hiện tại thay vì render tất cả

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

        else if (trangThai === 'Yêu cầu xóa')  { statusColor = '#e74c3c'; statusBg = 'rgba(231,76,60,0.1)'; }

        return `

        <tr>

            <td>${ct.id || 'N/A'}</td>

            <td><strong>${ct.ten_cong_trinh || 'N/A'}</strong></td>

            <td>${ct.nam_xuat_ban || ''}</td>

            <td><span style="background:${statusBg}; color:${statusColor}; border:1px solid ${statusColor}; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; white-space:nowrap;">${trangThai}</span></td>

            <td>

                ${trangThai === 'Chờ duyệt' ? `<button class="btn btn-sm" style="background:#28a745;color:#fff;border-color:#28a745;" title="Duyệt công trình" onclick="approvePublication('${ct.id}')"><i class="fas fa-check"></i></button>` : ''}

                ${trangThai === 'Yêu cầu xóa' ? `<button class="btn btn-sm" style="background:#e74c3c;color:#fff;border-color:#e74c3c;" title="Duyệt XÓA công trình" onclick="approveDeleteEntity('cong-trinh', '${ct.id}')"><i class="fas fa-trash-alt"></i></button>` : ''}

                <button class="btn btn-sm" style="background:#f39c12;color:#fff;border-color:#f39c12;" title="Xem chi tiết" onclick="viewPublicationStats('${ct.id}')"><i class="fas fa-eye"></i></button>

                <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('cong-trinh', '${ct.id}', ${originalIndex})"><i class="fas fa-edit"></i></button>

                ${ct.id ? `<button class="btn btn-sm" style="background:#17a2b8;color:#fff;border-color:#17a2b8;" title="Gán Tác giả" onclick="openRelationModal('cong-trinh', '${ct.id}')"><i class="fas fa-link"></i></button>` : ''}

                <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('cong-trinh', '${ct.id}')"><i class="fas fa-trash"></i></button>

            </td>

        </tr>

    `}).join('');

}



function filterPublications() {

    const list = currentEntitiesData['cong-trinh'] || [];

    const titleFilter = (document.getElementById('filterPubTitle')?.value || '').normalize('NFC').toLowerCase().trim();

    const yearFilter = document.getElementById('filterPubYear')?.value || '';

    

    const filtered = list.filter(ct => {

        const title = (ct.ten_cong_trinh || '').normalize('NFC').toLowerCase();

        const matchTitle = title.includes(titleFilter);

        const matchYear = yearFilter === '' || (ct.nam_xuat_ban == yearFilter);

        return matchTitle && matchYear;

    });

    

    renderPublicationsTable(filtered);

}



function populatePublicationYearFilter(data) {

    const select = document.getElementById('filterPubYear');

    if (!select) return;

    

    const years = new Set();

    data.forEach(ct => {

        if (ct.nam_xuat_ban) {

            const y = Number(String(ct.nam_xuat_ban).trim());

            if (!isNaN(y)) years.add(y);

        }

    });

    

    const sortedYears = Array.from(years).sort((a, b) => b - a);

    

    const currentVal = select.value;

    let html = '<option value="">-- Năm xuất bản --</option>';

    sortedYears.forEach(year => {

        html += `<option value="${year}">Năm ${year}</option>`;

    });

    select.innerHTML = html;

    select.value = currentVal;

}



async function approvePublication(id) {

    if (!confirm('Bạn có chắc muốn duyệt công trình này thành "Đang thực hiện"?')) return;

    try {

        const res = await fetch(`${ADMIN_API_BASE}/cong-trinh/${id}/approve`, {

            method: 'PUT'

        });

        const data = await res.json();

        if (data.status === 'ok') {

            const mainContent = document.getElementById('mainContent');

            const scrollPos = mainContent ? mainContent.scrollTop : 0;

            await loadPublications();

            if (mainContent) {

                setTimeout(() => {

                    mainContent.scrollTop = scrollPos;

                }, 10);

            }

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

            const mainContent = document.getElementById('mainContent');

            const scrollPos = mainContent ? mainContent.scrollTop : 0;

            await loadProjects();

            if (mainContent) {

                setTimeout(() => {

                    mainContent.scrollTop = scrollPos;

                }, 10);

            }

        } else {

            alert('Lỗi: ' + data.message);

        }

    } catch (err) {

        console.error(err);

        alert('Lỗi khi duyệt đề tài.');

    }

}



async function approveDeleteEntity(type, id) {

    if (!confirm('Bạn có chắc muốn phê duyệt yêu cầu XÓA của giảng viên? Mục này sẽ được chuyển vào Thùng rác của hệ thống.')) return;

    try {

        const res = await fetch(`${ADMIN_API_BASE}/${type}/${id}/approve-delete`, {

            method: 'PUT'

        });

        const data = await res.json();

        if (data.status === 'ok') {

            const mainContent = document.getElementById('mainContent');

            const scrollPos = mainContent ? mainContent.scrollTop : 0;

            

            if (type === 'cong-trinh') await loadPublications();

            else if (type === 'de-tai') await loadProjects();

            

            if (mainContent) {

                setTimeout(() => {

                    mainContent.scrollTop = scrollPos;

                }, 10);

            }

        } else {

            alert('Lỗi: ' + data.message);

        }

    } catch (err) {

        console.error(err);

        alert('Lỗi khi phê duyệt xóa.');

    }

}



async function loadProjects() {

    try {

        const res = await fetch(ENTITY_CONFIG['de-tai'].apiUrl);

        const data = await res.json();

        

        if (data.status === 'ok') {

            currentEntitiesData['de-tai'] = data.data;

            populateProjectYearFilter(data.data);

            populateProjectLevelFilter(data.data);

            filterProjects(); // Áp dụng bộ lọc hiện tại

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

        else if (trangThai === 'Yêu cầu xóa')  { statusColor = '#e74c3c'; statusBg = 'rgba(231,76,60,0.1)'; }

        return `

        <tr>

            <td>${dt.id || 'N/A'}</td>

            <td><strong>${dt.ten_de_tai || 'N/A'}</strong></td>

            <td>${dt.cap_de_tai || ''}</td>

            <td>${namThucHien}</td>

            <td><span style="background:${statusBg}; color:${statusColor}; border:1px solid ${statusColor}; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; white-space:nowrap;">${trangThai}</span></td>

            <td>

                ${trangThai === 'Chờ duyệt' ? `<button class="btn btn-sm" style="background:#28a745;color:#fff;border-color:#28a745;" title="Duyệt đề tài" onclick="approveProject('${dt.id}')"><i class="fas fa-check"></i></button>` : ''}

                ${trangThai === 'Yêu cầu xóa' ? `<button class="btn btn-sm" style="background:#e74c3c;color:#fff;border-color:#e74c3c;" title="Duyệt XÓA đề tài" onclick="approveDeleteEntity('de-tai', '${dt.id}')"><i class="fas fa-trash-alt"></i></button>` : ''}

                <button class="btn btn-sm" style="background:#f39c12;color:#fff;border-color:#f39c12;" title="Xem chi tiết" onclick="viewProjectStats('${dt.id}')"><i class="fas fa-eye"></i></button>

                <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('de-tai', '${dt.id}', ${originalIndex})"><i class="fas fa-edit"></i></button>

                ${dt.id ? `<button class="btn btn-sm" style="background:#17a2b8;color:#fff;border-color:#17a2b8;" title="Gán Chủ nhiệm/Thành viên" onclick="openRelationModal('de-tai', '${dt.id}')"><i class="fas fa-link"></i></button>` : ''}

                <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('de-tai', '${dt.id}')"><i class="fas fa-trash"></i></button>

            </td>

        </tr>

    `}).join('');

}



function filterProjects() {

    const list = currentEntitiesData['de-tai'] || [];

    const nameFilter = (document.getElementById('filterProjName')?.value || '').normalize('NFC').toLowerCase().trim();

    const levelFilter = document.getElementById('filterProjLevel')?.value || '';

    const yearFilter = document.getElementById('filterProjYear')?.value || '';

    

    const filtered = list.filter(dt => {

        const title = (dt.ten_de_tai || '').normalize('NFC').toLowerCase();

        const matchName = title.includes(nameFilter);

        const matchLevel = levelFilter === '' || (dt.cap_de_tai === levelFilter);

        const matchYear = yearFilter === '' || (dt.nam_bat_dau == yearFilter || dt.nam_ket_thuc == yearFilter);

        return matchName && matchLevel && matchYear;

    });

    

    renderProjectsTable(filtered);

}



function populateProjectYearFilter(data) {

    const select = document.getElementById('filterProjYear');

    if (!select) return;

    

    const currentVal = select.value;

    

    const years = new Set();

    data.forEach(dt => {

        if (dt.nam_bat_dau) {

            const y = Number(String(dt.nam_bat_dau).trim());

            if (!isNaN(y)) years.add(y);

        }

        if (dt.nam_ket_thuc) {

            const y = Number(String(dt.nam_ket_thuc).trim());

            if (!isNaN(y)) years.add(y);

        }

    });

    

    const sortedYears = Array.from(years).sort((a, b) => b - a);

    

    let html = '<option value="">-- Năm thực hiện --</option>';

    sortedYears.forEach(year => {

        html += `<option value="${year}">Năm ${year}</option>`;

    });

    select.innerHTML = html;

    select.value = currentVal;

}



function populateProjectLevelFilter(data) {

    const select = document.getElementById('filterProjLevel');

    if (!select) return;

    

    const currentVal = select.value;

    

    const levels = new Set();

    data.forEach(dt => {

        if (dt.cap_de_tai && dt.cap_de_tai.trim() !== '') {

            levels.add(dt.cap_de_tai.trim());

        }

    });

    

    const sortedLevels = Array.from(levels).sort();

    

    let html = '<option value="">-- Cấp đề tài --</option>';

    sortedLevels.forEach(level => {

        html += `<option value="${level}">${level}</option>`;

    });

    select.innerHTML = html;

    

    if (sortedLevels.includes(currentVal)) {

        select.value = currentVal;

    } else {

        select.value = "";

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

            filterExternalAuthors(); // Áp dụng bộ lọc

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

    

    tbody.innerHTML = dataList.map((tgn) => {

        const originalIndex = currentEntitiesData['tac-gia-ngoai'].indexOf(tgn);

        return `

        <tr>

            <td>${tgn.id || 'N/A'}</td>

            <td><strong>${tgn.ho_va_ten || 'N/A'}</strong></td>

            <td>${tgn.don_vi_cong_tac || ''}</td>

            <td>${[tgn.hoc_vi, tgn.chuc_danh].filter(Boolean).join(' / ')}</td>

            <td>

                <button class="btn btn-sm" style="background:#f39c12;color:#fff;border-color:#f39c12;" title="Xem chi tiết tham gia" onclick="viewExternalAuthorDetail('${tgn.id}')"><i class="fas fa-eye"></i></button>

                <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('tac-gia-ngoai', '${tgn.id}', ${originalIndex})"><i class="fas fa-edit"></i></button>

                <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('tac-gia-ngoai', '${tgn.id}')"><i class="fas fa-trash"></i></button>

            </td>

        </tr>

    `}).join('');

}



function filterExternalAuthors() {

    const list = currentEntitiesData['tac-gia-ngoai'] || [];

    const nameFilter = (document.getElementById('filterTgnName')?.value || '').toLowerCase();

    

    const filtered = list.filter(tgn => {

        return (tgn.ho_va_ten || '').toLowerCase().includes(nameFilter);

    });

    

    renderExternalAuthorsTable(filtered);

}



async function loadDepartments() {

    try {

        const res = await fetch(ENTITY_CONFIG['bo-mon'].apiUrl);

        const data = await res.json();

        const tbody = document.getElementById('adminDepartmentsBody');

        

        if (data.status === 'ok') {

            currentEntitiesData['bo-mon'] = data.data;

            if (tbody) {

                tbody.innerHTML = data.data.map((bm, i) => `

                    <tr>

                        <td>${bm.id || i+1}</td>

                        <td><strong>${bm.ten_bo_mon || 'N/A'}</strong></td>

                        <td>

                            <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('bo-mon', '${bm.id}', ${i})"><i class="fas fa-edit"></i></button>

                            <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('bo-mon', '${bm.id}')"><i class="fas fa-trash"></i></button>

                        </td>

                    </tr>

                `).join('');

            }

        }

    } catch (err) {

        console.error(err);

    }

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

            let optionsHtml = f.options.map(opt => `<option value="${opt.value}"${defaultVal === opt.value ? ' selected' : ''}>${opt.label}</option>`).join('');

            

            // Nếu là trường bộ môn và chưa có options (do fetch động)

            if (f.name === 'bo_mon' && f.options.length === 0) {

                optionsHtml = '<option value="">-- Đang tải bộ môn... --</option>';

            }

            

            inputHtml = `<select id="field_${f.name}" name="${f.name}" ${f.required ? 'required' : ''}>${optionsHtml}</select>`;

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



    document.getElementById('adminModalTitle').textContent = `Thêm mới ${config.title}`;

    

    if (id) {

        document.getElementById('adminModalTitle').textContent = `Chỉnh sửa ${config.title} (#${id})`;

        

        let item = null;

        if (currentEntitiesData[type]) {

            // Ưu tiên tìm theo ID để tránh sai sót khi đang lọc/sắp xếp danh sách

            item = currentEntitiesData[type].find(x => x.id == id);

            

            // Nếu không tìm thấy theo ID (trường hợp hiếm) thì mới dùng index

            if (!item && index !== null && currentEntitiesData[type][index]) {

                item = currentEntitiesData[type][index];

            }

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



    // Tải bộ môn động cho Giảng viên

    if (type === 'giang-vien') {

        try {

            const res = await fetch(`${ADMIN_API_BASE}/bo-mon`);

            const data = await res.json();

            const selectBM = document.getElementById('field_bo_mon');

            if (selectBM && data.status === 'ok') {

                let html = '<option value="">-- Chọn Bộ môn --</option>';

                data.data.forEach(bm => {

                    html += `<option value="${bm.ten_bo_mon}">${bm.ten_bo_mon}</option>`;

                });

                selectBM.innerHTML = html;

                

                // Khôi phục giá trị nếu đang edit

                if (id) {

                    let item = currentEntitiesData[type].find(x => x.id == id);

                    if (item) selectBM.value = item.bo_mon || '';

                }

            }

        } catch (e) { console.error('Lỗi tải bộ môn:', e); }

    }



    // Thêm phần chọn Tác giả cho Công trình khi THÊM MỚI

    if (type === 'cong-trinh' && !id) {

        container.insertAdjacentHTML('beforeend', `

        <div class="form-group" id="authorPickerGroup">

            <label>Tác giả <span style="color:var(--text-muted); font-size:12px; font-weight:normal;">(có thể chọn sau)</span></label>

            <div style="display:flex; gap:12px; flex-wrap:wrap;">

                <div style="flex:1; min-width:200px;">

                    <p style="font-size:13px; font-weight:600; color:var(--accent-blue); margin-bottom:6px;">

                        <i class="fas fa-user-tie"></i> Tác giả chính

                    </p>

                    <div id="tacGiaChinhPickerList" style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); border-radius:6px; padding:10px;">

                        <p style="color:var(--text-muted); font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>

                    </div>

                </div>

                <div style="flex:1; min-width:200px;">

                    <p style="font-size:13px; font-weight:600; color:#10b981; margin-bottom:6px;">

                        <i class="fas fa-users"></i> Đồng tác giả

                    </p>

                    <div id="congSuPickerList" style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); border-radius:6px; padding:10px;">

                        <p style="color:var(--text-muted); font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>

                    </div>

                </div>

            </div>

        </div>`);



        container.insertAdjacentHTML('beforeend', `

        <div class="form-group" style="margin-top: 20px;">

            <p style="font-size:13px; font-weight:600; color:#e67e22; margin-bottom:6px;">

                <i class="fas fa-user-friends"></i> Tác giả ngoài

            </p>

            <div id="tgnPickerList_ct" style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); border-radius:6px; padding:10px;">

                <p style="color:var(--text-muted); font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>

            </div>

        </div>`);

        try {

            const [gvRes, tgnRes] = await Promise.all([

                fetch(`${API_BASE}/giang-vien`),

                fetch(`${ADMIN_API_BASE}/tac-gia-ngoai`)

            ]);

            const gvData = await gvRes.json();

            const tgnData = await tgnRes.json();

            const allGVs = gvData.data || [];

            const allTGNs = tgnData.data || [];

            

            const tgcEl = document.getElementById('tacGiaChinhPickerList');

            const csEl = document.getElementById('congSuPickerList');

            if (allGVs.length === 0) {

                tgcEl.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Không có giảng viên nào.</p>';

                csEl.innerHTML = tgcEl.innerHTML;

            } else {

                const rowsHtml = (name) => allGVs.map(gv => `

                    <div style="margin-bottom:8px;">

                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary);">

                            <input type="checkbox" name="${name}" value="${gv.id}">

                            <span style="font-size:13px;">${gv.ho_va_ten}${gv.bo_mon ? '<br><span style="color:var(--text-muted);font-size:11px;">' + gv.bo_mon + '</span>' : ''}</span>

                        </label>

                    </div>`).join('');

                tgcEl.innerHTML = rowsHtml('gv_tac_gia_chinh_new');

                csEl.innerHTML = rowsHtml('gv_cong_su_new');

            }



            const tgnEl = document.getElementById('tgnPickerList_ct');

            if (tgnEl) {

                if (allTGNs.length === 0) {

                    tgnEl.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Không có tác giả ngoài nào.</p>';

                } else {

                    tgnEl.innerHTML = allTGNs.map(tgn => `

                        <div style="margin-bottom: 8px; display:inline-block; width:48%; min-width:200px;">

                            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary); font-size:13px;">

                                <input type="checkbox" name="tgn_ids_new" value="${tgn.id}">

                                <span>${tgn.ho_va_ten} <small style="color:var(--text-muted)">(${tgn.don_vi_cong_tac || 'N/A'})</small></span>

                            </label>

                        </div>

                    `).join('');

                }

            }

        } catch (e) {

            document.getElementById('tacGiaChinhPickerList').innerHTML = '<p style="color:red;font-size:13px;">Lỗi tải dữ liệu.</p>';

            document.getElementById('congSuPickerList').innerHTML = '<p style="color:red;font-size:13px;">Lỗi tải dữ liệu.</p>';

            if (document.getElementById('tgnPickerList_ct')) {

                document.getElementById('tgnPickerList_ct').innerHTML = '<p style="color:red;font-size:13px;">Lỗi tải dữ liệu.</p>';

            }

        }

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



        container.insertAdjacentHTML('beforeend', `

        <div class="form-group" style="margin-top: 20px;">

            <p style="font-size:13px; font-weight:600; color:#e67e22; margin-bottom:6px;">

                <i class="fas fa-user-friends"></i> Tác giả ngoài

            </p>

            <div id="tgnPickerList_dt" style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); border-radius:6px; padding:10px;">

                <p style="color:var(--text-muted); font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>

            </div>

        </div>`);

        try {

            const [gvRes, tgnRes] = await Promise.all([

                fetch(`${API_BASE}/giang-vien`),

                fetch(`${ADMIN_API_BASE}/tac-gia-ngoai`)

            ]);

            const gvData = await gvRes.json();

            const tgnData = await tgnRes.json();

            const allGVs = gvData.data || [];

            const allTGNs = tgnData.data || [];

            

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



            const tgnEl = document.getElementById('tgnPickerList_dt');

            if (tgnEl) {

                if (allTGNs.length === 0) {

                    tgnEl.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Không có tác giả ngoài nào.</p>';

                } else {

                    tgnEl.innerHTML = allTGNs.map(tgn => `

                        <div style="margin-bottom: 8px; display:inline-block; width:48%; min-width:200px;">

                            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary); font-size:13px;">

                                <input type="checkbox" name="tgn_ids_new" value="${tgn.id}">

                                <span>${tgn.ho_va_ten} <small style="color:var(--text-muted)">(${tgn.don_vi_cong_tac || 'N/A'})</small></span>

                            </label>

                        </div>

                    `).join('');

                }

            }

        } catch (e) {

            document.getElementById('chuNhiemPickerList').innerHTML = '<p style="color:red;font-size:13px;">Lỗi tải dữ liệu.</p>';

            document.getElementById('thamGiaPickerList').innerHTML = '<p style="color:red;font-size:13px;">Lỗi tải dữ liệu.</p>';

            if (document.getElementById('tgnPickerList_dt')) {

                document.getElementById('tgnPickerList_dt').innerHTML = '<p style="color:red;font-size:13px;">Lỗi tải dữ liệu.</p>';

            }

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

        const tgcChecked = document.querySelectorAll('input[name="gv_tac_gia_chinh_new"]:checked');

        const csChecked = document.querySelectorAll('input[name="gv_cong_su_new"]:checked');

        formData.tac_gia_chinh_ids = Array.from(tgcChecked).map(cb => cb.value);

        formData.cong_su_ids = Array.from(csChecked).map(cb => cb.value);

        

        const tgnChecked = document.querySelectorAll('input[name="tgn_ids_new"]:checked');

        formData.tac_gia_ngoai_ids = Array.from(tgnChecked).map(cb => cb.value);

    }



    // Thu thập Chủ nhiệm và Thành viên khi THÊM MỚI đề tài

    if (type === 'de-tai' && !id) {

        const cnChecked = document.querySelectorAll('input[name="gv_chu_nhiem_new"]:checked');

        const tgChecked = document.querySelectorAll('input[name="gv_tham_gia_new"]:checked');

        formData.chu_nhiem_ids = Array.from(cnChecked).map(cb => cb.value);

        formData.tham_gia_ids  = Array.from(tgChecked).map(cb => cb.value);

        

        const tgnChecked = document.querySelectorAll('input[name="tgn_ids_new"]:checked');

        formData.tac_gia_ngoai_ids = Array.from(tgnChecked).map(cb => cb.value);

    }



    try {

        const method = id ? 'PUT' : 'POST';

        const url = id ? `${config.adminApiUrl}/${id}` : config.adminApiUrl;



        // Lưu vị trí cuộn trước khi tải lại dữ liệu

        const mainContent = document.getElementById('mainContent');

        const scrollPos = mainContent ? mainContent.scrollTop : 0;



        const res = await fetch(url, {

            method: method,

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify(formData)

        });

        

        const data = await res.json();

        if (data.status === 'ok') {

            closeAdminModal();

            // Tải lại đúng trang đang đứng

            if (type === 'giang-vien') await loadLecturers();

            else if (type === 'cong-trinh') await loadPublications();

            else if (type === 'de-tai') await loadProjects();

            else if (type === 'linh-vuc') await loadResearchFields();

            else if (type === 'tac-gia-ngoai') await loadExternalAuthors();

            else if (type === 'bo-mon') await loadDepartments();



            // Khôi phục vị trí cuộn

            if (mainContent) {

                // Đợi một chút để DOM ổn định (đặc biệt nếu có hình ảnh)

                setTimeout(() => {

                    mainContent.scrollTop = scrollPos;

                }, 10);

            }

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



    const typeLabels = {

        'giang-vien': 'Giảng viên',

        'cong-trinh': 'Công trình',

        'de-tai':     'Đề tài',

        'linh-vuc':   'Lĩnh vực',

        'tac-gia-ngoai': 'Tác giả ngoài',

    };



    // Tạo modal xác nhận xóa mềm nếu chưa có

    if (!document.getElementById('softDeleteOverlay')) {

        const overlayHtml = `

        <div id="softDeleteOverlay" style="

            position:fixed; inset:0; background:rgba(0,0,0,0.45); backdrop-filter:blur(4px);

            z-index:9100; display:flex; align-items:center; justify-content:center;

            opacity:0; pointer-events:none; transition:opacity 0.2s;">

            <div style="background: var(--bg-secondary, #ffffff); border-radius:20px; padding:32px; max-width:420px; width:90%;

                        box-shadow: 0 15px 50px rgba(0,0,0,0.15); transform:scale(0.92);

                        transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1);" id="softDeleteBox">

                <div style="width:60px;height:60px;border-radius:50%;

                            background:linear-gradient(135deg,rgba(239,68,68,0.12),rgba(239,68,68,0.04));

                            display:flex;align-items:center;justify-content:center;

                            font-size:24px;color:#ef4444;margin:0 auto 16px;">

                    <i class="fas fa-trash-alt"></i>

                </div>

                <h3 style="font-size:17px;text-align:center;margin:0 0 8px;">Chuyển vào thùng rác?</h3>

                <p id="softDeleteDesc" style="font-size:13px;color:var(--text-muted);text-align:center;margin:0 0 18px;"></p>

                <div style="margin-bottom:18px;">

                    <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px;">

                        Ghi chú lý do (tùy chọn)

                    </label>

                    <input type="text" id="softDeleteNote"

                        placeholder="VD: Giảng viên đã nghỉ hưu, dữ liệu trùng lặp..."

                        style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:10px;

                               font-family:'Inter',sans-serif;font-size:13px;outline:none;

                               background:var(--bg-hover);color:var(--text-primary);">

                </div>

                <p style="font-size:11px;color:var(--text-muted);text-align:center;margin:0 0 20px;">

                    <i class="fas fa-info-circle" style="color:#4F8EF7;"></i>

                    Dữ liệu sẽ được lưu trong <a href="trash.html" style="color:#4F8EF7;font-weight:600;">Thùng rác</a>

                    và có thể khôi phục bất cứ lúc nào.

                </p>

                <div style="display:flex;gap:12px;justify-content:center;">

                    <button onclick="closeSoftDeleteModal()"

                        style="padding:10px 24px;border-radius:10px;background:var(--bg-hover);

                               border:1px solid var(--border-color);font-family:'Inter',sans-serif;

                               font-size:13px;font-weight:600;color:var(--text-secondary);cursor:pointer;">

                        Hủy

                    </button>

                    <button id="softDeleteConfirmBtn"

                        style="padding:10px 24px;border-radius:10px;

                               background:linear-gradient(135deg,#ef4444,#dc2626);

                               border:none;color:white;font-family:'Inter',sans-serif;

                               font-size:13px;font-weight:600;cursor:pointer;

                               box-shadow:0 4px 12px rgba(239,68,68,0.3);">

                        <i class="fas fa-trash-alt"></i> Xóa (vào thùng rác)

                    </button>

                </div>

            </div>

        </div>`;

        document.body.insertAdjacentHTML('beforeend', overlayHtml);

    }



    // Điền thông tin vào modal

    const label = typeLabels[type] || type;

    document.getElementById('softDeleteDesc').innerHTML =

        `<strong>${label} #${id}</strong> sẽ được chuyển vào thùng rác.<br>Bạn có thể khôi phục sau nếu cần.`;

    document.getElementById('softDeleteNote').value = '';



    // Gán handler

    const confirmBtn = document.getElementById('softDeleteConfirmBtn');

    confirmBtn.onclick = async () => {

        const note = document.getElementById('softDeleteNote').value.trim();

        closeSoftDeleteModal();



        const config = ENTITY_CONFIG[type];

        try {

            // Lưu vị trí cuộn

            const mainContent = document.getElementById('mainContent');

            const scrollPos = mainContent ? mainContent.scrollTop : 0;



            const res = await fetch(`${config.adminApiUrl}/${id}`, {

                method: 'DELETE',

                headers: { 'Content-Type': 'application/json' },

                body: JSON.stringify({ note })

            });

            const data = await res.json();

            if (data.status === 'ok') {

                // Hiện toast thành công

                showAdminToast(`✅ Đã chuyển ${label} vào thùng rác`, 'success');

                if (type === 'giang-vien') await loadLecturers();

                else if (type === 'cong-trinh') await loadPublications();

                else if (type === 'de-tai') await loadProjects();

                else if (type === 'linh-vuc') await loadResearchFields();

                else if (type === 'tac-gia-ngoai') await loadExternalAuthors();

                else if (type === 'bo-mon') await loadDepartments();

                

                // Khôi phục vị trí cuộn

                if (mainContent) {

                    setTimeout(() => {

                        mainContent.scrollTop = scrollPos;

                    }, 10);

                }



                // Cập nhật badge thùng rác

                updateTrashBadge();

            } else {

                showAdminToast('Lỗi: ' + data.message, 'error');

            }

        } catch (err) {

            console.error(err);

            showAdminToast('Có lỗi xảy ra khi xóa dữ liệu.', 'error');

        }

    };



    // Mở modal

    const overlay = document.getElementById('softDeleteOverlay');

    overlay.style.pointerEvents = 'auto';

    overlay.style.opacity = '1';

    document.getElementById('softDeleteBox').style.transform = 'scale(1)';



    // Close on outside click

    overlay.onclick = (e) => { if (e.target === overlay) closeSoftDeleteModal(); };

}



function closeSoftDeleteModal() {

    const overlay = document.getElementById('softDeleteOverlay');

    if (!overlay) return;

    overlay.style.opacity = '0';

    overlay.style.pointerEvents = 'none';

    document.getElementById('softDeleteBox').style.transform = 'scale(0.92)';

}



// ─── Admin Toast ──────────────────────────────────────────────

function showAdminToast(msg, type = 'success') {

    let container = document.getElementById('adminToastContainer');

    if (!container) {

        container = document.createElement('div');

        container.id = 'adminToastContainer';

        container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;';

        document.body.appendChild(container);

    }

    const colors = { success: 'linear-gradient(135deg,#10b981,#059669)', error: 'linear-gradient(135deg,#ef4444,#dc2626)', info: 'linear-gradient(135deg,#4F8EF7,#3b82f6)' };

    const icons  = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };

    const toast = document.createElement('div');

    toast.style.cssText = `padding:14px 20px;border-radius:12px;font-size:13px;font-weight:500;color:white;

        display:flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,0.15);min-width:260px;

        background:${colors[type]||colors.info};animation:slideInRight 0.3s ease;font-family:'Inter',sans-serif;`;

    toast.innerHTML = `<i class="fas ${icons[type]||'fa-bell'}"></i> ${msg}`;

    container.appendChild(toast);

    setTimeout(() => { toast.style.opacity='0'; toast.style.transition='opacity 0.4s'; setTimeout(()=>toast.remove(), 400); }, 3500);

}



// ─── Update trash badge on sidebar ───────────────────────────

async function updateTrashBadge() {

    try {

        const res  = await fetch('/api/admin/trash/count');

        const data = await res.json();

        const badge = document.getElementById('trashNavBadge');

        if (badge && data.status === 'ok') {

            badge.textContent = data.count;

            badge.style.display = data.count > 0 ? 'inline' : 'none';

        }

    } catch (_) {}

}



// ============================================================

// QUẢN LÝ LIÊN KẾT (RELATIONSHIP MANAGEMENT)

// ============================================================



async function openRelationModal(type, entityId, entityName = null) {

    // Styles cho nút chuyển đổi vai trò

    if (!document.getElementById('role-toggle-styles')) {

        const style = document.createElement('style');

        style.id = 'role-toggle-styles';

        style.textContent = `

            .role-item-row {

                position: relative;

                padding: 8px;

                border-radius: 6px;

                transition: background 0.2s;

            }

            .role-item-row:hover {

                background: rgba(79, 142, 247, 0.05);

            }

            .btn-role-switch {

                position: absolute;

                right: 10px;

                top: 50%;

                transform: translateY(-50%);

                display: none;

                padding: 4px 10px;

                font-size: 11px;

                background: var(--accent-blue);

                color: white;

                border: none;

                border-radius: 4px;

                cursor: pointer;

                z-index: 10;

                box-shadow: 0 2px 4px rgba(0,0,0,0.1);

            }

            .role-item-row:hover .btn-role-switch {

                display: block;

            }

            .btn-role-switch:hover {

                filter: brightness(1.1);

            }

        `;

        document.head.appendChild(style);

    }

    if (!document.getElementById('adminRelationModalOverlay')) {

        createRelationModalHtml();

    }

    

    // Nếu không có entityName, tìm trong dữ liệu hiện tại

    if (!entityName && currentEntitiesData[type]) {

        const item = currentEntitiesData[type].find(x => x.id === entityId);

        if (item) {

            entityName = item.ten_cong_trinh || item.ten_de_tai || item.ho_va_ten || 'N/A';

        }

    }



    document.getElementById('relEntityType').value = type;

    document.getElementById('relEntityId').value = entityId;

    document.getElementById('adminRelationModalTitle').textContent = `Liên kết: ${entityName || 'N/A'}`;

    document.getElementById('adminRelationModalOverlay').classList.add('active');

    document.getElementById('relFormBody').innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Đang tải danh sách nhân sự...</p>';

    

    try {

        // Tải danh sách tất cả giảng viên và tác giả ngoài

        const [gvRes, tgnRes] = await Promise.all([

            fetch(`${API_BASE}/giang-vien`),

            fetch(`${ADMIN_API_BASE}/tac-gia-ngoai`)

        ]);

        const gvData = await gvRes.json();

        const tgnData = await tgnRes.json();

        const allGVs = gvData.data || [];

        const allTGNs = tgnData.data || [];

        

        if (type === 'cong-trinh') {

            // Tải các liên kết hiện tại

            const [relGvRes, relTgnRes] = await Promise.all([

                fetch(`${ADMIN_API_BASE}/relations/cong-trinh/${entityId}/giang-vien`),

                fetch(`${ADMIN_API_BASE}/relations/cong-trinh/${entityId}/tac-gia-ngoai`)

            ]);

            const relGvData = await relGvRes.json();

            const relTgnData = await relTgnRes.json();

            

            // Phân loại vai trò (hỗ trợ cả LA_TAC_GIA_CUA cũ)
            // Phân loại vai trò (hỗ trợ cả LA_TAC_GIA_CUA cũ)

            const tacGiaChinhIds = (relGvData.data || []).filter(r => r.vai_tro === 'TAC_GIA_CHINH').map(r => r.id);

            const congSuIds = (relGvData.data || []).filter(r => r.vai_tro === 'CONG_SU' || r.vai_tro === 'LA_TAC_GIA_CUA').map(r => r.id);

            // Phân loại vai trò tác giả ngoài

            const tgnTacGiaChinhIds = (relTgnData.data || []).filter(r => r.vai_tro === 'TAC_GIA_CHINH').map(r => r.id);

            const tgnCongSuIds = (relTgnData.data || []).filter(r => r.vai_tro === 'CONG_SU' || r.vai_tro === 'LA_TAC_GIA_CUA' || r.vai_tro === 'DONG_TAC_GIA').map(r => r.id);

            let html = `

            <div style="display:flex; flex-direction:column; gap: 24px;">

                <!-- Section 1: Giảng viên nội bộ -->

                <div style="background: rgba(79, 142, 247, 0.05); padding: 15px; border-radius: 10px; border-left: 4px solid var(--accent-blue);">

                    <h3 style="font-size: 14px; margin-bottom: 15px; display:flex; align-items:center; gap:8px;"><i class="fas fa-university"></i> NHÂN SỰ TRONG TRƯỜNG</h3>

                    <div style="display:flex; gap: 20px; flex-wrap: wrap;">

                        <div style="flex:1; min-width: 280px;">

                            <p style="margin-bottom:10px; color:var(--accent-blue);"><b><i class="fas fa-user-tie"></i> Tác giả chính (nội bộ):</b></p>

                            <div style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; background:white;">

                            ${allGVs.map(gv => {

                                const checked = tacGiaChinhIds.includes(gv.id);

                                return `

                                    <div class="role-item-row" id="row-main-${gv.id}">

                                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary); font-size:13px; margin:0;">

                                            <input type="checkbox" name="gv_tac_gia_chinh" value="${gv.id}" ${checked ? 'checked' : ''} onchange="syncRoleCheckbox('${gv.id}', 'main')">

                                            <span>${gv.ho_va_ten}</span>

                                        </label>

                                        ${checked ? `<button type="button" class="btn-role-switch" onclick="switchAuthorRole('${gv.id}', 'main')"><i class="fas fa-exchange-alt"></i> Sang Đồng tác giả</button>` : ''}

                                    </div>

                                `;

                            }).join('')}

                            </div>

                        </div>

                        <div style="flex:1; min-width: 280px;">

                            <p style="margin-bottom:10px; color:#10b981;"><b><i class="fas fa-users"></i> Đồng tác giả (nội bộ):</b></p>

                            <div style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; background:white;">

                            ${allGVs.map(gv => {

                                const checked = congSuIds.includes(gv.id);

                                return `

                                    <div class="role-item-row" id="row-collab-${gv.id}">

                                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary); font-size:13px; margin:0;">

                                            <input type="checkbox" name="gv_cong_su" value="${gv.id}" ${checked ? 'checked' : ''} onchange="syncRoleCheckbox('${gv.id}', 'collab')">

                                            <span>${gv.ho_va_ten}</span>

                                        </label>

                                        ${checked ? `<button type="button" class="btn-role-switch" onclick="switchAuthorRole('${gv.id}', 'collab')"><i class="fas fa-exchange-alt"></i> Sang Tác giả chính</button>` : ''}

                                    </div>

                                `;

                            }).join('')}

                            </div>

                        </div>

                    </div>

                </div>

                <!-- Section 2: Tác giả ngoài -->

                <div style="background: rgba(230, 126, 34, 0.05); padding: 15px; border-radius: 10px; border-left: 4px solid #e67e22;">

                    <h3 style="font-size: 14px; margin-bottom: 15px; display:flex; align-items:center; gap:8px; color: #e67e22;"><i class="fas fa-globe"></i> NHÂN SỰ NGOÀI TRƯỜNG</h3>

                    <div style="display:flex; gap: 20px; flex-wrap: wrap;">

                        <div style="flex:1; min-width: 280px;">

                            <p style="margin-bottom:10px; color:#e67e22;"><b><i class="fas fa-user-shield"></i> Tác giả chính ngoài:</b></p>

                            <div style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; background:white;">

                                ${allTGNs.map(tgn => {

                                    const checked = tgnTacGiaChinhIds.includes(tgn.id);

                                    return `

                                        <div class="role-item-row" id="row-tgn-main-${tgn.id}">

                                            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary); font-size:13px; margin:0;">

                                                <input type="checkbox" name="tgn_tac_gia_chinh" value="${tgn.id}" ${checked ? 'checked' : ''} onchange="syncTgnPubRoleCheckbox('${tgn.id}', 'main')">

                                                <span>${tgn.ho_va_ten} <small style="color:var(--text-muted)">(${tgn.don_vi_cong_tac || 'N/A'})</small></span>

                                            </label>

                                            ${checked ? `<button type="button" class="btn-role-switch" onclick="switchTgnPubRole('${tgn.id}', 'main')"><i class="fas fa-exchange-alt"></i> Sang Đồng tác giả</button>` : ''}

                                        </div>

                                    `;

                                }).join('')}

                            </div>

                        </div>

                        <div style="flex:1; min-width: 280px;">

                            <p style="margin-bottom:10px; color:#8b5cf6;"><b><i class="fas fa-users"></i> Đồng tác giả ngoài:</b></p>

                            <div style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; background:white;">

                                ${allTGNs.map(tgn => {

                                    const checked = tgnCongSuIds.includes(tgn.id);

                                    return `

                                        <div class="role-item-row" id="row-tgn-collab-${tgn.id}">

                                            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary); font-size:13px; margin:0;">

                                                <input type="checkbox" name="tgn_cong_su" value="${tgn.id}" ${checked ? 'checked' : ''} onchange="syncTgnPubRoleCheckbox('${tgn.id}', 'collab')">

                                                <span>${tgn.ho_va_ten} <small style="color:var(--text-muted)">(${tgn.don_vi_cong_tac || 'N/A'})</small></span>

                                            </label>

                                            ${checked ? `<button type="button" class="btn-role-switch" onclick="switchTgnPubRole('${tgn.id}', 'collab')"><i class="fas fa-exchange-alt"></i> Sang Tác giả chính</button>` : ''}

                                        </div>

                                    `;

                                }).join('')}

                            </div>

                        </div>

                    </div>

                </div>

            </div>`;
            document.getElementById('relFormBody').innerHTML = html;

        } else if (type === 'de-tai') {

            const [relGvRes, relTgnRes] = await Promise.all([

                fetch(`${ADMIN_API_BASE}/relations/de-tai/${entityId}/giang-vien`),

                fetch(`${ADMIN_API_BASE}/relations/de-tai/${entityId}/tac-gia-ngoai`)

            ]);

            const relGvData = await relGvRes.json();

            const relTgnData = await relTgnRes.json();

            

            const chuNhiemIds = (relGvData.data || []).filter(r => r.vai_tro === 'CHU_NHIEM').map(r => r.id);

            const thamGiaIds = (relGvData.data || []).filter(r => r.vai_tro === 'THAM_GIA').map(r => r.id);

            

            // Hỗ trợ Tác giả ngoài có vai trò

            const tgnChuNhiemIds = (relTgnData.data || []).filter(r => r.vai_tro === 'CHU_NHIEM').map(r => r.id);

            const tgnThamGiaIds = (relTgnData.data || []).filter(r => r.vai_tro === 'THAM_GIA' || r.vai_tro === 'DONG_TAC_GIA').map(r => r.id);

            

            let html = `

            <div style="display:flex; flex-direction:column; gap: 24px;">

                <!-- Section 1: Giảng viên nội bộ -->

                <div style="background: rgba(79, 142, 247, 0.05); padding: 15px; border-radius: 10px; border-left: 4px solid var(--accent-blue);">

                    <h3 style="font-size: 14px; margin-bottom: 15px; display:flex; align-items:center; gap:8px;"><i class="fas fa-university"></i> NHÂN SỰ TRONG TRƯỜNG</h3>

                    <div style="display:flex; gap: 20px; flex-wrap: wrap;">

                        <div style="flex:1; min-width: 280px;">

                            <p style="margin-bottom:10px; color:var(--accent-blue);"><b><i class="fas fa-user-tie"></i> Chủ nhiệm nội bộ:</b></p>

                            <div style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; background:white;">

                            ${allGVs.map(gv => {

                                const checked = chuNhiemIds.includes(gv.id);

                                return `

                                    <div class="role-item-row" id="row-lead-${gv.id}">

                                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary); font-size:13px; margin:0;">

                                            <input type="checkbox" name="gv_chu_nhiem" value="${gv.id}" ${checked ? 'checked' : ''} onchange="syncRoleCheckbox('${gv.id}', 'lead')">

                                            <span>${gv.ho_va_ten}</span>

                                        </label>

                                        ${checked ? `<button type="button" class="btn-role-switch" onclick="switchMemberRole('${gv.id}', 'lead')"><i class="fas fa-exchange-alt"></i> Sang Thành viên</button>` : ''}

                                    </div>

                                `;

                            }).join('')}

                            </div>

                        </div>

                        <div style="flex:1; min-width: 280px;">

                            <p style="margin-bottom:10px; color:#10b981;"><b><i class="fas fa-users"></i> Thành viên nội bộ:</b></p>

                            <div style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; background:white;">

                            ${allGVs.map(gv => {

                                const checked = thamGiaIds.includes(gv.id);

                                return `

                                    <div class="role-item-row" id="row-member-${gv.id}">

                                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary); font-size:13px; margin:0;">

                                            <input type="checkbox" name="gv_tham_gia" value="${gv.id}" ${checked ? 'checked' : ''} onchange="syncRoleCheckbox('${gv.id}', 'member')">

                                            <span>${gv.ho_va_ten}</span>

                                        </label>

                                        ${checked ? `<button type="button" class="btn-role-switch" onclick="switchMemberRole('${gv.id}', 'member')"><i class="fas fa-exchange-alt"></i> Sang Chủ nhiệm</button>` : ''}

                                    </div>

                                `;

                            }).join('')}

                            </div>

                        </div>

                    </div>

                </div>



                <!-- Section 2: Tác giả ngoài -->

                <div style="background: rgba(230, 126, 34, 0.05); padding: 15px; border-radius: 10px; border-left: 4px solid #e67e22;">

                    <h3 style="font-size: 14px; margin-bottom: 15px; display:flex; align-items:center; gap:8px; color: #e67e22;"><i class="fas fa-globe"></i> NHÂN SỰ NGOÀI TRƯỜNG</h3>

                    <div style="display:flex; gap: 20px; flex-wrap: wrap;">

                        <div style="flex:1; min-width: 280px;">

                            <p style="margin-bottom:10px; color:#e67e22;"><b><i class="fas fa-user-shield"></i> Chủ nhiệm ngoài:</b></p>

                            <div style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; background:white;">

                                ${allTGNs.map(tgn => {

                                    const checked = tgnChuNhiemIds.includes(tgn.id);

                                    return `

                                        <div class="role-item-row" id="row-tgn-lead-${tgn.id}">

                                            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary); font-size:13px; margin:0;">

                                                <input type="checkbox" name="tgn_chu_nhiem" value="${tgn.id}" ${checked ? 'checked' : ''} onchange="syncTgnRoleCheckbox('${tgn.id}', 'lead')">

                                                <span>${tgn.ho_va_ten} <small style="color:var(--text-muted)">(${tgn.don_vi_cong_tac || 'N/A'})</small></span>

                                            </label>

                                            ${checked ? `<button type="button" class="btn-role-switch" onclick="switchTgnMemberRole('${tgn.id}', 'lead')"><i class="fas fa-exchange-alt"></i> Sang Thành viên</button>` : ''}

                                        </div>

                                    `;

                                }).join('')}

                            </div>

                        </div>

                        <div style="flex:1; min-width: 280px;">

                            <p style="margin-bottom:10px; color:#8b5cf6;"><b><i class="fas fa-users"></i> Thành viên ngoài:</b></p>

                            <div style="max-height: 250px; overflow-y: auto; border: 1px solid var(--border-color); padding: 10px; border-radius: 8px; background:white;">

                                ${allTGNs.map(tgn => {

                                    const checked = tgnThamGiaIds.includes(tgn.id);

                                    return `

                                        <div class="role-item-row" id="row-tgn-member-${tgn.id}">

                                            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary); font-size:13px; margin:0;">

                                                <input type="checkbox" name="tgn_tham_gia" value="${tgn.id}" ${checked ? 'checked' : ''} onchange="syncTgnRoleCheckbox('${tgn.id}', 'member')">

                                                <span>${tgn.ho_va_ten} <small style="color:var(--text-muted)">(${tgn.don_vi_cong_tac || 'N/A'})</small></span>

                                            </label>

                                            ${checked ? `<button type="button" class="btn-role-switch" onclick="switchTgnMemberRole('${tgn.id}', 'member')"><i class="fas fa-exchange-alt"></i> Sang Chủ nhiệm</button>` : ''}

                                        </div>

                                    `;

                                }).join('')}

                            </div>

                        </div>

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

        const tgnBoxes = document.querySelectorAll('input[name="tgn_ids"]:checked');

        const tgn_ids = Array.from(tgnBoxes).map(cb => cb.value);



        if (type === 'cong-trinh') {

            const tjcBoxes = document.querySelectorAll('input[name="gv_tac_gia_chinh"]:checked');

            const csBoxes = document.querySelectorAll('input[name="gv_cong_su"]:checked');

            const tgnTjcBoxes = document.querySelectorAll('input[name="tgn_tac_gia_chinh"]:checked');

            const tgnCsBoxes = document.querySelectorAll('input[name="tgn_cong_su"]:checked');

            

            const tacGiaChinhIds = Array.from(tjcBoxes).map(cb => cb.value);

            const congSuIds = Array.from(csBoxes).map(cb => cb.value);

            const tgnTacGiaChinhIds = Array.from(tgnTjcBoxes).map(cb => cb.value);

            const tgnCongSuIds = Array.from(tgnCsBoxes).map(cb => cb.value);

            

            const [gvRes, tgnRes] = await Promise.all([

                fetch(`${ADMIN_API_BASE}/relations/cong-trinh/${entityId}/giang-vien`, {

                    method: 'PUT',

                    headers: { 'Content-Type': 'application/json' },

                    body: JSON.stringify({ tac_gia_chinh_ids: tacGiaChinhIds, cong_su_ids: congSuIds })

                }),

                fetch(`${ADMIN_API_BASE}/relations/cong-trinh/${entityId}/tac-gia-ngoai`, {

                    method: 'PUT',

                    headers: { 'Content-Type': 'application/json' },

                    body: JSON.stringify({ tac_gia_chinh_ngoai_ids: tgnTacGiaChinhIds, cong_su_ngoai_ids: tgnCongSuIds })

                })

            ]);

            

            const gvData = await gvRes.json();

            const tgnData = await tgnRes.json();

            

            if(gvData.status === 'ok' && tgnData.status === 'ok') {

                showAdminToast("Đã cập nhật liên kết thành công", "success");

                closeRelationModal();

                

                const mainContent = document.getElementById('mainContent');

                const scrollPos = mainContent ? mainContent.scrollTop : 0;

                

                await loadPublications();

                

                if (mainContent) {

                    setTimeout(() => {

                        mainContent.scrollTop = scrollPos;

                    }, 10);

                }

            } else {

                alert("Lỗi: " + (gvData.message || tgnData.message));

            }

        } else if (type === 'de-tai') {

            const cnBoxes = document.querySelectorAll('input[name="gv_chu_nhiem"]:checked');

            const tgBoxes = document.querySelectorAll('input[name="gv_tham_gia"]:checked');

            const tgnCnBoxes = document.querySelectorAll('input[name="tgn_chu_nhiem"]:checked');

            const tgnTgBoxes = document.querySelectorAll('input[name="tgn_tham_gia"]:checked');

            

            const chuNhiemIds = Array.from(cnBoxes).map(cb => cb.value);

            const thamGiaIds = Array.from(tgBoxes).map(cb => cb.value);

            const tgnChuNhiemIds = Array.from(tgnCnBoxes).map(cb => cb.value);

            const tgnThamGiaIds = Array.from(tgnTgBoxes).map(cb => cb.value);

            

            const [gvRes, tgnRes] = await Promise.all([

                fetch(`${ADMIN_API_BASE}/relations/de-tai/${entityId}/giang-vien`, {

                    method: 'PUT',

                    headers: { 'Content-Type': 'application/json' },

                    body: JSON.stringify({ chu_nhiem_ids: chuNhiemIds, tham_gia_ids: thamGiaIds })

                }),

                fetch(`${ADMIN_API_BASE}/relations/de-tai/${entityId}/tac-gia-ngoai`, {

                    method: 'PUT',

                    headers: { 'Content-Type': 'application/json' },

                    body: JSON.stringify({ chu_nhiem_ngoai_ids: tgnChuNhiemIds, tham_gia_ngoai_ids: tgnThamGiaIds })

                })

            ]);

            

            const gvData = await gvRes.json();

            const tgnData = await tgnRes.json();

            

            if(gvData.status === 'ok' && tgnData.status === 'ok') {

                showAdminToast("Đã cập nhật liên kết thành công", "success");

                closeRelationModal();

                

                const mainContent = document.getElementById('mainContent');

                const scrollPos = mainContent ? mainContent.scrollTop : 0;



                await loadProjects();



                if (mainContent) {

                    setTimeout(() => {

                        mainContent.scrollTop = scrollPos;

                    }, 10);

                }

            } else {

                alert("Lỗi: " + (gvData.message || tgnData.message));

            }

        }

    } catch (err) {

        console.error(err);

        alert("Có lỗi khi lưu quan hệ!");

    }

}



function createRelationModalHtml() {

    const div = document.createElement('div');

    div.id = 'adminRelationModalOverlay';

    div.className = 'modal-overlay';

    div.innerHTML = `

        <div class="modal" style="max-width: 800px; width: 95%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;">

            <div class="modal-header" style="flex-shrink: 0; padding: 15px 24px;">

                <h2 id="adminRelationModalTitle" style="font-size:16px; margin: 0; line-height: 1.4; padding-right: 20px;">Biên tập Liên kết</h2>

                <button class="btn btn-sm" style="background:none;border:none;font-size:20px; position: absolute; right: 15px; top: 12px;" type="button" onclick="closeRelationModal()">&times;</button>

            </div>

            <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 24px;">

                <form id="adminRelationForm" onsubmit="saveRelations(event)" style="display: flex; flex-direction: column; height: 100%;">

                    <input type="hidden" id="relEntityType">

                    <input type="hidden" id="relEntityId">

                    <div id="relFormBody" style="min-height: 100px;"></div>

                    

                    <!-- Nút bấm được chuyển xuống modal-footer bên dưới để không bị cuộn mất và không bị cắt -->

                </form>

            </div>

            <div class="modal-footer" style="padding: 15px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; gap: 10px; background: var(--bg-secondary); border-radius: 0 0 var(--radius) var(--radius); flex-shrink: 0;">

                <button type="button" class="btn" onclick="closeRelationModal()">Đóng</button>

                <button type="submit" form="adminRelationForm" class="btn btn-primary" style="background: var(--accent-blue);">

                    <i class="fas fa-save"></i> Cập nhật Liên kết

                </button>

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

                    const ten = ct.ten_cong_trinh || (ct.cong_trinh ? ct.cong_trinh.ten_cong_trinh : 'Không có tiêu đề');

                    const nam = ct.nam_xuat_ban || (ct.cong_trinh ? ct.cong_trinh.nam_xuat_ban : '?');

                    const vt = ct.vai_tro || (ct.cong_trinh ? ct.cong_trinh.vai_tro : '');

                    let vaiTroLabel = 'Tác giả';

                    if (vt === 'TAC_GIA_CHINH') vaiTroLabel = 'Tác giả chính';

                    else if (vt === 'CONG_SU' || vt === 'LA_TAC_GIA_CUA') vaiTroLabel = 'Đồng tác giả';



                    const clickAttr = `onclick="navigateToManage('cong-trinh', '${ten.replace(/'/g, "\\'")}')" style="cursor:pointer; transition: color 0.2s;" onmouseover="this.style.color='var(--accent-blue)'" onmouseout="this.style.color='inherit'"` ;



                    html += `<li ${clickAttr}><b>${ten}</b> <span style="color:var(--text-muted); font-size:12px;">(${nam}) (Vai trò: <b>${vaiTroLabel}</b>)</span></li>`;

                });

                html += `</ul>`;

            } else {

                html += `<p style="color:var(--text-muted); font-size:13px; margin-bottom:15px; margin-top: 5px;">Chưa có công trình nào được gán.</p>`;

            }

            

            html += `<h4 style="margin-top:20px; color:var(--accent-orange); padding-bottom: 5px; border-bottom: 1px solid var(--border-color);"><i class="fas fa-flask"></i> Đề tài nghiên cứu (${gv.de_tai ? gv.de_tai.length : 0})</h4>`;

            if (gv.de_tai && gv.de_tai.length > 0) {

                html += `<ul style="margin-left:20px; margin-bottom:15px; margin-top: 10px; line-height: 1.6;">`;

                gv.de_tai.forEach(dt => {

                    const ten = dt.ten_de_tai || (dt.de_tai ? dt.de_tai.ten_de_tai : 'N/A');

                    const clickAttr = `onclick="navigateToManage('de-tai', '${ten.replace(/'/g, "\\'")}')" style="cursor:pointer; transition: color 0.2s;" onmouseover="this.style.color='var(--accent-orange)'" onmouseout="this.style.color='inherit'"` ;



                    html += `<li ${clickAttr}><b>${ten}</b> <span style="color:var(--text-muted); font-size:12px;">(Vai trò: <b>${dt.vai_tro === 'CHU_NHIEM' ? 'Chủ nhiệm' : 'Thành viên'}</b>)</span></li>`;

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
                    <p style="margin-bottom: 5px;"><b>Nơi xuất bản:</b> ${ct.noi_xuat_ban || 'N/A'}</p>

                    <p style="margin-bottom: 5px;"><b>Người tạo:</b> ${ct.nguoi_tao || 'Hệ thống / Admin'}</p>

                    <p style="margin-bottom: 5px;"><b>Link:</b> ${ct.link ? `<a href="${ct.link}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-blue);">${ct.link}</a>` : 'N/A'}</p>

                    <p style="margin-bottom: 5px; margin-top: 10px;"><b>Tóm tắt:</b> ${ct.tom_tat || 'Đang cập nhật...'}</p>

                </div>

            `;

            

            html += `<h4 style="margin-top:20px; color:var(--accent-blue); padding-bottom: 5px; border-bottom: 1px solid var(--border-color);"><i class="fas fa-users"></i> Tác giả nội bộ (${ct.tac_gia ? ct.tac_gia.length : 0})</h4>`;

            if (ct.tac_gia && ct.tac_gia.length > 0) {

                html += `<ul style="margin-left:20px; margin-bottom:15px; margin-top: 10px; line-height: 1.6;">`;

                ct.tac_gia.forEach(tg => {

                    let roleLabel = '';

                    if (tg.vai_tro === 'TAC_GIA_CHINH') roleLabel = ' <span style="color:#4F8EF7; font-size:11px;">(Tác giả chính)</span>';

                    else if (tg.vai_tro === 'CONG_SU' || tg.vai_tro === 'LA_TAC_GIA_CUA') roleLabel = ' <span style="color:#10b981; font-size:11px;">(Đồng tác giả)</span>';

                    

                    html += `<li><i class="fas fa-user-tie" style="color:#4F8EF7; font-size:11px; margin-right:4px;"></i><b>${tg.ten}</b>${roleLabel}</li>`;

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

                    let roleLabel = '';

                    if (tgn.vai_tro === 'TAC_GIA_CHINH') {

                        roleLabel = ' <span style="color:#e67e22; font-size:11px;">(Tác giả chính)</span>';

                    } else if (tgn.vai_tro === 'CONG_SU' || tgn.vai_tro === 'LA_TAC_GIA_CUA' || tgn.vai_tro === 'DONG_TAC_GIA') {

                        roleLabel = ' <span style="color:#8b5cf6; font-size:11px;">(Đồng tác giả)</span>';

                    }

                    html += `<li><i class="fas fa-user-friends" style="color:#e67e22; font-size:11px; margin-right:4px;"></i><b>${tgn.ten}</b>${roleLabel}${donVi}</li>`;

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

                    <p style="margin-bottom: 5px;"><b>Link:</b> ${dt.link ? `<a href="${dt.link}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-blue);">${dt.link}</a>` : 'N/A'}</p>

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

                    let roleLabel = '';

                    if (tgn.vai_tro === 'CHU_NHIEM') roleLabel = ' <span style="color:#e67e22; font-size:11px;">(Chủ nhiệm)</span>';

                    else if (tgn.vai_tro === 'THAM_GIA') roleLabel = ' <span style="color:#8b5cf6; font-size:11px;">(Thành viên)</span>';

                    

                    html += `<li><i class="fas fa-user-friends" style="color:#e67e22; font-size:11px; margin-right:4px;"></i><b>${tgn.ten}</b>${donVi}${roleLabel}</li>`;

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

// EXTERNAL AUTHOR DETAIL VIEW

// ============================================================

async function viewExternalAuthorDetail(tgnId) {

    if (!document.getElementById('adminStatsModalOverlay')) {

        createStatsModalHtml();

    }

    document.getElementById('adminStatsModalOverlay').classList.add('active');

    const body = document.getElementById('statsFormBody');

    body.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...</p>';

    

    try {

        const res = await fetch(`${ADMIN_API_BASE}/tac-gia-ngoai/${tgnId}/detail`);

        const data = await res.json();

        if (data.status === 'ok') {

            const detail = data.data;

            const info = detail.info;

            document.getElementById('adminStatsModalTitle').textContent = `Chi tiết Tác giả ngoài: ${info.ho_va_ten}`;

            

            let html = `

                <div style="margin-bottom: 15px; background: rgba(0,0,0,0.02); padding: 15px; border-radius: 8px;">

                    <p style="margin-bottom: 5px;"><b>Họ và tên:</b> ${info.ho_va_ten || 'N/A'}</p>

                    <p style="margin-bottom: 5px;"><b>Đơn vị công tác:</b> ${info.don_vi_cong_tac || 'N/A'}</p>

                    <p style="margin-bottom: 5px;"><b>Học vị:</b> ${info.hoc_vi || 'N/A'}</p>

                    <p style="margin-bottom: 5px;"><b>Chức danh:</b> ${info.chuc_danh || 'N/A'}</p>

                    <p style="margin-bottom: 5px;"><b>Email:</b> ${info.email || 'N/A'}</p>

                </div>

            `;

            

            // Công trình tham gia

            html += `<h4 style="margin-top:20px; color:var(--accent-blue); padding-bottom: 5px; border-bottom: 1px solid var(--border-color);"><i class="fas fa-file-alt"></i> Công trình nghiên cứu (${detail.publications.length})</h4>`;

            if (detail.publications.length > 0) {

                html += `<ul style="margin-left:20px; margin-bottom:15px; margin-top: 10px; line-height: 1.6;">`;

                detail.publications.forEach(ct => {

                    html += `<li style="margin-bottom: 4px;"><b>${ct.ten_cong_trinh}</b> <span style="color:var(--text-muted); font-size:12px;">(${ct.nam_xuat_ban || '?'})</span></li>`;

                });

                html += `</ul>`;

            } else {

                html += `<p style="color:var(--text-muted); font-size:13px; margin-bottom:15px; margin-top: 5px;">Chưa tham gia công trình nào.</p>`;

            }

            

            // Đề tài tham gia

            html += `<h4 style="margin-top:20px; color:var(--accent-orange); padding-bottom: 5px; border-bottom: 1px solid var(--border-color);"><i class="fas fa-flask"></i> Đề tài nghiên cứu (${detail.projects.length})</h4>`;

            if (detail.projects.length > 0) {

                html += `<ul style="margin-left:20px; margin-bottom:15px; margin-top: 10px; line-height: 1.6;">`;

                detail.projects.forEach(dt => {

                    html += `<li style="margin-bottom: 4px;"><b>${dt.ten_de_tai}</b> <span style="color:var(--text-muted); font-size:12px;">(${dt.nam_bat_dau || '?'} - ${dt.nam_ket_thuc || '?'})</span></li>`;

                });

                html += `</ul>`;

            } else {

                html += `<p style="color:var(--text-muted); font-size:13px; margin-bottom:15px; margin-top: 5px;">Chưa tham gia đề tài nào.</p>`;

            }



            // Giảng viên cộng tác

            html += `<h4 style="margin-top:20px; color:#2ecc71; padding-bottom: 5px; border-bottom: 1px solid var(--border-color);"><i class="fas fa-handshake"></i> Giảng viên cộng tác trong trường (${detail.collaborators.length})</h4>`;

            if (detail.collaborators.length > 0) {

                html += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; margin-top: 15px;">`;

                detail.collaborators.forEach(gv => {

                    const avatar = gv.anh_dai_dien 

                        ? `<img src="${gv.anh_dai_dien}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;">`

                        : `<div style="width:30px;height:30px;border-radius:50%;background:var(--bg-hover);display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--text-muted);"><i class="fas fa-user"></i></div>`;

                    

                    html += `

                        <div style="display:flex; align-items:center; gap:10px; background:white; padding:8px 12px; border-radius:10px; border:1px solid var(--border-color); cursor:pointer;" onclick="viewLecturerStats('${gv.id}')" title="Xem chi tiết giảng viên">

                            ${avatar}

                            <div style="min-width:0;">

                                <div style="font-size:13px; font-weight:700; color:var(--text-primary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${gv.ho_va_ten}</div>

                                <div style="font-size:11px; color:var(--accent-blue); font-weight:600;">${gv.count} chung</div>

                            </div>

                        </div>

                    `;

                });

                html += `</div>`;

            } else {

                html += `<p style="color:var(--text-muted); font-size:13px; margin-bottom:15px; margin-top: 5px;">Chưa có lịch sử cộng tác với giảng viên trong trường.</p>`;

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

        <div class="modal" style="max-width: 700px; width: 95%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;">

            <div class="modal-header" style="flex-shrink: 0; padding: 15px 24px;">

                <h2 id="adminStatsModalTitle" style="font-size:18px; margin: 0;">Thông tin Chi tiết</h2>

                <button class="btn btn-sm" style="background:none;border-color:transparent;font-size:20px; position: absolute; right: 15px; top: 12px;" type="button" onclick="closeStatsModal()">&times;</button>

            </div>

            <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 24px;">

                <div id="statsFormBody" style="min-height: 100px; color: var(--text-primary);"></div>

            </div>

            <div class="modal-footer" style="padding: 15px 24px; border-top: 1px solid var(--border-color); display: flex; justify-content: flex-end; background: var(--bg-secondary); border-radius: 0 0 var(--radius) var(--radius); flex-shrink: 0;">

                <button type="button" class="btn btn-primary" onclick="closeStatsModal()">Đóng</button>

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

        const mainContent = document.getElementById('mainContent');

        const scrollPos = mainContent ? mainContent.scrollTop : 0;



        const res = await fetch(`${ADMIN_API_BASE}/accounts/${id}/toggle-status`, { method: 'PUT' });

        const data = await res.json();

        if(data.status === 'ok') {

            await loadAccounts();

            if (mainContent) {

                setTimeout(() => {

                    mainContent.scrollTop = scrollPos;

                }, 10);

            }

        }

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

    localStorage.removeItem('userRole');

    localStorage.removeItem('userInfo');

    window.location.href = '/user/login.html';

};



// Helper: Đồng bộ checkbox và hiển thị nút switch

window.syncRoleCheckbox = function(gvId, column) {

    const mainCb = document.querySelector(`input[name="gv_tac_gia_chinh"][value="${gvId}"]`) || document.querySelector(`input[name="gv_chu_nhiem"][value="${gvId}"]`);

    const collabCb = document.querySelector(`input[name="gv_cong_su"][value="${gvId}"]`) || document.querySelector(`input[name="gv_tham_gia"][value="${gvId}"]`);

    

    // Nếu chọn bên này thì bỏ chọn bên kia (logic một người chỉ một vai trò)

    if (column === 'main' || column === 'lead') {

        if (mainCb && mainCb.checked && collabCb) collabCb.checked = false;

    } else {

        if (collabCb && collabCb.checked && mainCb) mainCb.checked = false;

    }



    // Refresh lại giao diện nút switch (đơn giản nhất là re-render hoặc DOM manipulation)

    // Ở đây ta dùng DOM manipulation cho nhanh

    updateSwitchButtons(gvId);

};



function updateSwitchButtons(gvId) {

    const mainRow = document.getElementById(`row-main-${gvId}`) || document.getElementById(`row-lead-${gvId}`);

    const collabRow = document.getElementById(`row-collab-${gvId}`) || document.getElementById(`row-member-${gvId}`);

    

    const mainCb = mainRow ? mainRow.querySelector('input[type="checkbox"]') : null;

    const collabCb = collabRow ? collabRow.querySelector('input[type="checkbox"]') : null;



    if (mainRow) {

        let btn = mainRow.querySelector('.btn-role-switch');

        if (mainCb.checked) {

            if (!btn) {

                const text = mainRow.id.includes('lead') ? 'Sang Thành viên' : 'Sang Đồng tác giả';

                const func = mainRow.id.includes('lead') ? 'switchMemberRole' : 'switchAuthorRole';

                mainRow.insertAdjacentHTML('beforeend', `<button type="button" class="btn-role-switch" onclick="${func}('${gvId}', '${mainRow.id.includes('lead') ? 'lead' : 'main'}')"><i class="fas fa-exchange-alt"></i> ${text}</button>`);

            }

        } else if (btn) btn.remove();

    }



    if (collabRow) {

        let btn = collabRow.querySelector('.btn-role-switch');

        if (collabCb.checked) {

            if (!btn) {

                const text = collabRow.id.includes('member') ? 'Sang Chủ nhiệm' : 'Sang Tác giả chính';

                const func = collabRow.id.includes('member') ? 'switchMemberRole' : 'switchAuthorRole';

                collabRow.insertAdjacentHTML('beforeend', `<button type="button" class="btn-role-switch" onclick="${func}('${gvId}', '${collabRow.id.includes('member') ? 'member' : 'collab'}')"><i class="fas fa-exchange-alt"></i> ${text}</button>`);

            }

        } else if (btn) btn.remove();

    }

}



window.switchAuthorRole = function(gvId, currentRole) {

    const mainCb = document.querySelector(`input[name="gv_tac_gia_chinh"][value="${gvId}"]`);

    const collabCb = document.querySelector(`input[name="gv_cong_su"][value="${gvId}"]`);

    

    if (currentRole === 'main') {

        if (mainCb) mainCb.checked = false;

        if (collabCb) collabCb.checked = true;

    } else {

        if (collabCb) collabCb.checked = false;

        if (mainCb) mainCb.checked = true;

    }

    updateSwitchButtons(gvId);

};



window.switchMemberRole = function(gvId, currentRole) {

    const leadCb = document.querySelector(`input[name="gv_chu_nhiem"][value="${gvId}"]`);

    const memberCb = document.querySelector(`input[name="gv_tham_gia"][value="${gvId}"]`);

    

    if (currentRole === 'lead') {

        if (leadCb) leadCb.checked = false;

        if (memberCb) memberCb.checked = true;

    } else {

        if (memberCb) memberCb.checked = false;

        if (leadCb) leadCb.checked = true;

    }

    updateSwitchButtons(gvId);

};



// Helper: Đồng bộ checkbox và hiển thị nút switch cho Tác giả ngoài

window.syncTgnRoleCheckbox = function(tgnId, column) {

    const leadCb = document.querySelector(`input[name="tgn_chu_nhiem"][value="${tgnId}"]`);

    const memberCb = document.querySelector(`input[name="tgn_tham_gia"][value="${tgnId}"]`);

    

    if (column === 'lead') {

        if (leadCb && leadCb.checked && memberCb) memberCb.checked = false;

    } else {

        if (memberCb && memberCb.checked && leadCb) leadCb.checked = false;

    }

    updateTgnSwitchButtons(tgnId);

};



function updateTgnSwitchButtons(tgnId) {

    const leadRow = document.getElementById(`row-tgn-lead-${tgnId}`);

    const memberRow = document.getElementById(`row-tgn-member-${tgnId}`);

    

    const leadCb = leadRow ? leadRow.querySelector('input[type="checkbox"]') : null;

    const memberCb = memberRow ? memberRow.querySelector('input[type="checkbox"]') : null;



    if (leadRow) {

        let btn = leadRow.querySelector('.btn-role-switch');

        if (leadCb && leadCb.checked) {

            if (!btn) {

                leadRow.insertAdjacentHTML('beforeend', `<button type="button" class="btn-role-switch" onclick="switchTgnMemberRole('${tgnId}', 'lead')"><i class="fas fa-exchange-alt"></i> Sang Thành viên</button>`);

            }

        } else if (btn) btn.remove();

    }



    if (memberRow) {

        let btn = memberRow.querySelector('.btn-role-switch');

        if (memberCb && memberCb.checked) {

            if (!btn) {

                memberRow.insertAdjacentHTML('beforeend', `<button type="button" class="btn-role-switch" onclick="switchTgnMemberRole('${tgnId}', 'member')"><i class="fas fa-exchange-alt"></i> Sang Chủ nhiệm</button>`);

            }

        } else if (btn) btn.remove();

    }

}



window.switchTgnMemberRole = function(tgnId, currentRole) {

    const leadCb = document.querySelector(`input[name="tgn_chu_nhiem"][value="${tgnId}"]`);

    const memberCb = document.querySelector(`input[name="tgn_tham_gia"][value="${tgnId}"]`);

    

    if (currentRole === 'lead') {

        if (leadCb) leadCb.checked = false;

        if (memberCb) memberCb.checked = true;

    } else {

        if (memberCb) memberCb.checked = false;

        if (leadCb) leadCb.checked = true;

    }

    updateTgnSwitchButtons(tgnId);

};



// Helper: Đồng bộ checkbox và hiển thị nút switch cho Tác giả ngoài của Công trình
window.syncTgnPubRoleCheckbox = function(tgnId, column) {
    const mainCb = document.querySelector(`input[name="tgn_tac_gia_chinh"][value="${tgnId}"]`);
    const collabCb = document.querySelector(`input[name="tgn_cong_su"][value="${tgnId}"]`);
    
    if (column === 'main') {
        if (mainCb && mainCb.checked && collabCb) collabCb.checked = false;
    } else {
        if (collabCb && collabCb.checked && mainCb) mainCb.checked = false;
    }
    updateTgnPubSwitchButtons(tgnId);
};

function updateTgnPubSwitchButtons(tgnId) {
    const mainRow = document.getElementById(`row-tgn-main-${tgnId}`);
    const collabRow = document.getElementById(`row-tgn-collab-${tgnId}`);
    
    const mainCb = mainRow ? mainRow.querySelector('input[type="checkbox"]') : null;
    const collabCb = collabRow ? collabRow.querySelector('input[type="checkbox"]') : null;

    if (mainRow) {
        let btn = mainRow.querySelector('.btn-role-switch');
        if (mainCb && mainCb.checked) {
            if (!btn) {
                mainRow.insertAdjacentHTML('beforeend', `<button type="button" class="btn-role-switch" onclick="switchTgnPubRole('${tgnId}', 'main')"><i class="fas fa-exchange-alt"></i> Sang Đồng tác giả</button>`);
            }
        } else if (btn) btn.remove();
    }

    if (collabRow) {
        let btn = collabRow.querySelector('.btn-role-switch');
        if (collabCb && collabCb.checked) {
            if (!btn) {
                collabRow.insertAdjacentHTML('beforeend', `<button type="button" class="btn-role-switch" onclick="switchTgnPubRole('${tgnId}', 'collab')"><i class="fas fa-exchange-alt"></i> Sang Tác giả chính</button>`);
            }
        } else if (btn) btn.remove();
    }
}

window.switchTgnPubRole = function(tgnId, currentRole) {
    const mainCb = document.querySelector(`input[name="tgn_tac_gia_chinh"][value="${tgnId}"]`);
    const collabCb = document.querySelector(`input[name="tgn_cong_su"][value="${tgnId}"]`);
    
    if (currentRole === 'main') {
        if (mainCb) mainCb.checked = false;
        if (collabCb) collabCb.checked = true;
    } else {
        if (collabCb) collabCb.checked = false;
        if (mainCb) mainCb.checked = true;
    }
    updateTgnPubSwitchButtons(tgnId);
};

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

// Dynamic Scroll to Top Button for Admin Panel
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


