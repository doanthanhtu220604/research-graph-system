/* ============================================================
   SCHOLAR - Google Scholar integration
   ============================================================ */

async function loadScholarStats(name, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    try {
        const res  = await fetch(`${API_BASE}/scholar/${encodeURIComponent(name)}`);
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
