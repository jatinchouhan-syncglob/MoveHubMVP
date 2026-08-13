import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  Modal,
  TouchableOpacity,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../theme';
import { STRINGS } from '../../constants/strings';
import { CustomHeader } from '../../components/common/CustomHeader';
import { Loader } from '../../components/common/Loader';
import { CustomButton } from '../../components/common/CustomButton';
import { apiService } from '../../services/api';
import { UserProfile, Activity } from '../../types';
import StepsTrackingTab from '../GoogleFit';
import {
  sumCaloriesBurned,
  sumActiveMinutes,
} from '../../utils/calculations';

export const DashboardScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [celebrationVisible, setCelebrationVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'activities' | 'steps'>('activities');

  const getActivityCategory = (type: string): 'distance' | 'strength' | 'duration' => {
    const distanceTypes = ['Walking', 'Running', 'Cycling', 'Hiking', 'Jogging', 'Swimming'];
    const strengthTypes = ['Workout', 'Deadlifts / Weights', 'Barbell Back Squats', 'Bench Press', 'Push-ups / Calisthenics', 'Plank / Core'];
    
    if (distanceTypes.includes(type)) {
      return 'distance';
    }
    if (strengthTypes.includes(type)) {
      return 'strength';
    }
    return 'duration';
  };

  const getActivityGainPoints = (act: Activity, userWeight: number) => {
    if (act.gainPoints !== undefined) return act.gainPoints;
    const weight = userWeight || 70;
    if (!act.caloriesBurned) return 0;
    return Math.round(act.caloriesBurned / (weight * 0.0175));
  };

  const getActivityCardioPoints = (act: Activity, gainPoints: number) => {
    if (act.cardioPoints !== undefined) return act.cardioPoints;
    const category = getActivityCategory(act.type);
    if (category === 'strength') {
      return Math.round(gainPoints * 0.2);
    } else if (category === 'distance') {
      return Math.round(gainPoints * 0.8);
    } else {
      return Math.round(gainPoints * 0.5);
    }
  };

  const getActivityHpp = (cardioPoints: number) => {
    return Math.round((cardioPoints / 11) * 10) / 10;
  };

  const getPillarsForToday = (todayActs: Activity[]) => {
    let totalCardio = 0;
    let totalAgility = 0;
    let totalMetabolic = 0;
    let totalStructural = 0;

    const cardioTarget = 80;
    const agilityTarget = 80;
    const metabolicTarget = 50;
    const structuralTarget = 20;

    todayActs.forEach(act => {
      const gainPoints = getActivityGainPoints(act, profile?.weight || 70);
      const category = getActivityCategory(act.type);

      let cardioPct = 0.5;
      let agilityPct = 0.4;
      let metabolicPct = 0.3;
      let structuralPct = 0.2;

      if (category === 'strength') {
        cardioPct = 0.2;
        agilityPct = 0.3;
        metabolicPct = 0.4;
        structuralPct = 0.8;
      } else if (category === 'distance') {
        cardioPct = 0.8;
        agilityPct = 0.5;
        metabolicPct = 0.6;
        structuralPct = 0.1;
      } else {
        cardioPct = 0.67;
        agilityPct = 0.4;
        metabolicPct = 0.2;
        structuralPct = 0.1;
      }

      totalCardio += gainPoints * cardioPct;
      totalAgility += gainPoints * agilityPct;
      totalMetabolic += gainPoints * metabolicPct;
      totalStructural += gainPoints * structuralPct;
    });

    const cardio = Math.min(cardioTarget, Math.round(totalCardio));
    const agility = Math.min(agilityTarget, Math.round(totalAgility));
    const metabolic = Math.min(metabolicTarget, Math.round(totalMetabolic));
    const structural = Math.min(structuralTarget, Math.round(totalStructural));

    return {
      cardio,
      cardioTarget,
      agility,
      agilityTarget,
      metabolic,
      metabolicTarget,
      structural,
      structuralTarget,
    };
  };

  const renderConcentricRings = (
    cardio: number,
    cardioTarget: number,
    agility: number,
    agilityTarget: number,
    metabolic: number,
    metabolicTarget: number,
    structural: number,
    structuralTarget: number,
    overallScore: number
  ) => {
    const size = 180;
    const cx = size / 2;
    const cy = size / 2;
    const strokeWidth = 7;

    const r1 = 80; // Cardio (outer)
    const r2 = 72; // Agility
    const r3 = 64; // Metabolic
    const r4 = 56; // Structural

    const getDashProps = (val: number, target: number, r: number) => {
      const circum = 2 * Math.PI * r;
      const pct = Math.min(1, val / target);
      const strokeDashoffset = circum * (1 - pct);
      return {
        strokeDasharray: `${circum} ${circum}`,
        strokeDashoffset,
      };
    };

    return (
      <View style={styles.concentricOuterWrapper}>
        <View style={styles.concentricInnerRow}>
          <View style={styles.concentricWrapper}>
            <Svg width={size} height={size}>
              {/* Tracks */}
              <Circle cx={cx} cy={cy} r={r1} stroke="#1e293b" strokeWidth={strokeWidth} fill="none" opacity={0.5} />
              <Circle cx={cx} cy={cy} r={r2} stroke="#1e293b" strokeWidth={strokeWidth} fill="none" opacity={0.5} />
              <Circle cx={cx} cy={cy} r={r3} stroke="#1e293b" strokeWidth={strokeWidth} fill="none" opacity={0.5} />
              <Circle cx={cx} cy={cy} r={r4} stroke="#1e293b" strokeWidth={strokeWidth} fill="none" opacity={0.5} />

              {/* Cardio Progress - Red */}
              <Circle
                cx={cx}
                cy={cy}
                r={r1}
                stroke="#ef4444"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                {...getDashProps(cardio, cardioTarget, r1)}
              />

              {/* Agility Progress - Green */}
              <Circle
                cx={cx}
                cy={cy}
                r={r2}
                stroke="#22c55e"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                {...getDashProps(agility, agilityTarget, r2)}
              />

              {/* Metabolic Progress - Teal */}
              <Circle
                cx={cx}
                cy={cy}
                r={r3}
                stroke="#06b6d4"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                {...getDashProps(metabolic, metabolicTarget, r3)}
              />

              {/* Structural Progress - Blue */}
              <Circle
                cx={cx}
                cy={cy}
                r={r4}
                stroke="#3b82f6"
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
                {...getDashProps(structural, structuralTarget, r4)}
              />
            </Svg>

            {/* Center Text Container */}
            <View style={styles.concentricCenterText}>
              <Text style={styles.concentricLabel}>OVERALL</Text>
              <Text style={styles.concentricLabel}>FITNESS SCORE:</Text>
              <Text style={styles.concentricValue}>{overallScore}</Text>
            </View>
          </View>

          {/* Labels Overlay */}
          <View style={styles.ringLabelOverlay}>
            <Text style={[styles.ringLabelItemText, { color: '#ef4444', top: -5 }]}>Cardio</Text>
            <Text style={[styles.ringLabelItemText, { color: '#22c55e', top: 9 }]}>Agility</Text>
            <Text style={[styles.ringLabelItemText, { color: '#06b6d4', top: 23 }]}>Metabolic</Text>
            <Text style={[styles.ringLabelItemText, { color: '#3b82f6', top: 37 }]}>Structural</Text>
          </View>
        </View>

        <Text style={styles.summaryFooterText}>
          Overall Health Gain Score:{' '}
          <Text style={{ color: '#22c55e', fontWeight: '800' }}>
            {overallScore} pts
          </Text>
          {'\n'}
          <Text style={{ fontSize: 11, color: '#94a3b8', fontWeight: '500' }}>
            (from all activities today)
          </Text>
        </Text>
      </View>
    );
  };

  const fetchData = async () => {
    try {
      const [profileData, activitiesData] = await Promise.all([
        apiService.getProfile(),
        apiService.getActivities(),
      ]);

      setProfile(profileData);
      setActivities(activitiesData);

      // Check if target is achieved today (since midnight)
      const today = new Date();
      const startOfToday = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      ).getTime();
      const todayCal = activitiesData
        .filter(activity => {
          const timestamp = new Date(activity.timestamp).getTime();
          return timestamp >= startOfToday;
        })
        .reduce((sum, act) => sum + (act.caloriesBurned || 0), 0);

      const target = profileData.calorieGoal || 2400;
      if (todayCal >= target && todayCal > 0) {
        setCelebrationVisible(true);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Re-fetch data and check target every time the dashboard screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, []),
  );

  // Auto-close target achieved celebration modal after 3 seconds
  useEffect(() => {
    let timer: any;
    if (celebrationVisible) {
      timer = setTimeout(() => {
        setCelebrationVisible(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [celebrationVisible]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return <Loader fullScreen message="Loading dashboard statistics..." />;
  }

  // Filter activities to only calculate stats for today (since midnight)
  const todayActivities = activities.filter(activity => {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    ).getTime();
    
    let tsStr = String(activity.timestamp || '').trim();
    if (tsStr.includes(' ') && !tsStr.includes('T')) {
      tsStr = tsStr.replace(' ', 'T');
    }
    if (tsStr.includes('T') && !tsStr.endsWith('Z') && !tsStr.includes('+') && !tsStr.includes('-')) {
      tsStr = tsStr + 'Z';
    }
    const parsedDate = new Date(tsStr);
    const timestamp = !isNaN(parsedDate.getTime()) ? parsedDate.getTime() : new Date().getTime();
    
    return timestamp >= startOfToday;
  });

  const todayCalories = sumCaloriesBurned(todayActivities);
  const todayMinutes = sumActiveMinutes(todayActivities);


  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title={STRINGS.DASHBOARD.TITLE}
        showDrawerButton
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />

      {/* Background Soft Glow Spots */}
      <View style={styles.glowSpot1} />
      <View style={styles.glowSpot2} />

      {/* Dashboard Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'activities' && styles.tabButtonActive]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('activities')}
        >
          <Text style={[styles.tabText, activeTab === 'activities' && styles.tabTextActive]}>
            All Activities
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'steps' && styles.tabButtonActive]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('steps')}
        >
          <Text style={[styles.tabText, activeTab === 'steps' && styles.tabTextActive]}>
            Steps Tracking
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'activities' ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        >
        {/* ==========================================
            SECTION 1: TODAY'S LOGGED EXERCISES
            ========================================== */}
        <Text style={styles.sectionTitleLabel}>Today's Logged Exercises</Text>
        <View style={styles.todayExercisesContainer}>
          {todayActivities.length === 0 ? (
            <Text style={styles.noExerciseText}>No exercises logged today yet.</Text>
          ) : (
            todayActivities.map((act, index) => {
              const actDateObj = new Date(act.timestamp);
              const actTime = actDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const actType = act.type || 'Workout';
              const actCalories = act.caloriesBurned || 0;
              const actPoints = getActivityGainPoints(act, profile?.weight || 70);
              const actCardio = getActivityCardioPoints(act, actPoints);
              const actHpp = getActivityHpp(actCardio);

              return (
                <View key={act.id || index} style={styles.todayExerciseRow}>
                  <Text style={styles.runnerEmoji}>🏃‍♂️</Text>
                  <View style={styles.todayExerciseTextCol}>
                    <Text style={styles.todayExerciseText}>
                      {index + 1}. {actType} - {actTime}
                    </Text>
                    <Text style={styles.todayExerciseSubText}>
                      (pts: {actPoints}, cal: {actCalories}, hpp: {actHpp})
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* ==========================================
            SECTION 2: DAILY FITNESS TARGETS & PROGRESS
            ========================================== */}
        {(() => {
          const calorieGoal = profile?.calorieGoal || 2400;
          const activeEnergyPct = Math.min(100, (todayCalories / calorieGoal) * 100);
          
          const todayGainPoints = todayActivities.reduce((sum, act) => {
            return sum + getActivityGainPoints(act, profile?.weight || 70);
          }, 0);
          const gainPointsPct = Math.min(100, (todayGainPoints / 300) * 100);

          const todayHpp = Math.round(todayActivities.reduce((sum, act) => {
            const actPoints = getActivityGainPoints(act, profile?.weight || 70);
            const actCardio = getActivityCardioPoints(act, actPoints);
            return sum + getActivityHpp(actCardio);
          }, 0) * 10) / 10;
          const heartPointsPct = Math.min(100, (todayHpp / 10) * 100);

          const pillars = getPillarsForToday(todayActivities);

          return (
            <>
              <Text style={styles.sectionTitleLabel}>Daily Fitness Overview & Progress</Text>
              
              <View style={styles.summaryGrid}>
                {/* Active Energy Column */}
                <View style={styles.summaryCol}>
                  <View style={[styles.colBadgeCircle, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
                    <Text style={styles.colEmoji}>🔥</Text>
                  </View>
                  <Text style={styles.colLabel}>Total Active Energy</Text>
                  <View style={styles.colProgressBg}>
                    <View style={[styles.colProgressFill, { width: `${activeEnergyPct}%`, backgroundColor: '#f97316' }]} />
                  </View>
                  <Text style={styles.colValueSub}>{todayCalories} kcal / {calorieGoal} kcal</Text>
                </View>

                {/* Gain Points Column */}
                <View style={styles.summaryCol}>
                  <View style={[styles.colBadgeCircle, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                    <Text style={styles.colEmoji}>⭐</Text>
                  </View>
                  <Text style={styles.colLabel}>Total Gain Points</Text>
                  <View style={styles.colProgressBg}>
                    <View style={[styles.colProgressFill, { width: `${gainPointsPct}%`, backgroundColor: '#22c55e' }]} />
                  </View>
                  <Text style={styles.colValueSub}>{todayGainPoints} points / 300 pts</Text>
                </View>

                {/* Heart Points Column */}
                <View style={styles.summaryCol}>
                  <View style={[styles.colBadgeCircle, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                    <Text style={styles.colEmoji}>❤️</Text>
                  </View>
                  <Text style={styles.colLabel}>Total Heart Points</Text>
                  <View style={styles.colProgressBg}>
                    <View style={[styles.colProgressFill, { width: `${heartPointsPct}%`, backgroundColor: '#ef4444' }]} />
                  </View>
                  <Text style={styles.colValueSub}>{todayHpp} HPP / 10.0 HPP</Text>
                </View>
              </View>

              <View style={[styles.overviewBarsContainer, { marginTop: 12 }]}>
                {/* Cardio */}
                <View style={styles.overviewBarRow}>
                  <View style={styles.barHeaderInfo}>
                    <Text style={styles.barLabelText}>Cardio</Text>
                    <Text style={styles.barValueText}>{Math.round((pillars.cardio / pillars.cardioTarget) * 100)}% - {pillars.cardio}/{pillars.cardioTarget}</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(pillars.cardio / pillars.cardioTarget) * 100}%`, backgroundColor: '#ef4444' }]} />
                  </View>
                </View>

                {/* Agility */}
                <View style={styles.overviewBarRow}>
                  <View style={styles.barHeaderInfo}>
                    <Text style={styles.barLabelText}>Agility</Text>
                    <Text style={styles.barValueText}>{Math.round((pillars.agility / pillars.agilityTarget) * 100)}% - {pillars.agility}/{pillars.agilityTarget}</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(pillars.agility / pillars.agilityTarget) * 100}%`, backgroundColor: '#22c55e' }]} />
                  </View>
                </View>

                {/* Metabolic */}
                <View style={styles.overviewBarRow}>
                  <View style={styles.barHeaderInfo}>
                    <Text style={styles.barLabelText}>Metabolic</Text>
                    <Text style={styles.barValueText}>{Math.round((pillars.metabolic / pillars.metabolicTarget) * 100)}% - {pillars.metabolic}/{pillars.metabolicTarget}</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(pillars.metabolic / pillars.metabolicTarget) * 100}%`, backgroundColor: '#06b6d4' }]} />
                  </View>
                </View>

                {/* Structural */}
                <View style={styles.overviewBarRow}>
                  <View style={styles.barHeaderInfo}>
                    <Text style={styles.barLabelText}>Structural</Text>
                    <Text style={styles.barValueText}>{Math.round((pillars.structural / pillars.structuralTarget) * 100)}% - {pillars.structural}/{pillars.structuralTarget}</Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${(pillars.structural / pillars.structuralTarget) * 100}%`, backgroundColor: '#3b82f6' }]} />
                  </View>
                </View>
              </View>

              {/* ==========================================
                  SECTION 3: CONCENTRIC RINGS VISUAL CHART
                  ========================================== */}
              <Text style={styles.sectionTitleLabel}>Overall Fitness Balance</Text>
              {renderConcentricRings(
                pillars.cardio,
                pillars.cardioTarget,
                pillars.agility,
                pillars.agilityTarget,
                pillars.metabolic,
                pillars.metabolicTarget,
                pillars.structural,
                pillars.structuralTarget,
                todayGainPoints
              )}
            </>
          );
        })()}
      </ScrollView>
      ) : (
        <StepsTrackingTab />
      )}

      {/* Celebration Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={celebrationVisible}
        onRequestClose={() => setCelebrationVisible(false)}
      >
        <View style={styles.celebrationModalContainer}>
          <View style={styles.celebrationContent}>
            <Text style={styles.celebrationEmoji}>🏆 🎉 🥳</Text>
            <Text style={styles.celebrationTitle}>Target Achieved!</Text>

            <Text style={styles.celebrationSubtitle}>
              Congratulations! You've successfully completed your daily active
              burn goal of{' '}
              <Text style={styles.celebrationHighlight}>
                {profile?.calorieGoal || 2400} kcal
              </Text>{' '}
              today!
            </Text>

            <View style={styles.celebrationStatsRow}>
              <View style={styles.celebrationStatBox}>
                <Text style={styles.celebrationStatValue}>
                  🔥 {todayCalories} kcal
                </Text>
                <Text style={styles.celebrationStatLabel}>Burned</Text>
              </View>
              <View style={styles.celebrationStatBox}>
                <Text style={styles.celebrationStatValue}>
                  ⚡ {todayMinutes} mins
                </Text>
                <Text style={styles.celebrationStatLabel}>Duration</Text>
              </View>
            </View>

            <Text style={styles.celebrationFooterText}>
              Keep up the amazing momentum! 💪
            </Text>

            <CustomButton
              title="Awesome!"
              onPress={() => setCelebrationVisible(false)}
              variant="primary"
              style={styles.celebrationCloseBtn}
              textStyle={styles.celebrationCloseBtnText}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#151f32',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    position: 'relative',
  },
  headerContainer: {
    backgroundColor: '#0B0F19',
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    color: '#FFFFFF',
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
    top: '5%',
    right: '-15%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.primaryLight + '15',
    zIndex: -1,
  },
  glowSpot2: {
    position: 'absolute',
    bottom: '30%',
    left: '-15%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.secondary + '05',
    zIndex: -1,
  },
  scrollContent: {
    padding: theme.spacing.containerPadding,
  },
  sectionTitleLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.6,
    width: '100%',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginTop: 18,
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
    fontSize: 9.5,
    fontWeight: '800',
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 6,
    height: 24,
  },
  colProgressBg: {
    width: '75%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  colProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  colValueSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#cbd5e1',
    textAlign: 'center',
  },
  overviewBarsContainer: {
    width: '100%',
    backgroundColor: '#151f32',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  overviewBarRow: {
    marginBottom: 12,
  },
  barHeaderInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  barLabelText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#e2e8f0',
  },
  barValueText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94a3b8',
  },
  barTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  concentricOuterWrapper: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#151f32',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
    justifyContent: 'center',
    marginBottom: 20,
  },
  concentricInnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  summaryFooterText: {
    fontSize: 13.5,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
  },
  concentricWrapper: {
    position: 'relative',
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  concentricCenterText: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
    height: 120,
  },
  concentricLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  concentricValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
  },
  ringLabelOverlay: {
    marginLeft: 16,
    justifyContent: 'center',
    height: 120,
  },
  ringLabelItemText: {
    fontSize: 11,
    fontWeight: '800',
    position: 'relative',
  },
  todayExercisesContainer: {
    width: '100%',
    backgroundColor: '#151f32',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  todayExerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  runnerEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  todayExerciseTextCol: {
    flex: 1,
  },
  todayExerciseText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#e2e8f0',
    lineHeight: 18,
  },
  todayExerciseSubText: {
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    marginTop: 2,
  },
  noExerciseText: {
    fontSize: 12.5,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  celebrationModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  celebrationContent: {
    width: '85%',
    backgroundColor: '#1e1b4b',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#facc15',
    shadowColor: '#facc15',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
  celebrationEmoji: {
    fontSize: 42,
    marginBottom: 16,
  },
  celebrationTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fef08a',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  celebrationSubtitle: {
    fontSize: 15,
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  celebrationHighlight: {
    color: '#facc15',
    fontWeight: 'bold',
  },
  celebrationStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 24,
  },
  celebrationStatBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 14,
    marginHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.25)',
  },
  celebrationStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  celebrationStatLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  celebrationFooterText: {
    fontSize: 14.5,
    color: '#a5f3fc',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 28,
  },
  celebrationCloseBtn: {
    width: '100%',
    backgroundColor: '#facc15',
    borderRadius: 12,
    borderWidth: 0,
    shadowColor: '#facc15',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  celebrationCloseBtnText: {
    color: '#1e1b4b',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DashboardScreen;
