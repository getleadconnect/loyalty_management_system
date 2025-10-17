import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Gift, 
  MessageSquare, 
  BarChart3,
  Settings,
  LogOut,
  Package,
  Award,
  Image
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminSidebar({ isOpen, toggleSidebar }) {
  const location = useLocation();
  
  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
    },
    {
      title: 'Customers',
      icon: Users,
      path: '/admin/customers',
    },
    {
      title: 'Redeemed Customers',
      icon: Award,
      path: '/admin/redeemed-customers',
    },
    {
      title: 'Products',
      icon: Package,
      path: '/admin/products',
    },
    {
      title: 'Rewards',
      icon: Gift,
      path: '/admin/rewards',
    },
    {
      title: 'Communication',
      icon: MessageSquare,
      path: '/admin/communication',
    },
    {
      title: 'Ads Images',
      icon: Image,
      path: '/admin/ads-images',
    },
    {
      title: 'Reports',
      icon: BarChart3,
      path: '/admin/reports',
    },
    {
      title: 'Users',
      icon: Users,
      path: '/admin/users',
    },
    {
      title: 'Settings',
      icon: Settings,
      path: '/admin/settings',
    },
  ];


  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-screen w-64 bg-sky-50 shadow-xl transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo Header */}
          <div className="flex items-center gap-3 px-6 py-5 bg-white border-b border-sky-100">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <span className="text-sky-600 font-bold text-xl">L</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-sky-600">Loyalty System</h2>
              <p className="text-xs text-sky-500">Management Portal</p>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={cn(
                        "flex items-center gap-2 px-3 h-10 rounded-lg transition-all duration-200 group",
                        isActive 
                          ? "text-sky-700 shadow-md" 
                          : "bg-sky-100 text-gray-700 hover:bg-sky-200 hover:text-sky-700"
                      )}
                      style={isActive ? { backgroundColor: '#3b82f66b' } : {}}
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          toggleSidebar();
                        }
                      }}
                    >
                      <div className={cn(
                        "p-1.5 rounded-md transition-colors",
                        isActive ? "bg-white/20" : "bg-white/50"
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
            
          </nav>
          
          {/* Footer */}
          <div className="p-4 border-t border-sky-200">
            <div className="text-xs text-sky-600 text-center">
              © 2025 Loyalty System
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}