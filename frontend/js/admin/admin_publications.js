/* ============================================================
   ADMIN PUBLICATIONS — Quản lý Công trình
   ============================================================ */

async function loadPublications() {
    try {
        const res  = await fetch(ENTITY_CONFIG['cong-trinh'].apiUrl);
        const data = await res.json();

        if (data.status === 'ok') {
            currentEntitiesData['cong-trinh'] = data.data;
            populatePublicationYearFilter(data.data);
            filterPublications(); // Áp dụng bộ lọc hiện tại
        }
    } catch (err) {
        console.error(err);
    }
}


function renderPublicationsTable(dataList) {
    const tbody = document.getElementById('adminPublicationsBody');
    if (!tbody) return;

    if (dataList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted); padding: 30px;">Không tìm thấy công trình phù hợp.</td></tr>';
        return;
    }

    tbody.innerHTML = dataList.map((ct) => {
        const originalIndex = currentEntitiesData['cong-trinh'].indexOf(ct);
        const trangThai     = ct.trang_thai || 'Chưa xác định';
        let statusColor = '#6c757d';
        let statusBg    = 'rgba(108,117,125,0.1)';

        if (trangThai === 'Hoàn thành')        { statusColor = '#28a745'; statusBg = 'rgba(40,167,69,0.1)'; }
        else if (trangThai === 'Đang thực hiện') { statusColor = '#007bff'; statusBg = 'rgba(0,123,255,0.1)'; }
        else if (trangThai === 'Chờ duyệt')     { statusColor = '#fd7e14'; statusBg = 'rgba(253,126,20,0.1)'; }
        else if (trangThai === 'Yêu cầu xóa')  { statusColor = '#e74c3c'; statusBg = 'rgba(231,76,60,0.1)'; }

        return `
        <tr>
            <td>${ct.id || 'N/A'}</td>
            <td><strong>${ct.ten_cong_trinh || 'N/A'}</strong></td>
            <td>${ct.nam_xuat_ban || ''}</td>
            <td><span style="background:${statusBg}; color:${statusColor}; border:1px solid ${statusColor}; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; white-space:nowrap;">${trangThai}</span></td>
            <td>
                ${trangThai === 'Chờ duyệt'    ? `
                    <button class="btn btn-sm" style="background:#28a745;color:#fff;border-color:#28a745;" title="Duyệt công trình" onclick="approvePublication('${ct.id}')"><i class="fas fa-check"></i></button>
                    <button class="btn btn-sm" style="background:#e74c3c;color:#fff;border-color:#e74c3c;" title="Từ chối duyệt công trình" onclick="rejectEntity('cong-trinh', '${ct.id}')"><i class="fas fa-ban"></i></button>
                ` : ''}
                ${trangThai === 'Yêu cầu xóa'  ? `
                    <button class="btn btn-sm" style="background:#e74c3c;color:#fff;border-color:#e74c3c;" title="Duyệt XÓA công trình" onclick="approveDeleteEntity('cong-trinh', '${ct.id}')"><i class="fas fa-trash-alt"></i></button>
                    <button class="btn btn-sm" style="background:#6c757d;color:#fff;border-color:#6c757d;" title="Từ chối yêu cầu xóa" onclick="rejectEntity('cong-trinh', '${ct.id}')"><i class="fas fa-undo"></i></button>
                ` : ''}
                <button class="btn btn-sm" style="background:#f39c12;color:#fff;border-color:#f39c12;" title="Xem chi tiết" onclick="viewPublicationStats('${ct.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('cong-trinh', '${ct.id}', ${originalIndex})"><i class="fas fa-edit"></i></button>
                ${ct.id ? `<button class="btn btn-sm" style="background:#17a2b8;color:#fff;border-color:#17a2b8;" title="Gán Tác giả" onclick="openRelationModal('cong-trinh', '${ct.id}')"><i class="fas fa-link"></i></button>` : ''}
                <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('cong-trinh', '${ct.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `}).join('');
}


