# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT

## 2.1. TỔNG QUAN VỀ BẢN ĐỒ TRI THỨC VÀ ĐỒ THỊ TRI THỨC

### 2.1.1. Khái niệm và quá trình phát triển
Trong lĩnh vực quản lý tri thức và khoa học dữ liệu, Bản đồ tri thức (Knowledge Map) và Đồ thị tri thức (Knowledge Graph) là hai khái niệm quan trọng được sử dụng để tổ chức, biểu diễn và khai thác tri thức.

**Knowledge Map** là công cụ trực quan hóa tri thức, giúp xác định vị trí của các nguồn tri thức, mối liên hệ giữa các chủ đề, tài liệu hoặc chuyên gia trong một tổ chức. Mục tiêu chính của Knowledge Map là hỗ trợ người dùng tìm kiếm, định hướng và tiếp cận tri thức một cách hiệu quả.

Trong khi đó, **Knowledge Graph** là mô hình biểu diễn tri thức dưới dạng đồ thị, trong đó các thực thể được biểu diễn bằng các nút (Node) và các mối quan hệ được biểu diễn bằng các cạnh (Relationship). Không chỉ thể hiện sự liên kết giữa các đối tượng, Knowledge Graph còn bổ sung ngữ nghĩa cho các mối quan hệ, cho phép hệ thống hiểu được ngữ cảnh của dữ liệu và hỗ trợ suy luận tri thức.

Mặc dù đều hướng đến mục tiêu quản lý và khai thác tri thức, Knowledge Map và Knowledge Graph có sự khác biệt về bản chất. Knowledge Map tập trung vào việc trực quan hóa và điều hướng tri thức phục vụ con người, trong khi Knowledge Graph tập trung vào việc mô hình hóa và xử lý tri thức dưới dạng dữ liệu có cấu trúc phục vụ cả con người lẫn máy tính.

Để thiết lập ranh giới lý thuyết rõ ràng phục vụ cho việc nghiên cứu và triển khai hệ thống, bảng dưới đây phân tích các tiêu chí khác biệt cốt lõi giữa hai mô hình biểu diễn này:

| Tiêu chí so sánh | Bản đồ tri thức (Knowledge Map) | Đồ thị tri thức (Knowledge Graph) |
| :--- | :--- | :--- |
| **1. Bản chất mô hình** | Công cụ quản lý trực quan thiên về giao diện và điều hướng nguồn lực. | Mô hình dữ liệu ngữ nghĩa thiên về cấu trúc toán học và logic máy tính. |
| **2. Đối tượng hướng đến** | Tập trung vào con người giúp nhà quản lý định vị nhanh thông tin. | Tập trung vào hệ thống làm nền tảng cho các thuật toán và trí tuệ nhân tạo. |
| **3. Cấu trúc biểu diễn** | Sơ đồ tư duy hoặc mạng lưới thực thể khái quát ở mức vĩ mô. | Đồ thị có hướng chặt chẽ dựa trên các bộ ba thuộc tính ở mức vi mô. |
| **4. Khả năng suy luận** | Phụ thuộc hoàn toàn vào tư duy liên tưởng trực quan của con người. | Hệ thống tự động suy luận ra các liên kết mới dựa trên luật ngữ nghĩa. |

Nền tảng của Knowledge Graph bắt nguồn từ các nghiên cứu về mạng ngữ nghĩa (Semantic Network) và biểu diễn tri thức trong lĩnh vực trí tuệ nhân tạo từ những năm 1960. Tuy nhiên, thuật ngữ Knowledge Graph chỉ thực sự trở nên phổ biến vào năm 2012 khi Google công bố Google Knowledge Graph. Sự kiện này đánh dấu bước chuyển từ tìm kiếm dựa trên từ khóa sang tìm kiếm dựa trên thực thể và mối quan hệ giữa các thực thể. Ngày nay, Knowledge Graph được ứng dụng rộng rãi trong các hệ thống tìm kiếm ngữ nghĩa, hệ thống gợi ý, quản lý tri thức và trí tuệ nhân tạo.

### 2.1.2. Các đặc trưng cơ bản của mô hình tri thức
Mô hình tri thức được xây dựng trên ba đặc trưng cốt lõi:
- **Tính thực thể (Entity-centric):** Mỗi một đối tượng trong hệ thống đều được biểu diễn dưới dạng một thực thể độc lập và duy nhất, không có cái nào giống với cái nào. Trong các bài toán khoa học, mỗi thực thể như vậy đều có các thuộc tính riêng biệt, nhằm phục vụ cho việc nhận diện và tránh trùng lặp dữ liệu.
- **Tính ngữ nghĩa (Semantic):** Các mối quan hệ giữa các thực thể không chỉ là sự liên kết vô tri mà chúng còn mang theo những ý nghĩa cụ thể. Nhờ có điều này mà hệ thống hiểu được ngữ cảnh và ý nghĩa của dữ liệu.
- **Tính mạng lưới (Network structure):** Dữ liệu được tổ chức theo cấu trúc đồ thị, cho phép truy vấn linh hoạt và khai thác dữ liệu trong toàn bộ mạng lưới. Đặc điểm này giúp người dùng dễ dàng khám phá các mối liên hệ gián tiếp và xuyên suốt trong hệ thống.

### 2.1.3. Ứng dụng của bản đồ tri thức và đồ thị tri thức
Nhờ khả năng tổ chức và khai thác dữ liệu hiệu quả, bản đồ tri thức và đồ thị tri thức được ứng dụng rộng rãi trong nhiều lĩnh vực.

#### a. Ứng dụng phổ biến trong công nghiệp
- **Công cụ tìm kiếm:** Các hệ thống như Google Knowledge Graph hay Wikidata giúp máy tính hiểu ngữ nghĩa để trả về thông tin tóm tắt chính xác cho người dùng.
- **Hệ thống gợi ý:** Được sử dụng tại Amazon, Netflix để phân tích hành vi người dùng và đưa ra các gợi ý sản phẩm, nội dung cá nhân hóa.
- **Tài chính & Y tế:** Hỗ trợ phát hiện gian lận ngân hàng thông qua truy vết luồng tiền và kết nối dữ liệu triệu chứng - bệnh lý trong chẩn đoán y khoa.

