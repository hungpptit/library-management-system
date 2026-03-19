/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { LayoutDashboard, Book, Users, BookOpen, Settings, LogOut } from 'lucide-react';
import { motion } from 'motion/react';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'books', label: 'Books', icon: Book },
    { id: 'readers', label: 'Readers', icon: Users },
    { id: 'loans', label: 'Loans', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="hidden lg:flex flex-col gap-8 w-64 shrink-0 h-full">
      <div className="flex flex-col gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium
                ${isActive ? 'bg-sky-500 text-white card-shadow' : 'text-slate-500 hover:bg-slate-100'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeAdminNav"
                  className="ml-auto w-1.5 h-1.5 bg-white rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
