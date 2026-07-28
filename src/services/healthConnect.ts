import {Linking, NativeModules, Platform} from 'react-native';
import dayjs from 'dayjs';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import { getDynamicDeviceId } from '../utils/device';
import {
  aggregateRecord,
  type BackgroundAccessPermission,
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  openHealthConnectSettings,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
  type Permission,
  type ReadRecordsResult,
  type RecordType,
} from 'react-native-health-connect';

import {
  IHealthConnectAccessState,
  IHealthConnectDailySummary,
  IHealthConnectDetailedAnalyticsRecords,
  IHealthConnectExerciseSession,
  IHealthConnectHeartRateEntry,
  IHealthConnectPermission,
  IHealthConnectSleepSession,
  IHealthConnectState,
} from './types';

import { storageHelper } from '../storage/storageHelper';
import { STORAGE_KEYS } from '../storage/storageKeys';
import { UserProfile } from '../types';

const HEALTH_CONNECT_MARKET_URI =
  'market://details?id=com.google.android.apps.healthdata&url=healthconnect%3A%2F%2Fonboarding';
const HEALTH_CONNECT_WEB_URI =
  'https://play.google.com/store/apps/details?id=com.google.android.apps.healthdata';
const RECORDS_PAGE_SIZE = 1000;
const MODERATE_HEART_POINT_EXERCISE_TYPES = new Set([
  1, 2, 9, 10, 11, 14, 15, 16, 18, 19, 21, 23, 24, 30, 31, 32, 35, 37, 38, 41,
  48, 49, 50, 51, 56, 61, 63, 64, 65, 66, 67, 68, 70, 72, 73, 74, 75, 77, 78,
  100, 101,
]);
const VIGOROUS_HEART_POINT_EXERCISE_TYPES = new Set([
  8, 12, 17, 20, 22, 25, 27, 28, 29, 34, 36, 39, 40, 42, 43, 44, 45, 47, 52, 53,
  54, 55, 57, 58, 59, 60, 62, 76,
]);

type IHealthConnectWorkManagerStartOptions = {
  baseUrl: string;
  deviceId?: string;
  uhid?: string | null;
};

type IHealthConnectWorkManagerStatus = {
  baseUrl: string | null;
  deviceId: string | null;
  uhid: string | null;
  lastAttemptAt: string | null;
  lastSyncedAt: string | null;
  lastStatus: string | null;
  lastReason: string | null;
  exactAlarmAllowed: boolean;
  batteryOptimizationIgnored: boolean;
};

type IHealthConnectWorkManagerModule = {
  getHealthSyncStatus?: () => Promise<IHealthConnectWorkManagerStatus>;
  openBatteryOptimizationSettings?: () => Promise<boolean>;
  openExactAlarmSettings?: () => Promise<boolean>;
  startHealthSync?: (
    options: IHealthConnectWorkManagerStartOptions,
  ) => Promise<boolean>;
  getSyncedIntervals?: () => Promise<string[]>;
  saveSyncedIntervals?: (intervals: string[]) => Promise<boolean>;
  getSyncedKeys?: () => Promise<string[]>;
  saveSyncedKeys?: (keys: string[]) => Promise<boolean>;
};

const healthConnectWorkManagerModule =
  NativeModules.HealthConnectWorkManager as
    | IHealthConnectWorkManagerModule
    | undefined;

export const HEALTH_CONNECT_RECORD_TYPES: RecordType[] = [
  'ActiveCaloriesBurned',
  'TotalCaloriesBurned',
  'Distance',
  'Steps',
  'SleepSession',
  'HeartRate',
  'ExerciseSession',
];

const HEALTH_CONNECT_PERMISSIONS: Permission[] =
  HEALTH_CONNECT_RECORD_TYPES.map(recordType => ({
    accessType: 'read' as const,
    recordType,
  }));

export const HEALTH_CONNECT_PERMISSION_COUNT =
  HEALTH_CONNECT_PERMISSIONS.length;

const EMPTY_ACCESS_STATE: IHealthConnectAccessState = {
  availability: 'idle',
  isInitialized: false,
  hasAllPermissions: false,
  grantedPermissions: [],
};

const roundToOneDecimal = (value: number) => Math.round(value * 10) / 10;

const buildTimeRange = (startTime: string, endTime: string) => ({
  operator: 'between' as const,
  startTime,
  endTime,
});

const canReadRecordType = (
  grantedPermissions: IHealthConnectPermission[],
  recordType: RecordType,
) =>
  grantedPermissions.some(
    permission =>
      permission.recordType === recordType && permission.accessType === 'read',
  );

const isRecordPermission = (
  permission: unknown,
): permission is IHealthConnectPermission =>
  typeof permission === 'object' &&
  permission !== null &&
  'recordType' in permission &&
  'accessType' in permission;

const normalizePermissions = (
  permissions: unknown[],
): IHealthConnectPermission[] =>
  permissions.filter(isRecordPermission).map(permission => ({
    accessType: permission.accessType,
    recordType: permission.recordType,
  }));

const createPermissionKey = (permission: any) =>
  `${permission.accessType}:${permission.recordType}`;

const requiredPermissionKeys = new Set(
  HEALTH_CONNECT_PERMISSIONS.map(createPermissionKey),
);

const hasAllRequiredPermissions = (
  grantedPermissions: IHealthConnectPermission[],
) => {
  const grantedKeys = new Set(grantedPermissions.map(createPermissionKey));
  return Array.from(requiredPermissionKeys).every(permissionKey =>
    grantedKeys.has(permissionKey),
  );
};

const createWeeklySummarySeed = () => {
  const startDate = dayjs().subtract(6, 'day').startOf('day');

  return Array.from({length: 7}, (_, index) => {
    const date = startDate.add(index, 'day');

    return {
      date: date.format('YYYY-MM-DD'),
      steps: 0,
      sleepHours: 0,
    } satisfies IHealthConnectDailySummary;
  });
};