#### b. Ứng dụng đặc thù trong quản lý khoa học
Đối với môi trường học thuật, bản đồ tri thức giúp tối ưu hóa việc quản trị tài nguyên trí tuệ:
- **Phát hiện nhóm nghiên cứu (Research Clusters):** Tự động nhận diện các cộng đồng hợp tác dựa trên tần suất làm việc chung giữa các cá nhân.
- **Theo dõi dòng chảy tri thức:** Minh bạch hóa lộ trình từ các đề tài cơ sở đến các công bố quốc tế, giúp đánh giá tính kế thừa của nghiên cứu.
- **Xác định chuyên gia:** Tìm kiếm nhân sự nòng cốt trong từng lĩnh vực hẹp dựa trên mạng lưới kết nối của họ với các công trình uy tín.

---

## 2.2. CƠ SỞ DỮ LIỆU ĐỒ THỊ

### 2.2.1. Tổng quan về cơ sở dữ liệu đồ thị (Graph Database)

#### a. Khái niệm và bản chất của cơ sở dữ liệu đồ thị
Cơ sở dữ liệu đồ thị (Graph Database) là hệ thống được thiết kế để lưu trữ và truy vấn các dữ liệu phức tạp, được liên kết với nhau. Nó được biểu diễn dưới dạng thực thể bằng các nút (nodes) và mối quan hệ giữa chúng bằng các cạnh (edges).

Khác biệt lớn nhất của cơ sở dữ liệu đồ thị khi so với cơ sở dữ liệu truyền thống, đó là không dùng phép JOIN để liên kết. Thay vào đó cơ sở dữ liệu đồ thị xem mối quan hệ là thành phần cốt lõi của mô hình lưu trữ. Nhờ vậy, hệ thống có thể truy xuất và phân tích các liên kết dữ liệu một cách hiệu quả thông qua các ngôn ngữ truy vấn như Cypher, Gremlin hoặc PGQL.

Cơ chế của cơ sở dữ liệu đồ thị đó là duyệt đồ thị (graph traversal), cũng như cho phép khám phá các mối quan hệ trực tiếp và gián tiếp trên dữ liệu. Theo đó, mô hình này còn hỗ trợ lược đồ linh hoạt (flexible schema), giúp hệ thống dễ dàng mở rộng và thích nghi khi cấu trúc dữ liệu thay đổi.

#### b. Cách hoạt động của cơ sở dữ liệu đồ thị
Cơ sở dữ liệu đồ thị hoạt động dựa trên việc lưu trữ dữ liệu dưới dạng mạng lưới gồm các nút (nodes) và các mối quan hệ (relationships) giữa chúng. Trong đó, các nút đại diện cho thực thể như người dùng, sản phẩm hoặc giao dịch, còn các cạnh thể hiện mối liên kết giữa các thực thể trong hệ thống.

Khi thực hiện truy vấn, hệ thống sử dụng cơ chế duyệt đồ thị (graph traversal) để di chuyển từ nút này sang nút khác thông qua các mối quan hệ đã được xác định sẵn. Nhờ cơ chế này, cơ sở dữ liệu đồ thị có khả năng truy xuất nhanh chóng các dữ liệu liên kết nhiều tầng mà không cần thực hiện các phép JOIN phức tạp như trong cơ sở dữ liệu quan hệ truyền thống.

Bên cạnh việc truy vấn dữ liệu, cơ sở dữ liệu đồ thị còn hỗ trợ nhiều thuật toán phân tích đồ thị nhằm khai thác cấu trúc và mối quan hệ trong dữ liệu. Một số thuật toán phổ biến bao gồm:
- **Shortest Path:** Tìm đường đi ngắn nhất giữa hai nút trong đồ thị.
- **Degree Centrality:** Xác định các nút có số lượng liên kết lớn và mức độ ảnh hưởng cao trong mạng lưới.
- **Bridge Connector:** Xác định các giảng viên đóng vai trò cầu nối liên kết giữa các bộ môn khác nhau thông qua các công trình hợp tác.

Nhờ khả năng xử lý hiệu quả các dữ liệu có tính liên kết cao, cơ sở dữ liệu đồ thị được ứng dụng rộng rãi trong các hệ thống mạng xã hội, hệ thống gợi ý, phát hiện gian lận và phân tích dữ liệu quan hệ phức tạp.

#### c. Ưu điểm của cơ sở dữ liệu đồ thị
Bằng việc xem các mối quan hệ là thành phần cốt lõi của mô hình lưu trữ, cơ sở dữ liệu đồ thị mang lại nhiều ưu điểm nổi bật so với cơ sở dữ liệu quan hệ truyền thống:
- **Phân tích cấu trúc mạng lưới hiệu quả:** Hệ thống có thể nhanh chóng xác định các nút có mức độ ảnh hưởng lớn, phát hiện các cộng đồng dữ liệu và nhận diện các điểm lỗi trọng yếu trong mạng lưới.
- **Tốc độ truy vấn cao:** Các mối quan hệ được lưu trữ trực tiếp giúp việc truy vấn dữ liệu liên kết diễn ra nhanh hơn đáng kể, đặc biệt đối với các bài toán có nhiều kết nối phức tạp vốn yêu cầu nhiều phép JOIN trong RDBMS truyền thống.
- **Khả năng ứng dụng đa dạng:** Cơ sở dữ liệu đồ thị phù hợp với nhiều lĩnh vực như phát hiện gian lận tài chính, hệ thống gợi ý, quản lý phụ thuộc dữ liệu, mạng xã hội, web ngữ nghĩa và kiến trúc Graph RAG trong các hệ thống trí tuệ nhân tạo hiện đại.
- **Lược đồ linh hoạt:** Mô hình dữ liệu có thể dễ dàng mở rộng hoặc thay đổi khi xuất hiện các kiểu quan hệ mới mà không làm gián đoạn hệ thống đang vận hành.

