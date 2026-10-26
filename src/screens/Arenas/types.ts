export type UserSegmentKey =
  | 'COLLEGE_YOUTH'
  | 'CLINICAL_LABS'
  | 'RESIDENTIAL_COMPLEX'
  | 'GYM_NETWORK'
  | 'MASS_INDIVIDUALS'
  | 'FRIENDS_FAMILY'
  | 'HEALTH_RETAIL';

export interface ISegmentTheme {
  canvasBase: string;
  coreAccent: string;
  secondaryAura: string;
  mutedBorders: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  badgeBg: string;
  accentGlow: string;
}

export interface IFocusTracker {
  title: string;
  value: string;
  subLabel: string;
  statusBadge: string;
  badgeType: 'optimal' | 'warning' | 'active' | 'locked';
}

export interface IStandingsTeam {
  name: string;
  points: string;
  progressPercent: number; // 0 - 100
  barColor: string;
}

export interface ISegmentStandings {
  title: string;
  team1?: IStandingsTeam;
  team2?: IStandingsTeam;
  bannerStatusText?: string;
  historyItems?: Array<{ label: string; detail: string; status: string }>;
  biomarkerIntersection?: {
    gatewayLabel: string;
    trendLabel: string;
    trendValue: string;
    status: string;
  };
  rewardPill?: {
    code: string;
    text: string;
  };
}

export interface ISegmentAction {
  id: string;
  label: string;
  icon: string;
  type: 'share' | 'challenge' | 'menu' | 'refer' | 'register' | 'audit' | 'scan';
}

export interface ISegmentConfig {
  key: UserSegmentKey;
  segmentNumber: string;
  name: string;
  shortLabel: string;
  icon: string;
  targetAudience: string;
  title: string;
  statusTag: string;
  statusIcon?: string;
  theme: ISegmentTheme;
  initialTicker: string;
  tickerStream: string[];
  focusTrackers: [IFocusTracker, IFocusTracker];
  standings: ISegmentStandings;
  actions: [ISegmentAction, ISegmentAction];
  psychologicalHook: string;
  contentHookTitle: string;
  bottomNavTabs: [string, string, string, string];
  tagline?: string;
  category?: string;
  headline?: string;
  summary?: string;
  facts?: string[];
}

export interface IMetricStrategyItem {
  id: string;
  code: string;
  name: string;
  target: string;
  simpleRule: string;
  actionStrategy: string;
  accentColor: string;
  category?: 'volume' | 'cardiovascular' | 'metabolic' | 'circadian';
}

export interface ITournamentBracketStage {
  stageNumber: number;
  title: string;
  daysRange: string;
  cutoffText?: string;
  dropPercent?: string;
  survivalRules?: string;
  bracketResetDetails?: string;
  accentColor: string;
  survivalGate?: string;
  whatWeMeasure?: string;
  howScoreCalculated?: string;
  howToScoreHigh?: string;
}

export interface IBiophysicalCalibrationProfile {
  cadenceVelocity: string;
  restingStrideLength: string;
  sedentaryDropRate: string;
  auditScore: string;
  status: string;
}
