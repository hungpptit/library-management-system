/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loan, Book } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Bell } from 'lucide-react';

interface OverdueTableProps {
  loans: Loan[];
  books: Book[];
  onSendReminder: (loanId: string) => void;
}

export const OverdueTable: React.FC<OverdueTableProps> = ({ loans, books, onSendReminder }) => {
  const overdueLoans = loans.filter(loan => loan.status === 'Overdue');

  const getBook = (bookId: string) => books.find(b => b.id === bookId);

  return (
    <Card className="overflow-hidden border-slate-100 !rounded-[12px]">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Reader Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Book Title</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Fine (20%)</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {overdueLoans.length > 0 ? (
              overdueLoans.map((loan) => {
                const book = getBook(loan.bookId);
                const fine = book ? (book.price * 0.2).toFixed(2) : '0.00';
                
                return (
                  <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-slate-900">{loan.userName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 line-clamp-1">{loan.bookTitle}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-red-500">
                        {new Date(loan.dueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-slate-900">${fine}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-sky-600 border-sky-100 hover:bg-sky-50"
                        onClick={() => onSendReminder(loan.id)}
                      >
                        <Bell className="w-3.5 h-3.5 mr-2" />
                        Remind
                      </Button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                  No overdue books at the moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

