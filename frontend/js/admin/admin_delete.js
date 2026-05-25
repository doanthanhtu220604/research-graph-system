/* ============================================================
   ADMIN DELETE — Soft Delete, Toast, Trash Badge
   ============================================================ */

async function deleteEntity(type, id) {
    if (!id) {
        alert("Bản ghi này hiện không có ID trên Neo4j để thao tác.");
        return;
    }

    const typeLabels = {
        'giang-vien':    'Giảng viên',
        'cong-trinh':    'Công trình',
        'de-tai':        'Đề tài',
        'linh-vuc':      'Lĩnh vực',
        'tac-gia-ngoai': 'Tác giả ngoài',
    };

    // Tạo modal xác nhận xóa mềm nếu chưa có
    if (!document.getElementById('softDeleteOverlay')) {
        const overlayHtml = `
        <div id="softDeleteOverlay" style="
            position:fixed; inset:0; background:rgba(0,0,0,0.45); backdrop-filter:blur(4px);
            z-index:9100; display:flex; align-items:center; justify-content:center;
            opacity:0; pointer-events:none; transition:opacity 0.2s;">
            <div style="background: var(--bg-secondary, #ffffff); border-radius:20px; padding:32px; max-width:420px; width:90%;
                        box-shadow: 0 15px 50px rgba(0,0,0,0.15); transform:scale(0.92);
                        transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1);" id="softDeleteBox">
                <div style="width:60px;height:60px;border-radius:50%;
                            background:linear-gradient(135deg,rgba(239,68,68,0.12),rgba(239,68,68,0.04));
                            display:flex;align-items:center;justify-content:center;
                            font-size:24px;color:#ef4444;margin:0 auto 16px;">
                    <i class="fas fa-trash-alt"></i>
                </div>
                <h3 style="font-size:17px;text-align:center;margin:0 0 8px;">Chuyển vào thùng rác?</h3>
                <p id="softDeleteDesc" style="font-size:13px;color:var(--text-muted);text-align:center;margin:0 0 18px;"></p>
                <div style="margin-bottom:18px;">
                    <label style="font-size:12px;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:6px;">
                        Ghi chú lý do (tùy chọn)
                    </label>
                    <input type="text" id="softDeleteNote"
                        placeholder="VD: Giảng viên đã nghỉ hưu, dữ liệu trùng lặp..."
                        style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:10px;
                               font-family:'Inter',sans-serif;font-size:13px;outline:none;
                               background:var(--bg-hover);color:var(--text-primary);">
                </div>
                <p style="font-size:11px;color:var(--text-muted);text-align:center;margin:0 0 20px;">
                    <i class="fas fa-info-circle" style="color:#4F8EF7;"></i>
                    Dữ liệu sẽ được lưu trong <a href="trash.html" style="color:#4F8EF7;font-weight:600;">Thùng rác</a>
                    và có thể khôi phục bất cứ lúc nào.
                </p>
                <div style="display:flex;gap:12px;justify-content:center;">
                    <button onclick="closeSoftDeleteModal()"
                        style="padding:10px 24px;border-radius:10px;background:var(--bg-hover);
                               border:1px solid var(--border-color);font-family:'Inter',sans-serif;
                               font-size:13px;font-weight:600;color:var(--text-secondary);cursor:pointer;">
                        Hủy
                    </button>
                    <button id="softDeleteConfirmBtn"
                        style="padding:10px 24px;border-radius:10px;
                               background:linear-gradient(135deg,#ef4444,#dc2626);
                               border:none;color:white;font-family:'Inter',sans-serif;
                               font-size:13px;font-weight:600;cursor:pointer;
                               box-shadow:0 4px 12px rgba(239,68,68,0.3);">
                        <i class="fas fa-trash-alt"></i> Xóa (vào thùng rác)
                    </button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML('beforeend', overlayHtml);
    }

    // Điền thông tin vào modal
    const label = typeLabels[type] || type;
    document.getElementById('softDeleteDesc').innerHTML =
        `<strong>${label} #${id}</strong> sẽ được chuyển vào thùng rác.<br>Bạn có thể khôi phục sau nếu cần.`;
    document.getElementById('softDeleteNote').value = '';

    // Gán handler
    const confirmBtn = document.getElementById('softDeleteConfirmBtn');
    confirmBtn.onclick = async () => {
        const note = document.getElementById('softDeleteNote').value.trim();
        closeSoftDeleteModal();

        const config = ENTITY_CONFIG[type];
        try {
            const mainContent = document.getElementById('mainContent');
            const scrollPos   = mainContent ? mainContent.scrollTop : 0;

            const res  = await fetch(`${config.adminApiUrl}/${id}`, {
                method:  'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ note })
            });
            const data = await res.json();

            if (data.status === 'ok') {
                showAdminToast(`✅ Đã chuyển ${label} vào thùng rác`, 'success');

                if (type === 'giang-vien')      await loadLecturers();
                else if (type === 'cong-trinh') await loadPublications();
                else if (type === 'de-tai')     await loadProjects();
                else if (type === 'linh-vuc')   await loadResearchFields();
                else if (type === 'tac-gia-ngoai') await loadExternalAuthors();
                else if (type === 'bo-mon')     await loadDepartments();

                if (mainContent) {
                    setTimeout(() => { mainContent.scrollTop = scrollPos; }, 10);
                }

                updateTrashBadge();
            } else {
                showAdminToast('Lỗi: ' + data.message, 'error');
            }
        } catch (err) {
            console.error(err);
            showAdminToast('Có lỗi xảy ra khi xóa dữ liệu.', 'error');
        }
    };

    // Mở modal
    const overlay = document.getElementById('softDeleteOverlay');
    overlay.style.pointerEvents = 'auto';
    overlay.style.opacity       = '1';
    document.getElementById('softDeleteBox').style.transform = 'scale(1)';

    // Close on outside click
    overlay.onclick = (e) => { if (e.target === overlay) closeSoftDeleteModal(); };
}


function closeSoftDeleteModal() {
    const overlay = document.getElementById('softDeleteOverlay');
    if (!overlay) return;
    overlay.style.opacity       = '0';
    overlay.style.pointerEvents = 'none';
    document.getElementById('softDeleteBox').style.transform = 'scale(0.92)';
}


/* ─── Admin Toast Notification ───────────────────────────────── */

function showAdminToast(msg, type = 'success') {
    let container = document.getElementById('adminToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'adminToastContainer';
        container.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column;gap:10px;';
        document.body.appendChild(container);
    }

    const colors = {
        success: 'linear-gradient(135deg,#10b981,#059669)',
        error:   'linear-gradient(135deg,#ef4444,#dc2626)',
        info:    'linear-gradient(135deg,#4F8EF7,#3b82f6)'
    };
    const icons = {
        success: 'fa-check-circle',
        error:   'fa-exclamation-circle',
        info:    'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.style.cssText = `padding:14px 20px;border-radius:12px;font-size:13px;font-weight:500;color:white;
        display:flex;align-items:center;gap:10px;box-shadow:0 8px 24px rgba(0,0,0,0.15);min-width:260px;
        background:${colors[type] || colors.info};animation:slideInRight 0.3s ease;font-family:'Inter',sans-serif;`;
    toast.innerHTML = `<i class="fas ${icons[type] || 'fa-bell'}"></i> ${msg}`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity    = '0';
        toast.style.transition = 'opacity 0.4s';
        setTimeout(() => toast.remove(), 400);
    }, 3500);
}


/* ─── Update trash badge on sidebar ─────────────────────────── */

async function updateTrashBadge() {
    try {
        const res   = await fetch('/api/admin/trash/count');
        const data  = await res.json();
        const badge = document.getElementById('trashNavBadge');
        if (badge && data.status === 'ok') {
            badge.textContent   = data.count;
            badge.style.display = data.count > 0 ? 'inline' : 'none';
        }
    } catch (_) {}
}
