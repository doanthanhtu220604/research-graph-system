let _currentAdminLecturersPage = 1;
let _filteredAdminLecturers = [];
const ADMIN_LECTURERS_PER_PAGE = 15;

async function loadLecturers() {
    try {
        const res  = await fetch(ENTITY_CONFIG['giang-vien'].apiUrl);
        const data = await res.json();

        if (data.status === 'ok') {
            currentEntitiesData['giang-vien'] = data.data;
            await loadFilterDepartments(); // Tải danh sách bộ môn vào bộ lọc
            filterLecturers();             // Áp dụng bộ lọc hiện tại
        }
    } catch (err) {
        console.error(err);
    }
}


function renderLecturersTable(dataList) {
    const tbody = document.getElementById('adminLecturersBody');
    if (!tbody) return;

    if (dataList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">Không tìm thấy giảng viên phù hợp.</td></tr>';
        return;
    }

    tbody.innerHTML = dataList.map((gv) => `
        <tr>
            <td class="col-id">${gv.id || 'Chưa rõ'}</td>
            <td class="col-code">${gv.ma_gv || 'Chưa rõ'}</td>
            <td class="col-name">
                ${gv.anh_dai_dien
                    ? `<img src="${gv.anh_dai_dien}" alt="${gv.ho_va_ten}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;">`
                    : `<i class="fas fa-user-circle" style="font-size:32px;color:var(--text-muted);vertical-align:middle;margin-right:8px;"></i>`
                }
                <strong>${gv.ho_va_ten || 'Chưa rõ'}</strong>
                ${gv.profile_edit_status === 'Chờ duyệt'
                    ? `<span class="badge" style="background:#f59e0b;color:white;font-size:10px;margin-left:5px;" title="Có yêu cầu cập nhật thông tin cá nhân cần duyệt">Chờ duyệt hồ sơ</span>`
                    : ''
                }
            </td>
            <td class="col-degree">${gv.hoc_vi || ''}</td>
            <td class="col-department">${gv.bo_mon || ''}</td>
            <td class="col-status">
                ${gv.trang_thai_cong_tac === 'Đang công tác'  ? '<span class="badge" style="background:#10b981;color:white;white-space:nowrap;">Đang công tác</span>' :
                  gv.trang_thai_cong_tac === 'Nghỉ hưu'       ? '<span class="badge badge-gray" style="white-space:nowrap;">Nghỉ hưu</span>' :
                  gv.trang_thai_cong_tac === 'Chuyển công tác' ? '<span class="badge" style="background:#f59e0b;color:white;white-space:nowrap;">Chuyển công tác</span>' :
                  gv.trang_thai_cong_tac === 'Nghiên cứu sinh' ? '<span class="badge badge-blue" style="white-space:nowrap;">Nghiên cứu sinh</span>' :
                  '<span class="badge" style="background:#10b981;color:white;white-space:nowrap;">Đang công tác</span>'}
            </td>
            <td class="col-actions">
                <button class="btn btn-sm" style="background:#f39c12;color:#fff;border-color:#f39c12;" title="Xem chi tiết" onclick="viewLecturerStats('${gv.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('giang-vien', '${gv.id}', null)"><i class="fas fa-edit"></i></button>
                ${gv.profile_edit_status === 'Chờ duyệt' ? `
                    <button class="btn btn-sm" style="background:#2ecc71;color:#fff;border-color:#2ecc71;" title="Duyệt hồ sơ mới" onclick="approveLecturerProfile('${gv.id}')"><i class="fas fa-user-check"></i></button>
                    <button class="btn btn-sm" style="background:#e74c3c;color:#fff;border-color:#e74c3c;" title="Từ chối hồ sơ mới" onclick="rejectLecturerProfile('${gv.id}')"><i class="fas fa-user-times"></i></button>
                    <button class="btn btn-sm" style="background:#3498db;color:#fff;border-color:#3498db;" title="So sánh hồ sơ" onclick="compareLecturerProfiles('${gv.id}')"><i class="fas fa-exchange-alt"></i></button>
                ` : ''}
                <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('giang-vien', '${gv.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}


function renderLecturersPage(page) {
    _currentAdminLecturersPage = page;
    const limit = ADMIN_LECTURERS_PER_PAGE;
    const total = _filteredAdminLecturers.length;
    const totalPages = Math.ceil(total / limit);

    if (_currentAdminLecturersPage < 1) _currentAdminLecturersPage = 1;
    if (_currentAdminLecturersPage > totalPages && totalPages > 0) _currentAdminLecturersPage = totalPages;

    const start = (_currentAdminLecturersPage - 1) * limit;
    const end = start + limit;
    const listToRender = _filteredAdminLecturers.slice(start, end);

    renderLecturersTable(listToRender);
    renderLecturersPagination(totalPages, _currentAdminLecturersPage, total, start, end);
}


function renderLecturersPagination(totalPages, currentPage, totalCount, start, end) {
    const container = document.getElementById('adminLecturersPagination');
    if (!container) return;

    if (totalCount === 0) {
        container.innerHTML = '';
        return;
    }

    const itemStart = totalCount === 0 ? 0 : start + 1;
    const itemEnd = Math.min(end, totalCount);

    let html = `
        <div class="pagination-info">
            Hiển thị <b>${itemStart}-${itemEnd}</b> trong tổng số <b>${totalCount}</b> giảng viên
        </div>
        <div class="pagination-buttons">
    `;

    if (currentPage > 1) {
        html += `<button class="pagination-btn" onclick="renderLecturersPage(${currentPage - 1})" title="Trang trước"><i class="fas fa-chevron-left"></i></button>`;
    } else {
        html += `<button class="pagination-btn" disabled><i class="fas fa-chevron-left"></i></button>`;
    }

    // Hiển thị tối đa 5 nút trang
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    if (startPage > 1) {
        html += `<button class="pagination-btn" onclick="renderLecturersPage(1)">1</button>`;
        if (startPage > 2) html += `<span class="pagination-ellipsis" style="padding: 6px 12px; color: var(--text-secondary);">...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            html += `<button class="pagination-btn active">${i}</button>`;
        } else {
            html += `<button class="pagination-btn" onclick="renderLecturersPage(${i})">${i}</button>`;
        }
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span class="pagination-ellipsis" style="padding: 6px 12px; color: var(--text-secondary);">...</span>`;
        html += `<button class="pagination-btn" onclick="renderLecturersPage(${totalPages})">${totalPages}</button>`;
    }

    if (currentPage < totalPages) {
        html += `<button class="pagination-btn" onclick="renderLecturersPage(${currentPage + 1})" title="Trang sau"><i class="fas fa-chevron-right"></i></button>`;
    } else {
        html += `<button class="pagination-btn" disabled><i class="fas fa-chevron-right"></i></button>`;
    }

    html += '</div>';
    container.innerHTML = html;
}


function filterLecturers() {
    const list        = currentEntitiesData['giang-vien'] || [];
    const nameFilter  = (document.getElementById('filterName')?.value || '').normalize('NFC').toLowerCase().trim();
    const deptFilter  = (document.getElementById('filterDepartment')?.value || '').toLowerCase().trim();
    const degreeFilter = (document.getElementById('filterDegree')?.value || '').toLowerCase().trim();

    _filteredAdminLecturers = list.filter(gv => {
        const name        = (gv.ho_va_ten || '').normalize('NFC').toLowerCase();
        const matchName   = name.includes(nameFilter);
        const matchDept   = deptFilter === '' || ((gv.bo_mon || '').toLowerCase().trim() === deptFilter);
        const matchDegree = degreeFilter === '' || ((gv.hoc_vi || '').toLowerCase().trim().includes(degreeFilter));
        return matchName && matchDept && matchDegree;
    });

    _filteredAdminLecturers.sort((a, b) => {
        const aPending = a.profile_edit_status === 'Chờ duyệt' ? 0 : 1;
        const bPending = b.profile_edit_status === 'Chờ duyệt' ? 0 : 1;
        if (aPending !== bPending) return aPending - bPending;
        return (a.ho_va_ten || '').localeCompare(b.ho_va_ten || '', 'vi');
    });

    renderLecturersPage(1);
}


async function loadFilterDepartments() {
    const select = document.getElementById('filterDepartment');
    if (!select) return;

    try {
        const res  = await fetch(`${ADMIN_API_BASE}/bo-mon`);
        const data = await res.json();
        if (data.status === 'ok') {
            const currentVal = select.value;
            let html = '<option value="">-- Chọn Bộ môn --</option>';
            data.data.forEach(bm => {
                html += `<option value="${bm.ten_bo_mon}">${bm.ten_bo_mon}</option>`;
            });
            select.innerHTML = html;
            select.value = currentVal;
        }
    } catch (e) {
        console.error('Lỗi tải bộ môn cho bộ lọc:', e);
    }
}

// Custom Approval Logic for Profile
async function approveLecturerProfile(id) {
    if (!confirm('Bạn có chắc chắn muốn phê duyệt các thay đổi thông tin này?')) return;
    try {
        const res = await fetch(`${ADMIN_API_BASE}/giang-vien/${id}/approve-profile`, { method: 'PUT' });
        const data = await res.json();
        if (data.status === 'ok') {
            alert('Phê duyệt thành công.');
            await loadLecturers();
            if (window.updateAdminPendingBadges) window.updateAdminPendingBadges();
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (e) {
        console.error(e);
        alert('Không thể kết nối đến máy chủ.');
    }
}

async function rejectLecturerProfile(id) {
    if (!confirm('Bạn có chắc chắn muốn từ chối các thay đổi thông tin này?')) return;
    try {
        const res = await fetch(`${ADMIN_API_BASE}/giang-vien/${id}/reject-profile`, { method: 'PUT' });
        const data = await res.json();
        if (data.status === 'ok') {
            alert('Đã từ chối các thay đổi.');
            await loadLecturers();
            if (window.updateAdminPendingBadges) window.updateAdminPendingBadges();
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (e) {
        console.error(e);
        alert('Không thể kết nối đến máy chủ.');
    }
}

async function compareLecturerProfiles(id) {
    try {
        const res = await fetch(`/api/auth/profile?id=${id}&role=lecturer`);
        const data = await res.json();
        if (data.status !== 'ok') {
            alert('Không thể tải thông tin giảng viên: ' + data.message);
            return;
        }

        const d = data.data;
        
        let modal = document.getElementById('profileComparisonModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'profileComparisonModal';
            modal.className = 'modal-overlay';
            modal.style.cssText = 'display:none; z-index: 1100; justify-content: center; align-items: center; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5);';
            document.body.appendChild(modal);
        }

        modal.innerHTML = `
            <div class="modal" style="max-width: 750px; width: 90%; max-height: 85vh; overflow-y: auto; background: white; border-radius: var(--radius-md); box-shadow: var(--shadow-lg);">
                <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding: 15px 20px;">
                    <h2 style="margin:0; font-size: 1.25rem;"><i class="fas fa-exchange-alt" style="color:var(--accent-blue); margin-right: 8px;"></i> So sánh thay đổi thông tin</h2>
                    <button class="btn btn-sm" style="background:none;border:none;font-size:24px;cursor:pointer;color:var(--text-muted);" onclick="document.getElementById('profileComparisonModal').style.display='none'">&times;</button>
                </div>
                <div class="modal-body" style="padding: 20px;">
                    <div style="overflow-x: auto;">
                        <table class="data-table" style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <thead>
                                <tr style="background: var(--bg-hover); text-align: left; border-bottom: 2px solid var(--border-color);">
                                    <th style="padding: 10px; font-weight: 600;">Trường thông tin</th>
                                    <th style="padding: 10px; font-weight: 600;">Thông tin hiện tại</th>
                                    <th style="padding: 10px; font-weight: 600; background: #fffbeb; color: #b45309;">Thông tin mới (Chờ duyệt)</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 10px; font-weight: 500;">Ảnh đại diện</td>
                                    <td style="padding: 10px;">
                                        ${d.avatar ? `<img src="${d.avatar}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;">` : '<em>Không có</em>'}
                                    </td>
                                    <td style="padding: 10px; background: #fffbeb;">
                                        ${d.pending_anh_dai_dien ? `<img src="${d.pending_anh_dai_dien}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;border: 2px dashed #f59e0b;">` : '<em>Giữ nguyên</em>'}
                                    </td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 10px; font-weight: 500;">Họ và tên</td>
                                    <td style="padding: 10px;">${d.ho_va_ten || 'Chưa rõ'}</td>
                                    <td style="padding: 10px; background: #fffbeb; font-weight: ${d.pending_ho_va_ten && d.pending_ho_va_ten !== d.ho_va_ten ? '600; color: #b45309;' : 'normal;'}">
                                        ${d.pending_ho_va_ten || '<em>Giữ nguyên</em>'}
                                    </td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 10px; font-weight: 500;">Email</td>
                                    <td style="padding: 10px;">${d.email || 'Chưa rõ'}</td>
                                    <td style="padding: 10px; background: #fffbeb; font-weight: ${d.pending_email && d.pending_email !== d.email ? '600; color: #b45309;' : 'normal;'}">
                                        ${d.pending_email || '<em>Giữ nguyên</em>'}
                                    </td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 10px; font-weight: 500;">Số điện thoại</td>
                                    <td style="padding: 10px;">${d.dien_thoai || '<em>Trống</em>'}</td>
                                    <td style="padding: 10px; background: #fffbeb; font-weight: ${d.pending_dien_thoai && d.pending_dien_thoai !== d.dien_thoai ? '600; color: #b45309;' : 'normal;'}">
                                        ${d.pending_dien_thoai || '<em>Giữ nguyên</em>'}
                                    </td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 10px; font-weight: 500;">Học vị</td>
                                    <td style="padding: 10px;">${d.hoc_vi || '<em>Trống</em>'}</td>
                                    <td style="padding: 10px; background: #fffbeb; font-weight: ${d.pending_hoc_vi && d.pending_hoc_vi !== d.hoc_vi ? '600; color: #b45309;' : 'normal;'}">
                                        ${d.pending_hoc_vi || '<em>Giữ nguyên</em>'}
                                    </td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 10px; font-weight: 500;">Chức danh</td>
                                    <td style="padding: 10px;">${d.chuc_danh || '<em>Trống</em>'}</td>
                                    <td style="padding: 10px; background: #fffbeb; font-weight: ${d.pending_chuc_danh && d.pending_chuc_danh !== d.chuc_danh ? '600; color: #b45309;' : 'normal;'}">
                                        ${d.pending_chuc_danh || '<em>Giữ nguyên</em>'}
                                    </td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 10px; font-weight: 500;">Chức vụ</td>
                                    <td style="padding: 10px;">${d.chuc_vu || '<em>Trống</em>'}</td>
                                    <td style="padding: 10px; background: #fffbeb; font-weight: ${d.pending_chuc_vu && d.pending_chuc_vu !== d.chuc_vu ? '600; color: #b45309;' : 'normal;'}">
                                        ${d.pending_chuc_vu || '<em>Giữ nguyên</em>'}
                                    </td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 10px; font-weight: 500;">Chuyên ngành</td>
                                    <td style="padding: 10px;">${d.chuyen_nganh || '<em>Trống</em>'}</td>
                                    <td style="padding: 10px; background: #fffbeb; font-weight: ${d.pending_chuyen_nganh && d.pending_chuyen_nganh !== d.chuyen_nganh ? '600; color: #b45309;' : 'normal;'}">
                                        ${d.pending_chuyen_nganh || '<em>Giữ nguyên</em>'}
                                    </td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 10px; font-weight: 500;">Bộ môn</td>
                                    <td style="padding: 10px;">${d.bo_mon || '<em>Trống</em>'}</td>
                                    <td style="padding: 10px; background: #fffbeb; font-weight: ${d.pending_bo_mon && d.pending_bo_mon !== d.bo_mon ? '600; color: #b45309;' : 'normal;'}">
                                        ${d.pending_bo_mon || '<em>Giữ nguyên</em>'}
                                    </td>
                                </tr>
                                <tr style="border-bottom: 1px solid var(--border-color);">
                                    <td style="padding: 10px; font-weight: 500;">Hướng nghiên cứu</td>
                                    <td style="padding: 10px;">${(d.linh_vuc || []).join(', ') || '<em>Trống</em>'}</td>
                                    <td style="padding: 10px; background: #fffbeb; font-weight: 600; color: #b45309;">
                                        ${(d.pending_linh_vuc || []).join(', ') || '<em>Giữ nguyên</em>'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="margin-top: 25px; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border-color); padding-top: 15px;">
                        <button type="button" class="btn" style="background:#e2e8f0; color:#475569;" onclick="document.getElementById('profileComparisonModal').style.display='none'">Đóng</button>
                        <button type="button" class="btn" style="background:#ef4444; color:#fff;" onclick="document.getElementById('profileComparisonModal').style.display='none'; rejectLecturerProfile('${d.id}')"><i class="fas fa-user-times"></i> Từ chối</button>
                        <button type="button" class="btn btn-primary" onclick="document.getElementById('profileComparisonModal').style.display='none'; approveLecturerProfile('${d.id}')"><i class="fas fa-user-check"></i> Phê duyệt</button>
                    </div>
                </div>
            </div>
        `;
        
        modal.style.display = 'flex';

    } catch (err) {
        console.error(err);
        alert('Lỗi tải dữ liệu so sánh.');
    }
}
