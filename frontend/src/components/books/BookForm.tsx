/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Book } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { GENRES } from '../../constants';
import { checkIsbnApi } from '../../services/apiService';
import { toast } from 'react-hot-toast';

interface BookFormProps {
  initialData?: Partial<Book>;
  onSubmit: (data: Partial<Book>) => void;
  isLoading?: boolean;
}

export const BookForm: React.FC<BookFormProps> = ({
  initialData,
  onSubmit,
  isLoading: isSubmitting = false,
}) => {
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [formData, setFormData] = useState<Partial<Book>>({
    title: initialData?.title || '',
    author: Array.isArray((initialData as any)?.authors) && (initialData as any).authors.length > 0
      ? (initialData as any).authors[0].name
      : (initialData as any)?.author?.name || initialData?.author || '',
    isbn: initialData?.isbn || '',
    quantity: initialData?.quantity || 1,
    genre: (initialData as any)?.category?.name || initialData?.genre || GENRES[0],
    description: initialData?.description || '',
    coverUrl: initialData?.coverUrl || (initialData as any)?.cover_url || '',
    year: initialData?.year || new Date().getFullYear(),
    publisher: (initialData as any)?.publisher?.name || initialData?.publisher || '',
    price: initialData?.price || 0,
    location: initialData?.location || '',
  });

  const handleIsbnBlur = async () => {
    const isbn = formData.isbn;
    if (!isbn) return;
    
    // Nếu đang Edit và người dùng không đổi ISBN thì không cần check
    if (initialData?.id && isbn === initialData.isbn) {
        setIsDuplicate(false);
        return;
    }

    setIsValidating(true);
    try {
      const existingBook = await checkIsbnApi(isbn) as any;
      if (existingBook && existingBook.id !== initialData?.id) {
        setIsDuplicate(true);
        toast.error('This ISBN already exists for another book!', { id: 'isbn-duplicate' });
      } else {
        setIsDuplicate(false);
      }
    } catch (error) {
      console.error('ISBN check error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isDuplicate) return;
    onSubmit(formData);
  };

  return (
    <div className="px-8 py-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 flex flex-col gap-1.5">
          <Input
            label="ISBN"
            value={formData.isbn}
            onChange={(e) => {
                setFormData({ ...formData, isbn: e.target.value });
                if (isDuplicate) setIsDuplicate(false); // Reset on change
            }}
            onBlur={handleIsbnBlur}
            required
            className={isDuplicate ? 'border-red-500 ring-red-100 ring-2' : ''}
          />
          {isDuplicate && (
            <span className="text-xs font-bold text-red-500 animate-pulse">
                This book already exists in the system. Please review the ISBN.
            </span>
          )}
          {isValidating && <span className="text-[10px] text-sky-400">Verifying ISBN...</span>}
        </div>
        <Input
          label="Book Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          disabled={isDuplicate}
        />
        <Input
          label="Author"
          value={formData.author}
          onChange={(e) => setFormData({ ...formData, author: e.target.value })}
          required
          disabled={isDuplicate}
        />
        <Input
          label="Quantity"
          type="number"
          min="1"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
          required
          disabled={isDuplicate}
        />
        <Input
          label="Publication Year"
          type="number"
          value={formData.year}
          onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
          disabled={isDuplicate}
        />
        <Input
          label="Publisher"
          value={formData.publisher}
          onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
          disabled={isDuplicate}
        />
        <Input
          label="Price ($)"
          type="number"
          step="0.01"
          value={formData.price}
          onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
          disabled={isDuplicate}
        />
        <Input
          label="Warehouse Location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="e.g. Shelf A-12"
          disabled={isDuplicate}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="book-genre" className={`text-sm font-medium ${isDuplicate ? 'text-slate-400' : 'text-slate-700'}`}>Genre</label>
          <select
            id="book-genre"
            title="Book genre"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            disabled={isDuplicate}
            className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all ${isDuplicate ? 'bg-slate-50 text-slate-400' : ''}`}
          >
            {GENRES.map((genre) => (
              <option key={genre} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
        <Input
          label="Cover URL (Optional)"
          className="md:col-span-2"
          value={formData.coverUrl}
          onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
          placeholder="https://example.com/cover.jpg"
          disabled={isDuplicate}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="book-description" className={`text-sm font-medium ${isDuplicate ? 'text-slate-400' : 'text-slate-700'}`}>Description</label>
        <textarea
          id="book-description"
          title="Book description"
          placeholder="Enter a short description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          disabled={isDuplicate}
          className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all min-h-[100px] ${isDuplicate ? 'bg-slate-50 text-slate-400 italic' : ''}`}
        />
      </div>
      <Button 
          type="submit" 
          isLoading={isSubmitting} 
          disabled={isDuplicate}
          className={`w-full ${isDuplicate ? 'opacity-50 cursor-not-allowed bg-slate-300' : ''}`}
        >
          {isDuplicate ? 'Cannot Add - Duplicate ISBN' : initialData?.id ? 'Save Changes' : 'Add Book'}
        </Button>
      </form>
    </div>
  );
};

