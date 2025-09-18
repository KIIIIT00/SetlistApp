import React,
{ createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { tokens, AppTheme } from '../theme';
import {
    loadThemePreference,
    saveThemePreference,
    ThemePreference,
} from '../utils/setting';

// Contextに渡す値の型定義
interface ThemeContextType {
    theme: AppTheme; 
    themePreference: ThemePreference; // ユーザーの設定 (light, dark)
    isDarkMode: boolean; 
    setThemePreference: (theme: ThemePreference) => void; 
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const colorScheme = useColorScheme(); 
    const [themePreference, setThemePreferenceState] =
        useState<ThemePreference>('light'); 

    useEffect(() => {
        const loadSettings = async () => {
            const savedTheme = await loadThemePreference();
            setThemePreferenceState(savedTheme);
        };
        loadSettings();
    }, []);

    const handleSetThemePreference = (newTheme: ThemePreference) => {
        setThemePreferenceState(newTheme);
        saveThemePreference(newTheme);
    };

    const isDarkMode =
        themePreference === 'light'
            ? colorScheme === 'dark'
            : themePreference === 'dark';

    const theme = isDarkMode ? tokens.colors.dark : tokens.colors.light;

    return (
        <ThemeContext.Provider
            value={{
                theme,
                themePreference,
                isDarkMode,
                setThemePreference: handleSetThemePreference,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};