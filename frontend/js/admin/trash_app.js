/* ============================================================
   TRASH APP - Thùng rác Knowledge Map Admin
   ============================================================ */

const TRASH_API = '/api/admin/trash';

let allTrashItems   = [];   // toàn bộ dữ liệu từ server
let currentFilter   = 'all';
let pendingAction   = null; // { type: 'permanent'|'empty', entityType, id }

// ─────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra quyền truy cập Admin
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'admin') {
        window.location.href = '/user/login.html';
        return;
    }

    loadTrash();
    updateClock();
    setInterval(updateClock, 1000);

    // Sidebar toggle (nếu có)
    const menuToggle = document.getElementById('menuToggle');
    const sidebar    = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            mainContent?.classList.toggle('expanded');
        });
    }
});

// ─────────────────────────────────────────────────────────────
// LOAD DATA
// ─────────────────────────────────────────────────────────────
async function loadTrash() {
    try {
        const res  = await fetch(TRASH_API);
        const data = await res.json();

        if (data.status !== 'ok') {
            showToast('Lỗi tải dữ liệu thùng rác', 'error');
            return;
        }

        allTrashItems = data.data || [];
        updateCounts();
        renderTrash();

        // Enable / disable empty button
        const emptyBtn = document.getElementById('btnEmptyTrash');
        if (emptyBtn) emptyBtn.disabled = allTrashItems.length === 0;

    } catch (err) {
        console.error('[Trash] Load error:', err);
        showToast('Không thể kết nối server', 'error');
        document.getElementById('trashGrid').innerHTML =
            '<div class="trash-empty" style="grid-column:1/-1"><i class="fas fa-exclamation-triangle"></i><p>Lỗi kết nối. Vui lòng thử lại.</p></div>';
    }
}

