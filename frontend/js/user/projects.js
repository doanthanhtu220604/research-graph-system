/* ============================================================
   PROJECTS - Projects list page + detail modal
   ============================================================ */

let _allProjects = [];

function getLevelBadge(cap) {
    if (!cap) return '<span class="badge badge-gray">Chưa xác định</span>';
    if (cap.includes('Nhà nước')) return `<span class="badge badge-red">${cap}</span>`;
    if (cap.includes('Bộ')) return `<span class="badge badge-orange">${cap}</span>`;
    if (cap.includes('Tỉnh')) return `<span class="badge badge-purple">${cap}</span>`;
    if (cap.includes('Trường') || cap.includes('Cơ sở')) return `<span class="badge badge-blue">${cap}</span>`;
    if (cap.includes('Doanh')) return `<span class="badge badge-teal">${cap}</span>`;
    return `<span class="badge badge-gray">${cap}</span>`;
}

async function loadProjects() {
    try {
        const res = await fetch(`${API_BASE}/de-tai`);
        const data = await res.json();
        if (data.status === 'ok') {
            _allProjects = data.data;
            renderProjectRows(_allProjects);
        }
    } catch (err) {
        console.error('Projects error:', err);
    }
}

function renderProjectRows(list) {
    const container = document.getElementById('projectsList');
    const countEl = document.getElementById('projCount');
    if (!container) return;
    if (countEl) countEl.textContent = `${list.length} đề tài`;
    if (list.length === 0) {
        container.innerHTML = '<div class="list-empty"><i class="fas fa-flask"></i>Không tìm thấy đề tài phù hợp</div>';
        return;
    }
    container.innerHTML = list.map(dt => {
        const title = String(dt.ten_de_tai || 'N/A').replace(/</g, '&lt;');
        const years = (dt.nam_bat_dau || dt.nam_thuc_hien) ? `${dt.nam_bat_dau || dt.nam_thuc_hien} – ${dt.nam_ket_thuc || 'nay'}` : '';
        return `
            <div class="data-row" onclick="showProjectDetail('${dt.id}')">
                <div class="data-row-icon row-icon-orange"><i class="fas fa-flask"></i></div>
                <div class="data-row-body">
                    <div class="data-row-title" title="${title}">${title}</div>
                    <div class="data-row-meta">
                        ${getLevelBadge(dt.cap_de_tai)}
                        ${years ? `<span class="badge badge-gray"><i class="fas fa-clock"></i> ${years}</span>` : ''}
                    </div>
                </div>
                <div class="data-row-actions">
                    <button class="btn-icon btn-icon-view" title="Xem chi tiết" onclick="event.stopPropagation(); showProjectDetail('${dt.id}')"><i class="fas fa-eye"></i></button>
                </div>
            </div>
        `;
    }).join('');
}

function filterUserProjects() {
    const q = (document.getElementById('projSearchInput')?.value || '').normalize('NFC').toLowerCase().trim();
    const level = document.getElementById('projLevelFilter')?.value || '';

    const filtered = _allProjects.filter(dt => {
        const title = (dt.ten_de_tai || '').normalize('NFC').toLowerCase();
        const startYear = (dt.nam_bat_dau || '').toString().toLowerCase();
        const endYear = (dt.nam_ket_thuc || '').toString().toLowerCase();
        const levelText = (dt.cap_de_tai || '').normalize('NFC').toLowerCase();
        const members = (dt.thanh_vien || []).map(m => typeof m === 'object' ? m.ten : m).join(' ').normalize('NFC').toLowerCase();

        const matchQ = !q || title.includes(q) || startYear.includes(q) || endYear.includes(q) || levelText.includes(q) || members.includes(q);
        const matchLevel = !level || (dt.cap_de_tai === level);
        return matchQ && matchLevel;
    });
    renderProjectRows(filtered);
}

