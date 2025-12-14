import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, DocumentData } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';

// Tipagem para os logs (pode expandir depois)
type DailyLogsMap = {
  [date: string]: DocumentData;
};

export const useDailyLogs = () => {
  const { db, user } = useAppContext();
  const [dailyLogs, setDailyLogs] = useState<DailyLogsMap>({});
  const [loadingLogs, setLoadingLogs] = useState(true);

  useEffect(() => {
    if (!user) return; // Aguarda o utilizador

    const appId = 'study-planner-pro'; // (Do seu código original)
    const logsPath = `artifacts/${appId}/users/${user.uid}/daily_logs`;
    const q = query(collection(db, logsPath));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs: DailyLogsMap = {};
      snapshot.forEach((doc) => {
        fetchedLogs[doc.id] = doc.data(); // Usa a data (doc.id) como chave
      });
      setDailyLogs(fetchedLogs);
      setLoadingLogs(false);
    }, (error) => {
      console.error("Erro ao 'ouvir' daily_logs:", error);
      setLoadingLogs(false);
    });

    // Limpa o 'listener' ao desmontar
    return () => unsubscribe();
  }, [user, db]);

  return { dailyLogs, loadingLogs };
};