// ─────────────────────────────────────────────────────────────
// COUNT & STATS
// ─────────────────────────────────────────────────────────────
function updateCounts() {
    const gvCount = allTrashItems.filter(i => i.type === 'giang-vien').length;
    const ctCount = allTrashItems.filter(i => i.type === 'cong-trinh').length;
    const dtCount = allTrashItems.filter(i => i.type === 'de-tai').length;
    const lvCount = allTrashItems.filter(i => i.type === 'linh-vuc').length;
    const tgnCount = allTrashItems.filter(i => i.type === 'tac-gia-ngoai').length;
    const total   = allTrashItems.length;

    // Chip stats trên header
    setText('statGV', gvCount);
    setText('statCT', ctCount);
    setText('statDT', dtCount);
    setText('statLV', lvCount);
    setText('statTGN', tgnCount);

    // Filter button counts
    setText('cntAll', total);
    setText('cntGV',  gvCount);
    setText('cntCT',  ctCount);
    setText('cntDT',  dtCount);
    setText('cntLV',  lvCount);
    setText('cntTGN', tgnCount);

    // Sidebar badge
    const badge = document.getElementById('sidebarTrashBadge');
    if (badge) {
        badge.textContent = total;
        badge.style.display = total > 0 ? 'inline' : 'none';
    }
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

// ─────────────────────────────────────────────────────────────
// FILTER & SEARCH
// ─────────────────────────────────────────────────────────────
function setFilter(type) {
    currentFilter = type;

    // Update active button
    ['all','giang-vien','cong-trinh','de-tai', 'linh-vuc', 'tac-gia-ngoai'].forEach(t => {
        const btn = document.getElementById('filter' + {
            'all': 'All', 'giang-vien': 'GV', 'cong-trinh': 'CT', 'de-tai': 'DT', 'linh-vuc': 'LV', 'tac-gia-ngoai': 'TGN'
        }[t]);
        if (btn) btn.classList.toggle('active', t === type);
    });

    renderTrash();
}

function renderTrash() {
    const grid      = document.getElementById('trashGrid');
    const searchVal = (document.getElementById('trashSearch')?.value || '').toLowerCase().trim();

    let items = allTrashItems;

    // Filter by type
    if (currentFilter !== 'all') {
        items = items.filter(i => i.type === currentFilter);
    }

    // Filter by search
    if (searchVal) {
        const q = searchVal.normalize('NFC').toLowerCase().trim();
        items = items.filter(i => {
            const ten = (i.ten || '').normalize('NFC').toLowerCase();
            const sub = (i.sub || '').normalize('NFC').toLowerCase();
            const note = (i.note || '').normalize('NFC').toLowerCase();
            return ten.includes(q) || sub.includes(q) || note.includes(q);
        });
    }

    if (items.length === 0) {
        grid.innerHTML = `
            <div class="trash-empty">
                <i class="fas fa-check-circle" style="color:#10b981;opacity:0.5;"></i>
                <p style="font-size:16px;font-weight:600;margin-bottom:6px;">Thùng rác trống</p>
                <p>Tất cả dữ liệu đang ổn định. Không có mục nào cần xử lý.</p>
            </div>`;
        return;
    }

    grid.innerHTML = items.map(item => buildCard(item)).join('');
}

// ─────────────────────────────────────────────────────────────
// CARD HTML
// ─────────────────────────────────────────────────────────────
function buildCard(item) {
    const iconMap = {
        'giang-vien': 'fa-user-tie',
        'cong-trinh': 'fa-file-alt',
        'de-tai':     'fa-flask',
        'linh-vuc':   'fa-layer-group',
        'tac-gia-ngoai': 'fa-user-friends'
    };
    const icon = iconMap[item.type] || 'fa-question';

    const timeStr = item.deleted_at
        ? formatTime(item.deleted_at)
        : '—';

    const noteBadge = item.note
        ? `<span style="font-size:11px;color:var(--text-muted);margin-top:4px;display:block;">
               <i class="fas fa-sticky-note" style="font-size:10px;"></i> ${escHtml(item.note)}
           </span>`
        : '';

    const requestBadge = item.trang_thai === 'Yêu cầu xóa'
        ? `<div style="margin-top:8px; padding:6px 10px; background:rgba(231,76,60,0.1); border-left:3px solid #e74c3c; border-radius:4px;">
               <span style="font-size:11px; color:#e74c3c; font-weight:700; display:flex; align-items:center; gap:5px;">
                   <i class="fas fa-exclamation-circle"></i> GIẢNG VIÊN YÊU CẦU XÓA VĨNH VIỄN
               </span>
           </div>`
        : (item.trang_thai === 'Yêu cầu khôi phục'
            ? `<div style="margin-top:8px; padding:6px 10px; background:rgba(46,204,113,0.1); border-left:3px solid #2ecc71; border-radius:4px;">
                   <span style="font-size:11px; color:#2ecc71; font-weight:700; display:flex; align-items:center; gap:5px;">
                       <i class="fas fa-undo"></i> GIẢNG VIÊN YÊU CẦU KHÔI PHỤC
                   </span>
               </div>`
            : '');

    const safeId   = escHtml(item.id);
    const safeType = escHtml(item.type);
    const safeTen  = escHtml(item.ten);
    const safeSub  = escHtml(item.sub);

    return `
    <div class="trash-card" data-type="${safeType}" data-id="${safeId}" id="card-${safeId}">
        <div class="trash-card-header">
            <div class="trash-card-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="trash-card-info">
                <div class="trash-card-type">${escHtml(item.type_label)}</div>
                <div class="trash-card-name" title="${safeTen}">${safeTen}</div>
                <div class="trash-card-sub">${safeSub}</div>
                ${noteBadge}
                ${requestBadge}
            </div>
        </div>
        <div class="trash-card-meta">
            <div class="trash-card-time">
                <i class="far fa-clock"></i> Xóa lúc ${timeStr}
            </div>
            <div class="trash-card-actions">
                ${item.trang_thai === 'Yêu cầu khôi phục'
                    ? `<button class="btn-restore" style="background:#2ecc71;" onclick="approveRestoreItem('${safeType}','${safeId}')">
                         <i class="fas fa-check"></i> Duyệt khôi phục
                       </button>`
                    : `<button class="btn-restore" onclick="restoreItem('${safeType}','${safeId}')">
                         <i class="fas fa-undo-alt"></i> Khôi phục
                       </button>`
                }
                <button class="btn-del-perm" title="Xóa vĩnh viễn" onclick="confirmPermanentDelete('${safeType}','${safeId}','${safeTen}')">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────
// RESTORE
// ─────────────────────────────────────────────────────────────
async function restoreItem(type, id) {
    const card = document.getElementById('card-' + id);
    if (card) {
        card.style.transition = 'all 0.3s';
        card.style.opacity    = '0.5';
        card.style.pointerEvents = 'none';
    }

    try {
        const res  = await fetch(`${TRASH_API}/${type}/${id}/restore`, { method: 'PUT' });
        const data = await res.json();

        if (data.status === 'ok') {
            showToast('✅ Đã khôi phục thành công!', 'success');
            // Remove from local list
            allTrashItems = allTrashItems.filter(i => i.id !== id);
            updateCounts();
            renderTrash();
            if (window.updateAdminPendingBadges) window.updateAdminPendingBadges();
            // Update empty button
            const emptyBtn = document.getElementById('btnEmptyTrash');
            if (emptyBtn) emptyBtn.disabled = allTrashItems.length === 0;
        } else {
            showToast('Lỗi: ' + data.message, 'error');
            if (card) { card.style.opacity = '1'; card.style.pointerEvents = ''; }
        }
    } catch (err) {
        showToast('Lỗi kết nối server', 'error');
        if (card) { card.style.opacity = '1'; card.style.pointerEvents = ''; }
    }
}

async function approveRestoreItem(type, id) {
    if (!confirm('Bạn có chắc muốn phê duyệt yêu cầu khôi phục này?')) return;
    
    try {
        const res  = await fetch(`${TRASH_API}/${type}/${id}/approve-restore`, { method: 'PUT' });
        const data = await res.json();

        if (data.status === 'ok') {
            showToast('✅ Đã phê duyệt khôi phục!', 'success');
            allTrashItems = allTrashItems.filter(i => i.id !== id);
            updateCounts();
            renderTrash();
            if (window.updateAdminPendingBadges) window.updateAdminPendingBadges();
        } else {
            showToast('Lỗi: ' + data.message, 'error');
        }
    } catch (err) {
        showToast('Lỗi kết nối server', 'error');
    }
}

// ─────────────────────────────────────────────────────────────
// PERMANENT DELETE
// ─────────────────────────────────────────────────────────────
function confirmPermanentDelete(type, id, name) {
    pendingAction = { action: 'permanent', type, id };

    document.getElementById('confirmIcon').innerHTML    = '<i class="fas fa-fire-alt"></i>';
    document.getElementById('confirmTitle').textContent = 'Xóa vĩnh viễn?';
    document.getElementById('confirmMessage').innerHTML =
        `<strong>${escHtml(name)}</strong> sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu.<br>
         <span style="color:#ef4444;font-weight:600;">Hành động này không thể hoàn tác!</span>`;
    document.getElementById('confirmBtn').textContent = 'Xóa vĩnh viễn';

    document.getElementById('confirmOverlay').classList.add('active');
}

// ─────────────────────────────────────────────────────────────
// EMPTY TRASH
// ─────────────────────────────────────────────────────────────
function confirmEmptyTrash() {
    if (allTrashItems.length === 0) return;
    pendingAction = { action: 'empty' };

    document.getElementById('confirmIcon').innerHTML    = '<i class="fas fa-trash-alt"></i>';
    document.getElementById('confirmTitle').textContent = 'Dọn sạch thùng rác?';
    document.getElementById('confirmMessage').innerHTML =
        `<strong>${allTrashItems.length} mục</strong> sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu.<br>
         <span style="color:#ef4444;font-weight:600;">Không thể khôi phục sau khi xác nhận!</span>`;
    document.getElementById('confirmBtn').textContent = 'Dọn sạch';

    document.getElementById('confirmOverlay').classList.add('active');
}

// ─────────────────────────────────────────────────────────────
// HELPERS (moved/maintained functions)
// ─────────────────────────────────────────────────────────────
function closeConfirm() {
    document.getElementById('confirmOverlay').classList.remove('active');
    pendingAction = null;
}

async function executeConfirm() {
    if (!pendingAction) return;
    
    const actionData = { ...pendingAction };
    closeConfirm();

    if (actionData.action === 'permanent') {
        await doPermanentDelete(actionData.type, actionData.id);
    } else if (actionData.action === 'empty') {
        await doEmptyTrash();
    }
}

async function doPermanentDelete(type, id) {
    try {
        const res  = await fetch(`${TRASH_API}/${type}/${id}/permanent`, { method: 'DELETE' });
        const data = await res.json();

        if (data.status === 'ok') {
            showToast('🗑️ Đã xóa vĩnh viễn', 'info');
            allTrashItems = allTrashItems.filter(i => i.id !== id);
            updateCounts();
            renderTrash();
            if (window.updateAdminPendingBadges) window.updateAdminPendingBadges();
            const emptyBtn = document.getElementById('btnEmptyTrash');
            if (emptyBtn) emptyBtn.disabled = allTrashItems.length === 0;
        } else {
            showToast('Lỗi: ' + data.message, 'error');
        }
    } catch (err) {
        showToast('Lỗi kết nối server', 'error');
    }
}

async function doEmptyTrash() {
    const emptyBtn = document.getElementById('btnEmptyTrash');
    if (emptyBtn) { emptyBtn.disabled = true; emptyBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xóa...'; }

    try {
        const res  = await fetch(`${TRASH_API}/empty`, { method: 'DELETE' });
        const data = await res.json();

        if (data.status === 'ok') {
            showToast('🗑️ Đã dọn sạch thùng rác', 'info');
            allTrashItems = [];
            updateCounts();
            renderTrash();
            if (window.updateAdminPendingBadges) window.updateAdminPendingBadges();
        } else {
            showToast('Lỗi: ' + data.message, 'error');
        }
    } catch (err) {
        showToast('Lỗi kết nối server', 'error');
    } finally {
        if (emptyBtn) {
            emptyBtn.innerHTML = '<i class="fas fa-fire-alt"></i> Dọn sạch thùng rác';
            emptyBtn.disabled  = allTrashItems.length === 0;
        }
    }
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function formatTime(ts) {
    if (!ts) return '—';
    // Neo4j timestamp is in ms since epoch
    const d = new Date(Number(ts));
    if (isNaN(d)) return '—';
    return d.toLocaleString('vi-VN', { hour12: false, hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric' });
}

function escHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconMap = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${iconMap[type] || 'fa-bell'}"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.4s forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}

// Đăng xuất admin
function logoutAdmin() {
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userInfo');
    window.location.href = '/user/login.html';
}

// Close confirm overlay on outside click
document.getElementById('confirmOverlay')?.addEventListener('click', function(e) {
    if (e.target === this) closeConfirm();
});
