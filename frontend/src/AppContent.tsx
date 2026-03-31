import React, { useState, useEffect } from 'react';
import { Book, UserProfile } from './types';
import { useAuth } from './contexts/AuthContext';
import { useLibrary } from './contexts/LibraryContext';
import { Layout } from './components/layout/Layout';
import { AuthPage } from './components/auth/AuthPage';
import { UserDashboard } from './components/users/UserDashboard';
import { UserBooks } from './components/users/UserBooks';
import { UserProfileView } from './components/users/UserProfileView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminBooks } from './components/admin/AdminBooks';
import { AdminReaders } from './components/admin/AdminReaders';
import { AdminLoans } from './components/admin/AdminLoans';
import { Modal } from './components/ui/Modal';
import { BookForm } from './components/books/BookForm';
import { UserForm } from './components/users/UserForm';
import { Loading } from './components/ui/Loading';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Toaster, toast } from 'react-hot-toast';
import { useModal } from './hooks/useModal';
import { useLibraryActions } from './hooks/useLibraryActions';
import { User } from 'lucide-react'; // Đảm bảo đã import icon User

export const AppContent = () => {
    // Contexts
    const { user, isAuthReady, login, register, logout, updateProfile } = useAuth();
    const { books, loans, users, isLoading: isLibraryLoading, removeBook, removeUser, searchBooks } = useLibrary();

    // Custom Hooks
    const bookModal = useModal<Book>();
    const userModal = useModal<UserProfile>();
    const authModal = useModal(); 
    const { handleBorrow, handleReturn, handleBookSubmit, handleUserSubmit } = useLibraryActions();

    // Local UI State
    const [activeTab, setActiveTab] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAuthLoading, setIsAuthLoading] = useState(false);
    const [pendingBorrowBook, setPendingBorrowBook] = useState<Book | null>(null);

    // Search logic
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            searchBooks(searchQuery);
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery, searchBooks]);

    // Admin redirect
    useEffect(() => {
        if (user?.role === 'admin') setActiveTab('admin');
    }, [user]);

    const handleLogin = async (data: any) => {
        setIsAuthLoading(true);
        try {
            await login(data);
            toast.success("Welcome back!");
            authModal.close();

            if (pendingBorrowBook) {
                const bookToBorrow = pendingBorrowBook;
                setPendingBorrowBook(null);
                await handleBorrow(bookToBorrow);
            }
        } catch (error) {
            toast.error("Login failed");
        } finally {
            setIsAuthLoading(false);
        }
    };

    const handleRegister = async (data: any) => {
        setIsAuthLoading(true);
        try {
            await register(data);
            toast.success("Account created successfully!");
            authModal.close();

            if (pendingBorrowBook) {
                const bookToBorrow = pendingBorrowBook;
                setPendingBorrowBook(null);
                await handleBorrow(bookToBorrow);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Register failed");
        } finally {
            setIsAuthLoading(false);
        }
    };

    const onBorrowWithAuth = async (book: Book) => {
        if (!user) {
            setPendingBorrowBook(book);
            toast("Please login to borrow books", { icon: '🔒' });
            authModal.open();
            throw new Error('AUTH_REQUIRED');
        }

        await handleBorrow(book);
    };

    const handleLogout = () => {
        logout();
        setActiveTab('home');
        setSearchQuery('');
    };

    if (!isAuthReady) return <Loading />;

    const renderContent = () => {
        // --- ADMIN VIEW ---
        if (user?.role === 'admin') {
            switch (activeTab) {
                case 'admin':
                    return (
                        <AdminDashboard
                            stats={{
                                totalBooks: books.length,
                                totalReaders: users.length,
                                activeLoans: loans.filter(l => l.status === 'Borrowing').length,
                                overdueLoans: loans.filter(l => l.status === 'Overdue').length,
                            }}
                            recentLoans={loans.slice(0, 5)}
                            popularBooks={books.slice(0, 3)}
                            allBooks={books}
                            allLoans={loans}
                            onAddBook={() => bookModal.open()}
                            onEditBook={bookModal.open}
                            onDeleteBook={removeBook}
                        />
                    );
                case 'loans': return <AdminLoans loans={loans} onReturn={handleReturn} onScan={() => {}} />;
                case 'readers': return <AdminReaders users={users} onAddUser={() => userModal.open()} onEditUser={userModal.open} onDeleteUser={removeUser} />;
                case 'books': return <AdminBooks books={books} onAddBook={() => bookModal.open()} onEditBook={bookModal.open} onDeleteBook={removeBook} />;
                case 'profile': return <UserProfileView user={user} onUpdateUser={updateProfile} />;
                default: return null;
            }
        }
        
        // --- READER & GUEST VIEW ---
        switch (activeTab) {
            case 'home':
                return <UserDashboard books={books} onSearch={setSearchQuery} onBorrow={onBorrowWithAuth} />;
            
            case 'my-books':
                if (!user) {
                    return (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <p className="text-slate-500 mb-4 font-medium text-lg">Please log in to view your personal library</p>
                            <button 
                                onClick={() => authModal.open()} 
                                className="bg-sky-500 text-white px-8 py-2.5 rounded-full hover:bg-sky-600 transition-all shadow-md font-semibold"
                            >
                                Login Now
                            </button>
                        </div>
                    );
                }
                return <UserBooks activeLoans={loans.filter(l => l.status !== 'Returned')} loanHistory={loans.filter(l => l.status === 'Returned')} onReturn={handleReturn} />;

            case 'profile':
                if (!user) {
                    return (
                        <div className="flex flex-col items-center justify-center p-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <User className="w-10 h-10 text-slate-300" />
                            </div>
                            <p className="text-slate-500 mb-4 font-medium text-lg">Please log in to access your profile information</p>
                            <button 
                                onClick={() => authModal.open()} 
                                className="bg-sky-500 text-white px-8 py-2.5 rounded-full hover:bg-sky-600 transition-all shadow-md font-semibold"
                            >
                                Sign In
                            </button>
                        </div>
                    );
                }
                return <UserProfileView user={user} onUpdateUser={updateProfile} />;

            default: return null;
        }
    }; // Kết thúc hàm renderContent

    return (
        <ErrorBoundary>
            <Layout 
                userRole={user?.role} 
                activeTab={activeTab} 
                onTabChange={setActiveTab} 
                onLogout={handleLogout}
                onLoginClick={() => authModal.open()}
            >
                {renderContent()}
                <Toaster />
                
                {/* Auth Modal */}
                <Modal 
                  isOpen={authModal.isOpen} 
                  onClose={authModal.close} 
                  title="Library Membership"
                  maxWidth="4xl"
                >
                    <AuthPage onLogin={handleLogin} onRegister={handleRegister} isLoading={isAuthLoading} />
                </Modal>

                {/* Business Modals */}
                <Modal 
                  isOpen={bookModal.isOpen} 
                  onClose={bookModal.close} 
                  title={bookModal.data ? 'Edit Book' : 'Add Book'}
                  maxWidth="2xl"
                >
                    <BookForm initialData={bookModal.data || {}} onSubmit={(data) => handleBookSubmit(data, bookModal.data, bookModal.close)} isLoading={isLibraryLoading} />
                </Modal>

                <Modal 
                  isOpen={userModal.isOpen} 
                  onClose={userModal.close} 
                  title={userModal.data ? 'Edit Reader' : 'Add Reader'}
                  maxWidth="2xl"
                >
                    <UserForm initialData={userModal.data || {}} onSubmit={(data) => handleUserSubmit(data, userModal.data, userModal.close)} isLoading={isLibraryLoading} isAdmin={true} />
                </Modal>
            </Layout>
        </ErrorBoundary>
    );
};