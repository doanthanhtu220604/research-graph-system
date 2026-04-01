/* ============================================================
   KNOWLEDGE MAP - Main Application JavaScript
   ============================================================ */

const API_BASE = '/api';
let dashboardGraph = null;
let exploreGraph = null;

// ============================================================
// INITIALIZATION (MPA MODE)
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    let path = window.location.pathname;
    let page = path.split('/').pop().split('.')[0];
    
    if (!page || page === '' || page === 'index') {
        setTimeout(loadDashboard, 100);
    } else if (page === 'explore') {
        setTimeout(initExploreGraph, 100);
    } else if (page === 'lecturers') {
        setTimeout(loadLecturers, 100);
    } else if (page === 'publications') {
        setTimeout(loadPublications, 100);
    } else if (page === 'projects') {
        setTimeout(loadProjects, 100);
    } else if (page === 'statistics') {
        setTimeout(loadStatistics, 100);
    }
});

// Global Event Delegation for dynamically loaded components
document.addEventListener('keyup', (e) => {
    if (e.target && e.target.id === 'globalSearch') {
        if (e.key === 'Enter') {
            const query = e.target.value;
            if (window.location.pathname.indexOf('explore.html') === -1) {
                window.location.href = 'explore.html?q=' + encodeURIComponent(query);
            } else {
                document.getElementById('exploreSearch').value = query;
                performSearch();
            }
        }
    }
});

// ============================================================
// DASHBOARD
// ============================================================

async function loadDashboard() {
    try {
        const res = await fetch(`${API_BASE}/stats/overview`);
        const data = await res.json();

        if (data.status === 'ok') {
            // Top lecturers
            renderTopLecturers(data.top_giang_vien, 'topLecturersList');
        }
    } catch (err) {
        console.error('Dashboard error:', err);
    }
    
    // Nạp Carousel (Marquee) gợi ý Giảng viên tự chạyy
    initLecturerMarquee();
}

async function initLecturerMarquee() {
    try {
        const res = await fetch(`${API_BASE}/giang-vien`);
        const data = await res.json();
        const container = document.getElementById('lecturerMarquee');
        if (!container || data.status !== 'ok') return;
        
        let gvList = data.data;
        if (gvList.length === 0) return;
        
        const buildCard = (gv) => `
            <div class="marquee-card" onclick="showLecturerDetail(${gv.id})">
                <div class="marquee-icon">${gv.anh_dai_dien ? `<img src="${gv.anh_dai_dien}" alt="${gv.ho_va_ten}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">` : `<i class="fas fa-user-tie"></i>`}</div>
                <div class="marquee-info">
                    <h4>${gv.ho_va_ten}</h4>
                    <p>${gv.bo_mon || gv.hoc_vi || 'Giảng viên'}</p>
                </div>
            </div>
        `;

        let html = gvList.map(buildCard).join('');
        // Nhân đôi chuỗi HTML để tạo hiệu ứng lặp trượt không giới hạn
        html += html; 
        
        container.innerHTML = html;
        
    } catch (e) {
        console.error("Marquee load err:", e);
    }
}

