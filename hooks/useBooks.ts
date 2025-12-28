
// hooks/useBooks.ts
import { useState, useEffect, useCallback } from 'react';
import { getDB } from '../database';
import { Book } from '../types'; // Assuming you have a types file, or we define it here.

// If you don't have a central types file, you can define the interface here:
// export interface Book {
//   id: string;
//   title: string;
//   author: string;
//   totalPages: number;
//   currentPage: number;
//   status: 'TO_READ' | 'READING' | 'DONE';
//   rating?: number;
//   startedAt?: string | null;
//   finishedAt?: string | null;
// }

const db = getDB();

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const allRows = await db.getAllAsync<Book>('SELECT * FROM books ORDER BY status, title');
      setBooks(allRows);
    } catch (error) {
      console.error('Error fetching books from SQLite:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const addBook = async (newData: Omit<Book, 'id' | 'currentPage' | 'status'>) => {
    const id = crypto.randomUUID();
    try {
      await db.runAsync(
        'INSERT INTO books (id, title, author, totalPages) VALUES (?, ?, ?, ?)',
        [id, newData.title, newData.author, newData.totalPages]
      );
      fetchBooks(); // Re-fetch to update the list
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  const updateBook = async (bookId: string, updates: Partial<Book>) => {
    try {
      // Logic for setting start and finish dates
      if (updates.status === 'READING' && !updates.startedAt) {
        updates.startedAt = new Date().toISOString();
      }
      if (updates.status === 'DONE' && !updates.finishedAt) {
        updates.finishedAt = new Date().toISOString();
      }
      
      const existingBook = books.find(b => b.id === bookId);
      if (!existingBook) return;

      const updatedBook = { ...existingBook, ...updates };

      await db.runAsync(
        `UPDATE books 
         SET title = ?, author = ?, totalPages = ?, currentPage = ?, status = ?, rating = ?, startedAt = ?, finishedAt = ?
         WHERE id = ?`,
        [
          updatedBook.title,
          updatedBook.author,
          updatedBook.totalPages,
          updatedBook.currentPage,
          updatedBook.status,
          updatedBook.rating ?? 0,
          updatedBook.startedAt,
          updatedBook.finishedAt,
          bookId,
        ]
      );
      fetchBooks(); // Re-fetch to update the list
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  const deleteBook = async (bookId: string) => {
    try {
      await db.runAsync('DELETE FROM books WHERE id = ?', [bookId]);
      fetchBooks(); // Re-fetch to update the list
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  return { books, loading, addBook, updateBook, deleteBook, refreshBooks: fetchBooks };
};
