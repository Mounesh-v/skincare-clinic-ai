import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Package,
  ShoppingCart,
  TextQuote,      // instead of FilterText
  BarChart3,
  Settings,       // instead of Setting
  LogOut,         // instead of Logout
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

const AdminSidebar = ({ isOpen, setOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/admin/dashboard',
    },
    {
      name: 'Users',
      icon: Users,
      path: '/admin/users',
    },
    {
      name: 'Assessments',
      icon: ClipboardList,
      path: '/admin/assessments',
    },
    {
      name: 'Products',
      icon: Package,
      path: '/admin/products',
    },
    {
      name: 'Orders',
      icon: ShoppingCart,
      path: '/admin/orders',
    },
    {
      name: 'Content',
      icon: TextQuote, // use any suitable icon here
      path: '/admin/content',
    },
    {
      name: 'Analytics',
      icon: BarChart3,
      path: '/admin/analytics',
    },
    {
      name: 'Settings',
      icon: Settings,
      path: '/admin/settings',
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen bg-slate-900 text-white 
          transition-all duration-300
          ${isOpen ? 'w-64' : 'w-20'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
          {isOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg">SkinCare AI</h1>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </div>
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setOpen(!isOpen)}
          className="absolute -right-3 top-20 w-6 h-6 bg-slate-800 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors border border-slate-700"
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg 
                      transition-all duration-200 
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }
                      ${!isOpen ? 'justify-center' : ''}
                    `}
                    title={!isOpen ? item.name : ''}
                  >
                    <Icon className={isOpen ? 'w-5 h-5' : 'w-6 h-6'} />
                    {isOpen && (
                      <span className="font-medium text-sm">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="border-t border-slate-800 p-2">
          <button
            onClick={handleLogout}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg 
              text-slate-300 hover:bg-red-500/10 hover:text-red-400 
              transition-all duration-200 
              ${!isOpen ? 'justify-center' : ''}
            `}
            title={!isOpen ? 'Logout' : ''}
          >
            <LogOut className={isOpen ? 'w-5 h-5' : 'w-6 h-6'} />
            {isOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
