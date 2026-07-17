import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  RefreshControl,
  Alert,
  AppState,
  TouchableOpacity,
  Modal,
  Platform,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import dayjs from 'dayjs';
import Svg, { Path } from 'react-native-svg';

import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomButton } from '../../components/common/CustomButton';
import { EmptyState } from '../../components/common/EmptyState';
import { STRINGS } from '../../constants/strings';
import { apiService } from '../../services/api';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile } from '../../types';
import { s } from './styles';
import { T } from './constants';

import {
  getHealthConnectAccessState,
  requestHealthConnectPermissions,
  loadHealthConnectSnapshot,
  openHealthConnectAppSettings,
  openHealthConnectStorePage,
  checkGoogleFitInstalled,
  openGoogleFitStorePage,
  syncHealthConnectAnalytics,
  getHealthConnectWorkManagerStatus,
  openHealthConnectExactAlarmSettings,
  openHealthConnectBatteryOptimizationSettings,
} from '../../services/healthConnect';

import {
  IHealthConnectAccessState,
  IHealthConnectState,
  IHealthConnectExerciseSession,
} from '../../services/types';

const Icon = ({
  name,
  size = 20,
  color = '#64748B',
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}) => {
  if (name === 'sync') {
    return (
      <View style={style}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
            fill={color}
          />
        </Svg>
      </View>
    );
  }

  if (name === 'heart-pulse') {
    return (
      <View style={style}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={color}
          />
        </Svg>
      </View>
    );
  }

  return null;
};

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  progress?: number;
  color: string;
  bgColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  icon,
  progress,
  color,
  bgColor,
}) => {
  return (
    <View style={s.metricCard}>
      <View style={s.metricHeader}>
        <Text style={s.metricTitle}>{title}</Text>
        <View style={[s.metricIconContainer, { backgroundColor: bgColor }]}>
          <Text style={s.metricIconText}>{icon}</Text>
        </View>
      </View>
      <View style={s.metricValueRow}>
        <Text style={s.metricValue}>{value}</Text>
        {unit && <Text style={s.metricUnit}>{unit}</Text>}
      </View>
      {progress !== undefined ? (
        <View style={s.metricProgressContainer}>
          <View style={s.metricProgressBackground}>
            <View
              style={[
                s.metricProgressBar,
                {
                  width: `${Math.min(progress * 100, 100)}%`,
                  backgroundColor: color,
                },
              ]}
            />
          </View>
          <Text style={s.metricProgressText}>
            {Math.round(progress * 100)}% of daily goal
          </Text>
        </View>
      ) : (
        <View style={s.metricSpacer} />
      )}
    </View>
  );
};

const formatDateTime = (value: string) =>
  dayjs(value).format('DD MMM, hh:mm A');

const getCurrentPeriodSteps = (stepsRecords: any[], currentTime: string) => {
  const hour = dayjs(currentTime).hour();
  let startHour, endHour;

  if (hour >= 6 && hour < 12) {
    startHour = 6;
    endHour = 11;
  } else if (hour >= 12 && hour < 17) {
    startHour = 12;
    endHour = 16;
  } else if (hour >= 17 && hour < 21) {
    startHour = 17;
    endHour = 20;
  } else {
    startHour = 21;
    endHour = 5;
  }

  const today = dayjs(currentTime).startOf('day');
  const startTime = today.hour(startHour).toISOString();
  const endTime =
    endHour >= startHour
      ? today.hour(endHour).endOf('hour').toISOString()
      : today.add(1, 'day').hour(endHour).endOf('hour').toISOString();

  const filtered = stepsRecords.filter(
    (r: any) => r.endTime >= startTime && r.startTime <= endTime,
  );
  return filtered.reduce((sum: number, r: any) => sum + r.count, 0);
};

