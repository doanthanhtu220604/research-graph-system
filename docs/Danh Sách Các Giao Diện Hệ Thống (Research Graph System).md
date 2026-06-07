# Danh Sách Các Giao Diện Hệ Thống (Research Graph System)

Tài liệu này tổng hợp danh sách các giao diện chính của hệ thống Bản đồ tri thức nghiên cứu khoa học (Research Graph System), được phân loại chi tiết theo từng nhóm đối tượng người dùng: **Khách vãng lai (Public/Guest)**, **Giảng viên (Lecturer)**, và **Quản trị viên (Administrator)**, đi kèm diễn giải chức năng cụ thể cho từng giao diện.

---

## 1. Nhóm Người Dùng: Khách Vãng Lai (Public / Guest)

Khách vãng lai là những người dùng chưa đăng nhập hệ thống (sinh viên, đối tác bên ngoài, hoặc công chúng). Họ có quyền tra cứu thông tin khoa học công khai, tương tác với bản đồ tri thức và xem các báo cáo thống kê của khoa.

### Giao diện trang chủ (index.html)
Khi truy cập vào hệ thống, người dùng được chuyển đến giao diện trang chủ. Tại đây, người dùng có thể thực hiện tìm kiếm thông tin giảng viên, đề tài hoặc lĩnh vực nghiên cứu bằng thanh tìm kiếm lớn ở trung tâm, đồng thời có thể truy cập nhanh vào các phân hệ chức năng thông qua hệ thống thẻ điều hướng nhanh và xem danh sách hiển thị các giảng viên nổi bật, đề tài nghiên cứu cùng bài báo mới nhất.

### Giao diện tìm kiếm / Khám phá bản đồ (explore.html)
Khi người dùng nhập từ khóa tìm kiếm từ trang chủ hoặc truy cập menu Khám phá, họ được chuyển đến giao diện này. Giao diện tích hợp bản đồ mạng lưới tri thức tương tác (Interactive Graph) hiển thị các mối quan hệ giữa giảng viên, đề tài, công trình và bộ môn. Người dùng có thể nhập từ khóa để lọc nhanh theo danh mục (Tất cả, Giảng viên, Công trình, Đề tài) và xem danh sách kết quả tìm kiếm hiển thị song song bên cạnh đồ thị mạng lưới để dễ dàng đối chiếu, tương tác.

### Giao diện danh sách giảng viên (lecturers.html)
Khi cần tìm kiếm hoặc xem thông tin nhân sự, người dùng truy cập giao diện danh sách giảng viên. Giao diện hiển thị danh sách toàn bộ giảng viên của khoa kèm ảnh đại diện và thông tin học hàm, học vị. Người dùng có thể lọc danh sách nhanh theo Bộ môn chuyên môn, theo học vị (Tiến sĩ, Thạc sĩ, Phó Giáo sư, Giáo sư) hoặc tìm kiếm theo tên giảng viên.

### Giao diện danh sách đề tài (projects.html)
Khi cần tra cứu các đề tài khoa học, người dùng truy cập giao diện danh sách đề tài. Giao diện này cung cấp công cụ tìm kiếm và lọc danh mục đề tài nghiên cứu khoa học của khoa theo tên, cấp đề tài (cấp Nhà nước, cấp Bộ, cấp Cơ sở) và hiển thị thông tin chi tiết về chủ nhiệm đề tài, kinh phí cùng trạng thái của đề tài.

### Giao diện danh sách bài báo / công trình (publications.html)
Khi cần tham khảo các bài báo khoa học, người dùng truy cập giao diện danh sách bài báo. Giao diện liệt kê toàn bộ các công bố khoa học của khoa bao gồm tạp chí quốc tế (ISI/Scopus), tạp chí trong nước và kỷ yếu hội nghị. Người dùng có thể tìm kiếm theo tiêu đề bài báo, tên tác giả hoặc năm xuất bản.

### Giao diện mạng lưới hợp tác (collaboration.html)
Khi cần phân tích hoạt động đồng nghiên cứu, người dùng truy cập giao diện mạng lưới hợp tác. Giao diện hiển thị đồ thị mạng lưới kết nối giữa các giảng viên trong khoa dựa trên lịch sử cùng thực hiện đề tài hoặc đồng tác giả bài báo khoa học, giúp hiển thị rõ các nhóm nghiên cứu mạnh và các mối quan hệ hợp tác học thuật.

### Giao diện biểu đồ thống kê (statistics.html)
Khi cần xem báo cáo số liệu tổng quan, người dùng truy cập giao diện biểu đồ thống kê. Hệ thống cung cấp các biểu đồ cột, biểu đồ tròn và biểu đồ đường biểu diễn sự phát triển của số lượng bài báo qua các năm, cơ cấu học hàm học vị của khoa, phân phối đề tài theo cấp và phân tích mật độ nghiên cứu theo bộ môn.

