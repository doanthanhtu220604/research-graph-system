import pandas as pd
import os

def create_test_excel():
    # Dữ liệu test cho Giảng viên
    data = [
        {
            "ho_va_ten": "Giảng Viên Thử Nghiệm 1",
            "ma_gv": "TEST001",
            "hoc_vi": "Tiến sĩ",
            "chuc_vu": "Giảng viên",
            "email": "test001@ntu.edu.vn",
            "dien_thoai": "0123456789",
            "bo_mon": "Hệ thống thông tin",
            "linh_vuc_nghien_cuu": "Trí tuệ nhân tạo|Học máy"
        },
        {
            "ho_va_ten": "Giảng Viên Thử Nghiệm 2",
            "ma_gv": "TEST002",
            "hoc_vi": "Thạc sĩ",
            "chuc_vu": "Giảng viên",
            "email": "test002@ntu.edu.vn",
            "dien_thoai": "0987654321",
            "bo_mon": "Công nghệ phần mềm",
            "linh_vuc_nghien_cuu": "Phát triển Web|Di động"
        }
    ]
    
    df = pd.DataFrame(data)
    
    # Đảm bảo thư mục scratch tồn tại
    os.makedirs('scratch', exist_ok=True)
    
    file_path = 'scratch/test_import_giang_vien.xlsx'
    df.to_excel(file_path, index=False)
    print(f"Đã tạo file test tại: {file_path}")

if __name__ == '__main__':
    create_test_excel()
