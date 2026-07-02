import axios from 'axios';
import { Book, UserProfile } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'; // Backend with /api global prefix

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});


export const fetchBooksApi = async (): Promise<Book[]> => {
  try {
    const response = await apiInstance.get('/books');
    return response.data.map((book: any) => ({
      ...book,
      price: book.price ? Number(book.price) : 0,
    }));
  } catch (error) {
    console.error('Error fetching books from API:', error);
    return [];
  }
};

export const fetchBookByIdApi = async (id: string | number): Promise<Book | null> => {
  try {
    const response = await apiInstance.get(`/books/${id}`);
    const book = response.data;
    if (book) {
      book.price = book.price ? Number(book.price) : 0;
    }
    return book;
  } catch (error) {
    console.error('Error fetching book by id from API:', error);
    return null;
  }
};

export const searchBooksApi = async (keyword: string): Promise<Book[]> => {
  try {
    const response = await apiInstance.get('/books/search', {
      params: { keyword },
    });
    return response.data.map((book: any) => ({
      ...book,
      price: book.price ? Number(book.price) : 0,
    }));
  } catch (error) {
    console.error('Error searching books from API:', error);
    return [];
  }
};

export const checkIsbnApi = async (isbn: string): Promise<Book | null> => {
  try {
    const response = await apiInstance.get(`/books/isbn/${isbn}`);
    const book = response.data;
    if (book) {
      book.price = book.price ? Number(book.price) : 0;
    }
    return book;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    console.error('Error checking ISBN:', error);
    return null;
  }
};

export const addBookApi = async (book: Partial<Book>): Promise<Book> => {
  const response = await apiInstance.post('/books', book);
  const returnedBook = response.data;
  if (returnedBook) {
    returnedBook.price = returnedBook.price ? Number(returnedBook.price) : 0;
  }
  return returnedBook;
};

export const updateBookApi = async (id: string | number, book: Partial<Book>): Promise<Book> => {
  const response = await apiInstance.put(`/books/${id}`, book);
  const returnedBook = response.data;
  if (returnedBook) {
    returnedBook.price = returnedBook.price ? Number(returnedBook.price) : 0;
  }
  return returnedBook;
};

export const deleteBookApi = async (id: string | number): Promise<void> => {
  await apiInstance.delete(`/books/${id}`);
};

export const fetchUsersApi = async (): Promise<UserProfile[]> => {
  try {
    const response = await apiInstance.get('/users');
    // Map backend response if needed
    return response.data.map((user: any) => ({
      ...user,
      uid: user.id.toString(),
      displayName: user.display_name,
      studentId: user.student_id,
      phone: user.phone,
      address: user.address,
    }));
  } catch (error) {
    console.error('Error fetching users from API:', error);
    return [];
  }
};

export const addUserApi = async (userData: Partial<UserProfile>): Promise<UserProfile> => {
  const payload = {
    email: userData.email,
    display_name: userData.displayName,
    student_id: userData.studentId,
    phone: userData.phone,
    address: userData.address,
    password: userData.password || '123',
    role: userData.role || 'reader',
  };
  const response = await apiInstance.post('/users', payload);
  const user = response.data;
  return {
    ...user,
    uid: user.id.toString(),
    displayName: user.display_name,
    studentId: user.student_id,
    phone: user.phone,
    address: user.address,
  };
};

export const updateUserApi = async (id: string | number, userData: Partial<UserProfile>): Promise<UserProfile> => {
  const payload = {
    email: userData.email,
    display_name: userData.displayName,
    student_id: userData.studentId,
    phone: userData.phone,
    address: userData.address,
    role: userData.role,
  };
  const response = await apiInstance.put(`/users/${id}`, payload);
  const user = response.data;
  return {
    ...user,
    uid: user.id.toString(),
    displayName: user.display_name,
    studentId: user.student_id,
    phone: user.phone,
    address: user.address,
  };
};

export const deleteUserApi = async (id: string | number): Promise<void> => {
  await apiInstance.delete(`/users/${id}`);
};

export default apiInstance;