const mapSdkAvailability = (
  sdkStatus: number,
): IHealthConnectAccessState['availability'] => {
  if (sdkStatus === SdkAvailabilityStatus.SDK_AVAILABLE) {
    return 'available';
  }

  if (
    sdkStatus === SdkAvailabilityStatus.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED
  ) {
    return 'update_required';
  }

  return 'unavailable';
};

const openStorePage = async (marketUri: string, webUri: string) => {
  try {
    const canOpenMarketplace = await Linking.canOpenURL(marketUri);

    await Linking.openURL(canOpenMarketplace ? marketUri : webUri);
  } catch {
    await Linking.openURL(webUri);
  }
};

const getDurationInHours = (startTime: string, endTime: string) =>
  roundToOneDecimal(dayjs(endTime).diff(dayjs(startTime), 'minute', true) / 60);

const mapSleepSessions = (
  records: ReadRecordsResult<'SleepSession'>['records'],
): IHealthConnectSleepSession[] =>
  (records ?? [])?.map(record => ({
    startTime: record.startTime,
    endTime: record.endTime,
    durationHours: getDurationInHours(record.startTime, record.endTime),
    title: record.title,
    source: record.metadata?.dataOrigin,
  }));

const mapHeartRateRecords = (
  records: ReadRecordsResult<'HeartRate'>['records'],
): IHealthConnectHeartRateEntry[] =>
  (records ?? [])?.map(record => {
    const sampleCount = record.samples?.length ?? 0;
    const totalBpm = (record.samples ?? []).reduce(
      (sum, sample) => sum + sample.beatsPerMinute,
      0,
    );
    const latestSample = record.samples?.[sampleCount - 1];

    return {
      recordedAt: latestSample?.time ?? record.endTime,
      averageBpm: sampleCount ? roundToOneDecimal(totalBpm / sampleCount) : 0,
      sampleCount,
      source: record.metadata?.dataOrigin,
    };
  });

const sumSteps = (records: ReadRecordsResult<'Steps'>['records']) => {
  return Math.round(
    (records ?? []).reduce((sum, record) => sum + record.count, 0),
  );
};

const sumSleepHours = (records: ReadRecordsResult<'SleepSession'>['records']) =>
  roundToOneDecimal(
    (records ?? []).reduce(
      (sum, record) =>
        sum + getDurationInHours(record.startTime, record.endTime),
      0,
    ),
  );

const sumSleepHoursForDay = (
  records: ReadRecordsResult<'SleepSession'>['records'],
  date: dayjs.Dayjs,
) =>
  sumSleepHours(
    (records ?? []).filter(record => dayjs(record.endTime).isSame(date, 'day')),
  );

const mapExerciseSessions = (
  records: ReadRecordsResult<'ExerciseSession'>['records'],
): IHealthConnectExerciseSession[] =>
  (records ?? []).map((record: any) => ({
    type: record.exerciseType,
    title: record.title,
    startTime: record.startTime,
    endTime: record.endTime,
    durationHours: getDurationInHours(record.startTime, record.endTime),
    source:
      record.metadata?.dataOrigin?.packageName ?? record.metadata?.dataOrigin,
  }));

// Health Connect does not expose a Heart Points record, so derive it
// from today's exercise intensity using Google Fit's moderate/vigorous rules.
const getHeartPointsForExerciseSession = (
  record: IHealthConnectExerciseSession,
) => {
  const durationMinutes = Math.max(0, Math.round(record.durationHours * 60));

  if (!durationMinutes) {
    return 0;
  }

  if (VIGOROUS_HEART_POINT_EXERCISE_TYPES.has(record.type)) {
    return durationMinutes * 2;
  }

  if (MODERATE_HEART_POINT_EXERCISE_TYPES.has(record.type)) {
    return durationMinutes;
  }

  return durationMinutes;
};

const getDerivedHeartPoints = (records: IHealthConnectExerciseSession[]) =>
  records.reduce(
    (sum, record) => sum + getHeartPointsForExerciseSession(record),
    0,
  );

const getHeartPointsFromSteps = (
  stepsRecords: ReadRecordsResult<'Steps'>['records'],
  exerciseRecords: IHealthConnectExerciseSession[],
) => {
  return stepsRecords.reduce((sum, stepRecord) => {
    const stepStart = dayjs(stepRecord.startTime);
    const stepEnd = dayjs(stepRecord.endTime);

    const isOverlapping = exerciseRecords.some(exercise => {
      const exStart = dayjs(exercise.startTime);
      const exEnd = dayjs(exercise.endTime);
      return stepStart.isBefore(exEnd) && stepEnd.isAfter(exStart);
    });

    if (isOverlapping) {
      return sum;
    }

    const durationMinutes = stepEnd.diff(stepStart, 'minute', true);

    if (durationMinutes > 0) {
      const stepsPerMinute = stepRecord.count / durationMinutes;

      if (stepsPerMinute >= 130) {
        return sum + Math.round(durationMinutes * 2);
      }

      if (stepsPerMinute >= 100) {
        return sum + Math.round(durationMinutes);
      }
    }

    return sum;
  }, 0);
};

const getHeartRateSummary = (
  records: ReadRecordsResult<'HeartRate'>['records'],
) => {
  const samples = (records ?? []).flatMap(record => record.samples ?? []);
  const measurements = samples.length;

  if (!measurements) {
    return {averageHeartRate: null, heartRateMeasurements: 0};
  }

  const totalBpm = samples.reduce(
    (sum, sample) => sum + sample.beatsPerMinute,
    0,
  );

  return {
    averageHeartRate: roundToOneDecimal(totalBpm / measurements),
    heartRateMeasurements: measurements,
  };
};

