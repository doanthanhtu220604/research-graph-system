/* ============================================================

   LECTURER MODAL FORM - ENTITY_CONFIG, openLecturerModal, handleFormSubmit, delete

   ============================================================ */



const ENTITY_CONFIG = {

    'cong-trinh': {

        title: 'Công trình',

        fields: [

            { name: 'ten_cong_trinh', label: 'Tên công trình', type: 'text', required: true },

            { name: 'nam_xuat_ban', label: 'Năm xuất bản', type: 'number' },
            { name: 'noi_xuat_ban', label: 'Nơi xuất bản', type: 'text' },

            { name: 'tom_tat', label: 'Tóm tắt nội dung', type: 'textarea' },

            { name: 'link', label: 'Link bài viết', type: 'url' },

            { name: 'thanh_vien_ids', label: 'Thành viên tham gia (Tùy chọn)', type: 'lecturers-select' },

            { name: 'tac_gia_ngoai_ids', label: 'Tác giả ngoài (Tùy chọn)', type: 'external-authors-select' }

        ]

    },

    'de-tai': {

        title: 'Đề tài',

        fields: [

            { name: 'ten_de_tai', label: 'Tên đề tài', type: 'text', required: true },

            { name: 'cap_de_tai', label: 'Cấp đề tài', type: 'select', options: [

                { value: 'Cấp cơ sở', label: 'Cấp cơ sở' },

                { value: 'Cấp Bộ', label: 'Cấp Bộ' },

                { value: 'Cấp Tỉnh', label: 'Cấp Tỉnh' },

                { value: 'Cấp Nhà nước', label: 'Cấp Nhà nước' },

                { value: 'Khác', label: 'Khác' }

            ]},

            { name: 'vai_tro', label: 'Vai trò của bạn', type: 'select', required: true, options: [

                { value: 'CHU_NHIEM', label: 'Chủ nhiệm đề tài' },

                { value: 'THAM_GIA', label: 'Thành viên tham gia' }

            ]},

            { name: 'nam', label: 'Năm thực hiện', type: 'number' },
            { name: 'tom_tat', label: 'Tóm tắt nội dung', type: 'textarea' },

            { name: 'link', label: 'Link đề tài', type: 'url' },

            { name: 'thanh_vien_ids', label: 'Thành viên tham gia (Tùy chọn)', type: 'lecturers-select' },

            { name: 'tac_gia_ngoai_ids', label: 'Tác giả ngoài (Tùy chọn)', type: 'external-authors-select' }

        ]

    }

};



