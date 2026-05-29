/* ============================================================
   EXPLORE - Search page, live search, suggestions, explore graph
   ============================================================ */

let currentSearchType = 'all';

const searchSuggestionPool = [
    { type: 'giang_vien', text: 'Giảng viên', icon: 'fa-user-tie', queries: ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Trưởng khoa', 'Tiến sĩ', 'Phó Giáo sư', 'Khoa CNTT'] },
    { type: 'linh_vuc', text: 'Lĩnh vực', icon: 'fa-microscope', queries: ['Trí tuệ nhân tạo', 'Học máy', 'Khai phá dữ liệu', 'Thị giác máy tính', 'Mạng máy tính', 'Phần mềm', 'IoT'] },
    { type: 'cong_trinh', text: 'Công trình', icon: 'fa-file-alt', queries: ['Hệ thống', 'Mô hình', 'Ứng dụng', 'Nghiên cứu', 'Phân tích', 'Xây dựng', 'Giải pháp'] },
    { type: 'de_tai', text: 'Đề tài', icon: 'fa-flask', queries: ['Cấp Nhà nước', 'Cấp Bộ', 'Cấp Tỉnh/Thành phố', 'Cấp Trường', 'Đề tài Doanh nghiệp'] }
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
            renderGraph('explore-graph', data.nodes, data.edges, (network) => {
                exploreGraph = network;
            });
            if (data.legend) {
                renderLegend(data.legend, 'exploreGraphLegend');
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
        || item.ten_nhom || 'N/A';
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
