import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useGetCallerUserProfile } from '../hooks/useCurrentUserProfile';
import { hexToOKLCH } from '../utils/color';

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
    // Convert hex to OKLCH and apply to CSS variables
    const oklch = hexToOKLCH(themeColor);
    
    // Apply to primary and ring tokens for both light and dark modes
    document.documentElement.style.setProperty('--primary', oklch);
    document.documentElement.style.setProperty('--ring', oklch);
    document.documentElement.style.setProperty('--chart-5', oklch);
    
    // Adjust lightness for dark mode primary if currently in dark mode
    if (isDark) {
      // Increase lightness slightly for better visibility in dark mode
      const parts = oklch.split(' ');
      const L = parseFloat(parts[0]);
      const adjustedL = Math.min(0.75, L + 0.06);
      const adjustedOKLCH = `${adjustedL.toFixed(2)} ${parts[1]} ${parts[2]}`;
      document.documentElement.style.setProperty('--primary', adjustedOKLCH);
      document.documentElement.style.setProperty('--ring', adjustedOKLCH);
    }
  }, [themeColor, isDark]);

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
