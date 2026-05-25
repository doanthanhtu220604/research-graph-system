/* ============================================================
   ADMIN DETAIL VIEWS — Chi tiết GV / CT / DT / Tác giả ngoài
   ============================================================ */

function createStatsModalHtml() {
    const div = document.createElement('div');
    div.id = 'adminStatsModalOverlay';
    div.className = 'modal-overlay';
    div.innerHTML = `
        <div class="modal" style="max-width:700px;width:95%;max-height:90vh;display:flex;flex-direction:column;overflow:hidden;">
            <div class="modal-header" style="flex-shrink:0;padding:15px 24px;">
                <h2 id="adminStatsModalTitle" style="font-size:18px;margin:0;">Thông tin Chi tiết</h2>
                <button class="btn btn-sm" style="background:none;border-color:transparent;font-size:20px;position:absolute;right:15px;top:12px;" type="button" onclick="closeStatsModal()">&times;</button>
            </div>
            <div class="modal-body" style="flex:1;overflow-y:auto;padding:24px;">
                <div id="statsFormBody" style="min-height:100px;color:var(--text-primary);"></div>
            </div>
            <div class="modal-footer" style="padding:15px 24px;border-top:1px solid var(--border-color);display:flex;justify-content:flex-end;background:var(--bg-secondary);border-radius:0 0 var(--radius) var(--radius);flex-shrink:0;">
                <button type="button" class="btn btn-primary" onclick="closeStatsModal()">Đóng</button>
            </div>
        </div>`;
    document.body.appendChild(div);
}

function closeStatsModal() {
    const el = document.getElementById('adminStatsModalOverlay');
    if (el) el.classList.remove('active');
}

function _openStatsModal() {
    if (!document.getElementById('adminStatsModalOverlay')) createStatsModalHtml();
    document.getElementById('adminStatsModalOverlay').classList.add('active');
    document.getElementById('statsFormBody').innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...</p>';
    return document.getElementById('statsFormBody');
}


/* ─── Chi tiết Giảng viên ─────────────────────────────────── */

async function viewLecturerStats(gvId) {
    const body = _openStatsModal();
    try {
        const res  = await fetch(`${API_BASE}/giang-vien/${gvId}`);
        const data = await res.json();
        if (data.status !== 'ok') { body.innerHTML = `<p style="color:red">Lỗi: ${data.message}</p>`; return; }
        const gv = data.data;
        document.getElementById('adminStatsModalTitle').textContent = `Thông tin Chi tiết: ${gv.ho_va_ten}`;

        let html = `<div style="margin-bottom:15px;background:rgba(0,0,0,0.02);padding:15px;border-radius:8px;">
            <p style="margin-bottom:5px;"><b>Học vị:</b> ${gv.hoc_vi || 'N/A'}</p>
            <p style="margin-bottom:5px;"><b>Chức danh:</b> ${gv.chuc_danh || 'N/A'}</p>
            <p style="margin-bottom:5px;"><b>Chức vụ:</b> ${gv.chuc_vu || 'N/A'}</p>
            <p style="margin-bottom:5px;"><b>Bộ môn:</b> ${gv.bo_mon || 'N/A'}</p>
            <p style="margin-bottom:5px;"><b>Chuyên ngành:</b> ${gv.chuyen_nganh || 'N/A'}</p>
            <p style="margin-bottom:5px;"><b>Email:</b> ${gv.email || 'N/A'}</p>
            <p style="margin-bottom:0;"><b>Lĩnh vực:</b> ${(gv.linh_vuc?.length) ? gv.linh_vuc.map(lv => `<span style="display:inline-block;padding:2px 10px;background:rgba(26,188,156,0.12);color:#1ABC9C;border-radius:12px;font-size:12px;font-weight:600;margin:2px 4px 2px 0;">${lv}</span>`).join('') : '<span style="color:var(--text-muted);">Chưa có</span>'}</p>
        </div>`;

        html += `<h4 style="margin-top:20px;color:var(--accent-blue);padding-bottom:5px;border-bottom:1px solid var(--border-color);"><i class="fas fa-file-alt"></i> Công trình (${gv.cong_trinh?.length || 0})</h4>`;
        if (gv.cong_trinh?.length) {
            html += '<ul style="margin-left:20px;margin-bottom:15px;margin-top:10px;line-height:1.6;">';
            gv.cong_trinh.forEach(ct => {
                const ten = ct.ten_cong_trinh || ct.cong_trinh?.ten_cong_trinh || 'N/A';
                const nam = ct.nam_xuat_ban   || ct.cong_trinh?.nam_xuat_ban   || '?';
                const vt  = ct.vai_tro || ct.cong_trinh?.vai_tro || '';
                const vaiTroLabel = vt === 'TAC_GIA_CHINH' ? 'Tác giả chính' : (vt === 'CONG_SU' || vt === 'LA_TAC_GIA_CUA') ? 'Đồng tác giả' : 'Tác giả';
                html += `<li onclick="navigateToManage('cong-trinh','${ten.replace(/'/g,"\\'")}') " style="cursor:pointer;" onmouseover="this.style.color='var(--accent-blue)'" onmouseout="this.style.color='inherit'"><b>${ten}</b> <span style="color:var(--text-muted);font-size:12px;">(${nam}) (Vai trò: <b>${vaiTroLabel}</b>)</span></li>`;
            });
            html += '</ul>';
        } else { html += '<p style="color:var(--text-muted);font-size:13px;margin-bottom:15px;">Chưa có công trình nào.</p>'; }

        html += `<h4 style="margin-top:20px;color:var(--accent-orange);padding-bottom:5px;border-bottom:1px solid var(--border-color);"><i class="fas fa-flask"></i> Đề tài (${gv.de_tai?.length || 0})</h4>`;
        if (gv.de_tai?.length) {
            html += '<ul style="margin-left:20px;margin-bottom:15px;margin-top:10px;line-height:1.6;">';
            gv.de_tai.forEach(dt => {
                const ten = dt.ten_de_tai || dt.de_tai?.ten_de_tai || 'N/A';
                html += `<li onclick="navigateToManage('de-tai','${ten.replace(/'/g,"\\'")}') " style="cursor:pointer;" onmouseover="this.style.color='var(--accent-orange)'" onmouseout="this.style.color='inherit'"><b>${ten}</b> <span style="color:var(--text-muted);font-size:12px;">(Vai trò: <b>${dt.vai_tro === 'CHU_NHIEM' ? 'Chủ nhiệm' : 'Thành viên'}</b>)</span></li>`;
            });
            html += '</ul>';
        } else { html += '<p style="color:var(--text-muted);font-size:13px;">Chưa tham gia đề tài nào.</p>'; }

        body.innerHTML = html;
    } catch (e) { body.innerHTML = `<p style="color:red">Lỗi mạng: ${e.message}</p>`; }
}


