/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book, UserProfile, Loan } from '../types';

// Local Storage Keys
export const BOOKS_KEY = 'lms_books';
export const USERS_KEY = 'lms_users';
export const LOANS_KEY = 'lms_loans';
export const CURRENT_USER_KEY = 'lms_current_user';

// Helper to get data from localStorage
export const getLocalData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  if (!data) return defaultValue;
  try {
    const parsed = JSON.parse(data);
    // If we expect an array and got an empty one, but have a non-empty default, use the default
    if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(defaultValue) && defaultValue.length > 0) {
      return defaultValue;
    }
    return parsed;
  } catch (e) {
    return defaultValue;
  }
};

// Helper to save data to localStorage
export const saveLocalData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initial Data if empty (extracted directly from database)
export const INITIAL_BOOKS: Book[] = STATIC_BOOKS;
export const INITIAL_USERS: UserProfile[] = STATIC_USERS;
export const INITIAL_LOANS: Loan[] = STATIC_LOANS;

// Auth Services
export const registerUser = async (data: any) => {
  const users = getLocalData<UserProfile[]>(USERS_KEY, INITIAL_USERS);

  const email = (data.email || '').trim().toLowerCase();
  const displayName = (data.displayName || '').trim();
  const studentId = (data.studentId || '').trim().toUpperCase();
  const password = (data.password || '').trim();

  if (!email || !displayName || !studentId || !password) {
    throw new Error('Please complete all registration fields.');
  }

  if (!/^N22DCCN\d{3}$/.test(studentId)) {
    throw new Error('Student ID must match format N22DCCNXXX.');
  }

  const existedUser = users.find((u) => u.email.toLowerCase() === email);
  if (existedUser) {
    throw new Error('Email already exists. Please use another email.');
  }

  const newUser: UserProfile = {
    uid: Math.random().toString(36).substring(7),
    email,
    displayName,
    studentId,
    role: 'reader',
    createdAt: Date.now(),
    password,
  };
  
  users.push(newUser);
  saveLocalData(USERS_KEY, users);
  saveLocalData(CURRENT_USER_KEY, newUser);
  return newUser;
};

export const isEmailRegistered = (emailInput: string): boolean => {
  const users = getLocalData<UserProfile[]>(USERS_KEY, INITIAL_USERS);
  const normalizedEmail = (emailInput || '').trim().toLowerCase();
  if (!normalizedEmail) {
    return false;
  }
  return users.some((u) => (u.email || '').toLowerCase() === normalizedEmail);
};

export const loginUser = async (data: any) => {
  const users = getLocalData<UserProfile[]>(USERS_KEY, INITIAL_USERS);
  const user = users.find(u => u.email === data.email);
  
  if (user) {
    // Check password if it exists (for demo accounts)
    if (user.password && user.password !== data.password) {
      throw new Error('Invalid password');
    }
    
    saveLocalData(CURRENT_USER_KEY, user);
    return user;
  }
  throw new Error('User not found');
};

// Admin function to add new user (without password requirement)
export const addNewUser = async (data: any) => {
  const users = getLocalData<UserProfile[]>(USERS_KEY, INITIAL_USERS);

  const email = (data.email || '').trim().toLowerCase();
  const displayName = (data.displayName || '').trim();
  const studentId = (data.studentId || '').trim().toUpperCase();
  const role = (data.role || 'reader').toLowerCase();

  if (!email || !displayName || !studentId) {
    throw new Error('Please complete all fields (Name, Student ID, Email).');
  }

  const existedUser = users.find((u) => u.email.toLowerCase() === email);
  if (existedUser) {
    throw new Error('Email already exists. Please use another email.');
  }

  // Admin can set any role and flexible student ID format
  const newUser: UserProfile = {
    uid: Math.random().toString(36).substring(7),
    email,
    displayName,
    studentId,
    role,
    createdAt: Date.now(),
    password: Math.random().toString(36).substring(7), // Generate random password
  };
  
  users.push(newUser);
  saveLocalData(USERS_KEY, users);
  return newUser;
};

export const logoutUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): UserProfile | null => {
  return getLocalData<UserProfile | null>(CURRENT_USER_KEY, null);
};

