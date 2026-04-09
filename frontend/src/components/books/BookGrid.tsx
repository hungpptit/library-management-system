/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Book } from '../../types';
import { BookCard } from './BookCard';
import { motion } from 'motion/react';

interface BookGridProps {
  books: Book[];
  onBorrow?: (book: Book) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (book: Book) => void;
  isAdmin?: boolean;
}

export const BookGrid: React.FC<BookGridProps> = ({
  books = [], // Default to empty array
  onBorrow,
  onEdit,
  onDelete,
  isAdmin = false,
}) => {
  if (!Array.isArray(books)) {
    return <div className="text-center py-10 text-slate-500">No books found.</div>;
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book, index) => (
        <motion.div
          key={book.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <BookCard
            book={book}
            onBorrow={onBorrow}
            onEdit={onEdit}
            onDelete={onDelete}
            isAdmin={isAdmin}
          />
        </motion.div>
      ))}
    </div>
  );
};
