import apiInstance from './apiService';

export interface ActiveLoan {
  id: number;
  reader_id: number;
  issue_date: number;
  due_date: number;
  return_date?: number;
  status: 'Pending' | 'Borrowing' | 'Returned' | 'Overdue' | 'Lost' | 'Damaged' | 'Cancelled';
  queue_position?: number;
  return_condition?: string;
  book?: {
    id: number;
    title: string;
    price?: number;
  };
  user?: {
    id: number;
    display_name?: string;
    email?: string;
  };
  fineLogs?: FineLogItem[];
}

export interface FineLogItem {
  id: number;
  loan_id: number;
  fine_amount: number;
  reason?: string;
  status: string;
  created_at: number;
}

export interface ReportDamagePayload {
  loanId: number;
  condition: 'Damaged' | 'Lost';
  overdueDays?: number;
  adminNote?: string;
}

export interface PendingLoanActionResponse {
  success: boolean;
  message: string;
  loan: ActiveLoan;
}

export const loansService = {
  async getAllLoans(): Promise<ActiveLoan[]> {
    const response = await apiInstance.get('/loans');
    return response.data;
  },

  async borrowBook(userId: number, bookId: number, dueDate: number): Promise<ActiveLoan> {
    const response = await apiInstance.post('/loans/borrow', {
      userId,
      bookId,
      dueDate,
    });
    return response.data;
  },

  async approvePendingLoan(loanId: number): Promise<ActiveLoan> {
    const response = await apiInstance.post(`/loans/${loanId}/approve`);
    return response.data;
  },

  async rejectPendingLoan(loanId: number): Promise<PendingLoanActionResponse> {
    const response = await apiInstance.post(`/loans/${loanId}/reject`);
    return response.data;
  },

  async returnLoan(loanId: number): Promise<ActiveLoan> {
    const response = await apiInstance.put(`/loans/${loanId}/return`);
    return response.data;
  },

  async getMyActiveLoans(userId: number): Promise<ActiveLoan[]> {
    const response = await apiInstance.get(`/loans/my-active-loans/${userId}`);
    return response.data;
  },

  async searchLoan(loanId: number): Promise<ActiveLoan> {
    const response = await apiInstance.get(`/loans/search/${loanId}`);
    return response.data;
  },

  async confirmReturnClean(loanId: number): Promise<any> {
    const response = await apiInstance.post(`/loans/${loanId}/confirm-clean`, {});
    return response.data;
  },

  async reportDamageOrLoss(returnData: ReportDamagePayload): Promise<any> {
    const response = await apiInstance.post(
      `/loans/${returnData.loanId}/report-damage`,
      returnData,
    );
    return response.data;
  },

  async getReaderFines(userId: number): Promise<{ totalFines: number; fineDetails: FineLogItem[] }> {
    const response = await apiInstance.get(`/loans/fines/${userId}`);
    return response.data;
  },
};
