import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useDrawer } from '../../navigation/DrawerContext';
import {
  INTAKE_QUESTIONS,
  INITIAL_BIOMETRIC_RESET_CARD,
} from './mockData';
import { BiometricChecklistItem } from './types';
import { styles } from './styles';

const CORE_TARGETS_LIST = [
  {
    key: 'bse',
    name: 'BSE Efficiency',
    icon: '⚡',
    target: '75.0',
    base: '64.2',
    unit: '',
  },
  {
    key: 'sedentary',
    name: 'Sedentary Index',
    icon: '🪑',
    target: '35.0',
    base: '68.5',
    unit: '',
  },
  {
    key: 'ppi',
    name: 'Pulse-Pace (PPI)',
    icon: '💓',
    target: '2.8',
    base: '3.6',
    unit: '',
  },
  {
    key: 'move',
    name: 'Move Economy',
    icon: '🏃',
    target: '92.0',
    base: '108.4',
    unit: 'kcal/km',
  },
  {
    key: 'stamina',
    name: 'Stamina (IS)',
    icon: '🔋',
    target: '80.0%',
    base: '68.0%',
    unit: '',
  },
  {
    key: 'heart',
    name: 'AHA Heart Volume',
    icon: '❤️',
    target: '150',
    base: '110',
    unit: 'pts',
  },
];

export interface ExercisePrescriptionProps {
  isEmbedded?: boolean;
  onNext?: () => void;
}

