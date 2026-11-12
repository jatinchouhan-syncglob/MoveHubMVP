import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { CustomHeader } from '../../components/common/CustomHeader';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile } from '../../types';
import DrawerContext from '../../navigation/DrawerContext';
import { apiService } from '../../services/api';

interface PrescriptionScreenProps {
  showDrawer?: boolean;
}

export interface ICoreTarget {
  key: string;
  name: string;
  icon?: string;
  target?: string | number;
  base?: string | number;
  unit?: string;
}

export interface IChecklistItem {
  id?: number | string;
  name?: string;
  schedule?: string;
  duration?: string;
  ruleDescription?: string;
}

export interface ISafetyCeiling {
  label: string;
  value: string;
}

export interface IAdaptiveTarget {
  score?: number;
  metricName?: string;
  statusLabel?: string;
}

export interface IRollingWindow {
  days?: number;
  daysAvailable?: number;
  sourceStart?: string;
  sourceEnd?: string;
  sourceDate?: string;
  sourceTable?: string;
  availableDates?: string[];
  metricSourceRowCounts?: Record<string, number>;
}

export interface IPrescriptionCycle {
  cycleTitle?: string;
  rangeStart?: string;
  rangeEnd?: string;
  resetsInDays?: number;
  adaptiveTarget?: IAdaptiveTarget;
  coreTargets?: ICoreTarget[];
  checklist?: IChecklistItem[];
  safetyCeilings?: ISafetyCeiling[];
  clinicalRationale?: string;
  rollingWindow?: IRollingWindow;
  isLocked?: boolean;
  lockReason?: string;
  weekNumber?: number;
  weekLabel?: string;
}

export interface IPhase2PrescriptionData {
  uhid: string;
  patientMeta?: {
    name?: string;
    age?: number;
    sex?: string;
    profileMode?: string;
  };
  baseline?: IPrescriptionCycle;
  current?: IPrescriptionCycle;
  archive?: IPrescriptionCycle[];
}

