/* ============================================================
   ADMIN RELATIONS — Quản lý liên kết (Tác giả / Thành viên)
   ============================================================ */

async function openRelationModal(type, entityId, entityName = null) {
    if (!document.getElementById('role-toggle-styles')) {
        const style = document.createElement('style');
        style.id = 'role-toggle-styles';
        style.textContent = `
            .role-item-row { position:relative; padding:8px; border-radius:6px; transition:background 0.2s; }
            .role-item-row:hover { background:rgba(79,142,247,0.05); }
            .btn-role-switch { position:absolute; right:10px; top:50%; transform:translateY(-50%); display:none; padding:4px 10px; font-size:11px; background:var(--accent-blue); color:white; border:none; border-radius:4px; cursor:pointer; z-index:10; box-shadow:0 2px 4px rgba(0,0,0,0.1); }
            .role-item-row:hover .btn-role-switch { display:block; }
            .btn-role-switch:hover { filter:brightness(1.1); }
        `;
        document.head.appendChild(style);
    }

    if (!document.getElementById('adminRelationModalOverlay')) {
        createRelationModalHtml();
    }

    if (!entityName && currentEntitiesData[type]) {
        const item = currentEntitiesData[type].find(x => x.id === entityId);
        if (item) entityName = item.ten_cong_trinh || item.ten_de_tai || item.ho_va_ten || 'N/A';
    }

    document.getElementById('relEntityType').value = type;
    document.getElementById('relEntityId').value   = entityId;
    document.getElementById('adminRelationModalTitle').textContent = `Liên kết: ${entityName || 'N/A'}`;
    document.getElementById('adminRelationModalOverlay').classList.add('active');
    document.getElementById('relFormBody').innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Đang tải danh sách nhân sự...</p>';

    try {
        const [gvRes, tgnRes] = await Promise.all([
            fetch(`${API_BASE}/giang-vien`),
            fetch(`${ADMIN_API_BASE}/tac-gia-ngoai`)
        ]);
        const allGVs  = (await gvRes.json()).data  || [];
        const allTGNs = (await tgnRes.json()).data  || [];

        if (type === 'cong-trinh') {
            const [relGvRes, relTgnRes] = await Promise.all([
                fetch(`${ADMIN_API_BASE}/relations/cong-trinh/${entityId}/giang-vien`),
                fetch(`${ADMIN_API_BASE}/relations/cong-trinh/${entityId}/tac-gia-ngoai`)
            ]);
            const relGv  = (await relGvRes.json()).data  || [];
            const relTgn = (await relTgnRes.json()).data || [];

            const tacGiaChinhIds    = relGv.filter(r => r.vai_tro === 'TAC_GIA_CHINH').map(r => r.id);
            const congSuIds         = relGv.filter(r => r.vai_tro === 'CONG_SU' || r.vai_tro === 'LA_TAC_GIA_CUA').map(r => r.id);
            const tgnTacGiaChinhIds = relTgn.filter(r => r.vai_tro === 'TAC_GIA_CHINH').map(r => r.id);
            const tgnCongSuIds      = relTgn.filter(r => r.vai_tro === 'CONG_SU' || r.vai_tro === 'LA_TAC_GIA_CUA' || r.vai_tro === 'DONG_TAC_GIA').map(r => r.id);

            const gvRowMain   = allGVs.map(gv => buildGvRow(gv, tacGiaChinhIds.includes(gv.id),  'gv_tac_gia_chinh', 'main',   'Sang Đồng tác giả', 'switchAuthorRole')).join('');
            const gvRowCollab = allGVs.map(gv => buildGvRow(gv, congSuIds.includes(gv.id),         'gv_cong_su',       'collab', 'Sang Tác giả chính', 'switchAuthorRole')).join('');
            const tgnRowMain  = allTGNs.map(t  => buildTgnRow(t, tgnTacGiaChinhIds.includes(t.id), 'tgn_tac_gia_chinh','main',   'Sang Đồng tác giả', 'switchTgnPubRole')).join('');
            const tgnRowCol   = allTGNs.map(t  => buildTgnRow(t, tgnCongSuIds.includes(t.id),      'tgn_cong_su',      'collab', 'Sang Tác giả chính', 'switchTgnPubRole')).join('');

            document.getElementById('relFormBody').innerHTML = buildRelHtml(
                'NHÂN SỰ TRONG KHOA', 'Tác giả chính (nội bộ):', gvRowMain, 'Đồng tác giả (nội bộ):', gvRowCollab,
                'NHÂN SỰ NGOÀI KHOA',  'Tác giả chính ngoài:',   tgnRowMain, 'Đồng tác giả ngoài:',   tgnRowCol
            );

        } else if (type === 'de-tai') {
            const [relGvRes, relTgnRes] = await Promise.all([
                fetch(`${ADMIN_API_BASE}/relations/de-tai/${entityId}/giang-vien`),
                fetch(`${ADMIN_API_BASE}/relations/de-tai/${entityId}/tac-gia-ngoai`)
            ]);
            const relGv  = (await relGvRes.json()).data  || [];
            const relTgn = (await relTgnRes.json()).data || [];

            const chuNhiemIds    = relGv.filter(r => r.vai_tro === 'CHU_NHIEM').map(r => r.id);
            const thamGiaIds     = relGv.filter(r => r.vai_tro === 'THAM_GIA').map(r => r.id);
            const tgnChuNhiemIds = relTgn.filter(r => r.vai_tro === 'CHU_NHIEM').map(r => r.id);
            const tgnThamGiaIds  = relTgn.filter(r => r.vai_tro === 'THAM_GIA' || r.vai_tro === 'DONG_TAC_GIA').map(r => r.id);

            const gvRowLead   = allGVs.map(gv => buildGvRow(gv, chuNhiemIds.includes(gv.id),    'gv_chu_nhiem', 'lead',   'Sang Thành viên', 'switchMemberRole')).join('');
            const gvRowMember = allGVs.map(gv => buildGvRow(gv, thamGiaIds.includes(gv.id),      'gv_tham_gia',  'member', 'Sang Chủ nhiệm',  'switchMemberRole')).join('');
            const tgnRowLead  = allTGNs.map(t  => buildTgnRow(t, tgnChuNhiemIds.includes(t.id),  'tgn_chu_nhiem','lead',   'Sang Thành viên', 'switchTgnMemberRole')).join('');
            const tgnRowMem   = allTGNs.map(t  => buildTgnRow(t, tgnThamGiaIds.includes(t.id),   'tgn_tham_gia', 'member', 'Sang Chủ nhiệm',  'switchTgnMemberRole')).join('');

            document.getElementById('relFormBody').innerHTML = buildRelHtml(
                'NHÂN SỰ TRONG KHOA', 'Chủ nhiệm nội bộ:', gvRowLead, 'Thành viên nội bộ:', gvRowMember,
                'NHÂN SỰ NGOÀI KHOA', 'Chủ nhiệm ngoài:',  tgnRowLead, 'Thành viên ngoài:', tgnRowMem
            );
        }
    } catch (e) {
        document.getElementById('relFormBody').innerHTML = `<p style="color:red">Lỗi tải dữ liệu: ${e.message}</p>`;
    }
}


