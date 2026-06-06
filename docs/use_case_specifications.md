# 3.6. ĐẶC TẢ CHI TIẾT CÁC USE CASE HỆ THỐNG

Tài liệu dưới đây chứa thông tin đặc tả chi tiết của các Use Case trong hệ thống Bản đồ tri thức nghiên cứu khoa học và Trợ lý hỏi đáp tự động (GraphRAG Chatbot). Nội dung được định dạng dưới dạng văn bản thuần có cấu trúc rõ ràng, tương thích hoàn toàn với danh mục chức năng nghiệp vụ của hệ thống (Bảng 3.1, Bảng 3.2, Bảng 3.3).

---

### Bảng 3.7. Đặc tả chức năng Đăng nhập

- **Mô tả:** Cho phép người dùng hệ thống (Giảng viên, Admin) đăng nhập vào hệ thống bằng tài khoản cá nhân để thực hiện quản lý dữ liệu.
- **Actor:** Giảng viên, Quản trị viên
- **Tiền điều kiện:** Tài khoản đã được cấp hoặc khởi tạo thành công trên hệ thống.
- **Hậu điều kiện:** Đăng nhập thành công, phiên làm việc được thiết lập, chuyển hướng đến phân hệ tương ứng.
- **Đảm bảo tối thiểu:** Thông tin tài khoản và trạng thái hệ thống được bảo toàn; không thiết lập phiên làm việc mới.
- **Đảm bảo thành công:** Thiết lập token xác thực (JWT/Session) và cho phép truy cập các chức năng bảo mật.
- **Kích hoạt:** Người dùng điền thông tin đăng nhập và nhấn nút Đăng nhập.
- **Chuỗi sự kiện chính:**
  1. Người dùng mở trang đăng nhập hệ thống.
  2. Hệ thống hiển thị form đăng nhập gồm các trường: Tài khoản / Email, Mật khẩu.
  3. Người dùng nhập thông tin đăng nhập.
  4. Người dùng nhấn nút 'Đăng nhập'.
  5. Hệ thống kiểm tra thông tin đăng nhập hợp lệ trên database Neo4j.
  6. Sau khi đăng nhập thành công, hệ thống lưu thông tin vai trò (role) và thông tin người dùng (userInfo) vào LocalStorage, tự động chuyển hướng qua trang chủ quản trị tương ứng (Admin Dashboard tại `/admin/index.html` hoặc Lecturer Dashboard tại `/lecturer/index.html`).
  Use case chức năng “Đăng nhập” kết thúc.
- **Chuỗi sự kiện ngoại lệ:**
  5.a. Thông tin đăng nhập không hợp lệ (sai tài khoản hoặc mật khẩu).
  5.a.1. Hệ thống hiển thị thông báo lỗi đăng nhập: "Tài khoản hoặc mật khẩu không chính xác".
  5.a.2. Người dùng nhập lại thông tin đăng nhập.
  Use case quay lại bước 3.

---

### Bảng 3.8. Đặc tả chức năng Quên mật khẩu

- **Mô tả:** Cho phép người dùng yêu cầu gửi liên kết đặt lại mật khẩu mới qua email đăng ký khi quên mật khẩu.
- **Actor:** Giảng viên, Quản trị viên
- **Tiền điều kiện:** Đang ở giao diện Đăng nhập, có email đăng ký hợp lệ.
- **Hậu điều kiện:** Nhận được email khôi phục mật khẩu, đổi mật khẩu thành công.
- **Đảm bảo tối thiểu:** Mật khẩu hiện tại của tài khoản được giữ nguyên; không gửi email khôi phục hoặc kích hoạt liên kết lỗi.
- **Đảm bảo thành công:** Mật khẩu mới được mã hóa và lưu trữ thay thế mật khẩu cũ trên Neo4j.
- **Kích hoạt:** Người dùng nhấn liên kết 'Quên mật khẩu?' tại form đăng nhập.
- **Chuỗi sự kiện chính:**
  1. Người dùng nhấn vào liên kết 'Quên mật khẩu?'.
  2. Hệ thống hiển thị form nhập email khôi phục gồm trường: Địa chỉ Email.
  3. Người dùng nhập địa chỉ email đã đăng ký và nhấn 'Gửi link khôi phục'.
  4. Hệ thống kiểm tra địa chỉ email hợp lệ trên database Neo4j và tạo mã token xác thực khôi phục mật khẩu có hiệu lực trong 15 phút.
  5. Hệ thống gửi email chứa liên kết đặt lại mật khẩu và chuyển đổi màn hình sang trạng thái "Kiểm tra hộp thư!" hiển thị thông tin email đã gửi.
  6. Người dùng nhấp vào liên kết khôi phục trong email (được dẫn tới trang đặt lại mật khẩu kèm token).
  7. Hệ thống hiển thị giao diện nhập mật khẩu mới.
  8. Người dùng nhập mật khẩu mới và xác nhận mật khẩu mới, nhấn 'Xác nhận đặt lại'.
  9. Hệ thống cập nhật mật khẩu mới đã băm bảo mật vào Neo4j và hiển thị màn hình "Đặt lại thành công!".
  Use case chức năng “Quên mật khẩu” kết thúc.
- **Chuỗi sự kiện ngoại lệ:**
  5.a. Hệ thống không gửi được email (lỗi SMTP hoặc kết nối mạng).
  5.a.1. Hệ thống hiển thị thông báo lỗi gửi email.
  5.a.2. Người dùng liên hệ Quản trị viên hoặc thử lại sau.

  6.a. Liên kết đặt lại mật khẩu đã hết hạn (quá 15 phút) hoặc không hợp lệ.
  6.a.1. Hệ thống hiển thị giao diện báo lỗi liên kết không hợp lệ.
  6.a.2. Người dùng nhấn yêu cầu gửi lại liên kết khôi phục mới.

  8.a. Mật khẩu mới và mật khẩu xác nhận không trùng khớp hoặc mật khẩu mới dưới 6 ký tự.
  8.a.1. Hệ thống hiển thị thông báo lỗi tương ứng.
  8.a.2. Người dùng nhập lại thông tin mật khẩu.
  Use case quay lại bước 7.

---

### Bảng 3.9. Đặc tả chức năng Đăng xuất

- **Mô tả:** Cho phép người dùng thoát phiên làm việc hiện tại để đảm bảo an toàn tài khoản.
- **Actor:** Giảng viên, Quản trị viên
- **Tiền điều kiện:** Người dùng đang trong trạng thái đăng nhập.
- **Hậu điều kiện:** Hủy phiên làm việc, xóa token xác thực, quay lại trang chủ công khai.
- **Đảm bảo tối thiểu:** Thông tin tài khoản và trạng thái hệ thống được giữ an toàn.
- **Đảm bảo thành công:** Xóa sạch token và không thể dùng phím Back của trình duyệt để quay lại trang cá nhân.
- **Kích hoạt:** Người dùng nhấn chọn nút Đăng xuất trên menu tài khoản.
- **Chuỗi sự kiện chính:**
  1. Người dùng click chọn nút 'Đăng xuất'.
  2. Hệ thống tiến hành xóa toàn bộ thông tin vai trò, thông tin người dùng và token lưu trong bộ nhớ LocalStorage của trình duyệt.
  3. Hệ thống chuyển hướng người dùng về trang chủ công khai của hệ thống.
  Use case chức năng “Đăng xuất” kết thúc.

---

### Bảng 3.10. Đặc tả chức năng Tra cứu (giảng viên/ công trình/ đề tài)