function openLecturerModal(type, id = null) {

    const config = ENTITY_CONFIG[type];

    if (!config) return;



    // Reset suggestion state khi mở modal mới

    suggestedSelected = {};



    document.getElementById('formEntityType').value = type;

    document.getElementById('formEntityId').value = id || '';

    

    const container = document.getElementById('formFieldsContainer');

    

    container.innerHTML = config.fields.map(f => {

        let inputHtml = '';

        if (f.type === 'textarea') {

            inputHtml = `<textarea id="field_${f.name}" name="${f.name}" ${f.required ? 'required' : ''} style="min-height: 100px; width: 100%; padding: 10px; border-radius: 6px; border: 1px solid var(--border-color);"></textarea>`;

        } else if (f.type === 'select') {

            const optionsHtml = f.options.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('');

            inputHtml = `<select id="field_${f.name}" name="${f.name}" ${f.required ? 'required' : ''}>${optionsHtml}</select>`;

        } else if (f.type === 'lecturers-select') {

            const currentIds = id ? ((currentEntitiesData[type] || []).find(x => x.id == id) || {}).thanh_vien_ids || [] : [];

            const optionsHtml = allLecturers

                .filter(gv => gv.id != userInfo.id)

                .map(gv => {
                    const checked = currentIds.includes(gv.id) ? 'checked' : '';
                    return `<div style="padding: 5px; border-bottom: 1px solid var(--border-color);"><label style="display:flex; align-items:center; gap: 8px; cursor: pointer; font-weight: normal; margin: 0;"><input type="checkbox" class="member-checkbox" name="${f.name}" value="${gv.id}" ${checked}> ${gv.ho_va_ten} ${gv.bo_mon ? '('+gv.bo_mon+')' : ''}</label></div>`;
                })

                .join('');

            inputHtml = `<div id="field_${f.name}" style="max-height: 150px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px; padding: 5px; background: white;">${optionsHtml}</div>`;

        } else if (f.type === 'external-authors-select') {

            const currentTgnIds = id ? ((currentEntitiesData[type] || []).find(x => x.id == id) || {}).tac_gia_ngoai_ids || [] : [];

            const optionsHtml = allExternalAuthors

                .map(tgn => {

                    const statusTag = tgn.trang_thai === 'Chờ duyệt' ? ' <span style="color:#f39c12;font-size:10px;font-weight:600;">(Chờ duyệt)</span>' : '';
                    const checked = currentTgnIds.includes(tgn.id) ? 'checked' : '';

                    return `<div style="padding: 5px; border-bottom: 1px solid var(--border-color);"><label style="display:flex; align-items:center; gap: 8px; cursor: pointer; font-weight: normal; margin: 0;"><input type="checkbox" class="tgn-checkbox" name="${f.name}" value="${tgn.id}" ${checked}> ${tgn.ho_va_ten} ${tgn.don_vi_cong_tac ? '('+tgn.don_vi_cong_tac+')' : ''}${statusTag}</label></div>`;

                })

                .join('');

            inputHtml = `
                <div style="display:flex; flex-direction:column; gap:5px; width: 100%;">
                    <div id="field_${f.name}" style="max-height: 120px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 6px; padding: 5px; background: white; width: 100%;">
                        ${optionsHtml || '<div style="color:var(--text-muted);font-size:12px;padding:5px;">Chưa có tác giả ngoài nào.</div>'}
                    </div>
                    <button type="button" class="btn btn-sm" style="align-self: flex-start; background: var(--bg-hover); color: var(--accent-blue); border: 1px solid var(--border-color); font-size: 12px; padding: 4px 8px; border-radius: 4px; display: flex; align-items: center; gap: 4px; cursor: pointer;" onclick="openAddExternalAuthorModal('${f.name}')">
                        <i class="fas fa-plus-circle"></i> Thêm tác giả ngoài mới
                    </button>
                </div>`;

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



    document.getElementById('lecturerModalTitle').textContent = id ? `Chỉnh sửa ${config.title}` : `Thêm mới ${config.title}`;

    

    if (id) {

        let item = currentEntitiesData[type].find(x => x.id == id);

        if (item) {

            config.fields.forEach(f => {

                const input = document.getElementById(`field_${f.name}`);

                if (input && item[f.name] !== undefined) {

                    input.value = item[f.name] || '';

                }

            });

        }

    }



    // Gắn listener gợi ý cộng sự khi tạo mới (không phải edit)

    if (!id) {

        // Tên field tiêu đề tùy theo loại

        const titleFieldName = type === 'cong-trinh' ? 'ten_cong_trinh' : 'ten_de_tai';

        const titleInput = document.getElementById(`field_${titleFieldName}`);

        

        // Thêm panel gợi ý bên cạnh field thanh_vien_ids

        const memberFieldGroup = document.querySelector('#field_thanh_vien_ids')?.parentElement;

        if (memberFieldGroup) {

            // Thay vì để 150px, cho nó cao lên

            document.getElementById('field_thanh_vien_ids').style.maxHeight = '350px';

            document.getElementById('field_thanh_vien_ids').style.height = '100%';

            

            // Tạo một container bọc cả hai

            const wrapper = document.createElement('div');

            wrapper.style.display = 'grid';

            wrapper.style.gridTemplateColumns = '1fr 1fr';

            wrapper.style.gap = '20px';

            wrapper.style.alignItems = 'start';

            wrapper.style.marginTop = '15px';

            wrapper.style.paddingTop = '15px';

            wrapper.style.borderTop = '1px dashed var(--border-color)';

            

            // Lấy memberFieldGroup ra khỏi form và cho vào cột trái

            memberFieldGroup.parentElement.insertBefore(wrapper, memberFieldGroup);

            wrapper.appendChild(memberFieldGroup);

            memberFieldGroup.style.margin = '0'; // Xóa margin gốc

            

            // Tạo cột phải cho gợi ý

            const panelCol = document.createElement('div');

            panelCol.id = 'collab-suggest-panel';

            wrapper.appendChild(panelCol);



            // Bắt sự kiện gõ title

            if (titleInput) {

                titleInput.addEventListener('input', () => {

                    clearTimeout(suggestDebounceTimer);

                    const keywords = titleInput.value.trim();

                    if (keywords.length < 3) {

                        panelCol.innerHTML = '';

                        return;

                    }

                    panelCol.innerHTML = `<div class="collab-suggest-loading"><i class="fas fa-circle-notch fa-spin"></i> Đang tìm cộng sự phù hợp...</div>`;

                    suggestDebounceTimer = setTimeout(() => fetchSuggestions(keywords), 650);

                });



                if (titleInput.value.trim().length >= 3) {

                    fetchSuggestions(titleInput.value.trim());

                } else {

                    fetchSuggestions('');

                }

            }

        }

    }



    document.getElementById('lecturerModalOverlay').classList.add('active');

}



function closeLecturerModal() {

    document.getElementById('lecturerModalOverlay').classList.remove('active');

    document.getElementById('lecturerForm').reset();

}



async function handleFormSubmit(e) {

    e.preventDefault();

    

    const type = document.getElementById('formEntityType').value;

    const id = document.getElementById('formEntityId').value;

    const config = ENTITY_CONFIG[type];

    

    const formData = {

        giang_vien_id: userInfo.id // Luôn gửi kèm ID của GV hiện tại

    };

    

    config.fields.forEach(f => {

        if (f.type === 'lecturers-select') {

            const checkboxes = document.querySelectorAll(`input[name="${f.name}"]:checked`);

            // Map field name to backend key
            const backendKey = f.name === 'thanh_vien_ids' ? 'thanh_vien_ids' : f.name;

            formData[backendKey] = Array.from(checkboxes).map(cb => cb.value);

        } else if (f.type === 'external-authors-select') {

            const checkboxes = document.querySelectorAll(`input[name="${f.name}"]:checked`);

            const backendKey = f.name === 'tac_gia_ngoai_ids' ? 'tac_gia_ngoai_ids' : f.name;

            formData[backendKey] = Array.from(checkboxes).map(cb => cb.value);

        } else {

            const el = document.getElementById(`field_${f.name}`);

            if (!el) return;

            const val = el.value;

            if (f.type === 'number') {

                formData[f.name] = val ? parseInt(val, 10) : null;

            } else {

                formData[f.name] = val;

            }

        }

    });



    try {

        const method = id ? 'PUT' : 'POST';

        const url = id ? `${API_LECTURER_BASE}/${type}/${id}` : `${API_LECTURER_BASE}/${type}`;



        const res = await fetch(url, {

            method: method,

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify(formData)

        });

        

        const data = await res.json();

        if (data.status === 'ok') {

            closeLecturerModal();

            if (data.resubmitted) {

                alert('Đã nộp lại thành công! Công trình/Đề tài sẽ chuyển về trạng thái "Chờ duyệt" để Admin xem xét.');

            }

            if (type === 'cong-trinh') loadPublications();

            else if (type === 'de-tai') loadProjects();

        } else {

            alert('Lỗi: ' + data.message);

        }

    } catch (err) {

        console.error(err);

        alert('Có lỗi xảy ra.');

    }

}



// Hàm Gửi yêu cầu xóa tới Admin

async function requestDeleteLecturerEntity(type, id) {

    if (!confirm('Bạn có chắc muốn xóa mục này? Yêu cầu sẽ được gửi tới Admin phê duyệt.')) return;



    try {

        const res = await fetch(`${API_LECTURER_BASE}/${type}/${id}?gv_id=${userInfo.id}`, {

            method: 'DELETE'

        });

        const data = await res.json();

        if (data.status === 'ok') {

            alert('Đã gửi yêu cầu xóa tới Admin. Vui lòng chờ phê duyệt.');

            if (type === 'cong-trinh') loadPublications();

            else if (type === 'de-tai') loadProjects();

        } else {

            alert('Lỗi: ' + data.message);

        }

    } catch (err) {

        console.error(err);

        alert('Có lỗi xảy ra.');

    }

}



async function directDeleteRejected(type, id) {

    if (!confirm('Mục này đang bị Từ chối. Bạn có chắc muốn xóa mục này không? (Công trình/Đề tài sẽ được chuyển vào thùng rác của bạn mà không cần Admin duyệt)')) return;



    try {

        const res = await fetch(`${API_LECTURER_BASE}/${type}/${id}?gv_id=${userInfo.id}`, {

            method: 'DELETE'

        });



        const data = await res.json();



        if (data.status === 'ok') {

            alert('Đã xóa thành công! Công trình/Đề tài đã được đưa vào thùng rác của bạn.');

            if (type === 'cong-trinh') loadPublications();

            else if (type === 'de-tai') loadProjects();

        } else {

            alert('Lỗi: ' + data.message);

        }

    } catch (err) {

        console.error(err);

        alert('Có lỗi xảy ra.');

    }

}
