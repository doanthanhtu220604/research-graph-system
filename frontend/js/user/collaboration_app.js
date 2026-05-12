/**
 * Collaboration Network App
 * Phân tích và trực quan hóa mạng lưới hợp tác nghiên cứu giữa các giảng viên.
 */

const COLLAB_API = '/api/collaboration';
let collabNetwork = null;
let physicsEnabled = true;
let currentRankTab = 'connectors';

// ============================================================
// KHỞI TẠO
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    initCollaborationPage();
});

async function initCollaborationPage() {
    await Promise.all([
        loadOverviewStats(),
        loadBoMonFilter(),
        loadTopConnectors(),
        loadBridgeConnectors(),
        loadTopPairs(),
        loadCollaborationGraph(),
    ]);
}

// ============================================================
// 1. THỐNG KÊ TỔNG QUAN
// ============================================================

async function loadOverviewStats() {
    try {
        const res = await fetch(`${COLLAB_API}/overview`);
        const data = await res.json();
        if (data.status !== 'ok') return;

        const d = data.data;
        animateCount('ov-active', d.active_collaborators);
        animateCount('ov-pairs-ct', d.collab_pairs_ct);
        animateCount('ov-pairs-dt', d.collab_pairs_dt);
        animateCount('ov-max-authors', d.max_authors_in_paper);
    } catch (e) {
        console.error('Overview stats error:', e);
    }
}

