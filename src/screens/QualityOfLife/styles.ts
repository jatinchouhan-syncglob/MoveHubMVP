import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  headerContainer: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerIcon: {
    color: '#FFFFFF',
  },
  headerRightActions: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetPlaceholder: {
    width: 36,
    height: 36,
  },

  // Real-time Progress Bar
  progressContainer: {
    paddingHorizontal: 18,
    paddingVertical: 12,
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
    color: '#38BDF8',
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
    backgroundColor: '#38BDF8',
  },

  // Scroll View
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
  },

  // Intro / Clinical Disclaimer Box
  introCard: {
    backgroundColor: '#131B2E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    padding: 16,
    marginBottom: 20,
  },
  introHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  introTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  introIcon: {
    fontSize: 20,
  },
  introTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.2,
  },
  whoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
  },
  whoBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#818CF8',
    letterSpacing: 0.5,
  },
  introDescription: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 10,
  },
  introInstructionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  introInstructionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#38BDF8',
    fontStyle: 'italic',
  },

  // Section Headers
  sectionContainer: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F1F5F9',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 16,
  },

  // Notice Banner for 2-weeks Section
  noticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    padding: 12,
    marginBottom: 14,
    gap: 10,
  },
  noticeIcon: {
    fontSize: 16,
    marginTop: 2,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#FBBF24',
    lineHeight: 17,
    fontWeight: '500',
  },

  // Question Card
  questionCard: {
    backgroundColor: '#151E33',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    marginBottom: 14,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginRight: 8,
  },
  qNumberBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginRight: 8,
  },
  qNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
  },
  qCodeBadge: {
    backgroundColor: 'rgba(148, 163, 184, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
  },
  qCodeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  questionText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#F8FAFC',
    lineHeight: 20,
  },

  // Options Stack
  optionsContainer: {
    gap: 7,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  optionRowActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.14)',
    borderColor: '#38BDF8',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  optionRadioDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioDotActive: {
    borderColor: '#38BDF8',
  },
  optionRadioInnerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#38BDF8',
  },
  optionText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#94A3B8',
    flexShrink: 1,
  },
  optionTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  optionScoreBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionScoreBadgeActive: {
    backgroundColor: '#38BDF8',
  },
  optionScoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  optionScoreTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },

  // Footer Submit Bar
  footerNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  submitBtnDisabled: {
    backgroundColor: '#334155',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
});
