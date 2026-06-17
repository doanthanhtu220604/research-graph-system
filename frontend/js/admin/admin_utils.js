/* ============================================================
   ADMIN UTILS — Upload PDF, Scroll to Top, Logout
   ============================================================ */

/* ─── Upload PDF for link field ─────────────────────────────── */

async function uploadPdfForLink(input, targetId) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.type !== 'application/pdf') { alert('Vui lòng chọn file PDF.'); return; }

    const formData = new FormData();
    formData.append('file', file);

    const statusDiv = document.getElementById('upload_status_' + targetId.replace('field_', ''));
    if (statusDiv) statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải lên...';

    try {
        const res  = await fetch('/api/upload/pdf', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.status === 'success') {
            const field = document.getElementById(targetId);
            if (field) {
                const origin = window.location.origin;
                field.value = data.url.startsWith('http') ? data.url : origin + data.url;
            }
            if (statusDiv) statusDiv.innerHTML = '<span style="color:#10b981;"><i class="fas fa-check"></i> Tải lên thành công!</span>';
        } else {
            alert('Lỗi: ' + data.message);
            if (statusDiv) statusDiv.innerHTML = '<span style="color:#ef4444;"><i class="fas fa-times"></i> Lỗi tải lên.</span>';
        }
    } catch (err) {
        console.error('Lỗi upload PDF:', err);
        alert('Có lỗi xảy ra khi upload file.');
        if (statusDiv) statusDiv.innerHTML = '<span style="color:#ef4444;"><i class="fas fa-times"></i> Lỗi mạng.</span>';
    }
}


async function uploadImageForAvatar(input, targetId) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) { alert('Vui lòng chọn file hình ảnh (png, jpg, jpeg, gif, webp).'); return; }

    const formData = new FormData();
    formData.append('file', file);

    const statusDiv = document.getElementById('upload_status_' + targetId.replace('field_', ''));
    if (statusDiv) statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải lên...';

    try {
        const res  = await fetch('/api/upload/image', { method: 'POST', body: formData });
        const data = await res.json();

        if (data.status === 'success') {
            const field = document.getElementById(targetId);
            if (field) {
                const origin = window.location.origin;
                field.value = data.url.startsWith('http') ? data.url : origin + data.url;
            }
            if (statusDiv) statusDiv.innerHTML = '<span style="color:#10b981;"><i class="fas fa-check"></i> Tải lên thành công!</span>';
        } else {
            alert('Lỗi: ' + data.message);
            if (statusDiv) statusDiv.innerHTML = '<span style="color:#ef4444;"><i class="fas fa-times"></i> Lỗi tải lên.</span>';
        }
    } catch (err) {
        console.error('Lỗi upload ảnh:', err);
        alert('Có lỗi xảy ra khi upload file.');
        if (statusDiv) statusDiv.innerHTML = '<span style="color:#ef4444;"><i class="fas fa-times"></i> Lỗi mạng.</span>';
    }
}


/* ─── Scroll to Top Button ───────────────────────────────────── */

document.addEventListener('DOMContentLoaded', function () {
    const btn = document.createElement('button');
    btn.id        = 'scrollToTopBtn';
    btn.className = 'scroll-to-top-btn';
    btn.title     = 'Lên đầu trang';
    btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) btn.classList.add('show');
        else                       btn.classList.remove('show');
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
});


/* ─── Logout ─────────────────────────────────────────────────── */

window.logoutAdmin = function () {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userInfo');
    window.location.href = '/user/login.html';
};


/* ─── String Formatting Helpers (Sentence Case & Title Case) ─── */

window.toTitleCase = function(str) {
    if (!str) return '';
    return str.toLowerCase().replace(/(^|\s)\S/g, function(l) {
        return l.toUpperCase();
    });
};

window.toSentenceCase = function(str) {
    if (!str) return '';
    const s = str.toLowerCase();
    return s.charAt(0).toUpperCase() + s.slice(1);
};


/* ─── Pagination Helper ──────────────────────────────────────── */

/**
 * Render một thanh phân trang vào container có id = containerId.
 * @param {string}   containerId  - id của phần tử chứa pagination
 * @param {number}   total        - tổng số dòng
 * @param {number}   currentPage  - trang hiện tại (1-indexed)
 * @param {number}   pageSize     - số dòng mỗi trang
 * @param {Function} onPageChange - callback(newPage) khi người dùng đổi trang
 */
window.renderPagination = function(containerId, total, currentPage, pageSize, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalPages = Math.ceil(total / pageSize);

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    const btnStyle = `
        display:inline-flex; align-items:center; justify-content:center;
        min-width:34px; height:34px; padding:0 10px;
        border:1px solid var(--border-color); border-radius:6px;
        background:var(--bg-card); color:var(--text-secondary);
        font-size:13px; font-weight:500; cursor:pointer;
        transition:all 0.2s ease; text-decoration:none;
    `;
    const activeBtnStyle = btnStyle + `
        background:var(--accent-blue); color:#fff;
        border-color:var(--accent-blue); font-weight:600;
    `;
    const disabledBtnStyle = btnStyle + `opacity:0.4; cursor:not-allowed;`;

    // Tính range trang hiển thị (tối đa 5 trang liền kề)
    let startPage = Math.max(1, currentPage - 2);
    let endPage   = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    const makeBtn = (label, page, isActive = false, isDisabled = false) => {
        const style = isDisabled ? disabledBtnStyle : (isActive ? activeBtnStyle : btnStyle);
        const click = isDisabled ? '' : `onclick="(${onPageChange.toString()})(${page})"`;
        return `<button style="${style}" ${click} ${isDisabled ? 'disabled' : ''}>${label}</button>`;
    };

    let html = `<div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-top:16px; padding-top:12px; border-top:1px solid var(--border-color);">`;
    html += `<span style="font-size:13px; color:var(--text-muted); margin-right:4px;">Tổng: <strong>${total}</strong> mục &nbsp;|&nbsp; Trang <strong>${currentPage}</strong>/${totalPages}</span>`;
    html += makeBtn('<i class="fas fa-angle-double-left"></i>', 1, false, currentPage === 1);
    html += makeBtn('<i class="fas fa-angle-left"></i>', currentPage - 1, false, currentPage === 1);

    for (let p = startPage; p <= endPage; p++) {
        html += makeBtn(p, p, p === currentPage);
    }

    html += makeBtn('<i class="fas fa-angle-right"></i>', currentPage + 1, false, currentPage === totalPages);
    html += makeBtn('<i class="fas fa-angle-double-right"></i>', totalPages, false, currentPage === totalPages);
    html += `</div>`;

    container.innerHTML = html;
};
