import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => localStorage.getItem('theme') || 'system');

  useEffect(() => {
    const apply = () => {
      let resolved = mode;
      if (mode === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', resolved);
    };

    apply();
    localStorage.setItem('theme', mode);

    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    if (mode === 'system') {
      mql.addEventListener('change', apply);
      return () => mql.removeEventListener('change', apply);
    }
  }, [mode]);

  const cycleTheme = () => {
    setMode(prev => prev === 'light' ? 'dark' : prev === 'dark' ? 'system' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ mode, setMode, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
