# Danh Sách Các Giao Diện Hệ Thống (Research Graph System)

Tài liệu này liệt kê chi tiết các trang giao diện (HTML) hiện có trong hệ thống, phân loại theo 3 nhóm đối tượng người dùng: **Khách vãng lai (Public/Guest)**, **Giảng viên (Lecturer)**, và **Quản trị viên (Administrator)**.

---

## 1. Nhóm Người Dùng: Khách Vãng Lai (Public / Guest)
Khách vãng lai truy cập hệ thống công khai mà không cần đăng nhập. Họ có quyền tra cứu thông tin, xem các số liệu thống kê khoa học và tương tác với đồ thị tri thức.

| Tên Giao Diện | Đường dẫn file HTML | Chức năng chính |
| :--- | :--- | :--- |
| **Trang chủ** | `frontend/user/index.html` | Giới thiệu hệ thống, tích hợp thanh tìm kiếm lớn ở trung tâm, thẻ điều hướng nhanh và danh sách đề tài, bài báo mới nhất. |
| **Khám phá / Tìm kiếm** | `frontend/user/explore.html` | Bản đồ mạng lưới tri thức tương tác kết hợp danh sách kết quả tìm kiếm song song để tra cứu giảng viên, công trình, đề tài. |
| **Danh sách giảng viên** | `frontend/user/lecturers.html` | Xem danh sách giảng viên trong hệ thống, tìm kiếm và truy cập hồ sơ giảng viên. |
| **Danh sách đề tài** | `frontend/user/projects.html` | Tra cứu danh sách các đề tài nghiên cứu khoa học công khai. |
| **Danh sách bài báo** | `frontend/user/publications.html` | Tra cứu danh mục bài báo, công bố khoa học quốc tế (ISI/Scopus) và trong nước. |
| **Mạng lưới hợp tác** | `frontend/user/collaboration.html` | Trực quan hóa mạng lưới hợp tác nghiên cứu (đồng tác giả bài báo/đề tài) giữa các giảng viên. |
| **Biểu đồ thống kê** | `frontend/user/statistics.html` | Biểu đồ trực quan hóa dữ liệu thống kê khoa học theo năm, bộ môn hoặc hướng nghiên cứu. |
| **Chatbot hỗ trợ** | `frontend/user/chat.html` | Chatbot AI hỗ trợ giải đáp nhanh các thắc mắc về nghiên cứu khoa học và giảng viên. |
| **Đăng nhập** | `frontend/user/login.html` | Giao diện đăng nhập dành cho Giảng viên và Quản trị viên để truy cập các tính năng quản lý. |
| **Quên mật khẩu** | `frontend/user/forgot-password.html` | Điền thông tin email để nhận mã khôi phục mật khẩu. |
| **Đặt lại mật khẩu** | `frontend/user/reset-password.html` | Nhập mật khẩu mới sau khi xác thực mã khôi phục thành công. |

---

## 2. Nhóm Người Dùng: Giảng Viên (Lecturer)
Giảng viên sau khi đăng nhập sẽ có không gian quản lý hồ sơ khoa học và các hoạt động nghiên cứu của cá nhân họ.

| Tên Giao Diện | Đường dẫn file HTML | Chức năng chính |
| :--- | :--- | :--- |
| **Trang cá nhân / Dashboard** | `frontend/lecturer/index.html` | Hiển thị hồ sơ cá nhân (học vị, học hàm, bộ môn), cho phép cập nhật thông tin liên hệ và ảnh đại diện. |
| **Quản lý đề tài** | `frontend/lecturer/projects.html` | Xem danh sách đề tài chủ nhiệm/tham gia; thêm, sửa, xóa thông tin đề tài cá nhân. |
| **Quản lý bài báo** | `frontend/lecturer/publications.html` | Quản lý bài báo/công bố khoa học của bản thân, thêm mới hoặc chỉnh sửa bài báo và đồng tác giả. |
| **Dòng thời gian hoạt động** | `frontend/lecturer/timeline.html` | Biểu diễn lịch sử nghiên cứu khoa học cá nhân (đề tài, bài báo) theo dạng trục thời gian sinh động. |
| **Thùng rác cá nhân** | `frontend/lecturer/trash.html` | Lưu trữ tạm các bài báo, đề tài đã xóa để có thể khôi phục lại khi cần. |

---

## 3. Nhóm Người Dùng: Quản Trị Viên (Administrator / Admin)
Quản trị viên có toàn quyền kiểm soát dữ liệu, cấu trúc hệ thống, phê duyệt thông tin và quản lý tài khoản người dùng.

| Tên Giao Diện | Đường dẫn file HTML | Chức năng chính |
| :--- | :--- | :--- |
| **Trang chủ Admin / Dashboard** | `frontend/admin/index.html` | Tổng quan hoạt động hệ thống, số lượng tài khoản, số liệu thống kê nhanh và biểu đồ phân phối. |
| **Quản lý tài khoản** | `frontend/admin/accounts.html` | Cấp mới tài khoản, phân quyền vai trò (Admin/Lecturer), kích hoạt hoặc khóa tài khoản. |
| **Quản lý giảng viên** | `frontend/admin/lecturers.html` | Xem, thêm mới, sửa đổi và đồng bộ thông tin của toàn bộ giảng viên trong trường. |
| **Quản lý đề tài toàn hệ thống** | `frontend/admin/projects.html` | Theo dõi và kiểm duyệt danh sách đề tài nghiên cứu của tất cả các giảng viên. |
| **Quản lý bài báo toàn hệ thống** | `frontend/admin/publications.html` | Theo dõi và kiểm duyệt danh sách bài báo/công bố khoa học của toàn hệ thống. |
| **Quản lý bộ môn** | `frontend/admin/departments.html` | Quản lý danh sách các Bộ môn, Khoa trong trường (dùng để phân loại giảng viên). |
| **Quản lý hướng nghiên cứu** | `frontend/admin/research_fields.html` | Quản lý danh mục các hướng nghiên cứu để phục vụ phân loại bài báo/đề tài. |
| **Quản lý tác giả ngoài** | `frontend/admin/external_authors.html` | Quản lý các tác giả ngoài trường liên kết viết bài báo/đề tài với giảng viên của trường. |
| **Nhập dữ liệu (Import)** | `frontend/admin/import.html` | Hỗ trợ nhập dữ liệu hàng loạt từ file Excel mẫu vào cơ sở dữ liệu Neo4j. |
| **Xuất dữ liệu (Export)** | `frontend/admin/export.html` | Kết xuất báo cáo thống kê, xuất dữ liệu ra định dạng Excel hoặc PDF. |
| **Thùng rác hệ thống** | `frontend/admin/trash.html` | Quản lý các dữ liệu đã bị xóa tạm thời trên toàn hệ thống để khôi phục hoặc xóa vĩnh viễn. |
