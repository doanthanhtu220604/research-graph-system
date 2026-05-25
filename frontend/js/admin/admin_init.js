/* ============================================================
   ADMIN INIT — Khởi tạo trang, sidebar, clock, URL params
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    // Kiểm tra quyền truy cập Admin
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
        window.location.href = '/user/login.html';
        return;
    }

    // Nếu admin là giảng viên được phân quyền, hiển thị link chuyển sang khu vực giảng viên
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    if (userInfo.id && userInfo.id !== 'admin') {
        const navMenu = document.querySelector('.nav-menu');
        if (navMenu) {
            const li = document.createElement('li');
            li.className = 'nav-item';
            li.style.borderTop = '1px dashed rgba(255,255,255,0.15)';
            li.style.marginTop = '10px';
            li.style.paddingTop = '10px';
            li.innerHTML = `
                <a href="/lecturer/index.html" class="nav-link" style="color: #3b82f6;">
                    <i class="fas fa-user-circle"></i>
                    <span>Khu vực Giảng viên</span>
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

    if (typeof initAdminProfile === 'function') {
        initAdminProfile();
    }

    // Kiểm tra xem đang ở trang nào để tải dữ liệu tương ứng
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

    // ── Submenu Toggle Logic ──
    const submenuToggle = document.querySelector('.submenu-toggle');
    if (submenuToggle) {
        submenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const parent = submenuToggle.closest('.has-submenu');
            const submenu = parent.querySelector('.submenu');
            if (submenu) {
                const isHidden = submenu.style.display === 'none' || submenu.style.display === '';
                submenu.style.display = isHidden ? 'block' : 'none';
                if (isHidden) {
                    parent.classList.add('open');
                } else {
                    parent.classList.remove('open');
                }
            }
        });
    }

    // ── Auto-expand and highlight active submenu items based on URL ──
    const pathName = window.location.pathname;
    const pageName = pathName.substring(pathName.lastIndexOf('/') + 1) || 'index.html';

    if (pageName === 'import.html' || pageName === 'export.html') {
        const parent = document.getElementById('menu-data');
        if (parent) {
            parent.classList.add('open');
            const submenu = parent.querySelector('.submenu');
            if (submenu) submenu.style.display = 'block';

            if (pageName === 'import.html') {
                const subImport = document.getElementById('submenu-import');
                if (subImport) subImport.classList.add('active');
            } else if (pageName === 'export.html') {
                const subExport = document.getElementById('submenu-export');
                if (subExport) subExport.classList.add('active');
            }
        }
    }

});


// Điều hướng tới trang quản lý (từ popup chi tiết giảng viên)
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


// Đồng hồ thời gian thực
function updateClock() {
    const clockEl = document.getElementById('realtimeClock');
    if (!clockEl) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour12: false });
    const dateStr = now.toLocaleDateString('vi-VN');
    clockEl.innerHTML = `<i class="far fa-clock"></i> ${timeStr} — ${dateStr}`;
}
