/* ============================================================
   STATISTICS - Statistics page: charts, leaderboard, trends
   ============================================================ */

async function loadStatistics() {
    try {
        const res = await fetch(`${API_BASE}/stats/overview`);
        const data = await res.json();

        if (data.status !== 'ok') return;

        // 1. Animate Stat Cards
        animateStatCard('statCountGV', data.stats.giang_vien);
        animateStatCard('statCountCT', data.stats.cong_trinh);
        animateStatCard('statCountDT', data.stats.de_tai);
        animateStatCard('statCountBM', data.stats.bo_mon);

        // 2. Render ongoing activities
        renderOngoingActivities(
            data.de_tai_dang_thuc_hien || [],
            data.cong_trinh_moi || []
        );

        // 3. Render Leaderboard
        renderStatsLeaderboard(data.top_giang_vien || []);

        // 4. Render Charts
        renderCharts(data);

        // 5. Render New Trends & Keywords
        loadResearchTrends();

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

    const top3 = lecturers.slice(0, 3);
    const others = lecturers.slice(3, 10);

    // Sắp xếp hiển thị: 2 - 1 - 3
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
    const ctxDept  = document.getElementById('chartDept');

    if (chartTrend) chartTrend.destroy();
    if (chartLevel) chartLevel.destroy();
    if (chartDept)  chartDept.destroy();

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

    // 3. Biểu đồ giảng viên theo bộ môn
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

function renderOngoingActivities(projects, publications) {
    const projEl = document.getElementById('statsOngoingProjects');
    if (projEl) {
        if (!projects || projects.length === 0) {
            projEl.innerHTML = '<div class="list-empty"><i class="fas fa-inbox"></i>Không có đề tài đang thực hiện</div>';
        } else {
            projEl.innerHTML = projects.map(dt => {
                const title = String(dt.ten_de_tai || 'N/A').replace(/</g, '&lt;');
                const cap   = dt.cap_de_tai || 'Chưa xác định';
                const nam   = dt.nam_bat_dau ? `${dt.nam_bat_dau} – ${dt.nam_ket_thuc || 'nay'}` : '';
                const chu   = dt.chu_nhiem ? `<i class="fas fa-user"></i> ${dt.chu_nhiem}` : '';
                return `
                    <div class="activity-item" onclick="showProjectDetail('${dt.id || ''}')">
                        <div class="activity-item-icon activity-icon-project"><i class="fas fa-flask"></i></div>
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

    const pubEl = document.getElementById('statsRecentPublications');
    if (pubEl) {
        if (!publications || publications.length === 0) {
            pubEl.innerHTML = '<div class="list-empty"><i class="fas fa-inbox"></i>Không có dữ liệu</div>';
        } else {
            pubEl.innerHTML = publications.map(ct => {
                const title   = String(ct.ten_cong_trinh || 'N/A').replace(/</g, '&lt;');
                const authors = (ct.tac_gia || []).slice(0, 2).join(', ');
                const extra   = (ct.tac_gia || []).length > 2 ? ` +${(ct.tac_gia || []).length - 2}` : '';
                return `
                    <div class="activity-item" onclick="showPublicationDetail('${ct.id || ''}')">
                        <div class="activity-item-icon activity-icon-pub"><i class="fas fa-file-alt"></i></div>
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

async function loadResearchTrends() {
    const trendsContainer  = document.getElementById('trendsListContainer');
    const keywordsContainer = document.getElementById('keywordsCloudContainer');
    if (!trendsContainer || !keywordsContainer) return;

    try {
        const res  = await fetch(`${API_BASE}/stats/trends`);
        const data = await res.json();

        if (data.status !== 'ok') {
            trendsContainer.innerHTML  = '<div style="color:var(--text-muted); text-align:center;">Không thể tải xu hướng.</div>';
            keywordsContainer.innerHTML = '<div style="color:var(--text-muted); text-align:center;">Không thể tải từ khóa.</div>';
            return;
        }

        // Render Trends list
        const trends = data.trends || [];
        if (trends.length === 0) {
            trendsContainer.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding: 20px;">Chưa có dữ liệu xu hướng.</div>';
        } else {
            trendsContainer.innerHTML = trends.map((item, idx) => {
                const badgeClass = item.growth_rate > 50 ? 'badge-red' : (item.growth_rate > 20 ? 'badge-orange' : 'badge-blue');
                const lecturersHtml = item.giang_vien_chot && item.giang_vien_chot.length > 0
                    ? `<span style="font-size: 11px; color: var(--text-muted); margin-left: 10px;"><i class="fas fa-user-tie"></i> Giảng viên tiêu biểu: ${item.giang_vien_chot.join(', ')}</span>`
                    : '';
                return `
                    <div onclick="window.location.href='explore.html?q=' + encodeURIComponent('${item.ten_linh_vuc}')"
                         style="padding: 12px 16px; background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between; gap: 15px; cursor: pointer; transition: all 0.2s;"
                         onmouseover="this.style.background='rgba(59, 130, 246, 0.05)'; this.style.borderColor='var(--accent-blue)';"
                         onmouseout="this.style.background='rgba(255,255,255,0.03)'; this.style.borderColor='var(--border-color)';">
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-weight: 600; font-size: 13.5px; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                                <span style="color: var(--accent-blue); font-weight: 700; margin-right: 5px;">#${idx + 1}</span> ${item.ten_linh_vuc}
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px; margin-top: 4px; flex-wrap: wrap;">
                                <span style="font-size: 11.5px; color: var(--text-secondary);"><i class="fas fa-file-alt"></i> ${item.tong_so_bai} công trình</span>
                                <span style="font-size: 11.5px; color: var(--text-secondary);"><i class="fas fa-history"></i> ${item.so_bai_gan_day} bài mới (2023+)</span>
                                ${lecturersHtml}
                            </div>
                        </div>
                        <div style="text-align: right; flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 4px;">
                            <span class="badge ${badgeClass}" style="font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 4px;">+${item.growth_rate}% tăng trưởng</span>
                            <span style="font-size: 10px; color: var(--text-muted); letter-spacing: 0.5px; text-transform: uppercase;">Điểm xu hướng: <b>${item.trend_score}</b></span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Render Keywords Cloud
        const keywords = data.keywords || [];
        if (keywords.length === 0) {
            keywordsContainer.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding: 20px; width: 100%;">Chưa có dữ liệu từ khóa.</div>';
        } else {
            keywordsContainer.innerHTML = keywords.map(kw => {
                const sizes = ['11px', '12px', '13px', '14px'];
                const randomSize = sizes[Math.min(Math.floor(kw.score / 2), sizes.length - 1)];
                const opacity = Math.min(0.5 + kw.score / 15, 1.0);
                return `
                    <span class="badge"
                        onclick="window.location.href='explore.html?q=' + encodeURIComponent('${kw.keyword}')"
                        style="
                        font-size: ${randomSize};
                        font-weight: 600;
                        padding: 6px 12px;
                        border-radius: 20px;
                        background: rgba(139, 92, 246, 0.08);
                        color: rgba(139, 92, 246, ${opacity});
                        border: 1px solid rgba(139, 92, 246, 0.15);
                        cursor: pointer;
                        transition: all 0.2s;
                    " onmouseover="this.style.background='rgba(139,92,246,0.15)'; this.style.transform='scale(1.05)'" onmouseout="this.style.background='rgba(139, 92, 246, 0.08)'; this.style.transform='scale(1)'">
                        <i class="fas fa-hashtag" style="font-size: 10px; margin-right: 3px; opacity: 0.7;"></i>${kw.keyword}
                    </span>
                `;
            }).join('');
        }

    } catch (err) {
        console.error('Trends error:', err);
        trendsContainer.innerHTML  = '<div style="color:var(--text-muted); text-align:center;">Lỗi kết nối.</div>';
        keywordsContainer.innerHTML = '<div style="color:var(--text-muted); text-align:center;">Lỗi kết nối.</div>';
    }
}
