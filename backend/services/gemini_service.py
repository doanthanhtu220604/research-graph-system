"""
GeminiService — Rule-grounded LLM + Conversation Context
=========================================================
Kiến trúc:
  1. RULES (chat_intents.json) → tự động đọc và nhúng vào prompt Gemini
     → AI luôn phân tích đúng theo từ khóa đã định nghĩa, không cần hardcode
  2. CONTEXT (conversation history) → truyền lịch sử hội thoại vào prompt
     → AI hiểu câu hỏi tiếp theo có ngữ cảnh từ câu trước
  3. Kết hợp RULES + CONTEXT → kết quả phân tích intent chính xác hơn
"""
import os
import json
from pathlib import Path
import google.generativeai as genai
from typing import Optional, Dict, Any, List

# ── Load rules từ chat_intents.json một lần khi khởi động ────────────────────
_CONFIG_PATH = Path(__file__).parent.parent / "config" / "chat_intents.json"
try:
    with open(_CONFIG_PATH, "r", encoding="utf-8") as f:
        _CHAT_CONFIG = json.load(f)
except Exception:
    _CHAT_CONFIG = {"intents": {}, "keywords": {}}


def _build_intent_rules_block() -> str:
    """Chuyển chat_intents.json thành block mô tả rules cho Gemini prompt.
    
    Mỗi lần `chat_intents.json` được cập nhật, Gemini tự động nhận rules mới
    mà không cần sửa code.
    """
    intents = _CHAT_CONFIG.get("intents", {})
    lines = []
    # Mô tả ngắn gọn từng intent (human-readable)
    _DESCRIPTIONS = {
        "statistics":       "thống kê số lượng (giảng viên, công trình, đề tài...)",
        "collaboration":    "tìm mối quan hệ hợp tác giữa các giảng viên",
        "department":       "hỏi về bộ môn, danh sách GV trong bộ môn",
        "project_by_level": "tìm đề tài theo cấp (Bộ, Tỉnh, Trường...)",
        "search_by_field":  "tìm theo lĩnh vực nghiên cứu (AI, ML, IoT...)",
        "search_lecturer":  "tìm giảng viên theo tên hoặc học vị",
        "search_publication":"tìm bài báo / công trình nghiên cứu",
        "search_project":   "tìm đề tài nghiên cứu",
        "top_lecturers":    "xếp hạng GV theo số công trình (nhiều nhất HOẶC ít nhất)",
        "top_by_projects":  "xếp hạng GV theo số đề tài (nhiều nhất HOẶC ít nhất)",
        "who_leads":        "hỏi chủ nhiệm của một đề tài cụ thể",
        "lecturer_info":    "hỏi thông tin cá nhân (email, học vị) của GV",
        "unknown":          "câu hỏi không rõ ý định",
    }
    for intent_name, keywords in intents.items():
        desc = _DESCRIPTIONS.get(intent_name, intent_name)
        kw_sample = ", ".join(f'"{k}"' for k in keywords[:6])
        lines.append(f'- {intent_name}: {desc}\n  Từ khóa nhận diện: {kw_sample}')
    return "\n".join(lines)


def _build_context_block(history: List[Dict]) -> str:
    """Chuyển lịch sử hội thoại thành block context cho Gemini prompt.
    
    history = [{"role": "user"|"assistant", "content": "..."}, ...]
    Chỉ lấy tối đa 6 turn gần nhất để tránh token quá lớn.
    """
    if not history:
        return ""
    recent = history[-6:]  # 6 turn gần nhất
    lines = ["=== LỊCH SỬ HỘI THOẠI GẦN ĐÂY ==="]
    for turn in recent:
        role = "Người dùng" if turn.get("role") == "user" else "Trợ lý"
        lines.append(f'{role}: {turn.get("content", "")[:200]}')
    lines.append("=== KẾT THÚC LỊCH SỬ ===")
    return "\n".join(lines)