function buildGvRow(gv, checked, inputName, role, switchLabel, switchFn) {
    return `<div class="role-item-row" id="row-${role === 'lead' ? 'lead' : role === 'member' ? 'member' : role}-${gv.id}">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;color:var(--text-primary);font-size:13px;margin:0;">
            <input type="checkbox" name="${inputName}" value="${gv.id}" ${checked ? 'checked' : ''} onchange="syncRoleCheckbox('${gv.id}', '${role}')">
            <span>${gv.ho_va_ten}</span>
        </label>
        ${checked ? `<button type="button" class="btn-role-switch" onclick="${switchFn}('${gv.id}', '${role}')"><i class="fas fa-exchange-alt"></i> ${switchLabel}</button>` : ''}
    </div>`;
}

function buildTgnRow(tgn, checked, inputName, role, switchLabel, switchFn) {
    const syncFn = (inputName.startsWith('tgn_chu') || inputName.startsWith('tgn_tham')) ? 'syncTgnRoleCheckbox' : 'syncTgnPubRoleCheckbox';
    const rowId  = inputName.startsWith('tgn_chu') ? `row-tgn-lead-${tgn.id}` : inputName.startsWith('tgn_tham') ? `row-tgn-member-${tgn.id}` : inputName.includes('chinh') ? `row-tgn-main-${tgn.id}` : `row-tgn-collab-${tgn.id}`;
    return `<div class="role-item-row" id="${rowId}">
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;color:var(--text-primary);font-size:13px;margin:0;">
            <input type="checkbox" name="${inputName}" value="${tgn.id}" ${checked ? 'checked' : ''} onchange="${syncFn}('${tgn.id}', '${role}')">
            <span>${tgn.ho_va_ten} <small style="color:var(--text-muted)">(${tgn.don_vi_cong_tac || 'N/A'})</small></span>
        </label>
        ${checked ? `<button type="button" class="btn-role-switch" onclick="${switchFn}('${tgn.id}', '${role}')"><i class="fas fa-exchange-alt"></i> ${switchLabel}</button>` : ''}
    </div>`;
}