### Giao diện chatbot hỗ trợ AI (chat.html)
Khi cần giải đáp nhanh hoặc tương tác bằng ngôn ngữ tự nhiên, người dùng truy cập giao diện chatbot hỗ trợ AI. Người dùng nhập câu hỏi vào ô chat và nhận câu trả lời tức thì từ mô hình ngôn ngữ lớn (LLM) được tích hợp sâu với cơ sở dữ liệu đồ thị tri thức của khoa để truy vấn nhanh thông tin giảng viên, hướng nghiên cứu hoặc đề tài.

### Giao diện đăng nhập (login.html)
Khi giảng viên hoặc admin cần truy cập vào khu vực quản lý, họ truy cập giao diện đăng nhập. Giao diện cung cấp form nhập tên tài khoản và mật khẩu, hỗ trợ kiểm tra tính hợp lệ và điều hướng người dùng đến đúng bảng điều khiển (Dashboard) dựa trên vai trò của họ.

### Giao diện quên mật khẩu & đặt lại mật khẩu (forgot-password.html & reset-password.html)
Khi người dùng không nhớ thông tin đăng nhập, họ sử dụng giao diện quên mật khẩu. Người dùng nhập email để nhận mã OTP xác thực, sau đó hệ thống sẽ hiển thị giao diện đặt lại mật khẩu để người dùng nhập mật khẩu mới và khôi phục quyền truy cập tài khoản một cách bảo mật.

---

## 2. Nhóm Người Dùng: Giảng Viên (Lecturer)

Giảng viên sau khi đăng nhập sẽ có giao diện quản lý chuyên biệt để tự quản trị thông tin cá nhân và cập nhật các thành tựu khoa học của mình lên hệ thống.

### Giao diện trang cá nhân / Dashboard giảng viên (lecturer/index.html)
Sau khi đăng nhập thành công, giảng viên được chuyển đến giao diện dashboard cá nhân. Giao diện hiển thị tóm tắt thông tin lý lịch khoa học của giảng viên, thống kê số bài báo/đề tài cá nhân và cung cấp form cho phép giảng viên tự cập nhật thông tin liên hệ, bộ môn, học hàm, học vị và thay đổi ảnh đại diện.

### Giao diện quản lý đề tài cá nhân (lecturer/projects.html)
Khi cần cập nhật danh sách đề tài của mình, giảng viên sử dụng giao diện quản lý đề tài cá nhân. Tại đây, giảng viên có thể xem tất cả các đề tài mình đã chủ nhiệm hoặc tham gia thành viên, đồng thời có thể thực hiện thêm đề tài mới, sửa đổi thông tin hoặc xóa đề tài để gửi yêu cầu phê duyệt lên ban quản trị hệ thống.

### Giao diện quản lý bài báo cá nhân (lecturer/publications.html)
Khi có công bố khoa học mới, giảng viên sử dụng giao diện quản lý bài báo cá nhân. Giao diện này cung cấp các nút chức năng để giảng viên thêm bài báo mới, khai báo các đồng tác giả (gồm giảng viên trong trường và tác giả liên kết ngoài trường) và đính kèm đường link dẫn đến công trình.

### Giao diện dòng thời gian hoạt động (lecturer/timeline.html)
Khi cần xem lịch sử nghiên cứu dưới dạng biểu đồ thời gian, giảng viên truy cập giao diện dòng thời gian hoạt động. Giao diện thiết kế một trục thời gian (Timeline) từ quá khứ đến hiện tại biểu diễn các dấu mốc thời gian giảng viên hoàn thành đề tài khoa học hoặc xuất bản bài báo mới.

### Giao diện thùng rác cá nhân (lecturer/trash.html)
Khi cần phục hồi dữ liệu đã xóa nhầm, giảng viên truy cập giao diện thùng rác cá nhân. Giao diện này hiển thị danh sách các bài báo, đề tài do giảng viên tự xóa tạm thời; giảng viên có thể chọn khôi phục về danh sách chính hoặc chọn xóa vĩnh viễn khỏi tài khoản.

---

## 3. Nhóm Người Dùng: Quản Trị Viên (Administrator)

Quản trị viên (Admin) sở hữu quyền quản lý cao nhất trên hệ thống, chịu trách nhiệm phê duyệt dữ liệu, quản lý cấu trúc khoa, quản lý tài khoản người dùng và nhập xuất dữ liệu hệ thống.