function renderTopLecturers(lecturers, containerId) {
    const container = document.getElementById(containerId);
    if (!lecturers || lecturers.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">Chưa có dữ liệu</p>';
        return;
    }

    const maxCount = lecturers[0].so_cong_trinh;
    container.innerHTML = lecturers.map((gv, i) => {
        const rankClass = i < 3 ? `top-${i + 1}` : '';
        const barWidth = Math.round((gv.so_cong_trinh / maxCount) * 100);
        return `
            <div class="lecturer-rank-item">
                <div class="rank-number ${rankClass}">${i + 1}</div>
                <div class="rank-info">
                    <div class="rank-name">${gv.ten}</div>
                    <div class="rank-count">${gv.so_cong_trinh} công trình</div>
                </div>
                <div class="rank-bar">
                    <div class="rank-bar-fill" style="width: ${barWidth}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// KNOWLEDGE GRAPH (Vis.js)
// ============================================================

async function loadKnowledgeGraph() {
    try {
        const res = await fetch(`${API_BASE}/graph/all`);
        const data = await res.json();

        if (data.status === 'ok') {
            renderGraph('knowledge-graph', data.nodes, data.edges, (network) => {
                dashboardGraph = network;
            });
            renderLegend(data.legend);
        }
    } catch (err) {
        console.error('Graph error:', err);
    }
}

function renderGraph(containerId, nodes, edges, callback) {
    const container = document.getElementById(containerId);

    const visNodes = new vis.DataSet(nodes.map(n => ({
        id: n.id,
        label: truncateLabel(n.label, 20),
        title: buildTooltip(n),
        color: {
            background: n.color,
            border: n.color,
            highlight: { background: n.color, border: '#ffffff' },
            hover: { background: n.color, border: '#ffffff' }
        },
        shape: n.shape || 'dot',
        size: n.size || 15,
        font: { color: '#333333', size: 11, face: 'Inter' },
        borderWidth: 2,
        shadow: { enabled: true, color: n.color + '40', size: 10 },
    })));

    const visEdges = new vis.DataSet(edges.map(e => ({
        from: e.from,
        to: e.to,
        label: formatRelLabel(e.label),
        arrows: { to: { enabled: true, scaleFactor: 0.7 } },
        color: { color: 'rgba(0,0,0,0.2)', highlight: '#4F8EF7', hover: '#4F8EF7' },
        font: { color: '#636980', size: 9, face: 'Inter', strokeWidth: 0 },
        smooth: { type: 'continuous', roundness: 0.3 },
        width: 1.2,
    })));

    const options = {
        physics: {
            enabled: true,
            solver: 'forceAtlas2Based',
            forceAtlas2Based: {
                gravitationalConstant: -40,
                centralGravity: 0.008,
                springLength: 150,
                springConstant: 0.04,
                damping: 0.5,
            },
            stabilization: { iterations: 200 },
        },
        interaction: {
            hover: true,
            tooltipDelay: 200,
            zoomView: true,
            dragView: true,
            navigationButtons: false,
        },
        nodes: {
            borderWidth: 2,
            borderWidthSelected: 3,
        },
        edges: {
            selectionWidth: 2,
        },
    };

    const network = new vis.Network(container, { nodes: visNodes, edges: visEdges }, options);

    // Click node -> show details or navigate
    network.on('click', (params) => {
        if (params.nodes.length > 0) {
            const nodeId = params.nodes[0];
            const node = nodes.find(n => n.id === nodeId);
            if (node) {
                if (node.group === 'GiangVien' && (node.properties.id || node.id)) {
                    showLecturerDetail(node.properties.id || node.id);
                } else if (node.group === 'CongTrinhNghienCuu' && node.id) {
                    showPublicationDetail(node.id);
                } else if (node.group === 'DeTaiNghienCuu' && node.id) {
                    showProjectDetail(node.id);
                }
            }
        }
    });

    if (callback) callback(network);
}

function resetGraphView() {
    if (dashboardGraph) {
        dashboardGraph.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
    }
}

function truncateLabel(text, maxLen) {
    if (!text) return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
}

function buildTooltip(node) {
    const props = node.properties || {};
    const container = document.createElement('div');
    container.style.cssText = 'font-family:Inter;padding:8px;max-width:350px;white-space:normal;line-height:1.4;font-size:13px;';
    
    const groupNames = {
        'GiangVien': 'Giảng viên', 'CongTrinhNghienCuu': 'Công trình NC', 
        'DeTaiNghienCuu': 'Đề tài NC', 'BoMon': 'Bộ môn', 'Khoa': 'Khoa', 
        'LinhVucNghienCuu': 'Lĩnh vực NC', 'NhomNghienCuu': 'Nhóm NC'
    };
    
    const keyNames = {
        'ho_va_ten': 'Họ tên', 'hoc_vi': 'Học vị', 'chuc_danh': 'Chức danh',
        'ten_cong_trinh': 'Tên công trình', 'nam_xuat_ban': 'Năm XB', 'loai_an_pham': 'Loại',
        'ten_de_tai': 'Tên đề tài', 'cap_de_tai': 'Cấp', 'nam_bat_dau': 'Từ năm', 'nam_thuc_hien': 'Năm TH', 'nam_ket_thuc': 'Đến năm',
        'ten_bo_mon': 'Bộ môn', 'ten_khoa': 'Khoa', 'email': 'Email', 'dien_thoai': 'SĐT'
    };
    
    const skipKeys = ['id', 'tom_tat', 'link'];
    const groupLabel = groupNames[node.group] || node.group;
    
    let html = `<div style="border-bottom: 1px solid #ddd; margin-bottom: 6px; padding-bottom: 4px;">
                    <strong style="color:#4F8EF7; font-size:14px;">${groupLabel}</strong>
                </div>`;
                
    for (const [key, val] of Object.entries(props)) {
        if (val !== null && val !== '' && !skipKeys.includes(key)) {
            const displayKey = keyNames[key] || key;
            html += `<div style="margin-bottom:4px;"><b>${displayKey}:</b> ${val}</div>`;
        }
    }
    
    container.innerHTML = html;
    return container;
}

function formatRelLabel(label) {
    if (!label) return '';
    return label.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c);
}

function renderLegend(legendConfig) {
    const container = document.getElementById('graphLegend');
    const labels = {
        'GiangVien': 'Giảng viên',
        'CongTrinhNghienCuu': 'Công trình',
        'DeTaiNghienCuu': 'Đề tài',
        'BoMon': 'Bộ môn',
        'Khoa': 'Khoa',
        'LinhVucNghienCuu': 'Lĩnh vực',
        'NhomNghienCuu': 'Nhóm NC',
    };

    container.innerHTML = Object.entries(legendConfig).map(([key, cfg]) => `
        <div class="legend-item">
            <div class="legend-dot" style="background: ${cfg.color}"></div>
            <span>${labels[key] || key}</span>
        </div>
    `).join('');
}

// ============================================================
// EXPLORE & SEARCH
// ============================================================

function initExploreGraph() {
    loadKnowledgeGraphForExplore();
    
    // Phím Enter cho ô Search
    const searchInput = document.getElementById('exploreSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }
    
    // Auto-search if query parameter exists
    const urlParams = new URLSearchParams(window.location.search);
    const q = urlParams.get('q');
    if (q) {
        setTimeout(() => {
            if (searchInput) {
                searchInput.value = q;
                performSearch();
            }
        }, 300);
    }
}

async function loadKnowledgeGraphForExplore() {
    try {
        const res = await fetch(`${API_BASE}/graph/all`);
        const data = await res.json();

        if (data.status === 'ok') {
            renderGraph('explore-graph', data.nodes, data.edges, (network) => {
                exploreGraph = network;
            });
        }
    } catch (err) {
        console.error('Explore graph error:', err);
    }
}

async function performSearch() {
    const searchEl = document.getElementById('exploreSearch');
    if (!searchEl) { console.error('Search: không tìm thấy #exploreSearch'); return; }
    const query = searchEl.value.trim();
    if (!query) return;

    console.log('[Search] Searching for:', query);

    try {
        const url = `${API_BASE}/search?q=${encodeURIComponent(query)}`;
        console.log('[Search] Fetching:', url);
        const res = await fetch(url);
        console.log('[Search] Response status:', res.status);
        const data = await res.json();
        console.log('[Search] Data:', data);

        const resultsContainer = document.getElementById('searchResults');
        const listContainer = document.getElementById('searchResultsList');

        if (data.status === 'ok' && data.data.length > 0) {
            resultsContainer.style.display = 'block';

            const labelIcons = {
                'GiangVien': 'fa-user-tie',
                'CongTrinhNghienCuu': 'fa-file-alt',
                'DeTaiNghienCuu': 'fa-flask',
                'BoMon': 'fa-building',
                'Khoa': 'fa-university',
                'TacGiaNgoai': 'fa-user',
            };

            const labelNames = {
                'GiangVien': 'Giảng viên',
                'CongTrinhNghienCuu': 'Công trình',
                'DeTaiNghienCuu': 'Đề tài',
                'BoMon': 'Bộ môn',
                'Khoa': 'Khoa',
                'TacGiaNgoai': 'Tác giả ngoài',
            };

            listContainer.innerHTML = data.data.map(item => {
                const label = item._labels[0];
                const icon = labelIcons[label] || 'fa-circle';
                const typeName = labelNames[label] || label;
                const name = item.ho_va_ten || item.ten_cong_trinh || item.ten_de_tai
                          || item.ten_bo_mon || item.ten_khoa || 'N/A';

                let clickAction = '';
                if (label === 'GiangVien' && item.id) clickAction = `showLecturerDetail(${item.id})`;
                else if (label === 'CongTrinhNghienCuu' && item.id) clickAction = `showPublicationDetail(${item.id})`;
                else if (label === 'DeTaiNghienCuu' && item.id) clickAction = `showProjectDetail(${item.id})`;

                return `
                    <div class="modal-list-item" style="cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border-color);"
                         onclick="${clickAction}">
                        <i class="fas ${icon}" style="color: var(--accent-blue);"></i>
                        <div>
                            <strong>${name}</strong>
                            <span style="color: var(--text-muted); font-size: 12px;"> — ${typeName}</span>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            resultsContainer.style.display = 'block';
            listContainer.innerHTML = '<p style="color: var(--text-muted); padding: 20px;">Không tìm thấy kết quả.</p>';
        }
    } catch (err) {
        console.error('Search error:', err);
        alert('Lỗi tìm kiếm: ' + err.message);
    }
}

