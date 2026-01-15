# Smart Budget Application

A full-stack budget management application with secure authentication, expense tracking, settlements, and reminders.

## Features

- 🔐 Secure authentication (Password & OTP-based)
- 💰 Expense tracking and management
- 🤝 Settlement tracking
- ⏰ Reminders and notifications
- 📊 Data export (CSV, JSON, PDF)
- 🌐 Network access for testing

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- bcryptjs for password hashing

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/smart-budget
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/smart-budget

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Network IP (for testing from other devices)
NETWORK_IP=10.3.30.166
```

### 3. Start MongoDB

**Local MongoDB:**
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

**MongoDB Atlas (Cloud):**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string and update `MONGODB_URI` in `.env`

### 4. Start Backend Server

```bash
npm run server
# or for auto-reload
npm run dev:server
```

Backend will run on `http://localhost:5000`

### 5. Start Frontend Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with password
- `POST /api/auth/login` - Login with password
- `POST /api/auth/otp/generate` - Generate OTP
- `POST /api/auth/otp/verify` - Verify OTP and login/register
- `GET /api/auth/me` - Get current user (requires auth)

### Expenses
- `GET /api/expenses` - Get all expenses (requires auth)
- `POST /api/expenses` - Create expense (requires auth)
- `PUT /api/expenses/:id` - Update expense (requires auth)
- `DELETE /api/expenses/:id` - Delete expense (requires auth)
- `GET /api/expenses/stats` - Get statistics (requires auth)

### Settlements
- `GET /api/settlements` - Get all settlements (requires auth)
- `POST /api/settlements` - Create settlement (requires auth)
- `PUT /api/settlements/:id` - Update settlement (requires auth)
- `DELETE /api/settlements/:id` - Delete settlement (requires auth)

### Reminders
- `GET /api/reminders` - Get all reminders (requires auth)
- `POST /api/reminders` - Create reminder (requires auth)
- `PUT /api/reminders/:id` - Update reminder (requires auth)
- `DELETE /api/reminders/:id` - Delete reminder (requires auth)

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ Protected API routes
- ✅ CORS configuration
- ✅ Input validation
- ✅ Secure OTP generation and expiration

## Network Access

The server is configured to accept connections from other devices on your network:

- **Backend**: `http://YOUR_IP:5000`
- **Frontend**: `http://YOUR_IP:5173`

Update `VITE_API_URL` in frontend `.env` or `vite.config.js` to point to your backend IP.

## Production Deployment

1. Set `NODE_ENV=production`
2. Change `JWT_SECRET` to a strong random string
3. Use MongoDB Atlas or secure MongoDB instance
4. Configure proper CORS origins
5. Use HTTPS
6. Set up environment variables securely

## License

MIT

