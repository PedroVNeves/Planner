import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, DocumentData, Timestamp } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';

// Tipagem para uma Meta
export type GoalType = 'YEAR' | 'MONTH' | 'WEEK';

export interface Goal {
  id: string;
  type: GoalType;
  description: string;
  completed: boolean;
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

// Ordem de prioridade para ordenar
const typeOrder: Record<GoalType, number> = {
  'YEAR': 1,
  'MONTH': 2,
  'WEEK': 3,
};

export const useGoals = () => {
  const { db, user } = useAppContext();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loadingGoals, setLoadingGoals] = useState(true);

  useEffect(() => {
    if (!user) return; // Aguarda o utilizador

    const appId = 'study-planner-pro'; // (Do seu código original)
    const goalsPath = `artifacts/${appId}/users/${user.uid}/goals`;
    const q = query(collection(db, goalsPath));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedGoals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Goal));
      
      // Ordena as metas (do seu código original)
      fetchedGoals.sort((a, b) => {
        return typeOrder[a.type] - typeOrder[b.type];
      });

      setGoals(fetchedGoals);
      setLoadingGoals(false);
    }, (error) => {
      console.error("Erro ao 'ouvir' goals:", error);
      setLoadingGoals(false);
    });

    // Limpa o 'listener' ao desmontar
    return () => unsubscribe();
  }, [user, db]);

  return { goals, loadingGoals };
};