function buildRelHtml(sec1Title, col1Label, col1Rows, col2Label, col2Rows, sec2Title, col3Label, col3Rows, col4Label, col4Rows) {
    const box = (rows) => `<div style="max-height:250px;overflow-y:auto;border:1px solid var(--border-color);padding:10px;border-radius:8px;background:white;">${rows}</div>`;
    return `<div style="display:flex;flex-direction:column;gap:24px;">
        <div style="background:rgba(79,142,247,0.05);padding:15px;border-radius:10px;border-left:4px solid var(--accent-blue);">
            <h3 style="font-size:14px;margin-bottom:15px;"><i class="fas fa-university"></i> ${sec1Title}</h3>
            <div style="display:flex;gap:20px;flex-wrap:wrap;">
                <div style="flex:1;min-width:280px;"><p style="margin-bottom:10px;color:var(--accent-blue);"><b>${col1Label}</b></p>${box(col1Rows)}</div>
                <div style="flex:1;min-width:280px;"><p style="margin-bottom:10px;color:#10b981;"><b>${col2Label}</b></p>${box(col2Rows)}</div>
            </div>
        </div>
        <div style="background:rgba(230,126,34,0.05);padding:15px;border-radius:10px;border-left:4px solid #e67e22;">
            <h3 style="font-size:14px;margin-bottom:15px;color:#e67e22;"><i class="fas fa-globe"></i> ${sec2Title}</h3>
            <div style="display:flex;gap:20px;flex-wrap:wrap;">
                <div style="flex:1;min-width:280px;"><p style="margin-bottom:10px;color:#e67e22;"><b>${col3Label}</b></p>${box(col3Rows)}</div>
                <div style="flex:1;min-width:280px;"><p style="margin-bottom:10px;color:#8b5cf6;"><b>${col4Label}</b></p>${box(col4Rows)}</div>
            </div>
        </div>
    </div>`;
}


function closeRelationModal() {
    const el = document.getElementById('adminRelationModalOverlay');
    if (el) el.classList.remove('active');
}


