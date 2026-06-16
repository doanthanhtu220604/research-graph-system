# TÀI LIỆU CHỨC NĂNG VÀ KỊCH BẢN KIỂM THỬ: PHÂN HỆ KHÁCH VÃNG LAI & SINH VIÊN (GUEST / STUDENT)

Tài liệu này chi tiết hóa toàn bộ các chức năng thuộc nhóm người dùng **Khách vãng lai và Sinh viên** trong hệ thống Bản đồ Tri thức Nghiên cứu Khoa học (NTU). Tài liệu chỉ rõ cách thức hoạt động của từng chức năng để phục vụ kiểm thử, luồng xử lý dữ liệu giữa Frontend và Backend, cùng thông tin chi tiết về các file code, hàm và câu truy vấn CSDL đồ thị Neo4j (Cypher) tương ứng.

---

## MỤC LỤC
1. [Chức năng 1: Trực quan hóa Bản đồ Tri thức (Knowledge Map Visualization)](#chuc-nang-1-truc-quan-hoa-ban-do-tri-thuc-knowledge-map-visualization)
2. [Chức năng 2: Tìm kiếm tổng hợp (Global Search)](#chuc-nang-2-tim-kiem-tong-hop-global-search)
3. [Chức năng 3: Chatbot AI hỏi đáp nghiên cứu (Graph-RAG Chatbot)](#chuc-nang-3-chatbot-ai-hoi-dap-nghien-cuu-graph-rag-chatbot)
4. [Chức năng 4: Trực quan mạng lưới hợp tác (Co-authorship Network)](#chuc-nang-4-truc-quan-mang-luoi-hop-tac-co-authorship-network)
5. [Chức năng 5: Xem lý lịch khoa học Giảng viên & Đồng bộ chỉ số học thuật thực tế](#chuc-nang-5-xem-ly-lich-khoa-hoc-giang-vien--dong-bo-chi-so-hoc-thuat-thuc-te)
6. [Chức năng 6: Xem danh sách và chi tiết Công trình nghiên cứu (Publications)](#chuc-nang-6-xem-danh-sach-va-chi-tiet-cong-trinh-nghien-cuu-publications)
7. [Chức năng 7: Xem danh sách và chi tiết Đề tài nghiên cứu (Projects)](#chuc-nang-7-xem-danh-sach-va-chi-tiet-de-tai-nghien-cuu-projects)
8. [Chức năng 8: Xem Thống kê tổng quan Nghiên cứu khoa học (Academic Statistics)](#chuc-nang-8-xem-thong-ke-tong-quan-nghien-cuu-khoa-hoc-academic-statistics)

---

## CHI TIẾT CÁC CHỨC NĂNG

### CHỨC NĂNG 1: TRỰC QUAN HÓA BẢN ĐỒ TRI THỨC (KNOWLEDGE MAP VISUALIZATION)

#### 1. Mô tả chức năng
Hiển thị mạng lưới kết nối trực quan giữa các thực thể trong hệ thống (Giảng viên, Đề tài, Công trình, Bộ môn, Khoa, Lĩnh vực nghiên cứu) dưới dạng đồ thị tương tác bằng thư viện **Vis.js**. Khách vãng lai có thể tự do thu phóng (zoom), kéo thả các nút (nodes) để quan sát mối liên kết và nhấp vào từng nút để xem chi tiết.

#### 2. Cách chức năng hoạt động (Kịch bản kiểm thử)
*   **Bước 1:** Truy cập trang chủ Khám phá (`explore.html`).
*   **Bước 2:** Click chọn một bộ lọc phân loại thực thể phía dưới thanh tìm kiếm (ví dụ: Giảng viên, Lĩnh vực).
*   **Bước 3:** Nhấp chuột trực tiếp vào một nút Giảng viên hoặc Đề tài trên đồ thị Vis.js.
*   **Kết quả kỳ vọng:**
    *   Đồ thị Vis.js kết xuất đầy đủ các nút với màu sắc và hình dạng tương ứng theo phân loại (Legend).
    *   Khi nhấp vào một nút trên đồ thị, một thanh panel chi tiết (Sidebar) sẽ trượt ra từ cạnh phải màn hình hiển thị thông tin chi tiết và các liên kết trực tiếp của thực thể đó.
    *   Các nút đã bị xóa mềm (`is_deleted = true`) tuyệt đối không xuất hiện trên đồ thị.

#### 3. Luồng hoạt động (Workflow)
Luồng hoạt động xử lý yêu cầu trực quan hóa bản đồ tri thức diễn ra như sau:
1. **Khách vãng lai** truy cập trang Khám phá bản đồ (`explore.html`), trình duyệt bắt đầu tải giao diện HTML và nạp các tệp JavaScript xử lý đồ thị (`explore.js`, `graph.js`).
2. **JavaScript phía client** tự động thực hiện một yêu cầu HTTP GET gửi đến Backend thông qua API endpoint `/api/graph/all`.
3. **Backend Flask** nhận yêu cầu và kết nối tới cơ sở dữ liệu Neo4j.
4. **Hệ quản trị CSDL Neo4j** chạy câu truy vấn tìm kiếm toàn bộ các nút và cạnh liên kết trong mạng lưới, loại bỏ tất cả các thực thể có đánh dấu xóa mềm (`is_deleted = true`).
5. **Backend Flask** nhận dữ liệu thô từ Neo4j, chuẩn hóa các thuộc tính (thiết lập màu sắc, kích thước, dạng hình học mặc định cho từng loại thực thể như Giảng viên là hình tròn xanh, Công trình là hình kim cương xanh lá, Đề tài là hình tam giác vàng, v.v.).
6. **Backend** gửi phản hồi JSON chứa cấu trúc chuẩn hóa này về cho client.
7. **JavaScript phía client** nhận dữ liệu, khởi tạo thư viện **Vis.js Network**, và tiến hành dựng đồ thị trực quan hóa tương tác lên thẻ canvas HTML5 để khách vãng lai trải nghiệm.

#### 4. Code & Query chi tiết
*   **Frontend HTML:** [explore.html](file:///d:/research-graph-system/frontend/user/explore.html)
*   **Frontend JS:** [explore.js](file:///d:/research-graph-system/frontend/js/user/explore.js) & [graph.js](file:///d:/research-graph-system/frontend/js/user/graph.js)
*   **Backend File:** [api.py](file:///d:/research-graph-system/backend/routes/api.py)
*   **Hàm xử lý:** `get_full_graph()` (Route: `/api/graph/all`) và `get_node_graph(node_id)` (Route: `/api/graph/node/<node_id>`)
*   **Câu truy vấn Cypher chính:**
    *   *Truy vấn lấy toàn bộ Nodes:*
        ```cypher
        MATCH (n)
        WHERE n.id IS NOT NULL AND coalesce(n.is_deleted, false) = false
        RETURN n.id AS id, labels(n) AS labels, properties(n) AS props
        ```
    *   *Truy vấn lấy toàn bộ Edges (Mối quan hệ):*
        ```cypher
        MATCH (a)-[r]->(b)
        WHERE a.id IS NOT NULL AND b.id IS NOT NULL
          AND coalesce(a.is_deleted, false) = false
          AND coalesce(b.is_deleted, false) = false
        RETURN a.id AS source, b.id AS target, type(r) AS type, properties(r) AS props
        ```

---

### CHỨC NĂNG 2: TÌM KIẾM TỔNG HỢP (GLOBAL SEARCH)

#### 1. Mô tả chức năng
Cho phép tìm kiếm nhanh các thông tin trong hệ thống bằng ngôn ngữ tự nhiên (hỗ trợ cả tiếng Việt có dấu, không dấu, viết hoa, viết thường, hoặc từ khóa viết liền). Hệ thống sẽ tìm kiếm thông tin tương ứng trên các thực thể Giảng viên, Đề tài, Công trình, Bộ môn, Khoa, Lĩnh vực.

#### 2. Cách chức năng hoạt động (Kịch bản kiểm thử)
*   **Bước 1:** Nhập từ khóa tiếng Việt không dấu: `nguyen thanh tu` vào ô tìm kiếm trên trang chủ.
*   **Bước 2:** Bấm nút tìm kiếm.
*   **Bước 3 (Kiểm tra viết liền):** Nhập từ khóa viết liền không cách: `thanhtu` và tiến hành tìm kiếm.
*   **Bước 4 (Kiểm tra bảo mật):** Nhập chuỗi ký tự phá hoại: `' OR 1=1 OR n.id = '` để kiểm tra lỗ hổng Cypher Injection.
*   **Kết quả kỳ vọng:**
    *   Bước 2 và 3 hiển thị đúng kết quả liên quan đến giảng viên "Nguyễn Thanh Tú" (nhờ thuật toán chuẩn hóa không dấu và viết liền ở Backend).
    *   Bước 4 hệ thống hoạt động an toàn, không báo lỗi 500 hay rò rỉ dữ liệu (do Backend sử dụng tham số hóa tham số truy vấn an toàn).

#### 3. Luồng hoạt động (Workflow)
1.  Người dùng nhập chuỗi tìm kiếm và chọn loại bộ lọc (Tất cả, Giảng viên, Đề tài, Công trình) trên giao diện.
2.  Frontend gửi yêu cầu `GET /api/search?q=<keyword>&type=<all|giang_vien|cong_trinh|de_tai>` tới Backend.
3.  Backend nhận chuỗi từ khóa, chuẩn hóa không dấu bằng hàm `remove_accents()`.
4.  Backend thực thi câu lệnh Cypher quét toàn bộ các trường dữ liệu của các thực thể và trả về kết quả mờ (Fuzzy matching) tối đa 30 bản ghi.
5.  Frontend nhận danh sách kết quả, cập nhật giao diện hiển thị danh mục kết quả tìm kiếm và highlight các node tương ứng trên bản đồ.

#### 4. Code & Query chi tiết
*   **Frontend JS:** [explore.js](file:///d:/research-graph-system/frontend/js/user/explore.js) (lắng nghe sự kiện tìm kiếm và render kết quả).
*   **Backend File:** [api.py](file:///d:/research-graph-system/backend/routes/api.py)
*   **Hàm xử lý:** `search()` (Route: `/api/search`), hàm chuẩn hóa `remove_accents()`.
*   **Câu truy vấn Cypher chính:**
    ```cypher
    MATCH (n{label_filter})
    WHERE coalesce(n.is_deleted, false) = false
      AND NOT (n:TacGiaNgoai AND coalesce(n.trang_thai, 'Đã duyệt') <> 'Đã duyệt')
      AND NOT (n:TacGiaNgoai AND EXISTS {
        MATCH (gv:GiangVien) WHERE gv.ho_va_ten = n.ho_va_ten
    })
    OPTIONAL MATCH (tg)-[:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU|DONG_TAC_GIA]->(n)
    WHERE NOT (tg:TacGiaNgoai) OR coalesce(tg.trang_thai, 'Đã duyệt') = 'Đã duyệt'
    OPTIONAL MATCH (tv)-[:CHU_NHIEM|THAM_GIA]->(n)
    RETURN n, labels(n) AS labels,
           collect(DISTINCT tg.ho_va_ten) AS related_authors,
           collect(DISTINCT tv.ho_va_ten) AS related_members
    ```
    *(Sau khi nhận kết quả thô, Backend Python tiến hành đối sánh chuỗi đã loại bỏ dấu để lọc ra các bản ghi khớp mờ hoặc viết liền)*

---

### CHỨC NĂNG 3: CHATBOT AI HỎI ĐÁP NGHIÊN CỨU (GRAPH-RAG CHATBOT)

#### 1. Mô tả chức năng
Là tính năng thông minh kết hợp giữa Trí tuệ nhân tạo (Gemini API) và CSDL đồ thị Neo4j. Khách vãng lai có thể hỏi đáp bằng ngôn ngữ tự nhiên về mọi thông tin khoa học trong khoa. Chatbot sẽ tự động dịch câu hỏi thành câu trả lời tự nhiên kèm theo đồ thị con (Sub-graph) trực quan hóa các thực thể được nhắc đến trong câu trả lời.

#### 2. Cách chức năng hoạt động (Kịch bản kiểm thử)
*   **Bước 1:** Truy cập trang Hỏi đáp AI (`chat.html`).
*   **Bước 2:** Nhập câu hỏi: "Ai nghiên cứu về AI và Machine Learning?".
*   **Bước 3 (Kiểm thử Fallback):** Tắt kết nối internet của Server (hoặc cố tình cấu hình sai API Key Gemini) và gửi câu hỏi.
*   **Kết quả kỳ vọng:**
    *   Ở bước 2: Chatbot trả về đoạn câu trả lời tự nhiên bằng tiếng Việt chỉ rõ tên các giảng viên và công trình nghiên cứu tương ứng, bên dưới hiển thị đồ thị mini chứa các nút giảng viên liên kết với lĩnh vực AI.
    *   Ở bước 3: Hệ thống không bị crash (không lỗi 500), tự động chuyển sang cơ chế Fallback (Rule-based) trích xuất dữ liệu thô từ Regex và hiển thị kết quả dạng bảng tĩnh.

#### 3. Luồng hoạt động (Workflow)
Luồng xử lý câu hỏi tự nhiên của Chatbot AI Graph-RAG diễn ra như sau:
1. **Khách vãng lai** nhập câu hỏi nghiên cứu (ví dụ: "Ai nghiên cứu về AI?") và bấm gửi trên giao diện `chat.html`.
2. **JavaScript client** (`chat.js`) gửi yêu cầu HTTP POST kèm dữ liệu câu hỏi trong body đến API `/api/chat/ask`.
3. **Backend Flask** (`chat_api.py`) thực hiện kiểm tra từ khóa và cấu trúc câu hỏi bằng hệ thống chấm điểm Intent (Rule-based cục bộ) để phân tích yêu cầu nhanh chóng (< 10ms).
4. **Xử lý Intent**:
   * *Nếu nhận diện được Intent*: Backend trích xuất các thực thể liên quan (Tên giảng viên, Lĩnh vực, Năm, Cấp đề tài...) bằng hàm Regex và so khớp chuỗi cục bộ.
   * *Nếu không nhận diện được (Intent Unknown)*: Backend chuyển tiếp câu hỏi cho **Gemini API** qua dịch vụ `gemini_service.py` để phân tích ngữ nghĩa, trả về phân loại intent và các thực thể được trích xuất dưới dạng JSON.
5. **Truy vấn cơ sở dữ liệu**: Backend chuyển đổi các thực thể trích xuất được thành tham số truy vấn và gửi câu lệnh Cypher tương ứng tới Neo4j để lấy dữ liệu nghiên cứu khoa học thô.
6. **Tạo câu trả lời tự nhiên**: Backend gửi tập dữ liệu thô nhận được từ Neo4j kèm theo câu hỏi gốc của người dùng sang Gemini API lần hai để nhờ mô hình ngôn ngữ lớn tổng hợp thành một câu trả lời tự nhiên, chính xác bằng tiếng Việt.
7. **Xây dựng đồ thị con (Sub-graph)**: Backend tự động quét câu trả lời để tìm các liên kết chi tiết (`javascript:show...Detail`). Nó lấy ra tối đa 5 mã thực thể chính được nhắc đến và truy vấn Neo4j để lấy các node liên kết trực tiếp (1-hop), đóng gói thành dữ liệu đồ thị con.
8. **Phản hồi**: Backend trả về JSON chứa câu trả lời dạng văn bản cùng với cấu trúc đồ thị con cho Frontend.
9. **Hiển thị**: Frontend in câu trả lời của Chatbot ra màn hình chat và dùng thư viện Vis.js vẽ đồ thị con tương quan trực quan ngay dưới tin nhắn để khách vãng lai dễ dàng theo dõi.

#### 4. Code & Query chi tiết
*   **Frontend HTML:** [chat.html](file:///d:/research-graph-system/frontend/user/chat.html)
*   **Frontend JS:** [chat.js](file:///d:/research-graph-system/frontend/js/user/chat.js)
*   **Backend Files:**
    *   [chat_api.py](file:///d:/research-graph-system/backend/routes/chat_api.py) (Chứa route, các hàm handler và trích xuất thực thể)
    *   [gemini_service.py](file:///d:/research-graph-system/backend/services/gemini_service.py) (Gọi API Gemini AI)
*   **Hàm xử lý chính:** `ask()` (Route: `/api/chat/ask`), `detect_intent()`, `build_graph_for_answer()`
*   **Câu truy vấn Cypher tạo đồ thị con liên quan (Sub-graph):**
    ```cypher
    MATCH (center) WHERE center.id = $nid
    WITH center
    MATCH (center)-[r]-(neighbor)
    WHERE neighbor.id IS NOT NULL
    RETURN center, r, neighbor,
           center.id AS cid, neighbor.id AS nid2,
           labels(center) AS clabels, labels(neighbor) AS nlabels,
           type(r) AS rel_type
    LIMIT 30
    ```

---

### CHỨC NĂNG 4: TRỰC QUAN MẠNG LƯỚI HỢP TÁC (CO-AUTHORSHIP NETWORK)

#### 1. Mô tả chức năng
Phân tích mạng lưới đồng tác giả và cộng tác nghiên cứu giữa các giảng viên trong khoa dựa trên lịch sử cùng thực hiện đề tài hoặc đứng tên chung trên các công trình nghiên cứu.

#### 2. Cách chức năng hoạt động (Kịch bản kiểm thử)
*   **Bước 1:** Truy cập trang Mạng lưới hợp tác (`collaboration.html`).
*   **Bước 2:** Chọn bộ lọc Bộ môn (ví dụ: Công nghệ phần mềm) và điều chỉnh thanh trượt "Số hợp tác tối thiểu" lên mức `2`.
*   **Bước 3:** Nhấn nút "Cập nhật đồ thị".
*   **Kết quả kỳ vọng:**
    *   Đồ thị tự động cập nhật, chỉ hiển thị các giảng viên thuộc bộ môn Công nghệ phần mềm và các giảng viên có liên kết hợp tác với họ.
    *   Đường nối giữa 2 giảng viên chỉ xuất hiện nếu họ có tối thiểu 2 đề tài hoặc công trình chung.
    *   Kích thước của các nút giảng viên thay đổi tương ứng theo bậc kết nối (Degree Centrality - giảng viên nào có nhiều cộng sự nhất nút sẽ to nhất).
    *   Độ dày của đường nối tỷ lệ thuận với số lần hợp tác chung.

#### 3. Luồng hoạt động (Workflow)
1.  Khách vãng lai thiết lập bộ lọc (Bộ môn, Số hợp tác tối thiểu) trên giao diện.
2.  Frontend gửi yêu cầu `GET /api/collaboration/graph?bo_mon=<Ten_Bo_Mon>&min_collab=<So_Luong>` tới Backend.
3.  Backend truy vấn Neo4j chạy 2 khối lệnh độc lập: lấy danh sách hợp tác qua công trình (`pairs_ct`) và qua đề tài (`pairs_dt`), sau đó gộp kết quả và tính toán scale size cho node, width cho edge.
4.  Backend phản hồi JSON chứa thông tin chi tiết các node giảng viên và các cạnh hợp tác kèm tooltip mô tả chi tiết các bài báo/đề tài chung.
5.  Frontend sử dụng thư viện Vis.js render mạng lưới lên màn hình.

#### 4. Code & Query chi tiết
*   **Frontend HTML:** [collaboration.html](file:///d:/research-graph-system/frontend/user/collaboration.html)
*   **Frontend JS:** [collaboration_app.js](file:///d:/research-graph-system/frontend/js/user/collaboration_app.js)
*   **Backend File:** [collaboration_api.py](file:///d:/research-graph-system/backend/routes/collaboration_api.py)
*   **Hàm xử lý chính:** `get_collaboration_graph()` (Route: `/api/collaboration/graph`)
*   **Câu truy vấn Cypher chính:**
    *   *Truy vấn các cặp hợp tác qua công trình:*
        ```cypher
        MATCH (gv1:GiangVien)-[:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct:CongTrinhNghienCuu)<-[:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]-(gv2:GiangVien)
        WHERE id(gv1) < id(gv2)
          AND coalesce(gv1.is_deleted, false) = false
          AND coalesce(gv2.is_deleted, false) = false
          AND coalesce(ct.is_deleted, false) = false
        WITH gv1, gv2, count(DISTINCT ct) AS so_ct, collect(DISTINCT ct.ten_cong_trinh) AS ds_ct
        WHERE so_ct >= $min_collab
        RETURN gv1.id AS id1, gv2.id AS id2, so_ct, ds_ct, 0 AS so_dt, [] AS ds_dt
        ```
    *   *Truy vấn các cặp hợp tác qua đề tài:*
        ```cypher
        MATCH (gv1:GiangVien)-[:CHU_NHIEM|THAM_GIA]->(dt:DeTaiNghienCuu)<-[:CHU_NHIEM|THAM_GIA]-(gv2:GiangVien)
        WHERE id(gv1) < id(gv2)
          AND coalesce(gv1.is_deleted, false) = false
          AND coalesce(gv2.is_deleted, false) = false
          AND coalesce(dt.is_deleted, false) = false
        WITH gv1, gv2, count(DISTINCT dt) AS so_dt, collect(DISTINCT dt.ten_de_tai) AS ds_dt
        WHERE so_dt >= 1
        RETURN gv1.id AS id1, gv2.id AS id2, 0 AS so_ct, [] AS ds_ct, so_dt, ds_dt
        ```

---

### CHỨC NĂNG 5: XEM LÝ LỊCH KHOA HỌC GIẢNG VIÊN & ĐỒNG BỘ CHỈ SỐ HỌC THUẬT THỰC TẾ

#### 1. Mô tả chức năng
Hiển thị lý lịch khoa học chi tiết của giảng viên, sơ đồ timeline các công trình, đề tài qua các năm và huy hiệu chỉ số học thuật quốc tế (Citations, H-Index, i10-Index) được đồng bộ hóa thời gian thực từ các cơ sở dữ liệu thư mục toàn cầu.

#### 2. Cách chức năng hoạt động (Kịch bản kiểm thử)
*   **Bước 1:** Vào trang danh sách giảng viên (`lecturers.html`), click chọn giảng viên "Nguyễn Thanh Tú".
*   **Bước 2:** Quan sát khu vực Citation Badge trên đầu trang chi tiết hồ sơ giảng viên.
*   **Kết quả kỳ vọng:**
    *   Timeline hiển thị chi tiết các công trình, đề tài được sắp xếp giảm dần theo năm.
    *   Citation Badge hiển thị hiệu ứng Loading và sau đó hiện các chỉ số thực tế (ví dụ: Số trích dẫn, H-Index) lấy từ API OpenAlex hoặc Google Scholar.
    *   Nhấp vào link profile gốc trên Badge sẽ chuyển tiếp chính xác đến trang hồ sơ công khai của giảng viên đó.

#### 3. Luồng hoạt động (Workflow)
Luồng đồng bộ chỉ số học thuật quốc tế thời gian thực diễn ra theo các bước sau:
1. **Khách vãng lai** nhấp vào một giảng viên cụ thể trên giao diện, trình duyệt sẽ chuyển hướng hoặc mở panel thông tin giảng viên (`profile.html` / `lecturers.html`).
2. **JavaScript client** (`academic.js`) tự động kích hoạt và gửi yêu cầu HTTP GET đến API `/api/academic/<tên_giảng_viên_bỏ_dấu>`.
3. **Backend Flask** (`academic_api.py`) nhận yêu cầu và bắt đầu quá trình tìm kiếm tác giả:
   * **Bước 3.1 (Nguồn chính - OpenAlex)**: Backend gửi truy vấn tìm kiếm tên tác giả không dấu lên OpenAlex API (một thư mục mở đáng tin cậy và miễn phí).
   * **Bước 3.2 (Thuật toán đối sánh thực thể)**: Khi OpenAlex trả về danh sách tác giả trùng tên, Backend áp dụng hệ thống chấm điểm độ khớp (Scoring Matcher) dựa trên mức độ tương đồng tên và sự xuất hiện của tên cơ quan "Nha Trang University" hoặc "NTU" trong lịch sử liên kết của tác giả.
   * **Bước 3.3 (Chọn lọc)**: Tác giả có điểm cao nhất và vượt ngưỡng tin cậy sẽ được chọn để trích xuất các chỉ số học thuật (Citations, H-Index, i10-Index, Works count, Profile URL).
   * **Bước 3.4 (Nguồn dự phòng - Google Scholar)**: Nếu OpenAlex không tìm thấy kết quả hoặc bị lỗi kết nối, Backend tự động kích hoạt cơ chế dự phòng cào dữ liệu từ Google Scholar thông qua thư viện `scholarly`, tối ưu hóa truy vấn tìm kiếm kèm tên trường (ví dụ: "Nguyen Thanh Tu Nha Trang University") để tìm đúng người.
4. **Phản hồi**: Backend trả về dữ liệu JSON chứa toàn bộ các chỉ số thu thập được kèm theo tên nguồn dữ liệu.
5. **Hiển thị**: JavaScript client nhận kết quả, tắt trạng thái chờ (loading spinner) và render các huy hiệu (Badge) chứa số liệu trích dẫn trực tiếp lên giao diện của giảng viên.

#### 4. Code & Query chi tiết
*   **Frontend HTML:** `profile.html` (Trang thông tin chi tiết giảng viên)
*   **Frontend JS:** [academic.js](file:///d:/research-graph-system/frontend/js/user/academic.js) & [lecturers.js](file:///d:/research-graph-system/frontend/js/user/lecturers.js)
*   **Backend Files:**
    *   [api.py](file:///d:/research-graph-system/backend/routes/api.py) (Lấy thông tin cơ bản, đề tài, công trình của GV từ Neo4j)
    *   [academic_api.py](file:///d:/research-graph-system/backend/routes/academic_api.py) (Đồng bộ và tính toán chỉ số học thuật)
*   **Hàm xử lý chính:**
    *   `get_giang_vien_detail(gv_id)` (Lấy thông tin từ Neo4j)
    *   `get_academic_stats(name)` (Gọi APIs đồng bộ chỉ số học thuật)
*   **Thuật toán đối sánh thực thể (Scoring Matcher) trong OpenAlex:**
    *   Khớp tên không dấu chính xác: `+150` điểm.
    *   Cơ quan hiện tại (`last_known_institution`) có chứa "Nha Trang University" hoặc "NTU": `+200` điểm.
    *   Cơ quan trong lịch sử liên kết có chứa "Nha Trang University" hoặc "NTU": `+100` điểm.
    *   *Nếu tổng điểm >= 100, Backend xác thực đây là giảng viên cần tìm.*

---

### CHỨC NĂNG 6: XEM DANH SÁCH VÀ CHI TIẾT CÔNG TRÌNH NGHIÊN CỨU (PUBLICATIONS)

#### 1. Mô tả chức năng
Hiển thị danh sách các bài báo, công trình nghiên cứu khoa học của khoa. Khách vãng lai có thể lọc danh sách theo năm, theo loại bài báo và click xem thông tin chi tiết của bài báo.

#### 2. Cách chức năng hoạt động (Kịch bản kiểm thử)
*   **Bước 1:** Vào trang Công trình nghiên cứu (`publications.html`).
*   **Bước 2:** Click chọn một công trình nghiên cứu bất kỳ để xem chi tiết.
*   **Kết quả kỳ vọng:**
    *   Danh sách bài báo hiển thị đầy đủ tên bài báo, năm xuất bản, tác giả chính và các đồng tác giả.
    *   Khi click vào bài báo, một modal thông tin hiển thị các thuộc tính: tên bài viết (tiếng Việt/tiếng Anh), tạp chí/nơi xuất bản, năm xuất bản, các giảng viên nội bộ tham gia (kèm link click dẫn tới trang cá nhân) và các tác giả ngoài (kèm đơn vị công tác).
    *   Các bài báo đang ở trạng thái Nháp/Chờ duyệt hoặc đã bị xóa mềm tuyệt đối không hiển thị trong danh sách.

#### 3. Luồng hoạt động (Workflow)
1.  Khách vãng lai truy cập trang danh sách công trình.
2.  Frontend gửi yêu cầu `GET /api/cong-trinh` tới Backend.
3.  Backend chạy truy vấn Cypher quét toàn bộ node `CongTrinhNghienCuu` có thuộc tính `is_deleted = false` và đã được phê duyệt. Đồng thời thực hiện `OPTIONAL MATCH` tìm các tác giả nội bộ (`GiangVien`) và tác giả ngoài (`TacGiaNgoai` có trạng thái Đã duyệt).
4.  Backend trả về danh sách dưới dạng JSON. Frontend render danh sách dạng lưới hoặc bảng lên giao diện.

#### 4. Code & Query chi tiết
*   **Frontend HTML:** [publications.html](file:///d:/research-graph-system/frontend/user/publications.html)
*   **Frontend JS:** [publications.js](file:///d:/research-graph-system/frontend/js/user/publications.js)
*   **Backend File:** [api.py](file:///d:/research-graph-system/backend/routes/api.py)
*   **Hàm xử lý:** `get_all_cong_trinh()` (Route: `/api/cong-trinh`), `get_cong_trinh_detail(ct_id)` (Route: `/api/cong-trinh/<ct_id>`)
*   **Câu truy vấn Cypher chính:**
    ```cypher
    MATCH (ct:CongTrinhNghienCuu)
    WHERE coalesce(ct.is_deleted, false) = false
    OPTIONAL MATCH (gv:GiangVien)-[r:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct)
    OPTIONAL MATCH (tgn:TacGiaNgoai)-[:TAC_GIA_CHINH|CONG_SU|DONG_TAC_GIA]->(ct)
    WHERE coalesce(tgn.trang_thai, 'Đã duyệt') = 'Đã duyệt'
    RETURN ct,
           collect(DISTINCT gv.ho_va_ten) AS tac_gia,
           collect(DISTINCT tgn.ho_va_ten) AS tac_gia_ngoai
    ORDER BY CASE WHEN ct.trang_thai IN ['Chờ duyệt', 'Yêu cầu xóa', 'Yêu cầu đổi trạng thái'] THEN 0 ELSE 1 END ASC,
             toInteger(ct.nam_xuat_ban) DESC,
             coalesce(ct.created_at, 0) DESC,
             id(ct) DESC
    ```

---

### CHỨC NĂNG 7: XEM DANH SÁCH VÀ CHI TIẾT ĐỀ TÀI NGHIÊN CỨU (PROJECTS)

#### 1. Mô tả chức năng
Hiển thị danh sách các đề tài nghiên cứu khoa học các cấp đã và đang thực hiện tại Khoa. Người dùng có thể lọc đề tài theo năm, cấp đề tài (Nhà nước, Bộ, Tỉnh, Trường, Cơ sở), trạng thái thực hiện (Đã nghiệm thu, Đang thực hiện...).

#### 2. Cách chức năng hoạt động (Kịch bản kiểm thử)
*   **Bước 1:** Vào trang Đề tài nghiên cứu (`projects.html`).
*   **Bước 2:** Click chọn một đề tài cụ thể.
*   **Kết quả kỳ vọng:**
    *   Danh sách đề tài hiển thị chính xác tên đề tài, chủ nhiệm đề tài, cấp đề tài và năm thực hiện.
    *   Khi click vào đề tài, modal chi tiết xuất hiện chứa đầy đủ thông tin: Tên đề tài, Chủ nhiệm đề tài, Các thành viên tham gia, Cấp quản lý, Kinh phí thực hiện, Trạng thái hoạt động, các tác giả ngoài cùng đơn vị công tác của họ.
    *   Các đề tài nháp/chưa duyệt hoặc đã bị xóa mềm tuyệt đối không hiển thị công khai.

#### 3. Luồng hoạt động (Workflow)
1.  Khách vãng lai truy cập trang danh sách đề tài.
2.  Frontend gửi yêu cầu `GET /api/de-tai` tới Backend.
3.  Backend chạy truy vấn Cypher tìm tất cả các node `DeTaiNghienCuu` có `is_deleted = false` và đã được phê duyệt chính thức. Backend gom nhóm chủ nhiệm (`CHU_NHIEM`) và thành viên tham gia (`THAM_GIA`) thành danh sách phân biệt.
4.  Backend trả về dữ liệu JSON và Frontend render cấu trúc đề tài lên màn hình.

#### 4. Code & Query chi tiết
*   **Frontend HTML:** [projects.html](file:///d:/research-graph-system/frontend/user/projects.html)
*   **Frontend JS:** [projects.js](file:///d:/research-graph-system/frontend/js/user/projects.js)
*   **Backend File:** [api.py](file:///d:/research-graph-system/backend/routes/api.py)
*   **Hàm xử lý:** `get_all_de_tai()` (Route: `/api/de-tai`), `get_de_tai_detail(dt_id)` (Route: `/api/de-tai/<dt_id>`)
*   **Câu truy vấn Cypher chính:**
    ```cypher
    MATCH (dt:DeTaiNghienCuu)
    WHERE coalesce(dt.is_deleted, false) = false
    OPTIONAL MATCH (gv_cn:GiangVien)-[:CHU_NHIEM]->(dt)
    OPTIONAL MATCH (gv_tv:GiangVien)-[:THAM_GIA]->(dt)
    OPTIONAL MATCH (tgn:TacGiaNgoai)-[:CHU_NHIEM|THAM_GIA|DONG_TAC_GIA]->(dt)
    WHERE coalesce(tgn.trang_thai, 'Đã duyệt') = 'Đã duyệt'
    RETURN dt,
           collect(DISTINCT gv_cn.ho_va_ten) AS chu_nhiem,
           collect(DISTINCT gv_tv.ho_va_ten) AS thanh_vien,
           collect(DISTINCT tgn.ho_va_ten)   AS tac_gia_ngoai
    ORDER BY CASE WHEN dt.trang_thai IN ['Chờ duyệt', 'Yêu cầu xóa', 'Yêu cầu đổi trạng thái'] THEN 0 ELSE 1 END ASC,
             toInteger(dt.nam) DESC,
             coalesce(dt.created_at, 0) DESC,
             id(dt) DESC
    ```

---

### CHỨC NĂNG 8: XEM THỐNG KÊ TỔNG QUAN NGHIÊN CỨU KHOA HỌC (ACADEMIC STATISTICS)

#### 1. Mô tả chức năng
Cung cấp số liệu thống kê trực quan về hoạt động nghiên cứu khoa học dưới dạng số đếm tổng quan và các biểu đồ phân tích (sử dụng thư viện **Chart.js**):
*   Số lượng Giảng viên, Đề tài, Công trình, Bộ môn.
*   Biểu đồ công trình và đề tài qua các năm.
*   Tỷ lệ học vị giảng viên (Tiến sĩ, Thạc sĩ, PGS, GS).
*   Thống kê số lượng giảng viên thuộc các bộ môn.
*   Top giảng viên có nhiều công trình nhất.
*   Danh sách đề tài đang thực hiện và bài báo mới xuất bản.

#### 2. Cách chức năng hoạt động (Kịch bản kiểm thử)
*   **Bước 1:** Truy cập trang Thống kê (`statistics.html`).
*   **Bước 2:** Quan sát các con số tổng và các biểu đồ hiển thị trên trang.
*   **Kết quả kỳ vọng:**
    *   Các con số tổng quan (Số giảng viên, Số công trình...) hiển thị đúng và khớp với dữ liệu thực tế trong Neo4j.
    *   Các biểu đồ (Chart.js) kết xuất mượt mà, đầy đủ chú giải, tương tác rê chuột (hover tooltip) hiển thị đúng số liệu chi tiết.
    *   Đề tài và công trình đã xóa mềm không được tính vào số liệu thống kê.

#### 3. Luồng hoạt động (Workflow)
1.  Khách vãng lai truy cập trang Thống kê.
2.  Frontend gửi yêu cầu `GET /api/stats/overview` tới Backend.
3.  Backend chạy đồng thời các câu lệnh Cypher để đếm số lượng các thực thể và gom nhóm dữ liệu (theo năm, theo học vị, theo bộ môn, tính top giảng viên).
4.  Backend trả về cấu trúc JSON tổng hợp các trường số liệu và mảng dữ liệu biểu đồ.
5.  Frontend sử dụng thư viện Chart.js để vẽ các biểu đồ hình cột, hình tròn, đường thẳng tương ứng lên canvas.

#### 4. Code & Query chi tiết
*   **Frontend HTML:** [statistics.html](file:///d:/research-graph-system/frontend/user/statistics.html)
*   **Frontend JS:** [statistics.js](file:///d:/research-graph-system/frontend/js/user/statistics.js)
*   **Backend File:** [api.py](file:///d:/research-graph-system/backend/routes/api.py)
*   **Hàm xử lý chính:** `get_overview_stats()` (Route: `/api/stats/overview`)
*   **Các câu truy vấn Cypher chính:**
    *   *Thống kê tổng số lượng:*
        ```cypher
        MATCH (n:GiangVien) WHERE coalesce(n.is_deleted, false) = false RETURN count(n) AS count
        ```
    *   *Top giảng viên theo số công trình:*
        ```cypher
        MATCH (gv:GiangVien)-[:LA_TAC_GIA_CUA|TAC_GIA_CHINH|CONG_SU]->(ct:CongTrinhNghienCuu)
        WHERE coalesce(gv.is_deleted, false) = false AND coalesce(ct.is_deleted, false) = false
        RETURN gv.ho_va_ten AS ten, gv.id AS id, count(ct) AS so_cong_trinh
        ORDER BY so_cong_trinh DESC LIMIT 10
        ```
    *   *Thống kê theo học vị:*
        ```cypher
        MATCH (gv:GiangVien)
        WHERE gv.hoc_vi IS NOT NULL AND coalesce(gv.is_deleted, false) = false
        RETURN gv.hoc_vi AS hoc_vi, count(gv) AS so_luong
        ORDER BY so_luong DESC
        ```
    *   *Thống kê theo bộ môn:*
        ```cypher
        MATCH (gv:GiangVien)-[:THUOC_BO_MON]->(bm:BoMon)
        WHERE coalesce(gv.is_deleted, false) = false
        RETURN bm.ten_bo_mon AS bo_mon, count(gv) AS so_luong
        ORDER BY so_luong DESC
        ```
