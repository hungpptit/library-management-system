/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Book, Loan } from '../../types';
import { SearchHero } from '../common/SearchHero';
import { SectionHeader } from '../ui/SectionHeader';
import { BookGrid } from '../books/BookGrid';
import { EmptyState } from '../ui/EmptyState';

interface UserDashboardProps {
  books: Book[];
  onSearch: (query: string) => void;
  onBorrow: (book: Book) => void;
  isLoading?: boolean;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  books,
  onSearch,
  onBorrow,
  isLoading = false,
}) => {
  const newArrivals = books.slice(0, 4);
  const mostBorrowed = books.slice(4, 8);

  return (
    <div className="flex flex-col gap-12">
      <SearchHero onSearch={onSearch} />

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
    </div>
  );
};