### 2.2.2. So sánh CSDL đồ thị với CSDL quan hệ (RDBMS)
Sự khác biệt cốt lõi về mặt kiến trúc lưu trữ, tư duy thiết kế và hiệu năng vận hành giữa hai mô hình dữ liệu này được thể hiện chi tiết qua bảng đối sánh dưới đây:

| Khía cạnh | Cơ sở dữ liệu quan hệ (RDBMS) | Cơ sở dữ liệu đồ thị (Graph Database) |
| :--- | :--- | :--- |
| **Mô hình dữ liệu** | Lưu trữ dưới dạng bảng cố định; lược đồ nghiêm ngặt, việc thay đổi cấu trúc yêu cầu định nghĩa lại từ đầu. | Lưu trữ dưới dạng nút và cạnh; lược đồ linh hoạt, các thực thể cùng nhóm có thể có thuộc tính khác nhau. |
| **Biểu diễn mối quan hệ** | Thể hiện gián tiếp thông qua ràng buộc khóa ngoại hoặc các bảng trung gian kết hợp. | Mối quan hệ là thành phần cốt lõi, được lưu trữ vật lý trực tiếp dưới dạng các cạnh nối giữa các nút. |
| **Hiệu năng truy vấn** | Giảm theo cấp số nhân khi độ sâu liên kết tăng do phải thực thi chuỗi các phép toán JOIN chồng chéo. | Tốc độ phản hồi tức thời nhờ cơ chế duyệt đồ thị trực tiếp và không bị phụ thuộc vào tổng quy mô dữ liệu. |
| **Khả năng mở rộng** | Ưu tiên mở rộng theo chiều dọc; rất khó khăn và rủi ro khi bài toán phát sinh thêm thực thể hoặc quan hệ mới. | Hỗ trợ mở rộng theo chiều ngang; cho phép bổ sung trực tiếp các thành phần mới vào mạng lưới bất cứ lúc nào. |
| **Ngôn ngữ truy vấn** | Sử dụng SQL, tối ưu cho các phép toán tập hợp, tính toán số liệu và thống kê trên các bảng dữ liệu. | Sử dụng Cypher, Gremlin..., tối ưu cho việc mô tả các mẫu đường đi và chuỗi liên kết mạng lưới. |
| **Trường hợp tối ưu** | Phù hợp hệ thống có cấu trúc dữ liệu ít biến động và yêu cầu tính toàn vẹn nghiêm ngặt (kế toán, ngân hàng). | Phù hợp hệ thống có dữ liệu liên kết chằng chịt và linh hoạt (mạng xã hội, quản lý khoa học, Graph RAG). |

---

## 2.3. NGÔN NGỮ TRUY VẤN ĐỒ THỊ CYPHER

### 2.3.1. Khái niệm và bản chất của ngôn ngữ Cypher
Cypher là ngôn ngữ truy vấn đồ thị mã nguồn mở ban đầu được thiết kế và phát triển bởi Neo4j vào năm 2011 (dưới sự dẫn dắt của Andres Taylor), được thiết kế chuyên biệt để tương tác với mô hình đồ thị thuộc tính (Property Graph Model). Đến tháng 10 năm 2015, Neo4j quyết định mở mã nguồn của ngôn ngữ này thông qua dự án openCypher, tạo điều kiện cho các nhà cung cấp cơ sở dữ liệu đồ thị khác có thể tự do tích hợp và sử dụng. Cho đến nay, Cypher đã trở thành ngôn ngữ truy vấn đồ thị phổ biến nhất và là nguồn cảm hứng chính cho tiêu chuẩn quốc tế ISO GQL (Graph Query Language) được công bố vào năm 2024.

Cypher tuân theo triết lý của ngôn ngữ khai báo (declarative language), tương tự như SQL. Lập trình viên chỉ cần mô tả cấu trúc mẫu dữ liệu cần tìm kiếm hoặc thay đổi (Pattern Matching) thay vị viết mã điều khiển cách thức duyệt đồ thị. Bộ tối ưu hóa truy vấn của hệ thống sẽ tự động xác định đường đi tối ưu nhất để truy xuất dữ liệu.

Điểm độc đáo nhất của Cypher là cú pháp trực quan mô phỏng nghệ thuật ASCII (ASCII-art syntax). Các nút được bọc trong dấu ngoặc đơn `()` tương tự hình tròn của nút đồ thị, các mối quan hệ được biểu diễn bằng các ký hiệu mũi tên `-->` hoặc `<--`, và các thông tin chi tiết về kiểu quan hệ được đặt trong dấu ngoặc vuông `[]`. Cú pháp này giúp các câu truy vấn Cypher cực kỳ dễ đọc, dễ viết và tự tài liệu hóa (self-documenting).

### 2.3.2. Các mệnh đề truy vấn cơ bản trong Cypher
Cypher cung cấp nhiều mệnh đề hỗ trợ thao tác dữ liệu theo mô hình CRUD (Create, Read, Update, Delete) cũng như xử lý và điều hướng kết quả truy vấn. Dưới đây là các mệnh đề cơ bản kèm theo ví dụ thực tế được áp dụng trong dự án quản lý nghiên cứu khoa học Khoa Công nghệ thông tin - Trường Đại học Nha Trang:

- **Mệnh đề MATCH:** Được sử dụng để tìm kiếm dữ liệu trong đồ thị thông qua cơ chế khớp mẫu (Pattern Matching). Đây là mệnh đề quan hàng đầu trong Cypher, giúp định vị các nút và mối quan hệ cần truy xuất.
  *Ví dụ:* Truy vấn thông tin của giảng viên và bộ môn trực thuộc:
  ```cypher
  MATCH (gv:GiangVien)-[:THUOC_BO_MON]->(bm:BoMon)
  WHERE coalesce(gv.is_deleted, false) = false
  RETURN gv.ho_va_ten AS ten_giang_vien, bm.ten_bo_mon AS ten_bo_mon
  ```
  *Ý nghĩa:* Tìm kiếm thực thể Giảng viên có liên kết trực thuộc bộ môn (`THUOC_BO_MON`) với thực thể Bộ môn, trả về họ tên giảng viên cùng tên bộ môn.

