"""
Email Service - Dịch vụ gửi email cho Knowledge Map.
Sử dụng Gmail SMTP với App Password để gửi email khôi phục mật khẩu.
"""

import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


def send_reset_password_email(recipient_email: str, reset_link: str, user_name: str = None) -> bool:
    """
    Gửi email chứa link khôi phục mật khẩu.
    
    Args:
        recipient_email: Địa chỉ email người nhận
        reset_link: Đường link reset password có kèm token
        user_name: Tên người dùng (tùy chọn)
    
    Returns:
        True nếu gửi thành công, False nếu thất bại
    """
    mail_server = os.getenv("MAIL_SERVER", "smtp.gmail.com")
    mail_port = int(os.getenv("MAIL_PORT", 587))
    mail_username = os.getenv("MAIL_USERNAME", "")
    mail_password = os.getenv("MAIL_PASSWORD", "")
    mail_sender = os.getenv("MAIL_DEFAULT_SENDER", mail_username)

    if not mail_username or not mail_password or "your-email" in mail_username:
        print("[EMAIL] Cấu hình email chưa được thiết lập trong .env")
        return False

    greeting = f"Kính chào {user_name}," if user_name else "Kính chào,"

    html_body = f"""
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: 'Inter', Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 20px; }}
        .container {{ max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }}
        .header {{ background: linear-gradient(135deg, #4F8EF7, #3b82f6); padding: 36px 30px; text-align: center; }}
        .header i {{ font-size: 40px; color: white; }}
        .header h1 {{ color: white; font-size: 22px; margin: 12px 0 4px; }}
        .header p {{ color: rgba(255,255,255,0.8); font-size: 13px; margin: 0; }}
        .body {{ padding: 32px 30px; color: #334155; }}
        .body p {{ line-height: 1.7; font-size: 15px; margin-bottom: 16px; }}
        .btn-reset {{ display: block; width: fit-content; margin: 24px auto; padding: 14px 32px; background: linear-gradient(135deg, #4F8EF7, #3b82f6); color: white; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; text-align: center; }}
        .note {{ background: #f8fafc; border-left: 3px solid #4F8EF7; padding: 12px 16px; border-radius: 0 8px 8px 0; font-size: 13px; color: #64748b; }}
        .link-box {{ background: #f1f5f9; border-radius: 8px; padding: 10px 14px; font-size: 12px; color: #64748b; word-break: break-all; margin-top: 8px; }}
        .footer {{ text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; background: #f8fafc; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔑 Khôi phục mật khẩu</h1>
            <p>Bản đồ tri thức - Khoa CNTT, ĐH Nha Trang</p>
        </div>
        <div class="body">
            <p>{greeting}</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn trên hệ thống <strong>Knowledge Map</strong>. Nhấn vào nút bên dưới để tạo mật khẩu mới:</p>
            
            <a href="{reset_link}" class="btn-reset">🔐 Đặt lại mật khẩu</a>
            
            <div class="note">
                ⏰ <strong>Lưu ý:</strong> Liên kết này chỉ có hiệu lực trong vòng <strong>15 phút</strong>. 
                Sau thời gian đó, bạn cần thực hiện lại yêu cầu.
            </div>
            
            <p style="margin-top:20px; font-size:13px; color:#64748b;">Nếu nút trên không hoạt động, hãy sao chép và dán đường dẫn sau vào trình duyệt:</p>
            <div class="link-box">{reset_link}</div>
            
            <p style="margin-top:24px; font-size:13px; color:#94a3b8;">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
        </div>
        <div class="footer">
            &copy; 2024 Knowledge Map - Khoa Công nghệ Thông tin, ĐH Nha Trang
        </div>
    </div>
</body>
</html>
"""

    text_body = f"""
{greeting}

Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Knowledge Map.

Truy cập đường link sau để đặt lại mật khẩu (hết hạn sau 15 phút):
{reset_link}

Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.

Trân trọng,
Knowledge Map - Khoa CNTT, ĐH Nha Trang
"""

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = "🔑 [Knowledge Map] Yêu cầu đặt lại mật khẩu"
        msg["From"] = mail_sender
        msg["To"] = recipient_email

        msg.attach(MIMEText(text_body, "plain", "utf-8"))
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        with smtplib.SMTP(mail_server, mail_port) as server:
            server.ehlo()
            server.starttls()
            server.login(mail_username, mail_password)
            server.sendmail(mail_username, recipient_email, msg.as_string())

        print(f"[EMAIL] Đã gửi email khôi phục tới: {recipient_email}")
        return True

    except smtplib.SMTPAuthenticationError:
        print("[EMAIL] Lỗi xác thực SMTP. Kiểm tra lại MAIL_USERNAME và MAIL_PASSWORD trong .env")
        return False
    except smtplib.SMTPException as e:
        print(f"[EMAIL] Lỗi SMTP: {e}")
        return False
    except Exception as e:
        print(f"[EMAIL] Lỗi không xác định: {e}")
        return False
