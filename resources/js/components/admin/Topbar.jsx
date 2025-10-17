import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  Lock,
  UserCircle,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminTopbar({ toggleSidebar }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      localStorage.removeItem('user_role');
      navigate('/login');
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'AD';
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'short', 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-200 z-40">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden p-2 hover:bg-sky-50"
          >
            <Menu className="h-5 w-5 text-gray-600" />
          </Button>
          
          {/* Page Title */}
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm text-gray-500">Welcome back! Here's what's happening with your loyalty system.</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Date */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-sky-50 rounded-lg">
            <Calendar className="h-4 w-4 text-sky-600" />
            <span className="text-sm text-gray-700">{today}</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-sky-50 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-sky-50 transition-colors"
            >
              {/* Avatar */}
              <div className="w-9 h-9 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-medium">
                  {getInitials(user?.name)}
                </span>
              </div>
              
              {/* Name and role */}
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
              
              {/* Dropdown arrow */}
              <ChevronDown className={cn(
                "h-4 w-4 text-gray-500 transition-transform duration-200",
                dropdownOpen && "rotate-180"
              )} />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1 overflow-hidden">
                {/* User info in dropdown (mobile) */}
                <div className="sm:hidden px-4 py-3 bg-gradient-to-r from-sky-400 to-blue-500">
                  <p className="text-sm font-medium text-white">{user?.name || 'Admin User'}</p>
                  <p className="text-xs text-sky-100">{user?.email}</p>
                </div>

                {/* Profile */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/admin/profile');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-sky-50 transition-colors"
                >
                  <div className="p-1.5 bg-sky-100 rounded-lg">
                    <UserCircle className="h-4 w-4 text-sky-600" />
                  </div>
                  <span>My Profile</span>
                </button>

                {/* Change Password */}
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    navigate('/admin/change-password');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-sky-50 transition-colors"
                >
                  <div className="p-1.5 bg-sky-100 rounded-lg">
                    <Lock className="h-4 w-4 text-sky-600" />
                  </div>
                  <span>Change Password</span>
                </button>

                {/* Divider */}
                <div className="my-1 border-t border-gray-200"></div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <div className="p-1.5 bg-red-100 rounded-lg">
                    <LogOut className="h-4 w-4 text-red-600" />
                  </div>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}