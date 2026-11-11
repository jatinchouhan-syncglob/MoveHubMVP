export type LiveMatchupTab = 'live' | 'stats' | 'record' | 'upcoming';

export type TeamCrestId = 'lion' | 'wolf' | 'phoenix' | 'titan' | 'kraken';

export interface TournamentMeta {
  phaseBanner: string;
  dayTracker: string;
  communitySegment: string;
  dayOfTournament: number;
  stage: string;
  dateLabel: string;
  currentTimeLabel: string;
  lastSyncTime: string;
}

export interface HeadToHeadTeam {
  id: string;
  name: string;
  crest: TeamCrestId;
  cmasScore: number;
  accentColors: [string, string];
  borderColor: string;
  glowColor: string;
}

export interface CmasSatelliteNode {
  id: string;
  label: string;
  subLabel?: string;
  score: number;
  targetText: string;
  accentColor: string;
  iconType: 'steps' | 'pulse' | 'run' | 'strength' | 'habits' | 'ecg' | 'heart';
}

export interface MatchStatComparisonRow {
  id: string;
  label: string;
  leftValue: string;
  rightValue: string;
  highlighted?: boolean;
}

export interface MatchRecordEntry {
  id: string;
  date: string;
  result: 'WIN' | 'LOSS';
  leftTeam: string;
  leftCrest: TeamCrestId;
  leftScore: string;
  rightTeam: string;
  rightCrest: TeamCrestId;
  rightScore: string;
}

export interface UpcomingFixtureEntry {
  id: string;
  dateFull: string;
  dateShort: string;
  leftTeam: string;
  leftCrest: TeamCrestId;
  leftScorePlaceholder?: string;
  rightTeam: string;
  rightCrest: TeamCrestId;
  rightScorePlaceholder?: string;
  matchBanner?: string;
  femaleCount: number;
  maleCount: number;
}
