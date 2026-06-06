# CHƯƠNG 3. PHÂN TÍCH VÀ PHÁT TRIỂN HỆ THỐNG

## 3.1. KHẢO SÁT HIỆN TRẠNG

Hoạt động nghiên cứu khoa học và chuyển giao công nghệ tại Khoa Công nghệ thông tin – Trường Đại học Nha Trang đóng vai trò quan trọng trong việc nâng cao chất lượng đào tạo và khẳng định vị thế học thuật của nhà trường. Hàng năm, số lượng đề tài nghiên cứu các cấp (cấp cơ sở, cấp tỉnh, cấp bộ), các bài báo công bố trên các tạp chí khoa học trong nước, quốc tế và các đề tài nghiên cứu khoa học của sinh viên đạt số lượng lớn và tăng trưởng đều đặn. 

Mặc dù sở hữu nguồn tài nguyên tri thức phong phú, công tác quản lý và khai thác thông tin khoa học tại đơn vị hiện vẫn đang đối mặt với nhiều rào cản thực tế:

*   **Quy trình quản lý dữ liệu thủ công và phân tán:** Hiện tại, thông tin về các công trình nghiên cứu và lý lịch khoa học của giảng viên được lưu trữ rải rác dưới dạng các tệp Excel, Word hoặc PDF do văn phòng Khoa hoặc các cá nhân tự quản lý. Việc thiếu một cơ sở dữ liệu tập trung dẫn đến tình trạng khó cập nhật và dễ thất lạc thông tin.
*   **Trang tin điện tử của Khoa hoạt động theo dạng tĩnh:** Kênh thông tin công khai duy nhất hiện tại của Khoa chỉ cung cấp danh mục bài báo khoa học được phân chia thủ công theo từng năm học riêng biệt dưới dạng các bảng HTML đơn điệu. Dữ liệu này hiện tại mới chỉ được cập nhật đến năm học 2020-2021, gây khó khăn cho việc theo dõi các hoạt động nghiên cứu mới nhất.
*   **Sự thiếu hụt kết nối ngữ nghĩa:** Hệ thống hiện tại hoàn toàn tách biệt giữa hồ sơ giảng viên (trang nhân sự) và các kết quả nghiên cứu (trang công bố khoa học). Người dùng không thể nhấp vào tên tác giả của một bài báo để chuyển hướng đến trang thông tin giảng viên tương ứng, cũng như không thể xem nhanh danh sách các đề tài mà một giảng viên cụ thể đã thực hiện từ trước đến nay.
*   **Hạn chế về tìm kiếm và tương tác:** Người dùng chỉ có thể tra cứu thông tin bằng cách duyệt thủ công qua các danh sách hoặc sử dụng tính năng tìm kiếm từ khóa cơ bản của website. Hoàn toàn chưa có hệ thống trợ lý ảo hay chatbot nào hỗ trợ giải đáp trực tuyến các câu hỏi tự nhiên phức tạp liên quan đến chuyên môn và hướng nghiên cứu khoa học của giảng viên trong Khoa.

---

## 3.2. THỰC TRẠNG VÀ CÁC HỆ THỐNG LIÊN QUAN

### 3.2.1. Thực trạng các công cụ tra cứu học thuật và giới hạn thực tế
Nhằm tìm kiếm một giải pháp tối ưu cho việc quản lý và kết nối tri thức khoa học, quá trình nghiên cứu đã tiến hành khảo sát và đối chiếu các công cụ quản lý, tra cứu thông tin học thuật phổ biến hiện nay:

