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

  const accountStatus = useMemo(() => {
    const profile = user as any;
    const isAccountActive = profile?.status !== 'deleted';
    const hasCardExpiry = typeof profile?.cardExpiry === 'number';
    const isCardValid = hasCardExpiry ? Number(profile.cardExpiry) >= Date.now() : false;

    if (!isAccountActive) {
      return {
        tone: 'danger' as const,
        text: 'Your account is disabled. Please contact the librarian.',
      };
    }

    if (!hasCardExpiry) {
      return {
        tone: 'warning' as const,
        text: 'Library card expiry is not set yet.',
      };
    }

    if (!isCardValid) {
      return {
        tone: 'warning' as const,
        text: 'Your library card has expired. Please renew it before borrowing.',
      };
    }

    return {
      tone: 'success' as const,
      text: `Account active. Card valid until ${new Date(Number(profile.cardExpiry)).toLocaleDateString('vi-VN')}.`,
    };
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

    const onLoansUpdated = () => {
      loadMyLoans();
    };

    const pollId = window.setInterval(loadMyLoans, 15000);
    window.addEventListener('loans:updated', onLoansUpdated);

    return () => {
      window.clearInterval(pollId);
      window.removeEventListener('loans:updated', onLoansUpdated);
    };
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

      <div
        className={`rounded-2xl p-4 text-sm font-medium ${
          accountStatus.tone === 'danger'
            ? 'border border-rose-200 bg-rose-50 text-rose-700'
            : accountStatus.tone === 'warning'
            ? 'border border-amber-200 bg-amber-50 text-amber-800'
            : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
        }`}
      >
        {accountStatus.text}
      </div>

      {/* Quota Progress Bar & Library Rules Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-2xl border border-slate-100 bg-slate-50/50 p-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-700">Sách đang mượn & Chờ duyệt (Borrowing Limit):</span>
            <span className="text-sm font-bold text-sky-600">{loans.length} / 5 cuốn</span>
          </div>
          <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                loans.length >= 5 ? 'bg-rose-500' : loans.length >= 3 ? 'bg-amber-500' : 'bg-sky-500'
              }`}
              style={{ width: `${Math.min(100, (loans.length / 5) * 100)}%` }}
            ></div>
          </div>
          {loans.length >= 5 && (
            <p className="text-xs text-rose-600 mt-2 font-medium">⚠️ Bạn đã đạt giới hạn mượn tối đa 5 cuốn sách. Vui lòng hoàn thành trả sách cũ trước khi đăng ký mượn thêm.</p>
          )}
        </div>
        
        <div className="rounded-2xl border border-sky-100 bg-sky-50/20 p-5 text-xs text-slate-600 space-y-2">
          <p className="font-bold text-sky-800 text-sm mb-2">📌 Quy định thư viện</p>
          <div className="flex justify-between border-b border-sky-100 pb-1.5">
            <span>Hạn mức tối đa:</span>
            <span className="font-bold text-slate-800">5 cuốn/độc giả</span>
          </div>
          <div className="flex justify-between border-b border-sky-100 pb-1.5">
            <span>Thời hạn mượn:</span>
            <span className="font-bold text-slate-800">30 ngày/cuốn</span>
          </div>
          <div className="flex justify-between border-b border-sky-100 pb-1.5">
            <span>Gia hạn thẻ:</span>
            <span className="font-bold text-slate-800">Liên hệ Thủ thư</span>
          </div>
          <div className="flex justify-between border-b border-sky-100 pb-1.5">
            <span>Quá hạn phạt:</span>
            <span className="font-bold text-rose-600">5% giá bìa/ngày</span>
          </div>
          <div className="flex justify-between border-b border-sky-100 pb-1.5">
            <span>Làm hỏng sách:</span>
            <span className="font-bold text-rose-600">Phạt 50% giá bìa</span>
          </div>
          <div className="flex justify-between">
            <span>Làm mất sách:</span>
            <span className="font-bold text-rose-600">Phạt 150% giá bìa</span>
          </div>
        </div>
      </div>

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
              {loan.status === 'Pending' && (
                <div className="mt-2 flex flex-col gap-1">
                  <p className="inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                    Waiting for librarian confirmation
                  </p>
                  <p className="text-xs font-medium text-amber-700">
                    Queue position: #{loan.queue_position || 1}
                  </p>
                </div>
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
