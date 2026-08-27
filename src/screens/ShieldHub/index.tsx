import React, { useState, useContext, useEffect } from 'react';
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
import { theme } from '../../theme';
import { CustomHeader } from '../../components/common/CustomHeader';
import DrawerContext from '../../navigation/DrawerContext';
import osiTranslations from '../HomeHub/DailyQuest/translations/osi_translations.json';
import { UnderProgress } from '../../components/common/UnderProgress';

type LanguageKey = 'en' | 'hi' | 'gu' | 'mr';

// Shared language switcher component for Shield Hub screens
const LanguageSelector: React.FC<{
  selectedLanguage: LanguageKey;
  setSelectedLanguage: (lang: LanguageKey) => void;
}> = ({ selectedLanguage, setSelectedLanguage }) => {
  const [open, setOpen] = useState(false);

  const langs: { key: LanguageKey; label: string }[] = [
    { key: 'en', label: 'English' },
    { key: 'hi', label: 'Hindi (हिंदी)' },
    { key: 'gu', label: 'Gujarati (ગુજરાતી)' },
    { key: 'mr', label: 'Marathi (मराठी)' },
  ];

  return (
    <View style={styles.langSelectorWrapper}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.langSelectorBtn}
        onPress={() => setOpen(!open)}
      >
        <Text style={styles.langSelectorText}>
          🌐 {langs.find(l => l.key === selectedLanguage)?.label} ▼
        </Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.langDropdown}>
          {langs.map(l => (
            <TouchableOpacity
              key={l.key}
              style={styles.langOption}
              onPress={() => {
                setSelectedLanguage(l.key);
                setOpen(false);
              }}
            >
              <Text
                style={[
                  styles.langOptionText,
                  selectedLanguage === l.key && styles.langOptionTextActive,
                ]}
              >
                {l.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

// 1. Occupational Safety Screen - Renders full baseline, clock-in, cleared status and night wrap cards
export const OccupationalSafetyScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const drawer = useContext(DrawerContext);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey>('en');
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');

  const scrollViewRef = React.useRef<ScrollView>(null);
  const [cardLayouts, setCardLayouts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (drawer?.targetCardTime && cardLayouts[drawer.targetCardTime] !== undefined) {
      scrollViewRef.current?.scrollTo({
        y: cardLayouts[drawer.targetCardTime],
        animated: true,
      });
      drawer.setTargetCardTime(null);
    }
  }, [drawer?.targetCardTime, cardLayouts]);

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

  // Box Breathing Quest States
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingStep, setBreathingStep] = useState<'idle' | 'inhale' | 'hold' | 'exhale' | 'holdEmpty'>('idle');
  const [timerSeconds, setTimerSeconds] = useState(4);
  const [completedRepetitions, setCompletedRepetitions] = useState(0);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

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

  const t = osiTranslations[selectedLanguage] || osiTranslations['en'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomHeader
        title="Occupational Safety"
        showDrawerButton={true}
      />

      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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

        {/* 🟢 BLOCK 1: Baseline OSI Card (Full Details) */}
        <View style={styles.cardContainer}>
          <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.successLight, borderColor: theme.colors.success }]}>
            <Text style={[styles.cardHeaderTagText, { color: theme.colors.success }]}>{t.title}</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.titleBadge, { backgroundColor: theme.colors.successLight }]}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.success }]} />
                <Text style={[styles.badgeText, { color: theme.colors.success }]}>{t.title}</Text>
              </View>
            </View>

            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ TIME: 07:30 AM</Text>
              </View>
            </View>

            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>{t.baselineOsi}</Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '56.4%', backgroundColor: theme.colors.success }]} />
              </View>
              <View style={[styles.statusBanner, { backgroundColor: theme.colors.successLight }]}>
                <Text style={[styles.statusLabel, { color: theme.colors.success, fontWeight: 'bold' }]}>{t.status}</Text>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>{t.taskProfileTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContentBold}>{t.taskOperator}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>{t.taskHazards}</Text>
              </View>

              <Text style={[styles.bulletContentBold, { marginTop: 12, marginBottom: 4 }]}>{t.insightsTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>
                  <Text style={{ fontWeight: 'bold' }}>ERGONOMIC posturing:</Text> {t.insightsErgonomic}
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>
                  <Text style={{ fontWeight: 'bold' }}>MANUAL HANDLING:</Text> {t.insightsManual}
                </Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>
                  <Text style={{ fontWeight: 'bold' }}>BAY ENVIRONMENT:</Text> {t.insightsEnvironment}
                </Text>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>{t.healthVaultTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>{t.healthPastRecords}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>{t.healthIndicators}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>✔️</Text>
                <Text style={styles.bulletContentBold}>{t.healthBufferMsg}</Text>
              </View>
            </View>

            <View style={[styles.sectionBlock, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={styles.sectionHeader}>{t.protocolTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>🔔</Text>
                <Text style={styles.bulletContent}>{t.protocolQuest}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 🟨 BLOCK 2: Clock-In Card (Full Details) */}
        <View
          style={styles.cardContainer}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setCardLayouts(prev => ({ ...prev, '07:45 AM': layout.y }));
          }}
        >
          <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.warningLight, borderColor: theme.colors.warning }]}>
            <Text style={[styles.cardHeaderTagText, { color: theme.colors.warning }]}>{t.clockinTitle}</Text>
          </View>
          <View style={styles.card}>
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

            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>{t.clockinOsiLabel} 80.2 / 100</Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '80.2%', backgroundColor: theme.colors.warning }]} />
              </View>
              <View style={[styles.statusBanner, { backgroundColor: theme.colors.warningLight }]}>
                <Text style={[styles.statusLabel, { color: theme.colors.warning, fontWeight: 'bold' }]}>{t.clockinStatus}</Text>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>{t.clockinInsightsTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>{t.clockinInsightSleep}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>{t.clockinInsightSpine}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>{t.clockinInsightHydration}</Text>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>{t.clockinDriftTitle}</Text>
              <View style={styles.driftRow}>
                <Text style={styles.driftLabel}>• {t.clockinSleepDuration}:</Text>
                <Text style={styles.driftValue}>{t.clockinSleepDurationVal} ({t.clockinSleepDurationSub})</Text>
              </View>
              <View style={styles.driftRow}>
                <Text style={styles.driftLabel}>• {t.clockinSleepQuality}:</Text>
                <Text style={styles.driftValue}>{t.clockinSleepQualityVal} ({t.clockinSleepQualitySub})</Text>
              </View>
              <View style={styles.driftRow}>
                <Text style={styles.driftLabel}>• {t.clockinMorningMood}:</Text>
                <Text style={styles.driftValue}>{t.clockinMorningMoodVal} ({t.clockinMorningMoodSub})</Text>
              </View>
            </View>

            <View style={[styles.sectionBlock, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={styles.sectionHeader}>{t.clockinQuestTitle}</Text>
              <Text style={styles.recoveryDetailText}>👉 {t.clockinTimeline}</Text>
              <Text style={styles.recoveryDetailText}>👉 {t.clockinTargetZone}</Text>
              <Text style={styles.recoveryDetailText}>👉 {t.clockinMission}</Text>

              <View style={[styles.successInsightBox, { marginTop: 12 }]}>
                <Text style={styles.successTitle}>{t.clockinGuideHeader}</Text>
                <Text style={styles.successDesc}>{t.clockinGuideDesc}</Text>
              </View>

              {/* Steps Container */}
              <View style={{ marginTop: 16 }}>
                <View style={styles.stepRow}>
                  <Text style={styles.stepTitle}>⏱️ STEP 1: INHALE DEEP THROUGH NOSE</Text>
                  <View style={styles.stepBoxes}>
                    <View style={[styles.stepBox, breathingActive && breathingStep === 'inhale' && styles.stepBoxActive]}><Text style={[styles.stepBoxText, breathingActive && breathingStep === 'inhale' && styles.stepBoxTextActive]}>1</Text></View>
                    <View style={[styles.stepBox, breathingActive && breathingStep === 'inhale' && styles.stepBoxActive]}><Text style={[styles.stepBoxText, breathingActive && breathingStep === 'inhale' && styles.stepBoxTextActive]}>2</Text></View>
                    <View style={[styles.stepBox, breathingActive && breathingStep === 'inhale' && styles.stepBoxActive]}><Text style={[styles.stepBoxText, breathingActive && breathingStep === 'inhale' && styles.stepBoxTextActive]}>3</Text></View>
                    <View style={[styles.stepBox, breathingActive && breathingStep === 'inhale' && styles.stepBoxActive]}><Text style={[styles.stepBoxText, breathingActive && breathingStep === 'inhale' && styles.stepBoxTextActive]}>4</Text></View>
                  </View>
                </View>

                <View style={styles.stepRow}>
                  <Text style={styles.stepTitle}>⏱️ STEP 2: HOLD BREATH COMFORTABLY</Text>
                  <View style={styles.stepBoxes}>
                    <View style={[styles.stepBox, breathingActive && breathingStep === 'hold' && styles.stepBoxActive]}><Text style={[styles.stepBoxText, breathingActive && breathingStep === 'hold' && styles.stepBoxTextActive]}>1</Text></View>
                    <View style={[styles.stepBox, breathingActive && breathingStep === 'hold' && styles.stepBoxActive]}><Text style={[styles.stepBoxText, breathingActive && breathingStep === 'hold' && styles.stepBoxTextActive]}>2</Text></View>
                    <View style={[styles.stepBox, breathingActive && breathingStep === 'hold' && styles.stepBoxActive]}><Text style={[styles.stepBoxText, breathingActive && breathingStep === 'hold' && styles.stepBoxTextActive]}>3</Text></View>
                    <View style={[styles.stepBox, breathingActive && breathingStep === 'hold' && styles.stepBoxActive]}><Text style={[styles.stepBoxText, breathingActive && breathingStep === 'hold' && styles.stepBoxTextActive]}>4</Text></View>
                  </View>
                </View>

                <View style={styles.stepRow}>
                  <Text style={styles.stepTitle}>⏱️ STEP 3: EXHALE SLOWLY THROUGH MOUTH</Text>
                  <View style={styles.stepBoxes}>
                    <View style={[styles.stepBox, breathingActive && breathingStep === 'exhale' && styles.stepBoxActive]}><Text style={[styles.stepBoxText, breathingActive && breathingStep === 'exhale' && styles.stepBoxTextActive]}>1</Text></View>
                    <View style={[styles.stepBox, breathingActive && breathingStep === 'exhale' && styles.stepBoxActive]}><Text style={[styles.stepBoxText, breathingActive && breathingStep === 'exhale' && styles.stepBoxTextActive]}>2</Text></View>
                    <View style={[styles.stepBox, breathingActive && breathingStep === 'exhale' && styles.stepBoxActive]}><Text style={[styles.stepBoxText, breathingActive && breathingStep === 'exhale' && styles.stepBoxTextActive]}>3</Text></View>
                    <View style={[styles.stepBox, breathingActive && breathingStep === 'exhale' && styles.stepBoxActive]}><Text style={[styles.stepBoxText, breathingActive && breathingStep === 'exhale' && styles.stepBoxTextActive]}>4</Text></View>
                  </View>
                </View>

                <View style={styles.stepRow}>
                  <Text style={styles.stepTitle}>⏱️ STEP 4: HOLD EMPTY BEFORE NEXT BREATH</Text>
                  <View style={styles.stepBoxes}>
                    <View style={[styles.stepBox, breathingActive && breathingStep === 'holdEmpty' && styles.stepBoxActive]}><Text style={[styles.stepBoxText, breathingActive && breathingStep === 'holdEmpty' && styles.stepBoxTextActive]}>1</Text></View>
                    <View style={[styles.stepBox, breathingActive && breathingStep === 'holdEmpty' && styles.stepBoxActive]}><Text style={[styles.stepBoxText, breathingActive && breathingStep === 'holdEmpty' && styles.stepBoxTextActive]}>2</Text></View>
                    <View style={[styles.stepBox, breathingActive && breathingStep === 'holdEmpty' && styles.stepBoxActive]}><Text style={[styles.stepBoxText, breathingActive && breathingStep === 'holdEmpty' && styles.stepBoxTextActive]}>3</Text></View>
                    <View style={[styles.stepBox, breathingActive && breathingStep === 'holdEmpty' && styles.stepBoxActive]}><Text style={[styles.stepBoxText, breathingActive && breathingStep === 'holdEmpty' && styles.stepBoxTextActive]}>4</Text></View>
                  </View>
                </View>

              </View>

              {/* Animated visualizer */}
              <View style={styles.visualizerContainer}>
                <Text style={styles.visualizerStepTitle}>
                  {breathingActive ? getStepText() : 'Ready to Start Focus Reset?'}
                </Text>
                <View style={styles.circleWrapper}>
                  <Animated.View style={[styles.breathingCircleBg, { transform: [{ scale: scaleAnim }] }]} />
                  <View style={styles.circleTextOverlay}>
                    <Text style={styles.visualizerStepVal}>
                      {breathingActive ? timerSeconds : '0'}
                    </Text>
                    <Text style={styles.visualizerInnerAction}>
                      {breathingActive ? getStepAction() : 'SEC'}
                    </Text>
                  </View>
                </View>

                <View style={styles.repTracker}>
                  <Text style={styles.visualizerReps}>
                    Completed Reps: {completedRepetitions} / 4
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.submitQuestBtn, { backgroundColor: breathingActive ? theme.colors.error : theme.colors.primary, paddingHorizontal: 20, marginTop: 12, borderRadius: 20, paddingVertical: 8 }]}
                  onPress={breathingActive ? stopBreathing : startBreathing}
                >
                  <Text style={[styles.submitQuestBtnText, { fontSize: 12 }]}>
                    {breathingActive ? '⏹️ STOP RESET' : '▶️ START FOCUS RESET'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Scientific rationale */}
              <View style={[styles.successInsightBox, { marginTop: 12, backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', borderWidth: 1 }]}>
                <Text style={[styles.successTitle, { color: '#166534' }]}>🔬 CLINICAL RESEARCH RATIONALE:</Text>
                <Text style={[styles.successDesc, { color: '#166534' }]}>
                  This specific breathing rhythm actively stimulates your vagus nerve, forcing oxygen to your prefrontal cortex to completely restore focus speeds [health].
                </Text>
              </View>

              {/* Submit done button in BIG letters */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.submitQuestBtn, { backgroundColor: theme.colors.success, marginTop: 16, paddingVertical: 18 }]}
                onPress={() => {
                  setQuestCompleted(true);
                  Alert.alert("Success", "Quest completed! Vagus nerve credit applied.");
                }}
              >
                <Text style={[styles.submitQuestBtnText, { fontSize: 16, letterSpacing: 1.5 }]}>
                  📤 SUBMIT DONE
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 🟨 BLOCK 3: Cleared Status Card (Full Details, Amber Style) */}
        <View
          style={styles.cardContainer}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setCardLayouts(prev => ({ ...prev, '07:46 AM': layout.y }));
          }}
        >
          <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.warningLight, borderColor: theme.colors.warning }]}>
            <Text style={[styles.cardHeaderTagText, { color: theme.colors.warning }]}>{t.clearedTitle}</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.titleBadge, { backgroundColor: theme.colors.warningLight }]}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.warning }]} />
                <Text style={[styles.badgeText, { color: theme.colors.warning }]}>{t.clearedTitle}</Text>
              </View>
            </View>

            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ TIME: 07:46 AM</Text>
              </View>
            </View>

            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>{t.clearedOsiLabel} 77.8 / 100</Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '77.8%', backgroundColor: theme.colors.warning }]} />
              </View>
              <View style={[styles.statusBanner, { backgroundColor: theme.colors.warningLight }]}>
                <Text style={[styles.statusLabel, { color: theme.colors.warning, fontWeight: 'bold' }]}>{t.clearedStatusVerified}</Text>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>{t.clearedTrackingTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>✔️</Text>
                <Text style={styles.bulletContent}>{t.clearedSurveyIngested}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>✔️</Text>
                <Text style={styles.bulletContent}>{t.clearedQuestVerified}</Text>
              </View>

              <View style={styles.successInsightBox}>
                <Text style={styles.successTitle}>{t.clearedSuccessTitle}</Text>
                <Text style={styles.successDesc}>{t.clearedSuccessDesc}</Text>
              </View>
            </View>

            <View style={[styles.lockedBox, { borderColor: theme.colors.warning }]}>
              <Text style={[styles.lockedText, { color: theme.colors.warning }]}>⏳ {t.clearedLockedTitle}</Text>
              <Text style={styles.lockedSub}>{t.clearedLockedSub}</Text>
            </View>
          </View>
        </View>

        {/* 🟨 BLOCK 3.3: 11:01 AM Shift Update Card (Full Details) */}
        <View
          style={styles.cardContainer}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setCardLayouts(prev => ({ ...prev, '11:01 AM': layout.y }));
          }}
        >
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

            {/* OSI Score */}
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>RE-CALCULATED SHIFT OSI: 84.4 / 100</Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '84.4%', backgroundColor: theme.colors.warning }]} />
              </View>
              <View style={[styles.statusBanner, { backgroundColor: theme.colors.warningLight }]}>
                <Text style={[styles.statusLabel, { color: theme.colors.warning, fontWeight: 'bold' }]}>Status: Clear for Line with Tracking</Text>
              </View>
            </View>

            {/* Shift Strain Alert */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>⚙️ 1. LATEST SHIFT STRAIN ALERT</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>Registered: Almost Double Workload</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}><Text style={{ fontWeight: 'bold', color: theme.colors.error }}>YOUR ACTIVE RISK:</Text> This heavy surge compounds your morning fatigue, placing intense physical stress on your L4/L5 lumbar vertebrae and weak left wrist joint [health].</Text>
              </View>
            </View>

            {/* Shift Timeline History */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>🩹 2. SHIFT TIMELINE HISTORY (LATEST)</Text>
              <View style={styles.bulletItem}><Text style={styles.bulletIcon}>⏱️</Text><Text style={styles.bulletContent}>11:01 AM: Workload Update  : Banked</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bulletIcon}>⏱️</Text><Text style={styles.bulletContent}>07:46 AM: Pre-Work Quest   : Verified</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bulletIcon}>⏱️</Text><Text style={styles.bulletContent}>07:45 AM: Clock-In Survey  : Ingested</Text></View>
            </View>

            {/* Dynamic Safety Quests */}
            <View style={[styles.sectionBlock, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={styles.sectionHeader}>🔔 3. UPCOMING DYNAMIC SAFETY QUESTS</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>🚶</Text>
                <Text style={styles.bulletContent}><Text style={{ fontWeight: 'bold' }}>TRACK A (01:15 PM):</Text> 5-Min Post-Meal Metabolic Walk (Location: Canteen / Shared Lanes)</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>⚙️</Text>
                <Text style={styles.bulletContent}><Text style={{ fontWeight: 'bold' }}>TRACK B (02:00 PM):</Text> 4-Min Peripheral Circulation Pumps (Location: MANDATORY AT BAY 2 BOOTH)</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 🍱 BLOCK 3.4: 11:30 AM Pre-Lunch Metabolic Shield Card (Full Details) */}
        <View
          style={styles.cardContainer}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setCardLayouts(prev => ({ ...prev, '11:30 AM': layout.y }));
          }}
        >
          <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }]}>
            <Text style={[styles.cardHeaderTagText, { color: theme.colors.primary }]}>🍱 METABOLIC | 11:30 AM Pre-Lunch Plan</Text>
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

            {/* Target Matrices */}
            <View style={[styles.pointBalanceContainer, { borderColor: 'rgba(99, 102, 241, 0.2)', paddingVertical: 12, paddingHorizontal: 16, marginBottom: 16 }]}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: theme.colors.primaryDark, marginBottom: 8 }}>🎯 TARGET MATRICES FOR LUNCH SHIELD</Text>
              <Text style={[styles.pointText, { color: theme.colors.text, fontSize: 13, lineHeight: 18 }]}>• 🌾 CARBS  : Max 60g (Complex, Low-GI)</Text>
              <Text style={[styles.pointText, { color: theme.colors.text, fontSize: 13, lineHeight: 18, marginTop: 4 }]}>• 🍗 PROTEIN: Target 35g (Spine Asset)</Text>
              <Text style={[styles.pointText, { color: theme.colors.text, fontSize: 13, lineHeight: 18, marginTop: 4 }]}>• 🥦 FIBER  : Min 12g (Sugar Blocker)</Text>
              <Text style={[styles.pointText, { color: theme.colors.text, fontSize: 13, lineHeight: 18, marginTop: 4 }]}>• 💛 FATS   : Max 20g (Lipid Restrictor)</Text>
            </View>

            {/* ICMR Status */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>⚙️ 1. ICMR METABOLIC STATUS AUDIT</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>Calculated BMI : 28.04 kg/m²</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>Waist Size     : 96 cm (Abdominal Obesity Flagged &gt; 90cm) [health].</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContentBold}>CLASSIFICATION : STAGE 2 OBESITY (Advanced obesity with active lower back joint pain & pre-diabetes) [health].</Text>
              </View>
            </View>

            {/* Active Risk Profile */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>🩹 2. DETECTED ACTIVE RISK PROFILE</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}><Text style={{ fontWeight: 'bold' }}>Musculoskeletal:</Text> Near-double workload compounds your weak wrist and active L4/L5 lumbar spinal compression [health].</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}><Text style={{ fontWeight: 'bold' }}>Metabolic Risk:</Text> Extreme sleep debt (4.5 Hrs) cuts insulin sensitivity by 30% today against Pre-Diabetes [health].</Text>
              </View>
            </View>

            {/* Why This Protects */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>🔬 3. WHY THIS PROTECTS YOUR SHIFT</Text>
              <Text style={styles.recoveryDetailText}>
                • Meeting these exact targets flattens your insulin curve to stop afternoon drowsiness, while providing vital proteins to protect your back muscles from fatigue and keep your OSI safe [health].
              </Text>
            </View>

            {/* Recommended Plate */}
            <View style={[styles.sectionBlock, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={styles.sectionHeader}>💡 TODAY'S RECOMMENDED PLATE SETUP</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>Fill 50% of your plate with Green Salad/Sabzi & Dal (Fiber & Protein) [health].</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>Limit White Rice/Roti to 1 small cup.</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>Avoid sweet chai or fried snacks [health].</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 🍱 BLOCK 3.3.5: 01:00 PM Post-Lunch Risk Mitigation Guide Card (Full Details) */}
        <View
          style={styles.cardContainer}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setCardLayouts(prev => ({ ...prev, '01:00 PM': layout.y }));
          }}
        >
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

            {/* Stage A */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.bulletContentBold, { fontSize: 14 }]}>🚶 STAGE A: THE 5-MINUTE LUNCH STROLL</Text>
              <Text style={styles.recoveryDetailText}>⏱️ TIMELINE: 01:15 PM (RIGHT AFTER MEAL)</Text>
              <Text style={styles.recoveryDetailText}>📍 LOCATION: CANTEEN AREA / OUTSIDE LANES</Text>
              <Text style={[styles.recoveryDetailText, { color: theme.colors.error }]}>
                • 🚨 WHY YOU FACE RISK: Standing under heavy workload strains muscles and slows focus [health].
              </Text>
              <Text style={styles.recoveryDetailText}>
                • 🛡️ HOW THIS HELPS YOU: Moving after break balances energy levels and prevents sluggishness [health].
              </Text>
            </View>

            {/* Stage B */}
            <View style={[styles.sectionBlock, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={[styles.bulletContentBold, { fontSize: 14 }]}>⚙️ STAGE B: PERIPHERAL CIRCULATION PUMPS</Text>
              <Text style={styles.recoveryDetailText}>⏱️ TIMELINE: 02:00 PM (45 MINS LATER)</Text>
              <Text style={styles.recoveryDetailText}>📍 LOCATION: MANDATORY AT YOUR BAY 2 BOOTH</Text>
              <Text style={[styles.recoveryDetailText, { color: theme.colors.error }]}>
                • 🚨 WHY YOU FACE RISK: Static standing causes blood pooling in lower legs, reducing brain oxygen under welding weights [health].
              </Text>
              <Text style={styles.recoveryDetailText}>
                • 🛡️ HOW THIS HELPS YOU: Activates muscle pumps to force blood back to the heart, shielding your L4/L5 spine [health].
              </Text>

              {/* 3 Exercises loops simulated */}
              <Text style={[styles.bulletContentBold, { marginTop: 16, marginBottom: 12 }]}>[📖 EXERCISE GUIDE - 3 BOOTH MOVEMENTS]</Text>

              {/* Ex 1 */}
              <View style={styles.exerciseBox}>
                <Text style={styles.exerciseTitle}>1. WORKBENCH CALF RAISES (90 Secs)</Text>
                <View style={styles.mediaPlaceholder}>
                  <Text style={styles.mediaEmoji}>🏃‍♂️</Text>
                  <Text style={styles.mediaText}>🎥 Loop: standing_calf_raise (Active 3s Loop)</Text>
                </View>
                <Text style={styles.exerciseDesc}>• Brace hands firmly on your welding table.</Text>
                <Text style={styles.exerciseDesc}>• Lift your heels high, hold for 2 secs, and lower down slowly under control.</Text>
              </View>

              {/* Ex 2 */}
              <View style={styles.exerciseBox}>
                <Text style={styles.exerciseTitle}>2. BEAM TOE LIFTS (90 Secs)</Text>
                <View style={styles.mediaPlaceholder}>
                  <Text style={styles.mediaEmoji}>🦶</Text>
                  <Text style={styles.mediaText}>🎥 Loop: standing_toe_raise (Active 3s Loop)</Text>
                </View>
                <Text style={styles.exerciseDesc}>• Lean your back straight against the steel beam.</Text>
                <Text style={styles.exerciseDesc}>• Keep your heels flat on the concrete floor and pull your toes up high.</Text>
              </View>

              {/* Ex 3 */}
              <View style={styles.exerciseBox}>
                <Text style={styles.exerciseTitle}>3. ISOMETRIC THIGH SQUEEZES (60 Secs)</Text>
                <View style={styles.mediaPlaceholder}>
                  <Text style={styles.mediaEmoji}>💪</Text>
                  <Text style={styles.mediaText}>🎥 Loop: standing_quad_clamp (Active 3s Loop)</Text>
                </View>
                <Text style={styles.exerciseDesc}>• Stand straight right inside your cell.</Text>
                <Text style={styles.exerciseDesc}>• Squeeze your quadriceps and glutes hard for 5 seconds, release, and repeat.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 📊 BLOCK 3.5: 01:20 PM Lunch Compliance Card (Full Details) */}
        <View
          style={styles.cardContainer}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setCardLayouts(prev => ({ ...prev, '01:20 PM': layout.y }));
          }}
        >
          <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.errorLight, borderColor: theme.colors.error }]}>
            <Text style={[styles.cardHeaderTagText, { color: theme.colors.error }]}>🍱 METABOLIC | 01:20 PM Lunch Compliance</Text>
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

            {/* Compliance Score */}
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>TOTAL LUNCH COMPLIANCE: 31.3% (🚨 LOW)</Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '31.3%', backgroundColor: theme.colors.error }]} />
              </View>
              <View style={[styles.statusBanner, { backgroundColor: theme.colors.errorLight }]}>
                <Text style={[styles.statusLabel, { color: theme.colors.error, fontWeight: 'bold' }]}>Status: Metabolic Shield Compromised</Text>
              </View>
            </View>

            {/* Ledger */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>📋 METABOLIC VARIANCE LEDGER (1:00 PM)</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>🌾 CARBS: 115g Ingested vs 60g Cap <Text style={{ color: theme.colors.error, fontWeight: 'bold' }}>(🚨 91.7% OVER CAP - REFLEX RISK)</Text></Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>🥦 FIBER: 4.5g Ingested vs 12g Min <Text style={{ color: theme.colors.error, fontWeight: 'bold' }}>(🚨 62.5% DEFICIT - SUGAR SPIKE)</Text></Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>🍗 PROTEIN: 18g Ingested vs 35g Min <Text style={{ color: theme.colors.warning, fontWeight: 'bold' }}>(⚠️ 48.6% DEFICIT - MUSCLE DEBT)</Text></Text>
              </View>
            </View>

            {/* Activity Trailer */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>🚶 POST-MEAL PHYSICAL ACTIVITY TRAILER</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>⏱️</Text>
                <Text style={styles.bulletContent}>01:15 PM MANDATORY STROLL GATE: <Text style={{ color: theme.colors.error, fontWeight: 'bold' }}>[ ❌ NOT DETECTED / SKIPPED ]</Text></Text>
              </View>
              <Text style={[styles.recoveryDetailText, { marginLeft: 16 }]}>
                (0 out of 5 Minutes Tracked)
              </Text>
            </View>

            {/* Active Risk */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>⚙️ YOUR ACTIVE AFTERNOON RISK FACTOR</Text>
              <Text style={styles.recoveryDetailText}>
                • <Text style={{ fontWeight: 'bold', color: theme.colors.error }}>WHY YOU FACE RISK NOW:</Text> Because you have Stage 2 Advanced Obesity and severe sleep debt, your high-carb lunch and missed stroll are causing a massive insulin surge right now [health]. This will trigger sudden brain fog, intense drowsiness, and slow down your welding motor reflexes by 50% [health].
              </Text>
            </View>

            {/* Remedial Action */}
            <View style={[styles.sectionBlock, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={styles.sectionHeader}>🛡️ REQUIRED SAFETY REMEDIAL ACTION</Text>
              <Text style={styles.bulletContentBold}>👉 APPOINTMENT : 02:00 PM (IN 40 MINS)</Text>
              <Text style={styles.bulletContentBold}>👉 LOCATION    : MANDATORY AT BAY 2 BOOTH</Text>
              <Text style={styles.bulletContentBold}>👉 MISSION     : PERIPHERAL BOOTH PUMPS</Text>
              <Text style={[styles.recoveryDetailText, { marginTop: 6 }]}>
                • <Text style={{ fontWeight: 'bold' }}>HOW THIS HELPS YOU:</Text> You must complete your 4-minute calf raises and toe lifts directly at your workbench to force pooled leg circulation back to your heart, blast oxygen to your brain and bring your safety score back down [health].
              </Text>
            </View>
          </View>
        </View>

        {/* 🟨 BLOCK 3.6: 02:01 PM Predictive Shield Update */}
        <View
          style={styles.cardContainer}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setCardLayouts(prev => ({ ...prev, '02:01 PM': layout.y }));
          }}
        >
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

            {/* Shift Transactions */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>⚙️ 1. LATEST SHIFT TRANSACTIONS BANKED</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>Past 3-Hour Load  : 30-50% Surge</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>✔️</Text>
                <Text style={styles.bulletContentBold}>Booth Pumps Quest : VERIFIED DONE</Text>
              </View>
            </View>

            {/* 5:30 Projection */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>🔮 2. 05:30 PM END-OF-SHIFT PROJECTION</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={[styles.bulletContentBold, { color: theme.colors.error }]}>UNMITIGATED TREND : 94.9 / 100 RED</Text>
              </View>
              <Text style={[styles.recoveryDetailText, { fontStyle: 'italic' }]}>
                YOUR AFTERNOON RISK: Plant line data shows your 30-50% workload surge will continue. Maintaining this pace until 05:30 PM will cause complete muscle fatigue and severe joint strain [health].
              </Text>
            </View>

            {/* Prevent quest */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>🛡️ 3. AUTOMATIC PREDICTIVE PREVENT-QUEST</Text>
              <Text style={styles.bulletContentBold}>👉 APPOINTMENT : 03:45 PM MID-AFTERNOON</Text>
              <Text style={styles.bulletContentBold}>👉 LOCATION    : BAY 2 WORKSTATION BOOTH</Text>
              <Text style={styles.bulletContentBold}>👉 MISSION     : WRIST GLIDE & BACK RE-CAP</Text>
              <Text style={[styles.recoveryDetailText, { marginTop: 6 }]}>
                • <Text style={{ fontWeight: 'bold' }}>HOW THIS HELPS YOU:</Text> This automatic 4-minute routine will relieve your wrist and lumbar muscle tension to flatten the fatigue spike, keeping your final score safe at 88.4 [health].
              </Text>
            </View>

            {/* History */}
            <View style={[styles.sectionBlock, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={styles.sectionHeader}>🩹 4. SHIFT TIMELINE HISTORY (LATEST)</Text>
              <View style={styles.bulletItem}><Text style={styles.bulletIcon}>⏱️</Text><Text style={styles.bulletContent}>02:01 PM: Booth Pumps   : COMPLIANT</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bulletIcon}>⏱️</Text><Text style={styles.bulletContent}>01:20 PM: Lunch Ingest  : 31.3% Low</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bulletIcon}>⏱️</Text><Text style={styles.bulletContent}>11:01 AM: Workload Ingest: Banked</Text></View>
              <View style={styles.bulletItem}><Text style={styles.bulletIcon}>⏱️</Text><Text style={styles.bulletContent}>07:46 AM: Pre-Work Quest: Verified</Text></View>
            </View>

            <View style={styles.swipeHintContainer}>
              <Text style={styles.swipeText}>▲ SWIPE LEFT FOR WRIST GLIDE & BACK RE-CAP</Text>
            </View>
          </View>
        </View>

        {/* 🎛️ BLOCK 3.7: 05:30 PM End-of-Shift Reconciliation Pathways */}
        <View
          style={styles.cardContainer}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setCardLayouts(prev => ({ ...prev, '05:30 PM': layout.y }));
          }}
        >
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

            {/* Option 1 */}
            <View style={[styles.recoveryOptionCard, { borderLeftColor: '#22C55E' }]}>
              <View style={styles.optionCardHeader}>
                <Text style={[styles.optionCardTitle, { color: '#16a34a' }]}>🍏 Scenario 1: The "Optimal Green Runway" Path (High-Intensity Yoga + Strict Keto-Veg)</Text>
              </View>
              <Text style={styles.optionCardDesc}>🧘 CARE: 15-Min Spinal Yoga Twist + 5-Min Deep Breathing Flow [health].</Text>
              <Text style={styles.optionCardDesc}>🍱 FOOD : High-Fiber Paneer & Green Sabzi [health].</Text>
              <Text style={styles.optionCardForecast}>🔮 TOMORROW'S OSI FORECAST: 69.8 (🟢 SAFE)</Text>
              <Text style={styles.optionCardBenefit}>💡 BENEFIT: Fully removes spinal compression and sugar spikes, giving you maximum safety runway for tomorrow's shift [health].</Text>
            </View>

            {/* Option 2 */}
            <View style={[styles.recoveryOptionCard, { borderLeftColor: '#F59E0B' }]}>
              <View style={styles.optionCardHeader}>
                <Text style={[styles.optionCardTitle, { color: '#d97706' }]}>🟨 Scenario 2: The "Safe Amber Buffer" Path (Light Stretching + High-Protein Chicken)</Text>
              </View>
              <Text style={styles.optionCardDesc}>🧘 CARE : 5-Min Seated Lower Back Stretch + Light Left Wrist Glides [health].</Text>
              <Text style={styles.optionCardDesc}>🍱 FOOD : Chicken Curry with 1 Roti & Salad [health].</Text>
              <Text style={styles.optionCardForecast}>🔮 TOMORROW'S OSI FORECAST: 86.1 (🟨 AMBER)</Text>
              <Text style={styles.optionCardBenefit}>💡 BENEFIT: Lowers muscle stiffness enough to provide a safe operating buffer and prevent an afternoon tool lockout tomorrow.</Text>
            </View>

            {/* Option 3 */}
            <View style={[styles.recoveryOptionCard, { borderLeftColor: '#EF4444' }]}>
              <View style={styles.optionCardHeader}>
                <Text style={[styles.optionCardTitle, { color: '#dc2626' }]}>🟥 Scenario 3: The "Zero-Action Neglect" Path (No Action + Heavy Refined Carbs)</Text>
              </View>
              <Text style={[styles.optionCardDesc, { fontWeight: 'bold', color: theme.colors.textSecondary, marginBottom: 8 }]}>Note: If you decide to not do OPTION 1 OR OPTION 2</Text>
              <Text style={styles.optionCardDesc}>🧘 CARE : No Stretching / No Breathing (❌)</Text>
              <Text style={styles.optionCardDesc}>🍱 FOOD : Unmeasured Heavy Rice & Sweets (❌)</Text>
              <Text style={styles.optionCardForecast}>🔮 TOMORROW'S OSI FORECAST: 92.2 (🟥 CRITICAL)</Text>
              <Text style={[styles.optionCardBenefit, { color: '#dc2626' }]}>
                🚨 RISK OUTCOME: Fatigue compounds overnight. Your motor reflexes will slow down by 50%, triggering an automatic tool lockout at the morning turnstiles tomorrow [health].
              </Text>
            </View>
          </View>
        </View>

        {/* 🟨 BLOCK 4: Night Wrap Card (Full Details) */}
        <View
          style={styles.cardContainer}
          onLayout={(event) => {
            const layout = event.nativeEvent.layout;
            setCardLayouts(prev => ({ ...prev, '11:30 PM': layout.y }));
          }}
        >
          <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.warningLight, borderColor: theme.colors.warning }]}>
            <Text style={[styles.cardHeaderTagText, { color: theme.colors.warning }]}>{t.nightTitle}</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={[styles.titleBadge, { backgroundColor: theme.colors.warningLight }]}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.warning }]} />
                <Text style={[styles.badgeText, { color: theme.colors.warning }]}>{t.nightTitle}</Text>
              </View>
            </View>

            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ TIME: 11:30 PM</Text>
              </View>
            </View>

            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>{t.nightOsiLabel} 84.3 / 100</Text>
              <Text style={[styles.scoreLabelSub, { color: theme.colors.warning, fontWeight: 'bold' }]}>{t.nightOsiSub}</Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '84.3%', backgroundColor: theme.colors.warning }]} />
              </View>
              <View style={[styles.statusBanner, { backgroundColor: theme.colors.warningLight }]}>
                <Text style={[styles.statusLabel, { color: theme.colors.warning, fontWeight: 'bold' }]}>{t.nightStatus}</Text>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>{t.nightComplianceTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>✔️</Text>
                <Text style={styles.bulletContent}>{t.nightComplianceStretch}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>✔️</Text>
                <Text style={styles.bulletContent}>{t.nightComplianceDinner}</Text>
              </View>

              <View style={[styles.successInsightBox, { marginTop: 12 }]}>
                <Text style={styles.successTitle}>✔️ Reconciled Successfully</Text>
                <Text style={styles.successDesc}>{t.nightSuccessTitle}</Text>
              </View>
            </View>

            <View style={[styles.sectionBlock, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={styles.sectionHeader}>{t.nightDeploymentTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>📢</Text>
                <Text style={styles.bulletContentBold}>{t.nightDeploymentGate}</Text>
              </View>
              <Text style={[styles.bulletContent, { marginLeft: 16, fontSize: 12.5, color: theme.colors.textSecondary }]}>
                {t.nightDeploymentRequired}
              </Text>

              <View style={[styles.lockedBox, { borderColor: theme.colors.warning, marginTop: 16 }]}>
                <Text style={[styles.lockedText, { color: theme.colors.warning }]}>🛌 {t.nightRestWell}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// 2. Preventive Care Screen - Hosts the full PPHI Card (Card 5)
export const PreventiveCareScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const drawer = useContext(DrawerContext);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageKey>('en');

  const t = osiTranslations[selectedLanguage] || osiTranslations['en'];

  const navigateToHub = (screenName: string) => {
    if (drawer) {
      drawer.setActiveScreen(screenName as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomHeader
        title="Preventive Care"
        showDrawerButton={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* 🏥 BLOCK 5: Personalized Preventive Health Index (PPHI) Card */}
        <View style={styles.cardContainer}>
          <View style={[styles.cardHeaderTag, { backgroundColor: theme.colors.errorLight, borderColor: theme.colors.error }]}>
            <Text style={[styles.cardHeaderTagText, { color: theme.colors.error }]}>{t.pphiHeaderTitle}</Text>
          </View>
          <View style={styles.card}>
            {/* Header Badge */}
            <View style={styles.cardHeaderRow}>
              <View style={[styles.titleBadge, { backgroundColor: theme.colors.errorLight }]}>
                <View style={[styles.statusDot, { backgroundColor: theme.colors.error }]} />
                <Text style={[styles.badgeText, { color: theme.colors.error }]}>{t.pphiTitle}</Text>
              </View>
            </View>
            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ {t.pphiTime}</Text>
              </View>
            </View>

            {/* Score & Progress */}
            <View style={styles.scoreBox}>
              <Text style={styles.scoreLabel}>{t.pphiTitle}</Text>
              <Text style={[styles.scoreLabelSub, { color: theme.colors.error, fontWeight: 'bold' }]}>{t.pphiAnchor}</Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: '96%', backgroundColor: theme.colors.error }]} />
              </View>
              <View style={[styles.statusBanner, { backgroundColor: theme.colors.errorLight }]}>
                <Text style={[styles.statusLabel, { color: theme.colors.error, fontWeight: 'bold' }]}>{t.pphiStatus}</Text>
              </View>
            </View>

            {/* Introduction Narrative */}
            <View style={styles.introBox}>
              <Text style={styles.introText}>{t.pphiIntro}</Text>
            </View>

            {/* Existing Medical Conditions */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>{t.pphiExistingTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>{t.pphiExistingCond}</Text>
              </View>
            </View>

            {/* Future Lifestyle Risk Paths */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionHeader}>{t.pphiFutureTitle}</Text>
              
              <View style={[styles.subBoxContainer, { backgroundColor: theme.colors.errorLight, borderColor: theme.colors.error, borderWidth: 1, padding: 12, borderRadius: 12, marginBottom: 12 }]}>
                <Text style={[styles.subBoxHeader, { color: theme.colors.error, fontWeight: 'bold', fontSize: 15 }]}>{t.pphiFutureRisk}</Text>
                <Text style={[styles.subBoxTier, { color: theme.colors.error, fontWeight: '600', fontSize: 13, marginTop: 4 }]}>{t.pphiTier}</Text>
              </View>

              <Text style={[styles.bulletContentBold, { marginBottom: 8 }]}>{t.pphiPointsHeader}</Text>
              
              <View style={styles.pointBalanceContainer}>
                <View style={styles.pointRow}><Text style={styles.pointText}>{t.pphiPoint1}</Text></View>
                <View style={styles.pointRow}><Text style={styles.pointText}>{t.pphiPoint2}</Text></View>
                <View style={styles.pointRow}><Text style={styles.pointText}>{t.pphiPoint3}</Text></View>
                <View style={styles.pointRow}><Text style={styles.pointText}>{t.pphiPoint4}</Text></View>
                <View style={styles.pointRow}><Text style={styles.pointText}>{t.pphiPoint5}</Text></View>
                <View style={styles.pointRow}><Text style={styles.pointText}>{t.pphiPoint6}</Text></View>
              </View>

              <View style={[styles.rationaleBox, { marginTop: 12 }]}>
                <Text style={styles.rationaleTitle}>{t.pphiRationaleHeader}</Text>
                <Text style={styles.rationaleDesc}>{t.pphiRationaleDesc}</Text>
              </View>
            </View>

            {/* Long-Term Off-Shift Recovery Quests */}
            <View style={[styles.sectionBlock, { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
              <Text style={styles.sectionHeader}>{t.pphiRecoveryTitle}</Text>

              {/* Subsection A: Yoga */}
              <View style={styles.recoverySubSection}>
                <Text style={[styles.bulletContentBold, { fontSize: 14 }]}>{t.pphiYogaTitle}</Text>
                <Text style={styles.recoveryDetailText}>⏳ {t.pphiYogaTimeline}</Text>
                <Text style={styles.recoveryDetailText}>{t.pphiYogaTherapy}</Text>
                <Text style={styles.recoveryDetailText}>{t.pphiYogaWhy}</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.hubLinkRow, { borderLeftColor: theme.colors.primary, marginTop: 8 }]}
                  onPress={() => navigateToHub('ActivityTracking')}
                >
                  <Text style={styles.hubLinkEmoji}>🏃</Text>
                  <Text style={styles.hubLinkLabel}>{t.pphiYogaLink}</Text>
                  <Text style={styles.hubLinkArrow}>➔</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Subsection B: Habit Reset */}
              <View style={styles.recoverySubSection}>
                <Text style={[styles.bulletContentBold, { fontSize: 14 }]}>{t.pphiHabitTitle}</Text>
                <Text style={styles.recoveryDetailText}>⏳ {t.pphiHabitTimeline}</Text>
                <Text style={styles.recoveryDetailText}>{t.pphiHabitAction}</Text>
                <Text style={styles.recoveryDetailText}>{t.pphiHabitWhy}</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.hubLinkRow, { borderLeftColor: theme.colors.secondary, marginTop: 8 }]}
                  onPress={() => navigateToHub('MealLog')}
                >
                  <Text style={styles.hubLinkEmoji}>🥗</Text>
                  <Text style={styles.hubLinkLabel}>{t.pphiHabitLink}</Text>
                  <Text style={styles.hubLinkArrow}>➔</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              {/* Subsection C: Clinical Pathology */}
              <View style={styles.recoverySubSection}>
                <Text style={[styles.bulletContentBold, { fontSize: 14 }]}>{t.pphiPathTitle}</Text>
                <Text style={styles.recoveryDetailText}>{t.pphiPathOrder}</Text>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[styles.hubLinkRow, { borderLeftColor: theme.colors.primary, marginTop: 8 }]}
                  onPress={() => navigateToHub('RiskAssessment')}
                >
                  <Text style={styles.hubLinkEmoji}>🏥</Text>
                  <Text style={styles.hubLinkLabel}>{t.pphiPathLink}</Text>
                  <Text style={styles.hubLinkArrow}>➔</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// 3. Other Shield Hub Screens (Placeholders/UnderProgress)
export const RiskAssessmentScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Health Risk Assessment"
      description="Assess metabolic risks, physiological factors, and habits to determine vulnerability score."
      icon="📋"
      headerTitle="Risk Assessment"
      showDrawerButton={true}
    />
  );
};

export const RiskTrackerScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Risk Tracker"
      description="Monitor vital risk indicators, blood pressure, heart rates, and HbA1c metrics."
      icon="📈"
      headerTitle="Risk Tracker"
      showDrawerButton={true}
    />
  );
};

