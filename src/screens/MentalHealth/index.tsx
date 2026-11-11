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
  IMentalHealthPart,
} from './types';
import { MENTAL_HEALTH_OPTIONS, MENTAL_HEALTH_PARTS } from './questions';
import { styles } from './styles';

export const MentalHealthScreen: React.FC = () => {
  const { setActiveScreen } = useDrawer();
  const scrollViewRef = useRef<ScrollView>(null);

  // Current active step/part: 1 or 2
  const [currentPart, setCurrentPart] = useState<1 | 2>(1);

  // Form answers state
  const [answers, setAnswers] = useState<IMentalHealthPayload>({});

  // Success Confirmation Modal
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Calculate answered count across all 36 questions
  const totalQuestions = 36;
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

  // Switch part handler
  const handleSwitchPart = (part: 1 | 2) => {
    setCurrentPart(part);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // Reset form handler
  const handleReset = () => {
    Alert.alert(
      'Reset Assessment',
      'Are you sure you want to clear all your answers and start over?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setAnswers({});
            setCurrentPart(1);
            scrollViewRef.current?.scrollTo({ y: 0, animated: true });
          },
        },
      ]
    );
  };

  // Submit handler
  const handleSubmit = () => {
    setShowSuccessModal(true);
  };

  const handleModalDone = () => {
    setShowSuccessModal(false);
    setActiveScreen('Dashboard');
  };

  const activePartData: IMentalHealthPart =
    currentPart === 1 ? MENTAL_HEALTH_PARTS[0] : MENTAL_HEALTH_PARTS[1];

  // Check how many questions answered in part 1 vs part 2
  const part1Answered = [
    'anx1', 'anx2', 'anx3', 'anx4', 'anx5', 'anx6',
    'dep1', 'dep2', 'dep3', 'dep4', 'dep5', 'dep6',
    'str1', 'str2', 'str3', 'str4', 'str5', 'str6',
  ].filter(k => answers[k as keyof IMentalHealthPayload] !== undefined).length;

  const part2Answered = [
    'sle1', 'sle2', 'sle3', 'sle4', 'sle5', 'sle6',
    'sub1', 'sub2', 'sub3', 'sub4', 'sub5', 'sub6',
    'emo1', 'emo2', 'emo3', 'emo4', 'emo5', 'emo6',
  ].filter(k => answers[k as keyof IMentalHealthPayload] !== undefined).length;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E17" />

      {/* Header with Drawer toggle and Reset button */}
      <CustomHeader
        title="The Lifestyle Sustainability Audit"
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
            STEP {currentPart} OF 2 • {answeredCount}/{totalQuestions} ANSWERED
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

      {/* Interactive 2-Part Switcher Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            currentPart === 1 && styles.tabButtonActive,
          ]}
          activeOpacity={0.85}
          onPress={() => handleSwitchPart(1)}
        >
          <View
            style={[
              styles.tabBadge,
              currentPart === 1 && styles.tabBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                currentPart === 1 && styles.tabBadgeTextActive,
              ]}
            >
              1
            </Text>
          </View>
          <Text
            style={[
              styles.tabButtonText,
              currentPart === 1 && styles.tabButtonTextActive,
            ]}
            numberOfLines={1}
          >
            Symptoms ({part1Answered}/18)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            currentPart === 2 && styles.tabButtonActive,
          ]}
          activeOpacity={0.85}
          onPress={() => handleSwitchPart(2)}
        >
          <View
            style={[
              styles.tabBadge,
              currentPart === 2 && styles.tabBadgeActive,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                currentPart === 2 && styles.tabBadgeTextActive,
              ]}
            >
              2
            </Text>
          </View>
          <Text
            style={[
              styles.tabButtonText,
              currentPart === 2 && styles.tabButtonTextActive,
            ]}
            numberOfLines={1}
          >
            Lifestyle ({part2Answered}/18)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Assessment Question Stream */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro / Clinical Disclaimer Box */}
        <View style={styles.confidentialCard}>
          <Text style={styles.confidentialIcon}>🧠</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.confidentialTitle}>
              Digital Self-Reported Lifestyle Sustainability Audit
            </Text>
            <Text style={styles.confidentialDesc}>
              This self-administered screening uses a 5-point Likert scale (Always to Never) to identify mental wellness indicators, stress triggers, and habit patterns.
            </Text>
          </View>
        </View>

        {/* Part Header Title */}
        <View style={styles.blockHeaderRow}>
          <View style={styles.blockBadgeContainer}>
            <Text style={styles.blockBadgeText}>{activePartData.badge}</Text>
          </View>
          <Text style={styles.blockHeading}>{activePartData.partTitle}</Text>
          <Text style={styles.blockSubheading}>{activePartData.partSubtitle}</Text>
        </View>

        {/* Categories & Questions Stream */}
        {activePartData.categories.map(category => (
          <View key={category.id} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryTitle}>{category.title}</Text>
            </View>
            <Text style={styles.categorySubtitle}>{category.subtitle}</Text>

            {/* Informational Callout Banner (e.g. Substance Use definitions) */}
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
        {currentPart > 1 ? (
          <TouchableOpacity
            style={styles.backNavButton}
            activeOpacity={0.85}
            onPress={() => handleSwitchPart(1)}
          >
            <Text style={styles.backNavButtonText}>⬅ Back</Text>
          </TouchableOpacity>
        ) : null}

        {currentPart < 2 ? (
          <TouchableOpacity
            style={styles.nextNavButton}
            activeOpacity={0.85}
            onPress={() => handleSwitchPart(2)}
          >
            <Text style={styles.nextNavButtonText}>Next: Part 2 ➔</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.submitNavButton}
            activeOpacity={0.85}
            onPress={handleSubmit}
          >
            <Text style={styles.submitNavButtonText}>Submit Assessment ✅</Text>
          </TouchableOpacity>
        )}
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
            <Text style={styles.modalTitle}>Lifestyle Sustainability Audit Saved!</Text>
            <Text style={styles.modalSubtitle}>
              Your self-reported lifestyle sustainability audit has been recorded. Once your comprehensive wellness analytics are ready, your risk category and clinical insights will appear in your Health Hub.
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
