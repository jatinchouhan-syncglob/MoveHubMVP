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
import { apiService } from '../../services/api';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { CustomButton } from './CustomButton';

interface WellnessModalProps {
  visible: boolean;
  onClose: () => void;
}

const moodRatings = [
  { value: 1, emoji: '😩', label: 'Tired' },
  { value: 2, emoji: '😑', label: 'Meh' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 4, emoji: '😀', label: 'Great' },
  { value: 5, emoji: '🤩', label: 'Energetic' },
];

const getRpeColorProps = (val: number, isSelected: boolean) => {
  if (isSelected) {
    if (val <= 3) return { bg: '#10B981', border: '#10B981', text: '#ffffff' };
    if (val <= 6) return { bg: '#F59E0B', border: '#F59E0B', text: '#ffffff' };
    if (val <= 8) return { bg: '#EF4444', border: '#EF4444', text: '#ffffff' };
    return { bg: '#8B5CF6', border: '#8B5CF6', text: '#ffffff' };
  }
  if (val <= 3) return { bg: 'transparent', border: 'rgba(16, 185, 129, 0.3)', text: '#10B981' };
  if (val <= 6) return { bg: 'transparent', border: 'rgba(245, 158, 11, 0.3)', text: '#F59E0B' };
  if (val <= 8) return { bg: 'transparent', border: 'rgba(239, 68, 68, 0.3)', text: '#EF4444' };
  return { bg: 'transparent', border: 'rgba(139, 92, 246, 0.3)', text: '#8B5CF6' };
};

export const WellnessModal: React.FC<WellnessModalProps> = ({ visible, onClose }) => {
  const [sleepHours, setSleepHours] = useState('');
  const [mood, setMood] = useState(0);
  const [rpe, setRpe] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ sleepHours?: string; mood?: string; rpe?: string }>({});

  const handleSave = async () => {
    const newErrors: { sleepHours?: string; mood?: string; rpe?: string } = {};

    const trimmedSleep = sleepHours.trim();
    if (trimmedSleep === '') {
      newErrors.sleepHours = 'Please enter your sleep hours from last night.';
    } else {
      const parsedSleep = parseFloat(trimmedSleep);
      if (isNaN(parsedSleep) || parsedSleep < 0 || parsedSleep > 24) {
        newErrors.sleepHours = 'Please enter a valid number of sleep hours (between 0 and 24).';
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

    setErrors({});
    setSaving(true);
    try {
      const cachedProfile = await storageHelper.getItem<any>(
        STORAGE_KEYS.USER_PROFILE,
      );
      const targetUhid = cachedProfile?.uhid || 'SAUSHA9775';

      await apiService.saveWellnessFeedback({
        uhid: targetUhid,
        sleepHours: parseFloat(sleepHours),
        mood: mood,
        rpe: rpe,
        notes: notes.trim() || undefined,
      });

      Alert.alert('Success', 'Wellness & exertion details logged successfully!');
      
      // Reset state and close modal
      setSleepHours('');
      setMood(0);
      setRpe(0);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error saving wellness feedback:', error);
      Alert.alert('Error', 'Failed to save feedback. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSleepHours('');
    setMood(0);
    setRpe(0);
    setNotes('');
    setErrors({});
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
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🌱 Wellness & Exertion</Text>
            </View>

            <ScrollView 
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Sleep Hours Logged */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Sleep Hours (Last Night) *</Text>
                <TextInput
                  style={[
                    styles.input,
                    errors.sleepHours ? styles.inputError : null,
                  ]}
                  placeholder="e.g. 7.5"
                  placeholderTextColor="#94A3B8"
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
    borderTopColor: '#334155',
    gap: theme.spacing.md,
  },
  footerButton: {
    flex: 1,
  },
});
