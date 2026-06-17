/* ============================================================

   LECTURER PUBLICATIONS - Load & Filter

   ============================================================ */



async function loadPublications() {

    try {

        const res = await fetch(`${API_LECTURER_BASE}/cong-trinh?id=${userInfo.id}`);

        const data = await res.json();

        

        const tbody = document.getElementById('lecturerPublicationsBody');

        if (data.status === 'ok') {

            currentEntitiesData['cong-trinh'] = data.data;

            // Populate publication year filter dropdown dynamically
            const yearSelect = document.getElementById('filterPubYear');
            if (yearSelect) {
                const years = Array.from(new Set(data.data.map(ct => ct.nam_xuat_ban).filter(y => y)))
                    .sort((a, b) => Number(b) - Number(a));
                yearSelect.innerHTML = '<option value="">-- Năm xuất bản --</option>' + 
                    years.map(y => `<option value="${y}">${y}</option>`).join('');
            }

            if(data.data.length === 0) {

                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">Bạn chưa có công trình nào.</td></tr>';

                return;

            }

            tbody.innerHTML = data.data.map((ct) => {

                const isRejected = ct.trang_thai === 'Từ chối';

                const statusClass = ct.trang_thai === 'Hoàn thành' ? 'status-completed'
                    : ct.trang_thai === 'Đang thực hiện' ? 'status-ongoing'
                    : ct.trang_thai === 'Yêu cầu xóa' ? 'status-request'
                    : ct.trang_thai === 'Chờ duyệt' ? 'status-pending'
                    : '';

                const isPending = ct.trang_thai === 'Yêu cầu xóa' || ct.trang_thai === 'Chờ duyệt';

                const disableDelete = isPending;  // Từ chối vẫn cho xóa

                const editTitle = isRejected ? 'Sửa và nộp lại để kiểm duyệt' : 'Chỉnh sửa';

                const editStyle = isRejected
                    ? 'background: rgba(220,53,69,0.12); color: #dc3545; border: 1px dashed #dc3545; margin-right:4px;'
                    : 'background: rgba(79,142,247,0.1); color: #4F8EF7; border: none; margin-right:4px;';

                // Nút xóa: nếu bị từ chối thì xóa thẳng (không cần duyệt admin), ngược lại gửi yêu cầu
                const deleteOnclick = isRejected
                    ? `directDeleteRejected('cong-trinh', '${ct.id}')`
                    : `requestDeleteLecturerEntity('cong-trinh', '${ct.id}')`;

                return `

                <tr>

                    <td>${ct.id}</td>

                    <td><strong style="color: var(--text-primary);">${ct.ten_cong_trinh || ct.ten_cong_trinh_vi || 'N/A'}</strong>${isRejected ? ' <span style="color:#dc3545;font-size:11px;font-weight:600;"><i class="fas fa-times-circle"></i> Từ chối</span>' : ''}</td>

                    <td>${ct.nam_xuat_ban || ''}</td>

                    <td style="text-align: center;"><span class="status-badge ${statusClass}">${ct.trang_thai || 'Đang thực hiện'}</span></td>

                    <td style="text-align: center;">

                        <button class="btn btn-sm" title="Xem chi tiết" onclick="viewPublicationDetail('${ct.id}')" style="background:#f39c12;color:#fff;border:none;margin-right:4px;"><i class="fas fa-eye"></i></button>

                        <button class="btn btn-sm btn-view" title="${editTitle}" onclick="openLecturerModal('cong-trinh', '${ct.id}')" style="${editStyle}" ${isPending ? 'disabled style="opacity:0.5"' : ''}><i class="fas ${isRejected ? 'fa-paper-plane' : 'fa-edit'}"></i></button>

                        <button class="btn btn-sm" style="color:var(--accent-red); background: rgba(231,76,60,0.1); border:none;" title="Xóa" onclick="${deleteOnclick}" ${disableDelete ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}><i class="fas fa-trash"></i></button>

                    </td>

                </tr>

            `}).join('');

        }

    } catch (err) {

        console.error(err);

    }

}



function filterPublications() {

    const nameVal = document.getElementById('filterPubName').value.toLowerCase();

    const yearVal = document.getElementById('filterPubYear').value;



    const rows = document.querySelectorAll('#lecturerPublicationsBody tr');

    rows.forEach(row => {

        if (row.cells.length < 4) return;

        const nameEn = row.cells[1].textContent.toLowerCase();
        // cell[1] chứa cả tên Anh và Việt (textContent sẽ gộp cả hai)

        let visible = true;
        if (nameVal && !nameEn.includes(nameVal)) visible = false;
        if (yearVal && !row.cells[2].textContent.includes(yearVal)) visible = false;

        row.style.display = visible ? '' : 'none';

    });

}
