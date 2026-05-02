/* ============================================================
   TIMELINE APP — Dòng thời gian nghiên cứu của Giảng viên
   File: frontend/js/lecturer/timeline_app.js
   ============================================================ */

let tlAllEvents = [];       // Toàn bộ events từ API
let tlCurrentFilter = 'all'; // 'all' | 'publication' | 'project'

/* ── Khởi chạy khi DOM ready ── */
document.addEventListener('DOMContentLoaded', () => {
    // Chỉ chạy trên trang timeline
    if (!document.getElementById('page-timeline')) return;

    // Auth check (được xử lý bởi lecturer_app.js, nhưng đảm bảo userInfo có sẵn)
    const checkAndLoad = () => {
        if (typeof userInfo !== 'undefined' && userInfo && userInfo.id) {
            fetchTimeline(userInfo.id);
        } else {
            // Chờ lecturer_app.js parse xong userInfo
            setTimeout(checkAndLoad, 80);
        }
    };
    checkAndLoad();
});

/* ── Gọi API lấy dữ liệu timeline ── */
async function fetchTimeline(gvId) {
    const container = document.getElementById('tlContainer');
    container.innerHTML = `
        <div class="tl-loading">
            <i class="fas fa-circle-notch fa-spin"></i>
            Đang tải dữ liệu dòng thời gian...
        </div>`;

    try {
        const res = await fetch(`/api/lecturer/timeline?id=${gvId}`);
        const data = await res.json();

        if (data.status === 'ok') {
            tlAllEvents = data.data || [];
            updateSummaryBar(data);
            renderTimeline();
        } else {
            container.innerHTML = `
                <div class="tl-empty">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Không thể tải dữ liệu: ${data.message || 'Lỗi không xác định.'}</p>
                </div>`;
        }
    } catch (err) {
        console.error('Timeline fetch error:', err);
        container.innerHTML = `
            <div class="tl-empty">
                <i class="fas fa-wifi" style="opacity:0.3;"></i>
                <p>Lỗi kết nối máy chủ. Vui lòng thử lại.</p>
            </div>`;
    }
}

/* ── Cập nhật thanh tóm tắt thống kê ── */
function updateSummaryBar(data) {
    const bar = document.getElementById('tlSummaryBar');
    if (!bar) return;
    bar.style.display = 'flex';

    const pubCount  = (data.data || []).filter(e => e.type === 'publication').length;
    const projCount = (data.data || []).filter(e => e.type === 'project').length;

    document.getElementById('tlTotalCount').textContent = data.total || 0;
    document.getElementById('tlPubCount').textContent  = pubCount;
    document.getElementById('tlProjCount').textContent = projCount;
}

/* ── Đặt bộ lọc ── */
function setFilter(type) {
    tlCurrentFilter = type;

    // Cập nhật active button
    document.querySelectorAll('.tl-filter-btn').forEach(btn => btn.classList.remove('active'));
    const btnMap = { all: 'filterAll', publication: 'filterPub', project: 'filterProj' };
    const activeBtn = document.getElementById(btnMap[type]);
    if (activeBtn) activeBtn.classList.add('active');

    renderTimeline();
}

