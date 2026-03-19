/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from '../ui/Card';
import { Book, Users, BookOpen, AlertCircle } from 'lucide-react';

interface AdminStatsProps {
  totalBooks: number;
  totalReaders: number;
  activeLoans: number;
  overdueLoans: number;
}

export const AdminStats: React.FC<AdminStatsProps> = ({
  totalBooks,
  totalReaders,
  activeLoans,
  overdueLoans,
}) => {
  const stats = [
    { label: 'Total Books', value: totalBooks, icon: Book, color: 'text-sky-600 bg-sky-50 border-sky-100' },
    { label: 'Total Readers', value: totalReaders, icon: Users, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { label: 'Active Loans', value: activeLoans, icon: BookOpen, color: 'text-amber-600 bg-amber-50 border-amber-100' },
    { label: 'Overdue', value: overdueLoans, icon: AlertCircle, color: 'text-red-600 bg-red-50 border-red-100' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} className={`flex items-center gap-6 p-6 border transition-all hover:shadow-md ${stat.color} !rounded-[12px]`}>
            <div className="p-4 rounded-xl bg-white shadow-sm">
              <Icon className="w-8 h-8" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold opacity-70 uppercase tracking-wider">{stat.label}</span>
              <span className="text-3xl font-black">{stat.value}</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

