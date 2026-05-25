/* ============================================================
   KNOWLEDGE MAP ADMIN — Entry point
   Tất cả logic đã được tách ra các module riêng biệt.
   File này chỉ giữ lại để tương thích ngược với các HTML
   đang dùng <script src="admin_app.js"> — nội dung thật
   nằm trong các file module dưới đây.
   ============================================================

   Thứ tự load (quan trọng):
   1. admin_config.js        — Constants, ENTITY_CONFIG, biến toàn cục
   2. admin_utils.js         — Upload PDF, Scroll to Top, Logout
   3. admin_profile.js       — Avatar dropdown, profile, đổi mật khẩu
   4. admin_dashboard.js     — Dashboard overview, biểu đồ, CSV export
   5. admin_lecturers.js     — Quản lý Giảng viên
   6. admin_publications.js  — Quản lý Công trình
   7. admin_projects.js      — Quản lý Đề tài
   8. admin_other_entities.js— Lĩnh vực, Tác giả ngoài, Bộ môn
   9. admin_modal.js         — Form CRUD thêm mới / chỉnh sửa
  10. admin_delete.js        — Soft delete, Toast, Trash badge
  11. admin_relations.js     — Quản lý liên kết
  12. admin_detail_views.js  — Chi tiết GV / CT / DT / TGN
  13. admin_accounts.js      — Quản lý tài khoản
  14. admin_init.js          — DOMContentLoaded (load cuối cùng)

   ============================================================ */

/* File này không còn chứa logic — toàn bộ đã chuyển sang các
   module riêng. Xem danh sách file ở trên. */
