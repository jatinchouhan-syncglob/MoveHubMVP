import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { CustomHeader } from '../../components/common/CustomHeader';
import { IMAGES } from '../../assets/images';
import { useDrawer } from '../../navigation/DrawerContext';
import LinearGradient from 'react-native-linear-gradient';

export const FitnessChallengesScreen: React.FC = () => {
  const { setActiveScreen } = useDrawer();

  // Joint States for Trial & Challenge
  const [trialJoined, setTrialJoined] = useState(false);
  const [challengeJoined, setChallengeJoined] = useState(false);

  // Success Modal State
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [modalType, setModalType] = useState<'trial' | 'challenge'>('trial');

  // Toggle switcher status state

  const handleJoinTrial = () => {
    if (trialJoined) return;
    setModalType('trial');
    setTrialJoined(true);
    setSuccessModalVisible(true);
  };

  const handleJoinChallenge = () => {
    if (challengeJoined) return;
    setModalType('challenge');
    setChallengeJoined(true);
    setSuccessModalVisible(true);
  };

  const handleGoToLeaderboard = () => {
    setActiveScreen('Leaderboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Fitness Challenges"
        showDrawerButton
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />

      {/* Background Soft Glow Spots */}
      <View style={styles.glowSpot1} />
      <View style={styles.glowSpot2} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.sectionHeading}>
          Upcoming INOX Fitness Challenges
        </Text>

        {/* --- Trial Card --- */}
        <View style={styles.card}>
          {/* Card Top Row */}
          <View style={styles.cardTopRow}>
            <View style={styles.badgeShield}>
              <Text style={styles.badgeShieldText}>🏆</Text>
            </View>
            <Text style={styles.cardTitle}>INOX 7 Days Trial Walk/Run</Text>
          </View>

          {/* Card Image */}
          <View style={styles.imageWrapper}>
            <Image
              source={IMAGES.trialRunner}
              style={styles.cardImage}
              resizeMode="contain"
            />
          </View>

          {/* Date Container */}
          <View style={styles.dateBox}>
            <Text style={styles.dateText}>
              START DATE :{' '}
              <Text style={styles.dateValueText}>2026-04-27 @11:48 AM</Text>
            </Text>
            <Text style={styles.dateText}>
              END DATE :{' '}
              <Text style={styles.dateValueText}>2026-05-02 @06:48 AM</Text>
            </Text>
          </View>

          {/* Progress rows */}
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              🔥 Trial Run Team Progress • Day 1 of 6
            </Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressValueLabel}>
              {trialJoined ? '🚶 0 steps' : '⏳ No progress yet'}
            </Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={styles.progressMetaText}>🏢 Master</Text>
          </View>

          {/* Action button */}
          <TouchableOpacity
            style={[
              styles.joinButton,
              trialJoined && styles.joinedButtonDisabled,
            ]}
            activeOpacity={0.85}
            onPress={handleJoinTrial}
            disabled={trialJoined}
          >
            <Text
              style={[
                styles.joinButtonText,
                trialJoined && styles.joinedButtonTextDisabled,
              ]}
            >
              {trialJoined ? 'TRIAL in Progress' : 'JOIN THE TRIAL'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* --- Upcoming Events --- */}
        <Text style={styles.sectionHeading}>Upcoming INOX Events</Text>

        {/* Inox Challenge Card */}
        <View style={styles.eventCard}>
          <Image
            source={IMAGES.trialRunner}
            style={styles.eventCardImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.3)', 'rgba(15, 23, 42, 0.95)']}
            style={styles.eventGradient}
          >
            <View style={styles.eventHeaderRow}>
              <View style={styles.eventBadge}>
                <Text style={styles.eventBadgeText}>CHALLENGE</Text>
              </View>
              <View style={styles.masterBadge}>
                <Text style={styles.masterBadgeText}>Master</Text>
              </View>
            </View>

            <View style={styles.eventBottomContent}>
              <View style={styles.eventAccentLine} />
              <Text style={styles.eventTitle}>Inox Challenge</Text>

              <View style={styles.eventActionRow}>
                <View style={styles.calendarRow}>
                  <View style={styles.checkboxSquare} />
                  <Text style={styles.calendarText}>
                    2026-05-04 - 2026-05-11
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.eventJoinBtn,
                    challengeJoined && styles.eventJoinedBtnDisabled,
                  ]}
                  activeOpacity={0.8}
                  onPress={handleJoinChallenge}
                  disabled={challengeJoined}
                >
                  <Text
                    style={[
                      styles.eventJoinBtnText,
                      challengeJoined && styles.eventJoinedBtnTextDisabled,
                    ]}
                  >
                    {challengeJoined ? 'Joined' : 'Join'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Awards & Winners Card */}
        <View style={styles.awardsCard}>
          <View style={styles.awardsHeaderRow}>
            <View style={styles.awardsTrophyBox}>
              <Text style={styles.awardsTrophyEmoji}>🏆</Text>
            </View>
            <View>
              <Text style={styles.awardsTitle}>Awards & Winners</Text>
              <Text style={styles.awardsSubtext}>
                Exciting prizes for top performers
              </Text>
            </View>
          </View>

          <Text style={styles.prizeSubhead}>
            🎁 3 exciting prizes for top 3 winners!
          </Text>

          <View style={styles.prizeImageWrapper}>
            <Image
              source={IMAGES.winnerPrize}
              style={styles.prizeImage}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.surpriseText}>
            🎉 1 Overall Surprise Winner Prize!
          </Text>
          <Text style={styles.motivationalText}>
            Stay active and climb the leaderboard 🚀
          </Text>

          <TouchableOpacity
            style={styles.leaderboardBtn}
            activeOpacity={0.85}
            onPress={handleGoToLeaderboard}
          >
            <Text style={styles.leaderboardBtnText}>GO TO LEADERBOARD</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setSuccessModalVisible(false)}
          />
          <View style={styles.modalCard}>
            <View style={styles.successBadgeCircle}>
              <Text style={styles.successBadgeEmoji}>🎉</Text>
            </View>
            <Text style={styles.modalSuccessTitle}>
              {modalType === 'trial'
                ? 'Trial Joined Successfully!'
                : 'Challenge Joined Successfully!'}
            </Text>
            <Text style={styles.modalSuccessDesc}>
              {modalType === 'trial'
                ? 'You have successfully joined the Trial. Make sure to do some Trial walks with the phone in your hand or pocket so we can see some Trial walk data from your phone. This will validate your setup as complete for the Fitness challenge beginning May 4th.'
                : 'You have successfully joined the Challenge. Keep walking/running with your phone in your hand or pocket so your activity data gets tracked properly and reflects in the leaderboard and progress.'}
            </Text>

            <TouchableOpacity
              style={styles.successCloseBtn}
              activeOpacity={0.85}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.successCloseBtnText}>Got It</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  headerContainer: {
    backgroundColor: '#0B0F19',
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    color: '#FFFFFF',
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
    top: '10%',
    right: '-20%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    zIndex: -1,
  },
  glowSpot2: {
    position: 'absolute',
    bottom: '15%',
    left: '-20%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    zIndex: -1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  subheaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  subheaderTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  switchButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  switchButtonActive: {
    backgroundColor: '#14B8A6',
    shadowColor: '#14B8A6',
  },
  switchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeading: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  // Trial Card
  card: {
    backgroundColor: '#151E33',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  badgeShield: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(20, 184, 166, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
  },
  badgeShieldText: {
    fontSize: 18,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  imageWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    padding: 8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  dateBox: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 6,
  },
  dateValueText: {
    color: '#FFFFFF',
    fontWeight: 'normal',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 13.5,
    color: '#10B981',
    fontWeight: 'bold',
  },
  progressValueLabel: {
    fontSize: 14,
    color: '#2DD4BF',
    fontWeight: '600',
  },
  progressMetaText: {
    fontSize: 13,
    color: '#94A3B8',
  },
  joinButton: {
    backgroundColor: '#10B981',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  joinedButtonDisabled: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    shadowOpacity: 0,
    elevation: 0,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  joinedButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  // Event Card
  eventCard: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#1E293B',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  eventCardImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  eventGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  eventHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventBadge: {
    backgroundColor: 'rgba(226, 232, 240, 0.95)', // Light grey semi-transparent badge
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  eventBadgeText: {
    color: '#1E3A8A', // Dark blue text
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  masterBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)', // Dark semi-transparent badge
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  masterBadgeText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  eventBottomContent: {
    justifyContent: 'flex-end',
  },
  eventAccentLine: {
    width: 32,
    height: 3,
    backgroundColor: '#2DD4BF', // Mint/turquoise horizontal accent line
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  eventActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#2DD4BF', // Mint checkbox border
    backgroundColor: 'rgba(45, 212, 191, 0.25)', // Mint translucent background
    marginRight: 8,
  },
  calendarText: {
    fontSize: 14,
    color: '#FBBF24', // Golden/amber date text
    fontWeight: 'bold',
  },
  eventJoinBtn: {
    backgroundColor: '#2DD4BF', // Mint/turquoise join button
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2DD4BF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  eventJoinedBtnDisabled: {
    backgroundColor: 'rgba(45, 212, 191, 0.2)',
    shadowOpacity: 0,
    elevation: 0,
  },
  eventJoinBtnText: {
    color: '#000000', // Black text matching screenshot
    fontSize: 14,
    fontWeight: 'bold',
  },
  eventJoinedBtnTextDisabled: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  // Awards Card
  awardsCard: {
    backgroundColor: '#151E33',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  awardsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  awardsTrophyBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  awardsTrophyEmoji: {
    fontSize: 22,
  },
  awardsTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  awardsSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  prizeSubhead: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#F59E0B',
    marginBottom: 14,
  },
  prizeImageWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    padding: 4,
  },
  prizeImage: {
    width: '100%',
    height: '100%',
  },
  surpriseText: {
    fontSize: 13.5,
    fontWeight: 'bold',
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 4,
  },
  motivationalText: {
    fontSize: 12.5,
    color: '#10B981',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 18,
  },
  leaderboardBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardBtnText: {
    color: '#F59E0B',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  modalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 28,
    width: '85%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    elevation: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
  },
  successBadgeCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  successBadgeEmoji: {
    fontSize: 32,
  },
  modalSuccessTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalSuccessDesc: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  successCloseBtn: {
    backgroundColor: '#10B981',
    height: 44,
    borderRadius: 12,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: 'bold',
  },
});

export default FitnessChallengesScreen;
