import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Book, Loan, UserProfile } from '../types';
import { useAuth } from './AuthContext';
import { 
  subscribeToUserLoans, 
  subscribeToAllLoans, 
  subscribeToAllUsers,
  requestBorrow,
  returnBook,
  deleteUser,
  registerUser
} from '../services/localService';
import { fetchBooksApi, searchBooksApi, addBookApi, updateBookApi, deleteBookApi } from '../services/apiService';

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
  returnBookItem: (loan: Loan) => Promise<void>;
  
  // User Actions (Admin)
  removeUser: (user: UserProfile) => Promise<void>;
  addUser: (user: Partial<UserProfile>) => Promise<void>;
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
      setBooks(booksData);
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
    
    // Subscribe to users if admin
    let unsubUsers: () => void = () => {};
    if (user.role === 'admin') {
      unsubUsers = subscribeToAllUsers(setUsers);
    }

    return () => {
      unsubLoans();
      unsubUsers();
    };
  }, [user, fetchInitialBooks]);

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
    } finally {
      setIsLoading(false);
    }
  };

  const borrowBook = async (book: Book) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await requestBorrow(book, user);
    } finally {
      setIsLoading(false);
    }
  };

  const returnBookItem = async (loan: Loan) => {
    setIsLoading(true);
    try {
      await returnBook(loan);
    } finally {
      setIsLoading(false);
    }
  };

  const removeUser = async (targetUser: UserProfile) => {
    setIsLoading(true);
    try {
      await deleteUser(targetUser.uid);
    } finally {
      setIsLoading(false);
    }
  };

  const addUser = async (userData: Partial<UserProfile>) => {
      setIsLoading(true);
      try {
          // This uses registerUser from service, which adds to DB
          await registerUser(userData);
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
      addUser
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
