import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FF6B6B',  // Main primary color for customer UI
    accent: '#4ECDC4',   // Secondary accent color for owner UI
    background: '#f5f5f5',
    surface: '#ffffff',
    text: '#212121',
    disabled: '#9e9e9e',
    placeholder: '#757575',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    notification: '#FF6B6B',
    error: '#D32F2F',
    success: '#4CAF50',
    warning: '#FFC107',
  },
  roundness: 8,
  animation: {
    scale: 1.0,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export default theme;