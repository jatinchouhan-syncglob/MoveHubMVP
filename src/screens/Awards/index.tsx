import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  Text,
  View,
  StatusBar,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import Svg, { Path, Circle } from 'react-native-svg';

import { useDrawer } from '../../navigation/DrawerContext';
import { apiService } from '../../services/api';

// Local Style Tokens
const Colors = {
  neutral: {
    white: '#FFFFFF',
    black: '#0F172A',
    s400: '#94A3B8',
    s500: '#64748B',
    s700: '#334155',
  },
  primary: {
    brand: '#6366F1', // Primary brand Indigo
  },
  dashboardColors: {
    indigoBrand: '#4F46E5',
    indigoDeep: '#312E81',
    indigoCardBg: '#EEF2FF',
    goldMedium: '#F59E0B',
    goldLight: '#FEF3C7',
    goldDark: '#B45309',
    amberLight: '#FEF3C7',
    amberNormal: '#D97706',
    amberDeep: '#B45309',
    amberOrange: '#F59E0B',
    slateLight: '#F1F5F9',
    slateMedium: '#CBD5E1',
    slateDark: '#475569',
    slateSilver: '#E2E8F0',
    overlayWhite: 'rgba(255, 255, 255, 0.15)',
    overlayWhite85: 'rgba(255, 255, 255, 0.85)',
    overlayBlack03: 'rgba(0, 0, 0, 0.03)',
  },
};

const Outlines = {
  shadow: {
    base: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
  },
};

const Typography = {
  textStyle: {
    bold: {
      fontWeight: 'bold' as const,
    },
    medium: {
      fontWeight: '500' as const,
    },
    semiBold: {
      fontWeight: '600' as const,
    },
  },
};

// Custom SVG Icons to avoid native font Glyphs issues
const Icon = ({
  name,
  size = 24,
  color = '#000',
  style,
}: {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}) => {
  if (name === 'crown') {
    return (
      <View style={style}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M2 4l4 5 6-6 6 6 4-5-2 15H4L2 4z"
            fill={color}
          />
        </Svg>
      </View>
    );
  }

  if (name === 'medal-outline') {
    return (
      <View style={style}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M8.24 2h7.52L12 11 8.24 2z"
            fill={color}
            opacity={0.8}
          />
          <Path
            d="M9.5 2L12 8l2.5-6h-5z"
            fill="#FFF"
            opacity={0.3}
          />
          <Circle cx="12" cy="14" r="5" fill={color} stroke={color} strokeWidth={1} />
          <Path
            d="M12 11.5l.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.9-1.6.9.3-1.7-1.2-1.2 1.7-.2.8-1.6z"
            fill="#FFF"
          />
        </Svg>
      </View>
    );
  }

  if (name === 'star-face') {
    return (
      <View style={style}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            fill={color}
            stroke={color}
            strokeWidth={1}
            strokeLinejoin="round"
          />
          <Circle cx="9.5" cy="11.5" r="1.2" fill="#FFFFFF" />
          <Circle cx="14.5" cy="11.5" r="1.2" fill="#FFFFFF" />
          <Path
            d="M9.5 14C10.2 15.2 13.8 15.2 14.5 14"
            stroke="#FFFFFF"
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx="12" cy="17.2" r="2.2" fill="#FFFFFF" />
          <Circle cx="12" cy="17.2" r="1" fill={color} />
        </Svg>
      </View>
    );
  }

  if (name === 'trophy-outline') {
    return (
      <View style={style}>
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path
            d="M6 9H4.5a2.5 2.5 0 010-5H6v5zm12 0h1.5a2.5 2.5 0 000-5H18v5z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M6 4h12v7a6 6 0 01-12 0V4z"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <Path
            d="M12 15v5M9 20h6"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </Svg>
      </View>
    );
  }

  return null;
};

const getInitials = (name: string) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

const UserAvatar = ({
  name,
  style,
  textStyle,
}: {
  name: string;
  style?: any;
  textStyle?: any;
}) => {
  return (
    <View style={[style, styles.avatarContainer]}>
      <Text style={[styles.avatarText, textStyle]}>{getInitials(name)}</Text>
    </View>
  );
};

