## 3.5. ĐẶC TẢ HỆ THỐNG

Từ các phân tích hiện trạng và phương pháp giải quyết vấn đề đã nêu ở trên, hệ thống Bản đồ tri thức nghiên cứu khoa học và Trợ lý hỏi đáp tự động (GraphRAG Chatbot) khoa Công nghệ thông tin – Trường Đại học Nha Trang cần phải được xây dựng và phát triển với những yêu cầu sau đây:

### 3.5.1. Yêu cầu chức năng

#### a. Đối với người dùng: Sinh Viên/ Khách Vãng Lai
* **Người dùng phổ thông (bao gồm Sinh viên và Khách vãng lai):** Là những người dùng truy cập hệ thống dưới hình thức ẩn danh (không yêu cầu đăng ký hay đăng nhập tài khoản) nhằm tra cứu thông tin khoa học và tương tác hỏi đáp. Trong đó, sinh viên là các học viên, sinh viên trong và ngoài trường có nhu cầu tìm hiểu về hướng nghiên cứu của giảng viên khoa Công nghệ thông tin để đăng ký đề tài tốt nghiệp, thực tập hoặc hợp tác nghiên cứu. Còn khách vãng lai là những đối tượng người dùng tự do bên ngoài nhà trường (như các nhà nghiên cứu, doanh nghiệp hoặc người quan tâm tự do) có nhu cầu tìm kiếm, tham khảo thông tin khoa học của khoa để kết nối hợp tác, trao đổi học thuật hoặc học hỏi tri thức thông qua chatbot.

##### Bảng 3.1. Bảng liệt kê yêu cầu chức năng đối với khách vãng lai

| STT | Chức năng người dùng | Mô tả chức năng |
| :--- | :--- | :--- |
| 1 | Tra cứu giảng viên | Người dùng tra cứu giảng viên trong khoa theo tên, bộ môn hoặc hướng nghiên cứu quan tâm. Kết quả trả về là danh sách giảng viên kèm thông tin cơ bản. |
| 2 | Xem chi tiết giảng viên | Xem hồ sơ khoa học chi tiết của giảng viên: thông tin liên hệ, hướng nghiên cứu, danh sách công trình, đề tài và đồ thị liên kết thực thể (mạng lưới quan hệ). |
| 3 | Tra cứu công trình khoa học | Tra cứu bài báo khoa học theo tên bài báo, năm xuất bản hoặc tác giả. Kết quả trả về là danh sách các công trình phù hợp. |
| 4 | Xem chi tiết công trình | Xem thông tin chi tiết bài báo bao gồm tiêu đề, tóm tắt, năm xuất bản, nơi công bố, danh sách đồng tác giả (trong và ngoài khoa) và cung cấp liên kết truy cập bài viết gốc. |
| 5 | Tra cứu đề tài nghiên cứu | Tra cứu đề tài nghiên cứu theo tên đề tài, cấp quản lý hoặc năm thực hiện. Kết quả trả về là danh sách các đề tài phù hợp. |
| 6 | Xem chi tiết đề tài | Xem chi tiết thông tin đề tài: tên đề tài, tóm tắt, cấp quản lý, thời gian thực hiện, kinh phí, danh sách thành viên tham gia và liên kết nguồn (nếu có). |
| 7 | Hỏi đáp qua Chatbot | Nhập câu hỏi tự nhiên tiếng Việt về thông tin nghiên cứu của khoa và nhận câu trả lời chính xác, được xác thực trực tiếp từ cơ sở dữ liệu đồ thị. |
| 8 | Xem bản đồ tri thức tương tác | Xem đồ thị trực quan biểu diễn mối liên kết thực thể (Giảng viên, Đề tài, Công trình, Bộ môn, Lĩnh vực); hỗ trợ kéo thả, thu phóng và chọn nút thực thể. |
| 9 | Dịch thuật nội dung | Dịch thông tin học thuật (tóm tắt công trình, tóm tắt đề tài) từ tiếng Việt sang tiếng Anh và ngược lại thông qua API dịch thuật. |
| 10 | Xem thống kê hệ thống | Xem biểu đồ thống kê xu hướng xuất bản khoa học, cơ cấu đề tài các cấp, phân bổ nhân sự bộ môn và bảng vinh danh nhà khoa học tiêu biểu trong khoa. |
| 11 | Xem mạng lưới hợp tác | Xem đồ thị mạng lưới hợp tác nghiên cứu giữa các giảng viên trong khoa, hỗ trợ lọc theo bộ môn, số lượng hợp tác tối thiểu và hiển thị bảng xếp hạng mức độ kết nối của giảng viên. |

