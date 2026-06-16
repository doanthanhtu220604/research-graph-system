/* ============================================================
   EXPLORE - Search page, live search, suggestions, explore graph
   ============================================================ */

let currentSearchType = 'all';
let originalExploreNodes = [];
let originalExploreEdges = [];
let exploreVisNodes = null;
let exploreVisEdges = null;

const searchSuggestionPool = [
    { type: 'giang_vien', text: 'Giảng viên', icon: 'fa-user-tie', queries: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Trưởng khoa', 'Tiến sĩ', 'Phó Giáo sư', 'Khoa CNTT'] },
    { type: 'linh_vuc', text: 'Lĩnh vực', icon: 'fa-microscope', queries: ['Trí tuệ nhân tạo', 'Học máy', 'Khai phá dữ liệu', 'Thị giác máy tính', 'Mạng máy tính', 'Phần mềm', 'IoT'] },
    { type: 'cong_trinh', text: 'Công trình', icon: 'fa-file-alt', queries: ['Hệ thống', 'Mô hình', 'Ứng dụng', 'Nghiên cứu', 'Phân tích', 'Xây dựng', 'Giải pháp'] },
    { type: 'de_tai', text: 'Đề tài', icon: 'fa-flask', queries: ['Nghiên cứu', 'Phát triển', 'Ứng dụng', 'Thiết kế', 'Xây dựng', 'Thử nghiệm', 'Hệ thống'] }
];

function initExploreGraph() {
    loadKnowledgeGraphForExplore();

    const searchInput = document.getElementById('exploreSearch');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
                hideSuggestions();
            }
        });

        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.trim();
            performLiveSearch(query);
        }, 300));

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                hideSuggestions();
            }
        });
    }

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

    renderRandomSuggestions();
}

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
            originalExploreNodes = data.nodes;
            originalExploreEdges = data.edges;

            renderGraph('explore-graph', data.nodes, data.edges, (network, visNodes, visEdges) => {
                exploreGraph = network;
                exploreVisNodes = visNodes;
                exploreVisEdges = visEdges;
            });
            if (data.legend) {
                renderLegend(data.legend, 'exploreGraphLegend');
                renderExploreGraphFilters(data.legend);
            }
        }
    } catch (err) {
        console.error('Explore graph error:', err);
    }
}

