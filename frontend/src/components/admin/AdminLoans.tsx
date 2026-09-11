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
import { Pagination } from '../ui/Pagination';

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
      toast.success(`Đã duyệt phiếu mượn #${loan.id} thành công!`);
      window.dispatchEvent(new CustomEvent('loans:updated'));
      await refreshLoans();
    } catch (error: any) {
      console.error(error);
      const rawMsg = error?.response?.data?.message || '';
      let friendlyMsg = rawMsg;
      if (typeof rawMsg === 'string') {
        if (rawMsg.includes('FIFO') || rawMsg.includes('Earliest request is loan') || rawMsg.includes('đăng ký trước')) {
          const match = rawMsg.match(/#(\d+)/);
          const earliestId = match ? match[1] : '';
          friendlyMsg = `Cuốn sách này đang có bạn đọc đăng ký trước (Phiếu #${earliestId}). Vui lòng duyệt phiếu #${earliestId} trước để đảm bảo công bằng!`;
        } else if (rawMsg.includes('out of stock') || rawMsg.includes('not available') || rawMsg.includes('hết bản')) {
          friendlyMsg = 'Sách này hiện đã hết bản sẵn sàng trên kệ. Yêu cầu sẽ tiếp tục chờ khi có sách được trả về.';
        } else if (rawMsg.includes('overdue') || rawMsg.includes('quá hạn')) {
          friendlyMsg = 'Độc giả đang có sách mượn quá hạn chưa trả.';
        } else if (rawMsg.includes('giới hạn') || rawMsg.includes('limit')) {
          friendlyMsg = 'Độc giả đã đạt tối đa 5 cuốn sách đang xử lý/mượn.';
        }
      }
      toast.error(friendlyMsg || 'Không thể duyệt phiếu mượn này');
    }
  };

  const rejectPendingLoan = async (loan: Loan) => {
    try {
      await loansService.rejectPendingLoan(Number(loan.id));
      toast.success(`Đã từ chối phiếu mượn #${loan.id}`);
      window.dispatchEvent(new CustomEvent('loans:updated'));
      await refreshLoans();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.response?.data?.message || 'Không thể từ chối phiếu mượn này');
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

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const visibleLoans = useMemo(() => {
    if (activeView === 'pending') return pendingLoans;
    if (activeView === 'queue') return queueLoans;
    if (activeView === 'returned') return returnedLoans;
    if (activeView === 'damaged') return damagedLoans;
    if (activeView === 'lost') return lostLoans;
    return sourceLoans;
  }, [activeView, sourceLoans, pendingLoans, queueLoans, returnedLoans, damagedLoans, lostLoans]);

  const totalPages = Math.ceil(visibleLoans.length / itemsPerPage);

  const handleTabChange = (view: typeof activeView) => {
    setActiveView(view);
    setCurrentPage(1);
  };

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginatedLoans = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return visibleLoans.slice(startIndex, startIndex + itemsPerPage);
  }, [visibleLoans, currentPage, itemsPerPage]);

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
          onClick={() => handleTabChange('pending')}
        >
          Pending Requests ({pendingLoans.length})
        </Button>
        <Button
          variant={activeView === 'queue' ? 'primary' : 'secondary'}
          onClick={() => handleTabChange('queue')}
        >
          Return Queue ({queueLoans.length})
        </Button>
        <Button
          variant={activeView === 'returned' ? 'primary' : 'secondary'}
          onClick={() => handleTabChange('returned')}
        >
          Returned ({returnedLoans.length})
        </Button>
        <Button
          variant={activeView === 'damaged' ? 'primary' : 'secondary'}
          onClick={() => handleTabChange('damaged')}
        >
          Damaged ({damagedLoans.length})
        </Button>
        <Button
          variant={activeView === 'lost' ? 'primary' : 'secondary'}
          onClick={() => handleTabChange('lost')}
        >
          Lost ({lostLoans.length})
        </Button>
        <Button
          variant={activeView === 'all' ? 'primary' : 'secondary'}
          onClick={() => handleTabChange('all')}
        >
          All ({sourceLoans.length})
        </Button>
      </div>

      <LoanTable
        loans={paginatedLoans}
        onReturn={onReturn}
        onApprove={approvePendingLoan}
        onReject={rejectPendingLoan}
        isAdmin
        showActionColumn={activeView === 'pending'}
      />

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <p className="text-xs text-slate-500">
            Hiển thị <span className="font-semibold text-slate-800">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-semibold text-slate-800">{Math.min(currentPage * itemsPerPage, visibleLoans.length)}</span> trên tổng số <span className="font-semibold text-slate-800">{visibleLoans.length}</span> phiếu mượn
          </p>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