- **Mô tả:** Cho phép người dùng tìm kiếm thông tin giảng viên, công trình khoa học hoặc đề tài nghiên cứu trong hệ thống.
- **Actor:** Người dùng phổ thông, Giảng viên, Quản trị viên
- **Tiền điều kiện:** Thiết bị kết nối Internet, truy cập trang tra cứu tương ứng.
- **Hậu điều kiện:** Hệ thống hiển thị danh sách các giảng viên, công trình khoa học hoặc đề tài nghiên cứu khớp với từ khóa tìm kiếm.
- **Đảm bảo tối thiểu:** Hệ thống tiếp nhận yêu cầu tra cứu và giữ nguyên trạng thái cơ sở dữ liệu.
- **Đảm bảo thành công:** Hiển thị chính xác thông tin danh sách kết quả tìm kiếm tương ứng.
- **Kích hoạt:** Người dùng nhập từ khóa tìm kiếm và chọn các điều kiện lọc.
- **Chuỗi sự kiện chính:**
  1. Người dùng truy cập chức năng tra cứu (Giảng viên, Công trình hoặc Đề tài).
  2. Hệ thống hiển thị giao diện với ô tìm kiếm và danh mục bộ lọc tương ứng.
  3. Người dùng nhập từ khóa tìm kiếm và chọn các điều kiện lọc (Bộ môn, Học vị đối với Giảng viên; Năm xuất bản đối với Công trình; Cấp đề tài đối với Đề tài).
  4. Hệ thống kiểm tra dữ liệu tìm kiếm và tự động truy vấn cơ sở dữ liệu đồ thị Neo4j dựa trên từ khóa và bộ lọc.
  5. Hệ thống hiển thị danh sách kết quả phù hợp lên giao diện tra cứu.
  Use case chức năng “Tra cứu (giảng viên/ công trình/ đề tài)” kết thúc.
- **Chuỗi sự kiện ngoại lệ:**
  4.a. Không tìm thấy kết quả phù hợp.
  4.a.1. Hệ thống hiển thị thông báo "Không tìm thấy kết quả phù hợp".
  4.a.2. Người dùng thay đổi từ khóa hoặc điều kiện lọc.
  Use case quay lại bước 3.

---

### Bảng 3.11. Đặc tả chức năng Xem chi tiết (giảng viên/ công trình/ đề tài)

- **Mô tả:** Cho phép người dùng xem thông tin chi tiết của một giảng viên, một công trình khoa học hoặc một đề tài nghiên cứu cụ thể trong hệ thống.
- **Actor:** Người dùng phổ thông, Giảng viên, Quản trị viên
- **Tiền điều kiện:** Hệ thống đã hiển thị danh sách hoặc kết quả tìm kiếm giảng viên, công trình khoa học hoặc đề tài.
- **Hậu điều kiện:** Giao diện hiển thị chi tiết thông tin của thực thể được chọn.
- **Đảm bảo tối thiểu:** Hệ thống tiếp nhận yêu cầu xem chi tiết.
- **Đảm bảo thành công:** Hiển thị chính xác toàn bộ thuộc tính, lịch sử và các liên kết liên quan đến thực thể được chọn.
- **Kích hoạt:** Người dùng click vào tên giảng viên, công trình hoặc đề tài để xem chi tiết.
- **Chuỗi sự kiện chính:**
  1. Người dùng chọn đối tượng giảng viên, công trình hoặc đề tài cần xem chi tiết trong danh sách.
  2. Hệ thống chuyển hướng người dùng đến trang chi tiết thực thể tương ứng.
  3. Hệ thống tải dữ liệu chi tiết của đối tượng cùng các mối quan hệ liên kết liên quan từ cơ sở dữ liệu đồ thị Neo4j.
  4. Hệ thống hiển thị đầy đủ thông tin chi tiết (Lý lịch khoa học đối với Giảng viên; Tiêu đề, tóm tắt, tác giả đối với Công trình; Chủ nhiệm, kinh phí, thành viên đối với Đề tài) cùng bản đồ tri thức thu nhỏ của thực thể đó.
  Use case chức năng “Xem chi tiết (giảng viên/ công trình/ đề tài)” kết thúc.
- **Chuỗi sự kiện ngoại lệ:**
  3.a. Thực thể không tồn tại hoặc đã bị xóa.
  3.a.1. Hệ thống hiển thị thông báo đối tượng không tồn tại.
  3.a.2. Người dùng quay lại danh sách tra cứu.
  Use case quay lại bước 1.

---

### Bảng 3.12. Đặc tả chức năng Hỏi đáp qua Chatbot GraphRAG

- **Mô tả:** Cho phép người dùng gửi câu hỏi tự nhiên bằng tiếng Việt và nhận câu trả lời chính xác được trích xuất từ đồ thị tri thức thông qua LLM Gemini.
- **Actor:** Người dùng phổ thông, Giảng viên, Quản trị viên
- **Tiền điều kiện:** Khung chat GraphRAG Chatbot được mở.
- **Hậu điều kiện:** Nhận được phản hồi ngôn ngữ tự nhiên chính xác kèm trích dẫn dữ liệu.
- **Đảm bảo tối thiểu:** Hệ thống tiếp nhận yêu cầu hỏi đáp.
- **Đảm bảo thành công:** Hiển thị câu trả lời tự nhiên chính xác và trích xuất đúng thông tin trong đồ thị tri thức.
- **Kích hoạt:** Người dùng nhập câu hỏi vào ô chat và nhấn Gửi.
- **Chuỗi sự kiện chính:**
  1. Người dùng mở khung chat chatbot.
  2. Hệ thống hiển thị giao diện chat cùng lời chào và một số câu hỏi gợi ý.
  3. Người dùng nhập câu hỏi tự nhiên bằng tiếng Việt vào ô chat và nhấn nút Gửi (hoặc Enter).
  4. Hệ thống khóa ô nhập và hiển thị trạng thái "đang xử lý".
  5. Backend thực hiện tìm kiếm ngữ nghĩa, truy vấn dữ liệu thực tế từ Neo4j (Graph Retrieval) và gửi kèm ngữ cảnh cho mô hình ngôn ngữ lớn (Gemini LLM) để sinh câu trả lời.
  6. Hệ thống hiển thị câu trả lời tự nhiên lên giao diện chat, kèm theo các trích dẫn nguồn dữ liệu thực tế (link đến giảng viên, công trình, đề tài liên quan).
  Use case chức năng “Hỏi đáp qua Chatbot GraphRAG” kết thúc.
- **Chuỗi sự kiện ngoại lệ:**
  5.a. Lỗi kết nối dịch vụ AI hoặc máy chủ backend.
  5.a.1. Hệ thống hiển thị thông báo: "Không thể kết nối đến máy chủ hoặc dịch vụ AI đang bận".
  5.a.2. Hệ thống mở khóa ô nhập để người dùng gửi lại câu hỏi.
  Use case quay lại bước 3.

---

### Bảng 3.13. Đặc tả chức năng Xem bản đồ tri thức tương tác

