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
    loadComponent('header-placeholder', 'components/header.html', setActiveMenu);
    loadComponent('modal-placeholder', 'components/login_modal.html');
});
