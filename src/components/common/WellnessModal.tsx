import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { theme } from '../../theme';
import Svg, { Path, Polyline } from 'react-native-svg';
import { apiService } from '../../services/api';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { CustomButton } from './CustomButton';
import { getDynamicDeviceId } from '../../utils/device';

interface WellnessModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}



const moodRatings = [
  { value: 1, emoji: '😩', label: 'Tired' },
  { value: 2, emoji: '😑', label: 'OK' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 4, emoji: '😀', label: 'Great' },
  { value: 5, emoji: '🤩', label: 'Energetic' },
];

const restedOptions = [
  { value: 1, label: 'Not at all rested' },
  { value: 2, label: 'Slightly rested' },
  { value: 3, label: 'Moderately rested' },
  { value: 4, label: 'Very rested' },
  { value: 5, label: 'Completely rested' },
];

const bodyFeelingOptions = [
  {
    value: 'Ready_Unloaded_No_Pain',
    label: 'Ready & Unloaded (No pain)',
    icon: '🔘',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  {
    value: 'Knee_Inflammation_Flare_up',
    label: 'Knee Pain / Swelling Flare-up',
    icon: '💥',
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
  },
  {
    value: 'Lower_Back_Stiffness_Spasm',
    label: 'Lower Back Stiffness / Spasm',
    icon: '⚡',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#F59E0B',
  },
  {
    value: 'Shoulder_Upper_Body_Strain',
    label: 'Shoulder / Upper Body Strain',
    icon: '🦾',
    color: '#A855F7',
    bgColor: 'rgba(168, 85, 247, 0.1)',
    borderColor: '#A855F7',
  },
];

export const WellnessModal: React.FC<WellnessModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const [sleepHours, setSleepHours] = useState<number>(7);
  const [mood, setMood] = useState(0);
  const [rested, setRested] = useState(0);
  const [bodyFeeling, setBodyFeeling] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ mood?: string; rested?: string; bodyFeeling?: string }>({});
  const [trackWidth, setTrackWidth] = useState(0);
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    const newErrors: { mood?: string; rested?: string; bodyFeeling?: string } = {};

    if (mood <= 0) {
      newErrors.mood = 'Please select your mood rating.';
    }

    if (rested <= 0) {
      newErrors.rested = 'Please select how rested you felt.';
    }

    if (!bodyFeeling) {
      newErrors.bodyFeeling = 'Please select how your body is feeling today.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      const cachedProfile = await storageHelper.getItem<any>(
        STORAGE_KEYS.USER_PROFILE,
      );
      const targetUhid = cachedProfile?.uhid || 'SAUSHA9775';

      const deviceId = await getDynamicDeviceId();
      
      const selectedRestedObj = restedOptions.find(o => o.value === rested);
      const sleepQualityStr = selectedRestedObj ? `${selectedRestedObj.value} - ${selectedRestedObj.label}` : '';

      const payload = {
        uhid: targetUhid,
        deviceId: deviceId,
        sleepHours: sleepHours,
        mood: mood,
        sleepQuality: sleepQualityStr,
        bodyStatus: bodyFeeling,
        rpe: null,
        notes: notes.trim() || undefined,
      };

      console.log('[WellnessModal] Calling saveWorkoutFeedback with payload:', JSON.stringify(payload, null, 2));
      const response = await apiService.saveWorkoutFeedback(payload);
      console.log('[WellnessModal] saveWorkoutFeedback Response:', JSON.stringify(response, null, 2));

      // Post status flare token to API Gateway
      apiService.postStatusFlare(targetUhid, bodyFeeling);

      // Reset state and show custom success screen
      const now = new Date();
      const todayDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      await storageHelper.setItem(STORAGE_KEYS.LAST_WELLNESS_CHECKIN_DATE, todayDateStr);
      onSuccess?.();

      setSleepHours(7);
      setMood(0);
      setRested(0);
      setBodyFeeling('');
      setNotes('');
      setShowSuccess(true);
    } catch (error) {
      console.error('Error saving workout feedback:', error);
      Alert.alert('Error', 'Failed to save feedback. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSleepHours(7);
    setMood(0);
    setRested(0);
    setBodyFeeling('');
    setNotes('');
    setErrors({});
    setShowSuccess(false);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleCancel}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          {showSuccess ? (
            <View style={[styles.modalContainer, styles.successContainer]}>
              <View style={styles.successGlowCircle}>
                <Svg width={42} height={42} viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <Polyline points="22 4 12 14.01 9 11.01" />
                </Svg>
              </View>
              
              <Text style={styles.successTitle}>Logged Successfully!</Text>
              <Text style={styles.successSubtitle}>
                Your daily wellness and sleep metrics have been synchronized with MoveHub.
              </Text>
              
              <TouchableOpacity 
                activeOpacity={0.8}
                style={styles.successDoneButton}
                onPress={() => {
                  setShowSuccess(false);
                  onClose();
                }}
              >
                <Text style={styles.successDoneButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>🌱 Sleep and Mood</Text>
              </View>

            <ScrollView 
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={scrollEnabled}
            >
              {/* Sleep Hours Logged via Custom Slider */}
              <View style={styles.inputGroup}>
                <View style={styles.sliderLabelRow}>
                  <Text style={styles.label}>
                    How many hours did you sleep last night? *
                  </Text>
                  <Text style={styles.sliderValueText}>{sleepHours} Hours</Text>
                </View>
                <View 
                  style={styles.sliderTrackContainer}
                  onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
                  onStartShouldSetResponder={() => true}
                  onMoveShouldSetResponder={() => true}
                  onResponderGrant={(event) => {
                    setScrollEnabled(false);
                    if (trackWidth <= 0) return;
                    const touchX = event.nativeEvent.locationX;
                    const pct = Math.max(0, Math.min(1, touchX / trackWidth));
                    const hours = Math.round(pct * 12 * 2) / 2;
                    setSleepHours(hours);
                  }}
                  onResponderMove={(event) => {
                    if (trackWidth <= 0) return;
                    const touchX = event.nativeEvent.locationX;
                    const pct = Math.max(0, Math.min(1, touchX / trackWidth));
                    const hours = Math.round(pct * 12 * 2) / 2;
                    setSleepHours(hours);
                  }}
                  onResponderRelease={() => {
                    setScrollEnabled(true);
                  }}
                  onResponderTerminate={() => {
                    setScrollEnabled(true);
                  }}
                >
                  {/* Background Track */}
                  <View style={styles.sliderTrack} pointerEvents="none" />
                  {/* Active Fill Track */}
                  <View style={[styles.sliderTrackFill, { width: `${(sleepHours / 12) * 100}%` }]} pointerEvents="none" />
                  {/* Thumb */}
                  <View style={[styles.sliderThumb, { left: `${(sleepHours / 12) * 100}%` }]} pointerEvents="none" />
                </View>
                {/* Scale markings */}
                <View style={styles.sliderScaleMarkings}>
                  <Text style={styles.scaleMarkText}>0 hrs</Text>
                  <Text style={styles.scaleMarkText}>6 hrs</Text>
                  <Text style={styles.scaleMarkText}>12 hrs</Text>
                </View>
              </View>

              {/* How Rested Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  How rested did you feel when you woke up this morning? *
                </Text>
                <View style={styles.restedOptionsColumn}>
                  {[
                    { value: 1, label: 'Not at all rested' },
                    { value: 2, label: 'Slightly rested' },
                    { value: 3, label: 'Moderately rested' },
                    { value: 4, label: 'Very rested' },
                    { value: 5, label: 'Completely rested' },
                  ].map(item => {
                    const isSelected = rested === item.value;
                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.restedOptionRow,
                          isSelected && styles.restedOptionRowActive,
                          errors.rested ? styles.borderError : null,
                        ]}
                        onPress={() => {
                          setRested(item.value);
                          if (errors.rested) {
                            setErrors(prev => ({ ...prev, rested: undefined }));
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <View style={[styles.radioButton, isSelected && styles.radioButtonActive]}>
                          {isSelected && <View style={styles.radioButtonInner} />}
                        </View>
                        <Text style={[styles.restedOptionText, isSelected && styles.restedOptionTextActive]}>
                          {item.value} - {item.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.rested ? (
                  <Text style={styles.errorText}>{errors.rested}</Text>
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

              {/* 4th Question: How is your body feeling today? */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  How is your body feeling today? *
                </Text>
                <View style={styles.bodyFeelingColumn}>
                  {bodyFeelingOptions.map(item => {
                    const isSelected = bodyFeeling === item.value;
                    return (
                      <TouchableOpacity
                        key={item.value}
                        style={[
                          styles.bodyFeelingOptionRow,
                          isSelected && {
                            borderColor: item.borderColor,
                            backgroundColor: item.bgColor,
                          },
                          errors.bodyFeeling ? styles.borderError : null,
                        ]}
                        onPress={() => {
                          setBodyFeeling(item.value);
                          if (errors.bodyFeeling) {
                            setErrors(prev => ({ ...prev, bodyFeeling: undefined }));
                          }
                        }}
                        activeOpacity={0.8}
                      >
                        <View
                          style={[
                            styles.bodyFeelingIconBadge,
                            {
                              backgroundColor: isSelected
                                ? item.bgColor
                                : 'rgba(255, 255, 255, 0.04)',
                              borderColor: isSelected ? item.borderColor : '#334155',
                            },
                          ]}
                        >
                          <Text style={styles.bodyFeelingEmoji}>{item.icon}</Text>
                        </View>

                        <Text
                          style={[
                            styles.bodyFeelingOptionText,
                            isSelected && {
                              color: '#FFFFFF',
                              fontWeight: '700',
                            },
                          ]}
                        >
                          {item.label}
                        </Text>

                        <View
                          style={[
                            styles.radioButton,
                            isSelected && { borderColor: item.borderColor },
                          ]}
                        >
                          {isSelected && (
                            <View
                              style={[
                                styles.radioButtonInner,
                                { backgroundColor: item.color },
                              ]}
                            />
                          )}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {errors.bodyFeeling ? (
                  <Text style={styles.errorText}>{errors.bodyFeeling}</Text>
                ) : null}
              </View>

              {/* Notes */}
              <View style={[styles.inputGroup, { marginBottom: 0 }]}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Describe how you felt or log custom notes..."
                  placeholderTextColor="#94A3B8"
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
                onPress={handleCancel}
                variant="outline"
                style={styles.footerButton}
              />
              <CustomButton
                title="Submit"
                onPress={handleSave}
                variant="primary"
                loading={saving}
                disabled={saving}
                style={styles.footerButton}
              />
            </View>
          </View>
        )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  keyboardView: {
    width: '100%',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 450,
    maxHeight: '90%',
    backgroundColor: '#1E293B',
    borderRadius: theme.spacing.borderRadiusLg,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  scrollContainer: {
    height: 500,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: theme.spacing.sm,
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
  inputError: {
    borderColor: theme.colors.error,
  },
  borderError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
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
  },
  moodEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  moodText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
  },
  moodTextActive: {
    color: '#818cf8',
    fontWeight: 'bold',
  },
  sliderLabelRow: {
    flexDirection: 'column',
    alignItems: 'stretch',
    marginBottom: theme.spacing.xs,
  },
  sliderValueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366f1',
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  sliderTrackContainer: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  sliderTrack: {
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sliderTrackFill: {
    position: 'absolute',
    height: 6,
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#6366f1',
    marginLeft: -10,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sliderScaleMarkings: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingHorizontal: 2,
  },
  scaleMarkText: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '500',
  },
  restedOptionsColumn: {
    flexDirection: 'column',
    gap: 8,
  },
  restedOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: theme.spacing.borderRadiusMd,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  restedOptionRowActive: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#475569',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonActive: {
    borderColor: '#6366f1',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6366f1',
  },
  restedOptionText: {
    fontSize: 13.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  restedOptionTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  bodyFeelingColumn: {
    flexDirection: 'column',
    gap: 8,
  },
  bodyFeelingOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: theme.spacing.borderRadiusMd,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  bodyFeelingIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyFeelingEmoji: {
    fontSize: 16,
  },
  bodyFeelingOptionText: {
    flex: 1,
    fontSize: 13.5,
    color: '#94A3B8',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },
  successContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successGlowCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(16, 185, 129, 0.25)',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  successSubtitle: {
    fontSize: 13.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
    marginBottom: 28,
  },
  successDoneButton: {
    width: '100%',
    height: 46,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successDoneButtonText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#ffffff',
  },
});
