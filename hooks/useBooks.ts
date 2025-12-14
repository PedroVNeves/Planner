// hooks/useBooks.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  setDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from 'firebase/firestore';
import { useAppContext } from '../context/AppContext'; // Sobe um nível para a raiz

// 1. A Interface com as correções de tipo que fizemos
export interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  status: 'TO_READ' | 'READING' | 'DONE';
  createdAt: Timestamp | FieldValue;
  startedAt?: Timestamp | FieldValue | null;
  finishedAt?: Timestamp | FieldValue | null;
}

export const useBooks = () => {
  const { db, user } = useAppContext();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // Caminho da coleção (centralizado)
  const getCollectionPath = useCallback(() => {
    if (!user) return null;
    return `artifacts/study-planner-pro/users/${user.uid}/books`;
  }, [user]);

  // Efeito para ouvir os dados (em tempo real)
  useEffect(() => {
    const collectionPath = getCollectionPath();
    if (!collectionPath || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, collectionPath));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBooks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Book));
      
      // Ordena os livros
      const sortedBooks = fetchedBooks.sort((a, b) => 
        a.status.localeCompare(b.status) || a.title.localeCompare(b.title)
      );
      setBooks(sortedBooks);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao ouvir livros (useBooks):", error);
      setLoading(false);
    });

    // Limpa o listener ao sair
    return () => unsubscribe();
  }, [db, user, getCollectionPath]);

  // Função para ADICIONAR
  const addBook = async (newData: Omit<Book, 'id' | 'createdAt' | 'status' | 'currentPage'>) => {
    const collectionPath = getCollectionPath();
    if (!collectionPath || !db) return;

    const bookPayload: Omit<Book, 'id'> = {
      ...newData,
      currentPage: 0,
      status: 'TO_READ',
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, collectionPath), bookPayload);
  };

  // Função para ATUALIZAR
  const updateBook = async (bookId: string, updates: Partial<Book>) => {
    const collectionPath = getCollectionPath();
    if (!collectionPath || !db) return;

    const docRef = doc(db, collectionPath, bookId);
    
    // Lógica de datas (do seu código original)
    if (updates.status === 'DONE' && !updates.finishedAt) {
      updates.finishedAt = serverTimestamp();
    }
    if (updates.status === 'READING' && !updates.startedAt) {
      updates.startedAt = serverTimestamp();
    }
    
    await setDoc(docRef, updates, { merge: true });
  };

  // Função para APAGAR
  const deleteBook = async (bookId: string) => {
    const collectionPath = getCollectionPath();
    if (!collectionPath || !db) return;

    const docRef = doc(db, collectionPath, bookId);
    await deleteDoc(docRef);
  };

  return { books, loading, addBook, updateBook, deleteBook };
};