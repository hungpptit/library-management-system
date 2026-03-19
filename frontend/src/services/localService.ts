/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Book, UserProfile, Loan } from '../types';

// Local Storage Keys
const BOOKS_KEY = 'lms_books';
const USERS_KEY = 'lms_users';
const LOANS_KEY = 'lms_loans';
const CURRENT_USER_KEY = 'lms_current_user';

// Helper to get data from localStorage
const getLocalData = <T>(key: string, defaultValue: T): T => {
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
const saveLocalData = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Initial Data if empty
const INITIAL_BOOKS: Book[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    quantity: 5,
    available: 4,
    coverUrl: 'https://picsum.photos/seed/gatsby/300/400',
    genre: 'Classic',
    description: 'A story of wealth, love, and the American Dream.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1925,
    publisher: 'Charles Scribner\'s Sons',
    price: 15.99,
    location: 'Shelf A-12',
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0451524935',
    quantity: 3,
    available: 2,
    coverUrl: 'https://picsum.photos/seed/1984/300/400',
    genre: 'Dystopian',
    description: 'A chilling vision of a totalitarian future.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1949,
    publisher: 'Secker & Warburg',
    price: 12.50,
    location: 'Shelf B-05',
  },
  {
    id: '3',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0446310789',
    quantity: 4,
    available: 4,
    coverUrl: 'https://picsum.photos/seed/mockingbird/300/400',
    genre: 'Fiction',
    description: 'A novel about racial injustice and the loss of innocence.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1960,
    publisher: 'J.B. Lippincott & Co.',
    price: 14.95,
    location: 'Shelf C-01',
  },
  {
    id: '4',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    isbn: '978-0547928227',
    quantity: 6,
    available: 6,
    coverUrl: 'https://picsum.photos/seed/hobbit/300/400',
    genre: 'Fantasy',
    description: 'A fantasy novel about the adventures of Bilbo Baggins.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1937,
    publisher: 'George Allen & Unwin',
    price: 18.00,
    location: 'Shelf F-08',
  },
  {
    id: '5',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '978-0141439418',
    quantity: 2,
    available: 1,
    coverUrl: 'https://picsum.photos/seed/pride/300/400',
    genre: 'Romance',
    description: 'A romantic novel of manners.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1813,
    publisher: 'T. Egerton',
    price: 10.99,
    location: 'Shelf R-02',
  },
  {
    id: '6',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    isbn: '978-0316769488',
    quantity: 3,
    available: 3,
    coverUrl: 'https://picsum.photos/seed/catcher/300/400',
    genre: 'Fiction',
    description: 'A story about teenage angst and alienation.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1951,
    publisher: 'Little, Brown and Company',
    price: 13.25,
    location: 'Shelf F-15',
  },
  {
    id: '7',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    isbn: '978-0062315007',
    quantity: 10,
    available: 10,
    coverUrl: 'https://picsum.photos/seed/alchemist/300/400',
    genre: 'Adventure',
    description: 'A fable about following your dreams.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1988,
    publisher: 'HarperCollins',
    price: 16.50,
    location: 'Shelf A-03',
  },
  {
    id: '8',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    isbn: '978-0060850524',
    quantity: 4,
    available: 4,
    coverUrl: 'https://picsum.photos/seed/brave/300/400',
    genre: 'Dystopian',
    description: 'A searching vision of an unequal, technologically-advanced future.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1932,
    publisher: 'Chatto & Windus',
    price: 14.00,
    location: 'Shelf B-07',
  },
  {
    id: '9',
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    isbn: '978-0544003415',
    quantity: 2,
    available: 2,
    coverUrl: 'https://picsum.photos/seed/lotr/300/400',
    genre: 'Fantasy',
    description: 'The epic saga of the War of the Ring.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1954,
    publisher: 'George Allen & Unwin',
    price: 25.00,
    location: 'Shelf F-09',
  },
  {
    id: '10',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    isbn: '978-0141439470',
    quantity: 3,
    available: 3,
    coverUrl: 'https://picsum.photos/seed/frankenstein/300/400',
    genre: 'Horror',
    description: 'The story of Victor Frankenstein and his monstrous creation.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1818,
    publisher: 'Lackington, Hughes, Harding, Mavor & Jones',
    price: 11.50,
    location: 'Shelf H-01',
  },
];

