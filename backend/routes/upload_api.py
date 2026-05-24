import os
import uuid
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename

upload_api_bp = Blueprint('upload_api', __name__)

# Base directories for uploads
UPLOAD_FOLDER_PDF = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'frontend', 'uploads', 'pdfs')
UPLOAD_FOLDER_IMG = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'frontend', 'uploads', 'avatars')

# Ensure the upload folders exist
os.makedirs(UPLOAD_FOLDER_PDF, exist_ok=True)
os.makedirs(UPLOAD_FOLDER_IMG, exist_ok=True)

ALLOWED_PDF_EXTENSIONS = {'pdf'}
ALLOWED_IMG_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_pdf(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_PDF_EXTENSIONS

def allowed_img(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_IMG_EXTENSIONS

@upload_api_bp.route('/pdf', methods=['POST'])
def upload_pdf():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "Không có tệp được chọn"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "Không có tệp được chọn"}), 400
        
    if file and file.filename and allowed_pdf(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER_PDF, unique_filename)
        
        file.save(file_path)
        
        file_url = f"/uploads/pdfs/{unique_filename}"
        return jsonify({
            "status": "success", 
            "message": "Tải lên thành công",
            "url": file_url
        }), 200
        
    return jsonify({"status": "error", "message": "Định dạng tệp không được hỗ trợ. Vui lòng tải lên tệp PDF."}), 400

@upload_api_bp.route('/image', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "Không có tệp hình ảnh"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "Không có tệp hình ảnh"}), 400
        
    if file and file.filename and allowed_img(file.filename):
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4()}_{filename}"
        file_path = os.path.join(UPLOAD_FOLDER_IMG, unique_filename)
        
        file.save(file_path)
        
        file_url = f"/uploads/avatars/{unique_filename}"
        return jsonify({
            "status": "success", 
            "message": "Tải lên thành công",
            "url": file_url
        }), 200
        
    return jsonify({"status": "error", "message": "Định dạng ảnh không được hỗ trợ. Hỗ trợ png, jpg, jpeg, gif, webp."}), 400

