import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from ..core.config import settings
import logging

def send_welcome_email(user_email: str, user_name: str) -> bool:
    message = Mail(
        from_email=settings.SENDGRID_FROM_EMAIL,
        to_emails=user_email,
        subject="Welcome to LeaseLink!",
        html_content=f"""
        <html>
        <body>
            <h2>Welcome to LeaseLink, {user_name}!</h2>
            <p>We're excited to have you join our community. 🎉</p>
            <p>With LeaseLink, you can:</p>
            <ul>
                <li>Find and list sublets with ease</li>
                <li>Connect with verified property owners and tenants</li>
                <li>Manage your listings and messages in one place</li>
            </ul>
            <p>If you have any questions, just reply to this email. We're here to help!</p>
            <br>
            <p>Happy subletting!<br>The LeaseLink Team</p>
        </body>
        </html>
        """
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        logging.info(f"Welcome email sent to {user_email}, status code: {response.status_code}")
        return True
    except Exception as e:
        logging.error(f"Error sending welcome email to {user_email}: {e}")
        return False

def send_password_reset_email(user_email: str, reset_token: str) -> bool:
    reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
    message = Mail(
        from_email=settings.SENDGRID_FROM_EMAIL,
        to_emails=user_email,
        subject="Reset Your LeaseLink Password",
        html_content=f"""
        <html>
        <body>
            <h2>Password Reset Request</h2>
            <p>We received a request to reset your LeaseLink password.</p>
            <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
            <a href='{reset_link}' style='display:inline-block;padding:10px 20px;background:#0070f3;color:#fff;text-decoration:none;border-radius:5px;'>Reset Password</a>
            <p>If you did not request this, you can safely ignore this email.</p>
            <br>
            <p>Thanks,<br>The LeaseLink Team</p>
        </body>
        </html>
        """
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        logging.info(f"Password reset email sent to {user_email}, status code: {response.status_code}")
        return True
    except Exception as e:
        logging.error(f"Error sending password reset email to {user_email}: {e}")
        return False 
    
def send_verification_email(user_email: str, user_name: str, token: str) -> bool:
    verify_link = f"{settings.FRONTEND_URL}/verify-email?token={token}"
    message = Mail(
        from_email=settings.SENDGRID_FROM_EMAIL,
        to_emails=user_email,
        subject="Verify Your LeaseLink Email",
        html_content=f"""
        <html>
        <body>
            <h2>Hello {user_name}, verify your email!</h2>
            <p>Please confirm your email address to activate your LeaseLink account.</p>
            <a href="{verify_link}" style="padding:10px 20px;background:#0070f3;color:#fff;text-decoration:none;border-radius:5px;">Verify Email</a>
            <p>This link will expire in 1 hour.</p>
        </body>
        </html>
        """
    )
    try:
        sg = SendGridAPIClient(settings.SENDGRID_API_KEY)
        response = sg.send(message)
        logging.info(f"Verification email sent to {user_email}, status code: {response.status_code}")
        return True
    except Exception as e:
        logging.error(f"Error sending verification email: {e}")
        return False
