import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getDB } from '../database';

export type ThemeType = 'ocean' | 'forest' | 'dracula' | 'coffee' | 'custom';

export interface ColorPalette {
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    primary: string;
    accent: string;
    border: string;
}

export const themes: Record<string, ColorPalette> = {
    ocean: { background: '#F0F4F8', card: '#FFFFFF', text: '#102A43', textSecondary: '#627D98', primary: '#334E68', accent: '#3EBD93', border: '#D9E2EC' },
    forest: { background: '#F2F5F1', card: '#FFFFFF', text: '#1A3C24', textSecondary: '#5C7C64', primary: '#2D5A3F', accent: '#84B59F', border: '#DDE5DF' },
    dracula: { background: '#282A36', card: '#44475A', text: '#F8F8F2', textSecondary: '#BFBFBF', primary: '#BD93F9', accent: '#50FA7B', border: '#6272A4' },
    coffee: { background: '#F5F0EB', card: '#FFFFFF', text: '#4B3832', textSecondary: '#857067', primary: '#8C6B5D', accent: '#D4A373', border: '#E6DDD7' },
};

// Helper para gerar paleta rápida (caso o usuário use o seletor simples)
const createCustomPalette = (primaryColor: string): ColorPalette => ({
    background: '#FAFAFA',
    card: '#FFFFFF',
    text: '#121212',
    textSecondary: '#757575',
    primary: primaryColor,
    accent: primaryColor,
    border: '#E0E0E0',
});

interface ThemeContextData {
    theme: ColorPalette;
    themeName: ThemeType;
    setTheme: (name: ThemeType) => void;
    setCustomTheme: (colorOrPalette: string | ColorPalette) => void; // Aceita cor OU objeto completo
}

const defaultTheme = themes.ocean;
const ThemeContext = createContext<ThemeContextData>({
    theme: defaultTheme,
    themeName: 'ocean',
    setTheme: () => {},
    setCustomTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [themeName, setThemeName] = useState<ThemeType>('ocean');
    const [customPalette, setCustomPalette] = useState<ColorPalette | null>(null);

    // Carregar tema salvo ao iniciar
    useEffect(() => {
        try {
            const db = getDB();
            const result = db.getFirstSync('SELECT current_theme FROM user_stats WHERE id = ?', ['user']) as { current_theme: string } | null;
            
            if (result?.current_theme) {
                const val = result.current_theme;
                if (val.startsWith('{')) {
                    // É um objeto JSON (paleta completa)
                    setCustomPalette(JSON.parse(val));
                    setThemeName('custom');
                } else if (val.startsWith('#')) {
                    // É uma cor única (modo antigo)
                    setCustomPalette(createCustomPalette(val));
                    setThemeName('custom');
                } else {
                    // É um nome de preset
                    setThemeName(val as ThemeType);
                }
            }
        } catch (e) {
            console.log('Erro ao carregar tema:', e);
        }
    }, []);

    const saveThemeToDB = (value: string) => {
        try {
            const db = getDB();
            db.runSync(`INSERT OR IGNORE INTO user_stats (id) VALUES ('user')`); 
            db.runSync(`UPDATE user_stats SET current_theme = ? WHERE id = 'user'`, [value]);
        } catch (e) {
            console.error('Erro ao salvar tema:', e);
        }
    };

    const updateTheme = (name: ThemeType) => {
        setThemeName(name);
        setCustomPalette(null);
        saveThemeToDB(name);
    };

    // Atualiza Cor Personalizada (Simples ou Completa)
    const updateCustomTheme = (colorOrPalette: string | ColorPalette) => {
        let newPalette: ColorPalette;
        let dbValue: string;

        if (typeof colorOrPalette === 'string') {
            // Modo simples (só cor primária)
            newPalette = createCustomPalette(colorOrPalette);
            dbValue = colorOrPalette; 
        } else {
            // Modo avançado (objeto completo)
            newPalette = colorOrPalette;
            dbValue = JSON.stringify(colorOrPalette);
        }

        // 1. Atualiza UI imediatamente
        setCustomPalette(newPalette);
        setThemeName('custom');
        
        // 2. Persiste
        saveThemeToDB(dbValue);
    };

    const activeTheme = themeName === 'custom' && customPalette ? customPalette : themes[themeName] || themes.ocean;

    const contextValue = useMemo(() => ({
        theme: activeTheme,
        themeName,
        setTheme: updateTheme,
        setCustomTheme: updateCustomTheme
    }), [activeTheme, themeName]);

    return (
        <ThemeContext.Provider value={contextValue}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);