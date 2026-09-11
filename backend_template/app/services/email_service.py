"""
Email Service for sending verification and notification emails via Brevo API
"""
import secrets
import random
import httpx
from datetime import datetime, timedelta
from typing import Optional
from app.core.config import settings


class EmailService:
    """Service for sending emails via Brevo API"""
    
    def __init__(self):
        self.api_key = settings.BREVO_API_KEY
        self.sender_email = settings.BREVO_SENDER_EMAIL
        self.sender_name = settings.BREVO_SENDER_NAME
        self.frontend_url = settings.FRONTEND_URL
        self.brevo_api_url = "https://api.brevo.com/v3/smtp/email"
    
    def is_configured(self) -> bool:
        """Check if Brevo API is properly configured"""
        return bool(self.api_key)
    
    def generate_otp(self) -> str:
        """Generate a 6-digit OTP code"""
        return ''.join([str(random.randint(0, 9)) for _ in range(6)])
    
    def get_otp_expiry(self, minutes: int = 10) -> datetime:
        """Get expiry datetime for OTP (default 10 minutes)"""
        return datetime.utcnow() + timedelta(minutes=minutes)
    
    async def send_email(
        self,
        to_email: str,
        to_name: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        attachment: Optional[dict] = None
    ) -> bool:
        """
        Send an email using Brevo API
        Returns True if successful, False otherwise
        
        Args:
            to_email: Recipient email address
            to_name: Recipient name
            subject: Email subject
            html_content: HTML email body
            text_content: Plain text email body (optional)
            attachment: Dict with 'content' (base64), 'name' keys for attachment (optional)
        """
        if not self.is_configured():
            print("⚠️ Brevo API not configured. Skipping email send.")
            return False
        
        try:
            headers = {
                "api-key": self.api_key,
                "content-type": "application/json",
                "accept": "application/json"
            }
            
            payload = {
                "sender": {
                    "name": self.sender_name,
                    "email": self.sender_email
                },
                "to": [
                    {
                        "email": to_email,
                        "name": to_name
                    }
                ],
                "subject": subject,
                "htmlContent": html_content
            }
            
            if text_content:
                payload["textContent"] = text_content
            
            if attachment:
                payload["attachment"] = [attachment]
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.brevo_api_url,
                    headers=headers,
                    json=payload,
                    timeout=30.0
                )
                
                if response.status_code in [200, 201]:
                    print(f"✅ Email sent successfully to {to_email}")
                    return True
                else:
                    print(f"❌ Brevo API error: {response.status_code} - {response.text}")
                    return False
                    
        except Exception as e:
            print(f"❌ Failed to send email to {to_email}: {str(e)}")
            return False
    
    async def send_otp_email(
        self,
        to_email: str,
        user_name: str,
        otp_code: str
    ) -> bool:
        """Send OTP verification email"""
        
        subject = "Your Verification Code - BIDUA Hosting"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 320px;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px 12px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">BIDUA Hosting</h1>
                                    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Email Verification</p>
                                </td>
                            </tr>
                            
                            <!-- Body -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin: 0 0 20px; color: #333; font-size: 24px; font-weight: 600;">Verify Your Email</h2>
                                    <p style="margin: 0 0 15px; color: #666; font-size: 16px; line-height: 1.6;">
                                        Hello <strong>{user_name}</strong>,
                                    </p>
                                    <p style="margin: 0 0 25px; color: #666; font-size: 16px; line-height: 1.6;">
                                        Your verification code is:
                                    </p>
                                    
                                    <!-- OTP Code Box -->
                                    <div style="text-align: center; margin: 30px 0;">
                                        <div style="display: inline-block; padding: 20px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
                                            <span style="font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                                {otp_code}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <p style="margin: 25px 0 15px; color: #999; font-size: 14px; line-height: 1.6; text-align: center;">
                                        This code will expire in <strong>10 minutes</strong>.
                                    </p>
                                    
                                    <div style="margin: 25px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                                        <p style="margin: 0; color: #856404; font-size: 14px; line-height: 1.6;">
                                            <strong>⚠️ Security Notice:</strong><br>
                                            Never share this code with anyone. BIDUA Hosting staff will never ask for your verification code.
                                        </p>
                                    </div>
                                    
                                    <p style="margin: 15px 0 0; color: #999; font-size: 14px; line-height: 1.6;">
                                        If you didn't request this code, please ignore this email.
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
                                    <p style="margin: 0; color: #999; font-size: 14px;">
                                        &copy; 2024 BIDUA Hosting. All rights reserved.
                                    </p>
                                    <p style="margin: 10px 0 0; color: #999; font-size: 12px;">
                                        This is an automated email. Please do not reply.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        text_content = f"""
        Verify Your Email - BIDUA Hosting
        
        Hello {user_name},
        
        Your verification code is: {otp_code}
        
        This code will expire in 10 minutes.
        
        Never share this code with anyone. BIDUA Hosting staff will never ask for your verification code.
        
        If you didn't request this code, please ignore this email.
        
        © 2024 BIDUA Hosting. All rights reserved.
        """
        
        return await self.send_email(to_email, user_name, subject, html_content, text_content)
    
    async def send_welcome_email(
        self,
        to_email: str,
        user_name: str
    ) -> bool:
        """Send welcome email after successful verification"""
        
        dashboard_url = f"{self.frontend_url}/dashboard"
        
        subject = "Welcome to BIDUA Hosting! 🎉"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 320px;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 12px 12px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🎉 Welcome!</h1>
                                    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your email has been verified</p>
                                </td>
                            </tr>
                            
                            <!-- Body -->
                            <tr>
                                <td style="padding: 40px;">
                                    <p style="margin: 0 0 15px; color: #666; font-size: 16px; line-height: 1.6;">
                                        Hello <strong>{user_name}</strong>,
                                    </p>
                                    <p style="margin: 0 0 25px; color: #666; font-size: 16px; line-height: 1.6;">
                                        Your email has been successfully verified. You now have full access to your BIDUA Hosting account.
                                    </p>
                                    
                                    <h3 style="margin: 30px 0 15px; color: #333; font-size: 18px;">What's Next?</h3>
                                    <ul style="margin: 0 0 25px; padding-left: 20px; color: #666; font-size: 15px; line-height: 1.8;">
                                        <li>Explore our hosting plans and choose the right one for you</li>
                                        <li>Set up your first server with our easy-to-use dashboard</li>
                                        <li>Invite friends using your referral code and earn rewards</li>
                                    </ul>
                                    
                                    <!-- CTA Button -->
                                    <table role="presentation" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                                        <tr>
                                            <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
                                                <a href="{dashboard_url}" target="_blank" style="display: inline-block; padding: 16px 40px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 8px;">
                                                    Go to Dashboard
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
                                    <p style="margin: 0; color: #999; font-size: 14px;">
                                        &copy; 2024 BIDUA Hosting. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        text_content = f"""
        Welcome to BIDUA Hosting!
        
        Hello {user_name},
        
        Your email has been successfully verified. You now have full access to your BIDUA Hosting account.
        
        What's Next?
        - Explore our hosting plans and choose the right one for you
        - Set up your first server with our easy-to-use dashboard
        - Invite friends using your referral code and earn rewards
        
        Visit your dashboard: {dashboard_url}
        
        © 2024 BIDUA Hosting. All rights reserved.
        """
        
        return await self.send_email(to_email, user_name, subject, html_content, text_content)
    
    async def send_password_reset_email(
        self,
        to_email: str,
        user_name: str,
        reset_token: str
    ) -> bool:
        """Send password reset OTP email"""
        
        subject = "Reset Your Password - BIDUA Hosting"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 320px;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); border-radius: 12px 12px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🔐 Password Reset</h1>
                                    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">BIDUA Hosting</p>
                                </td>
                            </tr>
                            
                            <!-- Body -->
                            <tr>
                                <td style="padding: 40px;">
                                    <p style="margin: 0 0 15px; color: #666; font-size: 16px; line-height: 1.6;">
                                        Hello <strong>{user_name}</strong>,
                                    </p>
                                    <p style="margin: 0 0 25px; color: #666; font-size: 16px; line-height: 1.6;">
                                        Your password reset code is:
                                    </p>
                                    
                                    <!-- OTP Code Box -->
                                    <div style="text-align: center; margin: 30px 0;">
                                        <div style="display: inline-block; padding: 20px 40px; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); border-radius: 12px;">
                                            <span style="font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                                {reset_token}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div style="margin: 25px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                                        <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                                            <strong>⚠️ Security Notice:</strong><br>
                                            This code will expire in <strong>10 minutes</strong>.<br>
                                            If you didn't request a password reset, please ignore this email.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
                                    <p style="margin: 0; color: #999; font-size: 14px;">
                                        &copy; 2024 BIDUA Hosting. All rights reserved.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        text_content = f"""
        Reset Your Password - BIDUA Hosting
        
        Hello {user_name},
        
        Your password reset code is: {reset_token}
        
        This code will expire in 10 minutes.
        
        If you didn't request a password reset, please ignore this email.
        
        © 2024 BIDUA Hosting. All rights reserved.
        """
        
        return await self.send_email(to_email, user_name, subject, html_content, text_content)
    
    async def send_invoice_email(
        self,
        to_email: str,
        user_name: str,
        invoice_number: str,
        order_number: str,
        total_amount: float,
        payment_date: str,
        server_config: dict,
        pdf_attachment_base64: str,
        addons: list = None
    ) -> bool:
        """
        Send invoice email to customer with PDF attachment
        
        Args:
            to_email: Customer email
            user_name: Customer name
            invoice_number: Invoice number
            order_number: Order number
            total_amount: Total amount paid
            payment_date: Payment date string
            server_config: Server configuration dict
            pdf_attachment_base64: Base64 encoded PDF content
            addons: List of addon details (optional)
        """
        
        subject = f"Invoice {invoice_number} - BIDUA Hosting"
        
        # Build addons HTML if present
        addons_html = ""
        if addons and len(addons) > 0:
            addons_rows = ""
            for addon in addons:
                addons_rows += f"""
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{addon.get('addon_name', 'N/A')}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹{float(addon.get('subtotal', 0)):,.2f}</td>
                </tr>
                """
            addons_html = f"""
            <h3 style="margin: 25px 0 15px; color: #333; font-size: 18px;">Additional Services</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        <th style="padding: 10px; text-align: left; border-bottom: 2px solid #d1d5db;">Service</th>
                        <th style="padding: 10px; text-align: right; border-bottom: 2px solid #d1d5db;">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    {addons_rows}
                </tbody>
            </table>
            """
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 320px;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); border-radius: 12px 12px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">BIDUA Hosting</h1>
                                    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Invoice & Receipt</p>
                                </td>
                            </tr>
                            
                            <!-- Body -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin: 0 0 20px; color: #333; font-size: 24px; font-weight: 600;">Thank You for Your Purchase!</h2>
                                    <p style="margin: 0 0 15px; color: #666; font-size: 16px; line-height: 1.6;">
                                        Hello <strong>{user_name}</strong>,
                                    </p>
                                    <p style="margin: 0 0 25px; color: #666; font-size: 16px; line-height: 1.6;">
                                        Your payment has been successfully processed. Please find your invoice details below.
                                    </p>
                                    
                                    <!-- Invoice Info Box -->
                                    <div style="background-color: #f9fafb; border-left: 4px solid #4F46E5; border-radius: 4px; padding: 20px; margin: 25px 0;">
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 5px 0; color: #666; font-size: 14px;">Invoice Number:</td>
                                                <td style="padding: 5px 0; color: #111; font-size: 14px; font-weight: 600; text-align: right;">{invoice_number}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 0; color: #666; font-size: 14px;">Order Number:</td>
                                                <td style="padding: 5px 0; color: #111; font-size: 14px; font-weight: 600; text-align: right;">{order_number}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 0; color: #666; font-size: 14px;">Payment Date:</td>
                                                <td style="padding: 5px 0; color: #111; font-size: 14px; font-weight: 600; text-align: right;">{payment_date}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 0; color: #666; font-size: 14px;">Total Amount:</td>
                                                <td style="padding: 5px 0; color: #4F46E5; font-size: 18px; font-weight: 700; text-align: right;">₹{total_amount:,.2f}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <h3 style="margin: 25px 0 15px; color: #333; font-size: 18px;">Server Configuration</h3>
                                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                        <tr style="background-color: #f3f4f6;">
                                            <td style="padding: 10px; border-bottom: 2px solid #d1d5db; font-weight: 600;">Specification</td>
                                            <td style="padding: 10px; border-bottom: 2px solid #d1d5db; font-weight: 600;">Details</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Server Type</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{server_config.get('server_type', 'VPS')}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">CPU</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{server_config.get('vcpu', 'N/A')} vCPU</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">RAM</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{server_config.get('ram_gb', 'N/A')} GB</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Storage</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{server_config.get('storage_gb', 'N/A')} GB SSD</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Bandwidth</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{server_config.get('bandwidth_gb', 'N/A')} GB</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Operating System</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{server_config.get('operating_system', 'N/A')}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Duration</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{server_config.get('billing_cycle', 'Monthly').title()}</td>
                                        </tr>
                                    </table>
                                    
                                    {addons_html}
                                    
                                    <div style="margin: 25px 0; padding: 15px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;">
                                        <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                                            <strong>📎 Invoice Attached:</strong><br>
                                            A detailed PDF invoice has been attached to this email for your records.
                                        </p>
                                    </div>
                                    
                                    <h3 style="margin: 25px 0 15px; color: #333; font-size: 18px;">Need Help?</h3>
                                    <p style="margin: 0 0 10px; color: #666; font-size: 14px; line-height: 1.6;">
                                        If you have any questions about your invoice or server, please don't hesitate to contact us:
                                    </p>
                                    <p style="margin: 0 0 5px; color: #666; font-size: 14px;">
                                        📧 Email: <a href="mailto:support@biduahosting.com" style="color: #4F46E5; text-decoration: none;">support@biduahosting.com</a>
                                    </p>
                                    <p style="margin: 0; color: #666; font-size: 14px;">
                                        📞 Phone: +91-XXXX-XXXXXX
                                    </p>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
                                    <p style="margin: 0; color: #999; font-size: 14px;">
                                        &copy; 2024 BIDUA Hosting. All rights reserved.
                                    </p>
                                    <p style="margin: 10px 0 0; color: #999; font-size: 12px;">
                                        This is an automated email. Please do not reply.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        text_content = f"""
        Invoice {invoice_number} - BIDUA Hosting
        
        Hello {user_name},
        
        Your payment has been successfully processed. Please find your invoice details below.
        
        Invoice Number: {invoice_number}
        Order Number: {order_number}
        Payment Date: {payment_date}
        Total Amount: ₹{total_amount:,.2f}
        
        Server Configuration:
        - Server Type: {server_config.get('server_type', 'VPS')}
        - CPU: {server_config.get('vcpu', 'N/A')} vCPU
        - RAM: {server_config.get('ram_gb', 'N/A')} GB
        - Storage: {server_config.get('storage_gb', 'N/A')} GB SSD
        - Bandwidth: {server_config.get('bandwidth_gb', 'N/A')} GB
        - Operating System: {server_config.get('operating_system', 'N/A')}
        - Duration: {server_config.get('billing_cycle', 'Monthly').title()}
        
        A detailed PDF invoice has been attached to this email for your records.
        
        Need Help?
        Email: support@biduahosting.com
        Phone: +91-XXXX-XXXXXX
        
        © 2024 BIDUA Hosting. All rights reserved.
        """
        
        # Prepare PDF attachment
        attachment = {
            "content": pdf_attachment_base64,
            "name": f"{invoice_number}.pdf"
        }
        
        return await self.send_email(
            to_email=to_email,
            to_name=user_name,
            subject=subject,
            html_content=html_content,
            text_content=text_content,
            attachment=attachment
        )
    
    async def send_provider_notification_email(
        self,
        provider_email: str,
        order_number: str,
        server_config: dict,
        addons: list = None
    ) -> bool:
        """
        Send server configuration email to provider (NO PII)
        
        Args:
            provider_email: Provider's email address
            order_number: Order number for reference
            server_config: Server configuration dict
            addons: List of addon details (optional)
        """
        
        subject = f"New Server Order: {order_number} - Configuration Details"
        
        # Build addons HTML if present
        addons_html = ""
        if addons and len(addons) > 0:
            addons_rows = ""
            for addon in addons:
                addons_rows += f"""
                <tr>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{addon.get('addon_name', 'N/A')}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: center;">{addon.get('quantity', 1)}</td>
                    <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{addon.get('unit_label', '')}</td>
                </tr>
                """
            addons_html = f"""
            <h3 style="margin: 25px 0 15px; color: #333; font-size: 18px;">Additional Services/Addons</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="background-color: #f3f4f6;">
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #d1d5db;">Service</th>
                    <th style="padding: 10px; text-align: center; border-bottom: 2px solid #d1d5db;">Quantity</th>
                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #d1d5db;">Unit</th>
                </tr>
                {addons_rows}
            </table>
            """
        
        # Extract special instructions if present
        special_instructions = server_config.get('special_instructions', '')
        instructions_html = ""
        if special_instructions:
            instructions_html = f"""
            <div style="margin: 25px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.6;">
                    <strong>📋 Special Instructions:</strong><br>
                    {special_instructions}
                </p>
            </div>
            """
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="min-width: 320px;">
                <tr>
                    <td align="center" style="padding: 40px 20px;">
                        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                            <!-- Header -->
                            <tr>
                                <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, #059669 0%, #047857 100%); border-radius: 12px 12px 0 0;">
                                    <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🖥️ New Server Order</h1>
                                    <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Configuration Details</p>
                                </td>
                            </tr>
                            
                            <!-- Body -->
                            <tr>
                                <td style="padding: 40px;">
                                    <h2 style="margin: 0 0 20px; color: #333; font-size: 24px; font-weight: 600;">Server Configuration Required</h2>
                                    <p style="margin: 0 0 15px; color: #666; font-size: 16px; line-height: 1.6;">
                                        A new server order has been placed. Please configure the server with the following specifications:
                                    </p>
                                    
                                    <!-- Order Info Box -->
                                    <div style="background-color: #f0fdf4; border-left: 4px solid #059669; border-radius: 4px; padding: 20px; margin: 25px 0;">
                                        <table style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 5px 0; color: #666; font-size: 14px;">Order Reference:</td>
                                                <td style="padding: 5px 0; color: #111; font-size: 14px; font-weight: 600; text-align: right;">{order_number}</td>
                                            </tr>
                                        </table>
                                    </div>
                                    
                                    <h3 style="margin: 25px 0 15px; color: #333; font-size: 18px;">Server Specifications</h3>
                                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                                        <tr style="background-color: #f3f4f6;">
                                            <td style="padding: 10px; border-bottom: 2px solid #d1d5db; font-weight: 600;">Component</td>
                                            <td style="padding: 10px; border-bottom: 2px solid #d1d5db; font-weight: 600;">Specification</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Server Type</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{server_config.get('server_type', 'VPS')}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">CPU Cores</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{server_config.get('vcpu', 'N/A')} vCPU</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">RAM</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{server_config.get('ram_gb', 'N/A')} GB</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Storage</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{server_config.get('storage_gb', 'N/A')} GB SSD</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Bandwidth</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{server_config.get('bandwidth_gb', 'N/A')} GB/month</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Operating System</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{server_config.get('operating_system', 'Ubuntu 22.04 LTS')}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">IP Requirement</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{server_config.get('ip_requirement', '1 Dedicated IPv4')}</td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">Service Duration</td>
                                            <td style="padding: 10px; border-bottom: 1px solid #e5e7eb;">{server_config.get('billing_cycle', 'Monthly').title()}</td>
                                        </tr>
                                    </table>
                                    
                                    {addons_html}
                                    {instructions_html}
                                    
                                    <div style="margin: 25px 0; padding: 15px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;">
                                        <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.6;">
                                            <strong>ℹ️ Note:</strong><br>
                                            This is an operational notification. Please proceed with server configuration as per the specifications above.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                            
                            <!-- Footer -->
                            <tr>
                                <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 12px 12px; text-align: center;">
                                    <p style="margin: 0; color: #999; font-size: 14px;">
                                        BIDUA Hosting - Server Provisioning Team
                                    </p>
                                    <p style="margin: 10px 0 0; color: #999; font-size: 12px;">
                                        This is an automated notification.
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
        """
        
        text_content = f"""
        New Server Order: {order_number}
        
        A new server order has been placed. Please configure the server with the following specifications:
        
        Order Reference: {order_number}
        
        Server Specifications:
        - Server Type: {server_config.get('server_type', 'VPS')}
        - CPU Cores: {server_config.get('vcpu', 'N/A')} vCPU
        - RAM: {server_config.get('ram_gb', 'N/A')} GB
        - Storage: {server_config.get('storage_gb', 'N/A')} GB SSD
        - Bandwidth: {server_config.get('bandwidth_gb', 'N/A')} GB/month
        - Operating System: {server_config.get('operating_system', 'Ubuntu 22.04 LTS')}
        - IP Requirement: {server_config.get('ip_requirement', '1 Dedicated IPv4')}
        - Service Duration: {server_config.get('billing_cycle', 'Monthly').title()}
        
        This is an operational notification. Please proceed with server configuration as per the specifications above.
        
        BIDUA Hosting - Server Provisioning Team
        """
        
        return await self.send_email(
            to_email=provider_email,
            to_name="Server Provisioning Team",
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )
    
    async def test_connection(self) -> bool:
        """Test Brevo API connection"""
        if not self.is_configured():
            print("⚠️ Brevo API not configured")
            return False
        
        try:
            headers = {
                "api-key": self.api_key,
                "accept": "application/json"
            }
            
            async with httpx.AsyncClient() as client:
                # Test with account info endpoint
                response = await client.get(
                    "https://api.brevo.com/v3/account",
                    headers=headers,
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    print("✅ Brevo API connection successful")
                    return True
                else:
                    print(f"❌ Brevo API error: {response.status_code}")
                    return False
                    
        except Exception as e:
            print(f"❌ Brevo API connection failed: {str(e)}")
            return False


# Singleton instance
email_service = EmailService()
