import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { useDrawer, DrawerProvider, DrawerScreenType } from './DrawerContext';
import { apiService } from '../services/api';
import { UserProfile } from '../types';
import { getInitials } from '../utils/helpers';

// Import Screens
import DashboardScreen from '../screens/Dashboard';
import ActivityTrackingScreen from '../screens/ActivityTracking';
import LeaderboardScreen from '../screens/Leaderboard';
import InsightsScreen from '../screens/Insights';
import ProfileScreen from '../screens/Profile';
import UnderProgress from '../components/common/UnderProgress';

const DRAWER_WIDTH = 290;

const DrawerNavigatorContent: React.FC = () => {
  const { isOpen, activeScreen, closeDrawer, setActiveScreen } = useDrawer();
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Dynamic drawer profile states
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [todayCalories, setTodayCalories] = React.useState(0);

  // Fetch profile and daily achievements when drawer opens/mounts
  useEffect(() => {
    const fetchDrawerData = async () => {
      try {
        const [profileData, activitiesData] = await Promise.all([
          apiService.getProfile(),
          apiService.getActivities(),
        ]);
        setProfile(profileData);

        // Sum up today's calories for progress bar
        const total = activitiesData.reduce(
          (sum, act) => sum + (act.caloriesBurned || 0),
          0,
        );
        setTodayCalories(total);
      } catch (error) {
        console.error('Failed to load profile in drawer:', error);
      }
    };

    fetchDrawerData();
  }, [isOpen]);

  // Run translation animation when drawer open state toggles
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isOpen, slideAnim]);

  // Interpolate slide transition values
  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  // Interpolate backdrop dim opacity
  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  // Render the currently selected screen
  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'ActivityTracking':
        return <ActivityTrackingScreen />;
      case 'Leaderboard':
        return <LeaderboardScreen />;
      case 'Insights':
        return <InsightsScreen />;
        // return <UnderProgress />;
      case 'Profile':
        return <ProfileScreen />;
      case 'Dashboard':
      default:
        return <DashboardScreen />;
    }
  };

  const menuItems: { screen: DrawerScreenType; label: string; icon: string }[] =
    [
      { screen: 'Dashboard', label: 'Dashboard', icon: '📊' },
      { screen: 'ActivityTracking', label: 'Activity Tracking', icon: '🏃‍♂️' },
      { screen: 'Leaderboard', label: 'Leaderboard', icon: '🏆' },
      { screen: 'Insights', label: 'Insights & Trends', icon: '💡' },
      { screen: 'Profile', label: 'My Profile', icon: '👤' },
    ];

  // Calculate percentage of daily calorie goal
  const calorieGoal = profile?.calorieGoal || 2400;
  const progressPercent = Math.min((todayCalories / calorieGoal) * 100, 100);

  return (
    <View style={styles.container}>
      {/* Active Screen Render Layer */}
      <View style={styles.screenWrapper}>{renderActiveScreen()}</View>

      {/* Backdrop Dim Overlay (Renders touchable area to close the drawer) */}
      {isOpen && (
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <View style={styles.backdropPressArea} />
          </TouchableWithoutFeedback>
        </Animated.View>
      )}

      {/* Sliding Drawer Menu Layer */}
      <Animated.View
        style={[styles.drawerPanel, { transform: [{ translateX }] }]}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
          {/* Header Profile Card */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarGlow} />
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile ? getInitials(profile.name) : 'MH'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {profile?.name || 'Loading...'}
              </Text>
              <Text style={styles.profileSub} numberOfLines={1}>
                🔥 {todayCalories.toLocaleString()} /{' '}
                {calorieGoal.toLocaleString()} kcal
              </Text>

              {/* Daily Calorie Goal Progress Bar */}
              <View style={styles.miniProgressTrack}>
                <View
                  style={[
                    styles.miniProgressFill,
                    { width: `${progressPercent}%` },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Menu Items List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.menuContainer}>
              {menuItems.map(item => {
                const isActive = activeScreen === item.screen;
                return (
                  <TouchableOpacity
                    key={item.screen}
                    style={[styles.menuItem, isActive && styles.activeMenuItem]}
                    activeOpacity={0.7}
                    onPress={() => {
                      setActiveScreen(item.screen);
                      closeDrawer();
                    }}
                  >
                    {/* Active vertical left accent line */}
                    {isActive && <View style={styles.activeIndicator} />}

                    <Text
                      style={[
                        styles.menuIcon,
                        isActive && styles.activeMenuIcon,
                      ]}
                    >
                      {item.icon}
                    </Text>
                    <Text
                      style={[
                        styles.menuLabel,
                        isActive && styles.activeMenuLabel,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Section */}
          <View style={styles.footer}>
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>🛡️ MoveHub Premium v1.0.0</Text>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
};

export const DrawerNavigator: React.FC = () => {
  return (
    <DrawerProvider>
      <DrawerNavigatorContent />
    </DrawerProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  screenWrapper: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A', // Deep slate backdrop dim
    zIndex: 99,
  },
  backdropPressArea: {
    flex: 1,
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: DRAWER_WIDTH,
    backgroundColor: theme.colors.surface,
    zIndex: 100,
    // iOS shadow
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    // Android elevation
    elevation: 20,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  profileHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    position: 'relative',
    paddingTop: Platform.OS === 'ios' ? 12 : theme.spacing.lg,
  },
  avatarGlow: {
    position: 'absolute',
    left: theme.spacing.lg - 4,
    top: theme.spacing.lg - 4,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.primaryLight + '50',
    zIndex: -1,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  avatarText: {
    color: theme.colors.textOnPrimary,
    fontSize: theme.fonts.sizes.base,
    fontWeight: theme.fonts.weights.bold as any,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
  },
  profileSub: {
    fontSize: 11,
    fontWeight: theme.fonts.weights.semibold as any,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  miniProgressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.background,
    width: '90%',
    marginTop: 6,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  menuContainer: {
    paddingVertical: theme.spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
    marginHorizontal: theme.spacing.sm,
    marginVertical: 3,
    borderRadius: theme.spacing.borderRadiusMd,
    position: 'relative',
  },
  activeMenuItem: {
    backgroundColor: theme.colors.primaryLight + '40', // Translucent blue
  },
  activeIndicator: {
    position: 'absolute',
    left: 4,
    top: '25%',
    bottom: '25%',
    width: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: theme.spacing.md,
    width: 24,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  activeMenuIcon: {
    fontSize: 21,
  },
  menuLabel: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weights.medium as any,
  },
  activeMenuLabel: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.weights.bold as any,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  versionBadge: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  versionText: {
    fontSize: 10.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.textSecondary,
    letterSpacing: 0.5,
  },
});

export default DrawerNavigator;
