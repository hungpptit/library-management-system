/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Book, Loan } from '../../types';
import { SearchHero } from '../common/SearchHero';
import { SectionHeader } from '../ui/SectionHeader';
import { BookGrid } from '../books/BookGrid';
import { EmptyState } from '../ui/EmptyState';

interface UserDashboardProps {
  books: Book[];
  searchQuery?: string;
  onSearch: (query: string) => void;
  onBorrow: (book: Book) => void;
  isLoading?: boolean;
}

const BOOKS_PER_PAGE = 6;

export const UserDashboard: React.FC<UserDashboardProps> = ({
  books = [],
  searchQuery = '',
  onSearch,
  onBorrow,
  isLoading = false,
}) => {
  const isSearching = searchQuery.trim().length > 0;
  const newArrivals = books.slice(0, 4);
  const mostBorrowed = books.slice(4, 8);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(books.length / BOOKS_PER_PAGE);
  const startIndex = (currentPage - 1) * BOOKS_PER_PAGE;
  const paginatedAllBooks = books.slice(startIndex, startIndex + BOOKS_PER_PAGE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="flex flex-col gap-12">
      <SearchHero onSearch={onSearch} />

      {isSearching ? (
        <div className="flex flex-col gap-8">
          <SectionHeader
            title="Search Results"
            subtitle={`Found ${books.length} books matching "${searchQuery}"`}
          />
          {books.length > 0 ? (
            <BookGrid books={books} onBorrow={onBorrow} />
          ) : (
            <EmptyState
              title="No books found"
              description="We couldn't find any books matching your search query."
            />
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-8">
            <SectionHeader
              title="New Arrivals"
              subtitle="The latest additions to our library"
            />
            {newArrivals.length > 0 ? (
              <BookGrid books={newArrivals} onBorrow={onBorrow} />
            ) : (
              <EmptyState
                title="No books found"
                description="We couldn't find any new arrivals at the moment."
              />
            )}
          </div>

          <div className="flex flex-col gap-8">
            <SectionHeader
              title="Most Borrowed"
              subtitle="Popular titles among our readers"
            />
            {mostBorrowed.length > 0 ? (
              <BookGrid books={mostBorrowed} onBorrow={onBorrow} />
            ) : (
              <EmptyState
                title="No books found"
                description="We couldn't find any popular books at the moment."
              />
            )}
          </div>

          <div className="flex flex-col gap-8">
            <SectionHeader
              title="All Books"
              subtitle="Browse our entire library collection"
            />
            {books.length > 0 ? (
              <>
                <BookGrid books={paginatedAllBooks} onBorrow={onBorrow} />
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNum = index + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 text-sm font-semibold rounded-xl flex items-center justify-center transition-all shadow-sm ${
                            currentPage === pageNum
                              ? 'bg-sky-500 text-white font-bold'
                              : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                title="No books found"
                description="We couldn't find any books in the library at the moment."
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

