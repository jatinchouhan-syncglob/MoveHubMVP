import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { theme } from '../../theme';
import { STRINGS } from '../../constants/strings';
import { CustomHeader } from '../../components/common/CustomHeader';
import { Loader } from '../../components/common/Loader';
import { StatCard } from '../../components/cards/StatCard';
import { ActivityCard } from '../../components/cards/ActivityCard';
import { TrendChart } from '../../components/charts/TrendChart';
import { apiService } from '../../services/api';
import { UserProfile, Activity, TrendData } from '../../types';
import { getInitials } from '../../utils/helpers';
import { sumCaloriesBurned, sumActiveMinutes, calculateGoalPercentage } from '../../utils/calculations';

export const DashboardScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [calorieTrends, setCalorieTrends] = useState<TrendData | null>(null);

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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return <Loader fullScreen message="Loading dashboard statistics..." />;
  }

  const todayCalories = sumCaloriesBurned(activities);
  const todayMinutes = sumActiveMinutes(activities);
  const totalSteps = activities
    .filter(a => a.type === 'Walking')
    .reduce((sum, act) => sum + act.value, 0);

  const goalPercentage = profile ? calculateGoalPercentage(todayCalories, profile.calorieGoal) : 0;

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={STRINGS.DASHBOARD.TITLE} showDrawerButton />
      
      {/* Background Soft Glow Spots */}
      <View style={styles.glowSpot1} />
      <View style={styles.glowSpot2} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
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
              <Text style={styles.subGreeting}>Let's smash your health targets today.</Text>
            </View>
          </View>
          
          <View style={styles.divider} />

          {/* Daily Calorie Goal Progress Track */}
          <View style={styles.progressSection}>
            <View style={styles.progressLabels}>
              <Text style={styles.progressTitle}>🔥 Daily Calorie Target</Text>
              <Text style={styles.progressValue}>
                {todayCalories.toLocaleString()} / {(profile?.calorieGoal || 2400).toLocaleString()} kcal
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${goalPercentage}%` }]} />
            </View>
            <Text style={styles.progressPercentageText}>{goalPercentage}% completed</Text>
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
              progress={goalPercentage / 100}
              progressColor={theme.colors.primary}
            />
            <StatCard
              title="Steps Taken"
              value={totalSteps || 8400}
              unit="steps"
              icon="👣"
              progress={totalSteps ? totalSteps / 10000 : 0.84}
              progressColor={theme.colors.secondary}
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
          <Text style={styles.sectionTitle}>{STRINGS.DASHBOARD.RECENT_ACTIVITIES}</Text>
        </View>
        
        {activities.slice(0, 3).map((activity) => (
          <ActivityCard key={activity.id} activity={activity} />
        ))}
      </ScrollView>
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
});

export default DashboardScreen;
