import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomButton } from '../../components/common/CustomButton';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile } from '../../types';
import DrawerContext from '../../navigation/DrawerContext';
import { apiService } from '../../services/api';

interface PrescriptionScreenProps {
  showDrawer?: boolean;
}

export const PrescriptionScreen: React.FC<PrescriptionScreenProps> = ({
  showDrawer = true,
}) => {
  const navigation = useNavigation<any>();
  const drawer = useContext(DrawerContext);

  const [activeTab, setActiveTab] = useState<
    'BASELINE' | 'CURRENT' | 'ARCHIVE'
  >('BASELINE');
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [apiData, setApiData] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [selectedArchiveDate, setSelectedArchiveDate] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const cachedProfile = await storageHelper.getItem<UserProfile>(
        STORAGE_KEYS.USER_PROFILE,
      );
      setProfile(cachedProfile);

      const targetUhid = cachedProfile?.uhid || 'JATCHO5525';
      console.log(
        `[PrescriptionScreen] Fetching live assessment API for UHID: ${targetUhid}...`,
      );

      const res = await apiService.submitAssessment(targetUhid);
      console.log(
        '[PrescriptionScreen] Live API Response Received:',
        JSON.stringify(res, null, 2),
      );
      if (res) {
        setApiData(res);
        const dates = res.baseline_source?.available_dates;
        if (Array.isArray(dates) && dates.length > 0) {
          setSelectedArchiveDate(dates[0]);
        }
      }
    } catch (err) {
      console.error(
        '[PrescriptionScreen] Error loading live assessment data:',
        err,
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGoToWorkoutLogs = () => {
    setAccepting(true);
    setTimeout(() => {
      setAccepting(false);
      if (drawer?.setActiveScreen) {
        drawer.setActiveScreen('ActivityTracking');
      } else {
        navigation.navigate('DrawerNavigator', {
          screen: 'ActivityTracking',
          params: { initialTab: 'Workout' },
        });
      }
    }, 400);
  };

  // Helper formatting for dates
  const formatDateStr = (dStr?: string | null) => {
    if (!dStr) return 'Not Available';
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dStr;
    } catch {
      return dStr;
    }
  };

  // Pure dynamic values from API
  const status = apiData?.status || null;
  const uhid = apiData?.uhid || profile?.uhid || 'Not Available';
  const submissionId = apiData?.submission_id || null;
  const message = apiData?.message || null;
  const resultUrl = apiData?.result_url || null;

  const baselineSource = apiData?.baseline_source || null;
  const metrics = baselineSource?.metrics || null;
  const mappedKeys = baselineSource?.mapped_keys || null;
  const dayCounts = baselineSource?.metric_day_counts || null;
  const periodKind = baselineSource?.period_kind || null;
  const windowStart = baselineSource?.window_start || null;
  const windowEnd = baselineSource?.window_end || null;
  const sourceDate = baselineSource?.source_date || null;
  const sourceId = baselineSource?.source_id || null;
  const sourceTable = baselineSource?.source_table || null;
  const availableDates: string[] = Array.isArray(
    baselineSource?.available_dates,
  )
    ? baselineSource.available_dates
    : [];

  // Dynamic Metrics values from API (null if missing)
  const bseScore =
    metrics?.rolling_7d_bse_score !== undefined
      ? Number(metrics.rolling_7d_bse_score).toFixed(2)
      : null;
  const sdexScore =
    metrics?.rolling_7d_sdex_score !== undefined
      ? Number(metrics.rolling_7d_sdex_score).toFixed(2)
      : null;
  const ppiScore =
    metrics?.rolling_7d_ppi !== undefined
      ? Number(metrics.rolling_7d_ppi).toFixed(4)
      : null;
  const e3Score =
    metrics?.rolling_7d_e3 !== undefined
      ? Number(metrics.rolling_7d_e3).toFixed(2)
      : null;
  const isScore =
    metrics?.rolling_7d_is !== undefined
      ? Number(metrics.rolling_7d_is).toFixed(2)
      : null;
  const ahaScore =
    metrics?.rolling_7d_aha_points !== undefined
      ? Number(metrics.rolling_7d_aha_points).toFixed(2)
      : null;

  // Day counts per metric
  const bseDays = dayCounts?.rolling_7d_bse_score ?? null;
  const sdexDays = dayCounts?.rolling_7d_sdex_score ?? null;
  const ppiDays = dayCounts?.rolling_7d_ppi ?? null;
  const e3Days = dayCounts?.rolling_7d_e3 ?? null;
  const isDays = dayCounts?.rolling_7d_is ?? null;
  const ahaDays = dayCounts?.rolling_7d_aha_points ?? null;

  // Optional dynamic prescription objects (if returned by backend when generation completes)
  const dynamicChecklist =
    apiData?.checklist ||
    apiData?.prescription?.foundationalChecklist ||
    apiData?.foundational_actions ||
    null;
  const dynamicSafetyCeilings =
    apiData?.safety_ceilings || apiData?.prescription?.safetyCeilings || null;
  const dynamicRationale =
    apiData?.physiological_rationale ||
    apiData?.prescription?.physiologicalRationale ||
    apiData?.rationale ||
    null;
  const dynamicAdaptiveTargets =
    apiData?.adaptive_targets || apiData?.prescription?.adaptiveTargets || null;

  const isBaseline = activeTab === 'BASELINE';
  const isCurrent = activeTab === 'CURRENT';
  const isArchive = activeTab === 'ARCHIVE';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <CustomHeader
        title="PRESCRIPTION"
        showDrawerButton={showDrawer}
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />

      {/* Background Soft Glow Spots */}
      <View style={styles.glowSpot1} />
      <View style={styles.glowSpot2} />

      {/* Top 3 Tabs Toggle: BASELINE | CURRENT | ARCHIVE */}
      <View style={styles.headerToggleWrapper}>
        <View style={styles.toggleSelectorContainer}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === 'BASELINE' && styles.toggleBtnActive,
            ]}
            onPress={() => {
              setActiveTab('BASELINE');
              setDropdownOpen(false);
            }}
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
            onPress={() => {
              setActiveTab('CURRENT');
              setDropdownOpen(false);
            }}
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
            onPress={() => {
              setActiveTab('ARCHIVE');
            }}
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

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>
            Fetching Live Prescription Data...
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ARCHIVE DATE DROPDOWN SELECTOR */}
          {isArchive && (
            <View style={styles.archiveDropdownContainer}>
              <Text style={styles.dropdownLabel}>
                AVAILABLE ARCHIVED DATES (FROM API)
              </Text>
              {availableDates.length > 0 ? (
                <>
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setDropdownOpen(prev => !prev)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.dropdownButtonText}>
                      🗓️{' '}
                      {formatDateStr(selectedArchiveDate || availableDates[0])}{' '}
                      Formulation
                    </Text>
                    <Text style={styles.dropdownArrow}>
                      {dropdownOpen ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>

                  {dropdownOpen && (
                    <View style={styles.dropdownList}>
                      {availableDates.map((d, idx) => (
                        <React.Fragment key={d}>
                          <TouchableOpacity
                            style={[
                              styles.dropdownItem,
                              selectedArchiveDate === d &&
                                styles.dropdownItemActive,
                            ]}
                            onPress={() => {
                              setSelectedArchiveDate(d);
                              setDropdownOpen(false);
                            }}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.dropdownItemText,
                                selectedArchiveDate === d &&
                                  styles.dropdownItemTextActive,
                              ]}
                            >
                              📅 Available Date: {formatDateStr(d)}
                            </Text>
                          </TouchableOpacity>
                          {idx < availableDates.length - 1 && (
                            <View style={styles.dropdownDivider} />
                          )}
                        </React.Fragment>
                      ))}
                    </View>
                  )}
                </>
              ) : (
                <Text style={styles.notAvailableText}>Not Available</Text>
              )}
            </View>
          )}

          {/* =====================================================
              👑 MAIN PRESCRIPTION CARD (PURE LIVE API DATA)
              ===================================================== */}
          <View style={styles.card}>
            {/* Header Status Banner from API */}
            <View style={styles.prescriptionHeaderBadge}>
              <Text style={styles.prescriptionHeaderEmoji}>💉</Text>
              <Text style={styles.prescriptionHeaderTitle}>
                {isBaseline
                  ? 'BASELINE CONVERGENCE FORMULATION'
                  : isArchive
                  ? `ARCHIVED FORMULATION (${formatDateStr(
                      selectedArchiveDate,
                    )})`
                  : 'CURRENT PRESCRIPTION FORMULATION'}
              </Text>
              {status && (
                <View
                  style={[
                    styles.statusPill,
                    status === 'PROCESSING'
                      ? styles.statusPillProcessing
                      : styles.statusPillSuccess,
                  ]}
                >
                  <Text style={styles.statusPillText}>{status}</Text>
                </View>
              )}
            </View>

            {/* Horizon Validity Window (from baseline_source) */}
            <View style={styles.validityWindowBox}>
              <View style={styles.validityTitleRow}>
                <Text style={styles.validityTitleEmoji}>🗓️</Text>
                <Text style={styles.validityTitleText}>
                  HORIZON VALIDITY WINDOW
                </Text>
              </View>
              <View style={styles.validityRow}>
                <Text style={styles.validityLabel}>Window Range:</Text>
                <Text style={styles.validityValue}>
                  {windowStart ? formatDateStr(windowStart) : 'Not Available'}{' '}
                  to {windowEnd ? formatDateStr(windowEnd) : 'Not Available'}
                </Text>
              </View>
              <View style={styles.validityRow}>
                <Text style={styles.validityLabel}>Source Date:</Text>
                <Text style={styles.validityValue}>
                  {sourceDate ? formatDateStr(sourceDate) : 'Not Available'}
                </Text>
              </View>
              <View style={styles.validityRow}>
                <Text style={styles.validityLabel}>Period Kind:</Text>
                <Text style={styles.validityValue}>
                  {periodKind || 'Not Available'}
                </Text>
              </View>
              {sourceTable ? (
                <View style={styles.validityRow}>
                  <Text style={styles.validityLabel}>Source Table:</Text>
                  <Text style={styles.validityValueMono}>{sourceTable}</Text>
                </View>
              ) : null}
              {sourceId !== null ? (
                <View style={styles.validityRow}>
                  <Text style={styles.validityLabel}>Source ID:</Text>
                  <Text style={styles.validityValue}>{sourceId}</Text>
                </View>
              ) : null}
            </View>

            {/* Central Score / Target Hexagon */}
            <View style={styles.adaptiveTargetContainer}>
              <View style={styles.targetHexagon}>
                <View style={styles.targetHexInner}>
                  <Text style={styles.targetHexValue}>
                    {isBaseline || isArchive
                      ? bseScore ?? 'Not Available'
                      : dynamicAdaptiveTargets?.bse ??
                        bseScore ??
                        'Not Available'}
                  </Text>
                  <Text style={styles.targetHexLabel}>
                    {isBaseline
                      ? '7-DAY MEAN BSE SCORE'
                      : isArchive
                      ? 'ARCHIVE BSE SCORE'
                      : 'ADAPTIVE TARGET'}
                  </Text>
                  <Text style={styles.targetHexSub}>BIOSYNC EFFICIENCY</Text>
                </View>
              </View>
            </View>

            {/* ==========================================
                📋 CORE BASELINE METRICS (API DATA)
                ========================================== */}
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionHeaderTitle}>
              📋 CORE BASELINE METRICS (7-DAY CONVERGENCE):
            </Text>

            {metrics ? (
              <View style={styles.metricsContainer}>
                {/* 1. BSE Score */}
                <View style={styles.metricRow}>
                  <View style={styles.metricRowTop}>
                    <Text style={styles.metricBullet}>•</Text>
                    <Text style={styles.metricName}>
                      BioSync Efficiency (
                      {mappedKeys?.rolling_7d_bse_score || 'BSE'})
                    </Text>
                    <Text style={styles.metricTarget}>
                      {bseScore ?? 'Not Available'}
                    </Text>
                  </View>
                  {bseDays !== null && (
                    <Text style={styles.metricSubInfo}>
                      Data Points Converged: {bseDays} Days
                    </Text>
                  )}
                  {bseScore !== null && (
                    <View style={styles.meterTrack}>
                      <View
                        style={[
                          styles.meterFill,
                          {
                            width: `${Math.min(
                              100,
                              (Number(bseScore) / 100) * 100,
                            )}%`,
                            backgroundColor: '#3b82f6',
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>

                {/* 2. Sedentary Index */}
                <View style={styles.metricRow}>
                  <View style={styles.metricRowTop}>
                    <Text style={styles.metricBullet}>•</Text>
                    <Text style={styles.metricName}>
                      Sedentary Index (
                      {mappedKeys?.rolling_7d_sdex_score || 'S-DEX'})
                    </Text>
                    <Text style={styles.metricTarget}>
                      {sdexScore ?? 'Not Available'}
                    </Text>
                  </View>
                  {sdexDays !== null && (
                    <Text style={styles.metricSubInfo}>
                      Data Points Converged: {sdexDays} Days
                    </Text>
                  )}
                  {sdexScore !== null && (
                    <View style={styles.meterTrack}>
                      <View
                        style={[
                          styles.meterFill,
                          {
                            width: `${Math.min(
                              100,
                              (Number(sdexScore) / 50) * 100,
                            )}%`,
                            backgroundColor: '#f59e0b',
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>

                {/* 3. Pulse-Pace (PPI) */}
                <View style={styles.metricRow}>
                  <View style={styles.metricRowTop}>
                    <Text style={styles.metricBullet}>•</Text>
                    <Text style={styles.metricName}>
                      Pulse-Pace Index ({mappedKeys?.rolling_7d_ppi || 'PPI'})
                    </Text>
                    <Text style={styles.metricTarget}>
                      {ppiScore ?? 'Not Available'}
                    </Text>
                  </View>
                  {ppiDays !== null && (
                    <Text style={styles.metricSubInfo}>
                      Data Points Converged: {ppiDays} Days
                    </Text>
                  )}
                  {ppiScore !== null && (
                    <View style={styles.meterTrack}>
                      <View
                        style={[
                          styles.meterFill,
                          {
                            width: `${Math.min(
                              100,
                              (Number(ppiScore) / 0.01) * 100,
                            )}%`,
                            backgroundColor: '#06b6d4',
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>

                {/* 4. Move Economy (E3 / EEKm) */}
                <View style={styles.metricRow}>
                  <View style={styles.metricRowTop}>
                    <Text style={styles.metricBullet}>•</Text>
                    <Text style={styles.metricName}>
                      Move Economy ({mappedKeys?.rolling_7d_e3 || 'EEKM'})
                    </Text>
                    <Text style={styles.metricTarget}>
                      {e3Score !== null ? `${e3Score} kcal` : 'Not Available'}
                    </Text>
                  </View>
                  {e3Days !== null && (
                    <Text style={styles.metricSubInfo}>
                      Data Points Converged: {e3Days} Days
                    </Text>
                  )}
                  {e3Score !== null && (
                    <View style={styles.meterTrack}>
                      <View
                        style={[
                          styles.meterFill,
                          {
                            width: `${Math.min(
                              100,
                              (Number(e3Score) / 5000) * 100,
                            )}%`,
                            backgroundColor: '#10b981',
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>

                {/* 5. Stamina (IS) */}
                <View style={styles.metricRow}>
                  <View style={styles.metricRowTop}>
                    <Text style={styles.metricBullet}>•</Text>
                    <Text style={styles.metricName}>
                      Interdaily Stamina ({mappedKeys?.rolling_7d_is || 'IS'})
                    </Text>
                    <Text style={styles.metricTarget}>
                      {isScore !== null ? `${isScore}%` : 'Not Available'}
                    </Text>
                  </View>
                  {isDays !== null && (
                    <Text style={styles.metricSubInfo}>
                      Data Points Converged: {isDays} Days
                    </Text>
                  )}
                  {isScore !== null && (
                    <View style={styles.meterTrack}>
                      <View
                        style={[
                          styles.meterFill,
                          {
                            width: `${Math.min(
                              100,
                              (Number(isScore) / 100) * 100,
                            )}%`,
                            backgroundColor: '#8b5cf6',
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>

                {/* 6. AHA Heart Points */}
                <View style={styles.metricRow}>
                  <View style={styles.metricRowTop}>
                    <Text style={styles.metricBullet}>•</Text>
                    <Text style={styles.metricName}>
                      AHA Heart Points (
                      {mappedKeys?.rolling_7d_aha_points || 'AHA'})
                    </Text>
                    <Text style={styles.metricTarget}>
                      {ahaScore !== null ? `${ahaScore} pts` : 'Not Available'}
                    </Text>
                  </View>
                  {ahaDays !== null && (
                    <Text style={styles.metricSubInfo}>
                      Data Points Converged: {ahaDays} Days
                    </Text>
                  )}
                  {ahaScore !== null && (
                    <View style={styles.meterTrack}>
                      <View
                        style={[
                          styles.meterFill,
                          {
                            width: `${Math.min(
                              100,
                              (Number(ahaScore) / 30) * 100,
                            )}%`,
                            backgroundColor: '#ef4444',
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <Text style={styles.notAvailableText}>Not Available</Text>
            )}

            {/* ==========================================
                🚀 FOUNDATIONAL CHECKLIST ACTIONS
                ========================================== */}
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionHeaderTitle}>
              🚀 FOUNDATIONAL CHECKLIST ACTIONS:
            </Text>

            {dynamicChecklist &&
            Array.isArray(dynamicChecklist) &&
            dynamicChecklist.length > 0 ? (
              <View style={styles.checklistContainer}>
                {dynamicChecklist.map((item: any, index: number) => (
                  <View key={item.id || index} style={styles.checklistItem}>
                    <Text style={styles.checklistTitle}>
                      {index + 1}. {item.title || item.name || 'Action Item'}
                    </Text>
                    {item.subtitle ? (
                      <Text style={styles.checklistSubtitle}>
                        {item.subtitle}
                      </Text>
                    ) : null}
                    {item.deepDive ? (
                      <Text style={styles.expandedRationaleText}>
                        {item.deepDive}
                      </Text>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyStateBox}>
                <Text style={styles.notAvailableText}>Not Available</Text>
              </View>
            )}

            {/* ==========================================
                🛑 BOUNDING SAFETY CEILINGS
                ========================================== */}
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionHeaderTitle}>
              🛑 BOUNDING SAFETY CEILINGS:
            </Text>

            {dynamicSafetyCeilings ? (
              <View style={styles.safetyBox}>
                {dynamicSafetyCeilings.heartRateLimit ? (
                  <View style={styles.safetyRow}>
                    <Text style={styles.safetyBullet}>•</Text>
                    <Text style={styles.safetyLabel}>
                      Heart Rate Limit Ceiling:
                    </Text>
                    <Text style={styles.safetyValue}>
                      {dynamicSafetyCeilings.heartRateLimit} BPM
                    </Text>
                  </View>
                ) : null}
                {dynamicSafetyCeilings.sittingMax ? (
                  <View style={styles.safetyRow}>
                    <Text style={styles.safetyBullet}>•</Text>
                    <Text style={styles.safetyLabel}>
                      Continuous Sitting Max:
                    </Text>
                    <Text style={styles.safetyValue}>
                      {dynamicSafetyCeilings.sittingMax} Mins
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : (
              <View style={styles.emptyStateBox}>
                <Text style={styles.notAvailableText}>Not Available</Text>
              </View>
            )}

            {/* ==========================================
                🔬 PHYSIOLOGICAL RATIONALE & CITATION
                ========================================== */}
            <View style={styles.sectionDivider} />
            <Text style={styles.sectionHeaderTitle}>
              🔬 PHYSIOLOGICAL RATIONALE & CITATION:
            </Text>

            {dynamicRationale ? (
              <View style={styles.rationaleBox}>
                <Text style={styles.rationaleParagraph}>
                  {dynamicRationale}
                </Text>
              </View>
            ) : (
              <View style={styles.emptyStateBox}>
                <Text style={styles.notAvailableText}>Not Available</Text>
              </View>
            )}
          </View>

          {/* Submit CTA Button */}
          <View style={styles.ctaContainer}>
            <CustomButton
              title="🏃‍♂️ GO TO WORKOUT LOGS"
              onPress={handleGoToWorkoutLogs}
              variant="primary"
              loading={accepting}
              disabled={accepting}
              style={styles.submitBtn}
              textStyle={styles.submitBtnText}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: 'relative',
  },
  headerContainer: {
    backgroundColor: 'transparent',
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  headerButton: {
    backgroundColor: theme.colors.surface,
  },
  headerIcon: {
    tintColor: theme.colors.text,
  },
  glowSpot1: {
    position: 'absolute',
    top: '5%',
    left: '-10%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.primaryLight + '20',
    zIndex: -1,
  },
  glowSpot2: {
    position: 'absolute',
    bottom: '20%',
    right: '-10%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.secondary + '05',
    zIndex: -1,
  },
  headerToggleWrapper: {
    paddingHorizontal: theme.spacing.containerPadding,
    marginBottom: theme.spacing.md,
    marginTop: 4,
  },
  toggleSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
  toggleBtnTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  scrollContent: {
    padding: theme.spacing.containerPadding,
    paddingBottom: theme.spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
  },
  archiveDropdownContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 14,
    padding: 12,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dropdownLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  dropdownButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: theme.colors.text,
  },
  dropdownArrow: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '800',
  },
  dropdownList: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  dropdownItemText: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '600',
  },
  dropdownItemTextActive: {
    color: theme.colors.primary,
    fontWeight: '800',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  prescriptionHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  prescriptionHeaderEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  prescriptionHeaderTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 0.5,
    flex: 1,
  },
  statusPill: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusPillProcessing: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 0.5,
    borderColor: '#f59e0b',
  },
  statusPillSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    borderWidth: 0.5,
    borderColor: '#22c55e',
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#d97706',
    letterSpacing: 0.5,
  },
  apiMessageBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#f59e0b',
  },
  apiMessageTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
    marginBottom: 2,
  },
  apiMessageText: {
    fontSize: 11,
    color: theme.colors.text,
    lineHeight: 15,
  },
  profileMetaBox: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    width: 95,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.text,
    flex: 1,
  },
  metaValueMono: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: theme.colors.text,
    flex: 1,
  },
  validityWindowBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    gap: 4,
  },
  validityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  validityTitleEmoji: {
    fontSize: 13,
    marginRight: 6,
  },
  validityTitleText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#d97706',
    letterSpacing: 0.8,
  },
  validityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  validityLabel: {
    fontSize: 10.5,
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
  validityValue: {
    fontSize: 10.5,
    color: theme.colors.text,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  validityValueMono: {
    fontSize: 9.5,
    fontFamily: 'monospace',
    color: theme.colors.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: 8,
  },
  adaptiveTargetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  targetHexagon: {
    width: 170,
    height: 95,
    backgroundColor: theme.colors.background,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  targetHexInner: {
    alignItems: 'center',
  },
  targetHexValue: {
    fontSize: 26,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  targetHexLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.textSecondary,
    letterSpacing: 0.8,
    marginTop: 2,
  },
  targetHexSub: {
    fontSize: 9.5,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.primary,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  metricsContainer: {
    gap: 8,
  },
  metricRow: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 9,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metricRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricBullet: {
    fontSize: 13,
    color: theme.colors.primary,
    marginRight: 6,
    fontWeight: '900',
  },
  metricName: {
    fontSize: 11,
    color: theme.colors.text,
    fontWeight: '700',
    flex: 1,
  },
  metricTarget: {
    fontSize: 11.5,
    fontWeight: '800',
    color: theme.colors.text,
  },
  metricSubInfo: {
    fontSize: 9.5,
    color: theme.colors.textSecondary,
    marginTop: 2,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  meterTrack: {
    height: 5,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 3,
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
  },
  checklistContainer: {
    gap: 8,
  },
  checklistItem: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  checklistTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
  },
  checklistSubtitle: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  expandedRationaleText: {
    fontSize: 10.5,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  safetyBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    gap: 4,
  },
  safetyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  safetyBullet: {
    fontSize: 13,
    color: '#ef4444',
    marginRight: 6,
    fontWeight: '900',
  },
  safetyLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  safetyValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#ef4444',
  },
  rationaleBox: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rationaleParagraph: {
    fontSize: 11,
    color: theme.colors.text,
    lineHeight: 16,
  },
  emptyStateBox: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notAvailableText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  ctaContainer: {
    marginTop: theme.spacing.lg,
  },
  submitBtn: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default PrescriptionScreen;
