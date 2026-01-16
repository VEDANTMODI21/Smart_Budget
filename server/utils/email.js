import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create email transporter
let transporter = null;

// Initialize email transporter
async function initEmailTransporter() {
  // If Gmail credentials are provided, use Gmail
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // App password, not regular password
      }
    });
    console.log('📧 Email service: Gmail configured');
    return transporter;
  }

  // Otherwise, use Ethereal Email (free testing service)
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    console.log('📧 Email service: Ethereal (testing) configured');
    console.log('📧 Test account created:', testAccount.user);
    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error);
    return null;
  }
}

// Send OTP email
export async function sendOTPEmail(email, otp) {
  try {
    if (!transporter) {
      await initEmailTransporter();
    }

    if (!transporter) {
      console.error('❌ Email transporter not available');
      return { success: false, error: 'Email service not configured' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@smartbudget.com',
      to: email,
      subject: 'Your Smart Budget OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Smart Budget - OTP Verification</h2>
          <p>Your One-Time Password (OTP) for login is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 4px;">${otp}</h1>
          </div>
          <p>This OTP is valid for <strong>10 minutes</strong>.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this OTP, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">This is an automated message from Smart Budget.</p>
        </div>
      `,
      text: `Your Smart Budget OTP Code is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nIf you didn't request this OTP, please ignore this email.`
    };

    const info = await transporter.sendMail(mailOptions);

    // If using Ethereal, log the preview URL
    if (!process.env.EMAIL_USER && info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('📧 Email sent! Preview URL:', previewUrl);
        return { 
          success: true, 
          previewUrl, 
          message: 'OTP sent (check Ethereal preview URL in server logs)' 
        };
      }
    }

    console.log('✅ OTP email sent to:', email);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return { success: false, error: error.message };
  }
}

// Initialize on module load
initEmailTransporter().catch(console.error);