/* ─── Chi tiết Công trình ─────────────────────────────────── */

async function viewPublicationStats(ctId) {
    const body = _openStatsModal();
    try {
        const res  = await fetch(`${API_BASE}/cong-trinh/${ctId}`);
        const data = await res.json();
        if (data.status !== 'ok') { body.innerHTML = `<p style="color:red">Lỗi: ${data.message}</p>`; return; }
        const ct = data.data;
        document.getElementById('adminStatsModalTitle').textContent = 'Chi tiết Công trình';

        let html = `<div style="margin-bottom:15px;background:rgba(0,0,0,0.02);padding:15px;border-radius:8px;">
            <p style="margin-bottom:8px;font-size:16px;"><b>${ct.ten_cong_trinh || 'N/A'}</b></p>
            <p style="margin-bottom:5px;"><b>Năm xuất bản:</b> ${ct.nam_xuat_ban || 'N/A'}</p>
            <p style="margin-bottom:5px;"><b>Nơi xuất bản:</b> ${ct.noi_xuat_ban || 'N/A'}</p>
            <p style="margin-bottom:5px;"><b>Link:</b> ${ct.link ? `<a href="${ct.link}" target="_blank" style="color:var(--accent-blue);">${ct.link}</a>` : 'N/A'}</p>
            <p style="margin-bottom:5px;"><b>Tóm tắt:</b> ${ct.tom_tat || 'Đang cập nhật...'}</p>
        </div>`;

        html += `<h4 style="margin-top:20px;color:var(--accent-blue);padding-bottom:5px;border-bottom:1px solid var(--border-color);"><i class="fas fa-users"></i> Tác giả nội bộ (${ct.tac_gia?.length || 0})</h4>`;
        if (ct.tac_gia?.length) {
            html += '<ul style="margin-left:20px;margin-bottom:15px;margin-top:10px;line-height:1.6;">';
            ct.tac_gia.forEach(tg => {
                const role = tg.vai_tro === 'TAC_GIA_CHINH' ? ' <span style="color:#4F8EF7;font-size:11px;">(Tác giả chính)</span>' : (tg.vai_tro === 'CONG_SU' || tg.vai_tro === 'LA_TAC_GIA_CUA') ? ' <span style="color:#10b981;font-size:11px;">(Đồng tác giả)</span>' : '';
                html += `<li><b>${tg.ten}</b>${role}</li>`;
            });
            html += '</ul>';
        } else { html += '<p style="color:var(--text-muted);font-size:13px;margin-bottom:15px;">Chưa có tác giả nào.</p>'; }

        const tgnList = ct.tac_gia_ngoai || [];
        html += `<h4 style="margin-top:20px;color:#e67e22;padding-bottom:5px;border-bottom:1px solid var(--border-color);"><i class="fas fa-user-friends"></i> Tác giả ngoài (${tgnList.length})</h4>`;
        if (tgnList.length) {
            html += '<ul style="margin-left:20px;margin-bottom:15px;margin-top:10px;line-height:1.8;">';
            tgnList.forEach(tgn => {
                const role = tgn.vai_tro === 'TAC_GIA_CHINH' ? ' <span style="color:#e67e22;font-size:11px;">(Tác giả chính)</span>' : (tgn.vai_tro === 'CONG_SU' || tgn.vai_tro === 'DONG_TAC_GIA') ? ' <span style="color:#8b5cf6;font-size:11px;">(Đồng tác giả)</span>' : '';
                html += `<li><b>${tgn.ten}</b>${role}${tgn.don_vi ? ` <span style="color:var(--text-muted);font-size:12px;">— ${tgn.don_vi}</span>` : ''}</li>`;
            });
            html += '</ul>';
        } else { html += '<p style="color:var(--text-muted);font-size:13px;">Không có tác giả ngoài.</p>'; }

        body.innerHTML = html;
    } catch (e) { body.innerHTML = `<p style="color:red">Lỗi mạng: ${e.message}</p>`; }
}