async function showProjectDetail(dtId) {
    try {
        const resDetail = await fetch(`${API_BASE}/de-tai/${dtId}`);
        const dataDetail = await resDetail.json();
        const resGraph = await fetch(`${API_BASE}/graph/node/${dtId}`);
        const dataGraph = await resGraph.json();

        if (dataDetail.status === 'ok' && dataGraph.status === 'ok') {
            const dt = dataDetail.data;
            document.getElementById('detailTitle').textContent = dt.ten_de_tai || 'Đề tài nghiên cứu';
            document.getElementById('detailSubtitle').textContent = dt.cap_de_tai ? `Cấp ${dt.cap_de_tai}` : 'Đề tài';

            const iconEl = document.getElementById('detailIcon');
            iconEl.innerHTML = '<i class="fas fa-flask" style="color: #f59e0b;"></i>';
            iconEl.style.background = 'rgba(245, 158, 11, 0.1)';

            let fieldsHtml = `
                <div><span style="color:var(--text-muted);font-size:12px;">Cấp đề tài</span><br><b>${dt.cap_de_tai || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Thời gian thực hiện</span><br><b>${dt.nam_bat_dau || '?'} - ${dt.nam_ket_thuc || '?'}</b></div>
            `;
            if (dt.link) {
                fieldsHtml += `<div><span style="color:var(--text-muted);font-size:12px;">Liên kết</span><br><a href="${dt.link}" target="_blank" rel="noopener noreferrer" class="btn btn-sm" style="display:inline-block; margin-top:5px; background:var(--accent-orange); color:white; padding:5px 10px; border-radius:4px; text-decoration:none;"><i class="fas fa-external-link-alt"></i> Xem chi tiết</a></div>`;
            }
            document.getElementById('detailFieldsGrid').innerHTML = fieldsHtml;

            let bodyHtml = '';
            if (dt.tom_tat) {
                bodyHtml += `
                    <div style="margin-bottom: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <h3 style="font-size: 15px; margin: 0; color: var(--accent-orange);"><i class="fas fa-align-left"></i> Tóm tắt nội dung</h3>
                            <button class="btn-translate" onclick="toggleTranslation(this, 'summaryContentProj')">
                                <i class="fas fa-language"></i> Dịch tóm tắt
                            </button>
                        </div>
                        <div id="summaryContentProj" style="padding: 15px; background: rgba(0,0,0,0.02); border-radius: 8px; line-height: 1.6; color: var(--text-primary); text-align: justify; white-space: pre-line;" data-original="${dt.tom_tat.replace(/`/g, '\\`').replace(/\$/g, '\\$').replace(/"/g, '&quot;')}">
                            ${dt.tom_tat}
                        </div>
                    </div>
                `;
            }

            if (dt.thanh_vien && dt.thanh_vien.length > 0) {
                bodyHtml += `
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: var(--accent-blue);"><i class="fas fa-users"></i> Thành viên tham gia (trong khoa)</h3>
                        ${dt.thanh_vien.map(tv => `
                            <div style="padding: 10px; background: rgba(0,0,0,0.02); margin-bottom: 8px; border-radius: 6px; border-left: 3px solid ${tv.vai_tro === 'CHU_NHIEM' ? 'var(--accent-orange)' : 'var(--border-color)'}; display:flex; align-items:center; gap:10px;">
                                <div style="width:32px; height:32px; border-radius:50%; background:${tv.vai_tro === 'CHU_NHIEM' ? 'rgba(245,158,11,0.15)' : 'rgba(0,0,0,0.05)'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                    <i class="fas fa-user-tie" style="color:${tv.vai_tro === 'CHU_NHIEM' ? 'var(--accent-orange)' : 'var(--text-muted)'}; font-size:13px;"></i>
                                </div>
                                <div>
                                    <strong>${tv.ten}</strong>
                                    <div style="color: var(--text-muted); font-size: 12px; margin-top: 2px;">${tv.vai_tro === 'CHU_NHIEM' ? '<span style="color:var(--accent-orange); font-weight:600;">Chủ nhiệm đề tài</span>' : 'Thành viên'}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            if (dt.tac_gia_ngoai && dt.tac_gia_ngoai.length > 0) {
                bodyHtml += `
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: #8b5cf6;"><i class="fas fa-user-plus"></i> Tác giả ngoài khoa (${dt.tac_gia_ngoai.length})</h3>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${dt.tac_gia_ngoai.map(tg => `
                                <div style="display:flex; align-items:center; gap:10px; padding:8px 12px; background:rgba(139,92,246,0.07); border-radius:10px; border-left:3px solid #8b5cf6;">
                                    <div style="width:32px; height:32px; border-radius:50%; background:rgba(139,92,246,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                                        <i class="fas fa-user" style="color:#8b5cf6; font-size:13px;"></i>
                                    </div>
                                    <div>
                                        <div style="font-weight:600; font-size:13px; color:var(--text-primary);">${tg.ten || 'N/A'}</div>
                                        ${tg.don_vi ? `<div style="font-size:11px; color:var(--text-muted); margin-top:2px;"><i class="fas fa-building" style="margin-right:3px;"></i>${tg.don_vi}</div>` : ''}
                                    </div>
                                </div>
                            `).join('')}
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

async function showGenericEntityDetail(nodeId, label, name) {
    try {
        const resGraph = await fetch(`${API_BASE}/graph/node/${nodeId}`);
        const dataGraph = await resGraph.json();

        if (dataGraph.status === 'ok') {
            const labelNames = {
                'GiangVien': 'Giảng viên', 'CongTrinhNghienCuu': 'Công trình nghiên cứu',
                'DeTaiNghienCuu': 'Đề tài nghiên cứu', 'BoMon': 'Bộ môn', 'Khoa': 'Khoa',
                'TacGiaNgoai': 'Tác giả ngoài', 'LinhVucNghienCuu': 'Lĩnh vực nghiên cứu',
                'NhomNghienCuu': 'Nhóm nghiên cứu',
            };
            const labelIcons = {
                'GiangVien': 'fa-user-tie', 'CongTrinhNghienCuu': 'fa-file-alt',
                'DeTaiNghienCuu': 'fa-flask', 'BoMon': 'fa-building', 'Khoa': 'fa-university',
                'TacGiaNgoai': 'fa-user', 'LinhVucNghienCuu': 'fa-tags', 'NhomNghienCuu': 'fa-users',
            };
            const labelColors = {
                'GiangVien': '#4F8EF7', 'CongTrinhNghienCuu': '#2ECC71', 'DeTaiNghienCuu': '#F39C12',
                'BoMon': '#E74C3C', 'Khoa': '#9B59B6', 'LinhVucNghienCuu': '#1ABC9C',
                'NhomNghienCuu': '#E67E22', 'TacGiaNgoai': '#95A5A6',
            };

            const typeName = labelNames[label] || label;
            const icon = labelIcons[label] || 'fa-circle';
            const color = labelColors[label] || '#95A5A6';

            document.getElementById('detailTitle').textContent = name || typeName;
            document.getElementById('detailSubtitle').textContent = typeName;

            const iconEl = document.getElementById('detailIcon');
            iconEl.innerHTML = `<i class="fas ${icon}" style="color: ${color};"></i>`;

            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            iconEl.style.background = `rgba(${r}, ${g}, ${b}, 0.1)`;

            document.getElementById('detailFieldsGrid').innerHTML = `
                <div><span style="color:var(--text-muted);font-size:12px;">Phân loại thực thể</span><br><b>${typeName}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Mã thực thể</span><br><b>${nodeId}</b></div>
            `;

            let bodyHtml = '<h3 style="font-size: 15px; margin-bottom: 12px; color: var(--accent-blue);"><i class="fas fa-link"></i> Thực thể liên quan</h3>';
            const neighbors = (dataGraph.nodes || []).filter(n => n.id !== nodeId);

            if (neighbors.length === 0) {
                bodyHtml += '<p style="color: var(--text-muted); padding: 10px;">Không có thực thể liên quan trực tiếp.</p>';
            } else {
                bodyHtml += `<div style="display: flex; flex-direction: column; gap: 8px;">`;
                neighbors.forEach(n => {
                    const nLabel = n.group || 'Unknown';
                    const nTypeName = labelNames[nLabel] || nLabel;
                    const nIcon = labelIcons[nLabel] || 'fa-circle';

                    let clickFn = '';
                    if (nLabel === 'GiangVien') clickFn = `showLecturerDetail('${n.id}')`;
                    else if (nLabel === 'CongTrinhNghienCuu') clickFn = `showPublicationDetail('${n.id}')`;
                    else if (nLabel === 'DeTaiNghienCuu') clickFn = `showProjectDetail('${n.id}')`;
                    else clickFn = `showGenericEntityDetail('${n.id}', '${nLabel}', '${n.label.replace(/'/g, "\\'")}')`;

                    bodyHtml += `
                        <div style="padding: 10px; background: rgba(0,0,0,0.02); border-radius: 6px; border-left: 3px solid ${labelColors[nLabel] || '#ccc'}; cursor: pointer; display: flex; align-items: center; gap: 10px;"
                             onclick="${clickFn}">
                            <i class="fas ${nIcon}" style="color: ${labelColors[nLabel] || '#ccc'}; width: 16px; text-align: center;"></i>
                            <div>
                                <strong>${n.label}</strong>
                                <span style="color: var(--text-muted); font-size: 12px;"> — ${nTypeName}</span>
                            </div>
                        </div>
                    `;
                });
                bodyHtml += `</div>`;
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
    } catch (err) {
        console.error('Generic detail error:', err);
    }
}
