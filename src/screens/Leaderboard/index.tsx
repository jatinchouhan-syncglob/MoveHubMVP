import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Dimensions,
} from 'react-native';
import { theme } from '../../theme';
import { STRINGS } from '../../constants/strings';
import { CustomHeader } from '../../components/common/CustomHeader';
import { Loader } from '../../components/common/Loader';
import { apiService } from '../../services/api';
import { LeaderboardEntry } from '../../types';

// ============================================================================
// GOLD BURST PARTICLE ANIMATION COMPONENT (FE-03)
// ============================================================================
interface ParticleProps {
  delay: number;
}

const GoldParticle: React.FC<ParticleProps> = ({ delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 60 + Math.random() * 80;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: Math.random() * 1.6 + 0.4,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: Math.cos(angle) * distance,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: Math.sin(angle) * distance,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, scale, opacity, translateX, translateY]);

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

// ============================================================================
// MAIN LEADERBOARD SCREEN WITH 4-QUADRANTS & EXPANDABLE TRAYS (FE-02)
// ============================================================================
type CategoryType = 'CARDIO' | 'METABOLIC' | 'NEURO' | 'STRUCTURAL';

interface CollapsibleTrayProps {
  title: string;
  badgeColor: string;
  count: number;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleTray: React.FC<CollapsibleTrayProps> = ({
  title,
  badgeColor,
  count,
  expanded,
  onToggle,
  children,
}) => {
  return (
    <View style={styles.trayContainer}>
      <TouchableOpacity
        style={styles.trayHeader}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <View style={styles.trayTitleRow}>
          <View style={[styles.trayBadge, { backgroundColor: badgeColor }]} />
          <Text style={styles.trayTitle}>{title}</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        </View>
        <Text style={styles.trayArrow}>{expanded ? '▼' : '▶'}</Text>
      </TouchableOpacity>
      {expanded && <View style={styles.trayContent}>{children}</View>}
    </View>
  );
};

export const LeaderboardScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryType>('CARDIO');
  const [userName, setUserName] = useState('Alex Rivera');

  // Expanded Trays state
  const [expandedTiers, setExpandedTiers] = useState({
    Elite: true,
    Optimal: true,
    Stable: true,
    Fair: false,
  });

  // Simulated WebSocket Rank-Jump Overlay State
  const [showRankJump, setShowRankJump] = useState(false);
  const [rankJumpData, setRankJumpData] = useState({
    categoryName: 'Cardiovascular Efficiency',
    oldRank: 3,
    newRank: 2,
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Toggle Tray Expansion
  const toggleTray = (tier: keyof typeof expandedTiers) => {
    setExpandedTiers((prev) => ({ ...prev, [tier]: !prev[tier] }));
  };

  const loadUserData = async () => {
    try {
      const profile = await apiService.getProfile();
      setUserName(profile.name);
    } catch (error) {
      console.error('Failed to load user profile in leaderboard:', error);
    }
  };

  useEffect(() => {
    loadUserData();
    
    // Simulate initial loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600);

    // Simulated WebSocket Event Trigger after 8 seconds
    const socketTimer = setTimeout(() => {
      triggerRankJumpSimulation();
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearTimeout(socketTimer);
    };
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  // Simulated WebSocket Rank-Jump Trigger
  const triggerRankJumpSimulation = () => {
    const categoriesMap = {
      CARDIO: 'Cardiovascular Efficiency',
      METABOLIC: 'Metabolic Fluidity',
      NEURO: 'Neuromuscular Agility',
      STRUCTURAL: 'Structural Density',
    };

    setRankJumpData({
      categoryName: categoriesMap[activeCategory],
      oldRank: 3,
      newRank: 2,
    });

    setShowRankJump(true);

    // Fade in overlay
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      dismissRankJump();
    }, 4500);
  };

  const dismissRankJump = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowRankJump(false);
    });
  };

