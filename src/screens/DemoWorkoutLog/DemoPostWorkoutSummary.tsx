import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';
import Svg, { Circle, G, Path } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // Two columns grid with 16px horizontal paddings and 16px gap

interface RouteParams {
  activityName?: string;
  baseMet?: number;
  cardio?: number;
  strength?: number;
  balance?: number;
  recovery?: number;
  duration?: number;
  calories?: number;
  gainPoints?: number;
  showBenefitsNext?: boolean;
  fromActivityTracking?: boolean;
}

const getActivityEmoji = (activityName: string): string => {
  const nameLower = activityName.toLowerCase();
  if (nameLower.includes('walk')) return '🚶';
  if (nameLower.includes('run') || nameLower.includes('jog')) return '🏃';
  if (nameLower.includes('cycle') || nameLower.includes('bike')) return '🚴';
  if (nameLower.includes('swim')) return '🏊';
  if (nameLower.includes('yoga') || nameLower.includes('stretch') || nameLower.includes('meditat')) return '🧘';
  if (nameLower.includes('zumba') || nameLower.includes('dance')) return '💃';
  if (nameLower.includes('weights') || nameLower.includes('lift') || nameLower.includes('strength') || nameLower.includes('calisthenics') || nameLower.includes('push-up')) return '🏋️‍♂️';
  return '💪';
};

const getPillarBreakdown = (gainPoints: number, category: string) => {
  let strength = 0;
  let cardio = 0;
  let metabolic = 0;
  let structural = 0;

  const strengthTarget = 300;
  const cardioTarget = 300;
  const metabolicTarget = 300;
  const structuralTarget = 300;

  if (category === 'strength') {
    strength = Math.round(gainPoints * 0.8);
    cardio = Math.round(gainPoints * 0.2);
    metabolic = Math.round(gainPoints * 0.3);
    structural = Math.round(gainPoints * 0.7);
  } else if (category === 'distance') {
    cardio = Math.round(gainPoints * 0.8);
    strength = Math.round(gainPoints * 0.2);
    metabolic = Math.round(gainPoints * 0.7);
    structural = Math.round(gainPoints * 0.3);
  } else {
    cardio = Math.round(gainPoints * 0.5);
    strength = Math.round(gainPoints * 0.5);
    metabolic = Math.round(gainPoints * 0.5);
    structural = Math.round(gainPoints * 0.5);
  }

  return {
    strength,
    cardio,
    metabolic,
    structural,
    strengthTarget,
    cardioTarget,
    metabolicTarget,
    structuralTarget,
    agility: Math.round(gainPoints * 0.4),
    agilityTarget: 300,
  };
};

export const DemoPostWorkoutSummaryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [showDetailedAnalytics, setShowDetailedAnalytics] = React.useState(false);

  const params: RouteParams = route.params || {};

  // Donut Ring Animation Setup
  const animValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, []);

  // Extract or fallback to screenshot parameters
  const activityName = params.activityName || 'Zumba Gold';
  const baseMet = params.baseMet || 4.5;
  const cardioPct = params.cardio !== undefined ? params.cardio : 30;
  const strengthPct = params.strength !== undefined ? params.strength : 40;
  const balancePct = params.balance !== undefined ? params.balance : 20;
  const recoveryPct = params.recovery !== undefined ? params.recovery : 10;
  const duration = params.duration || 45;

  const workoutCalories = params.calories !== undefined ? params.calories : Math.round(duration * baseMet * 1.73);
  const gainPoints = params.gainPoints !== undefined ? params.gainPoints : Math.round(duration * 5.55);

  // Scale points (250 points base for 45 minutes duration)
  const totalPointsBase = gainPoints;
  const strengthPoints = Math.round(totalPointsBase * (strengthPct / 100));
  const cardioPoints = Math.round(totalPointsBase * (cardioPct / 100));
  const balancePoints = Math.round(totalPointsBase * (balancePct / 100));
  const recoveryPoints = Math.round(totalPointsBase * (recoveryPct / 100));

  // TDEE calculations
  const tdee = 1500 + workoutCalories;

  // Circular Donut Ring Setup (Radius = 42, Circumference ≈ 263.9)
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const pCardio = cardioPct / 100;
  const pStrength = strengthPct / 100;
  const pBalance = balancePct / 100;
  const pRecovery = recoveryPct / 100;

  const donutSegments = {
    cardio: {
      percentage: pCardio,
      color: '#06B6D4', // Teal/Cyan matching Cardio
      offset: circumference - (circumference * pCardio),
      rotation: -90,
    },
    strength: {
      percentage: pStrength,
      color: '#F97316', // Orange matching Strength
      offset: circumference - (circumference * pStrength),
      rotation: -90 + (360 * pCardio),
    },
    balance: {
      percentage: pBalance,
      color: '#2DD4BF', // Teal matching Balance
      offset: circumference - (circumference * pBalance),
      rotation: -90 + (360 * (pCardio + pStrength)),
    },
    recovery: {
      percentage: pRecovery,
      color: '#FB923C', // Soft Orange matching Recovery
      offset: circumference - (circumference * pRecovery),
      rotation: -90 + (360 * (pCardio + pStrength + pBalance)),
    },
  };

  const getInterpolatedOffset = (percentage: number) => {
    const targetOffset = circumference - (circumference * percentage);
    return animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [circumference, targetOffset],
    });
  };

  const renderCircularProgress = (pts: number, target: number) => {
    const size = 120;
    const strokeWidth = 8;
    const innerRadius = (size - strokeWidth) / 2;
    const circum = 2 * Math.PI * innerRadius;
    const pct = Math.min(1, pts / target);
    const strokeDashoffset = circum * (1 - pct);

    return (
      <View style={styles.circularProgressContainer}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="none"
            opacity={0.5}
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={innerRadius}
            stroke="#06b6d4"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circum} ${circum}`}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
        <View style={styles.circularProgressCenterText}>
          <Text style={styles.circularProgressValue}>{pts}</Text>
          <Text style={styles.circularProgressLabel}>PTS EARNED</Text>
        </View>
        <Text style={styles.circularProgressTarget}>{target}</Text>
      </View>
    );
  };

  // 4 Pillars Card configurations
  const pillars = [
    {
      title: 'STRENGTH & POWER',
      points: strengthPoints || 100,
      percentage: strengthPct,
      focus: 'Focus: Heavy sets and explosive movements.',
      color: '#F97316', // Orange
      icon: '🏋️‍♂️',
    },
    {
      title: 'CARDIOVASCULAR ENDURANCE',
      points: cardioPoints || 75,
      percentage: cardioPct,
      focus: 'Focus: Sustained effort and elevated heart rate.',
      color: '#06B6D4', // Teal/Cyan
      icon: '🏃',
    },
    {
      title: 'FLEXIBILITY & MOBILITY',
      points: balancePoints || 50,
      percentage: balancePct,
      focus: 'Focus: Full range of motion and joint health.',
      color: '#2DD4BF', // Teal
      icon: '🧘',
    },
    {
      title: 'NUTRITION & RECOVERY',
      points: recoveryPoints || 25,
      percentage: recoveryPct,
      focus: 'Focus: Balanced meals and consistent rest.',
      color: '#FB923C', // Soft Orange
      icon: '🍏',
    },
  ];

  // Weekly Performance Trend data matching the screenshot
  const weeklyData = [
    { label: 'Sun 19', value: 40, color: '#F97316' },
    { label: 'Sat 07', value: 75, color: '#F97316' },
    { label: 'Tue 28', value: 50, color: '#2DD4BF' },
    { label: 'Wed 28', value: 70, color: '#2DD4BF' },
    { label: 'Thu 19', value: 50, color: '#2DD4BF' },
    { label: 'Fri 17', value: 90, color: '#2DD4BF' },
    { label: 'Sat 28', value: 25, color: '#F97316' },
  ];

  if (showDetailedAnalytics) {
    const formattedTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const hpp = Math.round(((cardioPoints || 0) / 11) * 10) / 10;
    const category = params.cardio !== undefined && params.cardio > 50 ? 'distance' : (params.strength !== undefined && params.strength > 50 ? 'strength' : 'duration');
    const breakdown = getPillarBreakdown(gainPoints, category);

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#0f172a' }]}>
        {/* Header Bar */}
        <View style={styles.benefitHeaderBar}>
          <View style={styles.headerIconCircle}>
            <Text style={styles.headerIconEmoji}>{getActivityEmoji(activityName)}</Text>
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.headerWorkoutTitle}>{duration} Mins {activityName}</Text>
            <Text style={styles.headerWorkoutTime}>🕒 {formattedTime}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.benefitsScrollView}
          contentContainerStyle={styles.benefitsScrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.innerContentWrapper}>
            <Text style={styles.sectionTitleLabel}>Logged Exercise Benefits</Text>

            <View style={styles.summaryGrid}>
              {/* Active Energy Column */}
              <View style={styles.summaryCol}>
                <View style={[styles.colBadgeCircle, styles.colBadgeActiveEnergy]}>
                  <Text style={styles.colEmoji}>🔥</Text>
                </View>
                <Text style={styles.colLabel}>TOTAL ACTIVE{'\n'}ENERGY BURNT:</Text>
                <Text style={styles.colValueMain}>{workoutCalories}</Text>
                <Text style={styles.colValueSub}>KCAL</Text>
              </View>

              {/* Gain Points Column */}
              <View style={styles.summaryCol}>
                <View style={[styles.colBadgeCircle, styles.colBadgeGainPoints]}>
                  <Text style={styles.colEmoji}>💓</Text>
                </View>
                <Text style={styles.colLabel}>TOTAL GAIN{'\n'}POINTS:</Text>
                <Text style={styles.colValueMain}>{gainPoints}</Text>
                <Text style={styles.colValueSub}>PTS</Text>
              </View>

              {/* Heart Points Column */}
              <View style={styles.summaryCol}>
                <View style={[styles.colBadgeCircle, styles.colBadgeHeartPoints]}>
                  <Text style={styles.colEmoji}>❤️</Text>
                </View>
                <Text style={styles.colLabel}>TOTAL{'\n'}HEART POINT:</Text>
                <Text style={styles.colValueMain}>{hpp}</Text>
                <Text style={styles.colValueSub}>HPP</Text>
              </View>
            </View>

            {/* Card 2: Circular Ring and Pillars Grid */}
            <View style={styles.card2Container}>
              <View style={styles.card2Row}>
                {renderCircularProgress(gainPoints, 300)}
                <View style={styles.card2RightCol}>
                  {/* Cardio */}
                  <View style={styles.cardioBarContainer}>
                    <Text style={styles.barTitleText}>Cardio</Text>
                    <Text style={styles.barSubtitleText}>Cardiovascular</Text>
                    <View style={styles.benefitBarTrack}>
                      <View
                        style={[
                          styles.benefitBarFill,
                          {
                            width: `${Math.min(100, (breakdown.cardio / breakdown.cardioTarget) * 100)}%`,
                            backgroundColor: '#ef4444',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barValueText}>
                      {breakdown.cardio}/{breakdown.cardioTarget}
                    </Text>
                  </View>

                  {/* Agility */}
                  <View>
                    <Text style={styles.barTitleText}>Agility</Text>
                    <Text style={styles.barSubtitleText}>Agility: {breakdown.agility} Pts</Text>
                    <View style={styles.benefitBarTrack}>
                      <View
                        style={[
                          styles.benefitBarFill,
                          {
                            width: `${Math.min(100, (breakdown.agility / breakdown.agilityTarget) * 100)}%`,
                            backgroundColor: '#22c55e',
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barValueText}>
                      {breakdown.agility}/{breakdown.agilityTarget}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Bottom Row: Metabolic and Structural */}
              <View style={styles.card2BottomRow}>
                {/* Metabolic */}
                <View style={styles.card2HalfColLeft}>
                  <Text style={styles.barTitleText}>Metabolic</Text>
                  <Text style={styles.barSubtitleText}>Cellular</Text>
                  <View style={styles.benefitBarTrack}>
                    <View
                      style={[
                        styles.benefitBarFill,
                        {
                          width: `${Math.min(100, (breakdown.metabolic / breakdown.metabolicTarget) * 100)}%`,
                          backgroundColor: '#06b6d4',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barValueText}>
                    {breakdown.metabolic}/{breakdown.metabolicTarget}
                  </Text>
                </View>

                {/* Structural */}
                <View style={styles.card2HalfColRight}>
                  <Text style={styles.barTitleText}>Structural</Text>
                  <Text style={styles.barSubtitleText}>Skeletal/Muscular</Text>
                  <View style={styles.benefitBarTrack}>
                    <View
                      style={[
                        styles.benefitBarFill,
                        {
                          width: `${Math.min(100, (breakdown.structural / breakdown.structuralTarget) * 100)}%`,
                          backgroundColor: '#3b82f6',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.barValueText}>
                    {breakdown.structural}/{breakdown.structuralTarget}
                  </Text>
                </View>
              </View>
            </View>

            {/* Go to Dashboard Link / Back Button */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (params.fromActivityTracking) {
                  navigation.navigate('DrawerNavigator', { screen: 'ActivityTracking' });
                } else {
                  navigation.navigate('DemoSearchHub');
                }
              }}
              style={styles.goToDashboardLink}
            >
              <Text style={styles.goToDashboardLinkText}>
                👉 Click here to see your fitness score
              </Text>
            </TouchableOpacity>

            {/* Understand Button */}
            <TouchableOpacity
              style={styles.understandBtn}
              onPress={() => {
                if (params.fromActivityTracking) {
                  navigation.navigate('DrawerNavigator', { screen: 'ActivityTracking' });
                } else {
                  navigation.navigate('DemoSearchHub');
                }
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.understandBtnText}>Understand</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {activityName.toUpperCase()} SUMMARY
        </Text>
        <View style={styles.emptyHeaderBlock} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* TOTAL POINTS EARNED CARD */}
        <View style={styles.summaryCard}>
          <View style={styles.donutContainer}>
            <Svg width={110} height={110} viewBox="0 0 100 100">
              <G transform="rotate(0, 50, 50)">
                {/* Background base circle */}
                <Circle
                  cx={50}
                  cy={50}
                  r={radius}
                  stroke="#1E293B"
                  strokeWidth={9}
                  fill="transparent"
                />
                {/* Dynamic segments */}
                 {Object.values(donutSegments).map((seg, idx) => (
                  <G key={idx} transform={`rotate(${seg.rotation}, 50, 50)`}>
                    <AnimatedCircle
                      cx={50}
                      cy={50}
                      r={radius}
                      stroke={seg.color}
                      strokeWidth={9}
                      fill="transparent"
                      strokeDasharray={circumference}
                      strokeDashoffset={getInterpolatedOffset(seg.percentage)}
                      strokeLinecap="round"
                    />
                  </G>
                ))}
              </G>
            </Svg>
          </View>
          <View style={styles.summaryTextContainer}>
            <Text style={styles.totalPointsLabel}>TOTAL POINTS EARNED:</Text>
            <Text style={styles.totalPointsText}>
              {totalPointsBase} <Text style={styles.ptsText}>PTS</Text>
            </Text>
            <Text style={styles.congratsText}>CONGRATULATIONS! GREAT WORK.</Text>
          </View>
        </View>

        {/* TDEE CARD SECTION */}
        <Text style={styles.sectionHeading}>DAILY ENERGY EXPENDITURE (TDEE)</Text>
        <View style={styles.tdeeCard}>
          <View style={styles.flameContainer}>
            <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth={2}>
              <Path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" fill="#F97316" />
            </Svg>
          </View>
          <View style={styles.tdeeDetailsContainer}>
            <Text style={styles.tdeeRowText}>
              ESTIMATED TOTAL: <Text style={styles.tdeeValueText}>{tdee.toLocaleString()} KCAL</Text>
            </Text>
            <Text style={styles.tdeeRowText}>
              WORKOUT CALORIES: <Text style={styles.tdeeValueText}>{workoutCalories} KCAL</Text>
            </Text>
          </View>
        </View>

        {/* Pillars Subheader */}
        <View style={styles.subheader}>
          <Text style={styles.subheaderTitle}>4 PILLARS OF FITNESS</Text>
          <Text style={styles.subheaderPercent}>{strengthPct}%</Text>
        </View>

        {/* 2x2 Grid Section */}
        <View style={styles.grid}>
          {pillars.map((pillar, index) => (
            <View key={index} style={[styles.card, { borderColor: pillar.color }]}>
              {/* Card Header */}
              <View style={[styles.cardHeader, { backgroundColor: pillar.color }]}>
                <Text style={styles.cardHeaderIcon}>{pillar.icon}</Text>
                <Text style={styles.cardHeaderTitle} numberOfLines={2}>
                  {pillar.title}
                </Text>
              </View>
              {/* Card Body */}
              <View style={styles.cardBody}>
                <Text style={styles.pointsLabel}>
                  POINTS: <Text style={styles.pointsValue}>{pillar.points}</Text>
                </Text>
                <Text style={[styles.percentageLabel, { color: pillar.color }]}>
                  {pillar.percentage}% of workout total
                </Text>
                <Text style={styles.focusText}>{pillar.focus}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Weekly Trend Section */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>WEEKLY PERFORMANCE TREND</Text>
          
          <View style={styles.chartContainer}>
            {/* Y-Axis Labels */}
            <View style={styles.yAxis}>
              <Text style={styles.axisText}>100</Text>
              <Text style={styles.axisText}>75</Text>
              <Text style={styles.axisText}>50</Text>
              <Text style={styles.axisText}>25</Text>
              <Text style={styles.axisText}>0</Text>
            </View>

            {/* Bars Column */}
            <View style={styles.barsContainer}>
              {/* Y-Axis background gridlines */}
              <View style={styles.gridLineContainer}>
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
                <View style={styles.gridLine} />
              </View>

              {/* Bars Row */}
              <View style={styles.barsRow}>
                {weeklyData.map((day, idx) => (
                  <View key={idx} style={styles.barColumn}>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${day.value}%`,
                            backgroundColor: day.color,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.barLabel}>{day.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Detailed Analytics Button */}
        <TouchableOpacity 
          style={styles.analyticsButton}
          activeOpacity={0.8}
          onPress={() => {
            if (params.showBenefitsNext) {
              setShowDetailedAnalytics(true);
            } else {
              navigation.navigate(ROUTES.DEMO_SEARCH_HUB);
            }
          }}
        >
          <Text style={styles.analyticsButtonText}>VIEW DETAILED ANALYTICS</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090D16', // Ultra premium deep space/dark theme matching screenshot
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#121B2D',
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backArrow: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    flex: 1,
    textAlign: 'center',
  },
  emptyHeaderBlock: {
    width: 32, // Balance backButton placeholder
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#0F1524',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#121B2D',
  },
  donutContainer: {
    marginRight: 16,
  },
  summaryTextContainer: {
    flex: 1,
  },
  totalPointsLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  totalPointsText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  ptsText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  congratsText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 4,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  tdeeCard: {
    flexDirection: 'row',
    backgroundColor: '#0F1524',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#121B2D',
  },
  flameContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tdeeDetailsContainer: {
    flex: 1,
    gap: 4,
  },
  tdeeRowText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tdeeValueText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  subheader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  subheaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  subheaderPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: '#06B6D4', // Teal/Cyan accent
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: '#111827', // Dark slate background for cards
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 8,
    height: 48,
  },
  cardHeaderIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  cardHeaderTitle: {
    flex: 1,
    fontSize: 10,
    fontWeight: '900',
    color: '#000000', // Dark contrast text matching header bg
  },
  cardBody: {
    padding: 12,
    backgroundColor: '#0F1524',
    minHeight: 110,
  },
  pointsLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  pointsValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  percentageLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  focusText: {
    fontSize: 10,
    color: '#9CA3AF',
    lineHeight: 14,
  },
  chartSection: {
    marginBottom: 24,
  },
  chartTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F1524',
    borderRadius: 16,
    padding: 16,
    height: 200,
    borderWidth: 1,
    borderColor: '#121B2D',
  },
  yAxis: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: 28,
    paddingRight: 8,
    height: 140,
    marginTop: 4,
  },
  axisText: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '600',
  },
  barsContainer: {
    flex: 1,
    position: 'relative',
    height: 160,
  },
  gridLineContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 140,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  gridLine: {
    height: 1,
    backgroundColor: '#1E293B',
    width: '100%',
  },
  barsRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    zIndex: 2,
    height: 160,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barTrack: {
    height: 120,
    justifyContent: 'flex-end',
    width: 14,
    backgroundColor: 'transparent',
    marginBottom: 8,
  },
  barFill: {
    width: 14,
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 9,
    color: '#9CA3AF',
    textAlign: 'center',
    fontWeight: '700',
  },
  analyticsButton: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#06B6D4', // Teal/Cyan border
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  analyticsButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#06B6D4',
    letterSpacing: 0.5,
  },
  benefitHeaderBar: {
    width: '100%',
    backgroundColor: '#1e1b4b',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  innerContentWrapper: {
    width: '100%',
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  sectionTitleLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.6,
    width: '100%',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 12,
  },
  summaryGrid: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    backgroundColor: '#151f32',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  colBadgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  colEmoji: {
    fontSize: 18,
  },
  colLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 6,
    height: 32,
    lineHeight: 12,
  },
  colValueMain: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    marginVertical: 4,
  },
  colValueSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 11,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIconEmoji: {
    fontSize: 22,
  },
  headerTextCol: {
    flex: 1,
  },
  headerWorkoutTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  headerWorkoutTime: {
    fontSize: 12.5,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  benefitsScrollView: {
    width: '100%',
    flex: 1,
  },
  benefitsScrollViewContent: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  colBadgeActiveEnergy: {
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
  },
  colBadgeGainPoints: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
  },
  colBadgeHeartPoints: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  cardioBarContainer: {
    marginBottom: 12,
  },
  card2Container: {
    width: '100%',
    backgroundColor: '#151f32',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    marginTop: 12,
  },
  card2Row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  card2RightCol: {
    flex: 1,
    marginLeft: 16,
  },
  card2BottomRow: {
    flexDirection: 'row',
    width: '100%',
  },
  card2HalfColLeft: {
    flex: 1,
    marginRight: 8,
  },
  card2HalfColRight: {
    flex: 1,
    marginLeft: 8,
  },
  circularProgressContainer: {
    position: 'relative',
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressCenterText: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressValue: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
  },
  circularProgressLabel: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  circularProgressTarget: {
    position: 'absolute',
    bottom: 4,
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  barTitleText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#e2e8f0',
  },
  barSubtitleText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 1,
  },
  barValueText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 2,
  },
  benefitBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  benefitBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  goToDashboardLink: {
    alignSelf: 'center',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.25)',
    marginTop: 24,
    marginBottom: 24,
  },
  goToDashboardLinkText: {
    color: '#06b6d4',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  understandBtn: {
    width: '100%',
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f43f5e',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f43f5e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
  },
  understandBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default DemoPostWorkoutSummaryScreen;