- **Mệnh đề CREATE:** Dùng để tạo mới các nút hoặc mối quan hệ trong cơ sở dữ liệu đồ thị.
  *Ví dụ:* Tạo mới một thực thể công trình nghiên cứu khoa học:
  ```cypher
  CREATE (ct:CongTrinhNghienCuu {
      id: 'ct_new_99',
      ten_cong_trinh: 'ỨNG DỤNG MẠNG NƠ-RON TRONG HỆ THỐNG IOT GIÁM SÁT HÀNH VI TÉ NGÃ',
      nam_xuat_ban: 2024,
      noi_xuat_ban: 'Hội thảo Quốc gia FAIR',
      trang_thai: 'Chờ duyệt',
      is_deleted: false
  })
  ```
  *Ý nghĩa:* Tạo mới nút `CongTrinhNghienCuu` có mã định danh `ct_new_99` với các thuộc tính như tên công trình, năm xuất bản, nơi xuất bản và trạng thái ban đầu là "Chờ duyệt".

- **Mệnh đề MERGE:** Hỗ trợ kiểm tra sự tồn tại của dữ liệu trước khi tạo mới. Nếu mẫu dữ liệu đã tồn tại, `MERGE` sẽ truy xuất nó; nếu chưa có, `MERGE` sẽ tạo mới. Mệnh đề này rất hữu ích để hạn chế trùng lặp thực thể và mối quan hệ.
  *Ví dụ:* Thiết lập mối quan hệ tác giả của giảng viên với công trình nghiên cứu:
  ```cypher
  MATCH (gv:GiangVien {id: 'gv_5'}), (ct:CongTrinhNghienCuu {id: 'ct_new_99'})
  MERGE (gv)-[:LA_TAC_GIA_CUA]->(ct)
  ```
  *Ý nghĩa:* Đảm bảo chỉ tồn tại duy nhất một mối quan hệ tác giả `LA_TAC_GIA_CUA` giữa giảng viên và công trình nghiên cứu cụ thể, tránh tạo trùng lặp quan hệ khi chạy lại câu lệnh.

- **Mệnh đề SET:** Được dùng để cập nhật, bổ sung các thuộc tính hoặc thay đổi nhãn của nút/mối quan hệ.
  *Ví dụ:* Phê duyệt trạng thái của công trình nghiên cứu:
  ```cypher
  MATCH (ct:CongTrinhNghienCuu {id: 'ct_new_99'})
  SET ct.trang_thai = 'Đã phê duyệt'
  ```
  *Ý nghĩa:* Sử dụng `SET` để cập nhật thuộc tính `trang_thai` thành "Đã phê duyệt" cho nút công trình nghiên cứu.

- **Mệnh đề REMOVE:** Cho phép xóa bỏ các thuộc tính của nút/mối quan hệ hoặc xóa bỏ nhãn (Label) của nút mà không xóa thực thể.
  *Ví dụ:* Xóa thuộc tính số điện thoại tạm thời của giảng viên:
  ```cypher
  MATCH (gv:GiangVien {id: 'gv_20'})
  REMOVE gv.dien_thoai_tam
  ```
  *Ý nghĩa:* Loại bỏ hoàn toàn thuộc tính tạm thời `dien_thoai_tam` khỏi nút giảng viên `gv_20` mà không ảnh hưởng tới các thuộc tính chính của giảng viên.

- **Mệnh đề DELETE và DETACH DELETE:**
  * `DELETE` được sử dụng để xóa các nút hoặc các mối quan hệ.
  * `DETACH DELETE` cho phép tự động xóa toàn bộ các mối quan hệ liên quan của nút trước khi tiến hành xóa nút đó khỏi hệ thống.
  *Ví dụ 1 (DELETE):* Xóa mối quan hệ tác giả cũ của một công trình:
  ```cypher
  MATCH (gv:GiangVien {id: 'gv_5'})-[r:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu {id: 'ct_new_99'})
  DELETE r
  ```
  *Ví dụ 2 (DETACH DELETE):* Xóa hoàn toàn một giảng viên khỏi cơ sở dữ liệu:
  ```cypher
  MATCH (gv:GiangVien {id: 'gv_999'})
  DETACH DELETE gv
  ```
  *Ý nghĩa:* Truy vấn đầu tiên chỉ xóa cạnh quan hệ `LA_TAC_GIA_CUA` kết nối giữa giảng viên và công trình. Truy vấn thứ hai sử dụng `DETACH DELETE` để cắt đứt tất cả các mối quan hệ của giảng viên `gv_999` trước khi xóa nút giảng viên này khỏi đồ thị.

- **Mệnh đề WHERE:** Dùng để áp đặt các điều kiện lọc dữ liệu (áp dụng cho các thuộc tính, loại quan hệ hoặc cấu trúc đồ thị).
  *Ví dụ:* Lọc danh sách giảng viên thuộc Bộ môn Công nghệ phần mềm có học vị Tiến sĩ:
  ```cypher
  MATCH (gv:GiangVien)-[:THUOC_BO_MON]->(bm:BoMon)
  WHERE bm.id = 'bm_0' AND gv.hoc_vi = 'Tiến sĩ'
  RETURN gv.ho_va_ten AS ho_va_ten, gv.hoc_vi AS hoc_vi
  ```
  *Ý nghĩa:* Lọc các kết quả khớp mẫu sao cho chỉ lấy những giảng viên có thuộc tính học vị là "Tiến sĩ" và thuộc bộ môn có mã định danh `bm_0` (Bộ môn Công nghệ phần mềm).

- **Mệnh đề RETURN:** Xác định các dữ liệu hoặc cấu trúc cần trả về sau truy vấn (có thể trả về nút, quan hệ, thuộc tính hoặc giá trị tính toán dưới dạng bí danh `AS`).
  *Ví dụ:* Trả về thông tin đề tài thực hiện năm 2024:
  ```cypher
  MATCH (dt:DeTaiNghienCuu)
  WHERE dt.nam_thuc_hien = 2024
  RETURN dt.id AS ma_de_tai, dt.ten_de_tai AS ten_de_tai
  ```
  *Ý nghĩa:* Chỉ định trả về hai cột dữ liệu gồm mã đề tài và tên đề tài với các bí danh dễ đọc cho người dùng.

