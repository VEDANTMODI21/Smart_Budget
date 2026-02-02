import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import os from 'os';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/smartbudget';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log('❌ MongoDB error:', err.message));

// User Schema
const userSchema = new mongoose.Schema({
  fullName: String,
  email: { type: String, unique: true },
  password: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// OTP Schema
const otpSchema = new mongoose.Schema({
  email: String,
  otp: String,
  expiresAt: { type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) }
});

const OTP = mongoose.model('OTP', otpSchema);

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Function to generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to send OTP email
async function sendOTPEmail(email, otp) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Smart Budget - Your OTP Code',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Smart Budget OTP Verification</h2>
          <p>Your One-Time Password (OTP) is:</p>
          <h1 style="color: #007bff; letter-spacing: 5px;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
          <p><strong>Do not share this OTP with anyone.</strong></p>
          <hr/>
          <p style="color: #666; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
    return true;
  } catch (error) {
    console.log('❌ Email error:', error.message);
    return false;
  }
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'All fields required'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already exists'
      });
    }

    const user = new User({ fullName, email, password });
    await user.save();

    res.json({
      success: true,
      message: 'User created successfully',
      user: { id: user._id, fullName: user.fullName, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password required'
      });
    }

    const user = await User.findOne({ email, password });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      user: { id: user._id, fullName: user.fullName, email: user.email },
      token: 'token_' + Date.now()
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email required'
      });
    }

    // Check if email exists (for login flow)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Email not found. Please sign up first.'
      });
    }

    // Generate OTP using otp-generator
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true
    });

    // Delete old OTP for this email
    await OTP.deleteMany({ email });

    // Save new OTP to database
    const otpRecord = new OTP({ email, otp });
    await otpRecord.save();

    // Send OTP to user's email
    const mailOptions = {
      from: process.env.EMAIL_USER || '"Smart Budget" <noreply@smartbudget.com>',
      to: email,
      subject: 'Smart Budget - Your OTP Code',
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

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('❌ Email error:', error.message);
        return res.status(500).json({
          success: false,
          error: 'Failed to send OTP email. Check your email configuration.'
        });
      }
      console.log(`✅ OTP sent to ${email}`);
      res.json({
        success: true,
        message: `OTP sent to ${email}. Please check your inbox.`
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'Email and OTP required'
      });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email, otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        error: 'Invalid OTP'
      });
    }

    // Check if OTP expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        error: 'OTP expired. Please request a new one.'
      });
    }

    // OTP is valid, delete it
    await OTP.deleteOne({ _id: otpRecord._id });

    // Get user
    const user = await User.findOne({ email });

    res.json({
      success: true,
      message: 'OTP verified successfully',
      token: 'token_' + Date.now(),
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Serve static files (after npm run build)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Listen on 0.0.0.0 to accept network connections
app.listen(PORT, '0.0.0.0', () => {
  const networkInterfaces = os.networkInterfaces();
  let ipAddress = 'localhost';

  for (const name of Object.keys(networkInterfaces)) {
    for (const iface of networkInterfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ipAddress = iface.address;
        break;
      }
    }
  }

  console.log(`✅ Server running on http://${ipAddress}:${PORT}`);
  console.log(`📧 Email: ${process.env.EMAIL_USER}`);
  console.log(`🔗 Network access: http://${ipAddress}:${PORT}`);
});
