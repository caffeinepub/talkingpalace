import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  themeColor: string;
  setThemeColor: (color: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: userProfile } = useGetCallerUserProfile();
  const [isDark, setIsDark] = useState(false);
  const [themeColor, setThemeColorState] = useState('#ea580c');

  useEffect(() => {
    if (userProfile) {
      setIsDark(userProfile.darkMode);
      setThemeColorState(userProfile.themeColor);
    }
  }, [userProfile]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    // Convert hex to OKLCH and apply as CSS variable
    // For simplicity, we'll just use the hex color directly on primary
    document.documentElement.style.setProperty('--theme-primary', themeColor);
  }, [themeColor]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  const setThemeColor = (color: string) => {
    setThemeColorState(color);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, themeColor, setThemeColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
