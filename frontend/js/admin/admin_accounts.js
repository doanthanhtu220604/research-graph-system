/* ============================================================
   ADMIN ACCOUNTS — Quản lý tài khoản giảng viên
   ============================================================ */

let allAccounts = [];

async function loadAccounts() {
    try {
        const res  = await fetch(`${ADMIN_API_BASE}/accounts`);
        const data = await res.json();
        if (data.status === 'ok') {
            allAccounts = data.data || [];
            updateAccountStats();
            renderAccountsTable(allAccounts);
        }
    } catch (e) { console.error('Error loadAccounts', e); }
}


function renderAccountsTable(list) {
    const tbody = document.getElementById('adminAccountsBody');
    if (!tbody) return;

    if (list.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="loading-cell">Không có dữ liệu tài khoản</td></tr>';
        return;
    }

    tbody.innerHTML = list.map(acc => {
        let statusBadge = '';
        if (!acc.co_tai_khoan)                          statusBadge = '<span class="account-badge badge-no-acct"><i class="fas fa-exclamation-circle"></i> Chưa tạo</span>';
        else if (acc.trang_thai_tk === 'Hoạt động')     statusBadge = '<span class="account-badge badge-active"><i class="fas fa-check-circle"></i> Hoạt động</span>';
        else                                             statusBadge = '<span class="account-badge badge-locked"><i class="fas fa-lock"></i> Bị khoá</span>';

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

        const isCreated = !!acc.co_tai_khoan;
        const roleSelectHtml = `<select class="role-select" onchange="changeAccountRole('${acc.id}', this.value)" ${!isCreated ? 'disabled title="Cần tạo tài khoản trước"' : ''}>
            <option value="giang_vien" ${acc.vai_tro === 'giang_vien' ? 'selected' : ''}>Giảng viên</option>
            <option value="admin"      ${acc.vai_tro === 'admin'      ? 'selected' : ''}>Admin</option>
        </select>`;

        return `<tr>
            <td>${acc.id}</td>
            <td><strong>${acc.ho_va_ten}</strong><div style="font-size:12px;color:var(--text-muted);">${acc.hoc_vi || ''}</div></td>
            <td>${acc.username || acc.email || '<i style="color:#ccc">Trống</i>'}</td>
            <td>${acc.bo_mon || ''}</td>
            <td>${roleSelectHtml}</td>
            <td>${statusBadge}</td>
            <td>${actions}</td>
        </tr>`;
    }).join('');
}


async function changeAccountRole(gvId, newRole) {
    try {
        const mc = document.getElementById('mainContent');
        const sp = mc ? mc.scrollTop : 0;
        const res  = await fetch(`${ADMIN_API_BASE}/accounts/${gvId}/role`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ vai_tro: newRole })
        });
        const data = await res.json();
        if (data.status === 'ok') {
            await loadAccounts();
            if (mc) setTimeout(() => { mc.scrollTop = sp; }, 10);
        } else { alert('Lỗi: ' + data.message); }
    } catch (e) { console.error(e); alert('Lỗi kết nối máy chủ.'); }
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

    renderAccountsTable(filtered);
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
