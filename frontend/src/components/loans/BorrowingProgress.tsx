/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loan } from '../../types';
import { Card } from '../ui/Card';
import { differenceInDays, format } from 'date-fns';
import { motion } from 'motion/react';
import { Clock, AlertTriangle } from 'lucide-react';

interface BorrowingProgressProps {
  loan: Loan;
}

export const BorrowingProgress: React.FC<BorrowingProgressProps> = ({ loan }) => {
  const totalDays = differenceInDays(loan.dueDate, loan.issueDate);
  const daysLeft = differenceInDays(loan.dueDate, Date.now());
  const progress = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));
  const isOverdue = daysLeft < 0;

  return (
    <Card className="flex flex-col gap-4 p-6 border-l-4 border-sky-500">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-slate-900">{loan.bookTitle}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>Due on {format(loan.dueDate, 'MMM dd, yyyy')}</span>
          </div>
        </div>
        {isOverdue && (
          <div className="p-2 bg-red-50 rounded-xl text-red-500">
            <AlertTriangle className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
          <span className={isOverdue ? 'text-red-500' : 'text-sky-500'}>
            {isOverdue ? 'Overdue' : `${daysLeft} days left`}
          </span>
          <span className="text-slate-400">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={`h-full rounded-full ${isOverdue ? 'bg-red-500' : 'bg-sky-500'}`}
          />
        </div>
      </div>
    </Card>
  );
};

