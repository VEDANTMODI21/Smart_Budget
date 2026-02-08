import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';
import { createClient } from '@supabase/supabase-js';
import User from '../models/User.js';

// Initialize Supabase for server-side verification
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export default async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : authHeader;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // 1. Try Supabase Verification first if configured
  if (supabase) {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (user && !error) {
        // Find or Create local user for this Supabase ID
        let mongoUser = await User.findOne({
          $or: [{ supabaseId: user.id }, { email: user.email.toLowerCase() }]
        });

        if (!mongoUser) {
          mongoUser = await User.create({
            name: user.user_metadata?.full_name || user.email.split('@')[0],
            email: user.email,
            supabaseId: user.id,
            otpOnly: true // Default for external auth
          });
        } else if (!mongoUser.supabaseId) {
          // Link existing user if they match by email
          mongoUser.supabaseId = user.id;
          await mongoUser.save();
        }

        req.userId = mongoUser._id;
        return next();
      }
    } catch (supaError) {
      console.log('Supabase verify skipped or failed, trying local JWT...');
    }
  }

  // 2. Fallback to local JWT verification
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId || decoded.id;

    if (!req.userId) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    next();
  } catch (error) {
    console.error('❌ Auth Verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export const authenticateToken = authMiddleware;
