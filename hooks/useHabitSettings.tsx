// Em: hooks/useHabitSettings.tsx
import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  addDoc,
  deleteDoc,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';
import { Feather } from '@expo/vector-icons';

// A estrutura de um Hábito
export interface Habit {
  id: string;
  name: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  createdAt: Timestamp;
}

export const useHabitSettings = () => {
  const { db, user } = useAppContext();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  // O caminho para a coleção de hábitos
  const getHabitsCollectionPath = useCallback(() => {
    if (!user) return null;
    return `artifacts/study-planner-pro/users/${user.uid}/habits`;
  }, [user]);

  // Efeito para carregar os hábitos em tempo real
  useEffect(() => {
    const collectionPath = getHabitsCollectionPath();
    if (!collectionPath || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Ordena os hábitos por data de criação
    const q = query(collection(db, collectionPath), orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedHabits = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Habit));
      setHabits(fetchedHabits);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao carregar hábitos:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, user, getHabitsCollectionPath]);

  // Função para ADICIONAR um novo hábito
  const addHabit = async (name: string, icon: React.ComponentProps<typeof Feather>['name']) => {
    const collectionPath = getHabitsCollectionPath();
    if (!collectionPath || !db) return;

    const payload = {
      name: name,
      icon: icon,
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, collectionPath), payload);
  };

  // Função para APAGAR um hábito
  const deleteHabit = async (habitId: string) => {
    const collectionPath = getHabitsCollectionPath();
    if (!collectionPath || !db) return;

    const docRef = doc(db, collectionPath, habitId);
    await deleteDoc(docRef);
  };

  return { habits, loading, addHabit, deleteHabit };
};