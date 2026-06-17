import { ActivityType } from '../constants/activityTypes';

export interface UserProfile {
  name: string;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  calorieGoal: number; // in kcal
  isSetupComplete: boolean;
}

export interface Activity {
  id: string;
  type: ActivityType;
  value: number; // quantity (e.g. 5 for 5km, or 8000 for steps)
  metric: string; // e.g. km, steps, mins
  durationMinutes: number;
  caloriesBurned: number;
  timestamp: string;
  notes?: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  points: number;
  avatarUrl?: string;
  isCurrentUser?: boolean;
}

export interface TrendPoint {
  label: string;
  value: number;
}

export interface TrendData {
  labels: string[];
  data: number[];
  legendLabel: string;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  category: 'fitness' | 'nutrition' | 'wellness' | 'general';
  type: 'success' | 'info' | 'warning';
  date: string;
}
