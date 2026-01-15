import jwt from 'jsonwebtoken';

// Simple middleware that sets req.userId directly
export default function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    req.userId = decoded.userId || decoded.id; // Support both formats
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// Keep the old export for backward compatibility
export const authenticateToken = authMiddleware;