  // Generate localized, dynamic mock datasets based on activeCategory
  const getLeaderboardData = (): LeaderboardEntry[] => {
    const baseList = [
      { id: '1', rank: 1, name: 'Sarah Connor', points: 2950, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
      { id: '2', rank: 2, name: 'Michael Chen', points: 2780, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
      { id: '3', rank: 3, name: userName, points: 2420, isCurrentUser: true },
      { id: '4', rank: 4, name: 'Emma Watson', points: 2310, avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
      { id: '5', rank: 5, name: 'David Beckham', points: 2150, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
      { id: '6', rank: 6, name: 'Bruce Wayne', points: 1850, avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
    ];

    if (activeCategory === 'METABOLIC') {
      return [
        { id: '2', rank: 1, name: 'Michael Chen', points: 3100, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
        { id: '3', rank: 2, name: userName, points: 2800, isCurrentUser: true },
        { id: '1', rank: 3, name: 'Sarah Connor', points: 2600, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
        { id: '5', rank: 4, name: 'David Beckham', points: 2200, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
        { id: '4', rank: 5, name: 'Emma Watson', points: 1900, avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
        { id: '6', rank: 6, name: 'Bruce Wayne', points: 1500, avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
      ];
    }

    if (activeCategory === 'NEURO') {
      return [
        { id: '6', rank: 1, name: 'Bruce Wayne', points: 3400, avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
        { id: '1', rank: 2, name: 'Sarah Connor', points: 2900, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
        { id: '4', rank: 3, name: 'Emma Watson', points: 2500, avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
        { id: '3', rank: 4, name: userName, points: 2300, isCurrentUser: true },
        { id: '2', rank: 5, name: 'Michael Chen', points: 2100, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
        { id: '5', rank: 6, name: 'David Beckham', points: 1800, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
      ];
    }

    if (activeCategory === 'STRUCTURAL') {
      return [
        { id: '5', rank: 1, name: 'David Beckham', points: 3050, avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' },
        { id: '1', rank: 2, name: 'Sarah Connor', points: 2800, avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100' },
        { id: '6', rank: 3, name: 'Bruce Wayne', points: 2650, avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' },
        { id: '2', rank: 4, name: 'Michael Chen', points: 2400, avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
        { id: '3', rank: 5, name: userName, points: 2200, isCurrentUser: true },
        { id: '4', rank: 6, name: 'Emma Watson', points: 1750, avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
      ];
    }

    return baseList;
  };

  const listData = getLeaderboardData();

  // Grouping list data into respective tiers
  const eliteEntries = listData.filter((item) => item.rank === 1);
  const optimalEntries = listData.filter((item) => item.rank === 2 || item.rank === 3);
  const stableEntries = listData.filter((item) => item.rank === 4 || item.rank === 5);
  const fairEntries = listData.filter((item) => item.rank >= 6);

  // Render helper for leaderboard rows
  const renderLeaderboardItem = (item: LeaderboardEntry, tierLabel: string) => {
    return (
      <View
        key={item.id}
        style={[
          styles.cardItem,
          item.isCurrentUser && styles.currentUserCard,
        ]}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.rankText}>#{item.rank}</Text>
          <View style={styles.avatarPlaceholder}>
            {item.avatarUrl ? (
              <Text style={styles.avatarEmoji}>👤</Text>
            ) : (
              <Text style={styles.avatarEmoji}>🏃‍♂️</Text>
            )}
          </View>
          <View>
            <Text style={styles.nameText}>
              {item.name} {item.isCurrentUser && '(You)'}
            </Text>
            <Text style={styles.tierSubText}>{tierLabel} Tier</Text>
          </View>
        </View>
        <View style={styles.cardRight}>
          <Text style={styles.pointsText}>{item.points} pts</Text>
        </View>
      </View>
    );
  };

  const categories: { key: CategoryType; label: string; tag: string }[] = [
    { key: 'CARDIO', label: 'Cardio Efficiency', tag: 'QOL_PHYS_V1' },
    { key: 'METABOLIC', label: 'Metabolic Fluidity', tag: 'QOL_MET_M2' },
    { key: 'NEURO', label: 'Neuromuscular Agility', tag: 'QOL_NEURO_A3' },
    { key: 'STRUCTURAL', label: 'Structural Density', tag: 'QOL_STRUC_D4' },
  ];

  if (loading) {
    return <Loader fullScreen message="Loading leaderboard rankings..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={STRINGS.LEADERBOARD.TITLE} showDrawerButton />

      {/* 4-Quadrant Wellness Category Tab Bar */}
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => setActiveCategory(cat.key)}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {cat.label}
                </Text>
                <Text style={styles.tabTag}>{cat.tag}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[theme.colors.primary]}
          />
        }
      >
        {/* Collapsible Trays (Tiers) */}
        <CollapsibleTray
          title="🏆 Elite Standing"
          badgeColor="#EAB308" // Gold
          count={eliteEntries.length}
          expanded={expandedTiers.Elite}
          onToggle={() => toggleTray('Elite')}
        >
          {eliteEntries.map((item) => renderLeaderboardItem(item, 'Elite'))}
        </CollapsibleTray>

        <CollapsibleTray
          title="⭐ Optimal Standing"
          badgeColor="#3B82F6" // Blue
          count={optimalEntries.length}
          expanded={expandedTiers.Optimal}
          onToggle={() => toggleTray('Optimal')}
        >
          {optimalEntries.map((item) => renderLeaderboardItem(item, 'Optimal'))}
        </CollapsibleTray>

        <CollapsibleTray
          title="⚡ Stable Standing"
          badgeColor="#10B981" // Green
          count={stableEntries.length}
          expanded={expandedTiers.Stable}
          onToggle={() => toggleTray('Stable')}
        >
          {stableEntries.map((item) => renderLeaderboardItem(item, 'Stable'))}
        </CollapsibleTray>

        <CollapsibleTray
          title="🛡️ Fair Standing"
          badgeColor="#64748B" // Slate
          count={fairEntries.length}
          expanded={expandedTiers.Fair}
          onToggle={() => toggleTray('Fair')}
        >
          {fairEntries.map((item) => renderLeaderboardItem(item, 'Fair'))}
        </CollapsibleTray>
      </ScrollView>

      {/* Floating Action Button to manually trigger simulation */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={triggerRankJumpSimulation}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingButtonEmoji}>⚡</Text>
        <Text style={styles.floatingButtonText}>Simulate Rank Jump</Text>
      </TouchableOpacity>

      {/* Simulated WebSocket Rank-Jump Gold Burst Overlay (FE-03) */}
      {showRankJump && (
        <Animated.View style={[styles.overlayContainer, { opacity: fadeAnim }]}>
          <View style={styles.overlayBackdrop} />
          <View style={styles.overlayContent}>
            {/* Burst Particles Center */}
            <View style={styles.burstCenter}>
              {Array.from({ length: 16 }).map((_, i) => (
                <GoldParticle key={i} delay={i * 40} />
              ))}
            </View>

            {/* Congratulations Banner Card */}
            <View style={styles.jumpCard}>
              <Text style={styles.jumpTrophy}>🏆</Text>
              <Text style={styles.jumpTitle}>RANK UP SUCCESS!</Text>
              <Text style={styles.jumpCategory}>{rankJumpData.categoryName}</Text>
              
              <View style={styles.jumpComparisonRow}>
                <View style={styles.rankPill}>
                  <Text style={styles.rankPillOld}>Rank #{rankJumpData.oldRank}</Text>
                </View>
                <Text style={styles.rankArrow}>➔</Text>
                <View style={[styles.rankPill, styles.rankPillNew]}>
                  <Text style={styles.rankPillNewText}>Rank #{rankJumpData.newRank}</Text>
                </View>
              </View>

              <Text style={styles.jumpMessage}>
                Congratulations! Your latest workout points pushed you ahead of Michael Chen. Keep moving!
              </Text>

              <TouchableOpacity style={styles.jumpButton} onPress={dismissRankJump}>
                <Text style={styles.jumpButtonText}>Awesome! ⚡</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabBar: {
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
  },
  tabItem: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 8,
    marginHorizontal: 6,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  tabItemActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  tabLabel: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weights.medium as any,
  },
  tabLabelActive: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.weights.bold as any,
  },
  tabTag: {
    fontSize: 9,
    color: theme.colors.textLight,
    marginTop: 2,
  },
  scrollContent: {
    padding: theme.spacing.containerPadding,
    paddingBottom: 80, // space for floating action button
  },
  trayContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadiusLg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  trayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  trayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trayBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  trayTitle: {
    fontSize: theme.fonts.sizes.base,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
  },
  countBadge: {
    backgroundColor: theme.colors.background,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  countText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weights.semibold as any,
  },
  trayArrow: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textLight,
  },
  trayContent: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  cardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  currentUserCard: {
    backgroundColor: theme.colors.primaryLight + '50', // semi-transparent primaryLight
    borderRadius: theme.spacing.borderRadiusMd,
    paddingHorizontal: theme.spacing.sm,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankText: {
    fontSize: theme.fonts.sizes.base,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.textSecondary,
    width: 36,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  avatarEmoji: {
    fontSize: 16,
  },
  nameText: {
    fontSize: theme.fonts.sizes.base,
    fontWeight: theme.fonts.weights.semibold as any,
    color: theme.colors.text,
  },
  tierSubText: {
    fontSize: 10,
    color: theme.colors.textLight,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  pointsText: {
    fontSize: theme.fonts.sizes.base,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.primary,
  },
  floatingButton: {
    position: 'absolute',
    bottom: theme.spacing.xl,
    right: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  floatingButtonEmoji: {
    fontSize: 16,
    color: '#FFFFFF',
    marginRight: 6,
  },
  floatingButtonText: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#FFFFFF',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  overlayBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  overlayContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  burstCenter: {
    position: 'absolute',
    width: 10,
    height: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FACC15', // bright yellow/gold
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  jumpCard: {
    width: width * 0.85,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#EAB308',
    elevation: 24,
  },
  jumpTrophy: {
    fontSize: 54,
    marginBottom: theme.spacing.sm,
  },
  jumpTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#EAB308',
    letterSpacing: 1,
  },
  jumpCategory: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weights.semibold as any,
    marginTop: 4,
    marginBottom: theme.spacing.md,
  },
  jumpComparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  rankPill: {
    backgroundColor: theme.colors.background,
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  rankPillOld: {
    fontSize: theme.fonts.sizes.base,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weights.semibold as any,
  },
  rankArrow: {
    fontSize: 18,
    color: theme.colors.textLight,
  },
  rankPillNew: {
    backgroundColor: '#FEF08A', // light gold
    borderColor: '#EAB308',
  },
  rankPillNewText: {
    fontSize: theme.fonts.sizes.base,
    color: '#A16207', // dark gold/bronze
    fontWeight: theme.fonts.weights.bold as any,
  },
  jumpMessage: {
    fontSize: theme.fonts.sizes.base,
    color: theme.colors.text,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  jumpButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.spacing.borderRadiusMd,
    width: '100%',
    alignItems: 'center',
  },
  jumpButtonText: {
    fontSize: theme.fonts.sizes.base,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#FFFFFF',
  },
});

export default LeaderboardScreen;