- **Mô tả:** Cho phép người dùng tương tác trực tiếp với giao diện mạng lưới đồ thị tri thức khoa học gồm các nút giảng viên, công trình, đề tài và các mối quan hệ liên kết.
- **Actor:** Người dùng phổ thông, Giảng viên, Quản trị viên
- **Tiền điều kiện:** Người dùng chọn mục 'Khám phá'.
- **Hậu điều kiện:** Render đồ thị tương tác Vis.js trên màn hình.
- **Đảm bảo tối thiểu:** Hệ thống tiếp nhận yêu cầu và hiển thị giao diện bản đồ.
- **Đảm bảo thành công:** Hiển thị đúng mạng lưới đồ thị tri thức khoa học, cho phép kéo thả, phóng to, thu nhỏ và chọn nút xem chi tiết.
- **Kích hoạt:** Người dùng nhấn chọn 'Khám phá' trên thanh menu chính.
- **Chuỗi sự kiện chính:**
  1. Người dùng nhấn chọn mục 'Khám phá' trên thanh menu chính.
  2. Hệ thống tải toàn bộ mạng lưới thực thể và mối quan hệ từ backend và render đồ thị mạng lưới tương tác (sử dụng thư viện Vis.js).
  3. Người dùng có thể kéo thả các nút thực thể, cuộn chuột để phóng to/thu nhỏ đồ thị.
  4. Người dùng click chọn một nút thực thể cụ thể (Giảng viên, Công trình, Đề tài).
  5. Hệ thống hiển thị panel thông tin tóm tắt bên cạnh màn hình, kèm liên kết xem chi tiết thực thể.
  Use case chức năng “Xem bản đồ tri thức tương tác” kết thúc.

---

### Bảng 3.14. Đặc tả chức năng Xem thống kê hệ thống

- **Mô tả:** Cho phép người dùng xem các biểu đồ phân tích thống kê dữ liệu khoa học của khoa dưới dạng trực quan.
- **Actor:** Người dùng phổ thông, Giảng viên, Quản trị viên
- **Tiền điều kiện:** Người dùng truy cập trang 'Thống kê'.
- **Hậu điều kiện:** Các biểu đồ thống kê Chart.js hiển thị đầy đủ.
- **Đảm bảo tối thiểu:** Hệ thống tiếp nhận yêu cầu và hiển thị giao diện báo cáo.
- **Đảm bảo thành công:** Hiển thị biểu đồ thống kê chính xác số lượng công trình theo năm, tỉ lệ đề tài các cấp và cơ cấu học vị giảng viên.
- **Kích hoạt:** Người dùng nhấn chọn mục 'Thống kê' trên thanh điều hướng.
- **Chuỗi sự kiện chính:**
  1. Người dùng chọn mục 'Thống kê' trên thanh điều hướng.
  2. Backend thực hiện truy vấn tổng hợp số liệu từ cơ sở dữ liệu Neo4j.
  3. Hệ thống hiển thị các con số tổng hợp (Tổng số giảng viên, công trình, đề tài) cùng các biểu đồ thống kê trực quan (sử dụng thư viện Chart.js) bao gồm: cơ cấu học vị giảng viên, tỷ lệ đề tài các cấp, số lượng công trình công bố theo năm.
  Use case chức năng “Xem thống kê hệ thống” kết thúc.

---

### Bảng 3.15. Đặc tả chức năng Xem mạng lưới hợp tác

- **Mô tả:** Cho phép người dùng xem biểu đồ mạng lưới đồng tác giả giữa các giảng viên và bảng xếp hạng kết nối nghiên cứu khoa học.
- **Actor:** Người dùng phổ thông, Giảng viên, Quản trị viên
- **Tiền điều kiện:** Thiết bị kết nối Internet, người dùng chọn mục 'Hợp tác'.
- **Hậu điều kiện:** Render đồ thị Vis.js biểu diễn mạng lưới giảng viên hợp tác thông qua các công trình/đề tài chung.
- **Đảm bảo tối thiểu:** Hệ thống tiếp nhận yêu cầu và hiển thị giao diện mạng lưới.
- **Đảm bảo thành công:** Render chính xác mạng lưới hợp tác, các chỉ số Centrality và bảng xếp hạng giảng viên.
- **Kích hoạt:** Người dùng chọn mục 'Hợp tác' trên thanh điều hướng.
- **Chuỗi sự kiện chính:**
  1. Người dùng chọn mục 'Hợp tác' trên thanh điều hướng.
  2. Hệ thống tải dữ liệu mạng lưới hợp tác và render đồ thị đồng tác giả (Vis.js).
  3. Hệ thống hiển thị bảng xếp hạng giảng viên có chỉ số kết nối (Degree Centrality) cao nhất.
  4. Người dùng có thể kéo, thu phóng đồ thị hợp tác hoặc click vào một giảng viên để xem chi tiết các đồng tác giả liên quan.
  Use case chức năng “Xem mạng lưới hợp tác” kết thúc.

---

### Bảng 3.16. Đặc tả chức năng Quản lý tài khoản lý lịch cá nhân (Giảng viên)

- **Mô tả:** Cho phép giảng viên quản lý thông tin lý lịch cá nhân và mật khẩu tài khoản trong hệ thống.
- **Actor:** Giảng viên
- **Tiền điều kiện:** Giảng viên đã đăng nhập thành công.
- **Hậu điều kiện:** Dữ liệu tài khoản, lý lịch hoặc mật khẩu được cập nhật thành công.
- **Đảm bảo tối thiểu:** Hệ thống tiếp nhận yêu cầu quản lý tài khoản.
- **Đảm bảo thành công:** Hệ thống lưu thành công dữ liệu cập nhật lý lịch hoặc mật khẩu vào cơ sở dữ liệu.
- **Kích hoạt:** Giảng viên muốn quản lý thông tin tài khoản lý lịch cá nhân.
- **Chuỗi sự kiện chính:**
  1. Giảng viên truy cập chức năng “Thông tin cá nhân”.
  2. Hệ thống hiển thị thông tin lý lịch và tài khoản hiện tại.
  3. Giảng viên chọn chỉnh sửa lý lịch hoặc đổi mật khẩu.
  4. Hệ thống hiển thị biểu mẫu thông tin tương ứng.
  5. Giảng viên nhập hoặc cập nhật thông tin lý lịch hoặc mật khẩu.
  6. Hệ thống kiểm tra dữ liệu nhập vào.
  7. Hệ thống lưu dữ liệu cập nhật (hoặc yêu cầu chờ duyệt) vào cơ sở dữ liệu.
  8. Hệ thống hiển thị thông báo cập nhật dữ liệu thành công.
  Use case chức năng “Quản lý tài khoản lý lịch cá nhân (Giảng viên)” kết thúc.
- **Chuỗi sự kiện ngoại lệ:**
  6.a. Dữ liệu nhập vào không hợp lệ hoặc mật khẩu cũ không khớp.
  6.a.1. Hệ thống hiển thị thông báo lỗi dữ liệu.
  6.a.2. Giảng viên cập nhật lại thông tin.
  Use case quay lại bước 5.

---

### Bảng 3.17a. Đặc tả chức năng Xem danh sách công trình cá nhân (Giảng viên)

- **Mô tả:** Cho phép giảng viên xem danh mục các công trình khoa học cá nhân đã khai báo trên hệ thống cùng trạng thái phê duyệt tương ứng.
- **Actor:** Giảng viên
- **Tiền điều kiện:** Giảng viên đã đăng nhập và truy cập giao diện Quản lý công trình cá nhân.
- **Hậu điều kiện:** Bảng danh sách công trình cá nhân được hiển thị đầy đủ.
- **Đảm bảo tối thiểu:** Hệ thống giữ nguyên trạng thái cũ, không thay đổi cơ sở dữ liệu.
- **Đảm bảo thành công:** Hiển thị chính xác danh sách các công trình liên kết với giảng viên (mối quan hệ TAC_GIA) và trạng thái phê duyệt.
- **Kích hoạt:** Giảng viên nhấn chọn mục 'Công trình khoa học' trên menu tài khoản.
- **Chuỗi sự kiện chính:**
  1. Giảng viên truy cập chức năng “Quản lý công trình cá nhân”.
  2. Hệ thống gửi yêu cầu lấy danh sách công trình cá nhân của giảng viên hiện tại lên backend.
  3. Backend truy vấn các nút CongTrinh liên kết với giảng viên thông qua mối quan hệ TAC_GIA, lọc bỏ các thực thể đã bị xóa mềm (is_deleted = true).
  4. Hệ thống hiển thị bảng danh sách công trình gồm các trường thông tin: ID, tên công trình, nơi công bố, năm xuất bản, trạng thái phê duyệt (Đã phê duyệt, Chờ duyệt, Từ chối, Yêu cầu xóa) và các nút hành động.
  Use case chức năng “Xem danh sách công trình cá nhân (Giảng viên)” kết thúc.