const createDetailedMetricRecords = ({
  stepsRecords,
  distanceRecords,
  totalCaloriesRecords,
  speedRecords,
}: {
  stepsRecords: ReadRecordsResult<'Steps'>['records'];
  distanceRecords: ReadRecordsResult<'Distance'>['records'];
  activeCaloriesRecords: ReadRecordsResult<'ActiveCaloriesBurned'>['records'];
  totalCaloriesRecords: ReadRecordsResult<'TotalCaloriesBurned'>['records'];
  speedRecords: ReadRecordsResult<'Speed'>['records'];
}): IHealthConnectDetailedAnalyticsRecords => ({
  stepsObject: stepsRecords.map(record => ({
    count: Math.round(record.count),
    distanceKm: null,
    energyKcal: null,
    speed: null,
    startTime: record.startTime,
    endTime: record.endTime,
  })),
  distanceObject: distanceRecords.map((record: any) => ({
    count: null,
    distanceKm: record.distance?.inKilometers ?? null,
    energyKcal: null,
    speed: null,
    startTime: record.startTime,
    endTime: record.endTime,
  })),
  caloriesObject: totalCaloriesRecords.map((record: any) => ({
    count: null,
    distanceKm: null,
    energyKcal: record.energy?.inKilocalories ?? null,
    speed: null,
    startTime: record.startTime,
    endTime: record.endTime,
  })),
  speedObject: speedRecords.flatMap((record: any) => {
    const samples = Array.isArray(record.samples) ? record.samples : [];

    if (!samples.length) {
      return [
        {
          count: null,
          distanceKm: null,
          energyKcal: null,
          speed: null,
          startTime: record.startTime,
          endTime: record.endTime,
        },
      ];
    }

    return samples.map((sample: any) => ({
      count: null,
      distanceKm: null,
      energyKcal: null,
      speed: sample.speed?.inKilometersPerHour ?? sample.speed ?? null,
      startTime: sample.time ?? record.startTime,
      endTime: sample.time ?? record.endTime,
    }));
  }),
});

const safeReadRecords = async <T extends RecordType>(
  recordType: T,
  options: any,
): Promise<ReadRecordsResult<T>> => {
  try {
    const result = await readRecords(recordType, options);
    return {
      records: Array.isArray(result?.records) ? result.records : [],
    } as unknown as ReadRecordsResult<T>;
  } catch (error) {
    console.warn(`Health Connect readRecords failed for ${recordType}`, error);
    return {records: []} as ReadRecordsResult<T>;
  }
};

const safeAggregateRecord = async (args: any) => {
  try {
    return await aggregateRecord(args);
  } catch (error) {
    console.warn(
      `Health Connect aggregateRecord failed for ${args.recordType}`,
      error,
    );
    return {} as any;
  }
};

const getDistanceInKm = async (
  timeRangeFilter: ReturnType<typeof buildTimeRange>,
) => {
  const distance = await safeAggregateRecord({
    recordType: 'Distance',
    timeRangeFilter,
  });

  return roundToOneDecimal(distance.DISTANCE?.inKilometers ?? 0);
};

const getActiveCaloriesInKcal = async (
  timeRangeFilter: ReturnType<typeof buildTimeRange>,
) => {
  const activeCalories = await aggregateRecord({
    recordType: 'ActiveCaloriesBurned',
    timeRangeFilter,
  });

  return roundToOneDecimal(
    activeCalories.ACTIVE_CALORIES_TOTAL?.inKilocalories ?? 0,
  );
};

const getTotalCaloriesInKcal = async (
  timeRangeFilter: ReturnType<typeof buildTimeRange>,
) => {
  const totalCalories = await aggregateRecord({
    recordType: 'TotalCaloriesBurned',
    timeRangeFilter,
  });

  return roundToOneDecimal(totalCalories.ENERGY_TOTAL?.inKilocalories ?? 0);
};

const mergeRecordTotalsByDate = <
  TRecord extends {startTime: string} | {endTime: string},
>(
  weeklySummaryMap: Map<string, IHealthConnectDailySummary>,
  records: TRecord[],
  getDateKey: (record: TRecord) => string,
  merge: (summary: IHealthConnectDailySummary, record: TRecord) => void,
) => {
  if (!Array.isArray(records)) {
    console.warn('[mergeRecordTotalsByDate] records is not an array:', records);
    return;
  }
  records.forEach(record => {
    const summary = weeklySummaryMap.get(getDateKey(record));

    if (summary) {
      merge(summary, record);
    }
  });
};

const checkGoogleHealthConnectAvailability = async () => {
  const sdkStatus = await getSdkStatus();
  return mapSdkAvailability(sdkStatus);
};

const checkGoogleHealthPermissionsGranted = async () => {
  try {
    const rawGranted = await getGrantedPermissions();
    const grantedPermissions = normalizePermissions(rawGranted);
    const hasAll = hasAllRequiredPermissions(grantedPermissions);

    return {
      grantedPermissions,
      hasAllPermissions: hasAll,
    };
  } catch (err) {
    console.error('getGrantedPermissions error:', err);
    return {
      grantedPermissions: [] as IHealthConnectPermission[],
      hasAllPermissions: false,
    };
  }
};

