/* ============================================================

   LECTURER DETAIL VIEW - viewPublicationDetail, viewProjectDetail

   ============================================================ */



async function viewProjectDetail(dtId) {

    const overlay = document.getElementById('lecturerStatsModalOverlay');

    const titleEl = document.getElementById('lecturerStatsModalTitle');

    const bodyEl  = document.getElementById('statsFormBody');



    titleEl.textContent = 'Chi tiết ĐỀ TÀI';

    bodyEl.innerHTML = '<div style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin" style="font-size:22px;color:var(--accent-blue);"></i><br><span style="color:var(--text-muted);font-size:13px;margin-top:8px;display:block;">Đang tải dữ liệu...</span></div>';

    overlay.classList.add('active');



    try {

        const gvId = (typeof userInfo !== 'undefined' && userInfo?.id) ? userInfo.id : '';

        const res  = await fetch(`/api/lecturer/de-tai/${dtId}?gv_id=${gvId}`);

        const data = await res.json();



        if (data.status !== 'ok') {

            bodyEl.innerHTML = `<div style="color:var(--accent-red);text-align:center;padding:20px;"><i class="fas fa-exclamation-circle"></i> ${data.message || 'Không tải được dữ liệu.'}</div>`;

            return;

        }



        const dt = data.data;

        const trangThai = dt.trang_thai || 'Chưa xác định';

        let stColor = '#6c757d', stBg = 'rgba(108,117,125,0.1)';

        if (trangThai === 'Hoàn thành')          { stColor = '#28a745'; stBg = 'rgba(40,167,69,0.1)'; }

        else if (trangThai === 'Đang thực hiện') { stColor = '#007bff'; stBg = 'rgba(0,123,255,0.1)'; }

        else if (trangThai === 'Chờ duyệt')     { stColor = '#fd7e14'; stBg = 'rgba(253,126,20,0.1)'; }

        else if (trangThai === 'Từ chối')        { stColor = '#dc3545'; stBg = 'rgba(220,53,69,0.1)'; }



        const linkHtml = dt.link

            ? `<a href="${dt.link}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-blue);">${dt.link}</a>`

            : 'Chưa rõ';



        // API public trả về thanh_vien: [{ten, vai_tro}]

        const thanhVien = (dt.thanh_vien || []).filter(tv => tv && tv.ten);

        const membersHtml = thanhVien.length > 0

            ? `<ul style="margin-left:20px;margin-top:10px;line-height:1.8;">${thanhVien.map(tv => {

                const vt = tv.vai_tro === 'CHU_NHIEM' ? 'Chủ nhiệm' : 'Thành viên';

                return `<li><b>${tv.ten}</b> <span style="color:var(--text-muted);font-size:12px;">(Vai trò: <b>${vt}</b>)</span></li>`;

              }).join('')}</ul>`

            : '<p style="color:var(--text-muted);font-size:13px;margin-top:5px;">Chưa có thành viên nào được gán.</p>';



        const tgnList = dt.tac_gia_ngoai || [];

        const tgnHtml = tgnList.length > 0

            ? `<ul style="margin-left:20px;margin-top:10px;line-height:1.8;">${tgnList.map(tgn => {

                const dv = tgn.don_vi ? ` <span style="color:var(--text-muted);font-size:12px;">— ${tgn.don_vi}</span>` : '';

                const statusLabel = tgn.trang_thai === 'Chờ duyệt' ? ' <span style="color:#fd7e14;font-size:11px;font-weight:600;">(Chờ duyệt)</span>' : '';

                return `<li><i class="fas fa-user-friends" style="color:#e67e22;font-size:11px;margin-right:4px;"></i><b>${tgn.ten}</b>${dv}${statusLabel}</li>`;

              }).join('')}</ul>`

            : '<p style="color:var(--text-muted);font-size:13px;margin-top:5px;">Không có tác giả ngoài.</p>';



        bodyEl.innerHTML = `

        <div style="margin-bottom:15px;background:rgba(0,0,0,0.02);padding:15px;border-radius:8px;">

            <p style="margin-bottom:8px;font-size:16px;"><b>${dt.ten_de_tai || 'Chưa rõ'}</b>

                <span style="background:${stBg};color:${stColor};border:1px solid ${stColor};padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;margin-left:8px;">${trangThai}</span>

            </p>

            <p style="margin-bottom:5px;"><b>Cấp đề tài:</b> ${dt.cap_de_tai || 'Chưa rõ'}</p>

            <p style="margin-bottom:5px;"><b>Thời gian:</b> ${(dt.nam_bat_dau && dt.nam_ket_thuc && dt.nam_bat_dau !== dt.nam_ket_thuc) ? `${dt.nam_bat_dau} - ${dt.nam_ket_thuc}` : (dt.nam_bat_dau || dt.nam || 'Chưa rõ')}</p>

            <p style="margin-bottom:5px;"><b>Người tạo:</b> ${dt.nguoi_tao || 'Chưa rõ'}</p>

            <p style="margin-bottom:5px;"><b>Link:</b> ${linkHtml}</p>

            <p style="margin-bottom:0;margin-top:10px;"><b>Tóm tắt:</b> ${dt.tom_tat || 'Đang cập nhật...'}</p>

        </div>

        <h4 style="margin-top:20px;color:var(--accent-orange,#f59e0b);padding-bottom:5px;border-bottom:1px solid var(--border-color);">

            <i class="fas fa-users"></i> Thành viên tham gia (${thanhVien.length})

        </h4>

        ${membersHtml}

        <h4 style="margin-top:20px;color:#e67e22;padding-bottom:5px;border-bottom:1px solid var(--border-color);">

            <i class="fas fa-user-friends"></i> Tác giả ngoài (${tgnList.length})

        </h4>

        ${tgnHtml}`;



        titleEl.textContent = 'Chi tiết ĐỀ TÀI';

    } catch (err) {

        console.error(err);

        bodyEl.innerHTML = '<div style="color:var(--accent-red);text-align:center;padding:20px;"><i class="fas fa-exclamation-circle"></i> Có lỗi khi tải dữ liệu.</div>';

    }

}



