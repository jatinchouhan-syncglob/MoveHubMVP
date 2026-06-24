import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../../theme';
import { STRINGS } from '../../constants/strings';
import { CustomHeader } from '../../components/common/CustomHeader';
import { Loader } from '../../components/common/Loader';
import { CustomButton } from '../../components/common/CustomButton';
import { StatCard } from '../../components/cards/StatCard';
import { ActivityCard } from '../../components/cards/ActivityCard';
import { TrendChart } from '../../components/charts/TrendChart';
import { apiService } from '../../services/api';
import { UserProfile, Activity, TrendData } from '../../types';
import { getInitials } from '../../utils/helpers';
import {
  sumCaloriesBurned,
  sumActiveMinutes,
  calculateGoalPercentage,
} from '../../utils/calculations';

export const DashboardScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [calorieTrends, setCalorieTrends] = useState<TrendData | null>(null);
  const [celebrationVisible, setCelebrationVisible] = useState(false);

  const fetchData = async () => {
    try {
      const [profileData, activitiesData, trendsData] = await Promise.all([
        apiService.getProfile(),
        apiService.getActivities(),
        apiService.getCalorieTrends(),
      ]);

      setProfile(profileData);
      setActivities(activitiesData);
      setCalorieTrends(trendsData);

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
    const timestamp = new Date(activity.timestamp).getTime();
    return timestamp >= startOfToday;
  });

  const todayCalories = sumCaloriesBurned(todayActivities);
  const todayMinutes = sumActiveMinutes(todayActivities);
  const totalSteps = todayActivities
    .filter(a => a.type === 'Walking')
    .reduce((sum, act) => sum + act.value, 0);

  const goalPercentage = profile
    ? calculateGoalPercentage(todayCalories, profile.calorieGoal)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={STRINGS.DASHBOARD.TITLE} showDrawerButton />

      {/* Background Soft Glow Spots */}
      <View style={styles.glowSpot1} />
      <View style={styles.glowSpot2} />

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
        {/* Welcome Profile Card Banner */}
        <LinearGradient
          colors={[theme.colors.primary, '#4f46e5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeCard}
        >
          <View style={styles.welcomeTop}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {profile ? getInitials(profile.name) : 'MH'}
              </Text>
            </View>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting} numberOfLines={1}>
                Hello, {profile?.name || 'User'}! 👋
              </Text>
              <Text style={styles.subGreeting}>
                Let's smash your health targets today.
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Daily Calorie Goal Progress Track */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressTitle}>🔥 Daily Calorie Target</Text>
              <Text style={styles.progressValue}>
                {todayCalories.toLocaleString()} /{' '}
                {(profile?.calorieGoal || 2400).toLocaleString()} kcal
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${goalPercentage}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercentageText}>
              {goalPercentage}% completed
            </Text>
          </View>
        </LinearGradient>

        {/* Stats Grid */}
        <Text style={styles.sectionTitle}>{STRINGS.DASHBOARD.TODAY_STATS}</Text>
        <View style={styles.statsGrid}>
          <View style={styles.row}>
            <StatCard
              title="Energy Burned"
              value={todayCalories}
              unit="kcal"
              icon="🔥"
            />
            <StatCard
              title="Steps Taken"
              value={totalSteps}
              unit="steps"
              icon="👣"
            />
          </View>
          <View style={styles.row}>
            <StatCard
              title="Active Time"
              value={todayMinutes}
              unit="mins"
              icon="⚡"
            />
            <StatCard
              title="Active Workouts"
              value={activities.length}
              unit="logs"
              icon="🏆"
            />
          </View>
        </View>

        {/* Weekly Trend Chart */}
        {calorieTrends && (
            <TrendChart
              title={STRINGS.DASHBOARD.WEEKLY_TRENDS}
              trendData={calorieTrends}
            />
        )}

        {/* Recent Activities Section */}
        <View style={styles.activitiesHeader}>
          <Text style={styles.sectionTitle}>
            {STRINGS.DASHBOARD.RECENT_ACTIVITIES}
          </Text>
        </View>

        {activities.length === 0 ? (
          <Text style={styles.noActivitiesText}>
            No recent activities logged.
          </Text>
        ) : (
          activities
            .slice(0, 3)
            .map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))
        )}
      </ScrollView>

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
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: 'relative',
  },
  glowSpot1: {
    position: 'absolute',
    top: '5%',
    right: '-15%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.primaryLight + '25',
    zIndex: -1,
  },
  glowSpot2: {
    position: 'absolute',
    bottom: '30%',
    left: '-15%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.secondary + '08',
    zIndex: -1,
  },
  scrollContent: {
    padding: theme.spacing.containerPadding,
  },
  welcomeCard: {
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
    // iOS shadow
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  welcomeTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: theme.fonts.sizes.base,
    fontWeight: theme.fonts.weights.bold as any,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: 13,
    color: '#E0E7FF',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: theme.spacing.md,
  },
  progressSection: {
    width: '100%',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  progressTitle: {
    fontSize: 13.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#FFFFFF',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: theme.fonts.weights.semibold as any,
    color: '#FFFFFF',
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#14b8a6', // beautiful teal fill
  },
  progressPercentageText: {
    fontSize: 11,
    color: '#E0E7FF',
    textAlign: 'right',
  },
  sectionTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  activitiesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  noActivitiesText: {
    fontSize: 14.5,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: theme.spacing.lg,
  },
  celebrationModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)', // dark immersive background backdrop overlay
  },
  celebrationContent: {
    width: '85%',
    backgroundColor: '#1e1b4b', // deep indigo premium card background
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#facc15', // yellow-400 / gold accent border
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
    color: '#fef08a', // light yellow / soft gold glow
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  celebrationSubtitle: {
    fontSize: 15,
    color: '#e2e8f0', // slate-200
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  celebrationHighlight: {
    color: '#facc15', // vibrant gold
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
    color: '#a5f3fc', // premium cyan accent
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 28,
  },
  celebrationCloseBtn: {
    width: '100%',
    backgroundColor: '#facc15', // gold background
    borderRadius: 12,
    borderWidth: 0,
    shadowColor: '#facc15',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  celebrationCloseBtnText: {
    color: '#1e1b4b', // deep contrast text for maximum readability
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default DashboardScreen;