*   **Các cổng thông tin khoa học nội bộ tại các trường đại học:** Một số đơn vị giáo dục đã triển khai các phân hệ quản lý đề tài và lý lịch khoa học phục vụ cho việc chấm điểm nghiên cứu của giảng viên. Tuy nhiên, các hệ thống này hầu hết được xây dựng trên nền tảng cơ sở dữ liệu quan hệ truyền thống. Mô hình này gặp khó khăn lớn khi biểu diễn các mối quan hệ đan xen phức tạp (như mạng lưới hợp tác đồng tác giả đa cấp) và thường chỉ cung cấp các giao diện báo cáo dạng bảng biểu thô sơ, thiếu tính trực quan cho người dùng cuối.
*   **Các nền tảng học thuật quốc tế (Google Scholar, ResearchGate):** Các hệ thống này cung cấp hồ sơ khoa học cá nhân chuyên nghiệp và theo dõi các chỉ số trích dẫn trên quy mô toàn cầu. Mặc dù vậy, chúng không hỗ trợ quản trị các thông tin mang tính đặc thù nội bộ của Khoa (như phân công thuộc bộ môn nào, danh sách các đề tài nghiên cứu khoa học của sinh viên do giảng viên hướng dẫn, hoặc các đề tài cấp cơ sở đặc trưng của nhà trường). Ngoài ra, dữ liệu trên các trang này phụ thuộc hoàn toàn vào việc tự khai báo hoặc cơ chế tự động quét trên internet, dẫn đến tình trạng thiếu sót các bài báo viết bằng tiếng Việt hoặc xuất bản trên các tạp chí trong nước chưa được lập chỉ mục quốc tế.

Từ kết quả khảo sát các hệ thống trên, có thể rút ra một số nhận xét và đánh giá về những hạn chế chung:
*   **Sự cô lập của dữ liệu học thuật:** Thông tin về nhân sự, bài báo, đề tài và bộ môn bị phân rã trong các kho lưu trữ độc lập. Việc thiếu các liên kết ngữ nghĩa động làm cho người dùng khó nhận diện được bức tranh toàn cảnh về năng lực nghiên cứu của Khoa cũng như xu hướng hợp tác học thuật giữa các giảng viên.
*   **Trải nghiệm tìm kiếm nghèo nàn:** Cơ chế so khớp từ khóa cơ bản không thể xử lý các câu hỏi mang tính ngữ cảnh hoặc các câu hỏi tự nhiên dài của sinh viên khi muốn tìm kiếm giảng viên hướng dẫn tốt nghiệp theo hướng nghiên cứu chuyên sâu.
*   **Thiếu công cụ quản trị trực quan và tương tác thông minh:** Các hệ thống quản lý hiện tại chủ yếu phục vụ mục đích lưu trữ hành chính, chưa hỗ trợ một giao diện quản trị Web CMS cho phép thiết lập linh hoạt các mối quan hệ thực thể, đồng thời thiếu bản đồ trực quan tương tác và trợ lý ảo hỗ trợ giải đáp trực tiếp bằng ngôn ngữ tự nhiên.

### 3.2.2. Các hệ thống hỏi đáp tự động và giới hạn trong miền tri thức hẹp
Sự phát triển của các mô hình ngôn ngữ lớn như ChatGPT hay Google Gemini đã mang lại khả năng trả lời các câu hỏi tự nhiên một cách linh hoạt. Tuy nhiên, khi áp dụng trực tiếp vào việc tra cứu thông tin nghiên cứu khoa học đặc thù của Khoa Công nghệ thông tin, các hệ thống này gặp phải những giới hạn rất lớn:

*   **Hiện tượng ảo giác tri thức (Hallucination):** Do được huấn luyện trên dữ liệu tổng quát toàn cầu, các mô hình ngôn ngữ lớn không thể nắm bắt chính xác các thông tin nội bộ của Khoa. Khi nhận được các câu hỏi chi tiết về danh sách đề tài, chức danh, hay các công bố khoa học của một giảng viên cụ thể trong trường, các mô hình này thường tự động suy đoán và đưa ra câu trả lời sai lệch thực tế nhưng dưới văn phong rất thuyết phục.
*   **Thiếu cập nhật dữ liệu cục bộ:** Các báo cáo nghiên cứu khoa học nội bộ, danh sách đề tài sinh viên, hay lý lịch cập nhật của giảng viên là nguồn dữ liệu riêng tư, không được công bố công khai để các mô hình ngôn ngữ lớn quét và huấn luyện, dẫn đến câu trả lời bị lỗi thời hoặc không có thông tin.
*   **Không có khả năng kiểm chứng nguồn gốc dữ liệu:** Các mô hình ngôn ngữ lớn hoạt động theo cơ chế dự đoán từ tiếp theo dựa trên xác suất, không truy vết trực tiếp từ một cơ sở dữ liệu thực tế để chứng minh tính xác thực của câu trả lời, gây khó khăn cho người dùng khi cần thông tin chính xác phục vụ công tác nghiên cứu và quản lý.

