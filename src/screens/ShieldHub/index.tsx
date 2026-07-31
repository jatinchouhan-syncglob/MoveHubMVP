import React, { useState, useContext } from 'react';
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

  const t = osiTranslations[selectedLanguage] || osiTranslations['en'];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CustomHeader
        title="Occupational Safety"
        showDrawerButton={true}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Language Switcher */}
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
        />

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
                <Text style={styles.metaBadgeText}>{t.date}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>{t.uhid}</Text>
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
        <View style={styles.cardContainer}>
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
                <Text style={styles.metaBadgeText}>{t.clockinDate}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>{t.uhid}</Text>
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
              <Text style={styles.sectionHeader}>{t.taskProfileTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContentBold}>{t.taskOperator}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>{t.taskHazards}</Text>
              </View>

              <Text style={[styles.bulletContentBold, { marginTop: 12, marginBottom: 4 }]}>{t.clockinInsightsTitle}</Text>
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
                <Text style={styles.exerciseDesc}>• {t.clockinStep1}</Text>
                <Text style={styles.exerciseDesc}>• {t.clockinStep2}</Text>
                <Text style={styles.exerciseDesc}>• {t.clockinStep3}</Text>
                <Text style={styles.exerciseDesc}>• {t.clockinStep4}</Text>
                <Text style={[styles.successDesc, { marginTop: 6, fontWeight: 'bold' }]}>{t.clockinRepeat}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 🟨 BLOCK 3: Cleared Status Card (Full Details, Amber Style) */}
        <View style={styles.cardContainer}>
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
                <Text style={styles.metaBadgeText}>{t.clearedDate}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>{t.clearedTime}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>{t.uhid}</Text>
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
              <Text style={styles.sectionHeader}>{t.taskProfileTitle}</Text>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContentBold}>{t.taskOperator}</Text>
              </View>
              <View style={styles.bulletItem}>
                <Text style={styles.bulletIcon}>•</Text>
                <Text style={styles.bulletContent}>{t.taskHazards}</Text>
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

            {/* Meta Badges */}
            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>📅 DATE: 27-Jul-2026</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ TIME: 11:01 AM</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>🆔 {t.uhid}</Text>
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
        <View style={styles.cardContainer}>
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

            {/* Meta Badges */}
            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>📅 DATE: 27-Jul-2026</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ TIME: 11:30 AM</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>🆔 {t.uhid}</Text>
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

        {/* 📊 BLOCK 3.5: 01:20 PM Lunch Compliance Card (Full Details) */}
        <View style={styles.cardContainer}>
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

            {/* Meta Badges */}
            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>📅 DATE: 27-Jul-2026</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ TIME: 01:20 PM</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>🆔 {t.uhid}</Text>
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

        {/* 🟨 BLOCK 3.6: 02:01 PM Predictive Shield Card (Full Details) */}
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
                <Text style={styles.metaBadgeText}>📅 DATE: 27-Jul-2026</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ TIME: 02:01 PM</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>🆔 {t.uhid}</Text>
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
                <Text style={styles.metaBadgeText}>📅 DATE: 27-Jul-2026</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ TIME: 05:30 PM</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>🆔 {t.uhid}</Text>
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
        <View style={styles.cardContainer}>
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
                <Text style={styles.metaBadgeText}>📅 {t.nightDate}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ {t.nightTime}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>{t.uhid}</Text>
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

            {/* Meta Badges stacked to prevent overflow on small screens */}
            <View style={styles.metaBadgeContainer}>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>📅 {t.pphiDate}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>⏱️ {t.pphiTime}</Text>
              </View>
              <View style={styles.metaBadge}>
                <Text style={styles.metaBadgeText}>🆔 {t.pphiUhid}</Text>
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
    marginBottom: 20,
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
    fontSize: 13,
    fontWeight: '800',
    color: theme.colors.text,
    marginBottom: 6,
  },
  scoreLabelSub: {
    fontSize: 11,
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
    fontSize: 12.5,
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
    fontSize: 12.5,
    lineHeight: 18,
  },
  sectionBlock: {
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 12.5,
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
    fontSize: 14,
    marginRight: 8,
    lineHeight: 18,
  },
  bulletContent: {
    fontSize: 12.5,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    flex: 1,
  },
  bulletContentBold: {
    fontSize: 12.5,
    fontWeight: '700',
    color: theme.colors.text,
    lineHeight: 18,
    flex: 1,
  },
  subBoxContainer: {
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  subBoxHeader: {
    fontSize: 13,
    fontWeight: '700',
  },
  subBoxTier: {
    fontSize: 11,
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
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  rationaleBox: {
    backgroundColor: '#fff8f6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ffeae5',
    padding: 12,
  },
  rationaleTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: theme.colors.error,
    marginBottom: 6,
  },
  rationaleDesc: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    lineHeight: 17,
  },
  recoverySubSection: {
    marginTop: 6,
  },
  recoveryDetailText: {
    fontSize: 12.5,
    color: theme.colors.textSecondary,
    lineHeight: 18,
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
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  successDesc: {
    color: '#166534',
    fontSize: 12,
    lineHeight: 17,
  },
  exerciseDesc: {
    color: '#166534',
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2.5,
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
});
