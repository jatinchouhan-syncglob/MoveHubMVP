import { ACTIVITY_TYPES } from '../constants/activityTypes';
import { Activity } from '../types';

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    type: ACTIVITY_TYPES.RUNNING,
    value: 5.2,
    metric: 'km',
    durationMinutes: 28,
    caloriesBurned: 380,
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), 
    notes: 'Morning run in the park. Felt energetic!',
  },
  {
    id: 'act-2',
    type: ACTIVITY_TYPES.YOGA,
    value: 30,
    metric: 'mins',
    durationMinutes: 30,
    caloriesBurned: 110,
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    notes: 'Stretching and recovery session.',
  },
  {
    id: 'act-3',
    type: ACTIVITY_TYPES.WALKING,
    value: 8400,
    metric: 'steps',
    durationMinutes: 65,
    caloriesBurned: 320,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    notes: 'Commute and lunch stroll.',
  },
];