- **Mệnh đề ORDER BY, SKIP và LIMIT:** Hỗ trợ sắp xếp kết quả, phân trang và giới hạn số lượng dòng dữ liệu trả về.
  *Ví dụ:* Lấy danh sách 3 công trình nghiên cứu mới nhất xuất bản năm 2025:
  ```cypher
  MATCH (ct:CongTrinhNghienCuu)
  WHERE ct.nam_xuat_ban = 2025
  RETURN ct.ten_cong_trinh AS ten_cong_trinh, ct.nam_xuat_ban AS nam_xb
  ORDER BY ct.nam_xuat_ban DESC, ct.ten_cong_trinh ASC
  SKIP 0
  LIMIT 3
  ```
  *Ý nghĩa:* Sắp xếp các công trình nghiên cứu năm 2025 theo thứ tự giảm dần của năm và tăng dần theo bảng chữ cái của tên, bỏ qua 0 dòng đầu tiên và chỉ lấy 3 kết quả hàng đầu.

- **Mệnh đề WITH:** Cho phép truyền kết quả trung gian từ bước truy vấn này sang bước truy vấn tiếp theo, hoạt động như một cầu nối lọc dữ liệu hoặc thực hiện tính toán gom nhóm trước khi chạy các mệnh đề sau.
  *Ví dụ:* Tìm các giảng viên có từ 3 công trình nghiên cứu trở lên:
  ```cypher
  MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA]->(ct:CongTrinhNghienCuu)
  WHERE coalesce(gv.is_deleted, false) = false AND coalesce(ct.is_deleted, false) = false
  WITH gv, count(ct) AS so_luong_bai_bao
  WHERE so_luong_bai_bao >= 3
  RETURN gv.ho_va_ten AS ten_giang_vien, so_luong_bai_bao
  ```
  *Ý nghĩa:* Gom nhóm theo giảng viên (`gv`) để tính số lượng công trình nghiên cứu qua hàm `count(ct)`. Nhờ mệnh đề `WITH`, kết quả đếm này được truyền tiếp sang bước sau để lọc ra những người có `so_luong_bai_bao >= 3` trước khi trả về kết quả cuối cùng.

- **Mệnh đề UNWIND:** Hỗ trợ chuyển đổi một danh sách dữ liệu thành các dòng dữ liệu riêng biệt để tiếp tục xử lý.
  *Ví dụ:* Tìm các giảng viên có hướng nghiên cứu tương thích với danh sách các từ khóa cho trước:
  ```cypher
  UNWIND ['Lập trình Web', 'Trí tuệ nhân tạo', 'Học sâu'] AS huong_nc
  MATCH (gv:GiangVien)
  WHERE gv.chuyen_nganh CONTAINS huong_nc OR gv.huong_nghien_cuu CONTAINS huong_nc
  RETURN huong_nc AS huong_nghien_cuu, gv.ho_va_ten AS ten_giang_vien
  ```
  *Ý nghĩa:* Tách mảng gồm 3 hướng nghiên cứu thành 3 dòng độc lập, sau đó thực hiện tìm kiếm giảng viên tương ứng với từng dòng đó.

### 2.3.3. Các hàm tổng hợp và xử lý dữ liệu
Cypher cung cấp nhiều hàm tổng hợp để phục vụ các bài toán thống kê, phân tích dữ liệu trực tiếp trên đồ thị tri thức:

- **Hàm COUNT:** Đếm số lượng thực thể, mối quan hệ hoặc đường đi khớp với mẫu tìm kiếm.
  *Ví dụ:* Thống kê tổng số lượng giảng viên, công trình và đề tài trong hệ thống:
  ```cypher
  MATCH (gv:GiangVien) WHERE coalesce(gv.is_deleted, false) = false
  MATCH (ct:CongTrinhNghienCuu) WHERE coalesce(ct.is_deleted, false) = false
  MATCH (dt:DeTaiNghienCuu) WHERE coalesce(dt.is_deleted, false) = false
  RETURN count(DISTINCT gv) AS tong_giang_vien, 
         count(DISTINCT ct) AS tong_cong_trinh, 
         count(DISTINCT dt) AS tong_de_tai
  ```

- **Hàm COLLECT:** Gom các giá trị hoặc các nút từ nhiều dòng kết quả khác nhau thành một danh sách duy nhất. Hàm này cực kỳ hiệu quả để biểu diễn quan hệ một-nhiều hoặc nhiều-nhiều trong đồ thị mà không cần tạo nhiều dòng lặp lại.
  *Ví dụ:* Lấy danh sách các lĩnh vực nghiên cứu của từng giảng viên:
  ```cypher
  MATCH (gv:GiangVien)-[:NGHIEN_CUU]->(lv:LinhVucNghienCuu)
  WHERE coalesce(gv.is_deleted, false) = false
  RETURN gv.ho_va_ten AS giang_vien, collect(lv.ten_linh_vuc) AS danh_sach_linh_vuc
  ```
  *Ý nghĩa:* Gom toàn bộ các tên lĩnh vực của cùng một giảng viên thành một danh sách, trả về một dòng duy nhất cho mỗi giảng viên thay vì trả về nhiều dòng tương ứng với số lĩnh vực của họ.

- **Các hàm thống kê SUM, AVG, MIN và MAX:** Thực hiện các phép toán số học trên thuộc tính dữ liệu:
  * `SUM`: Tính tổng giá trị.
  * `AVG`: Tính giá trị trung bình.
  * `MIN`: Tìm giá trị nhỏ nhất.
  * `MAX`: Tìm giá trị lớn nhất.
  *Ví dụ:* Thống kê số lượng cộng sự (tác giả chung) lớn nhất, nhỏ nhất và trung bình của các công trình nghiên cứu có từ 2 tác giả trở lên:
  ```cypher
  MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct:CongTrinhNghienCuu)
  WHERE coalesce(gv.is_deleted, false) = false AND coalesce(ct.is_deleted, false) = false
  WITH ct, count(gv) AS so_tac_gia
  WHERE so_tac_gia >= 2
  RETURN max(so_tac_gia) AS so_tac_gia_nhieu_nhat,
         min(so_tac_gia) AS so_tac_gia_it_nhat,
         avg(so_tac_gia) AS so_tac_gia_trung_binh
  ```