export const PrescriptionScreen: React.FC<PrescriptionScreenProps> = ({
  showDrawer = true,
}) => {
  const navigation = useNavigation<any>();
  const drawer = useContext(DrawerContext);

  const [activeTab, setActiveTab] = useState<'BASELINE' | 'CURRENT' | 'ARCHIVE'>('BASELINE');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [prescriptionData, setPrescriptionData] = useState<IPhase2PrescriptionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescription = useCallback(async (isPullToRefresh = false) => {
    try {
      if (isPullToRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const cachedProfile = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      if (cachedProfile) {
        setProfile(cachedProfile);
      }

      const targetUhid = cachedProfile?.uhid?.trim() || '';
      if (!targetUhid) {
        setError('User UHID not available');
        return;
      }
      const response = await apiService.getPhase2Prescription(targetUhid);

      if (response && response.status === 'Success' && response.data) {
        setPrescriptionData(response.data);
      } else {
        setError(response?.message || 'Data not available');
      }
    } catch (err: any) {
      console.error('[PrescriptionScreen] Fetch error:', err?.response?.data || err?.message);
      setError('Unable to fetch prescription details. Pull to refresh to try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPrescription();
  }, [fetchPrescription]);

  const handleGoToWorkoutLogs = () => {
    if (drawer?.setActiveScreen) {
      drawer.setActiveScreen('ActivityTracking');
    } else {
      navigation.navigate('DrawerNavigator', {
        screen: 'ActivityTracking',
      });
    }
  };

  const displayUhid = prescriptionData?.uhid || profile?.uhid || 'N/A';
  const patientMeta = prescriptionData?.patientMeta;
  const baseline = prescriptionData?.baseline;
  const current = prescriptionData?.current;
  const archive = prescriptionData?.archive;

  // Helper for displaying values with fallback
  const renderValueOrNA = (val: any, fallback = 'N/A') => {
    if (val === undefined || val === null || String(val).trim() === '') {
      return fallback;
    }
    return String(val);
  };

  const formatAdaptiveMetricTitle = (name?: string) => {
    if (!name || name.trim() === '') return 'BIO SYNC EFFICIENCY';
    if (/bse(\s*efficiency)?/i.test(name)) {
      return 'BIO SYNC EFFICIENCY';
    }
    return name.toUpperCase();
  };

  const formatTargetName = (name?: string) => {
    if (!name || name.trim() === '') return 'Target';
    if (/^bse\s*efficiency$/i.test(name.trim()) || name.trim().toUpperCase() === 'BSE') {
      return 'Bio Sync Efficiency';
    }
    return name;
  };

  const formatMetricValue = (val: any, unit?: string) => {
    if (val === undefined || val === null || String(val).trim() === '') {
      return '-';
    }
    const str = String(val).trim();
    if (str.toLowerCase() === 'n/a') return '-';
    return unit && unit.trim() !== '' ? `${str} ${unit}` : str;
  };

  const hasValidMetricValue = (val: any): boolean => {
    if (val === undefined || val === null) return false;
    const s = String(val).trim();
    if (
      s === '' ||
      s.toLowerCase() === 'n/a' ||
      s.toLowerCase() === 'null' ||
      s.toLowerCase() === 'undefined' ||
      s === '-'
    ) {
      return false;
    }
    const num = parseFloat(s);
    if (!isNaN(num)) {
      return num > 0;
    }
    return true;
  };

  const isTargetItemValid = (item: ICoreTarget): boolean => {
    return hasValidMetricValue(item.target);
  };

  const renderComingSoonCard = (
    title: string,
    desc = 'Data will appear here once assessment calibration is completed.',
    icon = '⏳'
  ) => {
    return (
      <View style={styles.comingSoonCard}>
        <View style={styles.comingSoonIconCircle}>
          <Text style={styles.comingSoonIcon}>{icon}</Text>
        </View>
        <View style={styles.comingSoonTextCol}>
          <Text style={styles.comingSoonTitle}>{title}</Text>
          <Text style={styles.comingSoonDesc}>{desc}</Text>
        </View>
        <View style={styles.comingSoonBadge}>
          <Text style={styles.comingSoonBadgeText}>COMING SOON</Text>
        </View>
      </View>
    );
  };

  const renderTargetsTable = (items?: ICoreTarget[]) => {
    const validItems = (items || []).filter(isTargetItemValid);

    if (validItems.length === 0) {
      return renderComingSoonCard(
        'Core Targets & Pacing',
        'Targets are being calibrated and will appear once your baseline assessment is complete.',
        '🎯'
      );
    }

    return (
      <View style={styles.targetTableCard}>
        {/* Table Header: Name, Base, Target */}
        <View style={styles.targetTableHeader}>
          <View style={styles.targetTableColName}>
            <Text style={styles.targetTableColHeaderText}>NAME</Text>
          </View>
          <View style={styles.targetTableColBase}>
            <Text style={[styles.targetTableColHeaderText, styles.textCenter]}>BASE</Text>
          </View>
          <View style={styles.targetTableColTarget}>
            <Text style={[styles.targetTableColHeaderText, styles.textRight]}>TARGET</Text>
          </View>
        </View>

        {/* Table Rows - Only for items with valid values */}
        {validItems.map((item, idx) => {
          const isLast = idx === validItems.length - 1;
          const formattedBase = hasValidMetricValue(item.base)
            ? (item.unit && item.unit.trim() !== '' ? `${item.base} ${item.unit}` : String(item.base))
            : '-';
          const formattedTarget = hasValidMetricValue(item.target)
            ? (item.unit && item.unit.trim() !== '' ? `${item.target} ${item.unit}` : String(item.target))
            : '-';

          return (
            <View
              key={item.key || `target-row-${idx}`}
              style={[
                styles.targetTableRow,
                isLast && styles.targetTableRowLast,
                idx % 2 === 1 && styles.targetTableRowAlt,
              ]}
            >
              {/* Column 1: Name */}
              <View style={[styles.targetTableColName, styles.targetNameRow]}>
                <Text style={styles.targetRowIcon}>{item.icon || '📊'}</Text>
                <Text style={styles.targetRowNameText} numberOfLines={2}>
                  {formatTargetName(item.name)}
                </Text>
              </View>

              {/* Column 2: Base */}
              <View style={styles.targetTableColBase}>
                <Text style={styles.targetBaseText} numberOfLines={1}>
                  {formattedBase}
                </Text>
              </View>

              {/* Column 3: Target */}
              <View style={styles.targetTableColTarget}>
                <Text style={styles.targetTargetText} numberOfLines={1}>
                  {formattedTarget}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#070B14" />
      <CustomHeader
        title="EXERCISE STRATEGIES"
        showDrawerButton={showDrawer}
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />

      {/* Atmospheric Soft Glow Blobs */}
      <View style={styles.glowSpot1} pointerEvents="none" />
      <View style={styles.glowSpot2} pointerEvents="none" />

      {/* Top 3-Tab Navigator: BASELINE | CURRENT | ARCHIVE */}
      <View style={styles.headerToggleWrapper}>
        <View style={styles.toggleSelectorContainer}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === 'BASELINE' && styles.toggleBtnActive,
            ]}
            onPress={() => setActiveTab('BASELINE')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleBtnText,
                activeTab === 'BASELINE' && styles.toggleBtnTextActive,
              ]}
            >
              📊 BASELINE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === 'CURRENT' && styles.toggleBtnActive,
            ]}
            onPress={() => setActiveTab('CURRENT')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleBtnText,
                activeTab === 'CURRENT' && styles.toggleBtnTextActive,
              ]}
            >
              ⚡ CURRENT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === 'ARCHIVE' && styles.toggleBtnActive,
            ]}
            onPress={() => setActiveTab('ARCHIVE')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleBtnText,
                activeTab === 'ARCHIVE' && styles.toggleBtnTextActive,
              ]}
            >
              📂 ARCHIVE
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchPrescription(true)}
            tintColor="#38BDF8"
            colors={['#38BDF8', '#10B981']}
          />
        }
      >
        {/* Loading Spinner Indicator */}
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38BDF8" />
            <Text style={styles.loadingText}>Loading prescription telemetry...</Text>
          </View>
        )}

        {/* Error Notice Card */}
        {!loading && error && !prescriptionData && (
          <View style={styles.errorCard}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Prescription Offline</Text>
            <Text style={styles.errorDesc}>{error}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => fetchPrescription()}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>Retry 🔄</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Main Content when loaded */}
        {!loading && (
          <>
            {/* =========================================================================
                TAB 1: BASELINE TAB (Dynamic Biometric Lifestyle Baseline from API)
                ========================================================================= */}
            {activeTab === 'BASELINE' && (
              <View style={styles.biometricMainCard}>
                {/* Header Badge & Title */}
                <View style={styles.bioTopHeader}>
                  <View style={styles.bioBadgePill}>
                    <Text style={styles.bioBadgeIcon}>🧬</Text>
                    <Text style={styles.bioBadgeText}>
                      {baseline?.cycleTitle || '7-DAY ROLLING BASELINE'}
                    </Text>
                  </View>
                  <Text style={styles.bioCardMainTitle}>
                    Biometric Exercise Strategies
                  </Text>
                </View>

                {/* Patient Meta Strip */}
                <View style={styles.bioPatientMetaBox}>
                  <View style={styles.bioMetaChipsRow}>
                    <View style={styles.bioMetaChip}>
                      <Text style={styles.bioMetaChipLabel}>
                        UHID: <Text style={styles.bioMetaChipValue}>{renderValueOrNA(displayUhid)}</Text>
                      </Text>
                    </View>
                    <View style={styles.bioMetaChip}>
                      <Text style={styles.bioMetaChipLabel}>
                        Age: <Text style={styles.bioMetaChipValue}>
                          {patientMeta?.age !== undefined && patientMeta?.age !== null
                            ? `${patientMeta.age} yrs`
                            : 'N/A'}
                        </Text>
                      </Text>
                    </View>
                    <View style={styles.bioMetaChip}>
                      <Text style={styles.bioMetaChipLabel}>
                        Sex: <Text style={styles.bioMetaChipValue}>{renderValueOrNA(patientMeta?.sex)}</Text>
                      </Text>
                    </View>
                  </View>
                  <View style={styles.bioProfileModeRow}>
                    <View
                      style={[
                        styles.bioProfileDot,
                        {
                          backgroundColor:
                            patientMeta?.profileMode && patientMeta.profileMode !== 'ASSESSMENT REQUIRED'
                              ? '#10B981'
                              : '#F59E0B',
                        },
                      ]}
                    />
                    <Text style={styles.bioProfileModeText}>
                      Profile: {renderValueOrNA(patientMeta?.profileMode, 'Data not available')}
                    </Text>
                  </View>
                </View>

                {/* Weekly Tracking Window */}
                <View style={styles.bioWindowBox}>
                  <View style={styles.bioWindowLeft}>
                    <Text style={styles.bioWindowLabel}>WEEKLY TRACKING WINDOW</Text>
                    <Text style={styles.bioWindowRange}>
                      📅{' '}
                      {baseline?.rangeStart && baseline?.rangeEnd
                        ? `${baseline.rangeStart} — ${baseline.rangeEnd}`
                        : 'Data not available'}
                    </Text>
                  </View>
                  <View style={styles.bioResetBadge}>
                    <Text style={styles.bioResetText}>
                      ⏳{' '}
                      {baseline?.resetsInDays !== undefined && baseline?.resetsInDays !== null
                        ? `Resets in ${baseline.resetsInDays}d`
                        : 'N/A'}
                    </Text>
                  </View>
                </View>

                {/* Rolling Telemetry Summary Strip */}
                {baseline?.rollingWindow && (
                  <View style={styles.rollingTelemetryBox}>
                    <View style={styles.rollingTelemetryLeft}>
                      <Text style={styles.rollingTelemetryLabel}>TELEMETRY COVERAGE</Text>
                      <Text style={styles.rollingTelemetryText}>
                        📊 {baseline.rollingWindow.daysAvailable ?? 0} of {baseline.rollingWindow.days ?? 7} Days Available
                      </Text>
                    </View>
                    <View style={styles.rollingTelemetryPill}>
                      <Text style={styles.rollingTelemetryPillText}>
                        {baseline.rollingWindow.sourceDate ? `As of ${baseline.rollingWindow.sourceDate}` : '7-Day Rolling'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Central Adaptive Target Ring */}
                <View style={styles.bioTargetSection}>
                  <View style={styles.bioTargetRingOuter}>
                    <View style={styles.bioTargetRingInner}>
                      <Text style={styles.bioTargetBigScore}>
                        {baseline?.adaptiveTarget?.score !== undefined && baseline?.adaptiveTarget?.score !== null
                          ? baseline.adaptiveTarget.score.toFixed(1)
                          : 'N/A'}
                      </Text>
                      <Text style={styles.bioTargetSublabel}>ADAPTIVE TARGET</Text>
                      <Text style={styles.bioTargetMetricTitle}>
                        {formatAdaptiveMetricTitle(baseline?.adaptiveTarget?.metricName)}
                      </Text>
                      <View style={styles.bioTargetStatusPill}>
                        <View
                          style={[
                            styles.bioTargetGreenDot,
                            {
                              backgroundColor:
                                baseline?.adaptiveTarget?.statusLabel?.toLowerCase().includes('optimal')
                                  ? '#10B981'
                                  : '#F59E0B',
                            },
                          ]}
                        />
                        <Text style={styles.bioTargetStatusText}>
                          {renderValueOrNA(baseline?.adaptiveTarget?.statusLabel, 'Assessment required')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Core Targets & Lifestyle Pacing Balance */}
                <View style={styles.bioSectionTitleRow}>
                  <Text style={styles.bioSectionHeaderIcon}>📋</Text>
                  <Text style={styles.bioSectionHeader}>
                    Core Targets & Lifestyle Pacing
                  </Text>
                </View>

                {renderTargetsTable(baseline?.coreTargets)}

                {/* Weekly Foundational Checklist */}
                <View style={styles.bioSectionTitleRow}>
                  <Text style={styles.bioSectionHeaderIcon}>🚀</Text>
                  <Text style={styles.bioSectionHeader}>
                    Weekly Foundational Checklist
                  </Text>
                </View>

                {(() => {
                  const validChecklist = (baseline?.checklist || []).filter(
                    item => item && item.name && item.name.trim() !== '' && !item.name.toLowerCase().includes('n/a')
                  );
                  if (validChecklist.length === 0) {
                    return renderComingSoonCard(
                      'Protocol Checklist',
                      'Personalized protocol checklist will be unlocked once assessment is completed.',
                      '📋'
                    );
                  }
                  return (
                    <View style={styles.bioChecklistContainer}>
                      {validChecklist.map((item, idx) => (
                        <View key={item.id ?? `checklist-${idx}`} style={styles.bioChecklistItem}>
                          <View style={styles.bioChecklistHeaderRow}>
                            <View style={{ flex: 1, marginRight: 8 }}>
                              <Text style={styles.bioChecklistTitle}>
                                {item.id ? `${item.id}. ` : ''}{renderValueOrNA(item.name, 'Protocol Step')}
                              </Text>
                              <Text style={styles.bioChecklistSchedule}>
                                ⏱️ {renderValueOrNA(item.duration)} • {renderValueOrNA(item.schedule)}
                              </Text>
                            </View>
                            <View style={styles.protocolBadgePill}>
                              <Text style={styles.protocolBadgeText}>Active Guideline</Text>
                            </View>
                          </View>
                          <Text style={styles.bioChecklistRuleDesc}>
                            {renderValueOrNA(item.ruleDescription, 'Data not available')}
                          </Text>
                        </View>
                      ))}
                    </View>
                  );
                })()}

                {/* Bounding Safety Ceilings */}
                {(() => {
                  const validCeilings = (baseline?.safetyCeilings || []).filter(
                    ceiling =>
                      ceiling &&
                      ceiling.label &&
                      ceiling.label.trim() !== '' &&
                      ceiling.value &&
                      hasValidMetricValue(ceiling.value)
                  );

                  if (validCeilings.length === 0) {
                    return renderComingSoonCard(
                      'Bounding Safety Ceilings',
                      'Physiological safety limits will be established based on your clinical assessment.',
                      '🛑'
                    );
                  }

                  return (
                    <View style={styles.bioSafetyBox}>
                      <View style={styles.bioSafetyHeaderRow}>
                        <Text style={styles.bioSafetyIcon}>🛑</Text>
                        <Text style={styles.bioSafetyTitle}>Bounding Safety Ceilings</Text>
                      </View>
                      {validCeilings.map((ceiling, idx) => (
                        <React.Fragment key={ceiling.label || `ceiling-${idx}`}>
                          <View style={styles.bioSafetyItem}>
                            <Text style={styles.bioSafetyLabel}>{ceiling.label}</Text>
                            <Text style={styles.bioSafetyValue}>{ceiling.value}</Text>
                          </View>
                          {idx < validCeilings.length - 1 && (
                            <View style={styles.bioSafetyDivider} />
                          )}
                        </React.Fragment>
                      ))}
                    </View>
                  );
                })()}

                {/* Physiological Rationale & Citation */}
                {(() => {
                  const rationaleText = baseline?.clinicalRationale?.trim();
                  const hasValidRationale =
                    rationaleText &&
                    rationaleText !== '' &&
                    !rationaleText.toLowerCase().includes('data not available') &&
                    !rationaleText.toLowerCase().includes('n/a');

                  if (!hasValidRationale) {
                    return renderComingSoonCard(
                      'Physiological Rationale & Citation',
                      'Evidence-based clinical rationale will appear here upon prescription formulation.',
                      '🔬'
                    );
                  }

                  return (
                    <View style={styles.bioRationaleBox}>
                      <View style={styles.bioRationaleHeaderRow}>
                        <Text style={styles.bioRationaleIcon}>🔬</Text>
                        <Text style={styles.bioRationaleTitle}>Physiological Rationale & Citation</Text>
                      </View>
                      <Text style={styles.bioRationaleText}>
                        {rationaleText}
                      </Text>
                    </View>
                  );
                })()}

                {/* Action Button: Proceed to Activity Tracker - Commented out until data comes in core targets */}
                {/*
                <TouchableOpacity
                  style={styles.actionBtn}
                  activeOpacity={0.85}
                  onPress={handleGoToWorkoutLogs}
                >
                  <LinearGradient
                    colors={['#10B981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionBtnGradient}
                  >
                    <Text style={styles.actionBtnText}>PROCEED TO WORKOUT LOGS 🏃‍♂️</Text>
                  </LinearGradient>
                </TouchableOpacity>
                */}
              </View>
            )}

            {/* =========================================================================
                TAB 2: CURRENT TAB (Locked State or Active Formulation from API)
                ========================================================================= */}
            {activeTab === 'CURRENT' && (
              <>
                {(!current || current.isLocked) ? (
                  <View style={styles.emptyCard}>
                    <View style={styles.emptyIconCircle}>
                      <Text style={styles.emptyIcon}>⚡</Text>
                    </View>
                    <Text style={styles.emptyTitle}>CURRENT EXERCISE STRATEGIES</Text>
                    <Text style={styles.emptySubhead}>Coming Soon</Text>
                    <Text style={styles.emptyDesc}>
                      Your individualized clinical exercise strategies will be formulated and updated here once your baseline assessment completes.
                    </Text>
                    <View style={[styles.comingSoonBadge, { marginTop: 14 }]}>
                      <Text style={styles.comingSoonBadgeText}>COMING SOON</Text>
                    </View>
                  </View>
                ) : (
                  /* Active Current Prescription when unlocked */
                  <View style={styles.biometricMainCard}>
                    <View style={styles.bioTopHeader}>
                      <View style={styles.bioBadgePill}>
                        <Text style={styles.bioBadgeIcon}>⚡</Text>
                        <Text style={styles.bioBadgeText}>
                          {current.weekLabel || current.cycleTitle || 'CURRENT ACTIVE PRESCRIPTION'}
                        </Text>
                      </View>
                      <Text style={styles.bioCardMainTitle}>Active Exercise Strategies</Text>
                    </View>

                    {/* Weekly Window */}
                    <View style={styles.bioWindowBox}>
                      <View style={styles.bioWindowLeft}>
                        <Text style={styles.bioWindowLabel}>CURRENT CYCLE WINDOW</Text>
                        <Text style={styles.bioWindowRange}>
                          📅{' '}
                          {current.rangeStart && current.rangeEnd
                            ? `${current.rangeStart} — ${current.rangeEnd}`
                            : 'Data not available'}
                        </Text>
                      </View>
                      <View style={styles.bioResetBadge}>
                        <Text style={styles.bioResetText}>
                          ⏳{' '}
                          {current.resetsInDays !== undefined && current.resetsInDays !== null
                            ? `Resets in ${current.resetsInDays}d`
                            : 'N/A'}
                        </Text>
                      </View>
                    </View>

                    {/* Adaptive Target Ring */}
                    <View style={styles.bioTargetSection}>
                      <View style={styles.bioTargetRingOuter}>
                        <View style={styles.bioTargetRingInner}>
                          <Text style={styles.bioTargetBigScore}>
                            {current.adaptiveTarget?.score !== undefined && current.adaptiveTarget?.score !== null
                              ? current.adaptiveTarget.score.toFixed(1)
                              : 'N/A'}
                          </Text>
                          <Text style={styles.bioTargetSublabel}>ACTIVE TARGET</Text>
                          <Text style={styles.bioTargetMetricTitle}>
                            {formatAdaptiveMetricTitle(current.adaptiveTarget?.metricName)}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Core Targets */}
                    <View style={styles.bioSectionTitleRow}>
                      <Text style={styles.bioSectionHeaderIcon}>📋</Text>
                      <Text style={styles.bioSectionHeader}>
                        Core Targets & Lifestyle Pacing
                      </Text>
                    </View>

                    {renderTargetsTable(current.coreTargets)}

                    {/* Rationale */}
                    {(() => {
                      const currRationale = current.clinicalRationale?.trim();
                      const hasCurrRationale =
                        currRationale &&
                        currRationale !== '' &&
                        !currRationale.toLowerCase().includes('data not available') &&
                        !currRationale.toLowerCase().includes('n/a');

                      if (!hasCurrRationale) {
                        return renderComingSoonCard(
                          'Clinical Rationale',
                          'Clinical rationale data will be available upon formulation.',
                          '🔬'
                        );
                      }

                      return (
                        <View style={styles.bioRationaleBox}>
                          <View style={styles.bioRationaleHeaderRow}>
                            <Text style={styles.bioRationaleIcon}>🔬</Text>
                            <Text style={styles.bioRationaleTitle}>Clinical Rationale</Text>
                          </View>
                          <Text style={styles.bioRationaleText}>
                            {currRationale}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>
                )}
              </>
            )}

            {/* =========================================================================
                TAB 3: ARCHIVE TAB (Archived prescriptions from API or empty state)
                ========================================================================= */}
            {activeTab === 'ARCHIVE' && (
              <>
                {archive && archive.length > 0 ? (
                  <View style={styles.biometricMainCard}>
                    <View style={styles.bioTopHeader}>
                      <View style={styles.bioBadgePill}>
                        <Text style={styles.bioBadgeIcon}>📂</Text>
                        <Text style={styles.bioBadgeText}>STRATEGY ARCHIVES</Text>
                      </View>
                      <Text style={styles.bioCardMainTitle}>Historical Exercise Strategies</Text>
                    </View>
                    {archive.map((archItem, idx) => (
                      <View key={`archive-item-${idx}`} style={styles.archiveCycleItem}>
                        <View style={styles.archiveCycleHeader}>
                          <Text style={styles.archiveCycleTitle}>
                            {archItem.weekLabel || archItem.cycleTitle || `Cycle ${idx + 1}`}
                          </Text>
                          <Text style={styles.archiveCycleRange}>
                            {archItem.rangeStart && archItem.rangeEnd
                              ? `${archItem.rangeStart} — ${archItem.rangeEnd}`
                              : 'Data not available'}
                          </Text>
                        </View>
                        <Text style={styles.archiveCycleScore}>
                          Adaptive Score:{' '}
                          {archItem.adaptiveTarget?.score !== undefined
                            ? archItem.adaptiveTarget.score.toFixed(1)
                            : 'N/A'}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyCard}>
                    <View style={styles.emptyIconCircle}>
                      <Text style={styles.emptyIcon}>📂</Text>
                    </View>
                    <Text style={styles.emptyTitle}>STRATEGY ARCHIVES</Text>
                    <Text style={styles.emptySubhead}>Coming Soon</Text>
                    <Text style={styles.emptyDesc}>
                      Historical 7-day rolling exercise strategies will be archived here sequentially after each weekly cycle completes.
                    </Text>
                    <View style={[styles.comingSoonBadge, { marginTop: 14 }]}>
                      <Text style={styles.comingSoonBadgeText}>COMING SOON</Text>
                    </View>
                  </View>
                )}
              </>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  headerContainer: {
    backgroundColor: '#070B14',
    borderBottomColor: '#1E293B',
    borderBottomWidth: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerButton: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  headerIcon: {
    color: '#FFFFFF',
  },
  glowSpot1: {
    position: 'absolute',
    top: 40,
    right: -40,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    zIndex: -1,
  },
  glowSpot2: {
    position: 'absolute',
    bottom: 80,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    zIndex: -1,
  },

  // Loading & Error States
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
    letterSpacing: 0.3,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
    marginVertical: 14,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F87171',
    marginBottom: 6,
  },
  errorDesc: {
    fontSize: 12,
    color: '#CBD5E1',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
  },
  retryBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  retryBtnText: {
    color: '#FCA5A5',
    fontWeight: '700',
    fontSize: 12.5,
  },

  // Top Tabs Toggle
  headerToggleWrapper: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  toggleSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#1E293B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  toggleBtnTextActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 36,
  },

  // Biometric Reset Main Card
  biometricMainCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bioTopHeader: {
    marginBottom: 14,
  },
  bioBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    marginBottom: 6,
  },
  bioBadgeIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  bioBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  bioCardMainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },

  // Patient Meta Box
  bioPatientMetaBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 14,
  },
  bioMetaChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  bioMetaChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  bioMetaChipLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  bioMetaChipValue: {
    fontWeight: '800',
    color: '#F8FAFC',
  },
  bioProfileModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  bioProfileDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  bioProfileModeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#34D399',
  },

  // Weekly Tracking Window
  bioWindowBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    marginBottom: 12,
  },
  bioWindowLeft: {
    flex: 1,
    marginRight: 8,
  },
  bioWindowLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#818CF8',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  bioWindowRange: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  bioResetBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bioResetText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A5B4FC',
  },

  // Rolling Telemetry Coverage Box
  rollingTelemetryBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    marginBottom: 14,
  },
  rollingTelemetryLeft: {
    flex: 1,
  },
  rollingTelemetryLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  rollingTelemetryText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  rollingTelemetryPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  rollingTelemetryPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6EE7B7',
  },

  // Central Adaptive Target Ring
  bioTargetSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  bioTargetRingOuter: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  bioTargetRingInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  bioTargetBigScore: {
    fontSize: 34,
    fontWeight: '900',
    color: '#10B981',
    lineHeight: 38,
  },
  bioTargetSublabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  bioTargetMetricTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.6,
    marginTop: 1,
    textAlign: 'center',
    maxWidth: 124,
  },
  bioTargetStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  bioTargetGreenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  bioTargetStatusText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#34D399',
  },

  // Core Targets & Lifestyle Pacing
  bioSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  bioSectionHeaderIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  bioSectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.4,
  },
  // Targets Table (Name, Base, Target)
  targetTableCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    marginBottom: 14,
  },
  targetTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151E33',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  targetTableColHeaderText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.6,
  },
  targetTableColName: {
    flex: 1.8,
  },
  targetTableColBase: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetTableColTarget: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  targetTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
  },
  targetTableRowLast: {
    borderBottomWidth: 0,
  },
  targetTableRowAlt: {
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
  },
  targetNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 6,
  },
  targetRowIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  targetRowNameText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F1F5F9',
    flex: 1,
  },
  targetBaseText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    textAlign: 'center',
  },
  targetTargetText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38BDF8',
    textAlign: 'right',
  },
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },

  // Coming Soon Cards
  comingSoonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 14,
    gap: 12,
  },
  comingSoonIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonIcon: {
    fontSize: 18,
  },
  comingSoonTextCol: {
    flex: 1,
  },
  comingSoonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 2,
  },
  comingSoonDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
  comingSoonBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  comingSoonBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
  },

  bioTargetsList: {
    gap: 8,
    marginBottom: 10,
  },
  bioTargetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  bioTargetRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bioTargetRowIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  bioTargetName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  bioTargetRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bioTargetValues: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38BDF8',
  },
  bioTargetBaseChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bioTargetBase: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Empty Box Pattern (Used for missing/empty arrays or text)
  bioEmptySectionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
  },
  bioEmptySectionIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  bioEmptySectionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 2,
  },
  bioEmptySectionDesc: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
  },
  naBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  naBadgeRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  naBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
  },

  // Checklist
  bioChecklistContainer: {
    gap: 10,
    marginBottom: 16,
  },
  bioChecklistItem: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  bioChecklistHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bioChecklistTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  bioChecklistSchedule: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 2,
  },
  protocolBadgePill: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  protocolBadgeText: {
    color: '#38BDF8',
    fontSize: 9.5,
    fontWeight: '800',
  },
  bioChecklistRuleDesc: {
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 16,
  },

  // Safety Ceilings
  bioSafetyBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: 16,
    gap: 8,
  },
  bioSafetyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bioSafetyIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  bioSafetyTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#F87171',
    letterSpacing: 0.3,
    flex: 1,
  },
  bioSafetyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bioSafetyLabel: {
    fontSize: 11.5,
    color: '#CBD5E1',
  },
  bioSafetyValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bioSafetyDivider: {
    height: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },

  // Rationale
  bioRationaleBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 18,
  },
  bioRationaleHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bioRationaleIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  bioRationaleTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#10B981',
    flex: 1,
  },
  bioRationaleText: {
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 17,
  },

  // Action Button
  actionBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  // Locked Container & Elements
  lockedContainer: {
    width: '100%',
  },
  lockedIconCircle: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  lockReasonBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    marginBottom: 14,
    gap: 8,
  },
  lockReasonIcon: {
    fontSize: 16,
  },
  lockReasonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FCD34D',
    flex: 1,
    lineHeight: 16,
  },

  // Empty State Cards (for CURRENT and ARCHIVE tabs)
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    marginBottom: 14,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubhead: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 12.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  emptyNoticePill: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyNoticePillText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Archive Item Box
  archiveCycleItem: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 10,
  },
  archiveCycleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  archiveCycleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  archiveCycleRange: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  archiveCycleScore: {
    fontSize: 11.5,
    color: '#10B981',
    fontWeight: '700',
  },
});

export default PrescriptionScreen;
