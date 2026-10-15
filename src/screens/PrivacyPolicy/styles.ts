import { StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#080A0F', // MoveHub dark theme
  },

  // ================= HEADER =================
  headerBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0B0F17',
  },
  headerLeft: {
    width: 40,
    justifyContent: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#131B2B',
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerRightPlaceholder: {
    width: 40,
  },

  // ================= SCROLL CONTENT =================
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 60,
  },

  // Hero Card
  heroCard: {
    backgroundColor: '#0E1626',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 18,
    marginBottom: 20,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    borderWidth: 1,
    borderColor: '#0d9488',
    marginBottom: 10,
  },
  heroBadgeText: {
    color: '#14b8a6',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    color: '#94A3B8',
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  registeredOfficeBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  registeredOfficeLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  registeredOfficeText: {
    color: '#CBD5E1',
    fontSize: 11.5,
    lineHeight: 17,
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#0D1424',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 16,
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionNumberText: {
    color: '#14b8a6',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    flex: 1,
    letterSpacing: 0.3,
  },
  bodyText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '400',
    marginBottom: 8,
  },
  bodyTextBold: {
    color: '#E2E8F0',
    fontWeight: '700',
  },

  // Bullet Lists
  bulletList: {
    marginTop: 4,
    marginBottom: 8,
    gap: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#14b8a6',
    marginTop: 7,
  },
  bulletText: {
    color: '#94A3B8',
    fontSize: 12.5,
    lineHeight: 19,
    flex: 1,
  },

  // Important Notice Box (AI Disclaimer / HIPAA)
  highlightBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    padding: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  highlightTitle: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  highlightText: {
    color: '#FDE68A',
    fontSize: 12,
    lineHeight: 18,
  },

  // Grievance Contact Box
  grievanceBox: {
    backgroundColor: '#0F1A2E',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#0d9488',
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  grievanceTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  grievanceSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0d9488',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emailButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
