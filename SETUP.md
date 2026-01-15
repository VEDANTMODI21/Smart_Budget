# Backend Setup Guide

## ✅ What's Been Created

1. **Backend Server** (`server/` folder)
   - Express.js REST API
   - MongoDB integration
   - JWT authentication
   - Secure password hashing
   - API routes for all features

2. **Database Models**
   - User (with password hashing)
   - Expense
   - Settlement
   - Reminder
   - OTP (with auto-expiration)

3. **Security Features**
   - JWT tokens for authentication
   - bcryptjs for password hashing
   - Protected API routes
   - CORS configuration

## 🚀 Quick Start

### Step 1: Install Backend Dependencies

```bash
npm install
```

This will install:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- cors
- dotenv

### Step 2: Set Up MongoDB

**Option A: Local MongoDB**

1. Download MongoDB from https://www.mongodb.com/try/download/community
2. Install and start MongoDB:
   ```bash
   # Windows (as Administrator)
   mongod
   
   # Or use MongoDB as a service
   net start MongoDB
   ```

**Option B: MongoDB Atlas (Cloud - Recommended)**

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a free cluster
4. Get connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/smart-budget`)
5. Update `.env` file with your connection string

### Step 3: Create Environment File

Create `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-budget
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
FRONTEND_URL=http://localhost:5173
NETWORK_IP=10.3.30.166
```

**Important:** Change `JWT_SECRET` to a random string in production!

### Step 4: Start Backend Server

```bash
npm run server
```

You should see:
```
✅ MongoDB connected successfully
🚀 Server running on http://0.0.0.0:5000
📱 Network access: http://10.3.30.166:5000
```

### Step 5: Start Frontend

In a new terminal:

```bash
npm run dev
```

## 🔧 Configuration

### Backend Port
Default: `5000`
Change in `.env`: `PORT=5000`

### Frontend API URL
The frontend automatically uses `http://localhost:5000/api` by default.

For network access, create `.env` file in root:
```env
VITE_API_URL=http://10.3.30.166:5000/api
```

### MongoDB Connection

**Local:**
```
MONGODB_URI=mongodb://localhost:27017/smart-budget
```

**Atlas:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-budget
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register with password
- `POST /api/auth/login` - Login with password
- `POST /api/auth/otp/generate` - Generate OTP
- `POST /api/auth/otp/verify` - Verify OTP
- `GET /api/auth/me` - Get current user (requires token)

### Expenses (requires authentication)
- `GET /api/expenses` - Get all expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `GET /api/expenses/stats` - Get statistics

### Settlements (requires authentication)
- `GET /api/settlements` - Get all settlements
- `POST /api/settlements` - Create settlement
- `PUT /api/settlements/:id` - Update settlement
- `DELETE /api/settlements/:id` - Delete settlement

### Reminders (requires authentication)
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

## 🔒 Security Features

1. **Password Hashing**: All passwords are hashed with bcryptjs
2. **JWT Tokens**: Secure token-based authentication
3. **Protected Routes**: All data routes require authentication
4. **CORS**: Configured to allow frontend origin
5. **Input Validation**: Server-side validation for all inputs

## 🧪 Testing

1. Start MongoDB
2. Start backend: `npm run server`
3. Start frontend: `npm run dev`
4. Open browser: `http://localhost:5173`
5. Register a new account or login
6. Test all features!

## 🐛 Troubleshooting

**MongoDB Connection Error:**
- Make sure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For Atlas, check network access (allow all IPs for testing)

**Port Already in Use:**
- Change `PORT` in `.env`
- Or kill the process using port 5000

**CORS Errors:**
- Check `FRONTEND_URL` in `.env` matches your frontend URL
- Make sure backend is running before frontend

**Authentication Errors:**
- Check JWT_SECRET is set in `.env`
- Clear browser localStorage and try again

## 📝 Next Steps

1. Update frontend pages to use API (Dashboard, ExpenseList, etc.)
2. Add email service for OTP (SendGrid, AWS SES, etc.)
3. Add rate limiting for API
4. Add request validation middleware
5. Set up production environment variables

