export const COLORS = {
  primary: '#6366f1', // Beautiful Indigo
  primaryLight: '#e0e7ff',
  primaryDark: '#4f46e5',
  
  secondary: '#14b8a6', // Beautiful Teal
  secondaryLight: '#ccfbf1',
  secondaryDark: '#0d9488',
  
  background: '#f8fafc', // Slate-50 light mode background
  surface: '#ffffff', // White surface
  surfaceElevated: '#ffffff',
  
  text: '#0f172a', // Slate-900 principal text
  textSecondary: '#64748b', // Slate-500 secondary text
  textLight: '#94a3b8', // Slate-400 tertiary text
  textOnPrimary: '#ffffff',
  
  border: '#e2e8f0', // Slate-200 border
  borderDark: '#cbd5e1', // Slate-300
  
  success: '#10b981', // Emerald-500
  successLight: '#d1fae5',
  
  warning: '#f59e0b', // Amber-500
  warningLight: '#fef3c7',
  
  error: '#f43f5e', // Rose-500
  errorLight: '#ffe4e6',
  
  cardBg: '#ffffff',
  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;

export type ColorType = typeof COLORS;
