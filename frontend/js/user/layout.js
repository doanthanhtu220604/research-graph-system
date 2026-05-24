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
            
            const avatarUrl = userInfo.avatar || '';
            const avatarHtml = avatarUrl 
                ? `<img src="${avatarUrl}" alt="Avatar">` 
                : `<i class="fas fa-user" style="font-size: 16px; color: var(--text-secondary);"></i>`;
            
            authContainer.innerHTML = `
                <div class="profile-dropdown-container" id="profileDropdownContainer">
                    <button class="profile-avatar-btn" onclick="toggleProfileDropdown(event)">
                        ${avatarHtml}
                    </button>
                    <div class="profile-menu">
                        <div class="profile-menu-header">
                            <div class="profile-menu-name" title="${userInfo.name || 'Người dùng'}">${userInfo.name || 'Người dùng'}</div>
                            <div class="profile-menu-role">${role === 'admin' ? 'Quản trị viên' : 'Giảng viên'}</div>
                        </div>
                        <a href="${dashboardUrl}" class="profile-menu-item">
                            <i class="fas fa-tachometer-alt"></i> Trang quản lý
                        </a>
                        <button onclick="openProfileModal(event)" class="profile-menu-item">
                            <i class="fas fa-user-edit"></i> Chỉnh sửa thông tin
                        </button>
                        <button onclick="openChangePasswordModal(event)" class="profile-menu-item">
                            <i class="fas fa-key"></i> Đổi mật khẩu
                        </button>
                        <div style="border-top: 1px solid var(--border-color); margin: 6px 0;"></div>
                        <button onclick="logout()" class="profile-menu-item logout-item">
                            <i class="fas fa-sign-out-alt"></i> Đăng xuất
                        </button>
                    </div>
                </div>
            `;
        }
    });
    
    // Inject Profile Modals into Body
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
                        : `<i class="fas fa-user" style="font-size: 16px; color: var(--text-secondary);"></i>`;
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

    window.logout = function() {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userInfo');
        localStorage.removeItem('isAdmin');
        window.location.reload();
    };

    loadComponent('modal-placeholder', 'components/login_modal.html');

    // Add Detail Overlay Placeholder globally
    const detailOverlayPlaceholder = document.createElement('div');
    detailOverlayPlaceholder.id = 'entity-detail-placeholder';
    document.body.appendChild(detailOverlayPlaceholder);
    loadComponent('entity-detail-placeholder', 'components/entity_detail.html');

    // Add Scroll to Top Button dynamically
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
