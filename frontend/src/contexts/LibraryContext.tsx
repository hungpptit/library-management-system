import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Book, Loan, UserProfile } from '../types';
import { useAuth } from './AuthContext';
import { 
  subscribeToUserLoans, 
  subscribeToAllLoans, 
  subscribeToAllUsers,
  returnBook,
  deleteUser,
  registerUser,
  addNewUser,
  updateUser as updateUserService
} from '../services/localService';
import { 
  fetchBooksApi, 
  fetchBookByIdApi, 
  searchBooksApi, 
  addBookApi, 
  updateBookApi, 
  deleteBookApi,
  fetchUsersApi,
  addUserApi,
  updateUserApi,
  deleteUserApi
} from '../services/apiService';
import { loansService } from '../services/loans.service';

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

  // Fetch initial users for Admin from API
  const fetchInitialUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const usersData = await fetchUsersApi();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
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

  // Subscribe to data changes
  useEffect(() => {
    if (!user) {
        setBooks([]);
        setLoans([]);
        setUsers([]);
        return;
    }

    // Load initial books from DB
    fetchInitialBooks();
    
    // Subscribe to loans based on role
    const unsubLoans = user.role === 'admin' 
      ? subscribeToAllLoans(setLoans) 
      : subscribeToUserLoans(user.uid, setLoans);
    
    // Fetch users if admin
    if (user.role === 'admin') {
      fetchInitialUsers();
    }

    return () => {
      unsubLoans();
    };
  }, [user, fetchInitialBooks, fetchInitialUsers]);

  const addNewBook = async (book: Partial<Book>) => {
    setIsLoading(true);
    try {
      await addBookApi(book);
      await fetchInitialBooks(); // Refresh list from DB
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookDetails = async (book: Partial<Book>) => {
    if (!book.id) throw new Error("Book ID is required for update");
    setIsLoading(true);
    try {
      await updateBookApi(book.id, book);
      await fetchInitialBooks(); // Refresh list from DB
    } finally {
      setIsLoading(false);
    }
  };

  const removeBook = async (book: Book) => {
    setIsLoading(true);
    try {
      await deleteBookApi(book.id);
      await fetchInitialBooks(); // Refresh list from DB
    } catch (error: any) {
      const backendMessage = error.response?.data?.message;
      if (backendMessage) {
        throw new Error(backendMessage);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const borrowBook = async (book: Book) => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (!user.id) {
        throw new Error('User ID not found. Please login again.');
      }

      const bookId = Number(book.id);
      if (Number.isNaN(bookId) || bookId <= 0) {
        throw new Error('Invalid book id');
      }

      const dueDate = Date.now() + 30 * 24 * 60 * 60 * 1000;
      await loansService.borrowBook(user.id, bookId, dueDate);
      await fetchInitialBooks();
    } finally {
      setIsLoading(false);
    }
  };

  const returnBookItem = async (loan: Loan) => {
    setIsLoading(true);
    try {
      const returnedLoan = await returnBook(loan);
      const currentBook = await fetchBookByIdApi(returnedLoan.bookId);
      if (currentBook) {
        const quantity = Number(currentBook.quantity || 0);
        const increasedAvailable = Number(currentBook.available || 0) + 1;
        const nextAvailable = quantity > 0 ? Math.min(quantity, increasedAvailable) : increasedAvailable;
        await updateBookApi(currentBook.id, { available: nextAvailable });
        await fetchInitialBooks();
      }
      return returnedLoan;
    } finally {
      setIsLoading(false);
    }
  };

  const removeUser = async (targetUser: UserProfile) => {
    setIsLoading(true);
    try {
      // Use id if available, otherwise fallback to uid
      const userId = targetUser.id || Number(targetUser.uid);
      if (!userId) throw new Error("User ID is required");
      await deleteUserApi(userId);
      await fetchInitialUsers();
    } catch (error: any) {
      // Extract error message from backend response (Axios error)
      const backendMessage = error.response?.data?.message;
      if (backendMessage) {
        throw new Error(backendMessage);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async (userData: Partial<UserProfile>) => {
      setIsLoading(true);
      try {
          // Use addUserApi for DB persistence
          await addUserApi(userData);
          await fetchInitialUsers();
      } finally {
          setIsLoading(false);
      }
  }

  const updateUser = async (uid: string, userData: Partial<UserProfile>) => {
    setIsLoading(true);
    try {
      // If uid is a string from old code, it could be the numeric ID from DB
      const userId = userData.id || Number(uid);
      if (!userId) throw new Error("User ID is required");
      await updateUserApi(userId, userData);
      await fetchInitialUsers();
    } finally {
      setIsLoading(false);
    }
  }

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
