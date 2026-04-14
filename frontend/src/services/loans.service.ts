import apiInstance from './apiService';

export interface ActiveLoan {
  id: number;
  reader_id: number;
  issue_date: number;
  due_date: number;
  return_date?: number;
  status: string;
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
