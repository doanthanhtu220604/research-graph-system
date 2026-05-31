## 3.5. ĐẶC TẢ HỆ THỐNG

Từ các phân tích hiện trạng và phương pháp giải quyết vấn đề đã nêu ở trên, hệ thống Bản đồ tri thức nghiên cứu khoa học và Trợ lý hỏi đáp tự động (GraphRAG Chatbot) khoa Công nghệ thông tin – Trường Đại học Nha Trang cần phải được xây dựng và phát triển với những yêu cầu sau đây:

### 3.5.1. Yêu cầu chức năng nghiệp vụ

#### a. Đối với người dùng phổ thông (Học viên, Sinh viên, Nhà khoa học vãng lai)
Người dùng phổ thông truy cập hệ thống ẩn danh (không yêu cầu đăng ký hay đăng nhập tài khoản) nhằm tra cứu thông tin khoa học và tương tác hỏi đáp.

##### Bảng 3.1. Chức năng nghiệp vụ của người dùng phổ thông

| STT | Chức năng người dùng | Mô tả chức năng |
| :--- | :--- | :--- |
| 1 | Tra cứu giảng viên | Người dùng tra cứu giảng viên trong khoa theo tên, bộ môn hoặc hướng nghiên cứu quan tâm. Kết quả trả về là danh sách giảng viên kèm thông tin cơ bản. |
| 2 | Xem chi tiết giảng viên | Xem hồ sơ khoa học chi tiết của giảng viên: thông tin liên hệ, hướng nghiên cứu, danh sách công trình, đề tài và đồ thị liên kết thực thể (mạng lưới quan hệ). |
| 3 | Tra cứu công trình khoa học | Tra cứu bài báo khoa học theo tên bài báo, năm xuất bản hoặc tác giả. Kết quả trả về là danh sách các công trình phù hợp. |
| 4 | Xem chi tiết công trình | Xem thông tin chi tiết bài báo bao gồm tiêu đề, tóm tắt, năm xuất bản, nơi công bố, danh sách đồng tác giả (trong và ngoài khoa) và cung cấp liên kết truy cập bài viết gốc. |
| 5 | Tra cứu đề tài nghiên cứu | Tra cứu đề tài nghiên cứu theo tên đề tài, cấp quản lý hoặc năm thực hiện. Kết quả trả về là danh sách các đề tài phù hợp. |
| 6 | Xem chi tiết đề tài | Xem chi tiết thông tin đề tài: tên đề tài, tóm tắt, cấp quản lý, thời gian thực hiện, kinh phí, danh sách thành viên tham gia và liên kết nguồn (nếu có). |
| 7 | Hỏi đáp qua Chatbot GraphRAG | Nhập câu hỏi tự nhiên tiếng Việt về thông tin nghiên cứu của khoa và nhận câu trả lời chính xác, được xác thực trực tiếp từ cơ sở dữ liệu đồ thị. |
| 8 | Xem bản đồ tri thức tương tác | Xem đồ thị trực quan biểu diễn mối liên kết thực thể (Giảng viên, Đề tài, Công trình, Bộ môn, Lĩnh vực); hỗ trợ kéo thả, thu phóng và chọn nút thực thể. |
| 9 | Dịch thuật nội dung | Dịch thông tin học thuật (tóm tắt công trình, tóm tắt đề tài) từ tiếng Việt sang tiếng Anh và ngược lại thông qua API dịch thuật. |
| 10 | Xem thống kê hệ thống | Xem biểu đồ thống kê xu hướng xuất bản khoa học, cơ cấu đề tài các cấp, phân bổ nhân sự bộ môn và bảng vinh danh nhà khoa học tiêu biểu trong khoa. |
| 11 | Xem mạng lưới hợp tác | Xem đồ thị mạng lưới hợp tác nghiên cứu giữa các giảng viên trong khoa, hỗ trợ lọc theo bộ môn, số lượng hợp tác tối thiểu và hiển thị bảng xếp hạng mức độ kết nối của giảng viên. |




#### b. Đối với người dùng: Giảng viên
Giảng viên sử dụng tài khoản được cấp bởi Quản trị viên (chức năng tự đăng ký bị vô hiệu hóa) để đăng nhập và cập nhật lý lịch khoa học cá nhân.

##### Bảng 3.2. Chức năng nghiệp vụ của người dùng là giảng viên