---

### Bảng 3.17b. Đặc tả chức năng Thêm mới công trình cá nhân (Giảng viên)

- **Mô tả:** Cho phép giảng viên khai báo thêm một công trình khoa học mới và gửi yêu cầu phê duyệt lên Admin.
- **Actor:** Giảng viên
- **Tiền điều kiện:** Giảng viên đang ở giao diện danh sách công trình cá nhân.
- **Hậu điều kiện:** Công trình mới được tạo trên Neo4j ở trạng thái chờ duyệt.
- **Đảm bảo tối thiểu:** Công trình mới không được tạo, cơ sở dữ liệu Neo4j không đổi.
- **Đảm bảo thành công:** Tạo thành công nút CongTrinh mới có status = 'Chờ duyệt' và liên kết mối quan hệ tác giả đến giảng viên cùng các đồng tác giả được chỉ định.
- **Kích hoạt:** Giảng viên nhấn nút 'Thêm mới', điền form và nhấn 'Lưu'.
- **Chuỗi sự kiện chính:**
  1. Giảng viên nhấn nút 'Thêm mới' trên giao diện quản lý công trình.
  2. Hệ thống hiển thị biểu mẫu (form) khai báo công trình (Tên công trình, Năm xuất bản, Nơi xuất bản, Tóm tắt, Link bài viết/Upload PDF, chọn đồng tác giả trong khoa, tác giả ngoài khoa).
  3. Giảng viên nhập đầy đủ thông tin, tải lên file PDF minh chứng (nếu có), lựa chọn đồng tác giả (nếu có) và nhấn nút 'Lưu'.
  4. Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào.
  5. Backend tạo nút CongTrinh mới trên Neo4j ở trạng thái `status = 'Chờ duyệt'`, liên kết mối quan hệ tác giả (`TAC_GIA`) với giảng viên hiện tại và các đồng tác giả đã chọn.
  6. Hệ thống hiển thị thông báo gửi yêu cầu thêm mới thành công và tải lại bảng danh sách công trình.
  Use case chức năng “Thêm mới công trình cá nhân (Giảng viên)” kết thúc.
- **Chuỗi sự kiện ngoại lệ:**
  4.a. Nhập thiếu thông tin bắt buộc hoặc định dạng file tải lên không hợp lệ.
  4.a.1. Hệ thống hiển thị thông báo lỗi chi tiết trên form.
  4.a.2. Giảng viên cập nhật lại thông tin.
  Use case quay lại bước 3.

---

### Bảng 3.17c. Đặc tả chức năng Chỉnh sửa công trình cá nhân (Giảng viên)

- **Mô tả:** Cho phép giảng viên chỉnh sửa thông tin công trình khoa học cá nhân đã khai báo và gửi yêu cầu duyệt thay đổi lên Admin.
- **Actor:** Giảng viên
- **Tiền điều kiện:** Giảng viên chọn công trình cần sửa trong danh sách (công trình không ở trạng thái pending).
- **Hậu điều kiện:** Dữ liệu chỉnh sửa của công trình được lưu và chuyển trạng thái về chờ duyệt.
- **Đảm bảo tối thiểu:** Giữ nguyên thông tin cũ của công trình trên Neo4j nếu gặp lỗi khi lưu.
- **Đảm bảo thành công:** Cập nhật các thuộc tính và mối quan hệ tác giả của công trình trên Neo4j, đặt status = 'Chờ duyệt'.
- **Kích hoạt:** Giảng viên nhấn nút 'Sửa' công trình, thay đổi dữ liệu và nhấn 'Lưu'.
- **Chuỗi sự kiện chính:**
  1. Giảng viên click chọn nút 'Sửa' (biểu tượng bút viết) tại dòng công trình tương ứng.
  2. Hệ thống hiển thị form nhập thông tin công trình với dữ liệu hiện tại được điền sẵn.
  3. Giảng viên sửa đổi các thông tin cần thiết và nhấn nút 'Lưu'.
  4. Hệ thống kiểm tra tính hợp lệ của dữ liệu đầu vào.
  5. Backend cập nhật các thuộc tính của nút CongTrinh trên Neo4j, đặt `status = 'Chờ duyệt'`.
  6. Hệ thống thông báo lưu thay đổi thành công và tải lại danh sách công trình.
  Use case chức năng “Chỉnh sửa công trình cá nhân (Giảng viên)” kết thúc.
- **Chuỗi sự kiện ngoại lệ:**
  1.a. Công trình đang ở trạng thái `Chờ duyệt` hoặc `Yêu cầu xóa`.
  1.a.1. Hệ thống vô hiệu hóa (disable) và làm mờ nút 'Sửa' của công trình đó trên dòng danh sách để ngăn chặn chỉnh sửa.
  Use case dừng lại.
- **Chuỗi sự kiện thay thế:**
  3.a. Công trình bị từ chối trước đó (`status = 'Từ chối'`).
  3.a.1. Giảng viên chỉnh sửa thông tin bị từ chối và nhấn nút 'Nộp lại' (Lưu).
  3.a.2. Backend cập nhật dữ liệu và chuyển trạng thái công trình từ `Từ chối` thành `Chờ duyệt`.
  3.a.3. Hệ thống thông báo nộp lại công trình thành công.
  Use case dừng lại.

---

### Bảng 3.17d. Đặc tả chức năng Xóa công trình cá nhân (Giảng viên)

- **Mô tả:** Cho phép giảng viên xóa công trình cá nhân bằng cách gửi yêu cầu xóa tới Admin hoặc xóa trực tiếp nếu công trình đang bị từ chối.
- **Actor:** Giảng viên
- **Tiền điều kiện:** Giảng viên chọn công trình cần xóa trong danh sách.
- **Hậu điều kiện:** Công trình chuyển sang trạng thái yêu cầu xóa (chờ duyệt) hoặc bị xóa mềm trực tiếp đưa vào thùng rác cá nhân (nếu bị từ chối trước đó).
- **Đảm bảo tối thiểu:** Công trình không bị thay đổi trạng thái xóa, dữ liệu giữ nguyên.
- **Đảm bảo thành công:** Thiết lập status = 'Yêu cầu xóa' hoặc gán cờ is_deleted = true thành công trên Neo4j.
- **Kích hoạt:** Giảng viên nhấn nút Xóa công trình tương ứng và xác nhận hành động.
- **Chuỗi sự kiện chính:**
  1. Giảng viên click chọn nút 'Xóa' (biểu tượng thùng rác) tại dòng công trình tương ứng.
  2. Hệ thống hiển thị popup xác nhận gửi yêu cầu xóa tới Admin.
  3. Giảng viên nhấn xác nhận đồng ý.
  4. Backend thực hiện cập nhật trạng thái công trình thành `status = 'Yêu cầu xóa'` trên Neo4j.
  5. Hệ thống hiển thị thông báo đã gửi yêu cầu xóa và tải lại danh sách công trình.
  Use case chức năng “Xóa công trình cá nhân (Giảng viên)” kết thúc.