async function saveRelations(e) {
    if (e) e.preventDefault();
    const type     = document.getElementById('relEntityType').value;
    const entityId = document.getElementById('relEntityId').value;

    try {
        if (type === 'cong-trinh') {
            const tacGiaChinhIds    = [...document.querySelectorAll('input[name="gv_tac_gia_chinh"]:checked')].map(cb => cb.value);
            const congSuIds         = [...document.querySelectorAll('input[name="gv_cong_su"]:checked')].map(cb => cb.value);
            const tgnTacGiaChinhIds = [...document.querySelectorAll('input[name="tgn_tac_gia_chinh"]:checked')].map(cb => cb.value);
            const tgnCongSuIds      = [...document.querySelectorAll('input[name="tgn_cong_su"]:checked')].map(cb => cb.value);

            const [r1, r2] = await Promise.all([
                fetch(`${ADMIN_API_BASE}/relations/cong-trinh/${entityId}/giang-vien`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({tac_gia_chinh_ids:tacGiaChinhIds, cong_su_ids:congSuIds}) }),
                fetch(`${ADMIN_API_BASE}/relations/cong-trinh/${entityId}/tac-gia-ngoai`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({tac_gia_chinh_ngoai_ids:tgnTacGiaChinhIds, cong_su_ngoai_ids:tgnCongSuIds}) })
            ]);
            const [d1, d2] = [await r1.json(), await r2.json()];
            if (d1.status === 'ok' && d2.status === 'ok') {
                showAdminToast("Đã cập nhật liên kết thành công", "success");
                closeRelationModal();
                const mc = document.getElementById('mainContent');
                const sp = mc ? mc.scrollTop : 0;
                await loadPublications();
                if (mc) setTimeout(() => { mc.scrollTop = sp; }, 10);
            } else { alert("Lỗi: " + (d1.message || d2.message)); }

        } else if (type === 'de-tai') {
            const chuNhiemIds    = [...document.querySelectorAll('input[name="gv_chu_nhiem"]:checked')].map(cb => cb.value);
            const thamGiaIds     = [...document.querySelectorAll('input[name="gv_tham_gia"]:checked')].map(cb => cb.value);
            const tgnChuNhiemIds = [...document.querySelectorAll('input[name="tgn_chu_nhiem"]:checked')].map(cb => cb.value);
            const tgnThamGiaIds  = [...document.querySelectorAll('input[name="tgn_tham_gia"]:checked')].map(cb => cb.value);

            const [r1, r2] = await Promise.all([
                fetch(`${ADMIN_API_BASE}/relations/de-tai/${entityId}/giang-vien`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({chu_nhiem_ids:chuNhiemIds, tham_gia_ids:thamGiaIds}) }),
                fetch(`${ADMIN_API_BASE}/relations/de-tai/${entityId}/tac-gia-ngoai`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({chu_nhiem_ngoai_ids:tgnChuNhiemIds, tham_gia_ngoai_ids:tgnThamGiaIds}) })
            ]);
            const [d1, d2] = [await r1.json(), await r2.json()];
            if (d1.status === 'ok' && d2.status === 'ok') {
                showAdminToast("Đã cập nhật liên kết thành công", "success");
                closeRelationModal();
                const mc = document.getElementById('mainContent');
                const sp = mc ? mc.scrollTop : 0;
                await loadProjects();
                if (mc) setTimeout(() => { mc.scrollTop = sp; }, 10);
            } else { alert("Lỗi: " + (d1.message || d2.message)); }
        }
    } catch (err) { console.error(err); alert("Có lỗi khi lưu quan hệ!"); }
}


