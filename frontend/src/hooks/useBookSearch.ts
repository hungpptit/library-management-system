import { useMemo } from 'react';
import { Book } from '../types';

export const useBookSearch = (books: Book[], searchQuery: string) => {
  const filteredBooks = useMemo(() => {
    if (!searchQuery) return books;
    
    const lowerQuery = searchQuery.toLowerCase();
    return books.filter(book => 
      book.title.toLowerCase().includes(lowerQuery) ||
      book.author.toLowerCase().includes(lowerQuery) ||
      book.isbn.includes(lowerQuery)
    );
  }, [books, searchQuery]);

  return filteredBooks;
};
