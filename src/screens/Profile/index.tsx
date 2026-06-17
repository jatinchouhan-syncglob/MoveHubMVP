import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Modal,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { STRINGS } from '../../constants/strings';
import { ROUTES } from '../../constants/routes';
import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomButton } from '../../components/common/CustomButton';
import { Loader } from '../../components/common/Loader';
import { apiService } from '../../services/api';
import { storageHelper } from '../../storage/storageHelper';
import { UserProfile, Activity } from '../../types';
import { getInitials } from '../../utils/helpers';
import {
  calculateBMI,
  getBMIStatus,
  sumActiveMinutes,
  sumCaloriesBurned,
} from '../../utils/calculations';

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Custom Animated Modal States
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchProfileAndActivities = async () => {
      try {
        const [profileData, activitiesData] = await Promise.all([
          apiService.getProfile(),
          apiService.getActivities(),
        ]);
        setProfile(profileData);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Failed to load profile details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileAndActivities();
  }, []);

  const showResetAlert = () => {
    setResetModalVisible(true);
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideResetAlert = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setResetModalVisible(false);
    });
  };

  const handleConfirmReset = async () => {
    hideResetAlert();
    setLoading(true);
    try {
      await storageHelper.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: ROUTES.SPLASH }],
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader fullScreen message="Loading profile settings..." />;
  }

  const bmi = profile ? calculateBMI(profile.weight, profile.height) : 0;
  const bmiStatus = getBMIStatus(bmi);
  const totalMins = sumActiveMinutes(activities);
  const totalCalories = sumCaloriesBurned(activities);

  // Helper to map BMI value into a slider position percentage (15 BMI to 35 BMI)
  const getBmiPosition = (bmiVal: number) => {
    const minBmi = 15;
    const maxBmi = 35;
    const percentage = ((bmiVal - minBmi) / (maxBmi - minBmi)) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={STRINGS.PROFILE.TITLE} showDrawerButton />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card Overlay Background */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarGlow} />
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {profile ? getInitials(profile.name) : 'MH'}
            </Text>
          </View>
          <Text style={styles.profileName}>{profile?.name}</Text>
          <Text style={styles.profileStatus}>🛡️ Proactive Athlete</Text>
        </View>

        {/* Dynamic Activity Metrics Summary Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🏆</Text>
            <Text style={styles.statValue}>{activities.length}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>⚡</Text>
            <Text style={styles.statValue}>{totalMins}</Text>
            <Text style={styles.statLabel}>Active Mins</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🔥</Text>
            <Text style={styles.statValue}>{totalCalories.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Calories Kcal</Text>
          </View>
        </View>

        {/* Personal Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📐 Personal Dimensions</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Text style={styles.detailIcon}>🎂</Text>
              <Text style={styles.detailLabel}>Age</Text>
            </View>
            <Text style={styles.detailValue}>{profile?.age} years</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Text style={styles.detailIcon}>⚖️</Text>
              <Text style={styles.detailLabel}>Weight</Text>
            </View>
            <Text style={styles.detailValue}>{profile?.weight} kg</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Text style={styles.detailIcon}>📏</Text>
              <Text style={styles.detailLabel}>Height</Text>
            </View>
            <Text style={styles.detailValue}>{profile?.height} cm</Text>
          </View>
          <View style={styles.divider} />

          <View style={styles.detailRow}>
            <View style={styles.detailLabelRow}>
              <Text style={styles.detailIcon}>🎯</Text>
              <Text style={styles.detailLabel}>Daily Goal</Text>
            </View>
            <Text style={styles.detailValue}>{profile?.calorieGoal?.toLocaleString()} kcal</Text>
          </View>
        </View>

        {/* Visual BMI Scale Evaluation Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Precision Body Index</Text>
          <View style={styles.bmiDisplayRow}>
            <View>
              <Text style={styles.bmiValueText}>{bmi}</Text>
              <Text style={styles.bmiLabelText}>Calculated BMI</Text>
            </View>
            <View style={styles.bmiStatusPill}>
              <Text 
                style={[
                  styles.bmiStatusText, 
                  bmiStatus === 'Normal' ? styles.successText : styles.warningText
                ]}
              >
                {bmiStatus}
              </Text>
            </View>
          </View>

          {/* Interactive Colored BMI Scale Track */}
          <View style={styles.bmiTrackContainer}>
            <View style={styles.bmiTrack}>
              {/* Underweight Segment */}
              <View style={[styles.bmiSegment, { backgroundColor: '#60A5FA', borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }]} />
              {/* Normal Segment */}
              <View style={[styles.bmiSegment, { backgroundColor: '#34D399' }]} />
              {/* Overweight Segment */}
              <View style={[styles.bmiSegment, { backgroundColor: '#FBBF24' }]} />
              {/* Obese Segment */}
              <View style={[styles.bmiSegment, { backgroundColor: '#F87171', borderTopRightRadius: 3, borderBottomRightRadius: 3 }]} />
            </View>

            {/* Sliding pointer dot */}
            <View style={[styles.bmiPointer, { left: `${getBmiPosition(bmi)}%` }]} />
          </View>

          {/* Scale benchmarks */}
          <View style={styles.bmiLabelsRow}>
            <Text style={styles.bmiScaleLabel}>15</Text>
            <Text style={styles.bmiScaleLabel}>18.5</Text>
            <Text style={styles.bmiScaleLabel}>25</Text>
            <Text style={styles.bmiScaleLabel}>30</Text>
            <Text style={styles.bmiScaleLabel}>35</Text>
          </View>
        </View>

        {/* Actions Button */}
        <View style={styles.actionsContainer}>
          <CustomButton
            title={STRINGS.PROFILE.LOGOUT}
            onPress={showResetAlert}
            variant="outline"
            style={styles.resetButton}
            textStyle={styles.resetButtonText}
          />
        </View>
      </ScrollView>

      {/* Custom Animated Reset Alert Modal */}
      <Modal
        animationType="none"
        transparent={true}
        visible={resetModalVisible}
        onRequestClose={hideResetAlert}
      >
        <Animated.View style={[styles.modalOverlay, { opacity: opacityAnim }]}>
          <TouchableOpacity 
            style={styles.modalBackdrop} 
            activeOpacity={1} 
            onPress={hideResetAlert} 
          />
          <Animated.View 
            style={[
              styles.modalCard, 
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            <View style={styles.alertIconCircle}>
              <Text style={styles.alertIconText}>⚠️</Text>
            </View>
            <Text style={styles.modalTitleText}>Reset App Data?</Text>
            <Text style={styles.modalDescText}>
              Are you sure you want to permanently delete your local database, workout logs, and profile settings? This action cannot be undone.
            </Text>
            
            <View style={styles.modalButtonsRow}>
              <TouchableOpacity 
                style={styles.cancelModalBtn} 
                onPress={hideResetAlert}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmModalBtn} 
                onPress={handleConfirmReset}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmBtnText}>Reset Data</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.containerPadding,
  },
  avatarSection: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
    position: 'relative',
  },
  avatarGlow: {
    position: 'absolute',
    top: -10,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: theme.colors.primaryLight + '50',
    zIndex: -1,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    elevation: 6,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.textOnPrimary,
  },
  profileName: {
    fontSize: 22,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
  },
  profileStatus: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.primary,
    fontWeight: theme.fonts.weights.semibold as any,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadiusLg,
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: theme.colors.border,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.cardPadding,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    // iOS shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    alignItems: 'center',
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  detailLabel: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: theme.fonts.weights.semibold as any,
    color: theme.colors.text,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: theme.colors.border,
  },
  bmiDisplayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  bmiValueText: {
    fontSize: 32,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
  },
  bmiLabelText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  bmiStatusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bmiStatusText: {
    fontSize: 13,
    fontWeight: theme.fonts.weights.bold as any,
  },
  successText: {
    color: theme.colors.success,
  },
  warningText: {
    color: theme.colors.warning,
  },
  bmiTrackContainer: {
    position: 'relative',
    height: 18,
    justifyContent: 'center',
    marginBottom: 6,
  },
  bmiTrack: {
    height: 6,
    borderRadius: 3,
    flexDirection: 'row',
    width: '100%',
  },
  bmiSegment: {
    flex: 1,
    height: '100%',
  },
  bmiPointer: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: theme.colors.primary,
    top: 2,
    marginTop: 0,
    marginLeft: -7, // center point alignment
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  bmiLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  bmiScaleLabel: {
    fontSize: 10,
    color: theme.colors.textLight,
  },
  actionsContainer: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xxl,
  },
  resetButton: {
    borderColor: theme.colors.error,
    backgroundColor: theme.colors.surface,
  },
  resetButtonText: {
    color: theme.colors.error,
  },
  // Custom Modal Overlay styling
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.65)', // deep slate dark mask
  },
  modalCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: 24,
    width: '85%',
    maxWidth: 320,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  alertIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2', // soft warning red
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  alertIconText: {
    fontSize: 30,
  },
  modalTitleText: {
    fontSize: 19,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
    marginBottom: 8,
  },
  modalDescText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.xl,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelModalBtn: {
    flex: 1,
    height: 44,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.textSecondary,
  },
  confirmModalBtn: {
    flex: 1,
    height: 44,
    borderRadius: theme.spacing.borderRadiusMd,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#FFFFFF',
  },
});

export default ProfileScreen;
