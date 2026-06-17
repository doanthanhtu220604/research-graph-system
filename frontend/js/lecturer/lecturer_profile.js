/* ============================================================

   LECTURER PROFILE - Overview page & Profile/Password modals

   ============================================================ */



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



/* ============================================================

   PROFILE AVATAR DROPDOWN & DIALOGS

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
                <div class="modal" style="max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
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
                            <div class="form-group">
                                <label for="profilePhone">Số điện thoại</label>
                                <input type="text" id="profilePhone" placeholder="Số điện thoại" style="width:100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; box-sizing: border-box; font-family: inherit;">
                            </div>
                            <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <div>
                                    <label for="profileDegree">Học vị</label>
                                    <input type="text" id="profileDegree" placeholder="Tiến sĩ / Thạc sĩ" style="width:100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; box-sizing: border-box; font-family: inherit;">
                                </div>
                                <div>
                                    <label for="profileTitle">Chức danh</label>
                                    <input type="text" id="profileTitle" placeholder="Giảng viên" style="width:100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; box-sizing: border-box; font-family: inherit;">
                                </div>
                            </div>
                            <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                                <div>
                                    <label for="profilePosition">Chức vụ</label>
                                    <input type="text" id="profilePosition" placeholder="Trưởng bộ môn, v.v." style="width:100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; box-sizing: border-box; font-family: inherit;">
                                </div>
                                <div>
                                    <label for="profileMajor">Chuyên ngành</label>
                                    <input type="text" id="profileMajor" placeholder="Ví dụ: Khoa học máy tính" style="width:100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; box-sizing: border-box; font-family: inherit;">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="profileDept">Bộ môn</label>
                                <input type="text" id="profileDept" placeholder="Ví dụ: Công nghệ phần mềm" style="width:100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; box-sizing: border-box; font-family: inherit;">
                            </div>
                            <div class="form-group">
                                <label for="profileFields">Hướng nghiên cứu (Phân tách bằng dấu phẩy)</label>
                                <input type="text" id="profileFields" placeholder="Ví dụ: Trí tuệ nhân tạo, Học máy" style="width:100%; padding: 8px 12px; border: 1px solid var(--border-color); border-radius: 6px; box-sizing: border-box; font-family: inherit;">
                            </div>
                            <div id="profileMsg" style="margin-top: 10px; display: none; font-size: 13px; font-weight: 500; padding: 8px; border-radius: 4px; line-height: 1.4;"></div>
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

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('editProfile') === 'true') {
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        setTimeout(() => {
            if (typeof window.openProfileModal === 'function') {
                window.openProfileModal();
            }
        }, 100);
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
                
                if (document.getElementById('profilePhone')) {
                    document.getElementById('profilePhone').value = data.data.dien_thoai || '';
                }
                if (document.getElementById('profileDegree')) {
                    document.getElementById('profileDegree').value = data.data.hoc_vi || '';
                }
                if (document.getElementById('profileTitle')) {
                    document.getElementById('profileTitle').value = data.data.chuc_danh || '';
                }
                if (document.getElementById('profilePosition')) {
                    document.getElementById('profilePosition').value = data.data.chuc_vu || '';
                }
                if (document.getElementById('profileMajor')) {
                    document.getElementById('profileMajor').value = data.data.chuyen_nganh || '';
                }
                if (document.getElementById('profileDept')) {
                    document.getElementById('profileDept').value = data.data.bo_mon || '';
                }
                if (document.getElementById('profileFields')) {
                    const fields = data.data.linh_vuc || [];
                    document.getElementById('profileFields').value = fields.join(', ');
                }

                const formInputs = document.querySelectorAll('#profileForm input');
                const submitBtn = document.querySelector('#profileForm button[type="submit"]');
                const avatarLabel = document.querySelector('label[for="profileAvatarInput"]');
                
                formInputs.forEach(input => {
                    input.disabled = false;
                });
                if (submitBtn) submitBtn.style.display = 'inline-block';
                if (avatarLabel) {
                    avatarLabel.style.pointerEvents = 'auto';
                    avatarLabel.style.opacity = '1';
                }

                const msg = document.getElementById('profileMsg');
                if (msg) {
                    if (data.data.profile_edit_status === 'Chờ duyệt') {
                        msg.style.background = '#fee2e2';
                        msg.style.color = '#dc2626';
                        msg.style.border = '1px solid #fca5a5';
                        msg.textContent = 'Hồ sơ của bạn đang có yêu cầu thay đổi thông tin chờ duyệt. Vui lòng đợi quản trị viên phê duyệt trước khi tiếp tục chỉnh sửa.';
                        msg.style.display = 'block';

                        formInputs.forEach(input => {
                            input.disabled = true;
                        });
                        if (submitBtn) submitBtn.style.display = 'none';
                        if (avatarLabel) {
                            avatarLabel.style.pointerEvents = 'none';
                            avatarLabel.style.opacity = '0.5';
                        }
                    } else if (data.data.profile_edit_status === 'Từ chối') {
                        msg.style.background = '#fee2e2';
                        msg.style.color = '#dc2626';
                        msg.style.border = '1px solid #fca5a5';
                        msg.textContent = 'Yêu cầu thay đổi thông tin trước đó đã bị Admin từ chối. Bạn có thể gửi yêu cầu khác.';
                        msg.style.display = 'block';
                    } else {
                        msg.style.display = 'none';
                    }
                }

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
        msg.style.background = '#fee2e2';
        msg.style.color = '#dc2626';
        msg.style.border = '1px solid #fca5a5';
        msg.textContent = 'Vui lòng nhập đầy đủ thông tin.';
        msg.style.display = 'block';
        return;
    }

    const payload = {
        id: userId,
        role: role,
        ho_va_ten: name,
        email: email,
        avatar: uploadedAvatarUrl
    };

    if (role === 'lecturer') {
        payload.dien_thoai = document.getElementById('profilePhone')?.value.trim() || '';
        payload.hoc_vi = document.getElementById('profileDegree')?.value.trim() || '';
        payload.chuc_danh = document.getElementById('profileTitle')?.value.trim() || '';
        payload.chuc_vu = document.getElementById('profilePosition')?.value.trim() || '';
        payload.chuyen_nganh = document.getElementById('profileMajor')?.value.trim() || '';
        payload.bo_mon = document.getElementById('profileDept')?.value.trim() || '';
        payload.linh_vuc = document.getElementById('profileFields')?.value.trim() || '';
    }

    fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.status === 'ok') {
            msg.style.background = '#d1fae5';
            msg.style.color = '#065f46';
            msg.style.border = '1px solid #6ee7b7';
            msg.textContent = data.message || 'Cập nhật thông tin thành công!';
            msg.style.display = 'block';
            
            if (role !== 'lecturer') {
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
            }

            setTimeout(() => {
                closeProfileModal();
                if (role !== 'lecturer') {
                    window.location.reload();
                }
            }, 2000);
        } else {
            msg.style.background = '#fee2e2';
            msg.style.color = '#dc2626';
            msg.style.border = '1px solid #fca5a5';
            msg.textContent = data.message;
            msg.style.display = 'block';
        }
    })
    .catch(err => {
        console.error(err);
        msg.style.background = '#fee2e2';
        msg.style.color = '#dc2626';
        msg.style.border = '1px solid #fca5a5';
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
