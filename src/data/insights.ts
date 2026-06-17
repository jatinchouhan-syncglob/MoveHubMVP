import { Insight } from '../types';

export const MOCK_INSIGHTS: Insight[] = [
  {
    id: 'ins-1',
    title: 'Consistent Active Days',
    description: 'You have hit your daily movement goals 4 days in a row! Keep up the momentum to boost your metabolic health.',
    category: 'fitness',
    type: 'success',
    date: new Date().toISOString(),
  },
  {
    id: 'ins-2',
    title: 'Hydration Alert',
    description: 'Based on your 5km running activity today, we recommend drinking at least 750ml more water to prevent fatigue.',
    category: 'nutrition',
    type: 'info',
    date: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'ins-3',
    title: 'Calorie Inbalance',
    description: 'Your energy output is slightly higher than input this week. Consider adding more protein-rich meals to sustain energy.',
    category: 'nutrition',
    type: 'warning',
    date: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: 'ins-4',
    title: 'Optimal Recovery Time',
    description: 'You spent 30 minutes in yoga recovery yesterday. This has lowered your resting heart rate range by 4 bpm this morning.',
    category: 'wellness',
    type: 'success',
    date: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
];
