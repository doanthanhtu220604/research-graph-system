/* ============================================================
   ADMIN MODAL — Form CRUD (Thêm mới / Chỉnh sửa entity)
   ============================================================ */

async function openAdminModal(type, id = null, index = null) {
    const config = ENTITY_CONFIG[type];
    if (!config) return;

    document.getElementById('formEntityType').value = type;
    document.getElementById('formEntityId').value   = id || '';

    const container = document.getElementById('formFieldsContainer');
    if (!container) return;

    container.innerHTML = config.fields.map(f => {
        let inputHtml = '';

        if (f.type === 'textarea') {
            inputHtml = `<textarea id="field_${f.name}" name="${f.name}" ${f.required ? 'required' : ''} style="min-height: 100px; width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--border-color);"></textarea>`;

        } else if (f.type === 'select') {
            const defaultVal = (!id && f.default) ? f.default : null;
            let optionsHtml  = f.options.map(opt => `<option value="${opt.value}"${defaultVal === opt.value ? ' selected' : ''}>${opt.label}</option>`).join('');

            // Nếu là trường bộ môn và chưa có options (do fetch động)
            if (f.name === 'bo_mon' && f.options.length === 0) {
                optionsHtml = '<option value="">-- Đang tải bộ môn... --</option>';
            }
            inputHtml = `<select id="field_${f.name}" name="${f.name}" ${f.required ? 'required' : ''}>${optionsHtml}</select>`;

        } else if (f.type === 'url' && f.name === 'link') {
            inputHtml = `
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <input type="url" id="field_${f.name}" name="${f.name}" ${f.required ? 'required' : ''} style="flex: 1; min-width: 200px;" placeholder="Nhập URL hoặc upload PDF">
                <input type="file" id="upload_pdf_${f.name}" accept=".pdf" style="display: none;" onchange="uploadPdfForLink(this, 'field_${f.name}')">
                <button type="button" class="btn" style="background: #10b981; color: white; border: none; border-radius: 4px; padding: 0 15px; cursor: pointer; display: flex; align-items: center; gap: 6px; white-space: nowrap;" onclick="document.getElementById('upload_pdf_${f.name}').click()">
                    <i class="fas fa-file-pdf"></i> Upload PDF
                </button>
            </div>
            <div id="upload_status_${f.name}" style="margin-top: 5px; font-size: 13px;"></div>
            `;

        } else {
            inputHtml = `<input type="${f.type}" id="field_${f.name}" name="${f.name}" ${f.required ? 'required' : ''}>`;
        }

        return `
        <div class="form-group">
            <label for="field_${f.name}">${f.label} ${f.required ? '<span style="color:red">*</span>' : ''}</label>
            ${inputHtml}
        </div>
        `;
    }).join('');


    document.getElementById('adminModalTitle').textContent = `Thêm mới ${config.title}`;

    if (id) {
        document.getElementById('adminModalTitle').textContent = `Chỉnh sửa ${config.title} (#${id})`;

        let item = null;
        if (currentEntitiesData[type]) {
            item = currentEntitiesData[type].find(x => x.id == id);
            if (!item && index !== null && currentEntitiesData[type][index]) {
                item = currentEntitiesData[type][index];
            }
        }

        if (item) {
            config.fields.forEach(f => {
                const input = document.getElementById(`field_${f.name}`);
                if (input && item[f.name] !== undefined) {
                    input.value = item[f.name] || '';
                }
            });
        }
    }


    // Thêm phần nhập Lĩnh vực nghiên cứu cho Giảng viên (dạng text tự do)
    if (type === 'giang-vien') {
        let currentLVText = '';
        if (id) {
            try {
                const gvRes  = await fetch(`${API_BASE}/giang-vien/${id}`);
                const gvData = await gvRes.json();
                if (gvData.status === 'ok' && gvData.data.linh_vuc) {
                    currentLVText = gvData.data.linh_vuc.join(', ');
                }
            } catch (e) {
                console.error('Lỗi tải lĩnh vực:', e);
            }
        }

        const lvHtml = `
        <div class="form-group">
            <label for="field_linh_vuc_text">Lĩnh vực nghiên cứu <span style="color:var(--text-muted); font-size:12px; font-weight:normal;">(phân tách bằng dấu phẩy)</span></label>
            <input type="text" id="field_linh_vuc_text" name="linh_vuc_text" value="${currentLVText}" placeholder="VD: Trí tuệ nhân tạo, Học máy, Xử lý ngôn ngữ tự nhiên">
        </div>`;
        container.insertAdjacentHTML('beforeend', lvHtml);
    }


    // Tải bộ môn động cho Giảng viên
    if (type === 'giang-vien') {
        try {
            const res        = await fetch(`${ADMIN_API_BASE}/bo-mon`);
            const data       = await res.json();
            const selectBM   = document.getElementById('field_bo_mon');
            if (selectBM && data.status === 'ok') {
                let html = '<option value="">-- Chọn Bộ môn --</option>';
                data.data.forEach(bm => {
                    html += `<option value="${bm.ten_bo_mon}">${bm.ten_bo_mon}</option>`;
                });
                selectBM.innerHTML = html;

                if (id) {
                    let item = currentEntitiesData[type].find(x => x.id == id);
                    if (item) selectBM.value = item.bo_mon || '';
                }
            }
        } catch (e) { console.error('Lỗi tải bộ môn:', e); }
    }


    // Thêm phần chọn Tác giả cho Công trình khi THÊM MỚI
    if (type === 'cong-trinh' && !id) {
        container.insertAdjacentHTML('beforeend', `
        <div class="form-group" id="authorPickerGroup">
            <label>Tác giả <span style="color:var(--text-muted); font-size:12px; font-weight:normal;">(có thể chọn sau)</span></label>
            <div style="display:flex; gap:12px; flex-wrap:wrap;">
                <div style="flex:1; min-width:200px;">
                    <p style="font-size:13px; font-weight:600; color:var(--accent-blue); margin-bottom:6px;"><i class="fas fa-user-tie"></i> Tác giả chính</p>
                    <div id="tacGiaChinhPickerList" style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); border-radius:6px; padding:10px;">
                        <p style="color:var(--text-muted); font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>
                    </div>
                </div>
                <div style="flex:1; min-width:200px;">
                    <p style="font-size:13px; font-weight:600; color:#10b981; margin-bottom:6px;"><i class="fas fa-users"></i> Đồng tác giả</p>
                    <div id="congSuPickerList" style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); border-radius:6px; padding:10px;">
                        <p style="color:var(--text-muted); font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>
                    </div>
                </div>
            </div>
        </div>`);

        container.insertAdjacentHTML('beforeend', `
        <div class="form-group" style="margin-top: 20px;">
            <p style="font-size:13px; font-weight:600; color:#e67e22; margin-bottom:6px;"><i class="fas fa-user-friends"></i> Tác giả ngoài</p>
            <div id="tgnPickerList_ct" style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); border-radius:6px; padding:10px;">
                <p style="color:var(--text-muted); font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>
            </div>
        </div>`);

        try {
            const [gvRes, tgnRes] = await Promise.all([
                fetch(`${API_BASE}/giang-vien`),
                fetch(`${ADMIN_API_BASE}/tac-gia-ngoai`)
            ]);
            const gvData  = await gvRes.json();
            const tgnData = await tgnRes.json();
            const allGVs  = gvData.data  || [];
            const allTGNs = tgnData.data || [];

            const tgcEl = document.getElementById('tacGiaChinhPickerList');
            const csEl  = document.getElementById('congSuPickerList');
            if (allGVs.length === 0) {
                tgcEl.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Không có giảng viên nào.</p>';
                csEl.innerHTML  = tgcEl.innerHTML;
            } else {
                const rowsHtml = (name) => allGVs.map(gv => `
                    <div style="margin-bottom:8px;">
                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary);">
                            <input type="checkbox" name="${name}" value="${gv.id}">
                            <span style="font-size:13px;">${gv.ho_va_ten}${gv.bo_mon ? '<br><span style="color:var(--text-muted);font-size:11px;">' + gv.bo_mon + '</span>' : ''}</span>
                        </label>
                    </div>`).join('');
                tgcEl.innerHTML = rowsHtml('gv_tac_gia_chinh_new');
                csEl.innerHTML  = rowsHtml('gv_cong_su_new');
            }

            const tgnEl = document.getElementById('tgnPickerList_ct');
            if (tgnEl) {
                if (allTGNs.length === 0) {
                    tgnEl.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Không có tác giả ngoài nào.</p>';
                } else {
                    tgnEl.innerHTML = allTGNs.map(tgn => `
                        <div style="margin-bottom: 8px; display:inline-block; width:48%; min-width:200px;">
                            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary); font-size:13px;">
                                <input type="checkbox" name="tgn_ids_new" value="${tgn.id}">
                                <span>${tgn.ho_va_ten} <small style="color:var(--text-muted)">(${tgn.don_vi_cong_tac || 'N/A'})</small></span>
                            </label>
                        </div>
                    `).join('');
                }
            }

        } catch (e) {
            document.getElementById('tacGiaChinhPickerList').innerHTML = '<p style="color:red;font-size:13px;">Lỗi tải dữ liệu.</p>';
            document.getElementById('congSuPickerList').innerHTML       = '<p style="color:red;font-size:13px;">Lỗi tải dữ liệu.</p>';
            if (document.getElementById('tgnPickerList_ct')) {
                document.getElementById('tgnPickerList_ct').innerHTML  = '<p style="color:red;font-size:13px;">Lỗi tải dữ liệu.</p>';
            }
        }
    }


    // Thêm phần chọn Chủ nhiệm / Thành viên cho Đề tài khi THÊM MỚI
    if (type === 'de-tai' && !id) {
        container.insertAdjacentHTML('beforeend', `
        <div class="form-group" id="memberPickerGroup">
            <label>Giảng viên tham gia <span style="color:var(--text-muted); font-size:12px; font-weight:normal;">(có thể chọn sau)</span></label>
            <div style="display:flex; gap:12px; flex-wrap:wrap;">
                <div style="flex:1; min-width:200px;">
                    <p style="font-size:13px; font-weight:600; color:var(--accent-blue); margin-bottom:6px;"><i class="fas fa-user-tie"></i> Chủ nhiệm</p>
                    <div id="chuNhiemPickerList" style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); border-radius:6px; padding:10px;">
                        <p style="color:var(--text-muted); font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>
                    </div>
                </div>
                <div style="flex:1; min-width:200px;">
                    <p style="font-size:13px; font-weight:600; color:#10b981; margin-bottom:6px;"><i class="fas fa-users"></i> Thành viên</p>
                    <div id="thamGiaPickerList" style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); border-radius:6px; padding:10px;">
                        <p style="color:var(--text-muted); font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>
                    </div>
                </div>
            </div>
        </div>`);

        container.insertAdjacentHTML('beforeend', `
        <div class="form-group" style="margin-top: 20px;">
            <p style="font-size:13px; font-weight:600; color:#e67e22; margin-bottom:6px;"><i class="fas fa-user-friends"></i> Tác giả ngoài</p>
            <div id="tgnPickerList_dt" style="max-height:180px; overflow-y:auto; border:1px solid var(--border-color); border-radius:6px; padding:10px;">
                <p style="color:var(--text-muted); font-size:13px;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</p>
            </div>
        </div>`);

        try {
            const [gvRes, tgnRes] = await Promise.all([
                fetch(`${API_BASE}/giang-vien`),
                fetch(`${ADMIN_API_BASE}/tac-gia-ngoai`)
            ]);
            const gvData  = await gvRes.json();
            const tgnData = await tgnRes.json();
            const allGVs  = gvData.data  || [];
            const allTGNs = tgnData.data || [];

            const cnEl = document.getElementById('chuNhiemPickerList');
            const tgEl = document.getElementById('thamGiaPickerList');
            if (allGVs.length === 0) {
                cnEl.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Không có giảng viên.</p>';
                tgEl.innerHTML = cnEl.innerHTML;
            } else {
                const rowsHtml = (name) => allGVs.map(gv => `
                    <div style="margin-bottom:8px;">
                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary);">
                            <input type="checkbox" name="${name}" value="${gv.id}">
                            <span style="font-size:13px;">${gv.ho_va_ten}${gv.bo_mon ? '<br><span style="color:var(--text-muted);font-size:11px;">' + gv.bo_mon + '</span>' : ''}</span>
                        </label>
                    </div>`).join('');
                cnEl.innerHTML = rowsHtml('gv_chu_nhiem_new');
                tgEl.innerHTML = rowsHtml('gv_tham_gia_new');
            }

            const tgnEl = document.getElementById('tgnPickerList_dt');
            if (tgnEl) {
                if (allTGNs.length === 0) {
                    tgnEl.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Không có tác giả ngoài nào.</p>';
                } else {
                    tgnEl.innerHTML = allTGNs.map(tgn => `
                        <div style="margin-bottom: 8px; display:inline-block; width:48%; min-width:200px;">
                            <label style="display:flex; align-items:center; gap:8px; cursor:pointer; color:var(--text-primary); font-size:13px;">
                                <input type="checkbox" name="tgn_ids_new" value="${tgn.id}">
                                <span>${tgn.ho_va_ten} <small style="color:var(--text-muted)">(${tgn.don_vi_cong_tac || 'N/A'})</small></span>
                            </label>
                        </div>
                    `).join('');
                }
            }

        } catch (e) {
            document.getElementById('chuNhiemPickerList').innerHTML  = '<p style="color:red;font-size:13px;">Lỗi tải dữ liệu.</p>';
            document.getElementById('thamGiaPickerList').innerHTML   = '<p style="color:red;font-size:13px;">Lỗi tải dữ liệu.</p>';
            if (document.getElementById('tgnPickerList_dt')) {
                document.getElementById('tgnPickerList_dt').innerHTML = '<p style="color:red;font-size:13px;">Lỗi tải dữ liệu.</p>';
            }
        }
    }

    document.getElementById('adminModalOverlay').classList.add('active');
}


