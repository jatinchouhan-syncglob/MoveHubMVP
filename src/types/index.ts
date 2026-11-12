import { ActivityType } from '../constants/activityTypes';

export interface UserProfile {
  name: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | string;
  age: number;
  weight: number;
  height: number; 
  isSetupComplete: boolean;
  uhid?: string;
  email?: string;
  userId?: number;
  token?: string;
  occupation?: 'Student' | 'Homemaker' | 'Working Professional' | 'Retired' | string;
  universityName?: string;
  department?: string;
  companyName?: string;
  location?: string;
  city?: string;
  bedtime?: string;
  gentle_pacing_mode?: boolean;
  promocode?: string;
  promoCode?: string;
  referralCode?: string;
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

export interface Phase1ChallengeData {
  status?: string;
  message?: string;
  challenge_id?: string;
  active_challenge_day?: number;
  cutoff_at?: string;
  rank_scope?: string;
  participants?: number;
  active_crew_participants?: number;
  benchmark_avg_score?: number;
  benchmark_sample_size?: number;
  leaderboard: Phase1LeaderboardItem[];
}

export interface Phase1ChallengeEntry {
  challenge_id: string;
  data: Phase1ChallengeData;
}

export interface Phase1LeaderboardResponse {
  uhid?: string;
  challenges?: Phase1ChallengeEntry[];
  source?: string;
  historical?: boolean;
  currently_enrolled?: boolean;

  // Backwards compatibility with previous flat response
  status?: string;
  message?: string;
  challenge_id?: string;
  active_challenge_day?: number;
  cutoff_at?: string;
  participants?: number;
  active_crew_participants?: number;
  benchmark_avg_score?: number;
  benchmark_sample_size?: number;
  rank_scope?: string;
  leaderboard?: Phase1LeaderboardItem[];
  persistence?: {
    database: string;
    redis: string;
  };
  verified_rows?: any;
  step_target_sources?: Record<string, string>;
  profile_sources?: Record<string, string>;
  source_table?: string;
  metric_source_table?: string;
  source_dates?: string[];
  calculation_mode?: string;
  implementation_version?: string;
}

export interface Phase2LeaderboardItem {
  RANK: string;
  USER_ID: string;
  MASTER_COMPOUND_SCORE: string;
  STATUS: string;
  BEHAVIORAL_TRACK_CUM_CMAS: string;
  PHYSIOLOGICAL_TRACK_CUM_BSE: string;
  PPI_CARDIO_QUALITY: string;
  E3_METABOLIC_ECONOMY: string;
  IS_CIRCADIAN_RHYTHM: string;
  MULTI_WEEK_PHYSIOLOGICAL_RECOVERY_INFERENCE: string;
  DAILY_EOD_AUDIT: string;
  MIDDAY_QUEST_ALERT: string;
}

export interface Phase2LeaderboardResponse {
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
  leaderboard: Phase2LeaderboardItem[];
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

export interface IPodiumTier {
  reward: string;
  tier: number;
  qualificationDays: string;
  place: string;
  title: string;
  status: string;
}

export interface IChallengePodiumResponse {
  podiumTiers: IPodiumTier[];
  heading: string;
  tagline: string;
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
  dailyModifiedHeartPoints?: {
    values: number[];
    labels: string[];
  };
  totalHeartPoint?: number;
  totalDailySdex?: number;
  totalActiveMinutes?: number;
  totalModifiedHeartPoints?: number;
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
  dailyModifiedHeartPointsCharts?: {
    target?: number | string;
    actual?: number | string;
    performance?: number | string;
  };
  dailyInsightText?: string;
  cmasData?: {
    value?: number;
    target?: number;
    percent?: number;
    performance_percent?: number;
    status?: string;
  };
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

export interface IDailyQuestEvaluation {
  status: string;
  LAST_EVALUATION_TIMESTAMP: string | null;
  CONTINUOUS_SITTING_MAX_MINS?: number;
  MIDDAY_QUEST_ALERT?: string;
}

export interface IDailyQuestChallengeItem {
  challenge_id: string;
  title?: string;
  subtitle?: string;
  start_date: string;
  end_date: string;
  daily_quest: IDailyQuestEvaluation;
}

export interface IQuestScreenTabConfig {
  label?: string;
  icon?: string;
  selected?: string | boolean;
}

export interface IQuestScreenSuggestedCard {
  quest_id?: string;
  icon?: string;
  title?: string;
  frequency?: string;
  duration?: string;
  description?: string;
}

export interface IDailyQuestScreenConfig {
  title?: string;
  subtitle?: string;
  quests_hub?: {
    label?: string;
    icon?: string;
  };
  tabs?: {
    daily_quest?: IQuestScreenTabConfig;
    daily_gym?: IQuestScreenTabConfig;
    ongoing_quest?: IQuestScreenTabConfig;
    archive?: IQuestScreenTabConfig;
  };
  daily_quest_card?: {
    icon?: string;
    status?: string;
    title?: string;
    description?: string;
    check_for_updates?: {
      label?: string;
      icon?: string;
    };
  };
  daily_gym_card?: any;
  ongoing_quest_card?: any;
  archive_card?: any;
  suggested_for_you?: {
    title?: string;
    subtitle?: string;
    cards?: IQuestScreenSuggestedCard[];
  };
}

export interface IDailyQuestResponse {
  uhid: string;
  date?: string;
  challenges?: IDailyQuestChallengeItem[];
  daily_quest?: IDailyQuestEvaluation;
  daily_gym?: any;
  ongoing_quests?: any[];
  archive?: any[];
  quest_screen?: IDailyQuestScreenConfig;
}


