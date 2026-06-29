import React, { useState, useEffect } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { STRINGS } from '../../constants/strings';
import { CustomHeader } from '../../components/common/CustomHeader';
import { CustomButton } from '../../components/common/CustomButton';
import { Loader } from '../../components/common/Loader';
import { EmptyState } from '../../components/common/EmptyState';
import { ActivityCard } from '../../components/cards/ActivityCard';
import { apiService } from '../../services/api';
import { Activity } from '../../types';
import { WELLNESS_ACTIVITIES_REGISTRY } from '../../constants/activityTypes';
import { StepsLogsTab } from './components/StepsLogsTab';

export const ActivityTrackingScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState<'Steps' | 'Workout'>('Workout');

  // Modal & Form States
  const [modalVisible, setModalVisible] = useState(false);
  const [activityType, setActivityType] = useState('Walking');
  const [duration, setDuration] = useState('30');
  const [distance, setDistance] = useState('2.0');
  const [sleepHours, setSleepHours] = useState('');
  const [mood, setMood] = useState(0);
  const [rpe, setRpe] = useState(0);
  const [notes, setNotes] = useState('');

  // Form Validation Errors state
  const [errors, setErrors] = useState<{
    sleepHours?: string;
    mood?: string;
    rpe?: string;
  }>({});

  // Resistance Parameters (Strength workouts)
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('10');
  const [weightKg, setWeightKg] = useState('15');

  // Contextual Modifiers
  const [highIntensity, setHighIntensity] = useState(false);
  const [strengthRest, setStrengthRest] = useState(false);
  const [activeRecovery, setActiveRecovery] = useState(false);

  // Wearable Integration Toggles
  const [syncWearable, setSyncWearable] = useState(false);

  // Benefits Modal Visibility & Logging Summary
  const [benefitsVisible, setBenefitsVisible] = useState(false);
  const [lastLoggedSummary, setLastLoggedSummary] = useState<{
    type: string;
    emoji: string;
    category: string;
    duration: number;
    calories: number;
    gainPoints: number;
    musculoPoints: number;
    cardioPoints: number;
  } | null>(null);

  // Profile Weight state for Live Calorie updates
  const [userWeight, setUserWeight] = useState(74.5);

  // Category Filtering
  const [selectedCategory, setSelectedCategory] = useState<
    'distance' | 'strength' | 'duration'
  >('distance');

  // Additional Popup & Saving States
  const [seeAllVisible, setSeeAllVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchActivities = async () => {
    try {
      const data = await apiService.getActivities();
      setActivities(data);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    // Fetch profile to get weight for live calorie previews
    apiService
      .getProfile()
      .then(p => {
        if (p && p.weight) {
          setUserWeight(p.weight);
        }
      })
      .catch(err => console.error('Failed to load profile weight:', err));
  }, []);

  // Sync category tab with selected activity category on open
  useEffect(() => {
    if (modalVisible) {
      const item = WELLNESS_ACTIVITIES_REGISTRY.find(
        act => act.name.toLowerCase() === activityType.toLowerCase(),
      );
      if (item) {
        setSelectedCategory(item.category as any);
      }
    }
  }, [modalVisible, activityType]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const activeRegistryItem = WELLNESS_ACTIVITIES_REGISTRY.find(
    act => act.name.toLowerCase() === activityType.toLowerCase(),
  ) || {
    name: 'Other',
    emoji: '💪',
    baseMET: 4.0,
    metric: 'mins',
    category: 'duration',
    color: theme.colors.primary,
  };
  const isDistanceBased = activeRegistryItem?.category === 'distance';

  const parsedDuration = parseFloat(duration) || 0;
  const parsedDistance = parseFloat(distance) || 0;
  const liveVelocity =
    parsedDuration > 0 && parsedDistance > 0
      ? parsedDistance / (parsedDuration / 60)
      : 0;

  const handleSaveActivity = async () => {
    const newErrors: { sleepHours?: string; mood?: string; rpe?: string } = {};

    const trimmedSleep = sleepHours.trim();
    if (trimmedSleep === '') {
      newErrors.sleepHours = 'Please enter your sleep hours from last night.';
    } else {
      const parsedSleep = parseFloat(trimmedSleep);
      if (isNaN(parsedSleep) || parsedSleep < 0 || parsedSleep > 24) {
        newErrors.sleepHours =
          'Please enter a valid number of sleep hours (between 0 and 24).';
      }
    }

    if (mood <= 0) {
      newErrors.mood = 'Please select your mood rating.';
    }

    if (rpe <= 0) {
      newErrors.rpe = 'Please select your Rate of Perceived Exertion (RPE).';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Reset Errors if validation passed
    setErrors({});
    setSaving(true);
    try {
      const registryItem = activeRegistryItem;

      let baseMET = registryItem.baseMET;
      let metric = registryItem.metric;

      // If syncWearable is enabled, simulate randomized/realistic wearable metrics
      let durationMin = Math.min(Math.max(parsedDuration, 1), 360);
      let localDistance = parsedDistance;

      if (syncWearable) {
        durationMin = Math.floor(Math.random() * 21) + 25;
        localDistance = parseFloat((Math.random() * 2.0 + 2.0).toFixed(1));
      }

      let value = durationMin;

      // Map metrics and values according to registry configuration (input is in KM)
      if (registryItem.category === 'distance') {
        if (metric === 'km') {
          value = parseFloat(localDistance.toFixed(1));
        } else if (metric === 'steps') {
          value = Math.round(localDistance * 1250);
        } else if (metric === 'm') {
          value = Math.round(localDistance * 1000);
        }
      } else if (registryItem.category === 'strength') {
        if (metric === 'sets') {
          value = parseInt(sets) || 5;
        } else if (metric === 'reps') {
          value = parseInt(reps) || 50;
        }
      }

      // Calculate metabolic burn with contextual modifiers
      let calculatedMET = baseMET;
      if (isDistanceBased) {
        const distanceMiles = localDistance / 1.60934;
        const speedMPH = distanceMiles / (durationMin / 60);
        calculatedMET = Math.min(speedMPH * 1.2 + baseMET, 23.0);
      }

      if (highIntensity) {
        calculatedMET += 1.5;
      }
      if (activeRecovery) {
        calculatedMET -= 0.5;
      }
      if (strengthRest) {
        calculatedMET -= 1.0;
      }
      if (calculatedMET < 1.0) {
        calculatedMET = 1.0;
      }

      // Calculate calories (calculatedMET * weight * duration * 0.0175)
      const calories = Math.round(
        calculatedMET * userWeight * durationMin * 0.0175,
      );

      let formattedNotes = notes.trim();
      if (syncWearable) {
        const syncDetail = `Completed ${activityType.toLowerCase()} routine.`;
        formattedNotes = formattedNotes
          ? `${formattedNotes}\n${syncDetail}`
          : syncDetail;
      } else if (registryItem.category === 'strength') {
        const workoutDetail = `Logged: ${sets} sets x ${reps} reps @ ${weightKg} kg.`;
        if (formattedNotes) {
          formattedNotes = `${formattedNotes}\n${workoutDetail}`;
        } else {
          formattedNotes = `Completed ${activityType.toLowerCase()} routine. ${workoutDetail}`;
        }
      } else if (!formattedNotes) {
        formattedNotes = `Completed ${activityType.toLowerCase()} routine.`;
      }

      // Call the Health Connect save API
      console.log('--------------------------------------------------');
      console.log('[Health Connect] SAVE API Initiated with payload...');

      const savePayload = {
        uhid: 'SAUSHA9775',
        deviceId: '99kjkhgg',
        type: activityType,
        value: value,
        metric: metric,
        durationMinutes: durationMin,
        caloriesBurned: calories,
        notes: formattedNotes,
      };

      console.log(
        '[Health Connect] Sending Save Payload:',
        JSON.stringify(savePayload, null, 2),
      );

      const response = await apiService.saveHealthConnectActivity(savePayload);

      console.log('[Health Connect] SAVE API SUCCESS!');
      console.log(
        '[Health Connect] SAVE API Response Data:',
        JSON.stringify(response, null, 2),
      );
      console.log('--------------------------------------------------');

      // Map the response fields or fallback to sent payload
      const responseData = response || {};
      const savedActivity: Activity = {
        id: responseData.id || `hc-${Date.now()}`,
        type: responseData.type || activityType,
        value: responseData.value !== undefined ? responseData.value : value,
        metric: responseData.metric || metric,
        durationMinutes:
          responseData.durationMinutes !== undefined
            ? responseData.durationMinutes
            : durationMin,
        caloriesBurned:
          responseData.caloriesBurned !== undefined
            ? responseData.caloriesBurned
            : calories,
        timestamp: responseData.timestamp || new Date().toISOString(),
        notes: responseData.notes || formattedNotes,
      };

      // Add the newly saved activity to the main list so it displays instantly on the screen
      setActivities(prev => [savedActivity, ...prev]);

      // If sleep hours < 4, trigger recovery alert simulation
      const parsedSleep = parseFloat(trimmedSleep);
      if (parsedSleep < 4.0) {
        Alert.alert(
          'Recovery Pacing Active',
          '🧘 Sleep is below 4.0 hours. Auto-pacing mode has paused active progression targets to prioritize recovery.',
        );
      }

      // Store results for the Benefits Summary Modal using response values
      const resDuration =
        responseData.durationMinutes !== undefined
          ? responseData.durationMinutes
          : durationMin;
      const resCalories =
        responseData.caloriesBurned !== undefined
          ? responseData.caloriesBurned
          : calories;
      const resGainPoints =
        responseData.gainPoints !== undefined
          ? responseData.gainPoints
          : Math.round(calculatedMET * resDuration);

      let resMusculoPoints = 0;
      let resCardioPoints = 0;
      if (registryItem.category === 'strength') {
        resMusculoPoints = Math.round(resGainPoints * 0.8);
        resCardioPoints = Math.round(resGainPoints * 0.2);
      } else if (registryItem.category === 'distance') {
        resCardioPoints = Math.round(resGainPoints * 0.8);
        resMusculoPoints = Math.round(resGainPoints * 0.2);
      } else {
        resCardioPoints = Math.round(resGainPoints * 0.5);
        resMusculoPoints = Math.round(resGainPoints * 0.5);
      }

      setLastLoggedSummary({
        type: responseData.type || activityType,
        emoji: registryItem.emoji || '💪',
        category: registryItem.category,
        duration: resDuration,
        calories: resCalories,
        gainPoints: resGainPoints,
        musculoPoints:
          responseData.musculoPoints !== undefined
            ? responseData.musculoPoints
            : resMusculoPoints,
        cardioPoints:
          responseData.cardioPoints !== undefined
            ? responseData.cardioPoints
            : resCardioPoints,
      });

      setModalVisible(false);
      setDuration('30');
      setDistance('2.0');
      setSleepHours('');
      setMood(0);
      setRpe(0);
      setNotes('');
      setSets('3');
      setReps('10');
      setWeightKg('15');
      setHighIntensity(false);
      setStrengthRest(false);
      setSyncWearable(false);
      setErrors({});
      setBenefitsVisible(true);
    } catch (error) {
      console.error('Failed to log workout details:', error);
      Alert.alert('Error', 'Failed to save workout details. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSyncWearable(false);
    setHighIntensity(false);
    setStrengthRest(false);
    setActiveRecovery(false);
    setErrors({});
  };

  const activityOptions = WELLNESS_ACTIVITIES_REGISTRY.map(act => ({
    name: act.name,
    emoji: act.emoji,
  }));

  const categoryMainOptions: Record<
    'distance' | 'strength' | 'duration',
    { name: string; emoji: string }[]
  > = {
    distance: [
      { name: 'Walking', emoji: '🚶' },
      { name: 'Running', emoji: '🏃' },
      { name: 'Cycling', emoji: '🚴' },
      { name: 'Hiking', emoji: '🥾' },
      { name: 'Jogging', emoji: '🏃‍♂️' },
      { name: 'Swimming', emoji: '🏊' },
    ],
    strength: [
      { name: 'Workout', emoji: '🏋️' },
      { name: 'Deadlifts / Weights', emoji: '🏋️‍♂️' },
      { name: 'Barbell Back Squats', emoji: '🏋️' },
      { name: 'Bench Press', emoji: '🏋️‍♂️' },
      { name: 'Push-ups / Calisthenics', emoji: '💪' },
      { name: 'Plank / Core', emoji: '🧘‍♂️' },
    ],
    duration: [
      { name: 'Yoga', emoji: '🧘' },
      { name: 'Zumba Gold', emoji: '💃' },
      { name: 'Cricket', emoji: '🏏' },
      { name: 'Pilates', emoji: '🤸' },
      { name: 'Badminton', emoji: '🏸' },
      { name: 'Football', emoji: '⚽' },
    ],
  };

  const mainOptions = categoryMainOptions[selectedCategory];
  const isCurrentCategorySelected =
    activeRegistryItem?.category === selectedCategory;

  let visibleOptions = [...mainOptions];
  if (isCurrentCategorySelected) {
    const selectedOpt = activityOptions.find(
      opt => opt.name.toLowerCase() === activityType.toLowerCase(),
    );
    const restOptions = mainOptions.filter(
      opt => opt.name.toLowerCase() !== activityType.toLowerCase(),
    );
    visibleOptions = selectedOpt ? [selectedOpt, ...restOptions] : mainOptions;
  }

  const moodRatings = [
    { value: 1, emoji: '😞', label: 'Poor' },
    { value: 2, emoji: '😐', label: 'Fair' },
    { value: 3, emoji: '🙂', label: 'Good' },
    { value: 4, emoji: '😃', label: 'Great' },
    { value: 5, emoji: '🤩', label: 'Elite' },
  ];

  // Helper to color-code RPE buttons dynamically based on exertion level
  const getRpeColorProps = (val: number, isSelected: boolean) => {
    if (val <= 3) {
      return {
        bg: isSelected ? '#10B981' : '#1E293B',
        border: isSelected ? '#10B981' : '#334155',
        text: isSelected ? '#FFFFFF' : '#34D399',
      };
    } else if (val <= 6) {
      return {
        bg: isSelected ? '#F59E0B' : '#1E293B',
        border: isSelected ? '#F59E0B' : '#334155',
        text: isSelected ? '#FFFFFF' : '#FBBF24',
      };
    } else {
      return {
        bg: isSelected ? '#EF4444' : '#1E293B',
        border: isSelected ? '#EF4444' : '#334155',
        text: isSelected ? '#FFFFFF' : '#F87171',
      };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title={STRINGS.ACTIVITY_TRACKING.TITLE}
        showDrawerButton
        containerStyle={{
          backgroundColor: '#0B0F19',
          borderBottomColor: '#1E293B',
        }}
        titleStyle={{ color: '#FFFFFF' }}
        buttonStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }}
        iconStyle={{ color: '#FFFFFF' }}
      />

      {/* Tabs Selector */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'Workout' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('Workout')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'Workout' && styles.tabButtonTextActive,
            ]}
          >
            🏋️ Workout Logs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === 'Steps' && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab('Steps')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'Steps' && styles.tabButtonTextActive,
            ]}
          >
            👣 Steps Logs
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'Workout' ? (
        loading && activities.length === 0 ? (
          <Loader fullScreen message="Loading activities list..." />
        ) : (
          <FlatList
            data={activities}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <ActivityCard activity={item} isDark={true} />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
              />
            }
            ListHeaderComponent={
              <View style={styles.headerComponent}>
                <CustomButton
                  title={STRINGS.ACTIVITY_TRACKING.LOG_ACTIVITY}
                  onPress={() => setModalVisible(true)}
                  variant="primary"
                  style={styles.addButton}
                />
              </View>
            }
            ListEmptyComponent={
              <EmptyState
                title="No Activities Yet"
                description={STRINGS.ACTIVITY_TRACKING.NO_ACTIVITIES}
                actionTitle="Log Your First Activity"
                onActionPress={() => setModalVisible(true)}
              />
            }
          />
        )
      ) : (
        <StepsLogsTab />
      )}

      {/* Interactive Activity Logging Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardAvoiding}
          >
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>📝 Log Workout Plan</Text>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={styles.modalScroll}
                showsVerticalScrollIndicator={false}
              >
                {/* Card 1: Select Activity */}
                <View style={styles.formCard}>
                  <Text style={styles.formCardTitle}>🎯 Select Activity</Text>
                  <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                    <View style={styles.labelRow}>
                      <Text style={styles.labelNoMargin}>
                        Select Activity Type
                      </Text>
                      <TouchableOpacity onPress={() => setSeeAllVisible(true)}>
                        <Text style={styles.showAllTextLink}>Show All 🔍</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Category Selector Tabs */}
                    <View style={styles.categoryTabsRow}>
                      <TouchableOpacity
                        style={[
                          styles.categoryTab,
                          selectedCategory === 'distance' &&
                            styles.categoryTabActive,
                        ]}
                        onPress={() => setSelectedCategory('distance')}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.categoryTabText,
                            selectedCategory === 'distance' &&
                              styles.categoryTabTextActive,
                          ]}
                        >
                          🏃 Cardio
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.categoryTab,
                          selectedCategory === 'strength' &&
                            styles.categoryTabActive,
                        ]}
                        onPress={() => setSelectedCategory('strength')}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.categoryTabText,
                            selectedCategory === 'strength' &&
                              styles.categoryTabTextActive,
                          ]}
                        >
                          🏋️ Strength
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.categoryTab,
                          selectedCategory === 'duration' &&
                            styles.categoryTabActive,
                        ]}
                        onPress={() => setSelectedCategory('duration')}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.categoryTabText,
                            selectedCategory === 'duration' &&
                              styles.categoryTabTextActive,
                          ]}
                        >
                          🧘 Mind & Sports
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.optionsScroll}
                    >
                      {visibleOptions.map(option => {
                        const isSelected = activityType === option.name;
                        return (
                          <TouchableOpacity
                            key={option.name}
                            style={[
                              styles.optionItem,
                              isSelected && styles.optionItemActive,
                            ]}
                            onPress={() => setActivityType(option.name)}
                          >
                            <Text
                              style={option.emoji ? styles.optionEmoji : null}
                            >
                              {option.emoji}
                            </Text>
                            <Text
                              style={[
                                styles.optionText,
                                isSelected && styles.optionTextActive,
                              ]}
                            >
                              {option.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>
                </View>

                {/* Card 2: Settings & Intensity */}
                <View style={styles.formCard}>
                  <Text style={styles.formCardTitle}>
                    ⚡ Settings & Intensity
                  </Text>

                  {/* Contextual Modifiers */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Contextual Modifiers</Text>
                    
                    {/* Row 1: High-Intensity & Active Recovery */}
                    <View style={styles.modifiersRow}>
                      <TouchableOpacity
                        style={[
                          styles.modifierButton,
                          highIntensity && styles.modifierButtonActive,
                        ]}
                        onPress={() => {
                          setHighIntensity(!highIntensity);
                          if (!highIntensity) {
                            setStrengthRest(false);
                            setActiveRecovery(false);
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.modifierText,
                            highIntensity && styles.modifierTextActive,
                          ]}
                        >
                          ⚡ High-Intensity (+1.5 METs)
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.modifierButton,
                          activeRecovery && styles.modifierButtonActive,
                        ]}
                        onPress={() => {
                          setActiveRecovery(!activeRecovery);
                          if (!activeRecovery) {
                            setHighIntensity(false);
                            setStrengthRest(false);
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.modifierText,
                            activeRecovery && styles.modifierTextActive,
                          ]}
                        >
                          🚶 Active Recovery (-0.5 METs)
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Row 2: Strength Rest (Centered below) */}
                    <View style={[styles.modifiersRow, { marginTop: 8, justifyContent: 'center' }]}>
                      <TouchableOpacity
                        style={[
                          styles.modifierButton,
                          { flex: 0, width: '48.5%' },
                          strengthRest && styles.modifierButtonActive,
                        ]}
                        onPress={() => {
                          setStrengthRest(!strengthRest);
                          if (!strengthRest) {
                            setHighIntensity(false);
                            setActiveRecovery(false);
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.modifierText,
                            strengthRest && styles.modifierTextActive,
                          ]}
                        >
                          🧘 Strength Rest (-1.0 METs)
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Sync Smart Wearable Toggle Switch */}
                <View
                  style={[
                    styles.syncWearableContainer,
                    { marginBottom: syncWearable ? theme.spacing.md : 0 },
                  ]}
                >
                  <Text style={styles.syncWearableLabel}>
                    SYNC FROM APPLE WATCH/FITNESS TRACKER
                  </Text>
                  <Switch
                    value={syncWearable}
                    onValueChange={setSyncWearable}
                    trackColor={{ false: '#334155', true: '#10B981' }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#334155"
                  />
                </View>

                {syncWearable && (
                  <View
                    style={[styles.wearableSyncInfoCard, { marginBottom: 0 }]}
                  >
                    <Text style={styles.wearableSyncInfoText}>
                      ⌚ Wearable Sync Enabled: Active Calories, Heart Rate, and
                      duration will be fetched automatically from your connected
                      wearable device.
                    </Text>
                  </View>
                )}
                <View style={{ marginBottom: 15 }} />

                {/* Card 3: Workout Metrics */}
                {(!syncWearable ||
                  activeRegistryItem?.category === 'strength') && (
                  <View style={styles.formCard}>
                    <Text style={styles.formCardTitle}>📊 Workout Metrics</Text>

                    {!syncWearable && (
                      <>
                        {/* Duration Input */}
                        <View
                          style={[
                            styles.inputGroup,
                            {
                              marginBottom: isDistanceBased
                                ? theme.spacing.lg
                                : 0,
                            },
                          ]}
                        >
                          <Text style={styles.label}>Duration (minutes)</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="e.g. 30"
                            placeholderTextColor={theme.colors.textLight}
                            keyboardType="numeric"
                            value={duration}
                            onChangeText={setDuration}
                          />
                        </View>

                        {/* Distance Input (Conditional) */}
                        {isDistanceBased && (
                          <View
                            style={[styles.inputGroup, { marginBottom: 0 }]}
                          >
                            <Text style={styles.label}>Distance (KM)</Text>
                            <TextInput
                              style={styles.input}
                              placeholder="e.g. 2.5"
                              placeholderTextColor={theme.colors.textLight}
                              keyboardType="numeric"
                              value={distance}
                              onChangeText={setDistance}
                            />
                            {parsedDuration > 0 && parsedDistance > 0 && (
                              <View style={styles.velocityContainer}>
                                <Text style={styles.velocityText}>
                                  ⚡ Live Velocity Speed:{' '}
                                  {liveVelocity.toFixed(1)} km/h
                                </Text>
                              </View>
                            )}
                          </View>
                        )}
                      </>
                    )}

                    {/* Resistance Parameters (Strength workouts) */}
                    {activeRegistryItem?.category === 'strength' && (
                      <LinearGradient
                        colors={['#4f46e5', '#3730a3']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.flatten([
                          styles.strengthParamsContainer,
                          {
                            marginBottom: 0,
                            marginTop: !syncWearable ? theme.spacing.lg : 0,
                          },
                        ])}
                      >
                        <Text style={styles.sectionHeader}>
                          🏋️‍♂️ Resistance Parameters
                        </Text>
                        <View style={styles.paramsRow}>
                          <View style={styles.paramInputGroup}>
                            <Text style={styles.paramLabel}>Sets</Text>
                            <TextInput
                              style={styles.paramInput}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor="rgba(255, 255, 255, 0.4)"
                              value={sets}
                              onChangeText={setSets}
                            />
                          </View>
                          <View style={styles.paramInputGroup}>
                            <Text style={styles.paramLabel}>Reps</Text>
                            <TextInput
                              style={styles.paramInput}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor="rgba(255, 255, 255, 0.4)"
                              value={reps}
                              onChangeText={setReps}
                            />
                          </View>
                          <View style={styles.paramInputGroup}>
                            <Text style={styles.paramLabel}>Weight (kg)</Text>
                            <TextInput
                              style={styles.paramInput}
                              keyboardType="numeric"
                              placeholder="0"
                              placeholderTextColor="rgba(255, 255, 255, 0.4)"
                              value={weightKg}
                              onChangeText={setWeightKg}
                            />
                          </View>
                        </View>
                      </LinearGradient>
                    )}
                  </View>
                )}

                {/* Card 4: Wellness & Exertion */}
                <View style={styles.formCard}>
                  <Text style={styles.formCardTitle}>
                    🌱 Wellness & Exertion
                  </Text>

                  {/* Sleep Hours Logged (Fatigue Guard) */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Sleep Hours (Last Night) *</Text>
                    <TextInput
                      style={[
                        styles.input,
                        errors.sleepHours ? styles.inputError : null,
                      ]}
                      placeholder="e.g. 7.5"
                      placeholderTextColor={theme.colors.textLight}
                      keyboardType="numeric"
                      value={sleepHours}
                      onChangeText={text => {
                        setSleepHours(text);
                        if (errors.sleepHours) {
                          setErrors(prev => ({
                            ...prev,
                            sleepHours: undefined,
                          }));
                        }
                      }}
                    />
                    {errors.sleepHours ? (
                      <Text style={styles.errorText}>{errors.sleepHours}</Text>
                    ) : null}
                  </View>

                  {/* Mood Selection */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mood Rating *</Text>
                    <View style={styles.ratingsRow}>
                      {moodRatings.map(item => {
                        const isSelected = mood === item.value;
                        return (
                          <TouchableOpacity
                            key={item.value}
                            style={[
                              styles.moodButton,
                              isSelected && styles.moodButtonActive,
                              errors.mood ? styles.borderError : null,
                            ]}
                            onPress={() => {
                              setMood(item.value);
                              if (errors.mood) {
                                setErrors(prev => ({
                                  ...prev,
                                  mood: undefined,
                                }));
                              }
                            }}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.moodEmoji}>{item.emoji}</Text>
                            <Text
                              style={[
                                styles.moodText,
                                isSelected && styles.moodTextActive,
                              ]}
                            >
                              {item.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {errors.mood ? (
                      <Text style={styles.errorText}>{errors.mood}</Text>
                    ) : null}
                  </View>

                  {/* RPE Exertion */}
                  <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                    <Text style={styles.label}>
                      Rate of Perceived Exertion (RPE 1-10) *
                    </Text>
                    <View style={styles.rpeRow}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => {
                        const isSelected = rpe === val;
                        const colors = getRpeColorProps(val, isSelected);
                        return (
                          <TouchableOpacity
                            key={val}
                            style={[
                              styles.rpeButton,
                              {
                                backgroundColor: colors.bg,
                                borderColor: errors.rpe
                                  ? theme.colors.error
                                  : colors.border,
                                borderWidth: errors.rpe || isSelected ? 2 : 1,
                              },
                            ]}
                            onPress={() => {
                              setRpe(val);
                              if (errors.rpe) {
                                setErrors(prev => ({
                                  ...prev,
                                  rpe: undefined,
                                }));
                              }
                            }}
                            activeOpacity={0.8}
                          >
                            <Text
                              style={[
                                styles.rpeText,
                                {
                                  color: colors.text,
                                  fontWeight: isSelected ? 'bold' : 'normal',
                                },
                              ]}
                            >
                              {val}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                    {errors.rpe ? (
                      <Text style={styles.errorText}>{errors.rpe}</Text>
                    ) : null}
                  </View>
                </View>

                <View style={[styles.inputGroup, { marginTop: 8 }]}>
                  <Text style={styles.label}>Notes</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe how you felt or log custom notes..."
                    placeholderTextColor={theme.colors.textLight}
                    multiline
                    numberOfLines={3}
                    value={notes}
                    onChangeText={setNotes}
                  />
                </View>
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <CustomButton
                  title="Cancel"
                  onPress={handleCloseModal}
                  variant="outline"
                  style={styles.footerButton}
                />
                <CustomButton
                  title="Save Workout"
                  onPress={handleSaveActivity}
                  variant="primary"
                  loading={saving}
                  disabled={saving}
                  style={styles.footerButton}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={seeAllVisible}
        onRequestClose={() => setSeeAllVisible(false)}
      >
        <View style={styles.searchModalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.searchModalKeyboardAvoiding}
          >
            <View style={styles.searchModalContent}>
              {/* Header */}
              <View style={styles.searchModalHeader}>
                <Text style={styles.searchModalTitle}>
                  🔍 All Activity Types
                </Text>
                <TouchableOpacity
                  onPress={() => setSeeAllVisible(false)}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Search Bar */}
              <View style={styles.searchBarContainer}>
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search activity..."
                  placeholderTextColor={theme.colors.textLight}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                />
              </View>

              {/* List of filtered activities */}
              <ScrollView
                contentContainerStyle={styles.searchScroll}
                keyboardShouldPersistTaps="handled"
              >
                {WELLNESS_ACTIVITIES_REGISTRY.filter(opt =>
                  opt.name.toLowerCase().includes(searchQuery.toLowerCase()),
                ).map(opt => {
                  const isSelected = activityType === opt.name;
                  return (
                    <TouchableOpacity
                      key={opt.name}
                      style={[
                        styles.searchRowItem,
                        isSelected && styles.searchRowItemActive,
                      ]}
                      onPress={() => {
                        setActivityType(opt.name);
                        setSelectedCategory(opt.category as any);
                        setSeeAllVisible(false);
                        setSearchQuery('');
                      }}
                    >
                      <Text style={styles.searchRowEmoji}>{opt.emoji}</Text>
                      <Text
                        style={[
                          styles.searchRowText,
                          isSelected && styles.searchRowTextActive,
                        ]}
                      >
                        {opt.name}
                      </Text>
                      {isSelected && (
                        <Text style={styles.searchRowCheck}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent={true}
        visible={benefitsVisible}
        onRequestClose={() => setBenefitsVisible(false)}
      >
        <View style={styles.benefitsModalContainer}>
          <View style={styles.benefitsContent}>
            <Text style={styles.benefitsTitle}>🎉 Workout Saved!</Text>
            <Text style={styles.benefitsSubtitle}>
              Here are your estimated workout benefits:
            </Text>

            {lastLoggedSummary && (
              <View style={styles.benefitsMetricsContainer}>
                {/* Metric Grid */}
                <View style={styles.metricsGrid}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricEmoji}>🔥</Text>
                    <Text style={styles.metricLabel}>Active Burn</Text>
                    <Text style={styles.metricValueText}>
                      {lastLoggedSummary.calories} kcal
                    </Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricEmoji}>⭐</Text>
                    <Text style={styles.metricLabel}>Gain Points</Text>
                    <Text style={styles.metricValueText}>
                      {lastLoggedSummary.gainPoints} pts
                    </Text>
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricEmoji}>❤️</Text>
                    <Text style={styles.metricLabel}>Heart Points</Text>
                    <Text style={styles.metricValueText}>
                      {lastLoggedSummary.cardioPoints} pts
                    </Text>
                  </View>
                </View>
                <Text style={styles.scorecardTitle}>
                  Daily Scorecard Progress
                </Text>

                <View style={styles.benefitRow}>
                  <View style={styles.benefitHeader}>
                    <Text style={styles.benefitLabel}>
                      🦾 Musculoskeletal Power
                    </Text>
                    <Text style={styles.benefitValueText}>
                      {lastLoggedSummary.musculoPoints} / 150 pts
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          backgroundColor: '#8B5CF6',
                          width: `${Math.min(
                            (lastLoggedSummary.musculoPoints / 150) * 100,
                            100,
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                </View>

                <View style={styles.benefitRow}>
                  <View style={styles.benefitHeader}>
                    <Text style={styles.benefitLabel}>🫁 Cardio Health</Text>
                    <Text style={styles.benefitValueText}>
                      {lastLoggedSummary.cardioPoints} / 150 pts
                    </Text>
                  </View>
                  <View style={styles.progressBarBg}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          backgroundColor: '#3B82F6',
                          width: `${Math.min(
                            (lastLoggedSummary.cardioPoints / 150) * 100,
                            100,
                          )}%`,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            )}

            <CustomButton
              title="CLOSE!"
              onPress={() => setBenefitsVisible(false)}
              variant="primary"
              style={styles.benefitsCloseBtn}
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
    backgroundColor: '#0B0F19',
  },
  listContent: {
    padding: theme.spacing.containerPadding,
    flexGrow: 1,
  },
  headerComponent: {
    marginBottom: theme.spacing.lg,
  },
  addButton: {
    width: '100%',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  modalKeyboardAvoiding: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: theme.spacing.borderRadiusLg,
    borderTopRightRadius: theme.spacing.borderRadiusLg,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: '#94A3B8',
    fontWeight: 'bold',
  },
  modalScroll: {
    padding: theme.spacing.lg,
  },
  formCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  formCardTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#818cf8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#F1F5F9',
    marginBottom: theme.spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  labelNoMargin: {
    fontSize: 14.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#F1F5F9',
  },
  showAllTextLink: {
    fontSize: 14,
    color: '#818cf8',
    fontWeight: theme.fonts.weights.bold as any,
  },
  optionsScroll: {
    paddingVertical: 4,
    gap: 4,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 8,
  },
  searchModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  searchModalKeyboardAvoiding: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModalContent: {
    backgroundColor: '#0F172A',
    borderRadius: theme.spacing.borderRadiusLg,
    width: '90%',
    height: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  searchModalTitle: {
    fontSize: 16.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#FFFFFF',
  },
  searchBarContainer: {
    padding: theme.spacing.md,
    backgroundColor: '#0B0F19',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  searchInput: {
    height: 44,
    backgroundColor: '#1E293B',
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: theme.spacing.md,
    fontSize: 15,
    color: '#FFFFFF',
  },
  searchScroll: {
    padding: theme.spacing.sm,
  },
  searchRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.spacing.borderRadiusMd,
    marginBottom: 4,
  },
  searchRowItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
  },
  searchRowEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  searchRowText: {
    fontSize: 14.5,
    color: '#E2E8F0',
    flex: 1,
  },
  searchRowTextActive: {
    fontWeight: theme.fonts.weights.bold as any,
    color: '#818cf8',
  },
  searchRowCheck: {
    fontSize: 16,
    color: '#818cf8',
    fontWeight: 'bold',
  },
  optionItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366f1',
  },
  optionEmoji: {
    fontSize: 17,
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: theme.fonts.weights.medium as any,
  },
  optionTextActive: {
    color: '#818cf8',
    fontWeight: theme.fonts.weights.bold as any,
  },
  input: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: theme.spacing.borderRadiusMd,
    height: 48,
    paddingHorizontal: theme.spacing.md,
    fontSize: 15.5,
    color: '#FFFFFF',
  },
  textArea: {
    height: 80,
    paddingTop: theme.spacing.sm,
    textAlignVertical: 'top',
  },
  syncWearableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: theme.spacing.lg,
  },
  syncWearableLabel: {
    fontSize: 12.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#94A3B8',
    letterSpacing: 0.3,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  wearableSyncInfoCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: theme.spacing.borderRadiusMd,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  wearableSyncInfoText: {
    fontSize: 13.5,
    color: '#10B981',
    lineHeight: 19,
    textAlign: 'center',
    fontWeight: theme.fonts.weights.medium as any,
  },
  velocityContainer: {
    marginTop: theme.spacing.xs,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.spacing.borderRadiusMd,
  },
  velocityText: {
    fontSize: 13.5,
    color: '#818cf8',
    fontWeight: theme.fonts.weights.bold as any,
  },
  ratingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  moodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366f1',
    elevation: 2,
  },
  moodEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  moodText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: theme.fonts.weights.medium as any,
  },
  moodTextActive: {
    color: '#818cf8',
    fontWeight: theme.fonts.weights.bold as any,
  },
  rpeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 4,
  },
  rpeButton: {
    width: '18%',
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rpeText: {
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    gap: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },
  strengthParamsContainer: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
  },
  paramsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  paramInputGroup: {
    flex: 1,
  },
  paramLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#e0e7ff',
    marginBottom: theme.spacing.xs,
  },
  paramInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: theme.spacing.sm,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  modifiersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  modifierButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modifierButtonActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderColor: '#6366f1',
  },
  modifierText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: theme.fonts.weights.medium as any,
    textAlign: 'center',
  },
  modifierTextActive: {
    color: '#818cf8',
    fontWeight: theme.fonts.weights.bold as any,
  },
  previewCard: {
    backgroundColor: theme.colors.primaryLight + '30',
    borderColor: theme.colors.primary + '30',
    borderWidth: 1.5,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  previewCardTitle: {
    fontSize: 14,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  previewMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  previewMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  previewMetricLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  previewMetricValue: {
    fontSize: 14.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
  },
  previewSplitsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.primary + '20',
    paddingTop: theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  previewSplitText: {
    fontSize: 11.5,
    color: theme.colors.textSecondary,
  },
  boldText: {
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  benefitsModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
  },
  benefitsContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadiusLg,
    width: '90%',
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  benefitsTitle: {
    fontSize: 22,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  benefitsSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  benefitsMetricsContainer: {
    marginBottom: theme.spacing.lg,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.spacing.borderRadiusMd,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metricEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  metricValueText: {
    fontSize: 14,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
  },
  scorecardTitle: {
    fontSize: 15,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  benefitRow: {
    marginBottom: theme.spacing.md,
  },
  benefitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  benefitLabel: {
    fontSize: 13,
    fontWeight: theme.fonts.weights.medium as any,
    color: theme.colors.text,
  },
  benefitValueText: {
    fontSize: 12.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.textSecondary,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  benefitsCloseBtn: {
    width: '100%',
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.error,
    marginTop: 4,
    fontWeight: theme.fonts.weights.medium as any,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  borderError: {
    borderColor: theme.colors.error,
  },
  categoryTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 0,
    marginBottom: theme.spacing.md,
    backgroundColor: '#0F172A',
    padding: 2,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: theme.spacing.borderRadiusMd - 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  categoryTabActive: {
    backgroundColor: '#1E293B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryTabText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: theme.fonts.weights.medium as any,
  },
  categoryTabTextActive: {
    color: '#FFFFFF',
    fontWeight: theme.fonts.weights.bold as any,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#0E1626',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#151E33',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  tabButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  stepsPlaceholderContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  stepsPlaceholderCard: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
    width: '100%',
    maxWidth: 340,
  },
  stepsPlaceholderEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  stepsPlaceholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepsPlaceholderDesc: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  comingSoonBadge: {
    backgroundColor: theme.colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
});

export default ActivityTrackingScreen;
