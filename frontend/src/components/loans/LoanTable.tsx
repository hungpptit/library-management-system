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

  // Identify the earliest pending loan for each book so librarian knows who queued first
  const earliestPendingByBook = React.useMemo(() => {
    const map = new Map<string, string>();
    const pendingLoans = loans
      .filter((l) => l.status === 'Pending')
      .sort((a, b) => a.issueDate - b.issueDate || Number(a.id) - Number(b.id));

    for (const l of pendingLoans) {
      if (!map.has(l.bookId)) {
        map.set(l.bookId, l.id);
      }
    }
    return map;
  }, [loans]);

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
          {loans.map((loan) => {
            const earliestId = earliestPendingByBook.get(loan.bookId);
            const hasMultiplePendingForBook = loans.filter(
              (l) => l.status === 'Pending' && l.bookId === loan.bookId,
            ).length > 1;
            const isEarliestPending = !earliestId || earliestId === loan.id;

            return (
              <tr key={loan.id} className="hover:bg-slate-50/50 transition-colors">
                {isAdmin && <td className="px-6 py-4 font-medium text-slate-900">#{loan.id}</td>}
                <td className="px-6 py-4 font-medium text-slate-900">{loan.bookTitle}</td>
                {isAdmin && <td className="px-6 py-4 text-slate-600">{loan.readerName}</td>}
                <td className="px-6 py-4 text-slate-600">{format(loan.issueDate, 'MMM dd, yyyy')}</td>
                <td className="px-6 py-4 text-slate-600">{format(loan.dueDate, 'MMM dd, yyyy')}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1 items-start">
                    <Badge variant={getBadgeVariant(loan.status)}>
                      {loan.status}
                    </Badge>
                    {loan.status === 'Pending' && hasMultiplePendingForBook && (
                      isEarliestPending ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          Ưu tiên #1
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                          Sau #{earliestId}
                        </span>
                      )
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-slate-900">
                  {loan.fee > 0 ? `$${loan.fee.toFixed(2)}` : '-'}
                </td>
                {showActionColumn && (
                  <td className="px-6 py-4 text-right">
                    {isAdmin && loan.status === 'Pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant={isEarliestPending ? 'primary' : 'secondary'}
                          onClick={() => onApprove?.(loan)}
                          title={!isEarliestPending ? `Vui lòng duyệt phiếu #${earliestId} của bạn đọc nộp trước` : 'Duyệt phiếu mượn này'}
                        >
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