/* ─── Chi tiết Đề tài ─────────────────────────────────────── */

async function viewProjectStats(dtId) {
    const body = _openStatsModal();
    try {
        const res  = await fetch(`${API_BASE}/de-tai/${dtId}`);
        const data = await res.json();
        if (data.status !== 'ok') { body.innerHTML = `<p style="color:red">Lỗi: ${data.message}</p>`; return; }
        const dt = data.data;
        document.getElementById('adminStatsModalTitle').textContent = 'Chi tiết Đề tài';

        let html = `<div style="margin-bottom:15px;background:rgba(0,0,0,0.02);padding:15px;border-radius:8px;">
            <p style="margin-bottom:8px;font-size:16px;"><b>${dt.ten_de_tai || 'N/A'}</b></p>
            <p style="margin-bottom:5px;"><b>Cấp đề tài:</b> ${dt.cap_de_tai || 'N/A'}</p>
            <p style="margin-bottom:5px;"><b>Thời gian:</b> ${dt.nam_bat_dau || '?'} - ${dt.nam_ket_thuc || '?'}</p>
            <p style="margin-bottom:5px;"><b>Link:</b> ${dt.link ? `<a href="${dt.link}" target="_blank" style="color:var(--accent-blue);">${dt.link}</a>` : 'N/A'}</p>
            <p style="margin-bottom:5px;"><b>Tóm tắt:</b> ${dt.tom_tat || 'Đang cập nhật...'}</p>
        </div>`;

        html += `<h4 style="margin-top:20px;color:var(--accent-orange);padding-bottom:5px;border-bottom:1px solid var(--border-color);"><i class="fas fa-users"></i> Thành viên tham gia (${dt.thanh_vien?.length || 0})</h4>`;
        if (dt.thanh_vien?.length) {
            html += '<ul style="margin-left:20px;margin-bottom:15px;margin-top:10px;line-height:1.6;">';
            dt.thanh_vien.forEach(tv => { html += `<li><b>${tv.ten}</b> <span style="color:var(--text-muted);font-size:12px;">(Vai trò: <b>${tv.vai_tro === 'CHU_NHIEM' ? 'Chủ nhiệm' : 'Thành viên'}</b>)</span></li>`; });
            html += '</ul>';
        } else { html += '<p style="color:var(--text-muted);font-size:13px;margin-bottom:15px;">Chưa có thành viên nào.</p>'; }

        const tgnList = dt.tac_gia_ngoai || [];
        html += `<h4 style="margin-top:20px;color:#e67e22;padding-bottom:5px;border-bottom:1px solid var(--border-color);"><i class="fas fa-user-friends"></i> Tác giả ngoài (${tgnList.length})</h4>`;
        if (tgnList.length) {
            html += '<ul style="margin-left:20px;margin-bottom:15px;margin-top:10px;line-height:1.8;">';
            tgnList.forEach(tgn => {
                const role = tgn.vai_tro === 'CHU_NHIEM' ? ' <span style="color:#e67e22;font-size:11px;">(Chủ nhiệm)</span>' : tgn.vai_tro === 'THAM_GIA' ? ' <span style="color:#8b5cf6;font-size:11px;">(Thành viên)</span>' : '';
                html += `<li><b>${tgn.ten}</b>${role}${tgn.don_vi ? ` <span style="color:var(--text-muted);font-size:12px;">— ${tgn.don_vi}</span>` : ''}</li>`;
            });
            html += '</ul>';
        } else { html += '<p style="color:var(--text-muted);font-size:13px;">Không có tác giả ngoài.</p>'; }

        body.innerHTML = html;
    } catch (e) { body.innerHTML = `<p style="color:red">Lỗi mạng: ${e.message}</p>`; }
}


