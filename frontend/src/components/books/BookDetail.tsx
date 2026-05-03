/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Book } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { BookOpen, Hash, Info, Check } from 'lucide-react';

interface BookDetailProps {
  book: Book;
  onBorrow?: (book: Book) => Promise<void>;
  isLoading?: boolean;
}

export const BookDetail: React.FC<BookDetailProps> = ({
  book,
  onBorrow,
  isLoading = false,
}) => {
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => setIsSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleBorrow = async () => {
    if (onBorrow) {
      try {
        await onBorrow(book);
        setIsSuccess(true);
      } catch (error) {
        console.error(error);
      }
    }
  };
  const isOutOfStock = Number(book.available || 0) <= 0;

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-64 shrink-0">
        <div className="aspect-[3/4] rounded-3xl overflow-hidden bg-slate-100 card-shadow">
          <img
            src={book.coverUrl || `https://picsum.photos/seed/${book.id}/300/400`}
            alt={book.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 flex-1">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant={book.available > 0 ? 'success' : 'danger'}>
              {book.available > 0 ? 'Available' : 'Unavailable'}
            </Badge>
            <Badge variant="primary">{book.genre}</Badge>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{book.title}</h1>
          <p className="text-xl text-slate-500 font-medium">by {book.author}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
            <Hash className="w-5 h-5 text-sky-500" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-bold uppercase">ISBN</span>
              <span className="text-sm font-medium text-slate-700">{book.isbn}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
            <BookOpen className="w-5 h-5 text-sky-500" />
            <div className="flex flex-col">
              <span className="text-xs text-slate-400 font-bold uppercase">Availability</span>
              <span className="text-sm font-medium text-slate-700">{book.available} / {book.quantity} copies</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-900 font-bold">
            <Info className="w-5 h-5 text-sky-500" />
            <span>Description</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {book.description || 'No description available for this book.'}
          </p>
        </div>

        <Button
          size="lg"
          className="w-full md:w-auto md:px-12 flex items-center gap-2 transition-all duration-300"
          variant={isSuccess ? 'secondary' : 'primary'}
          disabled={isSuccess || isOutOfStock}
          isLoading={isLoading}
          onClick={handleBorrow}
        >
          {isSuccess ? (
            <>
              <Check className="w-5 h-5" />
              <span>Processing</span>
            </>
          ) : (
            'Request'
          )}
        </Button>
      </div>
    </div>
  );
};

