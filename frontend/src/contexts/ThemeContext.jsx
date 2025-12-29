import { createContext, useState, useContext, useEffect, useCallback } from 'react';

const ThemeContext = createContext(null);

// Theme modes
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

/**
 * Get system preference for dark mode
 */
const getSystemPreference = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false;
};

/**
 * ThemeProvider - Manages dark/light/system theme modes
 */
export const ThemeProvider = ({ children }) => {
  // Initialize from localStorage or default to 'light'
  const [themeMode, setThemeMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    return saved || THEMES.LIGHT;
  });

  // Computed dark mode based on themeMode
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    if (saved === THEMES.SYSTEM) {
      return getSystemPreference();
    }
    return saved === THEMES.DARK;
  });

  // Update dark mode when themeMode changes
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);

    let isDark = false;
    if (themeMode === THEMES.SYSTEM) {
      isDark = getSystemPreference();
    } else {
      isDark = themeMode === THEMES.DARK;
    }

    setDarkMode(isDark);

    // Apply theme to document
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [themeMode]);

  // Listen for system preference changes
  useEffect(() => {
    if (themeMode !== THEMES.SYSTEM) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      setDarkMode(e.matches);
      if (e.matches) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode]);

  // Toggle between light and dark
  const toggleDarkMode = useCallback(() => {
    setThemeMode((prev) => (prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK));
  }, []);

  // Set specific theme mode
  const setTheme = useCallback((mode) => {
    if (Object.values(THEMES).includes(mode)) {
      setThemeMode(mode);
    }
  }, []);

  const value = {
    darkMode,
    themeMode,
    toggleDarkMode,
    setTheme,
    THEMES,
  };

  return (
    <ThemeContext.Provider value={value}>
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
