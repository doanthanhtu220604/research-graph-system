/* ============================================================
   GRAPH - Vis.js rendering, download utility, legend
   ============================================================ */

/**
 * Xuất đồ thị Vis.js đang hiển thị thành file ảnh PNG.
 * @param {vis.Network} network  - Đối tượng Network của Vis.js
 * @param {string}      filename - Tên file tải về (không cần đuôi .png)
 */
function downloadGraphImage(network, filename = 'knowledge_graph') {
    const originalCanvas = network.canvas.frame.canvas;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width  = originalCanvas.width;
    tempCanvas.height = originalCanvas.height;
    const ctx = tempCanvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    ctx.drawImage(originalCanvas, 0, 0);

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
 * @param {HTMLElement}  container - Phần tử cha chứa canvas
 * @param {vis.Network}  network   - Đối tượng Network của Vis.js
 * @param {string}       filename  - Tên file tải về
 */
function injectDownloadButton(container, network, filename) {
    const existing = container.querySelector('.graph-download-btn');
    if (existing) existing.remove();

    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }

    const btn = document.createElement('button');
    btn.className = 'graph-download-btn';
    btn.title = 'Tải ảnh đồ thị về máy';
    btn.innerHTML = '<i class="fas fa-camera"></i> Tải ảnh';

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
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

    // Click node -> show details
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

    // Nhúng nút tải ảnh sau khi đồ thị ổn định
    network.once('stabilized', () => {
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