const getStatusMeta = (
  availability: IHealthConnectAccessState['availability'],
  hasAllPermissions: boolean,
) => {
  const sc = STRINGS.healthConnect;
  if (availability === 'idle')
    return {
      label: sc.checkingLabel,
      description: sc.checkingDescription,
      color: '#3b82f6',
    };
  if (availability === 'unsupported_platform')
    return {
      label: sc.androidOnlyLabel,
      description: sc.onlyAndroid,
      color: '#64748B',
    };
  if (availability === 'unavailable')
    return {
      label: sc.installLabel,
      description: sc.installRequired,
      color: '#f43f5e',
    };
  if (availability === 'update_required')
    return {
      label: sc.updateLabel,
      description: sc.updateRequired,
      color: '#f59e0b',
    };
  if (!hasAllPermissions)
    return {
      label: sc.permissionsMissing,
      description: sc.permissionRequired,
      color: '#f59e0b',
    };
  return {
    label: sc.connected,
    description: sc.connectedDescription,
    color: '#10b981',
  };
};

const getRequiredAppActions = (
  availability: IHealthConnectAccessState['availability'],
) => {
  if (availability === 'idle' || availability === 'unsupported_platform')
    return [];
  const actions: any[] = [];
  if (availability === 'unavailable')
    actions.push({
      key: 'install-health-connect',
      title: STRINGS.healthConnect.title,
      description: STRINGS.healthConnect.installRequired,
      buttonLabel: STRINGS.healthConnect.installHealthConnect,
      onPress: openHealthConnectStorePage,
    });
  if (availability === 'update_required')
    actions.push({
      key: 'update-health-connect',
      title: STRINGS.healthConnect.title,
      description: STRINGS.healthConnect.updateRequired,
      buttonLabel: STRINGS.healthConnect.updateHealthConnect,
      onPress: openHealthConnectStorePage,
    });
  return actions;
};

const buildRequiredAppsMessage = (actions: any[]) =>
  [STRINGS.healthConnect.requiredAppsDescription as string]
    .concat(actions.map((a, i) => `${i + 1}. ${a.title}: ${a.description}`))
    .join('\n');