const initializeGoogleHealthConnect = async ({
  checkPermissions = true,
  throwOnInitializeFailure = false,
}: {
  checkPermissions?: boolean;
  throwOnInitializeFailure?: boolean;
} = {}): Promise<IHealthConnectAccessState> => {
  if (Platform.OS !== 'android') {
    return {...EMPTY_ACCESS_STATE, availability: 'unsupported_platform'};
  }

  const availability = await checkGoogleHealthConnectAvailability();

  if (availability !== 'available') {
    return {...EMPTY_ACCESS_STATE, availability};
  }

  const isInitialized = await initialize();

  if (!isInitialized) {
    if (throwOnInitializeFailure) {
      throw new Error('Health Connect initialization failed');
    }

    return {...EMPTY_ACCESS_STATE, availability, isInitialized: false};
  }

  if (!checkPermissions) {
    const permissionState = await checkGoogleHealthPermissionsGranted();

    return {
      availability,
      isInitialized,
      grantedPermissions: permissionState.grantedPermissions,
      hasAllPermissions: permissionState.hasAllPermissions,
    };
  }

  const grantedPermissions = normalizePermissions(
    await requestPermission(HEALTH_CONNECT_PERMISSIONS),
  );

  return {
    availability,
    isInitialized,
    grantedPermissions,
    hasAllPermissions: hasAllRequiredPermissions(grantedPermissions),
  };
};

export const getHealthConnectAccessState =
  async (): Promise<IHealthConnectAccessState> =>
    initializeGoogleHealthConnect({
      checkPermissions: false,
      throwOnInitializeFailure: false,
    });

export const requestHealthConnectPermissions =
  async (): Promise<IHealthConnectAccessState> =>
    initializeGoogleHealthConnect({
      checkPermissions: true,
      throwOnInitializeFailure: true,
    });

