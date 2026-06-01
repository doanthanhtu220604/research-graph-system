# -*- coding: utf-8 -*-
import os

use_cases = [
    # --- NHÓM CHUNG: XÁC THỰC HỆ THỐNG ---
    {
        "title": "Đặc tả chức năng Đăng nhập",
        "desc": "Cho phép người dùng hệ thống (Giảng viên, Admin) đăng nhập vào hệ thống bằng tài khoản cá nhân để thực hiện quản lý dữ liệu.",
        "actor": "Giảng viên, Quản trị viên",
        "pre": "Tài khoản đã được cấp hoặc khởi tạo thành công trên hệ thống.",
        "post": "Đăng nhập thành công, phiên làm việc được thiết lập, chuyển hướng đến phân hệ tương ứng.",
        "min_guar": "Thông tin tài khoản và trạng thái hệ thống được bảo toàn; không thiết lập phiên làm việc mới.",
        "success_guar": "Thiết lập token xác thực (JWT/Session) và cho phép truy cập các chức năng bảo mật.",
        "trigger": "Người dùng điền thông tin đăng nhập và nhấn nút Đăng nhập.",
        "main_flow": [
            "Người dùng mở trang đăng nhập hệ thống.",
            "Hệ thống hiển thị form đăng nhập gồm các trường: Email, Mật khẩu.",
            "Người dùng nhập thông tin đăng nhập.",
            "Người dùng nhấn nút 'Đăng nhập'.",
            "Hệ thống kiểm tra thông tin và thông tin đăng nhập hợp lệ trên database Neo4j.",
            "Sau khi đăng nhập thành công, hệ thống tự động chuyển hướng qua trang chủ quản trị tương ứng."
        ],
        "alt_flow": [
            "5.a. Hệ thống kiểm tra thông tin và thông tin đăng nhập không hợp lệ:",
            "  5.a.1. Hệ thống yêu cầu người dùng nhập lại thông tin đăng nhập.",
            "  5.a.2. Người dùng nhấn vào nút \"Quên mật khẩu\".",
            "  Use case chuyển đến Use case của chức năng “Quên mật khẩu”."
        ],
        "exc_flow": [
            "5.b. Hệ thống kiểm tra thông tin và thông tin đăng nhập không hợp lệ.",
            "  5.b.1. Hệ thống yêu cầu người dùng nhập lại thông tin đăng nhập.",
            "  5.b.2. Người dùng nhập lại thông tin đăng nhập.",
            "  5.b.3. Hệ thống kiểm tra thông tin và thông tin đăng nhập hợp lệ.",
            "  Use case tiếp tục ở bước 6.",
            "5.c. Hệ thống kiểm tra thông tin và thông tin đăng nhập không hợp lệ.",
            "  5.c.1. Hệ thống yêu cầu người dùng nhập lại thông tin đăng nhập.",
            "  5.c.2. Người dùng thoát khỏi trang \"Đăng nhập\".",
            "  Use case chức năng “Đăng nhập” dừng lại."
        ]
    },
    {
        "title": "Đặc tả chức năng Quên mật khẩu",
        "desc": "Cho phép người dùng yêu cầu gửi liên kết đặt lại mật khẩu mới qua email đăng ký khi quên mật khẩu.",
        "actor": "Giảng viên, Quản trị viên",
        "pre": "Đang ở giao diện Đăng nhập, có email đăng ký hợp lệ.",
        "post": "Nhận được email khôi phục mật khẩu, đổi mật khẩu thành công.",
        "min_guar": "Mật khẩu hiện tại của tài khoản được giữ nguyên; không gửi email khôi phục hoặc kích hoạt liên kết lỗi.",
        "success_guar": "Mật khẩu mới được mã hóa và lưu trữ thay thế mật khẩu cũ trên Neo4j.",
        "trigger": "Người dùng nhấn liên kết 'Quên mật khẩu' tại form đăng nhập.",
        "main_flow": [
            "Người dùng nhấn vào liên kết 'Quên mật khẩu'.",
            "Hệ thống hiển thị form nhập email khôi phục.",
            "Người dùng nhập địa chỉ email đã đăng ký và nhấn 'Gửi yêu cầu'.",
            "Hệ thống kiểm tra địa chỉ email hợp lệ trên database Neo4j.",
            "Hệ thống gửi email chứa liên kết đặt lại mật khẩu.",
            "Người dùng nhấp vào liên kết khôi phục trong email.",
            "Hệ thống hiển thị giao diện nhập mật khẩu mới.",
            "Người dùng nhập mật khẩu mới và xác nhận mật khẩu, nhấn 'Lưu'.",
            "Hệ thống cập nhật mật khẩu mới đã băm bảo mật vào Neo4j và thông báo thành công."
        ],
        "alt_flow": [],
        "exc_flow": [
            "4.a. Hệ thống kiểm tra địa chỉ email không hợp lệ (không tồn tại trên hệ thống):",
            "  4.a.1. Hệ thống hiển thị thông báo lỗi 'Email không tồn tại trên hệ thống' và yêu cầu kiểm tra lại.",
            "  Use case quay lại bước 2.",
            "6.a. Liên kết đặt lại mật khẩu đã hết hạn (quá 15 phút):",
            "  6.a.1. Hệ thống báo lỗi 'Liên kết đã hết hiệu lực' và yêu cầu thực hiện lại từ đầu.",
            "  Use case quay lại bước 1.",
            "8.a. Mật khẩu mới và mật khẩu xác nhận không trùng khớp:",
            "  8.a.1. Hệ thống báo lỗi 'Mật khẩu xác nhận không khớp' và yêu cầu nhập lại.",
            "  Use case quay lại bước 7."
        ]
    },
    {
        "title": "Đặc tả chức năng Đăng xuất",
        "desc": "Cho phép người dùng thoát phiên làm việc hiện tại để đảm bảo an toàn tài khoản.",
        "actor": "Giảng viên, Quản trị viên",
        "pre": "Người dùng đang trong trạng thái đăng nhập.",
        "post": "Hủy phiên làm việc, xóa token xác thực, quay lại trang chủ công khai.",
        "min_guar": "Thông tin tài khoản và trạng thái hệ thống được giữ an toàn.",
        "success_guar": "Xóa sạch token và không thể dùng phím Back của trình duyệt để quay lại trang cá nhân.",
        "trigger": "Người dùng nhấn chọn nút Đăng xuất trên menu tài khoản.",
        "main_flow": [
            "Người dùng click chọn nút 'Đăng xuất'.",
            "Hệ thống tiến hành xóa token xác thực lưu trong bộ nhớ trình duyệt.",
            "Hệ thống gửi yêu cầu hủy session đến backend.",
            "Hệ thống chuyển hướng người dùng về trang chủ công khai của hệ thống."
        ],
        "alt_flow": [],
        "exc_flow": []
    },

    # --- NHÓM 1: NGƯỜI DÙNG PHỔ THÔNG ---
    {
        "title": "Đặc tả chức năng Tra cứu giảng viên",
        "desc": "Cho phép người dùng phổ thông tìm kiếm thông tin của các giảng viên trong khoa theo tên, bộ môn hoặc hướng nghiên cứu.",
        "actor": "Người dùng phổ thông (bao gồm: sinh viên, học viên, khách vãng lai)",
        "pre": "Thiết bị kết nối Internet, truy cập vào trang chủ hoặc mục Tra cứu.",
        "post": "Hệ thống hiển thị danh sách giảng viên khớp với từ khóa tìm kiếm.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Thông tin giảng viên hiển thị chính xác gồm họ tên, bộ môn, email và chức danh.",
        "trigger": "Người dùng nhập từ khóa và nhấn nút Tìm kiếm ở danh mục Giảng viên.",
        "main_flow": [
            "Người dùng chọn mục tra cứu Giảng viên trên giao diện.",
            "Hệ thống hiển thị ô tìm kiếm và danh mục bộ lọc giảng viên.",
            "Người dùng nhập từ khóa tìm kiếm (Ví dụ: tên giảng viên hoặc hướng nghiên cứu).",
            "Người dùng nhấn nút 'Tìm kiếm' hoặc phím Enter.",
            "Backend thực hiện truy vấn Neo4j tìm các nút GiangVien khớp từ khóa.",
            "Hệ thống hiển thị danh sách kết quả giảng viên."
        ],
        "alt_flow": [],
        "exc_flow": [
            "5.a. Hệ thống kiểm tra và không tìm thấy giảng viên nào phù hợp:",
            "  5.a.1. Hệ thống hiển thị thông báo 'Không tìm thấy giảng viên nào phù hợp' và gợi ý người dùng đổi từ khóa.",
            "  Use case quay lại bước 3."
        ]
    },
    {
        "title": "Đặc tả chức năng Xem chi tiết giảng viên",
        "desc": "Cho phép người dùng xem hồ sơ học thuật chi tiết của một giảng viên bao gồm thông tin liên hệ, hướng nghiên cứu, công trình khoa học, đề tài và đồ thị liên kết cá nhân.",
        "actor": "Người dùng phổ thông (bao gồm: sinh viên, học viên, khách vãng lai)",
        "pre": "Hệ thống đã hiển thị danh sách giảng viên hoặc kết quả tìm kiếm.",
        "post": "Hồ sơ lý lịch khoa học đầy đủ của giảng viên được hiển thị.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị đầy đủ thông tin lý lịch, danh sách bài báo, đề tài và đồ thị Vis.js liên kết của giảng viên đó.",
        "trigger": "Người dùng click vào tên hoặc hình ảnh giảng viên trong danh sách.",
        "main_flow": [
            "Người dùng click chọn một giảng viên cụ thể.",
            "Hệ thống gửi yêu cầu lấy chi tiết giảng viên qua ID/email về backend.",
            "Backend thực hiện truy vấn Neo4j lấy thông tin của nút GiangVien và các liên kết.",
            "Hệ thống hiển thị trang thông tin chi tiết giảng viên cùng đồ thị liên kết cá nhân (Vis.js)."
        ],
        "alt_flow": [],
        "exc_flow": [
            "3.a. Backend truy vấn và phát hiện thực thể giảng viên đã bị xóa mềm hoặc ẩn (is_deleted = true):",
            "  3.a.1. Hệ thống hiển thị thông báo 'Giảng viên không tồn tại hoặc hồ sơ đã bị ẩn'.",
            "  Use case quay lại bước 1."
        ]
    },
    {
        "title": "Đặc tả chức năng Tra cứu công trình khoa học",
        "desc": "Cho phép người dùng tra cứu các bài báo, bài viết khoa học trong cơ sở dữ liệu theo tên, năm công bố hoặc tác giả.",
        "actor": "Người dùng phổ thông (bao gồm: sinh viên, học viên, khách vãng lai)",
        "pre": "Truy cập mục Tra cứu công trình khoa học.",
        "post": "Hiển thị danh sách bài báo khoa học phù hợp.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị danh sách công trình chính xác kèm năm xuất bản, nơi công bố và danh sách tác giả.",
        "trigger": "Người dùng nhập từ khóa tìm kiếm và nhấn nút Tìm kiếm ở danh mục Công trình.",
        "main_flow": [
            "Người dùng chọn mục tra cứu Công trình khoa học.",
            "Hệ thống hiển thị khung tìm kiếm và bộ lọc năm công bố.",
            "Người dùng nhập từ khóa tìm kiếm (Ví dụ tên bài báo, hoặc năm xuất bản).",
            "Người dùng nhấn nút 'Tìm kiếm'.",
            "Backend truy vấn Neo4j tìm các nút CongTrinhNghienCuu có tiêu đề hoặc năm tương ứng.",
            "Hệ thống hiển thị danh sách bài báo khớp tiêu chí tìm kiếm."
        ],
        "alt_flow": [],
        "exc_flow": [
            "5.a. Hệ thống kiểm tra và không tìm thấy công trình khoa học nào phù hợp:",
            "  5.a.1. Hệ thống hiển thị thông báo 'Không tìm thấy công trình khoa học nào phù hợp'.",
            "  Use case quay lại bước 3."
        ]
    },
    {
        "title": "Đặc tả chức năng Xem chi tiết công trình",
        "desc": "Hiển thị chi tiết một công trình khoa học, bao gồm tiêu đề, tóm tắt, nơi công bố, danh sách đồng tác giả và link bài gốc.",
        "actor": "Người dùng phổ thông (bao gồm: sinh viên, học viên, khách vãng lai)",
        "pre": "Đang ở danh sách công trình hoặc trang liên quan.",
        "post": "Thông tin chi tiết công trình được hiển thị trực quan.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị đầy đủ thông tin tóm tắt và danh sách liên kết tác giả.",
        "trigger": "Người dùng click vào tên công trình khoa học.",
        "main_flow": [
            "Người dùng click chọn một công trình.",
            "Hệ thống gửi yêu cầu API lấy chi tiết công trình.",
            "Backend truy vấn Neo4j lấy thông tin nút CongTrinhNghienCuu và các cạnh liên kết.",
            "Hệ thống hiển thị giao diện chi tiết công trình."
        ],
        "alt_flow": [],
        "exc_flow": [
            "3.a. Backend truy vấn và phát hiện công trình khoa học đã bị xóa mềm (is_deleted = true):",
            "  3.a.1. Hệ thống hiển thị thông báo lỗi 'Công trình không tồn tại hoặc đã bị gỡ bỏ'.",
            "  Use case quay lại bước 1."
        ]
    },
    {
        "title": "Đặc tả chức năng Tra cứu đề tài nghiên cứu",
        "desc": "Cho phép người dùng tra cứu các đề tài khoa học theo tên, cấp đề tài hoặc năm thực hiện.",
        "actor": "Người dùng phổ thông (bao gồm: sinh viên, học viên, khách vãng lai)",
        "pre": "Truy cập mục Đề tài nghiên cứu.",
        "post": "Danh sách đề tài nghiên cứu khớp với từ khóa được hiển thị.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị chính xác tên đề tài, cấp đề tài, chủ nhiệm và năm thực hiện.",
        "trigger": "Người dùng nhập từ khóa và nhấn nút Tìm kiếm ở mục Đề tài.",
        "main_flow": [
            "Người dùng chọn mục tra cứu Đề tài.",
            "Hệ thống hiển thị ô nhập từ khóa và bộ lọc cấp đề tài.",
            "Người dùng nhập từ khóa (Ví dụ: 'cấp cơ sở', 'cấp tỉnh').",
            "Người dùng nhấn nút 'Tìm kiếm'.",
            "Backend truy vấn CSDL Neo4j tìm kiếm nút DeTaiNghienCuu phù hợp.",
            "Hệ thống hiển thị danh sách các đề tài khoa học tìm được."
        ],
        "alt_flow": [],
        "exc_flow": [
            "5.a. Hệ thống kiểm tra và không tìm thấy đề tài nào phù hợp:",
            "  5.a.1. Hệ thống hiển thị thông báo 'Không tìm thấy đề tài phù hợp' và gợi ý từ khóa khác.",
            "  Use case quay lại bước 3."
        ]
    },
    {
        "title": "Đặc tả chức năng Xem chi tiết đề tài",
        "desc": "Cho phép xem thông tin chi tiết đề tài nghiên cứu gồm tên đề tài, thời gian thực hiện, cấp đề tài, tóm tắt, chủ nhiệm đề tài và các thành viên tham gia.",
        "actor": "Người dùng phổ thông (bao gồm: sinh viên, học viên, khách vãng lai)",
        "pre": "Đang xem danh sách đề tài.",
        "post": "Hiển thị đầy đủ thông tin chi tiết của đề tài được chọn.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị đầy đủ thông tin thuộc tính và vai trò thành viên tham gia đề tài.",
        "trigger": "Người dùng click chọn một đề tài.",
        "main_flow": [
            "Người dùng click vào tên đề tài nghiên cứu.",
            "Hệ thống gửi yêu cầu lấy chi tiết đề tài về backend.",
            "Backend truy vấn Neo4j tìm nút DeTaiNghienCuu cùng các cạnh liên kết.",
            "Hệ thống hiển thị trang chi tiết đề tài khoa học."
        ],
        "alt_flow": [],
        "exc_flow": [
            "3.a. Backend truy vấn và phát hiện đề tài nghiên cứu đã bị ẩn hoặc xóa mềm (is_deleted = true):",
            "  3.a.1. Hệ thống hiển thị thông báo lỗi 'Đề tài không tồn tại hoặc đã bị ẩn khỏi hệ thống'.",
            "  Use case quay lại bước 1."
        ]
    },
    {
        "title": "Đặc tả chức năng Hỏi đáp qua Chatbot GraphRAG",
        "desc": "Cho phép người dùng gửi câu hỏi tự nhiên bằng tiếng Việt và nhận câu trả lời chính xác trích xuất từ đồ thị tri thức thông qua LLM Gemini.",
        "actor": "Người dùng phổ thông (bao gồm: sinh viên, học viên, khách vãng lai)",
        "pre": "Khung chat GraphRAG Chatbot được mở.",
        "post": "Nhận được phản hồi ngôn ngữ tự nhiên chính xác kèm trích dẫn dữ liệu.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị câu trả lời bằng tiếng Việt tự nhiên và hoàn toàn chính xác với thông tin trong đồ thị.",
        "trigger": "Người dùng nhập câu hỏi vào ô chat và nhấn Gửi.",
        "main_flow": [
            "Người dùng mở khung chat GraphRAG Chatbot.",
            "Hệ thống hiển thị ô nhập câu hỏi và lịch sử trò chuyện.",
            "Người dùng nhập câu hỏi (Ví dụ: 'Ai là chủ nhiệm đề tài cấp tỉnh năm 2022?').",
            "Người dùng nhấn nút Gửi.",
            "Backend phân tích câu hỏi bằng LLM Gemini để trích xuất thực thể.",
            "Backend thực hiện truy vấn Cypher trên Neo4j lấy dữ liệu ngữ cảnh thực tế.",
            "Backend gửi ngữ cảnh và câu hỏi cho LLM Gemini để tổng hợp câu trả lời.",
            "Hệ thống hiển thị câu trả lời trên khung chat của người dùng."
        ],
        "alt_flow": [
            "6.a. Backend truy vấn Cypher không tìm thấy dữ liệu chính xác trực tiếp:",
            "  6.a.1. Backend thực hiện tìm kiếm mờ (Fuzzy search) các nút liên quan trong đồ thị, sau đó gửi các thông tin tìm được cho LLM xử lý tiếp."
        ],
        "exc_flow": [
            "5.a. Lỗi kết nối đến API Gemini AI hoặc vượt quá giới hạn lượt gọi:",
            "  5.a.1. Hệ thống phản hồi 'Không thể kết nối đến dịch vụ trí tuệ nhân tạo, vui lòng thử lại sau.'.",
            "6.b. Lỗi kết nối database Neo4j hoặc truy vấn thất bại:",
            "  6.b.1. Hệ thống thông báo lỗi truy xuất dữ liệu."
        ]
    },
    {
        "title": "Đặc tả chức năng Xem bản đồ tri thức tương tác",
        "desc": "Cho phép người dùng tương tác trực tiếp với giao diện mạng lưới đồ thị tri thức khoa học gồm các nút và các mối quan hệ liên kết.",
        "actor": "Người dùng phổ thông (bao gồm: sinh viên, học viên, khách vãng lai)",
        "pre": "Thiết bị kết nối Internet, người dùng chọn mục 'Khám phá'.",
        "post": "Render đồ thị tương tác Vis.js trên màn hình.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Đồ thị mạng lưới hiển thị đầy đủ các nút thực thể và cho phép người dùng kéo thả, phóng to, thu nhỏ và chọn nút xem thông tin.",
        "trigger": "Người dùng nhấn chọn 'Khám phá' trên thanh menu chính.",
        "main_flow": [
            "Người dùng nhấn chọn mục 'Khám phá'.",
            "Hệ thống gọi API lấy cấu trúc đồ thị hiện tại (nút và quan hệ).",
            "Backend truy vấn Neo4j lấy danh sách nút/cạnh giới hạn để tối ưu hiệu năng.",
            "Hệ thống render đồ thị dạng mạng lưới lên màn hình bằng thư viện Vis.js.",
            "Người dùng click chọn một nút trên đồ thị.",
            "Hệ thống hiển thị panel thông tin chi tiết của thực thể đó ở góc màn hình."
        ],
        "alt_flow": [],
        "exc_flow": [
            "4.a. Trình duyệt của người dùng không hỗ trợ Canvas/WebGL:",
            "  4.a.1. Hệ thống hiển thị thông báo yêu cầu người dùng cập nhật trình duyệt để hiển thị đồ họa."
        ]
    },
    {
        "title": "Đặc tả chức năng Dịch thuật nội dung",
        "desc": "Cho phép người dùng dịch nhanh phần tóm tắt công trình nghiên cứu hoặc đề tài từ tiếng Việt sang tiếng Anh và ngược lại.",
        "actor": "Người dùng phổ thông (bao gồm: sinh viên, học viên, khách vãng lai)",
        "pre": "Đang xem trang chi tiết công trình khoa học hoặc đề tài nghiên cứu.",
        "post": "Nội dung tóm tắt được dịch sang ngôn ngữ lựa chọn và hiển thị ngay trên giao diện.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Bản dịch chính xác xuất hiện trên màn hình.",
        "trigger": "Người dùng nhấn nút 'Dịch sang tiếng Anh' hoặc 'Dịch sang tiếng Việt'.",
        "main_flow": [
            "Người dùng nhấn nút Dịch thuật bên cạnh phần tóm tắt công trình hoặc đề tài.",
            "Hệ thống gửi nội dung văn bản gốc và ngôn ngữ đích đến API dịch thuật backend.",
            "Backend gọi thư viện dịch thuật (Google Translate/Gemini API) để xử lý.",
            "Hệ thống cập nhật và hiển thị văn bản dịch ngay tại khung thông tin."
        ],
        "alt_flow": [],
        "exc_flow": [
            "3.a. Lỗi API dịch thuật hoặc vượt giới hạn lượt gọi:",
            "  3.a.1. Hệ thống hiển thị thông báo 'Chức năng dịch thuật tạm thời gián đoạn' và giữ nguyên nội dung gốc."
        ]
    },
    {
        "title": "Đặc tả chức năng Xem thống kê hệ thống",
        "desc": "Cho phép người dùng xem các biểu đồ phân tích thống kê dữ liệu khoa học của khoa dưới dạng trực quan.",
        "actor": "Người dùng phổ thông (bao gồm: sinh viên, học viên, khách vãng lai)",
        "pre": "Người dùng truy cập trang 'Thống kê'.",
        "post": "Các biểu đồ thống kê Chart.js hiển thị đầy đủ.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Các biểu đồ thể hiện chính xác số lượng công trình theo năm, tỉ lệ đề tài các cấp, cơ cấu giảng viên theo học vị.",
        "trigger": "Người dùng nhấn chọn mục 'Thống kê' trên thanh điều hướng.",
        "main_flow": [
            "Người dùng nhấn chọn menu 'Thống kê'.",
            "Hệ thống gửi yêu cầu lấy dữ liệu tổng hợp về backend.",
            "Backend thực hiện các câu lệnh Cypher gom nhóm dữ liệu trên Neo4j.",
            "Hệ thống sử dụng Chart.js để dựng các biểu đồ tương ứng trên giao diện."
        ],
        "alt_flow": [],
        "exc_flow": [
            "3.a. Cơ sở dữ liệu trống hoặc lỗi kết nối database:",
            "  3.a.1. Hệ thống hiển thị các khung biểu đồ rỗng và thông báo 'Chưa có dữ liệu thống kê'."
        ]
    },
    {
        "title": "Đặc tả chức năng Xem mạng lưới hợp tác",
        "desc": "Cho phép người dùng xem biểu đồ mạng lưới đồng tác giả giữa các giảng viên trong khoa Công nghệ thông tin.",
        "actor": "Người dùng phổ thông (bao gồm: sinh viên, học viên, khách vãng lai)",
        "pre": "Thiết bị kết nối Internet, người dùng chọn mục 'Hợp tác'.",
        "post": "Render đồ thị Vis.js biểu diễn các giảng viên kết nối với nhau qua các công trình chung.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Render chính xác mạng lưới hợp tác, các cạnh thể hiện số lượng công trình chung, hiển thị bảng xếp hạng Degree Centrality.",
        "trigger": "Người dùng nhấn mục 'Hợp tác'.",
        "main_flow": [
            "Người dùng chọn menu 'Hợp tác'.",
            "Hệ thống gọi API lấy dữ liệu liên kết đồng tác giả.",
            "Backend truy vấn Neo4j lấy danh sách giảng viên có quan hệ đồng tác giả thông qua các nút CongTrinhNghienCuu.",
            "Backend tính toán các chỉ số Centrality (Độ trung tâm kết nối) của từng giảng viên.",
            "Hệ thống hiển thị đồ thị mạng lưới hợp tác và danh sách bảng xếp hạng giảng viên ở cột bên cạnh."
        ],
        "alt_flow": [],
        "exc_flow": [
            "3.a. Lỗi kết nối cơ sở dữ liệu đồ thị Neo4j:",
            "  3.a.1. Hệ thống báo lỗi kết nối và không render được đồ thị."
        ]
    },

    # --- NHÓM 2: GIẢNG VIÊN ---
    {
        "title": "Đặc tả chức năng Cập nhật tài khoản lý lịch cá nhân (Giảng viên)",
        "desc": "Cho phép giảng viên chỉnh sửa các thông tin lý lịch khoa học cá nhân và gửi yêu cầu phê duyệt lên Admin.",
        "actor": "Giảng viên",
        "pre": "Giảng viên đã đăng nhập và đang ở mục Quản lý tài khoản.",
        "post": "Dữ liệu chỉnh sửa được lưu vào trạng thái chờ duyệt (Staging), tạo yêu cầu phê duyệt cho Admin.",
        "min_guar": "Thông tin lý lịch cũ được giữ nguyên; yêu cầu chỉnh sửa chưa được lưu hoặc gửi duyệt.",
        "success_guar": "Tạo yêu cầu thay đổi thành công, hệ thống ghi nhận thông tin dạng pending_ trên nút GiangVien.",
        "trigger": "Giảng viên chỉnh sửa thông tin lý lịch và nhấn nút 'Lưu thay đổi'.",
        "main_flow": [
            "Giảng viên vào mục thông tin cá nhân.",
            "Hệ thống hiển thị form chứa thông tin lý lịch hiện tại.",
            "Giảng viên chỉnh sửa các trường thông tin (Số điện thoại, học vị, chức danh, hướng nghiên cứu...).",
            "Giảng viên nhấn nút 'Lưu thay đổi'.",
            "Hệ thống kiểm tra dữ liệu đầu vào của giảng viên hợp lệ.",
            "Backend lưu các thông tin chỉnh sửa vào các thuộc tính tạm thời (pending_ho_va_ten...) trên nút GiangVien của Neo4j và tạo một nút MutationRequest liên kết.",
            "Hệ thống thông báo 'Yêu cầu thay đổi thông tin đã được gửi và đang chờ Admin duyệt'."
        ],
        "alt_flow": [],
        "exc_flow": [
            "5.a. Giảng viên nhập dữ liệu không hợp lệ (Ví dụ: để trống họ tên bắt buộc):",
            "  5.a.1. Hệ thống báo lỗi đỏ tại trường thông tin tương ứng và chặn gửi yêu cầu.",
            "  Use case quay lại bước 3."
        ]
    },
    {
        "title": "Đặc tả chức năng Đổi mật khẩu (Giảng viên)",
        "desc": "Cho phép giảng viên tự thay đổi mật khẩu tài khoản hiện tại khi đang đăng nhập.",
        "actor": "Giảng viên",
        "pre": "Giảng viên đã đăng nhập thành công.",
        "post": "Mật khẩu tài khoản được cập nhật mới trên Neo4j.",
        "min_guar": "Mật khẩu cũ của giảng viên vẫn giữ nguyên hiệu lực; hệ thống không thay đổi thông tin xác thực.",
        "success_guar": "Cập nhật mật khẩu mới được băm bảo mật thành công.",
        "trigger": "Giảng viên nhập mật khẩu cũ, mật khẩu mới và nhấn nút Đổi mật khẩu.",
        "main_flow": [
            "Giảng viên truy cập tab Đổi mật khẩu.",
            "Giảng viên nhập mật khẩu hiện tại, mật khẩu mới và xác nhận mật khẩu mới.",
            "Giảng viên nhấn nút 'Cập nhật mật khẩu'.",
            "Hệ thống gửi yêu cầu về API đổi mật khẩu.",
            "Backend kiểm tra mật khẩu hiện tại khớp với mật khẩu đang lưu trên Neo4j.",
            "Backend thực hiện băm mật khẩu mới và cập nhật thuộc tính password của nút GiangVien.",
            "Hệ thống thông báo đổi mật khẩu thành công."
        ],
        "alt_flow": [],
        "exc_flow": [
            "5.a. Backend kiểm tra và phát hiện mật khẩu hiện tại không khớp:",
            "  5.a.1. Hệ thống báo lỗi mật khẩu cũ không đúng.",
            "  Use case quay lại bước 2.",
            "3.a. Mật khẩu mới và xác nhận mật khẩu mới không khớp:",
            "  3.a.1. Hệ thống báo lỗi xác nhận mật khẩu không khớp.",
            "  Use case quay lại bước 2."
        ]
    },
    {
        "title": "Đặc tả chức năng Xem danh sách công trình cá nhân (Giảng viên)",
        "desc": "Cho phép giảng viên xem toàn bộ danh sách các bài báo khoa học cá nhân kèm theo trạng thái phê duyệt (Đã duyệt, Chờ duyệt, Từ chối).",
        "actor": "Giảng viên",
        "pre": "Giảng viên đã đăng nhập và chọn mục 'Công trình của tôi'.",
        "post": "Danh sách công trình của giảng viên được liệt kê đầy đủ.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị đúng danh sách các bài báo liên kết với giảng viên kèm theo cờ trạng thái phê duyệt thực tế.",
        "trigger": "Giảng viên nhấn chọn mục 'Công trình của tôi' trên menu quản trị lý lịch.",
        "main_flow": [
            "Giảng viên truy cập mục 'Công trình của tôi'.",
            "Hệ thống gửi yêu cầu lấy danh sách công trình cá nhân kèm token xác thực.",
            "Backend thực hiện truy vấn các nút CongTrinhNghienCuu liên kết với nút GiangVien hiện tại.",
            "Hệ thống hiển thị danh sách các công trình kèm bộ lọc trạng thái lên màn hình."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Yêu cầu thêm công trình cá nhân (Giảng viên)",
        "desc": "Cho phép giảng viên khai báo một bài báo khoa học mới để gửi yêu cầu phê duyệt tích hợp vào hồ sơ lý lịch lên Admin.",
        "actor": "Giảng viên",
        "pre": "Giảng viên đã đăng nhập và đang ở màn hình thêm công trình.",
        "post": "Tạo một nút công trình mới có trạng thái 'Chờ duyệt' trong cơ sở dữ liệu.",
        "min_guar": "Yêu cầu thêm mới không được tạo; danh sách công trình hiện tại của giảng viên không bị ảnh hưởng.",
        "success_guar": "Công trình mới được tạo trên Neo4j với thuộc tính trang_thai = 'Chờ duyệt' and liên kết với giảng viên.",
        "trigger": "Giảng viên nhập thông tin công trình khoa học mới và nhấn nút Gửi phê duyệt.",
        "main_flow": [
            "Giảng viên chọn 'Thêm công trình mới'.",
            "Hệ thống hiển thị form điền thông tin (Tiêu đề bài báo, năm xuất bản, nơi công bố, tác giả khác, tóm tắt).",
            "Giảng viên điền thông tin bài báo và nhấn 'Gửi yêu cầu phê duyệt'.",
            "Hệ thống kiểm tra dữ liệu đầu vào hợp lệ.",
            "Backend tạo nút CongTrinhNghienCuu mới trên Neo4j, gán thuộc tính trang_thai = 'Chờ duyệt', tạo quan hệ đồng tác giả và tạo nút MutationRequest.",
            "Hệ thống hiển thị thông báo gửi yêu cầu thành công."
        ],
        "alt_flow": [],
        "exc_flow": [
            "4.a. Giảng viên nhập thiếu thông tin bắt buộc (Tiêu đề, năm xuất bản):",
            "  4.a.1. Hệ thống báo lỗi đỏ tại các trường tương ứng và yêu cầu hoàn tất thông tin.",
            "  Use case quay lại bước 3.",
            "4.b. Tiêu đề bài báo bị trùng lặp hoàn toàn với một công trình đã được duyệt trước đó:",
            "  4.b.1. Hệ thống cảnh báo bài báo có thể đã tồn tại và yêu cầu kiểm tra lại.",
            "  Use case quay lại bước 3."
        ]
    },
    {
        "title": "Đặc tả chức năng Yêu cầu sửa công trình cá nhân (Giảng viên)",
        "desc": "Cho phép giảng viên gửi yêu cầu chỉnh sửa thông tin của một công trình khoa học hiện có trong hồ sơ của mình.",
        "actor": "Giảng viên",
        "pre": "Đã đăng nhập, chọn công trình cần sửa trong danh sách công trình cá nhân.",
        "post": "Yêu cầu thay đổi thông tin công trình được chuyển vào hàng đợi phê duyệt của Admin.",
        "min_guar": "Thông tin công trình cũ và trạng thái phê duyệt trước đó được giữ nguyên.",
        "success_guar": "Lưu các thuộc tính thay đổi tạm thời trên hệ thống và tạo yêu cầu chờ duyệt.",
        "trigger": "Giảng viên sửa thông tin trên form và nhấn nút Cập nhật công trình.",
        "main_flow": [
            "Giảng viên click nút 'Chỉnh sửa' tại dòng công trình cần cập nhật.",
            "Hệ thống hiển thị form chứa thông tin hiện tại của công trình.",
            "Giảng viên sửa đổi các thông tin cần thiết và nhấn 'Lưu thay đổi'.",
            "Hệ thống kiểm tra dữ liệu và trạng thái công trình hợp lệ.",
            "Backend ghi nhận các trường thông tin thay đổi vào hàng đợi yêu cầu chỉnh sửa (MutationRequest) liên kết với công trình đó.",
            "Hệ thống báo gửi yêu cầu chỉnh sửa thành công."
        ],
        "alt_flow": [],
        "exc_flow": [
            "4.a. Công trình đang trong trạng thái Chờ duyệt của một yêu cầu trước đó chưa xử lý:",
            "  4.a.1. Hệ thống báo lỗi không thể chỉnh sửa công trình và chặn gửi yêu cầu.",
            "  Use case dừng lại."
        ]
    },
    {
        "title": "Đặc tả chức năng Yêu cầu xóa công trình cá nhân (Giảng viên)",
        "desc": "Cho phép giảng viên gửi yêu cầu xóa một công trình khoa học ra khỏi hồ sơ lý lịch khoa học cá nhân của mình.",
        "actor": "Giảng viên",
        "pre": "Đã đăng nhập, chọn công trình cần xóa trong danh sách công trình cá nhân.",
        "post": "Yêu cầu xóa công trình được gửi đến hàng chờ phê duyệt của Admin.",
        "min_guar": "Công trình vẫn tồn tại trong hồ sơ cá nhân của giảng viên ở trạng thái cũ.",
        "success_guar": "Tạo MutationRequest yêu cầu xóa công trình thành công.",
        "trigger": "Giảng viên nhấn nút Yêu cầu xóa công trình và xác nhận.",
        "main_flow": [
            "Giảng viên click biểu tượng 'Xóa' tại công trình khoa học tương ứng.",
            "Hệ thống hiển thị popup xác nhận: 'Bạn có chắc chắn muốn gửi yêu cầu xóa công trình này khỏi hồ sơ?'.",
            "Giảng viên nhấn nút 'Xác nhận'.",
            "Backend tạo một yêu cầu xóa (MutationRequest loại DELETE) liên kết với công trình khoa học tương ứng.",
            "Hệ thống hiển thị thông báo đã gửi yêu cầu xóa thành công."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xem danh sách đề tài cá nhân (Giảng viên)",
        "desc": "Cho phép giảng viên xem danh mục các đề tài nghiên cứu khoa học mình làm chủ nhiệm hoặc thành viên tham gia kèm theo trạng thái phê duyệt.",
        "actor": "Giảng viên",
        "pre": "Giảng viên đã đăng nhập và truy cập mục 'Đề tài của tôi'.",
        "post": "Hiển thị danh sách đề tài nghiên cứu cá nhân.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Thông tin đề tài hiển thị chính xác gồm tên đề tài, vai trò, cấp đề tài, thời gian thực hiện và trạng thái duyệt.",
        "trigger": "Giảng viên chọn mục 'Đề tài của tôi' trên menu điều hướng.",
        "main_flow": [
            "Giảng viên chọn mục 'Đề tài của tôi'.",
            "Hệ thống gửi yêu cầu lấy danh sách đề tài của giảng viên kèm token.",
            "Backend thực hiện truy vấn các nút DeTaiNghienCuu liên kết với nút GiangVien hiện tại.",
            "Hệ thống hiển thị danh sách đề tài kèm vai trò (Chủ nhiệm/Thành viên) lên màn hình."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Yêu cầu thêm đề tài cá nhân (Giảng viên)",
        "desc": "Cho phép giảng viên đăng ký một đề tài nghiên cứu khoa học mới vào hồ sơ cá nhân và gửi phê duyệt lên Admin.",
        "actor": "Giảng viên",
        "pre": "Đã đăng nhập, truy cập màn hình thêm đề tài.",
        "post": "Tạo nút đề tài nghiên cứu mới có trạng thái 'Chờ duyệt' và gửi yêu cầu phê duyệt đến Admin.",
        "min_guar": "Yêu cầu thêm mới không được tạo; danh sách đề tài hiện tại của giảng viên không bị ảnh hưởng.",
        "success_guar": "Tạo thành công nút DeTaiNghienCuu trạng thái 'Chờ duyệt' liên kết với giảng viên làm chủ nhiệm/thành viên trên Neo4j.",
        "trigger": "Giảng viên điền thông tin đề tài mới và nhấn nút Gửi phê duyệt.",
        "main_flow": [
            "Giảng viên chọn 'Thêm đề tài mới'.",
            "Hệ thống hiển thị form nhập liệu đề tài (Tên đề tài, cấp đề tài, năm bắt đầu, năm kết thúc, vai trò, tóm tắt).",
            "Giảng viên điền thông tin và nhấn 'Gửi yêu cầu'.",
            "Hệ thống kiểm tra dữ liệu đầu vào hợp lệ.",
            "Backend tạo nút DeTaiNghienCuu mới trạng thái 'Chờ duyệt', thiết lập mối quan hệ tương ứng và tạo MutationRequest phê duyệt.",
            "Hệ thống thông báo đã gửi yêu cầu phê duyệt thành công."
        ],
        "alt_flow": [],
        "exc_flow": [
            "4.a. Giảng viên nhập thiếu thông tin bắt buộc (Tên đề tài):",
            "  4.a.1. Hệ thống hiển thị cảnh báo đỏ và yêu cầu hoàn tất thông tin.",
            "  Use case quay lại bước 3."
        ]
    },
    {
        "title": "Đặc tả chức năng Yêu cầu sửa đề tài cá nhân (Giảng viên)",
        "desc": "Cho phép giảng viên chỉnh sửa thông tin đề tài nghiên cứu khoa học cá nhân và gửi yêu cầu cập nhật lên Admin.",
        "actor": "Giảng viên",
        "pre": "Đã đăng nhập, chọn đề tài cần sửa trong danh sách đề tài cá nhân.",
        "post": "Tạo yêu cầu thay đổi thông tin đề tài trong hàng đợi phê duyệt của Admin.",
        "min_guar": "Thông tin đề tài cũ và trạng thái phê duyệt trước đó được giữ nguyên.",
        "success_guar": "Hệ thống ghi nhận thông tin chỉnh sửa tạm thời và tạo yêu cầu duyệt tương ứng.",
        "trigger": "Giảng viên chỉnh sửa thông tin đề tài và nhấn nút Cập nhật đề tài.",
        "main_flow": [
            "Giảng viên nhấn 'Chỉnh sửa' tại đề tài tương ứng.",
            "Hệ thống hiển thị form chỉnh sửa đề tài chứa dữ liệu hiện có.",
            "Giảng viên cập nhật các trường dữ liệu và nhấn 'Lưu thay đổi'.",
            "Hệ thống kiểm tra dữ liệu và trạng thái đề tài hợp lệ.",
            "Backend ghi nhận thông tin thay đổi vào hàng đợi yêu cầu phê duyệt (MutationRequest) liên kết với đề tài.",
            "Hệ thống hiển thị thông báo đã gửi yêu cầu chỉnh sửa thành công."
        ],
        "alt_flow": [],
        "exc_flow": [
            "4.a. Đề tài đang ở trạng thái chờ duyệt của yêu cầu trước đó:",
            "  4.a.1. Hệ thống báo lỗi và không cho thực hiện chỉnh sửa.",
            "  Use case dừng lại."
        ]
    },
    {
        "title": "Đặc tả chức năng Yêu cầu xóa đề tài cá nhân (Giảng viên)",
        "desc": "Cho phép giảng viên gửi yêu cầu gỡ bỏ một đề tài nghiên cứu khoa học khỏi hồ sơ lý lịch cá nhân của mình.",
        "actor": "Giảng viên",
        "pre": "Đã đăng nhập, chọn đề tài cần xóa trong danh sách đề tài cá nhân.",
        "post": "Yêu cầu xóa đề tài được chuyển vào danh sách chờ phê duyệt của Admin.",
        "min_guar": "Đề tài vẫn tồn tại trong hồ sơ cá nhân của giảng viên ở trạng thái cũ.",
        "success_guar": "Tạo MutationRequest yêu cầu xóa đề tài thành công.",
        "trigger": "Giảng viên nhấn nút Yêu cầu xóa đề tài và xác nhận.",
        "main_flow": [
            "Giảng viên click chọn nút 'Xóa' đề tài.",
            "Hệ thống hiển thị popup xác nhận yêu cầu xóa đề tài.",
            "Giảng viên nhấn 'Xác nhận'.",
            "Backend tạo một yêu cầu xóa (MutationRequest loại DELETE) liên kết với đề tài tương ứng.",
            "Hệ thống báo đã gửi yêu cầu xóa đề tài thành công."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xem danh sách thùng rác cá nhân (Giảng viên)",
        "desc": "Cho phép giảng viên xem lại danh sách các bài báo, công trình khoa học hoặc đề tài cá nhân đã bị xóa mềm (is_deleted = true).",
        "actor": "Giảng viên",
        "pre": "Giảng viên đã đăng nhập và click chọn mục 'Thùng rác'.",
        "post": "Danh sách các thực thể cá nhân đã bị xóa mềm được hiển thị.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị đúng các thực thể bị xóa kèm thông tin thời gian xóa và lý do.",
        "trigger": "Giảng viên chọn mục 'Thùng rác' trên menu.",
        "main_flow": [
            "Giảng viên truy cập mục 'Thùng rác'.",
            "Hệ thống gửi yêu cầu lấy danh sách các thực thể bị xóa của giảng viên hiện tại.",
            "Backend truy vấn Neo4j tìm các nút CongTrinhNghienCuu hoặc DeTaiNghienCuu liên kết với GiangVien có thuộc tính is_deleted = true.",
            "Hệ thống hiển thị danh sách các thực thể đã xóa mềm lên giao diện."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Yêu cầu khôi phục dữ liệu từ thùng rác (Giảng viên)",
        "desc": "Cho phép giảng viên gửi yêu cầu khôi phục lại công trình khoa học hoặc đề tài đã bị xóa mềm trước đó.",
        "actor": "Giảng viên",
        "pre": "Đang xem danh sách thùng rác cá nhân, chọn thực thể cần khôi phục.",
        "post": "Yêu cầu khôi phục được gửi đến hàng chờ phê duyệt của Admin.",
        "min_guar": "Dữ liệu vẫn được giữ nguyên trong thùng rác cá nhân, không thay đổi trạng thái.",
        "success_guar": "Tạo yêu cầu khôi phục (MutationRequest loại RESTORE) thành công.",
        "trigger": "Giảng viên nhấn nút Khôi phục bên cạnh thực thể trong thùng rác.",
        "main_flow": [
            "Giảng viên nhấn nút 'Khôi phục' tại thực thể mong muốn trong thùng rác.",
            "Hệ thống hiển thị popup xác nhận gửi yêu cầu khôi phục.",
            "Giảng viên nhấn 'Xác nhận'.",
            "Backend tạo một yêu cầu khôi phục (MutationRequest loại RESTORE) liên kết với thực thể đó gửi lên Admin.",
            "Hệ thống thông báo gửi yêu cầu khôi phục thành công."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Gợi ý cộng sự tiềm năng (Giảng viên)",
        "desc": "Hệ thống tự động phân tích và đưa ra danh sách các giảng viên đồng nghiệp trong khoa có hướng nghiên cứu tương đồng để đề xuất hợp tác nghiên cứu khoa học.",
        "actor": "Giảng viên",
        "pre": "Giảng viên đã đăng nhập và truy cập trang Gợi ý cộng sự.",
        "post": "Danh sách giảng viên gợi ý kèm lý do tương đồng được hiển thị.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Gợi ý chính xác danh sách các giảng viên có điểm tương đồng hướng nghiên cứu cao nhất nhưng chưa từng hợp tác đồng tác giả.",
        "trigger": "Giảng viên nhấn chọn chức năng 'Gợi ý cộng sự tiềm năng'.",
        "main_flow": [
            "Giảng viên truy cập mục Gợi ý cộng sự.",
            "Hệ thống gửi yêu cầu lấy gợi ý kèm token của giảng viên.",
            "Backend chạy câu lệnh Cypher Neo4j so khớp hướng nghiên cứu: Cộng 3 điểm cho mỗi lĩnh vực nghiên cứu chung, cộng 1 điểm cho mỗi từ khóa trùng khớp trong tiêu đề bài báo/đề tài. Loại trừ những giảng viên đã từng hợp tác đồng tác giả.",
            "Backend sắp xếp danh sách theo điểm số từ cao xuống thấp và lấy tối đa 6 giảng viên.",
            "Hệ thống hiển thị danh sách giảng viên gợi ý kèm thông tin về các lĩnh vực/từ khóa chung giúp giảng viên dễ dàng tiếp cận."
        ],
        "alt_flow": [],
        "exc_flow": [
            "3.a. Giảng viên hiện tại chưa cập nhật hướng nghiên cứu hoặc bài báo trong hồ sơ:",
            "  3.a.1. Hệ thống hiển thị thông báo hướng dẫn giảng viên cập nhật hồ sơ cá nhân để thuật toán có thể chấm điểm chính xác."
        ]
    },
    {
        "title": "Đặc tả chức năng Xem dòng thời gian khoa học (Giảng viên)",
        "desc": "Cho phép giảng viên xem biểu diễn trực quan các mốc thời gian hoạt động khoa học cá nhân theo từng năm.",
        "actor": "Giảng viên",
        "pre": "Giảng viên đã đăng nhập và truy cập trang cá nhân.",
        "post": "Hiển thị dòng thời gian (Timeline) các năm xuất bản bài báo và thực hiện đề tài.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Dòng thời gian hiển thị chính xác các sự kiện khoa học sắp xếp theo thứ tự thời gian năm giảm dần.",
        "trigger": "Giảng viên nhấn chọn mục 'Dòng thời gian' trên menu.",
        "main_flow": [
            "Giảng viên chọn mục 'Dòng thời gian'.",
            "Hệ thống gọi API lấy danh sách hoạt động khoa học theo năm của giảng viên.",
            "Backend truy vấn các nút CongTrinhNghienCuu (năm xuất bản) và DeTaiNghienCuu (năm thực hiện) liên kết với giảng viên.",
            "Backend sắp xếp và nhóm dữ liệu theo từng năm.",
            "Hệ thống hiển thị giao diện timeline dạng chuỗi sự kiện trực quan trên màn hình."
        ],
        "alt_flow": [],
        "exc_flow": []
    },

    # --- NHÓM 3: QUẢN TRỊ VIÊN ---
    {
        "title": "Đặc tả chức năng Quản lý tài khoản cá nhân (Quản trị viên)",
        "desc": "Cho phép Admin cập nhật thông tin cá nhân (ảnh đại diện, họ tên, email) và đổi mật khẩu tài khoản admin đang đăng nhập.",
        "actor": "Quản trị viên",
        "pre": "Admin đã đăng nhập và đang ở mục Quản lý tài khoản cá nhân.",
        "post": "Thông tin tài khoản Admin được cập nhật thành công.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không có thay đổi trong cơ sở dữ liệu.",
        "success_guar": "Dữ liệu được cập nhật thành công vào nút Admin trên Neo4j.",
        "trigger": "Admin nhấn nút Lưu thông tin hoặc Cập nhật mật khẩu.",
        "main_flow": [
            "Admin vào mục Thông tin cá nhân.",
            "Hệ thống hiển thị form chứa thông tin admin hiện tại.",
            "Admin chỉnh sửa họ tên, email, ảnh hoặc điền mật khẩu mới.",
            "Admin nhấn nút 'Lưu thay đổi'.",
            "Hệ thống gửi thông tin về backend xác thực.",
            "Backend thực hiện cập nhật các thuộc tính tương ứng trên nút Admin trong Neo4j.",
            "Hệ thống hiển thị thông báo cập nhật thành công."
        ],
        "alt_flow": [],
        "exc_flow": [
            "5.a. Nhập sai mật khẩu hiện tại khi thực hiện đổi mật khẩu:",
            "  5.a.1. Hệ thống thông báo lỗi mật khẩu hiện tại không đúng.",
            "  Use case quay lại bước 3."
        ]
    },
    {
        "title": "Đặc tả chức năng Xem danh sách tài khoản người dùng (Quản trị viên)",
        "desc": "Cho phép Admin xem danh sách toàn bộ các tài khoản người dùng hệ thống (Giảng viên).",
        "actor": "Quản trị viên",
        "pre": "Admin đã đăng nhập, truy cập mục Quản lý tài khoản người dùng.",
        "post": "Danh sách các tài khoản người dùng được hiển thị trên bảng.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị chính xác thông tin tài khoản gồm email, trạng thái hoạt động (kích hoạt/khóa) và vai trò.",
        "trigger": "Admin chọn mục 'Quản lý tài khoản người dùng' trên Dashboard.",
        "main_flow": [
            "Admin click chọn mục 'Quản lý tài khoản'.",
            "Hệ thống gửi yêu cầu lấy danh sách tài khoản về API backend.",
            "Backend truy vấn Neo4j lấy danh sách các tài khoản người dùng đăng nhập.",
            "Hệ thống hiển thị bảng danh sách tài khoản kèm theo bộ lọc trạng thái và ô tìm kiếm nhanh."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Thêm mới tài khoản người dùng (Quản trị viên)",
        "desc": "Cho phép Admin tạo mới một tài khoản đăng nhập cho giảng viên.",
        "actor": "Quản trị viên",
        "pre": "Admin đang ở màn hình Thêm tài khoản người dùng.",
        "post": "Tài khoản người dùng mới được tạo thành công trong cơ sở dữ liệu.",
        "min_guar": "Tài khoản mới không được khởi tạo; danh sách tài khoản hiện có giữ nguyên.",
        "success_guar": "Tài khoản mới được tạo kèm mật khẩu khởi tạo mã hóa và trạng thái kích hoạt.",
        "trigger": "Admin nhập thông tin tài khoản mới và nhấn nút Lưu.",
        "main_flow": [
            "Admin nhấn nút 'Thêm tài khoản mới'.",
            "Hệ thống hiển thị form nhập thông tin (Email/Tên đăng nhập, mật khẩu khởi tạo, vai trò).",
            "Admin điền thông tin và nhấn nút 'Lưu tài khoản'.",
            "Backend kiểm tra tính duy nhất của email trên Neo4j.",
            "Backend thực hiện băm mật khẩu và tạo nút tài khoản đăng nhập.",
            "Hệ thống thông báo tạo tài khoản thành công."
        ],
        "alt_flow": [],
        "exc_flow": [
            "4.a. Email nhập vào đã tồn tại trên hệ thống:",
            "  4.a.1. Hệ thống báo lỗi 'Địa chỉ email này đã được sử dụng'.",
            "  Use case quay lại bước 3."
        ]
    },
    {
        "title": "Đặc tả chức năng Sửa thông tin/Khóa tài khoản người dùng (Quản trị viên)",
        "desc": "Cho phép Admin cập nhật thông tin tài khoản hoặc thay đổi trạng thái hoạt động (kích hoạt/khóa tài khoản) của giảng viên.",
        "actor": "Quản trị viên",
        "pre": "Admin ở danh sách tài khoản người dùng, chọn tài khoản cần chỉnh sửa.",
        "post": "Thông tin tài khoản được cập nhật hoặc trạng thái tài khoản bị khóa/mở khóa.",
        "min_guar": "Thông tin và trạng thái hoạt động của tài khoản người dùng được giữ nguyên trạng.",
        "success_guar": "Trạng thái hoạt động của tài khoản được cập nhật chính xác trên Neo4j và có hiệu lực ngay lập tức.",
        "trigger": "Admin nhấn nút Sửa hoặc Khóa tài khoản tương ứng.",
        "main_flow": [
            "Admin click chọn nút 'Chỉnh sửa' hoặc 'Khóa' trên dòng tài khoản.",
            "Hệ thống hiển thị popup chỉnh sửa hoặc popup xác nhận khóa tài khoản.",
            "Admin chỉnh sửa thông tin hoặc chọn trạng thái 'Khóa tài khoản' và nhấn 'Xác nhận'.",
            "Backend thực hiện cập nhật thuộc tính trang_thai (hoặc is_active = false) trên nút tài khoản trong Neo4j.",
            "Hệ thống cập nhật lại danh sách tài khoản hiển thị và thông báo thành công."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xóa tài khoản người dùng (Quản trị viên)",
        "desc": "Cho phép Admin xóa một tài khoản đăng nhập ra khỏi hệ thống.",
        "actor": "Quản trị viên",
        "pre": "Admin chọn tài khoản cần xóa trong danh sách.",
        "post": "Tài khoản bị xóa hoàn toàn (hoặc chuyển trạng thái xóa mềm) trong CSDL.",
        "min_guar": "Tài khoản không bị xóa; danh sách tài khoản người dùng được bảo toàn.",
        "success_guar": "Tài khoản đăng nhập bị xóa thành công khỏi CSDL.",
        "trigger": "Admin nhấn nút Xóa tài khoản và xác nhận.",
        "main_flow": [
            "Admin nhấn nút 'Xóa' tại tài khoản tương ứng.",
            "Hệ thống hiển thị popup cảnh báo xác nhận xóa tài khoản.",
            "Admin nhấn nút 'Xác nhận xóa'.",
            "Backend thực hiện xóa nút tài khoản đăng nhập khỏi Neo4j.",
            "Hệ thống thông báo xóa tài khoản thành công và tải lại danh sách."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xem danh sách giảng viên (Quản trị viên)",
        "desc": "Cho phép Admin xem danh sách toàn bộ hồ sơ giảng viên trong khoa và trạng thái lý lịch khoa học của họ.",
        "actor": "Quản trị viên",
        "pre": "Admin đăng nhập thành công, chọn mục Quản lý giảng viên.",
        "post": "Bảng danh sách giảng viên hiển thị đầy đủ thông tin cơ bản.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị chính xác danh sách giảng viên kèm học vị, bộ môn và trạng thái duyệt hồ sơ.",
        "trigger": "Admin click chọn mục 'Quản lý giảng viên' trên sidebar.",
        "main_flow": [
            "Admin chọn mục 'Quản lý giảng viên'.",
            "Hệ thống gửi yêu cầu lấy danh sách giảng viên về backend.",
            "Backend truy vấn danh sách tất cả các nút GiangVien trong cơ sở dữ liệu Neo4j.",
            "Hệ thống hiển thị danh sách giảng viên lên giao diện quản trị."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Thêm mới giảng viên (Quản trị viên)",
        "desc": "Cho phép Admin tạo mới một hồ sơ lý lịch khoa học cho giảng viên trực tiếp trên cơ sở dữ liệu đồ thị Neo4j.",
        "actor": "Quản trị viên",
        "pre": "Admin ở giao diện Thêm giảng viên mới.",
        "post": "Nút GiangVien mới được khởi tạo và liên kết thành công vào bộ môn tương ứng.",
        "min_guar": "Hồ sơ giảng viên mới không được tạo; cơ sở dữ liệu Neo4j không thay đổi.",
        "success_guar": "Tạo nút GiangVien mới và thiết lập mối quan hệ THUOC_BO_MON với bộ môn chỉ định trên Neo4j.",
        "trigger": "Admin điền thông tin giảng viên và nhấn nút Lưu.",
        "main_flow": [
            "Admin nhấn nút 'Thêm giảng viên'.",
            "Hệ thống hiển thị form điền thông tin lý lịch (Họ tên, email công tác, bộ môn, học vị, chức danh, hướng nghiên cứu).",
            "Admin điền thông tin và lựa chọn bộ môn trực thuộc.",
            "Admin nhấn nút 'Lưu hồ sơ'.",
            "Backend kiểm tra email giảng viên chưa tồn tại trên Neo4j.",
            "Backend thực hiện tạo nút GiangVien mới và tạo mối quan hệ THUOC_BO_MON.",
            "Hệ thống thông báo tạo hồ sơ giảng viên thành công."
        ],
        "alt_flow": [],
        "exc_flow": [
            "5.a. Trùng lặp email giảng viên với hồ sơ đã tồn tại trên Neo4j:",
            "  5.a.1. Hệ thống báo lỗi 'Giảng viên đã có hồ sơ trên hệ thống'.",
            "  Use case quay lại bước 3."
        ]
    },
    {
        "title": "Đặc tả chức năng Sửa thông tin giảng viên (Quản trị viên)",
        "desc": "Cho phép Admin trực tiếp chỉnh sửa thông tin lý lịch khoa học của một giảng viên trên hệ thống.",
        "actor": "Quản trị viên",
        "pre": "Admin chọn giảng viên cần chỉnh sửa trong danh sách giảng viên.",
        "post": "Các thuộc tính của nút GiangVien được cập nhật mới trên Neo4j.",
        "min_guar": "Hồ sơ giảng viên được giữ nguyên trạng thái cũ; thay đổi chưa được cập nhật.",
        "success_guar": "Thông tin cập nhật được lưu trực tiếp và hiển thị ngay lập tức trên hệ thống công khai.",
        "trigger": "Admin nhấn nút Sửa thông tin giảng viên và cập nhật dữ liệu.",
        "main_flow": [
            "Admin click chọn 'Chỉnh sửa' hồ sơ giảng viên.",
            "Hệ thống hiển thị form chứa toàn bộ thông tin hiện tại của giảng viên.",
            "Admin thay đổi các thông tin cần thiết và nhấn nút 'Lưu thay đổi'.",
            "Backend thực thi truy vấn Cypher cập nhật trực tiếp các thuộc tính của nút GiangVien tương ứng trên Neo4j.",
            "Hệ thống thông báo cập nhật hồ sơ thành công và tải lại bảng dữ liệu."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xóa giảng viên (Quản trị viên)",
        "desc": "Cho phép Admin thực hiện xóa mềm hồ sơ của một giảng viên ra khỏi danh sách hiển thị của hệ thống.",
        "actor": "Quản trị viên",
        "pre": "Admin chọn giảng viên cần xóa trong danh sách giảng viên.",
        "post": "Nút GiangVien bị gán cờ is_deleted = true and ẩn đi trên trang công khai.",
        "min_guar": "Hồ sơ giảng viên không bị thay đổi trạng thái xóa mềm; dữ liệu Neo4j giữ nguyên.",
        "success_guar": "Gán cờ is_deleted = true thành công, di chuyển thực thể vào thùng rác hệ thống.",
        "trigger": "Admin nhấn nút Xóa giảng viên và xác nhận.",
        "main_flow": [
            "Admin nhấn nút 'Xóa' tại giảng viên tương ứng.",
            "Hệ thống hiển thị popup xác nhận xóa giảng viên.",
            "Admin nhấn nút 'Xác nhận xóa mềm'.",
            "Backend thực hiện gán thuộc tính is_deleted = true, ghi nhận ngày xóa (deleted_at) trên nút GiangVien.",
            "Hệ thống ẩn giảng viên khỏi trang hiển thị công khai và thông báo xóa thành công."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Phê duyệt yêu cầu thay đổi lý lịch (Quản trị viên)",
        "desc": "Cho phép Admin phê duyệt hoặc từ chối các yêu cầu cập nhật thông tin cá nhân do giảng viên gửi lên.",
        "actor": "Quản trị viên",
        "pre": "Admin truy cập mục Phê duyệt yêu cầu thay đổi lý lịch trên Dashboard.",
        "post": "Thông tin lý lịch được cập nhật chính thức vào đồ thị (nếu duyệt) hoặc xóa các thông tin tạm thời (nếu từ chối).",
        "min_guar": "Yêu cầu phê duyệt được giữ nguyên ở trạng thái chờ; thông tin lý lịch chính thức của giảng viên chưa bị thay đổi.",
        "success_guar": "Đồng bộ thông tin từ các thuộc tính pending_ sang thuộc tính chính thức của nút GiangVien và xóa nút MutationRequest tương ứng.",
        "trigger": "Admin nhấn nút Phê duyệt hoặc Từ chối yêu cầu thay đổi.",
        "main_flow": [
            "Admin vào mục Phê duyệt lý lịch.",
            "Hệ thống hiển thị danh sách các yêu cầu đang chờ phê duyệt.",
            "Admin nhấn nút 'Phê duyệt' (Approve) tại yêu cầu tương ứng.",
            "Backend cập nhật các thuộc tính chính thức bằng giá trị của thuộc tính tạm thời (Ví dụ: ho_va_ten = pending_ho_va_ten) trên Neo4j và xóa thuộc tính tạm thời.",
            "Backend chuyển trạng thái của nút MutationRequest tương ứng thành 'Approved'.",
            "Hệ thống thông báo duyệt thành công và cập nhật lại danh sách."
        ],
        "alt_flow": [
            "3.a. Từ chối yêu cầu thay đổi thông tin:",
            "  3.a.1. Admin nhấn nút 'Từ chối' (Reject) và nhập lý do.",
            "  3.a.2. Backend thực hiện xóa bỏ các thuộc tính tạm thời trên nút GiangVien, cập nhật trạng thái MutationRequest thành 'Rejected' kèm lý do."
        ],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xem danh sách bộ môn (Quản trị viên)",
        "desc": "Cho phép Admin xem danh sách các bộ môn trong khoa và trưởng bộ môn hiện tại.",
        "actor": "Quản trị viên",
        "pre": "Admin đăng nhập thành công, chọn mục Quản lý bộ môn.",
        "post": "Bảng danh sách các bộ môn được hiển thị đầy đủ.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị đúng tên bộ môn, mô tả và họ tên giảng viên trưởng bộ môn.",
        "trigger": "Admin chọn mục 'Quản lý bộ môn' trên Dashboard.",
        "main_flow": [
            "Admin click chọn mục 'Quản lý bộ môn'.",
            "Hệ thống gửi yêu cầu lấy danh sách bộ môn.",
            "Backend truy vấn Neo4j lấy danh sách các nút BoMon và giảng viên liên kết qua mối quan hệ TRUONG_BO_MON.",
            "Hệ thống hiển thị danh sách bộ môn lên màn hình quản trị."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Thêm mới bộ môn (Quản trị viên)",
        "desc": "Cho phép Admin tạo mới một bộ môn trong khoa.",
        "actor": "Quản trị viên",
        "pre": "Admin ở giao diện Thêm bộ môn mới.",
        "post": "Nút BoMon mới được tạo thành công trong cơ sở dữ liệu.",
        "min_guar": "Thực thể bộ môn mới không được tạo; cơ sở dữ liệu Neo4j giữ nguyên.",
        "success_guar": "Nút bộ môn mới được khởi tạo và ghi nhận đầy đủ thuộc tính tên bộ môn.",
        "trigger": "Admin nhập tên bộ môn mới và nhấn nút Lưu.",
        "main_flow": [
            "Admin nhấn nút 'Thêm bộ môn'.",
            "Hệ thống hiển thị form nhập thông tin (Tên bộ môn).",
            "Admin điền thông tin và nhấn nút 'Lưu bộ môn'.",
            "Backend kiểm tra tính duy nhất của tên bộ môn trên Neo4j.",
            "Backend thực hiện tạo nút BoMon mới trên Neo4j.",
            "Hệ thống thông báo thêm bộ môn thành công."
        ],
        "alt_flow": [],
        "exc_flow": [
            "4.a. Trùng tên bộ môn đã có sẵn trên hệ thống:",
            "  4.a.1. Hệ thống hiển thị thông báo lỗi 'Tên bộ môn đã tồn tại'.",
            "  Use case quay lại bước 3."
        ]
    },
    {
        "title": "Đặc tả chức năng Sửa thông tin bộ môn (Quản trị viên)",
        "desc": "Cho phép Admin cập nhật lại tên của một bộ môn trong khoa.",
        "actor": "Quản trị viên",
        "pre": "Admin chọn bộ môn cần chỉnh sửa trong danh sách bộ môn.",
        "post": "Thông tin bộ môn được cập nhật mới trên Neo4j.",
        "min_guar": "Thông tin bộ môn được giữ nguyên trạng thái cũ; thay đổi chưa được cập nhật.",
        "success_guar": "Cập nhật thành công tên bộ môn trên Neo4j.",
        "trigger": "Admin thay đổi thông tin bộ môn và nhấn nút Cập nhật bộ môn.",
        "main_flow": [
            "Admin nhấn nút 'Sửa' tại bộ môn cần cập nhật.",
            "Hệ thống hiển thị form thông tin bộ môn chứa dữ liệu hiện có.",
            "Admin cập nhật tên bộ môn và nhấn 'Lưu thay đổi'.",
            "Backend cập nhật thuộc tính ten_bo_mon của nút BoMon trên Neo4j.",
            "Hệ thống báo cập nhật thành công."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xóa bộ môn (Quản trị viên)",
        "desc": "Cho phép Admin xóa một bộ môn ra khỏi cơ sở dữ liệu hệ thống.",
        "actor": "Quản trị viên",
        "pre": "Admin chọn bộ môn cần xóa trong danh sách bộ môn.",
        "post": "Bộ môn bị xóa mềm (gán is_deleted = true) khỏi cơ sở dữ liệu đồ thị.",
        "min_guar": "Bộ môn không bị thay đổi trạng thái xóa mềm; dữ liệu Neo4j giữ nguyên.",
        "success_guar": "Bộ môn được xóa mềm thành công và chuyển vào thùng rác.",
        "trigger": "Admin nhấn nút Xóa bộ môn và xác nhận.",
        "main_flow": [
            "Admin click chọn biểu tượng 'Xóa' bộ môn.",
            "Hệ thống hiển thị popup xác nhận xóa bộ môn.",
            "Admin nhấn nút 'Xác nhận', backend gán thuộc tính is_deleted = true trên nút BoMon.",
            "Hệ thống thông báo xóa bộ môn thành công và cập nhật lại danh sách hiển thị."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xem danh sách tác giả ngoài (Quản trị viên)",
        "desc": "Cho phép Admin xem danh sách toàn bộ tác giả bên ngoài đơn vị cùng tham gia hợp tác nghiên cứu học thuật.",
        "actor": "Quản trị viên",
        "pre": "Admin đã đăng nhập, chọn mục Quản lý tác giả ngoài.",
        "post": "Danh sách các tác giả ngoài được liệt kê đầy đủ trên bảng.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị đúng họ tên, đơn vị công tác, học vị và email của các tác giả ngoài.",
        "trigger": "Admin chọn mục 'Quản lý tác giả ngoài' trên Dashboard.",
        "main_flow": [
            "Admin chọn mục 'Quản lý tác giả ngoài'.",
            "Hệ thống gửi yêu cầu lấy danh sách tác giả ngoài về backend.",
            "Backend truy vấn các nút TacGiaNgoai trong Neo4j.",
            "Hệ thống hiển thị danh sách tác giả ngoài lên màn hình."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Thêm mới tác giả ngoài (Quản trị viên)",
        "desc": "Cho phép Admin tạo hồ sơ mới cho tác giả bên ngoài đơn vị.",
        "actor": "Quản trị viên",
        "pre": "Admin ở giao diện Thêm tác giả ngoài.",
        "post": "Nút TacGiaNgoai mới được tạo thành công trong cơ sở dữ liệu đồ thị.",
        "min_guar": "Tác giả ngoài mới không được tạo; cơ sở dữ liệu Neo4j giữ nguyên.",
        "success_guar": "Nút TacGiaNgoai mới được ghi nhận đầy đủ thông tin học vị, đơn vị công tác.",
        "trigger": "Admin nhập thông tin tác giả ngoài mới và nhấn nút Lưu.",
        "main_flow": [
            "Admin nhấn nút 'Thêm tác giả ngoài'.",
            "Hệ thống hiển thị form nhập thông tin (Họ tên, đơn vị công tác, email, học vị).",
            "Admin điền thông tin và nhấn nút 'Lưu tác giả ngoài'.",
            "Backend kiểm tra tính hợp lệ của thông tin nhập vào.",
            "Backend thực hiện tạo nút TacGiaNgoai trên Neo4j.",
            "Hệ thống thông báo thêm tác giả ngoài thành công."
        ],
        "alt_flow": [],
        "exc_flow": [
            "4.a. Nhập thiếu thông tin bắt buộc (Họ tên):",
            "  4.a.1. Hệ thống báo lỗi và yêu cầu nhập đầy đủ họ tên.",
            "  Use case quay lại bước 3."
        ]
    },
    {
        "title": "Đặc tả chức năng Sửa thông tin tác giả ngoài (Quản trị viên)",
        "desc": "Cho phép Admin cập nhật thông tin cá nhân (họ tên, đơn vị công tác, học vị, email) của tác giả ngoài.",
        "actor": "Quản trị viên",
        "pre": "Admin chọn tác giả ngoài cần chỉnh sửa trong danh sách.",
        "post": "Các thuộc tính của nút TacGiaNgoai được cập nhật mới trên Neo4j.",
        "min_guar": "Thông tin tác giả ngoài được giữ nguyên trạng thái cũ; thay đổi chưa được cập nhật.",
        "success_guar": "Cập nhật thành công thông tin tác giả ngoài.",
        "trigger": "Admin thay đổi thông tin tác giả ngoài và nhấn nút Cập nhật.",
        "main_flow": [
            "Admin nhấn nút 'Sửa' tại tác giả ngoài cần cập nhật.",
            "Hệ thống hiển thị form thông tin tác giả ngoài chứa dữ liệu hiện có.",
            "Admin cập nhật các trường thông tin và nhấn 'Lưu thay đổi'.",
            "Backend cập nhật thuộc tính nút TacGiaNgoai tương ứng trên Neo4j.",
            "Hệ thống báo cập nhật thành công."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xóa tác giả ngoài (Quản trị viên)",
        "desc": "Cho phép Admin xóa một tác giả ngoài ra khỏi cơ sở dữ liệu hệ thống.",
        "actor": "Quản trị viên",
        "pre": "Admin chọn tác giả ngoài cần xóa trong danh sách.",
        "post": "Tác giả ngoài bị xóa mềm (gán is_deleted = true) khỏi cơ sở dữ liệu đồ thị.",
        "min_guar": "Tác giả ngoài không bị thay đổi trạng thái xóa mềm; dữ liệu Neo4j giữ nguyên.",
        "success_guar": "Tác giả ngoài được xóa mềm thành công và chuyển vào thùng rác.",
        "trigger": "Admin nhấn nút Xóa tác giả ngoài và xác nhận.",
        "main_flow": [
            "Admin nhấn 'Xóa' tác giả ngoài.",
            "Hệ thống hiển thị popup xác nhận xóa tác giả ngoài.",
            "Admin xác nhận, backend gán thuộc tính is_deleted = true trên nút TacGiaNgoai.",
            "Hệ thống thông báo xóa tác giả ngoài thành công."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xem danh sách công trình khoa học (Quản trị viên)",
        "desc": "Cho phép Admin xem danh sách toàn bộ công trình khoa học (bài báo, kỷ yếu) đã được duyệt và cập nhật trên hệ thống.",
        "actor": "Quản trị viên",
        "pre": "Admin đăng nhập thành công, chọn mục Quản lý công trình khoa học.",
        "post": "Bảng danh sách toàn bộ các công trình khoa học hiển thị đầy đủ.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị chính xác tên công trình, nơi công bố, năm xuất bản, danh sách tác giả.",
        "trigger": "Admin chọn mục 'Quản lý công trình khoa học' trên Dashboard.",
        "main_flow": [
            "Admin chọn mục 'Quản lý công trình khoa học'.",
            "Hệ thống gửi yêu cầu lấy danh sách công trình về backend.",
            "Backend truy vấn Neo4j lấy danh sách tất cả các nút CongTrinhNghienCuu.",
            "Hệ thống hiển thị bảng danh sách công trình khoa học."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Thêm mới công trình khoa học (Quản trị viên)",
        "desc": "Cho phép Admin thêm trực tiếp một công trình khoa học mới vào cơ sở dữ liệu đồ thị.",
        "actor": "Quản trị viên",
        "pre": "Admin ở giao diện Thêm công trình mới.",
        "post": "Nút công trình mới được tạo thành công và liên kết trực tiếp đến các giảng viên/tác giả tham gia.",
        "min_guar": "Công trình mới không được tạo; cơ sở dữ liệu Neo4j giữ nguyên.",
        "success_guar": "Tạo nút CongTrinhNghienCuu trạng thái 'Đã duyệt' và thiết lập quan hệ TAC_GIA với các giảng viên liên quan.",
        "trigger": "Admin điền thông tin công trình và nhấn nút Lưu.",
        "main_flow": [
            "Admin chọn 'Thêm công trình'.",
            "Hệ thống hiển thị form nhập thông tin (Tiêu đề, năm xuất bản, nơi công bố, danh sách tác giả trong khoa, danh sách tác giả ngoài, tóm tắt).",
            "Admin điền thông tin và nhấn 'Lưu công trình'.",
            "Hệ thống kiểm tra tính hợp lệ của thông tin nhập vào.",
            "Backend tạo nút CongTrinhNghienCuu (trang_thai = 'Đã duyệt') và thiết lập mối quan hệ tác giả.",
            "Hệ thống thông báo thêm công trình thành công."
        ],
        "alt_flow": [],
        "exc_flow": [
            "4.a. Thiếu tiêu đề công trình hoặc năm xuất bản:",
            "  4.a.1. Hệ thống báo lỗi đỏ tại các trường bắt buộc.",
            "  Use case quay lại bước 3."
        ]
    },
    {
        "title": "Đặc tả chức năng Sửa thông tin công trình khoa học (Quản trị viên)",
        "desc": "Cho phép Admin cập nhật lại các thông tin hoặc thay đổi danh sách tác giả của một công trình khoa học.",
        "actor": "Quản trị viên",
        "pre": "Admin chọn công trình cần sửa trong danh sách.",
        "post": "Thông tin công trình khoa học được cập nhật trực tiếp trên Neo4j.",
        "min_guar": "Thông tin công trình được giữ nguyên trạng thái cũ; thay đổi chưa được cập nhật.",
        "success_guar": "Cập nhật thành công thông tin công trình khoa học và sắp xếp lại các mối quan hệ tác giả.",
        "trigger": "Admin chỉnh sửa thông tin công trình và nhấn nút Lưu.",
        "main_flow": [
            "Admin nhấn nút 'Sửa' tại công trình khoa học tương ứng.",
            "Hệ thống hiển thị form chỉnh sửa công trình chứa dữ liệu hiện có.",
            "Admin cập nhật các trường thông tin hoặc sửa danh sách tác giả và nhấn 'Lưu thay đổi'.",
            "Backend cập nhật thuộc tính nút CongTrinhNghienCuu và thiết lập lại các mối quan hệ đồng tác giả tương ứng trên Neo4j.",
            "Hệ thống thông báo cập nhật công trình thành công."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xóa công trình khoa học (Quản trị viên)",
        "desc": "Cho phép Admin thực hiện xóa mềm một công trình khoa học ra khỏi hệ thống hiển thị chính thức.",
        "actor": "Quản trị viên",
        "pre": "Admin chọn công trình cần xóa trong danh sách công trình.",
        "post": "Công trình khoa học bị gán cờ is_deleted = true và chuyển vào thùng rác hệ thống.",
        "min_guar": "Công trình không bị thay đổi trạng thái xóa mềm; dữ liệu Neo4j giữ nguyên.",
        "success_guar": "Gán cờ is_deleted = true thành công trên nút CongTrinhNghienCuu.",
        "trigger": "Admin nhấn nút Xóa công trình và xác nhận.",
        "main_flow": [
            "Admin click chọn nút 'Xóa' tại công trình tương ứng.",
            "Hệ thống hiển thị popup xác nhận xóa công trình.",
            "Admin nhấn 'Xác nhận xóa mềm'.",
            "Backend cập nhật thuộc tính is_deleted = true và ngày xóa (deleted_at) trên nút CongTrinhNghienCuu.",
            "Hệ thống thông báo xóa công trình thành công và ẩn khỏi giao diện."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Phê duyệt yêu cầu công trình từ giảng viên (Quản trị viên)",
        "desc": "Cho phép Admin phê duyệt hoặc từ chối yêu cầu thêm, sửa, xóa công trình khoa học do giảng viên gửi lên.",
        "actor": "Quản trị viên",
        "pre": "Admin truy cập mục Phê duyệt yêu cầu công trình.",
        "post": "Trạng thái công trình khoa học thay đổi theo quyết định của Admin.",
        "min_guar": "Yêu cầu được giữ nguyên ở trạng thái chờ; thông tin công trình chính thức chưa bị thay đổi.",
        "success_guar": "Cập nhật trạng thái công trình thành 'Đã duyệt' (nếu phê duyệt thêm mới/chỉnh sửa) hoặc gán cờ is_deleted = true (nếu phê duyệt yêu cầu xóa).",
        "trigger": "Admin nhấn nút Duyệt hoặc Từ chối yêu cầu công trình.",
        "main_flow": [
            "Admin vào mục Phê duyệt yêu cầu công trình khoa học.",
            "Hệ thống hiển thị danh sách các yêu cầu đang chờ phê duyệt.",
            "Admin nhấn nút 'Phê duyệt' (Approve) tại yêu cầu tương ứng.",
            "Backend đổi thuộc tính trang_thai thành 'Đã duyệt' (đối với yêu cầu thêm), thực hiện cập nhật chỉnh sửa (đối với yêu cầu sửa), hoặc gán is_deleted = true (đối với yêu cầu xóa).",
            "Backend cập nhật trạng thái của MutationRequest liên quan thành 'Approved'.",
            "Hệ thống báo duyệt thành công và cập nhật lại danh sách hiển thị."
        ],
        "alt_flow": [
            "3.a. Từ chối yêu cầu phê duyệt công trình:",
            "  3.a.1. Admin nhấn nút 'Từ chối' (Reject) và nhập lý do.",
            "  3.a.2. Backend đổi trạng thái công trình thành 'Từ chối' (nếu là yêu cầu thêm), hoặc khôi phục dữ liệu cũ, cập nhật MutationRequest thành 'Rejected' kèm lý do."
        ],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xem danh sách đề tài nghiên cứu (Quản trị viên)",
        "desc": "Cho phép Admin xem danh sách toàn bộ các đề tài nghiên cứu khoa học các cấp đang được quản lý trên hệ thống.",
        "actor": "Quản trị viên",
        "pre": "Admin đăng nhập thành công, chọn mục Quản lý đề tài khoa học.",
        "post": "Bảng danh sách đề tài nghiên cứu khoa học hiển thị đầy đủ.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị chính xác tên đề tài, cấp đề tài, chủ nhiệm đề tài và thời gian thực hiện.",
        "trigger": "Admin chọn mục 'Quản lý đề tài nghiên cứu' trên Dashboard.",
        "main_flow": [
            "Admin chọn mục 'Quản lý đề tài nghiên cứu'.",
            "Hệ thống gửi yêu cầu lấy danh sách đề tài về backend.",
            "Backend truy vấn Neo4j lấy danh sách tất cả các nút DeTaiNghienCuu.",
            "Hệ thống hiển thị bảng danh sách đề tài nghiên cứu khoa học."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Thêm mới đề tài nghiên cứu (Quản trị viên)",
        "desc": "Cho phép Admin thêm trực tiếp một đề tài nghiên cứu khoa học mới vào cơ sở dữ liệu đồ thị.",
        "actor": "Quản trị viên",
        "pre": "Admin ở giao diện Thêm đề tài mới.",
        "post": "Nút đề tài mới được tạo thành công và liên kết trực tiếp đến các thành viên tham gia.",
        "min_guar": "Đề tài mới không được tạo; cơ sở dữ liệu Neo4j giữ nguyên.",
        "success_guar": "Tạo nút DeTaiNghienCuu trạng thái 'Đã duyệt' và thiết lập quan hệ CHU_NHIEM, THANH_VIEN với các giảng viên liên quan.",
        "trigger": "Admin điền thông tin đề tài và nhấn nút Lưu.",
        "main_flow": [
            "Admin chọn 'Thêm đề tài'.",
            "Hệ thống hiển thị form nhập thông tin (Tên đề tài, cấp đề tài, năm bắt đầu, năm kết thúc, chủ nhiệm đề tài, thành viên tham gia, tóm tắt).",
            "Admin điền thông tin và nhấn 'Lưu đề tài'.",
            "Hệ thống kiểm tra tính hợp lệ của thông tin nhập vào.",
            "Backend tạo nút DeTaiNghienCuu (trang_thai = 'Đã duyệt') và thiết lập mối quan hệ chủ nhiệm/thành viên.",
            "Hệ thống thông báo thêm đề tài thành công."
        ],
        "alt_flow": [],
        "exc_flow": [
            "4.a. Thiếu thông tin bắt buộc (Tên đề tài):",
            "  4.a.1. Hệ thống báo lỗi đỏ tại các trường tương ứng.",
            "  Use case quay lại bước 3."
        ]
    },
    {
        "title": "Đặc tả chức năng Sửa thông tin đề tài nghiên cứu (Quản trị viên)",
        "desc": "Cho phép Admin cập nhật lại các thông tin hoặc thay đổi danh sách thành viên của một đề tài nghiên cứu khoa học.",
        "actor": "Quản trị viên",
        "pre": "Admin chọn đề tài cần sửa trong danh sách.",
        "post": "Thông tin đề tài nghiên cứu được cập nhật trực tiếp trên Neo4j.",
        "min_guar": "Thông tin đề tài được giữ nguyên trạng thái cũ; thay đổi chưa được cập nhật.",
        "success_guar": "Cập nhật thành công thông tin đề tài nghiên cứu và sắp xếp lại các mối quan hệ thành viên.",
        "trigger": "Admin chỉnh sửa thông tin đề tài và nhấn nút Lưu.",
        "main_flow": [
            "Admin nhấn nút 'Sửa' tại đề tài nghiên cứu tương ứng.",
            "Hệ thống hiển thị form chỉnh sửa đề tài chứa dữ liệu hiện có.",
            "Admin cập nhật các trường thông tin hoặc sửa danh sách thành viên và nhấn 'Lưu thay đổi'.",
            "Backend cập nhật thuộc tính nút DeTaiNghienCuu và thiết lập lại các mối quan hệ chủ nhiệm/thành viên tương ứng."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xóa đề tài nghiên cứu (Quản trị viên)",
        "desc": "Cho phép Admin thực hiện xóa mềm một đề tài nghiên cứu khoa học ra khỏi hệ thống hiển thị chính thức.",
        "actor": "Quản trị viên",
        "pre": "Admin chọn đề tài cần xóa trong danh sách đề tài.",
        "post": "Đề tài nghiên cứu khoa học bị gán cờ is_deleted = true và chuyển vào thùng rác hệ thống.",
        "min_guar": "Đề tài không bị thay đổi trạng thái xóa mềm; dữ liệu Neo4j giữ nguyên.",
        "success_guar": "Gán cờ is_deleted = true thành công trên nút DeTaiNghienCuu.",
        "trigger": "Admin nhấn nút Xóa đề tài và xác nhận.",
        "main_flow": [
            "Admin click chọn nút 'Xóa' tại đề tài tương ứng.",
            "Hệ thống hiển thị popup xác nhận xóa đề tài.",
            "Admin nhấn 'Xác nhận xóa mềm'.",
            "Backend cập nhật thuộc tính is_deleted = true và ngày xóa (deleted_at) trên nút DeTaiNghienCuu.",
            "Hệ thống thông báo xóa đề tài thành công và ẩn đề tài khỏi giao diện."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Phê duyệt yêu cầu đề tài từ giảng viên (Quản trị viên)",
        "desc": "Cho phép Admin phê duyệt hoặc từ chối yêu cầu thêm, sửa, xóa đề tài nghiên cứu do giảng viên gửi lên.",
        "actor": "Quản trị viên",
        "pre": "Admin truy cập mục Phê duyệt yêu cầu đề tài.",
        "post": "Trạng thái đề tài nghiên cứu khoa học thay đổi theo quyết định của Admin.",
        "min_guar": "Yêu cầu được giữ nguyên ở trạng thái chờ; thông tin đề tài chính thức chưa bị thay đổi.",
        "success_guar": "Cập nhật trạng thái đề tài thành 'Đã duyệt' (nếu phê duyệt thêm mới/chỉnh sửa) hoặc gán cờ is_deleted = true (nếu phê duyệt yêu cầu xóa).",
        "trigger": "Admin nhấn nút Duyệt hoặc Từ chối yêu cầu đề tài.",
        "main_flow": [
            "Admin vào mục Phê duyệt yêu cầu đề tài.",
            "Hệ thống hiển thị danh sách các yêu cầu đang chờ phê duyệt.",
            "Admin nhấn nút 'Phê duyệt' (Approve) tại yêu cầu tương ứng.",
            "Backend đổi thuộc tính trang_thai thành 'Đã duyệt' (đối với yêu cầu thêm), thực hiện cập nhật chỉnh sửa (đối với yêu cầu sửa), hoặc gán is_deleted = true (đối với yêu cầu xóa).",
            "Backend cập nhật trạng thái của MutationRequest liên quan thành 'Approved'.",
            "Hệ thống báo duyệt thành công và cập nhật lại danh sách hiển thị."
        ],
        "alt_flow": [
            "3.a. Từ chối yêu cầu phê duyệt đề tài:",
            "  3.a.1. Admin nhấn nút 'Từ chối' (Reject) và nhập lý do.",
            "  3.a.2. Backend đổi trạng thái đề tài thành 'Từ chối' (nếu là yêu cầu thêm), hoặc khôi phục dữ liệu cũ, cập nhật MutationRequest thành 'Rejected' kèm lý do."
        ],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xem danh sách lĩnh vực nghiên cứu (Quản trị viên)",
        "desc": "Cho phép Admin xem danh sách toàn bộ các lĩnh vực nghiên cứu khoa học đang tồn tại trên hệ thống.",
        "actor": "Quản trị viên",
        "pre": "Admin đăng nhập thành công, chọn mục Quản lý lĩnh vực nghiên cứu.",
        "post": "Bảng danh sách các lĩnh vực nghiên cứu được hiển thị đầy đủ.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị đúng tên lĩnh vực nghiên cứu và thời gian tạo.",
        "trigger": "Admin chọn mục 'Quản lý lĩnh vực nghiên cứu' trên Dashboard.",
        "main_flow": [
            "Admin click chọn mục 'Quản lý lĩnh vực nghiên cứu'.",
            "Hệ thống gửi yêu cầu lấy danh sách lĩnh vực.",
            "Backend truy vấn Neo4j lấy danh sách tất cả các nút LinhVucNghienCuu.",
            "Hệ thống hiển thị danh sách lĩnh vực lên màn hình quản trị."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Thêm mới lĩnh vực nghiên cứu (Quản trị viên)",
        "desc": "Cho phép Admin tạo mới một nút thực thể lĩnh vực nghiên cứu khoa học.",
        "actor": "Quản trị viên",
        "pre": "Admin ở giao diện Thêm lĩnh vực nghiên cứu mới.",
        "post": "Nút LinhVucNghienCuu mới được tạo thành công trong cơ sở dữ liệu.",
        "min_guar": "Lĩnh vực mới không được tạo; cơ sở dữ liệu Neo4j giữ nguyên.",
        "success_guar": "Nút lĩnh vực mới được khởi tạo và ghi nhận đầy đủ thuộc tính tên.",
        "trigger": "Admin nhập tên lĩnh vực mới và nhấn nút Lưu.",
        "main_flow": [
            "Admin nhấn nút 'Thêm lĩnh vực'.",
            "Hệ thống hiển thị form nhập thông tin (Tên lĩnh vực nghiên cứu).",
            "Admin điền thông tin và nhấn nút 'Lưu lĩnh vực'.",
            "Backend kiểm tra tính duy nhất của tên lĩnh vực.",
            "Backend thực hiện tạo nút LinhVucNghienCuu mới trên Neo4j.",
            "Hệ thống thông báo thêm lĩnh vực thành công."
        ],
        "alt_flow": [],
        "exc_flow": [
            "4.a. Trùng tên lĩnh vực đã có sẵn trên hệ thống:",
            "  4.a.1. Hệ thống báo lỗi 'Tên lĩnh vực nghiên cứu đã tồn tại'.",
            "  Use case quay lại bước 3."
        ]
    },
    {
        "title": "Đặc tả chức năng Sửa lĩnh vực nghiên cứu (Quản trị viên)",
        "desc": "Cho phép Admin chỉnh sửa tên của một lĩnh vực nghiên cứu.",
        "actor": "Quản trị viên",
        "pre": "Admin chọn lĩnh vực nghiên cứu cần chỉnh sửa trong danh sách.",
        "post": "Thông tin lĩnh vực nghiên cứu được cập nhật mới trên Neo4j.",
        "min_guar": "Thông tin lĩnh vực được giữ nguyên trạng thái cũ; thay đổi chưa được cập nhật.",
        "success_guar": "Cập nhật thành công tên lĩnh vực nghiên cứu trên Neo4j.",
        "trigger": "Admin thay đổi tên lĩnh vực và nhấn nút Cập nhật.",
        "main_flow": [
            "Admin nhấn nút 'Sửa' tại lĩnh vực nghiên cứu tương ứng.",
            "Hệ thống hiển thị form chứa tên hiện tại của lĩnh vực.",
            "Admin cập nhật tên và nhấn 'Lưu thay đổi'.",
            "Backend cập nhật thuộc tính tên của nút LinhVucNghienCuu tương ứng trên Neo4j.",
            "Hệ thống báo cập nhật thành công."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xóa lĩnh vực nghiên cứu (Quản trị viên)",
        "desc": "Cho phép Admin xóa một lĩnh vực nghiên cứu ra khỏi cơ sở dữ liệu.",
        "actor": "Quản trị viên",
        "pre": "Admin chọn lĩnh vực nghiên cứu cần xóa trong danh sách.",
        "post": "Lĩnh vực nghiên cứu bị xóa mềm (gán is_deleted = true) khỏi cơ sở dữ liệu đồ thị.",
        "min_guar": "Lĩnh vực không bị thay đổi trạng thái xóa mềm; dữ liệu Neo4j giữ nguyên.",
        "success_guar": "Lĩnh vực nghiên cứu được xóa mềm thành công và chuyển vào thùng rác.",
        "trigger": "Admin nhấn nút Xóa lĩnh vực và xác nhận.",
        "main_flow": [
            "Admin nhấn 'Xóa' lĩnh vực.",
            "Hệ thống hiển thị popup xác nhận xóa lĩnh vực nghiên cứu.",
            "Admin xác nhận, backend gán thuộc tính is_deleted = true trên nút LinhVucNghienCuu.",
            "Hệ thống thông báo xóa lĩnh vực thành công."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xem danh sách thùng rác hệ thống (Quản trị viên)",
        "desc": "Cho phép Admin xem danh sách toàn bộ các thực thể đã bị xóa mềm (is_deleted = true) trong hệ thống.",
        "actor": "Quản trị viên",
        "pre": "Admin đã đăng nhập, truy cập mục Thùng rác hệ thống.",
        "post": "Danh sách các thực thể bị xóa mềm (Giảng viên, Bộ môn, Công trình, Đề tài) được hiển thị.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị đúng các thực thể bị xóa kèm thông tin thời gian xóa và loại thực thể.",
        "trigger": "Admin chọn mục 'Quản lý thùng rác' trên Dashboard.",
        "main_flow": [
            "Admin truy cập mục Quản lý thùng rác.",
            "Hệ thống gửi yêu cầu lấy danh sách các thực thể bị xóa mềm từ backend.",
            "Backend truy vấn Neo4j tìm các nút có thuộc tính is_deleted = true.",
            "Hệ thống hiển thị danh sách các thực thể đã xóa mềm phân loại theo tab thực thể."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Khôi phục thực thể từ thùng rác (Quản trị viên)",
        "desc": "Cho phép Admin khôi phục nguyên trạng một thực thể và các mối quan hệ đã bị xóa mềm trở lại hoạt động bình thường.",
        "actor": "Quản trị viên",
        "pre": "Admin ở danh sách thùng rác, chọn thực thể cần khôi phục.",
        "post": "Thực thể được khôi phục quyền hoạt động chính thức và hiển thị lại trên trang công khai.",
        "min_guar": "Thực thể vẫn nằm trong thùng rác hệ thống; trạng thái xóa mềm không thay đổi.",
        "success_guar": "Gỡ bỏ cờ is_deleted và khôi phục trạng thái cũ thành công trên Neo4j.",
        "trigger": "Admin nhấn nút Khôi phục bên cạnh thực thể trong thùng rác.",
        "main_flow": [
            "Admin nhấn nút 'Khôi phục' tại thực thể tương ứng.",
            "Hệ thống hiển thị popup xác nhận khôi phục thực thể.",
            "Admin nhấn 'Xác nhận khôi phục'.",
            "Backend thực hiện câu lệnh Cypher gỡ bỏ cờ is_deleted = true, khôi phục thuộc tính trang_thai về trạng thái cũ và xóa thuộc tính deleted_at.",
            "Hệ thống thông báo khôi phục thành công và tải lại danh sách thùng rác."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xóa vĩnh viễn thực thể khỏi hệ thống (Quản trị viên)",
        "desc": "Cho phép Admin xóa hoàn toàn thực thể khỏi cơ sở dữ liệu đồ thị Neo4j.",
        "actor": "Quản trị viên",
        "pre": "Admin ở danh sách thùng rác, chọn thực thể cần xóa vĩnh viễn.",
        "post": "Thực thể và tất cả các cạnh kết nối bị xóa bỏ hoàn toàn khỏi Neo4j.",
        "min_guar": "Thực thể vẫn được bảo toàn trong thùng rác hệ thống; dữ liệu không bị xóa khỏi Neo4j.",
        "success_guar": "Thực hiện DETACH DELETE thực thể thành công khỏi database Neo4j.",
        "trigger": "Admin nhấn nút Xóa vĩnh viễn bên cạnh thực thể trong thùng rác.",
        "main_flow": [
            "Admin nhấn nút 'Xóa vĩnh viễn' tại thực thể.",
            "Hệ thống hiển thị popup cảnh báo hành động này không thể khôi phục.",
            "Admin nhấn 'Xác nhận xóa vĩnh viễn'.",
            "Backend thực hiện câu lệnh Cypher DETACH DELETE để xóa hoàn toàn nút thực thể và các mối quan hệ liên kết khỏi Neo4j.",
            "Hệ thống thông báo xóa vĩnh viễn thành công."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Nhập dữ liệu từ Excel (Quản trị viên)",
        "desc": "Cho phép Admin import hàng loạt dữ liệu giảng viên, bộ môn, công trình khoa học, đề tài nghiên cứu từ tệp Excel.",
        "actor": "Quản trị viên",
        "pre": "Admin chuẩn bị tệp Excel đúng mẫu và truy cập trang Nhập dữ liệu.",
        "post": "Dữ liệu được nạp đầy đủ vào Neo4j, tự động thiết lập các mối quan hệ thực thể.",
        "min_guar": "Nếu xảy ra lỗi, toàn bộ dữ liệu đang nhập sẽ bị hủy; cơ sở dữ liệu Neo4j được giữ nguyên trạng thái trước khi thực hiện import.",
        "success_guar": "Nạp dữ liệu thành công, tránh trùng lặp thông tin nhờ cơ chế đối chiếu email/tiêu đề và hiển thị báo cáo số lượng bản ghi.",
        "trigger": "Admin tải lên tệp Excel hợp lệ và nhấn nút Bắt đầu import.",
        "main_flow": [
            "Admin truy cập trang 'Nhập từ Excel'.",
            "Admin click chọn tải tệp Excel lên từ máy tính.",
            "Admin nhấn nút 'Bắt đầu nạp dữ liệu'.",
            "Hệ thống gửi tệp Excel về backend xử lý.",
            "Backend đọc tệp Excel, thực hiện tiền xử lý làm sạch và chuẩn hóa tiếng Việt.",
            "Backend thực hiện đối chiếu kiểm tra thực thể trùng lặp.",
            "Backend thực thi các truy vấn Cypher nạp dữ liệu hàng loạt và thiết lập các mối quan hệ tương ứng trên Neo4j.",
            "Hệ thống hiển thị thông báo kết quả import thành công lên màn hình."
        ],
        "alt_flow": [],
        "exc_flow": [
            "4.a. Sai cấu trúc tệp Excel (thiếu cột hoặc sai tên sheet):",
            "  4.a.1. Hệ thống hiển thị thông báo lỗi cấu trúc tệp và dừng quá trình import.",
            "  Use case dừng lại.",
            "5.a. Lỗi kiểu dữ liệu ở một số dòng bản ghi:",
            "  5.a.1. Hệ thống báo cáo dòng bị lỗi cụ thể và bỏ qua dòng lỗi đó, tiếp tục nạp các dòng hợp lệ còn lại."
        ]
    },
    {
        "title": "Đặc tả chức năng Xuất dữ liệu ra CSV (Quản trị viên)",
        "desc": "Cho phép Admin kết xuất dữ liệu của các thực thể trong cơ sở dữ liệu ra tệp CSV để phục vụ sao lưu dữ liệu.",
        "actor": "Quản trị viên",
        "pre": "Admin truy cập mục Xuất dữ liệu trên Dashboard.",
        "post": "Tệp CSV chứa dữ liệu của thực thể được tải về máy tính.",
        "min_guar": "Không ghi tệp CSV lỗi; cơ sở dữ liệu Neo4j không bị ảnh hưởng.",
        "success_guar": "Tải về thành công tệp CSV chứa đầy đủ và đúng định dạng các bản ghi thực thể.",
        "trigger": "Admin chọn loại thực thể cần xuất và nhấn nút Xuất dữ liệu.",
        "main_flow": [
            "Admin chọn mục 'Xuất dữ liệu'.",
            "Admin lựa chọn loại thực thể cần xuất (Ví dụ: Giảng viên, Bài báo khoa học, Đề tài).",
            "Admin nhấn nút 'Tải về CSV'.",
            "Backend truy xuất tất cả các thuộc tính của các thực thể được chọn từ Neo4j.",
            "Backend chuyển đổi tập dữ liệu thành định dạng CSV mã hóa UTF-8.",
            "Backend gửi tệp tin dưới dạng phản hồi tải về cho trình duyệt của Admin.",
            "Hệ thống bắt đầu quá trình tải tệp xuống máy tính của Admin."
        ],
        "alt_flow": [],
        "exc_flow": []
    },
    {
        "title": "Đặc tả chức năng Xem thống kê báo cáo (Quản trị viên)",
        "desc": "Cho phép Admin xem tổng quan số liệu thống kê toàn bộ hệ thống tri thức khoa học trên Dashboard.",
        "actor": "Quản trị viên",
        "pre": "Admin đăng nhập thành công và truy cập trang chủ Dashboard quản trị.",
        "post": "Các thẻ số liệu tổng quan và biểu đồ thống kê hệ thống hiển thị đầy đủ.",
        "min_guar": "Hệ thống giữ nguyên trạng thái cũ, không làm thay đổi cơ sở dữ liệu.",
        "success_guar": "Hiển thị đúng tổng số giảng viên, đề tài, công trình, bộ môn và biểu đồ phân bổ học vị, xu hướng nghiên cứu.",
        "trigger": "Admin truy cập trang chủ Admin Dashboard.",
        "main_flow": [
            "Admin đăng nhập vào Dashboard.",
            "Hệ thống gọi API thống kê tổng hợp dành riêng cho Admin.",
            "Backend thực hiện đếm số lượng các nhãn nút khác nhau và gom nhóm theo trạng thái.",
            "Hệ thống hiển thị các số liệu tổng quan ở các thẻ đầu trang và vẽ biểu đồ phân tích."
        ],
        "alt_flow": [],
        "exc_flow": []
    }
]

def format_use_case(uc, index):
    lines = []
    lines.append(f"### Bảng 3.{index}. {uc['title']}")
    lines.append(f"* **Mô tả:** {uc['desc']}")
    lines.append(f"* **Actor:** {uc['actor']}")
    lines.append(f"* **Tiền điều kiện:** {uc['pre']}")
    lines.append(f"* **Hậu điều kiện:** {uc['post']}")
    lines.append(f"* **Đảm bảo tối thiểu:** {uc['min_guar']}")
    lines.append(f"* **Đảm bảo thành công:** {uc['success_guar']}")
    lines.append(f"* **Kích hoạt:** {uc['trigger']}")
    
    lines.append("* **Chuỗi sự kiện chính:**")
    for i, step in enumerate(uc['main_flow'], 1):
        lines.append(f"  {i}. {step}")
    
    # Extract clean title for termination message
    uc_clean_title = uc['title'].replace("Đặc tả chức năng ", "").replace("Đặc tả hệ thống của chức năng ", "")
    lines.append(f"  *Use case chức năng “{uc_clean_title}” dừng lại.*")
        
    if uc['alt_flow']:
        lines.append("* **Chuỗi sự kiện thay thế:**")
        for step in uc['alt_flow']:
            lines.append(f"  {step}")
            
    if uc['exc_flow']:
        lines.append("* **Chuỗi sự kiện ngoại lệ:**")
        for step in uc['exc_flow']:
            lines.append(f"  {step}")
            
    lines.append("\n---\n")
    return "\n".join(lines)

def main():
    output_path = r"d:\research-graph-system\docs\use_case_specifications.md"
    
    header = """# 3.6. ĐẶC TẢ CHI TIẾT CÁC USE CASE HỆ THỐNG

Tài liệu dưới đây chứa thông tin đặc tả chi tiết của các Use Case trong hệ thống Bản đồ tri thức nghiên cứu khoa học và Trợ lý hỏi đáp tự động (GraphRAG Chatbot). Nội dung được định dạng dưới dạng văn bản thuần có cấu trúc rõ ràng, tương thích hoàn toàn với danh mục chức năng nghiệp vụ của hệ thống (Bảng 3.1, Bảng 3.2, Bảng 3.3).

---
"""
    
    use_case_text = header + "\n"
    for idx, uc in enumerate(use_cases, 7):
        use_case_text += format_use_case(uc, idx)
        
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(use_case_text)
    print(f"Generated {len(use_cases)} use case specifications at {output_path}")
    
    # Also update docs/thesis_chapter_3.md
    thesis_path = r"d:\research-graph-system\docs\thesis_chapter_3.md"
    if os.path.exists(thesis_path):
        with open(thesis_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        marker = "# 3.6. ĐẶC TẢ CHI TIẾT CÁC USE CASE HỆ THỐNG"
        if marker in content:
            parts = content.split(marker)
            new_content = parts[0] + use_case_text
            with open(thesis_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated {thesis_path} successfully.")
        else:
            print(f"Error: Marker '{marker}' not found in {thesis_path}")
    else:
        print(f"Warning: {thesis_path} does not exist.")

if __name__ == '__main__':
    main()
