import { useState, useEffect, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { getDB } from '../database';
import { differenceInCalendarDays } from 'date-fns';

export interface UserStats {
    current_streak: number;
    last_completed_date: string | null;
    freeze_days: number;
}

export const useGamification = () => {
    const [stats, setStats] = useState<UserStats>({
        current_streak: 0,
        last_completed_date: null,
        freeze_days: 3, // Começa com 3 por padrão visual
    });

    // Utilitário para pegar data local YYYY-MM-DD
    const getTodayLocal = () => {
        const now = new Date();
        return now.toISOString().split('T')[0]; 
    };

    const loadStats = useCallback(() => {
        const db = getDB();
        try {
            // Garante que a tabela existe e pega dados
            const result = db.getFirstSync('SELECT * FROM user_stats WHERE id = ?', ['user']) as UserStats;
            if (result) {
                setStats(result);
            }
        } catch (e) {
            console.error('Error loading stats:', e);
        }
    }, []);

    // Carrega ao iniciar
    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const updateStats = (newStats: Partial<UserStats>) => {
        const db = getDB();
        const updated = { ...stats, ...newStats };
        setStats(updated); // Atualiza UI instantaneamente
        
        try {
            db.runSync(`
                UPDATE user_stats 
                SET current_streak = ?, last_completed_date = ?, freeze_days = ?
                WHERE id = 'user'
            `, [updated.current_streak, updated.last_completed_date, updated.freeze_days]);
        } catch (e) {
            console.error('Error saving stats:', e);
        }
    };

    // Chamado ao abrir o App (Dashboard)
    const checkStreak = useCallback(() => {
        if (!stats.last_completed_date) return;

        const today = getTodayLocal();
        const lastDate = new Date(stats.last_completed_date + 'T00:00:00');
        const todayDate = new Date(today + 'T00:00:00');
        
        const diff = differenceInCalendarDays(todayDate, lastDate);

        // Se a diferença for maior que 1 (ex: completou anteontem, diff = 2)
        if (diff > 1) {
            const daysMissed = diff - 1; // Dias que realmente faltou
            
            if (stats.freeze_days >= daysMissed) {
                // SALVO PELO GONGO: Consome vidas para cobrir os dias
                const remainingLives = stats.freeze_days - daysMissed;
                
                // Atualiza data para "ontem" para manter a sequencia válida visualmente
                // (Opcional, mas ajuda na lógica de continuidade)
                updateStats({ 
                    freeze_days: remainingLives 
                    // Não mudamos a streak, ela mantém.
                });
            } else {
                // GAME OVER: Não tem vidas suficientes
                updateStats({ current_streak: 0 });
            }
        }
    }, [stats]);

    // Chamado ao completar Tarefa/Métrica
    const onTaskCompleted = async () => {
        // Vibração de sucesso
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        const today = getTodayLocal();
        const lastDateStr = stats.last_completed_date;
        
        let newStreak = stats.current_streak;
        let newFreeze = stats.freeze_days;

        if (!lastDateStr) {
            // Primeira tarefa da vida
            newStreak = 1;
        } else {
            const diff = differenceInCalendarDays(new Date(today), new Date(lastDateStr));

            if (diff === 0) {
                // Já fez hoje, não aumenta streak
                return; 
            } else if (diff === 1) {
                // Fez ontem, aumenta streak (sequência perfeita)
                newStreak += 1;
            } else {
                // Passou dias (diff > 1)
                // A lógica do checkStreak já deve ter descontado as vidas ao abrir o app.
                // Aqui, se sobrou vida, a gente continua a streak (+1).
                // Se zerou, recomeça do 1.
                if (newStreak > 0) {
                    newStreak += 1;
                } else {
                    newStreak = 1;
                }
            }
        }

        // --- LÓGICA DE GANHAR VIDA (NOVO) ---
        // A cada 7 dias de ofensiva, ganha 1 vida (Máximo 5)
        if (newStreak > 0 && newStreak % 7 === 0 && newFreeze < 5) {
            newFreeze += 1;
            // Aqui você poderia disparar um alerta "Ganhou uma vida!" na UI
        }

        updateStats({
            current_streak: newStreak,
            last_completed_date: today,
            freeze_days: newFreeze
        });
    };

    return {
        stats,
        onTaskCompleted,
        checkStreak, 
        refreshStats: loadStats
    };
};