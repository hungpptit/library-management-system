import axios from 'axios';
import { Book } from '../types';

const API_BASE_URL = 'http://localhost:3001'; // Update to match common NestJS or your specific dev port

const apiInstance = axios.create({
  baseURL: API_BASE_URL,
});

export const fetchBooksApi = async (): Promise<Book[]> => {
  try {
    const response = await apiInstance.get('/books');
    return response.data;
  } catch (error) {
    console.error('Error fetching books from API:', error);
    return [];
  }
};

export const searchBooksApi = async (keyword: string): Promise<Book[]> => {
  try {
    const response = await apiInstance.get('/books/search', {
      params: { keyword },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching books from API:', error);
    return [];
  }
};

export const checkIsbnApi = async (isbn: string): Promise<Book | null> => {
  try {
    const response = await apiInstance.get(`/books/isbn/${isbn}`);
    return response.data;
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
  return response.data;
};

export const updateBookApi = async (id: string | number, book: Partial<Book>): Promise<Book> => {
  const response = await apiInstance.put(`/books/${id}`, book);
  return response.data;
};

export const deleteBookApi = async (id: string | number): Promise<void> => {
  await apiInstance.delete(`/books/${id}`);
};

export default apiInstance;