/* ── Render toàn bộ timeline ── */
function renderTimeline() {
    const container = document.getElementById('tlContainer');
    if (!container) return;

    const searchVal = (document.getElementById('tlSearchInput')?.value || '').toLowerCase().trim();

    // Lọc events
    let filtered = tlAllEvents.filter(ev => {
        if (tlCurrentFilter !== 'all' && ev.type !== tlCurrentFilter) return false;
        if (searchVal && !ev.tieu_de.toLowerCase().includes(searchVal)) return false;
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="tl-empty">
                <i class="fas fa-search"></i>
                <p>Không tìm thấy sự kiện nào phù hợp.</p>
            </div>`;
        return;
    }

    // Nhóm events theo năm
    const byYear = groupByYear(filtered);
    const years = Object.keys(byYear).sort((a, b) => {
        // 'unknown' xếp cuối
        if (a === 'unknown') return 1;
        if (b === 'unknown') return -1;
        return Number(b) - Number(a);
    });

    let html = '';
    let globalIdx = 0; // Chỉ số toàn cục để xen kẽ left/right

    years.forEach(year => {
        // Year marker
        const yearLabel = year === 'unknown' ? 'Chưa xác định' : year;
        html += `
            <div class="tl-year-marker">
                <div class="tl-year-bubble"><i class="fas fa-calendar-alt" style="margin-right:6px;opacity:0.8;"></i>${yearLabel}</div>
            </div>`;

        byYear[year].forEach(ev => {
            html += renderEventItem(ev, globalIdx);
            globalIdx++;
        });
    });

    container.innerHTML = html;

    // Stagger animation delay
    container.querySelectorAll('.tl-item').forEach((el, i) => {
        el.style.animationDelay = `${i * 60}ms`;
    });
}

/* ── Nhóm events theo năm ── */
function groupByYear(events) {
    const groups = {};
    events.forEach(ev => {
        const key = ev.nam ? String(ev.nam) : 'unknown';
        if (!groups[key]) groups[key] = [];
        groups[key].push(ev);
    });
    return groups;
}

/* ── Render một event item ── */
function renderEventItem(ev, idx) {
    const isOdd = idx % 2 === 0; // Chẵn = bên trái, lẻ = bên phải

    const dot = `
        <div class="tl-dot-col">
            <div class="tl-dot ${ev.color}" title="${ev.type === 'publication' ? 'Công trình' : 'Đề tài'}">
                <i class="fas ${ev.icon}"></i>
            </div>
        </div>`;

    const card = buildCard(ev);
    const spacer = `<div class="tl-spacer"></div>`;

    const innerContent = isOdd
        ? `${card}${dot}${spacer}`
        : `${spacer}${dot}${card}`;

    return `<div class="tl-item">${innerContent}</div>`;
}

/* ── Build HTML thẻ card ── */
function buildCard(ev) {
    // Type badge
    const typeLabel = ev.type === 'publication' ? 'Công trình' : 'Đề tài';
    const badge = `
        <span class="tl-card-type-badge ${ev.color}">
            <i class="fas ${ev.icon}"></i> ${typeLabel}
        </span>`;

    // Title
    const title = `<div class="tl-card-title">${escHtml(ev.tieu_de)}</div>`;

    // Meta chips
    let metaHtml = '';
    if (ev.type === 'publication') {
        if (ev.loai) metaHtml += `<span class="tl-meta-chip"><i class="fas fa-tag"></i>${escHtml(ev.loai)}</span>`;
        if (ev.nam) metaHtml += `<span class="tl-meta-chip"><i class="fas fa-calendar"></i>${ev.nam}</span>`;
    } else {
        if (ev.cap) metaHtml += `<span class="tl-meta-chip"><i class="fas fa-layer-group"></i>${escHtml(ev.cap)}</span>`;
        const yearRange = ev.nam && ev.nam_ket_thuc
            ? `${ev.nam} – ${ev.nam_ket_thuc}`
            : (ev.nam ? String(ev.nam) : '');
        if (yearRange) metaHtml += `<span class="tl-meta-chip"><i class="fas fa-calendar-alt"></i>${yearRange}</span>`;
    }
    metaHtml += `<span class="tl-meta-chip"><i class="fas fa-user-tag"></i>${escHtml(ev.vai_tro)}</span>`;

    // Status badge
    const statusColor = ev.trang_thai === 'Hoàn thành' ? '#10b981' : (ev.trang_thai === 'Chờ duyệt' ? '#f59e0b' : '#3b82f6');
    metaHtml += `<span class="tl-meta-chip" style="color:${statusColor};"><i class="fas fa-circle" style="font-size:7px;"></i>${escHtml(ev.trang_thai)}</span>`;

    const meta = `<div class="tl-card-meta">${metaHtml}</div>`;

    // Summary (truncated)
    const summary = ev.tom_tat
        ? `<div class="tl-card-summary">${escHtml(ev.tom_tat)}</div>`
        : '';

    // Footer: đồng tác giả / thành viên + link
    let collabHtml = '';
    const collaborators = ev.type === 'publication' ? (ev.dong_tac_gia || []) : (ev.thanh_vien || []);
    if (collaborators.length > 0) {
        const names = collaborators.slice(0, 2).map(n => escHtml(n)).join(', ');
        const more = collaborators.length > 2 ? ` +${collaborators.length - 2}` : '';
        const collabLabel = ev.type === 'publication' ? 'Đồng tác giả' : 'Thành viên';
        collabHtml = `
            <div class="tl-collab-list">
                <i class="fas fa-users"></i>&nbsp;${collabLabel}: ${names}${more}
            </div>`;
    }

    const linkBtn = ev.link
        ? `<a href="${ev.link}" target="_blank" class="tl-card-link"><i class="fas fa-external-link-alt"></i> Xem</a>`
        : '';

    const footer = (collabHtml || linkBtn)
        ? `<div class="tl-card-footer">${collabHtml}${linkBtn}</div>`
        : '';

    return `
        <div class="tl-card ${ev.color}">
            ${badge}
            ${title}
            ${meta}
            ${summary}
            ${footer}
        </div>`;
}

/* ── Utility: escape HTML ── */
function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
