import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
  Animated,
  TextInput,
  Platform,
  UIManager,
  LayoutAnimation,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DrawerContext from '../../navigation/DrawerContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';
import { CustomHeader } from '../../components/common/CustomHeader';
import { apiService } from '../../services/api';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile, Phase1LeaderboardResponse, Phase1LeaderboardItem } from '../../types';
import Svg, { Path } from 'react-native-svg';
import { IMAGES } from '../../assets/images';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Screen Dimensions
const { width } = Dimensions.get('window');

// SVG Components for vibrant card icons
const ActiveCrewSvg = ({ color }: { color: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
      fill={color}
    />
  </Svg>
);

const BenchmarkSvg = ({ color }: { color: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={color}
    />
  </Svg>
);

// Types & Data Architecture for 3-Phase Tournament
export type TournamentPhase = 1 | 2 | 3;

export interface TrackSubMetric {
  title: string;
  weight: string;
  value: string;
  percentageScore?: string;
  avgScore?: string;
  statusTag?: string;
  isDanger?: boolean;
}

export interface PhaseTrack {
  id: string;
  trackNumber: 1 | 2 | 3;
  name: string; // "Track 1: Behavioral Track", "Track 2: Physiological Track", "Track 3: Structural Track"
  shortName: string; // "Track 1: Behavioral", "Track 2: Physiological", "Track 3: Structural"
  icon: string; // "🧬", "💓", "🦴"
  weightLabel: string;
  overallStatus: string;
  statusColor?: string;
  subMetrics: TrackSubMetric[];
  clinicalInference: {
    title: string;
    text: string;
  };
}

export interface PhasePlayer {
  id: string;
  name: string;
  userId: string;
  department: string;
  isCurrentUser?: boolean;
  masterScore: number;
  scoreDisplay?: string;
  status: 'ACTIVE' | 'CHAMPION' | 'PODIUM' | 'IN DANGER';
  statusLabel?: string;
  isDanger?: boolean;
  breakdown?: {
    cmas?: number;
    bse?: number;
    ffs?: number;
  };
  matrixTitle: string;
  tracks: PhaseTrack[];
  middayQuestAlert?: string;
  calculationTimestamp?: string;
}

// 21 Days Metadata
export interface DayConfig {
  dayNumber: number;
  phase: TournamentPhase;
  title: string;
}

export const TOURNAMENT_DAYS: DayConfig[] = Array.from({ length: 21 }, (_, i) => {
  const day = i + 1;
  const phase: TournamentPhase = day <= 7 ? 1 : day <= 14 ? 2 : 3;
  return {
    dayNumber: day,
    phase,
    title: `Day ${day}`,
  };
});

// Phase Static Configurations
export const PHASE_CONFIGS: Record<
  TournamentPhase,
  {
    phaseNumber: number;
    title: string;
    focus: string;
    masterScoreKey: string;
    formulaLabel: string;
    axeLineCutRank: number;
    axeLineLabel: string;
    participantsCount: string;
    avgBenchmarkScore: string;
    benchmarkUnit: string;
  }
> = {
  1: {
    phaseNumber: 1,
    title: 'THE GAUNTLET: PHASE 1',
    focus: 'BEHAVIORAL FOUNDATION',
    masterScoreKey: 'CUMULATIVE CMAS / 100',
    formulaLabel: 'Master Sorting Key: Cumulative CMAS / 100 (1 Track Active)',
    axeLineCutRank: 2,
    axeLineLabel: '🩸 TOURNAMENT AXE LINE (ELIMINATION DANGER ZONE)',
    participantsCount: '104,210',
    avgBenchmarkScore: '68.4',
    benchmarkUnit: 'Avg CMAS',
  },
  2: {
    phaseNumber: 2,
    title: 'THE GAUNTLET: PHASE 2',
    focus: 'ELITE BIOMETRIC NEXUS',
    masterScoreKey: 'MASTER COMPOUND SCORE',
    formulaLabel: 'Master Key: 50/50 Compound (Behavioral + Physiological)',
    axeLineCutRank: 2,
    axeLineLabel: '🩸 TOURNAMENT AXE LINE (ELIMINATION DANGER ZONE)',
    participantsCount: '52,105',
    avgBenchmarkScore: '72.8',
    benchmarkUnit: 'Avg Compound',
  },
  3: {
    phaseNumber: 3,
    title: 'THE GAUNTLET: PHASE 3',
    focus: 'THE GRAND OLYMPUS CHAMPIONSHIP',
    masterScoreKey: 'MASTER CHAMPIONSHIP SCORE',
    formulaLabel: 'Master Key: 3-Axis Score (Behavioral + Physiological + Structural)',
    axeLineCutRank: 3,
    axeLineLabel: '🩸 CHAMPIONSHIP CUT (TOP 3 AWARD PODIUM ZONE)',
    participantsCount: '26,050',
    avgBenchmarkScore: '78.5',
    benchmarkUnit: 'Avg Championship',
  },
};

// ==========================================
// DYNAMIC API DATA MAPPER
// ==========================================

export const mapApiLeaderboardToPlayers = (
  apiItems: Phase1LeaderboardItem[] = [],
  currentUhid?: string,
  currentUserName?: string,
): PhasePlayer[] => {
  return apiItems.map((item, idx) => {
    const isCurrentUser =
      (currentUhid && item.USER_ID.toUpperCase() === currentUhid.toUpperCase()) ||
      item.USER_ID === 'ANJROY3773' ||
      apiItems.length === 1;

    const cmasScore = parseFloat(item.CUMULATIVE_CMAS_100) || 0;
    const rawStatus = (item.STATUS || '').toUpperCase();
    const isDanger = rawStatus.includes('ELIMINATED') || rawStatus.includes('DANGER');

    let status: 'ACTIVE' | 'CHAMPION' | 'PODIUM' | 'IN DANGER' = 'ACTIVE';
    if (isDanger) {
      status = 'IN DANGER';
    } else if (rawStatus.includes('CHAMPION')) {
      status = 'CHAMPION';
    } else if (rawStatus.includes('PODIUM')) {
      status = 'PODIUM';
    }

    const stepVolume = item.STEP_VOLUME_COMPLIANCE || 'N/A';
    const cardioIntensity = item.CARDIO_INTENSITY_COMPLIANCE || 'N/A';
    const sDexSeverity = item.SEDENTARY_SDEX_SEVERITY || 'N/A';

    const behavioralTrack: PhaseTrack = {
      id: `t-beh-${item.USER_ID}-${idx}`,
      trackNumber: 1,
      name: 'Track 1: Behavioral Track (Behavioral Foundation)',
      shortName: 'Track 1: Behavioral',
      icon: '🧬',
      weightLabel: '100% Phase 1 Master Key',
      overallStatus: isDanger ? 'CRITICAL DEFICIT' : 'OPTIMAL PACE',
      statusColor: isDanger ? '#EF4444' : '#10B981',
      subMetrics: [
        {
          title: 'Step Volume Compliance',
          weight: '40% Weight',
          value: stepVolume,
          statusTag: stepVolume.includes('0.0%') || stepVolume.includes('1.') ? 'DEFICIT' : 'OPTIMAL',
          isDanger: stepVolume.includes('0.0%') || stepVolume.includes('1.'),
        },
        {
          title: 'Cardio Intensity Compliance',
          weight: '40% Weight',
          value: cardioIntensity,
          statusTag: cardioIntensity.includes('0.0%') ? '🚨 ZERO CARDIO' : 'AEROBIC PEAK',
          isDanger: cardioIntensity.includes('0.0%'),
        },
        {
          title: 'Sedentary S-DEX Severity',
          weight: '20% Weight',
          value: sDexSeverity !== 'N/A' ? `${sDexSeverity} [MAX HAZARD]` : 'N/A',
          statusTag: sDexSeverity !== 'N/A' ? '🚨 >6H SITTING' : 'N/A',
          isDanger: true,
        },
      ],
      clinicalInference: {
        title: '3-Day Cumulative Behavioral Health Inference [AHA]',
        text: item.THREE_DAY_CUMULATIVE_BEHAVIORAL_HEALTH_INFERENCE || 'N/A',
      },
    };

    return {
      id: `p-${item.USER_ID}-${idx}`,
      name: isCurrentUser && currentUserName ? `${currentUserName} (You)` : item.USER_ID,
      userId: item.USER_ID,
      department: 'N/A',
      isCurrentUser,
      masterScore: cmasScore,
      scoreDisplay: `[ ${item.CUMULATIVE_CMAS_100 || 'N/A'} ]`,
      status,
      statusLabel: item.STATUS || 'N/A',
      isDanger,
      matrixTitle: 'BEHAVIORAL FOUNDATION MATRIX',
      tracks: [behavioralTrack],
      middayQuestAlert: item.MIDDAY_QUEST_ALERT || 'N/A',
      calculationTimestamp: item['6AM_CALCULATION_TIMESTAMP'] || 'N/A',
    };
  });
};

const parseSubMetric = (sm: TrackSubMetric) => {
  if (sm.percentageScore !== undefined && sm.avgScore !== undefined) {
    return { percentage: sm.percentageScore, avg: sm.avgScore };
  }
  const val = (sm.value || '').trim();

  // Pattern 1: "89.0% (Avg: 8,900 / 10,000 steps)" or "82.0% (Avg: 17.5 / 21.4 HP)" or "96.0% (Avg: 9,600 steps/day)"
  const parenMatch = val.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const rawAvg = parenMatch[2].trim();
    return {
      percentage: parenMatch[1].trim(),
      avg: rawAvg.toLowerCase().startsWith('avg') ? rawAvg : `Avg: ${rawAvg}`,
    };
  }

  // Pattern 2: "21.0 / 100 [LOW HAZARD]" or "100.0 / 100 [MAX HAZARD]" or "18.0 / 100 [LOW HAZARD]"
  const hazardMatch = val.match(/^(.*?)\s*(\[.*?\])$/);
  if (hazardMatch) {
    return {
      percentage: hazardMatch[1].trim(),
      avg: hazardMatch[2].trim(),
    };
  }

  // Pattern 3: "88.0% [⚡ OPTIMAL]" or "98.4% [🥇 ELITE ASCENSION]"
  const bracketMatch = val.match(/^(.*?)\s*\[(.*?)\]$/);
  if (bracketMatch) {
    return {
      percentage: bracketMatch[1].trim(),
      avg: `[${bracketMatch[2].trim()}]`,
    };
  }

  // Pattern 4: "Cardio: 94% | Muscle: 88.5% | Spine: 91% | Neuro: 85%"
  if (val.includes('|')) {
    return {
      percentage: '',
      avg: val,
    };
  }

  return {
    percentage: val,
    avg: '',
  };
};

export const LeaderboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const drawer = useContext(DrawerContext);
  const isDrawerOpen = drawer?.isOpen || false;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Day & Phase Selection State
  const [selectedDay, setSelectedDay] = useState<number>(7); // Default to Day 7 as returned by API
  const activePhase: TournamentPhase = selectedDay <= 7 ? 1 : selectedDay <= 14 ? 2 : 3;
  const activePhaseConfig = PHASE_CONFIGS[activePhase];

  // Dropdown Open State
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // User Profile & Leaderboard API Data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<Phase1LeaderboardResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Close dropdown when drawer opens to prevent overlapping
  useEffect(() => {
    if (isDrawerOpen) {
      setDropdownOpen(false);
    }
  }, [isDrawerOpen]);

  // Load user data & Phase 1 API leaderboard
  const loadData = async () => {
    try {
      setLoading(true);
      setApiError(null);

      let profileData: UserProfile | null = null;
      try {
        profileData = await apiService.getProfile();
        setUserProfile(profileData);
      } catch (err) {
        console.warn('Failed to load user profile in leaderboard:', err);
      }

      const cachedProfile = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      const targetUhid = profileData?.uhid || cachedProfile?.uhid || 'ANJROY3773';

      console.log(`[Leaderboard] Fetching Phase 1 Leaderboard for UHID: ${targetUhid}`);
      const data = await apiService.getPhase1Leaderboard(targetUhid);
      setLeaderboardData(data);

      if (data?.active_challenge_day) {
        setSelectedDay(data.active_challenge_day);
      }
    } catch (error: any) {
      console.error('Failed to load phase 1 leaderboard:', error);
      setApiError(error?.message || 'Failed to fetch leaderboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // Get players list for current active phase
  const getPhasePlayers = (): PhasePlayer[] => {
    // Phase 1: Dynamic Data mapped from Backend POST API
    if (activePhase === 1) {
      if (!leaderboardData || !Array.isArray(leaderboardData.leaderboard)) {
        return [];
      }
      return mapApiLeaderboardToPlayers(
        leaderboardData.leaderboard,
        userProfile?.uhid,
        userProfile?.name,
      );
    }

    // Phase 2 & 3: Not provided by backend yet -> Zero mock data
    return [];
  };

  const playersList = getPhasePlayers();

  // Filter players by Search Query
  const filteredPlayers = playersList.filter(player => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      player.userId.toLowerCase().includes(query) ||
      player.name.toLowerCase().includes(query) ||
      player.department.toLowerCase().includes(query)
    );
  });

  // Open Dedicated Details Screen
  const handleOpenPlayerDetails = (player: PhasePlayer) => {
    navigation.navigate(ROUTES.LEADERBOARD_DETAILS, {
      player,
      phase: activePhase,
      day: selectedDay,
    });
  };

  const themeColors = {
    containerBg: '#0B0F19',
    headerBg: '#0E1626',
    headerText: '#FFFFFF',
    headerBorder: '#1E293B',
    headerButtonBg: '#1E293B',
    headerButtonBorder: '#1E293B',
    headerButtonText: '#FFFFFF',
    textMain: '#FFFFFF',
    textSecondary: '#94A3B8',
    cardBg: '#151E33',
    cardBorder: '#1E293B',
    statBoxBg: '#0E1626',
    dropdownBg: '#151E33',
    dropdownBorder: '#1E293B',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.containerBg }]}>
      {/* Top Header */}
      <CustomHeader
        title="Leaderboard"
        showDrawerButton
        containerStyle={{
          backgroundColor: themeColors.headerBg,
          borderBottomColor: themeColors.headerBorder,
        }}
        titleStyle={{
          color: themeColors.headerText,
        }}
        buttonStyle={{
          backgroundColor: themeColors.headerButtonBg,
          borderColor: themeColors.headerButtonBorder,
        }}
        iconStyle={{
          color: themeColors.headerButtonText,
        }}
      />

      {/* Grouped Day / Phase Selector Dropdown */}
      <View style={[styles.dropdownWrapper, { zIndex: dropdownOpen ? 2000 : 1 }]}>
        <TouchableOpacity
          style={[
            styles.dropdownButton,
            {
              backgroundColor: themeColors.dropdownBg,
              borderColor: themeColors.dropdownBorder,
            },
          ]}
          onPress={() => setDropdownOpen(!dropdownOpen)}
          activeOpacity={0.9}
        >
          <View style={styles.dropdownSelectedRow}>
            <Text style={styles.dropdownPhaseBadge}>
              Phase {activePhaseConfig.phaseNumber}
            </Text>
            <Text style={[styles.dropdownButtonText, { color: themeColors.textMain }]}>
              Day {selectedDay} / 21 • {activePhaseConfig.focus}
            </Text>
          </View>
          <Text style={[styles.dropdownArrow, { color: themeColors.textSecondary }]}>
            {dropdownOpen ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {dropdownOpen && (
          <View
            style={[
              styles.dropdownMenu,
              {
                backgroundColor: themeColors.dropdownBg,
                borderColor: themeColors.dropdownBorder,
              },
            ]}
          >
            <ScrollView style={styles.dropdownScrollView} showsVerticalScrollIndicator={true}>
              {/* Phase 1 Group */}
              <View style={styles.phaseGroupContainer}>
                <View style={styles.phaseGroupHeader}>
                  <Text style={styles.phaseGroupIcon}>🌱</Text>
                  <View style={styles.phaseGroupHeaderTexts}>
                    <Text style={styles.phaseGroupTitle}>Phase 1: Days 1–7</Text>
                    <Text style={styles.phaseGroupSubtitle}>
                      Behavioral Foundation • Track: Behavioral
                    </Text>
                  </View>
                </View>
                <View style={styles.daysGrid}>
                  {TOURNAMENT_DAYS.filter(d => d.phase === 1).map(dayObj => {
                    const isSelected = selectedDay === dayObj.dayNumber;
                    return (
                      <TouchableOpacity
                        key={dayObj.dayNumber}
                        style={[
                          styles.dayPill,
                          isSelected && styles.dayPillActive,
                        ]}
                        onPress={() => {
                          setSelectedDay(dayObj.dayNumber);
                          setDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dayPillText,
                            isSelected && styles.dayPillTextActive,
                          ]}
                        >
                          Day {dayObj.dayNumber}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.phaseDivider} />

              {/* Phase 2 Group */}
              <View style={styles.phaseGroupContainer}>
                <View style={styles.phaseGroupHeader}>
                  <Text style={styles.phaseGroupIcon}>⚡</Text>
                  <View style={styles.phaseGroupHeaderTexts}>
                    <Text style={styles.phaseGroupTitle}>Phase 2: Days 8–14</Text>
                    <Text style={styles.phaseGroupSubtitle}>
                      Elite Biometric Nexus • Tracks: Behavioral + Physiological
                    </Text>
                  </View>
                </View>
                <View style={styles.daysGrid}>
                  {TOURNAMENT_DAYS.filter(d => d.phase === 2).map(dayObj => {
                    const isSelected = selectedDay === dayObj.dayNumber;
                    return (
                      <TouchableOpacity
                        key={dayObj.dayNumber}
                        style={[
                          styles.dayPill,
                          isSelected && styles.dayPillActive,
                        ]}
                        onPress={() => {
                          setSelectedDay(dayObj.dayNumber);
                          setDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dayPillText,
                            isSelected && styles.dayPillTextActive,
                          ]}
                        >
                          Day {dayObj.dayNumber}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.phaseDivider} />

              {/* Phase 3 Group */}
              <View style={styles.phaseGroupContainer}>
                <View style={styles.phaseGroupHeader}>
                  <Text style={styles.phaseGroupIcon}>👑</Text>
                  <View style={styles.phaseGroupHeaderTexts}>
                    <Text style={styles.phaseGroupTitle}>Phase 3: Days 15–21</Text>
                    <Text style={styles.phaseGroupSubtitle}>
                      The Grand Olympus • Tracks: Behavioral + Physiological + Structural
                    </Text>
                  </View>
                </View>
                <View style={styles.daysGrid}>
                  {TOURNAMENT_DAYS.filter(d => d.phase === 3).map(dayObj => {
                    const isSelected = selectedDay === dayObj.dayNumber;
                    return (
                      <TouchableOpacity
                        key={dayObj.dayNumber}
                        style={[
                          styles.dayPill,
                          isSelected && styles.dayPillActive,
                          isSelected && styles.dayPillActiveGold,
                        ]}
                        onPress={() => {
                          setSelectedDay(dayObj.dayNumber);
                          setDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dayPillText,
                            isSelected && styles.dayPillTextActive,
                          ]}
                        >
                          Day {dayObj.dayNumber}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
            colors={['#3B82F6']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Card with 2 Stat Boxes */}
        <View
          style={[
            styles.bannerCard,
            {
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.cardBorder,
            },
          ]}
        >
          <Image
            source={IMAGES.trialRunner}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.statsRow}>
            {/* Box 1: Active members count */}
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: themeColors.statBoxBg,
                  borderColor: themeColors.cardBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.statIconCircle,
                  { backgroundColor: 'rgba(20, 184, 166, 0.15)' },
                ]}
              >
                <ActiveCrewSvg color="#14B8A6" />
              </View>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                Active Crew
              </Text>
              <Text style={[styles.statLabelSub, { color: themeColors.textSecondary }]}>
                Participants
              </Text>
              <Text style={[styles.statValue, { color: themeColors.textMain }]}>
                {activePhase === 1 && leaderboardData?.participants !== undefined
                  ? String(leaderboardData.participants)
                  : 'N/A'}
              </Text>
            </View>

            {/* Box 2: Master Benchmark Metric */}
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: themeColors.statBoxBg,
                  borderColor: themeColors.cardBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.statIconCircle,
                  {
                    backgroundColor:
                      activePhase === 1
                        ? 'rgba(59, 130, 246, 0.15)'
                        : activePhase === 2
                        ? 'rgba(168, 85, 247, 0.15)'
                        : 'rgba(234, 179, 8, 0.15)',
                  },
                ]}
              >
                <BenchmarkSvg
                  color={
                    activePhase === 1
                      ? '#3B82F6'
                      : activePhase === 2
                      ? '#A855F7'
                      : '#EAB308'
                  }
                />
              </View>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                Benchmark
              </Text>
              <Text style={[styles.statLabelSub, { color: themeColors.textSecondary }]}>
                Avg Score
              </Text>
              <Text style={[styles.statValue, { color: themeColors.textMain }]}>
                N/A
              </Text>
            </View>
          </View>
        </View>

        {/* Tournament Phase Title Card */}
        <View style={styles.phaseHeaderCard}>
          <View style={styles.phaseHeaderTopRow}>
            <View style={styles.phasePill}>
              <Text style={styles.phasePillText}>PHASE {activePhaseConfig.phaseNumber}</Text>
            </View>
            <Text style={styles.phaseActiveDayText}>
              Active Day: {activePhase === 1 && leaderboardData?.active_challenge_day !== undefined ? `${leaderboardData.active_challenge_day}/7` : `${selectedDay}/21`}
            </Text>
          </View>
          <Text style={styles.phaseFocusTitle}>{activePhaseConfig.title}</Text>
          <Text style={styles.phaseFormulaText}>{activePhaseConfig.formulaLabel}</Text>
        </View>

        {/* Real-time Search Input Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search participant ID or department..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Section Table Header (Layer 1 Header) */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableColHeader, { width: 44 }]}>RANK</Text>
          <Text style={[styles.tableColHeader, { flex: 1, paddingLeft: 4 }]} numberOfLines={1}>
            PARTICIPANT
          </Text>
          <Text
            style={[styles.tableColHeader, { width: 95, textAlign: 'right', marginRight: 10 }]}
            numberOfLines={1}
          >
            {activePhase === 1 ? 'CMAS / 100' : activePhase === 2 ? 'COMPOUND' : 'CHAMPIONSHIP'}
          </Text>
          <Text style={[styles.tableColHeader, { width: 80, textAlign: 'right' }]}>STATUS</Text>
        </View>

        {/* Leaderboard Rows with Dynamic Data & Progressive Disclosure */}
        {activePhase !== 1 ? (
          <View style={styles.unavailableCard}>
            <Text style={styles.unavailableIcon}>🔒</Text>
            <Text style={styles.unavailableTitle}>
              Phase {activePhase} API Not Available (N/A)
            </Text>
            <Text style={styles.unavailableSub}>
              Currently only Phase 1 (Days 1–7) is supported by the leaderboard backend. Phase {activePhase} will unlock once backend data is available.
            </Text>
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.loadingText}>Fetching live Phase 1 Leaderboard...</Text>
          </View>
        ) : filteredPlayers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>No Participants Found</Text>
            <Text style={styles.emptySub}>
              {apiError ? `Error: ${apiError}` : 'No participants available for this search criteria.'}
            </Text>
            {apiError && (
              <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                <Text style={styles.retryButtonText}>Retry ⟳</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredPlayers.map((player, index) => {
            const rankNumber = index + 1;
            const isUser = !!player.isCurrentUser;
            const isDanger = !!player.isDanger || player.status === 'IN DANGER';

            // Check if we need to render the Axe Line after this row
            const isAxeLineAfterThisRow = rankNumber === activePhaseConfig.axeLineCutRank;

            return (
              <React.Fragment key={player.id}>
                {/* Layer 1: Viewport Grid Row */}
                <TouchableOpacity
                  style={[
                    styles.playerRowCard,
                    isUser && styles.userRowHighlight,
                    isDanger && styles.dangerRowHighlight,
                  ]}
                  onPress={() => handleOpenPlayerDetails(player)}
                  activeOpacity={0.75}
                >
                  <View style={styles.rowMain}>
                    {/* Rank Badge */}
                    <View
                      style={[
                        styles.rankBadge,
                        rankNumber === 1 && styles.rankBadgeFirst,
                        rankNumber === 2 && styles.rankBadgeSecond,
                        rankNumber === 3 && styles.rankBadgeThird,
                        isDanger && styles.rankBadgeDanger,
                      ]}
                    >
                      <Text
                        style={[
                          styles.rankBadgeText,
                          rankNumber === 1 && styles.rankTextFirst,
                          isDanger && styles.rankTextDanger,
                        ]}
                      >
                        {rankNumber === 1 ? '🥇' : rankNumber === 2 ? '🥈' : rankNumber === 3 ? '🥉' : `#${rankNumber}`}
                      </Text>
                    </View>

                    {/* User ID & Department */}
                    <View style={styles.userCol}>
                      <View style={styles.userIdRow}>
                        <Text
                          style={[
                            styles.userIdText,
                            isUser && styles.userIdUserText,
                            isDanger && styles.userIdDangerText,
                          ]}
                          numberOfLines={1}
                        >
                          {player.userId}
                        </Text>
                        {isUser && (
                          <View style={styles.youBadge}>
                            <Text style={styles.youBadgeText}>YOU</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.deptText} numberOfLines={1}>
                        Dept: {player.department}
                      </Text>
                    </View>

                    {/* Master Score */}
                    <View style={styles.scoreCol}>
                      {isDanger ? (
                        <View style={styles.dangerScoreBlock}>
                          <Text style={styles.dangerScoreText}>
                            {player.scoreDisplay || `[ ${player.masterScore.toFixed(1)} ]`}
                          </Text>
                        </View>
                      ) : (
                        <Text
                          style={[
                            styles.masterScoreText,
                            rankNumber === 1 && styles.masterScoreFirst,
                          ]}
                        >
                          {player.masterScore.toFixed(1)}
                        </Text>
                      )}
                    </View>

                    {/* Status Pill */}
                    <View style={styles.statusCol}>
                      <View
                        style={[
                          styles.statusPill,
                          player.status === 'ACTIVE' && styles.statusPillActive,
                          player.status === 'CHAMPION' && styles.statusPillChampion,
                          player.status === 'PODIUM' && styles.statusPillPodium,
                          isDanger && styles.statusPillDanger,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusPillText,
                            player.status === 'ACTIVE' && styles.statusTextActive,
                            player.status === 'CHAMPION' && styles.statusTextChampion,
                            player.status === 'PODIUM' && styles.statusTextPodium,
                            isDanger && styles.statusTextDanger,
                          ]}
                        >
                          {player.statusLabel || (isDanger ? '🚨 IN DANGER' : player.status)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Direct Action Indicator */}
                  <View style={styles.expandChevronRow}>
                    <View style={styles.userExpandPrompt}>
                      <Text style={styles.userExpandChevronText}>
                        📊 Tap to view personalized biometric details ➔
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* High-Stakes Neon Axe Line */}
                {isAxeLineAfterThisRow && (
                  <View style={styles.axeLineContainer}>
                    <View style={styles.axeLineBar} />
                    <View style={styles.axeLineBadge}>
                      <Text style={styles.axeLineText}>
                        {activePhaseConfig.axeLineLabel}
                      </Text>
                    </View>
                    <View style={styles.axeLineBar} />
                  </View>
                )}
              </React.Fragment>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  dropdownWrapper: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  dropdownButton: {
    height: 52,
    backgroundColor: '#151E33',
    borderColor: '#1E293B',
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  dropdownSelectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  dropdownPhaseBadge: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  dropdownButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 6,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    maxHeight: 380,
    backgroundColor: '#151E33',
    borderColor: '#1E293B',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  dropdownScrollView: {
    padding: 12,
  },
  phaseGroupContainer: {
    marginVertical: 4,
  },
  phaseGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  phaseGroupIcon: {
    fontSize: 18,
  },
  phaseGroupHeaderTexts: {
    flex: 1,
  },
  phaseGroupTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  phaseGroupSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginLeft: 26,
  },
  dayPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#0E1626',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  dayPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  dayPillActiveGold: {
    backgroundColor: '#D97706',
    borderColor: '#F59E0B',
  },
  dayPillText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  dayPillTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  phaseDivider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 60,
  },
  bannerCard: {
    backgroundColor: '#151E33',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    marginBottom: 16,
  },
  bannerImage: {
    width: '100%',
    height: 140,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0E1626',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statLabelSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: -2,
  },
  statValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  phaseHeaderCard: {
    backgroundColor: '#151F38',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A3C63',
    borderLeftWidth: 4,
    borderLeftColor: '#38BDF8',
    marginBottom: 14,
  },
  phaseHeaderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  phasePill: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  phasePillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  phaseActiveDayText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  phaseFocusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  phaseFormulaText: {
    fontSize: 11,
    color: '#FBBF24',
    marginTop: 3,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151E33',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  searchClear: {
    fontSize: 14,
    color: '#94A3B8',
    padding: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 6,
  },
  tableColHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  playerRowCard: {
    backgroundColor: '#151E33',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
    overflow: 'hidden',
  },
  userRowHighlight: {
    borderColor: '#14B8A6',
    borderWidth: 1.5,
    backgroundColor: 'rgba(20, 184, 166, 0.05)',
  },
  dangerRowHighlight: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  expandedRowBorder: {
    borderColor: '#38BDF8',
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankBadgeFirst: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
  },
  rankBadgeSecond: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  rankBadgeThird: {
    backgroundColor: 'rgba(180, 83, 9, 0.2)',
  },
  rankBadgeDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rankTextFirst: {
    color: '#FACC15',
  },
  rankTextDanger: {
    color: '#EF4444',
  },
  userCol: {
    flex: 1,
  },
  userIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userIdText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userIdUserText: {
    color: '#14B8A6',
  },
  userIdDangerText: {
    color: '#FCA5A5',
  },
  youBadge: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  youBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#090D16',
  },
  deptText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  scoreCol: {
    width: 80,
    alignItems: 'flex-end',
    marginRight: 8,
  },
  masterScoreText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#34D399',
  },
  masterScoreFirst: {
    color: '#FACC15',
  },
  dangerScoreBlock: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  dangerScoreText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  statusCol: {
    width: 85,
    alignItems: 'flex-end',
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  statusPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusPillChampion: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
  },
  statusPillPodium: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  statusPillDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 0.5,
    borderColor: '#EF4444',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  statusTextActive: {
    color: '#34D399',
  },
  statusTextChampion: {
    color: '#FACC15',
  },
  statusTextPodium: {
    color: '#38BDF8',
  },
  statusTextDanger: {
    color: '#EF4444',
  },
  expandChevronRow: {
    alignItems: 'center',
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  userExpandPrompt: {
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    width: '100%',
    alignItems: 'center',
  },
  userExpandChevronText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#14B8A6',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  lockedRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },
  lockedRowText: {
    fontSize: 9,
    color: '#64748B',
    fontStyle: 'italic',
  },
  drawerContainer: {
    backgroundColor: '#0E1626',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    padding: 12,
  },
  drawerMatrixTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#38BDF8',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  breakdownBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  breakdownChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151E33',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 4,
  },
  breakdownChipLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  breakdownChipVal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tracksTabBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  trackTabBtn: {
    flex: 1,
    backgroundColor: '#151E33',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackTabBtnSelected: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8',
    borderWidth: 1.5,
  },
  trackTabBtnDanger: {
    borderColor: '#EF4444',
  },
  trackTabBtnText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
  },
  trackTabBtnTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  layer3SubTray: {
    backgroundColor: '#151E33',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  layer3SubTrayDanger: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: '#1C1521',
  },
  trackHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  trackNameCol: {
    flex: 1,
    marginRight: 8,
  },
  trackNameTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trackWeightText: {
    fontSize: 9,
    color: '#FBBF24',
    marginTop: 1,
  },
  trackStatusTag: {
    backgroundColor: '#0E1626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  trackStatusTagDanger: {
    borderColor: '#EF4444',
  },
  trackStatusTagText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  subMetricsContainer: {
    marginTop: 4,
    marginBottom: 8,
    gap: 6,
  },
  subMetricCard: {
    backgroundColor: '#0E1626',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  subMetricTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subMetricTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  subMetricTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subMetricWeight: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  subMetricPercentageScore: {
    fontSize: 13,
    fontWeight: '800',
    color: '#34D399',
    textAlign: 'right',
  },
  subMetricCenterRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  subMetricAvgScore: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  subMetricValueDanger: {
    color: '#EF4444',
  },
  clinicalInferenceCard: {
    marginTop: 6,
    backgroundColor: '#0E1626',
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  clinicalInferenceCardDanger: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#20121A',
  },
  clinicalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  clinicalIcon: {
    fontSize: 11,
  },
  clinicalTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  clinicalText: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
    lineHeight: 14,
  },
  axeLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  axeLineContainerGold: {
    marginVertical: 12,
  },
  axeLineBar: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#EF4444',
  },
  axeLineBarGold: {
    backgroundColor: '#F59E0B',
  },
  axeLineBadge: {
    backgroundColor: '#2B1115',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  axeLineBadgeGold: {
    backgroundColor: '#2E2211',
    borderColor: '#F59E0B',
  },
  axeLineText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  axeLineTextGold: {
    color: '#F59E0B',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999,
  },
  floatingButtonEmoji: {
    fontSize: 13,
    marginRight: 6,
  },
  floatingButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 16, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: width * 0.85,
    backgroundColor: '#151E33',
    borderColor: '#1E293B',
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    position: 'relative',
  },
  celebrationCard: {
    borderColor: '#FACC15',
    borderWidth: 2,
    shadowColor: '#FACC15',
    shadowOpacity: 0.25,
  },
  burstCenter: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    width: 1,
    height: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FACC15',
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  trophyIcon: {
    fontSize: 44,
    marginBottom: 10,
  },
  crownIcon: {
    fontSize: 52,
    marginBottom: 10,
  },
  rankUpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    letterSpacing: 1,
  },
  celebrationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FACC15',
    letterSpacing: 1,
    textAlign: 'center',
  },
  rankUpMetric: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  celebrationSubtitle: {
    fontSize: 11,
    color: '#A7F3D0',
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  rankPill: {
    backgroundColor: '#0E1626',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  rankPillNew: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
  },
  rankPillOld: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  rankPillNewText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  comparisonArrow: {
    fontSize: 15,
    color: '#64748B',
  },
  rankUpMessage: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  celebrationMessage: {
    fontSize: 14,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  celebrationButton: {
    backgroundColor: '#EAB308',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  celebrationButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#090D16',
  },
  modalMotivateContainer: {
    backgroundColor: '#1E1B4B',
    borderColor: '#3730A3',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  modalMotivateText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FBBF24',
    textAlign: 'center',
    lineHeight: 15,
  },
  boldWhiteText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  unavailableCard: {
    backgroundColor: '#151E33',
    borderColor: '#1E293B',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 20,
    alignItems: 'center',
  },
  unavailableIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  unavailableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
  },
  unavailableSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '500',
  },
  emptyContainer: {
    backgroundColor: '#151E33',
    borderColor: '#1E293B',
    borderWidth: 1,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 20,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 12,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 14,
  },
  retryButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export { LeaderboardDetailsScreen } from './LeaderboardDetailsScreen';
export default LeaderboardScreen;