#### b. Đối với người dùng: Giảng Viên
Giảng viên sử dụng tài khoản được cấp bởi Quản trị viên để đăng nhập và cập nhật lý lịch khoa học cá nhân.

##### Bảng 3.2. Bảng liệt kê yêu cầu chức năng đối với giảng viên

| STT | Chức năng người dùng | Mô tả chức năng |
| :--- | :--- | :--- |
| 1 | Đăng nhập | Giảng viên sử dụng thông tin tài khoản mà quản trị viên cung cấp để vào hệ thống: địa chỉ email, mật khẩu. |
| 2 | Đăng xuất | Giảng viên đăng xuất khi không muốn tiếp tục phiên làm việc hiện tại trên hệ thống. |
| 3 | Quên mật khẩu | Cung cấp email đăng nhập để hệ thống gửi liên kết đặt lại mật khẩu tài khoản về hòm thư điện tử. |
| 4 | Quản lý tài khoản | • Cập nhật thông tin cá nhân: Chỉnh sửa các trường thông tin lý lịch cá nhân (họ tên, email, ảnh đại diện, số điện thoại, học vị, chức danh, chức vụ, bộ môn, lĩnh vực nghiên cứu) và gửi yêu cầu phê duyệt lên Admin.<br>• Đổi mật khẩu: Đổi mật khẩu tài khoản hiện tại. |
| 5 | Quản lý công trình cá nhân | • Thêm công trình mới: Giảng viên cung cấp thông tin bài báo mới để gửi yêu cầu phê duyệt lên Admin.<br>• Sửa công trình: Chỉnh sửa thông tin công trình gửi duyệt.<br>• Yêu cầu xóa: Gửi yêu cầu xóa công trình khỏi hồ sơ cá nhân lên Admin.<br>• Xem danh sách: Xem danh sách công trình cá nhân kèm trạng thái phê duyệt. |
| 6 | Quản lý đề tài cá nhân | • Thêm đề tài mới: Giảng viên cung cấp thông tin đề tài mới để gửi yêu cầu phê duyệt lên Admin.<br>• Sửa đề tài: Chỉnh sửa thông tin đề tài gửi duyệt.<br>• Yêu cầu xóa: Gửi yêu cầu xóa đề tài khoa học cá nhân lên Admin.<br>• Xem danh sách: Xem danh mục đề tài khoa học cá nhân kèm vai trò. |
| 7 | Quản lý thùng rác cá nhân | Xem danh sách các công trình, đề tài cá nhân đã bị xóa tạm thời; thực hiện gửi yêu cầu khôi phục dữ liệu lên Admin. |
| 8 | Gợi ý cộng sự tiềm năng | Nhận các gợi ý tự động từ hệ thống về những giảng viên khác trong khoa có hướng nghiên cứu tương đồng để đề xuất hợp tác nghiên cứu. |
| 9 | Xem dòng thời gian khoa học | Xem biểu diễn trực quan các mốc thời gian hoạt động khoa học cá nhân (Timeline các năm xuất bản bài báo và thực hiện đề tài). |
| 10 | Tra cứu giảng viên | Giảng viên tra cứu đồng nghiệp trong khoa theo tên, bộ môn hoặc hướng nghiên cứu quan tâm. |
| 11 | Xem chi tiết giảng viên | Xem hồ sơ khoa học chi tiết của đồng nghiệp: thông tin liên hệ, hướng nghiên cứu, danh sách công trình, đề tài và đồ thị liên kết thực thể (mạng lưới quan hệ). |
| 12 | Tra cứu công trình khoa học | Tra cứu các bài báo khoa học trong toàn khoa theo tên bài báo, năm xuất bản hoặc tác giả. |
| 13 | Xem chi tiết công trình | Xem thông tin chi tiết bài báo bao gồm tiêu đề, tóm tắt, năm xuất bản, nơi công bố, danh sách đồng tác giả và liên kết truy cập bài viết gốc. |
| 14 | Tra cứu đề tài nghiên cứu | Tra cứu các đề tài nghiên cứu trong toàn khoa theo tên đề tài, cấp quản lý hoặc năm thực hiện. |
| 15 | Xem chi tiết đề tài | Xem chi tiết thông tin đề tài: tên đề tài, tóm tắt, cấp quản lý, thời gian thực hiện, kinh phí, danh sách thành viên tham gia và liên kết nguồn (nếu có). |
| 16 | Hỏi đáp qua Chatbot | Nhập câu hỏi tự nhiên tiếng Việt về thông tin nghiên cứu của khoa và nhận câu trả lời chính xác, được xác thực trực tiếp từ cơ sở dữ liệu đồ thị. |
| 17 | Xem bản đồ tri thức tương tác | Xem đồ thị trực quan biểu diễn mối liên kết thực thể (Giảng viên, Đề tài, Công trình, Bộ môn, Lĩnh vực); hỗ trợ kéo thả, thu phóng và chọn nút thực thể. |
| 18 | Dịch thuật nội dung | Dịch thông tin học thuật (tóm tắt công trình, tóm tắt đề tài) từ tiếng Việt sang tiếng Anh và ngược lại thông qua API dịch thuật. |
| 19 | Xem thống kê hệ thống | Xem biểu đồ thống kê xu hướng xuất bản khoa học, cơ cấu đề tài các cấp, phân bổ nhân sự bộ môn và bảng vinh danh nhà khoa học tiêu biểu trong khoa. |
| 20 | Xem mạng lưới hợp tác | Xem đồ thị mạng lưới hợp tác nghiên cứu giữa các giảng viên trong khoa, hỗ trợ lọc theo bộ môn, số lượng hợp tác tối thiểu và hiển thị bảng xếp hạng mức độ kết nối của giảng viên. |

