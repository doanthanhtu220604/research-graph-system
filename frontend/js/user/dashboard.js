/* ============================================================
   DASHBOARD - Stats overview, top lecturers, mini grids
   ============================================================ */

async function loadDashboard() {
    try {
        const res = await fetch(`${API_BASE}/stats/overview`);
        const data = await res.json();

        if (data.status === 'ok') {
            if (data.stats) {
                animateValue("count-gv", data.stats.giang_vien);
                animateValue("count-ct", data.stats.cong_trinh);
                animateValue("count-dt", data.stats.de_tai);
                animateValue("count-bm", data.stats.bo_mon);
            }
            renderTopLecturers(data.top_giang_vien, 'topLecturersList');
        }
    } catch (err) {
        console.error('Dashboard error:', err);
    }

    initSimpleLecturerGrid();
    initSimplePublicationGrid();
    initSimpleProjectGrid();
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

        const displayList = gvList.slice(0, 10);
        const html = displayList.map(gv => {
            const name = String(gv.ho_va_ten || '').replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const img = gv.anh_dai_dien
                ? `<img src="${String(gv.anh_dai_dien).replace(/"/g, '')}" alt="${name}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">`
                : `<div class="no-avatar" style="width: 80px; height: 80px; border-radius: 50%; background: var(--gradient-primary); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; border: 2px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.08); color: white; font-size: 30px;"><i class="fas fa-user-tie"></i></div>`;
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