- **Chuỗi sự kiện ngoại lệ:**
  1.a. Công trình đang ở trạng thái `Chờ duyệt` hoặc `Yêu cầu xóa`.
  1.a.1. Hệ thống vô hiệu hóa và làm mờ nút 'Xóa' của công trình trên dòng danh sách.
  Use case dừng lại.
- **Chuỗi sự kiện thay thế:**
  1.b. Công trình đang ở trạng thái bị từ chối (`status = 'Từ chối'`).
  1.b.1. Hệ thống hiển thị popup xác nhận xóa trực tiếp công trình.
  1.b.2. Giảng viên nhấn xác nhận đồng ý.
  1.b.3. Backend thực hiện xóa mềm công trình (`is_deleted = true`, `deleted_at = timestamp`) trên Neo4j mà không cần Admin phê duyệt.
  1.b.4. Hệ thống ẩn công trình khỏi danh sách và đưa vào thùng rác cá nhân của giảng viên.
  Use case dừng lại.

---

### Bảng 3.18. Đặc tả chức năng Quản lý đề tài cá nhân (Giảng viên)

- **Mô tả:** Cho phép giảng viên quản lý các đề tài nghiên cứu khoa học cá nhân trong hệ thống.
- **Actor:** Giảng viên
- **Tiền điều kiện:** Giảng viên đã đăng nhập thành công.
- **Hậu điều kiện:** Dữ liệu đề tài cá nhân được cập nhật thành công.
- **Đảm bảo tối thiểu:** Hệ thống tiếp nhận yêu cầu quản lý đề tài cá nhân.
- **Đảm bảo thành công:** Hệ thống lưu thành công dữ liệu đề tài cá nhân vào cơ sở dữ liệu.
- **Kích hoạt:** Giảng viên muốn quản lý thông tin đề tài cá nhân.
- **Chuỗi sự kiện chính:**
  1. Giảng viên truy cập chức năng “Quản lý đề tài cá nhân”.
  2. Hệ thống hiển thị danh sách đề tài cá nhân hiện có.
  3. Giảng viên chọn thêm, sửa hoặc yêu cầu xóa đề tài.
  4. Hệ thống hiển thị biểu mẫu thông tin đề tài.
  5. Giảng viên nhập hoặc cập nhật thông tin đề tài.
  6. Hệ thống kiểm tra dữ liệu đề tài.
  7. Hệ thống lưu dữ liệu đề tài (hoặc yêu cầu chờ duyệt) vào cơ sở dữ liệu.
  8. Hệ thống hiển thị thông báo cập nhật dữ liệu thành công.
  Use case chức năng “Quản lý đề tài cá nhân (Giảng viên)” kết thúc.
- **Chuỗi sự kiện ngoại lệ:**
  6.a. Dữ liệu đề tài không hợp lệ.
  6.a.1. Hệ thống hiển thị thông báo lỗi dữ liệu.
  6.a.2. Giảng viên cập nhật lại thông tin đề tài.
  Use case quay lại bước 5.

---

### Bảng 3.19. Đặc tả chức năng Xem dòng thời gian (Giảng viên)

- **Mô tả:** Trực quan hóa toàn bộ quá trình nghiên cứu khoa học (các công trình đã công bố và các đề tài đã thực hiện) của giảng viên dưới dạng dòng thời gian đứng có tính tương tác.
- **Actor:** Giảng viên
- **Tiền điều kiện:** Giảng viên đăng nhập thành công và truy cập mục 'Dòng thời gian'.
- **Hậu điều kiện:** Lịch sử hoạt động nghiên cứu khoa học của giảng viên được hiển thị trực quan theo năm.
- **Đảm bảo tối thiểu:** Hệ thống tiếp nhận yêu cầu và giữ nguyên cơ sở dữ liệu.
- **Đảm bảo thành công:** Hiển thị đầy đủ, chính xác các công trình (theo năm xuất bản) và đề tài (theo năm bắt đầu) của giảng viên theo trình tự thời gian giảm dần.
- **Kích hoạt:** Giảng viên chọn mục 'Dòng thời gian' trên thanh menu.
- **Chuỗi sự kiện chính:**
  1. Giảng viên truy cập chức năng “Xem dòng thời gian (Giảng viên)”.
  2. Hệ thống gửi yêu cầu lấy toàn bộ hoạt động nghiên cứu của giảng viên hiện tại về backend.
  3. Backend truy vấn các nút CongTrinh (theo năm xuất bản) và DeTai (theo năm bắt đầu) liên kết với nút GiangVien đó.
  4. Hệ thống sắp xếp các sự kiện khoa học theo năm giảm dần và hiển thị giao diện dòng thời gian nghiên cứu khoa học đứng có tính tương tác.
  5. Giảng viên có thể click vào bất kỳ sự kiện nào trên dòng thời gian để hiển thị popup thông tin chi tiết của công trình/đề tài tương ứng.
  Use case chức năng “Xem dòng thời gian (Giảng viên)” kết thúc.
- **Chuỗi sự kiện ngoại lệ:**
  4.a. Giảng viên chưa có bất kỳ công trình hoặc đề tài nào đã được phê duyệt.
  4.a.1. Hệ thống hiển thị thông báo: "Bạn chưa có hoạt động nghiên cứu khoa học nào".
  Use case dừng lại.

---

### Bảng 3.20. Đặc tả chức năng Xem danh sách giảng viên (Quản trị viên)

- **Mô tả:** Cho phép Admin xem danh sách toàn bộ hồ sơ giảng viên trong khoa và trạng thái lý lịch khoa học của họ.
- **Actor:** Quản trị viên
- **Tiền điều kiện:** Admin đăng nhập thành công, chọn mục Quản lý giảng viên.
- **Hậu điều kiện:** Bảng danh sách giảng viên hiển thị đầy đủ thông tin cơ bản.
- **Đảm bảo tối thiểu:** Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.
- **Đảm bảo thành công:** Hiển thị chính xác danh sách giảng viên kèm học vị, bộ môn và trạng thái duyệt hồ sơ.
- **Kích hoạt:** Admin click chọn mục 'Quản lý giảng viên' trên sidebar.
- **Chuỗi sự kiện chính:**
  1. Admin chọn mục 'Quản lý giảng viên' trên sidebar.
  2. Hệ thống gửi yêu cầu lấy danh sách giảng viên về backend.
  3. Backend truy vấn danh sách tất cả các nút GiangVien (chưa bị xóa mềm) trong cơ sở dữ liệu Neo4j.
  4. Hệ thống hiển thị danh sách giảng viên lên giao diện quản trị (gồm Mã giảng viên, họ tên, học vị, bộ môn, trạng thái công tác, hành động).
  5. Đối với các giảng viên có yêu cầu thay đổi lý lịch chờ phê duyệt (`profile_edit_status = 'Chờ duyệt'`), hệ thống hiển thị nhãn "Chờ duyệt hồ sơ" màu vàng nổi bật cạnh tên giảng viên.
  Use case chức năng “Xem danh sách giảng viên (Quản trị viên)” kết thúc.

---

### Bảng 3.21. Đặc tả chức năng Xem chi tiết giảng viên (Quản trị viên)

