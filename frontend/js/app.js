/* ============================================================
   KNOWLEDGE MAP - Main Application JavaScript
   ============================================================ */

const API_BASE = '/api';
let dashboardGraph = null;
let exploreGraph = null;

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initGlobalSearch();
    loadDashboard();
});

// ============================================================
// NAVIGATION
// ============================================================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });

    // Menu toggle for mobile
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });
    }
}

function navigateTo(page) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelector(`.nav-item[data-page="${page}"]`).classList.add('active');

    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');

    // Update title
    const titles = {
        dashboard: 'Tổng quan',
        explore: 'Tra cứu & Khám phá',
        lecturers: 'Giảng viên',
        publications: 'Công trình Nghiên cứu',
        projects: 'Đề tài Nghiên cứu',
        statistics: 'Thống kê'
    };
    document.getElementById('pageTitle').textContent = titles[page] || page;

    // Load page data
    switch (page) {
        case 'dashboard': loadDashboard(); break;
        case 'explore': initExploreGraph(); break;
        case 'lecturers': loadLecturers(); break;
        case 'publications': loadPublications(); break;
        case 'projects': loadProjects(); break;
        case 'statistics': loadStatistics(); break;
    }

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
}

// ============================================================
// GLOBAL SEARCH
// ============================================================

function initGlobalSearch() {
    const input = document.getElementById('globalSearch');
    let timeout;
    input.addEventListener('keyup', (e) => {
        clearTimeout(timeout);
        if (e.key === 'Enter') {
            navigateTo('explore');
            document.getElementById('exploreSearch').value = input.value;
            performSearch();
        }
    });
}

// ============================================================
// DASHBOARD
// ============================================================

async function loadDashboard() {
    try {
        const res = await fetch(`${API_BASE}/stats/overview`);
        const data = await res.json();

        if (data.status === 'ok') {
            // Animate stat cards
            animateCounter('stat-gv', data.stats.giang_vien);
            animateCounter('stat-ct', data.stats.cong_trinh);
            animateCounter('stat-dt', data.stats.de_tai);
            animateCounter('stat-bm', data.stats.bo_mon);

            // Top lecturers
            renderTopLecturers(data.top_giang_vien, 'topLecturersList');
        }
    } catch (err) {
        console.error('Dashboard error:', err);
    }

    // Load knowledge graph
    loadKnowledgeGraph();
}

