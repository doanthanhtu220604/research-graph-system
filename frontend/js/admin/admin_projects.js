/* ============================================================
   ADMIN PROJECTS — Quản lý Đề tài
   ============================================================ */

async function loadProjects() {
    try {
        const res  = await fetch(ENTITY_CONFIG['de-tai'].apiUrl);
        const data = await res.json();

        if (data.status === 'ok') {
            currentEntitiesData['de-tai'] = data.data;
            populateProjectYearFilter(data.data);
            populateProjectLevelFilter(data.data);
            filterProjects(); // Áp dụng bộ lọc hiện tại
        }
    } catch (err) {
        console.error(err);
    }
}


function renderProjectsTable(dataList) {
    const tbody = document.getElementById('adminProjectsBody');
    if (!tbody) return;

    if (dataList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Không tìm thấy đề tài phù hợp.</td></tr>';
        return;
    }

    tbody.innerHTML = dataList.map((dt) => {
        const originalIndex = currentEntitiesData['de-tai'].indexOf(dt);
        const namThucHien   = (dt.nam_bat_dau && dt.nam_ket_thuc && dt.nam_bat_dau !== dt.nam_ket_thuc)
            ? `${dt.nam_bat_dau} - ${dt.nam_ket_thuc}`
            : (dt.nam_bat_dau || dt.nam_ket_thuc || '');
        const trangThai = dt.trang_thai || 'Chưa xác định';
        let statusColor = '#6c757d';
        let statusBg    = 'rgba(108,117,125,0.1)';

        if (trangThai === 'Hoàn thành')        { statusColor = '#28a745'; statusBg = 'rgba(40,167,69,0.1)'; }
        else if (trangThai === 'Đang thực hiện') { statusColor = '#007bff'; statusBg = 'rgba(0,123,255,0.1)'; }
        else if (trangThai === 'Chờ duyệt')     { statusColor = '#fd7e14'; statusBg = 'rgba(253,126,20,0.1)'; }
        else if (trangThai === 'Yêu cầu xóa')  { statusColor = '#e74c3c'; statusBg = 'rgba(231,76,60,0.1)'; }

        return `
        <tr>
            <td>${dt.id || 'N/A'}</td>
            <td><strong>${dt.ten_de_tai || 'N/A'}</strong></td>
            <td>${dt.cap_de_tai || ''}</td>
            <td>${namThucHien}</td>
            <td><span style="background:${statusBg}; color:${statusColor}; border:1px solid ${statusColor}; padding:3px 10px; border-radius:12px; font-size:12px; font-weight:600; white-space:nowrap;">${trangThai}</span></td>
            <td>
                ${trangThai === 'Chờ duyệt'   ? `<button class="btn btn-sm" style="background:#28a745;color:#fff;border-color:#28a745;" title="Duyệt đề tài" onclick="approveProject('${dt.id}')"><i class="fas fa-check"></i></button>` : ''}
                ${trangThai === 'Yêu cầu xóa' ? `<button class="btn btn-sm" style="background:#e74c3c;color:#fff;border-color:#e74c3c;" title="Duyệt XÓA đề tài" onclick="approveDeleteEntity('de-tai', '${dt.id}')"><i class="fas fa-trash-alt"></i></button>` : ''}
                <button class="btn btn-sm" style="background:#f39c12;color:#fff;border-color:#f39c12;" title="Xem chi tiết" onclick="viewProjectStats('${dt.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('de-tai', '${dt.id}', ${originalIndex})"><i class="fas fa-edit"></i></button>
                ${dt.id ? `<button class="btn btn-sm" style="background:#17a2b8;color:#fff;border-color:#17a2b8;" title="Gán Chủ nhiệm/Thành viên" onclick="openRelationModal('de-tai', '${dt.id}')"><i class="fas fa-link"></i></button>` : ''}
                <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('de-tai', '${dt.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `}).join('');
}


function filterProjects() {
    const list        = currentEntitiesData['de-tai'] || [];
    const nameFilter  = (document.getElementById('filterProjName')?.value || '').normalize('NFC').toLowerCase().trim();
    const levelFilter = document.getElementById('filterProjLevel')?.value || '';
    const yearFilter  = document.getElementById('filterProjYear')?.value || '';

    const filtered = list.filter(dt => {
        const title     = (dt.ten_de_tai || '').normalize('NFC').toLowerCase();
        const matchName  = title.includes(nameFilter);
        const matchLevel = levelFilter === '' || (dt.cap_de_tai === levelFilter);
        const matchYear  = yearFilter === '' || (dt.nam_bat_dau == yearFilter || dt.nam_ket_thuc == yearFilter);
        return matchName && matchLevel && matchYear;
    });

    renderProjectsTable(filtered);
}


function populateProjectYearFilter(data) {
    const select = document.getElementById('filterProjYear');
    if (!select) return;

    const currentVal = select.value;
    const years = new Set();
    data.forEach(dt => {
        if (dt.nam_bat_dau) {
            const y = Number(String(dt.nam_bat_dau).trim());
            if (!isNaN(y)) years.add(y);
        }
        if (dt.nam_ket_thuc) {
            const y = Number(String(dt.nam_ket_thuc).trim());
            if (!isNaN(y)) years.add(y);
        }
    });

    const sortedYears = Array.from(years).sort((a, b) => b - a);
    let html = '<option value="">-- Năm thực hiện --</option>';
    sortedYears.forEach(year => {
        html += `<option value="${year}">Năm ${year}</option>`;
    });
    select.innerHTML = html;
    select.value = currentVal;
}


function populateProjectLevelFilter(data) {
    const select = document.getElementById('filterProjLevel');
    if (!select) return;

    const currentVal = select.value;
    const levels = new Set();
    data.forEach(dt => {
        if (dt.cap_de_tai && dt.cap_de_tai.trim() !== '') {
            levels.add(dt.cap_de_tai.trim());
        }
    });

    const sortedLevels = Array.from(levels).sort();
    let html = '<option value="">-- Cấp đề tài --</option>';
    sortedLevels.forEach(level => {
        html += `<option value="${level}">${level}</option>`;
    });
    select.innerHTML = html;

    if (sortedLevels.includes(currentVal)) {
        select.value = currentVal;
    } else {
        select.value = "";
    }
}


async function approveProject(id) {
    if (!confirm('Bạn có chắc muốn duyệt đề tài này thành "Đang thực hiện"?')) return;
    try {
        const res  = await fetch(`${ADMIN_API_BASE}/de-tai/${id}/approve`, { method: 'PUT' });
        const data = await res.json();
        if (data.status === 'ok') {
            const mainContent = document.getElementById('mainContent');
            const scrollPos   = mainContent ? mainContent.scrollTop : 0;
            await loadProjects();
            if (mainContent) setTimeout(() => { mainContent.scrollTop = scrollPos; }, 10);
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi khi duyệt đề tài.');
    }
}
