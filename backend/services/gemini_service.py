import os
import google.generativeai as genai
from typing import Optional, Dict, Any

class GeminiService:
    """Service to interact with Google Gemini API for advanced NLP."""
    
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model: Optional[genai.GenerativeModel] = None
        if self.api_key:
            genai.configure(api_key=self.api_key)
            # Use gemini-3-flash-preview to match environment availability
            self.model = genai.GenerativeModel('gemini-3-flash-preview')

    def is_available(self) -> bool:
        return self.model is not None

    def analyze_question(self, question: str) -> Optional[Dict[str, Any]]:
        """
        Analyzes the question using Gemini to extract intent and entities.
        Returns a dictionary with 'intent', 'entities', and 'explanation'.
        """
        if not self.model:
            return None

        from datetime import datetime
        current_year = datetime.now().year

        prompt = f"""
        Bạn là một trợ lý thông minh cho hệ thống Quản lý Nghiên cứu Khoa học của Khoa CNTT.
        Nhiệm vụ của bạn là phân tích câu hỏi của người dùng và trích xuất Intent và các thực thể (Entities).
        Năm hiện tại là {current_year}.

        Hệ thống có các Intent sau:
        - statistics: Thống kê số lượng (giảng viên, đề tài, công trình...).
        - collaboration: Tìm mối quan hệ hợp tác giữa các giảng viên.
        - department: Hỏi về bộ môn hoặc danh sách giảng viên trong bộ môn.
        - project_by_level: Tìm đề tài theo cấp (Bộ, Tỉnh, Trường...).
        - search_by_field: Tìm giảng viên hoặc công trình theo lĩnh vực nghiên cứu (AI, Machine Learning...).
        - search_lecturer: Tìm kiếm thông tin giảng viên theo tên hoặc học vị.
        - search_publication: Tìm kiếm bài báo, công trình nghiên cứu (kể cả khi có từ 'năm nay', 'năm {current_year}', 'gần đây').
        - search_project: Tìm kiếm đề tài nghiên cứu.
        - top_lecturers: Xếp hạng, top giảng viên nổi bật theo số công trình.
        - top_by_projects: Xếp hạng, top giảng viên theo số đề tài chủ nhiệm.
        - who_leads: Hỏi về chủ nhiệm của một đề tài nào đó.
        - lecturer_info: Hỏi thông tin chi tiết (email, liên hệ) của một giảng viên cụ thể.
        - unknown: Không hiểu câu hỏi.

        Lưu ý quan trọng về entities:
        - Nếu câu hỏi có "năm nay", "năm hiện tại", "năm này", "hiện nay" → entity "year" = "{current_year}"
        - Nếu câu hỏi về "các công trình", "danh sách công trình", "bài báo" → intent = "search_publication"
        - Nếu câu hỏi về "top", "nhiều nhất" + công trình → intent = "top_lecturers"
        - Nếu câu hỏi về "top", "nhiều nhất" + đề tài → intent = "top_by_projects"

        Câu hỏi của người dùng: "{question}"

        Hãy trả về kết quả dưới dạng JSON với cấu trúc:
        {{
            "intent": "tên_intent",
            "entities": {{
                "name": "tên người nếu có, null nếu không",
                "field": "lĩnh vực nghiên cứu nếu có, null nếu không",
                "year": "năm dạng số nếu có (vd: {current_year}), null nếu không",
                "department": "tên bộ môn nếu có, null nếu không",
                "project_level": "cấp đề tài nếu có, null nếu không",
                "project_name": "tên đề tài nếu có, null nếu không"
            }},
            "explanation": "giải thích ngắn gọn tại sao chọn intent này"
        }}
        Chỉ trả về JSON, không kèm văn bản khác.
        """

        try:
            response = self.model.generate_content(prompt)
            # Extract JSON from response
            text = response.text.strip()
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].strip()
            
            import json
            return json.loads(text)
        except Exception as e:
            print(f"[Gemini Error] {e}")
            return None

    def generate_natural_answer(self, question: str, search_result: str) -> Optional[str]:
        """
        Dùng Gemini để viết lại câu trả lời thô (từ các handler) thành câu trả lời tự nhiên, trôi chảy.
        """
        if not self.model:
            return None

        prompt = f"""
        Bạn là một trợ lý thông minh cho hệ thống Quản lý Nghiên cứu Khoa học của Khoa CNTT.
        Người dùng đã hỏi câu hỏi sau: "{question}"
        
        Dưới đây là kết quả tra cứu được từ cơ sở dữ liệu (dạng thô/markdown):
        \"\"\"
        {search_result}
        \"\"\"

        Nhiệm vụ của bạn:
        1. Dựa trên kết quả tra cứu trên, hãy biên soạn lại thành một câu trả lời bằng tiếng Việt tự nhiên, thân thiện và mạch lạc.
        2. Nếu kết quả tra cứu cho thấy không tìm thấy dữ liệu hoặc lỗi, hãy thông báo lịch sự và gợi ý hướng xử lý thích hợp cho người dùng (ví dụ: gợi ý từ khóa tìm kiếm khác).
        3. Định dạng câu trả lời bằng Markdown sinh động (sử dụng in đậm, danh sách gạch đầu dòng, icon/emoji phù hợp) để dễ đọc.
        4. CỰC KỲ QUAN TRỌNG: GIỮ NGUYÊN các liên kết Markdown có sẵn trong kết quả tra cứu dạng [Tên hiển thị](javascript:showLecturerDetail('id')), [Tên công trình](javascript:showPublicationDetail('id')), [Tên đề tài](javascript:showProjectDetail('id')) để đảm bảo các tính năng click xem chi tiết trên giao diện web hoạt động bình thường. Không được thay đổi phần URL 'javascript:show...'.
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"[Gemini Generate Answer Error] {e}")
            return None

    def translate(self, text: str, target_lang: str = "vi") -> Optional[str]:
        """
        Translates text to target language using Gemini.
        Handles much longer text than free MyMemory API.
        """
        if not self.model:
            return None

        prompt = f"""
        Nhiệm vụ: Dịch đoạn văn bản sau sang {target_lang}.
        Yêu cầu:
        1. Giữ nguyên định dạng (nếu có).
        2. Dịch sát nghĩa chuyên ngành (Công nghệ thông tin, nghiên cứu khoa học).
        3. Không thêm bất kỳ văn bản nào khác ngoài bản dịch.

        Văn bản cần dịch:
        '''
        {text}
        '''
        """

        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            print(f"[Gemini Translate Error] {e}")
            return None

# Singleton instance
gemini_service = GeminiService()
