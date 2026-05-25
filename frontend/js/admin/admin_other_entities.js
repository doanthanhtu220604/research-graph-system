/* ============================================================
   ADMIN OTHER ENTITIES — Lĩnh vực, Tác giả ngoài, Bộ môn
   ============================================================ */

/* ─── Lĩnh vực nghiên cứu ─────────────────────────────────── */

async function loadResearchFields() {
    try {
        const res   = await fetch(ENTITY_CONFIG['linh-vuc'].apiUrl);
        const data  = await res.json();
        const tbody = document.getElementById('adminResearchFieldsBody');

        if (data.status === 'ok') {
            currentEntitiesData['linh-vuc'] = data.data;
            tbody.innerHTML = data.data.map((lv, i) => `
                <tr>
                    <td>${lv.id || i + 1}</td>
                    <td><strong>${lv.ten_linh_vuc || 'N/A'}</strong></td>
                    <td>
                        <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('linh-vuc', '${lv.id}', ${i})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('linh-vuc', '${lv.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error(err);
    }
}


/* ─── Tác giả ngoài ──────────────────────────────────────── */

async function loadExternalAuthors() {
    try {
        const res  = await fetch(ENTITY_CONFIG['tac-gia-ngoai'].apiUrl);
        const data = await res.json();

        if (data.status === 'ok') {
            currentEntitiesData['tac-gia-ngoai'] = data.data;
            filterExternalAuthors(); // Áp dụng bộ lọc
        }
    } catch (err) {
        console.error(err);
    }
}


function renderExternalAuthorsTable(dataList) {
    const tbody = document.getElementById('adminExternalAuthorsBody');
    if (!tbody) return;

    if (dataList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">Không tìm thấy tác giả ngoài phù hợp.</td></tr>';
        return;
    }

    tbody.innerHTML = dataList.map((tgn) => {
        const originalIndex = currentEntitiesData['tac-gia-ngoai'].indexOf(tgn);
        return `
        <tr>
            <td>${tgn.id || 'N/A'}</td>
            <td><strong>${tgn.ho_va_ten || 'N/A'}</strong></td>
            <td>${tgn.don_vi_cong_tac || ''}</td>
            <td>${[tgn.hoc_vi, tgn.chuc_danh].filter(Boolean).join(' / ')}</td>
            <td>
                <button class="btn btn-sm" style="background:#f39c12;color:#fff;border-color:#f39c12;" title="Xem chi tiết tham gia" onclick="viewExternalAuthorDetail('${tgn.id}')"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('tac-gia-ngoai', '${tgn.id}', ${originalIndex})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('tac-gia-ngoai', '${tgn.id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `}).join('');
}


function filterExternalAuthors() {
    const list       = currentEntitiesData['tac-gia-ngoai'] || [];
    const nameFilter = (document.getElementById('filterTgnName')?.value || '').toLowerCase();

    const filtered = list.filter(tgn => {
        return (tgn.ho_va_ten || '').toLowerCase().includes(nameFilter);
    });

    renderExternalAuthorsTable(filtered);
}


/* ─── Bộ môn ──────────────────────────────────────────────── */

async function loadDepartments() {
    try {
        const res   = await fetch(ENTITY_CONFIG['bo-mon'].apiUrl);
        const data  = await res.json();
        const tbody = document.getElementById('adminDepartmentsBody');

        if (data.status === 'ok') {
            currentEntitiesData['bo-mon'] = data.data;
            if (tbody) {
                tbody.innerHTML = data.data.map((bm, i) => `
                    <tr>
                        <td>${bm.id || i + 1}</td>
                        <td><strong>${bm.ten_bo_mon || 'N/A'}</strong></td>
                        <td>
                            <button class="btn btn-sm btn-view" title="Sửa thông tin" onclick="openAdminModal('bo-mon', '${bm.id}', ${i})"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm" style="color:var(--accent-red);border-color:var(--accent-red);" title="Xóa" onclick="deleteEntity('bo-mon', '${bm.id}')"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    } catch (err) {
        console.error(err);
    }
}