function createRelationModalHtml() {
    const div = document.createElement('div');
    div.id = 'adminRelationModalOverlay';
    div.className = 'modal-overlay';
    div.innerHTML = `
        <div class="modal" style="max-width:800px;width:95%;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;">
            <div class="modal-header" style="flex-shrink:0;padding:15px 24px;">
                <h2 id="adminRelationModalTitle" style="font-size:16px;margin:0;line-height:1.4;padding-right:20px;">Biên tập Liên kết</h2>
                <button class="btn btn-sm" style="background:none;border:none;font-size:20px;position:absolute;right:15px;top:12px;" type="button" onclick="closeRelationModal()">&times;</button>
            </div>
            <div class="modal-body" style="flex:1;overflow-y:auto;padding:24px;">
                <form id="adminRelationForm" onsubmit="saveRelations(event)" style="display:flex;flex-direction:column;height:100%;">
                    <input type="hidden" id="relEntityType">
                    <input type="hidden" id="relEntityId">
                    <div id="relFormBody" style="min-height:100px;"></div>
                </form>
            </div>
            <div class="modal-footer" style="padding:15px 24px;border-top:1px solid var(--border-color);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-secondary);border-radius:0 0 var(--radius) var(--radius);flex-shrink:0;">
                <button type="button" class="btn" onclick="closeRelationModal()">Đóng</button>
                <button type="submit" form="adminRelationForm" class="btn btn-primary" style="background:var(--accent-blue);"><i class="fas fa-save"></i> Cập nhật Liên kết</button>
            </div>
        </div>`;
    document.body.appendChild(div);
}


/* ─── Role sync helpers ───────────────────────────────────────── */

window.syncRoleCheckbox = function(gvId, column) {
    const mainCb   = document.querySelector(`input[name="gv_tac_gia_chinh"][value="${gvId}"]`) || document.querySelector(`input[name="gv_chu_nhiem"][value="${gvId}"]`);
    const collabCb = document.querySelector(`input[name="gv_cong_su"][value="${gvId}"]`)       || document.querySelector(`input[name="gv_tham_gia"][value="${gvId}"]`);
    if (column === 'main' || column === 'lead') { if (mainCb?.checked && collabCb) collabCb.checked = false; }
    else                                         { if (collabCb?.checked && mainCb) mainCb.checked  = false; }
    updateSwitchButtons(gvId);
};

function updateSwitchButtons(gvId) {
    ['main','lead','collab','member'].forEach(role => {
        const row = document.getElementById(`row-${role}-${gvId}`);
        if (!row) return;
        const cb  = row.querySelector('input[type="checkbox"]');
        let btn   = row.querySelector('.btn-role-switch');
        if (cb?.checked) {
            if (!btn) {
                const isMain   = role === 'main' || role === 'lead';
                const text     = isMain ? (role === 'lead' ? 'Sang Thành viên' : 'Sang Đồng tác giả') : (role === 'member' ? 'Sang Chủ nhiệm' : 'Sang Tác giả chính');
                const fn       = (role === 'main' || role === 'collab') ? 'switchAuthorRole' : 'switchMemberRole';
                row.insertAdjacentHTML('beforeend', `<button type="button" class="btn-role-switch" onclick="${fn}('${gvId}','${role}')"><i class="fas fa-exchange-alt"></i> ${text}</button>`);
            }
        } else if (btn) btn.remove();
    });
}

window.switchAuthorRole = function(gvId, currentRole) {
    const mainCb   = document.querySelector(`input[name="gv_tac_gia_chinh"][value="${gvId}"]`);
    const collabCb = document.querySelector(`input[name="gv_cong_su"][value="${gvId}"]`);
    if (currentRole === 'main') { if (mainCb) mainCb.checked = false; if (collabCb) collabCb.checked = true; }
    else                        { if (collabCb) collabCb.checked = false; if (mainCb) mainCb.checked = true; }
    updateSwitchButtons(gvId);
};

window.switchMemberRole = function(gvId, currentRole) {
    const leadCb   = document.querySelector(`input[name="gv_chu_nhiem"][value="${gvId}"]`);
    const memberCb = document.querySelector(`input[name="gv_tham_gia"][value="${gvId}"]`);
    if (currentRole === 'lead') { if (leadCb) leadCb.checked = false; if (memberCb) memberCb.checked = true; }
    else                        { if (memberCb) memberCb.checked = false; if (leadCb) leadCb.checked = true; }
    updateSwitchButtons(gvId);
};

