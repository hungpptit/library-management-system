# Frontend Data Summary

This document summarizes all the fake/mock data currently used in the frontend application.

## Source: `frontend/src/services/localService.ts`

This service uses `localStorage` but initializes with the following default data if storage is empty.

### 1. Initial Books (`INITIAL_BOOKS`)
Array of `Book` objects.

```typescript
[
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    quantity: 5,
    available: 4,
    coverUrl: 'https://picsum.photos/seed/gatsby/300/400',
    genre: 'Classic',
    description: 'A story of wealth, love, and the American Dream.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1925,
    publisher: 'Charles Scribner\'s Sons',
    price: 15.99,
    location: 'Shelf A-12',
  },
  {
    id: '2',
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0451524935',
    quantity: 3,
    available: 2,
    coverUrl: 'https://picsum.photos/seed/1984/300/400',
    genre: 'Dystopian',
    description: 'A chilling vision of a totalitarian future.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1949,
    publisher: 'Secker & Warburg',
    price: 12.50,
    location: 'Shelf B-05',
  },
  {
    id: '3',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0446310789',
    quantity: 4,
    available: 4,
    coverUrl: 'https://picsum.photos/seed/mockingbird/300/400',
    genre: 'Fiction',
    description: 'A novel about racial injustice and the loss of innocence.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1960,
    publisher: 'J.B. Lippincott & Co.',
    price: 14.95,
    location: 'Shelf C-01',
  },
  {
    id: '4',
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    isbn: '978-0547928227',
    quantity: 6,
    available: 6,
    coverUrl: 'https://picsum.photos/seed/hobbit/300/400',
    genre: 'Fantasy',
    description: 'A fantasy novel about the adventures of Bilbo Baggins.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1937,
    publisher: 'George Allen & Unwin',
    price: 18.00,
    location: 'Shelf F-08',
  },
  {
    id: '5',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    isbn: '978-0141439418',
    quantity: 2,
    available: 1,
    coverUrl: 'https://picsum.photos/seed/pride/300/400',
    genre: 'Romance',
    description: 'A romantic novel of manners.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1813,
    publisher: 'T. Egerton',
    price: 10.99,
    location: 'Shelf R-02',
  },
  {
    id: '6',
    title: 'The Catcher in the Rye',
    author: 'J.D. Salinger',
    isbn: '978-0316769488',
    quantity: 3,
    available: 3,
    coverUrl: 'https://picsum.photos/seed/catcher/300/400',
    genre: 'Fiction',
    description: 'A story about teenage angst and alienation.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1951,
    publisher: 'Little, Brown and Company',
    price: 13.25,
    location: 'Shelf F-15',
  },
  {
    id: '7',
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    isbn: '978-0062315007',
    quantity: 10,
    available: 10,
    coverUrl: 'https://picsum.photos/seed/alchemist/300/400',
    genre: 'Adventure',
    description: 'A fable about following your dreams.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1988,
    publisher: 'HarperCollins',
    price: 16.50,
    location: 'Shelf A-03',
  },
  {
    id: '8',
    title: 'Brave New World',
    author: 'Aldous Huxley',
    isbn: '978-0060850524',
    quantity: 4,
    available: 4,
    coverUrl: 'https://picsum.photos/seed/brave/300/400',
    genre: 'Dystopian',
    description: 'A searching vision of an unequal, technologically-advanced future.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1932,
    publisher: 'Chatto & Windus',
    price: 14.00,
    location: 'Shelf B-07',
  },
  {
    id: '9',
    title: 'The Lord of the Rings',
    author: 'J.R.R. Tolkien',
    isbn: '978-0544003415',
    quantity: 2,
    available: 2,
    coverUrl: 'https://picsum.photos/seed/lotr/300/400',
    genre: 'Fantasy',
    description: 'The epic saga of the War of the Ring.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1954,
    publisher: 'George Allen & Unwin',
    price: 25.00,
    location: 'Shelf F-09',
  },
  {
    id: '10',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    isbn: '978-0141439470',
    quantity: 3,
    available: 3,
    coverUrl: 'https://picsum.photos/seed/frankenstein/300/400',
    genre: 'Horror',
    description: 'The story of Victor Frankenstein and his monstrous creation.',
    status: 'Available',
    createdAt: Date.now(),
    year: 1818,
    publisher: 'Lackington, Hughes, Harding, Mavor & Jones',
    price: 11.50,
    location: 'Shelf H-01',
  },
]
```

### 2. Initial Users (`INITIAL_USERS`)
Array of `UserProfile` objects.

```typescript
[
  {
    uid: 'admin123',
    email: 'admin@library.com',
    displayName: 'Librarian Admin',
    studentId: 'ADM-001',
    role: 'admin',
    createdAt: Date.now(),
    password: '123',
  },
  {
    uid: 'reader123',
    email: 'student@university.edu',
    displayName: 'John Doe',
    studentId: 'STU-2024-001',
    role: 'reader',
    createdAt: Date.now(),
    password: '123',
  },
]
```

### 3. Initial Loans (`INITIAL_LOANS`)
Array of `Loan` objects.

```typescript
[
  {
    id: 'loan1',
    bookId: '1',
    bookTitle: 'The Great Gatsby',
    readerId: 'reader123',
    readerName: 'John Doe',
    issueDate: Date.now() - 5 * 24 * 60 * 60 * 1000,
    dueDate: Date.now() + 9 * 24 * 60 * 60 * 1000,
    status: 'Borrowing',
    fee: 0,
  },
  {
    id: 'loan2',
    bookId: '2',
    bookTitle: '1984',
    readerId: 'reader123',
    readerName: 'John Doe',
    issueDate: Date.now() - 15 * 24 * 60 * 60 * 1000,
    dueDate: Date.now() - 1 * 24 * 60 * 60 * 1000,
    status: 'Overdue',
    fee: 5.5,
  },
  {
    id: 'loan3',
    bookId: '5',
    bookTitle: 'Pride and Prejudice',
    readerId: 'reader123',
    readerName: 'John Doe',
    issueDate: Date.now() - 20 * 24 * 60 * 60 * 1000,
    dueDate: Date.now() - 6 * 24 * 60 * 60 * 1000,
    returnDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
    status: 'Returned',
    fee: 0,
  },
]
```

## Source: `frontend/src/constants.ts`

### 1. Genres (`GENRES`)
Static list of book types.

```typescript
[
  'Fiction',
  'Non-Fiction',
  'Science',
  'History',
  'Technology',
  'Biography',
  'Fantasy',
  'Mystery',
]
```

### 2. Theme (`THEME`)
Static color configuration.

```typescript
{
  primary: '#E0F2FE', // Sky blue 100
  accent: '#0EA5E9',  // Sky blue 500
  background: '#FFFFFF',
  text: '#0F172A',    // Slate 900
  muted: '#64748B',   // Slate 500
  border: '#E2E8F0',  // Slate 200
}
```

## Source: Fallback Images

These are used in `BookCard.tsx` and `BookDetail.tsx` when a book image is missing.

**Pattern:** `https://picsum.photos/seed/${book.id}/300/400`
