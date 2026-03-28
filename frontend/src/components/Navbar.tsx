import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-primary flex items-center gap-2">
        🎯 KOL Platform
      </Link>
      
      <div className="flex gap-8 items-center">
        <Link to="/" className="text-gray-600 font-medium hover:text-primary transition-colors">Dashboard</Link>
        <Link to="/kols" className="text-gray-600 font-medium hover:text-primary transition-colors">KOLs</Link>
        {(user?.role === 'admin' || user?.role === 'client') && (
          <Link to="/jobs" className="text-gray-600 font-medium hover:text-primary transition-colors">Jobs</Link>
        )}
        {user?.role === 'kol' && (
          <Link to="/my-jobs" className="text-gray-600 font-medium hover:text-primary transition-colors">My Jobs</Link>
        )}
        {user?.role === 'admin' && (
          <Link to="/invites" className="text-gray-600 font-medium hover:text-primary transition-colors">
            📧 Invites
          </Link>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <span className="text-gray-800 font-medium">👤 {user?.full_name}</span>
        <button 
          onClick={handleLogout} 
          className="px-5 py-2 bg-gray-100 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-all text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;

