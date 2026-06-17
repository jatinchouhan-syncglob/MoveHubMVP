import { TrendData } from '../types';

export const MOCK_CALORIE_TRENDS: TrendData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  data: [1850, 2100, 2450, 1900, 2300, 2700, 2420],
  legendLabel: 'Calories Burned (kcal)',
};

export const MOCK_STEP_TRENDS: TrendData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  data: [6500, 8200, 10500, 7100, 9300, 12000, 8400],
  legendLabel: 'Steps Traveled',
};
