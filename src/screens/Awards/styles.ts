import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive pillar widths
const CONTAINER_PADDING = 12;
const AVAILABLE_WIDTH = SCREEN_WIDTH - CONTAINER_PADDING * 2;
const GAP = 8;
const PILLAR_WIDTH_SIDE = Math.floor((AVAILABLE_WIDTH - GAP * 2) * 0.305);
const PILLAR_WIDTH_CENTER = Math.floor((AVAILABLE_WIDTH - GAP * 2) * 0.37);

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070B14', // Deep midnight void background matching reference
  },
  scrollContent: {
    paddingHorizontal: CONTAINER_PADDING,
    paddingTop: 16,
    paddingBottom: 50,
    alignItems: 'center',
  },

  // ================= SCREEN HEADER =================
  headerContainer: {
    backgroundColor: '#070B14',
    borderBottomColor: '#1E293B',
    borderBottomWidth: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 1.2,
    fontSize: 17,
  },
  headerButton: {
    backgroundColor: '#0D1424',
    borderColor: '#1E293B',
  },
  headerIcon: {
    color: '#F8FAFC',
  },

  // ================= HEADER SECTION =================
  headerSection: {
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  eyebrowText: {
    color: '#F97316', // Vivid amber/orange
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  mainTitleWhite: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
    lineHeight: 40,
  },
  gradientTitleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    marginBottom: 8,
  },
  subtitleText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 16,
  },

  // ================= PODIUM SECTION =================
  podiumWrapper: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 8,
  },
  podiumColumnsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: '100%',
    gap: GAP,
  },

  // Pillar Column Base
  pillarColumn: {
    alignItems: 'center',
  },
  columnSide: {
    width: PILLAR_WIDTH_SIDE,
  },
  columnCenter: {
    width: PILLAR_WIDTH_CENTER,
  },

  // Big Numbers
  numberContainerCenter: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  numberSideText: {
    color: '#475569', // Muted slate from reference
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
    lineHeight: 52,
    marginBottom: 4,
    textAlign: 'center',
  },

  // Titles
  titleSideText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 8,
    minHeight: 28,
  },
  titleCenterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginBottom: 8,
    minHeight: 28,
    flexWrap: 'wrap',
  },
  titleCenterWhite: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  titleCenterGold: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  // Dashed Badges
  dashedBadge: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: 10,
    width: '98%',
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  dashedBadgeSide: {
    borderColor: '#334155',
  },
  dashedBadgeCenter: {
    borderColor: '#D97706',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  badgeRewardsText: {
    color: '#64748B',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeRewardsTextCenter: {
    color: '#F59E0B',
  },
  badgeAnnouncedText: {
    color: '#94A3B8',
    fontSize: 7.5,
    fontWeight: '700',
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: 11,
  },
  badgeAnnouncedTextCenter: {
    color: '#FDE68A',
  },

  // Loading State
  loadingContainer: {
    paddingVertical: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },

  // Podium Blocks / Pillars
  podiumBlockSide: {
    width: '100%',
    backgroundColor: '#0D1424',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    borderBottomWidth: 0,
  },
  podiumBlockLeft: {
    height: 100, // Runner-up (02)
  },
  podiumBlockRight: {
    height: 75, // 3rd Place (03)
  },
  podiumBlockCenter: {
    width: '100%',
    height: 155, // Champion (01)
    backgroundColor: '#0E172A',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderWidth: 1.5,
    borderColor: '#D97706', // Golden amber border
    borderBottomWidth: 0,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  podiumCenterGlowOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Base Floor Line
  podiumBaseLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#1E293B',
  },

  // ================= BOTTOM QUOTE / HERO CALLOUT =================
  footerHeroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  footerWhiteQuote: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.2,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 6,
  },
  footerGradientSvgContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 28,
    width: '100%',
    paddingHorizontal: 4,
  },
});
