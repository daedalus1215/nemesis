import { createTheme, ThemeOptions } from '@mui/material/styles';

const themeOptions: ThemeOptions = {
  palette: {
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
  },
};

export const theme = createTheme(themeOptions); 