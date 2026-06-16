/* ============================================================

   LECTURER STATUS - Modal đổi trạng thái

   ============================================================ */



function openStatusChangeModal(type, id) {

    const item = currentEntitiesData[type].find(x => x.id == id);

    if (!item) return;



    // Inject status change modal if not exists

    if (!document.getElementById('statusChangeModalOverlay')) {

        const modalHtml = `

            <div class="modal-overlay" id="statusChangeModalOverlay">

                <div class="modal" style="max-width: 400px; padding: 0; overflow: hidden; border-radius: 16px;">

                    <div class="modal-header" style="background: var(--gradient-primary); color: white; border-radius: 0; padding: 18px 24px;">

                        <h2 style="font-size: 18px; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 10px;">

                            <i class="fas fa-exchange-alt"></i> Đề xuất Đổi trạng thái

                        </h2>

                        <button class="btn btn-sm" style="background:rgba(255,255,255,0.2); border:none; color:white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; cursor: pointer;" onclick="closeStatusChangeModal()">&times;</button>

                    </div>

                    <div class="modal-body" style="padding: 24px;">

                        <div style="background: var(--bg-hover); padding: 15px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid var(--accent-blue);">

                            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Đối tượng đề xuất:</p>

                            <p style="font-size: 14px; color: var(--text-primary); font-weight: 700; line-height: 1.4; margin: 0;">${item.ten_cong_trinh || item.ten_cong_trinh_vi || item.ten_de_tai || 'Không rõ'}</p>

                        </div>

                        

                        <div class="form-group">

                            <label style="display: block; font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Trạng thái mới đề xuất:</label>

                            <select id="newStatusSelect" class="filter-select" style="width: 100%; padding: 12px; border-radius: 10px; background: white; border: 1.5px solid var(--border-color); font-size: 14px; outline: none; transition: all 0.2s;">

                                ${type === 'de-tai' ? `

                                    <option value="Đang thực hiện">Đang thực hiện</option>

                                    <option value="Hoàn thành">Hoàn thành</option>

                                    <option value="Hủy bỏ">Hủy bỏ</option>

                                ` : `

                                    <option value="Đang thực hiện">Đang thực hiện</option>

                                    <option value="Hoàn thành">Hoàn thành</option>

                                `}

                            </select>

                        </div>



                        <div style="margin-top: 28px; display: flex; gap: 12px;">

                            <button type="button" class="btn" style="flex: 1; padding: 12px; border-radius: 10px; font-weight: 600;" onclick="closeStatusChangeModal()">Hủy</button>

                            <button type="button" class="btn btn-primary" style="flex: 2; padding: 12px; border-radius: 10px; font-weight: 600; background: var(--gradient-primary); border: none;" onclick="submitStatusChangeRequest('${type}', '${id}')">Gửi yêu cầu</button>

                        </div>

                        <p style="font-size: 11px; color: var(--text-muted); text-align: center; margin-top: 15px; font-style: italic;">

                            <i class="fas fa-info-circle"></i> Yêu cầu sẽ được chuyển tới Admin phê duyệt.

                        </p>

                    </div>

                </div>

            </div>

        `;

        document.body.insertAdjacentHTML('beforeend', modalHtml);

    } else {

        const titleEl = document.querySelector('#statusChangeModalOverlay p[style*="font-weight: 700"]');

        if (titleEl) titleEl.textContent = item.ten_cong_trinh || item.ten_cong_trinh_vi || item.ten_de_tai || 'Không rõ';

        

        const select = document.getElementById('newStatusSelect');

        if (select) {

            select.innerHTML = type === 'de-tai' ? `

                <option value="Đang thực hiện">Đang thực hiện</option>

                <option value="Hoàn thành">Hoàn thành</option>

                <option value="Hủy bỏ">Hủy bỏ</option>

            ` : `

                <option value="Đang thực hiện">Đang thực hiện</option>

                <option value="Hoàn thành">Hoàn thành</option>

            `;

        }

    }



    document.getElementById('statusChangeModalOverlay').classList.add('active');

}



function closeStatusChangeModal() {

    const el = document.getElementById('statusChangeModalOverlay');

    if (el) el.classList.remove('active');

}



async function submitStatusChangeRequest(type, id) {

    const newStatus = document.getElementById('newStatusSelect').value;

    if (!newStatus) return;



    try {

        const res = await fetch(`${API_LECTURER_BASE}/${type}/${id}/request-status-change`, {

            method: 'PUT',

            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify({ 

                giang_vien_id: userInfo.id,

                new_status: newStatus 

            })

        });

        const data = await res.json();

        if (data.status === 'ok') {

            alert(data.message);

            closeStatusChangeModal();

            if (type === 'cong-trinh') loadPublications();

            else if (type === 'de-tai') loadProjects();

        } else {

            alert('Lỗi: ' + data.message);

        }

    } catch (err) {

        console.error(err);

        alert('Có lỗi xảy ra khi gửi yêu cầu.');

    }

}