class GeminiService:
    """
    Rule-grounded LLM Service với Conversation Context.
    
    - Rules: tự động đọc từ chat_intents.json
    - Context: nhận lịch sử hội thoại để hiểu câu hỏi follow-up
    - Key Rotation: xoay vòng API key khi gặp lỗi quota
    """

    def __init__(self):
        use_gemini = os.getenv("USE_GEMINI", "true").lower() in ("true", "1", "yes")
        raw_keys = os.getenv("GEMINI_API_KEY", "") if use_gemini else ""
        self.api_keys = [k.strip() for k in raw_keys.split(",") if k.strip()]
        self.current_key_index = 0
        self.model: Optional[genai.GenerativeModel] = None

        if self.api_keys:
            genai.configure(api_key=self.api_keys[0])
            model_name = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
            self.model = genai.GenerativeModel(model_name)
            print(f"[Gemini] Model '{model_name}' | {len(self.api_keys)} key(s) | "
                  f"{len(_CHAT_CONFIG.get('intents', {}))} intents loaded from config.")

    def is_available(self) -> bool:
        return self.model is not None

    def should_rewrite(self) -> bool:
        return os.getenv("REWRITE_WITH_GEMINI", "false").lower() in ("true", "1", "yes")

    def rotate_key(self) -> bool:
        if not self.api_keys or len(self.api_keys) <= 1:
            return False
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        next_key = self.api_keys[self.current_key_index]
        genai.configure(api_key=next_key)
        model_name = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
        self.model = genai.GenerativeModel(model_name)
        print(f"[Gemini Key Rotation] Switched to key index {self.current_key_index}.")
        return True

    def _call_gemini(self, prompt: str) -> Optional[str]:
        """Gọi Gemini với cơ chế xoay vòng key khi gặp lỗi."""
        if not self.model or not self.api_keys:
            return None
        for attempt in range(len(self.api_keys)):
            try:
                response = self.model.generate_content(
                    prompt, request_options={"timeout": 12.0}
                )
                return response.text.strip()
            except Exception as e:
                print(f"[Gemini] Key {self.current_key_index}, attempt {attempt+1}: {e}")
                if len(self.api_keys) > 1:
                    self.rotate_key()
                else:
                    break
        return None

    def analyze_question(
        self,
        question: str,
        history: Optional[List[Dict]] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Phân tích câu hỏi dùng RULES từ chat_intents.json + CONTEXT lịch sử hội thoại.

        Đây là cách hoạt động:
        1. Tự động đọc rules (intent + từ khóa) từ chat_intents.json
        2. Nhúng rules + lịch sử hội thoại vào prompt Gemini
        3. Gemini kết hợp rules + context để nhận diện intent chính xác

        Tham số:
            question: câu hỏi hiện tại của người dùng
            history: danh sách các turn hội thoại trước (role + content)

        Trả về: dict {intent, entities, explanation} hoặc None nếu lỗi
        """
        if not self.model:
            return None

        from datetime import datetime
        current_year = datetime.now().year

        # ── Bước 1: Build rules block từ chat_intents.json ───────────────
        rules_block = _build_intent_rules_block()

        # ── Bước 2: Build context block từ lịch sử hội thoại ─────────────
        context_block = _build_context_block(history or [])

        # ── Bước 3: Build prompt kết hợp RULES + CONTEXT + câu hỏi ───────
        prompt = f"""Bạn là AI phân tích câu hỏi cho hệ thống Quản lý Nghiên cứu Khoa học Khoa CNTT.
Năm hiện tại: {current_year}.

=== LUẬT PHÂN LOẠI (Rules từ cấu hình hệ thống) ===
{rules_block}
- unknown: câu hỏi không khớp bất kỳ intent nào ở trên

{context_block}

=== CÂU HỎI HIỆN TẠI ===
"{question}"

=== HƯỚNG DẪN ===
1. Dùng LUẬT PHÂN LOẠI ở trên để xác định intent phù hợp nhất.
2. Nếu có LỊCH SỬ HỘI THOẠI, hãy dùng ngữ cảnh đó để hiểu câu hỏi follow-up.
   VD: Nếu trước đó hỏi về "thầy Hưng" và bây giờ hỏi "thầy đó có mấy công trình" → name vẫn là "Nguyễn Đình Hưng".
3. Xác định đúng các entities từ câu hỏi (kết hợp cả context nếu cần).

=== OUTPUT (chỉ trả về JSON, không có text nào khác) ===
{{
  "intent": "<tên intent>",
  "entities": {{
    "name": "<tên người nếu có (có thể từ context), null nếu không>",
    "field": "<lĩnh vực nghiên cứu nếu có, null nếu không>",
    "year": <số năm nếu có — 'năm nay'={current_year}, null nếu không>,
    "department": "<tên bộ môn nếu có, null nếu không>",
    "project_level": "<cấp đề tài nếu có, null nếu không>",
    "project_name": "<tên đề tài nếu có, null nếu không>",
    "journal": "<tên tạp chí/hội thảo nếu có, null nếu không>",
    "order": "<'asc' nếu hỏi ÍT nhất/thấp nhất, 'desc' nếu hỏi NHIỀU nhất/cao nhất, null nếu không xếp hạng>",
    "limit": <số lượng kết quả nếu có VD 'top 5'→5, null nếu không>
  }},
  "explanation": "<giải thích ngắn tại sao chọn intent này>"
}}"""

        text = self._call_gemini(prompt)
        if not text:
            return None

        try:
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0].strip()
            elif "```" in text:
                text = text.split("```")[1].strip()
            return json.loads(text)
        except Exception as e:
            print(f"[Gemini Parse Error] {e}. Raw: {text[:200]}")
            return None

    def generate_natural_answer(
        self,
        question: str,
        search_result: str,
        history: Optional[List[Dict]] = None
    ) -> Optional[str]:
        """
        Viết lại kết quả database thành câu trả lời tự nhiên tiếng Việt.
        Nhận ngữ cảnh lịch sử hội thoại để câu trả lời mạch lạc hơn.
        QUAN TRỌNG: Giữ nguyên tất cả link javascript:show...Detail('id').
        """
        if not self.model:
            return None

        context_block = _build_context_block(history or [])

        prompt = f"""Bạn là trợ lý AI của hệ thống Quản lý Nghiên cứu Khoa học Khoa CNTT.

{context_block}

Câu hỏi hiện tại: "{question}"

Kết quả tra cứu từ database:
\"\"\"
{search_result}
\"\"\"

Nhiệm vụ:
1. Biên soạn câu trả lời tiếng Việt tự nhiên, thân thiện, mạch lạc — có tính đến ngữ cảnh hội thoại trước nếu có.
2. Dùng Markdown với emoji phù hợp (in đậm, danh sách gạch đầu dòng).
3. TUYỆT ĐỐI GIỮ NGUYÊN link [Tên](javascript:show...Detail('id')) — không được thay đổi URL.
4. KHÔNG bịa thêm dữ liệu ngoài kết quả database.
5. Nếu không có kết quả, thông báo lịch sự và gợi ý thử từ khóa khác."""

        return self._call_gemini(prompt)

    def translate(self, text: str, target_lang: str = "vi") -> Optional[str]:
        """Dịch văn bản sang ngôn ngữ đích."""
        if not self.model:
            return None
        prompt = f"""Dịch đoạn văn bản sau sang {target_lang}.
Yêu cầu: dịch sát nghĩa chuyên ngành CNTT, giữ định dạng, chỉ trả về bản dịch.
Văn bản:
'''{text}'''"""
        return self._call_gemini(prompt)


# Singleton
gemini_service = GeminiService()