Sự tồn tại của các hạn chế trên cho thấy nhu cầu cấp thiết về việc xây dựng một giải pháp tích hợp giữa Đồ thị tri thức (Knowledge Graph) – đóng vai trò là nguồn tri thức đáng tin cậy đã được kiểm chứng – và Trí tuệ nhân tạo (LLM) thông qua kỹ thuật GraphRAG để cung cấp câu trả lời chính xác, trực quan và không bị ảo giác cho người dùng.

---

## 3.3. PHƯƠNG PHÁP VÀ HƯỚNG GIẢI QUYẾV VẤN ĐỀ

Để giải quyết triệt để các hạn chế của thực trạng tra cứu thông tin và quản trị dữ liệu nghiên cứu hiện nay, đề tài đề xuất phương pháp kỹ thuật dựa trên các công nghệ tiên tiến mang tính nhất quán và tối ưu hóa cao:

*   **Sử dụng Đồ thị tri thức (Knowledge Graph) trong biểu diễn dữ liệu:** Dữ liệu nghiên cứu khoa học mang đặc tính liên kết tự nhiên phức tạp và đa chiều. Việc mô hình hóa cơ sở dữ liệu dưới dạng đồ thị gồm các thực thể học thuật đóng vai trò là các nút (như Giảng viên, Đề tài, Công trình nghiên cứu, Bộ môn, Lĩnh vực nghiên cứu) và các mối quan hệ đóng vai trò là các cạnh kết nối (như tác giả bài báo, chủ nhiệm đề tài, thuộc bộ môn, nghiên cứu lĩnh vực) giúp phản ánh cấu trúc thực tế một cách chính xác nhất. Phương pháp này giúp tránh được sự cô lập dữ liệu và tạo tiền đề vững chắc cho các truy vấn ngữ cảnh phức tạp.
*   **Sử dụng cơ sở dữ liệu đồ thị Neo4j trong quản trị truy vấn:** Neo4j được lựa chọn làm hệ quản trị cơ sở dữ liệu cốt lõi nhờ khả năng tối ưu hóa vượt trội cho việc duyệt các mối quan hệ đa tầng (multi-hop traversal) mà không cần sử dụng các phép liên kết bảng (JOIN) phức tạp và tốn kém tài nguyên như trong cơ sở dữ liệu quan hệ truyền thống. Ngôn ngữ truy vấn Cypher của Neo4j giúp đơn giản hóa mã nguồn thông qua cú pháp mô phỏng trực quan các nút và mối quan hệ, giúp việc xây dựng và bảo trì các câu lệnh truy vấn liên kết trở nên dễ hiểu và hiệu quả hơn.
*   **Ứng dụng Trí tuệ nhân tạo (LLM) kết hợp GraphRAG:** Hệ thống sử dụng mô hình ngôn ngữ lớn để phân tích ngữ nghĩa câu hỏi tự nhiên của người dùng và tổng hợp câu trả lời chính xác. Bằng cách tích hợp kỹ thuật GraphRAG, hệ thống sẽ thực hiện truy xuất dữ liệu từ cơ sở dữ liệu đồ thị Neo4j dựa trên các thực thể được nhận diện từ câu hỏi của người dùng, sau đó cung cấp ngữ cảnh chính xác này cho mô hình ngôn ngữ lớn để tổng hợp câu trả lời. Phương pháp này giúp loại bỏ hiện tượng ảo giác và đảm bảo câu trả lời luôn trung thực với cơ sở dữ liệu khoa học thực tế của Khoa.
*   **Phát triển ứng dụng trên nền tảng Python và Flask:** Python được lựa chọn làm ngôn ngữ lập trình chính nhờ hệ sinh thái thư viện phong phú, hỗ trợ mạnh mẽ cho việc tích hợp mô hình ngôn ngữ lớn, xử lý ngôn ngữ tự nhiên tiếng Việt (như phân từ, so khớp chuỗi mờ) và kết nối cơ sở dữ liệu đồ thị. Flask được lựa chọn làm khung công nghệ backend nhờ đặc tính gọn nhẹ, linh hoạt, dễ dàng mở rộng và tùy biến kiến trúc hệ thống để xây dựng các RESTful API phục vụ giao diện người dùng và hệ thống quản trị.

---

## 3.4. DỮ LIỆU VÀ PHƯƠNG PHÁP THU THẬP DỮ LIỆU

