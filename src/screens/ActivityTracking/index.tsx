import React, { useState, useEffect } from 'react';
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

export const ActivityTrackingScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Modal & Form States
  const [modalVisible, setModalVisible] = useState(false);
  const [activityType, setActivityType] = useState('Walking');
  const [duration, setDuration] = useState('30');
  const [distance, setDistance] = useState('2.0'); // in miles
  const [sleepHours, setSleepHours] = useState('8');
  const [mood, setMood] = useState(3);
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState('');

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
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActivities();
  };

  const activeRegistryItem = WELLNESS_ACTIVITIES_REGISTRY.find(
    (act) => act.name.toLowerCase() === activityType.toLowerCase()
  );
  const isDistanceBased = activeRegistryItem?.category === 'distance';

  // Calculate live velocity feedback (in MPH)
  const parsedDuration = parseFloat(duration) || 0;
  const parsedDistance = parseFloat(distance) || 0;
  const liveVelocity = parsedDuration > 0 && parsedDistance > 0 
    ? (parsedDistance / (parsedDuration / 60)) 
    : 0;

  const handleSaveActivity = async () => {
    setSaving(true);
    try {
      const registryItem = WELLNESS_ACTIVITIES_REGISTRY.find(
        (act) => act.name.toLowerCase() === activityType.toLowerCase()
      ) || {
        baseMET: 4.0,
        metric: 'mins',
        category: 'duration',
      };

      let baseMET = registryItem.baseMET;
      let metric = registryItem.metric;
      let value = parsedDuration;

      // Map metrics and values according to registry configuration
      if (registryItem.category === 'distance') {
        if (metric === 'km') {
          value = parseFloat((parsedDistance * 1.609).toFixed(1));
        } else if (metric === 'steps') {
          value = Math.round(parsedDistance * 2000);
        } else if (metric === 'm') {
          value = Math.round(parsedDistance * 1609);
        }
      } else if (registryItem.category === 'strength') {
        if (metric === 'sets') {
          value = 5;
        } else if (metric === 'reps') {
          value = 50;
        }
      }

      // Fetch user profile weight for calorie calculations
      const profile = await apiService.getProfile();
      const weight = profile.weight || 74.5;

      // Calculate metabolic burn (Formula mirroring MoveHubProactiveEngine math)
      let calories = 150;
      const durationMin = Math.min(Math.max(parsedDuration, 1), 360);
      if (isDistanceBased) {
        // Compound velocity pace bonus factor (speedMPH * 1.2)
        const speedMPH = parsedDistance / (durationMin / 60);
        const dynamicSpeedMET = Math.min(speedMPH * 1.2 + baseMET, 23.0);
        calories = Math.round(((dynamicSpeedMET * 3.5 * weight) / 200) * durationMin);
      } else {
        calories = Math.round(((baseMET * 3.5 * weight) / 200) * durationMin);
      }

      const payload = {
        type: activityType as any,
        value,
        metric,
        durationMinutes: durationMin,
        caloriesBurned: calories,
        notes: notes.trim() || `Completed ${activityType.toLowerCase()} routine.`,
      };

      const newActivity = await apiService.logActivity(payload);
      setActivities((prev) => [newActivity, ...prev]);
      
      // If sleep hours < 4, trigger recovery alert simulation
      if (parseFloat(sleepHours) < 4.0) {
        Alert.alert(
          "Recovery Pacing Active",
          "🧘 Sleep is below 4.0 hours. Auto-pacing mode has paused active progression targets to prioritize recovery."
        );
      }

      // Reset Form fields
      setModalVisible(false);
      setDuration('30');
      setDistance('2.0');
      setSleepHours('8');
      setMood(3);
      setRpe(5);
      setNotes('');
    } catch (error) {
      console.error('Failed to log workout details:', error);
    } finally {
      setSaving(false);
    }
  };

  const activityOptions = WELLNESS_ACTIVITIES_REGISTRY.map((act) => ({
    name: act.name,
    emoji: act.emoji,
  }));

  const mainActivityOptions = [
    { name: 'Walking', emoji: '🚶' },
    { name: 'Running', emoji: '🏃' },
    { name: 'Cycling', emoji: '🚴' },
    { name: 'Yoga', emoji: '🧘' },
    { name: 'Workout', emoji: '🏋️' },
    { name: 'Zumba Gold', emoji: '💃' },
    { name: 'Cricket', emoji: '🏏' },
  ];

  const isMainOption = mainActivityOptions.some((opt) => opt.name === activityType);
  const visibleOptions = [...mainActivityOptions];
  if (!isMainOption) {
    const selectedOpt = activityOptions.find((opt) => opt.name === activityType);
    if (selectedOpt) {
      visibleOptions.push(selectedOpt);
    }
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
        border: '#81C784',
        text: isSelected ? '#FFFFFF' : '#2E7D32',
      };
    } else if (val <= 6) {
      return {
        bg: isSelected ? '#F59E0B' : '#FFF8E1',
        border: '#FDD835',
        text: isSelected ? '#FFFFFF' : '#F57F17',
      };
    } else {
      return {
        bg: isSelected ? '#EF4444' : '#FFEBEE',
        border: '#E57373',
        text: isSelected ? '#FFFFFF' : '#C62828',
      };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={STRINGS.ACTIVITY_TRACKING.TITLE} showDrawerButton />

      {loading && activities.length === 0 ? (
        <Loader fullScreen message="Loading activities list..." />
      ) : (
        <FlatList
          data={activities}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ActivityCard activity={item} />}
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
      )}

      {/* Interactive Activity Logging Form Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
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
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
                {/* Activity Selector */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Select Activity Type</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.optionsScroll}
                  >
                    {visibleOptions.map((option) => {
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
                          <Text style={styles.optionEmoji}>{option.emoji}</Text>
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
                    {/* See All Option */}
                    <TouchableOpacity
                      style={[
                        styles.optionItem,
                        styles.seeAllItem,
                      ]}
                      onPress={() => setSeeAllVisible(true)}
                    >
                      <Text style={styles.optionEmoji}>🔍</Text>
                      <Text style={styles.seeAllText}>See All...</Text>
                    </TouchableOpacity>
                  </ScrollView>
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
                    <Text style={styles.label}>Distance (miles)</Text>
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
                          ⚡ Live Velocity Speed: {liveVelocity.toFixed(1)} MPH
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Sleep Hours Logged (Fatigue Guard) */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Sleep Hours (Last Night)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 7.5"
                    placeholderTextColor={theme.colors.textLight}
                    keyboardType="numeric"
                    value={sleepHours}
                    onChangeText={setSleepHours}
                  />
                </View>

                {/* Mood Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mood Rating</Text>
                  <View style={styles.ratingsRow}>
                    {moodRatings.map((item) => {
                      const isSelected = mood === item.value;
                      return (
                        <TouchableOpacity
                          key={item.value}
                          style={[
                            styles.moodButton,
                            isSelected && styles.moodButtonActive,
                          ]}
                          onPress={() => setMood(item.value)}
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
                </View>

                {/* RPE Exertion */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Rate of Perceived Exertion (RPE 1-10)</Text>
                  <View style={styles.rpeRow}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => {
                      const isSelected = rpe === val;
                      const colors = getRpeColorProps(val, isSelected);
                      return (
                        <TouchableOpacity
                          key={val}
                          style={[
                            styles.rpeButton,
                            {
                              backgroundColor: colors.bg,
                              borderColor: colors.border,
                            },
                          ]}
                          onPress={() => setRpe(val)}
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
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <CustomButton
                  title="Cancel"
                  onPress={() => setModalVisible(false)}
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
                <Text style={styles.searchModalTitle}>🔍 All Activity Types</Text>
                <TouchableOpacity onPress={() => setSeeAllVisible(false)} style={styles.closeBtn}>
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
              <ScrollView contentContainerStyle={styles.searchScroll} keyboardShouldPersistTaps="handled">
                {activityOptions
                  .filter((opt) => opt.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((opt) => {
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
                          setSeeAllVisible(false);
                          setSearchQuery('');
                        }}
                      >
                        <Text style={styles.searchRowEmoji}>{opt.emoji}</Text>
                        <Text style={[
                          styles.searchRowText,
                          isSelected && styles.searchRowTextActive,
                        ]}>
                          {opt.name}
                        </Text>
                        {isSelected && <Text style={styles.searchRowCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // matching slate transparent overlay
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
  seeAllItem: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  seeAllText: {
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: theme.fonts.weights.bold as any,
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
});

export default ActivityTrackingScreen;