| STT | Chức năng người dùng | Mô tả chức năng |
| :--- | :--- | :--- |
| 1 | Đăng nhập | Giảng viên sử dụng địa chỉ email hoặc tên đăng nhập và mật khẩu được cấp để đăng nhập vào phân hệ cá nhân. |
| 2 | Đăng xuất | Kết thúc phiên làm việc hiện tại trên hệ thống để đảm bảo bảo mật. |
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
| 16 | Hỏi đáp qua Chatbot GraphRAG | Nhập câu hỏi tự nhiên tiếng Việt về thông tin nghiên cứu của khoa và nhận câu trả lời chính xác, được xác thực trực tiếp từ cơ sở dữ liệu đồ thị. |
| 17 | Xem bản đồ tri thức tương tác | Xem đồ thị trực quan biểu diễn mối liên kết thực thể (Giảng viên, Đề tài, Công trình, Bộ môn, Lĩnh vực); hỗ trợ kéo thả, thu phóng và chọn nút thực thể. |
| 18 | Dịch thuật nội dung | Dịch thông tin học thuật (tóm tắt công trình, tóm tắt đề tài) từ tiếng Việt sang tiếng Anh và ngược lại thông qua API dịch thuật. |
| 19 | Xem thống kê hệ thống | Xem biểu đồ thống kê xu hướng xuất bản khoa học, cơ cấu đề tài các cấp, phân bổ nhân sự bộ môn và bảng vinh danh nhà khoa học tiêu biểu trong khoa. |
| 20 | Xem mạng lưới hợp tác | Xem đồ thị mạng lưới hợp tác nghiên cứu giữa các giảng viên trong khoa, hỗ trợ lọc theo bộ môn, số lượng hợp tác tối thiểu và hiển thị bảng xếp hạng mức độ kết nối của giảng viên. |

#### c. Đối với người dùng: Quản trị viên
Quản trị viên có toàn quyền kiểm soát dữ liệu đồ thị tri thức, phê duyệt yêu cầu từ giảng viên, quản lý tài khoản người dùng và thực hiện import dữ liệu hàng loạt.

##### Bảng 3.3. Chức năng nghiệp vụ của người dùng là quản trị viên