- **Mô tả:** Cho phép Admin xem thông tin chi tiết, lịch sử công trình khoa học và đề tài nghiên cứu của một giảng viên cụ thể trong khoa.
- **Actor:** Quản trị viên
- **Tiền điều kiện:** Admin đang ở danh sách giảng viên.
- **Hậu điều kiện:** Giao diện chi tiết hoặc thống kê giảng viên hiển thị đầy đủ thông tin.
- **Đảm bảo tối thiểu:** Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.
- **Đảm bảo thành công:** Hiển thị chính xác các thông tin lý lịch cá nhân cùng danh sách công trình, đề tài khoa học giảng viên đã tham gia.
- **Kích hoạt:** Admin nhấn nút 'Xem chi tiết' tại giảng viên tương ứng trên dòng danh sách.
- **Chuỗi sự kiện chính:**
  1. Admin click nút 'Xem chi tiết' (biểu tượng mắt màu cam) tại dòng giảng viên cần xem.
  2. Hệ thống hiển thị popup/modal chi tiết hoặc chuyển hướng đến trang thống kê hoạt động giảng viên.
  3. Backend truy vấn cơ sở dữ liệu Neo4j để lấy thông tin chi tiết và thống kê số lượng công trình, đề tài giảng viên tham gia.
  4. Hệ thống hiển thị đầy đủ các thông tin cá nhân, danh sách các công trình, đề tài và biểu đồ hoạt động nghiên cứu của giảng viên đó.
  5. Admin xem thông tin và nhấn nút 'Đóng' hoặc quay lại danh sách.
  Use case chức năng “Xem chi tiết giảng viên (Quản trị viên)” kết thúc.

---

### Bảng 3.22. Đặc tả chức năng Thêm mới giảng viên (Quản trị viên)

- **Mô tả:** Cho phép Admin tạo mới một hồ sơ lý lịch khoa học cho giảng viên trực tiếp trên cơ sở dữ liệu đồ thị Neo4j.
- **Actor:** Quản trị viên
- **Tiền điều kiện:** Admin ở giao diện Quản lý giảng viên.
- **Hậu điều kiện:** Nút GiangVien mới được khởi tạo và liên kết thành công vào bộ môn tương ứng.
- **Đảm bảo tối thiểu:** Hồ sơ giảng viên mới không được tạo; cơ sở dữ liệu Neo4j không thay đổi.
- **Đảm bảo thành công:** Tạo nút GiangVien mới và thiết lập mối quan hệ THUOC_BO_MON với bộ môn chỉ định trên Neo4j.
- **Kích hoạt:** Admin nhấn nút 'Thêm giảng viên', điền thông tin giảng viên và nhấn nút Lưu.
- **Chuỗi sự kiện chính:**
  1. Admin nhấn nút 'Thêm giảng viên' (hoặc nút dấu cộng).
  2. Giao diện hiển thị form điền thông tin lý lịch (Mã giảng viên, Họ và tên, Username, Email, Mật khẩu khởi tạo, Bộ môn, Học vị, Chức danh, Chức vụ, Điện thoại, Chuyên ngành, Trạng thái công tác, Ảnh đại diện, Hướng nghiên cứu).
  3. Admin nhập đầy đủ thông tin bắt buộc và chọn bộ môn trực thuộc.
  4. Admin nhấn nút 'Lưu'.
  5. Backend thực hiện xác thực đầu vào, kiểm tra Mã giảng viên và Email không được trùng lặp trong hệ thống.
  6. Backend tạo nút GiangVien mới trên Neo4j và tạo mối quan hệ `THUOC_BO_MON` đến nút BoMon tương ứng.
  7. Hệ thống thông báo tạo giảng viên thành công và tải lại bảng danh sách.
  Use case chức năng “Thêm mới giảng viên (Quản trị viên)” kết thúc.
- **Chuỗi sự kiện ngoại lệ:**
  5.a. Trùng lặp Mã giảng viên hoặc Email giảng viên với hồ sơ đã tồn tại trên Neo4j.
  5.a.1. Hệ thống hiển thị thông báo lỗi trùng lặp chi tiết.
  5.a.2. Admin sửa lại thông tin.
  Use case quay lại bước 3.

---

### Bảng 3.23. Đặc tả chức năng Sửa thông tin giảng viên (Quản trị viên)

- **Mô tả:** Cho phép Admin trực tiếp chỉnh sửa thông tin lý lịch khoa học của một giảng viên trên hệ thống.
- **Actor:** Quản trị viên
- **Tiền điều kiện:** Admin chọn giảng viên cần chỉnh sửa trong danh sách giảng viên.
- **Hậu điều kiện:** Các thuộc tính của nút GiangVien được cập nhật mới trên Neo4j.
- **Đảm bảo tối thiểu:** Hồ sơ giảng viên được giữ nguyên trạng thái cũ; thay đổi chưa được cập nhật.
- **Đảm bảo thành công:** Thông tin cập nhật được lưu trực tiếp và hiển thị ngay lập tức trên hệ thống công khai.
- **Kích hoạt:** Admin nhấn nút Sửa thông tin giảng viên và cập nhật dữ liệu.
- **Chuỗi sự kiện chính:**
  1. Admin click chọn nút 'Sửa' (biểu tượng bút viết) tại dòng giảng viên cần chỉnh sửa.
  2. Hệ thống hiển thị form chứa toàn bộ thông tin lý lịch hiện tại của giảng viên.
  3. Admin thay đổi các thông tin cần thiết (Bộ môn, học vị, chức vụ, trạng thái công tác, hướng nghiên cứu, v.v.) và nhấn nút 'Lưu'.
  4. Backend xác thực thông tin và thực thi truy vấn Cypher cập nhật trực tiếp các thuộc tính của nút GiangVien trên Neo4j, đồng thời điều chỉnh lại mối quan hệ `THUOC_BO_MON` nếu admin thay đổi bộ môn của giảng viên.
  5. Hệ thống thông báo: "Cập nhật thành công!" và tải lại danh sách giảng viên.
  Use case chức năng “Sửa thông tin giảng viên (Quản trị viên)” kết thúc.

---

### Bảng 3.24. Đặc tả chức năng Xóa giảng viên (Quản trị viên)

- **Mô tả:** Cho phép Admin thực hiện xóa mềm hồ sơ của một giảng viên ra khỏi danh sách hiển thị của hệ thống.
- **Actor:** Quản trị viên
- **Tiền điều kiện:** Admin chọn giảng viên cần xóa trong danh sách giảng viên.
- **Hậu điều kiện:** Nút GiangVien bị gán cờ is_deleted = true và ẩn đi trên trang công khai.
- **Đảm bảo tối thiểu:** Hồ sơ giảng viên không bị thay đổi trạng thái xóa mềm; dữ liệu Neo4j giữ nguyên.
- **Đảm bảo thành công:** Gán cờ is_deleted = true thành công, di chuyển thực thể vào thùng rác hệ thống.
- **Kích hoạt:** Admin nhấn nút Xóa giảng viên và xác nhận.
- **Chuỗi sự kiện chính:**
  1. Admin nhấn nút 'Xóa' (biểu tượng thùng rác màu đỏ) tại giảng viên tương ứng.
  2. Hệ thống hiển thị hộp thoại xác nhận: "Bạn có chắc chắn muốn xóa?"
  3. Admin nhấn nút xác nhận đồng ý xóa.
  4. Backend thực hiện gán thuộc tính `is_deleted = true` và lưu thời gian xóa `deleted_at = timestamp` trên nút GiangVien đó.
  5. Hệ thống ẩn giảng viên khỏi trang hiển thị danh sách công khai và đưa thực thể vào thùng rác của hệ thống quản lý.
  Use case chức năng “Xóa giảng viên (Quản trị viên)” kết thúc.

