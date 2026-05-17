import os
import uuid
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

upload_api_bp = Blueprint('upload_api', __name__)

# Base directory for uploads (assumes frontend folder is alongside backend folder)
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'frontend', 'uploads', 'pdfs')

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_api_bp.route('/pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "Không có tệp được chọn"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "Không có tệp được chọn"}), 400
        
    if file and file.filename and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        # Create a unique filename to avoid overwriting
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
        
        file.save(file_path)
        
        # Return the URL path to access the file
        file_url = f"/uploads/pdfs/{unique_filename}"
        
        return jsonify({
            "status": "success", 
            "message": "Tải lên thành công",
            "url": file_url
        }), 200
        
    return jsonify({"status": "error", "message": "Định dạng tệp không được hỗ trợ. Vui lòng tải lên tệp PDF."}), 400
