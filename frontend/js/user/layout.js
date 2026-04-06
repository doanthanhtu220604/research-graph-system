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
        const role = localStorage.getItem('userRole');
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
        const authContainer = document.getElementById('authContainer');

        if (authContainer && role) {
            let dashboardUrl = '/admin/index.html';
            if (role === 'lecturer') dashboardUrl = '/lecturer/index.html';
            
            authContainer.innerHTML = `
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span style="font-size: 14px; font-weight: 500; white-space: nowrap;">Xin chào, ${userInfo.name || role}</span>
                    <a href="${dashboardUrl}" class="btn btn-sm btn-primary" style="background-color: var(--accent-blue); padding: 5px 10px; line-height: 1.5; white-space: nowrap;">
                        <i class="fas fa-tachometer-alt"></i> Quản lý
                    </a>
                    <button onclick="logout()" class="btn btn-sm" style="color: var(--accent-red); border: 1px solid var(--accent-red); padding: 5px 10px; background: transparent; line-height: 1.5;" title="Đăng xuất">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            `;
        }
    });
    
    window.logout = function() {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('isAdmin'); // For backward compatibility if any
        window.location.reload();
    };

    loadComponent('modal-placeholder', 'components/login_modal.html');

    // Add Detail Overlay Placeholder globally
    const detailOverlayPlaceholder = document.createElement('div');
    detailOverlayPlaceholder.id = 'entity-detail-placeholder';
    document.body.appendChild(detailOverlayPlaceholder);
    loadComponent('entity-detail-placeholder', 'components/entity_detail.html');
});
