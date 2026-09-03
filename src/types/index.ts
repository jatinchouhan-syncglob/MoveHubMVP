import { ActivityType } from '../constants/activityTypes';

export interface UserProfile {
  name: string;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  calorieGoal: number; // in kcal
  isSetupComplete: boolean;
  uhid?: string;
  email?: string;
  userId?: number;
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
  gainPoints?: number;
  cardioPoints?: number;
  musculoPoints?: number;
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

export interface IFitnessTabProps {
  chartWidth: number;
  dailyStepsBreakdown?: {
    values: number[];
    labels: string[];
  };
  dailyHeartPoints?: {
    values: number[];
    labels: string[];
  };
  sdexActivity?: {
    values: number[];
    labels: string[];
  };
  energyExpended?: {
    values: number[];
    labels: string[];
  };
  totalHeartPoint?: number;
  totalDailySdex?: number;
  dailyHeartPointsCharts?: {
    target?: number | string;
    actual?: number | string;
    performance?: number | string;
  };
  dailySdexCharts?: {
    target?: number | string;
    actual?: number | string;
    performance?: number | string;
  };
  dailyStepsBreakdownCharts?: {
    target?: number | string;
    actual?: number | string;
    performance?: number | string;
  };
  energyExpandedCharts?: {
    target?: number | string;
    actual?: number | string;
    performance?: number | string;
  };
  dailyInsightText?: string;
}

export interface PillarHealthItem {
  label: string;
  value: number;
  color: string;
}

export interface IBioSyncTabProps {
  chartWidth: number;
  energyEfficiency?: {
    values: number[];
    labels: string[];
  };
  integratedStamina?: {
    values: number[];
    labels: string[];
  };
  weeklyPerformance?: {
    labels: string[];
    cys: number[];
    eeKm: number[];
    is: number[];
  };
  weeklyPerformanceSummary: {
    eeKmAvg: number | string;
    eeKmTrend?: string;
    isAvg: number | string;
    isTrend?: string;
    cysTotal: number | string;
    cysTrend?: string;
  };
  pillarHealthData: PillarHealthItem[];
  cardioYieldData: {
    day: string;
    trend?: string;
    stacks: number[];
  }[];
  weeklyBioSyncEfficiencyScore: number;
  eePerKmCharts?: {
    target?: number | string;
    actual?: number | string;
    performance?: number | string;
  };
  integratedStaminaCharts?: {
    target?: number | string;
    actual?: number | string;
    performance?: number | string;
  };
  weeklyTrendCharts?: {
    target?: number | string;
    actual?: number | string;
    performance?: number | string;
  };
  cardioYieldPerStepCharts?: {
    target?: number | string;
    actual?: number | string;
    performance?: number | string;
  };
  status?: string;
  dailyInsightText?: string;
}