export const updateUser = async (uid: string, data: Partial<UserProfile>) => {
  const users = getLocalData<UserProfile[]>(USERS_KEY, INITIAL_USERS);
  const index = users.findIndex(u => u.uid === uid);
  
  if (index !== -1) {
    const currentUser = users[index];
    
    // Check for duplicate email (exclude current user)
    if (data.email && data.email.toLowerCase() !== currentUser.email.toLowerCase()) {
      const emailExists = users.some(u => 
        u.uid !== uid && u.email.toLowerCase() === (data.email || '').toLowerCase()
      );
      if (emailExists) {
        throw new Error('Email already exists. Please use another email.');
      }
    }
    
    // Check for duplicate student ID (exclude current user)
    if (data.studentId && data.studentId.toUpperCase() !== currentUser.studentId.toUpperCase()) {
      const studentIdExists = users.some(u => 
        u.uid !== uid && u.studentId.toUpperCase() === (data.studentId || '').toUpperCase()
      );
      if (studentIdExists) {
        throw new Error('Student ID already exists. Please use another student ID.');
      }
    }
    
    const updatedUser = { ...users[index], ...data };
    users[index] = updatedUser;
    saveLocalData(USERS_KEY, users);
    
    // Also update current user if it's the same person
    const currentUserFromStorage = getCurrentUser();
    if (currentUserFromStorage && currentUserFromStorage.uid === uid) {
      saveLocalData(CURRENT_USER_KEY, updatedUser);
    }
    return updatedUser;
  }
  throw new Error('User not found');
};

export const deleteUser = async (uid: string) => {
  const loans = getLocalData<Loan[]>(LOANS_KEY, INITIAL_LOANS);
  
  // Check if user has active loans
  const hasActiveLoans = loans.some(
    (loan) => loan.readerId === uid && loan.status !== 'Returned'
  );
  
  if (hasActiveLoans) {
    throw new Error('Cannot delete user who has active borrowing. Please return all books first.');
  }
  
  const users = getLocalData<UserProfile[]>(USERS_KEY, INITIAL_USERS);
  const filtered = users.filter(u => u.uid !== uid);
  saveLocalData(USERS_KEY, filtered);
};

// Book Services
export const addBook = async (data: Partial<Book>) => {
  const books = getLocalData<Book[]>(BOOKS_KEY, INITIAL_BOOKS);
  const newBook: Book = {
    ...data as Book,
    id: Math.random().toString(36).substring(7),
    available: data.quantity || 0,
    createdAt: Date.now(),
    status: 'Available',
  };
  books.push(newBook);
  saveLocalData(BOOKS_KEY, books);
  return newBook;
};

export const updateBook = async (id: string, data: Partial<Book>) => {
  const books = getLocalData<Book[]>(BOOKS_KEY, INITIAL_BOOKS);
  const index = books.findIndex(b => b.id === id);
  if (index !== -1) {
    books[index] = { ...books[index], ...data };
    saveLocalData(BOOKS_KEY, books);
  }
};

export const deleteBook = async (id: string) => {
  const books = getLocalData<Book[]>(BOOKS_KEY, INITIAL_BOOKS);
  const filtered = books.filter(b => b.id !== id);
  saveLocalData(BOOKS_KEY, filtered);
};

// Loan Services
export const requestBorrow = async (book: Book, user: UserProfile) => {
  const loans = getLocalData<Loan[]>(LOANS_KEY, INITIAL_LOANS);
  const books = getLocalData<Book[]>(BOOKS_KEY, INITIAL_BOOKS);
  const normalizedBookId = String(book.id);

  const hasActiveLoanForSameBook = loans.some(
    (loan) =>
      loan.readerId === user.uid &&
      String(loan.bookId) === normalizedBookId &&
      loan.status !== 'Returned'
  );

  if (hasActiveLoanForSameBook) {
    throw new Error('You are already borrowing this book. Please return it before borrowing again.');
  }

  let bookIndex = books.findIndex((b) => String(b.id) === normalizedBookId);
  const apiAvailable = Number((book as any).available);
  const hasApiAvailable = Number.isFinite(apiAvailable);
  const localAvailable = bookIndex !== -1 ? Number(books[bookIndex].available) : NaN;
  const currentAvailable = hasApiAvailable
    ? apiAvailable
    : (Number.isFinite(localAvailable) ? localAvailable : 0);

  if (currentAvailable <= 0) {
    throw new Error('This book is out of stock and cannot be borrowed right now.');
  }

  // Keep a local stock mirror even when books are primarily fetched from API.
  if (bookIndex === -1) {
    books.push({ ...book, id: normalizedBookId, available: currentAvailable });
    bookIndex = books.length - 1;
  } else {
    // Refresh stale local availability from current API value before decrementing.
    books[bookIndex] = { ...books[bookIndex], available: currentAvailable };
  }
  
  const newLoan: Loan = {
    id: Math.random().toString(36).substring(7),
    bookId: normalizedBookId,
    bookTitle: book.title,
    readerId: user.uid,
    readerName: user.displayName,
    issueDate: Date.now(),
    dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
    status: 'Borrowing',
    fee: 0,
  };
  
  loans.push(newLoan);
  saveLocalData(LOANS_KEY, loans);
  
  books[bookIndex].available -= 1;
  saveLocalData(BOOKS_KEY, books);
  
  return newLoan;
};

