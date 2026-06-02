/* ============================================================

   LECTURER COLLABORATORS - Suggestion Panel

   ============================================================ */



// Collaborator suggestion state

let suggestDebounceTimer = null;

let suggestedSelected = {}; // { gv_id: true } - người đã được thêm qua gợi ý



/* ============================================================

   CSS STYLES FOR COLLABORATOR SUGGESTIONS (injected once)

   ============================================================ */

(function injectSuggestionStyles() {

    if (document.getElementById('collab-suggest-style')) return;

    const style = document.createElement('style');

    style.id = 'collab-suggest-style';

    style.textContent = `

        /* --- Suggestion Panel --- */

        .collab-suggest-panel {

            border: 1.5px dashed var(--border-glow, rgba(59,130,246,0.35));

            border-radius: 12px;

            background: linear-gradient(135deg, rgba(59,130,246,0.04) 0%, rgba(139,92,246,0.04) 100%);

            overflow: hidden;

            animation: fadeInSuggest 0.3s ease;

            height: 100%;

        }

        @keyframes fadeInSuggest {

            from { opacity: 0; transform: translateY(6px); }

            to   { opacity: 1; transform: translateY(0); }

        }

        .collab-suggest-header {

            display: flex;

            align-items: center;

            gap: 8px;

            padding: 10px 14px 8px;

            font-size: 12px;

            font-weight: 700;

            color: var(--accent-blue, #3b82f6);

            text-transform: uppercase;

            letter-spacing: 0.5px;

            border-bottom: 1px solid rgba(59,130,246,0.12);

        }

        .collab-suggest-header i { font-size: 13px; }

        .collab-suggest-grid {

            display: grid;

            grid-template-columns: 1fr;

            gap: 8px;

            padding: 10px 12px 12px;

            max-height: 350px;

            overflow-y: auto;

        }

        .collab-card {

            background: white;

            border: 1px solid var(--border-color, rgba(0,0,0,0.08));

            border-radius: 10px;

            padding: 10px 12px;

            display: flex;

            align-items: center;

            gap: 10px;

            transition: all 0.2s ease;

            cursor: default;

            position: relative;

        }

        .collab-card:hover {

            border-color: rgba(59,130,246,0.4);

            box-shadow: 0 3px 12px rgba(59,130,246,0.12);

            transform: translateY(-1px);

        }

        .collab-card.collab-added {

            border-color: rgba(16,185,129,0.5);

            background: rgba(16,185,129,0.04);

        }

        .collab-avatar {

            width: 36px; height: 36px;

            border-radius: 50%;

            object-fit: cover;

            flex-shrink: 0;

            border: 2px solid rgba(59,130,246,0.2);

        }

        .collab-info { flex: 1; min-width: 0; }

        .collab-name {

            font-size: 13px; font-weight: 600;

            color: var(--text-primary, #1e293b);

            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;

        }

        .collab-meta {

            font-size: 11px; color: var(--text-muted, #94a3b8);

            white-space: nowrap; overflow: hidden; text-overflow: ellipsis;

        }

        .collab-tags {

            display: flex; flex-wrap: wrap; gap: 3px; margin-top: 4px;

        }

        .collab-tag {

            padding: 1px 6px;

            border-radius: 8px;

            font-size: 10px; font-weight: 500;

            background: rgba(59,130,246,0.1);

            color: #3b82f6;

        }

        .collab-add-btn {

            width: 28px; height: 28px;

            border-radius: 50%;

            border: none;

            background: var(--gradient-primary, linear-gradient(135deg,#3b82f6,#8b5cf6));

            color: white;

            font-size: 14px;

            cursor: pointer;

            display: flex; align-items: center; justify-content: center;

            flex-shrink: 0;

            transition: all 0.2s;

        }

        .collab-add-btn:hover { transform: scale(1.15); }

        .collab-add-btn.added {

            background: linear-gradient(135deg,#10b981,#14b8a6);

            cursor: default;

        }

        .collab-suggest-loading {

            text-align: center; padding: 14px;

            color: var(--text-muted, #94a3b8);

            font-size: 13px;

        }

        .collab-suggest-empty {

            text-align: center; padding: 12px;

            color: var(--text-muted, #94a3b8);

            font-size: 12px; font-style: italic;

        }

    `;

    document.head.appendChild(style);

})();



async function fetchSuggestions(keywords) {

    const panel = document.getElementById('collab-suggest-panel');

    if (!panel) return;



    try {

        const params = new URLSearchParams({ gv_id: userInfo.id, keywords });

        const res = await fetch(`${API_LECTURER_BASE}/suggest-collaborators?${params}`);

        const data = await res.json();



        if (data.status === 'ok') {

            renderSuggestions(data.data, data.my_linh_vuc || [], data.my_bo_mon);

        } else {

            panel.innerHTML = '';

        }

    } catch (e) {

        panel.innerHTML = '';

        console.error('Suggest error:', e);

    }

}



