import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, Printer, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { loansService, ActiveLoan } from '../services/loans.service';
import { Button } from './ui/Button';
import { EmptyState } from './ui/EmptyState';
import { SectionHeader } from './ui/SectionHeader';

const formatDate = (timestamp?: number) => {
  if (!timestamp) return 'N/A';
  return new Date(Number(timestamp)).toLocaleDateString('vi-VN');
};

const getOverdueDays = (dueDate?: number) => {
  if (!dueDate) return 0;
  const diff = Date.now() - Number(dueDate);
  if (diff <= 0) return 0;
  return Math.ceil(diff / (24 * 60 * 60 * 1000));
};

export const MyBorrowedBooks: React.FC = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = useMemo(() => {
    const profile = user as any;
    if (typeof profile?.id === 'number') return profile.id;

    if (typeof profile?.uid === 'string') {
      const parsed = Number(profile.uid);
      if (!Number.isNaN(parsed)) return parsed;
    }

    return null;
  }, [user]);

  const loadMyLoans = useCallback(async () => {
    if (!currentUserId) {
      setError('Current account is missing backend user id. Please sign in again.');
      setLoans([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await loansService.getMyActiveLoans(currentUserId);
      setLoans(data);
    } catch (loadError) {
      console.error(loadError);
      setError('Unable to load active borrowed books.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUserId]);

  const copyLoanId = async (loanId: number) => {
    try {
      await navigator.clipboard.writeText(`#${loanId}`);
      toast.success(`Loan id #${loanId} copied`);
    } catch (copyError) {
      console.error(copyError);
      toast.error('Copy failed');
    }
  };

  const printLoanId = (loanId: number) => {
    const popup = window.open('', '_blank', 'width=360,height=420');
    if (!popup) {
      toast.error('Unable to open print window');
      return;
    }

    popup.document.write(`
      <html>
        <head><title>Loan #${loanId}</title></head>
        <body style="font-family: Arial, sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
          <div style="text-align:center; border:2px dashed #0ea5e9; padding:32px; border-radius:16px;">
            <p style="margin:0; color:#64748b; font-size:14px;">Loan ID</p>
            <h1 style="margin:12px 0 0; color:#0f172a; font-size:48px;">#${loanId}</h1>
          </div>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  useEffect(() => {
    loadMyLoans();
  }, [loadMyLoans]);

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="My Borrowed Books"
        subtitle="Copy or print your loan id before going to the librarian desk"
        action={
          <Button onClick={loadMyLoans} variant="secondary" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </Button>
        }
      />

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 text-slate-500">Loading data...</div>
      ) : loans.length === 0 ? (
        <EmptyState
          title="No active borrowed books"
          description="Your current loan ids will appear here after borrowing."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loans.map((loan) => (
            <div key={loan.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <p className="text-xs text-slate-500">Loan ID</p>
              <p className="text-2xl font-bold text-slate-900">#{loan.id}</p>

              {loan.status === 'Overdue' && (
                <p className="mt-2 inline-block rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                  Overdue {getOverdueDays(loan.due_date)} day(s)
                </p>
              )}

              <div className="mt-4 space-y-1 text-sm text-slate-600">
                <p><strong>Book title:</strong> {loan.book?.title || 'N/A'}</p>
                <p><strong>Issue date:</strong> {formatDate(loan.issue_date)}</p>
                <p><strong>Due date:</strong> {formatDate(loan.due_date)}</p>
                <p><strong>Status:</strong> {loan.status}</p>
              </div>

              <div className="mt-4 flex gap-2">
                <Button onClick={() => copyLoanId(loan.id)} className="flex items-center gap-2">
                  <Copy className="w-4 h-4" />
                  <span>Copy ID</span>
                </Button>
                <Button onClick={() => printLoanId(loan.id)} variant="secondary" className="flex items-center gap-2">
                  <Printer className="w-4 h-4" />
                  <span>Print ID</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
