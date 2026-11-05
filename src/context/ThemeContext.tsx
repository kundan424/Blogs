import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'dev_notes_theme';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {
      // Ignore localStorage access issues
    }
    return 'light';
  });

  const [isDark, setIsDark] = useState<boolean>(false);

  const applyTheme = useCallback((mode: ThemeMode) => {
    const root = document.documentElement;
    let effectiveDark = false;

    if (mode === 'dark') {
      effectiveDark = true;
    } else if (mode === 'light') {
      effectiveDark = false;
    } else {
      // system
      effectiveDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (effectiveDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    setIsDark(effectiveDark);
  }, []);

  const setTheme = useCallback(
    (mode: ThemeMode) => {
      setThemeState(mode);
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // Ignore
      }
      applyTheme(mode);
    },
    [applyTheme]
  );

  const toggleTheme = useCallback(() => {
    setTheme(isDark ? 'light' : 'dark');
  }, [isDark, setTheme]);

  useEffect(() => {
    applyTheme(theme);

    // If 'system', listen for OS appearance change
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