export const loadHealthConnectSnapshot = async (
  accessState?: IHealthConnectAccessState,
  targetDate?: string,
  targetSession?: string,
): Promise<IHealthConnectState> => {
  const currentAccessState =
    accessState ??
    (await initializeGoogleHealthConnect({
      checkPermissions: false,
      throwOnInitializeFailure: false,
    }));

  const baseState: IHealthConnectState = {
    ...currentAccessState,
    summary: null,
    weeklySummary: [],
    recentSleepSessions: [],
    recentHeartRateEntries: [],
    lastSyncedAt: null,
    error: null,
    saveUserHealth: undefined,
    autoSyncActive: false,
  };

  if (
    currentAccessState.availability !== 'available' ||
    !currentAccessState.isInitialized ||
    currentAccessState.grantedPermissions.length === 0
  ) {
    return baseState;
  }

  const selectedDay = targetDate ? dayjs(targetDate) : dayjs();
  let sessionStartTime = selectedDay.startOf('day');
  let sessionEndTime =
    targetDate && !selectedDay.isSame(dayjs(), 'day')
      ? selectedDay.add(1, 'day').startOf('day')
      : dayjs();

  if (targetSession) {
    switch (targetSession) {
      case 'night':
        sessionStartTime = selectedDay
          .subtract(1, 'day')
          .hour(21)
          .minute(0)
          .second(0)
          .millisecond(0);
        sessionEndTime = selectedDay
          .hour(5)
          .minute(59)
          .second(59)
          .millisecond(999);
        break;
      case 'morning':
        sessionStartTime = selectedDay
          .hour(6)
          .minute(0)
          .second(0)
          .millisecond(0);
        sessionEndTime = selectedDay
          .hour(11)
          .minute(59)
          .second(59)
          .millisecond(999);
        break;
      case 'afternoon':
        sessionStartTime = selectedDay
          .hour(12)
          .minute(0)
          .second(0)
          .millisecond(0);
        sessionEndTime = selectedDay
          .hour(16)
          .minute(59)
          .second(59)
          .millisecond(999);
        break;
      case 'evening':
        sessionStartTime = selectedDay
          .hour(17)
          .minute(0)
          .second(0)
          .millisecond(0);
        sessionEndTime = selectedDay
          .hour(20)
          .minute(59)
          .second(59)
          .millisecond(999);
        break;
    }

    if (sessionEndTime.isAfter(dayjs())) {
      sessionEndTime = dayjs();
    }
  }

  const todayStart = sessionStartTime;
  const now = sessionEndTime;

  const weeklyStart = selectedDay.subtract(6, 'day').startOf('day');
  const sleepTodayStart = todayStart.subtract(1, 'day');
  const sleepWeeklyStart = weeklyStart.subtract(1, 'day');

  const todayTimeRange = buildTimeRange(
    sleepTodayStart.toISOString(),
    now.toISOString(),
  );
  const sleepTodayTimeRange = buildTimeRange(
    sleepTodayStart.toISOString(),
    now.toISOString(),
  );
  const weeklyTimeRange = buildTimeRange(
    weeklyStart.toISOString(),
    now.toISOString(),
  );
  const sleepWeeklyTimeRange = buildTimeRange(
    sleepWeeklyStart.toISOString(),
    now.toISOString(),
  );

  const canRead = (recordType: RecordType) =>
    canReadRecordType(currentAccessState.grantedPermissions, recordType);

  const [
    todayStepsRecords,
    todaySleepRecords,
    todayHeartRateRecords,
    todayExerciseRecords,
    _distanceSummary,
    _activeCaloriesSummary,
    _totalCaloriesSummary,
    weeklyStepsRecords,
    weeklySleepRecords,
    recentSleepRecords,
    recentHeartRateRecords,
    _todayWeightRecords,
    _todayBloodPressureRecords,
    _todayRestingHeartRateRecords,
    _todayVo2MaxRecords,
    rawDistanceRecords,
    rawActiveCaloriesRecords,
    rawTotalCaloriesRecords,
    rawSpeedRecords,
  ] = await Promise.all([
    canRead('Steps')
      ? safeReadRecords('Steps', {
          timeRangeFilter: todayTimeRange,
          pageSize: RECORDS_PAGE_SIZE,
        })
      : Promise.resolve({records: []} as ReadRecordsResult<'Steps'>),
    canRead('SleepSession')
      ? safeReadRecords('SleepSession', {
          timeRangeFilter: sleepTodayTimeRange,
          pageSize: RECORDS_PAGE_SIZE,
        })
      : Promise.resolve({records: []} as ReadRecordsResult<'SleepSession'>),
    canRead('HeartRate')
      ? safeReadRecords('HeartRate', {
          timeRangeFilter: todayTimeRange,
          pageSize: RECORDS_PAGE_SIZE,
        })
      : Promise.resolve({records: []} as ReadRecordsResult<'HeartRate'>),
    canRead('ExerciseSession')
      ? safeReadRecords('ExerciseSession', {
          timeRangeFilter: todayTimeRange,
          pageSize: RECORDS_PAGE_SIZE,
        })
      : Promise.resolve({records: []} as ReadRecordsResult<'ExerciseSession'>),
    canRead('Distance') ? getDistanceInKm(todayTimeRange) : 0,
    canRead('ActiveCaloriesBurned')
      ? getActiveCaloriesInKcal(todayTimeRange)
      : 0,
    canRead('TotalCaloriesBurned') ? getTotalCaloriesInKcal(todayTimeRange) : 0,
    canRead('Steps')
      ? safeReadRecords('Steps', {
          timeRangeFilter: weeklyTimeRange,
          pageSize: RECORDS_PAGE_SIZE,
        })
      : Promise.resolve({records: []} as ReadRecordsResult<'Steps'>),
    canRead('SleepSession')
      ? safeReadRecords('SleepSession', {
          timeRangeFilter: sleepWeeklyTimeRange,
          pageSize: RECORDS_PAGE_SIZE,
        })
      : Promise.resolve({records: []} as ReadRecordsResult<'SleepSession'>),
    canRead('SleepSession')
      ? safeReadRecords('SleepSession', {
          timeRangeFilter: sleepWeeklyTimeRange,
          ascendingOrder: false,
          pageSize: 5,
        })
      : Promise.resolve({records: []} as ReadRecordsResult<'SleepSession'>),
    canRead('HeartRate')
      ? safeReadRecords('HeartRate', {
          timeRangeFilter: weeklyTimeRange,
          ascendingOrder: false,
          pageSize: 5,
        })
      : Promise.resolve({records: []} as ReadRecordsResult<'HeartRate'>),
    canRead('Weight')
      ? safeReadRecords('Weight', {
          timeRangeFilter: todayTimeRange,
          pageSize: RECORDS_PAGE_SIZE,
        })
      : Promise.resolve({records: []} as ReadRecordsResult<'Weight'>),
    canRead('BloodPressure')
      ? safeReadRecords('BloodPressure', {
          timeRangeFilter: todayTimeRange,
          pageSize: RECORDS_PAGE_SIZE,
        })
      : Promise.resolve({records: []} as ReadRecordsResult<'BloodPressure'>),
    canRead('RestingHeartRate')
      ? safeReadRecords('RestingHeartRate', {
          timeRangeFilter: todayTimeRange,
          pageSize: RECORDS_PAGE_SIZE,
        })
      : Promise.resolve({records: []} as ReadRecordsResult<'RestingHeartRate'>),
    canRead('Vo2Max')
      ? safeReadRecords('Vo2Max', {
          timeRangeFilter: todayTimeRange,
          pageSize: RECORDS_PAGE_SIZE,
        })
      : Promise.resolve({records: []} as ReadRecordsResult<'Vo2Max'>),
    canRead('Distance')
      ? safeReadRecords('Distance', {
          timeRangeFilter: todayTimeRange,
          pageSize: RECORDS_PAGE_SIZE,
        })
      : Promise.resolve({records: []} as ReadRecordsResult<'Distance'>),
    canRead('ActiveCaloriesBurned')
      ? safeReadRecords('ActiveCaloriesBurned', {
          timeRangeFilter: todayTimeRange,
          pageSize: RECORDS_PAGE_SIZE,
        })
      : Promise.resolve({
          records: [],
        } as ReadRecordsResult<'ActiveCaloriesBurned'>),
    canRead('TotalCaloriesBurned')
      ? safeReadRecords('TotalCaloriesBurned', {
          timeRangeFilter: sleepTodayTimeRange,
          pageSize: RECORDS_PAGE_SIZE,
        })
      : Promise.resolve({
          records: [],
        } as ReadRecordsResult<'TotalCaloriesBurned'>),
    canRead('Speed')
      ? safeReadRecords('Speed', {
          timeRangeFilter: todayTimeRange,
          pageSize: RECORDS_PAGE_SIZE,
        })
      : Promise.resolve({records: []} as ReadRecordsResult<'Speed'>),
  ]);

  const isRecordInSession = (record: {endTime: string}) => {
    const endMs = dayjs(record.endTime).valueOf();
    const startMs = sessionStartTime.valueOf();
    const endLimitMs = sessionEndTime.valueOf();
    return endMs >= startMs && endMs <= endLimitMs;
  };

  const stepsRecordsFiltered = (todayStepsRecords?.records ?? []).filter(
    isRecordInSession,
  );
  const sleepRecordsFiltered = (todaySleepRecords?.records ?? []).filter(
    isRecordInSession,
  );
  const heartRateRecordsFiltered = (
    todayHeartRateRecords?.records ?? []
  ).filter(isRecordInSession);
  const exerciseRecordsFiltered = (todayExerciseRecords?.records ?? []).filter(
    isRecordInSession,
  );
  const distanceRecordsFiltered = (rawDistanceRecords?.records ?? []).filter(
    isRecordInSession,
  );
  const activeCaloriesRecordsFiltered = (
    rawActiveCaloriesRecords?.records ?? []
  ).filter(isRecordInSession);
  const totalCaloriesRecordsFiltered = (
    rawTotalCaloriesRecords?.records ?? []
  ).filter(isRecordInSession);
  const speedRecordsFiltered = (rawSpeedRecords?.records ?? []).filter(
    isRecordInSession,
  );

  const weeklySummaryMap = new Map(
    createWeeklySummarySeed().map(item => [item.date, item]),
  );

  mergeRecordTotalsByDate(
    weeklySummaryMap,
    weeklyStepsRecords.records,
    record => dayjs(record.startTime).format('YYYY-MM-DD'),
    (summary, record) => {
      summary.steps += record.count;
    },
  );

  mergeRecordTotalsByDate(
    weeklySummaryMap,
    weeklySleepRecords.records,
    record => dayjs(record.endTime).format('YYYY-MM-DD'),
    (summary, record) => {
      summary.sleepHours = roundToOneDecimal(
        summary.sleepHours +
          getDurationInHours(record.startTime, record.endTime),
      );
    },
  );

  const heartRateSummary = getHeartRateSummary(heartRateRecordsFiltered);
  const rawTotalCaloriesSum = totalCaloriesRecordsFiltered.reduce(
    (sum, record: any) => sum + (record.energy?.inKilocalories ?? 0),
    0,
  );
  const resolvedCaloriesInKcal = roundToOneDecimal(rawTotalCaloriesSum);

  const rawDistanceSum = distanceRecordsFiltered.reduce(
    (sum, record: any) => sum + (record.distance?.inKilometers ?? 0),
    0,
  );
  const resolvedDistanceInKm = roundToOneDecimal(rawDistanceSum);

  const mappedTodayExerciseRecords = mapExerciseSessions(
    exerciseRecordsFiltered,
  );
  const exerciseHeartPoints = getDerivedHeartPoints(mappedTodayExerciseRecords);
  const stepsHeartPoints = getHeartPointsFromSteps(
    stepsRecordsFiltered,
    mappedTodayExerciseRecords,
  );
  const detailedRecords = createDetailedMetricRecords({
    stepsRecords: stepsRecordsFiltered,
    distanceRecords: distanceRecordsFiltered,
    activeCaloriesRecords: activeCaloriesRecordsFiltered,
    totalCaloriesRecords: totalCaloriesRecordsFiltered,
    speedRecords: speedRecordsFiltered,
  });

  const summary = {
    activeCaloriesInKcal: resolvedCaloriesInKcal,
    heartPoints: exerciseHeartPoints + stepsHeartPoints,
    totalCaloriesInKcal: roundToOneDecimal(rawTotalCaloriesSum),
    distanceInKm: resolvedDistanceInKm,
    steps: sumSteps(stepsRecordsFiltered),
    sleepHours: sumSleepHoursForDay(sleepRecordsFiltered, now),
    averageHeartRate: heartRateSummary.averageHeartRate,
    heartRateMeasurements: heartRateSummary.heartRateMeasurements,
    todayExerciseRecords: mappedTodayExerciseRecords,
    stepsRecords: stepsRecordsFiltered.map(r => ({
      count: r.count,
      startTime: r.startTime,
      endTime: r.endTime,
      source: r.metadata?.dataOrigin || '',
    })),
    detailedRecords,
  };

  return {
    ...baseState,
    summary,
    weeklySummary: Array.from(weeklySummaryMap.values()),
    recentSleepSessions: mapSleepSessions(recentSleepRecords?.records ?? []),
    recentHeartRateEntries: mapHeartRateRecords(
      recentHeartRateRecords?.records ?? [],
    ),
    lastSyncedAt: now.toISOString(),
  };
};

