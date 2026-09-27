import { createTheme, ThemeOptions } from '@mui/material/styles';

export type AppThemeMode = 'light' | 'dark' | 'auto';

const darkPalette: ThemeOptions['palette'] = {
  mode: 'dark',
  primary: {
    main: '#8be75f',
    light: '#A8F086',
    dark: '#72DD3F',
  },
  secondary: {
    main: '#CF55B4',
    light: '#E17DCB',
    dark: '#BB359D',
  },
  background: {
    default: '#1a1a1a',
    paper: '#242424',
  },
  text: {
    primary: '#fff',
    secondary: '#9ca3af',
    disabled: '#6b7280',
  },
  error: {
    main: '#ef4444',
  },
  warning: {
    main: '#f59e42',
  },
  info: {
    main: '#3b82f6',
  },
  success: {
    main: '#28a745',
  },
};

const lightPalette: ThemeOptions['palette'] = {
  mode: 'light',
  primary: {
    main: '#5cb531',
    light: '#74c94a',
    dark: '#4a9a28',
  },
  secondary: {
    main: '#c0409e',
    light: '#d063b1',
    dark: '#a82d85',
  },
  background: {
    default: '#fafafa',
    paper: '#ffffff',
  },
  text: {
    primary: '#1a1a1a',
    secondary: '#6b7280',
    disabled: '#9ca3af',
  },
  error: {
    main: '#dc2626',
  },
  warning: {
    main: '#d97706',
  },
  info: {
    main: '#2563eb',
  },
  success: {
    main: '#16a34a',
  },
};

/**
 * Resolves 'auto' against the OS preference; 'light'/'dark' pass through.
 */
export function resolveThemeMode(mode: AppThemeMode): 'light' | 'dark' {
  if (mode !== 'auto') {
    return mode;
  }
  return window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

export function buildTheme(mode: AppThemeMode) {
  return createTheme({
    palette: resolveThemeMode(mode) === 'light' ? lightPalette : darkPalette,
  });
}