function focusNodeInExploreGraph(nodeId) {
    if (exploreGraph && nodeId) {
        exploreGraph.selectNodes([nodeId]);
        exploreGraph.focus(nodeId, {
            scale: 1.3,
            animation: { duration: 800, easingFunction: 'easeInOutQuad' }
        });
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
        const res = await fetch(url);
        const data = await res.json();

        const resultsContainer = document.getElementById('searchResults');
        const listContainer = document.getElementById('searchResultsList');

        if (data.status === 'ok' && data.data.length > 0) {
            resultsContainer.style.display = 'block';
            listContainer.innerHTML = data.data.map(item => _buildSearchResultItem(item)).join('');
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
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if (el) el.classList.add('active');
    const query = document.getElementById('exploreSearch').value.trim();
    if (query) {
        performSearch();
    }
}

// ── Shared label maps ────────────────────────────────────────────────────────

const _labelIcons = {
    'GiangVien': 'fa-user-tie',
    'CongTrinhNghienCuu': 'fa-file-alt',
    'DeTaiNghienCuu': 'fa-flask',
    'BoMon': 'fa-building',
    'Khoa': 'fa-university',
    'TacGiaNgoai': 'fa-user',
    'LinhVucNghienCuu': 'fa-tags',
    'NhomNghienCuu': 'fa-users',
};

const _labelNames = {
    'GiangVien': 'Giảng viên',
    'CongTrinhNghienCuu': 'Công trình',
    'DeTaiNghienCuu': 'Đề tài',
    'BoMon': 'Bộ môn',
    'Khoa': 'Khoa',
    'TacGiaNgoai': 'Tác giả ngoài',
    'LinhVucNghienCuu': 'Lĩnh vực',
    'NhomNghienCuu': 'Nhóm NC',
};

function _resolveItemName(item) {
    return item.ho_va_ten || item.ten_cong_trinh || item.ten_de_tai
        || item.ten_bo_mon || item.ten_khoa || item.ten_linh_vuc
        || item.ten_nhom || 'Chưa rõ';
}

function _resolveClickAction(label, item, name) {
    if (label === 'GiangVien' && item.id) return `showLecturerDetail('${item.id}');`;
    if (label === 'CongTrinhNghienCuu' && item.id) return `showPublicationDetail('${item.id}');`;
    if (label === 'DeTaiNghienCuu' && item.id) return `showProjectDetail('${item.id}');`;
    if (item.id) return `showGenericEntityDetail('${item.id}', '${label}', '${name.replace(/'/g, "\\'")}');`;
    return '';
}

function _buildSearchResultItem(item) {
    const label = item._labels[0];
    const icon = _labelIcons[label] || 'fa-circle';
    const typeName = _labelNames[label] || label;
    const name = _resolveItemName(item);
    const clickAction = _resolveClickAction(label, item, name);

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
}

// ── Real-time Search Logic ───────────────────────────────────────────────────

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
            suggestionsEl.innerHTML = data.data.slice(0, 8).map(item => {
                const label = item._labels[0];
                const icon = _labelIcons[label] || 'fa-circle';
                const typeName = _labelNames[label] || label;
                const name = _resolveItemName(item);
                const clickAction = _resolveClickAction(label, item, name);

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

function renderExploreGraphFilters(legendConfig) {
    const container = document.getElementById('exploreGraphFilters');
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

    let html = `<span style="font-size:12px; font-weight:700; color:var(--text-secondary); display:flex; align-items:center; gap:6px; margin-right:8px;"><i class="fas fa-filter" style="color:var(--accent-blue);"></i> Lọc đồ thị:</span>`;

    Object.entries(legendConfig).forEach(([key, cfg]) => {
        const label = labels[key] || key;
        html += `
            <label style="display:flex; align-items:center; gap:6px; font-size:12px; cursor:pointer; color:var(--text-primary); user-select:none; font-weight:600;">
                <input type="checkbox" value="${key}" checked onchange="filterExploreGraph()" style="cursor:pointer; accent-color:${cfg.color}; width:15px; height:15px;">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${cfg.color};"></span>
                ${label}
            </label>
        `;
    });

    container.innerHTML = html;
}

function filterExploreGraph() {
    if (!exploreGraph || !exploreVisNodes || !exploreVisEdges) return;

    // 1. Lấy danh sách các nhãn node đang được check
    const checkedCheckboxes = document.querySelectorAll('#exploreGraphFilters input[type="checkbox"]:checked');
    const activeTypes = Array.from(checkedCheckboxes).map(cb => cb.value);

    // 2. Lọc danh sách nodes
    const filteredNodes = originalExploreNodes.filter(node => activeTypes.includes(node.group));
    const filteredNodeIds = new Set(filteredNodes.map(node => node.id));

    // 3. Lọc danh sách edges (chỉ giữ quan hệ nối 2 node đang được hiển thị)
    const filteredEdges = originalExploreEdges.filter(edge => 
        filteredNodeIds.has(edge.from) && filteredNodeIds.has(edge.to)
    );

    // 4. Cập nhật vào Vis.js DataSet
    exploreVisNodes.clear();
    exploreVisNodes.add(filteredNodes.map(n => ({
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

    exploreVisEdges.clear();
    exploreVisEdges.add(filteredEdges.map(e => ({
        from: e.from,
        to: e.to,
        label: formatRelLabel(e.label),
        arrows: { to: { enabled: true, scaleFactor: 0.7 } },
        color: { color: 'rgba(0,0,0,0.2)', highlight: '#4F8EF7', hover: '#4F8EF7' },
        font: { color: '#636980', size: 9, face: 'Inter', strokeWidth: 0 },
        smooth: { type: 'continuous', roundness: 0.3 },
        width: 1.2,
    })));
}
