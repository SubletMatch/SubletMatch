from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from ..config import settings
import os

class EmailService:
    def __init__(self):
        self.sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        self.from_email = os.getenv('SENDGRID_FROM_EMAIL', 'noreply@sublet.com')

    async def send_password_reset_email(self, to_email: str, reset_link: str):
        subject = "Reset Your Password"
        content = f"""
        <html>
            <body>
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password. Click the link below to set a new password:</p>
                <p><a href="{reset_link}">Reset Password</a></p>
                <p>If you didn't request this, you can safely ignore this email.</p>
                <p>This link will expire in 1 hour.</p>
            </body>
        </html>
        """
        
        message = Mail(
            from_email=self.from_email,
            to_emails=to_email,
            subject=subject,
            html_content=content
        )
        
        try:
            response = self.sg.send(message)
            return response.status_code == 202
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False

email_service = EmailService() 