function animateCount(elId, targetVal) {
    const el = document.getElementById(elId);
    if (!el) return;
    const duration = 800;
    const start = performance.now();
    const from = 0;

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(from + (targetVal - from) * eased);
        if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

// ============================================================
// 2. BỘ LỌC BỘ MÔN
// ============================================================

async function loadBoMonFilter() {
    try {
        const res = await fetch(`${COLLAB_API}/bo-mon`);
        const data = await res.json();
        if (data.status !== 'ok') return;

        const sel = document.getElementById('filterBoMon');
        data.data.forEach(bm => {
            const opt = document.createElement('option');
            opt.value = bm.ten;
            opt.textContent = `${bm.ten} (${bm.so_gv} GV)`;
            sel.appendChild(opt);
        });
    } catch (e) {
        console.error('BoMon filter error:', e);
    }
}

// ============================================================
// 3. TOP KẾT NỐI NHIỀU NHẤT (Degree Centrality)
// ============================================================

async function loadTopConnectors() {
    try {
        const res = await fetch(`${COLLAB_API}/top-connectors?limit=10`);
        const data = await res.json();
        const container = document.getElementById('tab-connectors');

        if (data.status !== 'ok' || !data.data.length) {
            container.innerHTML = '<div class="loading-block">Chưa có dữ liệu.</div>';
            return;
        }

        const maxDegree = Math.max(...data.data.map(d => d.tong_cong_su)) || 1;

        container.innerHTML = data.data.map((gv, i) => {
            const rankClass = i < 3 ? `top-${i + 1}` : '';
            const avatarHtml = gv.avatar
                ? `<img src="${gv.avatar}" class="rank-avatar" alt="${gv.ten}">`
                : `<div class="rank-avatar"><i class="fas fa-user-tie"></i></div>`;

            const barWidth = Math.round((gv.tong_cong_su / maxDegree) * 100);

            return `
                <div class="rank-item" onclick="highlightNode('${gv.id}')">
                    <div class="rank-num ${rankClass}">${i + 1}</div>
                    ${avatarHtml}
                    <div class="rank-info">
                        <div class="rank-name" title="${gv.ten}">${gv.ten}</div>
                        <div class="rank-sub">
                            ${gv.bo_mon ? gv.bo_mon.replace('Bộ môn ', '') : 'N/A'}
                        </div>
                        <div style="margin-top:4px; height:4px; background:rgba(0,0,0,0.06); border-radius:2px; overflow:hidden;">
                            <div style="width:${barWidth}%; height:100%; background:linear-gradient(90deg,#4F8EF7,#6ea8ff); border-radius:2px; transition:width 0.8s ease;"></div>
                        </div>
                    </div>
                    <div class="rank-badge">${gv.tong_cong_su} cộng sự</div>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error('Top connectors error:', e);
        document.getElementById('tab-connectors').innerHTML = '<div class="loading-block">Lỗi tải dữ liệu.</div>';
    }
}

// ============================================================
// 4. CẦU NỐI BỘ MÔN (Bridge Connectors)
// ============================================================

async function loadBridgeConnectors() {
    try {
        const res = await fetch(`${COLLAB_API}/bridge-connectors`);
        const data = await res.json();
        const container = document.getElementById('tab-bridges');

        if (data.status !== 'ok' || !data.data.length) {
            container.innerHTML = '<div class="loading-block">Chưa có dữ liệu cầu nối.</div>';
            return;
        }

        container.innerHTML = data.data.map((gv, i) => {
            const rankClass = i < 3 ? `top-${i + 1}` : '';
            const avatarHtml = gv.avatar
                ? `<img src="${gv.avatar}" class="rank-avatar" alt="${gv.ten}">`
                : `<div class="rank-avatar"><i class="fas fa-user-tie"></i></div>`;

            const tagsHtml = (gv.bo_mon_ket_noi || []).slice(0, 3).map(bm => `
                <span class="bridge-bm-tag">${bm.replace('Bộ môn ', '')}</span>
            `).join('');

            return `
                <div class="rank-item" onclick="highlightNode('${gv.id}')">
                    <div class="rank-num ${rankClass}">${i + 1}</div>
                    ${avatarHtml}
                    <div class="rank-info">
                        <div class="rank-name" title="${gv.ten}">${gv.ten}</div>
                        <div class="rank-sub">${gv.bo_mon_chinh ? gv.bo_mon_chinh.replace('Bộ môn ', '') : 'N/A'}</div>
                        <div class="bridge-bm-tags">${tagsHtml}</div>
                    </div>
                    <div class="rank-badge">${gv.so_bo_mon_ket_noi} bộ môn</div>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error('Bridge connectors error:', e);
        document.getElementById('tab-bridges').innerHTML = '<div class="loading-block">Lỗi tải dữ liệu.</div>';
    }
}

// ============================================================
// 5. TOP CẶP HỢP TÁC
// ============================================================

async function loadTopPairs() {
    try {
        const res = await fetch(`${COLLAB_API}/top-pairs?limit=10`);
        const data = await res.json();
        const container = document.getElementById('tab-pairs');

        if (data.status !== 'ok' || !data.data.length) {
            container.innerHTML = '<div class="loading-block">Chưa có dữ liệu.</div>';
            return;
        }

        container.innerHTML = data.data.map((pair, i) => {
            const rankClass = i < 3 ? `top-${i + 1}` : '';
            const sameBoMon = pair.gv1.bo_mon === pair.gv2.bo_mon;
            const bmTag = sameBoMon
                ? `<span style="font-size:10px;color:#1abc9c;font-weight:600;">Cùng BM</span>`
                : `<span style="font-size:10px;color:#e67e22;font-weight:600;">Khác BM</span>`;

            return `
                <div class="rank-item" style="cursor:default; flex-wrap: wrap;">
                    <div class="rank-num ${rankClass}">${i + 1}</div>
                    <div class="rank-info" style="min-width:0;">
                        <div style="font-size:13px; font-weight:700; color:var(--text-primary);">
                            <span style="cursor:pointer; color:var(--accent-blue);" onclick="highlightNode('${pair.gv1.id}')">${pair.gv1.ten}</span>
                            <span style="color:var(--text-muted); margin: 0 4px;">&</span>
                            <span style="cursor:pointer; color:var(--accent-blue);" onclick="highlightNode('${pair.gv2.id}')">${pair.gv2.ten}</span>
                        </div>
                        <div style="font-size:11px; color:var(--text-muted); margin-top:3px; display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                            ${bmTag}
                            <span>📄 ${pair.so_cong_trinh} công trình</span>
                            <span>🔬 ${pair.so_de_tai} đề tài</span>
                        </div>
                    </div>
                    <div class="rank-badge">${pair.tong_hop_tac} hợp tác</div>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.error('Top pairs error:', e);
        document.getElementById('tab-pairs').innerHTML = '<div class="loading-block">Lỗi tải dữ liệu.</div>';
    }
}

// ============================================================
// 6. ĐỒ THỊ VIS.JS MẠNG LƯỚI HỢP TÁC
// ============================================================

async function loadCollaborationGraph() {
    const container = document.getElementById('collaborationGraph');
    const loadingEl = document.getElementById('graphLoading');

    if (loadingEl) loadingEl.style.display = 'block';
    if (collabNetwork) {
        collabNetwork.destroy();
        collabNetwork = null;
    }

    const boMon = document.getElementById('filterBoMon').value;
    const minCollab = document.getElementById('minCollabRange').value;

    try {
        const params = new URLSearchParams({ min_collab: minCollab });
        if (boMon) params.append('bo_mon', boMon);

        const res = await fetch(`${COLLAB_API}/graph?${params}`);
        const data = await res.json();

        if (loadingEl) loadingEl.style.display = 'none';

        if (data.status !== 'ok' || !data.nodes.length) {
            container.innerHTML = `
                <div class="loading-block" style="padding-top: 200px;">
                    <i class="fas fa-info-circle" style="font-size:24px; display:block; margin-bottom:12px; color:var(--accent-blue);"></i>
                    Không có dữ liệu hợp tác với bộ lọc hiện tại.<br>
                    <small style="color:var(--text-muted);">Thử giảm "Số hợp tác tối thiểu" hoặc chọn "Tất cả bộ môn"</small>
                </div>`;
            return;
        }

        // Hiển thị số node/edge
        const countEl = document.getElementById('graphNodeCount');
        if (countEl) {
            countEl.textContent = `(${data.nodes.length} GV · ${data.edges.length} liên kết)`;
        }

        // Build Vis.js DataSets
        const visNodes = new vis.DataSet(data.nodes.map(n => ({
            id: n.id,
            label: truncateLabel(n.label, 18),
            title: buildCollabTooltip(n),
            color: {
                background: n.color,
                border: n.color,
                highlight: { background: n.color, border: '#ffffff' },
                hover: { background: n.color, border: '#ffffff' },
            },
            shape: 'dot',
            size: n.size,
            font: { color: '#333', size: 11, face: 'Inter' },
            borderWidth: 2,
            shadow: { enabled: true, color: n.color + '40', size: 8 },
        })));

        const visEdges = new vis.DataSet(data.edges.map(e => ({
            id: e.id,
            from: e.from,
            to: e.to,
            width: e.width,
            title: e.title,
            color: e.color,
            smooth: { type: 'continuous', roundness: 0.2 },
            hoverWidth: 2,
            selectionWidth: 3,
        })));

        const options = {
            physics: {
                enabled: true,
                solver: 'forceAtlas2Based',
                forceAtlas2Based: {
                    gravitationalConstant: -55,
                    centralGravity: 0.01,
                    springLength: 120,
                    springConstant: 0.06,
                    damping: 0.6,
                },
                stabilization: { iterations: 250 },
            },
            interaction: {
                hover: true,
                tooltipDelay: 150,
                zoomView: true,
                dragView: true,
                navigationButtons: false,
                multiselect: false,
            },
            nodes: { borderWidth: 2, borderWidthSelected: 4 },
            edges: { selectionWidth: 3 },
        };

        collabNetwork = new vis.Network(container, { nodes: visNodes, edges: visEdges }, options);

        // Click node → hiện chi tiết giảng viên
        collabNetwork.on('click', params => {
            if (params.nodes.length > 0) {
                const nodeId = params.nodes[0];
                if (typeof showLecturerDetail === 'function') {
                    showLecturerDetail(nodeId);
                }
            }
        });

        // Nút tải ảnh
        collabNetwork.once('stabilized', () => {
            if (typeof injectDownloadButton === 'function') {
                injectDownloadButton(container, collabNetwork, 'mang_luoi_hop_tac');
            }
        });

        // Legend
        renderCollabLegend(data.legend);

    } catch (e) {
        console.error('Collaboration graph error:', e);
        if (loadingEl) loadingEl.style.display = 'none';
        container.innerHTML = `<div class="loading-block" style="padding-top:200px; color:#e74c3c;">
            <i class="fas fa-exclamation-triangle" style="font-size:24px; display:block; margin-bottom:12px;"></i>
            Lỗi tải đồ thị: ${e.message}
        </div>`;
    }
}

function buildCollabTooltip(node) {
    const div = document.createElement('div');
    div.className = 'collab-tooltip-box';
    let html = `<strong>${node.label}</strong>`;
    if (node.hoc_vi) html += `<br><span style="color:#666;">${node.hoc_vi}</span>`;
    if (node.bo_mon) html += `<br>🏢 ${node.bo_mon}`;
    if (node.degree) html += `<br>🤝 ${node.degree} cộng sự`;
    if (node.linh_vuc && node.linh_vuc.length) {
        html += `<br>🔬 ${node.linh_vuc.slice(0, 3).join(', ')}`;
    }
    div.innerHTML = html;
    return div;
}

function renderCollabLegend(legend) {
    const area = document.getElementById('graphLegendArea');
    if (!area || !legend) return;

    const items = Object.entries(legend).map(([name, cfg]) => `
        <div class="legend-dot-item">
            <div class="legend-dot" style="background:${cfg.color};"></div>
            <span>${name.replace('Bộ môn ', '')}</span>
        </div>
    `).join('');

    area.innerHTML = `<span class="graph-legend-label">Bộ môn:</span>${items}
        <div class="legend-dot-item" style="margin-left:auto;">
            <span style="font-size:11px; color:var(--text-muted);">⬤ Kích thước node = số cộng sự &nbsp;|&nbsp; Độ dày cạnh = số HT chung</span>
        </div>`;
}

function truncateLabel(text, maxLen) {
    if (!text) return '';
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
}

// ============================================================
// 7. CONTROLS
// ============================================================

function fitGraph() {
    if (collabNetwork) {
        collabNetwork.fit({ animation: { duration: 500, easingFunction: 'easeInOutQuad' } });
    }
}

function togglePhysics() {
    if (!collabNetwork) return;
    physicsEnabled = !physicsEnabled;
    collabNetwork.setOptions({ physics: { enabled: physicsEnabled } });
    const btn = document.getElementById('physicsBtn');
    if (btn) {
        btn.innerHTML = physicsEnabled
            ? '<i class="fas fa-atom"></i> Physics'
            : '<i class="fas fa-lock"></i> Frozen';
        btn.style.color = physicsEnabled ? '' : 'var(--accent-orange)';
    }
}

function highlightNode(nodeId) {
    if (!collabNetwork) return;
    // Focus vào node được chọn
    collabNetwork.selectNodes([nodeId]);
    collabNetwork.focus(nodeId, {
        scale: 1.4,
        animation: { duration: 600, easingFunction: 'easeInOutQuad' },
    });
}

// ============================================================
// 8. CHUYỂN TAB RANK
// ============================================================

function switchRankTab(tabName, el) {
    currentRankTab = tabName;

    // Active tab button
    document.querySelectorAll('.rank-tab').forEach(t => t.classList.remove('active'));
    if (el) el.classList.add('active');

    // Show panel
    document.querySelectorAll('.rank-tab-panel').forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(`tab-${tabName}`);
    if (panel) panel.classList.add('active');
}