window.syncTgnRoleCheckbox = function(tgnId, column) {
    const leadCb   = document.querySelector(`input[name="tgn_chu_nhiem"][value="${tgnId}"]`);
    const memberCb = document.querySelector(`input[name="tgn_tham_gia"][value="${tgnId}"]`);
    if (column === 'lead') { if (leadCb?.checked && memberCb) memberCb.checked = false; }
    else                   { if (memberCb?.checked && leadCb) leadCb.checked   = false; }
    updateTgnSwitchButtons(tgnId);
};

function updateTgnSwitchButtons(tgnId) {
    [['lead','row-tgn-lead'],['member','row-tgn-member']].forEach(([role, prefix]) => {
        const row = document.getElementById(`${prefix}-${tgnId}`);
        if (!row) return;
        const cb  = row.querySelector('input[type="checkbox"]');
        let btn   = row.querySelector('.btn-role-switch');
        if (cb?.checked) {
            if (!btn) {
                const text = role === 'lead' ? 'Sang Thành viên' : 'Sang Chủ nhiệm';
                row.insertAdjacentHTML('beforeend', `<button type="button" class="btn-role-switch" onclick="switchTgnMemberRole('${tgnId}','${role}')"><i class="fas fa-exchange-alt"></i> ${text}</button>`);
            }
        } else if (btn) btn.remove();
    });
}

window.switchTgnMemberRole = function(tgnId, currentRole) {
    const leadCb   = document.querySelector(`input[name="tgn_chu_nhiem"][value="${tgnId}"]`);
    const memberCb = document.querySelector(`input[name="tgn_tham_gia"][value="${tgnId}"]`);
    if (currentRole === 'lead') { if (leadCb) leadCb.checked = false; if (memberCb) memberCb.checked = true; }
    else                        { if (memberCb) memberCb.checked = false; if (leadCb) leadCb.checked = true; }
    updateTgnSwitchButtons(tgnId);
};

window.syncTgnPubRoleCheckbox = function(tgnId, column) {
    const mainCb   = document.querySelector(`input[name="tgn_tac_gia_chinh"][value="${tgnId}"]`);
    const collabCb = document.querySelector(`input[name="tgn_cong_su"][value="${tgnId}"]`);
    if (column === 'main') { if (mainCb?.checked && collabCb) collabCb.checked = false; }
    else                   { if (collabCb?.checked && mainCb) mainCb.checked   = false; }
    updateTgnPubSwitchButtons(tgnId);
};

function updateTgnPubSwitchButtons(tgnId) {
    [['main','row-tgn-main'],['collab','row-tgn-collab']].forEach(([role, prefix]) => {
        const row = document.getElementById(`${prefix}-${tgnId}`);
        if (!row) return;
        const cb  = row.querySelector('input[type="checkbox"]');
        let btn   = row.querySelector('.btn-role-switch');
        if (cb?.checked) {
            if (!btn) {
                const text = role === 'main' ? 'Sang Đồng tác giả' : 'Sang Tác giả chính';
                row.insertAdjacentHTML('beforeend', `<button type="button" class="btn-role-switch" onclick="switchTgnPubRole('${tgnId}','${role}')"><i class="fas fa-exchange-alt"></i> ${text}</button>`);
            }
        } else if (btn) btn.remove();
    });
}

window.switchTgnPubRole = function(tgnId, currentRole) {
    const mainCb   = document.querySelector(`input[name="tgn_tac_gia_chinh"][value="${tgnId}"]`);
    const collabCb = document.querySelector(`input[name="tgn_cong_su"][value="${tgnId}"]`);
    if (currentRole === 'main') { if (mainCb) mainCb.checked = false; if (collabCb) collabCb.checked = true; }
    else                        { if (collabCb) collabCb.checked = false; if (mainCb) mainCb.checked = true; }
    updateTgnPubSwitchButtons(tgnId);
};
