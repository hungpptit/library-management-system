/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import { Input } from '../ui/Input';

interface AdminHeaderProps {
  title: string;
  user: any;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, user }) => {
  return (
    <div className="flex items-center justify-between mb-12">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-slate-500 font-medium">Welcome back, {user?.displayName}</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:block w-64">
          <Input
            placeholder="Search anything..."
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <button
          aria-label="Open notifications"
          title="Notifications"
          className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-sky-500 transition-all card-shadow"
        >
          <Bell className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="flex flex-col items-end">
            <span className="text-sm font-bold text-slate-900">{user?.displayName}</span>
            <span className="text-xs font-medium text-slate-400">Administrator</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-500">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

