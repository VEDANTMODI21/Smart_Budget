
---

## 📄 `SETUP.md` (FINAL)

```md
# Backend Setup Guide

## ✅ What's Been Created

1. **Backend Server**
   - Express.js REST API
   - MongoDB integration
   - JWT authentication
   - Secure password hashing

2. **Database Models**
   - User
   - Expense
   - Settlement
   - Reminder
   - OTP (auto-expiring)

3. **Security**
   - JWT-based authentication
   - bcryptjs password hashing
   - Protected routes
   - CORS configuration

---

## 🚀 Quick Start

### Step 1: Install Dependencies
```bash
npm install
Step 2: MongoDB Setup
Local MongoDB
bash
Copy code
mongod
MongoDB Atlas
Create a free cluster

Use the connection string in .env

Step 3: Environment Variables
Create a .env file in the backend root:

env
Copy code
PORT=5000
NODE_ENV=development
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
FRONTEND_URL=http://localhost:5173
❗ Never commit .env.

Step 4: Start Backend
bash
Copy code
npm run server
Expected:

arduino
Copy code
MongoDB connected
Server running on http://localhost:5000
Step 5: Start Frontend
bash
Copy code
npm run dev
🔒 Security Notes
Passwords are hashed

JWT protects private routes

Environment variables store secrets

🧪 Testing
Start MongoDB

Start backend

Start frontend

Register & login

Verify user-specific data isolation

📝 Next Steps
Add email service for OTP

Add rate limiting

Add validation middleware

Prepare production config

yaml
Copy code

---

## ✅ Now do exactly this

```bash
git add README.md SETUP.md
git commit -m "Sanitize README and setup documentation"
git push