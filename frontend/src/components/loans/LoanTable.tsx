/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loan } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { format } from 'date-fns';

interface LoanTableProps {
  loans: Loan[];
  onReturn?: (loan: Loan) => void;
  onApprove?: (loan: Loan) => void;
  onReject?: (loan: Loan) => void;
  isAdmin?: boolean;
  showActionColumn?: boolean;
}

export const LoanTable: React.FC<LoanTableProps> = ({
  loans,
  onReturn,
  onApprove,
  onReject,
  isAdmin = false,
  showActionColumn = true,
}) => {
  const getBadgeVariant = (status: Loan['status']) => {
    if (status === 'Overdue' || status === 'Lost' || status === 'Damaged') return 'danger';
    if (status === 'Returned') return 'success';
    if (status === 'Pending') return 'warning';
    if (status === 'Cancelled') return 'neutral';
    return 'primary';
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white card-shadow">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Loan ID</th>}
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Book</th>
            {isAdmin && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reader</th>}
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Issue Date</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Due Date</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fee</th>
            {showActionColumn && (
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loans.map((loan) => (
            <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
              {isAdmin && <td className="px-6 py-4 font-medium text-slate-900">#{loan.id}</td>}
              <td className="px-6 py-4 font-medium text-slate-900">{loan.bookTitle}</td>
              {isAdmin && <td className="px-6 py-4 text-slate-600">{loan.readerName}</td>}
              <td className="px-6 py-4 text-slate-600">{format(loan.issueDate, 'MMM dd, yyyy')}</td>
              <td className="px-6 py-4 text-slate-600">{format(loan.dueDate, 'MMM dd, yyyy')}</td>
              <td className="px-6 py-4">
                <Badge variant={getBadgeVariant(loan.status)}>
                  {loan.status}
                </Badge>
              </td>
              <td className="px-6 py-4 font-medium text-slate-900">
                {loan.fee > 0 ? `$${loan.fee.toFixed(2)}` : '-'}
              </td>
              {showActionColumn && (
                <td className="px-6 py-4 text-right">
                  {isAdmin && loan.status === 'Pending' ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="primary" onClick={() => onApprove?.(loan)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => onReject?.(loan)}>
                        Reject
                      </Button>
                    </div>
                  ) : loan.status === 'Pending' ? (
                    <span className="text-sm font-medium text-amber-600">Waiting approval</span>
                  ) : loan.status !== 'Returned' && loan.status !== 'Cancelled' ? (
                    <Button size="sm" variant="secondary" onClick={() => onReturn?.(loan)}>
                      Return
                    </Button>
                  ) : null}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