const StepsTrackingTab = () => {
  const isFocused = useIsFocused();
  const installPromptKeyRef = useRef<string | null>(null);

  const [accessState, setAccessState] = useState<IHealthConnectAccessState>({
    availability: 'idle',
    isInitialized: false,
    hasAllPermissions: false,
    grantedPermissions: [],
  });

  const [healthState, setHealthState] = useState<IHealthConnectState | null>(
    null,
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isGoogleFitInstalled, setIsGoogleFitInstalled] = useState(false);
  const [lastSyncedText, setLastSyncedText] = useState<string | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [hasDismissedSetupModal, setHasDismissedSetupModal] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'success' | 'failure'>(
    'idle',
  );

  const { availability, hasAllPermissions } = accessState;

  const summary = healthState?.summary;
  const lastSyncedAt = healthState?.lastSyncedAt || lastSyncedText;
  const recentHeartRateEntries = healthState?.recentHeartRateEntries ?? [];
  const recentSleepSessions = healthState?.recentSleepSessions ?? [];
  const weeklySummary = healthState?.weeklySummary ?? [];

  const statusMeta = getStatusMeta(availability, hasAllPermissions);
  const requiredAppActions = getRequiredAppActions(availability);
  const showHealthData = availability === 'available' && summary != null;

  const todayExerciseRecords: IHealthConnectExerciseSession[] =
    summary?.todayExerciseRecords ?? [];

  const hasAnyHealthData = Boolean(
    summary &&
      (summary.steps > 0 ||
        (summary.distanceInKm ?? 0) > 0 ||
        (summary.activeCaloriesInKcal ?? 0) > 0 ||
        summary.sleepHours > 0 ||
        summary.heartRateMeasurements > 0 ||
        recentSleepSessions.length > 0 ||
        recentHeartRateEntries.length > 0 ||
        todayExerciseRecords.length > 0),
  );

  const isConnectedButNoData = showHealthData && !hasAnyHealthData;

  const noticeTitle =
    requiredAppActions.length > 1
      ? STRINGS.healthConnect.requiredAppsTitle
      : availability === 'available' && !hasAllPermissions
      ? STRINGS.healthConnect.setupTitle
      : requiredAppActions[0]?.title ?? statusMeta.label;

  const noticeDescription =
    requiredAppActions.length > 1
      ? STRINGS.healthConnect.requiredAppsDescription
      : availability === 'available' && !hasAllPermissions
      ? STRINGS.healthConnect.permissionRequired
      : requiredAppActions[0]?.description ?? statusMeta.description;

  const checkStatusAndData = async (_silent = false) => {
    try {
      const access = await getHealthConnectAccessState();
      setAccessState(access);

      if (access.availability === 'available' && access.isInitialized) {
        const snapshot = await loadHealthConnectSnapshot(access);
        setHealthState(snapshot);
      }

      const lastSync = await storageHelper.getItem<string>(
        STORAGE_KEYS.LAST_GOOGLE_FIT_SYNC,
      );
      if (lastSync) {
        setLastSyncedText(lastSync);
      }
    } catch (err) {
      console.warn('Failed to load health connect snapshot:', err);
    }
  };

  const handleRequestAccess = async () => {
    try {
      const access = await requestHealthConnectPermissions();
      setAccessState(access);
      if (access.availability === 'available' && access.isInitialized) {
        const snapshot = await loadHealthConnectSnapshot(access);
        setHealthState(snapshot);
      }
    } catch (err) {
      console.warn('Failed to grant health connect access:', err);
      Alert.alert(
        'Permission Denied',
        'MoveHub requires these permissions to sync your Google Fit steps.',
      );
    }
  };

  const checkNativePermissions = async () => {
    if (Platform.OS !== 'android') return;
    try {
      const nativeStatus = await getHealthConnectWorkManagerStatus();
      if (!nativeStatus) return;

      const { exactAlarmAllowed, batteryOptimizationIgnored } = nativeStatus;
      
      if (!batteryOptimizationIgnored || !exactAlarmAllowed) {
        let message = 'To ensure your health data is synchronized automatically in the background, please:\n\n';
        if (!batteryOptimizationIgnored) {
          message += '• Disable battery restrictions (Select "Don\'t Restrict" / "Ignore Battery Optimization")\n';
        }
        if (!exactAlarmAllowed) {
          message += '• Allow scheduling exact alarms\n';
        }
        
        Alert.alert(
          'Background Sync Settings Required',
          message,
          [
            {
              text: 'Configure Settings',
              onPress: async () => {
                if (!batteryOptimizationIgnored) {
                  await openHealthConnectBatteryOptimizationSettings();
                } else if (!exactAlarmAllowed) {
                  await openHealthConnectExactAlarmSettings();
                }
              }
            },
            {
              text: 'Cancel',
              style: 'cancel'
            }
          ]
        );
      }
    } catch (err) {
      console.warn('Failed to check background sync permissions:', err);
    }
  };

  const _saveHealthData = async () => {
    setSyncing(true);
    try {
      const success = await syncHealthConnectAnalytics();
      if (success) {
        const syncTime = new Date().toISOString();
        setLastSyncedText(syncTime);
        setSyncStatus('success');
        await checkStatusAndData(true);
      } else {
        setSyncStatus('failure');
      }
    } catch (err) {
      console.error('Failed to save health data:', err);
      setSyncStatus('failure');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    const checkGoogleFit = async () => {
      const installed = await checkGoogleFitInstalled();
      setIsGoogleFitInstalled(installed);
    };
    checkGoogleFit();
  }, []);

  const hasMountedRef = useRef(false);

  useEffect(() => {
    if (!isFocused) {
      installPromptKeyRef.current = null;
      return;
    }

    checkStatusAndData();
    checkNativePermissions();

    hasMountedRef.current = true;

    const subscription = AppState.addEventListener('change', nextState => {
      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        return;
      }

      if (nextState === 'active') {
        setTimeout(() => {
          checkStatusAndData(true);
          checkNativePermissions();
        }, 800);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isFocused]);

  useEffect(() => {
    if (!isFocused || availability === 'idle' || hasDismissedSetupModal) return;
    const isMissingApps =
      availability === 'unavailable' ||
      availability === 'update_required' ||
      !isGoogleFitInstalled;

    if (isMissingApps) {
      setShowSetupModal(true);
    }
  }, [isFocused, availability, isGoogleFitInstalled, hasDismissedSetupModal]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await checkStatusAndData();
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <View style={s.root}>

      <ScrollView
        contentContainerStyle={s.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={statusMeta.color}
            colors={[statusMeta.color]}
            title="Pull to refresh health data"
            titleColor={statusMeta.color}
          />
        }
      >
        <View style={s.header}>
          <View style={s.headerTopRow}>
            <View
              style={[
                s.headerIconRing,
                { borderColor: `${statusMeta.color}50` },
              ]}
            >
              <Icon name="heart-pulse" size={24} color={statusMeta.color} />
            </View>
            <View style={s.headerTitleBlock}>
              <Text style={s.headerTitle}>{STRINGS.healthConnect.title}</Text>
              <Text style={s.headerSub}>{statusMeta.description}</Text>
            </View>
            <View
              style={[
                s.statusPill,
                {
                  backgroundColor: `${statusMeta.color}20`,
                  borderColor: `${statusMeta.color}55`,
                },
              ]}
            >
              <View
                style={[s.statusPillDot, { backgroundColor: statusMeta.color }]}
              />
              <Text style={[s.statusPillText, { color: statusMeta.color }]}>
                {statusMeta.label}
              </Text>
            </View>
          </View>

          <View style={s.headerMetaRow}>
            <View style={s.headerMetaItem}>
              <Icon name="sync" size={12} color={T.textMuted} />
              <Text style={s.headerMetaText}>
                Last Synced:{' '}
                {lastSyncedAt ? formatDateTime(lastSyncedAt) : 'Never synced'}
              </Text>
            </View>
          </View>
        </View>

        {!showHealthData ? (
          <View style={s.onboardingContainer}>
            <View style={s.guideCard}>
              <Text style={s.guideTitle}>📋 Google Fit Setup Guide</Text>
              <Text style={s.guideText}>
                To sync your fitness data, make sure both Health Connect and
                Google Fit are installed. Click below to download:
              </Text>
              <View style={s.guideButtonsRow}>
                <TouchableOpacity
                  onPress={openHealthConnectStorePage}
                  style={s.guideButtonHC}
                  activeOpacity={0.8}
                >
                  <Text style={s.guideButtonText}>1. Get Health Connect</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={openGoogleFitStorePage}
                  style={s.guideButtonGF}
                  activeOpacity={0.8}
                >
                  <Text style={s.guideButtonText}>2. Get Google Fit</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={s.verticalSpacer} />
            <EmptyState
              title={noticeTitle}
              description={noticeDescription}
              icon="🔒"
              actionTitle={
                availability === 'available' && !hasAllPermissions
                  ? STRINGS.healthConnect.connectNow
                  : undefined
              }
              onActionPress={
                availability === 'available' && !hasAllPermissions
                  ? handleRequestAccess
                  : undefined
              }
            />
            {availability === 'available' && !hasAllPermissions && (
              <CustomButton
                title="Open Settings"
                onPress={openHealthConnectAppSettings}
                variant="outline"
                style={s.actionBtnMargin}
              />
            )}
            {availability === 'unavailable' && (
              <CustomButton
                title={STRINGS.healthConnect.installHealthConnect}
                onPress={openHealthConnectStorePage}
                variant="primary"
                style={s.actionBtnMargin}
              />
            )}
          </View>
        ) : isConnectedButNoData ? (
          <View style={s.onboardingContainer}>
            <View style={s.guideCard}>
              <Text style={s.guideTitle}>📋 Google Fit Setup Guide</Text>
              <Text style={s.guideText}>
                To sync your fitness data, make sure both Health Connect and
                Google Fit are installed. Click below to download:
              </Text>
              <View style={s.guideButtonsRow}>
                <TouchableOpacity
                  onPress={openHealthConnectStorePage}
                  style={s.guideButtonHC}
                  activeOpacity={0.8}
                >
                  <Text style={s.guideButtonText}>1. Get Health Connect</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={openGoogleFitStorePage}
                  style={s.guideButtonGF}
                  activeOpacity={0.8}
                >
                  <Text style={s.guideButtonText}>2. Get Google Fit</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={s.verticalSpacer} />
            <EmptyState
              title="No Health Data Found"
              description="Connected successfully, but no fitness records were detected for today in Health Connect. Try logging some movements in Google Fit!"
              icon="🏃‍♂️"
              actionTitle={
                isGoogleFitInstalled
                  ? 'Open Google Fit Settings'
                  : 'Install Google Fit'
              }
              onActionPress={
                isGoogleFitInstalled
                  ? openHealthConnectAppSettings
                  : openGoogleFitStorePage
              }
            />
          </View>
        ) : (
          <View>
            {/* Sync now trigger */}
            <View style={s.syncSection}>
              <Text style={s.syncTitle}>
                Ready to Sync Health Snapshot
              </Text>
              <Text style={s.syncSubText}>
                Upload your local Google Fit records directly to your MoveHub profile.
              </Text>
              <CustomButton
                title={syncing ? 'Syncing...' : 'Sync Google Fit'}
                onPress={_saveHealthData}
                variant="primary"
                loading={syncing}
                style={s.syncButton}
              />
            </View>

            {/* Daily Metrics Dashboard Grid */}
            <Text style={s.metricsSectionTitle}>TODAY'S METRICS</Text>
            <View style={s.cardGrid}>
              <View style={s.cardWrapper}>
                <MetricCard
                  title="Steps"
                  value={summary.steps}
                  unit="steps"
                  icon="👟"
                  progress={summary.steps / 10000}
                  color="#D97706"
                  bgColor="#FEF3C7"
                />
              </View>
              <View style={s.cardWrapper}>
                <MetricCard
                  title="Active Burn"
                  value={summary.activeCaloriesInKcal}
                  unit="kcal"
                  icon="🔥"
                  color="#EF4444"
                  bgColor="#FEE2E2"
                />
              </View>
              <View style={s.cardWrapper}>
                <MetricCard
                  title="Distance"
                  value={summary.distanceInKm}
                  unit="km"
                  icon="📍"
                  color="#3B82F6"
                  bgColor="#E0F2FE"
                />
              </View>
              <View style={s.cardWrapper}>
                <MetricCard
                  title="Sleep"
                  value={summary.sleepHours}
                  unit="hrs"
                  icon="😴"
                  progress={summary.sleepHours / 8}
                  color="#8B5CF6"
                  bgColor="#F3E8FF"
                />
              </View>
              <View style={s.cardWrapper}>
                <MetricCard
                  title="Heart Rate"
                  value={summary.averageHeartRate ?? '--'}
                  unit="bpm"
                  icon="❤️"
                  color="#F43F5E"
                  bgColor="#FFE4E6"
                />
              </View>
              <View style={s.cardWrapper}>
                <MetricCard
                  title="Total Energy"
                  value={summary.totalCaloriesInKcal}
                  unit="kcal"
                  icon="⚡"
                  color="#10B981"
                  bgColor="#ECFDF5"
                />
              </View>
            </View>

            {/* Today's Exercise Sessions */}
            {todayExerciseRecords.length > 0 && (
              <View style={s.historySection}>
                <Text style={s.metricsSectionTitle}>EXERCISE SESSIONS</Text>
                {todayExerciseRecords.map((session, idx) => {
                  const getWorkoutMeta = (type: number, title?: string) => {
                    const t = (title || '').toLowerCase();
                    if (
                      type === 8 ||
                      type === 56 ||
                      t.includes('run') ||
                      t.includes('jog')
                    ) {
                      return { icon: '🏃‍♂️', bgColor: '#FEE2E2' };
                    }
                    if (
                      type === 1 ||
                      type === 79 ||
                      t.includes('walk') ||
                      t.includes('step') ||
                      t.includes('stroll')
                    ) {
                      return { icon: '🚶‍♂️', bgColor: '#FEF3C7' };
                    }
                    if (
                      type === 57 ||
                      type === 12 ||
                      t.includes('cycl') ||
                      t.includes('bike') ||
                      t.includes('bicycle')
                    ) {
                      return { icon: '🚴‍♂️', bgColor: '#E0F2FE' };
                    }
                    if (
                      type === 82 ||
                      type === 83 ||
                      t.includes('swim') ||
                      t.includes('pool')
                    ) {
                      return { icon: '🏊‍♂️', bgColor: '#CCFBF1' };
                    }
                    if (
                      type === 91 ||
                      type === 92 ||
                      t.includes('yoga') ||
                      t.includes('pilates') ||
                      t.includes('stretch')
                    ) {
                      return { icon: '🧘‍♂️', bgColor: '#F3E8FF' };
                    }
                    if (
                      type === 85 ||
                      type === 86 ||
                      t.includes('strength') ||
                      t.includes('weight') ||
                      t.includes('gym') ||
                      t.includes('workout') ||
                      t.includes('lift')
                    ) {
                      return { icon: '🏋️‍♂️', bgColor: '#ECFDF5' };
                    }
                    if (
                      type === 9 ||
                      type === 62 ||
                      t.includes('basket') ||
                      t.includes('ball') ||
                      t.includes('soccer') ||
                      t.includes('football')
                    ) {
                      return { icon: '⚽', bgColor: '#FFEDD5' };
                    }
                    if (
                      type === 37 ||
                      t.includes('hike') ||
                      t.includes('climb') ||
                      t.includes('mountain')
                    ) {
                      return { icon: '🥾', bgColor: '#F5E6D3' };
                    }
                    return { icon: '💪', bgColor: '#F1F5F9' };
                  };

                  const meta = getWorkoutMeta(session.type, session.title);

                  return (
                    <View key={`ex-${idx}`} style={s.workoutCard}>
                      {/* Left icon badge */}
                      <View
                        style={[
                          s.workoutIconBadge,
                          { backgroundColor: meta.bgColor },
                        ]}
                      >
                        <Text style={s.workoutIconText}>{meta.icon}</Text>
                      </View>

                      {/* Middle text details */}
                      <View style={s.workoutInfo}>
                        <Text style={s.workoutTitle}>
                          {session.title || 'Workout'}
                        </Text>
                        <Text style={s.workoutSource}>
                          Source: {session.source || 'Google Fit'}
                        </Text>
                      </View>

                      {/* Right duration pill */}
                      <View style={s.workoutDurationPill}>
                        <Text style={s.workoutDurationText}>
                          {Math.round(session.durationHours * 60)} min
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* Weekly trends summary */}
            {weeklySummary.length > 0 && (
              <View style={s.historySection}>
                <Text style={s.metricsSectionTitle}>PAST 7 DAYS HISTORY</Text>
                {weeklySummary.map((day, idx) => {
                  const dayObj = dayjs(day.date);
                  const isGoalMet = day.steps >= 10000;
                  const stepPercent = Math.min(
                    Math.round((day.steps / 10000) * 100),
                    100,
                  );

                  return (
                    <View key={`day-${idx}`} style={s.historyCard}>
                      {/* Left side Date Box */}
                      <View style={s.historyDateBox}>
                        <Text style={s.historyMonthText}>
                          {dayObj.format('MMM')}
                        </Text>
                        <Text style={s.historyDayText}>
                          {dayObj.format('DD')}
                        </Text>
                      </View>

                      {/* Middle Stats Info */}
                      <View style={s.historyContent}>
                        <Text style={s.historyDayName}>
                          {dayObj.format('dddd')}
                        </Text>
                        <View style={s.historyStatsRow}>
                          <View style={s.historyStatItem}>
                            <Text style={s.historyEmojiText}>👟</Text>
                            <Text style={s.historyStatText}>
                              {day.steps.toLocaleString()}
                            </Text>
                          </View>
                          <View style={s.historyStatItem}>
                            <Text style={s.historyEmojiText}>😴</Text>
                            <Text style={s.historyStatText}>
                              {day.sleepHours} hrs
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Right side Goal Status Badge */}
                      <View
                        style={[
                          s.historyStatusPill,
                          {
                            backgroundColor: isGoalMet ? '#D1FAE5' : '#EFF6FF',
                            borderColor: isGoalMet ? '#A7F3D0' : '#DBEAFE',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            s.historyStatusText,
                            {
                              color: isGoalMet ? '#059669' : '#2563EB',
                            },
                          ]}
                        >
                          {isGoalMet ? 'Goal Met' : `${stepPercent}%`}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Custom Onboarding Setup Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSetupModal}
        onRequestClose={() => setShowSetupModal(false)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            <View style={s.modalIconRing}>
              <Text style={s.modalIconText}>❤️</Text>
            </View>
            <Text style={s.modalTitle}>Google Fit Integration</Text>
            <Text style={s.modalSub}>
              To automatically sync steps and workouts, MoveHub requires both
              Google Fit and Health Connect installed on your device.
            </Text>

            <View style={s.modalActionsList}>
              {/* Health Connect App Row */}
              <View style={s.modalActionRow}>
                <View style={s.modalActionInfo}>
                  <Text style={s.modalActionTitle}>Health Connect</Text>
                  <Text style={s.modalActionText}>
                    Manages secure background data sharing.
                  </Text>
                </View>
                <TouchableOpacity
                  style={s.modalDownloadBtn}
                  onPress={openHealthConnectStorePage}
                  activeOpacity={0.8}
                >
                  <Text style={s.modalDownloadBtnText}>Get App</Text>
                </TouchableOpacity>
              </View>

              {/* Google Fit App Row */}
              <View style={s.modalActionRow}>
                <View style={s.modalActionInfo}>
                  <Text style={s.modalActionTitle}>Google Fit</Text>
                  <Text style={s.modalActionText}>
                    Logs daily steps, energy, and sleep.
                  </Text>
                </View>
                <TouchableOpacity
                  style={s.modalDownloadBtn}
                  onPress={openGoogleFitStorePage}
                  activeOpacity={0.8}
                >
                  <Text style={s.modalDownloadBtnText}>Get App</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={s.modalCloseBtn}
              onPress={() => {
                setShowSetupModal(false);
                setHasDismissedSetupModal(true);
              }}
              activeOpacity={0.6}
            >
              <Text style={s.modalCloseBtnText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sync Status Feedback Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={syncStatus !== 'idle'}
        onRequestClose={() => setSyncStatus('idle')}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContainer}>
            {syncStatus === 'success' ? (
              <>
                <View style={s.statusIconRingSuccess}>
                  <Text style={s.statusIconText}>✅</Text>
                </View>
                <Text style={s.statusTitle}>Sync Successful</Text>
                <Text style={s.statusSub}>
                  Your Google Fit steps and workouts have been successfully
                  synchronized to your MoveHub profile!
                </Text>
                <TouchableOpacity
                  style={s.statusButtonSuccess}
                  onPress={() => setSyncStatus('idle')}
                  activeOpacity={0.8}
                >
                  <Text style={s.statusButtonText}>Awesome</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <View style={s.statusIconRingFailure}>
                  <Text style={s.statusIconText}>❌</Text>
                </View>
                <Text style={s.statusTitle}>Sync Failed</Text>
                <Text style={s.statusSub}>
                  Failed to synchronize health records. Please check your
                  network connection and try again.
                </Text>
                <TouchableOpacity
                  style={s.statusButtonFailure}
                  onPress={() => {
                    setSyncStatus('idle');
                    _saveHealthData();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={s.statusButtonText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.modalCloseBtn}
                  onPress={() => setSyncStatus('idle')}
                  activeOpacity={0.6}
                >
                  <Text style={s.modalCloseBtnText}>Dismiss</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default StepsTrackingTab;
