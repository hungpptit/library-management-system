/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from '../ui/Card';
import { Plus, UserPlus, BarChart3 } from 'lucide-react';

interface QuickActionsProps {
  onAddBook: () => void;
  onAddReader: () => void;
  onViewReports: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddBook,
  onAddReader,
  onViewReports,
}) => {
  const actions = [
    { label: 'Add New Book', icon: Plus, onClick: onAddBook, color: 'text-sky-500 bg-sky-50 border-sky-100' },
    { label: 'Register Reader', icon: UserPlus, onClick: onAddReader, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
    { label: 'Statistics Report', icon: BarChart3, onClick: onViewReports, color: 'text-violet-500 bg-violet-50 border-violet-100' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            onClick={action.onClick}
            className={`flex items-center gap-4 p-5 rounded-xl border transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] text-left group ${action.color}`}
          >
            <div className="p-3 rounded-lg bg-white shadow-sm group-hover:shadow-md transition-shadow">
              <Icon className="w-6 h-6" />
            </div>
            <span className="font-bold text-slate-800">{action.label}</span>
          </button>
        );
      })}
    </div>
  );
};

