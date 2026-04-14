import axios from 'axios';
import { Book, Loan, UserProfile } from '../types';

const API_BASE_URL = 'http://localhost:3001';

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
});

const normalizeBook = (book: any): Book => ({
  id: String(book.id),
  title: book.title || '',
  author: Array.isArray(book.authors) && book.authors.length > 0
    ? book.authors[0].name
    : typeof book.author === 'string'
      ? book.author
      : typeof book.author === 'object' && book.author !== null
        ? book.author.name
        : '',
  isbn: book.isbn || '',
  quantity: Number(book.quantity || 0),
  available: Number(book.available || 0),
  coverUrl: book.coverUrl || book.cover_url || '',
  genre: book.category?.name || book.genre || '',
  description: book.description || '',
  status: Number(book.available || 0) > 0 ? 'Available' : 'Unavailable',
  createdAt: Number(book.created_at || Date.now()),
  year: book.year || undefined,
  publisher: book.publisher?.name || book.publisher || '',
  price: Number(book.price || 0),
  location: book.location || '',
});

const normalizeUser = (user: any): UserProfile => ({
  uid: String(user.id),
  email: user.email || '',
  displayName: user.display_name || '',
  studentId: user.student_id || '',
  phone: user.phone || '',
  address: user.address || '',
  role: user.role || 'reader',
  createdAt: Number(user.created_at || Date.now()),
});

const normalizeLoan = (loan: any): Loan => ({
  id: String(loan.id),
  bookId: String(loan.book_id || loan.book?.id || ''),
  bookTitle: loan.book?.title || loan.bookTitle || '',
  readerId: String(loan.reader_id || loan.user?.id || loan.readerId || ''),
  readerName: loan.user?.display_name || loan.readerName || '',
  issueDate: Number(loan.issue_date || loan.issueDate || 0),
  dueDate: Number(loan.due_date || loan.dueDate || 0),
  returnDate: loan.return_date || loan.returnDate || undefined,
  status: loan.status || 'Borrowing',
  fee: Number(loan.fine_amount || loan.fee || 0),
});

export const fetchBooksApi = async (): Promise<Book[]> => {
  try {
    const response = await apiInstance.get('/books');
    return Array.isArray(response.data)
      ? response.data.map(normalizeBook)
      : [];
  } catch (error) {
    console.error('Error fetching books from API:', error);
    return [];
  }
};

export const fetchBookByIdApi = async (id: string | number): Promise<Book | null> => {
  try {
    const response = await apiInstance.get(`/books/${id}`);
    return normalizeBook(response.data);
  } catch (error) {
    console.error('Error fetching book by id from API:', error);
    return null;
  }
};

export const searchBooksApi = async (keyword: string): Promise<Book[]> => {
  try {
    const response = await apiInstance.get('/books/search', {
      params: { keyword },
    });
    return Array.isArray(response.data)
      ? response.data.map(normalizeBook)
      : [];
  } catch (error) {
    console.error('Error searching books from API:', error);
    return [];
  }
};

export const checkIsbnApi = async (isbn: string): Promise<Book | null> => {
  try {
    const response = await apiInstance.get(`/books/isbn/${isbn}`);
    return normalizeBook(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error checking ISBN:', error);
    return null;
  }
};

export const addBookApi = async (book: Partial<Book>): Promise<Book> => {
  const response = await apiInstance.post('/books', book);
  return normalizeBook(response.data);
};

export const updateBookApi = async (id: string | number, book: Partial<Book>): Promise<Book> => {
  const response = await apiInstance.put(`/books/${id}`, book);
  return normalizeBook(response.data);
};

export const deleteBookApi = async (id: string | number): Promise<void> => {
  await apiInstance.delete(`/books/${id}`);
};

export const registerUserApi = async (data: any): Promise<UserProfile> => {
  const response = await apiInstance.post('/users', data);
  return normalizeUser(response.data);
};

export const loginUserApi = async (data: { email: string; password: string }): Promise<UserProfile> => {
  const response = await apiInstance.post('/users/login', data);
  return normalizeUser(response.data);
};

export const fetchUsersApi = async (): Promise<UserProfile[]> => {
  const response = await apiInstance.get('/users');
  return Array.isArray(response.data)
    ? response.data.map(normalizeUser)
    : [];
};

export const addUserApi = async (data: any): Promise<UserProfile> => {
  const response = await apiInstance.post('/users', data);
  return normalizeUser(response.data);
};

export const updateUserApi = async (id: string, data: any): Promise<UserProfile> => {
  const response = await apiInstance.put(`/users/${id}`, data);
  return normalizeUser(response.data);
};

export const deleteUserApi = async (id: string): Promise<void> => {
  await apiInstance.delete(`/users/${id}`);
};

export const fetchLoansApi = async (readerId?: string): Promise<Loan[]> => {
  try {
    const response = await apiInstance.get('/loans', {
      params: readerId ? { readerId } : {},
    });
    return Array.isArray(response.data)
      ? response.data.map(normalizeLoan)
      : [];
  } catch (error) {
    console.error('Error fetching loans from API:', error);
    return [];
  }
};

export const borrowBookApi = async (userId: string, bookId: string, dueDate: number): Promise<Loan> => {
  const response = await apiInstance.post('/loans/borrow', {
    userId: Number(userId),
    bookId: Number(bookId),
    dueDate,
  });
  return normalizeLoan(response.data);
};

export const returnLoanApi = async (id: string | number): Promise<Loan> => {
  const response = await apiInstance.put(`/loans/${id}/return`);
  return normalizeLoan(response.data);
};

export default apiInstance;
