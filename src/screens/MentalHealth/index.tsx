import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { CustomHeader } from '../../components/common/CustomHeader';
import { useDrawer } from '../../navigation/DrawerContext';
import {
  IMentalHealthPayload,
  LikertValue,
} from './types';
import { MENTAL_HEALTH_OPTIONS, MINDFULNESS_CATEGORIES } from './questions';
import { styles } from './styles';

export const MentalHealthScreen: React.FC = () => {
  const { setActiveScreen } = useDrawer();
  const scrollViewRef = useRef<ScrollView>(null);

  // Pre-assessment Data Notice gate state
  const [isNoticeAccepted, setIsNoticeAccepted] = useState<boolean>(false);
  const [isAgreed, setIsAgreed] = useState<boolean>(false);

  // Form answers state
  const [answers, setAnswers] = useState<IMentalHealthPayload>({});

  // Success Confirmation Modal
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Calculate answered count across all 30 questions (5 categories x 6 questions)
  const totalQuestions = 30;
  const answeredKeys = Object.keys(answers).filter(
    k => answers[k as keyof IMentalHealthPayload] !== undefined && answers[k as keyof IMentalHealthPayload] !== null
  );
  const answeredCount = answeredKeys.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  // Select option handler
  const handleSelectOption = (field: keyof IMentalHealthPayload, value: LikertValue) => {
    setAnswers(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Reset form handler
  const handleReset = () => {
    Alert.alert(
      'Reset Assessment',
      'What would you like to reset?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Answers',
          style: 'destructive',
          onPress: () => {
            setAnswers({});
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          },
        },
        {
          text: 'Return to Notice',
          onPress: () => {
            setAnswers({});
            setIsNoticeAccepted(false);
          },
        },
      ]
    );
  };

  // Activate sync profile from notice screen
  const handleActivate = () => {
    if (!isAgreed) {
      Alert.alert(
        'Agreement Required',
        'Please check the agreement box acknowledging the data processing and behavioral notice before activating your sync profile.',
        [{ text: 'OK' }]
      );
      return;
    }
    setIsNoticeAccepted(true);
  };

  // Submit handler
  const handleSubmit = () => {
    if (answeredCount < totalQuestions) {
      Alert.alert(
        'Incomplete Assessment',
        `You have answered ${answeredCount} of ${totalQuestions} questions. Do you want to submit now?`,
        [
          { text: 'Continue Survey', style: 'cancel' },
          { text: 'Submit Anyway', onPress: () => setShowSuccessModal(true) },
        ]
      );
      return;
    }
    setShowSuccessModal(true);
  };

  const handleModalDone = () => {
    setShowSuccessModal(false);
    setActiveScreen('Dashboard');
  };

  // Pre-assessment Data Notice Screen
  if (!isNoticeAccepted) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar barStyle="light-content" backgroundColor="#0A0E17" />
        <CustomHeader
          title="Mindfulness Sync Profile"
          showDrawerButton
          containerStyle={styles.headerContainer}
          titleStyle={styles.headerTitle}
          buttonStyle={styles.headerButton}
          iconStyle={styles.headerIcon}
        />

        <ScrollView
          contentContainerStyle={styles.noticeScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.noticeMainCard}>
            {/* Top Badge Icon Circle */}
            <View style={styles.noticeIconCircle}>
              <Text style={styles.noticeIconText}>🧘</Text>
            </View>

            {/* Governing Authority Tag */}
            <View style={styles.authorityPill}>
              <View style={styles.authorityDot} />
              <Text style={styles.authorityText}>
                GOVERNING AUTHORITY: MEDICAL & RESEARCH BOARD MANAGEMENT
              </Text>
            </View>

            {/* Main Heading */}
            <Text style={styles.noticeTitle}>
              Mindfulness Sync Profile & Data Notice
            </Text>

            {/* Scope / Purpose Box */}
            <View style={styles.noticeScopeBox}>
              <Text style={styles.noticeScopeText}>
                This module tracks lifestyle rest, behavioral focus, and environmental friction parameters to compute your tournament's recovery multipliers.
              </Text>
            </View>

            {/* Key Pillars */}
            <View style={styles.noticePillarsRow}>
              <View style={styles.noticePillarChip}>
                <Text style={styles.noticePillarIcon}>🌙</Text>
                <Text style={styles.noticePillarLabel}>Lifestyle Rest</Text>
              </View>
              <View style={styles.noticePillarChip}>
                <Text style={styles.noticePillarIcon}>🎯</Text>
                <Text style={styles.noticePillarLabel}>Behavioral Focus</Text>
              </View>
              <View style={styles.noticePillarChip}>
                <Text style={styles.noticePillarIcon}>⚡</Text>
                <Text style={styles.noticePillarLabel}>Recovery Multipliers</Text>
              </View>
            </View>

            {/* Checkbox & Legal Notice Box */}
            <TouchableOpacity
              style={[
                styles.consentBox,
                isAgreed && styles.consentBoxActive,
              ]}
              activeOpacity={0.85}
              onPress={() => setIsAgreed(!isAgreed)}
            >
              <View style={styles.checkboxRow}>
                <View
                  style={[
                    styles.checkboxSquare,
                    isAgreed && styles.checkboxSquareChecked,
                  ]}
                >
                  {isAgreed && (
                    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M20 6L9 17l-5-5"
                        stroke="#FFFFFF"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  )}
                </View>

                <Text style={styles.consentStatementText}>
                  I explicitly agree to the processing of my lifestyle focus parameters. I understand that this survey is strictly a behavioral self-reflection tool and does not provide clinical mental health diagnostics, anxiety indexes, or therapeutic counseling. I acknowledge that my raw inputs are secured using enterprise-grade database encryption and are isolated from the public tournament leaderboards. I will not use this wellness feature as a substitute for professional clinical psychological or psychiatric medical support.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Activate Sync Profile Button */}
            <TouchableOpacity
              style={[
                styles.activateButton,
                !isAgreed && styles.activateButtonDisabled,
              ]}
              activeOpacity={0.85}
              onPress={handleActivate}
            >
              <Text
                style={[
                  styles.activateButtonText,
                  !isAgreed && styles.activateButtonTextDisabled,
                ]}
              >
                ACTIVATE SYNC PROFILE
              </Text>
            </TouchableOpacity>

            {/* Security Footnote */}
            <View style={styles.securityFootnoteRow}>
              <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                  stroke="#38BDF8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              <Text style={styles.securityFootnoteText}>
                Enterprise-grade 256-bit encrypted • Isolated from public leaderboards
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E17" />

      {/* Header with Drawer toggle and Reset button */}
      <CustomHeader
        title="Mindfulness Sync Profile"
        showDrawerButton
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
        rightComponent={
          <View style={styles.headerRightActions}>
            {answeredCount > 0 ? (
              <TouchableOpacity
                style={styles.resetButton}
                activeOpacity={0.7}
                onPress={handleReset}
                accessibilityLabel="Reset Assessment"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"
                    stroke="#EF4444"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <Path
                    d="M3 3v5h5"
                    stroke="#EF4444"
                    strokeWidth={2.4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Svg>
              </TouchableOpacity>
            ) : (
              <View style={styles.resetPlaceholder} />
            )}
          </View>
        }
      />

      {/* Real-time Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressTopRow}>
          <Text style={styles.stepCounterText}>
            {answeredCount}/{totalQuestions} QUESTIONS ANSWERED
          </Text>
          <Text style={styles.progressPercentage}>{progressPercent}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${Math.max(5, progressPercent)}%` },
            ]}
          />
        </View>
      </View>

      {/* Assessment Question Stream (Unified Single Screen) */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro / Clinical Disclaimer Box */}
        <View style={styles.confidentialCard}>
          <Text style={styles.confidentialIcon}>🧘</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.confidentialTitle}>
              Mindfulness Sync Profile
            </Text>
            <Text style={styles.confidentialDesc}>
              This module tracks lifestyle rest, behavioral focus, and environmental friction parameters to compute your tournament's recovery multipliers.
            </Text>
            <TouchableOpacity
              style={styles.noticeLinkRow}
              activeOpacity={0.7}
              onPress={() => setIsNoticeAccepted(false)}
            >
              <Text style={styles.noticeLinkText}>📋 View Data Notice & Agreement</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* All 5 Categories Stream */}
        {MINDFULNESS_CATEGORIES.map(category => (
          <View key={category.id} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>
            <Text style={styles.categorySubtitle}>{category.subtitle}</Text>

            {/* Informational Callout Banner if present */}
            {category.noticeBanner && (
              <View style={styles.noticeCard}>
                <Text style={styles.noticeIcon}>ℹ️</Text>
                <Text style={styles.noticeText}>{category.noticeBanner}</Text>
              </View>
            )}

            {/* Questions in Category */}
            {category.questions.map(q => {
              const selectedValue = answers[q.field];
              return (
                <View key={q.id} style={styles.questionCard}>
                  <View style={styles.questionHeader}>
                    <View style={styles.qNumberBadge}>
                      <Text style={styles.qNumberText}>{q.qNumber}</Text>
                    </View>
                    <Text style={styles.questionText}>{q.text}</Text>
                  </View>

                  {/* 5-Option Radio Pill Row */}
                  <View style={styles.optionsRow}>
                    {MENTAL_HEALTH_OPTIONS.map(opt => {
                      const isSelected = selectedValue === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.value}
                          style={[
                            styles.optionPill,
                            isSelected && styles.optionPillActive,
                          ]}
                          activeOpacity={0.8}
                          onPress={() => handleSelectOption(q.field, opt.value)}
                        >
                          <View
                            style={[
                              styles.optionRadioDot,
                              isSelected && styles.optionRadioDotActive,
                            ]}
                          >
                            {isSelected && <View style={styles.optionRadioInnerDot} />}
                          </View>
                          <Text
                            style={[
                              styles.optionPillText,
                              isSelected && styles.optionPillTextActive,
                            ]}
                          >
                            {opt.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Sticky Bottom Navigation Footer */}
      <View style={styles.footerNav}>
        <TouchableOpacity
          style={styles.submitNavButton}
          activeOpacity={0.85}
          onPress={handleSubmit}
        >
          <Text style={styles.submitNavButtonText}>Submit Sync Profile ✅</Text>
        </TouchableOpacity>
      </View>

      {/* Success Confirmation Modal */}
      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Text style={styles.modalIcon}>🎉</Text>
            </View>
            <Text style={styles.modalTitle}>Mindfulness Sync Profile Saved!</Text>
            <Text style={styles.modalSubtitle}>
              Your mindfulness sync profile has been recorded. Once your comprehensive wellness analytics are ready, your recovery multipliers and insights will appear in your Health Hub.
            </Text>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              activeOpacity={0.85}
              onPress={handleModalDone}
            >
              <Text style={styles.modalCloseBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default MentalHealthScreen;
