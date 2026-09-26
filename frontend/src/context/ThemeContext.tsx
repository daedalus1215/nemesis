import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { AppThemeMode, buildTheme } from './theme';

const STORAGE_KEY = 'nemesis-theme-mode';
const VALID_MODES: Record<string, true> = { light: true, dark: true, auto: true };

interface ThemeModeContextValue {
  /** The mode the user selected ('auto' follows the OS). */
  mode: AppThemeMode;
  setMode: (mode: AppThemeMode) => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | null>(null);

function getInitialMode(): AppThemeMode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null && stored in VALID_MODES) {
      return stored as AppThemeMode;
    }
  } catch {
    // Storage unavailable (private mode, blocked) — fall through to default.
  }
  return 'dark';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState<AppThemeMode>(getInitialMode);

  // Tracks the OS preference so 'auto' re-resolves without a reload.
  const [systemLight, setSystemLight] = useState<boolean>(
    () => window.matchMedia('(prefers-color-scheme: light)').matches,
  );

  useEffect(() => {
    const query = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = (event: MediaQueryListEvent) =>
      setSystemLight(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  // Applied before paint so the first render never flashes the wrong theme.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const setMode = useCallback((next: AppThemeMode) => {
    setModeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Non-fatal: the preference just won't persist.
    }
  }, []);

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  const muiTheme = useMemo(
    () => buildTheme(mode === 'auto' ? (systemLight ? 'light' : 'dark') : mode),
    [mode, systemLight],
  );

  return (
    <MuiThemeProvider theme={muiTheme}>
      <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>
    </MuiThemeProvider>
  );
};

export const useThemeMode = (): ThemeModeContextValue => {
  const context = useContext(ThemeModeContext);
  if (context === null) {
    throw new Error('useThemeMode must be used within a ThemeProvider');
  }
  return context;
};
