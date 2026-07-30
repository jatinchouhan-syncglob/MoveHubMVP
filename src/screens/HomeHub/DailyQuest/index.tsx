import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../../theme';
import { CustomHeader } from '../../../components/common/CustomHeader';
import DrawerContext from '../../../navigation/DrawerContext';
import osiTranslations from './translations/osi_translations.json';

const { width } = Dimensions.get('window');

type LanguageKey = 'en' | 'hi' | 'gu' | 'mr';

export const MyQuestScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const drawer = useContext(DrawerContext);

  // States
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey>('en');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  
  // Box Breathing Quest States
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingStep, setBreathingStep] = useState<'idle' | 'inhale' | 'hold' | 'exhale' | 'holdEmpty'>('idle');
  const [timerSeconds, setTimerSeconds] = useState(4);
  const [completedRepetitions, setCompletedRepetitions] = useState(0);
  const [questCompleted, setQuestCompleted] = useState(false);
  
  // Animation value for breathing circle expansion
  const [scaleAnim] = useState(new Animated.Value(1));

  // Load translations dynamically
  const t = osiTranslations[selectedLanguage] || osiTranslations['en'];

  // Handle Breathing Animation Loop
  useEffect(() => {
    let interval: any;
    if (breathingActive && !questCompleted) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            // Transition to next breathing step
            setBreathingStep(curr => {
              if (curr === 'inhale') {
                Animated.timing(scaleAnim, { toValue: 1.5, duration: 4000, useNativeDriver: true }).start();
                return 'hold';
              } else if (curr === 'hold') {
                Animated.timing(scaleAnim, { toValue: 1.0, duration: 4000, useNativeDriver: true }).start();
                return 'exhale';
              } else if (curr === 'exhale') {
                return 'holdEmpty';
              } else {
                // Return to inhale and increment loop counter
                setCompletedRepetitions(reps => {
                  const nextReps = reps + 1;
                  if (nextReps >= 4) {
                    setBreathingActive(false);
                    setQuestCompleted(true);
                    return 4;
                  }
                  return nextReps;
                });
                Animated.timing(scaleAnim, { toValue: 1.5, duration: 4000, useNativeDriver: true }).start();
                return 'inhale';
              }
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathingActive, questCompleted]);

  const startBreathing = () => {
    setBreathingActive(true);
    setBreathingStep('inhale');
    setTimerSeconds(4);
    setCompletedRepetitions(0);
    Animated.timing(scaleAnim, { toValue: 1.5, duration: 4000, useNativeDriver: true }).start();
  };

  const forceSubmitQuest = () => {
    setBreathingActive(false);
    setQuestCompleted(true);
  };

  const getStepText = () => {
    switch (breathingStep) {
      case 'inhale': return '💨 INHALE DEEP THROUGH NOSE';
      case 'hold': return '🧘 HOLD BREATH COMFORTABLY';
      case 'exhale': return '🌬️ EXHALE SLOWLY THROUGH MOUTH';
      case 'holdEmpty': return '🛡️ HOLD EMPTY BEFORE NEXT BREATH';
      default: return 'Press Start to Begin';
    }
  };

  const getStepAction = () => {
    switch (breathingStep) {
      case 'inhale': return 'Breathe In...';
      case 'hold': return 'Hold...';
      case 'exhale': return 'Breathe Out...';
      case 'holdEmpty': return 'Rest empty...';
      default: return 'Ready?';
    }
  };

  // Navigations to Hubs
  const navigateToHub = (screenName: string) => {
    if (drawer) {
      drawer.setActiveScreen(screenName as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="My Quest" showDrawerButton={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Global Language Dropdown Bar at the Top */}
        <View style={[styles.topSelectorRow, langDropdownOpen && { zIndex: 10000, elevation: 10 }]}>
          <Text style={styles.topSelectorLabel}>Select Language / भाषा चुनें:</Text>
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.dropdownTrigger}
              onPress={() => setLangDropdownOpen(!langDropdownOpen)}
            >
              <Text style={styles.dropdownTriggerText}>
                {selectedLanguage === 'en' && '🇬🇧 English (EN)'}
                {selectedLanguage === 'hi' && '🇮🇳 Hindi (HI)'}
                {selectedLanguage === 'gu' && '🇮🇳 Gujarati (GU)'}
                {selectedLanguage === 'mr' && '🇮🇳 Marathi (MR)'}
              </Text>
              <Text style={styles.dropdownChevron}>{langDropdownOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {langDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {[
                  { key: 'en', label: '🇬🇧 English' },
                  { key: 'hi', label: '🇮🇳 Hindi' },
                  { key: 'gu', label: '🇮🇳 Gujarati' },
                  { key: 'mr', label: '🇮🇳 Marathi' },
                ].map(item => (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.7}
                    style={[
                      styles.dropdownItem,
                      selectedLanguage === item.key && styles.dropdownItemActive
                    ]}
                    onPress={() => {
                      setSelectedLanguage(item.key as LanguageKey);
                      setLangDropdownOpen(false);
                    }}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedLanguage === item.key && styles.dropdownItemTextActive
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 📊 BLOCK 1: Baseline OSI Card */}
        <View style={styles.cardContainer}>
          <View style={styles.cardHeaderTag}>
            <Text style={styles.cardHeaderTagText}>📊 BASELINE | Generated at 11:30 PM EVERY DAY</Text>
          </View>
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.cardHeaderRow}>
              <View style={styles.titleBadge}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                <Text style={styles.badgeText}>{t.title}</Text>
              </View>
            </View>

            {/* Meta Badges stacked to prevent overflow on small screens */}
            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>📅 {t.date}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>🆔 {t.uhid}</Text>
              </View>
            </View>

            {/* Score & Gauge */}
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>{t.baselineOsi}</Text>
              <View style={styles.scoreNumberContainer}>
                <Text style={[styles.scoreValue, { color: theme.colors.success }]}>56.4</Text>
                <Text style={styles.scoreScale}>/ 100</Text>
              </View>
              {/* Progress bar simulation */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '56.4%', backgroundColor: theme.colors.success }]} />
              </View>
              <View style={[styles.statusBanner, { backgroundColor: theme.colors.successLight }]}>
                <Text style={[styles.statusLabel, { color: theme.colors.success }]}>🟢 {t.status}</Text>
              </View>
            </View>

            {/* Section 1: Assigned Task Profile */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>{t.taskProfileTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>⚙️</Text>
                <Text style={styles.bulletContentBold}>{t.taskOperator}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>⚠️</Text>
                <Text style={styles.bulletContent}>{t.taskHazards}</Text>
              </View>

              <Text style={styles.nestedHeader}>{t.insightsTitle}</Text>
              <View style={styles.sopInsightCard}>
                <Text style={styles.sopTitle}>🧠 ERGONOMIC posturing:</Text>
                <Text style={styles.sopDesc}>{t.insightsErgonomic}</Text>
              </View>
              <View style={styles.sopInsightCard}>
                <Text style={styles.sopTitle}>🦾 MANUAL HANDLING:</Text>
                <Text style={styles.sopDesc}>{t.insightsManual}</Text>
              </View>
              <View style={styles.sopInsightCard}>
                <Text style={styles.sopTitle}>💨 BAY ENVIRONMENT:</Text>
                <Text style={styles.sopDesc}>{t.insightsEnvironment}</Text>
              </View>
            </View>

            {/* Section 2: Active Health Vault Parsed */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>{t.healthVaultTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>🩹</Text>
                <Text style={styles.bulletContent}>{t.healthPastRecords}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>🧪</Text>
                <Text style={styles.bulletContent}>{t.healthIndicators}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>✔️</Text>
                <Text style={styles.bulletContent}>{t.healthBufferMsg}</Text>
              </View>

              {/* Redirect Hub Cards - Stacked Vertically to prevent wrapping and look premium */}
              <View style={styles.hubLinksContainer}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.hubLinkRow, { borderLeftColor: theme.colors.primary }]}
                  onPress={() => navigateToHub('ActivityTracking')}
                >
                  <View style={styles.hubLinkLeft}>
                    <Text style={styles.hubLinkEmoji}>🏃</Text>
                    <Text style={styles.hubLinkLabel}>MOVE HUB</Text>
                  </View>
                  <Text style={styles.hubLinkArrow}>➔</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.hubLinkRow, { borderLeftColor: theme.colors.secondary }]}
                  onPress={() => navigateToHub('MealLog')}
                >
                  <View style={styles.hubLinkLeft}>
                    <Text style={styles.hubLinkEmoji}>🥗</Text>
                    <Text style={styles.hubLinkLabel}>NOURISH HUB</Text>
                  </View>
                  <Text style={styles.hubLinkArrow}>➔</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.hubLinkRow, { borderLeftColor: theme.colors.primary }]}
                  onPress={() => navigateToHub('RiskAssessment')}
                >
                  <View style={styles.hubLinkLeft}>
                    <Text style={styles.hubLinkEmoji}>🛡️</Text>
                    <Text style={styles.hubLinkLabel}>SHIELD HUB</Text>
                  </View>
                  <Text style={styles.hubLinkArrow}>➔</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Section 3: Scheduled Safety Protocol */}
            <View style={[styles.sectionBlock, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={styles.sectionHeader}>{t.protocolTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>🔔</Text>
                <Text style={styles.bulletContent}>{t.protocolQuest}</Text>
              </View>
            </View>

            {/* Swipe Action Info */}
            <View style={styles.swipeHintContainer}>
              <Text style={styles.swipeText}>▲ {t.swipeAction}</Text>
            </View>
          </View>
        </View>

        {/* ⏰ BLOCK 2: Clock-In Card */}
        <View style={styles.cardContainer}>
          <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.warningLight, borderColor: theme.colors.warning }]}>
            <Text style={[styles.cardHeaderTagText, { color: theme.colors.warning }]}>⏰ CLOCK-IN | 07:45 AM Clock-In Card (Pre-Work Gate)</Text>
          </View>
          <View style={styles.card}>
            {/* Header Badge */}
            <View style={styles.cardHeaderRow}>
              <View style={[styles.titleBadge, { backgroundColor: theme.colors.warningLight }]}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.warning }]} />
                <Text style={[styles.badgeText, { color: theme.colors.warning }]}>{t.clockinTitle}</Text>
              </View>
            </View>

            {/* Meta Badges stacked to prevent overflow on small screens */}
            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>📅 {t.clockinDate}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>🆔 {t.uhid}</Text>
              </View>
            </View>

            {/* Score & Progress */}
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>{t.clockinOsiLabel}</Text>
              <View style={styles.scoreNumberContainer}>
                <Text style={[styles.scoreValue, { color: theme.colors.warning }]}>80.2</Text>
                <Text style={styles.scoreScale}>/ 100</Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '80.2%', backgroundColor: theme.colors.warning }]} />
              </View>
              <View style={[styles.statusBanner, { backgroundColor: theme.colors.warningLight }]}>
                <Text style={[styles.statusLabel, { color: theme.colors.warning }]}>⚠️ {t.clockinStatus}</Text>
              </View>
            </View>

            {/* Personalized Safety Insights */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>🛡️ {t.clockinInsightsTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>⚠️</Text>
                <Text style={styles.bulletContent}>{t.clockinInsightSleep}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>🦾</Text>
                <Text style={styles.bulletContent}>{t.clockinInsightSpine}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>💧</Text>
                <Text style={styles.bulletContent}>{t.clockinInsightHydration}</Text>
              </View>
            </View>

            {/* Overnight Inputs Ingested */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>🩹 {t.clockinDriftTitle}</Text>
              <View style={styles.driftMetricsRow}>
                <View style={styles.driftCard}>
                  <Text style={styles.driftLabel}>{t.clockinSleepDuration}</Text>
                  <Text style={[styles.driftVal, { color: theme.colors.error }]}>{t.clockinSleepDurationVal}</Text>
                  <Text style={styles.driftSub}>{t.clockinSleepDurationSub}</Text>
                </View>
                <View style={styles.driftCard}>
                  <Text style={styles.driftLabel}>{t.clockinSleepQuality}</Text>
                  <Text style={[styles.driftVal, { color: theme.colors.warning }]}>{t.clockinSleepQualityVal}</Text>
                  <Text style={styles.driftSub}>{t.clockinSleepQualitySub}</Text>
                </View>
                <View style={styles.driftCard}>
                  <Text style={styles.driftLabel}>{t.clockinMorningMood}</Text>
                  <Text style={[styles.driftVal, { color: theme.colors.warning }]}>{t.clockinMorningMoodVal}</Text>
                  <Text style={styles.driftSub}>{t.clockinMorningMoodSub}</Text>
                </View>
              </View>
            </View>

            {/* Safety Quest Interactive Breathing Guide (Always visible text context) */}
            <View style={[styles.sectionBlock, styles.questBorderCard, { borderBottomWidth: 0, paddingBottom: 16, marginBottom: 12 }]}>
              <Text style={styles.questHeader}>🫁 {t.clockinGuideHeader}</Text>
              
              {/* Count / Steps Context - ALWAYS VISIBLE */}
              <View style={styles.questGuideBox}>
                <Text style={styles.guideTextDesc}>{t.clockinGuideDesc}</Text>
                <Text style={styles.guideText}>⏱️ {t.clockinStep1}</Text>
                <Text style={styles.guideText}>⏱️ {t.clockinStep2}</Text>
                <Text style={styles.guideText}>⏱️ {t.clockinStep3}</Text>
                <Text style={styles.guideText}>⏱️ {t.clockinStep4}</Text>
                <Text style={styles.guideTextSub}>🔁 {t.clockinRepeat}</Text>
              </View>

              <View style={styles.rationaleBox}>
                <Text style={styles.rationaleTitle}>{t.clockinRationaleHeader}</Text>
                <Text style={styles.rationaleDesc}>{t.clockinRationaleDesc}</Text>
              </View>

              {/* Interactive Breathing visualizer - Overlay inside card when active */}
              {breathingActive ? (
                <View style={styles.visualizerContainer}>
                  <View style={styles.circleWrapper}>
                    <Animated.View style={[
                      styles.breathingCircleBg,
                      { transform: [{ scale: scaleAnim }] }
                    ]} />
                    <View style={styles.circleTextOverlay}>
                      <Text style={styles.visualizerStepVal}>{timerSeconds}s</Text>
                      <Text style={styles.visualizerInnerAction}>{getStepAction()}</Text>
                    </View>
                  </View>
                  <Text style={styles.visualizerStepTitle}>{getStepText()}</Text>
                  <View style={styles.repTracker}>
                    <Text style={styles.visualizerReps}>Completed Loops: {completedRepetitions} / 4</Text>
                  </View>
                </View>
              ) : (
                !questCompleted && (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.startQuestBtn}
                    onPress={startBreathing}
                  >
                    <Text style={styles.startQuestBtnText}>🚀 Start Breathing Quest</Text>
                  </TouchableOpacity>
                )
              )}

              {/* Submit Buttons */}
              {!questCompleted && (
                <View style={styles.questSubmitRow}>
                  <TouchableOpacity
                    activeOpacity={0.85}
                    style={styles.submitQuestBtn}
                    onPress={forceSubmitQuest}
                  >
                    <Text style={styles.submitQuestBtnText}>📤 {t.clockinSubmitBtn}</Text>
                  </TouchableOpacity>
                </View>
              )}
              {questCompleted && (
                <View style={[styles.successInsightBox, { marginTop: 12 }]}>
                  <Text style={styles.successTitle}>{t.clockinQuestSuccessTitle}</Text>
                  <Text style={styles.successDesc}>{t.clockinQuestSuccessDesc}</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ✅ BLOCK 3: Post-Quest Verified Update */}
        <View style={styles.cardContainer}>
          <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.successLight, borderColor: theme.colors.success }]}>
            <Text style={[styles.cardHeaderTagText, { color: theme.colors.success }]}>✅ CLEARED STATUS | 07:46 AM Update</Text>
          </View>
          <View style={styles.card}>
            {/* Header Badge */}
            <View style={styles.cardHeaderRow}>
              <View style={[styles.titleBadge, { backgroundColor: theme.colors.successLight }]}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                <Text style={[styles.badgeText, { color: theme.colors.success }]}>{t.clearedTitle}</Text>
              </View>
            </View>

            {/* Meta Badges stacked to prevent overflow on small screens */}
            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>📅 {t.clearedDate}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ {t.clearedTime}</Text>
              </View>
            </View>

            {/* Score & Progress */}
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>{t.clearedOsiLabel}</Text>
              <View style={styles.scoreNumberContainer}>
                <Text style={[styles.scoreValue, { color: theme.colors.success }]}>{questCompleted ? '77.8' : '80.2'}</Text>
                <Text style={styles.scoreScale}>/ 100</Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: questCompleted ? '77.8%' : '80.2%', backgroundColor: theme.colors.success }]} />
              </View>
              <View style={[styles.statusBanner, { backgroundColor: theme.colors.successLight }]}>
                <Text style={[styles.statusLabel, { color: theme.colors.success }]}>
                  {questCompleted ? t.clearedStatusVerified : t.clearedStatusPending}
                </Text>
              </View>
            </View>

            {/* SOP Assigned Task */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>{t.taskProfileTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>✔️</Text>
                <Text style={styles.bulletContentBold}>{t.taskOperator}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>⚠️</Text>
                <Text style={styles.bulletContent}>{t.taskHazards}</Text>
              </View>
            </View>

            {/* Live Buffer Intervention */}
            <View style={[styles.sectionBlock, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Text style={styles.sectionHeader}>{t.clearedTrackingTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>✔️</Text>
                <Text style={styles.bulletContent}>{t.clearedSurveyIngested}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>{questCompleted ? '✔️' : '⏳'}</Text>
                <Text style={styles.bulletContent}>{questCompleted ? t.clearedQuestVerified : t.clearedQuestPending}</Text>
              </View>

              {questCompleted && (
                <View style={styles.successInsightBox}>
                  <Text style={styles.successTitle}>{t.clearedSuccessTitle}</Text>
                  <Text style={styles.successDesc}>{t.clearedSuccessDesc}</Text>
                </View>
              )}
            </View>

            {/* Locked advisory */}
            <View style={styles.lockedBox}>
              <Text style={styles.lockedText}>⏳ {t.clearedLockedTitle}</Text>
              <Text style={styles.lockedSub}>{t.clearedLockedSub}</Text>
            </View>
          </View>
        </View>

        {/* 🌙 BLOCK 4: Reconciled Baseline / Night Summary */}
        <View style={styles.cardContainer}>
          <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.warningLight, borderColor: theme.colors.warning }]}>
            <Text style={[styles.cardHeaderTagText, { color: theme.colors.warning }]}>🌙 NIGHT WRAP | 11:30 PM Card for Worker</Text>
          </View>
          <View style={styles.card}>
            {/* Header Badge */}
            <View style={styles.cardHeaderRow}>
              <View style={[styles.titleBadge, { backgroundColor: theme.colors.warningLight }]}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.warning }]} />
                <Text style={[styles.badgeText, { color: theme.colors.warning }]}>{t.nightTitle}</Text>
              </View>
            </View>

            {/* Meta Badges stacked to prevent overflow on small screens */}
            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>📅 {t.nightDate}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ {t.nightTime}</Text>
              </View>
            </View>

            {/* Score & Progress */}
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>{t.nightOsiLabel}</Text>
              <Text style={styles.scoreLabelSub}>{t.nightOsiSub}</Text>
              <View style={styles.scoreNumberContainer}>
                <Text style={[styles.scoreValue, { color: theme.colors.warning }]}>84.3</Text>
                <Text style={styles.scoreScale}>/ 100</Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '84.3%', backgroundColor: theme.colors.warning }]} />
              </View>
              <View style={[styles.statusBanner, { backgroundColor: theme.colors.warningLight }]}>
                <Text style={[styles.statusLabel, { color: theme.colors.warning }]}>✔️ {t.nightStatus}</Text>
              </View>
            </View>

            {/* Overnight Compliance */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>🩹 {t.nightComplianceTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>✔️</Text>
                <Text style={styles.bulletContent}>{t.nightComplianceStretch}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>✔️</Text>
                <Text style={styles.bulletContent}>{t.nightComplianceDinner}</Text>
              </View>

              <View style={styles.successInsightBox}>
                <Text style={styles.successTitle}>{t.nightSuccessTitle}</Text>
                <Text style={styles.successDesc}>{t.nightSuccessDesc}</Text>
              </View>
            </View>

            {/* Tomorrow Deployment */}
            <View style={[styles.sectionBlock, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={styles.sectionHeader}>⚙️ {t.nightDeploymentTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>⏱️</Text>
                <Text style={styles.bulletContentBold}>{t.nightDeploymentGate}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>📢</Text>
                <Text style={styles.bulletContent}>{t.nightDeploymentRequired}</Text>
              </View>
            </View>

            {/* Sleep note */}
            <View style={styles.nightDecompressionBox}>
              <Text style={styles.nightText}>🛌 {t.nightRestWell}</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  topSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10000,
  },
  topSelectorLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.textSecondary,
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 9999,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  dropdownTriggerText: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.colors.text,
  },
  dropdownChevron: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: '900',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 36,
    right: 0,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderRadius: 12,
    width: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 9999,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  dropdownItemActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  dropdownItemText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  dropdownItemTextActive: {
    color: theme.colors.primary,
    fontWeight: '900',
  },
  cardContainer: {
    marginBottom: 28,
  },
  cardHeaderTag: {
    backgroundColor: theme.colors.successLight,
    borderWidth: 1.5,
    borderColor: theme.colors.success,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 10, // positive margin to sit cleanly above cards
    alignSelf: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderTagText: {
    fontSize: 11,
    fontWeight: '900',
    color: theme.colors.success,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.12)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.successLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  badgeText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: '800',
  },
  metaBadgeContainer: {
    flexDirection: 'column',
    gap: 8,
    marginBottom: 20,
  },
  metaBadge: {
    backgroundColor: theme.colors.background,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metaBadgeText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  scoreBox: {
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scoreLabel: {
    color: theme.colors.textSecondary,
    fontWeight: '800',
    fontSize: 13,
    textTransform: 'uppercase',
    letterSpacing: 1.0,
    marginBottom: 6,
  },
  scoreLabelSub: {
    color: theme.colors.textLight,
    fontWeight: '700',
    fontSize: 11,
    marginBottom: 8,
  },
  scoreNumberContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1,
  },
  scoreScale: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    marginLeft: 6,
    fontWeight: '700',
  },
  progressContainer: {
    height: 12,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  statusBanner: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionBlock: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    paddingBottom: 20,
  },
  sectionHeader: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 2,
  },
  bulletContent: {
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  bulletContentBold: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
    flex: 1,
  },
  nestedHeader: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 18,
    marginBottom: 12,
  },
  sopInsightCard: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sopTitle: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  sopDesc: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  hubLinksContainer: {
    flexDirection: 'column',
    gap: 12,
    marginTop: 16,
  },
  hubLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  hubLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hubLinkEmoji: {
    fontSize: 20,
  },
  hubLinkLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 0.5,
  },
  hubLinkArrow: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  swipeHintContainer: {
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: theme.colors.primaryLight,
    paddingVertical: 12,
    borderRadius: 12,
  },
  swipeText: {
    color: theme.colors.primary,
    fontSize: 13,
    fontWeight: '800',
  },
  driftMetricsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  driftCard: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  driftLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    fontWeight: '700',
    textAlign: 'center',
  },
  driftVal: {
    fontSize: 15,
    fontWeight: '900',
    textAlign: 'center',
  },
  driftSub: {
    fontSize: 10,
    color: theme.colors.textLight,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  questBorderCard: {
    borderWidth: 2,
    borderColor: theme.colors.warning,
    borderRadius: 18,
    padding: 20,
    backgroundColor: theme.colors.warningLight,
    marginTop: 8,
  },
  questHeader: {
    color: theme.colors.warning,
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
  },
  questSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: 20,
    fontWeight: '600',
  },
  questGuideBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  guideTextDesc: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
    fontWeight: '600',
  },
  guideText: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
    fontWeight: '800',
  },
  guideTextSub: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
    fontWeight: '700',
  },
  rationaleBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.1)',
  },
  rationaleTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  rationaleDesc: {
    fontSize: 12,
    lineHeight: 16,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  startQuestBtn: {
    backgroundColor: theme.colors.warning,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  startQuestBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  visualizerContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  circleWrapper: {
    width: 180,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  breathingCircleBg: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: theme.colors.warningLight,
    borderWidth: 4,
    borderColor: theme.colors.warning,
    position: 'absolute',
  },
  circleTextOverlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  visualizerStepVal: {
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: '900',
  },
  visualizerInnerAction: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '800',
    marginTop: 2,
  },
  visualizerStepTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  repTracker: {
    backgroundColor: theme.colors.background,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  visualizerReps: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  questSubmitRow: {
    alignItems: 'stretch',
    marginTop: 12,
  },
  submitQuestBtn: {
    backgroundColor: theme.colors.success,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitQuestBtnText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  successInsightBox: {
    backgroundColor: theme.colors.successLight,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  successTitle: {
    color: theme.colors.success,
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 6,
  },
  successDesc: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  lockedBox: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  lockedText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  lockedSub: {
    color: theme.colors.textSecondary,
    fontSize: 11,
    opacity: 0.8,
    marginTop: 4,
  },
  nightDecompressionBox: {
    backgroundColor: theme.colors.successLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  nightText: {
    color: theme.colors.success,
    fontWeight: '900',
    fontSize: 14,
  },
});

export default MyQuestScreen;