### 3.4.1. Các nguồn dữ liệu đầu vào của hệ thống
Quá trình xây dựng bản đồ tri thức đòi hỏi việc thu thập và chuẩn hóa dữ liệu học thuật từ nhiều nguồn khác nhau của đơn vị:

*   **Dữ liệu nhân sự học thuật:** Gồm thông tin về họ tên giảng viên, học hàm, học vị, thông tin liên hệ (email, số điện thoại), hướng nghiên cứu chuyên sâu và bộ môn trực thuộc. Nguồn dữ liệu này được thu thập thông qua các công cụ cào dữ liệu từ trang thông tin nhân sự công khai của Khoa Công nghệ thông tin.
*   **Dữ liệu công bố khoa học và bài báo:** Gồm các thông tin chi tiết về tên bài báo, danh sách tác giả, năm công bố, tạp chí hoặc hội thảo phát hành, và phân loại công trình (quốc tế ISI/Scopus, tạp chí trong nước, hội thảo chuyên ngành). Dữ liệu được trích xuất từ các trang lưu trữ công bố khoa học của Khoa và các báo cáo tổng kết khoa học công nghệ hàng năm.
*   **Dữ liệu đề tài và dự án nghiên cứu:** Gồm tên đề tài, mã số đề tài, cấp đề tài (cấp cơ sở, cấp tỉnh, cấp bộ, đề tài nghiên cứu khoa học của sinh viên), thời gian thực hiện (năm bắt đầu, năm kết thúc), vai trò (chủ nhiệm đề tài, thành viên tham gia) và liên kết nguồn. Nguồn dữ liệu này được trích xuất từ các tệp tin Excel tổng hợp do văn phòng Khoa lưu trữ và cung cấp.

### 3.4.2. Quy trình tiền xử lý và đồng bộ thực thể tri thức
Dữ liệu thô thu thập từ các tệp Excel văn phòng và các trang web thường tồn tại nhiều lỗi, định dạng không nhất quán và trùng lặp thông tin. Do đó, hệ thống thực hiện một quy trình xử lý dữ liệu nghiêm ngặt:

*   **Làm sạch dữ liệu thô:** Loại bỏ các ký tự đặc biệt thừa, đồng bộ hóa bảng mã tiếng Việt, xử lý các trường dữ liệu bị thiếu và định dạng lại các trường thời gian theo chuẩn thống nhất.
*   **Phân từ và nhận diện thực thể tác giả:** Danh sách tác giả trong dữ liệu bài báo thô thường được biểu diễn dưới dạng một chuỗi văn bản liên tục. Hệ thống ứng dụng thư viện phân từ tiếng Việt để nhận diện và tách biệt từng tác giả.
*   **Đồng bộ thực thể và khử trùng lặp (Entity Resolution):** Tên giảng viên thường xuất hiện dưới nhiều biến thể khác nhau trong danh sách bài báo (ví dụ: viết tắt tên đệm, viết không dấu, hoặc viết đảo thứ tự). Hệ thống sử dụng thuật toán so khớp chuỗi mờ kết hợp với email công tác và bộ môn để xác định chính xác các biến thể này có thuộc về một giảng viên duy nhất trong Khoa, đồng thời phân loại các tác giả còn lại vào nhóm cộng sự ngoài khoa.

### 3.4.3. Kiến trúc cơ sở dữ liệu và nạp dữ liệu đồ thị
Sau khi dữ liệu được làm sạch và chuẩn hóa, hệ thống tiến hành chuyển đổi và nạp vào cơ sở dữ liệu đồ thị Neo4j theo các nguyên tắc:

