/* ============================================================
   LECTURERS - Lecturers list page + detail modal
   ============================================================ */

let _allLecturers = [];
let _filteredLecturers = [];
let _currentLecturerPage = 1;
const LECTURERS_PER_PAGE = 10;

async function loadLecturers() {
    try {
        const res = await fetch(`${API_BASE}/giang-vien`);
        const data = await res.json();
        if (data.status === 'ok') {
            _allLecturers = data.data;
            _filteredLecturers = [..._allLecturers];
            renderLecturerPage(1);
        }
    } catch (err) {
        console.error('Lecturers error:', err);
        const g = document.getElementById('lecturersGrid');
        if (g) g.innerHTML = '<div class="list-empty"><i class="fas fa-exclamation-triangle"></i>Lỗi tải dữ liệu</div>';
    }
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts[parts.length - 1].charAt(0).toUpperCase();
}

function getDegreeColor(hocVi) {
    if (!hocVi) return 'badge-gray';
    if (hocVi.includes('Giáo sư')) return 'badge-red';
    if (hocVi.includes('Tiến sĩ')) return 'badge-blue';
    if (hocVi.includes('Thạc sĩ')) return 'badge-green';
    return 'badge-gray';
}

function renderLecturerPage(page) {
    _currentLecturerPage = page;
    const limit = LECTURERS_PER_PAGE;
    const total = _filteredLecturers.length;
    const totalPages = Math.ceil(total / limit);

    if (_currentLecturerPage < 1) _currentLecturerPage = 1;
    if (_currentLecturerPage > totalPages && totalPages > 0) _currentLecturerPage = totalPages;

    const start = (_currentLecturerPage - 1) * limit;
    const end = start + limit;
    const listToRender = _filteredLecturers.slice(start, end);

    const countEl = document.getElementById('lecturerCount');
    if (countEl) countEl.textContent = `${total} giảng viên`;

    const container = document.getElementById('lecturersGrid');
    if (!container) return;

    if (total === 0) {
        container.innerHTML = '<div class="list-empty" style="grid-column:1/-1"><i class="fas fa-user-slash"></i>Không tìm thấy giảng viên phù hợp</div>';
        renderLecturerPagination(0, 1);
        return;
    }

    container.innerHTML = listToRender.map(gv => {
        const name = String(gv.ho_va_ten || 'N/A').replace(/</g, '&lt;');
        const avatarHtml = gv.anh_dai_dien
            ? `<img src="${String(gv.anh_dai_dien).replace(/"/g, '')}" alt="${name}">`
            : `<span class="avatar-initials">${getInitials(gv.ho_va_ten)}</span>`;
        const degreeCls = getDegreeColor(gv.hoc_vi);
        const deptShort = (gv.bo_mon || '').replace('Bộ môn ', '');
        return `
            <div class="profile-card" onclick="showLecturerDetail('${gv.id}')">
                <div class="profile-avatar">${avatarHtml}</div>
                <div class="profile-name" title="${name}">${name}</div>
                <div class="profile-dept">${deptShort || '&mdash;'}</div>
                <div class="profile-badges">
                    ${gv.hoc_vi ? `<span class="badge ${degreeCls}">${gv.hoc_vi}</span>` : ''}
                    ${gv.trang_thai_cong_tac && gv.trang_thai_cong_tac !== 'Đang công tác' ? `<span class="badge badge-gray">${gv.trang_thai_cong_tac}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');

    renderLecturerPagination(totalPages, _currentLecturerPage);
}

function renderLecturerPagination(totalPages, currentPage) {
    const container = document.getElementById('lecturersPagination');
    if (!container) return;

    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<div class="pagination">';

    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="renderLecturerPage(${currentPage - 1})" title="Trang trước"><i class="fas fa-chevron-left"></i></button>`;
    } else {
        html += `<button class="page-btn disabled" disabled><i class="fas fa-chevron-left"></i></button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="page-btn active">${i}</button>`;
        } else {
            html += `<button class="page-btn" onclick="renderLecturerPage(${i})">${i}</button>`;
        }
    }

    if (currentPage < totalPages) {
        html += `<button class="page-btn" onclick="renderLecturerPage(${currentPage + 1})" title="Trang sau"><i class="fas fa-chevron-right"></i></button>`;
    } else {
        html += `<button class="page-btn disabled" disabled><i class="fas fa-chevron-right"></i></button>`;
    }

    html += '</div>';
    container.innerHTML = html;
}

function filterUserLecturers() {
    const q = (document.getElementById('lecturerSearchInput')?.value || '').toLowerCase().trim();
    const dept = document.getElementById('lecturerDeptFilter')?.value || '';
    const degree = document.getElementById('lecturerDegreeFilter')?.value || '';
    _filteredLecturers = _allLecturers.filter(gv => {
        const name = (gv.ho_va_ten || '').toLowerCase();
        const deg = (gv.hoc_vi || '').toLowerCase();
        const title = (gv.chuc_danh || '').toLowerCase();
        const fields = (gv.linh_vuc || []).join(' ').toLowerCase();

        const matchQ = !q || name.includes(q) || deg.includes(q) || title.includes(q) || fields.includes(q);
        const matchDept = !dept || (gv.bo_mon === dept);
        const matchDeg = !degree || ((gv.hoc_vi || '').includes(degree));
        return matchQ && matchDept && matchDeg;
    });
    renderLecturerPage(1);
}

async function showLecturerDetail(gvId) {
    try {
        const resDetail = await fetch(`${API_BASE}/giang-vien/${gvId}`);
        const dataDetail = await resDetail.json();

        const resGraph = await fetch(`${API_BASE}/graph/node/${gvId}`);
        const dataGraph = await resGraph.json();

        if (dataDetail.status === 'ok' && dataGraph.status === 'ok') {
            const gv = dataDetail.data;

            document.getElementById('detailTitle').textContent = gv.ho_va_ten || 'Giảng viên';
            document.getElementById('detailSubtitle').textContent = gv.chuc_danh ? `${gv.chuc_danh} - ${gv.hoc_vi || ''}` : (gv.hoc_vi || 'Giảng viên');

            const iconEl = document.getElementById('detailIcon');
            if (gv.anh_dai_dien) {
                iconEl.innerHTML = `<img src="${gv.anh_dai_dien}" alt="${gv.ho_va_ten}" style="width:100%;height:100%;object-fit:cover;">`;
                iconEl.style.background = 'transparent';
            } else {
                iconEl.innerHTML = '<i class="fas fa-user-tie"></i>';
                iconEl.style.background = 'rgba(79, 142, 247, 0.1)';
            }

            const linhVucHtml = (gv.linh_vuc && gv.linh_vuc.length > 0)
                ? gv.linh_vuc.map(lv => `<span style="display:inline-block;padding:3px 10px;background:rgba(26,188,156,0.12);color:#1ABC9C;border-radius:12px;font-size:12px;font-weight:600;margin:2px 4px 2px 0;">${lv}</span>`).join('')
                : '<b style="color:var(--text-muted);">N/A</b>';

            document.getElementById('detailFieldsGrid').innerHTML = `
                <div><span style="color:var(--text-muted);font-size:12px;">Học vị</span><br><b>${gv.hoc_vi || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Chức danh</span><br><b>${gv.chuc_danh || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Chức vụ</span><br><b>${gv.chuc_vu || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Chuyên ngành</span><br><b>${gv.chuyen_nganh || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Bộ môn</span><br><b>${gv.bo_mon || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Trạng thái</span><br><b>${gv.trang_thai_cong_tac || 'Đang công tác'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Email</span><br><b>${gv.email || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Điện thoại</span><br><b>${gv.dien_thoai || 'N/A'}</b></div>
                <div style="grid-column: 1 / -1;"><span style="color:var(--text-muted);font-size:12px;">Lĩnh vực nghiên cứu</span><br>${linhVucHtml}</div>
            `;

            let bodyHtml = '';
            if (gv.cong_trinh && gv.cong_trinh.length > 0) {
                bodyHtml += `
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: var(--accent-blue);"><i class="fas fa-file-alt"></i> Công trình nghiên cứu (${gv.cong_trinh.length})</h3>
                        ${gv.cong_trinh.map(item => {
                            const ct = item.ten_cong_trinh ? item : (item.cong_trinh || item);
                            const vt = item.vai_tro;
                            let roleLabel = '';
                            if (vt === 'TAC_GIA_CHINH') roleLabel = ' <span style="color:var(--accent-blue); font-size:11px; font-weight:600;">(Tác giả chính)</span>';
                            else if (vt === 'CONG_SU' || vt === 'LA_TAC_GIA_CUA') roleLabel = ' <span style="color:#10b981; font-size:11px; font-weight:600;">(Đồng tác giả)</span>';
                            return `
                                <div style="padding: 10px; background: rgba(0,0,0,0.02); margin-bottom: 8px; border-radius: 6px; border-left: 3px solid var(--accent-blue); cursor: pointer;" onclick="showPublicationDetail('${ct.id}')">
                                    <strong>${ct.ten_cong_trinh || 'N/A'}</strong>
                                    ${ct.nam_xuat_ban ? `<span style="color: var(--text-muted); font-size: 12px;"> (${ct.nam_xuat_ban})</span>` : ''}
                                    <div style="margin-top:4px;">${roleLabel}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }

            if (gv.de_tai && gv.de_tai.length > 0) {
                bodyHtml += `
                    <div>
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: var(--accent-orange);"><i class="fas fa-flask"></i> Đề tài nghiên cứu (${gv.de_tai.length})</h3>
                        ${gv.de_tai.map(dt => {
                            const item = dt.ten_de_tai ? dt : (dt.de_tai || dt);
                            const tenDeTai = item.ten_de_tai || 'N/A';
                            const capDeTai = item.cap_de_tai || 'Chưa xác định';
                            const dtId = item.id;
                            return `
                                <div style="padding: 10px; background: rgba(0,0,0,0.02); margin-bottom: 8px; border-radius: 6px; border-left: 3px solid var(--accent-orange); cursor: pointer;" ${dtId ? `onclick="showProjectDetail('${dtId}')"` : ''}>
                                    <strong>${tenDeTai}</strong>
                                    <div style="color: var(--text-muted); font-size: 12px; margin-top: 4px;">
                                        Cấp đề tài: ${capDeTai} | Vai trò: <span style="color: var(--text-primary);">${dt.vai_tro || 'Thành viên'}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }

            // Scholar placeholder
            bodyHtml = `
                <div id="scholarStatsContainer" style="margin-bottom: 20px;">
                    <div style="padding: 15px; background: rgba(66, 133, 244, 0.05); border-radius: 8px; border-left: 4px solid #4285F4; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-spinner fa-spin" style="color: #4285F4;"></i>
                        <span style="font-size: 13px; color: var(--text-secondary);">Đang trích xuất dữ liệu Google Scholar...</span>
                    </div>
                </div>
            ` + bodyHtml;

            document.getElementById('detailBodyContent').innerHTML = bodyHtml;

            if (gv.ho_va_ten) {
                loadScholarStats(gv.ho_va_ten, 'scholarStatsContainer');
            }

            document.getElementById('globalDetailOverlay').classList.add('active');

            setTimeout(() => {
                renderGraph('detail-graph-container', dataGraph.nodes, dataGraph.edges, (network) => {
                    window.detailGraph = network;
                });
                if (dataGraph.legend) renderLegend(dataGraph.legend, 'detailGraphLegend');
            }, 50);
        }
    } catch (err) {
        console.error('Detail error:', err);
    }
}

function closeEntityDetail() {
    document.getElementById('globalDetailOverlay').classList.remove('active');
}

function resetDetailGraphView() {
    if (window.detailGraph) {
        window.detailGraph.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
    }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});
