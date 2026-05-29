/* ============================================================
   AUTH - Login modal logic
   ============================================================ */

function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('username').focus();
    document.getElementById('loginError').style.display = 'none';
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('loginForm').reset();
}

async function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const errorDiv = document.getElementById('loginError');

    if (!user || !pass) return;

    errorDiv.style.display = 'none';

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });

        const data = await response.json();

        if (data.status === 'ok') {
            localStorage.setItem('userRole', data.data.role);
            localStorage.setItem('userInfo', JSON.stringify(data.data.user));
            if (data.data.role === 'admin') {
                localStorage.setItem('isAdmin', 'true');
                window.location.href = '/admin/index.html';
            } else if (data.data.role === 'lecturer') {
                window.location.href = '/lecturer/index.html';
            }
        } else {
            errorDiv.textContent = data.message || 'Sai tên đăng nhập hoặc mật khẩu!';
            errorDiv.style.display = 'block';
        }
    } catch (err) {
        errorDiv.textContent = 'Lỗi kết nối máy chủ!';
        errorDiv.style.display = 'block';
    }
}
