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
import { toast } from 'react-hot-toast';

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
  const [activeView, setActiveView] = useState<'pending' | 'queue' | 'returned' | 'damaged' | 'lost' | 'all'>('all');
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

  const approvePendingLoan = async (loan: Loan) => {
    try {
      await loansService.approvePendingLoan(Number(loan.id));
      toast.success(`Loan #${loan.id} approved`);
      window.dispatchEvent(new CustomEvent('loans:updated'));
      await refreshLoans();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to approve loan');
    }
  };

  const rejectPendingLoan = async (loan: Loan) => {
    try {
      await loansService.rejectPendingLoan(Number(loan.id));
      toast.success(`Loan #${loan.id} rejected`);
      window.dispatchEvent(new CustomEvent('loans:updated'));
      await refreshLoans();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Failed to reject loan');
    }
  };

  useEffect(() => {
    refreshLoans();

    const onLoansUpdated = () => {
      refreshLoans();
    };

    window.addEventListener('loans:updated', onLoansUpdated);
    return () => window.removeEventListener('loans:updated', onLoansUpdated);
  }, [refreshLoans]);

  const sourceLoans = hasLoadedBackend ? backendLoans : loans;

  const pendingLoans = useMemo(
    () =>
      sourceLoans
        .filter((loan) => loan.status === 'Pending')
        .sort((a, b) => (a.issueDate - b.issueDate) || (Number(a.id) - Number(b.id))),
    [sourceLoans],
  );

  const queueLoans = useMemo(
    () => sourceLoans.filter((loan) => loan.status === 'Borrowing' || loan.status === 'Overdue'),
    [sourceLoans],
  );

  const returnedLoans = useMemo(
    () => sourceLoans.filter((loan) => loan.status === 'Returned'),
    [sourceLoans],
  );

  const damagedLoans = useMemo(
    () => sourceLoans.filter((loan) => loan.status === 'Damaged'),
    [sourceLoans],
  );

  const lostLoans = useMemo(
    () => sourceLoans.filter((loan) => loan.status === 'Lost'),
    [sourceLoans],
  );

  const visibleLoans = useMemo(() => {
    if (activeView === 'pending') return pendingLoans;
    if (activeView === 'queue') return queueLoans;
    if (activeView === 'returned') return returnedLoans;
    if (activeView === 'damaged') return damagedLoans;
    if (activeView === 'lost') return lostLoans;
    return sourceLoans;
  }, [activeView, sourceLoans, pendingLoans, queueLoans, returnedLoans, damagedLoans, lostLoans]);

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
          variant={activeView === 'pending' ? 'primary' : 'secondary'}
          onClick={() => setActiveView('pending')}
        >
          Pending Requests ({pendingLoans.length})
        </Button>
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
          variant={activeView === 'damaged' ? 'primary' : 'secondary'}
          onClick={() => setActiveView('damaged')}
        >
          Damaged ({damagedLoans.length})
        </Button>
        <Button
          variant={activeView === 'lost' ? 'primary' : 'secondary'}
          onClick={() => setActiveView('lost')}
        >
          Lost ({lostLoans.length})
        </Button>
        <Button
          variant={activeView === 'all' ? 'primary' : 'secondary'}
          onClick={() => setActiveView('all')}
        >
          All ({sourceLoans.length})
        </Button>
      </div>

      <LoanTable
        loans={visibleLoans}
        onReturn={onReturn}
        onApprove={approvePendingLoan}
        onReject={rejectPendingLoan}
        isAdmin
        showActionColumn={activeView === 'pending'}
      />
    </div>
  );
};

