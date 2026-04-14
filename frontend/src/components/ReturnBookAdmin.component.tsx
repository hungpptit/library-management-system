import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { loansService, ActiveLoan } from '../services/loans.service';
import { Button } from './ui/Button';
import { SectionHeader } from './ui/SectionHeader';

type ReturnCondition = 'Clean' | 'Damaged' | 'Lost';

const VND_PER_OVERDUE_DAY = 5000;

const formatVnd = (value: number) => `${Math.round(value).toLocaleString('vi-VN')} VND`;

export const ReturnBookAdmin: React.FC = () => {
  const [loanIdInput, setLoanIdInput] = useState('');
  const [loan, setLoan] = useState<ActiveLoan | null>(null);
  const [condition, setCondition] = useState<ReturnCondition>('Clean');
  const [adminNote, setAdminNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateOverdueDays = () => {
    if (!loan?.due_date) return 0;
    const now = Date.now();
    const diff = now - Number(loan.due_date);
    if (diff <= 0) return 0;
    return Math.ceil(diff / (24 * 60 * 60 * 1000));
  };

  const calculateOverdueFine = () => calculateOverdueDays() * VND_PER_OVERDUE_DAY;

  const calculateDamageFine = () => {
    const bookPrice = Number(loan?.book?.price || 0);
    if (condition === 'Damaged') return bookPrice * 0.5;
    if (condition === 'Lost') return bookPrice * 1.5;
    return 0;
  };

  const totalFine = useMemo(() => {
    if (condition === 'Clean') return 0;
    return calculateOverdueFine() + calculateDamageFine();
  }, [condition, loan]);

  const isOverdue = () => calculateOverdueDays() > 0;

  const printReceipt = (
    selectedLoan: ActiveLoan,
    processedCondition: 'Clean' | 'Damaged' | 'Lost',
    fineValue: number,
  ) => {
    const popup = window.open('', '_blank', 'width=700,height=860');
    if (!popup) {
      toast.error('Unable to open receipt print window');
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>Bien lai tra sach #${selectedLoan.id}</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 32px; color: #0f172a;">
          <h2 style="margin: 0 0 8px;">LIBRARY - RETURN RECEIPT</h2>
          <p style="margin: 0 0 24px; color: #64748b;">Printed at: ${new Date().toLocaleString('vi-VN')}</p>
          <p><strong>Loan ID:</strong> #${selectedLoan.id}</p>
          <p><strong>Reader:</strong> ${selectedLoan.user?.display_name || `User #${selectedLoan.reader_id}`}</p>
          <p><strong>Book:</strong> ${selectedLoan.book?.title || 'N/A'}</p>
          <p><strong>Return condition:</strong> ${processedCondition}</p>
          <p><strong>Total fine:</strong> ${formatVnd(fineValue)}</p>
          <hr style="margin: 24px 0;" />
          <p style="font-size: 12px; color: #64748b;">You can save this receipt as PDF from the browser print dialog.</p>
        </body>
      </html>
    `);

    popup.document.close();
    popup.focus();
    popup.print();
  };

  const searchLoan = async () => {
    const normalizedInput = loanIdInput.trim().replace(/^#\s*/, '');
    const loanId = Number(normalizedInput);
    if (!/^\d+$/.test(normalizedInput) || Number.isNaN(loanId) || loanId < 0) {
      setError('Please enter a valid loan id');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const found = await loansService.searchLoan(loanId);
      setLoan(found);
      setCondition('Clean');
      setAdminNote('');
    } catch (searchError: any) {
      console.error(searchError);
      setLoan(null);
      setError(searchError?.response?.data?.message || 'Loan not found or loan is not in Borrowing status');
    } finally {
      setIsLoading(false);
    }
  };

  const confirmClean = async () => {
    if (!loan) return;
    setIsSubmitting(true);
    try {
      const response = await loansService.confirmReturnClean(loan.id);
      const processedLoan = response?.loan || loan;
      const fineValue = 0;

      toast.success(`Return processed successfully. Fine: ${formatVnd(fineValue)}`);
      window.dispatchEvent(new CustomEvent('loans:updated'));

      if (window.confirm('Do you want to print a receipt?')) {
        printReceipt(processedLoan, 'Clean', fineValue);
      }

      resetForm();
    } catch (submitError) {
      console.error(submitError);
      toast.error('Failed to confirm clean return');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reportDamage = async () => {
    if (!loan || condition === 'Clean') return;

    setIsSubmitting(true);
    try {
      const overdueDays = calculateOverdueDays();
      const response = await loansService.reportDamageOrLoss({
        loanId: loan.id,
        condition: condition as 'Damaged' | 'Lost',
        overdueDays,
        adminNote,
      });

      const processedLoan = response?.loan || loan;
      const fineValue = Number(response?.totalFine || 0);

      toast.success(`Return processed successfully. Fine: ${formatVnd(fineValue)}`);
      window.dispatchEvent(new CustomEvent('loans:updated'));

      if (window.confirm('Do you want to print a receipt?')) {
        printReceipt(processedLoan, condition, fineValue);
      }

      resetForm();
    } catch (submitError) {
      console.error(submitError);
      toast.error('Failed to report damaged/lost return');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setLoanIdInput('');
    setLoan(null);
    setCondition('Clean');
    setAdminNote('');
    setError(null);
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        title="Return Validation"
        subtitle="Enter loan id to confirm clean return or report damaged/lost"
      />

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            value={loanIdInput}
            onChange={(e) => setLoanIdInput(e.target.value)}
            placeholder="Enter loan id (example: 1 or #1)"
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-200"
          />
          <Button onClick={searchLoan} className="flex items-center justify-center gap-2" disabled={isLoading}>
            <Search className="w-4 h-4" />
            <span>{isLoading ? 'Searching...' : 'Search Loan'}</span>
          </Button>
        </div>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </div>

      {loan && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
            <p><strong>Reader:</strong> {loan.user?.display_name || `User #${loan.user?.id || loan.reader_id}`}</p>
            <p><strong>Book:</strong> {loan.book?.title || 'N/A'}</p>
            <p><strong>Book price:</strong> {formatVnd(Number(loan.book?.price || 0))}</p>
            <p className={isOverdue() ? 'text-rose-600 font-semibold' : ''}>
              <strong>Due date:</strong> {new Date(Number(loan.due_date)).toLocaleDateString('vi-VN')}
              {isOverdue() ? ` (Overdue ${calculateOverdueDays()} day(s))` : ' (On time)'}
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-semibold text-slate-800">Book condition</p>
            <div className="flex flex-wrap gap-2">
              {([
                { key: 'Clean', label: 'Clean' },
                { key: 'Damaged', label: 'Damaged' },
                { key: 'Lost', label: 'Lost' },
              ] as const).map((item) => (
                <button
                  key={item.key}
                  onClick={() => setCondition(item.key)}
                  className={`rounded-xl px-4 py-2 border text-sm transition-all ${
                    condition === item.key
                      ? 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {condition !== 'Clean' && (
            <div className="space-y-2">
              <p className="font-semibold text-slate-800">Admin note (optional)</p>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-200"
                placeholder="Describe physical condition details..."
              />
            </div>
          )}

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Automatic fine calculation</span>
            </div>
            <p className="mt-1">Overdue fine: {formatVnd(calculateOverdueFine())}</p>
            <p>Damage/loss fine: {formatVnd(calculateDamageFine())}</p>
            <p className="font-bold mt-1">Total: {formatVnd(totalFine)}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {condition === 'Clean' ? (
              <Button onClick={confirmClean} disabled={isSubmitting} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? 'Processing...' : 'Confirm Clean Return'}</span>
              </Button>
            ) : (
              <Button onClick={reportDamage} disabled={isSubmitting} className="bg-rose-600 hover:bg-rose-700 text-white">
                {isSubmitting ? 'Processing...' : 'Report Damaged/Lost'}
              </Button>
            )}

            <Button onClick={resetForm} variant="secondary">Reset</Button>
          </div>
        </div>
      )}

    </div>
  );
};