function animateCounter(elementId, target) {
    const el = document.querySelector(`#${elementId} .stat-number`);
    let current = 0;
    const increment = Math.ceil(target / 30);
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        el.textContent = current;
    }, 30);
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
        font: { color: '#e8eaed', size: 11, face: 'Inter' },
        borderWidth: 2,
        shadow: { enabled: true, color: n.color + '40', size: 10 },
    })));

    const visEdges = new vis.DataSet(edges.map(e => ({
        from: e.from,
        to: e.to,
        label: formatRelLabel(e.label),
        arrows: { to: { enabled: true, scaleFactor: 0.7 } },
        color: { color: 'rgba(255,255,255,0.15)', highlight: '#4F8EF7', hover: '#4F8EF7' },
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
            if (node && node.group === 'GiangVien' && node.properties.id) {
                showLecturerDetail(node.properties.id);
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
    let html = `<div style="font-family:Inter;padding:8px;max-width:300px;">`;
    html += `<strong style="color:#4F8EF7;">[${node.group}]</strong><br>`;
    for (const [key, val] of Object.entries(props)) {
        if (val) html += `<b>${key}:</b> ${val}<br>`;
    }
    html += `</div>`;
    return html;
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
    const query = document.getElementById('exploreSearch').value.trim();
    if (!query) return;

    try {
        const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();

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
            };

            const labelNames = {
                'GiangVien': 'Giảng viên',
                'CongTrinhNghienCuu': 'Công trình',
                'DeTaiNghienCuu': 'Đề tài',
                'BoMon': 'Bộ môn',
                'Khoa': 'Khoa',
            };

            listContainer.innerHTML = data.data.map(item => {
                const label = item._labels[0];
                const icon = labelIcons[label] || 'fa-circle';
                const typeName = labelNames[label] || label;
                const name = item.ho_va_ten || item.ten_cong_trinh || item.ten_de_tai
                          || item.ten_bo_mon || item.ten_khoa || 'N/A';

                return `
                    <div class="modal-list-item" style="cursor: pointer; display: flex; align-items: center; gap: 10px;"
                         onclick="${label === 'GiangVien' && item.id ? `showLecturerDetail(${item.id})` : ''}">
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
                    <td><strong>${gv.ho_va_ten || 'N/A'}</strong></td>
                    <td>${gv.hoc_vi || ''}</td>
                    <td>${gv.chuc_danh || ''}</td>
                    <td>${gv.bo_mon || ''}</td>
                    <td>${gv.email || ''}</td>
                    <td>
                        <button class="btn btn-view" onclick="showLecturerDetail(${gv.id})">
                            <i class="fas fa-eye"></i> Xem
                        </button>
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
        const res = await fetch(`${API_BASE}/giang-vien/${gvId}`);
        const data = await res.json();

        if (data.status === 'ok') {
            const gv = data.data;
            document.getElementById('modalLecturerName').textContent = gv.ho_va_ten;

            let html = `
                <div class="modal-section">
                    <h3><i class="fas fa-id-card"></i> Thông tin cá nhân</h3>
                    <div class="modal-detail-row">
                        <span class="modal-detail-label">Học vị:</span>
                        <span class="modal-detail-value">${gv.hoc_vi || 'N/A'}</span>
                    </div>
                    <div class="modal-detail-row">
                        <span class="modal-detail-label">Chức danh:</span>
                        <span class="modal-detail-value">${gv.chuc_danh || 'N/A'}</span>
                    </div>
                    <div class="modal-detail-row">
                        <span class="modal-detail-label">Bộ môn:</span>
                        <span class="modal-detail-value">${gv.bo_mon || 'N/A'}</span>
                    </div>
                    <div class="modal-detail-row">
                        <span class="modal-detail-label">Email:</span>
                        <span class="modal-detail-value">${gv.email || 'N/A'}</span>
                    </div>
                    <div class="modal-detail-row">
                        <span class="modal-detail-label">Điện thoại:</span>
                        <span class="modal-detail-value">${gv.dien_thoai || 'N/A'}</span>
                    </div>
                </div>
            `;

            if (gv.cong_trinh && gv.cong_trinh.length > 0) {
                html += `
                    <div class="modal-section">
                        <h3><i class="fas fa-file-alt"></i> Công trình nghiên cứu (${gv.cong_trinh.length})</h3>
                        ${gv.cong_trinh.map(ct => `
                            <div class="modal-list-item">
                                ${ct.ten_cong_trinh || 'N/A'}
                                ${ct.nam_xuat_ban ? `<span style="color: var(--text-muted);"> (${ct.nam_xuat_ban})</span>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            if (gv.de_tai && gv.de_tai.length > 0) {
                html += `
                    <div class="modal-section">
                        <h3><i class="fas fa-flask"></i> Đề tài nghiên cứu (${gv.de_tai.length})</h3>
                        ${gv.de_tai.map(dt => `
                            <div class="modal-list-item">
                                ${dt.de_tai.ten_de_tai || 'N/A'}
                                <span style="color: var(--accent-orange); font-size: 12px;"> [${dt.vai_tro}]</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            document.getElementById('modalLecturerBody').innerHTML = html;
            document.getElementById('lecturerModal').classList.add('active');
        }
    } catch (err) {
        console.error('Lecturer detail error:', err);
    }
}

function closeLecturerModal() {
    document.getElementById('lecturerModal').classList.remove('active');
}

// Close modal on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('active');
    }
});

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
