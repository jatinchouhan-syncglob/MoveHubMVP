import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { CustomHeader } from '../../components/common/CustomHeader';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile } from '../../types';
import DrawerContext from '../../navigation/DrawerContext';

interface PrescriptionScreenProps {
  showDrawer?: boolean;
}

// Static Biometric Reset Blueprint Data (matching Exercise Prescription Biometric Reset tab)
const STATIC_BIOMETRIC_DATA = {
  uhid: 'JATCHO5525',
  age: 28,
  sex: 'Male',
  profileMode: 'STAGE 2 REVERSAL (PRE-DIABETIC)',
  rangeStart: '21 Apr 2026',
  rangeEnd: '28 Apr 2026',
  resetsInDays: 7,
  bseAdaptiveTarget: 75.0,
  coreTargets: [
    {
      key: 'bse',
      icon: '📊',
      name: 'BSE Efficiency',
      target: '75.0',
      base: '64.2',
      unit: '',
    },
    {
      key: 'sdex',
      icon: '🛋️',
      name: 'Sedentary Index',
      target: '35.0',
      base: '68.5',
      unit: '%',
    },
    {
      key: 'ppi',
      icon: '💓',
      name: 'Pulse Pace (PPI)',
      target: '2.80',
      base: '3.60',
      unit: '',
    },
    {
      key: 'e3',
      icon: '⚡',
      name: 'Move Economy (E3)',
      target: '92.0',
      base: '108.4',
      unit: 'kcal/km',
    },
    {
      key: 'is',
      icon: '🛡️',
      name: 'Stamina (IS)',
      target: '80.0',
      base: '68.0',
      unit: '%',
    },
    {
      key: 'aha',
      icon: '🏆',
      name: 'AHA Heart Volume',
      target: '150',
      base: '110',
      unit: 'pts',
    },
  ],
  checklist: [
    {
      id: 1,
      name: 'Vascular Breakout Walk',
      schedule: 'EVERY HOUR',
      duration: '90 Secs continuous',
      ruleDescription:
        'Office/Field Rule: Walk with phone in pocket to activate calf venous return pump.',
    },
    {
      id: 2,
      name: 'Zone-2 Cadence Walk',
      schedule: 'ONCE DAILY',
      duration: '21 Mins (Slashed 30%)',
      ruleDescription:
        'Adaptive daily volume blocks to accelerate cellular glucose uptake.',
    },
    {
      id: 3,
      name: 'Core Prone Planks',
      schedule: 'ONCE DAILY',
      duration: '3 Sets x 45 Secs',
      ruleDescription:
        'Pre-walk postural alignment to stabilize pelvis and decompress spine.',
    },
    {
      id: 4,
      name: 'Evening Hatha Yoga',
      schedule: 'EVERY NIGHT',
      duration: '15 Mins',
      ruleDescription:
        'Rest-window autonomic wind-down to lower bedtime cortisol and improve deep sleep.',
    },
  ],
  safetyCeilings: [
    { label: 'Heart Rate Limit Ceiling', value: '140 BPM' },
    { label: 'Continuous Sitting Max', value: '60 Mins' },
    { label: 'Desk Stasis Break Rule', value: '90-Sec Pocket Walk' },
  ],
  clinicalRationale:
    'Rhythmic moderate aerobic muscle activation increases cellular glucose transport pathways, while short, unbroken functional stretching sets remove localized pooling fluids to protect vascular endothelial walls [AHA].',
};

