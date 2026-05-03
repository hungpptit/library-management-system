/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AdminStats } from './AdminStats';
import { SectionHeader } from '../ui/SectionHeader';
import { LoanTable } from '../loans/LoanTable';
import { BookGrid } from '../books/BookGrid';
import { BookCard } from '../books/BookCard';
import { Book, Loan } from '../../types';
import { Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Pagination } from '../ui/Pagination';
import { BorrowingChart } from '../loans/BorrowingChart';

interface AdminDashboardProps {
  stats: {
    totalBooks: number;
    totalReaders: number;
    activeLoans: number;
    overdueLoans: number;
  };
  recentLoans: Loan[];
  popularBooks: Book[];
  allBooks: Book[];
  allLoans: Loan[];
  onAddBook: () => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  recentLoans,
  popularBooks,
  allBooks,
  allLoans,
  onAddBook,
  onEditBook,
  onDeleteBook,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'a-z' | 'z-a'>('newest');
  const itemsPerPage = 6;
  
  // Apply sorting based on sortBy state
  const sortedAllBooks = [...allBooks].sort((a, b) => {
    switch (sortBy) {
      case 'newest': {
        const timeA = typeof a.createdAt === 'number' ? a.createdAt : Number(a.createdAt);
        const timeB = typeof b.createdAt === 'number' ? b.createdAt : Number(b.createdAt);
        return timeB - timeA;
      }
      case 'oldest': {
        const timeA = typeof a.createdAt === 'number' ? a.createdAt : Number(a.createdAt);
        const timeB = typeof b.createdAt === 'number' ? b.createdAt : Number(b.createdAt);
        return timeA - timeB;
      }
      case 'a-z':
        return a.title.localeCompare(b.title);
      case 'z-a':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });
  
  const totalPages = Math.ceil(sortedAllBooks.length / itemsPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [sortedAllBooks.length, totalPages, currentPage]);

  const paginatedBooks = sortedAllBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-12">
      <AdminStats {...stats} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
        <div className="xl:col-span-2 flex flex-col gap-12">
          {/* Analytics Chart */}
          <div className="flex flex-col gap-8">
            <SectionHeader
              title="Analytics"
              subtitle="Borrowing trends and library performance"
            />
            <BorrowingChart loans={allLoans} />
          </div>

          {/* Book Inventory Management */}
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <SectionHeader
                title="Book Inventory"
                subtitle="Manage your library's collection"
              />
              <Button onClick={onAddBook} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New Book
              </Button>
            </div>

            {/* Sort Filter Buttons */}
            <div className="flex flex-wrap gap-3">
              <span className="text-sm font-semibold text-slate-700 flex items-center">Sort by:</span>
              <Button
                variant={sortBy === 'newest' ? 'primary' : 'outline'}
                className="flex items-center gap-2 text-sm"
                onClick={() => { setSortBy('newest'); setCurrentPage(1); }}
              >
                <ArrowUp className="w-4 h-4" />
                Newest
              </Button>
              <Button
                variant={sortBy === 'oldest' ? 'primary' : 'outline'}
                className="flex items-center gap-2 text-sm"
                onClick={() => { setSortBy('oldest'); setCurrentPage(1); }}
              >
                <ArrowDown className="w-4 h-4" />
                Oldest
              </Button>
              <Button
                variant={sortBy === 'a-z' ? 'primary' : 'outline'}
                className="text-sm"
                onClick={() => { setSortBy('a-z'); setCurrentPage(1); }}
              >
                A - Z
              </Button>
              <Button
                variant={sortBy === 'z-a' ? 'primary' : 'outline'}
                className="text-sm"
                onClick={() => { setSortBy('z-a'); setCurrentPage(1); }}
              >
                Z - A
              </Button>
            </div>

            <BookGrid 
              books={paginatedBooks} 
              isAdmin 
              onEdit={onEditBook}
              onDelete={onDeleteBook}
            />
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <SectionHeader
            title="Most Borrowed"
            subtitle="Top books in demand"
          />
          <div className="flex flex-col gap-6 max-h-[800px] overflow-y-auto overflow-x-hidden px-4 pb-8 custom-scrollbar">
            {popularBooks.map((book) => (
              <div key={book.id} className="w-full">
                <BookCard 
                  book={book} 
                  isAdmin={true} 
                  onEdit={onEditBook}
                  onDelete={onDeleteBook}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