const AwardsScreen = () => {
  const drawer = useDrawer();
  const insets = useSafeAreaInsets();
  const [awardData, setAwardData] = useState<any>({
    company: 'INOX INDIA Fitness Award',
    challengeDetail: 'Excellence in Health & Wellness',
    challengeName: '7 day steps challenge Top-3 winners',
    overallChampionName: 'Nirali Barot',
    bioSyncScore: '71.87%',
    rankings: [
      { userName: 'ANSHUL BAFNA', totalSteps: 154830 },
      { userName: 'PRATIK SONI', totalSteps: 152805 },
      { userName: 'Nirali Barot', totalSteps: 123634 },
    ],
  });
  const [isLoading, setIsLoading] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [fadeAnim, slideAnim, pulseAnim]);

  const rankings = awardData?.rankings ?? [];
  const sortedRankings = [...rankings].sort(
    (a, b) => (b.totalSteps || 0) - (a.totalSteps || 0),
  );

  const displayRankings = sortedRankings;
  const topThree = displayRankings.slice(0, 3);
  const overallChampion = {
    name: awardData?.overallChampionName || 'Winner',
    efficiency: awardData?.bioSyncScore || 0,
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary.brand} />
        <Text style={[styles.headerSubtitle, { color: '#666', marginTop: 10 }]}>
          Fetching latest awards...
        </Text>
      </View>
    );
  }

  const isEmpty = rankings.length === 0 && !awardData?.overallChampionName;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.primary.brand}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[
            Colors.primary.brand,
            Colors.dashboardColors.indigoBrand,
            Colors.dashboardColors.indigoDeep,
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 10, paddingBottom: 25 }]}>
          
          {/* Header Action Bar */}
          <View style={styles.headerBar}>
            <TouchableOpacity onPress={() => drawer?.openDrawer()} style={styles.headerButton} activeOpacity={0.7}>
              <Text style={styles.headerButtonText}>☰</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => drawer?.setActiveScreen('Profile')} style={styles.headerProfileButton} activeOpacity={0.7}>
              <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <Circle
                  cx="12"
                  cy="7"
                  r="4"
                  stroke="#6366F1"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
            </TouchableOpacity>
          </View>

          <Text style={styles.headerTitle}>
            {awardData?.company}
          </Text>
          <Text style={styles.headerSubtitle}>
            {awardData?.challengeDetail}
          </Text>
        </LinearGradient>

        <Animated.View
          style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {isEmpty ? (
            <View style={styles.emptyStateContainer}>
              <Icon name="trophy-outline" size={80} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No Results Yet</Text>
            </View>
          ) : (
            <>
              {/* Overall Winner Card */}
              <View style={styles.overallWinnerCard}>
                <LinearGradient
                  colors={[
                    Colors.dashboardColors.goldMedium,
                    Colors.dashboardColors.goldLight,
                    Colors.dashboardColors.goldMedium,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.goldWinnerGradient}
                />
                <View style={styles.overallWinnerContent}>
                  <View style={styles.sparkle} />
                  <View style={styles.winnerIconContainer}>
                    <Icon name="star-face" size={40} color="#D97706" />
                  </View>
                  <View style={styles.winnerInfo}>
                    <Text style={styles.winnerLabel}>🏆 OVERALL WINNER</Text>
                    <Text style={styles.winnerName}>
                      {overallChampion.name}
                    </Text>
                    <Text style={styles.winnerValue}>
                      Bio-Sync Efficiency: {overallChampion.efficiency}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Title Section */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>
                  7 day steps challenge Top-3 winners
                </Text>
              </View>

              {/* Podium Leaderboard */}
              <View style={styles.leaderboardContainer}>
                {/* 2nd Place */}
                {topThree[1] && (
                  <View style={[styles.rankCard, styles.secondRankCard]}>
                    <View
                      style={[
                        styles.rankBadge,
                        { backgroundColor: '#94A3B8' },
                      ]}>
                      <Text style={styles.rankText}>2</Text>
                    </View>
                    <Icon
                      name="medal-outline"
                      size={20}
                      color="#64748B"
                      style={styles.podiumIcon}
                    />
                    <UserAvatar
                      name={topThree[1].userName}
                      style={styles.rankUserImage}
                    />
                    <View style={nameContainerStyles()}>
                      <Text
                        style={styles.rankUserName}
                        numberOfLines={2}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}>
                        {topThree[1].userName}
                      </Text>
                    </View>
                    <Text
                      style={styles.rankValue}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}>
                      {topThree[1].totalSteps.toLocaleString('en-IN')} Steps
                    </Text>
                  </View>
                )}

                {/* 1st Place */}
                {topThree[0] && (
                  <Animated.View
                    style={[
                      styles.rankCard,
                      styles.firstRankCard,
                      { transform: [{ scale: pulseAnim }] },
                    ]}>
                    <View
                      style={[
                        styles.rankBadge,
                        { backgroundColor: '#F59E0B' },
                      ]}>
                      <Text style={styles.rankText}>1</Text>
                    </View>
                    <Icon
                      name="crown"
                      size={26}
                      color="#F59E0B"
                      style={styles.podiumIcon}
                    />
                    <UserAvatar
                      name={topThree[0].userName}
                      style={styles.rankUserImage}
                    />
                    <View style={nameContainerStyles()}>
                      <Text
                        style={styles.rankUserName}
                        numberOfLines={2}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}>
                        {topThree[0].userName}
                      </Text>
                    </View>
                    <Text
                      style={[styles.rankValue, styles.firstRankValue]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}>
                      {topThree[0].totalSteps.toLocaleString('en-IN')} Steps
                    </Text>
                  </Animated.View>
                )}

                {/* 3rd Place */}
                {topThree[2] && (
                  <View style={[styles.rankCard, styles.thirdRankCard]}>
                    <View
                      style={[
                        styles.rankBadge,
                        { backgroundColor: '#D97706' },
                      ]}>
                      <Text style={styles.rankText}>3</Text>
                    </View>
                    <Icon
                      name="medal-outline"
                      size={20}
                      color="#B45309"
                      style={styles.podiumIcon}
                    />
                    <UserAvatar
                      name={topThree[2].userName}
                      style={styles.rankUserImage}
                    />
                    <View style={nameContainerStyles()}>
                      <Text
                        style={styles.rankUserName}
                        numberOfLines={2}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}>
                        {topThree[2].userName}
                      </Text>
                    </View>
                    <Text
                      style={styles.rankValue}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}>
                      {topThree[2].totalSteps.toLocaleString('en-IN')} Steps
                    </Text>
                  </View>
                )}
              </View>


            </>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// Workaround function for styling nameContainer type cast
