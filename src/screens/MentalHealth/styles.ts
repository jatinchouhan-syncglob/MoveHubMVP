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
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
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
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resetPlaceholder: {
    width: 38,
    height: 38,
  },

  // Progress Bar Header
  progressContainer: {
    paddingHorizontal: 20,
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

  // 2-Part Interactive Tabs
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
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38BDF8',
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
    backgroundColor: '#38BDF8',
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabBadgeTextActive: {
    color: '#0F172A',
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabButtonTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },

  // Scroll Content
  scrollContent: {
    padding: 16,
    paddingBottom: 110,
  },

  // Disclaimer / Intro Banner
  confidentialCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#131B2E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    padding: 14,
    marginBottom: 16,
    gap: 12,
  },
  confidentialIcon: {
    fontSize: 22,
    marginTop: 2,
  },
  confidentialTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#38BDF8',
    marginBottom: 4,
  },
  confidentialDesc: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 17,
  },

  // Part Header Block
  blockHeaderRow: {
    marginBottom: 14,
  },
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
  },

  // Category Section
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  categoryIcon: {
    fontSize: 18,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F1F5F9',
    letterSpacing: 0.3,
  },
  categorySubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 12,
  },

  // Notice Banner (for Substance Use)
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
    fontSize: 11.5,
    color: '#FBBF24',
    lineHeight: 16,
  },

  // Question Card
  questionCard: {
    backgroundColor: '#151E33',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 14,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  qNumberBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  qNumberText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
  },
  questionText: {
    flex: 1,
    fontSize: 13.5,
    fontWeight: '600',
    color: '#F8FAFC',
    lineHeight: 19,
  },

  // Radio Options Row / Pills
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  optionPill: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionPillActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    borderColor: '#38BDF8',
  },
  optionRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionRadioDotActive: {
    borderColor: '#38BDF8',
  },
  optionRadioInnerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#38BDF8',
  },
  optionPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  optionPillTextActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },

  // Footer Navigation
  footerNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  backNavButton: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  backNavButtonText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  nextNavButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  nextNavButtonDisabled: {
    opacity: 0.5,
  },
  nextNavButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  submitNavButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  submitNavButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Success Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  modalIcon: {
    fontSize: 32,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  modalCloseBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
