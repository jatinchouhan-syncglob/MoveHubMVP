import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0F172A',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuButton: {
    padding: 8,
    marginRight: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    fontWeight: '500',
  },
  resetButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  resetButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF4444',
  },

  // Progress Bar
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCounterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3B82F6',
    letterSpacing: 0.8,
  },
  progressPercentage: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#1E293B',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#3B82F6',
  },

  // Interactive Step Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0F172A',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3B82F6',
  },
  tabBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeActive: {
    backgroundColor: '#3B82F6',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabButtonTextActive: {
    color: '#60A5FA',
    fontWeight: '700',
  },

  // Main Scroll Content
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Confidential Banner
  confidentialCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#131B2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.25)',
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  confidentialIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  confidentialTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#60A5FA',
    marginBottom: 4,
  },
  confidentialDesc: {
    fontSize: 11.5,
    color: '#94A3B8',
    lineHeight: 16,
  },

  // Block Section
  blockBadgeContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
    marginBottom: 8,
  },
  blockBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#818CF8',
    letterSpacing: 0.5,
  },
  blockHeading: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  blockSubheading: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 16,
  },

  // Question Card
  questionCard: {
    backgroundColor: '#151E33',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
    marginBottom: 14,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  questionIcon: {
    fontSize: 18,
    marginRight: 10,
    marginTop: 1,
  },
  questionTitle: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 20,
    flex: 1,
  },
  questionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 4,
    lineHeight: 16,
    fontStyle: 'italic',
  },

  // Yes / No Button Row
  yesNoRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  yesNoBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yesNoBtnActiveYes: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
  },
  yesNoBtnActiveNo: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3B82F6',
  },
  yesNoBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#94A3B8',
  },
  yesNoBtnTextActiveYes: {
    color: '#10B981',
  },
  yesNoBtnTextActiveNo: {
    color: '#60A5FA',
  },

  // Stress Level Pills (Vertical or Grid)
  stressLevelList: {
    gap: 8,
    marginTop: 4,
  },
  stressLevelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  stressLevelCardActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3B82F6',
  },
  stressLevelEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  stressLevelInfo: {
    flex: 1,
  },
  stressLevelLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  stressLevelLabelActive: {
    color: '#60A5FA',
  },
  stressLevelDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  radioCircleActive: {
    borderColor: '#3B82F6',
  },
  radioInnerDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#3B82F6',
  },

  // Generic Choice Pills (Wrap / Grid)
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  choicePill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
  },
  choicePillActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  choicePillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  choicePillTextActive: {
    color: '#60A5FA',
    fontWeight: '700',
  },

  // Symptom Card in Q7
  symptomItemCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 12,
    marginBottom: 10,
  },
  symptomHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  symptomIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  symptomLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F8FAFC',
    flex: 1,
  },
  symptomPillsRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  symptomPill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#151E33',
  },
  symptomPillActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
  },
  symptomPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  symptomPillTextActive: {
    color: '#93C5FD',
    fontWeight: '700',
  },

  // Footer Nav
  footerNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  backNavButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  backNavButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94A3B8',
  },
  nextNavButton: {
    flex: 1,
    marginLeft: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextNavButtonDisabled: {
    opacity: 0.5,
  },
  nextNavButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
