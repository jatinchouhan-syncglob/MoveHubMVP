import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  TouchableWithoutFeedback,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';
import { useDrawer, DrawerProvider, DrawerScreenType } from './DrawerContext';
import { apiService } from '../services/api';
import { UserProfile } from '../types';
import { getInitials } from '../utils/helpers';
import { ROUTES } from '../constants/routes';
import { storageHelper } from '../storage/storageHelper';
import { STORAGE_KEYS } from '../storage/storageKeys';

import DashboardScreen from '../screens/Dashboard';
import AwardsScreen from '../screens/Awards';
import FitnessChallengesScreen from '../screens/FitnessChallenges';
import ActivityTrackingScreen from '../screens/ActivityTracking';
import LeaderboardScreen from '../screens/Leaderboard';
import InsightsScreen from '../screens/Insights';
import ProfileScreen from '../screens/Profile';
import { WellnessPrescriptionScreen } from '../screens/WellnessPrescription';
import FitnessTrainingScreen from '../screens/FitnessTraining';
import MealLogScreen from '../screens/Nutrition/meal-log';
import MealAnalysisScreen from '../screens/Nutrition/meal-analysis';
import MealPlannerScreen from '../screens/Nutrition/meal-planner-screen';
import DailyComplianceScreen from '../screens/Nutrition/daily-compliance-screen';
import WeeklyComplianceScreen from '../screens/Nutrition/weekly-compliance-screen';
import { WellnessModal } from '../components/common/WellnessModal';
import DailyQuestScreen from '../screens/HomeHub/DailyQuest';
import OngoingQuestScreen from '../screens/HomeHub/OngoingQuest';
import CommunityFeedScreen from '../screens/HomeHub/CommunityFeed';
import TrainingScreen from '../screens/HomeHub/Training';
import { UploadReportsScreen, DigitalWalletScreen, CaseHistoryScreen, HealthPassportScreen } from '../screens/VaultHub';
import { DailyLogScreen, WellnessScreen, HealthReportCardScreen, MindsetHubScreen } from '../screens/VitalityHub';
import { RiskAssessmentScreen, PreventiveCareScreen, RiskTrackerScreen, RiskToolsScreen, MyConsultationsScreen } from '../screens/ShieldHub';

const DRAWER_WIDTH = 290;

