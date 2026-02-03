import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create email transporter
let transporter = null;

// Initialize email transporter
let initializationPromise = null;

async function initEmailTransporter() {
  if (transporter) return transporter;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      // If Gmail credentials are provided, use Gmail
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        console.log('🔄 Attempting to configure Gmail service...');
        const gmailTransporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // App password, not regular password
          }
        });

        // Verify transporter
        await gmailTransporter.verify();
        transporter = gmailTransporter;
        console.log('✅ Email service: Gmail configured and verified');
        return transporter;
      }

      // Otherwise, use Ethereal Email (free testing service)
      console.log('🔄 No Gmail credentials found. Creating Ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      const etherealTransporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      transporter = etherealTransporter;
      console.log('📧 Email service: Ethereal (testing) configured');
      console.log('📧 Test account:', testAccount.user);
      return transporter;
    } catch (error) {
      console.error('❌ Failed to create email transporter:', error.message);
      initializationPromise = null; // Allow retry on next call
      return null;
    }
  })();

  return initializationPromise;
}

// Send OTP email
export async function sendOTPEmail(email, otp) {
  try {
    // Ensure transporter is ready
    if (!transporter) {
      await initEmailTransporter();
    }

    if (!transporter) {
      console.error('❌ Email transporter not available');
      return { success: false, error: 'Email service not configured' };
    }

    const mailOptions = {
      from: process.env.EMAIL_USER || '"Smart Budget" <noreply@smartbudget.com>',
      to: email,
      subject: 'Your Smart Budget OTP Code',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #7c3aed; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Smart Budget</h1>
          </div>
          <div style="padding: 40px 30px; background-color: white;">
            <h2 style="color: #1e293b; margin-top: 0;">OTP Verification</h2>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello,</p>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">Your One-Time Password (OTP) for login is:</p>
            <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-radius: 12px; margin: 30px 0; border: 2px dashed #cbd5e1;">
              <h1 style="color: #7c3aed; font-size: 42px; margin: 0; letter-spacing: 10px; font-weight: bold;">${otp}</h1>
            </div>
            <p style="color: #475569; font-size: 16px; line-height: 1.6;">This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 30px;">If you didn't request this code, you can safely ignore this email.</p>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Smart Budget App. All rights reserved.</p>
          </div>
        </div>
      `,
      text: `Your Smart Budget OTP Code is: ${otp}\n\nThis code is valid for 10 minutes.\n\nIf you didn't request this code, please ignore this email.`
    };

    const info = await transporter.sendMail(mailOptions);

    // Development fallback: Log OTP to console
    if (process.env.NODE_ENV !== 'production') {
      console.log('-----------------------------------------');
      console.log('DEBUG: OTP for', email, 'is:', otp);
      console.log('-----------------------------------------');
    }

    // If using Ethereal, log the preview URL
    if (info.envelope && info.envelope.from && (info.envelope.from.includes('ethereal.email') || info.envelope.from.includes('test'))) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log('📧 Ethereal Preview URL:', previewUrl);
        return {
          success: true,
          previewUrl,
          message: 'OTP sent (using Ethereal for testing)'
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
