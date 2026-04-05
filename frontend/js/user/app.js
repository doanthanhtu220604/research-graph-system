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
            // Update Stats Cards with animation
            if (data.stats) {
                animateValue("count-gv", data.stats.giang_vien);
                animateValue("count-ct", data.stats.cong_trinh);
                animateValue("count-dt", data.stats.de_tai);
                animateValue("count-bm", data.stats.bo_mon);
            }
            
            // Top lecturers
            renderTopLecturers(data.top_giang_vien, 'topLecturersList');
        }
    } catch (err) {
        console.error('Dashboard error:', err);
    }

    // Load grids
    initSimpleLecturerGrid();
    initSimplePublicationGrid();
    initSimpleProjectGrid();
}

function animateValue(id, endValue, duration = 1000) {
    const obj = document.getElementById(id);
    if (!obj) return;
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * endValue);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

function handleHeroSearch(e) {
    if (e.key === 'Enter') {
        const query = e.target.value.trim();
        if (query) {
            window.location.href = `explore.html?q=${encodeURIComponent(query)}`;
        }
    }
}

async function initSimpleLecturerGrid() {
    try {
        const res = await fetch(`${API_BASE}/giang-vien`);
        const data = await res.json();
        const container = document.getElementById('simpleLecturerGrid');
        if (!container || data.status !== 'ok') return;
        
        let gvList = data.data;
        if (!gvList || gvList.length === 0) {
            container.innerHTML = '<div style="grid-column: span 5; text-align: center; color: var(--text-muted);">Không có dữ liệu giảng viên.</div>';
            return;
        }
        
        // Lấy 10 giảng viên ngẫu nhiên hoặc 10 người đầu tiên cho lưới
        const displayList = gvList.slice(0, 10);
        
        const html = displayList.map(gv => {
            const name = String(gv.ho_va_ten || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
            
            // Thiết kế avatar có viền mỏng và đổ bóng nhẹ (như ảnh thiết kế)
            const img = gv.anh_dai_dien 
                ? `<img src="${String(gv.anh_dai_dien).replace(/"/g, '')}" alt="${name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">` 
                : `<div class="no-avatar" style="width: 80px; height: 80px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.08); color: white; font-size: 30px;"><i class="fas fa-user-tie"></i></div>`;
            
            // Chỉ hiển thị ảnh ở trên và Tên ở dưới, bỏ chức vụ (theo yêu cầu bao đóng giống thiết kế)
            return `
                <div class="simple-lecturer-card" onclick="showLecturerDetail(${Number(gv.id) || 0})" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 25px 15px; background: rgba(0,0,0,0.015); border-radius: 12px; cursor: pointer; transition: all 0.2s ease;">
                    ${img}
                    <div style="font-size: 14px; font-weight: 700; color: #334155; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; width: 100%;" title="${name}">${name}</div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
        
    } catch (e) {
        console.error("Lecturer grid load err:", e);
    }
}

async function initSimplePublicationGrid() {
    try {
        const res = await fetch(`${API_BASE}/cong-trinh`);
        const data = await res.json();
        const container = document.getElementById('simplePublicationGrid');
        if (!container || data.status !== 'ok') return;
        
        const list = data.data;
        if (!list || list.length === 0) {
            container.innerHTML = '<div style="grid-column: span 5; text-align: center; color: var(--text-muted);">Không có dữ liệu công trình.</div>';
            return;
        }
        
        const displayList = list.slice(0, 10);
        
        const html = displayList.map(item => {
            const title = String(item.ten_cong_trinh || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
            
            const icon = `<div class="no-avatar" style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.08); color: white; font-size: 30px;"><i class="fas fa-file-alt"></i></div>`;
            
            return `
                <div class="simple-lecturer-card" onclick="showPublicationDetail(${Number(item.id) || 0})" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 25px 15px; background: rgba(0,0,0,0.015); border-radius: 12px; cursor: pointer; transition: all 0.2s ease;">
                    ${icon}
                    <div style="font-size: 13px; font-weight: 700; color: #334155; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; width: 100%;" title="${title}">${title}</div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${item.nam_xuat_ban || ''}</div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
        
    } catch (e) {
        console.error("Publication grid load err:", e);
    }
}

async function initSimpleProjectGrid() {
    try {
        const res = await fetch(`${API_BASE}/de-tai`);
        const data = await res.json();
        const container = document.getElementById('simpleProjectGrid');
        if (!container || data.status !== 'ok') return;
        
        const list = data.data;
        if (!list || list.length === 0) {
            container.innerHTML = '<div style="grid-column: span 5; text-align: center; color: var(--text-muted);">Không có dữ liệu đề tài.</div>';
            return;
        }
        
        const displayList = list.slice(0, 10);
        
        const html = displayList.map(item => {
            const title = String(item.ten_de_tai || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
            
            const icon = `<div class="no-avatar" style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.08); color: white; font-size: 30px;"><i class="fas fa-flask"></i></div>`;
            
            return `
                <div class="simple-lecturer-card" onclick="showProjectDetail(${Number(item.id) || 0})" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 25px 15px; background: rgba(0,0,0,0.015); border-radius: 12px; cursor: pointer; transition: all 0.2s ease;">
                    ${icon}
                    <div style="font-size: 13px; font-weight: 700; color: #334155; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; width: 100%;" title="${title}">${title}</div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${item.cap_de_tai || 'Đề tài'}</div>
                </div>
            `;
        }).join('');
        
        container.innerHTML = html;
        
    } catch (e) {
        console.error("Project grid load err:", e);
    }
}

