import React, { createContext, useContext, useState, useEffect } from 'react';
import { Book, Loan, UserProfile } from '../types';
import { useAuth } from './AuthContext';
import { 
  subscribeToBooks, 
  subscribeToUserLoans, 
  subscribeToAllLoans, 
  subscribeToAllUsers,
  addBook,
  updateBook,
  deleteBook,
  requestBorrow,
  returnBook,
  deleteUser,
  registerUser
} from '../services/localService';

interface LibraryContextType {
  books: Book[];
  loans: Loan[];
  users: UserProfile[]; // For Admin
  isLoading: boolean;
  
  // Book Actions
  addNewBook: (book: Partial<Book>) => Promise<void>;
  updateBookDetails: (book: Partial<Book>) => Promise<void>;
  removeBook: (book: Book) => Promise<void>;
  
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

  // Subscribe to data changes
  useEffect(() => {
    if (!user) {
        setBooks([]);
        setLoans([]);
        setUsers([]);
        return;
    }

    const unsubBooks = subscribeToBooks(setBooks);
    
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
      unsubBooks();
      unsubLoans();
      unsubUsers();
    };
  }, [user]);

  const addNewBook = async (book: Partial<Book>) => {
    setIsLoading(true);
    try {
      await addBook(book);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookDetails = async (book: Partial<Book>) => {
    if (!book.id) throw new Error("Book ID is required for update");
    setIsLoading(true);
    try {
      await updateBook(book.id, book);
    } finally {
      setIsLoading(false);
    }
  };

  const removeBook = async (book: Book) => {
    setIsLoading(true);
    try {
      await deleteBook(book.id);
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
