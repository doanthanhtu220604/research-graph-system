/* ============================================================
   ADMIN ACCOUNTS — Quản lý tài khoản Giảng viên & Admin
   ============================================================ */

const ACC_PAGE_SIZE = 15;
let accCurrentPage = 1;
let accFilteredCache = [];
let allAccounts = [];


// ─── GIẢNG VIÊN ─────────────────────────────────────────────

async function loadAccounts() {
    try {
        const res  = await fetch(`${ADMIN_API_BASE}/accounts`);
        const data = await res.json();
        if (data.status === 'ok') {
            allAccounts = data.data || [];
            updateAccountStats();
            accFilteredCache = allAccounts;
            accCurrentPage = 1;
            renderAccountsTable(accFilteredCache, accCurrentPage);
        }
    } catch (e) { console.error('Error loadAccounts', e); }
}


function renderAccountsTable(list, page) {
    const tbody = document.getElementById('adminAccountsBody');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">Không có dữ liệu tài khoản</td></tr>';
        renderPagination('accPagination', 0, 1, ACC_PAGE_SIZE, () => {});
        return;
    }

    const start    = (page - 1) * ACC_PAGE_SIZE;
    const pageData = list.slice(start, start + ACC_PAGE_SIZE);

    tbody.innerHTML = pageData.map(acc => {
        let statusBadge = '';
        if (!acc.co_tai_khoan)
            statusBadge = '<span class="account-badge badge-no-acct"><i class="fas fa-exclamation-circle"></i> Chưa tạo</span>';
        else if (acc.trang_thai_tk === 'Hoạt động')
            statusBadge = '<span class="account-badge badge-active"><i class="fas fa-check-circle"></i> Hoạt động</span>';
        else
            statusBadge = '<span class="account-badge badge-locked"><i class="fas fa-lock"></i> Bị khoá</span>';

        const safeName     = (acc.ho_va_ten || '').replace(/'/g, "\\'");
        const safeUsername = (acc.username  || '').replace(/'/g, "\\'");
        const safeEmail    = (acc.email     || '').replace(/'/g, "\\'");
        const infoBtn = `<button class="btn btn-sm btn-view" title="Xem chi tiết" onclick="openInfoModal('${safeName}','${safeUsername}','${safeEmail}')"><i class="fas fa-eye"></i></button>`;

        let actions = '';
        if (!acc.co_tai_khoan) {
            actions = `${infoBtn}<button class="btn btn-sm btn-primary" onclick="openPwModal('${acc.id}','set','${safeEmail}')"><i class="fas fa-key"></i> Tạo TK</button>`;
        } else {
            const lockIcon     = acc.trang_thai_tk === 'Hoạt động' ? 'fa-lock' : 'fa-unlock';
            const lockBtnColor = acc.trang_thai_tk === 'Hoạt động' ? 'var(--accent-red)' : '#28a745';
            actions = `${infoBtn}
                <button class="btn btn-sm btn-view" style="color:var(--accent-orange);border-color:rgba(245,158,11,0.2);background:rgba(245,158,11,0.1);" title="Đặt lại mật khẩu" onclick="openPwModal('${acc.id}','reset')"><i class="fas fa-redo"></i></button>
                <button class="btn btn-sm" style="color:${lockBtnColor};border-color:${lockBtnColor};" title="${acc.trang_thai_tk === 'Hoạt động' ? 'Khoá' : 'Mở khoá'}" onclick="toggleAccountStatus('${acc.id}')"><i class="fas ${lockIcon}"></i></button>`;
        }

        return `<tr>
            <td>${acc.id}</td>
            <td><strong>${acc.ho_va_ten}</strong><div style="font-size:12px;color:var(--text-muted);">${acc.hoc_vi || ''}</div></td>
            <td>${acc.username || acc.email || '<i style="color:#ccc">Trống</i>'}</td>
            <td>${statusBadge}</td>
            <td>${actions}</td>
        </tr>`;
    }).join('');

    renderPagination('accPagination', list.length, page, ACC_PAGE_SIZE, (newPage) => {
        accCurrentPage = newPage;
        renderAccountsTable(accFilteredCache, accCurrentPage);
    });
}


function filterAccounts() {
    const searchText = (document.getElementById('filterAccName')?.value  || '').toLowerCase();
    const statusVal  =  document.getElementById('filterAccStatus')?.value || '';

    const filtered = allAccounts.filter(acc => {
        const matchSearch = (acc.ho_va_ten || '').toLowerCase().includes(searchText) ||
                            (acc.email || '').toLowerCase().includes(searchText)     ||
                            (acc.username || '').toLowerCase().includes(searchText);
        let matchStatus = true;
        if (statusVal === 'co_tai_khoan') matchStatus = acc.co_tai_khoan;
        else if (statusVal === 'chua_co') matchStatus = !acc.co_tai_khoan;
        else if (statusVal)               matchStatus = acc.co_tai_khoan && (acc.trang_thai_tk === statusVal);
        return matchSearch && matchStatus;
    });

    accFilteredCache = filtered;
    accCurrentPage = 1;
    renderAccountsTable(accFilteredCache, accCurrentPage);
}


async function toggleAccountStatus(id) {
    if (!confirm('Bạn có chắc muốn thay đổi trạng thái tài khoản này?')) return;
    try {
        const mc  = document.getElementById('mainContent');
        const sp  = mc ? mc.scrollTop : 0;
        const res  = await fetch(`${ADMIN_API_BASE}/accounts/${id}/toggle-status`, { method: 'PUT' });
        const data = await res.json();
        if (data.status === 'ok') {
            await loadAccounts();
            if (mc) setTimeout(() => { mc.scrollTop = sp; }, 10);
        } else { alert(data.message); }
    } catch (e) { console.error(e); }
}


function updateAccountStats() {
    const total       = allAccounts.length;
    const haveAccount = allAccounts.filter(a => a.co_tai_khoan).length;
    const noAccount   = total - haveAccount;
    const locked      = allAccounts.filter(a => a.co_tai_khoan && a.trang_thai_tk !== 'Hoạt động').length;

    if (document.getElementById('statTotal'))     document.getElementById('statTotal').innerText     = total;
    if (document.getElementById('statActive'))    document.getElementById('statActive').innerText    = haveAccount;
    if (document.getElementById('statNoAccount')) document.getElementById('statNoAccount').innerText = noAccount;
    if (document.getElementById('statLocked'))    document.getElementById('statLocked').innerText    = locked;
}


// ─── ADMIN ACCOUNTS ──────────────────────────────────────────

let allAdmins = [];

async function loadAdminAccounts() {
    try {
        const res  = await fetch(`${ADMIN_API_BASE}/accounts/admins`);
        const data = await res.json();
        if (data.status === 'ok') {
            allAdmins = data.data || [];
            
            // Hide create admin button if not default admin
            const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}') || {};
            const createBtn = document.querySelector('button[onclick="openCreateAdminModal()"]');
            if (createBtn) {
                if (currentUser.id !== 'admin') {
                    createBtn.style.style = 'none'; // safe fallback
                    createBtn.style.setProperty('display', 'none', 'important');
                } else {
                    createBtn.style.setProperty('display', 'inline-flex', 'important');
                }
            }
            
            renderAdminTable(allAdmins);
        }
    } catch (e) { console.error('Error loadAdminAccounts', e); }
}

function renderAdminTable(list) {
    const tbody = document.getElementById('adminAdminBody');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading-cell">Chưa có tài khoản Admin nào khác</td></tr>';
        return;
    }

    tbody.innerHTML = list.map(a => {
        const isDefault = a.id === 'admin';
        const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}') || {};
        const isSelf = a.id === currentUser.id;
        const isDefaultAdmin = currentUser.id === 'admin';

        let actionsHtml = '';
        if (isDefault) {
            actionsHtml = `<span style="color:var(--text-muted);font-size:12px;">Mặc định</span>`;
        } else {
            const resetBtn = `<button class="btn btn-sm btn-view" style="color:var(--accent-orange);border-color:rgba(245,158,11,0.2);background:rgba(245,158,11,0.1);" title="Đặt lại mật khẩu" onclick="openAdminResetPwModal('${a.id}')"><i class="fas fa-redo"></i></button>`;
            
            let deleteBtn = '';
            if (isSelf) {
                deleteBtn = `<span style="color:#3b82f6;font-size:12px;font-weight:600;margin-left:8px;"><i class="fas fa-user-check"></i> Đang đăng nhập</span>`;
            } else if (isDefaultAdmin) {
                deleteBtn = `<button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteAdminAccount('${a.id}','${(a.ho_va_ten||'').replace(/'/g,"\\'")}')"><i class="fas fa-trash"></i></button>`;
            }
            
            actionsHtml = `<div style="display:inline-flex;align-items:center;gap:6px;">${resetBtn}${deleteBtn}</div>`;
        }

        const nameStyle = isDefault ? 'style="color:#d97706;font-weight:700;"' : '';
        const badgeHtml = isDefault ? ` <span class="account-badge" style="background:#fef3c7;color:#d97706;border:1px solid #fcd34d;font-size:11px;margin-left:6px;padding:2px 6px;border-radius:4px;font-weight:600;"><i class="fas fa-crown"></i> Admin tối cao</span>` : '';
        const rowStyle = isDefault ? 'style="background:rgba(245,158,11,0.04);"' : '';

        return `<tr ${rowStyle}>
            <td><strong ${nameStyle}>${a.ho_va_ten || a.username}</strong>${badgeHtml}</td>
            <td>${a.username}</td>
            <td>${a.email || '<i style="color:#ccc">Trống</i>'}</td>
            <td>${actionsHtml}</td>
        </tr>`;
    }).join('');
}

async function deleteAdminAccount(id, name) {
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}') || {};
    if (currentUser.id === id) {
        alert("Bạn không thể tự xóa tài khoản của chính mình!");
        return;
    }
    if (!confirm(`Xóa tài khoản Admin "${name}"? Hành động này không thể hoàn tác.`)) return;
    try {
        const res  = await fetch(`${ADMIN_API_BASE}/accounts/admins/${id}?requester_id=${encodeURIComponent(currentUser.id || '')}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.status === 'ok') {
            showAdminToast('Đã xóa tài khoản Admin', 'success');
            await loadAdminAccounts();
        } else { showAdminToast('Lỗi: ' + data.message, 'error'); }
    } catch (e) { showAdminToast('Lỗi kết nối', 'error'); }
}
