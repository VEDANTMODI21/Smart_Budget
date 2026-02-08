import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import otpGenerator from 'otp-generator';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import authMiddleware from '../middleware/auth.js';
import { JWT_SECRET } from '../config.js';
import { sendOTPEmail } from '../utils/email.js';

const router = express.Router();

// Generate JWT token (returns { id: userId } for compatibility)
const generateToken = (userId) => {
  if (!userId) {
    throw new Error('User ID is required to generate token');
  }

  // Ensure userId is a string (MongoDB ObjectId needs conversion)
  const userIdStr = userId.toString();

  const token = jwt.sign({ id: userIdStr, userId: userIdStr }, JWT_SECRET, { expiresIn: '7d' });

  if (process.env.NODE_ENV === 'development') {
    console.log(`🔑 Token generated for user: ${userIdStr}`);
  }

  return token;
};

// Register with password
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('📝 Register request received:', { name, email, password: '***' });

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      console.error('❌ MongoDB not connected. State:', mongoose.connection.readyState);
      return res.status(503).json({
        message: 'Database not available',
        error: 'Cannot connect to database. Please check MongoDB connection.'
      });
    }

    // Check if user exists
    console.log('🔍 Checking for existing user...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('⚠️  User already exists:', email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    console.log('➕ Creating new user...');
    const user = new User({ name, email, password });
    await user.save();
    console.log('✅ User saved to database:', user._id);

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });

    // Handle specific MongoDB errors
    if (error.name === 'MongoServerError' && error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    res.status(500).json({
      message: 'Server error',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { details: error.stack })
    });
  }
});

// Login with password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database not available',
        error: 'Cannot connect to database. Please check MongoDB connection.'
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    if (!user.password) {
      return res.status(401).json({ message: 'Please use OTP login' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate OTP
router.post('/otp/generate', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database not available',
        error: 'Cannot connect to database. Please check MongoDB connection.'
      });
    }

    // Generate 6-digit OTP using otp-generator
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false,
      digits: true
    });

    // Save OTP to database
    const otpRecord = new Otp({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    await otpRecord.save();

    // Send OTP via email
    console.log(`📧 Sending OTP to ${email}...`);
    const emailResult = await sendOTPEmail(email, otp);

    if (emailResult.success) {
      console.log('✅ OTP email sent successfully');
      if (emailResult.previewUrl) {
        console.log('📧 Preview URL:', emailResult.previewUrl);
      }
    } else {
      console.warn('⚠️  Failed to send email, but OTP is saved:', emailResult.error);
      // Still return success, but include OTP in dev mode as fallback
    }

    let message = 'OTP generated successfully.';
    if (emailResult.success) {
      if (emailResult.previewUrl) {
        message = 'OTP generated. Since email is not configured, you can view it at the preview link (check terminal).';
      } else {
        message = 'OTP sent to your email. Please check your inbox (and spam folder).';
      }
    } else {
      message = 'OTP generated but email sending failed. If this is a development environment, check the server terminal for the code.';
    }

    res.json({
      message,
      // Return the OTP in the response for development mode so the user can see it
      otp: process.env.NODE_ENV !== 'production' ? otp : undefined,
      previewUrl: emailResult.previewUrl,
      expiresIn: 600 // seconds
    });
  } catch (error) {
    console.error('OTP generation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Verify OTP and login/register
router.post('/otp/verify', async (req, res) => {
  try {
    const { email, otp, name } = req.body;

    console.log('📝 OTP verification request:', { email, otp: '***', hasName: !!name });

    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database not available',
        error: 'Cannot connect to database. Please check MongoDB connection.'
      });
    }

    // Find valid OTP
    const otpRecord = await Otp.findOne({
      email,
      otp,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      console.warn('⚠️  Invalid or expired OTP for:', email);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();
    console.log('✅ OTP verified and marked as used');

    // Find or create user
    let user = await User.findOne({ email });

    if (!user) {
      // Register new user with OTP
      if (!name) {
        return res.status(400).json({ message: 'Name is required for registration' });
      }
      console.log('➕ Creating new user with OTP:', email);
      user = new User({ name, email, otpOnly: true });
      await user.save();
      console.log('✅ New user created:', user._id);
    } else {
      console.log('✅ Existing user found:', user._id);
    }

    // Generate token
    const token = generateToken(user._id);
    console.log('🔑 Token generated for OTP login');

    res.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('❌ OTP verification error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { details: error.stack })
    });
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        message: 'Database not available',
        error: 'Cannot connect to database. Please check MongoDB connection.'
      });
    }

    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      id: user._id,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

