import React from 'react';
import { Library, Search, BookOpen, User, LogOut, LayoutDashboard, LogIn } from 'lucide-react';
import { motion } from 'motion/react';

interface NavigationProps {
  userRole?: 'admin' | 'reader';
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  onLoginClick: () => void; // Thêm prop này
}

export const Navigation: React.FC<NavigationProps> = ({
  userRole,
  activeTab,
  onTabChange,
  onLogout,
  onLoginClick,
}) => {
  // Logic phân quyền menu: Admin không thấy Home, Reader thấy Home
  const navItems = userRole === 'admin' 
    ? [
        { id: 'admin', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'books', label: 'Books', icon: Library },
        { id: 'loans', label: 'Loans', icon: BookOpen },
        { id: 'readers', label: 'Readers', icon: User },
      ]
    : [
        { id: 'home', label: 'Home', icon: Search },
        { id: 'my-books', label: 'My Books', icon: BookOpen },
        { id: 'profile', label: 'Profile', icon: User },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 md:top-0 md:bottom-auto md:border-t-0 md:border-b md:flex md:items-center md:justify-between z-50">
      <div className="hidden md:flex items-center gap-2 text-sky-600 font-bold text-xl">
        <Library className="w-8 h-8" />
        <span>LMS</span>
      </div>

      <div className="flex items-center justify-around md:justify-center md:gap-8 w-full md:w-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                relative flex flex-col md:flex-row items-center gap-1 md:gap-2 transition-all px-2 py-1
                ${isActive ? 'text-sky-500' : 'text-slate-400 hover:text-slate-600'}
              `}
            >
              <div className={`p-2 rounded-xl transition-all ${isActive ? 'bg-sky-50' : ''}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] md:text-sm font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute -bottom-[12px] left-2 right-2 h-1 bg-sky-400 rounded-t-full"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Nút Logout hoặc Login dựa trên trạng thái đăng nhập */}
      {userRole ? (
        <button
          onClick={onLogout}
          className="hidden md:flex items-center gap-2 text-slate-400 hover:text-red-500 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      ) : (
        <button
          onClick={onLoginClick}
          className="hidden md:flex items-center gap-2 text-sky-600 hover:text-sky-700 transition-all font-bold"
        >
          <LogIn className="w-5 h-5" />
          <span>Login</span>
        </button>
      )}
    </nav>
  );
};