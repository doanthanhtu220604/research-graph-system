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
