import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

export const lightTheme = {
  background: '#F8F9FA',
  backgroundGradient: 'linear-gradient(180deg, #F8F9FA 0%, #E9ECEF 100%)',
  card: '#FFFFFF',
  cardShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  text: '#1A1A2E',
  textSecondary: '#6C757D',
  textMuted: '#ADB5BD',
  primary: '#E91E63',
  primaryGradient: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
  secondary: '#9C27B0',
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  border: '#DEE2E6',
  accent: '#FF4081',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const darkTheme = {
  background: '#0F0F1A',
  backgroundGradient: 'linear-gradient(180deg, #1A1A2E 0%, #0F0F1A 100%)',
  card: '#1E1E32',
  cardShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  text: '#FFFFFF',
  textSecondary: '#B0B0C0',
  textMuted: '#6C6C80',
  primary: '#FF4081',
  primaryGradient: 'linear-gradient(135deg, #FF4081 0%, #E91E63 100%)',
  secondary: '#BB86FC',
  success: '#00E676',
  error: '#FF5252',
  warning: '#FFD740',
  border: '#2D2D44',
  accent: '#FF4081',
  overlay: 'rgba(0, 0, 0, 0.7)',
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => setIsDark(!isDark);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
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