export const RiskToolsScreen: React.FC = () => {
  return (
    <UnderProgress
      title="Risk Tools"
      description="Access clinical calculators, active risk monitors, and digital health guidelines."
      icon="🔧"
      headerTitle="Risk Tools"
      showDrawerButton={true}
    />
  );
};

export const MyConsultationsScreen: React.FC = () => {
  return (
    <UnderProgress
      title="My Consultations"
      description="Join active video visits, consult clinical experts, and manage appointments."
      icon="🤝"
      headerTitle="My Consultations"
      showDrawerButton={true}
    />
  );
};

// Stylesheet incorporating design details
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  langSelectorWrapper: {
    alignSelf: 'flex-end',
    marginBottom: 16,
    zIndex: 1000,
  },
  langSelectorBtn: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  langSelectorText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  langDropdown: {
    position: 'absolute',
    top: 38,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 6,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  langOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  langOptionText: {
    color: theme.colors.textSecondary,
    fontSize: 12.5,
    fontWeight: '500',
  },
  langOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  cardContainer: {
    marginBottom: 68,
  },
  cardHeaderTag: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  cardHeaderTagText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  metaBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metaBadge: {
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  metaBadgeText: {
    fontSize: 10.5,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  scoreBox: {
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14.5,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 6,
  },
  scoreLabelSub: {
    fontSize: 12.5,
    marginBottom: 6,
  },
  progressContainer: {
    height: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  statusBanner: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 13.5,
  },
  introBox: {
    backgroundColor: theme.colors.background,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  introText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionBlock: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bulletIcon: {
    fontSize: 15,
    marginRight: 8,
    lineHeight: 18,
  },
  bulletContent: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 19,
    flex: 1,
  },
  bulletContentBold: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 19,
    flex: 1,
  },
  subBoxContainer: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  subBoxHeader: {
    fontSize: 14,
    fontWeight: '700',
  },
  subBoxTier: {
    fontSize: 12.5,
    marginTop: 2,
  },
  pointBalanceContainer: {
    backgroundColor: theme.colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 12,
  },
  pointRow: {
    paddingVertical: 4,
  },
  pointText: {
    fontSize: 13.5,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  rationaleBox: {
    backgroundColor: '#fff8f6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffeae5',
    padding: 12,
  },
  rationaleTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.error,
    marginBottom: 6,
  },
  rationaleDesc: {
    fontSize: 13.5,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  recoverySubSection: {
    marginTop: 6,
  },
  recoveryDetailText: {
    fontSize: 13.5,
    color: theme.colors.textSecondary,
    lineHeight: 19,
    marginTop: 4,
  },
  hubLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  hubLinkEmoji: {
    fontSize: 20,
    marginRight: 10,
  },
  hubLinkLabel: {
    fontSize: 13.5,
    fontWeight: '900',
    color: theme.colors.text,
    letterSpacing: 0.5,
    flex: 1,
    marginRight: 10,
    lineHeight: 18,
  },
  hubLinkArrow: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  successInsightBox: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  successTitle: {
    color: '#16a34a',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  successDesc: {
    color: '#166534',
    fontSize: 13.5,
    lineHeight: 18,
  },
  exerciseDesc: {
    color: '#166534',
    fontSize: 13.5,
    lineHeight: 18,
    marginTop: 2.5,
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
    fontSize: 14.5,
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
  scenarioTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  driftRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  driftLabel: {
    fontSize: 12.5,
    color: theme.colors.textSecondary,
  },
  driftValue: {
    fontSize: 12.5,
    fontWeight: '700',
    color: theme.colors.text,
  },
  lockedBox: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.colors.success,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  lockedText: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.success,
    marginBottom: 4,
  },
  lockedSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  recoveryOptionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 12,
  },
  recoveryOptionCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: '#fafafa',
  },
  optionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  optionCardTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  optionCardDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginBottom: 4,
  },
  optionCardForecast: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 6,
    marginBottom: 2,
  },
  optionCardBenefit: {
    fontSize: 11.5,
    color: theme.colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: '#fff',
  },
  radioDotActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
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
});
