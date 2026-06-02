/* ============================================================

   LECTURER EXTERNAL AUTHOR & PDF UPLOAD

   ============================================================ */



async function uploadPdfForLink(input, targetId) {
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (file.type !== "application/pdf") {
        alert("Vui lòng chọn file PDF.");
        return;
    }
    
    const formData = new FormData();
    formData.append("file", file);
    
    const statusDiv = document.getElementById("upload_status_" + targetId.replace("field_", ""));
    if (statusDiv) statusDiv.innerHTML = "<i class=\"fas fa-spinner fa-spin\"></i> Đang tải lên...";
    
    try {
        const res = await fetch("/api/upload/pdf", {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        
        if (data.status === "success") {
            const field = document.getElementById(targetId);
            if (field) {
                // Determine origin dynamically and prepend it if missing
                const origin = window.location.origin;
                field.value = data.url.startsWith("http") ? data.url : origin + data.url;
            }
            if (statusDiv) statusDiv.innerHTML = "<span style=\"color: #10b981;\"><i class=\"fas fa-check\"></i> Tải lên thành công!</span>";
        } else {
            alert("Lỗi: " + data.message);
            if (statusDiv) statusDiv.innerHTML = "<span style=\"color: #ef4444;\"><i class=\"fas fa-times\"></i> Lỗi tải lên.</span>";
        }
    } catch (err) {
        console.error("Lỗi upload PDF:", err);
        alert("Có lỗi xảy ra khi upload file.");
        if (statusDiv) statusDiv.innerHTML = "<span style=\"color: #ef4444;\"><i class=\"fas fa-times\"></i> Lỗi mạng.</span>";
    }
}



window.openAddExternalAuthorModal = function(fieldName) {
    let modal = document.getElementById('addExternalAuthorModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'addExternalAuthorModal';
        modal.className = 'modal-overlay';
        modal.style.zIndex = '1000';
        modal.innerHTML = `
            <div class="modal" style="max-width: 450px; margin-top: 10%;">
                <div class="modal-header">
                    <h2><i class="fas fa-user-plus"></i> Thêm tác giả ngoài mới</h2>
                    <button type="button" class="btn btn-sm" style="background:none;border:none;font-size:20px;" onclick="closeAddExternalAuthorModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addExternalAuthorForm" style="display:flex; flex-direction:column; gap: 12px;">
                        <input type="hidden" id="tgnFieldName" value="${fieldName}">
                        <div class="form-group" style="display:flex; flex-direction:column; gap:4px;">
                            <label for="tgnName" style="font-weight:600; font-size:13px;">Họ và tên <span style="color:red;">*</span></label>
                            <input type="text" id="tgnName" required style="width:100%; padding:8px; border: 1px solid var(--border-color); border-radius: 4px;">
                        </div>
                        <div class="form-group" style="display:flex; flex-direction:column; gap:4px;">
                            <label for="tgnOrg" style="font-weight:600; font-size:13px;">Đơn vị công tác</label>
                            <input type="text" id="tgnOrg" style="width:100%; padding:8px; border: 1px solid var(--border-color); border-radius: 4px;">
                        </div>
                        <div class="form-group" style="display:flex; flex-direction:column; gap:4px;">
                            <label for="tgnDegree" style="font-weight:600; font-size:13px;">Học vị / Chức danh</label>
                            <input type="text" id="tgnDegree" style="width:100%; padding:8px; border: 1px solid var(--border-color); border-radius: 4px;" placeholder="Ví dụ: Thạc sĩ, Tiến sĩ...">
                        </div>
                        <div class="form-group" style="display:flex; flex-direction:column; gap:4px;">
                            <label for="tgnEmail" style="font-weight:600; font-size:13px;">Email</label>
                            <input type="email" id="tgnEmail" style="width:100%; padding:8px; border: 1px solid var(--border-color); border-radius: 4px;">
                        </div>
                        <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px;">
                            <button type="button" class="btn" style="background:var(--bg-hover); border:1px solid var(--border-color);" onclick="closeAddExternalAuthorModal()">Hủy</button>
                            <button type="submit" class="btn btn-primary">Lưu (Chờ duyệt)</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('addExternalAuthorForm').addEventListener('submit', handleAddExternalAuthorSubmit);
    } else {
        document.getElementById('tgnFieldName').value = fieldName;
        document.getElementById('addExternalAuthorForm').reset();
    }
    modal.classList.add('active');
};

window.closeAddExternalAuthorModal = function() {
    const modal = document.getElementById('addExternalAuthorModal');
    if (modal) modal.classList.remove('active');
};

async function handleAddExternalAuthorSubmit(e) {
    e.preventDefault();
    const fieldName = document.getElementById('tgnFieldName').value;
    const name = document.getElementById('tgnName').value.trim();
    const org = document.getElementById('tgnOrg').value.trim();
    const degree = document.getElementById('tgnDegree').value.trim();
    const email = document.getElementById('tgnEmail').value.trim();
    
    try {
        const res = await fetch('/api/lecturer/tac-gia-ngoai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ho_va_ten: name,
                don_vi_cong_tac: org,
                hoc_vi: degree,
                email: email,
                gv_id: userInfo.id
            })
        });
        const data = await res.json();
        if (data.status === 'ok') {
            closeAddExternalAuthorModal();
            
            // Tải lại danh sách tác giả ngoài
            await loadAllExternalAuthors();
            
            // Vẽ lại danh sách checkbox và tự động check tác giả mới cùng các tác giả đã chọn trước đó
            const container = document.getElementById(`field_${fieldName}`);
            if (container) {
                const checkedIds = Array.from(container.querySelectorAll('input.tgn-checkbox:checked')).map(cb => cb.value);
                const optionsHtml = allExternalAuthors
                    .map(tgn => {
                        const statusTag = tgn.trang_thai === 'Chờ duyệt' ? ' <span style="color:#f39c12;font-size:10px;font-weight:600;">(Chờ duyệt)</span>' : '';
                        const isChecked = (checkedIds.includes(tgn.id.toString()) || tgn.id == data.id) ? 'checked' : '';
                        return `<div style="padding: 5px; border-bottom: 1px solid var(--border-color);"><label style="display:flex; align-items:center; gap: 8px; cursor: pointer; font-weight: normal; margin: 0;"><input type="checkbox" class="tgn-checkbox" name="${fieldName}" value="${tgn.id}" ${isChecked}> ${tgn.ho_va_ten} ${tgn.don_vi_cong_tac ? '('+tgn.don_vi_cong_tac+')' : ''}${statusTag}</label></div>`;
                    })
                    .join('');
                container.innerHTML = optionsHtml;
            }
        } else {
            alert('Lỗi: ' + data.message);
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi kết nối');
    }
}



// Dynamic Scroll to Top Button for Lecturer Panel
document.addEventListener("DOMContentLoaded", function() {
    const scrollToTopBtn = document.createElement('button');
    scrollToTopBtn.id = 'scrollToTopBtn';
    scrollToTopBtn.className = 'scroll-to-top-btn';
    scrollToTopBtn.title = 'Lên đầu trang';
    scrollToTopBtn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    document.body.appendChild(scrollToTopBtn);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});
