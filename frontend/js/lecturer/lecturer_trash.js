/* ============================================================

   LECTURER TRASH - Thùng rác, khôi phục, xóa vĩnh viễn

   ============================================================ */



async function loadLecturerTrash() {

    const tbody = document.getElementById('lecturerTrashBody');

    if (!tbody) return;



    try {

        const res = await fetch(`${API_LECTURER_BASE}/trash?id=${userInfo.id}`);

        const data = await res.json();



        if (data.status === 'ok') {

            if (data.data.length === 0) {

                tbody.innerHTML = '<tr><td colspan="5" class="trash-empty-state"><div><i class="fas fa-trash-alt"></i><p>Thùng rác trống</p></div></td></tr>';

                return;

            }



            tbody.innerHTML = data.data.map(item => {

                const date = new Date(item.deleted_at).toLocaleString('vi-VN');

                const typeLabel = item.type === 'cong-trinh' ? 'Công trình' : 'Đề tài';

                const title = item.ten_cong_trinh || item.ten_de_tai || 'N/A';

                

                let statusHtml = '';

                let isPendingRestore = item.trang_thai === 'Yêu cầu khôi phục';
                let isPendingDelete  = item.trang_thai === 'Yêu cầu xóa';



                if (isPendingRestore) {

                    statusHtml = '<span class="status-badge status-request" style="background: rgba(46,204,113,0.1); color: #2ecc71; border: 1px solid #2ecc71;"><i class="fas fa-clock"></i> Đang chờ duyệt khôi phục</span>';

                } else if (isPendingDelete) {

                    statusHtml = '<span class="status-badge status-request" style="background: rgba(231,76,60,0.1); color: #e74c3c; border: 1px solid #e74c3c;"><i class="fas fa-clock"></i> Đang chờ duyệt xóa vĩnh viễn</span>';

                } else {

                    statusHtml = '<span class="status-badge status-trash"><i class="fas fa-trash"></i> Trong thùng rác</span>';

                }



                const actionButtons = (isPendingRestore || isPendingDelete) 

                    ? `<button class="btn btn-sm" disabled style="opacity:0.6; cursor:not-allowed;"><i class="fas fa-hourglass-half"></i> Chờ duyệt</button>`

                    : `

                        <button class="btn btn-sm" onclick="restoreLecturerEntity('${item.type}', '${item.id}')" style="background:#2ecc71; color:#fff; border:none; margin-right:5px;" title="Yêu cầu khôi phục">

                            <i class="fas fa-undo"></i> Khôi phục

                        </button>

                        <button class="btn btn-sm" onclick="requestPermanentDelete('${item.type}', '${item.id}')" style="background:#e74c3c; color:#fff; border:none;" title="Yêu cầu xóa vĩnh viễn">

                            <i class="fas fa-trash-alt"></i> Xóa vĩnh viễn

                        </button>

                    `;



                return `

                    <tr>

                        <td><span style="font-size:12px; font-weight:600; color:var(--accent-blue);">${typeLabel}</span></td>

                        <td><strong style="color:var(--text-primary);">${title}</strong></td>

                        <td><span style="font-size:13px; color:var(--text-muted);">${date}</span></td>

                        <td style="text-align:center;">${statusHtml}</td>

                        <td style="text-align:center;">${actionButtons}</td>

                    </tr>

                `;

            }).join('');

        }

    } catch (err) {

        console.error(err);

        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Lỗi khi tải dữ liệu thùng rác.</td></tr>';

    }

}



async function restoreLecturerEntity(type, id) {

    if (!confirm('Bạn có chắc chắn muốn khôi phục mục này không?')) return;



    try {

        const res = await fetch(`${API_LECTURER_BASE}/trash/${type}/${id}/restore?gv_id=${userInfo.id}`, {

            method: 'PUT'

        });

        const data = await res.json();

        if (data.status === 'ok') {

            if (data.restored_directly) {

                alert('Đã khôi phục thành công mục này về danh sách của bạn!');

            } else {

                alert('Đã gửi yêu cầu khôi phục tới Admin. Vui lòng chờ phê duyệt.');

            }

            loadLecturerTrash();

        } else {

            alert('Lỗi: ' + data.message);

        }

    } catch (err) {

        console.error(err);

        alert('Có lỗi xảy ra.');

    }

}



async function requestPermanentDelete(type, id) {

    if (!confirm('Bạn có chắc chắn muốn xóa vĩnh viễn mục này? Hành động này sẽ xóa hoàn toàn dữ liệu khỏi hệ thống và không thể khôi phục.')) return;



    try {

        const res = await fetch(`${API_LECTURER_BASE}/trash/${type}/${id}/permanent?gv_id=${userInfo.id}`, {

            method: 'DELETE'

        });

        const data = await res.json();

        if (data.status === 'ok') {

            alert('Đã xóa vĩnh viễn thành công.');

            loadLecturerTrash();

        } else {

            alert('Lỗi: ' + data.message);

        }

    } catch (err) {

        console.error(err);

        alert('Có lỗi xảy ra.');

    }

}
