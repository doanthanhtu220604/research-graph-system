/* ============================================================
   KNOWLEDGE MAP - Main Application JavaScript
   ============================================================ */

const API_BASE = '/api';
let dashboardGraph = null;
let exploreGraph = null;
let chartTrend = null;
let chartLevel = null;
let chartDept = null;

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
    
    // Load Mini Graph Preview
    loadKnowledgeGraph();
}

function performHeroSearch() {
    const input = document.getElementById('heroSearchInput');
    if (input) {
        const query = input.value.trim();
        if (query) {
            window.location.href = `explore.html?q=${encodeURIComponent(query)}`;
        }
    }
}

function handleHeroSearch(e) {
    if (e.key === 'Enter') {
        performHeroSearch();
    }
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
                <div class="simple-lecturer-card" onclick="showLecturerDetail('${gv.id}')" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 25px 15px; background: rgba(0,0,0,0.015); border-radius: 12px; cursor: pointer; transition: all 0.2s ease;">
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
                <div class="simple-lecturer-card" onclick="showPublicationDetail('${item.id}')" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 25px 15px; background: rgba(0,0,0,0.015); border-radius: 12px; cursor: pointer; transition: all 0.2s ease;">
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
                <div class="simple-lecturer-card" onclick="showProjectDetail('${item.id}')" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 25px 15px; background: rgba(0,0,0,0.015); border-radius: 12px; cursor: pointer; transition: all 0.2s ease;">
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
            <div style="cursor: pointer; padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,0.04); transition: all 0.3s ease; position: relative; overflow: hidden;" onmouseover="this.style.backgroundColor='rgba(59, 130, 246, 0.04)'; this.style.transform='translateX(4px)';" onmouseout="this.style.backgroundColor='transparent'; this.style.transform='translateX(0)';" onclick="showLecturerDetail('${gv.id || 0}')">
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
                        <div class="rank-progress-fill" style="height: 100%; width: ${percent}%; background: var(--gradient-primary); border-radius: 3px; transition: width 1s ease-in-out;"></div>
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

// ============================================================
// GRAPH DOWNLOAD UTILITY
// ============================================================

/**
 * Xuất đồ thị Vis.js đang hiển thị thành file ảnh PNG.
 * @param {vis.Network} network  - Đối tượng Network của Vis.js
 * @param {string}      filename - Tên file tải về (không cần đuôi .png)
 */
function downloadGraphImage(network, filename = 'knowledge_graph') {
    // 1. Lấy canvas gốc mà Vis.js vẽ lên
    const originalCanvas = network.canvas.frame.canvas;

    // 2. Tạo canvas tạm để đổ nền trắng trước khi ghép ảnh
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width  = originalCanvas.width;
    tempCanvas.height = originalCanvas.height;
    const ctx = tempCanvas.getContext('2d');

    // 3. Tô màu nền trắng sạch
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // 4. Vẽ đồ thị lên trên lớp nền
    ctx.drawImage(originalCanvas, 0, 0);

    // 5. Chuyển thành URL base64 và kích hoạt tải về
    const dataURL = tempCanvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href     = dataURL;
    link.download = filename + '.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Tạo và nhúng nút "Tải ảnh đồ thị" vào trong container.
 * Nút sẽ hiện ra khi user hover vào khung đồ thị.
 * @param {HTMLElement}  container - Phần tử cha chứa canvas
 * @param {vis.Network}  network   - Đối tượng Network của Vis.js
 * @param {string}       filename  - Tên file tải về
 */
function injectDownloadButton(container, network, filename) {
    // Xóa nút cũ nếu đã tồn tại (tránh duplicate khi render lại)
    const existing = container.querySelector('.graph-download-btn');
    if (existing) existing.remove();

    // Đảm bảo container có position: relative để nút định vị tuyệt đối được
    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }

    const btn = document.createElement('button');
    btn.className = 'graph-download-btn';
    btn.title = 'Tải ảnh đồ thị về máy';
    btn.innerHTML = '<i class="fas fa-camera"></i> Tải ảnh';

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Hiệu ứng phản hồi
        btn.classList.add('downloading');
        btn.innerHTML = '<i class="fas fa-check"></i> Đã tải!';
        downloadGraphImage(network, filename);
        setTimeout(() => {
            btn.classList.remove('downloading');
            btn.innerHTML = '<i class="fas fa-camera"></i> Tải ảnh';
        }, 2000);
    });

    container.appendChild(btn);
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

    // Nhúng nút tải ảnh vào sau khi đồ thị đã ổn định
    network.once('stabilized', () => {
        // Đặt tên file theo containerId để phân biệt đồ thị
        const filenameMap = {
            'knowledge-graph':        'tong_quan_do_thi',
            'explore-graph':          'kham_pha_do_thi',
            'detail-graph-container': 'chi_tiet_do_thi',
            'chat-graph-container':   'chatbot_do_thi',
        };
        const filename = filenameMap[containerId] || ('do_thi_' + containerId);
        injectDownloadButton(container, network, filename);
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
        'ma_gv': 'Mã GV', 'trang_thai_cong_tac': 'Trạng thái', 'ho_va_ten': 'Họ tên', 'hoc_vi': 'Học vị', 'chuc_danh': 'Chức danh',
        'ten_cong_trinh': 'Tên công trình', 'nam_xuat_ban': 'Năm XB',
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
                if (label === 'GiangVien' && item.id) clickAction = `showLecturerDetail('${item.id}')`;
                else if (label === 'CongTrinhNghienCuu' && item.id) clickAction = `showPublicationDetail('${item.id}')`;
                else if (label === 'DeTaiNghienCuu' && item.id) clickAction = `showProjectDetail('${item.id}')`;

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
                if (label === 'GiangVien' && item.id) clickAction = `showLecturerDetail('${item.id}')`;
                else if (label === 'CongTrinhNghienCuu' && item.id) clickAction = `showPublicationDetail('${item.id}')`;
                else if (label === 'DeTaiNghienCuu' && item.id) clickAction = `showProjectDetail('${item.id}')`;

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

// Global data cache for filtering
let _allLecturers = [];
let _filteredLecturers = [];
let _currentLecturerPage = 1;
const LECTURERS_PER_PAGE = 10;
let _allPublications = [];
let _allProjects = [];

async function loadLecturers() {
    try {
        const res = await fetch(`${API_BASE}/giang-vien`);
        const data = await res.json();
        if (data.status === 'ok') {
            _allLecturers = data.data;
            _filteredLecturers = [..._allLecturers];
            renderLecturerPage(1);
        }
    } catch (err) {
        console.error('Lecturers error:', err);
        const g = document.getElementById('lecturersGrid');
        if (g) g.innerHTML = '<div class="list-empty"><i class="fas fa-exclamation-triangle"></i>Lỗi tải dữ liệu</div>';
    }
}

function getInitials(name) {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts[parts.length - 1].charAt(0).toUpperCase();
}

function getDegreeColor(hocVi) {
    if (!hocVi) return 'badge-gray';
    if (hocVi.includes('Giáo sư')) return 'badge-red';
    if (hocVi.includes('Tiến sĩ')) return 'badge-blue';
    if (hocVi.includes('Thạc sĩ')) return 'badge-green';
    return 'badge-gray';
}

function renderLecturerPage(page) {
    _currentLecturerPage = page;
    const limit = LECTURERS_PER_PAGE;
    const total = _filteredLecturers.length;
    const totalPages = Math.ceil(total / limit);
    
    if (_currentLecturerPage < 1) _currentLecturerPage = 1;
    if (_currentLecturerPage > totalPages && totalPages > 0) _currentLecturerPage = totalPages;
    
    const start = (_currentLecturerPage - 1) * limit;
    const end = start + limit;
    const listToRender = _filteredLecturers.slice(start, end);
    
    const countEl = document.getElementById('lecturerCount');
    if (countEl) countEl.textContent = `${total} giảng viên`;

    const container = document.getElementById('lecturersGrid');
    if (!container) return;
    
    if (total === 0) {
        container.innerHTML = '<div class="list-empty" style="grid-column:1/-1"><i class="fas fa-user-slash"></i>Không tìm thấy giảng viên phù hợp</div>';
        renderLecturerPagination(0, 1);
        return;
    }
    
    container.innerHTML = listToRender.map(gv => {
        const name = String(gv.ho_va_ten || 'N/A').replace(/</g, '&lt;');
        const avatarHtml = gv.anh_dai_dien
            ? `<img src="${String(gv.anh_dai_dien).replace(/"/g, '')}" alt="${name}">`
            : `<span class="avatar-initials">${getInitials(gv.ho_va_ten)}</span>`;
        const degreeCls = getDegreeColor(gv.hoc_vi);
        const deptShort = (gv.bo_mon || '').replace('Bộ môn ', '');
        return `
            <div class="profile-card" onclick="showLecturerDetail('${gv.id}')">
                <div class="profile-avatar">${avatarHtml}</div>
                <div class="profile-name" title="${name}">${name}</div>
                <div class="profile-dept">${deptShort || '&mdash;'}</div>
                <div class="profile-badges">
                    ${gv.hoc_vi ? `<span class="badge ${degreeCls}">${gv.hoc_vi}</span>` : ''}
                    ${gv.trang_thai_cong_tac && gv.trang_thai_cong_tac !== 'Đang công tác' ? `<span class="badge badge-gray">${gv.trang_thai_cong_tac}</span>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    renderLecturerPagination(totalPages, _currentLecturerPage);
}

function renderLecturerPagination(totalPages, currentPage) {
    const container = document.getElementById('lecturersPagination');
    if (!container) return;
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '<div class="pagination">';
    
    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="renderLecturerPage(${currentPage - 1})" title="Trang trước"><i class="fas fa-chevron-left"></i></button>`;
    } else {
        html += `<button class="page-btn disabled" disabled><i class="fas fa-chevron-left"></i></button>`;
    }
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="page-btn active">${i}</button>`;
        } else {
            html += `<button class="page-btn" onclick="renderLecturerPage(${i})">${i}</button>`;
        }
    }
    
    if (currentPage < totalPages) {
        html += `<button class="page-btn" onclick="renderLecturerPage(${currentPage + 1})" title="Trang sau"><i class="fas fa-chevron-right"></i></button>`;
    } else {
        html += `<button class="page-btn disabled" disabled><i class="fas fa-chevron-right"></i></button>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function filterUserLecturers() {
    const q = (document.getElementById('lecturerSearchInput')?.value || '').toLowerCase();
    const dept = document.getElementById('lecturerDeptFilter')?.value || '';
    const degree = document.getElementById('lecturerDegreeFilter')?.value || '';
    _filteredLecturers = _allLecturers.filter(gv => {
        const matchQ = (gv.ho_va_ten || '').toLowerCase().includes(q);
        const matchDept = !dept || (gv.bo_mon === dept);
        const matchDeg = !degree || ((gv.hoc_vi || '').includes(degree));
        return matchQ && matchDept && matchDeg;
    });
    renderLecturerPage(1);
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
                <div><span style="color:var(--text-muted);font-size:12px;">Chức vụ</span><br><b>${gv.chuc_vu || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Chuyên ngành</span><br><b>${gv.chuyen_nganh || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Bộ môn</span><br><b>${gv.bo_mon || 'N/A'}</b></div>
                <div><span style="color:var(--text-muted);font-size:12px;">Trạng thái</span><br><b>${gv.trang_thai_cong_tac || 'Đang công tác'}</b></div>
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
                        ${gv.cong_trinh.map(item => {
                            const ct = item.ten_cong_trinh ? item : (item.cong_trinh || item);
                            const vt = item.vai_tro;
                            let roleLabel = '';
                            if (vt === 'TAC_GIA_CHINH') roleLabel = ' <span style="color:var(--accent-blue); font-size:11px; font-weight:600;">(Tác giả chính)</span>';
                            else if (vt === 'CONG_SU' || vt === 'LA_TAC_GIA_CUA') roleLabel = ' <span style="color:#10b981; font-size:11px; font-weight:600;">(Cộng sự)</span>';

                            return `
                                <div style="padding: 10px; background: rgba(0,0,0,0.02); margin-bottom: 8px; border-radius: 6px; border-left: 3px solid var(--accent-blue); cursor: pointer;" onclick="showPublicationDetail('${ct.id}')">
                                    <strong>${ct.ten_cong_trinh || 'N/A'}</strong>
                                    ${ct.nam_xuat_ban ? `<span style="color: var(--text-muted); font-size: 12px;"> (${ct.nam_xuat_ban})</span>` : ''}
                                    <div style="margin-top:4px;">${roleLabel}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }

            if (gv.de_tai && gv.de_tai.length > 0) {
                bodyHtml += `
                    <div>
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: var(--accent-orange);"><i class="fas fa-flask"></i> Đề tài nghiên cứu (${gv.de_tai.length})</h3>
                        ${gv.de_tai.map(dt => {
                            const item = dt.ten_de_tai ? dt : (dt.de_tai || dt);
                            const tenDeTai = item.ten_de_tai || 'N/A';
                            const capDeTai = item.cap_de_tai || 'Chưa xác định';
                            const dtId = item.id;
                            return `
                                <div style="padding: 10px; background: rgba(0,0,0,0.02); margin-bottom: 8px; border-radius: 6px; border-left: 3px solid var(--accent-orange); cursor: pointer;" ${dtId ? `onclick="showProjectDetail('${dtId}')"` : ''}>
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
            
            // Add Scholar container placeholder
            bodyHtml = `
                <div id="scholarStatsContainer" style="margin-bottom: 20px;">
                    <div style="padding: 15px; background: rgba(66, 133, 244, 0.05); border-radius: 8px; border-left: 4px solid #4285F4; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-spinner fa-spin" style="color: #4285F4;"></i>
                        <span style="font-size: 13px; color: var(--text-secondary);">Đang trích xuất dữ liệu Google Scholar...</span>
                    </div>
                </div>
            ` + bodyHtml;

            document.getElementById('detailBodyContent').innerHTML = bodyHtml;
            
            // Trigger background load for Scholar
            if (gv.ho_va_ten) {
                loadScholarStats(gv.ho_va_ten, 'scholarStatsContainer');
            }

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
            document.getElementById('detailSubtitle').textContent = 'Công trình';
            
            const iconEl = document.getElementById('detailIcon');
            iconEl.innerHTML = '<i class="fas fa-file-alt" style="color: #10b981;"></i>';
            iconEl.style.background = 'rgba(16, 185, 129, 0.1)';
            
            let fieldsHtml = `
                <div><span style="color:var(--text-muted);font-size:12px;">Năm xuất bản</span><br><b>${ct.nam_xuat_ban || 'N/A'}</b></div>
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
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: var(--accent-blue);"><i class="fas fa-users"></i> Nhóm tác giả (trong trường)</h3>
                        <div style="display:flex; flex-wrap:wrap; gap:10px;">
                            ${ct.tac_gia.map(tg => {
                                let roleText = '';
                                let roleColor = 'rgba(79, 142, 247, 0.1)';
                                let textColor = 'var(--accent-blue)';
                                
                                if (tg.vai_tro === 'TAC_GIA_CHINH') {
                                    roleText = ' <small style="opacity:0.8;">(Tác giả chính)</small>';
                                    roleColor = 'rgba(79, 142, 247, 0.15)';
                                } else if (tg.vai_tro === 'CONG_SU' || tg.vai_tro === 'LA_TAC_GIA_CUA') {
                                    roleText = ' <small style="opacity:0.8;">(Cộng sự)</small>';
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
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: #8b5cf6;"><i class="fas fa-user-plus"></i> Tác giả ngoài trường (${ct.tac_gia_ngoai.length})</h3>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            ${ct.tac_gia_ngoai.map(tg => `
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
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: var(--accent-blue);"><i class="fas fa-users"></i> Thành viên tham gia (trong trường)</h3>
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
                        <h3 style="font-size: 15px; margin-bottom: 12px; color: #8b5cf6;"><i class="fas fa-user-plus"></i> Tác giả ngoài trường (${dt.tac_gia_ngoai.length})</h3>
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

// ============================================================
// PUBLICATIONS PAGE
// ============================================================

async function loadPublications() {
    try {
        const res = await fetch(`${API_BASE}/cong-trinh`);
        const data = await res.json();
        if (data.status === 'ok') {
            _allPublications = data.data;
            // Dynamically fill year filter, enforcing Number to avoid string/int duplicates
            const years = [...new Set(data.data.map(ct => Number(ct.nam_xuat_ban)).filter(y => !isNaN(y) && y > 0))].sort((a,b) => b - a);
            const ysel = document.getElementById('pubYearFilter');
            if (ysel) {
                const existing = new Set([...ysel.options].map(o => o.value));
                years.forEach(y => { if (!existing.has(String(y))) { const o = document.createElement('option'); o.value = y; o.textContent = y; ysel.appendChild(o); } });
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
        // Với API danh sách, tac_gia vẫn là mảng string tên
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
        const matchQ = title.includes(q);
        const matchYear = !year || (String(ct.nam_xuat_ban) === year);
        return matchQ && matchYear;
    });
    renderPublicationRows(filtered);
}

// ============================================================
// PROJECTS PAGE
// ============================================================

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

function getLevelBadge(cap) {
    if (!cap) return '<span class="badge badge-gray">Chưa xác định</span>';
    if (cap.includes('Nhà nước')) return `<span class="badge badge-red">${cap}</span>`;
    if (cap.includes('Bộ')) return `<span class="badge badge-orange">${cap}</span>`;
    if (cap.includes('Tỉnh')) return `<span class="badge badge-purple">${cap}</span>`;
    if (cap.includes('Trường') || cap.includes('Cơ sở')) return `<span class="badge badge-blue">${cap}</span>`;
    if (cap.includes('Doanh')) return `<span class="badge badge-teal">${cap}</span>`;
    return `<span class="badge badge-gray">${cap}</span>`;
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
        const matchQ = title.includes(q);
        const matchLevel = !level || (dt.cap_de_tai === level);
        return matchQ && matchLevel;
    });
    renderProjectRows(filtered);
}

// ─── Statistics functions ───

async function loadStatistics() {
    try {
        const res = await fetch(`${API_BASE}/stats/overview`);
        const data = await res.json();

        if (data.status !== 'ok') return;

        // ── 1. Animate Stat Cards ──────────────────────────────────────────────
        animateStatCard('statCountGV', data.stats.giang_vien);
        animateStatCard('statCountCT', data.stats.cong_trinh);
        animateStatCard('statCountDT', data.stats.de_tai);
        animateStatCard('statCountBM', data.stats.bo_mon);

        // ── 2. Render ongoing activities ───────────────────────────────────────
        renderOngoingActivities(
            data.de_tai_dang_thuc_hien || [],
            data.cong_trinh_moi || []
        );

        // ── 3. Render Leaderboard ──────────────────────────────────────────────
        renderStatsLeaderboard(data.top_giang_vien || []);

        // ── 4. Render Charts ──────────────────────────────────────────────────
        renderCharts(data);

    } catch (err) {
        console.error('Statistics error:', err);
    }
}


function animateStatCard(id, endValue, duration = 1200) {
    const el = document.getElementById(id);
    if (!el) return;
    let start = null;
    const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        // easeOutExpo
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        el.textContent = Math.floor(eased * endValue);
        if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

function renderStatsLeaderboard(lecturers) {
    const podiumContainer = document.getElementById('statsPodium');
    const listContainer = document.getElementById('statsRankList');
    if (!podiumContainer || !listContainer) return;

    if (!lecturers || lecturers.length === 0) {
        podiumContainer.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-muted);">Không có dữ liệu giảng viên.</div>';
        listContainer.innerHTML = '';
        return;
    }

    // Tách Top 3 (Podium) và phần còn lại
    const top3 = lecturers.slice(0, 3);
    const others = lecturers.slice(3, 10);

    // Render Podium
    // Sắp xếp lại thứ tự hiển thị: 2 - 1 - 3
    const displayOrder = [1, 0, 2];
    podiumContainer.innerHTML = displayOrder.map(idx => {
        const gv = top3[idx];
        if (!gv) return '<div></div>';
        const rank = idx + 1;
        const medalIcon = rank === 1 ? 'fa-crown' : 'fa-medal';
        return `
            <div class="podium-card rank-${rank}" onclick="showLecturerDetail('${gv.id}')">
                <div class="podium-medal"><i class="fas ${medalIcon}"></i></div>
                <div class="podium-name">${gv.ten}</div>
                <div class="podium-count">${gv.so_cong_trinh}</div>
                <div class="podium-count-label">CÔNG TRÌNH</div>
            </div>
        `;
    }).join('');

    // Render List
    const maxCount = Math.max(...lecturers.map(l => l.so_cong_trinh)) || 1;
    listContainer.innerHTML = others.map((gv, i) => {
        const rank = i + 4;
        const percent = Math.round((gv.so_cong_trinh / maxCount) * 100);
        return `
            <div class="rank-list-item" onclick="showLecturerDetail('${gv.id}')">
                <div class="rank-num">${rank}</div>
                <div class="rank-info">
                    <div class="rank-name">${gv.ten}</div>
                </div>
                <div class="rank-bar-wrap">
                    <div class="rank-bar">
                        <div class="rank-bar-fill" style="width: ${percent}%"></div>
                    </div>
                    <div class="rank-count-badge">${gv.so_cong_trinh} bài</div>
                </div>
            </div>
        `;
    }).join('');
}

function renderCharts(data) {
    const ctxTrend = document.getElementById('chartTrend');
    const ctxLevel = document.getElementById('chartLevel');
    const ctxDept = document.getElementById('chartDept');

    // Hủy biểu đồ cũ nếu tồn tại
    if (chartTrend) chartTrend.destroy();
    if (chartLevel) chartLevel.destroy();
    if (chartDept) chartDept.destroy();

    // 1. Biểu đồ xu hướng (Công trình & Đề tài)
    if (ctxTrend) {
        const years = [...new Set([
            ...data.cong_trinh_theo_nam.map(d => d.nam),
            ...data.de_tai_theo_nam.map(d => d.nam)
        ])].sort((a, b) => a - b).filter(y => y > 2010);

        const ctData = years.map(y => data.cong_trinh_theo_nam.find(d => d.nam === y)?.so_luong || 0);
        const dtData = years.map(y => data.de_tai_theo_nam.find(d => d.nam === y)?.so_luong || 0);

        chartTrend = new Chart(ctxTrend, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Công trình',
                        data: ctData,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Đề tài',
                        data: dtData,
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }

    // 2. Biểu đồ cơ cấu đề tài theo cấp
    if (ctxLevel) {
        chartLevel = new Chart(ctxLevel, {
            type: 'doughnut',
            data: {
                labels: data.de_tai_theo_cap.map(d => d.cap || 'Chưa xác định'),
                datasets: [{
                    data: data.de_tai_theo_cap.map(d => d.so_luong),
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right' } }
            }
        });
    }


    // 4. Biểu đồ giảng viên theo bộ môn
    if (ctxDept) {
        chartDept = new Chart(ctxDept, {
            type: 'bar',
            data: {
                labels: data.giang_vien_theo_bo_mon.map(d => d.bo_mon.replace('Bộ môn ', '')),
                datasets: [{
                    label: 'Số lượng giảng viên',
                    data: data.giang_vien_theo_bo_mon.map(d => d.so_luong),
                    backgroundColor: 'rgba(59, 130, 246, 0.7)',
                    borderRadius: 6
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }
}

// ── Render danh sách hoạt động ─────────────────────────────────────────
function renderOngoingActivities(projects, publications) {
    // Panel: Đề tài đang thực hiện
    const projEl = document.getElementById('statsOngoingProjects');
    if (projEl) {
        if (!projects || projects.length === 0) {
            projEl.innerHTML = '<div class="list-empty"><i class="fas fa-inbox"></i>Không có đề tài đang thực hiện</div>';
        } else {
            projEl.innerHTML = projects.map(dt => {
                const title = String(dt.ten_de_tai || 'N/A').replace(/</g, '&lt;');
                const cap = dt.cap_de_tai || 'Chưa xác định';
                const nam = dt.nam_bat_dau ? `${dt.nam_bat_dau} – ${dt.nam_ket_thuc || 'nay'}` : '';
                const chu = dt.chu_nhiem ? `<i class="fas fa-user"></i> ${dt.chu_nhiem}` : '';
                return `
                    <div class="activity-item" onclick="showProjectDetail('${dt.id || ''}')">
                        <div class="activity-item-icon activity-icon-project">
                            <i class="fas fa-flask"></i>
                        </div>
                        <div class="activity-item-body">
                            <div class="activity-item-title" title="${title}">${title}</div>
                            <div class="activity-item-meta">
                                <span class="badge-ongoing">Đang thực hiện</span>
                                ${cap ? `<span>${cap}</span>` : ''}
                                ${nam ? `<span><i class="fas fa-calendar"></i> ${nam}</span>` : ''}
                                ${chu ? `<span>${chu}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // Panel: Công trình mới
    const pubEl = document.getElementById('statsRecentPublications');
    if (pubEl) {
        if (!publications || publications.length === 0) {
            pubEl.innerHTML = '<div class="list-empty"><i class="fas fa-inbox"></i>Không có dữ liệu</div>';
        } else {
            pubEl.innerHTML = publications.map(ct => {
                const title = String(ct.ten_cong_trinh || 'N/A').replace(/</g, '&lt;');
                const authors = (ct.tac_gia || []).slice(0, 2).join(', ');
                const extra = (ct.tac_gia || []).length > 2 ? ` +${(ct.tac_gia || []).length - 2}` : '';
                return `
                    <div class="activity-item" onclick="showPublicationDetail('${ct.id || ''}')">
                        <div class="activity-item-icon activity-icon-pub">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="activity-item-body">
                            <div class="activity-item-title" title="${title}">${title}</div>
                            <div class="activity-item-meta">
                                ${ct.nam_xuat_ban ? `<span class="badge-new-pub">${ct.nam_xuat_ban}</span>` : ''}
                                ${authors ? `<span><i class="fas fa-user"></i> ${authors}${extra}</span>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
}

// ── Switch tab giữa Đề tài và Công trình ────────────────────────────────
function switchActivityTab(tab) {
    const panels = { projects: 'panelProjects', publications: 'panelPublications' };
    const tabs   = { projects: 'tabProjects',   publications: 'tabPublications' };

    Object.keys(panels).forEach(key => {
        const panel = document.getElementById(panels[key]);
        const btn   = document.getElementById(tabs[key]);
        if (panel) panel.classList.toggle('active', key === tab);
        if (btn)   btn.classList.toggle('active', key === tab);
    });
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

// ============================================================
// GOOGLE SCHOLAR INTEGRATION
// ============================================================

async function loadScholarStats(name, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    try {
        const res = await fetch(`${API_BASE}/scholar/${encodeURIComponent(name)}`);
        const data = await res.json();
        if (data.status === 'ok') {
            const stats = data.data;
            container.innerHTML = `
                <div style="margin-bottom: 20px;">
                    <h3 style="font-size: 15px; margin-bottom: 12px; color: #4285F4;"><i class="fab fa-google"></i> Google Scholar Metrics</h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        <div style="background: rgba(66, 133, 244, 0.05); border: 1px solid rgba(66, 133, 244, 0.2); border-radius: 8px; padding: 12px; text-align: center;">
                            <div style="font-size: 22px; font-weight: 800; color: #4285F4;">${stats.publications_count}</div>
                            <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Bài báo</div>
                        </div>
                        <div style="background: rgba(66, 133, 244, 0.05); border: 1px solid rgba(66, 133, 244, 0.2); border-radius: 8px; padding: 12px; text-align: center;">
                            <div style="font-size: 22px; font-weight: 800; color: #4285F4;">${stats.citedby}</div>
                            <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">Trích dẫn</div>
                        </div>
                        <div style="background: rgba(66, 133, 244, 0.05); border: 1px solid rgba(66, 133, 244, 0.2); border-radius: 8px; padding: 12px; text-align: center;">
                            <div style="font-size: 22px; font-weight: 800; color: #4285F4;">${stats.hindex}</div>
                            <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase;">H-index</div>
                        </div>
                    </div>
                    ${stats.scholar_url ? `<div style="margin-top: 10px; text-align: right;"><a href="${stats.scholar_url}" target="_blank" rel="noopener noreferrer" style="font-size: 12px; color: #4285F4; font-weight: 600; text-decoration: none;"><i class="fas fa-external-link-alt"></i> Xem hồ sơ Scholar</a></div>` : ''}
                </div>
            `;
        } else {
            container.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); font-style: italic; margin-bottom: 20px;"><i class="fas fa-info-circle"></i> Google Scholar: ${data.message}</div>`;
        }
    } catch (e) {
        container.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); font-style: italic; margin-bottom: 20px;"><i class="fas fa-exclamation-triangle"></i> Lỗi kết nối API Google Scholar.</div>`;
    }
}

// ============================================================
// TRANSLATION LOGIC
// ============================================================

async function toggleTranslation(btn, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (btn.classList.contains('loading')) return;

    const originalText = container.getAttribute('data-original');
    
    if (container.getAttribute('data-translated') === 'true') {
        container.innerText = originalText;
        container.setAttribute('data-translated', 'false');
        btn.innerHTML = '<i class="fas fa-language"></i> Dịch tóm tắt';
        return;
    }

    try {
        btn.classList.add('loading');
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang dịch...';
        
        const isVi = detectVN(originalText);
        const langPair = isVi ? 'vi|en' : 'en|vi';
        
        const result = await translateText(originalText, langPair);
        
        if (result && result.success) {
            container.innerText = result.text;
            container.setAttribute('data-translated', 'true');
            btn.innerHTML = '<i class="fas fa-undo"></i> Xem bản gốc';
        } else {
            const msg = (result && result.message) ? result.message : 'Không thể dịch nội dung này vào lúc này.';
            alert(msg);
            btn.innerHTML = '<i class="fas fa-language"></i> Dịch tóm tắt';
        }
    } catch (error) {
        console.error('Translation error:', error);
        alert('Có lỗi xảy ra khi gọi API dịch.');
        btn.innerHTML = '<i class="fas fa-language"></i> Dịch tóm tắt';
    } finally {
        btn.classList.remove('loading');
    }
}

function detectVN(text) {
    const vnWords = ['và', 'của', 'là', 'trong', 'cho', 'với', 'các', 'những', 'được', 'về', 'một', 'đã', 'có'];
    const words = text.toLowerCase().split(/\s+/);
    return words.some(w => vnWords.includes(w));
}

async function translateText(text, langPair) {
    try {
        // Chuyển sang gọi backend API (sử dụng Gemini) để không bị giới hạn 500 ký tự
        const target = langPair.split('|')[1]; // 'vi' hoặc 'en'
        const response = await fetch(`${API_BASE}/translate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                text: text, 
                target_lang: target === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh' 
            })
        });
        const data = await response.json();
        
        if (data && data.status === 'ok' && data.translatedText) {
            return { success: true, text: data.translatedText };
        }
        return { success: false, message: data.message };
    } catch (err) {
        console.error('Translate API error:', err);
        return { success: false, message: 'Lỗi kết nối đến máy chủ dịch thuật.' };
    }
}
