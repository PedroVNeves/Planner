import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAppContext } from '../context/AppContext';
import { Feather } from '@expo/vector-icons'; // <-- 1. ADICIONE ESTA IMPORTAÇÃO

// --- A lista de TODAS as métricas disponíveis no seu app ---

// 2. Defina o tipo de configuração da métrica (com o tipo de ícone correto)
export interface MetricConfig {
  key: string;
  label: string;
  icon: React.ComponentProps<typeof Feather>['name']; // <-- 3. ESTA É A CORREÇÃO
  unit: string;
}

// 4. Aplique o tipo ao seu objeto de métricas
export const ALL_METRICS: { [key: string]: MetricConfig } = {
  pagesRead: { key: 'pagesRead', label: 'Páginas Lidas', icon: 'book', unit: 'pág' },
  studyHours: { key: 'studyHours', label: 'Horas de Estudo', icon: 'clock', unit: 'h' },
  codeTime: { key: 'codeTime', label: 'Tempo de Código', icon: 'code', unit: 'h' },
  screenTime: { key: 'screenTime', label: 'Tempo de Tela', icon: 'smartphone', unit: 'h' },
  // Adicione novas métricas aqui no futuro
};

// A estrutura das suas definições
export interface UserSettings {
  visibleMetrics: string[]; // Um array com as "keys" (ex: ['pagesRead', 'studyHours'])
}

// O estado inicial (default) para novos utilizadores
const defaultSettings: UserSettings = {
  visibleMetrics: ['pagesRead', 'studyHours'], // Por defeito, só estas duas aparecem
};

export const useUserSettings = () => {
  const { db, user } = useAppContext();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // O caminho para o documento ÚNICO de definições
  const getSettingsDocPath = useCallback(() => {
    if (!user) return null;
    return `artifacts/study-planner-pro/users/${user.uid}/settings/user_settings`;
  }, [user]);

  // Efeito para carregar as definições
  useEffect(() => {
    const docPath = getSettingsDocPath();
    if (!docPath || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const docRef = doc(db, docPath);

    getDoc(docRef).then((docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as UserSettings);
      } else {
        setSettings(defaultSettings);
      }
      setLoading(false);
    }).catch(e => {
      console.error("Erro ao carregar definições:", e);
      setLoading(false);
    });
  }, [db, getSettingsDocPath]);

  // Função para salvar as definições
  const saveSettings = async (newSettings: UserSettings) => {
    const docPath = getSettingsDocPath();
    if (!docPath || !db) return;

    try {
      const docRef = doc(db, docPath);
      await setDoc(docRef, newSettings);
      setSettings(newSettings);
    } catch (e) {
      console.error("Erro ao salvar definições:", e);
    }
  };

  return { settings, loading, saveSettings };
};