export const openHealthConnectAppSettings = () => {
  if (Platform.OS === 'android') {
    openHealthConnectSettings();
  }
};

export const refreshHealthConnectPermissions =
  async (): Promise<IHealthConnectAccessState> => {
    if (Platform.OS !== 'android') {
      return {...EMPTY_ACCESS_STATE, availability: 'unsupported_platform'};
    }

    const availability = await checkGoogleHealthConnectAvailability();

    if (availability !== 'available') {
      return {...EMPTY_ACCESS_STATE, availability};
    }

    const isInitialized = await initialize();

    if (!isInitialized) {
      console.warn('Health Connect initialization failed on refresh');
      return {...EMPTY_ACCESS_STATE, availability, isInitialized: false};
    }

    const permissionState = await checkGoogleHealthPermissionsGranted();
    return {
      ...permissionState,
      availability,
      isInitialized: true,
    };
  };

export const checkGoogleFitInstalled = async (): Promise<boolean> => {
  return true;
};

export const openGoogleFitStorePage = async () => {
  const gfMarketUri = 'market://details?id=com.google.android.apps.fitness';
  const gfWebUri =
    'https://play.google.com/store/apps/details?id=com.google.android.apps.fitness';
  await openStorePage(gfMarketUri, gfWebUri);
};

export const openHealthConnectStorePage = async () => {
  await openStorePage(HEALTH_CONNECT_MARKET_URI, HEALTH_CONNECT_WEB_URI);
};

export const startHealthConnectWorkManagerSync = async (
  options: IHealthConnectWorkManagerStartOptions,
) => {
  if (
    Platform.OS !== 'android' ||
    !healthConnectWorkManagerModule?.startHealthSync
  ) {
    return false;
  }

  return healthConnectWorkManagerModule.startHealthSync(options);
};

export const getHealthConnectWorkManagerStatus = async () => {
  if (
    Platform.OS !== 'android' ||
    !healthConnectWorkManagerModule?.getHealthSyncStatus
  ) {
    return null;
  }

  return healthConnectWorkManagerModule.getHealthSyncStatus();
};

export const openHealthConnectExactAlarmSettings = async () => {
  if (
    Platform.OS !== 'android' ||
    !healthConnectWorkManagerModule?.openExactAlarmSettings
  ) {
    return false;
  }

  return healthConnectWorkManagerModule.openExactAlarmSettings();
};

export const openHealthConnectBatteryOptimizationSettings = async () => {
  if (
    Platform.OS !== 'android' ||
    !healthConnectWorkManagerModule?.openBatteryOptimizationSettings
  ) {
    return false;
  }

  return healthConnectWorkManagerModule.openBatteryOptimizationSettings();
};