const INITIAL_USERS: UserProfile[] = [
  {
    uid: 'admin123',
    email: 'admin@library.com',
    displayName: 'Librarian Admin',
    studentId: 'ADM-001',
    role: 'admin',
    createdAt: Date.now(),
    password: '123',
  },
  {
    uid: 'reader123',
    email: 'student@university.edu',
    displayName: 'John Doe',
    studentId: 'STU-2024-001',
    role: 'reader',
    createdAt: Date.now(),
    password: '123',
  },
];

const INITIAL_LOANS: Loan[] = [
  {
    id: 'loan1',
    bookId: '1',
    bookTitle: 'The Great Gatsby',
    readerId: 'reader123',
    readerName: 'John Doe',
    issueDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
    dueDate: Date.now() + 9 * 24 * 60 * 60 * 1000,
    status: 'Borrowing',
    fee: 0,
  },
  {
    id: 'loan2',
    bookId: '2',
    bookTitle: '1984',
    readerId: 'reader123',
    readerName: 'John Doe',
    issueDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
    dueDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
    status: 'Overdue',
    fee: 5.5,
  },
  {
    id: 'loan3',
    bookId: '5',
    bookTitle: 'Pride and Prejudice',
    readerId: 'reader123',
    readerName: 'John Doe',
    issueDate: Date.now() - 20 * 24 * 60 * 60 * 1000,
    dueDate: Date.now() - 6 * 24 * 60 * 60 * 1000,
    returnDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
    status: 'Returned',
    fee: 0,
  },
];

// Auth Services
export const registerUser = async (data: any) => {
  const users = getLocalData<UserProfile[]>(USERS_KEY, INITIAL_USERS);
  const newUser: UserProfile = {
    uid: Math.random().toString(36).substring(7),
    email: data.email,
    displayName: data.displayName,
    studentId: data.studentId,
    role: 'reader',
    createdAt: Date.now(),
  };
  
  users.push(newUser);
  saveLocalData(USERS_KEY, users);
  saveLocalData(CURRENT_USER_KEY, newUser);
  return newUser;
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
    const updatedUser = { ...users[index], ...data };
    users[index] = updatedUser;
    saveLocalData(USERS_KEY, users);
    
    // Also update current user if it's the same person
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.uid === uid) {
      saveLocalData(CURRENT_USER_KEY, updatedUser);
    }
    return updatedUser;
  }
  throw new Error('User not found');
};

export const deleteUser = async (uid: string) => {
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
  
  const newLoan: Loan = {
    id: Math.random().toString(36).substring(7),
    bookId: book.id,
    bookTitle: book.title,
    readerId: user.uid,
    readerName: user.displayName,
    issueDate: Date.now(),
    dueDate: Date.now() + 14 * 24 * 60 * 60 * 1000,
    status: 'Borrowing',
    fee: 0,
  };
  
  loans.push(newLoan);
  saveLocalData(LOANS_KEY, loans);
  
  const bookIndex = books.findIndex(b => b.id === book.id);
  if (bookIndex !== -1) {
    books[bookIndex].available -= 1;
    saveLocalData(BOOKS_KEY, books);
  }
  
  return newLoan;
};

export const returnBook = async (loan: Loan) => {
  const loans = getLocalData<Loan[]>(LOANS_KEY, INITIAL_LOANS);
  const books = getLocalData<Book[]>(BOOKS_KEY, INITIAL_BOOKS);
  
  const loanIndex = loans.findIndex(l => l.id === loan.id);
  if (loanIndex !== -1) {
    loans[loanIndex].status = 'Returned';
    loans[loanIndex].returnDate = Date.now();
    saveLocalData(LOANS_KEY, loans);
  }
  
  const bookIndex = books.findIndex(b => b.id === loan.bookId);
  if (bookIndex !== -1) {
    books[bookIndex].available += 1;
    saveLocalData(BOOKS_KEY, books);
  }
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
