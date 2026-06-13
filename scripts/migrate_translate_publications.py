"""
Script migration: Dich ten cong trinh tu tieng Viet -> tieng Anh
- ten_cong_trinh  : ten tieng Anh (UPPERCASE)
- ten_cong_trinh_vi: ten tieng Viet goc
- slug   : slug cua ten tieng Anh
- slug_vi: slug cua ten tieng Viet

Chay: python -m scripts.migrate_translate_publications
"""

import os
import sys
import time
import unicodedata
import re
import requests

# Fix encoding tren Windows
sys.stdout.reconfigure(encoding="utf-8") if hasattr(sys.stdout, "reconfigure") else None

# Thêm thư mục gốc vào path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, project_root)

from dotenv import load_dotenv
load_dotenv(os.path.join(project_root, ".env"))

from backend.services.neo4j_connection import get_neo4j_connection


# ─── Slug generator (giống generate_slug trong app) ────────────────────────
def generate_slug(text: str) -> str:
    if not text:
        return ""
    text = text.lower().strip()
    text = unicodedata.normalize("NFD", text)
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    text = text.replace("đ", "d").replace("Đ", "d")
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"\s+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text.strip("-")


# ─── Dịch qua Google Translate (miễn phí, không cần key) ────────────────────
def translate_vi_to_en(text: str) -> str:
    """Dịch văn bản tiếng Việt sang tiếng Anh dùng Google Translate public API."""
    if not text or not text.strip():
        return text

    try:
        url = "https://translate.googleapis.com/translate_a/single"
        params = {
            "client": "gtx",
            "sl": "vi",
            "tl": "en",
            "dt": "t",
            "q": text,
        }
        headers = {
            "User-Agent": "Mozilla/5.0"
        }
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        # Ghép các đoạn được dịch lại
        translated = "".join(part[0] for part in data[0] if part[0])
        return translated.strip()
    except Exception as e:
        print(f"    [WARN] Lỗi dịch: {e} — giữ nguyên tên gốc")
        return text


# ─── Kiểm tra văn bản có phải tiếng Việt không ─────────────────────────────
def is_likely_vietnamese(text: str) -> bool:
    """Kiểm tra đơn giản: có ký tự dấu tiếng Việt không."""
    viet_chars = set("àáâãăắằẳẵặấầẩẫậèéêếềểễệìíîïòóôõơớờởỡợúùưứừửữựỳýỷỹỵđ"
                     "ÀÁÂÃĂẮẰẲẴẶẤẦẨẪẬÈÉÊẾỀỂỄỆÌÍÎÏÒÓÔÕƠỚỜỞỠỢÚÙƯỨỪỬỮỰỲÝỶỸỴĐ")
    return any(c in viet_chars for c in text)


# ─── Main migration ──────────────────────────────────────────────────────────
def main():
    conn = get_neo4j_connection()

    # Lấy tất cả công trình chưa có ten_cong_trinh_vi
    # (hoặc có ten_cong_trinh_vi rỗng) và chưa bị xóa
    publications = conn.query("""
        MATCH (ct:CongTrinhNghienCuu)
        WHERE coalesce(ct.is_deleted, false) = false
          AND (ct.ten_cong_trinh_vi IS NULL OR ct.ten_cong_trinh_vi = '')
        RETURN ct.id AS id, ct.ten_cong_trinh AS ten
        ORDER BY ct.id
    """)

    total = len(publications)
    print(f"\n{'='*60}")
    print(f"  Tổng số công trình cần xử lý: {total}")
    print(f"{'='*60}\n")

    if total == 0:
        print("✓ Không có công trình nào cần dịch.")
        return

    success = 0
    skipped = 0
    errors = []

    for i, pub in enumerate(publications, 1):
        ct_id = pub["id"]
        ten_goc = pub["ten"] or ""

        print(f"[{i}/{total}] {ct_id}: {ten_goc[:70]}...")

        # Nếu tên gốc trông như tiếng Anh → đặt ten_cong_trinh_vi = "" (không cần dịch ngược)
        if not is_likely_vietnamese(ten_goc):
            print(f"    → Có vẻ tiếng Anh rồi, bỏ qua dịch.")
            # Chỉ tạo slug_vi rỗng và giữ nguyên
            try:
                conn.write("""
                    MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id
                    SET ct.ten_cong_trinh_vi = '',
                        ct.slug_vi = ''
                """, {"id": ct_id})
                skipped += 1
            except Exception as e:
                errors.append(f"{ct_id}: {e}")
            continue

        # Dịch sang tiếng Anh
        ten_en = translate_vi_to_en(ten_goc)
        ten_en_upper = " ".join(ten_en.split()).upper()
        slug_en = generate_slug(ten_en)
        slug_vi = generate_slug(ten_goc)

        print(f"    → EN: {ten_en_upper[:70]}")

        try:
            # Kiểm tra trùng slug tiếng Anh (tránh conflict)
            existing = conn.query_single("""
                MATCH (ct:CongTrinhNghienCuu)
                WHERE ct.slug = $slug AND ct.id <> $id
                  AND coalesce(ct.is_deleted, false) = false
                RETURN ct.id AS dup_id
            """, {"slug": slug_en, "id": ct_id})

            if existing:
                # Thêm suffix là id để tránh trùng
                slug_en = f"{slug_en}-{ct_id}"
                print(f"    [WARN] Slug trùng → dùng: {slug_en}")

            conn.write("""
                MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id
                SET ct.ten_cong_trinh    = $ten_en,
                    ct.ten_cong_trinh_vi = $ten_vi,
                    ct.slug              = $slug,
                    ct.slug_vi           = $slug_vi
            """, {
                "id": ct_id,
                "ten_en": ten_en_upper,
                "ten_vi": ten_goc,
                "slug": slug_en,
                "slug_vi": slug_vi,
            })
            success += 1
            print(f"    ✓ Đã cập nhật")

        except Exception as e:
            errors.append(f"{ct_id}: {e}")
            print(f"    ✗ Lỗi: {e}")

        # Nghỉ 0.3s để không bị rate-limit Google
        time.sleep(0.3)

    print(f"\n{'='*60}")
    print(f"  Kết quả:")
    print(f"    ✓ Dịch thành công : {success}")
    print(f"    → Bỏ qua (đã EN) : {skipped}")
    print(f"    ✗ Lỗi            : {len(errors)}")
    if errors:
        print(f"\n  Chi tiết lỗi:")
        for err in errors:
            print(f"    - {err}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
