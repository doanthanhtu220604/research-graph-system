/* ============================================================
   ACADEMIC - Academic profile integration (OpenAlex & Google Scholar)
   ============================================================ */

async function loadAcademicStats(name, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    try {
        const res  = await fetch(`${API_BASE}/academic/${encodeURIComponent(name)}`);
        const data = await res.json();
        if (data.status === 'ok') {
            const stats = data.data;
            const source = data.source || 'OpenAlex';
            
            // Cấu hình giao diện động theo nguồn dữ liệu
            let primaryColor = '#0d9488'; // Teal cho OpenAlex
            let sourceName = 'OpenAlex Metrics';
            let iconClass = 'fas fa-graduation-cap';
            let linkText = 'Xem hồ sơ OpenAlex';
            let bgLight = 'rgba(13, 148, 136, 0.05)';
            let borderLight = 'rgba(13, 148, 136, 0.2)';

            if (source === 'Google Scholar') {
                primaryColor = '#4285F4'; // Blue cho Google Scholar
                sourceName = 'Google Scholar Metrics';
                iconClass = 'fab fa-google';
                linkText = 'Xem hồ sơ Scholar';
                bgLight = 'rgba(66, 133, 244, 0.05)';
                borderLight = 'rgba(66, 133, 244, 0.2)';
            }

            container.innerHTML = `
                <div style="margin-bottom: 20px; transition: all 0.3s ease;">
                    <h3 style="font-size: 15px; margin-bottom: 12px; color: ${primaryColor}; display: flex; align-items: center; gap: 8px; font-weight: 700;">
                        <i class="${iconClass}"></i> ${sourceName}
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        <div style="background: ${bgLight}; border: 1px solid ${borderLight}; border-radius: 8px; padding: 12px; text-align: center; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                            <div style="font-size: 22px; font-weight: 800; color: ${primaryColor};">${stats.publications_count}</div>
                            <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Bài báo</div>
                        </div>
                        <div style="background: ${bgLight}; border: 1px solid ${borderLight}; border-radius: 8px; padding: 12px; text-align: center; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                            <div style="font-size: 22px; font-weight: 800; color: ${primaryColor};">${stats.citedby}</div>
                            <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">Trích dẫn</div>
                        </div>
                        <div style="background: ${bgLight}; border: 1px solid ${borderLight}; border-radius: 8px; padding: 12px; text-align: center; transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
                            <div style="font-size: 22px; font-weight: 800; color: ${primaryColor};">${stats.hindex}</div>
                            <div style="font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; margin-top: 4px;">H-index</div>
                        </div>
                    </div>
                    ${stats.profile_url ? `
                        <div style="margin-top: 12px; text-align: right;">
                            <a href="${stats.profile_url}" target="_blank" rel="noopener noreferrer" 
                               style="font-size: 12px; color: ${primaryColor}; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; border-bottom: 1px solid transparent; padding-bottom: 2px;"
                               onmouseover="this.style.borderBottomColor='${primaryColor}'"
                               onmouseout="this.style.borderBottomColor='transparent'">
                                <i class="fas fa-external-link-alt"></i> ${linkText}
                            </a>
                        </div>
                    ` : ''}
                </div>
            `;
        } else {
            container.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); font-style: italic; margin-bottom: 20px;"><i class="fas fa-info-circle"></i> Thống kê: ${data.message}</div>`;
        }
    } catch (e) {
        container.innerHTML = `<div style="font-size: 12px; color: var(--text-muted); font-style: italic; margin-bottom: 20px;"><i class="fas fa-exclamation-triangle"></i> Lỗi kết nối API thống kê học thuật.</div>`;
    }
}