*   **Thiết lập ràng buộc toàn vẹn đồ thị:** Để đảm bảo tính nhất quán của mạng lưới tri thức, hệ thống khởi tạo các ràng buộc duy nhất trên các thuộc tính định danh chính như địa chỉ email đối với thực thể Giảng viên, mã số đối với thực thể Đề tài và định danh bài viết đối với thực thể Bài báo. Điều này giúp ngăn chặn việc tạo các nút trùng lặp khi nạp dữ liệu.
*   **Nạp dữ liệu hàng loạt bằng tập lệnh tự động (Bulk Import):** Với các tập dữ liệu có quy mô lớn tích lũy qua nhiều năm học, dữ liệu sau tiền xử lý được chuyển đổi sang định dạng CSV trung gian. Hệ thống sử dụng các kịch bản lập trình Python để thực thi các câu lệnh Cypher tối ưu, giúp nạp hàng loạt dữ liệu vào Neo4j một cách nhanh chóng, đồng thời tự động thiết lập các mối liên kết (như mối quan hệ tác giả bài báo, chủ nhiệm đề tài, thuộc bộ môn) dựa trên các liên kết khóa ngoại.
*   **Cập nhật giao dịch thời gian thực:** Đối với các thao tác quản trị hàng ngày trên giao diện Web CMS (như thêm mới một đề tài hoặc cập nhật học vị của giảng viên), hệ thống thực hiện các câu lệnh Cypher đơn lẻ dưới dạng các giao dịch trực tiếp để cập nhật ngay lập tức vào đồ thị, đảm bảo dữ liệu phục vụ hỏi đáp luôn được đồng bộ.

---

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

# 3.6. ĐẶC TẢ CHI TIẾT CÁC USE CASE HỆ THỐNG

Tài liệu dưới đây chứa thông tin đặc tả chi tiết của các Use Case trong hệ thống Bản đồ tri thức nghiên cứu khoa học và Trợ lý hỏi đáp tự động (GraphRAG Chatbot). Nội dung được định dạng dưới dạng văn bản thuần có cấu trúc rõ ràng, tương thích hoàn toàn với danh mục chức năng nghiệp vụ của hệ thống (Bảng 3.1, Bảng 3.2, Bảng 3.3).

---

### Bảng 3.5. Đặc tả chức năng Đăng nhập

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

### Bảng 3.6. Đặc tả chức năng Quên mật khẩu

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

### Bảng 3.7. Đặc tả chức năng Đăng xuất

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

### Bảng 3.8. Đặc tả chức năng Tra cứu (giảng viên/ công trình/ đề tài)

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

### Bảng 3.9. Đặc tả chức năng Xem chi tiết (giảng viên/ công trình/ đề tài)

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

### Bảng 3.10. Đặc tả chức năng Hỏi đáp qua Chatbot GraphRAG

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

### Bảng 3.11. Đặc tả chức năng Xem bản đồ tri thức tương tác

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

### Bảng 3.12. Đặc tả chức năng Xem thống kê hệ thống

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

### Bảng 3.13. Đặc tả chức năng Xem mạng lưới hợp tác

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

### Bảng 3.14. Đặc tả chức năng Quản lý tài khoản lý lịch cá nhân (Giảng viên)

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

### Bảng 3.15a. Đặc tả chức năng Xem danh sách công trình cá nhân (Giảng viên)

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

### Bảng 3.15b. Đặc tả chức năng Thêm mới công trình cá nhân (Giảng viên)

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

### Bảng 3.15c. Đặc tả chức năng Chỉnh sửa công trình cá nhân (Giảng viên)

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

### Bảng 3.15d. Đặc tả chức năng Xóa công trình cá nhân (Giảng viên)

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

### Bảng 3.16. Đặc tả chức năng Quản lý đề tài cá nhân (Giảng viên)

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

### Bảng 3.17. Đặc tả chức năng Xem dòng thời gian (Giảng viên)

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

### Bảng 3.18. Đặc tả chức năng Xem danh sách giảng viên (Quản trị viên)

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

### Bảng 3.19. Đặc tả chức năng Xem chi tiết giảng viên (Quản trị viên)

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

### Bảng 3.20. Đặc tả chức năng Thêm mới giảng viên (Quản trị viên)

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

### Bảng 3.21. Đặc tả chức năng Sửa thông tin giảng viên (Quản trị viên)

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

### Bảng 3.22. Đặc tả chức năng Xóa giảng viên (Quản trị viên)

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

### Bảng 3.23. Đặc tả chức năng Phê duyệt yêu cầu thay đổi lý lịch (Quản trị viên)

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

### Bảng 3.24. Đặc tả chức năng quản lý công trình (admin)

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

### Bảng 3.25. Đặc tả chức năng quản lý đề tài (admin)

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

### Bảng 3.26. Đặc tả chức năng quản lý tác giả ngoài (admin)

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

### Bảng 3.27. Đặc tả chức năng quản lý thùng rác (admin)

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

