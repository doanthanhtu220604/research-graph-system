/* ============================================================
   PUBLICATIONS - Publications list page + detail modal
   ============================================================ */

let _allPublications = [];

async function loadPublications() {
    try {
        const res = await fetch(`${API_BASE}/cong-trinh`);
        const data = await res.json();
        if (data.status === 'ok') {
            _allPublications = data.data;
            // Dynamically fill year filter
            const years = [...new Set(data.data.map(ct => Number(ct.nam_xuat_ban)).filter(y => !isNaN(y) && y > 0))].sort((a, b) => b - a);
            const ysel = document.getElementById('pubYearFilter');
            if (ysel) {
                const existing = new Set([...ysel.options].map(o => o.value));
                years.forEach(y => {
                    if (!existing.has(String(y))) {
                        const o = document.createElement('option');
                        o.value = y;
                        o.textContent = y;
                        ysel.appendChild(o);
                    }
                });
            }
            renderPublicationRows(_allPublications);
        }
    } catch (err) {
        console.error('Publications error:', err);
    }
}

function renderPublicationRows(list) {
    const container = document.getElementById('publicationsList');
    const countEl = document.getElementById('pubCount');
    if (!container) return;
    if (countEl) countEl.textContent = `${list.length} công trình`;
    if (list.length === 0) {
        container.innerHTML = '<div class="list-empty"><i class="fas fa-file-times"></i>Không tìm thấy công trình phù hợp</div>';
        return;
    }
    container.innerHTML = list.map(ct => {
        const title = String(ct.ten_cong_trinh || 'N/A').replace(/</g, '&lt;');
        const authors = (ct.tac_gia || []).map(tg => typeof tg === 'object' ? tg.ten : tg).join(', ');
        return `
            <div class="data-row" onclick="showPublicationDetail('${ct.id}')">
                <div class="data-row-icon row-icon-green"><i class="fas fa-file-alt"></i></div>
                <div class="data-row-body">
                    <div class="data-row-title" title="${title}">${title}</div>
                    <div class="data-row-meta">
                        ${ct.nam_xuat_ban ? `<span class="badge badge-gray"><i class="fas fa-calendar-alt"></i> ${ct.nam_xuat_ban}</span>` : ''}
                        ${authors ? `<span class="data-row-sub"><i class="fas fa-user"></i> ${authors}</span>` : ''}
                    </div>
                </div>
                <div class="data-row-actions">
                    <button class="btn-icon btn-icon-view" title="Xem chi tiết" onclick="event.stopPropagation(); showPublicationDetail('${ct.id}')"><i class="fas fa-eye"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

function filterUserPublications() {
    const q = (document.getElementById('pubSearchInput')?.value || '').normalize('NFC').toLowerCase().trim();
    const year = document.getElementById('pubYearFilter')?.value || '';

    const filtered = _allPublications.filter(ct => {
        const title = (ct.ten_cong_trinh || '').normalize('NFC').toLowerCase();
        const pubYear = (ct.nam_xuat_ban || '').toString().toLowerCase();
        const authors = (ct.tac_gia || []).map(a => typeof a === 'object' ? a.ten : a).join(' ').normalize('NFC').toLowerCase();
        const extAuthors = (ct.tac_gia_ngoai || []).map(a => typeof a === 'object' ? a.ten : a).join(' ').normalize('NFC').toLowerCase();

        const matchQ = !q || title.includes(q) || pubYear.includes(q) || authors.includes(q) || extAuthors.includes(q);
        const matchYear = !year || (String(ct.nam_xuat_ban) === year);
        return matchQ && matchYear;
    });
    renderPublicationRows(filtered);
}

async function showPublicationDetail(ctId) {
    try {
        const resDetail = await fetch(`${API_BASE}/cong-trinh/${ctId}`);
        const dataDetail = await resDetail.json();
        const resGraph = await fetch(`${API_BASE}/graph/node/${ctId}`);
        const dataGraph = await resGraph.json();

        if (dataDetail.status === 'ok' && dataGraph.status === 'ok') {
            const ct = dataDetail.data;
            document.getElementById('detailTitle').textContent = ct.ten_cong_trinh || 'Công trình nghiên cứu';
            document.getElementById('detailSubtitle').textContent = 'Công trình';

            const iconEl = document.getElementById('detailIcon');
            iconEl.innerHTML = '<i class="fas fa-file-alt" style="color: #10b981;"></i>';
            iconEl.style.background = 'rgba(16, 185, 129, 0.1)';

            let fieldsHtml = `
                <div><span style="color:var(--text-muted);font-size:12px;">Năm xuất bản</span><br><b>${ct.nam_xuat_ban || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Nơi xuất bản</span><br><b>${ct.noi_xuat_ban || 'N/A'}</b></div>
            `;
            if (ct.link) {
                fieldsHtml += `<div><span style="color:var(--text-muted);font-size:12px;">Liên kết</span><br><a href="${ct.link}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="display:inline-block; margin-top:5px; background:var(--accent-blue); color:white; padding:5px 10px; border-radius:4px; text-decoration:none;"><i class="fas fa-external-link-alt"></i> Xem bài viết</a></div>`;
            }
            document.getElementById('detailFieldsGrid').innerHTML = fieldsHtml;

            let bodyHtml = '';
            if (ct.tom_tat) {
                bodyHtml += `
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h3 style="font-size: 15px; margin: 0; color: var(--accent-green);"><i class="fas fa-align-left"></i> Tóm tắt nội dung</h3>
                            <button class="btn-translate" onclick="toggleTranslation(this, 'summaryContent')">
                                <i class="fas fa-language"></i> Dịch tóm tắt
                            </button>
                        </div>
                        <div id="summaryContent" style="padding: 15px; background: rgba(0,0,0,0.02); border-radius: 8px; line-height: 1.6; color: var(--text-primary); text-align: justify; white-space: pre-line;" data-original="${ct.tom_tat.replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/"/g, '&quot;')}">
                            ${ct.tom_tat}
                        </div>
                    </div>
                `;
            }

            if (ct.tac_gia && ct.tac_gia.length > 0) {
                bodyHtml += `
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: var(--accent-blue);"><i class="fas fa-users"></i> Nhóm tác giả (trong khoa)</h3>
                        <div style="display:flex; flex-wrap:wrap; gap:10px;">
                            ${ct.tac_gia.map(tg => {
                                let roleText = '';
                                let roleColor = 'rgba(79, 142, 247, 0.1)';
                                let textColor = 'var(--accent-blue)';
                                if (tg.vai_tro === 'TAC_GIA_CHINH') {
                                    roleText = ' <small style="opacity:0.8;">(Tác giả chính)</small>';
                                    roleColor = 'rgba(79, 142, 247, 0.15)';
                                } else if (tg.vai_tro === 'CONG_SU' || tg.vai_tro === 'LA_TAC_GIA_CUA') {
                                    roleText = ' <small style="opacity:0.8;">(Đồng tác giả)</small>';
                                    roleColor = 'rgba(16, 185, 129, 0.1)';
                                    textColor = '#10b981';
                                }
                                return `<span style="padding:6px 14px; background:${roleColor}; color:${textColor}; border-radius:20px; font-size:13px; font-weight:500; display:flex; align-items:center; gap:5px;"><i class="fas fa-user-tie" style="font-size:11px;"></i>${tg.ten}${roleText}</span>`;
                            }).join('')}
                        </div>
                    </div>
                `;
            }

            if (ct.tac_gia_ngoai && ct.tac_gia_ngoai.length > 0) {
                bodyHtml += `
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: #8b5cf6;"><i class="fas fa-user-plus"></i> Tác giả ngoài khoa (${ct.tac_gia_ngoai.length})</h3>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${ct.tac_gia_ngoai.map(tg => {
                                let roleText = '';
                                if (tg.vai_tro === 'TAC_GIA_CHINH') {
                                    roleText = ' <span style="color:#e67e22; font-size:11px; font-weight:600;">(Tác giả chính)</span>';
                                } else if (tg.vai_tro === 'CONG_SU' || tg.vai_tro === 'LA_TAC_GIA_CUA' || tg.vai_tro === 'DONG_TAC_GIA') {
                                    roleText = ' <span style="color:#8b5cf6; font-size:11px; font-weight:600;">(Đồng tác giả)</span>';
                                }
                                return `
                                    <div style="display:flex; align-items:center; gap:10px; padding:8px 12px; background:rgba(139,92,246,0.07); border-radius:10px; border-left:3px solid #8b5cf6;">
                                        <div style="width:32px; height:32px; border-radius:50%; background:rgba(139,92,246,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                            <i class="fas fa-user" style="color:#8b5cf6; font-size:13px;"></i>
                                        </div>
                                        <div>
                                            <div style="font-weight:600; font-size:13px; color:var(--text-primary);">${tg.ten || 'N/A'}${roleText}</div>
                                            ${tg.don_vi ? `<div style="font-size:11px; color:var(--text-muted); margin-top:2px;"><i class="fas fa-building" style="margin-right:3px;"></i>${tg.don_vi}</div>` : ''}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                `;
            }

            document.getElementById('detailBodyContent').innerHTML = bodyHtml;
            document.getElementById('globalDetailOverlay').classList.add('active');

            setTimeout(() => {
                renderGraph('detail-graph-container', dataGraph.nodes, dataGraph.edges, (network) => {
                    window.detailGraph = network;
                });
                if (dataGraph.legend) renderLegend(dataGraph.legend, 'detailGraphLegend');
            }, 50);
        }
    } catch (err) { console.error(err); }
}
