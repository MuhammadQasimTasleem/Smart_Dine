from django.core.mail import send_mail
from django.conf import settings
from .models import EmailVerificationToken, PasswordResetToken


def send_verification_email(user):
    """Send verification email to user"""
    
    # Create or get verification token
    token, created = EmailVerificationToken.objects.get_or_create(user=user)
    
    # If token exists but is expired, create a new one
    if not created and token.is_expired():
        token.delete()
        token = EmailVerificationToken.objects.create(user=user)
    
    # Build verification URL
    verification_url = f"{settings.FRONTEND_URL}/verify-email/{token.token}"
    
    # Email subject
    subject = "Verify Your Email - Smart Dine"
    
    # Email body (HTML)
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #f5a623, #e09000); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .header h1 {{ color: #1a1a1a; margin: 0; }}
            .content {{ background: #2a2a2a; padding: 30px; color: #ffffff; }}
            .button {{ display: inline-block; background: linear-gradient(135deg, #f5a623, #e09000); color: #1a1a1a; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }}
            .footer {{ background: #1a1a1a; padding: 20px; text-align: center; color: #888; font-size: 12px; border-radius: 0 0 10px 10px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🍽️ Smart Dine</h1>
            </div>
            <div class="content">
                <h2>Welcome, {user.username}!</h2>
                <p>Thank you for registering with Smart Dine. Please verify your email address to complete your registration.</p>
                <p style="text-align: center;">
                    <a href="{verification_url}" class="button">Verify Email</a>
                </p>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #f5a623;">{verification_url}</p>
                <p><strong>This link will expire in 24 hours.</strong></p>
                <p>If you didn't create an account with Smart Dine, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>© 2025 Smart Dine. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text version
    plain_message = f"""
    Welcome to Smart Dine, {user.username}!
    
    Please verify your email by clicking the link below:
    {verification_url}
    
    This link will expire in 24 hours.
    
    If you didn't create an account with Smart Dine, please ignore this email.
    """
    
    # Send email
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def resend_verification_email(user):
    """Resend verification email"""
    # Delete old token if exists
    EmailVerificationToken.objects.filter(user=user).delete()
    
    # Send new verification email
    return send_verification_email(user)


def send_password_reset_email(user):
    """Send password reset email to user"""
    
    # Delete any existing unused tokens for this user
    PasswordResetToken.objects.filter(user=user, is_used=False).delete()
    
    # Create new token
    token = PasswordResetToken.objects.create(user=user)
    
    # Build reset URL
    reset_url = f"{settings.FRONTEND_URL}/reset-password/{token.token}"
    
    # Email subject
    subject = "Reset Your Password - Smart Dine"
    
    # Email body (HTML)
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: linear-gradient(135deg, #f5a623, #e09000); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
            .header h1 {{ color: #1a1a1a; margin: 0; }}
            .content {{ background: #2a2a2a; padding: 30px; color: #ffffff; }}
            .button {{ display: inline-block; background: linear-gradient(135deg, #f5a623, #e09000); color: #1a1a1a; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }}
            .footer {{ background: #1a1a1a; padding: 20px; text-align: center; color: #888; font-size: 12px; border-radius: 0 0 10px 10px; }}
            .warning {{ color: #ff6b6b; font-weight: bold; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🍽️ Smart Dine</h1>
            </div>
            <div class="content">
                <h2>Password Reset Request</h2>
                <p>Hi {user.username},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <p style="text-align: center;">
                    <a href="{reset_url}" class="button">Reset Password</a>
                </p>
                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; color: #f5a623;">{reset_url}</p>
                <p class="warning">⏰ This link will expire in 1 hour.</p>
                <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            </div>
            <div class="footer">
                <p>© 2025 Smart Dine. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    # Plain text version
    plain_message = f"""
    Hi {user.username},
    
    We received a request to reset your password.
    
    Click the link below to reset your password:
    {reset_url}
    
    This link will expire in 1 hour.
    
    If you didn't request a password reset, please ignore this email.
    """
    
    # Send email
    try:
        send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending password reset email: {e}")
        return False
