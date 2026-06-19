import React, { useState, useEffect } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
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

  // Calculate live velocity feedback (in km/h)
  const parsedDuration = parseFloat(duration) || 0;
  const parsedDistance = parseFloat(distance) || 0;
  const liveVelocity =
    parsedDuration > 0 && parsedDistance > 0
      ? parsedDistance / (parsedDuration / 60)
      : 0;

  const handleSaveActivity = async () => {
    // 1. Strict Form Validations
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
      const durationMin = Math.min(Math.max(parsedDuration, 1), 360);
      let value = durationMin;

      // Map metrics and values according to registry configuration (input is in KM)
      if (registryItem.category === 'distance') {
        if (metric === 'km') {
          value = parseFloat(parsedDistance.toFixed(1));
        } else if (metric === 'steps') {
          value = Math.round(parsedDistance * 1250);
        } else if (metric === 'm') {
          value = Math.round(parsedDistance * 1000);
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
        // Convert distance in KM to miles for velocity-based MET pace calculation (MET formula calibrated for MPH)
        const distanceMiles = parsedDistance / 1.60934;
        const speedMPH = distanceMiles / (durationMin / 60);
        calculatedMET = Math.min(speedMPH * 1.2 + baseMET, 23.0);
      }

      if (highIntensity) {
        calculatedMET += 1.5;
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

      // Points calculations (Total points = calculatedMET * duration)
      const gainPoints = Math.round(calculatedMET * durationMin);
      let musculoPoints = 0;
      let cardioPoints = 0;

      if (registryItem.category === 'strength') {
        musculoPoints = Math.round(gainPoints * 0.8);
        cardioPoints = Math.round(gainPoints * 0.2);
      } else if (registryItem.category === 'distance') {
        cardioPoints = Math.round(gainPoints * 0.8);
        musculoPoints = Math.round(gainPoints * 0.2);
      } else {
        cardioPoints = Math.round(gainPoints * 0.5);
        musculoPoints = Math.round(gainPoints * 0.5);
      }

      // Format notes with strength parameters if applicable
      let formattedNotes = notes.trim();
      if (registryItem.category === 'strength') {
        const workoutDetail = `Logged: ${sets} sets x ${reps} reps @ ${weightKg} kg.`;
        if (formattedNotes) {
          formattedNotes = `${formattedNotes}\n${workoutDetail}`;
        } else {
          formattedNotes = `Completed ${activityType.toLowerCase()} routine. ${workoutDetail}`;
        }
      } else if (!formattedNotes) {
        formattedNotes = `Completed ${activityType.toLowerCase()} routine.`;
      }

      const payload = {
        type: activityType as any,
        value,
        metric,
        durationMinutes: durationMin,
        caloriesBurned: calories,
        notes: formattedNotes,
      };

      const newActivity = await apiService.logActivity(payload);
      setActivities(prev => [newActivity, ...prev]);

      // If sleep hours < 4, trigger recovery alert simulation
      const parsedSleep = parseFloat(trimmedSleep);
      if (parsedSleep < 4.0) {
        Alert.alert(
          'Recovery Pacing Active',
          '🧘 Sleep is below 4.0 hours. Auto-pacing mode has paused active progression targets to prioritize recovery.',
        );
      }

      // Store results for the Benefits Summary Modal
      setLastLoggedSummary({
        type: activityType,
        emoji: registryItem.emoji || '💪',
        category: registryItem.category,
        duration: durationMin,
        calories,
        gainPoints,
        musculoPoints,
        cardioPoints,
      });

      // Reset Form fields
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
      setErrors({});

      // Show the Benefits Summary Modal
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

  // Helper to color-code RPE buttons dynamically based on exertion levels
  const getRpeColorProps = (val: number, isSelected: boolean) => {
    if (val <= 3) {
      return {
        bg: isSelected ? '#10B981' : '#E8F5E9',
        border: isSelected ? '#10B981' : '#81C784',
        text: isSelected ? '#FFFFFF' : '#2E7D32',
      };
    } else if (val <= 6) {
      return {
        bg: isSelected ? '#F59E0B' : '#FFF8E1',
        border: isSelected ? '#F59E0B' : '#FDD835',
        text: isSelected ? '#FFFFFF' : '#F57F17',
      };
    } else {
      return {
        bg: isSelected ? '#EF4444' : '#FFEBEE',
        border: isSelected ? '#EF4444' : '#E57373',
        text: isSelected ? '#FFFFFF' : '#C62828',
      };
    }
  };

  // Live session estimates computed in real-time
  const liveBaseMET = activeRegistryItem?.baseMET || 4.0;
  const liveModifiers = (highIntensity ? 1.5 : 0) + (strengthRest ? -1.0 : 0);
  let liveCalculatedMET = liveBaseMET;
  if (isDistanceBased) {
    // Convert distance in KM to miles for velocity-based MET pace calculation (MET formula calibrated for MPH)
    const distanceMiles = parsedDistance / 1.60934;
    const speedMPH =
      distanceMiles / (parsedDuration > 0 ? parsedDuration / 60 : 1);
    liveCalculatedMET = Math.min(speedMPH * 1.2 + liveBaseMET, 23.0);
  }
  liveCalculatedMET = Math.max(liveCalculatedMET + liveModifiers, 1.0);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const liveCalories = Math.round(
    liveCalculatedMET * userWeight * parsedDuration * 0.0175,
  );
  const liveGainPoints = Math.round(liveCalculatedMET * parsedDuration);

  /* eslint-disable @typescript-eslint/no-unused-vars */
  const liveCategory = activeRegistryItem?.category || 'duration';
  let liveMusculoSplit = 0;
  let liveCardioSplit = 0;
  if (liveCategory === 'strength') {
    liveMusculoSplit = Math.round(liveGainPoints * 0.8);
    liveCardioSplit = Math.round(liveGainPoints * 0.2);
  } else if (liveCategory === 'distance') {
    liveCardioSplit = Math.round(liveGainPoints * 0.8);
    liveMusculoSplit = Math.round(liveGainPoints * 0.2);
  } else {
    liveCardioSplit = Math.round(liveGainPoints * 0.5);
    liveMusculoSplit = Math.round(liveGainPoints * 0.5);
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title={STRINGS.ACTIVITY_TRACKING.TITLE}
        showDrawerButton
        containerStyle={{ backgroundColor: '#0B0F19', borderBottomColor: '#1E293B' }}
        titleStyle={{ color: '#FFFFFF' }}
        buttonStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B' }}
        iconStyle={{ color: '#FFFFFF' }}
      />

      {/* Tabs Selector */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Workout' && styles.tabButtonActive]}
          onPress={() => setActiveTab('Workout')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, activeTab === 'Workout' && styles.tabButtonTextActive]}>
            🏋️ Workout Logs
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'Steps' && styles.tabButtonActive]}
          onPress={() => setActiveTab('Steps')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabButtonText, activeTab === 'Steps' && styles.tabButtonTextActive]}>
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
            renderItem={({ item }) => <ActivityCard activity={item} isDark={true} />}
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
                {/* Activity Selector (With row-aligned Show All link) */}
                <View style={styles.inputGroup}>
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

                {/* Contextual Modifiers */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Contextual Modifiers</Text>
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
                        strengthRest && styles.modifierButtonActive,
                      ]}
                      onPress={() => {
                        setStrengthRest(!strengthRest);
                        if (!strengthRest) {
                          setHighIntensity(false);
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

                {/* Duration Input */}
                <View style={styles.inputGroup}>
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
                  <View style={styles.inputGroup}>
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
                          ⚡ Live Velocity Speed: {liveVelocity.toFixed(1)} km/h
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Resistance Parameters (Strength workouts) */}
                {activeRegistryItem?.category === 'strength' && (
                  <LinearGradient
                    colors={['#4f46e5', '#3730a3']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.strengthParamsContainer}
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
                        setErrors(prev => ({ ...prev, sleepHours: undefined }));
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
                              setErrors(prev => ({ ...prev, mood: undefined }));
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
                <View style={styles.inputGroup}>
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
                              setErrors(prev => ({ ...prev, rpe: undefined }));
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

                {/* Notes Input */}
                <View style={styles.inputGroup}>
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

                {/* Dynamic Session Summary Preview */}
                {/* <View style={styles.previewCard}>
                  <Text style={styles.previewCardTitle}>
                    📊 Live Session Estimate
                  </Text>

                  <View style={styles.previewMetricsRow}>
                    <View style={styles.previewMetricItem}>
                      <Text style={styles.previewMetricLabel}>Intensity</Text>
                      <Text style={styles.previewMetricValue}>
                        {liveCalculatedMET.toFixed(1)} METs
                      </Text>
                    </View>

                    <View style={styles.previewMetricItem}>
                      <Text style={styles.previewMetricLabel}>Est. Burn</Text>
                      <Text style={styles.previewMetricValue}>
                        {liveCalories} kcal
                      </Text>
                    </View>

                    <View style={styles.previewMetricItem}>
                      <Text style={styles.previewMetricLabel}>Gain Points</Text>
                      <Text style={styles.previewMetricValue}>
                        {liveGainPoints} pts
                      </Text>
                    </View>
                  </View>

                  <View style={styles.previewSplitsRow}>
                    <Text style={styles.previewSplitText}>
                      🦾 Musculo:{' '}
                      <Text style={styles.boldText}>
                        {liveMusculoSplit} pts
                      </Text>
                    </Text>
                    <Text style={styles.previewSplitText}>
                      🫁 Cardio:{' '}
                      <Text style={styles.boldText}>{liveCardioSplit} pts</Text>
                    </Text>
                  </View>
                </View> */}
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

      {/* Searchable Activity Picker Modal */}
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

      {/* Workout Benefits Summary Modal */}
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

                {/* Scorecard Progress Bars */}
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // slate transparent overlay
  },
  modalKeyboardAvoiding: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.spacing.borderRadiusLg,
    borderTopRightRadius: theme.spacing.borderRadiusLg,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  modalScroll: {
    padding: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
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
    color: theme.colors.text,
  },
  showAllTextLink: {
    fontSize: 14,
    color: theme.colors.primary,
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
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: 8,
  },
  searchModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.4)', // slate transparent overlay
  },
  searchModalKeyboardAvoiding: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchModalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadiusLg,
    width: '90%',
    height: 400,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchModalTitle: {
    fontSize: 16.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
  },
  searchBarContainer: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    height: 44,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingHorizontal: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.text,
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
    backgroundColor: theme.colors.primaryLight,
  },
  searchRowEmoji: {
    fontSize: 18,
    marginRight: 12,
  },
  searchRowText: {
    fontSize: 14.5,
    color: theme.colors.text,
    flex: 1,
  },
  searchRowTextActive: {
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.primary,
  },
  searchRowCheck: {
    fontSize: 16,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  optionItemActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  optionEmoji: {
    fontSize: 17,
    marginRight: 6,
  },
  optionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weights.medium as any,
  },
  optionTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.weights.bold as any,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.spacing.borderRadiusMd,
    height: 48,
    paddingHorizontal: theme.spacing.md,
    fontSize: 15.5,
    color: theme.colors.text,
  },
  textArea: {
    height: 80,
    paddingTop: theme.spacing.sm,
    textAlignVertical: 'top',
  },
  velocityContainer: {
    marginTop: theme.spacing.xs,
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.spacing.borderRadiusMd,
  },
  velocityText: {
    fontSize: 13.5,
    color: theme.colors.primary,
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
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moodButtonActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
    elevation: 2,
  },
  moodEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  moodText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weights.medium as any,
  },
  moodTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.weights.bold as any,
  },
  rpeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 4,
  },
  rpeButton: {
    width: '18%', // Renders exactly 5 items per row nicely on a 10 items grid
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
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },

  // Resistance Parameters Styles
  strengthParamsContainer: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: 16,
    // iOS shadow
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

  // Contextual Modifiers Styles
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
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modifierButtonActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  modifierText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weights.medium as any,
    textAlign: 'center',
  },
  modifierTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.weights.bold as any,
  },

  // Preview Card Styles
  previewCard: {
    backgroundColor: theme.colors.primaryLight + '30', // soft translucent indigo
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

  // Benefits Summary Modal Styles
  benefitsModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)', // darker overlay for focus
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

  // Validation Error Styles
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

  // Category Selector Tabs Styles
  categoryTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
    padding: 4,
    borderRadius: theme.spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: theme.colors.border,
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
    backgroundColor: theme.colors.surface,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryTabText: {
    fontSize: 12.5,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weights.medium as any,
  },
  categoryTabTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.fonts.weights.bold as any,
  },

  // Upper screen tab styles
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

  // Steps placeholder styles
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
