# Smart Budget Application

A full-stack budget management application with secure authentication, expense tracking, settlements, and reminders.

## Features

- 🔐 Secure authentication (Password & OTP-based)
- 💰 Expense tracking and management
- 🤝 Settlement tracking
- ⏰ Reminders and notifications
- 📊 Data export (CSV, JSON, PDF)
- 🌐 Optional network access for testing

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
2. Configure Environment Variables
Create a .env file in the root directory:


3. Start MongoDB
Local MongoDB

bash
Copy code
mongod
MongoDB Atlas

Create a free cluster

Use the provided connection string in MONGODB_URI

4. Start Backend Server
bash
Copy code
npm run server
Backend runs on:

arduino
Copy code
http://localhost:5000
5. Start Frontend
bash
Copy code
npm run dev
Frontend runs on:

arduino
Copy code
http://localhost:5173
API Endpoints
Authentication
POST /api/auth/register

POST /api/auth/login

POST /api/auth/otp/generate

POST /api/auth/otp/verify

GET /api/auth/me

Expenses
GET /api/expenses

POST /api/expenses

PUT /api/expenses/:id

DELETE /api/expenses/:id

Settlements
GET /api/settlements

POST /api/settlements

PUT /api/settlements/:id

DELETE /api/settlements/:id

Reminders
GET /api/reminders

POST /api/reminders

PUT /api/reminders/:id

DELETE /api/reminders/:id

License
MIT

# Smart Budget App

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Smart_Budget
   npm install
   ```

2. **Create `.env` file** (copy from `.env.example`)
   ```bash
   cp .env.example .env
   ```

3. **Configure your email** in `.env`:
   - Go to https://myaccount.google.com/security
   - Enable 2-factor authentication
   - Generate "App Password" for Mail
   - Copy the 16-character password
   - Paste into `.env`:
     ```
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASS=your-16-char-password
     ```

4. **Start MongoDB** (if using local)
   ```bash
   mongod
   ```

5. **Run the app**
   ```bash
   npm run dev:all
   ```

## How It Works
- Each user has their own `.env` file (NOT committed to git)
- OTP emails are sent from the user's configured email
- Your `.env` is private and only on your machine
- Other users create their own `.env` with their email credentials