| STT | Chức năng người dùng | Mô tả chức năng |
| :--- | :--- | :--- |
| 1 | Đăng nhập | Đăng nhập vào phân hệ quản trị hệ thống (Admin Dashboard) bằng tài khoản admin được cấp quyền. |
| 2 | Đăng xuất | Thoát khỏi phân hệ quản trị hệ thống để bảo vệ an toàn dữ liệu. |
| 3 | Quản lý tài khoản cá nhân | Cập nhật thông tin cá nhân (ảnh đại diện, họ tên, email) và thay đổi mật khẩu tài khoản admin đang đăng nhập. |
| 4 | Quản lý tài khoản người dùng | • Thêm mới: Tạo tài khoản mới cho giảng viên.<br>• Sửa thông tin/Khóa: Cập nhật thông tin người dùng hoặc thay đổi trạng thái hoạt động (kích hoạt/khóa tài khoản).<br>• Xóa: Xóa tài khoản người dùng ra khỏi hệ thống. |
| 5 | Quản lý giảng viên | • Xem chi tiết: Hiển thị danh sách toàn bộ giảng viên và xem chi tiết hồ sơ lý lịch khoa học của từng người.<br>• Thêm mới: Tạo hồ sơ lý lịch khoa học mới cho giảng viên trên cơ sở dữ liệu đồ thị Neo4j.<br>• Sửa thông tin: Chỉnh sửa thông tin lý lịch cá nhân của giảng viên.<br>• Xóa: Xóa hồ sơ giảng viên khỏi hệ thống.<br>• Phê duyệt yêu cầu: Xem danh sách, so sánh thay đổi và phê duyệt hoặc từ chối các yêu cầu cập nhật thông tin lý lịch cá nhân gửi từ phía giảng viên. |
| 6 | Quản lý bộ môn | • Xem chi tiết: Xem danh sách các bộ môn của khoa và chi tiết thông tin của từng bộ môn.<br>• Thêm mới: Khởi tạo thực thể bộ môn mới thuộc khoa Công nghệ thông tin.<br>• Sửa thông tin: Cập nhật tên, mô tả hoặc thay đổi giảng viên trưởng bộ môn.<br>• Xóa: Xóa bộ môn khỏi hệ thống. |
| 7 | Quản lý tác giả ngoài | • Xem chi tiết: Xem danh sách toàn bộ tác giả ngoài đơn vị và thông tin chi tiết của từng người.<br>• Thêm mới: Tạo hồ sơ cho tác giả bên ngoài đơn vị cùng tham gia hợp tác nghiên cứu học thuật.<br>• Sửa thông tin: Cập nhật thông tin cá nhân (họ tên, đơn vị công tác, học vị, email) của tác giả ngoài.<br>• Xóa: Xóa tác giả ngoài khỏi hệ thống. |
| 8 | Quản lý công trình khoa học | • Xem chi tiết: Tra cứu và xem danh sách toàn bộ công trình khoa học hoặc thông tin chi tiết từng bài báo.<br>• Thêm mới: Tạo bài báo/công trình khoa học mới trực tiếp trên hệ thống.<br>• Sửa thông tin: Chỉnh sửa thông tin công trình, gán danh sách tác giả (giảng viên trong khoa hoặc tác giả ngoài khoa) tham gia công trình.<br>• Xóa: Xóa công trình khoa học khỏi hệ thống.<br>• Phê duyệt yêu cầu: Phê duyệt hoặc từ chối các yêu cầu thêm mới, chỉnh sửa, xóa công trình khoa học gửi từ giảng viên. |
| 9 | Quản lý đề tài nghiên cứu | • Xem chi tiết: Tra cứu và xem danh sách toàn bộ đề tài nghiên cứu hoặc thông tin chi tiết từng đề tài.<br>• Thêm mới: Tạo đề tài nghiên cứu khoa học các cấp trực tiếp.<br>• Sửa thông tin: Chỉnh sửa thông tin đề tài, gán giảng viên hoặc tác giả ngoài làm chủ nhiệm hoặc thành viên tham gia đề tài.<br>• Xóa: Xóa đề tài nghiên cứu khỏi hệ thống.<br>• Phê duyệt yêu cầu: Phê duyệt hoặc từ chối các yêu cầu thêm mới, chỉnh sửa, xóa đề tài gửi từ giảng viên. |
| 10 | Quản lý lĩnh vực nghiên cứu | • Xem chi tiết: Xem danh sách toàn bộ các lĩnh vực nghiên cứu khoa học.<br>• Thêm mới: Tạo nút thực thể lĩnh vực nghiên cứu khoa học mới.<br>• Sửa thông tin: Cập nhật tên lĩnh vực nghiên cứu.<br>• Xóa: Xóa lĩnh vực nghiên cứu khỏi hệ thống. |
| 11 | Quản lý thùng rác hệ thống | • Xem danh sách: Hiển thị các thực thể đã bị xóa tạm thời.<br>• Khôi phục: Phê duyệt đưa thực thể hoạt động trở lại hệ thống.<br>• Xóa vĩnh viễn: Phê duyệt xóa hoàn toàn thực thể khỏi Neo4j. |
| 12 | Nhập dữ liệu từ Excel | Upload file Excel chứa thông tin giảng viên, công trình, đề tài, bộ môn; hệ thống tự động nạp hàng loạt dữ liệu và thiết lập các mối liên kết thực thể tương ứng trên Neo4j. |
| 13 | Xuất dữ liệu ra CSV | Kết xuất dữ liệu hiện tại của các thực thể (Giảng viên, Công trình, Đề tài, Bộ môn, Tác giả ngoài, Lĩnh vực) ra tệp CSV để phục vụ sao lưu hoặc lưu trữ ngoại tuyến. |
| 14 | Xem thống kê báo cáo | Xem dashboard thống kê tổng số lượng thực thể, biểu đồ phân tích xu hướng năm xuất bản, cấp đề tài, bộ môn và học vị. |

---

### 3.5.2. Yêu cầu chức năng hệ thống

#### a. Đối với người dùng phổ thông
Bảng 3.4. Chức năng hệ thống của người dùng phổ thông

| STT | Chức năng người dùng | Mô tả chức năng |
| :--- | :--- | :--- |
| 1 | Phản hồi tự động của Chatbot GraphRAG | Hệ thống tự động phân tích ý định câu hỏi tiếng Việt, dịch thành truy vấn Cypher để lấy ngữ cảnh từ Neo4j, và gọi LLM Gemini để sinh câu trả lời chính xác. |
| 2 | Tự động dịch thuật nội dung | Backend kết nối thư viện dịch thuật để tự động dịch tóm tắt công trình, hướng nghiên cứu sang tiếng Anh hoặc tiếng Việt khi người dùng yêu cầu trên giao diện. |
| 3 | Tải và render đồ thị tương tác | Tự động lấy cấu trúc các nút và mối quan hệ từ Neo4j để render bản đồ tri thức tương tác bằng thư viện Vis.js. |
| 4 | Tự động tải và dựng biểu đồ thống kê | Khi người dùng truy cập trang thống kê, hệ thống tự động gọi các API thống kê ở backend để lấy dữ liệu vẽ các biểu đồ phân tích bằng thư viện Chart.js. |
| 5 | Tự động tích hợp chỉ số Google Scholar | Tự động kết nối thư viện Google Scholar để truy xuất số lượng trích dẫn, chỉ số h-index, i10-index của giảng viên theo thời gian thực và dựng biểu đồ phân tích lịch sử trích dẫn. |
| 6 | Tự động phân tích cấu trúc mạng lưới hợp tác | Thực hiện các thuật toán/truy vấn đồ thị để tính toán mức độ kết nối (Degree Centrality) và xác định giảng viên cầu nối (Bridge Connector) giữa các bộ môn để trực quan hóa mạng lưới hợp tác. |

