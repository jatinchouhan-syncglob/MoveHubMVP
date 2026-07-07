import { RecordType } from 'react-native-health-connect';

export interface IHealthConnectPermission {
  recordType: RecordType;
  accessType: 'read' | 'write';
}

export interface IHealthConnectAccessState {
  availability: 'idle' | 'available' | 'update_required' | 'unavailable' | 'unsupported_platform';
  isInitialized: boolean;
  hasAllPermissions: boolean;
  grantedPermissions: IHealthConnectPermission[];
}

export type IHealthConnectAvailability = IHealthConnectAccessState['availability'];

export interface IHealthConnectDailySummary {
  date: string;
  steps: number;
  sleepHours: number;
}

export interface IHealthConnectDetailedAnalyticsRecords {
  stepsObject: Array<{
    count: number;
    distanceKm: number | null;
    energyKcal: number | null;
    speed: number | null;
    startTime: string;
    endTime: string;
  }>;
  distanceObject: Array<{
    count: number | null;
    distanceKm: number | null;
    energyKcal: number | null;
    speed: number | null;
    startTime: string;
    endTime: string;
  }>;
  caloriesObject: Array<{
    count: number | null;
    distanceKm: number | null;
    energyKcal: number | null;
    speed: number | null;
    startTime: string;
    endTime: string;
  }>;
  speedObject: Array<{
    count: number | null;
    distanceKm: number | null;
    energyKcal: number | null;
    speed: number | null;
    startTime: string;
    endTime: string;
  }>;
}

export interface IHealthConnectExerciseSession {
  type: number;
  title?: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  source: string;
}

export interface IHealthConnectHeartRateEntry {
  recordedAt: string;
  averageBpm: number;
  sampleCount: number;
  source?: string;
}

export interface IHealthConnectSleepSession {
  startTime: string;
  endTime: string;
  durationHours: number;
  title?: string;
  source?: string;
}

export interface IHealthConnectState extends IHealthConnectAccessState {
  summary: {
    activeCaloriesInKcal: number;
    heartPoints: number;
    totalCaloriesInKcal: number;
    distanceInKm: number;
    steps: number;
    sleepHours: number;
    averageHeartRate: number | null;
    heartRateMeasurements: number;
    todayExerciseRecords: IHealthConnectExerciseSession[];
    stepsRecords: Array<{
      count: number;
      startTime: string;
      endTime: string;
      source: string;
    }>;
    detailedRecords: IHealthConnectDetailedAnalyticsRecords;
  } | null;
  weeklySummary: IHealthConnectDailySummary[];
  recentSleepSessions: IHealthConnectSleepSession[];
  recentHeartRateEntries: IHealthConnectHeartRateEntry[];
  lastSyncedAt: string | null;
  error: string | null;
  saveUserHealth?: any;
  autoSyncActive: boolean;
}
