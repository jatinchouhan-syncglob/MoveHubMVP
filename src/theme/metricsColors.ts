/**
 * Centralized Metric Colors
 * 
 * Strict uniform color mapping across the entire application:
 * 1. Calories (kcal): Flame Orange (#F97316) - Never red
 * 2. Heart Points (HP): Crimson Red (#EF4444)
 * 3. Steps (steps): Azure Blue (#3B82F6)
 * 4. Minutes (min / duration): Royal Purple (#8B5CF6)
 * 5. Kilometers (km / distance): Emerald Green (#10B981)
 */

export const METRIC_COLORS = {
  // 1. Calories / kcal (Flame Orange - Never red)
  calories: {
    main: '#F97316',
    dark: '#EA580C',
    light: '#FFEDD5',
    bg: 'rgba(249, 115, 22, 0.12)',
    border: 'rgba(249, 115, 22, 0.25)',
  },
  // 2. Heart Points / HP / HPP (Crimson / Red)
  heartPoints: {
    main: '#EF4444',
    dark: '#DC2626',
    light: '#FEE2E2',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: 'rgba(239, 68, 68, 0.25)',
  },
  // 3. Steps (Azure Blue)
  steps: {
    main: '#3B82F6',
    dark: '#2563EB',
    light: '#DBEAFE',
    bg: 'rgba(59, 130, 246, 0.12)',
    border: 'rgba(59, 130, 246, 0.25)',
  },
  // 4. Minutes / Duration / min (Royal Purple / Violet)
  minutes: {
    main: '#8B5CF6',
    dark: '#7C3AED',
    light: '#EDE9FE',
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.25)',
  },
  // 5. Distance / Kilometers / km (Emerald Green)
  distance: {
    main: '#10B981',
    dark: '#059669',
    light: '#D1FAE5',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.25)',
  },
} as const;

export type MetricColorsType = typeof METRIC_COLORS;