export const getHealthConnectSyncedIntervals = async (): Promise<string[]> => {
  if (
    Platform.OS !== 'android' ||
    !healthConnectWorkManagerModule?.getSyncedIntervals
  ) {
    return [];
  }
  return healthConnectWorkManagerModule.getSyncedIntervals();
};

export const saveHealthConnectSyncedIntervals = async (
  intervals: string[],
): Promise<boolean> => {
  if (
    Platform.OS !== 'android' ||
    !healthConnectWorkManagerModule?.saveSyncedIntervals
  ) {
    return false;
  }
  return healthConnectWorkManagerModule.saveSyncedIntervals(intervals);
};

export const getHealthConnectSyncedKeys = async (): Promise<string[]> => {
  if (
    Platform.OS !== 'android' ||
    !healthConnectWorkManagerModule?.getSyncedKeys
  ) {
    return [];
  }
  return healthConnectWorkManagerModule.getSyncedKeys();
};

export const saveHealthConnectSyncedKeys = async (
  keys: string[],
): Promise<boolean> => {
  if (
    Platform.OS !== 'android' ||
    !healthConnectWorkManagerModule?.saveSyncedKeys
  ) {
    return false;
  }
  return healthConnectWorkManagerModule.saveSyncedKeys(keys);
};

export const syncHealthConnectAnalytics = async (): Promise<boolean> => {
  try {
    const access = await refreshHealthConnectPermissions();
    if (access.availability !== 'available' || !access.isInitialized || access.grantedPermissions.length === 0) {
      console.warn('Sync cancelled: Health Connect access/permissions not ready');
      return false;
    }

    const cachedProfile = await storageHelper.getItem<UserProfile>(
      STORAGE_KEYS.USER_PROFILE,
    );
    const uhid = cachedProfile?.uhid || 'SAUSHA9775';
    const deviceId = await getDynamicDeviceId();

    const API_BASE_URL = 'https://97c0imknqe.execute-api.ap-south-1.amazonaws.com/backend';
    const syncedIntervalsSet = new Set(await getHealthConnectSyncedIntervals());

    // 2a. Fetch synced keys cache from SharedPreferences
    const syncedKeysArray = await getHealthConnectSyncedKeys();
    const syncedKeysSet = new Set(syncedKeysArray);
    const sessions = ['morning', 'afternoon', 'evening', 'night'];
    const now = dayjs();

    let overallSuccess = true;
    let syncedSomething = false;

    // Generate intervals for last 7 days
    const intervalsToSync: { dateStr: string; session: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dateStr = now.subtract(i, 'day').format('YYYY-MM-DD');
      sessions.forEach(session => {
        intervalsToSync.push({ dateStr, session });
      });
    }

    // Configure Native Worker settings (so background worker always has correct profile credentials)
    await startHealthConnectWorkManagerSync({
      baseUrl: API_BASE_URL,
      deviceId,
      uhid,
    });

    // 2b. Fetch Remote lastSyncTime from Server
    let lastSyncTimeVal: dayjs.Dayjs | null = null;
    try {
      const res = await axios.post(
        `${API_BASE_URL.replace(':8082', ':8081')}/health-connect/getLastSyncDateTime`,
        { uhid, deviceId },
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (res.data) {
        console.log(`[JS Sync] Raw getLastSyncDateTime response:`, JSON.stringify(res.data, null, 2));
        const data = res.data.data;
        if (data && data.lastSyncDate && data.lastSyncTime) {
          lastSyncTimeVal = dayjs(`${data.lastSyncDate} ${data.lastSyncTime}:00`);
        } else if (data && data.lastSyncTime) {
          lastSyncTimeVal = dayjs(data.lastSyncTime);
        } else if (res.data.lastSyncTime) {
          lastSyncTimeVal = dayjs(res.data.lastSyncTime);
        }
      }
      console.log(`[JS Sync] Parsed remote lastSyncTime:`, lastSyncTimeVal ? lastSyncTimeVal.format('YYYY-MM-DD HH:mm:ss') : 'NULL (Syncing all data)');
    } catch (err) {
      console.error('[JS Sync] Failed to fetch remote lastSyncTime, defaulting to NULL:', err);
    }

    // Purge local cache based on remote lastSyncTimeVal
    if (lastSyncTimeVal !== null) {
      // 1. Purge syncedIntervalsSet
      for (const intervalKey of Array.from(syncedIntervalsSet)) {
        const parts = intervalKey.split(':');
        if (parts.length >= 2) {
          const dateStr = parts[0];
          const sessionName = parts[1];
          const selectedDay = dayjs(dateStr);
          let sessionStartTime = selectedDay.startOf('day');
          switch (sessionName) {
            case 'morning':
              sessionStartTime = selectedDay.hour(6).minute(0).second(0).millisecond(0);
              break;
            case 'afternoon':
              sessionStartTime = selectedDay.hour(12).minute(0).second(0).millisecond(0);
              break;
            case 'evening':
              sessionStartTime = selectedDay.hour(17).minute(0).second(0).millisecond(0);
              break;
            case 'night':
              sessionStartTime = selectedDay.hour(21).minute(0).second(0).millisecond(0);
              break;
          }
          if (sessionStartTime.isAfter(lastSyncTimeVal)) {
            syncedIntervalsSet.delete(intervalKey);
          }
        }
      }
      
      // 2. Purge syncedKeysSet
      for (const key of Array.from(syncedKeysSet)) {
        const parts = key.split('|');
        if (parts.length >= 2) {
          const recordStart = dayjs(parts[1]);
          if (recordStart.isAfter(lastSyncTimeVal)) {
            syncedKeysSet.delete(key);
          }
        }
      }
    } else {
      syncedIntervalsSet.clear();
      syncedKeysSet.clear();
    }

    for (const item of intervalsToSync) {
      const { dateStr, session: sessionName } = item;
      const intervalKey = `${dateStr}:${sessionName}`;

      // Calculate start and end times for this session
      const selectedDay = dayjs(dateStr);
      let sessionStartTime = selectedDay.startOf('day');
      let sessionEndTime = selectedDay.endOf('day');

      switch (sessionName) {
        case 'morning':
          sessionStartTime = selectedDay.hour(6).minute(0).second(0).millisecond(0);
          sessionEndTime = selectedDay.hour(11).minute(59).second(59).millisecond(999);
          break;
        case 'afternoon':
          sessionStartTime = selectedDay.hour(12).minute(0).second(0).millisecond(0);
          sessionEndTime = selectedDay.hour(16).minute(59).second(59).millisecond(999);
          break;
        case 'evening':
          sessionStartTime = selectedDay.hour(17).minute(0).second(0).millisecond(0);
          sessionEndTime = selectedDay.hour(20).minute(59).second(59).millisecond(999);
          break;
        case 'night':
          sessionStartTime = selectedDay.hour(21).minute(0).second(0).millisecond(0);
          sessionEndTime = selectedDay.add(1, 'day').hour(5).minute(59).second(59).millisecond(999);
          break;
      }

      // Skip future sessions
      if (sessionStartTime.isAfter(now)) {
        continue;
      }

      const isPastSession = sessionEndTime.isBefore(now);

      // Skip already synced completed past sessions
      if (isPastSession && syncedIntervalsSet.has(intervalKey)) {
        continue;
      }

      try {
        // Load data snapshot for target day and session
        const snapshot = await loadHealthConnectSnapshot(access, dateStr, sessionName);
        const summary = snapshot.summary;

        if (!summary) {
          continue;
        }

        // Apply strict key-based deduplication and filters
        const sessionSyncedKeys: string[] = [];

        const filterDetailedRecords = (arr: any[], dataType: string) => {
          if (!arr) return [];
          return arr.filter(record => {
            const key = `${dataType}|${record.startTime}|${record.endTime}`;
            if (syncedKeysSet.has(key)) {
              return false; // Filter out
            }
            if (lastSyncTimeVal !== null) {
              const recordStart = dayjs(record.startTime);
              if (recordStart.isBefore(lastSyncTimeVal) || recordStart.isSame(lastSyncTimeVal)) {
                return false; // Filter out
              }
            }
            sessionSyncedKeys.push(key);
            return true; // Keep
          });
        };

        const filteredSteps = filterDetailedRecords(summary.detailedRecords?.stepsObject, 'steps');
        const filteredDistance = filterDetailedRecords(summary.detailedRecords?.distanceObject, 'distance');
        const filteredCalories = filterDetailedRecords(summary.detailedRecords?.caloriesObject, 'calories');
        const filteredSpeed = filterDetailedRecords(summary.detailedRecords?.speedObject, 'speed');

        const hasNewData = filteredSteps.length > 0 ||
                           filteredDistance.length > 0 ||
                           filteredCalories.length > 0 ||
                           filteredSpeed.length > 0;

        if (!hasNewData) {
          console.log(`[JS Sync] No new detailed data for session ${intervalKey}. Skipping upload.`);
          if (isPastSession) {
            syncedIntervalsSet.add(intervalKey);
          }
          continue;
        }

        syncedSomething = true;
        console.log(`[JS Sync] Syncing session: ${intervalKey}`);

        const payload = {
          uhid,
          deviceId,
          session: sessionName,
          date: dateStr,
          steps: summary.steps || 0,
          heartPoint: summary.heartPoints || 0,
          activeCaloriesInKcal: summary.activeCaloriesInKcal || summary.totalCaloriesInKcal || 0,
          averageHeartRate: summary.averageHeartRate || 0,
          heartRateMeasurements: summary.heartRateMeasurements || 0,
          sleepHours: summary.sleepHours || 0,
          distanceInKm: summary.distanceInKm || 0,
          createdOn: now.toISOString(),
          lastSyncTime: now.toISOString(),
          todayExerciseRecords: summary.todayExerciseRecords || [],
          stepsObject: filteredSteps,
          distanceObject: filteredDistance,
          caloriesObject: filteredCalories,
          speedObject: filteredSpeed,
        };

        console.log(`[JS Sync] Posting Detailed Payload for session ${intervalKey}:`, JSON.stringify([payload], null, 2));

        // POST request wrapped in array as required
        await axios.post(
          `${API_BASE_URL}/health-connect/saveDetailedUserHealthAnalytics`,
          [payload],
          { headers: { 'Content-Type': 'application/json' } }
        );

        console.log(`[JS Sync] Successfully synced session: ${intervalKey}`);

        // Add newly synced keys to set
        sessionSyncedKeys.forEach(k => syncedKeysSet.add(k));

        if (isPastSession) {
          syncedIntervalsSet.add(intervalKey);
        }
      } catch (err: any) {
        console.warn(`[JS Sync] Failed to sync session: ${intervalKey}`, err);
        if (err?.response?.data) {
          console.warn(`[JS Sync] Server error response for ${intervalKey}:`, JSON.stringify(err.response.data, null, 2));
        }
        overallSuccess = false;
      }
    }

    // Save synced intervals & synced keys sets back to SharedPreferences
    await saveHealthConnectSyncedIntervals(Array.from(syncedIntervalsSet));
    await saveHealthConnectSyncedKeys(Array.from(syncedKeysSet));

    if (syncedSomething && overallSuccess) {
      await storageHelper.setItem(
        STORAGE_KEYS.LAST_GOOGLE_FIT_SYNC,
        now.toISOString(),
      );
    }

    return overallSuccess;
  } catch (err) {
    console.warn('[JS Sync] Sync crashed:', err);
    return false;
  }
};