// ============================================================
// LECTURERS PAGE
// ============================================================

async function loadLecturers() {
    try {
        const res = await fetch(`${API_BASE}/giang-vien`);
        const data = await res.json();

        if (data.status === 'ok') {
            const tbody = document.getElementById('lecturersBody');
            tbody.innerHTML = data.data.map((gv, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>
                        ${gv.anh_dai_dien
                            ? `<img src="${gv.anh_dai_dien}" alt="${gv.ho_va_ten}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px;">`
                            : `<i class="fas fa-user-circle" style="font-size:36px;color:var(--text-muted);vertical-align:middle;margin-right:8px;"></i>`
                        }
                        <strong>${gv.ho_va_ten || 'N/A'}</strong>
                    </td>
                    <td>${gv.hoc_vi || ''}</td>
                    <td>${gv.chuc_danh || ''}</td>
                    <td>${gv.bo_mon || ''}</td>
                    <td>${gv.email || ''}</td>
                    <td>
                        ${gv.id ? `
                        <button class="btn btn-view" onclick="showLecturerDetail(${gv.id})">
                            <i class="fas fa-eye"></i> Xem
                        </button>
                        ` : `
                        <button class="btn btn-view" style="opacity:0.5; cursor:not-allowed;" title="Giảng viên chưa có ID trong hệ thống">
                            <i class="fas fa-eye-slash"></i> Không có ID
                        </button>
                        `}
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error('Lecturers error:', err);
    }
}

async function showLecturerDetail(gvId) {
    try {
        // Fetch Lecturer Detail
        const resDetail = await fetch(`${API_BASE}/giang-vien/${gvId}`);
        const dataDetail = await resDetail.json();

        // Fetch Subgraph for this node
        const resGraph = await fetch(`${API_BASE}/graph/node/${gvId}`);
        const dataGraph = await resGraph.json();

        if (dataDetail.status === 'ok' && dataGraph.status === 'ok') {
            const gv = dataDetail.data;
            
            // Populate Left Column
            document.getElementById('detailTitle').textContent = gv.ho_va_ten || 'Giảng viên';
            document.getElementById('detailSubtitle').textContent = gv.chuc_danh ? `${gv.chuc_danh} - ${gv.hoc_vi || ''}` : (gv.hoc_vi || 'Giảng viên');
            
            // Set avatar or fallback icon
            const iconEl = document.getElementById('detailIcon');
            if (gv.anh_dai_dien) {
                iconEl.innerHTML = `<img src="${gv.anh_dai_dien}" alt="${gv.ho_va_ten}" style="width:100%;height:100%;object-fit:cover;">`;
                iconEl.style.background = 'transparent';
            } else {
                iconEl.innerHTML = '<i class="fas fa-user-tie"></i>';
                iconEl.style.background = 'rgba(79, 142, 247, 0.1)';
            }
            
            let fieldsHtml = `
                <div><span style="color:var(--text-muted);font-size:12px;">Học vị</span><br><b>${gv.hoc_vi || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Chức danh</span><br><b>${gv.chuc_danh || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Bộ môn</span><br><b>${gv.bo_mon || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Email</span><br><b>${gv.email || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Điện thoại</span><br><b>${gv.dien_thoai || 'N/A'}</b></div>
            `;
            document.getElementById('detailFieldsGrid').innerHTML = fieldsHtml;

            let bodyHtml = '';
            if (gv.cong_trinh && gv.cong_trinh.length > 0) {
                bodyHtml += `
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: var(--accent-blue);"><i class="fas fa-file-alt"></i> Công trình nghiên cứu (${gv.cong_trinh.length})</h3>
                        ${gv.cong_trinh.map(ct => `
                            <div style="padding: 10px; background: rgba(0,0,0,0.02); margin-bottom: 8px; border-radius: 6px; border-left: 3px solid var(--accent-blue); cursor: pointer;" onclick="showPublicationDetail(${ct.id})">
                                <strong>${ct.ten_cong_trinh || 'N/A'}</strong>
                                ${ct.nam_xuat_ban ? `<span style="color: var(--text-muted); font-size: 12px;"> (${ct.nam_xuat_ban})</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            if (gv.de_tai && gv.de_tai.length > 0) {
                bodyHtml += `
                    <div>
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: var(--accent-orange);"><i class="fas fa-flask"></i> Đề tài nghiên cứu (${gv.de_tai.length})</h3>
                        ${gv.de_tai.map(dt => {
                            const tenDeTai = (dt.de_tai && dt.de_tai.ten_de_tai) ? dt.de_tai.ten_de_tai : 'N/A';
                            const capDeTai = (dt.de_tai && dt.de_tai.cap_de_tai) ? dt.de_tai.cap_de_tai : 'Chưa xác định';
                            const dtId = dt.de_tai ? dt.de_tai.id : null;
                            return `
                                <div style="padding: 10px; background: rgba(0,0,0,0.02); margin-bottom: 8px; border-radius: 6px; border-left: 3px solid var(--accent-orange); cursor: pointer;" ${dtId ? `onclick="showProjectDetail(${dtId})"` : ''}>
                                    <strong>${tenDeTai}</strong>
                                    <div style="color: var(--text-muted); font-size: 12px; margin-top: 4px;">
                                        Cấp đề tài: ${capDeTai} | Vai trò: <span style="color: var(--text-primary);">${dt.vai_tro || 'Thành viên'}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
            document.getElementById('detailBodyContent').innerHTML = bodyHtml;

            // Show global overlay
            document.getElementById('globalDetailOverlay').classList.add('active');

            // Render right column Graph
            // Small delay to ensure container is visible for vis.js to calculate dimensions
            setTimeout(() => {
                renderGraph('detail-graph-container', dataGraph.nodes, dataGraph.edges, (network) => {
                    window.detailGraph = network;
                });
            }, 50);
        }
    } catch (err) {
        console.error('Detail error:', err);
    }
}

function closeEntityDetail() {
    document.getElementById('globalDetailOverlay').classList.remove('active');
}

function resetDetailGraphView() {
    if (window.detailGraph) {
        window.detailGraph.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
    }
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});

async function showPublicationDetail(ctId) {
    try {
        const resDetail = await fetch(`${API_BASE}/cong-trinh/${ctId}`);
        const dataDetail = await resDetail.json();
        const resGraph = await fetch(`${API_BASE}/graph/node/${ctId}`);
        const dataGraph = await resGraph.json();

        if (dataDetail.status === 'ok' && dataGraph.status === 'ok') {
            const ct = dataDetail.data;
            document.getElementById('detailTitle').textContent = ct.ten_cong_trinh || 'Công trình nghiên cứu';
            document.getElementById('detailSubtitle').textContent = ct.loai_an_pham || 'Công trình';
            
            let fieldsHtml = `
                <div><span style="color:var(--text-muted);font-size:12px;">Năm xuất bản</span><br><b>${ct.nam_xuat_ban || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Loại ấn phẩm</span><br><b>${ct.loai_an_pham || 'N/A'}</b></div>
            `;
            if (ct.link) {
                fieldsHtml += `<div><span style="color:var(--text-muted);font-size:12px;">Liên kết</span><br><a href="${ct.link}" target="_blank" class="btn btn-sm" style="display:inline-block; margin-top:5px; background:var(--accent-blue); color:white; padding:5px 10px; border-radius:4px; text-decoration:none;"><i class="fas fa-external-link-alt"></i> Xem bài viết</a></div>`;
            }
            document.getElementById('detailFieldsGrid').innerHTML = fieldsHtml;

            let bodyHtml = '';
            if (ct.tom_tat) {
                bodyHtml += `
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: var(--accent-green);"><i class="fas fa-align-left"></i> Tóm tắt nội dung</h3>
                        <div style="padding: 15px; background: rgba(0,0,0,0.02); border-radius: 8px; line-height: 1.6; color: var(--text-primary); text-align: justify; white-space: pre-line;">
                            ${ct.tom_tat}
                        </div>
                    </div>
                `;
            }
            
            if (ct.tac_gia && ct.tac_gia.length > 0) {
                bodyHtml += `
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: var(--accent-blue);"><i class="fas fa-users"></i> Nhóm tác giả</h3>
                        <div style="display:flex; flex-wrap:wrap; gap:8px;">
                            ${ct.tac_gia.map(tg => `<span style="padding:5px 10px; background:rgba(79, 142, 247, 0.1); color:var(--accent-blue); border-radius:15px; font-size:13px;">${tg}</span>`).join('')}
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
            }, 50);
        }
    } catch (err) { console.error(err); }
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
            
            let fieldsHtml = `
                <div><span style="color:var(--text-muted);font-size:12px;">Cấp đề tài</span><br><b>${dt.cap_de_tai || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Thời gian thực hiện</span><br><b>${dt.nam_bat_dau || '?'} - ${dt.nam_ket_thuc || '?'}</b></div>
            `;
            if (dt.link) {
                fieldsHtml += `<div><span style="color:var(--text-muted);font-size:12px;">Liên kết</span><br><a href="${dt.link}" target="_blank" class="btn btn-sm" style="display:inline-block; margin-top:5px; background:var(--accent-orange); color:white; padding:5px 10px; border-radius:4px; text-decoration:none;"><i class="fas fa-external-link-alt"></i> Xem chi tiết</a></div>`;
            }
            document.getElementById('detailFieldsGrid').innerHTML = fieldsHtml;

            let bodyHtml = '';
            if (dt.tom_tat) {
                bodyHtml += `
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: var(--accent-orange);"><i class="fas fa-align-left"></i> Tóm tắt nội dung</h3>
                        <div style="padding: 15px; background: rgba(0,0,0,0.02); border-radius: 8px; line-height: 1.6; color: var(--text-primary); text-align: justify; white-space: pre-line;">
                            ${dt.tom_tat}
                        </div>
                    </div>
                `;
            }

            if (dt.thanh_vien && dt.thanh_vien.length > 0) {
                bodyHtml += `
                    <div style="margin-bottom: 20px;">
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: var(--accent-blue);"><i class="fas fa-users"></i> Thành viên tham gia</h3>
                        ${dt.thanh_vien.map(tv => `
                            <div style="padding: 10px; background: rgba(0,0,0,0.02); margin-bottom: 8px; border-radius: 6px; border-left: 3px solid ${tv.vai_tro === 'CHU_NHIEM' ? 'var(--accent-orange)' : 'var(--border-color)'};">
                                <strong>${tv.ten}</strong>
                                <div style="color: var(--text-muted); font-size: 12px; margin-top: 4px;">Vai trò: ${tv.vai_tro === 'CHU_NHIEM' ? 'Chủ nhiệm đề tài' : 'Thành viên'}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            document.getElementById('detailBodyContent').innerHTML = bodyHtml;
            document.getElementById('globalDetailOverlay').classList.add('active');

            setTimeout(() => {
                renderGraph('detail-graph-container', dataGraph.nodes, dataGraph.edges, (network) => {
                    window.detailGraph = network;
                });
            }, 50);
        }
    } catch (err) { console.error(err); }
}

// ============================================================
// PUBLICATIONS PAGE
// ============================================================

async function loadPublications() {
    try {
        const res = await fetch(`${API_BASE}/cong-trinh`);
        const data = await res.json();

        if (data.status === 'ok') {
            const tbody = document.getElementById('publicationsBody');
            tbody.innerHTML = data.data.map((ct, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${ct.ten_cong_trinh || 'N/A'}</td>
                    <td>${(ct.tac_gia || []).join(', ') || 'N/A'}</td>
                    <td>${ct.nam_xuat_ban || ''}</td>
                    <td>
                        ${ct.id ? `
                        <button class="btn btn-view" onclick="showPublicationDetail(${ct.id})">
                            <i class="fas fa-eye"></i> Xem
                        </button>
                        ` : `
                        <button class="btn btn-view" style="opacity:0.5; cursor:not-allowed;" title="Chưa có ID">
                            <i class="fas fa-eye-slash"></i> Không có ID
                        </button>
                        `}
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error('Publications error:', err);
    }
}

// ============================================================
// PROJECTS PAGE
// ============================================================

async function loadProjects() {
    try {
        const res = await fetch(`${API_BASE}/de-tai`);
        const data = await res.json();

        if (data.status === 'ok') {
            const tbody = document.getElementById('projectsBody');
            tbody.innerHTML = data.data.map((dt, i) => `
                <tr>
                    <td>${i + 1}</td>
                    <td>${dt.ten_de_tai || 'N/A'}</td>
                    <td>${(dt.chu_nhiem || []).join(', ') || 'N/A'}</td>
                    <td>${dt.cap_de_tai || ''}</td>
                    <td>
                        ${dt.id ? `
                        <button class="btn btn-view" onclick="showProjectDetail(${dt.id})">
                            <i class="fas fa-eye"></i> Xem
                        </button>
                        ` : `
                        <button class="btn btn-view" style="opacity:0.5; cursor:not-allowed;" title="Chưa có ID">
                            <i class="fas fa-eye-slash"></i> Không có ID
                        </button>
                        `}
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) {
        console.error('Projects error:', err);
    }
}

// ============================================================
// STATISTICS PAGE
// ============================================================

async function loadStatistics() {
    try {
        const res = await fetch(`${API_BASE}/stats/overview`);
        const data = await res.json();

        if (data.status === 'ok') {
            // Top lecturers
            renderTopLecturers(data.top_giang_vien, 'statsTopLecturers');

            // Overview
            const overviewContainer = document.getElementById('statsOverview');
            overviewContainer.innerHTML = `
                <div class="stats-overview-item">
                    <span class="stats-overview-label">Tổng giảng viên</span>
                    <span class="stats-overview-value">${data.stats.giang_vien}</span>
                </div>
                <div class="stats-overview-item">
                    <span class="stats-overview-label">Tổng công trình</span>
                    <span class="stats-overview-value">${data.stats.cong_trinh}</span>
                </div>
                <div class="stats-overview-item">
                    <span class="stats-overview-label">Tổng đề tài</span>
                    <span class="stats-overview-value">${data.stats.de_tai}</span>
                </div>
                <div class="stats-overview-item">
                    <span class="stats-overview-label">Tổng bộ môn</span>
                    <span class="stats-overview-value">${data.stats.bo_mon}</span>
                </div>
                <div class="stats-overview-item">
                    <span class="stats-overview-label">Tổng quan hệ</span>
                    <span class="stats-overview-value">${data.stats.giang_vien + data.stats.cong_trinh + data.stats.de_tai + data.stats.bo_mon} nodes</span>
                </div>
            `;
        }
    } catch (err) {
        console.error('Statistics error:', err);
    }
}

// ============================================================
// LOGIN MODAL LOGIC
// ============================================================

function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    document.getElementById('username').focus();
    document.getElementById('loginError').style.display = 'none';
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    document.getElementById('loginForm').reset();
}

function handleLogin(event) {
    event.preventDefault();
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;

    // Simple mock login since there's no backend login API defined yet
    if (user === 'admin' && pass === 'admin') {
        localStorage.setItem('isAdmin', 'true');
        window.location.href = '../admin/index.html';
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}
