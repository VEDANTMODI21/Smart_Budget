import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config.js';

// Simple middleware that sets req.userId directly
export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    console.warn('⚠️  No authorization header');
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : authHeader;

  if (!token) {
    console.warn('⚠️  Token not found in authorization header');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId || decoded.id; // Support both formats
    
    if (!req.userId) {
      console.error('❌ Token decoded but no userId found:', decoded);
      return res.status(401).json({ message: 'Invalid token format' });
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Token verified for user: ${req.userId}`);
    }
    
    next();
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    console.error('Token (first 20 chars):', token.substring(0, 20) + '...');
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token', error: 'Token malformed' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', error: 'Please login again' });
    }
    
    return res.status(401).json({ message: 'Invalid token', error: error.message });
  }
}

// Keep the old export for backward compatibility
export const authenticateToken = authMiddleware;
