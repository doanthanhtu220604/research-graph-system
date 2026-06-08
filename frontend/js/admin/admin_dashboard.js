/* ============================================================
   ADMIN DASHBOARD — Tổng quan, biểu đồ, thống kê
   ============================================================ */

// ─── Admin chart instances ───
let admChartCombined = null;
let admChartByLevel  = null;
let admChartByDept   = null;
let admChartByDegree = null;

let rawCtNam = [];
let rawDtNam = [];


async function initDashboardOverview() {
    try {
        const res  = await fetch(`${API_BASE}/stats/overview`);
        const data = await res.json();
        if (data.status !== 'ok') return;

        // ── 1. Animate stat cards ──────────────────────────────
        animateAdmCard('admCountGV', data.stats.giang_vien);
        animateAdmCard('admCountCT', data.stats.cong_trinh);
        animateAdmCard('admCountDT', data.stats.de_tai);
        animateAdmCard('admCountBM', data.stats.bo_mon);

        // ── 2. Combined Bar chart — publications & projects ───
        rawCtNam = data.cong_trinh_theo_nam || [];
        rawDtNam = data.de_tai_theo_nam     || [];
        renderCombinedChart('all');

        // ── 3. Doughnut chart — projects by level ─────────────
        const dtCap   = data.de_tai_theo_cap || [];
        const ctxDonut = document.getElementById('admChartByLevel');
        if (ctxDonut) {
            if (admChartByLevel) admChartByLevel.destroy();
            const palette = ['#4F8EF7','#10b981','#f59e0b','#8b5cf6','#ef4444','#06b6d4','#ec4899','#84cc16'];
            admChartByLevel = new Chart(ctxDonut, {
                type: 'doughnut',
                data: {
                    labels: dtCap.map(r => r.cap),
                    datasets: [{
                        data: dtCap.map(r => r.so_luong),
                        backgroundColor: palette.slice(0, dtCap.length),
                        borderColor: 'var(--surface, #ffffff)',
                        borderWidth: 3, hoverOffset: 8,
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '62%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#64748b', font: { family: 'Inter', size: 11 }, padding: 10, usePointStyle: true, pointStyleWidth: 8 }
                        },
                        tooltip: {
                            backgroundColor: '#1e293b', titleColor: '#f1f5f9',
                            bodyColor: '#94a3b8', padding: 10,
                            callbacks: { label: ctx => ` ${ctx.parsed} đề tài` }
                        }
                    },
                    animation: { duration: 800, easing: 'easeOutQuart' }
                }
            });
        }

        // ── 3.1. Bar chart — lecturers by department ───────────
        const gvDept = data.giang_vien_theo_bo_mon || [];
        const ctxDept = document.getElementById('admChartByDept');
        if (ctxDept) {
            if (admChartByDept) admChartByDept.destroy();
            const palette = ['#10b981', '#34d399', '#059669', '#6ee7b7', '#a7f3d0'];
            admChartByDept = new Chart(ctxDept, {
                type: 'bar',
                data: {
                    labels: gvDept.map(r => r.bo_mon || 'Khác'),
                    datasets: [{
                        label: 'Số lượng giảng viên',
                        data: gvDept.map(r => r.so_luong),
                        backgroundColor: palette.slice(0, gvDept.length),
                        borderRadius: 6
                    }]
                },
                options: {
                    indexAxis: 'y', // horizontal bar chart
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: { backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', padding: 10 }
                    },
                    scales: {
                        x: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 }, precision: 0 } },
                        y: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 } } }
                    }
                }
            });
        }

        // ── 3.2. Doughnut chart — lecturers by degree ──────────
        const gvDegree = data.giang_vien_theo_hoc_vi || [];
        const ctxDegree = document.getElementById('admChartByDegree');
        if (ctxDegree) {
            if (admChartByDegree) admChartByDegree.destroy();
            const palette = ['#8b5cf6', '#a78bfa', '#7c3aed', '#c084fc', '#ddd6fe'];
            admChartByDegree = new Chart(ctxDegree, {
                type: 'doughnut',
                data: {
                    labels: gvDegree.map(r => r.hoc_vi || 'Khác'),
                    datasets: [{
                        data: gvDegree.map(r => r.so_luong),
                        backgroundColor: palette.slice(0, gvDegree.length),
                        borderColor: 'var(--surface, #ffffff)',
                        borderWidth: 3, hoverOffset: 8
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false, cutout: '62%',
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#64748b', font: { family: 'Inter', size: 11 }, padding: 10, usePointStyle: true, pointStyleWidth: 8 }
                        },
                        tooltip: {
                            backgroundColor: '#1e293b', titleColor: '#f1f5f9',
                            bodyColor: '#94a3b8', padding: 10,
                            callbacks: { label: ctx => ` ${ctx.parsed} giảng viên` }
                        }
                    },
                    animation: { duration: 800, easing: 'easeOutQuart' }
                }
            });
        }


        // ── 4. Top lecturers compact list ─────────────────────
        renderAdmTopLecturers(data.top_giang_vien || []);

    } catch (err) {
        console.error('[Admin Dashboard] Error:', err);
    }
}


