/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loan } from '../../types';
import { LoanTable } from '../loans/LoanTable';
import { SectionHeader } from '../ui/SectionHeader';
import { Button } from '../ui/Button';
import { RefreshCw, Scan } from 'lucide-react';
import { loansService, ActiveLoan } from '../../services/loans.service';

interface AdminLoansProps {
  loans: Loan[];
  onReturn: (loan: Loan) => void;
  onScan: () => void;
}

export const AdminLoans: React.FC<AdminLoansProps> = ({
  loans,
  onReturn,
  onScan,
}) => {
  const [activeView, setActiveView] = useState<'queue' | 'returned' | 'all'>('all');
  const [backendLoans, setBackendLoans] = useState<Loan[]>([]);
  const [hasLoadedBackend, setHasLoadedBackend] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const normalizeLoan = (item: ActiveLoan): Loan => {
    const fine = (item.fineLogs || []).reduce(
      (sum, log) => sum + Number(log.fine_amount || 0),
      0,
    );

    return {
      id: String(item.id),
      bookId: String(item.book?.id ?? ''),
      bookTitle: item.book?.title || `Book #${item.id}`,
      readerId: String(item.reader_id),
      readerName: item.user?.display_name || `Reader #${item.reader_id}`,
      issueDate: Number(item.issue_date || Date.now()),
      dueDate: Number(item.due_date || Date.now()),
      returnDate: item.return_date ? Number(item.return_date) : undefined,
      status: (item.status as Loan['status']) || 'Borrowing',
      fee: fine,
    };
  };

  const refreshLoans = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const apiLoans = await loansService.getAllLoans();
      setBackendLoans(apiLoans.map(normalizeLoan));
      setHasLoadedBackend(true);
    } catch (error) {
      console.error('Failed to refresh loans from backend:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refreshLoans();

    const onLoansUpdated = () => {
      refreshLoans();
    };

    window.addEventListener('loans:updated', onLoansUpdated);
    return () => window.removeEventListener('loans:updated', onLoansUpdated);
  }, [refreshLoans]);

  const sourceLoans = hasLoadedBackend ? backendLoans : loans;

  const queueLoans = useMemo(
    () => sourceLoans.filter((loan) => loan.status === 'Borrowing' || loan.status === 'Overdue'),
    [sourceLoans],
  );

  const returnedLoans = useMemo(
    () => sourceLoans.filter((loan) => loan.status === 'Returned' || loan.status === 'Damaged' || loan.status === 'Lost'),
    [sourceLoans],
  );

  const visibleLoans = useMemo(() => {
    if (activeView === 'queue') return queueLoans;
    if (activeView === 'returned') return returnedLoans;
    return sourceLoans;
  }, [activeView, sourceLoans, queueLoans, returnedLoans]);

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Loan Management"
        subtitle="Track all active and past book loans"
        action={
          <div className="flex items-center gap-2">
            <Button onClick={refreshLoans} variant="secondary" className="flex items-center gap-2" isLoading={isRefreshing}>
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </Button>
            <Button onClick={onScan} variant="secondary" className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              <span>Scan Book</span>
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Button
          variant={activeView === 'queue' ? 'primary' : 'secondary'}
          onClick={() => setActiveView('queue')}
        >
          Return Queue ({queueLoans.length})
        </Button>
        <Button
          variant={activeView === 'returned' ? 'primary' : 'secondary'}
          onClick={() => setActiveView('returned')}
        >
          Returned ({returnedLoans.length})
        </Button>
        <Button
          variant={activeView === 'all' ? 'primary' : 'secondary'}
          onClick={() => setActiveView('all')}
        >
          All ({sourceLoans.length})
        </Button>
      </div>

      <LoanTable loans={visibleLoans} onReturn={onReturn} isAdmin showActionColumn={false} />
    </div>
  );
};

