import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
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
  const [currentDateTime, setCurrentDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setCurrentDateTime(now.toLocaleString('en-US', options));
    };
    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);
    return () => clearInterval(timer);
  }, []);
  
  // Animation value for breathing circle expansion
  const [scaleAnim] = useState(new Animated.Value(1));

  // 7:30 AM Inception Survey States
  const [surveyQ1Val, setSurveyQ1Val] = useState<'A' | 'B' | 'C' | null>(null);
  const [surveyQ2Val, setSurveyQ2Val] = useState<'A' | 'B' | 'C' | null>(null);
  const [surveyQ3Val, setSurveyQ3Val] = useState<'A' | 'B' | null>(null);
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // 11:00 AM Mid-Shift Workload States
  const [workloadSelection, setWorkloadSelection] = useState<number | null>(null);
  const [workloadSubmitted, setWorkloadSubmitted] = useState(false);



  // 05:30 PM Recovery Pathways Selection State
  const [recoveryOption, setRecoveryOption] = useState<1 | 2 | 3>(1);

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

  const stopBreathing = () => {
    setBreathingActive(false);
    setBreathingStep('idle');
    setTimerSeconds(4);
    scaleAnim.setValue(1);
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

        {/* Dynamic System Date & Time Header */}
        <View style={{ backgroundColor: theme.colors.background, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 20, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: theme.colors.textSecondary }}>
            📅 DATE & TIME: <Text style={{ color: theme.colors.primary, fontWeight: '900' }}>{currentDateTime}</Text>
          </Text>
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

            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ TIME: 07:30 AM</Text>
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

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.hubLinkRow, { borderLeftColor: theme.colors.primary, marginTop: 16 }]}
              onPress={() => {
                drawer?.setTargetCardTime('07:45 AM');
                drawer?.setActiveScreen('OccupationalSafety');
              }}
            >
              <Text style={styles.hubLinkEmoji}>🦺</Text>
              <Text style={styles.hubLinkLabel}>See Details in Shield Hub</Text>
              <Text style={styles.hubLinkArrow}>➔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 📋 BLOCK 1.5: 7:30 AM Shift Inception Survey */}
        <View style={styles.cardContainer}>
          <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.warningLight, borderColor: theme.colors.warning }]}>
            <Text style={[styles.cardHeaderTagText, { color: theme.colors.warning }]}>📋 SURVEY | {t.surveyHeaderTag}</Text>
          </View>
          <View style={styles.card}>
            {/* Header Badge */}
            <View style={styles.cardHeaderRow}>
              <View style={[styles.titleBadge, { backgroundColor: theme.colors.warningLight }]}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.warning }]} />
                <Text style={[styles.badgeText, { color: theme.colors.warning }]}>{t.surveyHeaderTag}</Text>
              </View>
            </View>

            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ {t.surveyTime}</Text>
              </View>
            </View>

            {/* Welcome msg */}
            <View style={[styles.introBox, { borderLeftColor: theme.colors.warning }]}>
              <Text style={styles.introText}>{t.surveyWelcome}</Text>
            </View>

            {/* Survey Qs */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeader, { color: theme.colors.warning }]}>📋 SLEEP QUALITY & REST ACCUMULATOR</Text>
              
              {/* Q1 */}
              <Text style={[styles.bulletContentBold, { marginTop: 10, marginBottom: 8 }]}>{t.surveyQ1}</Text>
              <TouchableOpacity style={styles.surveyOptionRow} onPress={() => !surveySubmitted && setSurveyQ1Val('A')}>
                <View style={[styles.checkbox, surveyQ1Val === 'A' && styles.checkboxChecked]}>
                  {surveyQ1Val === 'A' && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <Text style={[styles.surveyOptionText, surveyQ1Val === 'A' && styles.surveyOptionTextActive]}>{t.surveyQ1OptA}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.surveyOptionRow} onPress={() => !surveySubmitted && setSurveyQ1Val('B')}>
                <View style={[styles.checkbox, surveyQ1Val === 'B' && styles.checkboxChecked]}>
                  {surveyQ1Val === 'B' && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <Text style={[styles.surveyOptionText, surveyQ1Val === 'B' && styles.surveyOptionTextActive]}>{t.surveyQ1OptB}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.surveyOptionRow} onPress={() => !surveySubmitted && setSurveyQ1Val('C')}>
                <View style={[styles.checkbox, surveyQ1Val === 'C' && styles.checkboxChecked]}>
                  {surveyQ1Val === 'C' && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <Text style={[styles.surveyOptionText, surveyQ1Val === 'C' && styles.surveyOptionTextActive]}>{t.surveyQ1OptC}</Text>
              </TouchableOpacity>

              {/* Q2 */}
              <Text style={[styles.bulletContentBold, { marginTop: 16, marginBottom: 8 }]}>{t.surveyQ2}</Text>
              <TouchableOpacity style={styles.surveyOptionRow} onPress={() => !surveySubmitted && setSurveyQ2Val('A')}>
                <View style={[styles.checkbox, surveyQ2Val === 'A' && styles.checkboxChecked]}>
                  {surveyQ2Val === 'A' && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <Text style={[styles.surveyOptionText, surveyQ2Val === 'A' && styles.surveyOptionTextActive]}>{t.surveyQ2OptA}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.surveyOptionRow} onPress={() => !surveySubmitted && setSurveyQ2Val('B')}>
                <View style={[styles.checkbox, surveyQ2Val === 'B' && styles.checkboxChecked]}>
                  {surveyQ2Val === 'B' && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <Text style={[styles.surveyOptionText, surveyQ2Val === 'B' && styles.surveyOptionTextActive]}>{t.surveyQ2OptB}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.surveyOptionRow} onPress={() => !surveySubmitted && setSurveyQ2Val('C')}>
                <View style={[styles.checkbox, surveyQ2Val === 'C' && styles.checkboxChecked]}>
                  {surveyQ2Val === 'C' && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <Text style={[styles.surveyOptionText, surveyQ2Val === 'C' && styles.surveyOptionTextActive]}>{t.surveyQ2OptC}</Text>
              </TouchableOpacity>

              {/* Q3 */}
              <Text style={[styles.bulletContentBold, { marginTop: 16, marginBottom: 8 }]}>{t.surveyQ3}</Text>
              <TouchableOpacity style={styles.surveyOptionRow} onPress={() => !surveySubmitted && setSurveyQ3Val('A')}>
                <View style={[styles.checkbox, surveyQ3Val === 'A' && styles.checkboxChecked]}>
                  {surveyQ3Val === 'A' && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <Text style={[styles.surveyOptionText, surveyQ3Val === 'A' && styles.surveyOptionTextActive]}>{t.surveyQ3OptA}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.surveyOptionRow} onPress={() => !surveySubmitted && setSurveyQ3Val('B')}>
                <View style={[styles.checkbox, surveyQ3Val === 'B' && styles.checkboxChecked]}>
                  {surveyQ3Val === 'B' && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <Text style={[styles.surveyOptionText, surveyQ3Val === 'B' && styles.surveyOptionTextActive]}>{t.surveyQ3OptB}</Text>
              </TouchableOpacity>
            </View>

            {/* Submit button / success state */}
            {surveySubmitted ? (
              <View style={[styles.successInsightBox, { marginTop: 12 }]}>
                <Text style={styles.successTitle}>✔️ Survey Ingested Successfully</Text>
                <Text style={styles.successDesc}>Turnstile unlocked. Amit's active shift parameters are now configured.</Text>
              </View>
            ) : (
              <View style={styles.questSubmitRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.submitQuestBtn, { backgroundColor: theme.colors.warning }]}
                  onPress={() => {
                    if (surveyQ1Val && surveyQ2Val && surveyQ3Val) {
                      setSurveySubmitted(true);
                    } else {
                      Alert.alert("Notice", "Please answer all questions first / कृपया सभी प्रश्नों का उत्तर दें।");
                    }
                  }}
                >
                  <Text style={styles.submitQuestBtnText}>{t.surveySubmitBtn}</Text>
                </TouchableOpacity>
              </View>
            )}
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

            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ TIME: 07:45 AM</Text>
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

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.hubLinkRow, { borderLeftColor: theme.colors.warning, marginTop: 16 }]}
              onPress={() => {
                drawer?.setTargetCardTime('07:45 AM');
                drawer?.setActiveScreen('OccupationalSafety');
              }}
            >
              <Text style={styles.hubLinkEmoji}>🦺</Text>
              <Text style={styles.hubLinkLabel}>See Details in Shield Hub</Text>
              <Text style={styles.hubLinkArrow}>➔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🟨 BLOCK 3: Cleared Status Card (Full Details, Amber Style) */}
        <View style={styles.cardContainer}>
          <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.warningLight, borderColor: theme.colors.warning }]}>
            <Text style={[styles.cardHeaderTagText, { color: theme.colors.warning }]}>🟨 CLEARED STATUS | 07:46 AM Update</Text>
          </View>
          <View style={styles.card}>
            {/* Header Badge */}
            <View style={styles.cardHeaderRow}>
              <View style={[styles.titleBadge, { backgroundColor: theme.colors.warningLight }]}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.warning }]} />
                <Text style={[styles.badgeText, { color: theme.colors.warning }]}>{t.clearedTitle}</Text>
              </View>
            </View>

            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ {t.clearedTime}</Text>
              </View>
            </View>

            {/* Score & Progress */}
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>{t.clearedOsiLabel}</Text>
              <View style={styles.scoreNumberContainer}>
                <Text style={[styles.scoreValue, { color: theme.colors.warning }]}>77.8</Text>
                <Text style={styles.scoreScale}>/ 100</Text>
              </View>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '77.8%', backgroundColor: theme.colors.warning }]} />
              </View>
              <View style={[styles.statusBanner, { backgroundColor: theme.colors.warningLight }]}>
                <Text style={[styles.statusLabel, { color: theme.colors.warning }]}>
                  {t.clearedStatusVerified}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.hubLinkRow, { borderLeftColor: theme.colors.warning, marginTop: 16 }]}
              onPress={() => {
                drawer?.setTargetCardTime('07:46 AM');
                drawer?.setActiveScreen('OccupationalSafety');
              }}
            >
              <Text style={styles.hubLinkEmoji}>🦺</Text>
              <Text style={styles.hubLinkLabel}>See Details in Shield Hub</Text>
              <Text style={styles.hubLinkArrow}>➔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 🟨 BLOCK 3.2: 11:00 AM Input Gate */}
        <View style={styles.cardContainer}>
          <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.warningLight, borderColor: theme.colors.warning }]}>
            <Text style={[styles.cardHeaderTagText, { color: theme.colors.warning }]}>⏱️ 11:00 AM | MID-SHIFT WORKLOAD GATE</Text>
          </View>
          <View style={styles.card}>
            {/* Header Badge */}
            <View style={styles.cardHeaderRow}>
              <View style={[styles.titleBadge, { backgroundColor: theme.colors.warningLight }]}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.warning }]} />
                <Text style={[styles.badgeText, { color: theme.colors.warning }]}>🟨 AMBER ZONE | MID-SHIFT WORKLOAD GATE</Text>
              </View>
            </View>

            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ TIME: 11:00 AM</Text>
              </View>
            </View>

            {/* Score & Gauge */}
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>CURRENT ACTIVE OSI: 77.8 / 100</Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '77.8%', backgroundColor: theme.colors.warning }]} />
              </View>
              <View style={[styles.statusBanner, { backgroundColor: theme.colors.warningLight }]}>
                <Text style={[styles.statusLabel, { color: theme.colors.warning, fontWeight: 'bold' }]}>Status: Stable Amber — Ingesting Load</Text>
              </View>
            </View>

            {/* Workload Survey */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeader, { color: theme.colors.warning }]}>📝 MID-DAY PRODUCTION SURGE INPUT</Text>
              <Text style={[styles.bulletContentBold, { marginTop: 10, marginBottom: 12 }]}>
                How has your physical workload on the welding line been so far today?
              </Text>

              {[
                { val: 1, label: '1 – Normal / As usual' },
                { val: 2, label: '2 – 10% to 20% more than usual' },
                { val: 3, label: '3 – 30% to 50% more than usual' },
                { val: 4, label: '4 – Almost double workload today (🚨 Critical Surge)' },
                { val: 5, label: '5 – Less than usual workload' },
              ].map(opt => (
                <TouchableOpacity
                  key={opt.val}
                  style={styles.surveyOptionRow}
                  onPress={() => !workloadSubmitted && setWorkloadSelection(opt.val)}
                >
                  <View style={[styles.checkbox, workloadSelection === opt.val && styles.checkboxChecked]}>
                    {workloadSelection === opt.val && <Text style={styles.checkboxTick}>✓</Text>}
                  </View>
                  <Text style={[styles.surveyOptionText, workloadSelection === opt.val && styles.surveyOptionTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Submit btn */}
            {workloadSubmitted ? (
              <View style={[styles.successInsightBox, { marginTop: 12 }]}>
                <Text style={styles.successTitle}>✔️ Workload Data Logged</Text>
                <Text style={styles.successDesc}>Shift parameters recalculated. Afternoon safety paths configured.</Text>
              </View>
            ) : (
              <View style={styles.questSubmitRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.submitQuestBtn, { backgroundColor: theme.colors.warning }]}
                  onPress={() => {
                    if (workloadSelection !== null) {
                      setWorkloadSubmitted(true);
                    } else {
                      Alert.alert("Notice", "Please select a workload option / कृपया वर्कलोड विकल्प चुनें।");
                    }
                  }}
                >
                  <Text style={styles.submitQuestBtnText}>📤 SUBMIT WORKLOAD</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

            {/* 🟨 BLOCK 3.3: 11:01 AM Post-Submission Screen */}
            <View style={styles.cardContainer}>
              <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.warningLight, borderColor: theme.colors.warning }]}>
                <Text style={[styles.cardHeaderTagText, { color: theme.colors.warning }]}>⏱️ 11:01 AM | SHIFT UPDATE</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.titleBadge, { backgroundColor: theme.colors.warningLight }]}>
                    <View style={[styles.statusDot, { backgroundColor: theme.colors.warning }]} />
                    <Text style={[styles.badgeText, { color: theme.colors.warning }]}>🟨 HIGH AMBER ZONE | DRIVE ACTIVE CAUTION</Text>
                  </View>
                </View>

                <View style={styles.metaBadgeContainer}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>⏱️ TIME: 11:01 AM</Text>
                  </View>
                </View>

                {/* Score */}
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreLabel}>RE-CALCULATED SHIFT OSI: 84.4 / 100</Text>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: '84.4%', backgroundColor: theme.colors.warning }]} />
                  </View>
                  <View style={[styles.statusBanner, { backgroundColor: theme.colors.warningLight }]}>
                    <Text style={[styles.statusLabel, { color: theme.colors.warning, fontWeight: 'bold' }]}>Status: Clear for Line with Tracking</Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.hubLinkRow, { borderLeftColor: theme.colors.warning, marginTop: 16 }]}
                  onPress={() => {
                    drawer?.setTargetCardTime('11:01 AM');
                    drawer?.setActiveScreen('OccupationalSafety');
                  }}
                >
                  <Text style={styles.hubLinkEmoji}>🦺</Text>
                  <Text style={styles.hubLinkLabel}>See Details in Shield Hub</Text>
                  <Text style={styles.hubLinkArrow}>➔</Text>
                </TouchableOpacity>
              </View>
            </View>



            {/* 🍱 BLOCK 3.4: 11:45 Meal Plan (Metabolic Shield) */}
            <View style={styles.cardContainer}>
              <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }]}>
                <Text style={[styles.cardHeaderTagText, { color: theme.colors.primary }]}>🍱 LUNCH METABOLIC SHIELD | Generated at 11:30 AM</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.titleBadge, { backgroundColor: theme.colors.primaryLight }]}>
                    <View style={[styles.statusDot, { backgroundColor: theme.colors.primary }]} />
                    <Text style={[styles.badgeText, { color: theme.colors.primary }]}>🍱 QUEST: PRE-LUNCH METABOLIC SHIELD</Text>
                  </View>
                </View>

                <View style={styles.metaBadgeContainer}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>⏱️ TIME: 11:30 AM</Text>
                  </View>
                </View>

                {/* Targets block */}
                <View style={[styles.pointBalanceContainer, { backgroundColor: theme.colors.primaryLight, borderColor: 'rgba(99, 102, 241, 0.2)', marginBottom: 16 }]}>
                  <Text style={[styles.bulletContentBold, { color: theme.colors.primaryDark, marginBottom: 8 }]}>🎯 TARGET MATRICES FOR LUNCH SHIELD</Text>
                  <Text style={styles.pointText}>• 🌾 CARBS  : Max 60g (Complex, Low-GI)</Text>
                  <Text style={styles.pointText}>• 🍗 PROTEIN: Target 35g (Spine Asset)</Text>
                  <Text style={styles.pointText}>• 🥦 FIBER  : Min 12g (Sugar Blocker)</Text>
                  <Text style={styles.pointText}>• 💛 FATS   : Max 20g (Lipid Restrictor)</Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.hubLinkRow, { borderLeftColor: theme.colors.primary, marginTop: 8 }]}
                  onPress={() => {
                    drawer?.setTargetCardTime('11:30 AM');
                    drawer?.setActiveScreen('OccupationalSafety');
                  }}
                >
                  <Text style={styles.hubLinkEmoji}>🦺</Text>
                  <Text style={styles.hubLinkLabel}>See Details in Shield Hub</Text>
                  <Text style={styles.hubLinkArrow}>➔</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 🍱 BLOCK 3.3.5: 01:00 PM Post-Lunch Risk Mitigation Guide Card (Compact) */}
            <View style={styles.cardContainer}>
              <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }]}>
                <Text style={[styles.cardHeaderTagText, { color: theme.colors.primary }]}>🍱 LUNCH MITIGATION | 01:00 PM Post-Lunch Plan</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.titleBadge, { backgroundColor: theme.colors.primaryLight }]}>
                    <View style={[styles.statusDot, { backgroundColor: theme.colors.primary }]} />
                    <Text style={[styles.badgeText, { color: theme.colors.primary }]}>🍱 POST-LUNCH RISK MITIGATION GUIDE</Text>
                  </View>
                </View>

                <View style={styles.metaBadgeContainer}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>⏱️ TIME: 01:00 PM</Text>
                  </View>
                </View>

                <View style={styles.introBox}>
                  <Text style={styles.introText}>
                    With near-double workload today, execute this two-part safety loop to protect your body and stay clear of Red Zone turnstile lockouts [health]:
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.hubLinkRow, { borderLeftColor: theme.colors.primary, marginTop: 16 }]}
                  onPress={() => {
                    drawer?.setTargetCardTime('01:00 PM');
                    drawer?.setActiveScreen('OccupationalSafety');
                  }}
                >
                  <Text style={styles.hubLinkEmoji}>🦺</Text>
                  <Text style={styles.hubLinkLabel}>See Details in Shield Hub</Text>
                  <Text style={styles.hubLinkArrow}>➔</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 📊 BLOCK 3.5: 1:20 PM Lunch Compliance */}
            <View style={styles.cardContainer}>
              <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.errorLight, borderColor: theme.colors.error }]}>
                <Text style={[styles.cardHeaderTagText, { color: theme.colors.error }]}>📊 RESOLUTION | LUNCH COMPLIANCE REPORT</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.titleBadge, { backgroundColor: theme.colors.errorLight }]}>
                    <View style={[styles.statusDot, { backgroundColor: theme.colors.error }]} />
                    <Text style={[styles.badgeText, { color: theme.colors.error }]}>📊 QUEST RESOLUTION: LUNCH COMPLIANCE</Text>
                  </View>
                </View>

                <View style={styles.metaBadgeContainer}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>⏱️ TIME: 01:20 PM</Text>
                  </View>
                </View>

                {/* Score */}
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreLabel}>TOTAL LUNCH COMPLIANCE: 31.3% (🚨 LOW)</Text>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: '31.3%', backgroundColor: theme.colors.error }]} />
                  </View>
                  <View style={[styles.statusBanner, { backgroundColor: theme.colors.errorLight }]}>
                    <Text style={[styles.statusLabel, { color: theme.colors.error, fontWeight: 'bold' }]}>Status: Metabolic Shield Compromised</Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.hubLinkRow, { borderLeftColor: theme.colors.error, marginTop: 16 }]}
                  onPress={() => {
                    drawer?.setTargetCardTime('01:20 PM');
                    drawer?.setActiveScreen('OccupationalSafety');
                  }}
                >
                  <Text style={styles.hubLinkEmoji}>🦺</Text>
                  <Text style={styles.hubLinkLabel}>See Details in Shield Hub</Text>
                  <Text style={styles.hubLinkArrow}>➔</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 🟨 BLOCK 3.6: 02:01 PM Predictive Shield Update */}
            <View style={styles.cardContainer}>
              <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.warningLight, borderColor: theme.colors.warning }]}>
                <Text style={[styles.cardHeaderTagText, { color: theme.colors.warning }]}>🟨 PREDICTIVE SHIELD | 02:01 PM Update</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.titleBadge, { backgroundColor: theme.colors.warningLight }]}>
                    <View style={[styles.statusDot, { backgroundColor: theme.colors.warning }]} />
                    <Text style={[styles.badgeText, { color: theme.colors.warning }]}>🟨 HIGH AMBER ZONE │ PREDICTIVE SHIELD</Text>
                  </View>
                </View>

                {/* Meta Badges */}
                <View style={styles.metaBadgeContainer}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>⏱️ TIME: 02:01 PM</Text>
                  </View>
                </View>

                {/* Score */}
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreLabel}>CURRENT ACTIVE OSI SCORE: 89.9 / 100</Text>
                  <View style={styles.progressContainer}>
                    <View style={[styles.progressBar, { width: '89.9%', backgroundColor: theme.colors.warning }]} />
                  </View>
                  <View style={[styles.statusBanner, { backgroundColor: theme.colors.warningLight }]}>
                    <Text style={[styles.statusLabel, { color: theme.colors.warning, fontWeight: 'bold' }]}>Status: Stable Amber — Shield Active</Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.hubLinkRow, { borderLeftColor: theme.colors.warning, marginTop: 16 }]}
                  onPress={() => {
                    drawer?.setTargetCardTime('02:01 PM');
                    drawer?.setActiveScreen('OccupationalSafety');
                  }}
                >
                  <Text style={styles.hubLinkEmoji}>🦺</Text>
                  <Text style={styles.hubLinkLabel}>See Details in Shield Hub</Text>
                  <Text style={styles.hubLinkArrow}>➔</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 🎛️ BLOCK 3.7: 05:30 PM End-of-Shift Reconciliation Pathways */}
            <View style={styles.cardContainer}>
              <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }]}>
                <Text style={[styles.cardHeaderTagText, { color: theme.colors.primary }]}>🎛️ RECOVERY | CHOOSE YOUR RECOVERY PATHWAYS</Text>
              </View>
              <View style={styles.card}>
                <View style={styles.cardHeaderRow}>
                  <View style={[styles.titleBadge, { backgroundColor: theme.colors.primaryLight }]}>
                    <View style={[styles.statusDot, { backgroundColor: theme.colors.primary }]} />
                    <Text style={[styles.badgeText, { color: theme.colors.primary }]}>🎛️ QUEST: CHOOSE YOUR RECOVERY PATHWAYS</Text>
                  </View>
                </View>

                {/* Meta Badges */}
                <View style={styles.metaBadgeContainer}>
                  <View style={styles.metaBadge}>
                    <Text style={styles.metaBadgeText}>⏱️ TIME: 05:30 PM</Text>
                  </View>
                </View>

                <View style={styles.introBox}>
                  <Text style={styles.introText}>
                    Amit, today's near-double workload has strained your L4/L5 lower back and left wrist [health]. Select an evening care path below to protect your health and secure your turnstile entry tomorrow [health]:
                  </Text>
                </View>

                <View style={styles.divider} />
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.hubLinkRow, { borderLeftColor: theme.colors.primary, marginTop: 8 }]}
                  onPress={() => {
                    drawer?.setTargetCardTime('05:30 PM');
                    drawer?.setActiveScreen('OccupationalSafety');
                  }}
                >
                  <Text style={styles.hubLinkEmoji}>🎛️</Text>
                  <Text style={styles.hubLinkLabel}>See Details in Shield Hub</Text>
                  <Text style={styles.hubLinkArrow}>➔</Text>
                </TouchableOpacity>


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
                <Text style={styles.metaBadgeText}>⏱️ TIME: 11:30 PM</Text>
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

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.hubLinkRow, { borderLeftColor: theme.colors.warning, marginTop: 16 }]}
              onPress={() => {
                drawer?.setTargetCardTime('11:30 PM');
                drawer?.setActiveScreen('OccupationalSafety');
              }}
            >
              <Text style={styles.hubLinkEmoji}>🦺</Text>
              <Text style={styles.hubLinkLabel}>See Details in Shield Hub</Text>
              <Text style={styles.hubLinkArrow}>➔</Text>
            </TouchableOpacity>
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
    marginBottom: 68,
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
    display: 'none',
  },
  hubLinkEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  hubLinkLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 10,
    lineHeight: 16,
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
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepTitle: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  stepBoxes: {
    flexDirection: 'row',
    gap: 4,
  },
  stepBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  stepBoxActive: {
    backgroundColor: theme.colors.successLight,
    borderColor: theme.colors.success,
  },
  stepBoxText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '700',
  },
  stepBoxTextActive: {
    color: theme.colors.success,
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
  introBox: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  introText: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  subBoxContainer: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  subBoxHeader: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  subBoxTier: {
    fontWeight: '600',
    fontSize: 13,
    marginTop: 4,
  },
  pointBalanceContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pointRow: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  pointText: {
    color: theme.colors.text,
    fontSize: 12.5,
    fontFamily: 'monospace',
  },
  recoverySubSection: {
    marginBottom: 16,
  },
  recoveryDetailText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  surveyOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: theme.colors.borderDark,
    borderRadius: 4,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkboxTick: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  surveyOptionText: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  surveyOptionTextActive: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  exerciseBox: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  exerciseTitle: {
    color: theme.colors.text,
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 8,
  },
  mediaPlaceholder: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  mediaEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  mediaText: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  exerciseDesc: {
    color: theme.colors.textSecondary,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 2,
  },
  scenarioToggleHeader: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  scenarioToggleTitle: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  scenarioToggleButtons: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  scenarioTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  scenarioTabActive: {
    backgroundColor: theme.colors.primaryLight,
  },
  scenarioTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  scenarioTabTextActive: {
    color: theme.colors.primaryDark,
  },
  recoveryOptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  recoveryOptionCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: 'rgba(99, 102, 241, 0.02)',
  },
  optionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionCardTitle: {
    fontSize: 13.5,
    fontWeight: '900',
    flex: 1,
  },
  radioDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: theme.colors.borderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  optionCardDesc: {
    color: theme.colors.text,
    fontSize: 12.5,
    lineHeight: 18,
    marginTop: 2,
  },
  optionCardForecast: {
    color: theme.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: '700',
    marginTop: 6,
  },
  optionCardBenefit: {
    color: '#16a34a',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    lineHeight: 16,
  },
});

export default MyQuestScreen;