function renderTopLecturers(lecturers, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!lecturers || lecturers.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); padding: 20px; text-align: center;">Chưa có dữ liệu thống kê.</p>';
        return;
    }

    const maxCount = Math.max(...lecturers.map(gv => gv.so_cong_trinh || 0)) || 1;

    container.innerHTML = lecturers.map((gv, i) => {
        let rankBadge = `<div style="width:28px; height:28px; border-radius:50%; background:rgba(0,0,0,0.05); display:flex; align-items:center; justify-content:center; font-weight:700; font-size:12px; color:var(--text-secondary); flex-shrink:0;">${i + 1}</div>`;
        
        if (i === 0) rankBadge = `<div class="medal-icon medal-1" style="font-size: 22px; width:28px; text-align:center; flex-shrink:0;"><i class="fas fa-crown" style="filter: drop-shadow(0 2px 4px rgba(255, 215, 0, 0.4));"></i></div>`;
        else if (i === 1) rankBadge = `<div class="medal-icon medal-2" style="font-size: 22px; width:28px; text-align:center; flex-shrink:0;"><i class="fas fa-medal" style="filter: drop-shadow(0 2px 4px rgba(192, 192, 192, 0.4));"></i></div>`;
        else if (i === 2) rankBadge = `<div class="medal-icon medal-3" style="font-size: 22px; width:28px; text-align:center; flex-shrink:0;"><i class="fas fa-medal" style="filter: drop-shadow(0 2px 4px rgba(205, 127, 50, 0.4));"></i></div>`;

        const currentCount = Number(gv.so_cong_trinh) || 0;
        const percent = Math.min(100, Math.max(5, Math.round((currentCount / maxCount) * 100)));

        return `
            <div style="cursor: pointer; padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,0.04); transition: all 0.3s ease; position: relative; overflow: hidden;" onmouseover="this.style.backgroundColor='rgba(59, 130, 246, 0.04)'; this.style.transform='translateX(4px)';" onmouseout="this.style.backgroundColor='transparent'; this.style.transform='translateX(0)';" onclick="showLecturerDetail(${Number(gv.id) || 0})">
                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 8px; width: 100%;">
                    ${rankBadge}
                    
                    <div class="rank-info" style="flex: 1; min-width: 0;">
                        <div class="rank-name" style="font-weight: 600; color: var(--text-primary); font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${String(gv.ten || '').replace(/"/g, '&quot;')}">${String(gv.ten || 'Chưa rõ').replace(/</g, '&lt;')}</div>
                        <div class="rank-count" style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                            <span style="font-weight:700; color:var(--accent-blue);">${currentCount}</span> công trình
                        </div>
                    </div>
                </div>
                
                <div style="padding-left: 43px;">
                    <div class="rank-progress-bar" style="height: 6px; background: rgba(0,0,0,0.05); border-radius: 3px; overflow: hidden;">
                        <div class="rank-progress-fill" style="height: 100%; width: ${percent}%; background: ${i === 0 ? 'var(--gradient-primary)' : (i === 1 ? 'linear-gradient(135deg, #9ca3af, #d1d5db)' : (i === 2 ? '#f59e0b' : 'var(--gradient-primary)'))}; border-radius: 3px; transition: width 1s ease-in-out;"></div>
                    </div>
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
                if (node.group === 'GiangVien' && node.id !== undefined) {
                    showLecturerDetail(node.id);
                } else if (node.group === 'CongTrinhNghienCuu' && node.id !== undefined) {
                    showPublicationDetail(node.id);
                } else if (node.group === 'DeTaiNghienCuu' && node.id !== undefined) {
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

function renderLegend(legendConfig, containerId = 'graphLegend') {
    const container = document.getElementById(containerId);
    if (!container) return;
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
let currentSearchType = 'all';

function initExploreGraph() {
    loadKnowledgeGraphForExplore();
    
    // Phím Enter cho ô Search
    const searchInput = document.getElementById('exploreSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
                hideSuggestions();
            }
        });

        // Real-time suggestions
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.trim();
            performLiveSearch(query);
        }, 300));

        // Close search results on click outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                hideSuggestions();
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
    
    // Khởi tạo các gợi ý tìm kiếm ngẫu nhiên
    renderRandomSuggestions();
}

const searchSuggestionPool = [
    { type: 'giang_vien', text: 'Giảng viên', icon: 'fa-user-tie', queries: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Trưởng khoa', 'Tiến sĩ', 'Phó Giáo sư', 'Khoa CNTT'] },
    { type: 'linh_vuc', text: 'Lĩnh vực', icon: 'fa-microscope', queries: ['Trí tuệ nhân tạo', 'Học máy', 'Khai phá dữ liệu', 'Thị giác máy tính', 'Mạng máy tính', 'Phần mềm', 'IoT'] },
    { type: 'cong_trinh', text: 'Công trình', icon: 'fa-file-alt', queries: ['Hệ thống', 'Mô hình', 'Ứng dụng', 'Nghiên cứu', 'Phân tích', 'Xây dựng', 'Giải pháp'] },
    { type: 'de_tai', text: 'Đề tài', icon: 'fa-flask', queries: ['Cấp Bộ', 'Cấp Cơ sở', 'Nafosted', 'Cấp Nhà nước', 'Tỉnh', 'Nghiên cứu khoa học'] }
];

function renderRandomSuggestions() {
    const container = document.getElementById('dynamicSuggestions');
    if (!container) return;
    
    let html = '';
    searchSuggestionPool.forEach(category => {
        const randomQuery = category.queries[Math.floor(Math.random() * category.queries.length)];
        html += `<button class="suggestion-tag" onclick="setSearchQuery('${randomQuery}')">
                    <i class="fas ${category.icon}"></i> ${category.text}: ${randomQuery}
                 </button>`;
    });
    
    container.innerHTML = html;
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

    console.log('[Search] Searching for:', query, 'with type:', currentSearchType);

    try {
        const url = `${API_BASE}/search?q=${encodeURIComponent(query)}&type=${currentSearchType}`;
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

function setSearchQuery(query) {
    const searchEl = document.getElementById('exploreSearch');
    if (searchEl) {
        searchEl.value = query;
        performSearch();
        hideSuggestions();
    }
}

function setSearchFilter(type, el) {
    currentSearchType = type;
    
    // Cập nhật UI: highlight nút active
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (el) el.classList.add('active');
    
    // Nếu đang có từ khóa tìm kiếm, thực hiện tìm lại ngay lập tức
    const query = document.getElementById('exploreSearch').value.trim();
    if (query) {
        performSearch();
    }
}

// --- Real-time Search Logic ---

function debounce(func, timeout = 300) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

async function performLiveSearch(query) {
    const suggestionsEl = document.getElementById('exploreSuggestions');
    if (!suggestionsEl) return;

    if (!query || query.length < 2) {
        hideSuggestions();
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}&type=${currentSearchType}`);
        const data = await res.json();

        if (data.status === 'ok' && data.data.length > 0) {
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

            suggestionsEl.innerHTML = data.data.slice(0, 8).map(item => {
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
                    <div class="suggestion-item" onclick="${clickAction}; hideSuggestions();">
                        <i class="fas ${icon}"></i>
                        <div class="suggestion-info">
                            <span class="suggestion-name">${name}</span>
                            <span class="suggestion-type">${typeName}</span>
                        </div>
                    </div>
                `;
            }).join('');
            suggestionsEl.style.display = 'block';
        } else {
            suggestionsEl.innerHTML = '<div class="suggestion-empty">Không tìm thấy kết quả phù hợp.</div>';
            suggestionsEl.style.display = 'block';
        }
    } catch (err) {
        console.error('Live search error:', err);
    }
}

function hideSuggestions() {
    const suggestionsEl = document.getElementById('exploreSuggestions');
    if (suggestionsEl) suggestionsEl.style.display = 'none';
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
            
            const linhVucHtml = (gv.linh_vuc && gv.linh_vuc.length > 0)
                ? gv.linh_vuc.map(lv => `<span style="display:inline-block;padding:3px 10px;background:rgba(26,188,156,0.12);color:#1ABC9C;border-radius:12px;font-size:12px;font-weight:600;margin:2px 4px 2px 0;">${lv}</span>`).join('')
                : '<b style="color:var(--text-muted);">N/A</b>';

            let fieldsHtml = `
                <div><span style="color:var(--text-muted);font-size:12px;">Học vị</span><br><b>${gv.hoc_vi || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Chức danh</span><br><b>${gv.chuc_danh || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Bộ môn</span><br><b>${gv.bo_mon || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Email</span><br><b>${gv.email || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Điện thoại</span><br><b>${gv.dien_thoai || 'N/A'}</b></div>
                <div style="grid-column: 1 / -1;"><span style="color:var(--text-muted);font-size:12px;">Lĩnh vực nghiên cứu</span><br>${linhVucHtml}</div>
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
                if (dataGraph.legend) renderLegend(dataGraph.legend, 'detailGraphLegend');
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
                if (dataGraph.legend) renderLegend(dataGraph.legend, 'detailGraphLegend');
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
                if (dataGraph.legend) renderLegend(dataGraph.legend, 'detailGraphLegend');
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