### 2.3.4. Truy vấn đường đi trong Cypher
Một trong những ưu thế vượt trội của Cypher so với SQL truyền thống là khả năng truy vấn đường đi có độ dài biến đổi (Variable-length Paths). Thay vì phải thực hiện nhiều phép JOIN lồng nhau gây suy giảm hiệu năng nghiêm trọng, Cypher hỗ trợ cú pháp khai báo số bước liên kết linh hoạt.

Cú pháp truy vấn đường đi có độ dài biến đổi trong Cypher được biểu diễn dưới dạng `-[r:RELATION_TYPE*min..max]->` hoặc `-[r:RELATION_TYPE*length]->`.

Trong dự án quản lý hoạt động nghiên cứu khoa học, tính năng này được ứng dụng cụ thể trong các bài toán sau:

1. **Phân tích mạng lưới cộng tác gián tiếp giữa các giảng viên:**
   Để tìm các giảng viên có liên kết hợp tác gián tiếp trong phạm vi 2 bước (nghĩa là gv1 hợp tác với gv_trung_gian qua một công trình, và gv_trung_gian lại hợp tác với gv2 qua một công trình khác, tương ứng độ dài đường đi qua các quan hệ là 4 cạnh):
   ```cypher
   MATCH path = (gv1:GiangVien)-[:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU*4]-(gv2:GiangVien)
   WHERE gv1.id = $gv_id AND gv1 <> gv2
     AND all(n IN nodes(path) WHERE not n:CongTrinhNghienCuu OR coalesce(n.is_deleted, false) = false)
   RETURN path
   LIMIT 5
   ```
   *Ý nghĩa:* Mẫu truy vấn trên tìm các đường đi có độ dài quan hệ là 4 (mỗi bước đi từ Giảng viên -> Công trình -> Giảng viên -> Công trình -> Giảng viên tương ứng với 4 cạnh đồ thị). Điều này giúp phát hiện chuỗi cộng tác gián tiếp để gợi ý cộng sự tiềm năng.

2. **Truy vết chuỗi liên kết học thuật kết nối giữa các thực thể:**
   Tìm kiếm đường đi kết nối ngắn nhất giữa hai giảng viên bất kỳ để phân tích mức độ liên kết trong mạng lưới nghiên cứu:
   ```cypher
   MATCH path = shortestPath((gv1:GiangVien {id: $gv_id1})-[:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU|CHU_NHIEM|THAM_GIA*1..6]-(gv2:GiangVien {id: $gv_id2}))
   RETURN path
   ```
   *Ý nghĩa:* Hàm `shortestPath` kết hợp với mối quan hệ có độ dài biến đổi từ 1 đến 6 bước (`*1..6`) giúp tìm ra con đường ngắn nhất kết nối hai giảng viên thông qua các công trình hoặc đề tài chung, từ đó trực quan hóa đường đi kết nối xã hội/học thuật giữa họ.

---

## 2.4. HỆ QUẢN TRỊ CƠ SỞ DỮ LIỆU NEO4J

### 2.4.1. Tổng quan về hệ quản trị cơ sở dữ liệu Neo4j
Neo4j là một hệ quản trị cơ sở dữ liệu NoSQL mã nguồn mở, được thiết kế theo mô hình dữ liệu nguyên bản (graph-native database). Do đó, nó sẽ lưu trữ các dữ liệu dưới hình thức các nút (nodes), mối quan hệ (relationships) và thuộc tính (properties) thay cho cách sử dụng các bảng như trong cơ sở dữ liệu quan hệ truyền thống.

Được xây dựng bằng Java và Scala, Neo4j đồng thời hỗ trợ đầy đủ các tính chất ACID. Nhờ vậy có thể đảm bảo tính toàn vẹn và độ tin cậy của dữ liệu trong quá trình xử lý giao dịch. Neo4j sử dụng kiến trúc graph-native, cho nên sở hữu khả năng xử lý hiệu quả các bài toán chứa nhiều liên kết phức tạp, ví dụ như mạng xã hội, hệ thống gợi ý, phát hiện gian lận và Graph RAG.

### 2.4.2. Mô hình đồ thị thuộc tính (Property Graph Model)
Dữ liệu của Neo4j được xây dựng dựa trên mô hình đồ thị thuộc tính. Ở mô hình này, dữ liệu được tổ chức và biểu diễn thông qua ba thành phần chính:
- **Nút (nodes):** Đại diện cho các thực thể độc lập trong hệ thống, mỗi nút có nhiều nhãn (labels), giúp phân loại các nút có cùng bản chất với nhau. Việc này hỗ trợ cho hệ thống tạo chỉ mục và áp đặt các ràng buộc đối với dữ liệu.
- **Mối quan hệ (Relationships):** Là thành phần bắt buộc giúp kết nối trực tiếp dữ liệu giữa hai nút lại với nhau, tạo nên cấu trúc mạng lưới. Mọi mối quan hệ trong hệ thống phải có loại (type) để xác định ngữ nghĩa và hướng rõ ràng. Hệ thống phải cho phép duyệt qua các liên kết này theo bất kỳ hướng nào mà không làm suy giảm hiệu năng.
- **Thuộc tính (Properties):** Là các thông tin được lưu dưới dạng cặp tên và giá trị (name-value), được dùng để biểu diễn các thuộc tính cho các nút cũng như các mối quan hệ. Các thuộc tính có thể được lưu trữ dưới dạng các kiểu dữ liệu khác nhau, với các miền giá trị tương ứng.

### 2.4.3. Môi trường tương tác và các phương thức kết nối
Neo4j cung cấp một hệ sinh thái công cụ đa dạng hỗ trợ đắc lực cho các nhà phát triển và quản trị viên:

**Công cụ tương tác trực tiếp:**
- **Neo4j Desktop:** Ứng dụng quản lý dự án cơ sở dữ liệu cục bộ mạnh mẽ cho môi trường phát triển.
- **Neo4j Browser:** Giao diện web trực quan cho phép chạy các câu lệnh Cypher và hiển thị kết quả dưới dạng đồ thị tương tác sinh động.
- **Cypher Shell:** Công cụ dòng lệnh (CLI) gọn nhẹ thích hợp cho các tác vụ tự động hóa và chạy script.

**Phương thức kết nối và giao thức:**
- **Giao thức Bolt:** Giao thức truyền tải nhị phân chuyên dụng của Neo4j, được tối ưu hóa cho kết nối mạng có độ trễ thấp và băng thông cao giữa ứng dụng backend và máy chủ cơ sở dữ liệu.
- **Giao thức HTTP/HTTPS:** Cung cấp các REST API cho phép tương tác qua các định dạng dữ liệu chuẩn như JSON.
- **Driver kết nối chính thức:** Neo4j cung cấp các driver chính thức hiệu năng cao cho các ngôn ngữ lập trình phổ biến nhất bao gồm Python, Java, JavaScript, Go và .NET.

---

## 2.5. NGÔN NGỮ PYTHON VÀ FRAMEWORK FLASK

### 2.5.1. Tổng quan về ngôn ngữ Python
Python là ngôn ngữ lập trình bậc cao, thông dịch và hướng đối tượng, được phát triển bởi Guido van Rossum và ra mắt lần đầu vào năm 1991. Ngôn ngữ này được thiết kế với mục tiêu đơn giản hóa cú pháp, tăng khả năng đọc hiểu mã nguồn và hỗ trợ phát triển ứng dụng nhanh chóng.

Một trong những ưu điểm nổi bật của Python là cú pháp ngắn gọn, dễ học và dễ bảo trì. Ngoài ra, Python còn sở hữu hệ sinh thái thư viện phong phú, hỗ trợ nhiều lĩnh vực như phát triển ứng dụng web, trí tuệ nhân tạo (AI), khoa học dữ liệu, tự động hóa hệ thống và xử lý dữ liệu lớn.

Trong phát triển hệ thống hiện đại, Python được sử dụng rộng rãi nhờ khả năng tích hợp tốt với nhiều framework và hệ quản trị cơ sở dữ liệu khác nhau. Đặc biệt, Python hỗ trợ hiệu quả cho việc xây dựng backend và tương tác với cơ sở dữ liệu đồ thị như Neo4j thông qua các thư viện và driver chuyên dụng.

### 2.5.2. Framework Flask và mô hình phát triển Web

#### a. Tổng quan về Flask
Flask là một micro web framework mã nguồn mở được phát triển bằng Python bởi Armin Ronacher và được giới thiệu lần đầu vào năm 2010. Framework này được xây dựng theo hướng tối giản và linh hoạt, chỉ cung cấp các chức năng cốt lõi cần thiết cho phát triển ứng dụng web.

Flask hỗ trợ các tính năng như định tuyến URL (routing), xử lý request/response, quản lý phiên làm việc (session) và tích hợp template engine Jinja2. Nhờ kiến trúc gọn nhẹ, framework này cho phép lập trình viên dễ dàng mở rộng hệ thống bằng các thư viện bên ngoài tùy theo nhu cầu thực tế.

Với ưu điểm đơn giản, dễ triển khai và dễ tích hợp với các công nghệ khác, Flask được sử dụng phổ biến trong việc xây dựng hệ thống backend, RESTful API và các ứng dụng web có quy mô vừa và nhỏ.

#### b. Mô hình phát triển ứng dụng Web với Flask
Flask hoạt động dựa trên mô hình client-server trong phát triển ứng dụng web. Khi người dùng gửi yêu cầu từ trình duyệt thông qua giao thức HTTP, Flask sẽ tiếp nhận request, xử lý logic nghiệp vụ và trả kết quả về phía client dưới dạng HTML hoặc dữ liệu JSON.

Trong quá trình xử lý, Flask sử dụng cơ chế định tuyến (routing) để ánh xạ các URL tới các hàm xử lý tương ứng trong hệ thống. Điều này giúp tổ chức ứng dụng rõ ràng và thuận tiện trong việc xây dựng các chức năng web hoặc API.

Ngoài ra, Flask còn hỗ trợ mô hình phát triển RESTful API, cho phép các ứng dụng frontend hoặc dịch vụ bên ngoài dễ dàng giao tiếp với hệ thống backend thông qua các phương thức như GET, POST, PUT và DELETE.

### 2.5.3. Tích hợp Python với cơ sở dữ liệu đồ thị

#### a. Kết nối Python với Neo4j
Neo4j cung cấp driver chính thức cho Python nhằm hỗ trợ các ứng dụng kết nối và tương tác với cơ sở dữ liệu đồ thị thông qua giao thức Bolt. Thông qua thư viện `neo4j`, hệ thống có thể thực hiện các truy vấn Cypher để thao tác dữ liệu như tạo nút, cập nhật quan hệ hoặc truy xuất thông tin từ đồ thị.

Quá trình kết nối thường bao gồm các thông tin như địa chỉ máy chủ (URI), tên đăng nhập và mật khẩu xác thực. Sau khi thiết lập kết nối thành công, ứng dụng Python có thể sử dụng các phiên làm việc (session) để gửi và xử lý các câu lệnh Cypher trên cơ sở dữ liệu Neo4j.

Việc tích hợp Python với Neo4j giúp hệ thống xử lý hiệu quả các bài toán liên quan đến dữ liệu có tính liên kết cao như hệ thống gợi ý, phân tích mạng lưới và Graph RAG.

#### b. Vai trò của Flask trong hệ thống
Trong kiến trúc ứng dụng web, Flask đóng vai trò backend trung gian giữa giao diện người dùng và cơ sở dữ liệu Neo4j. Khi nhận request từ phía client, Flask sẽ xử lý dữ liệu đầu vào, gửi truy vấn Cypher đến Neo4j thông qua Python Driver và trả kết quả về cho người dùng dưới dạng JSON hoặc giao diện web.