function renderSuggestions(suggestions, myLinhVuc, myBoMon) {

    const panel = document.getElementById('collab-suggest-panel');

    if (!panel) return;



    if (!suggestions || suggestions.length === 0) {

        panel.innerHTML = `

            <div class="collab-suggest-panel">

                <div class="collab-suggest-header"><i class="fas fa-lightbulb"></i> Gợi ý cộng sự tiềm năng</div>

                <div class="collab-suggest-empty">Không tìm thấy cộng sự phù hợp. Thêm thủ công bên trên.</div>

            </div>`;

        return;

    }



    const cards = suggestions.map(s => {

        const isAdded = !!suggestedSelected[s.id];

        const avatar = s.anh_dai_dien

            ? `<img src="${s.anh_dai_dien}" class="collab-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(s.ho_va_ten)}&background=3b82f6&color=fff'">`

            : `<img src="https://ui-avatars.com/api/?name=${encodeURIComponent(s.ho_va_ten)}&background=3b82f6&color=fff" class="collab-avatar">`;



        // Tags: lĩnh vực chung

        let tags = (s.ly_do.linh_vuc_chung || []).slice(0, 2)

            .map(lv => `<span class="collab-tag">${lv}</span>`).join('');

        if (s.ly_do.cung_bo_mon) {

            tags += `<span class="collab-tag" style="background: rgba(16, 185, 129, 0.1); color: #10b981;"><i class="fas fa-users" style="margin-right:2px;"></i> Cùng bộ môn</span>`;

        }



        const meta = [

            s.hoc_vi || '',

            s.bo_mon || ''

        ].filter(Boolean).join(' · ');



        const btnIcon = isAdded ? 'fa-check' : 'fa-plus';

        const btnClass = isAdded ? 'added' : '';

        const btnTitle = isAdded ? 'Hủy thêm' : 'Thêm vào danh sách';



        return `

        <div class="collab-card ${isAdded ? 'collab-added' : ''}" id="collab-card-${s.id}">

            ${avatar}

            <div class="collab-info">

                <div class="collab-name" title="${s.ho_va_ten}">${s.ho_va_ten}</div>

                <div class="collab-meta">${meta || `${s.so_cong_trinh} CT · ${s.so_de_tai} ĐT`}</div>

                ${tags ? `<div class="collab-tags">${tags}</div>` : ''}

            </div>

            <button type="button" class="collab-add-btn ${btnClass}" title="${btnTitle}"

                onclick="toggleSuggestedCollaborator('${s.id}')">

                <i class="fas ${btnIcon}"></i>

            </button>

        </div>`;

    }).join('');



    const criteria = [];
    if (myLinhVuc && myLinhVuc.length > 0) {
        criteria.push('Lĩnh vực');
    }
    if (myBoMon) {
        criteria.push('Bộ môn');
    }
    const titleInput = document.getElementById('publicationTitle') || document.getElementById('projectTitle');
    if (titleInput && titleInput.value.trim().length >= 3) {
        criteria.push('Từ khóa');
    }
    const criteriaText = criteria.length > 0 ? 'Dựa trên ' + criteria.join(' & ') : 'Dựa trên từ khóa đề tài';

    panel.innerHTML = `

        <div class="collab-suggest-panel">

            <div class="collab-suggest-header">

                <i class="fas fa-user-friends"></i>

                Gợi ý cộng sự tiềm năng

                <span style="margin-left: auto; font-size: 10px; font-weight: 400; color: var(--text-muted); text-transform: none; letter-spacing: 0;">

                    ${criteriaText}

                </span>

            </div>

            <div class="collab-suggest-grid">${cards}</div>

        </div>`;

}



function toggleSuggestedCollaborator(gvId) {

    const isCurrentlyAdded = !!suggestedSelected[gvId];

    

    // Toggle trạng thái checkbox

    const checkbox = document.querySelector(`input.member-checkbox[value="${gvId}"]`);

    if (checkbox) {

        checkbox.checked = !isCurrentlyAdded;

        if (!isCurrentlyAdded) {

            checkbox.closest('div')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        }

    }



    // Toggle state

    suggestedSelected[gvId] = !isCurrentlyAdded;



    // Cập nhật UI thẻ

    const card = document.getElementById(`collab-card-${gvId}`);

    if (card) {

        const btn = card.querySelector('.collab-add-btn');

        if (!isCurrentlyAdded) {

            // Đang từ chưa thêm -> Đã thêm

            card.classList.add('collab-added');

            if (btn) {

                btn.classList.add('added');

                btn.innerHTML = '<i class="fas fa-check"></i>';

                btn.title = 'Hủy thêm';

            }

        } else {

            // Đang từ đã thêm -> Hủy thêm

            card.classList.remove('collab-added');

            if (btn) {

                btn.classList.remove('added');

                btn.innerHTML = '<i class="fas fa-plus"></i>';

                btn.title = 'Thêm vào danh sách';

            }

        }

    }

}
