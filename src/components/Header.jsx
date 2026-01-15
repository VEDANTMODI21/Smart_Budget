import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/Contexts/AuthContext';
import { Button } from './ui/button';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/dashboard" className="text-2xl font-bold text-blue-600">
            Smart Budget
          </Link>
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">Dashboard</Link>
                <Link to="/expenses" className="text-gray-700 hover:text-blue-600">Expenses</Link>
                <Link to="/settlements" className="text-gray-700 hover:text-blue-600">Settlements</Link>
                <Link to="/reminders" className="text-gray-700 hover:text-blue-600">Reminders</Link>
                <Link to="/export" className="text-gray-700 hover:text-blue-600">Export</Link>
                <span className="text-gray-600">Welcome, {user.email || user.name || 'User'}</span>
                <Button onClick={handleLogout} variant="outline">Logout</Button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600">Login</Link>
                <Link to="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}

