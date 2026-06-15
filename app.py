import os
import sys
from dotenv import load_dotenv

# Thêm thư mục gốc vào Python path và load .env
project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)
load_dotenv(os.path.join(project_root, ".env"))

from backend.app import create_app

# Khởi tạo đối tượng app phục vụ cho Render / Gunicorn
app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
