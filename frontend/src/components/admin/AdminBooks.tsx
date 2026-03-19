/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Book } from '../../types';
import { BookGrid } from '../books/BookGrid';
import { SectionHeader } from '../ui/SectionHeader';
import { Button } from '../ui/Button';
import { Plus } from 'lucide-react';
import { Pagination } from '../ui/Pagination';

interface AdminBooksProps {
  books: Book[];
  onAddBook: () => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
}

export const AdminBooks: React.FC<AdminBooksProps> = ({
  books,
  onAddBook,
  onEditBook,
  onDeleteBook,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Show more on the dedicated page
  const totalPages = Math.ceil(books.length / itemsPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [books.length, totalPages, currentPage]);

  const paginatedBooks = books.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-8">
      <SectionHeader
        title="Book Inventory"
        subtitle="Manage your library's collection"
        action={
          <Button onClick={onAddBook} className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            <span>Add New Book</span>
          </Button>
        }
      />
      <BookGrid 
        books={paginatedBooks} 
        onEdit={onEditBook} 
        onDelete={onDeleteBook}
        isAdmin 
      />
      <Pagination 
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

