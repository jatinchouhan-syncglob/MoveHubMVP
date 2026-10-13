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
  token?: string;
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

export interface Phase1LeaderboardItem {
  RANK: string;
  USER_ID: string;
  CUMULATIVE_CMAS_100: string;
  STATUS: string;
  BEHAVIORAL_TRACK_CUM_CMAS: string;
  STEP_VOLUME_COMPLIANCE: string;
  CARDIO_INTENSITY_COMPLIANCE: string;
  SEDENTARY_SDEX_SEVERITY: string;
  THREE_DAY_CUMULATIVE_BEHAVIORAL_HEALTH_INFERENCE: string;
  MIDDAY_QUEST_ALERT: string;
  '6AM_CALCULATION_TIMESTAMP': string;
}

export interface Phase1LeaderboardResponse {
  status: string;
  challenge_id: string;
  active_challenge_day: number;
  cutoff_at: string;
  participants: number;
  rank_scope: string;
  persistence?: {
    database: string;
    redis: string;
  };
  leaderboard: Phase1LeaderboardItem[];
  verified_rows?: any;
  step_target_sources?: Record<string, string>;
  profile_sources?: Record<string, string>;
  source_table?: string;
  metric_source_table?: string;
  source_dates?: string[];
  calculation_mode?: string;
  implementation_version?: string;
  uhid: string;
}

export interface IChallengeLiveFeedItem {
  score: number;
  trend: 'UP' | 'DOWN' | 'STABLE' | string;
  name: string;
  delta: string;
  rank: number;
  isUser?: boolean;
}

export interface IChallengeMyRankSummary {
  score: number;
  athleteId: string;
  rankDisplay: string;
  rank: number;
  cutoffStatus: string;
}

export interface IChallengeLeaderboardResponse {
  liveFeed: IChallengeLiveFeedItem[];
  stage: number;
  myRankSummary: IChallengeMyRankSummary;
  category: string;
  status: string;
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
  dailyActiveMinutes?: {
    values: number[];
    labels: string[];
  };
  totalHeartPoint?: number;
  totalDailySdex?: number;
  totalActiveMinutes?: number;
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
  dailyActiveMinutesCharts?: {
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
  pulsePaceIndex?: {
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

