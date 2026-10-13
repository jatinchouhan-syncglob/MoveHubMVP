import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: '#080A0F',
  },

  // ================= HEADER SECTION =================
  headerSection: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  eyebrowText: {
    color: '#D946EF', // Vivid fuchsia / magenta from reference
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  titleContainer: {
    marginBottom: 6,
  },
  titleWhite: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  titleMagenta: {
    color: '#D946EF', // Matching 3 STAGES italic magenta
    fontSize: 32,
    fontWeight: '900',
    fontStyle: 'italic',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  subtitleText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginTop: 6,
  },

  // ================= FUNNEL / REDUCTION BAR =================
  funnelWrapper: {
    marginBottom: 24,
    borderRadius: 12,
    backgroundColor: '#0D1322',
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    position: 'relative',
  },
  funnelGradientFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
  },
  funnelSegmentsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 68,
  },
  funnelSegment: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(30, 41, 59, 0.7)',
    zIndex: 1,
  },
  funnelSegmentLast: {
    borderRightWidth: 0,
    position: 'relative',
  },
  funnelValueText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  funnelValuePodium: {
    color: '#F59E0B',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  funnelLabelText: {
    color: '#64748B',
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 4,
    textAlign: 'center',
  },
  funnelLabelTextActive: {
    color: '#E2E8F0',
  },
  podiumAngledAccent: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: '#F59E0B',
  },

  // ================= STAGE CARDS =================
  stageCardsContainer: {
    gap: 6,
  },
  stageCard: {
    backgroundColor: '#0D1527',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    padding: 14,
    position: 'relative',
  },
  stageCardActiveBlue: {
    borderColor: 'rgba(59, 130, 246, 0.6)',
    backgroundColor: '#0E172E',
  },
  stageCardActiveMagenta: {
    borderColor: 'rgba(217, 70, 239, 0.6)',
    backgroundColor: '#161026',
  },
  stageCardActiveAmber: {
    borderColor: 'rgba(245, 158, 11, 0.6)',
    backgroundColor: '#161410',
  },

  // Top Accent Colored Bars
  stageTopAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  topAccentBlue: {
    backgroundColor: '#3B82F6',
  },
  topAccentMagenta: {
    backgroundColor: '#D946EF',
  },
  topAccentAmber: {
    backgroundColor: '#F59E0B',
  },

  // Card Content
  stageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  stageNumberBlue: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '900',
  },
  stageNumberMagenta: {
    color: '#D946EF',
    fontSize: 13,
    fontWeight: '900',
  },
  stageNumberAmber: {
    color: '#F59E0B',
    fontSize: 13,
    fontWeight: '900',
  },
  stageDaysText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  stageTitleText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  stageTitleAmber: {
    color: '#F59E0B',
  },
  stageDescText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    marginBottom: 12,
  },

  // Bottom Cutoff Line
  stageCutoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1A2338',
  },
  cutoffStartBlue: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '900',
  },
  cutoffStartMagenta: {
    color: '#D946EF',
    fontSize: 14,
    fontWeight: '900',
  },
  cutoffStartAmber: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: '900',
  },
  cutoffTrackWrapper: {
    flex: 1,
    marginHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cutoffTrackLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#1E293B',
  },
  cutoffTrackLineBlue: {
    backgroundColor: '#2563EB',
  },
  cutoffTrackLineMagenta: {
    backgroundColor: '#A21CAF',
  },
  cutoffTrackLineAmber: {
    backgroundColor: '#D97706',
  },
  cutoffTrackArrow: {
    fontSize: 10,
    marginLeft: -1,
  },
  cutoffArrowBlue: {
    color: '#3B82F6',
  },
  cutoffArrowMagenta: {
    color: '#D946EF',
  },
  cutoffArrowAmber: {
    color: '#F59E0B',
  },
  cutoffEndWhite: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  cutoffPodiumWhite: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // Connecting Chevrons
  connectingRow: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 14,
  },
  connectingChevron: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '800',
  },
});
