// Shared configuration for the server
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Log JWT_SECRET status on startup
if (JWT_SECRET === 'your-secret-key-change-in-production' && process.env.NODE_ENV === 'production') {
  console.warn('⚠️  WARNING: Using default JWT_SECRET in production! Set JWT_SECRET in .env file.');
} else if (process.env.NODE_ENV !== 'production') {
  console.log('🔐 JWT_SECRET loaded:', JWT_SECRET.substring(0, 10) + '...' + JWT_SECRET.substring(JWT_SECRET.length - 5));
}