const nameContainerStyles = () => {
  return styles.nameContainer as any;
};

export const awardStyles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
  },
  headerGradient: {
    paddingHorizontal: '24@ms',
    borderBottomLeftRadius: '45@ms',
    borderBottomRightRadius: '45@ms',
    alignItems: 'center',
    marginBottom: '20@ms',
    ...Outlines.shadow.base,
    borderWidth: 1,
    borderColor: Colors.dashboardColors.overlayWhite,
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '20@ms',
  },
  headerButton: {
    width: '38@ms',
    height: '38@ms',
    borderRadius: '10@ms',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  headerButtonText: {
    fontSize: '20@ms',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerProfileButton: {
    width: '38@ms',
    height: '38@ms',
    borderRadius: '19@ms',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerProfileText: {
    color: '#6366F1',
    fontSize: '13@ms',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: '22@ms',
    color: Colors.neutral.white,
    ...Typography.textStyle.bold,
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: '4@ms',
  },
  headerSubtitle: {
    fontSize: '13@ms',
    color: Colors.dashboardColors.overlayWhite85,
    ...Typography.textStyle.medium,
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: '16@ms',
    marginBottom: '15@ms',
  },
  sectionTitle: {
    fontSize: '16@ms',
    color: Colors.neutral.black,
    ...Typography.textStyle.bold,
  },
  seeAll: {
    fontSize: '13@ms',
    color: Colors.primary.brand,
    ...Typography.textStyle.bold,
  },
  overallWinnerCard: {
    marginHorizontal: '16@ms',
    padding: '1.5@ms',
    borderRadius: '24@ms',
    marginBottom: '25@ms',
    ...Outlines.shadow.base,
    position: 'relative',
  },
  overallWinnerContent: {
    backgroundColor: Colors.neutral.white,
    borderRadius: '23@ms',
    padding: '18@ms',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  goldWinnerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '24@ms',
  },
  sparkle: {
    position: 'absolute',
    width: '100@ms',
    height: '100@ms',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: '50@ms',
    top: '-30@ms',
    right: '-30@ms',
    opacity: 0.2,
  },
  winnerIconContainer: {
    width: '64@ms',
    height: '64@ms',
    borderRadius: '32@ms',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '16@ms',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  winnerInfo: {
    flex: 1,
    zIndex: 2,
  },
  winnerLabel: {
    fontSize: '11@ms',
    color: Colors.dashboardColors.goldDark,
    ...Typography.textStyle.bold,
    textTransform: 'uppercase',
  },
  winnerName: {
    fontSize: '18@ms',
    color: '#5C2D06',
    ...Typography.textStyle.bold,
  },
  winnerValue: {
    fontSize: '13@ms',
    color: Colors.dashboardColors.goldDark,
    ...Typography.textStyle.bold,
  },
  leaderboardContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: '4@ms',
    marginBottom: '20@ms',
    height: '240@ms',
  },
  rankCard: {
    flex: 1,
    backgroundColor: Colors.neutral.white,
    borderRadius: '20@ms',
    alignItems: 'center',
    paddingVertical: '14@ms',
    paddingHorizontal: '6@ms',
    marginHorizontal: '5@ms',
    position: 'relative',
    ...Outlines.shadow.base,
  },
  firstRankCard: {
    height: '215@ms',
    backgroundColor: '#FFFDF0',
    borderColor: '#FCD34D',
    borderWidth: 1.5,
    zIndex: 2,
    shadowColor: Colors.dashboardColors.goldMedium,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  secondRankCard: {
    height: '190@ms',
    backgroundColor: '#F0F4F8',
    borderColor: '#CBD5E1',
    borderWidth: 1.5,
  },
  thirdRankCard: {
    height: '190@ms',
    backgroundColor: '#FFFDF0',
    borderColor: '#FCD34D',
    borderWidth: 1.5,
  },
  runnerUpText: {
    fontSize: '9@ms',
    color: Colors.neutral.s500,
    ...Typography.textStyle.bold,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: '2@ms',
    letterSpacing: 0.3,
  },
  rankBadge: {
    position: 'absolute',
    top: '-14@ms',
    width: '28@ms',
    height: '28@ms',
    borderRadius: '14@ms',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutral.white,
    ...Outlines.shadow.base,
    alignSelf: 'center',
  },
  rankText: {
    fontSize: '13@ms',
    color: Colors.neutral.white,
    ...Typography.textStyle.bold,
  },
  rankUserImage: {
    width: '50@ms',
    height: '50@ms',
    borderRadius: '25@ms',
    marginBottom: '8@ms',
  },
  rankUserName: {
    fontSize: '12@ms',
    color: Colors.neutral.black,
    ...Typography.textStyle.bold,
    textAlign: 'center',
    paddingHorizontal: '2@ms',
  },
  nameContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: '4@ms',
    width: '100%',
  },
  rankValue: {
    fontSize: '12@ms',
    color: '#1E40AF',
    ...Typography.textStyle.bold,
    marginTop: 'auto',
    textAlign: 'center',
  },
  firstRankValue: {
    color: '#B45309',
    ...Typography.textStyle.bold,
    fontSize: '13@ms',
  },
  listContainer: {
    paddingHorizontal: '20@ms',
    paddingBottom: '40@ms',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    padding: '16@ms',
    borderRadius: '16@ms',
    marginBottom: '12@ms',
    ...Outlines.shadow.base,
    borderWidth: 1,
    borderColor: Colors.dashboardColors.overlayBlack03,
  },
  listRank: {
    width: '35@ms',
    fontSize: '16@ms',
    color: Colors.neutral.s400,
    ...Typography.textStyle.bold,
  },
  listImage: {
    width: '44@ms',
    height: '44@ms',
    borderRadius: '22@ms',
    marginRight: '15@ms',
  },
  listName: {
    flex: 1,
    fontSize: '16@ms',
    color: Colors.neutral.black,
    ...Typography.textStyle.semiBold,
  },
  listValue: {
    fontSize: '15@ms',
    color: Colors.neutral.s700,
    ...Typography.textStyle.bold,
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dashboardColors.indigoCardBg,
  },
  avatarText: {
    fontSize: '18@ms',
    color: Colors.dashboardColors.indigoBrand,
    ...Typography.textStyle.bold,
    textTransform: 'uppercase',
  },
  listAvatarText: {
    fontSize: '14@ms',
  },
  podiumIcon: {
    marginBottom: '8@ms',
  },
  emptyStateContainer: {
    padding: '40@ms',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '40@ms',
  },
  emptyStateTitle: {
    fontSize: '18@ms',
    color: Colors.neutral.black,
    ...Typography.textStyle.bold,
    marginTop: '16@ms',
    textAlign: 'center',
  },
});

const styles = awardStyles;

export default AwardsScreen;
