/* ============================================================
   ADMIN LECTURERS — Quản lý Giảng viên
   ============================================================ */

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
            <td>${gv.id || 'N/A'}</td>
            <td>${gv.ma_gv || 'N/A'}</td>
            <td>
                ${gv.anh_dai_dien
                    ? `<img src="${gv.anh_dai_dien}" alt="${gv.ho_va_ten}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;">`
                    : `<i class="fas fa-user-circle" style="font-size:32px;color:var(--text-muted);vertical-align:middle;margin-right:8px;"></i>`
                }
                <strong>${gv.ho_va_ten || 'N/A'}</strong>
            </td>
            <td>${gv.hoc_vi || ''}</td>
            <td>${gv.bo_mon || ''}</td>
            <td>
                ${gv.trang_thai_cong_tac === 'Đang công tác'  ? '<span class="badge" style="background:#10b981;color:white;">Đang công tác</span>' :
                  gv.trang_thai_cong_tac === 'Nghỉ hưu'       ? '<span class="badge badge-gray">Nghỉ hưu</span>' :
                  gv.trang_thai_cong_tac === 'Chuyển công tác' ? '<span class="badge" style="background:#f59e0b;color:white;">Chuyển công tác</span>' :
                  gv.trang_thai_cong_tac === 'Nghiên cứu sinh' ? '<span class="badge badge-blue">Nghiên cứu sinh</span>' :
                  '<span class="badge" style="background:#10b981;color:white;">Đang công tác</span>'}
            </td>
            <td>
                <button class="btn btn-sm" style="background:#f39c12;color:#fff;border-color:#f39c12;" title="Xem chi tiết" onclick="viewLecturerStats('${gv.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('giang-vien', '${gv.id}', null)"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('giang-vien', '${gv.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}


function filterLecturers() {
    const list        = currentEntitiesData['giang-vien'] || [];
    const nameFilter  = (document.getElementById('filterName')?.value || '').normalize('NFC').toLowerCase().trim();
    const deptFilter  = document.getElementById('filterDepartment')?.value || '';
    const degreeFilter = document.getElementById('filterDegree')?.value || '';

    const filtered = list.filter(gv => {
        const name        = (gv.ho_va_ten || '').normalize('NFC').toLowerCase();
        const matchName   = name.includes(nameFilter);
        const matchDept   = deptFilter === '' || (gv.bo_mon === deptFilter);
        const matchDegree = degreeFilter === '' || (gv.hoc_vi && gv.hoc_vi.includes(degreeFilter));
        return matchName && matchDept && matchDegree;
    });

    renderLecturersTable(filtered);
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