#### c. Đối với người dùng: Quản trị viên
Quản trị viên có toàn quyền kiểm soát dữ liệu đồ thị tri thức, phê duyệt yêu cầu từ giảng viên, quản lý tài khoản người dùng và thực hiện import dữ liệu hàng loạt.

##### Bảng 3.3. Bảng liệt kê yêu cầu chức năng đối với quản trị viên

| STT | Chức năng người dùng | Mô tả chức năng |
| :--- | :--- | :--- |
| 1 | Đăng nhập | Đăng nhập vào phân hệ quản trị hệ thống (Admin Dashboard) bằng tài khoản admin được cấp quyền. |
| 2 | Đăng xuất | Thoát khỏi phân hệ quản trị hệ thống để bảo vệ an toàn dữ liệu. |
| 3 | Quản lý tài khoản cá nhân | Cập nhật thông tin cá nhân (ảnh đại diện, họ tên, email) và thay đổi mật khẩu tài khoản admin đang đăng nhập. |
| 4 | Quản lý tài khoản người dùng | • Thêm mới: Tạo tài khoản mới cho giảng viên.<br>• Sửa thông tin/Khóa: Cập nhật thông tin người dùng hoặc thay đổi trạng thái hoạt động (kích hoạt/khóa tài khoản).<br>• Xóa: Xóa tài khoản người dùng ra khỏi hệ thống |
| 5 | Quản lý giảng viên | • Xem chi tiết: Hiển thị danh sách toàn bộ giảng viên và xem chi tiết hồ sơ lý lịch khoa học của từng người.<br>• Thêm mới: Tạo hồ sơ lý lịch khoa học mới cho giảng viên trên cơ sở dữ liệu đồ thị Neo4j.<br>• Sửa thông tin: Chỉnh sửa thông tin lý lịch cá nhân của giảng viên.<br>• Xóa: Xóa hồ sơ giảng viên khỏi hệ thống.<br>• Phê duyệt yêu cầu: Xem danh sách, so sánh thay đổi và phê duyệt hoặc từ chối các yêu cầu cập nhật thông tin lý lịch cá nhân gửi từ phía giảng viên. |
| 6 | Quản lý bộ môn | • Xem chi tiết: Xem danh sách các bộ môn của khoa và chi tiết thông tin của từng bộ môn.<br>• Thêm mới: Khởi tạo thực thể bộ môn mới thuộc khoa Công nghệ thông tin.<br>• Sửa thông tin: Cập nhật tên, mô tả hoặc thay đổi giảng viên trưởng bộ môn.<br>• Xóa: Xóa bộ môn khỏi hệ thống. |
| 7 | Quản lý tác giả ngoài | • Xem chi tiết: Xem danh sách toàn bộ tác giả ngoài đơn vị và thông tin chi tiết của từng người.<br>• Thêm mới: Tạo hồ sơ cho tác giả bên ngoài đơn vị cùng tham gia hợp tác nghiên cứu học thuật.<br>• Sửa thông tin: Cập nhật thông tin cá nhân (họ tên, đơn vị công tác, học vị, email) của tác giả ngoài.<br>• Xóa: Xóa tác giả ngoài khỏi hệ thống. |
| 8 | Quản lý công trình khoa học | • Xem chi tiết: Tra cứu và xem danh sách toàn bộ công trình khoa học hoặc thông tin chi tiết từng bài báo.<br>• Thêm mới: Tạo bài báo/công trình khoa học mới trực tiếp trên hệ thống.<br>• Sửa thông tin: Chỉnh sửa thông tin công trình, gán danh sách tác giả (giảng viên trong khoa hoặc tác giả ngoài khoa) tham gia công trình.<br>• Xóa: Xóa công trình khoa học khỏi hệ thống.<br>• Phê duyệt yêu cầu: Phê duyệt hoặc từ chối các yêu cầu thêm mới, chỉnh sửa, xóa công trình khoa học gửi từ giảng viên. |
| 9 | Quản lý đề tài nghiên cứu | • Xem chi tiết: Tra cứu và xem danh sách toàn bộ đề tài nghiên cứu hoặc thông tin chi tiết từng đề tài.<br>• Thêm mới: Tạo đề tài nghiên cứu khoa học các cấp trực tiếp.<br>• Sửa thông tin: Chỉnh sửa thông tin đề tài, gán giảng viên hoặc tác giả ngoài làm chủ nhiệm hoặc thành viên tham gia đề tài.<br>• Xóa: Xóa đề tài nghiên cứu khỏi hệ thống.<br>• Phê duyệt yêu cầu: Phê duyệt hoặc từ chối các yêu cầu thêm mới, chỉnh sửa, xóa đề tài gửi từ giảng viên. |
| 10 | Quản lý lĩnh vực nghiên cứu | • Xem chi tiết: Xem danh sách toàn bộ các lĩnh vực nghiên cứu khoa học.<br>• Thêm mới: Tạo nút thực thể lĩnh vực nghiên cứu khoa học mới.<br>• Sửa thông tin: Cập nhật tên lĩnh vực nghiên cứu.<br>• Xóa: Xóa lĩnh vực nghiên cứu khỏi hệ thống. |
| 11 | Quản lý thùng rác hệ thống | • Xem danh sách: Hiển thị các thực thể đã bị xóa tạm thời.<br>• Khôi phục: Phê duyệt đưa thực thể hoạt động trở lại hệ thống.<br>• Xóa vĩnh viễn: Phê duyệt xóa hoàn toàn thực thể khỏi Neo4j. |
| 12 | Nhập dữ liệu từ Excel | Upload file Excel chứa thông tin giảng viên, công trình, đề tài, bộ môn; hệ thống tự động nạp hàng loạt dữ liệu và thiết lập các mối liên kết thực thể tương ứng trên Neo4j. |
| 13 | Xuất dữ liệu ra CSV | Kết xuất dữ liệu hiện tại của các thực thể (Giảng viên, Công trình, Đề tài, Bộ môn, Tác giả ngoài, Lĩnh vực) ra tệp CSV để phục vụ sao lưu hoặc lưu trữ ngoại tuyến. |
| 14 | Xem thống kê báo cáo | Xem dashboard thống kê tổng số lượng thực thể, biểu đồ phân tích xu hướng năm xuất bản, cấp đề tài, bộ môn, học vị và hoạt động chatbot. |

