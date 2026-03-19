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
import { Plus } from 'lucide-react';
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
  const itemsPerPage = 6;
  const totalPages = Math.ceil(allBooks.length / itemsPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [allBooks.length, totalPages, currentPage]);

  const paginatedBooks = allBooks.slice(
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

          {/* Recent Activity */}
          <div className="flex flex-col gap-8">
            <SectionHeader
              title="Recent Activity"
              subtitle="Manage the latest borrowing and return requests"
            />
            <LoanTable loans={recentLoans} isAdmin />
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

