// hooks/useUserSettings.tsx
import { useState, useEffect, useCallback } from 'react';
import { getDB } from '../database';
import { UserSettings, MetricConfig } from '../types';
import { Feather } from '@expo/vector-icons';

const db = getDB();

// This seems to be static configuration data.
// For a local-first app, this could be seeded into the DB or kept as a constant.
export const ALL_METRICS: { [key: string]: Omit<MetricConfig, 'id' | 'target' | 'isVisible'> } = {
  pagesRead: { name: 'Páginas Lidas', icon: 'book', unit: 'pág' },
  studyHours: { name: 'Horas de Estudo', icon: 'clock', unit: 'h' },
  codeTime: { name: 'Tempo de Código', icon: 'code', unit: 'h' },
  screenTime: { name: 'Tempo de Tela', icon: 'smartphone', unit: 'h' },
};

// Default settings for a new user
const defaultSettings: UserSettings = {
    id: 'user',
    current_streak: 0,
    last_completed_date: null,
    freeze_days: 3,
    current_theme: 'ocean'
};

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const userSettings = await db.getFirstAsync<UserSettings>(
        "SELECT * FROM user_stats WHERE id = 'user'"
      );
      
      if (userSettings) {
        setSettings(userSettings);
      } else {
        // If no settings, maybe create them? The DB init script does this.
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error fetching user settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (newSettings: Partial<UserSettings>) => {
    const currentSettings = { ...settings, ...newSettings };
    try {
      await db.runAsync(
        `UPDATE user_stats SET 
          current_streak = ?, 
          last_completed_date = ?, 
          freeze_days = ?, 
          current_theme = ?
         WHERE id = 'user'`,
        [
          currentSettings.current_streak,
          currentSettings.last_completed_date,
          currentSettings.freeze_days,
          currentSettings.current_theme,
        ]
      );
      setSettings(currentSettings);
    } catch (e) {
      console.error("Error saving settings:", e);
    }
  };

  return { settings, loading, saveSettings, refreshSettings: fetchSettings };
};