### 3.5.2. Yêu cầu phi chức năng

##### Bảng 3.4. Bảng liệt kê và diễn giải yêu cầu phi chức năng

| STT | Yêu Cầu | Diễn Giải |
| :--- | :--- | :--- |
| 1 | Tính thẩm mỹ và đồng nhất (UI/UX) | - Giao diện trang nhã, dễ nhìn, không gây mất tập trung khi tra cứu hoặc làm việc.<br>- Đảm bảo tính đồng nhất về mặt thiết kế giữa giao diện công khai (khách vãng lai), giao diện giảng viên và trang quản trị của Admin. |
| 2 | Bố cục và tính dễ sử dụng | - Phân chia, sắp xếp các phân hệ và nút chức năng hợp lý, khoa học.<br>- Tránh gây nhầm lẫn giữa các thao tác tra cứu, trò chuyện chatbot, cập nhật thông tin và phê duyệt dữ liệu. |
| 3 | Tương thích đa thiết bị (Responsive) | - Giao diện đáp ứng tốt và hiển thị trực quan bản đồ tri thức trên mọi loại thiết bị (điện thoại thông minh, máy tính bảng, laptop, PC) qua kết nối Internet. |
| 4 | Khả năng bảo trì và mở rộng | - Hệ thống thiết kế độc lập dựa trên kiến trúc phân tầng (Frontend và Backend).<br>- Thuận tiện cho việc bảo trì định kỳ, nâng cấp hệ thống và tích hợp thêm các module chức năng mới. |
