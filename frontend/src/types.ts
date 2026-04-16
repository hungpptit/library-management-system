/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Book {
  id: string;
  title: string;
  author: string;
  authors?: Array<{ name: string }>;
  isbn: string;
  quantity: number;
  available: number;
  coverUrl: string;
  genre: string;
  description: string;
  status: 'Available' | 'Unavailable';
  createdAt: number;
  year?: number;
  publisher?: string;
  price?: number;
  location?: string;
}

export interface UserProfile {
  id?: number;
  uid: string;
  email: string;
  displayName: string;
  studentId: string;
  role: 'admin' | 'reader';
  status?: 'active' | 'deleted';
  createdAt: number;
  password?: string;
}

export interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  readerId: string;
  readerName: string;
  issueDate: number;
  dueDate: number;
  returnDate?: number;
  status: 'Borrowing' | 'Returned' | 'Overdue' | 'Lost' | 'Damaged';
  fee: number;
}