async function viewPublicationDetail(ctId) {

    const overlay = document.getElementById('lecturerStatsModalOverlay');

    const titleEl = document.getElementById('lecturerStatsModalTitle');

    const bodyEl  = document.getElementById('statsFormBody');



    titleEl.textContent = 'Chi tiết Công trình';

    bodyEl.innerHTML = '<div style="text-align:center;padding:30px;"><i class="fas fa-spinner fa-spin" style="font-size:22px;color:var(--accent-blue);"></i><br><span style="color:var(--text-muted);font-size:13px;margin-top:8px;display:block;">Đang tải dữ liệu...</span></div>';

    overlay.classList.add('active');



    try {

        const gvId = (typeof userInfo !== 'undefined' && userInfo?.id) ? userInfo.id : '';

        const res  = await fetch(`/api/lecturer/cong-trinh/${ctId}?gv_id=${gvId}`);

        const data = await res.json();



        if (data.status !== 'ok') {

            bodyEl.innerHTML = `<div style="color:var(--accent-red);text-align:center;padding:20px;"><i class="fas fa-exclamation-circle"></i> ${data.message || 'Không tải được dữ liệu.'}</div>`;

            return;

        }



        const ct = data.data;

        const trangThai = ct.trang_thai || 'Chưa xác định';

        let stColor = '#6c757d', stBg = 'rgba(108,117,125,0.1)';

        if (trangThai === 'Hoàn thành')          { stColor = '#28a745'; stBg = 'rgba(40,167,69,0.1)'; }

        else if (trangThai === 'Đang thực hiện') { stColor = '#007bff'; stBg = 'rgba(0,123,255,0.1)'; }

        else if (trangThai === 'Chờ duyệt')     { stColor = '#fd7e14'; stBg = 'rgba(253,126,20,0.1)'; }

        else if (trangThai === 'Từ chối')        { stColor = '#dc3545'; stBg = 'rgba(220,53,69,0.1)'; }



        const linkHtml = ct.link

            ? `<a href="${ct.link}" target="_blank" rel="noopener noreferrer" style="color:var(--accent-blue);">${ct.link}</a>`

            : 'Chưa rõ';



        // API public trả về tac_gia: mảng object {ten, vai_tro}

        const tacGia = (ct.tac_gia || []).filter(tg => tg && tg.ten);

        const tacGiaHtml = tacGia.length > 0

            ? `<ul style="margin-left:20px;margin-top:10px;line-height:1.8;">${tacGia.map(tg => {

                let roleLabel = '';

                if (tg.vai_tro === 'TAC_GIA_CHINH') roleLabel = ' <span style="color:#4F8EF7; font-size:11px;">(Tác giả chính)</span>';

                else if (tg.vai_tro === 'CONG_SU' || tg.vai_tro === 'LA_TAC_GIA_CUA') roleLabel = ' <span style="color:#10b981; font-size:11px;">(Đồng tác giả)</span>';

                

                return `<li><i class="fas fa-user-tie" style="color:#4F8EF7;font-size:11px;margin-right:4px;"></i><b>${tg.ten}</b>${roleLabel}</li>`;

              }).join('')}</ul>`

            : '<p style="color:var(--text-muted);font-size:13px;margin-top:5px;">Chưa có tác giả nào được gán.</p>';



        const tgnList = ct.tac_gia_ngoai || [];

        const tgnHtml = tgnList.length > 0

            ? `<ul style="margin-left:20px;margin-top:10px;line-height:1.8;">${tgnList.map(tgn => {

                const dv = tgn.don_vi ? ` <span style="color:var(--text-muted);font-size:12px;">— ${tgn.don_vi}</span>` : '';

                const statusLabel = tgn.trang_thai === 'Chờ duyệt' ? ' <span style="color:#fd7e14;font-size:11px;font-weight:600;">(Chờ duyệt)</span>' : '';

                return `<li><i class="fas fa-user-friends" style="color:#e67e22;font-size:11px;margin-right:4px;"></i><b>${tgn.ten}</b>${dv}${statusLabel}</li>`;

              }).join('')}</ul>`

            : '<p style="color:var(--text-muted);font-size:13px;margin-top:5px;">Không có tác giả ngoài.</p>';



        bodyEl.innerHTML = `

        <div style="margin-bottom:15px;background:rgba(0,0,0,0.02);padding:15px;border-radius:8px;">

            <p style="margin-bottom:${(ct.ten_cong_trinh && ct.ten_cong_trinh_vi) ? '4px' : '8px'};font-size:16px;"><b>${ct.ten_cong_trinh || ct.ten_cong_trinh_vi || 'Chưa rõ'}</b>

                <span style="background:${stBg};color:${stColor};border:1px solid ${stColor};padding:2px 10px;border-radius:12px;font-size:12px;font-weight:600;margin-left:8px;">${trangThai}</span>

            </p>

            ${(ct.ten_cong_trinh && ct.ten_cong_trinh_vi) ? `<p style="margin-bottom:8px;font-size:13px;color:var(--text-muted);font-style:italic;font-weight:400;">${ct.ten_cong_trinh_vi}</p>` : ''}
            <p style="margin-bottom:5px;"><b>Năm xuất bản:</b> ${ct.nam_xuat_ban || 'Chưa rõ'}</p>
            <p style="margin-bottom:5px;"><b>Nơi xuất bản:</b> ${ct.noi_xuat_ban || 'Chưa rõ'}</p>

            <p style="margin-bottom:5px;"><b>Người tạo:</b> ${ct.nguoi_tao || 'Hệ thống / Admin'}</p>

            <p style="margin-bottom:5px;"><b>Link:</b> ${linkHtml}</p>

            <p style="margin-bottom:0;margin-top:10px;"><b>Tóm tắt:</b> ${ct.tom_tat || 'Đang cập nhật...'}</p>

        </div>

        <h4 style="margin-top:20px;color:var(--accent-blue);padding-bottom:5px;border-bottom:1px solid var(--border-color);">

            <i class="fas fa-users"></i> Tác giả nội bộ (${tacGia.length})

        </h4>

        ${tacGiaHtml}

        <h4 style="margin-top:20px;color:#e67e22;padding-bottom:5px;border-bottom:1px solid var(--border-color);">

            <i class="fas fa-user-friends"></i> Tác giả ngoài (${tgnList.length})

        </h4>

        ${tgnHtml}`;



        titleEl.textContent = 'Chi tiết Công trình';

    } catch (err) {

        console.error(err);

        bodyEl.innerHTML = '<div style="color:var(--accent-red);text-align:center;padding:20px;"><i class="fas fa-exclamation-circle"></i> Có lỗi khi tải dữ liệu.</div>';

    }

}



function closeStatsModal() {

    if(document.getElementById('lecturerStatsModalOverlay')) {

        document.getElementById('lecturerStatsModalOverlay').classList.remove('active');

    }

}
