import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const SECTION_MARGIN = 0;
export const SECTION_WIDTH = SCREEN_WIDTH - 20;
export const CAROUSEL_CARD_WIDTH = SECTION_WIDTH;
export const CAROUSEL_CARD_HEIGHT = 220;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B001A',
  },
  headerContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerIcon: {
    color: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 40,
  },

  // Segment Dropdown Bar
  segmentBarCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
  },
  segmentBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  segmentBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  segmentBarIcon: {
    fontSize: 18,
  },
  segmentBarLabelGroup: {
    flex: 1,
  },
  segmentBarEyebrow: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  segmentBarTitle: {
    fontSize: 13.5,
    fontWeight: '900',
  },
  segmentSwitchPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
  },
  segmentSwitchText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  segmentSwitchArrow: {
    fontSize: 9,
    fontWeight: '900',
  },

  // Global Live Ticker Bar
  tickerCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 3.5,
    paddingVertical: 11,
    paddingHorizontal: 13,
    marginBottom: 14,
  },
  tickerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tickerBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tickerLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  tickerTagText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tickerTimeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.4,
  },
  tickerText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: 0.2,
  },

  // Main Segment Header Card
  segmentHeaderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  segmentHeaderTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  segmentBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  segmentNumberBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  segmentNumberText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  statusTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    gap: 4,
    borderWidth: 1,
  },
  statusTagText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statusTagEmoji: {
    fontSize: 11,
  },
  segmentMainTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  segmentSubTitle: {
    fontSize: 11.5,
    fontWeight: '500',
    lineHeight: 16,
  },

  // 5 Core Quadrants Quick Bar
  quadrantsBarScroll: {
    marginBottom: 16,
  },
  quadrantsBarContainer: {
    gap: 8,
    paddingVertical: 2,
  },
  quadrantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
  },
  quadrantChipIcon: {
    fontSize: 13,
  },
  quadrantChipText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },

  // Section Heading
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeadingText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // Focus Trackers Grid (2 Cards)
  focusTrackersRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  focusTrackerCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  focusTrackerTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  focusTrackerValueGroup: {
    marginVertical: 4,
  },
  focusTrackerValue: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  focusTrackerSubLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  focusTrackerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
    borderWidth: 1,
    maxWidth: '100%',
  },
  focusTrackerBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Standings / Bracket Card
  standingsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  standingsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  standingsTitleText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  teamsContainer: {
    gap: 12,
    marginBottom: 12,
  },
  teamRow: {
    gap: 6,
  },
  teamInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamNameText: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  teamPointsText: {
    fontSize: 12,
    fontWeight: '900',
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Standings Biomarker Intersection (Clinical segment)
  biomarkerCard: {
    gap: 8,
    marginBottom: 10,
  },
  biomarkerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  biomarkerLabel: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  biomarkerValue: {
    fontSize: 12,
    fontWeight: '900',
  },
  biomarkerTrendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },

  // Standings History List (Gym & Mass Individuals)
  historyItemsList: {
    gap: 8,
    marginBottom: 10,
  },
  historyItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  historyItemLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  historyItemDetail: {
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1,
  },
  historyItemStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
    borderWidth: 1,
  },
  historyItemStatusText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.4,
  },

  // Retail Voucher Pill
  rewardPillBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  rewardPillText: {
    fontSize: 11.5,
    fontWeight: '800',
  },

  standingsFooterNote: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  standingsActiveActionBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 8,
  },
  standingsActiveActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  standingsActiveActionIcon: {
    fontSize: 16,
  },
  standingsActiveActionText: {
    fontSize: 11.5,
    fontWeight: '800',
    flex: 1,
    letterSpacing: 0.3,
  },

  // Primary Segment Action Buttons
  actionsSection: {
    gap: 10,
    marginBottom: 16,
  },
  actionButton: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 8,
  },
  actionButtonIcon: {
    fontSize: 16,
  },
  actionButtonText: {
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },

  // Simulated Viewport Bottom Nav
  viewportBottomNav: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginTop: 10,
    marginBottom: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  viewportTabItem: {
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  viewportTabItemActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  viewportTabText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  viewportTabTextActive: {
    fontWeight: '900',
  },

  // Psychological Hook Banner
  psychHookCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  psychHookHeading: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  psychHookText: {
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '500',
  },

  // ================= MODAL STYLES =================
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.88)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: '92%',
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '900',
  },
  modalScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalScrollContent: {
    paddingBottom: 36,
  },

  // Segment Picker List Modal
  segmentPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0B0F17',
    marginBottom: 10,
  },
  segmentPickerItemActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#111827',
  },
  segmentPickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  segmentPickerIcon: {
    fontSize: 24,
  },
  segmentPickerName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  segmentPickerAudience: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  segmentPickerRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentPickerRadioSelected: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  segmentPickerRadioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },

  // Playbook Modal
  playbookStageCard: {
    backgroundColor: '#0B0F17',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    marginBottom: 12,
  },
  playbookStageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  playbookStageTitle: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  playbookDaysBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  playbookDaysText: {
    color: '#E2E8F0',
    fontSize: 10.5,
    fontWeight: '800',
  },
  playbookCutoffText: {
    color: '#F8FAFC',
    fontSize: 12.5,
    fontWeight: '700',
    marginBottom: 4,
  },
  playbookDropText: {
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 8,
  },
  playbookRulesText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  playbookResetBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  playbookResetText: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
  },

  // Metric Sandbox Modal
  sandboxCard: {
    backgroundColor: '#0B0F17',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    marginBottom: 12,
  },
  sandboxCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  sandboxMetricCode: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  sandboxTargetBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sandboxTargetText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  sandboxMetricName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 6,
  },
  sandboxRuleBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 8,
    padding: 9,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    marginBottom: 8,
  },
  sandboxRuleText: {
    color: '#E0F2FE',
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '600',
  },
  sandboxStrategyText: {
    color: '#94A3B8',
    fontSize: 11.5,
    lineHeight: 17,
  },

  // 3-Way Referral Modal
  referralNodeCard: {
    backgroundColor: '#0B0F17',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    marginBottom: 12,
  },
  referralNodeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  referralNodeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  referralNodeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  referralNodeTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    flex: 1,
  },
  referralNodeDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  referralNodeBtn: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  referralNodeBtnGradient: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralNodeBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  referralInput: {
    backgroundColor: '#030712',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#FFFFFF',
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 8,
  },
  referralInputSpacing: {
    marginBottom: 10,
  },

  // Calibration Modal
  calibrationCard: {
    backgroundColor: '#0B0F17',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
    marginBottom: 14,
  },
  calibrationPromptHeading: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  calibrationPromptSub: {
    color: '#94A3B8',
    fontSize: 12.5,
    lineHeight: 18,
    marginBottom: 14,
  },
  calibrationAuditCard: {
    backgroundColor: '#030712',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 12,
    gap: 8,
    marginBottom: 14,
  },
  calibrationAuditRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calibrationAuditLabel: {
    color: '#64748B',
    fontSize: 11.5,
    fontWeight: '700',
  },
  calibrationAuditValue: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '900',
  },
  calibrationStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  calibrationStatCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#030712',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 10,
  },
  calibrationStatLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  calibrationStatValue: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '900',
  },
  calibrationStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    marginBottom: 12,
  },
  calibrationStatusText: {
    color: '#10B981',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  calibrationActionBtn: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 6,
  },
  calibrationActionBtnGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calibrationActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  calibrationInfoBox: {
    backgroundColor: '#030712',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 10,
    marginTop: 10,
  },
  calibrationInfoText: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
  },

  // Disclaimer Modal
  disclaimerBox: {
    backgroundColor: '#0B0F17',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    marginBottom: 14,
  },
  disclaimerHeaderTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    marginBottom: 12,
  },
  disclaimerHeaderTagText: {
    color: '#EF4444',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  disclaimerText: {
    color: '#94A3B8',
    fontSize: 11.5,
    lineHeight: 18,
    marginBottom: 10,
  },
  disclaimerBullet: {
    color: '#CBD5E1',
    fontSize: 11.5,
    lineHeight: 18,
    paddingLeft: 6,
    marginBottom: 6,
  },
  disclaimerActionBtn: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 6,
  },
  disclaimerActionBtnGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimerActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // Enhanced Hero Header
  heroHeaderSection: {
    paddingHorizontal: 2,
    paddingTop: 10,
    paddingBottom: 8,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eyebrowBar: {
    width: 3,
    height: 12,
    borderRadius: 2,
    marginRight: 6,
  },
  eyebrowText: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  mainHeadline: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  subHeadline: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },

  // Enhanced Horizontal Segment Selector Tabs
  selectorSection: {
    marginTop: 6,
    marginBottom: 14,
  },
  selectorHeaderRow: {
    paddingHorizontal: 2,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorLabel: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  selectorCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
  },
  selectorCountText: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '700',
  },
  tabsScrollContent: {
    paddingHorizontal: 2,
    gap: 8,
  },
  tabItem: {
    minWidth: 140,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#1E293B',
    justifyContent: 'center',
    minHeight: 64,
    overflow: 'hidden',
  },
  tabItemSelected: {
    borderWidth: 2,
    overflow: 'hidden',
  },
  tabItemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  tabName: {
    color: '#CBD5E1',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  activeTabName: {
    fontWeight: '900',
  },
  tabCheckWrapper: {
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabTagline: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Enhanced Carousel Slide (With Real Images & Gradient Overlays)
  carouselSection: {
    marginVertical: 4,
  },
  slideWrapper: {
    width: SECTION_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideCard: {
    width: CAROUSEL_CARD_WIDTH,
    height: CAROUSEL_CARD_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#131B2B',
    borderWidth: 1.5,
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  slideGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  slideGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    justifyContent: 'flex-end',
    padding: 14,
  },
  slideTopBadgesRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  slideArenaBadge: {
    flexShrink: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  slideArenaBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  slideStatusBadge: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  slideStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  slideStatusText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  slideOverlayContent: {
    gap: 4,
  },
  slideCategoryText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  slideTitleText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.3,
  },

  // Enhanced Details Section (With Fact Pills & Description)
  detailsSection: {
    paddingHorizontal: 2,
    marginTop: 12,
    marginBottom: 14,
  },
  categoryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  arenaTaglineText: {
    fontSize: 11,
    fontWeight: '700',
    fontStyle: 'italic',
    flex: 1,
    marginLeft: 4,
  },
  quickShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: '#334155',
    gap: 5,
  },
  quickShareText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  arenaTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  factsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  factPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 6,
  },
  factDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  factText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  summaryText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },

  mainTabContent: {
    flex: 1,
  },

  // Enhanced Arenas Bottom Dock (Pinned at Bottom)
  bottomDockContainer: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0B0F17',
  },
  bottomDockCard: {
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomDockTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 12,
    position: 'relative',
  },
  bottomDockTabActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  bottomDockIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  bottomDockLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  bottomDockLabelActive: {
    fontWeight: '900',
  },
  bottomDockMicroBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginTop: 3,
  },
  bottomDockMicroBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  bottomDockActiveLine: {
    position: 'absolute',
    bottom: -4,
    width: 22,
    height: 3,
    borderRadius: 2,
  },

  // 1. War Room Screen View Styles
  warRoomContainer: {
    flex: 1,
  },
  warRoomScrollContent: {
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 36,
  },
  warRoomHeader: {
    marginBottom: 14,
  },
  warRoomPhaseBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  warRoomPhaseBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  warRoomHeaderTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  warRoomHeaderSubtitle: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 4,
    letterSpacing: 0.4,
  },
  warRoomHeaderSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 18,
  },
  warRoomFilterScroll: {
    marginBottom: 14,
  },
  warRoomFilterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  warRoomFilterChip: {
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1E293B',
  },
  warRoomFilterChipActive: {
    borderColor: '#38BDF8',
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
  },
  warRoomFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  warRoomFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  warRoomDirectiveCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    backgroundColor: '#0F172A',
  },
  warRoomDirectiveTag: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  warRoomDirectiveBody: {
    fontSize: 12,
    lineHeight: 18,
  },
  warRoomMetricCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#0B0F17',
  },
  warRoomMetricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  warRoomMetricCode: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  warRoomMetricBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  warRoomMetricBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#E2E8F0',
  },
  warRoomMetricName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  warRoomRuleBox: {
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  warRoomRuleText: {
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: '600',
  },
  warRoomStrategyBox: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  warRoomStrategyText: {
    fontSize: 11.5,
    lineHeight: 17,
    color: '#94A3B8',
  },
  warRoomActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 4,
    marginBottom: 10,
  },
  warRoomActionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  warRoomActionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // 2. Brackets Screen View Styles
  bracketsContainer: {
    flex: 1,
  },
  bracketsScrollContent: {
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 36,
  },
  bracketsHeroBanner: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#0F172A',
  },
  bracketsHeroTag: {
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bracketsHeroTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  bracketsHeroDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },
  bracketsStageTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  bracketsStageTabBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bracketsStageTabTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  bracketsStageTabSub: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 2,
  },

  // Comparison Section (Top Leader vs Your Standing)
  bracketsComparisonSection: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    backgroundColor: '#0F172A',
  },
  bracketsComparisonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bracketsComparisonTitle: {
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  bracketsComparisonTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  bracketsComparisonRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  bracketsComparisonCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    backgroundColor: '#0B0F17',
  },
  bracketsComparisonCardBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  bracketsComparisonCardBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bracketsComparisonCardName: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bracketsComparisonCardScore: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  bracketsComparisonCardMetric: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 6,
  },
  bracketsComparisonCardStatus: {
    fontSize: 9.5,
    fontWeight: '800',
    marginTop: 2,
  },
  bracketsComparisonProgressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  bracketsComparisonProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  bracketsComparisonDiffText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#CBD5E1',
    textAlign: 'center',
  },
  bracketsStageCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 14,
    backgroundColor: '#0B0F17',
  },
  bracketsStageTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bracketsStageTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  bracketsDaysBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  bracketsDaysText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bracketsCutoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  bracketsCutoffText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#CBD5E1',
  },
  bracketsDropBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 8,
  },
  bracketsDropText: {
    fontSize: 11,
    fontWeight: '800',
  },
  bracketsRulesText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 10,
  },
  bracketsResetBox: {
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  bracketsResetText: {
    fontSize: 11,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  bracketsStandingsSection: {
    marginTop: 6,
    marginBottom: 14,
  },
  bracketsStandingsTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
  },

  // 3. Rewards Screen View Styles
  rewardsContainer: {
    flex: 1,
  },
  rewardsScrollContent: {
    paddingHorizontal: 10,
    paddingTop: 14,
    paddingBottom: 36,
  },
  rewardsHeroCard: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#0B0F17',
  },
  rewardsHeroMultiplier: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  rewardsHeroSub: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 17,
    marginBottom: 12,
  },
  rewardsProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  rewardsProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  rewardsProgressFillActive: {
    width: '70%',
  },
  rewardsProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rewardsProgressLabelText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  rewardsNodeNav: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  rewardsNodeNavTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1E293B',
  },
  rewardsNodeNavTabActive: {
    borderWidth: 1.5,
  },
  rewardsNodeNavText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 2,
  },
  rewardsNodeNavTextActive: {
    color: '#FFFFFF',
    fontWeight: '900',
  },
  rewardsCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    backgroundColor: '#0B0F17',
  },
  rewardsCardTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  rewardsCardDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 14,
  },
  rewardsLinkBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  rewardsLinkText: {
    fontSize: 11,
    color: '#38BDF8',
    fontWeight: '700',
    flex: 1,
  },
  rewardsCopyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  rewardsCopyBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  rewardsShareActionBtn: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  rewardsShareActionGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardsShareActionText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  rewardsFormGroup: {
    marginBottom: 10,
  },
  rewardsFormLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#CBD5E1',
    marginBottom: 4,
  },
  rewardsFormInput: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#FFFFFF',
  },
  rewardsSubmitBtn: {
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  rewardsSubmitBtnText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  rewardsTierCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    backgroundColor: '#0B0F17',
    marginBottom: 16,
  },
  rewardsTierTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  rewardsTierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  rewardsTierPts: {
    fontSize: 12,
    fontWeight: '900',
    color: '#F59E0B',
  },
  rewardsTierName: {
    fontSize: 12,
    color: '#E2E8F0',
    fontWeight: '600',
    flex: 1,
    marginLeft: 10,
  },
});