function renderCombinedChart(filterYear) {
    const ctx = document.getElementById('admChartCombined');
    if (!ctx) return;

    let allYears = new Set();
    rawCtNam.forEach(r => allYears.add(r.nam));
    rawDtNam.forEach(r => allYears.add(r.nam));

    let sortedYears = Array.from(allYears).sort((a, b) => a - b);

    const select = document.getElementById('chartYearFilter');
    if (select && select.options.length === 1) {
        sortedYears.forEach(y => {
            const opt = document.createElement('option');
            opt.value = y;
            opt.textContent = 'Năm ' + y;
            select.appendChild(opt);
        });
        select.addEventListener('change', (e) => {
            renderCombinedChart(e.target.value);
        });
    }

    let labels = sortedYears;
    if (filterYear !== 'all') {
        labels = [Number(filterYear)];
    }

    const ctData = labels.map(y => {
        const found = rawCtNam.find(r => r.nam === y);
        return found ? found.so_luong : 0;
    });
    const dtData = labels.map(y => {
        const found = rawDtNam.find(r => r.nam === y);
        return found ? found.so_luong : 0;
    });

    if (admChartCombined) admChartCombined.destroy();
    admChartCombined = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(String),
            datasets: [
                { label: 'Công trình', data: ctData, backgroundColor: '#4F8EF7', borderRadius: 4 },
                { label: 'Đề tài',     data: dtData, backgroundColor: '#10b981', borderRadius: 4 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { color: '#64748b', font: { family: 'Inter', size: 12 }, usePointStyle: true, pointStyleWidth: 10 } },
                tooltip: {
                    backgroundColor: '#1e293b', titleColor: '#f1f5f9', bodyColor: '#94a3b8', padding: 10,
                    mode: 'index', intersect: false
                }
            },
            scales: {
                x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, autoSkip: false, maxRotation: 45, minRotation: 45 } },
                y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#94a3b8', font: { family: 'Inter', size: 11 }, precision: 0 } }
            },
            animation: { duration: 800, easing: 'easeOutQuart' }
        }
    });
}


function animateAdmCard(id, endValue, duration = 1200) {
    const el = document.getElementById(id);
    if (!el) return;
    let start = null;
    const step = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / duration, 1);
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        el.textContent = Math.floor(eased * endValue);
        if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}


function renderAdmTopLecturers(lecturers) {
    const el = document.getElementById('admTopLecturersList');
    if (!el) return;

    if (!lecturers.length) {
        el.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">Chưa có dữ liệu.</p>';
        return;
    }

    const maxCount  = Math.max(...lecturers.map(g => Number(g.so_cong_trinh) || 0)) || 1;
    const numClasses = ['gold', 'silver', 'bronze'];

    el.innerHTML = lecturers.map((gv, i) => {
        const count  = Number(gv.so_cong_trinh) || 0;
        const name   = String(gv.ten || 'N/A').replace(/</g, '&lt;');
        const numCls = numClasses[i] || '';
        const pct    = Math.max(8, Math.round((count / maxCount) * 100));
        return `
            <div class="adm-rank-item" onclick="viewLecturerStats('${gv.id || ''}')">
                <div class="adm-rank-num ${numCls}">${i + 1}</div>
                <div class="adm-rank-info">
                    <div class="adm-rank-name" title="${name}">${name}</div>
                    <div class="adm-rank-sub">
                        <div style="width:${pct}%; height:3px; background:#4F8EF7; border-radius:2px; margin-top:4px; opacity:0.6;"></div>
                    </div>
                </div>
                <span class="adm-rank-badge">${count} CT</span>
            </div>
        `;
    }).join('');
}


