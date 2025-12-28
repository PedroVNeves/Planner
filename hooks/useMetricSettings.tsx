import { useState, useEffect, useCallback } from 'react';
import * as Crypto from 'expo-crypto';
import { getDB } from '../database';

export interface Metric {
  id: string;
  name: string;
  unit: string;
  icon: any;
  target: number; // Adicionado target
  isVisible: boolean;
}

export const useMetricSettings = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMetrics = useCallback(async () => {
    const db = getDB();
    try {
      // Converte 0/1 do SQLite para boolean
      const result = await db.getAllAsync('SELECT * FROM metric_definitions');
      const parsedMetrics = result.map((m: any) => ({
        ...m,
        isVisible: m.isVisible === 1
      }));
      setMetrics(parsedMetrics);
    } catch (e) {
      console.error("Erro ao carregar métricas:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  // Agora aceita 4 argumentos: name, unit, icon e target
  const addMetric = async (name: string, unit: string, icon: string, target: number = 0) => {
    const db = getDB();
    const id = Crypto.randomUUID();
    try {
      await db.runAsync(
        `INSERT INTO metric_definitions (id, name, unit, icon, target, isVisible) VALUES (?, ?, ?, ?, ?, 1)`,
        [id, name, unit, icon, target]
      );
      loadMetrics();
    } catch (e) {
      console.error("Erro ao adicionar métrica:", e);
      throw e;
    }
  };

  const deleteMetric = async (id: string) => {
    const db = getDB();
    try {
      await db.runAsync(`DELETE FROM metric_definitions WHERE id = ?`, [id]);
      loadMetrics();
    } catch (e) { console.error(e); }
  };

  const toggleMetricVisibility = async (id: string, currentStatus: boolean) => {
    const db = getDB();
    try {
      const newStatus = currentStatus ? 0 : 1;
      await db.runAsync(`UPDATE metric_definitions SET isVisible = ? WHERE id = ?`, [newStatus, id]);
      loadMetrics();
    } catch (e) { console.error(e); }
  };

  return {
    metrics,
    loading,
    addMetric,
    deleteMetric,
    toggleMetricVisibility
  };
};