#### b. Đối với người dùng: Quản trị viên
Bảng 3.5. Chức năng hệ thống của người dùng là quản trị viên

| STT | Chức năng người dùng | Mô tả chức năng |
| :--- | :--- | :--- |
| 1 | Kiểm soát quyền truy cập (RBAC) | Tự động phân quyền: Admin có toàn quyền quản trị; Giảng viên chỉ được quản lý thông tin cá nhân và gửi yêu cầu phê duyệt; Người dùng phổ thông chỉ được tra cứu ẩn danh. |
| 2 | Thống kê thực thể hệ thống | Tự động tính toán tổng số lượng giảng viên, bộ môn, đề tài, công trình khoa học toàn khoa để hiển thị thời gian thực trên Dashboard. |
| 3 | Nhận diện thực thể trùng lặp | Tự động đối chiếu thông tin định danh duy nhất (email, mã giảng viên, hoặc tên công trình/đề tài chính xác) khi import dữ liệu Excel để cập nhật thực thể hiện có, tránh tạo thực thể trùng lặp trên Neo4j. |
| 4 | Cơ chế xóa mềm và khôi phục dữ liệu | Khi xóa thực thể, hệ thống tự động gán cờ `is_deleted = true`, lưu vết trạng thái cũ (`old_status`) và lý do xóa để hỗ trợ phục hồi dữ liệu nguyên trạng khi cần thiết. |
| 5 | Thông báo trạng thái thay đổi dữ liệu | Hệ thống tự động hiển thị thông báo phản hồi thành công hoặc thông báo lỗi chi tiết sau mỗi tác vụ CRUD hoặc phê duyệt dữ liệu. |

#### c. Đối với người dùng: Giảng viên
Bảng 3.6. Chức năng hệ thống của người dùng là giảng viên

| STT | Chức năng người dùng | Mô tả chức năng |
| :--- | :--- | :--- |
| 1 | Gửi email đặt lại mật khẩu | Tự động sinh token bảo mật mã hóa bằng Serializer (hết hạn trong 15 phút) và gửi email chứa liên kết khôi phục mật khẩu khi giảng viên yêu cầu quên mật khẩu. |
| 2 | Tính toán gợi ý cộng sự tự động | Hệ thống tự động chạy truy vấn Cypher tính toán độ tương đồng hướng nghiên cứu (3 điểm lĩnh vực, 1 điểm từ khóa công bố) để gợi ý cộng sự khoa học phù hợp nhất. |
| 3 | Cơ chế lưu trữ tạm và chuyển trạng thái chờ duyệt | Tự động lưu các thay đổi thông tin lý lịch cá nhân hoặc yêu cầu cập nhật/xóa công trình, đề tài của giảng viên vào trạng thái lưu trữ tạm thời, đồng thời tạo yêu cầu chờ quản trị viên phê duyệt. |

---

### 3.5.3. Yêu cầu phi chức năng

- **Giao diện dễ nhìn, dễ sử dụng:**
  - Giao diện dễ nhìn, màu sắc trang nhã, không gây mất tập trung trong quá trình làm việc hoặc tra cứu tri thức.
  - Giao diện hệ thống phải đảm bảo tính đồng nhất giữa giao diện dành cho người dùng phổ thông, giảng viên và trang quản trị của admin.
- **Các chức năng được bố trí hợp lý, không quá phức tạp, rườm rà:**
  - Việc phân chia bố trí các chức năng hợp lý giúp người dùng sử dụng tránh việc nhầm lẫn giữa các thao tác tra cứu, hỏi đáp chatbot, cập nhật thông tin và phê duyệt dữ liệu.
- **Tương thích với hầu hết các thiết bị có kết nối Internet:**
  - Các thiết bị điện tử như điện thoại thông minh, máy tính bảng, laptop, hay PC chỉ cần kết nối được với Internet là đã có thể truy cập mượt mà các chức năng và hiển thị tốt đồ thị tri thức.
- **Dễ dàng bảo trì hay phát triển thêm nhiều chức năng khác:**
  - Các chức năng trong hệ thống được xây dựng độc lập dựa trên kiến trúc phân tầng (Frontend và Backend) nên việc bảo trì cũng như phát triển thêm các module khác được diễn ra dễ dàng.
