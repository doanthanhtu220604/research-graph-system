"""
Script: Dich ten cong trinh tu tieng Anh -> tieng Viet
Xu ly cac cong trinh co ten_cong_trinh_vi trong hoac None.

Chay: python -m scripts.migrate_fill_vietnamese_names
"""

import os
import sys
import time
import unicodedata
import re
import requests

sys.stdout.reconfigure(encoding="utf-8") if hasattr(sys.stdout, "reconfigure") else None

project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, project_root)

from dotenv import load_dotenv
load_dotenv(os.path.join(project_root, ".env"))

from backend.services.neo4j_connection import get_neo4j_connection


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


def translate_en_to_vi(text: str) -> str:
    """Dịch tiếng Anh → tiếng Việt qua Google Translate public API."""
    if not text or not text.strip():
        return text
    try:
        url = "https://translate.googleapis.com/translate_a/single"
        params = {
            "client": "gtx",
            "sl": "en",
            "tl": "vi",
            "dt": "t",
            "q": text,
        }
        headers = {"User-Agent": "Mozilla/5.0"}
        resp = requests.get(url, params=params, headers=headers, timeout=10)
        resp.raise_for_status()
        data = resp.json()
        translated = "".join(part[0] for part in data[0] if part[0])
        return translated.strip()
    except Exception as e:
        print(f"    [WARN] Lỗi dịch: {e} — giữ nguyên")
        return ""


def main():
    conn = get_neo4j_connection()

    # Lấy tất cả công trình mà ten_cong_trinh_vi rỗng hoặc None
    publications = conn.query("""
        MATCH (ct:CongTrinhNghienCuu)
        WHERE coalesce(ct.is_deleted, false) = false
          AND (ct.ten_cong_trinh_vi IS NULL OR trim(ct.ten_cong_trinh_vi) = '')
        RETURN ct.id AS id, ct.ten_cong_trinh AS ten_en
        ORDER BY ct.id
    """)

    total = len(publications)
    print(f"\n{'='*60}")
    print(f"  Tong so cong trinh can dich sang tieng Viet: {total}")
    print(f"{'='*60}\n")

    if total == 0:
        print("Tat ca cong trinh da co ten tieng Viet. Khong can xu ly them.")
        return

    success = 0
    skipped = 0
    errors = []

    for i, pub in enumerate(publications, 1):
        ct_id = pub["id"]
        ten_en = (pub["ten_en"] or "").strip()

        print(f"[{i}/{total}] {ct_id}: {ten_en[:75]}...")

        if not ten_en:
            print("    → Bo qua: khong co ten tieng Anh.")
            skipped += 1
            continue

        # Dịch sang tiếng Việt
        ten_vi = translate_en_to_vi(ten_en)

        if not ten_vi:
            print("    → Khong dich duoc, bo qua.")
            skipped += 1
            time.sleep(0.3)
            continue

        # Title-case nhẹ (giữ nguyên, không upper)
        ten_vi = " ".join(ten_vi.split())
        slug_vi = generate_slug(ten_vi)

        print(f"    → VI: {ten_vi[:75]}")

        try:
            # Kiểm tra trùng slug_vi (tránh conflict)
            existing = conn.query_single("""
                MATCH (ct:CongTrinhNghienCuu)
                WHERE ct.slug_vi = $slug_vi AND ct.id <> $id
                  AND coalesce(ct.is_deleted, false) = false
                RETURN ct.id AS dup_id
            """, {"slug_vi": slug_vi, "id": ct_id})

            if existing:
                slug_vi = f"{slug_vi}-{ct_id}"
                print(f"    [WARN] Slug VI trung -> dung: {slug_vi}")

            conn.write("""
                MATCH (ct:CongTrinhNghienCuu) WHERE ct.id = $id
                SET ct.ten_cong_trinh_vi = $ten_vi,
                    ct.slug_vi           = $slug_vi
            """, {"id": ct_id, "ten_vi": ten_vi, "slug_vi": slug_vi})

            success += 1
            print(f"    OK Da cap nhat")

        except Exception as e:
            errors.append(f"{ct_id}: {e}")
            print(f"    LOI: {e}")

        # Nghỉ nhẹ tránh rate-limit
        time.sleep(0.3)

    print(f"\n{'='*60}")
    print(f"  Ket qua:")
    print(f"    OK Dich thanh cong : {success}")
    print(f"    -> Bo qua          : {skipped}")
    print(f"    LOI                : {len(errors)}")
    if errors:
        print(f"\n  Chi tiet loi:")
        for err in errors:
            print(f"    - {err}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