const DrawerNavigatorContent: React.FC = () => {
  const { isOpen, activeScreen, closeDrawer, setActiveScreen } = useDrawer();
  const slideAnim = useRef(new Animated.Value(0)).current;

  const navigation = useNavigation<any>();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [todayCalories, setTodayCalories] = React.useState(0);
  const [logoutModalVisible, setLogoutModalVisible] = React.useState(false);
  const [logoutLoading, setLogoutLoading] = React.useState(false);
  const [isNutritionExpanded, setIsNutritionExpanded] = React.useState(false);
  const [isMoveHubExpanded, setIsMoveHubExpanded] = React.useState(false);
  const [isHomeHubExpanded, setIsHomeHubExpanded] = React.useState(false);
  const [isVaultHubExpanded, setIsVaultHubExpanded] = React.useState(false);
  const [isVitalityHubExpanded, setIsVitalityHubExpanded] = React.useState(false);
  const [isShieldHubExpanded, setIsShieldHubExpanded] = React.useState(false);
  const [wellnessModalVisible, setWellnessModalVisible] = React.useState(false);
  const [pendingScreen, setPendingScreen] =
    React.useState<DrawerScreenType | null>(null);
  const navTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const collapseAllHubsExcept = (activeHub: 'nutrition' | 'move' | 'home' | 'vault' | 'vitality' | 'shield' | 'none') => {
    setIsNutritionExpanded(activeHub === 'nutrition');
    setIsMoveHubExpanded(activeHub === 'move');
    setIsHomeHubExpanded(activeHub === 'home');
    setIsVaultHubExpanded(activeHub === 'vault');
    setIsVitalityHubExpanded(activeHub === 'vitality');
    setIsShieldHubExpanded(activeHub === 'shield');
  };

  React.useEffect(() => {
    return () => {
      if (navTimeoutRef.current) {
        clearTimeout(navTimeoutRef.current);
      }
    };
  }, []);

  const handleDelayedNavigation = (screen: DrawerScreenType) => {
    if (navTimeoutRef.current) {
      clearTimeout(navTimeoutRef.current);
    }
    // Set pendingScreen immediately so the item highlights
    setPendingScreen(screen);

    // Wait 0.8 seconds, then transition screen, close drawer, and clear pending screen
    navTimeoutRef.current = setTimeout(() => {
      setActiveScreen(screen);
      closeDrawer();
      setPendingScreen(null);
    }, 400);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setWellnessModalVisible(true);
    }, 30 * 60 * 60 * 1000); // 30 hours (108,000,000 milliseconds)

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const currentScreen = pendingScreen || activeScreen;
    
    const nutritionScreens = [
      'MealLog',
      'MealAnalysis',
      'MealPlanner',
      'DailyCompliance',
      'WeeklyCompliance',
    ];
    const moveHubScreens = [
      'FitnessPrescription',
      'ActivityTracking',
      'FitnessChallenges',
      'Leaderboard',
      'Dashboard',
      'Insights',
      'Awards',
      'FitnessTraining',
    ];
    const homeHubScreens = [
      'DailyQuest',
      'OngoingQuest',
      'CommunityFeed',
      'Training',
    ];
    const vaultHubScreens = [
      'UploadReports',
      'DigitalWallet',
      'CaseHistory',
      'HealthPassport',
    ];
    const vitalityHubScreens = [
      'DailyLog',
      'Wellness',
      'HealthReportCard',
      'MindsetHub',
    ];
    const shieldHubScreens = [
      'RiskAssessment',
      'PreventiveCare',
      'RiskTracker',
      'RiskTools',
      'MyConsultations',
    ];

    if (nutritionScreens.includes(currentScreen)) {
      setIsNutritionExpanded(true);
      setIsMoveHubExpanded(false);
      setIsHomeHubExpanded(false);
      setIsVaultHubExpanded(false);
      setIsVitalityHubExpanded(false);
      setIsShieldHubExpanded(false);
    } else if (moveHubScreens.includes(currentScreen)) {
      setIsMoveHubExpanded(true);
      setIsNutritionExpanded(false);
      setIsHomeHubExpanded(false);
      setIsVaultHubExpanded(false);
      setIsVitalityHubExpanded(false);
      setIsShieldHubExpanded(false);
    } else if (homeHubScreens.includes(currentScreen)) {
      setIsHomeHubExpanded(true);
      setIsNutritionExpanded(false);
      setIsMoveHubExpanded(false);
      setIsVaultHubExpanded(false);
      setIsVitalityHubExpanded(false);
      setIsShieldHubExpanded(false);
    } else if (vaultHubScreens.includes(currentScreen)) {
      setIsVaultHubExpanded(true);
      setIsNutritionExpanded(false);
      setIsMoveHubExpanded(false);
      setIsHomeHubExpanded(false);
      setIsVitalityHubExpanded(false);
      setIsShieldHubExpanded(false);
    } else if (vitalityHubScreens.includes(currentScreen)) {
      setIsVitalityHubExpanded(true);
      setIsNutritionExpanded(false);
      setIsMoveHubExpanded(false);
      setIsHomeHubExpanded(false);
      setIsVaultHubExpanded(false);
      setIsShieldHubExpanded(false);
    } else if (shieldHubScreens.includes(currentScreen)) {
      setIsShieldHubExpanded(true);
      setIsNutritionExpanded(false);
      setIsMoveHubExpanded(false);
      setIsHomeHubExpanded(false);
      setIsVaultHubExpanded(false);
      setIsVitalityHubExpanded(false);
    }
  }, [activeScreen, pendingScreen]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const email = profile?.email || 'saurabh.sharma@example.com';
      await apiService.logout(email);
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      // Clear all cached keys
      await storageHelper.removeItem(STORAGE_KEYS.USER_PROFILE);
      await storageHelper.removeItem(STORAGE_KEYS.PACING_PROFILE);
      await storageHelper.removeItem(STORAGE_KEYS.PACING_OTHER_TEXT);
      await storageHelper.removeItem(STORAGE_KEYS.PACING_CARDIO_SUBS);
      await storageHelper.removeItem(STORAGE_KEYS.PACING_METABOLIC_SUBS);

      setLogoutLoading(false);
      setLogoutModalVisible(false);
      closeDrawer();

      // Reset navigation stack to Login screen
      navigation.reset({
        index: 0,
        routes: [{ name: ROUTES.LOGIN }],
      });
    }
  };

  useEffect(() => {
    const fetchDrawerData = async () => {
      try {
        const [profileData, activitiesData] = await Promise.all([
          apiService.getProfile(),
          apiService.getActivities(),
        ]);
        setProfile(profileData);

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

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isOpen, slideAnim]);

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-DRAWER_WIDTH, 0],
  });

  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'FitnessPrescription':
        return <WellnessPrescriptionScreen showDrawer={true} />;
      case 'Awards':
        return <AwardsScreen />;
      case 'MealLog':
        return <MealLogScreen />;
      case 'MealAnalysis':
        return <MealAnalysisScreen />;
      case 'MealPlanner':
        return <MealPlannerScreen />;
      case 'DailyCompliance':
        return <DailyComplianceScreen />;
      case 'WeeklyCompliance':
        return <WeeklyComplianceScreen />;
      case 'FitnessChallenges':
        return <FitnessChallengesScreen />;
      case 'ActivityTracking':
        return <ActivityTrackingScreen />;
      case 'Leaderboard':
        return <LeaderboardScreen />;
      case 'FitnessTraining':
        return <FitnessTrainingScreen />;
      case 'Insights':
        return <InsightsScreen />;
      case 'Profile':
        return <ProfileScreen />;
      case 'DailyQuest':
        return <DailyQuestScreen />;
      case 'OngoingQuest':
        return <OngoingQuestScreen />;
      case 'CommunityFeed':
        return <CommunityFeedScreen />;
      case 'Training':
        return <TrainingScreen />;
      case 'UploadReports':
        return <UploadReportsScreen />;
      case 'DigitalWallet':
        return <DigitalWalletScreen />;
      case 'CaseHistory':
        return <CaseHistoryScreen />;
      case 'HealthPassport':
        return <HealthPassportScreen />;
      case 'DailyLog':
        return <DailyLogScreen />;
      case 'Wellness':
        return <WellnessScreen />;
      case 'HealthReportCard':
        return <HealthReportCardScreen />;
      case 'MindsetHub':
        return <MindsetHubScreen />;
      case 'RiskAssessment':
        return <RiskAssessmentScreen />;
      case 'PreventiveCare':
        return <PreventiveCareScreen />;
      case 'RiskTracker':
        return <RiskTrackerScreen />;
      case 'RiskTools':
        return <RiskToolsScreen />;
      case 'MyConsultations':
        return <MyConsultationsScreen />;
      case 'Dashboard':
      default:
        return <DashboardScreen />;
    }
  };

  const menuItems: { screen: DrawerScreenType; label: string; icon: string }[] =
    [
      {
        screen: 'FitnessPrescription',
        label: 'Fitness Prescription',
        icon: '📋',
      },
      { screen: 'ActivityTracking', label: 'Activity Logger', icon: '🏃‍♂️' },
      { screen: 'FitnessChallenges', label: 'Fitness Challenges', icon: '🎯' },
      { screen: 'Leaderboard', label: 'Leaderboard', icon: '🏅' },
      { screen: 'Dashboard', label: 'Daily Dashboard', icon: '📊' },
      { screen: 'Insights', label: 'Insights & Alerts', icon: '💡' },
      { screen: 'Awards', label: 'Rewards', icon: '🏆' },
      { screen: 'FitnessTraining', label: 'Fitness Training', icon: '🏋️‍♂️' },
    ];

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
              {/* Home Hub Accordion Trigger */}
              {(() => {
                const isHomeHubActive = pendingScreen !== null
                  ? ['DailyQuest', 'OngoingQuest', 'CommunityFeed', 'Training'].includes(pendingScreen)
                  : ['DailyQuest', 'OngoingQuest', 'CommunityFeed', 'Training'].includes(activeScreen);
                return (
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      isHomeHubActive && styles.activeMenuItem
                    ]}
                    activeOpacity={0.7}
                    onPress={() => collapseAllHubsExcept(isHomeHubExpanded ? 'none' : 'home')}
                  >
                    <Text style={styles.menuIcon}>🏠</Text>
                    <Text
                      style={[
                        styles.menuLabel,
                        isHomeHubActive && styles.activeMenuLabel,
                        { flex: 1 }
                      ]}
                    >
                      Home Hub
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginRight: 4 }}>
                      {isHomeHubExpanded ? '▼' : '▶'}
                    </Text>
                  </TouchableOpacity>
                );
              })()}

              {/* Expanded Home Hub Sub-Menus */}
              {isHomeHubExpanded && (
                <View style={styles.subMenuContainer}>
                  {[
                    {
                      screen: 'DailyQuest' as const,
                      label: 'My Quest',
                      icon: '📅',
                    },
                    {
                      screen: 'CommunityFeed' as const,
                      label: 'Community Feed',
                      icon: '💬',
                    },
                    {
                      screen: 'OngoingQuest' as const,
                      label: 'Ongoing Quest',
                      icon: '⚡',
                    },
                    {
                      screen: 'Training' as const,
                      label: 'Training',
                      icon: '🎓',
                    },
                  ].map(subItem => {
                    const isSubActive =
                      pendingScreen !== null
                        ? pendingScreen === subItem.screen
                        : activeScreen === subItem.screen;
                    return (
                      <TouchableOpacity
                        key={subItem.screen}
                        style={[
                          styles.subMenuItem,
                          isSubActive && styles.activeSubMenuItem,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleDelayedNavigation(subItem.screen)}
                      >
                        {isSubActive && (
                          <View style={styles.subActiveIndicator} />
                        )}
                        <Text style={styles.subMenuIcon}>{subItem.icon}</Text>
                        <Text
                          style={[
                            styles.subMenuLabel,
                            isSubActive && styles.activeSubMenuLabel,
                          ]}
                        >
                          {subItem.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Vault Hub Accordion Trigger */}
              {(() => {
                const isVaultHubActive = pendingScreen !== null
                  ? ['UploadReports', 'DigitalWallet', 'CaseHistory', 'HealthPassport'].includes(pendingScreen)
                  : ['UploadReports', 'DigitalWallet', 'CaseHistory', 'HealthPassport'].includes(activeScreen);
                return (
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      isVaultHubActive && styles.activeMenuItem
                    ]}
                    activeOpacity={0.7}
                    onPress={() => collapseAllHubsExcept(isVaultHubExpanded ? 'none' : 'vault')}
                  >
                    <Text style={styles.menuIcon}>📁</Text>
                    <Text
                      style={[
                        styles.menuLabel,
                        isVaultHubActive && styles.activeMenuLabel,
                        { flex: 1 }
                      ]}
                    >
                      Vault Hub
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginRight: 4 }}>
                      {isVaultHubExpanded ? '▼' : '▶'}
                    </Text>
                  </TouchableOpacity>
                );
              })()}

              {/* Expanded Vault Hub Sub-Menus */}
              {isVaultHubExpanded && (
                <View style={styles.subMenuContainer}>
                  {[
                    {
                      screen: 'UploadReports' as const,
                      label: 'Upload Reports',
                      icon: '📤',
                    },
                    {
                      screen: 'DigitalWallet' as const,
                      label: 'MR-Digital Wallet',
                      icon: '💳',
                    },
                    {
                      screen: 'CaseHistory' as const,
                      label: 'Case History',
                      icon: '📜',
                    },
                    {
                      screen: 'HealthPassport' as const,
                      label: 'Health Passport',
                      icon: '✈️',
                    },
                  ].map(subItem => {
                    const isSubActive =
                      pendingScreen !== null
                        ? pendingScreen === subItem.screen
                        : activeScreen === subItem.screen;
                    return (
                      <TouchableOpacity
                        key={subItem.screen}
                        style={[
                          styles.subMenuItem,
                          isSubActive && styles.activeSubMenuItem,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleDelayedNavigation(subItem.screen)}
                      >
                        {isSubActive && (
                          <View style={styles.subActiveIndicator} />
                        )}
                        <Text style={styles.subMenuIcon}>{subItem.icon}</Text>
                        <Text
                          style={[
                            styles.subMenuLabel,
                            isSubActive && styles.activeSubMenuLabel,
                          ]}
                        >
                          {subItem.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Move Hub Accordion Trigger */}
              {(() => {
                const isMoveHubActive = pendingScreen !== null
                  ? [
                      'FitnessPrescription',
                      'ActivityTracking',
                      'FitnessChallenges',
                      'Leaderboard',
                      'Dashboard',
                      'Insights',
                      'Awards',
                      'FitnessTraining',
                    ].includes(pendingScreen)
                  : [
                      'FitnessPrescription',
                      'ActivityTracking',
                      'FitnessChallenges',
                      'Leaderboard',
                      'Dashboard',
                      'Insights',
                      'Awards',
                      'FitnessTraining',
                    ].includes(activeScreen);
                return (
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      isMoveHubActive && styles.activeMenuItem
                    ]}
                    activeOpacity={0.7}
                    onPress={() => collapseAllHubsExcept(isMoveHubExpanded ? 'none' : 'move')}
                  >
                    <Text style={styles.menuIcon}>🏃‍♂️</Text>
                    <Text
                      style={[
                        styles.menuLabel,
                        isMoveHubActive && styles.activeMenuLabel,
                        { flex: 1 }
                      ]}
                    >
                      Move Hub
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginRight: 4 }}>
                      {isMoveHubExpanded ? '▼' : '▶'}
                    </Text>
                  </TouchableOpacity>
                );
              })()}

              {/* Expanded Move Hub Sub-Menus */}
              {isMoveHubExpanded && (
                <View style={styles.subMenuContainer}>
                  {menuItems.map(subItem => {
                    const isSubActive =
                      pendingScreen !== null
                        ? pendingScreen === subItem.screen
                        : activeScreen === subItem.screen;
                    return (
                      <TouchableOpacity
                        key={subItem.screen}
                        style={[
                          styles.subMenuItem,
                          isSubActive && styles.activeSubMenuItem,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleDelayedNavigation(subItem.screen)}
                      >
                        {isSubActive && (
                          <View style={styles.subActiveIndicator} />
                        )}
                        <Text style={styles.subMenuIcon}>{subItem.icon}</Text>
                        <Text
                          style={[
                            styles.subMenuLabel,
                            isSubActive && styles.activeSubMenuLabel,
                          ]}
                        >
                          {subItem.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Nourish Hub Accordion Trigger */}
               {(() => {
                const isNutritionActive = pendingScreen !== null
                  ? ['MealLog', 'MealAnalysis', 'MealPlanner', 'DailyCompliance', 'WeeklyCompliance'].includes(pendingScreen)
                  : ['MealLog', 'MealAnalysis', 'MealPlanner', 'DailyCompliance', 'WeeklyCompliance'].includes(activeScreen);
                return (
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      isNutritionActive && styles.activeMenuItem
                    ]}
                    activeOpacity={0.7}
                    onPress={() => collapseAllHubsExcept(isNutritionExpanded ? 'none' : 'nutrition')}
                  >
                    <Text style={styles.menuIcon}>🥑</Text>
                    <Text
                      style={[
                        styles.menuLabel,
                        isNutritionActive && styles.activeMenuLabel,
                        { flex: 1 }
                      ]}
                    >
                      Nourish Hub
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginRight: 4 }}>
                      {isNutritionExpanded ? '▼' : '▶'}
                    </Text>
                  </TouchableOpacity>
                );
              })()} 

              {/* Expanded Nutrition Sub-Menus */}
              {isNutritionExpanded && (
                <View style={styles.subMenuContainer}>
                  {[
                    {
                      screen: 'MealLog' as const,
                      label: 'Daily Meal Log',
                      icon: '📝',
                    },
                    {
                      screen: 'MealAnalysis' as const,
                      label: 'Meal Analysis',
                      icon: '📊',
                    },
                    {
                      screen: 'MealPlanner' as const,
                      label: 'Meal Planner',
                      icon: '📅',
                    },
                    {
                      screen: 'DailyCompliance' as const,
                      label: 'Daily Compliance',
                      icon: '🛡️',
                    },
                    {
                      screen: 'WeeklyCompliance' as const,
                      label: 'Weekly Compliance',
                      icon: '📈',
                    },
                  ].map(subItem => {
                    const isSubActive =
                      pendingScreen !== null
                        ? pendingScreen === subItem.screen
                        : activeScreen === subItem.screen;
                    return (
                      <TouchableOpacity
                        key={subItem.screen}
                        style={[
                          styles.subMenuItem,
                          isSubActive && styles.activeSubMenuItem,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleDelayedNavigation(subItem.screen)}
                      >
                        {isSubActive && (
                          <View style={styles.subActiveIndicator} />
                        )}
                        <Text style={styles.subMenuIcon}>{subItem.icon}</Text>
                        <Text
                          style={[
                            styles.subMenuLabel,
                            isSubActive && styles.activeSubMenuLabel,
                          ]}
                        >
                          {subItem.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Vitality Hub Accordion Trigger */}
              {(() => {
                const isVitalityHubActive = pendingScreen !== null
                  ? ['DailyLog', 'Wellness', 'HealthReportCard', 'MindsetHub'].includes(pendingScreen)
                  : ['DailyLog', 'Wellness', 'HealthReportCard', 'MindsetHub'].includes(activeScreen);
                return (
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      isVitalityHubActive && styles.activeMenuItem
                    ]}
                    activeOpacity={0.7}
                    onPress={() => collapseAllHubsExcept(isVitalityHubExpanded ? 'none' : 'vitality')}
                  >
                    <Text style={styles.menuIcon}>⚡</Text>
                    <Text
                      style={[
                        styles.menuLabel,
                        isVitalityHubActive && styles.activeMenuLabel,
                        { flex: 1 }
                      ]}
                    >
                      Vitality Hub
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginRight: 4 }}>
                      {isVitalityHubExpanded ? '▼' : '▶'}
                    </Text>
                  </TouchableOpacity>
                );
              })()}

              {/* Expanded Vitality Hub Sub-Menus */}
              {isVitalityHubExpanded && (
                <View style={styles.subMenuContainer}>
                  {[
                    {
                      screen: 'DailyLog' as const,
                      label: 'Daily Log',
                      icon: '📝',
                    },
                    {
                      screen: 'Wellness' as const,
                      label: 'Wellness',
                      icon: '❤️',
                    },
                    {
                      screen: 'HealthReportCard' as const,
                      label: 'Health Report Card',
                      icon: '📊',
                    },
                    {
                      screen: 'MindsetHub' as const,
                      label: 'Mindset Hub',
                      icon: '🧠',
                    },
                  ].map(subItem => {
                    const isSubActive =
                      pendingScreen !== null
                        ? pendingScreen === subItem.screen
                        : activeScreen === subItem.screen;
                    return (
                      <TouchableOpacity
                        key={subItem.screen}
                        style={[
                          styles.subMenuItem,
                          isSubActive && styles.activeSubMenuItem,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleDelayedNavigation(subItem.screen)}
                      >
                        {isSubActive && (
                          <View style={styles.subActiveIndicator} />
                        )}
                        <Text style={styles.subMenuIcon}>{subItem.icon}</Text>
                        <Text
                          style={[
                            styles.subMenuLabel,
                            isSubActive && styles.activeSubMenuLabel,
                          ]}
                        >
                          {subItem.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Shield Hub Accordion Trigger */}
              {(() => {
                const isShieldHubActive = pendingScreen !== null
                  ? ['RiskAssessment', 'PreventiveCare', 'RiskTracker', 'RiskTools', 'MyConsultations'].includes(pendingScreen)
                  : ['RiskAssessment', 'PreventiveCare', 'RiskTracker', 'RiskTools', 'MyConsultations'].includes(activeScreen);
                return (
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      isShieldHubActive && styles.activeMenuItem
                    ]}
                    activeOpacity={0.7}
                    onPress={() => collapseAllHubsExcept(isShieldHubExpanded ? 'none' : 'shield')}
                  >
                    <Text style={styles.menuIcon}>🛡️</Text>
                    <Text
                      style={[
                        styles.menuLabel,
                        isShieldHubActive && styles.activeMenuLabel,
                        { flex: 1 }
                      ]}
                    >
                      Shield Hub
                    </Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginRight: 4 }}>
                      {isShieldHubExpanded ? '▼' : '▶'}
                    </Text>
                  </TouchableOpacity>
                );
              })()}

              {/* Expanded Shield Hub Sub-Menus */}
              {isShieldHubExpanded && (
                <View style={styles.subMenuContainer}>
                  {[
                    {
                      screen: 'RiskAssessment' as const,
                      label: 'Risk Assessment',
                      icon: '📋',
                    },
                    {
                      screen: 'PreventiveCare' as const,
                      label: 'Preventive Care',
                      icon: '🛡️',
                    },
                    {
                      screen: 'RiskTracker' as const,
                      label: 'Risk Tracker',
                      icon: '📈',
                    },
                    {
                      screen: 'RiskTools' as const,
                      label: 'Risk Tools',
                      icon: '🔧',
                    },
                    {
                      screen: 'MyConsultations' as const,
                      label: 'My Consultations',
                      icon: '🤝',
                    },
                  ].map(subItem => {
                    const isSubActive =
                      pendingScreen !== null
                        ? pendingScreen === subItem.screen
                        : activeScreen === subItem.screen;
                    return (
                      <TouchableOpacity
                        key={subItem.screen}
                        style={[
                          styles.subMenuItem,
                          isSubActive && styles.activeSubMenuItem,
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleDelayedNavigation(subItem.screen)}
                      >
                        {isSubActive && (
                          <View style={styles.subActiveIndicator} />
                        )}
                        <Text style={styles.subMenuIcon}>{subItem.icon}</Text>
                        <Text
                          style={[
                            styles.subMenuLabel,
                            isSubActive && styles.activeSubMenuLabel,
                          ]}
                        >
                          {subItem.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>
          </ScrollView>

          {/* Footer Section */}
          <View style={styles.footer}>
            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutBtn}
              activeOpacity={0.8}
              onPress={() => setLogoutModalVisible(true)}
            >
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutLabel}>Logout</Text>
            </TouchableOpacity>

            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>🛡️ MoveHub Premium v1.0.0</Text>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Logout Confirmation Custom Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconBadge}>
              <Text style={styles.modalIconText}>🚪</Text>
            </View>
            <Text style={styles.modalTitleText}>Confirm Logout</Text>
            <Text style={styles.modalMessageText}>
              Are you sure you want to log out of MoveHub? Your local metrics
              will remain saved.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.8}
                disabled={logoutLoading}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.confirmBtn]}
                onPress={handleLogout}
                activeOpacity={0.8}
                disabled={logoutLoading}
              >
                {logoutLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmBtnText}>Logout</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <WellnessModal
        visible={wellnessModalVisible}
        onClose={() => setWellnessModalVisible(false)}
      />
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
    backgroundColor: '#0F172A',
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
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: theme.spacing.borderRadiusMd,
    marginBottom: 12,
    backgroundColor: 'rgba(244, 63, 94, 0.05)', // light rose tint
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  logoutLabel: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#e11d48', // rose-600 color
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)', // dim overlay
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 10,
  },
  modalIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(244, 63, 94, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(244, 63, 94, 0.15)',
    marginBottom: 16,
  },
  modalIconText: {
    fontSize: 26,
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalMessageText: {
    fontSize: 13.5,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  modalBtnRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f1f5f9',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 14.5,
    fontWeight: '700',
  },
  confirmBtn: {
    backgroundColor: '#e11d48', // rose-600
  },
  confirmBtnText: {
    color: '#ffffff',
    fontSize: 14.5,
    fontWeight: '800',
  },
  subMenuContainer: {
    marginLeft: 16,
    borderLeftWidth: 1.5,
    borderLeftColor: theme.colors.border,
    paddingLeft: 8,
    marginVertical: 4,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: theme.spacing.md,
    marginVertical: 2,
    borderRadius: theme.spacing.borderRadiusMd,
    position: 'relative',
  },
  activeSubMenuItem: {
    backgroundColor: theme.colors.primaryLight + '25',
  },
  subActiveIndicator: {
    position: 'absolute',
    left: -10,
    top: '30%',
    bottom: '30%',
    width: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.primary,
  },
  subMenuIcon: {
    fontSize: 16,
    marginRight: theme.spacing.sm,
    width: 20,
    textAlign: 'center',
  },
  subMenuLabel: {
    fontSize: 13.5,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weights.medium as any,
  },
  activeSubMenuLabel: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.weights.bold as any,
  },
});

export default DrawerNavigator;
