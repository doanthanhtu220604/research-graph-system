/* ============================================================
   ADMIN CONFIG — Hằng số & cấu hình entity
   ============================================================ */

const API_BASE = '/api';
const ADMIN_API_BASE = '/api/admin';

// Cấu hình chung cho toàn bộ module quản trị
const ENTITY_CONFIG = {

    'giang-vien': {
        title: 'Giảng viên',
        apiUrl: `${API_BASE}/giang-vien`,
        adminApiUrl: `${ADMIN_API_BASE}/giang-vien`,
        fields: [
            { name: 'ma_gv', label: 'Mã giảng viên', type: 'text', required: true },
            { name: 'ho_va_ten', label: 'Họ và tên', type: 'text', required: true },
            { name: 'hoc_vi', label: 'Học vị', type: 'text' },
            { name: 'chuc_danh', label: 'Chức danh', type: 'text' },
            { name: 'chuc_vu', label: 'Chức vụ', type: 'text' },
            { name: 'bo_mon', label: 'Tên Bộ môn', type: 'select', options: [] },
            { name: 'email', label: 'Email', type: 'email' },
            { name: 'dien_thoai', label: 'Điện thoại', type: 'text' },
            { name: 'chuyen_nganh', label: 'Chuyên ngành', type: 'text' },
            { name: 'trang_thai_cong_tac', label: 'Trạng thái công tác', type: 'select', default: 'Đang công tác', options: [
                { value: 'Đang công tác', label: 'Đang công tác' },
                { value: 'Nghỉ hưu', label: 'Nghỉ hưu' },
                { value: 'Chuyển công tác', label: 'Chuyển công tác' },
                { value: 'Nghiên cứu sinh', label: 'Nghiên cứu sinh' }
            ]},
            { name: 'anh_dai_dien', label: 'Link ảnh đại diện', type: 'url' }
        ]
    },

    'cong-trinh': {
        title: 'Công trình',
        apiUrl: `${API_BASE}/cong-trinh`,
        adminApiUrl: `${ADMIN_API_BASE}/cong-trinh`,
        fields: [
            { name: 'ten_cong_trinh', label: 'Tên công trình', type: 'text', required: true },
            { name: 'nam_xuat_ban', label: 'Năm xuất bản', type: 'number' },
            { name: 'noi_xuat_ban', label: 'Nơi xuất bản', type: 'text' },
            { name: 'tom_tat', label: 'Tóm tắt nội dung', type: 'textarea' },
            { name: 'trang_thai', label: 'Trạng thái', type: 'select', default: 'Đang thực hiện', options: [
                { value: 'Đang thực hiện', label: 'Đang thực hiện' },
                { value: 'Hoàn thành', label: 'Hoàn thành' }
            ]},
            { name: 'link', label: 'Link bài viết', type: 'url' }
        ]
    },

    'de-tai': {
        title: 'Đề tài',
        apiUrl: `${API_BASE}/de-tai`,
        adminApiUrl: `${ADMIN_API_BASE}/de-tai`,
        fields: [
            { name: 'ten_de_tai', label: 'Tên đề tài', type: 'text', required: true },
            { name: 'cap_de_tai', label: 'Cấp đề tài', type: 'text' },
            { name: 'nam_bat_dau', label: 'Năm bắt đầu', type: 'number' },
            { name: 'nam_ket_thuc', label: 'Năm kết thúc', type: 'number' },
            { name: 'tom_tat', label: 'Tóm tắt nội dung', type: 'textarea' },
            { name: 'trang_thai', label: 'Trạng thái', type: 'select', default: 'Đang thực hiện', options: [
                { value: 'Đang thực hiện', label: 'Đang thực hiện' },
                { value: 'Hoàn thành', label: 'Hoàn thành' }
            ]},
            { name: 'link', label: 'Link đề tài', type: 'url' }
        ]
    },

    'linh-vuc': {
        title: 'Lĩnh vực nghiên cứu',
        apiUrl: `${API_BASE}/linh-vuc`,
        adminApiUrl: `${ADMIN_API_BASE}/linh-vuc`,
        fields: [
            { name: 'ten_linh_vuc', label: 'Tên Lĩnh vực', type: 'text', required: true }
        ]
    },

    'tac-gia-ngoai': {
        title: 'Tác giả ngoài',
        apiUrl: `${ADMIN_API_BASE}/tac-gia-ngoai`,
        adminApiUrl: `${ADMIN_API_BASE}/tac-gia-ngoai`,
        fields: [
            { name: 'ho_va_ten', label: 'Họ và tên', type: 'text', required: true },
            { name: 'don_vi_cong_tac', label: 'Đơn vị công tác', type: 'text' },
            { name: 'hoc_vi', label: 'Học vị', type: 'text' },
            { name: 'chuc_danh', label: 'Chức danh', type: 'text' },
            { name: 'chuc_vu', label: 'Chức vụ', type: 'text' },
            { name: 'email', label: 'Email', type: 'email' }
        ]
    },

    'bo-mon': {
        title: 'Bộ môn',
        apiUrl: `${ADMIN_API_BASE}/bo-mon`,
        adminApiUrl: `${ADMIN_API_BASE}/bo-mon`,
        fields: [
            { name: 'ten_bo_mon', label: 'Tên Bộ môn', type: 'text', required: true }
        ]
    }

};

// Biến toàn cục lưu dữ liệu các entity đang hiển thị
let currentEntitiesData = {};