---

### Bảng 3.25. Đặc tả chức năng Phê duyệt yêu cầu thay đổi lý lịch (Quản trị viên)

- **Mô tả:** Cho phép Admin phê duyệt hoặc từ chối các yêu cầu cập nhật thông tin lý lịch cá nhân do giảng viên gửi lên.
- **Actor:** Quản trị viên
- **Tiền điều kiện:** Admin truy cập mục Quản lý Giảng viên.
- **Hậu điều kiện:** Thông tin lý lịch được cập nhật chính thức vào đồ thị Neo4j (nếu duyệt) hoặc xóa các thông tin tạm thời (nếu từ chối).
- **Đảm bảo tối thiểu:** Yêu cầu phê duyệt được giữ nguyên ở trạng thái chờ; thông tin lý lịch chính thức của giảng viên chưa bị thay đổi.
- **Đảm bảo thành công:** Đồng bộ thông tin từ các thuộc tính pending_* sang thuộc tính chính thức của nút GiangVien, cập nhật profile_edit_status thành 'Phê duyệt' hoặc 'Từ chối' và xóa bỏ các thuộc tính pending_*.
- **Kích hoạt:** Admin nhấn nút 'Phê duyệt', 'Từ chối' hoặc 'So sánh hồ sơ' tại giảng viên có yêu cầu chờ duyệt.
- **Chuỗi sự kiện chính:**
  1. Admin truy cập trang Quản lý Giảng viên.
  2. Hệ thống hiển thị danh sách giảng viên. Với giảng viên có yêu cầu lý lịch mới, hệ thống hiển thị nhãn "Chờ duyệt hồ sơ" và ba nút hành động: "Duyệt hồ sơ mới" (tích xanh), "Từ chối hồ sơ mới" (dấu x đỏ), và "So sánh hồ sơ" (mũi tên trao đổi màu xanh lam).
  3. Admin click chọn nút "So sánh hồ sơ".
  4. Hệ thống hiển thị một modal so sánh trực quan gồm bảng đối chiếu 3 cột: Trường thông tin, Thông tin hiện tại, Thông tin mới (Chờ duyệt). Các trường có thay đổi được làm nổi bật (màu vàng cam).
  5. Admin xem đối chiếu thông tin và nhấn chọn nút 'Phê duyệt' (hoặc 'Từ chối').
  6. Backend thực hiện cập nhật các thuộc tính lý lịch chính thức bằng giá trị của thuộc tính tạm thời tương ứng (ví dụ: `ho_va_ten = pending_ho_va_ten`, v.v.), xóa bỏ các thuộc tính tạm thời pending_*, và đặt `profile_edit_status = 'Phê duyệt'` trên Neo4j.
  7. Hệ thống hiển thị thông báo thành công và tải lại bảng danh sách giảng viên.
  Use case chức năng “Phê duyệt yêu cầu thay đổi lý lịch (Quản trị viên)” kết thúc.
- **Chuỗi sự kiện thay thế:**
  5.a. Admin nhấn nút 'Từ chối' trên modal so sánh (hoặc nhấn nút dấu x đỏ trực tiếp trên danh sách).
  5.a.1. Hệ thống hiển thị hộp thoại xác nhận từ chối.
  5.a.2. Admin xác nhận đồng ý từ chối.
  5.a.3. Backend thực hiện xóa bỏ các thuộc tính tạm thời pending_* (set null) trên nút GiangVien và đặt `profile_edit_status = 'Từ chối'`.
  5.a.4. Hệ thống thông báo từ chối thành công và tải lại danh sách giảng viên.
  Use case dừng lại.

---

### Bảng 3.26. Đặc tả chức năng quản lý công trình (admin)

- **Mô tả:** Cho phép quản trị viên xem danh sách, thêm mới, chỉnh sửa, xóa (xóa mềm) công trình khoa học hoặc phê duyệt/từ chối yêu cầu về công trình từ giảng viên.
- **Actor:** Quản trị viên
- **Tiền điều kiện:** Quản trị viên đã đăng nhập thành công và ở giao diện Quản lý công trình.
- **Hậu điều kiện:** Thông tin công trình được cập nhật trên Neo4j (nút CongTrinh được thêm mới, cập nhật thuộc tính, gán cờ `is_deleted = true`, hoặc cập nhật trạng thái phê duyệt).
- **Đảm bảo tối thiểu:** Cơ sở dữ liệu Neo4j không bị thay đổi nếu thao tác thất bại hoặc bị hủy.
- **Đảm bảo thành công:** Lưu trữ thành công thông tin công trình, liên kết chính xác với các giảng viên/tác giả ngoài liên quan, hoặc cập nhật đúng trạng thái phê duyệt của yêu cầu.
- **Kích hoạt:** Quản trị viên chọn mục "Quản lý công trình" trên sidebar.
- **Chuỗi sự kiện chính:**
  1. Quản trị viên truy cập mục "Quản lý công trình" trên giao diện quản trị.
  2. Hệ thống hiển thị danh sách các công trình hiện có và các yêu cầu chờ duyệt từ giảng viên.
  3. Quản trị viên chọn thêm mới, sửa thông tin, xóa công trình hoặc phê duyệt/từ chối yêu cầu.
  4. Hệ thống hiển thị giao diện tương ứng (biểu mẫu thông tin công trình, hộp thoại xác nhận xóa, hoặc bảng đối chiếu phê duyệt).
  5. Quản trị viên nhập/cập nhật thông tin công trình, xác nhận xóa, hoặc xác nhận duyệt/từ chối.
  6. Hệ thống thực hiện kiểm tra tính hợp lệ của dữ liệu đầu vào và trạng thái thao tác.
  7. Hệ thống thực hiện cập nhật cơ sở dữ liệu Neo4j (tạo/cập nhật nút CongTrinh, cập nhật cờ `is_deleted = true`, hoặc cập nhật trạng thái yêu cầu).
  8. Hệ thống hiển thị thông báo thành công và tải lại danh sách công trình.
  Use case chức năng “Quản lý công trình” kết thúc.
- **Chuỗi sự kiện ngoại lệ:**
  6.a. Dữ liệu công trình nhập vào không hợp lệ hoặc trùng lặp mã/tiêu đề.
  6.a.1. Hệ thống hiển thị thông báo lỗi chi tiết.
  6.a.2. Quản trị viên cập nhật lại thông tin.
  Use case quay lại bước 5.

---

### Bảng 3.27. Đặc tả chức năng quản lý đề tài (admin)