function filterPublications() {
    const list        = currentEntitiesData['cong-trinh'] || [];
    const titleFilter = (document.getElementById('filterPubTitle')?.value || '').normalize('NFC').toLowerCase().trim();
    const yearFilter  = document.getElementById('filterPubYear')?.value || '';

    const filtered = list.filter(ct => {
        const title      = (ct.ten_cong_trinh || '').normalize('NFC').toLowerCase();
        const matchTitle = title.includes(titleFilter);
        const matchYear  = yearFilter === '' || (ct.nam_xuat_ban == yearFilter);
        return matchTitle && matchYear;
    });

    renderPublicationsTable(filtered);
}


function populatePublicationYearFilter(data) {
    const select = document.getElementById('filterPubYear');
    if (!select) return;

    const years = new Set();
    data.forEach(ct => {
        if (ct.nam_xuat_ban) {
            const y = Number(String(ct.nam_xuat_ban).trim());
            if (!isNaN(y)) years.add(y);
        }
    });

    const sortedYears = Array.from(years).sort((a, b) => b - a);
    const currentVal  = select.value;
    let html = '<option value="">-- Năm xuất bản --</option>';
    sortedYears.forEach(year => {
        html += `<option value="${year}">Năm ${year}</option>`;
    });
    select.innerHTML = html;
    select.value = currentVal;
}


async function approvePublication(id) {
    if (!confirm('Bạn có chắc muốn duyệt công trình này thành "Đang thực hiện"?')) return;
    try {
        const res  = await fetch(`${ADMIN_API_BASE}/cong-trinh/${id}/approve`, { method: 'PUT' });
        const data = await res.json();
        if (data.status === 'ok') {
            const mainContent = document.getElementById('mainContent');
            const scrollPos   = mainContent ? mainContent.scrollTop : 0;
            await loadPublications();
            if (window.updateAdminPendingBadges) window.updateAdminPendingBadges();
            if (mainContent) setTimeout(() => { mainContent.scrollTop = scrollPos; }, 10);
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi khi duyệt công trình.');
    }
}


async function approveDeleteEntity(type, id) {
    if (!confirm('Bạn có chắc muốn phê duyệt yêu cầu XÓA của giảng viên? Mục này sẽ được chuyển vào Thùng rác của hệ thống.')) return;
    try {
        const res  = await fetch(`${ADMIN_API_BASE}/${type}/${id}/approve-delete`, { method: 'PUT' });
        const data = await res.json();
        if (data.status === 'ok') {
            const mainContent = document.getElementById('mainContent');
            const scrollPos   = mainContent ? mainContent.scrollTop : 0;
            if (type === 'cong-trinh') await loadPublications();
            else if (type === 'de-tai') await loadProjects();
            if (window.updateAdminPendingBadges) window.updateAdminPendingBadges();
            if (mainContent) setTimeout(() => { mainContent.scrollTop = scrollPos; }, 10);
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi khi phê duyệt xóa.');
    }
}


async function rejectEntity(type, id) {
    const actionLabel = type === 'cong-trinh' ? 'công trình' : 'đề tài';
    if (!confirm(`Bạn có chắc chắn muốn TỪ CHỐI yêu cầu đối với ${actionLabel} này không?`)) return;
    try {
        const res = await fetch(`${ADMIN_API_BASE}/${type}/${id}/reject`, { method: 'PUT' });
        const data = await res.json();
        if (data.status === 'ok') {
            const mainContent = document.getElementById('mainContent');
            const scrollPos   = mainContent ? mainContent.scrollTop : 0;
            if (type === 'cong-trinh') await loadPublications();
            else if (type === 'de-tai') await loadProjects();
            if (window.updateAdminPendingBadges) window.updateAdminPendingBadges();
            if (mainContent) setTimeout(() => { mainContent.scrollTop = scrollPos; }, 10);
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi khi từ chối yêu cầu.');
    }
}
