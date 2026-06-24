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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DrawerContext from '../../navigation/DrawerContext';
import { useFocusEffect } from '@react-navigation/native';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { CustomHeader } from '../../components/common/CustomHeader';
import { apiService } from '../../services/api';
import { UserProfile, Activity } from '../../types';
import { WELLNESS_ACTIVITIES_REGISTRY } from '../../constants/activityTypes';
import Svg, { Path } from 'react-native-svg';
import { IMAGES } from '../../assets/images';

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

const StepsSvg = ({ color }: { color: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path
      d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 21.5h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.7 11.7 16.5 13 18.5 13v-2c-1.7 0-3.1-1-3.9-2.4l-.8-1.4c-.4-.7-1.1-1.2-2-1.2-.3 0-.6.1-.9.2L6 8.3V13h2V9.3l1.8-.4"
      fill={color}
    />
  </Svg>
);

const HeartPointsSvg = ({ color }: { color: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill={color}
    />
  </Svg>
);

const BioSyncSvg = ({ color }: { color: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"
      fill={color}
    />
  </Svg>
);

const VitalitySvg = ({ color }: { color: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 2v11h3v9l7-12h-4l4-8H7z"
      fill={color}
    />
  </Svg>
);

// 1. Types & Interfaces
interface LeaderboardPlayer {
  id: string;
  name: string;
  department: string;
  isCurrentUser?: boolean;
  avatarUrl?: string;
  steps: number;
  heartPoints: number;
  bioSync: number;
  vitality: number;
}

type MetricType = 'Steps' | 'Heart Points' | 'Bio sync Efficiency' | 'Vitality';

// 2. Static Mock Players List
const MOCK_PLAYERS: Omit<LeaderboardPlayer, 'isCurrentUser'>[] = [
  {
    id: 'mock-anshul',
    name: 'ANSHUL BAFNA',
    department: 'Development',
    steps: 6830,
    heartPoints: 68,
    bioSync: 92,
    vitality: 88,
  },
  {
    id: 'mock-pratik',
    name: 'PRATIK SONI',
    department: 'Acct. & Fin.',
    steps: 6528,
    heartPoints: 65,
    bioSync: 90,
    vitality: 85,
  },
  {
    id: 'mock-nirali',
    name: 'Nirali Barot',
    department: 'Hr and Admin',
    steps: 5236,
    heartPoints: 52,
    bioSync: 86,
    vitality: 78,
  },
  {
    id: 'mock-shiji',
    name: 'SHIJI BIJU',
    department: 'Marketing',
    steps: 4853,
    heartPoints: 48,
    bioSync: 84,
    vitality: 74,
  },
  {
    id: 'mock-mahezabin',
    name: 'Mahezabin Raval',
    department: 'HR & Admin',
    steps: 3958,
    heartPoints: 39,
    bioSync: 81,
    vitality: 68,
  },
  {
    id: 'mock-ganesan',
    name: 'Ganesan Ganesan',
    department: 'Maintenance',
    steps: 3925,
    heartPoints: 38,
    bioSync: 78,
    vitality: 65,
  },
  {
    id: 'mock-swapnil',
    name: 'Swapnil Shah',
    department: 'Development',
    steps: 1167,
    heartPoints: 11,
    bioSync: 72,
    vitality: 52,
  },
  {
    id: 'mock-deepak',
    name: 'Deepak Lohar',
    department: 'Development',
    steps: 105,
    heartPoints: 5,
    bioSync: 65,
    vitality: 40,
  },
  {
    id: 'mock-priya',
    name: 'Priya Sharma',
    department: 'Sales',
    steps: 95,
    heartPoints: 3,
    bioSync: 60,
    vitality: 35,
  },
];

// Animated Gold Particle for Rank Up Celebration Modals
const GoldParticle: React.FC<{ delay: number }> = ({ delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Generate random direction angle and distance
    const angle = Math.random() * 2 * Math.PI;
    const distance = 30 + Math.random() * 90; // Distance to travel
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.4 + Math.random() * 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: destX,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: destY,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, scale, translateX, translateY, opacity]);

  return (
    <Animated.View
      style={[
        styles.goldParticle,
        {
          transform: [
            { translateX },
            { translateY },
            { scale },
          ],
          opacity,
        },
      ]}
    />
  );
};

export const LeaderboardScreen: React.FC = () => {
  const drawer = useContext(DrawerContext);
  const isDrawerOpen = drawer?.isOpen || false;
  const [loading, setLoading] = useState(true);

  // Modals visible and data states
  const [rankUpVisible, setRankUpVisible] = useState(false);
  const [rankUpData, setRankUpData] = useState({ oldRank: 8, newRank: 7, aheadOfName: '', nextRankTargetText: '' });
  
  const [refreshing, setRefreshing] = useState(false);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [celebrationData, setCelebrationData] = useState({ metricValue: '0', passedName: '' });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userActivities, setUserActivities] = useState<Activity[]>([]);

  // State for metric dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricType>('Steps');

  // State for interactive podium
  const [selectedPodiumIndex, setSelectedPodiumIndex] = useState(0);

  // Persisted rank monitoring states
  const [persistedRanks, setPersistedRanks] = useState<Record<MetricType, number | null>>({
    'Steps': null,
    'Heart Points': null,
    'Bio sync Efficiency': null,
    'Vitality': null,
  });
  const hasLoadedRanksRef = useRef(false);

  // Close dropdown when drawer opens to prevent overlapping
  useEffect(() => {
    if (isDrawerOpen) {
      setDropdownOpen(false);
    }
  }, [isDrawerOpen]);

  // Load profile, activities, and persisted ranks
  const loadData = async () => {
    try {
      const [profileData, activitiesData, storedRanks] = await Promise.all([
        apiService.getProfile(),
        apiService.getActivities(),
        storageHelper.getItem<Record<MetricType, number | null>>(STORAGE_KEYS.LEADERBOARD_LAST_RANKS),
      ]);
      setUserProfile(profileData);
      setUserActivities(activitiesData);
      if (storedRanks) {
        setPersistedRanks(storedRanks);
      }
      hasLoadedRanksRef.current = true;
    } catch (error) {
      console.error('Failed to load user profile or activities in leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Re-fetch data on screen focus to ensure dynamic updates
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // 3. Dynamic User Metric Calculations (Filtered to Today only to match Dashboard)
  const getDynamicUserMetrics = () => {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).getTime();

    // Filter to today's logged activities only
    const todayActivities = userActivities.filter(act => {
      const timestamp = new Date(act.timestamp).getTime();
      return timestamp >= startOfToday;
    });

    // A. Steps: Fully dynamic today's steps (0 baseline)
    const loggedSteps = todayActivities
      .filter(act => act.type === 'Walking' || act.metric === 'steps')
      .reduce((sum, act) => sum + (act.value || 0), 0);
    const totalSteps = loggedSteps;

    // B. Heart Points: Dynamic HP from today's activities (0 baseline)
    const loggedHP = todayActivities.reduce((sum, act) => {
      const registryItem = WELLNESS_ACTIVITIES_REGISTRY.find(
        r => r.name.toLowerCase() === act.type.toLowerCase()
      );
      const met = registryItem ? registryItem.baseMET : 4.0;
      const hp = act.durationMinutes * met * 0.1; // scaled daily HP
      return sum + hp;
    }, 0);
    const totalHP = Math.round(loggedHP);

    // C. Bio Sync Efficiency: Baseline 60% + 5% per activity + calorie bonus
    const baseBioSync = 60;
    const loggedBioSyncCount = todayActivities.length * 5;
    const calorieBurnSum = todayActivities.reduce((sum, act) => sum + (act.caloriesBurned || 0), 0);
    const calorieBonus = Math.floor(calorieBurnSum / 200);
    const totalBioSync = Math.min(98, baseBioSync + loggedBioSyncCount + calorieBonus);

    // D. Vitality: Baseline 50 + 5 per activity + calorie bonus
    const baseVitality = 50;
    const loggedVitalityScore = todayActivities.length * 5;
    const vitalityCalorieBonus = Math.floor(calorieBurnSum / 200);
    const totalVitality = Math.min(99, baseVitality + loggedVitalityScore + vitalityCalorieBonus);

    return {
      steps: totalSteps,
      heartPoints: totalHP,
      bioSync: totalBioSync,
      vitality: totalVitality,
    };
  };

  const userMetrics = getDynamicUserMetrics();

  // Create current user player object
  const currentUserPlayer: LeaderboardPlayer = {
    id: 'current-user',
    name: userProfile?.name ? `${userProfile.name} (You)` : 'You',
    department: 'Engineering',
    isCurrentUser: true,
    steps: userMetrics.steps,
    heartPoints: userMetrics.heartPoints,
    bioSync: userMetrics.bioSync,
    vitality: userMetrics.vitality,
  };

  // Combine and sort players
  const allPlayers: LeaderboardPlayer[] = [currentUserPlayer, ...MOCK_PLAYERS];

  const getSortedPlayers = (): LeaderboardPlayer[] => {
    return [...allPlayers].sort((a, b) => {
      if (selectedMetric === 'Steps') return b.steps - a.steps;
      if (selectedMetric === 'Heart Points') return b.heartPoints - a.heartPoints;
      if (selectedMetric === 'Bio sync Efficiency') return b.bioSync - a.bioSync;
      return b.vitality - a.vitality;
    });
  };

  const sortedPlayers = getSortedPlayers().map((player, index) => ({
    ...player,
    rank: index + 1,
  }));

  // Top 10 players to show
  const top10Players = sortedPlayers.slice(0, 10);

  // Calculate sum of top 10 metrics for the stats box
  const getMetricTotalValue = () => {
    if (selectedMetric === 'Steps') {
      const sum = top10Players.reduce((acc, p) => acc + p.steps, 0);
      return sum.toLocaleString();
    }
    if (selectedMetric === 'Heart Points') {
      const sum = top10Players.reduce((acc, p) => acc + p.heartPoints, 0);
      return sum.toLocaleString();
    }
    if (selectedMetric === 'Bio sync Efficiency') {
      const avg = Math.round(top10Players.reduce((acc, p) => acc + p.bioSync, 0) / top10Players.length);
      return `${avg}%`;
    }
    const avg = Math.round(top10Players.reduce((acc, p) => acc + p.vitality, 0) / top10Players.length);
    return avg.toString();
  };

  const getMetricIcon = (metric: MetricType) => {
    switch (metric) {
      case 'Steps':
        return '👣';
      case 'Heart Points':
        return '❤️';
      case 'Bio sync Efficiency':
        return '🔄';
      case 'Vitality':
        return '⚡';
    }
  };

  const getMetricLabel = (metric: MetricType) => {
    switch (metric) {
      case 'Steps':
        return 'Total Steps';
      case 'Heart Points':
        return 'Total Heart Points';
      case 'Bio sync Efficiency':
        return 'Avg Bio Sync';
      case 'Vitality':
        return 'Avg Vitality';
    }
  };

  const getMetricBgColor = (metric: MetricType) => {
    switch (metric) {
      case 'Steps':
        return 'rgba(59, 130, 246, 0.15)'; // Blue tint
      case 'Heart Points':
        return 'rgba(239, 68, 68, 0.15)'; // Red tint
      case 'Bio sync Efficiency':
        return 'rgba(168, 85, 247, 0.15)'; // Purple tint
      case 'Vitality':
        return 'rgba(234, 179, 8, 0.15)'; // Gold/Yellow tint
    }
  };

  const getMetricSvgIcon = (metric: MetricType) => {
    switch (metric) {
      case 'Steps':
        return <StepsSvg color="#3B82F6" />;
      case 'Heart Points':
        return <HeartPointsSvg color="#EF4444" />;
      case 'Bio sync Efficiency':
        return <BioSyncSvg color="#A855F7" />;
      case 'Vitality':
        return <VitalitySvg color="#EAB308" />;
    }
  };

  const getPlayerMetricString = useCallback((player: LeaderboardPlayer) => {
    switch (selectedMetric) {
      case 'Steps':
        return player.steps.toLocaleString();
      case 'Heart Points':
        return player.heartPoints.toLocaleString();
      case 'Bio sync Efficiency':
        return `${player.bioSync}%`;
      case 'Vitality':
        return player.vitality.toString();
    }
  }, [selectedMetric]);

  // Hook up rank-up check listener
  useEffect(() => {
    if (loading || !hasLoadedRanksRef.current || sortedPlayers.length === 0) return;

    const userPlayer = sortedPlayers.find(p => p.isCurrentUser);
    if (!userPlayer) return;

    const currentRank = userPlayer.rank;
    const oldRank = persistedRanks[selectedMetric];

    // Only compare and show animation if we already had a stored rank for this metric
    if (oldRank !== null && oldRank !== undefined) {
      if (currentRank < oldRank) {
        // User ranked up! (Rank number decreased)
        const passedPlayer = sortedPlayers.find(p => p.rank === currentRank + 1);
        const passedName = passedPlayer ? passedPlayer.name.replace(' (You)', '') : 'competitors';

        // Calculate next rank target steps/points dynamically for the modal
        const nextPlayer = sortedPlayers.find(p => p.rank === currentRank - 1);
        let targetText = '';
        if (nextPlayer) {
          let diff = 0;
          let u = 'steps';
          if (selectedMetric === 'Steps') {
            diff = nextPlayer.steps - userPlayer.steps;
            u = 'steps';
          } else if (selectedMetric === 'Heart Points') {
            diff = nextPlayer.heartPoints - userPlayer.heartPoints;
            u = 'Heart Points';
          } else if (selectedMetric === 'Bio sync Efficiency') {
            diff = nextPlayer.bioSync - userPlayer.bioSync;
            u = '% Bio Sync';
          } else {
            diff = nextPlayer.vitality - userPlayer.vitality;
            u = 'Vitality points';
          }
          const toBeat = diff + 1;
          const nextPlayerName = nextPlayer.name.replace(' (You)', '');
          targetText = `🔥 You need only ${toBeat.toLocaleString()} ${u} more to beat ${nextPlayerName} (Rank #${nextPlayer.rank})!`;
        }

        if (currentRank === 1) {
          // Reached Rank #1 Celebration!
          setCelebrationData({
            metricValue: getPlayerMetricString(userPlayer),
            passedName: passedName,
          });
          setCelebrationVisible(true);
        } else {
          // Standard Rank Up popup is shown for other ranks
          setRankUpData({
            oldRank: oldRank,
            newRank: currentRank,
            aheadOfName: passedName,
            nextRankTargetText: targetText,
          });
          setRankUpVisible(true);
        }
      }
    }

    // Save current rank to persisted memory if it has changed
    if (oldRank !== currentRank) {
      const updated = { ...persistedRanks, [selectedMetric]: currentRank };
      setPersistedRanks(updated);
      storageHelper.setItem(STORAGE_KEYS.LEADERBOARD_LAST_RANKS, updated);
    }
  }, [sortedPlayers, selectedMetric, loading, persistedRanks, getPlayerMetricString]);

  const handleSimulateRankUp = () => {
    const userPlayer = sortedPlayers.find(p => p.isCurrentUser);
    const currentRank = userPlayer ? userPlayer.rank : 8;

    // Simulate achieving the user's current rank from the rank below it.
    // If they are Rank 1, simulate Rank 2 ➔ Rank 1 to trigger the Celebration Modal.
    // If they are Rank > 1 (e.g. 2), simulate Rank 3 ➔ Rank 2 to trigger the standard modal showing what is needed to beat Rank 1.
    const newRank = currentRank;
    const oldRank = currentRank === 1 ? 2 : currentRank + 1;
    const passedPlayer = sortedPlayers.find(p => p.rank === oldRank);
    const passedName = passedPlayer ? passedPlayer.name.replace(' (You)', '') : 'competitors';

    if (newRank === 1) {
      setCelebrationData({
        metricValue: userPlayer ? getPlayerMetricString(userPlayer) : (selectedMetric === 'Steps' ? '10,000' : '100'),
        passedName: passedName,
      });
      setCelebrationVisible(true);
    } else {
      // Find next competitor ahead of the simulated rank (i.e. newRank - 1)
      const nextPlayer = sortedPlayers.find(p => p.rank === newRank - 1);
      let targetText = '';
      if (nextPlayer) {
        let u = 'steps';
        let diff = 0;
        if (selectedMetric === 'Steps') {
          diff = Math.max(120, nextPlayer.steps - (userPlayer ? userPlayer.steps : 0));
          u = 'steps';
        } else if (selectedMetric === 'Heart Points') {
          diff = Math.max(2, nextPlayer.heartPoints - (userPlayer ? userPlayer.heartPoints : 0));
          u = 'Heart Points';
        } else if (selectedMetric === 'Bio sync Efficiency') {
          diff = Math.max(1, nextPlayer.bioSync - (userPlayer ? userPlayer.bioSync : 0));
          u = '% Bio Sync';
        } else {
          diff = Math.max(1, nextPlayer.vitality - (userPlayer ? userPlayer.vitality : 0));
          u = 'Vitality points';
        }
        const toBeat = diff + 1;
        const nextPlayerName = nextPlayer.name.replace(' (You)', '');
        targetText = `🔥 You need only ${toBeat.toLocaleString()} ${u} more to beat ${nextPlayerName} (Rank #${nextPlayer.rank})!`;
      }

      setRankUpData({
        oldRank,
        newRank,
        aheadOfName: passedName,
        nextRankTargetText: targetText,
      });
      setRankUpVisible(true);
    }
  };

  const getProgressWidth = (player: LeaderboardPlayer) => {
    const val =
      selectedMetric === 'Steps'
        ? player.steps
        : selectedMetric === 'Heart Points'
        ? player.heartPoints
        : selectedMetric === 'Bio sync Efficiency'
        ? player.bioSync
        : player.vitality;
    
    const target = selectedMetric === 'Steps' ? 10000 : 100;
    const percentage = Math.min(100, (val / target) * 100);
    return `${Math.max(8, percentage)}%`; // Min width of 8% for visibility
  };

  // Top 3 for Podium
  const top3Podium = top10Players.slice(0, 3);
  const selectedPodiumPlayer = top3Podium[selectedPodiumIndex];

  const getPodiumInspectionText = () => {
    if (!selectedPodiumPlayer) return '';
    const name = selectedPodiumPlayer.name.replace(' (You)', '');
    const value = getPlayerMetricString(selectedPodiumPlayer);
    
    switch (selectedMetric) {
      case 'Steps':
        return `${name} is ${selectedPodiumIndex === 0 ? 'leading the crew' : selectedPodiumIndex === 1 ? 'in second place' : 'in third place'} with ${value} steps.`;
      case 'Heart Points':
        return `${name} has reached ${selectedPodiumIndex === 0 ? 'first place' : selectedPodiumIndex === 1 ? 'second place' : 'third place'} with ${value} Heart Points.`;
      case 'Bio sync Efficiency':
        return `${name} has logged ${value} Bio sync Efficiency, putting them at ${selectedPodiumIndex === 0 ? 'Rank #1' : selectedPodiumIndex === 1 ? 'Rank #2' : 'Rank #3'}.`;
      case 'Vitality':
        return `${name} maintains a premium Vitality score of ${value} for ${selectedPodiumIndex === 0 ? 'Rank #1' : selectedPodiumIndex === 1 ? 'Rank #2' : 'Rank #3'}.`;
    }
  };

  const isLightMode = selectedMetric === 'Vitality';

  const themeColors = {
    containerBg: isLightMode ? '#FFFFFF' : '#0B0F19',
    headerBg: isLightMode ? '#FFFFFF' : '#0E1626',
    headerText: isLightMode ? '#0F172A' : '#FFFFFF',
    headerBorder: isLightMode ? '#E2E8F0' : '#1E293B',
    headerButtonBg: isLightMode ? '#F1F5F9' : '#1E293B',
    headerButtonBorder: isLightMode ? '#E2E8F0' : '#1E293B',
    headerButtonText: isLightMode ? '#475569' : '#FFFFFF',
    textMain: isLightMode ? '#0F172A' : '#FFFFFF',
    textSecondary: isLightMode ? '#475569' : '#94A3B8',
    cardBg: isLightMode ? '#F8FAFC' : '#151E33',
    cardBorder: isLightMode ? '#E2E8F0' : '#1E293B',
    statBoxBg: isLightMode ? '#FFFFFF' : '#0E1626',
    progressBarBg: isLightMode ? '#E2E8F0' : '#0E1626',
    dropdownBg: isLightMode ? '#FFFFFF' : '#151E33',
    dropdownBorder: isLightMode ? '#E2E8F0' : '#1E293B',
    podiumBarBg: isLightMode ? '#F8FAFC' : '#1E293B',
    rankCircleBg: isLightMode ? '#E2E8F0' : '#1E293B',
    dropdownItemActiveBg: isLightMode ? '#3B82F6' : '#2563EB',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.containerBg }]}>
      {/* Restored default CustomHeader to allow drawer opening context */}
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

      {/* Metric Selector Dropdown */}
      <View style={[styles.dropdownWrapper, { zIndex: dropdownOpen ? 1000 : 1 }]}>
        <TouchableOpacity
          style={[
            styles.dropdownButton,
            {
              backgroundColor: themeColors.dropdownBg,
              borderColor: themeColors.dropdownBorder,
            }
          ]}
          onPress={() => setDropdownOpen(!dropdownOpen)}
          activeOpacity={0.9}
        >
          <Text style={[styles.dropdownButtonText, { color: themeColors.textMain }]}>
            {getMetricIcon(selectedMetric)} {selectedMetric}
          </Text>
          <Text style={[styles.dropdownArrow, { color: themeColors.textSecondary }]}>{dropdownOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {dropdownOpen && (
          <View style={[
            styles.dropdownMenu,
            {
              backgroundColor: themeColors.dropdownBg,
              borderColor: themeColors.dropdownBorder,
            }
          ]}>
            {(['Steps', 'Heart Points', 'Bio sync Efficiency', 'Vitality'] as MetricType[]).map((metric) => (
              <TouchableOpacity
                key={metric}
                style={[
                  styles.dropdownMenuItem,
                  { borderBottomColor: themeColors.dropdownBorder },
                  selectedMetric === metric && [
                    styles.dropdownMenuItemActive,
                    { backgroundColor: themeColors.dropdownItemActiveBg }
                  ],
                ]}
                onPress={() => {
                  setSelectedMetric(metric);
                  setDropdownOpen(false);
                  setSelectedPodiumIndex(0); // Reset podium to first place on metric change
                }}
              >
                <Text style={[styles.dropdownMenuItemText, { color: themeColors.textMain }, selectedMetric === metric && { color: '#FFFFFF', fontWeight: 'bold' }]}>
                  {getMetricIcon(metric)} {metric}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isLightMode ? '#000000' : '#FFFFFF'}
            colors={['#3B82F6']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Card */}
        <View style={[
          styles.bannerCard,
          {
            backgroundColor: themeColors.cardBg,
            borderColor: themeColors.cardBorder,
          }
        ]}>
          <Image
            source={IMAGES.trialRunner}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.statsRow}>
            {/* Box 1: Active members */}
            <View style={[
              styles.statBox,
              {
                backgroundColor: themeColors.statBoxBg,
                borderColor: themeColors.cardBorder,
              }
            ]}>
              <View style={[styles.statIconCircle, { backgroundColor: 'rgba(20, 184, 166, 0.15)' }]}>
                <ActiveCrewSvg color="#14B8A6" />
              </View>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>Active Crew</Text>
              <Text style={[styles.statLabelSub, { color: themeColors.textSecondary }]}>Members</Text>
              <Text style={[styles.statValue, { color: themeColors.textMain }]}>98</Text>
            </View>

            {/* Box 2: Total dynamic metrics */}
            <View style={[
              styles.statBox,
              {
                backgroundColor: themeColors.statBoxBg,
                borderColor: themeColors.cardBorder,
              }
            ]}>
              <View style={[styles.statIconCircle, { backgroundColor: getMetricBgColor(selectedMetric) }]}>
                {getMetricSvgIcon(selectedMetric)}
              </View>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>{getMetricLabel(selectedMetric).split(' ')[0]}</Text>
              <Text style={[styles.statLabelSub, { color: themeColors.textSecondary }]}>{getMetricLabel(selectedMetric).split(' ').slice(1).join(' ')}</Text>
              <Text style={[styles.statValue, { color: themeColors.textMain }]}>{getMetricTotalValue()}</Text>
            </View>
          </View>
        </View>

        {/* Leaderboard Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: themeColors.textMain }]}>Leaderboard (Top 10 Players)</Text>
          <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>
            Ranked by highest {selectedMetric.toLowerCase()}.
          </Text>
        </View>

        {/* Top 10 Leaderboard List */}
        {top10Players.map((player) => {
          const isUser = player.isCurrentUser;
          const rankEmoji = player.rank === 1 ? '🏆' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : '';
          
          return (
            <View
              key={player.id}
              style={[
                styles.playerCard,
                {
                  backgroundColor: themeColors.cardBg,
                  borderColor: themeColors.cardBorder,
                },
                isUser && [
                  styles.userPlayerCard,
                  isLightMode ? {
                    borderColor: '#10B981',
                    borderWidth: 2,
                    backgroundColor: '#ECFDF5',
                    shadowColor: '#10B981',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 6,
                    elevation: 3,
                  } : {
                    backgroundColor: 'rgba(20, 184, 166, 0.05)',
                  }
                ],
              ]}
            >
              <View style={styles.cardMainRow}>
                {/* Left: Rank Badge and Names info */}
                <View style={styles.leftCol}>
                  <View style={[
                    styles.rankCircle,
                    { backgroundColor: themeColors.rankCircleBg },
                    player.rank === 1 && styles.rankCircleFirst,
                    player.rank === 2 && styles.rankCircleSecond,
                    player.rank === 3 && styles.rankCircleThird,
                  ]}>
                    <Text style={[styles.rankText, { color: themeColors.textMain }]}>
                      {rankEmoji ? rankEmoji : `#${player.rank}`}
                    </Text>
                  </View>

                  <View style={styles.nameDetails}>
                    <Text style={[styles.playerName, { color: themeColors.textMain }]}>
                      {player.name}
                    </Text>
                    <View style={styles.metaRow}>
                      <Text style={[styles.playerDept, { color: themeColors.textSecondary }]}>
                        {player.department}
                      </Text>
                      <View style={styles.activePill}>
                        <Text style={styles.activeText}>Active</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Right: Metric Score */}
                <Text style={[styles.metricScore, { color: themeColors.textMain }]}>
                  {getPlayerMetricString(player)}
                </Text>
              </View>

              {/* Progress bar container */}
              <View style={[styles.progressContainer, { backgroundColor: themeColors.progressBarBg }]}>
                <View style={[
                  styles.progressBarFill,
                  { width: getProgressWidth(player) as any },
                  isLightMode && { backgroundColor: '#F59E0B' },
                  isUser && [styles.userProgressBarFill, isLightMode && { backgroundColor: '#10B981' }],
                ]} />
              </View>
            </View>
          );
        })}

        {/* Dynamic Podium Component */}
        <View style={styles.podiumSection}>
          <View style={styles.podiumRow}>
            {top3Podium.map((player, idx) => {
              const isSelected = selectedPodiumIndex === idx;
              return (
                <TouchableOpacity
                  key={player.id}
                  style={styles.podiumCol}
                  onPress={() => setSelectedPodiumIndex(idx)}
                  activeOpacity={0.8}
                >
                  <View style={[
                    styles.podiumBar,
                    { backgroundColor: themeColors.podiumBarBg },
                    isSelected && styles.podiumBarSelected,
                    isSelected && isLightMode && { backgroundColor: '#3B82F6', borderColor: '#1D4ED8', borderWidth: 2 },
                  ]}>
                    <Text style={styles.podiumBarEmoji}>
                      {idx === 0 ? '🏆' : idx === 1 ? '🥈' : '🥉'}
                    </Text>
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.podiumName,
                      { color: themeColors.textSecondary },
                      isSelected && [styles.podiumNameSelected, { color: themeColors.textMain }, isLightMode && { color: '#3B82F6', fontWeight: 'bold' }],
                    ]}
                  >
                    {player.name.replace(' (You)', '')}
                  </Text>
                  <Text style={[
                    styles.podiumRankText,
                    { color: themeColors.textSecondary },
                    isSelected && [styles.podiumRankTextSelected, { color: themeColors.textMain }, isLightMode && { color: '#3B82F6', fontWeight: 'bold' }],
                  ]}>
                    #{idx + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={[styles.podiumInstruction, { color: themeColors.textSecondary }]}>
            Tap any bar to inspect crew progress.
          </Text>

          {/* Inspection Card Detail */}
          {selectedPodiumPlayer && (
            <View style={[
              styles.inspectCard,
              {
                backgroundColor: themeColors.cardBg,
                borderColor: themeColors.cardBorder,
              }
            ]}>
              <Text style={[styles.inspectTitle, { color: themeColors.textMain }]}>
                {selectedPodiumPlayer.name.replace(' (You)', '')} - Rank #{selectedPodiumIndex + 1}
              </Text>
              <Text style={[styles.inspectDescription, { color: themeColors.textSecondary }]}>
                {getPodiumInspectionText()}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Simulation Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleSimulateRankUp}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingButtonEmoji}>⚡</Text>
        <Text style={styles.floatingButtonText}>Simulate Rank Up</Text>
      </TouchableOpacity>

      {/* Rank Up Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={rankUpVisible}
        onRequestClose={() => setRankUpVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {/* Burst Particles Center */}
            <View style={styles.burstCenter}>
              {Array.from({ length: 12 }).map((_, i) => (
                <GoldParticle key={i} delay={i * 40} />
              ))}
            </View>
            
            <Text style={styles.trophyIcon}>⚡</Text>
            <Text style={styles.rankUpTitle}>RANK UP SUCCESS!</Text>
            <Text style={styles.rankUpMetric}>In {selectedMetric}</Text>
            
            <View style={styles.comparisonRow}>
              <View style={styles.rankPill}>
                <Text style={styles.rankPillOld}>Rank #{rankUpData.oldRank}</Text>
              </View>
              <Text style={styles.comparisonArrow}>➔</Text>
              <View style={[styles.rankPill, styles.rankPillNew]}>
                <Text style={styles.rankPillNewText}>Rank #{rankUpData.newRank}</Text>
              </View>
            </View>
            
            <Text style={styles.rankUpMessage}>
              Awesome effort! You pushed ahead of <Text style={{ fontWeight: 'bold', color: '#FFFFFF' }}>{rankUpData.aheadOfName}</Text> to claim Rank #{rankUpData.newRank}. Keep moving!
            </Text>

            {!!rankUpData.nextRankTargetText && (
              <View style={styles.modalMotivateContainer}>
                <Text style={styles.modalMotivateText}>
                  {rankUpData.nextRankTargetText}
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setRankUpVisible(false)}
            >
              <Text style={styles.modalButtonText}>Awesome! ⚡</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rank #1 Celebration Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={celebrationVisible}
        onRequestClose={() => setCelebrationVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.celebrationCard]}>
            {/* Burst Particles Center */}
            <View style={styles.burstCenter}>
              {Array.from({ length: 30 }).map((_, i) => (
                <GoldParticle key={i} delay={i * 20} />
              ))}
            </View>
            
            <Text style={styles.crownIcon}>👑 🏆</Text>
            <Text style={styles.celebrationTitle}>CREW LEADER ACHIEVED!</Text>
            <Text style={styles.celebrationSubtitle}>RANK #1 STANDING</Text>
            
            <Text style={styles.celebrationMessage}>
              Incredible work! Your latest achievements pushed you to the absolute top of the leaderboard. You are leading the entire crew with <Text style={{ color: '#FACC15', fontWeight: 'bold' }}>{celebrationData.metricValue}</Text> {selectedMetric.toLowerCase()}!
            </Text>
            
            <Text style={styles.celebrationMessageSub}>
              🎉 You have earned the top spot through pure dedication and movement! Stay active to maintain your title as Crew Leader! 🚀
            </Text>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.celebrationButton]}
              onPress={() => setCelebrationVisible(false)}
            >
              <Text style={styles.celebrationButtonText}>Let's keep leading! 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// Styles Matching Dark Premium Aesthetics
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19', // Deep dark navy blue
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E1626', // Matching dark header background
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingHorizontal: 16,
  },
  menuButton: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholderButton: {
    width: 38,
    height: 38,
  },
  dropdownWrapper: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  dropdownButton: {
    height: 48,
    backgroundColor: '#151E33',
    borderColor: '#1E293B',
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  dropdownButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#94A3B8',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#151E33',
    borderColor: '#1E293B',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  dropdownMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  dropdownMenuItemActive: {
    backgroundColor: '#1E293B',
  },
  dropdownMenuItemText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  bannerCard: {
    backgroundColor: '#151E33',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    marginBottom: 24,
  },
  bannerImage: {
    width: '100%',
    height: 150,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statEmoji: {
    fontSize: 14,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 6,
  },
  sectionHeaderRow: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
  },
  playerCard: {
    backgroundColor: '#151E33',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  userPlayerCard: {
    borderColor: '#14B8A6', // Glowing Teal outline for current user
    borderWidth: 1.5,
    backgroundColor: 'rgba(20, 184, 166, 0.05)',
  },
  cardMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankCircleFirst: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)', // light gold background
  },
  rankCircleSecond: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)', // light silver
  },
  rankCircleThird: {
    backgroundColor: 'rgba(180, 83, 9, 0.15)', // light bronze
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nameDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  playerDept: {
    fontSize: 11,
    color: '#94A3B8',
  },
  activePill: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  activeText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#34D399',
  },
  metricScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  progressContainer: {
    height: 5,
    backgroundColor: '#0E1626',
    borderRadius: 3,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6', // Blue progress fill
    borderRadius: 3,
  },
  userProgressBarFill: {
    backgroundColor: '#14B8A6', // Teal progress fill for current user
  },
  podiumSection: {
    marginTop: 28,
    alignItems: 'center',
  },
  podiumRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    gap: 12,
  },
  podiumCol: {
    flex: 1,
    alignItems: 'center',
  },
  podiumBar: {
    width: '100%',
    height: 80,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  podiumBarSelected: {
    backgroundColor: '#3B82F6', // Selected is bright blue
    borderColor: '#FFFFFF', // White border highlight
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  podiumBarEmoji: {
    fontSize: 28,
  },
  podiumName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
    textAlign: 'center',
    width: '100%',
  },
  podiumNameSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  podiumRankText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  podiumRankTextSelected: {
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  podiumInstruction: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#64748B',
    marginVertical: 12,
    textAlign: 'center',
  },
  inspectCard: {
    width: '100%',
    backgroundColor: '#151E33',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderLeftWidth: 4,
    borderLeftColor: '#14B8A6', // Cyan left highlight border
    borderRadius: 12,
    padding: 16,
    marginTop: 4,
  },
  inspectTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  inspectDescription: {
    fontSize: 13,
    color: '#94A3B8',
    lineHeight: 18,
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
    borderColor: '#FACC15', // Gold border for #1
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
    fontSize: 48,
    marginBottom: 12,
  },
  crownIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  rankUpTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
    letterSpacing: 1,
  },
  celebrationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FACC15', // Gold color
    letterSpacing: 1,
    textAlign: 'center',
  },
  rankUpMetric: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  celebrationSubtitle: {
    fontSize: 12,
    color: '#A7F3D0', // Emerald green
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 20,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  rankPill: {
    backgroundColor: '#0E1626',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  rankPillNew: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
  },
  rankPillOld: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
  },
  rankPillNewText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  comparisonArrow: {
    fontSize: 16,
    color: '#64748B',
  },
  rankUpMessage: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  celebrationMessage: {
    fontSize: 15,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 12,
  },
  celebrationMessageSub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
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
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  celebrationButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#090D16', // Dark contrast text for gold
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999, // Make sure floating action button is above content
  },
  floatingButtonEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  floatingButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalMotivateContainer: {
    backgroundColor: '#1E1B4B', // Indigo tint
    borderColor: '#3730A3',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalMotivateText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FBBF24', // Highlighted gold/amber
    textAlign: 'center',
    lineHeight: 16,
  },
  headerOvertakeHighlight: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FBBF24', // Highlighted Gold
  },
  overtakeBanner: {
    backgroundColor: '#151F38', // Dark deep indigo/navy tint
    borderColor: '#2A3C63',
    borderWidth: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#FBBF24', // Highlight Amber left border
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  overtakeEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  overtakeTextContainer: {
    flex: 1,
  },
  overtakeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  overtakeHighlight: {
    color: '#FBBF24', // Gold highlight
    fontWeight: '900',
  },
  overtakeCompetitorName: {
    color: '#38BDF8', // Cyan highlight for rival
    fontWeight: 'bold',
  },
  overtakeSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 3,
  },
  nextRankOvertakePill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)', // light gold/amber
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  nextRankOvertakeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FBBF24',
  },
});

export default LeaderboardScreen;
