// Layout Loader for MPA
document.addEventListener("DOMContentLoaded", function() {
    const loadComponent = (id, url, callback) => {
        const el = document.getElementById(id);
        if (!el) return;
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error("File not found");
                return res.text();
            })
            .then(html => {
                el.outerHTML = html;
                if (callback) callback();
            })
            .catch(err => {
                console.error('Error loading component:', err);
                el.innerHTML = '<p style="color:red; margin: 20px;">Lỗi tải layout. Vui lòng mở trang web thông qua Live Server hoặc Web Server (không chạy trực tiếp file://).</p>';
            });
    };

    const setActiveMenu = () => {
        let path = window.location.pathname;
        let page = path.split('/').pop().split('.')[0];
        if (!page || page === '') page = 'index'; // Default to dashboard
        if (page === 'dashboard') page = 'index';
        
        document.querySelectorAll('.nav-item').forEach(item => {
            if (item.getAttribute('data-page') === page) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    // Replace placeholders with real HTML components
    loadComponent('header-placeholder', 'components/header.html', () => {
        setActiveMenu();
        const authContainer = document.getElementById('authContainer');
        if (authContainer && localStorage.getItem('isAdmin') === 'true') {
            authContainer.innerHTML = `
                <a href="../admin/index.html" class="btn btn-view" style="margin-right:8px; border-radius: var(--radius-sm); font-weight: 600;">
                    <i class="fas fa-tools"></i> Trang quản trị
                </a>
                <a href="#" class="btn btn-view" onclick="logout()" style="border-radius: var(--radius-sm); border-color: var(--accent-red); color: var(--accent-red); font-weight: 600;" title="Đăng xuất">
                    <i class="fas fa-sign-out-alt"></i>
                </a>
            `;
        }
    });
    
    window.logout = function() {
        localStorage.removeItem('isAdmin');
        window.location.reload();
    };

    loadComponent('modal-placeholder', 'components/login_modal.html');

    // Add Detail Overlay Placeholder globally
    const detailOverlayPlaceholder = document.createElement('div');
    detailOverlayPlaceholder.id = 'entity-detail-placeholder';
    document.body.appendChild(detailOverlayPlaceholder);
    loadComponent('entity-detail-placeholder', 'components/entity_detail.html');
});
