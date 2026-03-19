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
import { useBookSearch } from './hooks/useBookSearch';
import { useModal } from './hooks/useModal';
import { useLibraryActions } from './hooks/useLibraryActions';

export const AppContent = () => {
    // Contexts
    const { user, isAuthReady, login, register, logout, updateProfile } = useAuth();
    const { books, loans, users, isLoading: isLibraryLoading, removeBook, removeUser } = useLibrary();

    // Custom Hooks
    const bookModal = useModal<Book>();
    const userModal = useModal<UserProfile>();
    const { handleBorrow, handleReturn, handleBookSubmit, handleUserSubmit } = useLibraryActions();

    // Local UI State
    const [activeTab, setActiveTab] = useState('home');
    const [searchQuery, setSearchQuery] = useState('');
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    // Filter Logic using Custom Hook
    const filteredBooks = useBookSearch(books, searchQuery);

    // Initialization
    useEffect(() => {
        if (user?.role === 'admin') setActiveTab('admin');
    }, [user]);

    // Auth Handlers
    const handleLogin = async (data: any) => {
        setIsAuthLoading(true);
        try {
            await login(data);
            toast.success("Welcome back!");
        } catch (error) {
            console.error(error);
            toast.error("Login failed");
        } finally {
            setIsAuthLoading(false);
        }
    };

    const handleRegister = async (data: any) => {
        setIsAuthLoading(true);
        try {
            await register(data);
            toast.success("Registration successful!");
        } catch (error) {
            console.error(error);
            toast.error("Registration failed");
        } finally {
            setIsAuthLoading(false);
        }
    };
    
    // Auth Check
    if (!isAuthReady) return <Loading />;

    if (!user) {
        return (
            <ErrorBoundary>
                <AuthPage 
                    onLogin={handleLogin} 
                    onRegister={handleRegister} 
                    isLoading={isAuthLoading} 
                />
                <Toaster />
            </ErrorBoundary>
        );
    }

    const renderContent = () => {
        if (user.role === 'admin') {
            switch (activeTab) {
                case 'home':
                    return <UserDashboard books={filteredBooks} onSearch={setSearchQuery} onBorrow={handleBorrow} />;
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
                case 'loans':
                    return <AdminLoans loans={loans} onReturn={handleReturn} onScan={() => {}} />;
                case 'readers':
                    return (
                        <AdminReaders 
                            users={users} 
                            onAddUser={() => userModal.open()} 
                            onEditUser={userModal.open} 
                            onDeleteUser={removeUser} 
                        />
                    );
                case 'profile':
                    return <UserProfileView user={user} onUpdateUser={updateProfile} />;
                case 'books':
                     return (
                        <AdminBooks
                          books={books}
                          onAddBook={() => bookModal.open()}
                          onEditBook={bookModal.open}
                          onDeleteBook={removeBook}
                        />
                      );
                default: return null;
            }
        }
        
        switch (activeTab) {
            case 'home':
                return <UserDashboard books={filteredBooks} onSearch={setSearchQuery} onBorrow={handleBorrow} />;
            case 'my-books':
                return (
                    <UserBooks 
                        activeLoans={loans.filter(l => l.status === 'Borrowing' || l.status === 'Overdue')} 
                        loanHistory={loans.filter(l => l.status === 'Returned')} 
                        onReturn={handleReturn} 
                    />
                );
            case 'profile':
                return <UserProfileView user={user} onUpdateUser={updateProfile} />;
            default: return null;
        }
    };

    return (
        <ErrorBoundary>
            <Layout userRole={user.role} activeTab={activeTab} onTabChange={setActiveTab} onLogout={logout}>
                {renderContent()}
                <Toaster />
                
                <Modal
                    isOpen={bookModal.isOpen}
                    onClose={bookModal.close}
                    title={bookModal.data ? 'Edit Book' : 'Add New Book'}
                >
                    <BookForm
                        initialData={bookModal.data || {}}
                        onSubmit={(data) => handleBookSubmit(data, bookModal.data, bookModal.close)}
                        isLoading={isLibraryLoading}
                    />
                </Modal>

                <Modal
                    isOpen={userModal.isOpen}
                    onClose={userModal.close}
                    title={userModal.data ? 'Edit Reader' : 'Add New Reader'}
                >
                    <UserForm
                        initialData={userModal.data || {}}
                        onSubmit={(data) => handleUserSubmit(data, userModal.data, userModal.close)}
                        isLoading={isLibraryLoading}
                        isAdmin={true}
                    />
                </Modal>
            </Layout>
        </ErrorBoundary>
    );
};
