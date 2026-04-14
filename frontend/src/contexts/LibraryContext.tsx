import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Book, Loan, UserProfile } from '../types';
import { useAuth } from './AuthContext';
import { 
  fetchBooksApi,
  searchBooksApi,
  addBookApi,
  updateBookApi,
  deleteBookApi,
  fetchUsersApi,
  addUserApi,
  updateUserApi,
  deleteUserApi,
  fetchLoansApi,
  borrowBookApi,
  returnLoanApi,
} from '../services/apiService';

interface LibraryContextType {
  books: Book[];
  loans: Loan[];
  users: UserProfile[]; // For Admin
  isLoading: boolean;
  
  // Book Actions
  addNewBook: (book: Partial<Book>) => Promise<void>;
  updateBookDetails: (book: Partial<Book>) => Promise<void>;
  removeBook: (book: Book) => Promise<void>;
  searchBooks: (keyword: string) => Promise<void>;
  
  // Loan Actions
  borrowBook: (book: Book) => Promise<void>;
  returnBookItem: (loan: Loan) => Promise<Loan>;
  
  // User Actions (Admin)
  removeUser: (user: UserProfile) => Promise<void>;
  addUser: (user: Partial<UserProfile>) => Promise<void>;
  updateUser: (uid: string, user: Partial<UserProfile>) => Promise<void>;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

export function LibraryProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial books from API
  const fetchInitialBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const booksData = await fetchBooksApi();

      const normalizedBooks = booksData.map((book) => {
        const quantity = Number(book.quantity || 0);
        const available = Number(book.available || 0);
        const clampedAvailable = quantity > 0
          ? Math.min(quantity, Math.max(0, available))
          : Math.max(0, available);

        return {
          ...book,
          available: clampedAvailable,
        };
      });

      setBooks(normalizedBooks);

      // Self-heal invalid stock rows persisted in backend (e.g. 9/5).
      const invalidBookUpdates = booksData
        .map((book, index) => ({
          id: book.id,
          available: normalizedBooks[index].available,
          isInvalid: book.available !== normalizedBooks[index].available,
        }))
        .filter((item) => item.isInvalid);

      if (invalidBookUpdates.length > 0) {
        await Promise.all(
          invalidBookUpdates.map((item) =>
            updateBookApi(item.id, { available: item.available }),
          ),
        );
      }
    } catch (error) {
      console.error('Failed to fetch books:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update logic to call API instead of filter locally
  const searchBooks = async (keyword: string) => {
    setIsLoading(true);
    try {
      const results = await searchBooksApi(keyword);
      setBooks(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInitialLoans = useCallback(async () => {
    if (!user) {
      setLoans([]);
      return;
    }

    try {
      const loanResults = await fetchLoansApi(user.role === 'admin' ? undefined : user.uid);
      setLoans(loanResults);
    } catch (error) {
      console.error('Failed to fetch loans:', error);
    }
  }, [user]);

  const fetchUsers = useCallback(async () => {
    if (user?.role !== 'admin') {
      setUsers([]);
      return;
    }

    try {
      const userResults = await fetchUsersApi();
      setUsers(userResults);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, [user]);

  // Subscribe to data changes
  useEffect(() => {
    if (!user) {
      setBooks([]);
      setLoans([]);
      setUsers([]);
      return;
    }

    fetchInitialBooks();
    fetchInitialLoans();
    fetchUsers();
  }, [user, fetchInitialBooks, fetchInitialLoans, fetchUsers]);

  const addNewBook = async (book: Partial<Book>) => {
    setIsLoading(true);
    try {
      await addBookApi(book);
      await fetchInitialBooks();
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookDetails = async (book: Partial<Book>) => {
    if (!book.id) throw new Error('Book ID is required for update');
    setIsLoading(true);
    try {
      await updateBookApi(book.id, book);
      await fetchInitialBooks();
    } finally {
      setIsLoading(false);
    }
  };

  const removeBook = async (book: Book) => {
    setIsLoading(true);
    try {
      await deleteBookApi(book.id);
      await fetchInitialBooks();
    } finally {
      setIsLoading(false);
    }
  };

  const borrowBook = async (book: Book) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await borrowBookApi(user.uid, book.id, Date.now() + 30 * 24 * 60 * 60 * 1000);
      await fetchInitialBooks();
      await fetchInitialLoans();
    } finally {
      setIsLoading(false);
    }
  };

  const returnBookItem = async (loan: Loan) => {
    setIsLoading(true);
    try {
      const returnedLoan = await returnLoanApi(loan.id);
      await fetchInitialBooks();
      await fetchInitialLoans();
      return returnedLoan;
    } finally {
      setIsLoading(false);
    }
  };

  const removeUser = async (targetUser: UserProfile) => {
    setIsLoading(true);
    try {
      await deleteUserApi(targetUser.uid);
      await fetchUsers();
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async (userData: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      await addUserApi(userData);
      await fetchUsers();
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (uid: string, userData: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      await updateUserApi(uid, userData);
      await fetchUsers();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LibraryContext.Provider value={{
      books,
      loans,
      users,
      isLoading,
      addNewBook,
      updateBookDetails,
      removeBook,
      searchBooks,
      borrowBook,
      returnBookItem,
      removeUser,
      addUser,
      updateUser
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (context === undefined) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