- **Mô tả:** Cho phép quản trị viên xem danh sách, thêm mới, chỉnh sửa, xóa (xóa mềm) đề tài nghiên cứu hoặc phê duyệt/từ chối yêu cầu về đề tài từ giảng viên.
- **Actor:** Quản trị viên
- **Tiền điều kiện:** Quản trị viên đã đăng nhập thành công và ở giao diện Quản lý đề tài.
- **Hậu điều kiện:** Thông tin đề tài được cập nhật trên Neo4j (nút DeTai được thêm mới, cập nhật thuộc tính, gán cờ `is_deleted = true`, hoặc cập nhật trạng thái phê duyệt).
- **Đảm bảo tối thiểu:** Cơ sở dữ liệu Neo4j không bị thay đổi nếu thao tác thất bại hoặc bị hủy.
- **Đảm bảo thành công:** Lưu trữ thành công thông tin đề tài, liên kết chính xác với giảng viên chủ nhiệm/thành viên tham gia, hoặc cập nhật đúng trạng thái phê duyệt của yêu cầu.
- **Kích hoạt:** Quản trị viên chọn mục "Quản lý đề tài" trên sidebar.
- **Chuỗi sự kiện chính:**
  1. Quản trị viên truy cập mục "Quản lý đề tài" trên giao diện quản trị.
  2. Hệ thống hiển thị danh sách các đề tài hiện có và các yêu cầu chờ duyệt từ giảng viên.
  3. Quản trị viên chọn thêm mới, sửa thông tin, xóa đề tài hoặc phê duyệt/từ chối yêu cầu.
  4. Hệ thống hiển thị giao diện tương ứng (biểu mẫu thông tin đề tài, hộp thoại xác nhận xóa, hoặc bảng đối chiếu phê duyệt).
  5. Quản trị viên nhập/cập nhật thông tin đề tài, xác nhận xóa, hoặc xác nhận duyệt/từ chối.
  6. Hệ thống thực hiện kiểm tra tính hợp lệ của dữ liệu đầu vào và trạng thái thao tác.
  7. Hệ thống thực hiện cập nhật cơ sở dữ liệu Neo4j (tạo/cập nhật nút DeTai, cập nhật cờ `is_deleted = true`, hoặc cập nhật trạng thái yêu cầu).
  8. Hệ thống hiển thị thông báo thành công và tải lại danh sách đề tài.
  Use case chức năng “Quản lý đề tài” kết thúc.
- **Chuỗi sự kiện ngoại lệ:**
  6.a. Dữ liệu đề tài nhập vào không hợp lệ hoặc trùng lặp mã số đề tài.
  6.a.1. Hệ thống hiển thị thông báo lỗi chi tiết.
  6.a.2. Quản trị viên cập nhật lại thông tin.
  Use case quay lại bước 5.

---

### Bảng 3.28. Đặc tả chức năng quản lý tác giả ngoài (admin)

- **Mô tả:** Cho phép quản trị viên xem danh sách, thêm mới, chỉnh sửa, xóa tác giả ngoài hoặc phê duyệt/từ chối yêu cầu tạo tác giả ngoài từ phía giảng viên.
- **Actor:** Quản trị viên
- **Tiền điều kiện:** Quản trị viên đã đăng nhập thành công và ở giao diện Quản lý tác giả ngoài.
- **Hậu điều kiện:** Thông tin tác giả ngoài được cập nhật trên Neo4j (nút TacGiaNgoai được thêm mới, cập nhật thuộc tính, gán cờ `is_deleted = true`, hoặc cập nhật trạng thái phê duyệt).
- **Đảm bảo tối thiểu:** Cơ sở dữ liệu Neo4j không bị thay đổi nếu thao tác thất bại hoặc bị hủy.
- **Đảm bảo thành công:** Lưu trữ thành công thông tin tác giả ngoài, hoặc cập nhật trạng thái phê duyệt từ "Chờ duyệt" sang "Đã duyệt" / từ chối (xóa).
- **Kích hoạt:** Quản trị viên chọn mục "Quản lý tác giả ngoài" trên sidebar.
- **Chuỗi sự kiện chính:**
  1. Quản trị viên truy cập mục "Quản lý tác giả ngoài" trên giao diện quản trị.
  2. Hệ thống hiển thị danh sách các tác giả ngoài hiện có và các yêu cầu chờ duyệt.
  3. Quản trị viên chọn thêm mới, sửa thông tin, xóa tác giả ngoài hoặc duyệt/từ chối yêu cầu.
  4. Hệ thống hiển thị giao diện tương ứng (biểu mẫu thông tin tác giả ngoài, hộp thoại xác nhận xóa, hoặc xác nhận duyệt/từ chối).
  5. Quản trị viên nhập/cập nhật thông tin tác giả ngoài, xác nhận xóa, hoặc xác nhận duyệt/từ chối.
  6. Hệ thống thực hiện kiểm tra tính hợp lệ của dữ liệu đầu vào.
  7. Hệ thống thực hiện cập nhật cơ sở dữ liệu Neo4j (tạo/cập nhật nút TacGiaNgoai, cập nhật cờ `is_deleted = true`, hoặc cập nhật trạng thái phê duyệt).
  8. Hệ thống hiển thị thông báo thành công và tải lại danh sách tác giả ngoài.
  Use case chức năng “Quản lý tác giả ngoài” kết thúc.
- **Chuỗi sự kiện ngoại lệ:**
  6.a. Dữ liệu tác giả ngoài không hợp lệ hoặc email trùng lặp.
  6.a.1. Hệ thống hiển thị thông báo lỗi chi tiết.
  6.a.2. Quản trị viên cập nhật lại thông tin.
  Use case quay lại bước 5.

---

### Bảng 3.29. Đặc tả chức năng quản lý thùng rác (admin)

- **Mô tả:** Cho phép quản trị viên xem danh sách các thực thể (giảng viên, công trình, đề tài, v.v.) đã bị xóa tạm thời (xóa mềm), thực hiện khôi phục thực thể hoặc xóa vĩnh viễn khỏi cơ sở dữ liệu.
- **Actor:** Quản trị viên
- **Tiền điều kiện:** Quản trị viên đã đăng nhập thành công và ở giao diện Quản lý thùng rác.
- **Hậu điều kiện:** Trạng thái thực thể được cập nhật trên Neo4j (khôi phục hoạt động bằng cách gán `is_deleted = false`/`null` hoặc xóa hoàn toàn thực thể bằng câu lệnh `DETACH DELETE`).
- **Đảm bảo tối thiểu:** Cơ sở dữ liệu Neo4j không bị thay đổi ngoài ý muốn nếu thao tác thất bại hoặc bị hủy.
- **Đảm bảo thành công:** Thực thể được khôi phục về trạng thái hoạt động hoặc bị xóa vĩnh viễn hoàn toàn khỏi cơ sở dữ liệu đồ thị Neo4j.
- **Kích hoạt:** Quản trị viên chọn mục "Quản lý thùng rác" trên sidebar.
- **Chuỗi sự kiện chính:**
  1. Quản trị viên truy cập mục "Quản lý thùng rác" trên giao diện quản trị.
  2. Hệ thống hiển thị danh sách các thực thể đã bị xóa tạm thời (gồm giảng viên, công trình, đề tài).
  3. Quản trị viên chọn khôi phục hoặc xóa vĩnh viễn một thực thể cụ thể.
  4. Hệ thống hiển thị giao diện xác nhận tương ứng (hộp thoại xác nhận khôi phục hoặc cảnh báo xóa vĩnh viễn).
  5. Quản trị viên xác nhận thực hiện hành động.
  6. Hệ thống thực hiện kiểm tra tính hợp lệ của thao tác và trạng thái thực thể.
  7. Hệ thống cập nhật cơ sở dữ liệu Neo4j (gán `is_deleted = false` để khôi phục hoặc thực thi `DETACH DELETE` để xóa vĩnh viễn).
  8. Hệ thống hiển thị thông báo thành công và tải lại danh sách thùng rác.
  Use case chức năng “Quản lý thùng rác” kết thúc.
- **Chuỗi sự kiện ngoại lệ:**
  6.a. Thực thể không còn tồn tại trong hệ thống hoặc đã bị thay đổi trạng thái bởi phiên làm việc khác.
  6.a.1. Hệ thống hiển thị thông báo lỗi: "Thực thể không tồn tại hoặc đã thay đổi".
  Use case quay lại bước 2.