/* ─── Export CSV (dashboard & các trang entity) ─────────────── */
function exportDashboardCsv() {
    let csvContent = "data:text/csv;charset=utf-8,\ufeff";
    let filename   = "export_admin.csv";

    if (document.getElementById('page-admin-overview')) {
        csvContent += "Bộ môn,Số lượng bài báo,Số lượng đề tài\n";
        csvContent += "Công nghệ phần mềm,15,5\n";
        csvContent += "Hệ thống thông tin,12,8\n";
        csvContent += "Mạng máy tính,8,3\n";
        filename = "thong_ke_he_thong.csv";

    } else if (document.getElementById('page-admin-lecturers')) {
        csvContent += "ho_va_ten,ma_gv,hoc_vi,chuc_danh,chuc_vu,email,dien_thoai,chuyen_nganh,trang_thai_cong_tac,bo_mon,linh_vuc_nghien_cuu\n";
        const list = currentEntitiesData['giang-vien'] || [];
        list.forEach(gv => {
            const linhVuc = Array.isArray(gv.linh_vuc) ? gv.linh_vuc.join('|') : (gv.linh_vuc || '');
            csvContent += `"${gv.ho_va_ten || ''}","${gv.ma_gv || ''}","${gv.hoc_vi || ''}","${gv.chuc_danh || ''}","${gv.chuc_vu || ''}","${gv.email || ''}","${gv.dien_thoai || ''}","${gv.chuyen_nganh || ''}","${gv.trang_thai_cong_tac || ''}","${gv.bo_mon || ''}","${linhVuc}"\n`;
        });
        filename = "danh_sach_giang_vien.csv";

    } else if (document.getElementById('page-admin-publications')) {
        csvContent += "ten_cong_trinh,nam_xuat_ban,tom_tat,trang_thai,link,tac_gia_giang_vien,tac_gia_ngoai\n";
        const list = currentEntitiesData['cong-trinh'] || [];
        list.forEach(ct => {
            const tacGiaGV    = Array.isArray(ct.tac_gia) ? ct.tac_gia.join('|') : (ct.tac_gia || '');
            const tacGiaNgoai = Array.isArray(ct.tac_gia_ngoai) ? ct.tac_gia_ngoai.join('|') : (ct.tac_gia_ngoai || '');
            csvContent += `"${(ct.ten_cong_trinh || '').replace(/"/g, '""')}","${ct.nam_xuat_ban || ''}","${(ct.tom_tat || '').replace(/"/g, '""')}","${ct.trang_thai || ''}","${ct.link || ''}","${tacGiaGV}","${tacGiaNgoai}"\n`;
        });
        filename = "danh_sach_cong_trinh.csv";

    } else if (document.getElementById('page-admin-projects')) {
        csvContent += "ten_de_tai,cap_de_tai,nam_bat_dau,nam_ket_thuc,tom_tat,trang_thai,link,chu_nhiem,thanh_vien,tac_gia_ngoai\n";
        const list = currentEntitiesData['de-tai'] || [];
        list.forEach(dt => {
            const chuNhiem    = Array.isArray(dt.chu_nhiem) ? dt.chu_nhiem.join('|') : (dt.chu_nhiem || '');
            const thanhVien   = Array.isArray(dt.thanh_vien) ? dt.thanh_vien.join('|') : (dt.thanh_vien || '');
            const tacGiaNgoai = Array.isArray(dt.tac_gia_ngoai) ? dt.tac_gia_ngoai.join('|') : (dt.tac_gia_ngoai || '');
            csvContent += `"${(dt.ten_de_tai || '').replace(/"/g, '""')}","${dt.cap_de_tai || ''}","${dt.nam_bat_dau || ''}","${dt.nam_ket_thuc || ''}","${(dt.tom_tat || '').replace(/"/g, '""')}","${dt.trang_thai || ''}","${dt.link || ''}","${chuNhiem}","${thanhVien}","${tacGiaNgoai}"\n`;
        });
        filename = "danh_sach_de_tai.csv";

    } else if (document.getElementById('page-admin-research-fields')) {
        csvContent += "ten_linh_vuc\n";
        const list = currentEntitiesData['linh-vuc'] || [];
        list.forEach(lv => {
            csvContent += `"${(lv.ten_linh_vuc || '').replace(/"/g, '""')}"\n`;
        });
        filename = "danh_sach_linh_vuc.csv";

    } else if (document.getElementById('page-admin-external-authors')) {
        csvContent += "ho_va_ten,don_vi_cong_tac,hoc_vi,chuc_danh,chuc_vu,email\n";
        const list = currentEntitiesData['tac-gia-ngoai'] || [];
        list.forEach(tgn => {
            csvContent += `"${tgn.ho_va_ten || ''}","${tgn.don_vi_cong_tac || ''}","${tgn.hoc_vi || ''}","${tgn.chuc_danh || ''}","${tgn.chuc_vu || ''}","${tgn.email || ''}"\n`;
        });
        filename = "danh_sach_tac_gia_ngoai.csv";

    } else if (document.getElementById('page-admin-departments')) {
        csvContent += "ten_bo_mon,mo_ta,truong_bo_mon\n";
        const list = currentEntitiesData['bo-mon'] || [];
        list.forEach(bm => {
            csvContent += `"${bm.ten_bo_mon || ''}","${(bm.mo_ta || '').replace(/"/g, '""')}","${bm.truong_bo_mon || ''}"\n`;
        });
        filename = "danh_sach_bo_mon.csv";
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