function closeAdminModal() {
    document.getElementById('adminModalOverlay').classList.remove('active');
    document.getElementById('adminForm').reset();
}


/* ─── Form Submit (Create / Update) ─────────────────────────── */

async function handleFormSubmit(e) {
    e.preventDefault();

    const type   = document.getElementById('formEntityType').value;
    const id     = document.getElementById('formEntityId').value;
    const config = ENTITY_CONFIG[type];

    const formData = {};
    let hasError = false;

    for (const f of config.fields) {
        const inputEl = document.getElementById(`field_${f.name}`);
        if (!inputEl) continue;

        let val = inputEl.value;
        if (typeof val === 'string') {
            val = val.trim();
        }

        if (f.required && !val) {
            alert(`Trường "${f.label}" là bắt buộc và không được để trống hoặc chỉ chứa khoảng trắng.`);
            inputEl.focus();
            hasError = true;
            break;
        }

        if (f.type === 'number') {
            formData[f.name] = val ? parseInt(val, 10) : null;
        } else {
            formData[f.name] = val;
        }
    }

    if (hasError) return;

    // Thu thập lĩnh vực nghiên cứu từ text input (cho giảng viên)
    if (type === 'giang-vien') {
        const lvInput = document.getElementById('field_linh_vuc_text');
        if (lvInput && lvInput.value.trim()) {
            formData.linh_vuc_names = lvInput.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
        } else {
            formData.linh_vuc_names = [];
        }
    }

    // Thu thập danh sách tác giả khi THÊM MỚI công trình
    if (type === 'cong-trinh' && !id) {
        const tgcChecked = document.querySelectorAll('input[name="gv_tac_gia_chinh_new"]:checked');
        const csChecked  = document.querySelectorAll('input[name="gv_cong_su_new"]:checked');
        formData.tac_gia_chinh_ids = Array.from(tgcChecked).map(cb => cb.value);
        formData.cong_su_ids       = Array.from(csChecked).map(cb => cb.value);

        const tgnChecked = document.querySelectorAll('input[name="tgn_ids_new"]:checked');
        formData.tac_gia_ngoai_ids = Array.from(tgnChecked).map(cb => cb.value);
    }

    // Thu thập Chủ nhiệm và Thành viên khi THÊM MỚI đề tài
    if (type === 'de-tai' && !id) {
        const cnChecked = document.querySelectorAll('input[name="gv_chu_nhiem_new"]:checked');
        const tgChecked = document.querySelectorAll('input[name="gv_tham_gia_new"]:checked');
        formData.chu_nhiem_ids = Array.from(cnChecked).map(cb => cb.value);
        formData.tham_gia_ids  = Array.from(tgChecked).map(cb => cb.value);

        const tgnChecked = document.querySelectorAll('input[name="tgn_ids_new"]:checked');
        formData.tac_gia_ngoai_ids = Array.from(tgnChecked).map(cb => cb.value);
    }

    try {
        const method      = id ? 'PUT' : 'POST';
        const url         = id ? `${config.adminApiUrl}/${id}` : config.adminApiUrl;
        const mainContent = document.getElementById('mainContent');
        const scrollPos   = mainContent ? mainContent.scrollTop : 0;

        const res  = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        const data = await res.json();

        if (data.status === 'ok') {
            closeAdminModal();
            // Tải lại đúng trang đang đứng
            if (type === 'giang-vien')      await loadLecturers();
            else if (type === 'cong-trinh') await loadPublications();
            else if (type === 'de-tai')     await loadProjects();
            else if (type === 'linh-vuc')   await loadResearchFields();
            else if (type === 'tac-gia-ngoai') await loadExternalAuthors();
            else if (type === 'bo-mon')     await loadDepartments();

            if (mainContent) {
                setTimeout(() => { mainContent.scrollTop = scrollPos; }, 10);
            }
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Có lỗi xảy ra khi lưu dữ liệu.');
    }
}