Sự kết hợp giữa Python, Flask và Neo4j giúp hệ thống có khả năng phát triển linh hoạt, dễ mở rộng và phù hợp với các ứng dụng cần xử lý dữ liệu đồ thị phức tạp trong thời gian thực.

---

## 2.6. MÔ HÌNH NGÔN NGỮ LỚN (LLM)

### 2.6.1. Khái niệm về Mô hình ngôn ngữ lớn
Mô hình ngôn ngữ lớn (Large Language Model - LLM) là các mô hình trí tuệ nhân tạo được huấn luyện trên khối lượng dữ liệu văn bản rất lớn nhằm học cách biểu diễn, hiểu và sinh ngôn ngữ tự nhiên. Phần lớn các LLM hiện đại được xây dựng dựa trên kiến trúc Transformer, cho phép mô hình nắm bắt hiệu quả mối quan hệ giữa các từ và ngữ cảnh trong câu thông qua cơ chế tự chú ý (Self-Attention).

Nhờ khả năng học từ lượng dữ liệu khổng lồ, LLM có thể thực hiện nhiều tác vụ xử lý ngôn ngữ tự nhiên như trả lời câu hỏi, tóm tắt văn bản, dịch máy, phân loại nội dung, trích xuất thông tin và hỗ trợ hội thoại với người dùng. Trong những năm gần đây, sự phát triển của LLM đã tạo ra bước tiến quan trọng trong lĩnh vực trí tuệ nhân tạo, góp phần hình thành các hệ thống trợ lý ảo và hệ thống hỏi đáp thông minh.

### 2.6.2. Vai trò của LLM trong hệ thống hỏi đáp tri thức
Trong các hệ thống hỏi đáp hiện đại, LLM đóng vai trò là thành phần xử lý ngôn ngữ tự nhiên, giúp chuyển đổi câu hỏi của người dùng thành ngữ nghĩa mà máy tính có thể hiểu, đồng thời tổng hợp dữ liệu truy xuất được thành câu trả lời tự nhiên và dễ hiểu.

Tuy nhiên, LLM tồn tại một số hạn chế như khả năng tạo ra thông tin không chính xác (hallucination), phụ thuộc vào dữ liệu huấn luyện và khó tiếp cận các tri thức mới phát sinh sau thời điểm huấn luyện. Do đó, nhiều nghiên cứu hiện nay kết hợp LLM với các nguồn dữ liệu bên ngoài thông qua các kiến trúc truy xuất tri thức nhằm nâng cao độ chính xác và tính tin cậy của câu trả lời.

---

## 2.7. KIẾN TRÚC TRUY VẤN TĂNG CƯỜNG DỰA TRÊN ĐỒ THỊ (GRAPHRAG)

### 2.7.1. Hạn chế của RAG truyền thống
Retrieval-Augmented Generation (RAG) là kiến trúc kết hợp giữa cơ chế truy xuất dữ liệu và mô hình ngôn ngữ lớn nhằm cải thiện chất lượng câu trả lời. Trong mô hình này, hệ thống sẽ truy xuất các tài liệu liên quan từ cơ sở tri thức, sau đó cung cấp chúng làm ngữ cảnh cho LLM trước khi sinh phản hồi.

Mặc dù mang lại hiệu quả cao trong nhiều bài toán hỏi đáp, RAG truyền thống vẫn tồn tại một số hạn chế. Dữ liệu thường được lưu trữ dưới dạng các đoạn văn bản hoặc vector embedding nên khó biểu diễn các mối quan hệ phức tạp giữa các thực thể. Điều này khiến hệ thống gặp khó khăn khi xử lý các câu hỏi yêu cầu suy luận nhiều bước, truy vấn quan hệ hoặc thống kê dữ liệu có cấu trúc.

### 2.7.2. Khái niệm GraphRAG
GraphRAG (Graph Retrieval-Augmented Generation) là sự mở rộng của kiến trúc RAG truyền thống bằng cách kết hợp Đồ thị tri thức (Knowledge Graph) với Mô hình ngôn ngữ lớn (LLM). Thay vì chỉ truy xuất các đoạn văn bản tương tự về mặt ngữ nghĩa, GraphRAG khai thác trực tiếp các thực thể và mối quan hệ được lưu trữ trong đồ thị tri thức.

Nhờ tận dụng cấu trúc dữ liệu dạng đồ thị, GraphRAG có khả năng truy xuất thông tin chính xác hơn, hỗ trợ suy luận đa bước và khai thác hiệu quả các mối liên hệ phức tạp giữa các thực thể. Điều này đặc biệt phù hợp với các lĩnh vực có dữ liệu liên kết chặt chẽ như quản lý tri thức, nghiên cứu khoa học, mạng xã hội và hệ thống chuyên gia.

### 2.7.3. Nguyên lý hoạt động của GraphRAG
Quy trình hoạt động của GraphRAG thường bao gồm các bước sau:
1. Tiếp nhận câu hỏi từ người dùng.
2. Phân tích câu hỏi để xác định các thực thể và mối quan hệ liên quan.
3. Truy xuất dữ liệu từ đồ thị tri thức thông qua các truy vấn chuyên biệt (như Cypher query).
4. Tổng hợp dữ liệu truy xuất được thành ngữ cảnh đầu vào cho LLM.
5. Sử dụng LLM để sinh câu trả lời tự nhiên dựa trên dữ liệu đã truy xuất.

Sự kết hợp giữa khả năng lưu trữ và truy xuất chính xác của đồ thị tri thức với năng lực hiểu ngôn ngữ của LLM giúp GraphRAG nâng cao độ chính xác, khả năng giải thích và chất lượng phản hồi của hệ thống hỏi đáp. Đây hiện là một trong những hướng tiếp cận được quan tâm trong việc xây dựng các hệ thống trí tuệ nhân tạo dựa trên tri thức có cấu trúc.