/* ─── Chi tiết Tác giả ngoài ─────────────────────────────── */

async function viewExternalAuthorDetail(tgnId) {
    const body = _openStatsModal();
    try {
        const res  = await fetch(`${ADMIN_API_BASE}/tac-gia-ngoai/${tgnId}/detail`);
        const data = await res.json();
        if (data.status !== 'ok') { body.innerHTML = `<p style="color:red">Lỗi: ${data.message}</p>`; return; }
        const { info, publications, projects, collaborators } = data.data;
        document.getElementById('adminStatsModalTitle').textContent = `Chi tiết Tác giả ngoài: ${info.ho_va_ten}`;

        let html = `<div style="margin-bottom:15px;background:rgba(0,0,0,0.02);padding:15px;border-radius:8px;">
            <p style="margin-bottom:5px;"><b>Họ và tên:</b> ${info.ho_va_ten || 'N/A'}</p>
            <p style="margin-bottom:5px;"><b>Đơn vị:</b> ${info.don_vi_cong_tac || 'N/A'}</p>
            <p style="margin-bottom:5px;"><b>Học vị:</b> ${info.hoc_vi || 'N/A'}</p>
            <p style="margin-bottom:5px;"><b>Chức danh:</b> ${info.chuc_danh || 'N/A'}</p>
            <p style="margin-bottom:5px;"><b>Email:</b> ${info.email || 'N/A'}</p>
        </div>`;

        html += `<h4 style="margin-top:20px;color:var(--accent-blue);padding-bottom:5px;border-bottom:1px solid var(--border-color);"><i class="fas fa-file-alt"></i> Công trình (${publications.length})</h4>`;
        if (publications.length) { html += '<ul style="margin-left:20px;margin-bottom:15px;margin-top:10px;line-height:1.6;">'; publications.forEach(ct => { html += `<li><b>${ct.ten_cong_trinh}</b> <span style="color:var(--text-muted);font-size:12px;">(${ct.nam_xuat_ban || '?'})</span></li>`; }); html += '</ul>'; }
        else { html += '<p style="color:var(--text-muted);font-size:13px;margin-bottom:15px;">Chưa tham gia công trình nào.</p>'; }

        html += `<h4 style="margin-top:20px;color:var(--accent-orange);padding-bottom:5px;border-bottom:1px solid var(--border-color);"><i class="fas fa-flask"></i> Đề tài (${projects.length})</h4>`;
        if (projects.length) { html += '<ul style="margin-left:20px;margin-bottom:15px;margin-top:10px;line-height:1.6;">'; projects.forEach(dt => { html += `<li><b>${dt.ten_de_tai}</b> <span style="color:var(--text-muted);font-size:12px;">(${dt.nam_bat_dau || '?'} - ${dt.nam_ket_thuc || '?'})</span></li>`; }); html += '</ul>'; }
        else { html += '<p style="color:var(--text-muted);font-size:13px;margin-bottom:15px;">Chưa tham gia đề tài nào.</p>'; }

        html += `<h4 style="margin-top:20px;color:#2ecc71;padding-bottom:5px;border-bottom:1px solid var(--border-color);"><i class="fas fa-handshake"></i> GV cộng tác trong khoa (${collaborators.length})</h4>`;
        if (collaborators.length) {
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin-top:15px;">';
            collaborators.forEach(gv => {
                const avatar = gv.anh_dai_dien ? `<img src="${gv.anh_dai_dien}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;">` : `<div style="width:30px;height:30px;border-radius:50%;background:var(--bg-hover);display:flex;align-items:center;justify-content:center;font-size:14px;color:var(--text-muted);"><i class="fas fa-user"></i></div>`;
                html += `<div style="display:flex;align-items:center;gap:10px;background:white;padding:8px 12px;border-radius:10px;border:1px solid var(--border-color);cursor:pointer;" onclick="viewLecturerStats('${gv.id}')">${avatar}<div><div style="font-size:13px;font-weight:700;">${gv.ho_va_ten}</div><div style="font-size:11px;color:var(--accent-blue);font-weight:600;">${gv.count} chung</div></div></div>`;
            });
            html += '</div>';
        } else { html += '<p style="color:var(--text-muted);font-size:13px;">Chưa có lịch sử cộng tác.</p>'; }

        body.innerHTML = html;
    } catch (e) { body.innerHTML = `<p style="color:red">Lỗi mạng: ${e.message}</p>`; }
}