export const returnBook = async (loan: Loan) => {
  const loans = getLocalData<Loan[]>(LOANS_KEY, INITIAL_LOANS);
  const books = getLocalData<Book[]>(BOOKS_KEY, INITIAL_BOOKS);
  const DAY_IN_MS = 24 * 60 * 60 * 1000;
  const BORROW_LIMIT_DAYS = 30;
  const OVERDUE_RATE = 0.2;
  
  const loanIndex = loans.findIndex(l => l.id === loan.id);
  if (loanIndex === -1) {
    throw new Error('Loan record not found for this return action.');
  }

  if (loans[loanIndex].status === 'Returned') {
    throw new Error('This book has already been returned.');
  }

  const now = Date.now();
  const borrowedDays = Math.ceil((now - Number(loans[loanIndex].issueDate || now)) / DAY_IN_MS);
  const isOverMonth = borrowedDays > BORROW_LIMIT_DAYS;

  const relatedBook = books.find((b) => String(b.id) === String(loan.bookId));
  const coverPrice = Number(relatedBook?.price || 0);
  const overdueFee = isOverMonth ? Number((coverPrice * OVERDUE_RATE).toFixed(2)) : 0;

  loans[loanIndex].status = 'Returned';
  loans[loanIndex].returnDate = now;
  loans[loanIndex].fee = overdueFee;
  saveLocalData(LOANS_KEY, loans);
  
  const bookIndex = books.findIndex(b => String(b.id) === String(loan.bookId));
  if (bookIndex !== -1) {
    const nextAvailable = Number(books[bookIndex].available || 0) + 1;
    const quantity = Number(books[bookIndex].quantity || 0);
    books[bookIndex].available = quantity > 0 ? Math.min(quantity, nextAvailable) : nextAvailable;
    saveLocalData(BOOKS_KEY, books);
  }

  return loans[loanIndex];
};

// Real-time listeners (Simulated with polling or simple callbacks)
export const subscribeToBooks = (callback: (books: Book[]) => void) => {
  const update = () => {
    callback(getLocalData<Book[]>(BOOKS_KEY, INITIAL_BOOKS));
  };
  update();
  const interval = setInterval(update, 1000);
  return () => clearInterval(interval);
};

export const subscribeToUserLoans = (uid: string, callback: (loans: Loan[]) => void) => {
  const update = () => {
    const loans = getLocalData<Loan[]>(LOANS_KEY, INITIAL_LOANS);
    callback(loans.filter(l => l.readerId === uid));
  };
  update();
  const interval = setInterval(update, 1000);
  return () => clearInterval(interval);
};

export const subscribeToAllLoans = (callback: (loans: Loan[]) => void) => {
  const update = () => {
    callback(getLocalData<Loan[]>(LOANS_KEY, INITIAL_LOANS));
  };
  update();
  const interval = setInterval(update, 1000);
  return () => clearInterval(interval);
};

export const subscribeToAllUsers = (callback: (users: UserProfile[]) => void) => {
  const update = () => {
    callback(getLocalData<UserProfile[]>(USERS_KEY, INITIAL_USERS));
  };
  update();
  const interval = setInterval(update, 1000);
  return () => clearInterval(interval);
};
