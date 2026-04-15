/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Book } from '../../types';
import { BookGrid } from '../books/BookGrid';
import { SearchHero } from '../common/SearchHero';
import { SectionHeader } from '../ui/SectionHeader';
import { Button } from '../ui/Button';
import { Plus, ArrowUp, ArrowDown } from 'lucide-react';
import { Pagination } from '../ui/Pagination';

interface AdminBooksProps {
  books: Book[];
  onAddBook: () => void;
  onEditBook: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
  onSearch?: (query: string) => void;
}

export const AdminBooks: React.FC<AdminBooksProps> = ({
  books,
  onAddBook,
  onEditBook,
  onDeleteBook,
  onSearch,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'a-z' | 'z-a'>('newest');
  const itemsPerPage = 9;
  
  // Apply sorting based on sortBy state
  const sortedBooks = [...books].sort((a, b) => {
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
  
  const totalPages = Math.ceil(sortedBooks.length / itemsPerPage);
  
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (totalPages === 0) {
      setCurrentPage(1);
    }
  }, [sortedBooks.length, totalPages, currentPage]);

  const paginatedBooks = sortedBooks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex flex-col gap-8">
      <SearchHero onSearch={onSearch || (() => {})} />
      
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