export const PrescriptionScreen: React.FC<PrescriptionScreenProps> = ({
  showDrawer = true,
}) => {
  const navigation = useNavigation<any>();
  const drawer = useContext(DrawerContext);

  const [activeTab, setActiveTab] = useState<'BASELINE' | 'CURRENT' | 'ARCHIVE'>('BASELINE');
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const cachedProfile = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
        if (cachedProfile) {
          setProfile(cachedProfile);
        }
      } catch (err) {
        console.warn('[PrescriptionScreen] Error loading cached user profile:', err);
      }
    };
    loadProfile();
  }, []);

  const handleGoToWorkoutLogs = () => {
    if (drawer?.setActiveScreen) {
      drawer.setActiveScreen('ActivityTracking');
    } else {
      navigation.navigate('DrawerNavigator', {
        screen: 'ActivityTracking',
      });
    }
  };

  const displayUhid = profile?.uhid || STATIC_BIOMETRIC_DATA.uhid;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#070B14" />
      <CustomHeader
        title="PRESCRIPTION"
        showDrawerButton={showDrawer}
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />

      {/* Atmospheric Soft Glow Blobs */}
      <View style={styles.glowSpot1} pointerEvents="none" />
      <View style={styles.glowSpot2} pointerEvents="none" />

      {/* Top 3-Tab Navigator: BASELINE | CURRENT | ARCHIVE */}
      <View style={styles.headerToggleWrapper}>
        <View style={styles.toggleSelectorContainer}>
          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === 'BASELINE' && styles.toggleBtnActive,
            ]}
            onPress={() => setActiveTab('BASELINE')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleBtnText,
                activeTab === 'BASELINE' && styles.toggleBtnTextActive,
              ]}
            >
              📊 BASELINE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === 'CURRENT' && styles.toggleBtnActive,
            ]}
            onPress={() => setActiveTab('CURRENT')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleBtnText,
                activeTab === 'CURRENT' && styles.toggleBtnTextActive,
              ]}
            >
              ⚡ CURRENT
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleBtn,
              activeTab === 'ARCHIVE' && styles.toggleBtnActive,
            ]}
            onPress={() => setActiveTab('ARCHIVE')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleBtnText,
                activeTab === 'ARCHIVE' && styles.toggleBtnTextActive,
              ]}
            >
              📂 ARCHIVE
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* =========================================================================
            TAB 1: BASELINE TAB (Biometric Reset Card UI with Static Data)
            ========================================================================= */}
        {activeTab === 'BASELINE' && (
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
                    UHID: <Text style={styles.bioMetaChipValue}>{displayUhid}</Text>
                  </Text>
                </View>
                <View style={styles.bioMetaChip}>
                  <Text style={styles.bioMetaChipLabel}>
                    Age: <Text style={styles.bioMetaChipValue}>{STATIC_BIOMETRIC_DATA.age} yrs</Text>
                  </Text>
                </View>
                <View style={styles.bioMetaChip}>
                  <Text style={styles.bioMetaChipLabel}>
                    Sex: <Text style={styles.bioMetaChipValue}>{STATIC_BIOMETRIC_DATA.sex}</Text>
                  </Text>
                </View>
              </View>
              <View style={styles.bioProfileModeRow}>
                <View style={styles.bioProfileDot} />
                <Text style={styles.bioProfileModeText}>
                  Profile: {STATIC_BIOMETRIC_DATA.profileMode}
                </Text>
              </View>
            </View>

            {/* Weekly Tracking Window */}
            <View style={styles.bioWindowBox}>
              <View style={styles.bioWindowLeft}>
                <Text style={styles.bioWindowLabel}>WEEKLY TRACKING WINDOW</Text>
                <Text style={styles.bioWindowRange}>
                  📅 {STATIC_BIOMETRIC_DATA.rangeStart} — {STATIC_BIOMETRIC_DATA.rangeEnd}
                </Text>
              </View>
              <View style={styles.bioResetBadge}>
                <Text style={styles.bioResetText}>
                  ⏳ Resets in {STATIC_BIOMETRIC_DATA.resetsInDays}d
                </Text>
              </View>
            </View>

            {/* Central Adaptive Target Ring */}
            <View style={styles.bioTargetSection}>
              <View style={styles.bioTargetRingOuter}>
                <View style={styles.bioTargetRingInner}>
                  <Text style={styles.bioTargetBigScore}>
                    {STATIC_BIOMETRIC_DATA.bseAdaptiveTarget.toFixed(1)}
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
              {STATIC_BIOMETRIC_DATA.coreTargets.map(item => (
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

            {/* Weekly Foundational Checklist (Static guidelines without pending/verified toggle) */}
            <View style={styles.bioSectionTitleRow}>
              <Text style={styles.bioSectionHeaderIcon}>🚀</Text>
              <Text style={styles.bioSectionHeader}>
                Weekly Foundational Checklist
              </Text>
            </View>

            <View style={styles.bioChecklistContainer}>
              {STATIC_BIOMETRIC_DATA.checklist.map(item => (
                <View key={item.id} style={styles.bioChecklistItem}>
                  <View style={styles.bioChecklistHeaderRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.bioChecklistTitle}>
                        {item.id}. {item.name}
                      </Text>
                      <Text style={styles.bioChecklistSchedule}>
                        ⏱️ {item.duration} • {item.schedule}
                      </Text>
                    </View>
                    <View style={styles.protocolBadgePill}>
                      <Text style={styles.protocolBadgeText}>Active Guideline</Text>
                    </View>
                  </View>
                  <Text style={styles.bioChecklistRuleDesc}>
                    {item.ruleDescription}
                  </Text>
                </View>
              ))}
            </View>

            {/* Bounding Safety Ceilings */}
            <View style={styles.bioSafetyBox}>
              <View style={styles.bioSafetyHeaderRow}>
                <Text style={styles.bioSafetyIcon}>🛑</Text>
                <Text style={styles.bioSafetyTitle}>Bounding Safety Ceilings</Text>
              </View>
              {STATIC_BIOMETRIC_DATA.safetyCeilings.map((ceiling, idx) => (
                <React.Fragment key={ceiling.label}>
                  <View style={styles.bioSafetyItem}>
                    <Text style={styles.bioSafetyLabel}>{ceiling.label}</Text>
                    <Text style={styles.bioSafetyValue}>{ceiling.value}</Text>
                  </View>
                  {idx < STATIC_BIOMETRIC_DATA.safetyCeilings.length - 1 && (
                    <View style={styles.bioSafetyDivider} />
                  )}
                </React.Fragment>
              ))}
            </View>

            {/* Physiological Rationale & Citation */}
            <View style={styles.bioRationaleBox}>
              <View style={styles.bioRationaleHeaderRow}>
                <Text style={styles.bioRationaleIcon}>🔬</Text>
                <Text style={styles.bioRationaleTitle}>Physiological Rationale & Citation</Text>
              </View>
              <Text style={styles.bioRationaleText}>
                {STATIC_BIOMETRIC_DATA.clinicalRationale}
              </Text>
            </View>

            {/* Action Button: Proceed to Activity Tracker */}
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.85}
              onPress={handleGoToWorkoutLogs}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.actionBtnGradient}
              >
                <Text style={styles.actionBtnText}>PROCEED TO WORKOUT LOGS 🏃‍♂️</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* =========================================================================
            TAB 2: CURRENT TAB (Empty State: No Data Available)
            ========================================================================= */}
        {activeTab === 'CURRENT' && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>⚡</Text>
            </View>
            <Text style={styles.emptyTitle}>CURRENT PRESCRIPTION FORMULATION</Text>
            <Text style={styles.emptySubhead}>No Data Available</Text>
            <Text style={styles.emptyDesc}>
              Your individualized clinical exercise prescription will be formulated and updated here once your 7-day baseline convergence period completes.
            </Text>
            <View style={styles.emptyNoticePill}>
              <Text style={styles.emptyNoticePillText}>
                🔒 Formulation Locked: Requires completed baseline telemetry
              </Text>
            </View>
          </View>
        )}

        {/* =========================================================================
            TAB 3: ARCHIVE TAB (Empty State: No Data Available)
            ========================================================================= */}
        {activeTab === 'ARCHIVE' && (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Text style={styles.emptyIcon}>📂</Text>
            </View>
            <Text style={styles.emptyTitle}>ARCHIVED FORMULATIONS</Text>
            <Text style={styles.emptySubhead}>No Data Available</Text>
            <Text style={styles.emptyDesc}>
              Historical 7-day rolling prescriptions and clinical assessments will be archived here sequentially after each weekly cycle completes.
            </Text>
            <View style={styles.emptyNoticePill}>
              <Text style={styles.emptyNoticePillText}>
                📁 Archive Repository: Empty (Cycle 01 in progress)
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  headerContainer: {
    backgroundColor: '#070B14',
    borderBottomColor: '#1E293B',
    borderBottomWidth: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerButton: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  headerIcon: {
    color: '#FFFFFF',
  },
  glowSpot1: {
    position: 'absolute',
    top: 40,
    right: -40,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    zIndex: -1,
  },
  glowSpot2: {
    position: 'absolute',
    bottom: 80,
    left: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(16, 185, 129, 0.06)',
    zIndex: -1,
  },

  // Top Tabs Toggle
  headerToggleWrapper: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 8,
  },
  toggleSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  toggleBtnActive: {
    backgroundColor: '#1E293B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  toggleBtnTextActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 36,
  },

  // Biometric Reset Main Card
  biometricMainCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  bioTopHeader: {
    marginBottom: 14,
  },
  bioBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    marginBottom: 6,
  },
  bioBadgeIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  bioBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  bioCardMainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },

  // Patient Meta Box
  bioPatientMetaBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 14,
  },
  bioMetaChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  bioMetaChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  bioMetaChipLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  bioMetaChipValue: {
    fontWeight: '800',
    color: '#F8FAFC',
  },
  bioProfileModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  bioProfileDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  bioProfileModeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#34D399',
  },

  // Weekly Tracking Window
  bioWindowBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.2)',
    marginBottom: 16,
  },
  bioWindowLeft: {
    flex: 1,
    marginRight: 8,
  },
  bioWindowLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#818CF8',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  bioWindowRange: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  bioResetBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bioResetText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A5B4FC',
  },

  // Central Adaptive Target Ring
  bioTargetSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  bioTargetRingOuter: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 4,
  },
  bioTargetRingInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  bioTargetBigScore: {
    fontSize: 34,
    fontWeight: '900',
    color: '#10B981',
    lineHeight: 38,
  },
  bioTargetSublabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
    marginTop: 2,
  },
  bioTargetMetricTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 0.6,
    marginTop: 1,
  },
  bioTargetStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  bioTargetGreenDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  bioTargetStatusText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#34D399',
  },

  // Core Targets & Lifestyle Pacing
  bioSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  bioSectionHeaderIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  bioSectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.4,
  },
  bioTargetsList: {
    gap: 8,
    marginBottom: 10,
  },
  bioTargetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  bioTargetRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bioTargetRowIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  bioTargetName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  bioTargetRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bioTargetValues: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38BDF8',
  },
  bioTargetBaseChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  bioTargetBase: {
    fontSize: 10.5,
    color: '#94A3B8',
    fontWeight: '600',
  },

  // Checklist (Static guideline style without pending/verified toggle)
  bioChecklistContainer: {
    gap: 10,
    marginBottom: 16,
  },
  bioChecklistItem: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  bioChecklistHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bioChecklistTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  bioChecklistSchedule: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '700',
    marginTop: 2,
  },
  protocolBadgePill: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  protocolBadgeText: {
    color: '#38BDF8',
    fontSize: 9.5,
    fontWeight: '800',
  },
  bioChecklistRuleDesc: {
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 16,
  },

  // Safety Ceilings
  bioSafetyBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: 16,
    gap: 8,
  },
  bioSafetyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bioSafetyIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  bioSafetyTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#F87171',
    letterSpacing: 0.3,
  },
  bioSafetyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bioSafetyLabel: {
    fontSize: 11.5,
    color: '#CBD5E1',
  },
  bioSafetyValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bioSafetyDivider: {
    height: 1,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },

  // Rationale
  bioRationaleBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    marginBottom: 18,
  },
  bioRationaleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bioRationaleIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  bioRationaleTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#10B981',
  },
  bioRationaleText: {
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 17,
  },

  // Action Button
  actionBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionBtnGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.6,
  },

  // Empty State Cards (for CURRENT and ARCHIVE tabs)
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    marginBottom: 14,
  },
  emptyIcon: {
    fontSize: 28,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.8,
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubhead: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 12.5,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  emptyNoticePill: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyNoticePillText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default PrescriptionScreen;