### Giao diện trang chủ Admin / Dashboard (admin/index.html)
Sau khi đăng nhập bằng quyền quản trị, admin được chuyển đến giao diện Dashboard quản trị. Giao diện này hiển thị tổng số tài khoản đang hoạt động, số lượng giảng viên, công trình nghiên cứu và đề tài toàn khoa; đồng thời cung cấp biểu đồ phân tích nhanh tình hình nghiên cứu toàn hệ thống và nhật ký các hoạt động phê duyệt gần đây.

### Giao diện quản lý tài khoản (admin/accounts.html)
Khi cần cấp quyền hoặc xử lý tài khoản, admin truy cập giao diện quản lý tài khoản. Giao diện này liệt kê toàn bộ tài khoản trong hệ thống kèm quyền hạn. Admin có thể tạo tài khoản mới cho giảng viên, thay đổi mật khẩu mặc định, chỉnh sửa phân quyền (Admin/Lecturer) hoặc tạm thời khóa/mở khóa tài khoản.

### Giao diện quản lý giảng viên (admin/lecturers.html)
Khi cần điều chỉnh thông tin nhân sự toàn khoa, admin truy cập giao diện quản lý giảng viên. Giao diện cho phép admin thêm mới hồ sơ giảng viên chưa có tài khoản, phê duyệt hoặc từ chối các yêu cầu cập nhật hồ sơ từ giảng viên gửi lên, và thực hiện thay đổi thông tin lý lịch khoa học của bất kỳ giảng viên nào.

### Giao diện quản lý đề tài toàn hệ thống (admin/projects.html)
Khi cần phê duyệt đề tài khoa học, admin truy cập giao diện quản lý đề tài toàn hệ thống. Tại đây, admin xem danh sách đề tài từ tất cả giảng viên gửi lên chờ kiểm duyệt. Admin có thể xem chi tiết thông tin, phê duyệt đề tài được hiển thị lên bản đồ tri thức hoặc từ chối phê duyệt nếu thông tin chưa chính xác.

### Giao diện quản lý bài báo toàn hệ thống (admin/publications.html)
Khi cần kiểm duyệt công bố khoa học, admin truy cập giao diện quản lý bài báo toàn hệ thống. Giao diện hỗ trợ admin rà soát danh mục bài báo đăng ký mới, cập nhật phân loại danh mục tạp chí cho bài báo và phê duyệt để công trình chính thức xuất hiện trên hồ sơ giảng viên và bản đồ kết nối.

### Giao diện quản lý bộ môn (admin/departments.html)
Khi cần điều chỉnh cơ cấu tổ chức khoa, admin sử dụng giao diện quản lý bộ môn. Giao diện này liệt kê các bộ môn chuyên môn hiện có trong khoa; admin có thể thêm bộ môn mới, sửa tên bộ môn hoặc cấu hình danh sách giảng viên thuộc sự quản lý của từng bộ môn.

### Giao diện quản lý hướng nghiên cứu (admin/research_fields.html)
Khi cần phân loại hướng nghiên cứu khoa học, admin sử dụng giao diện quản lý hướng nghiên cứu. Giao diện cho phép thiết lập và quản lý danh mục phân cấp các lĩnh vực, hướng nghiên cứu khoa học để phục vụ việc gắn nhãn (tagging) và xây dựng bản đồ kết nối lĩnh vực cho đề tài và bài báo.

### Giao diện quản lý tác giả ngoài (admin/external_authors.html)
Khi cần quản lý các đối tác liên kết bên ngoài khoa, admin sử dụng giao diện quản lý tác giả ngoài. Giao diện lưu trữ thông tin của các học giả, cơ quan ngoài trường có cùng tham gia đề tài hoặc đứng tên đồng tác giả bài báo khoa học với giảng viên của khoa.

### Giao diện nhập dữ liệu hàng loạt (admin/import.html)
Khi cần cập nhật lượng lớn dữ liệu ban đầu, admin truy cập giao diện nhập dữ liệu hàng loạt. Admin có thể tải lên các file mẫu Excel chứa danh sách giảng viên, đề tài hoặc công trình; hệ thống sẽ tự động quét, phân tích và nạp trực tiếp vào cơ sở dữ liệu đồ thị Neo4j.

### Giao diện thùng rác hệ thống (admin/trash.html)
Khi cần dọn dẹp hệ thống hoặc khôi phục dữ liệu tổng thể, admin truy cập giao diện thùng rác hệ thống. Giao diện hiển thị tất cả các giảng viên, đề tài, bài báo đã bị xóa tạm thời của toàn khoa; admin có quyền quyết định khôi phục lại dữ liệu hoặc xóa vĩnh viễn để giải phóng bộ nhớ cơ sở dữ liệu.
