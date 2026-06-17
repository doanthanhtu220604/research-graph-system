/* ============================================================

   LECTURER PROJECTS - Load & Filter

   ============================================================ */



async function loadProjects() {

    try {

        const res = await fetch(`${API_LECTURER_BASE}/de-tai?id=${userInfo.id}`);

        const data = await res.json();

        

        const tbody = document.getElementById('lecturerProjectsBody');

        if (data.status === 'ok') {

            currentEntitiesData['de-tai'] = data.data;

            // Populate project level filter dropdown dynamically
            const levelSelect = document.getElementById('filterProjLevel');
            if (levelSelect) {
                const levels = Array.from(new Set(data.data.map(dt => dt.cap_de_tai).filter(l => l)))
                    .map(l => l.trim())
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .sort();
                levelSelect.innerHTML = '<option value="">-- Cấp đề tài --</option>' + 
                    levels.map(l => `<option value="${l}">${l}</option>`).join('');
            }

            // Populate project status filter dropdown dynamically
            const statusSelect = document.getElementById('filterProjStatus');
            if (statusSelect) {
                const statuses = Array.from(new Set(data.data.map(dt => dt.trang_thai).filter(s => s)))
                    .map(s => s.trim())
                    .filter((value, index, self) => self.indexOf(value) === index)
                    .sort();
                statusSelect.innerHTML = '<option value="">-- Trạng thái --</option>' + 
                    statuses.map(s => `<option value="${s}">${s}</option>`).join('');
            }

            if(data.data.length === 0) {

                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">Bạn chưa tham gia đề tài nào.</td></tr>';

                return;

            }

            tbody.innerHTML = data.data.map((dt) => {

                const isRejected = dt.trang_thai === 'Từ chối';

                const statusClass = dt.trang_thai === 'Hoàn thành' ? 'status-completed'
                    : dt.trang_thai === 'Đang thực hiện' ? 'status-ongoing'
                    : dt.trang_thai === 'Yêu cầu xóa' ? 'status-request'
                    : dt.trang_thai === 'Chờ duyệt' ? 'status-pending'
                    : '';

                const isPending = dt.trang_thai === 'Yêu cầu xóa' || dt.trang_thai === 'Chờ duyệt';

                const disableDelete = isPending;

                const editTitle = isRejected ? 'Sửa và nộp lại để kiểm duyệt' : 'Chỉnh sửa';

                const editStyle = isRejected
                    ? 'background: rgba(220,53,69,0.12); color: #dc3545; border: 1px dashed #dc3545; margin-right:4px;'
                    : 'background: rgba(79,142,247,0.1); color: #4F8EF7; border: none; margin-right:4px;';

                const deleteOnclick = isRejected
                    ? `directDeleteRejected('de-tai', '${dt.id}')`
                    : `requestDeleteLecturerEntity('de-tai', '${dt.id}')`;

                return `

                <tr>

                    <td>${dt.id}</td>

                    <td><strong style="color: var(--text-primary);">${dt.ten_de_tai}</strong>${isRejected ? ' <span style="color:#dc3545;font-size:11px;font-weight:600;"><i class="fas fa-times-circle"></i> Từ chối</span>' : ''}</td>

                    <td>${dt.cap_de_tai || 'Chưa rõ'}</td>

                    <td style="text-align: center;"><span class="status-badge ${statusClass}">${dt.trang_thai || 'Đang thực hiện'}</span></td>

                    <td style="text-align: center;">

                        <button class="btn btn-sm" title="Xem chi tiết" onclick="viewProjectDetail('${dt.id}')" style="background:#f39c12;color:#fff;border:none;margin-right:4px;"><i class="fas fa-eye"></i></button>

                        <button class="btn btn-sm btn-view" title="${editTitle}" onclick="openLecturerModal('de-tai', '${dt.id}')" style="${editStyle}" ${isPending ? 'disabled style="opacity:0.5"' : ''}><i class="fas ${isRejected ? 'fa-paper-plane' : 'fa-edit'}"></i></button>

                        <button class="btn btn-sm" style="color:var(--accent-red); background: rgba(231,76,60,0.1); border:none;" title="Xóa" onclick="${deleteOnclick}" ${disableDelete ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}><i class="fas fa-trash"></i></button>

                    </td>

                </tr>

            `}).join('');

        }

    } catch (err) {

        console.error(err);

    }

}



function matchProjectLevel(cap, selectedLevel) {
    if (!selectedLevel) return true;
    if (!cap) return false;
    return cap.toUpperCase().normalize('NFC').includes(selectedLevel.toUpperCase().normalize('NFC'));
}

function filterProjects() {
    const nameVal = document.getElementById('filterProjName').value.toLowerCase().trim();
    const levelVal = document.getElementById('filterProjLevel').value;
    const statusVal = document.getElementById('filterProjStatus').value;

    const rows = document.querySelectorAll('#lecturerProjectsBody tr');
    rows.forEach(row => {
        if (row.cells.length < 4) return;
        const name = row.cells[1].textContent.toLowerCase();
        const level = row.cells[2].textContent;
        const status = row.cells[3].textContent;

        let visible = true;
        if (nameVal && !name.includes(nameVal)) visible = false;
        if (levelVal && !matchProjectLevel(level, levelVal)) visible = false;
        if (statusVal && status !== statusVal) visible = false;

        row.style.display = visible ? '' : 'none';
    });
}