export const ExercisePrescriptionScreen: React.FC<ExercisePrescriptionProps> = ({
  isEmbedded = false,
  onNext,
}) => {
  const { openDrawer } = useDrawer();
  const [activeTab, setActiveTab] = useState<'intake' | 'biometric'>('intake');

  // Answers state for the 9-question intake matrix
  const [answers, setAnswers] = useState<{ [qId: string]: string }>({
    q1: 'q1_fat_loss',
    q2: 'q2_mesomorph',
    q3: 'q3_lower_back',
    q4: 'q4_intermediate',
    q5: 'q5_desk',
    q6: 'q6_exhausted',
    q7: 'q7_moderate',
    q8: 'q8_regular',
    q9: 'q9_commercial',
  });

  // Biometric Checklist interactive state
  const [checklist, setChecklist] = useState<BiometricChecklistItem[]>(
    INITIAL_BIOMETRIC_RESET_CARD.checklist,
  );

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = INTAKE_QUESTIONS.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (questionId: string, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId,
    }));
  };

  const handleToggleChecklist = (id: number) => {
    setChecklist(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: item.status === 'verified' ? 'pending' : 'verified',
            }
          : item,
      ),
    );
  };

  const handleSaveAndGenerate = () => {
    Alert.alert(
      'Intake Matrix Saved! 🧬',
      'Your 9-Question responses have been mapped by the Uncurl C-MELA™ engine. Your 7-Day Biometric Reset has been generated.',
      [
        {
          text: 'View Biometric Reset Card',
          onPress: () => setActiveTab('biometric'),
        },
        {
          text: 'OK',
        },
      ],
    );
  };

  const handleResetIntake = () => {
    Alert.alert(
      'Reset Questionnaire',
      'Are you sure you want to reset your intake matrix answers?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => setAnswers({}),
        },
      ],
    );
  };

  const Container = isEmbedded ? View : SafeAreaView;

  return (
    <Container style={styles.container}>
      {!isEmbedded && <StatusBar barStyle="light-content" backgroundColor="#0A0E17" />}

      {/* Screen Top Header (Matching Nutritional & Lifestyle Profiler) */}
      {!isEmbedded ? (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
              <Text style={{ fontSize: 18, color: '#FFFFFF' }}>☰</Text>
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>Exercise Prescription</Text>
              <Text style={styles.headerSubtitle}>Phase-2 C-MELA™ Clinical Intake</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetIntake}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1E293B' }}>
          <View>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#FFFFFF' }}>Exercise Intake Matrix</Text>
            <Text style={{ fontSize: 11, color: '#94A3B8' }}>Phase-2 C-MELA™ Clinical Intake</Text>
          </View>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetIntake}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Top 3-Way Mode Switcher Tabs */}
      {!isEmbedded && (
        <View style={styles.modeTabBar}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.modeTabBtn, activeTab === 'intake' && styles.modeTabBtnActive]}
            onPress={() => setActiveTab('intake')}
          >
            <Text
              style={[styles.modeTabBtnText, activeTab === 'intake' && styles.modeTabBtnTextActive]}
            >
              📋 9-Q Intake ({answeredCount}/9)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.modeTabBtn, activeTab === 'biometric' && styles.modeTabBtnActive]}
            onPress={() => setActiveTab('biometric')}
          >
            <Text
              style={[styles.modeTabBtnText, activeTab === 'biometric' && styles.modeTabBtnTextActive]}
            >
              🧬 Biometric Reset
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================================= */}
        {/* TAB 1: 9-QUESTION MOBILE-SIMPLIFIED INTAKE MATRIX                         */}
        {/* ========================================================================= */}
        {activeTab === 'intake' && (
          <View>
            {/* Intake Intro Banner */}
            <View style={styles.introBanner}>
              <View style={styles.introHeaderRow}>
                <View style={styles.introIconBox}>
                  <Text style={styles.introIcon}>🎯</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.introBadge}>C-MELA™ CLINICAL ENGINE</Text>
                  <Text style={styles.introTitle}>9-Question Intake Matrix</Text>
                </View>
              </View>
              <Text style={styles.introDesc}>
                Translates your physical choices into precise algorithmic constraints, joint safety limits, and adaptive gym machine allocations.
              </Text>

              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressLabelRow}>
                  <Text style={styles.progressLabel}>Matrix Completion</Text>
                  <Text style={styles.progressPctText}>
                    {progressPercent}% ({answeredCount}/{totalQuestions})
                  </Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
                </View>
              </View>
            </View>

            {/* Questions List */}
            {INTAKE_QUESTIONS.map(q => {
              const selectedOptId = answers[q.id];
              const isAnswered = !!selectedOptId;

              return (
                <View key={q.id} style={styles.questionCard}>
                  {/* Card Header */}
                  <View style={styles.qHeaderRow}>
                    <View
                      style={[
                        styles.qNumberBadge,
                        isAnswered && styles.qNumberBadgeAnswered,
                      ]}
                    >
                      <Text
                        style={[
                          styles.qNumberText,
                          isAnswered && styles.qNumberTextAnswered,
                        ]}
                      >
                        Q{q.number}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.qCategoryText}>{q.category}</Text>
                      <Text style={styles.qTitleText}>{q.questionText}</Text>
                    </View>
                  </View>

                  {/* Options */}
                  <View style={styles.optionsContainer}>
                    {q.options.map(opt => {
                      const isSelected = selectedOptId === opt.id;
                      return (
                        <TouchableOpacity
                          key={opt.id}
                          activeOpacity={0.7}
                          style={[
                            styles.optionCard,
                            isSelected && styles.optionCardSelected,
                          ]}
                          onPress={() => handleSelectOption(q.id, opt.id)}
                        >
                          <View
                            style={[
                              styles.radioCircle,
                              isSelected && styles.radioCircleSelected,
                            ]}
                          >
                            {isSelected && <View style={styles.radioInnerDot} />}
                          </View>

                          <View style={styles.optionContent}>
                            <View style={styles.optionTitleRow}>
                              {opt.icon && (
                                <Text style={styles.optionIcon}>{opt.icon}</Text>
                              )}
                              <Text
                                style={[
                                  styles.optionTitle,
                                  isSelected && styles.optionTitleSelected,
                                ]}
                              >
                                {opt.text}
                              </Text>
                            </View>
                            {opt.subtext && (
                              <Text style={styles.optionSubtext}>{opt.subtext}</Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}

            {/* Bottom Actions */}
            <View style={styles.actionsBar}>
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.resetBtn}
                onPress={handleResetIntake}
              >
                <Text style={styles.resetBtnText}>Reset Matrix</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.generateBtn}
                onPress={isEmbedded ? onNext : handleSaveAndGenerate}
              >
                <Text style={styles.generateBtnText}>
                  {isEmbedded ? 'Next: Nutritional Profiler ➡️' : 'Generate Prescriptions ⚡'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: VIEWPORT 1 - BIOMETRIC RESET CARD (7-Day Rolling Profile Track)    */}
        {/* ========================================================================= */}
        {!isEmbedded && activeTab === 'biometric' && (
          <View>
            <View style={styles.biometricMainCard}>
              {/* Header Badge & Title */}
              <View style={styles.bioTopHeader}>
                <View style={styles.bioBadgePill}>
                  <Text style={styles.bioBadgeIcon}>🧬</Text>
                  <Text style={styles.bioBadgeText}>
                    7-DAY ROLLING PRESCRIPTION
                  </Text>
                </View>
                <Text style={styles.bioCardMainTitle}>
                  Biometric Lifestyle Prescription
                </Text>
              </View>

              {/* Patient Meta Strip */}
              <View style={styles.bioPatientMetaBox}>
                <View style={styles.bioMetaChipsRow}>
                  <View style={styles.bioMetaChip}>
                    <Text style={styles.bioMetaChipLabel}>
                      UHID: <Text style={styles.bioMetaChipValue}>{INITIAL_BIOMETRIC_RESET_CARD.uhid}</Text>
                    </Text>
                  </View>
                  <View style={styles.bioMetaChip}>
                    <Text style={styles.bioMetaChipLabel}>
                      Age: <Text style={styles.bioMetaChipValue}>{INITIAL_BIOMETRIC_RESET_CARD.age} yrs</Text>
                    </Text>
                  </View>
                  <View style={styles.bioMetaChip}>
                    <Text style={styles.bioMetaChipLabel}>
                      Sex: <Text style={styles.bioMetaChipValue}>{INITIAL_BIOMETRIC_RESET_CARD.sex}</Text>
                    </Text>
                  </View>
                </View>
                <View style={styles.bioProfileModeRow}>
                  <View style={styles.bioProfileDot} />
                  <Text style={styles.bioProfileModeText}>
                    Profile: {INITIAL_BIOMETRIC_RESET_CARD.profileMode}
                  </Text>
                </View>
              </View>

              {/* Weekly Tracking Window */}
              <View style={styles.bioWindowBox}>
                <View style={styles.bioWindowLeft}>
                  <Text style={styles.bioWindowLabel}>WEEKLY TRACKING WINDOW</Text>
                  <Text style={styles.bioWindowRange}>
                    📅 {INITIAL_BIOMETRIC_RESET_CARD.rangeStart} — {INITIAL_BIOMETRIC_RESET_CARD.rangeEnd}
                  </Text>
                </View>
                <View style={styles.bioResetBadge}>
                  <Text style={styles.bioResetText}>
                    ⏳ Resets in {INITIAL_BIOMETRIC_RESET_CARD.resetsInDays}d
                  </Text>
                </View>
              </View>

              {/* Central Adaptive Target Ring */}
              <View style={styles.bioTargetSection}>
                <View style={styles.bioTargetRingOuter}>
                  <View style={styles.bioTargetRingInner}>
                    <Text style={styles.bioTargetBigScore}>
                      {INITIAL_BIOMETRIC_RESET_CARD.bseAdaptiveTarget.toFixed(1)}
                    </Text>
                    <Text style={styles.bioTargetSublabel}>ADAPTIVE TARGET</Text>
                    <Text style={styles.bioTargetMetricTitle}>BSE EFFICIENCY</Text>
                    <View style={styles.bioTargetStatusPill}>
                      <View style={styles.bioTargetGreenDot} />
                      <Text style={styles.bioTargetStatusText}>Optimal Pacing</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Core Targets & Lifestyle Pacing Balance */}
              <View style={styles.bioSectionTitleRow}>
                <Text style={styles.bioSectionHeaderIcon}>📋</Text>
                <Text style={styles.bioSectionHeader}>
                  Core Targets & Lifestyle Pacing
                </Text>
              </View>

              <View style={styles.bioTargetsList}>
                {CORE_TARGETS_LIST.map(item => (
                  <View key={item.key} style={styles.bioTargetRow}>
                    <View style={styles.bioTargetRowLeft}>
                      <Text style={styles.bioTargetRowIcon}>{item.icon}</Text>
                      <Text style={styles.bioTargetName}>{item.name}</Text>
                    </View>
                    <View style={styles.bioTargetRowRight}>
                      <Text style={styles.bioTargetValues}>
                        {item.target}{item.unit ? ` ${item.unit}` : ''}
                      </Text>
                      <View style={styles.bioTargetBaseChip}>
                        <Text style={styles.bioTargetBase}>Base: {item.base}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Weekly Foundational Checklist */}
              <View style={styles.bioSectionTitleRow}>
                <Text style={styles.bioSectionHeaderIcon}>🚀</Text>
                <Text style={styles.bioSectionHeader}>
                  Weekly Foundational Checklist
                </Text>
              </View>

              <View style={styles.bioChecklistContainer}>
                {checklist.map(item => {
                  const isVerified = item.status === 'verified';
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      style={[
                        styles.bioChecklistItem,
                        isVerified && styles.bioChecklistItemVerified,
                      ]}
                      onPress={() => handleToggleChecklist(item.id)}
                    >
                      <View style={styles.bioChecklistHeaderRow}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <Text style={styles.bioChecklistTitle}>
                            {item.id}. {item.name}
                          </Text>
                          <Text style={styles.bioChecklistSchedule}>
                            ⏱️ {item.duration} • {item.schedule}
                          </Text>
                        </View>
                        <View
                          style={[
                            styles.statusVerificationPill,
                            isVerified
                              ? styles.statusPillVerified
                              : styles.statusPillPending,
                          ]}
                        >
                          <Text
                            style={[
                              styles.statusVerificationText,
                              isVerified
                                ? styles.statusTextVerified
                                : styles.statusTextPending,
                            ]}
                          >
                            {isVerified ? '✓ Verified' : '○ Pending'}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.bioChecklistRuleDesc}>
                        {item.ruleDescription}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Bounding Safety Ceilings */}
              <View style={styles.bioSafetyBox}>
                <View style={styles.bioSafetyHeaderRow}>
                  <Text style={styles.bioSafetyIcon}>🛑</Text>
                  <Text style={styles.bioSafetyTitle}>Bounding Safety Ceilings</Text>
                </View>
                <View style={styles.bioSafetyItem}>
                  <Text style={styles.bioSafetyLabel}>Heart Rate Limit Ceiling</Text>
                  <Text style={styles.bioSafetyValue}>140 BPM</Text>
                </View>
                <View style={styles.bioSafetyDivider} />
                <View style={styles.bioSafetyItem}>
                  <Text style={styles.bioSafetyLabel}>Continuous Sitting Max</Text>
                  <Text style={styles.bioSafetyValue}>60 Mins</Text>
                </View>
                <View style={styles.bioSafetyDivider} />
                <View style={styles.bioSafetyItem}>
                  <Text style={styles.bioSafetyLabel}>Desk Stasis Break Rule</Text>
                  <Text style={styles.bioSafetyValue}>90-Sec Pocket Walk</Text>
                </View>
              </View>

              {/* Physiological Rationale */}
              <View style={styles.bioRationaleBox}>
                <View style={styles.bioRationaleHeaderRow}>
                  <Text style={styles.bioRationaleIcon}>🔬</Text>
                  <Text style={styles.bioRationaleTitle}>Physiological Rationale & Citation</Text>
                </View>
                <Text style={styles.bioRationaleText}>
                  {INITIAL_BIOMETRIC_RESET_CARD.clinicalRationale}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </Container>
  );
};

export default ExercisePrescriptionScreen;
