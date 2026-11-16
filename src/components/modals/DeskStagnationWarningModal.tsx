import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { useQuestArena } from '../../context/QuestArenaContext';

export interface DeskStagnationWarningModalProps {
  visible: boolean;
  onClose: () => void;
  currentMinutes?: number;
  limitMinutes?: number;
  questMessage?: string;
  walkDurationSec?: number;
  pacesCount?: number;
  minsUntilNextPenalty?: number;
  penaltyPoints?: number;
  meetingMuteActive?: boolean;
  onMuteAlerts?: () => void;
}

export const DeskStagnationWarningModal: React.FC<DeskStagnationWarningModalProps> = ({
  visible,
  onClose,
  currentMinutes: propCurrentMinutes,
  limitMinutes: propLimitMinutes,
  questMessage: propQuestMessage,
  walkDurationSec = 90,
  pacesCount = 60,
  minsUntilNextPenalty: propMinsUntilNextPenalty,
  penaltyPoints: propPenaltyPoints,
  meetingMuteActive: propMeetingMuteActive,
  onMuteAlerts,
}) => {
  const { data: sseData, isConnected } = useQuestArena();

  // Dynamic values priority: props -> SSE data -> fallback defaults
  const activeCurrentMinutes =
    propCurrentMinutes ?? sseData?.CONTINUOUS_SITTING_MINS ?? 52;
  const activeLimitMinutes =
    propLimitMinutes ?? sseData?.PENALTY_LIMIT_MINS ?? 60;
  const activeMinsUntilPenalty =
    propMinsUntilNextPenalty ??
    sseData?.ARENA_LEAK_DETECTOR?.MINS_UNTIL_NEXT_PENALTY ??
    8;
  const activePenaltyPoints =
    propPenaltyPoints ??
    sseData?.ARENA_LEAK_DETECTOR?.CURRENT_STREAK_PENALTY_PTS ??
    5.0;
  const isMeetingMute =
    propMeetingMuteActive ??
    sseData?.DAILY_PUSH_CAP?.MEETING_MUTE_ACTIVE ??
    false;
  const activeQuestMessage = propQuestMessage ?? sseData?.QUEST_MESSAGE;

  const handleMute = () => {
    if (onMuteAlerts) {
      onMuteAlerts();
    } else {
      Alert.alert(
        isMeetingMute ? 'Mute Active' : 'Alerts Muted',
        isMeetingMute
          ? 'Meeting mute is currently active for 2 hours.'
          : 'Phone alerts have been muted for 2 hours (In a Meeting).',
        [{ text: 'OK', onPress: onClose }],
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.cardContainer}>
              {/* Terminal / Wireframe HUD Header */}
              <View style={styles.headerRow}>
                <View style={styles.titleWrap}>
                  <Text style={styles.warningIcon}>⚠️</Text>
                  <Text style={styles.headerTitle}>
                    MY QUEST: DESK STAGNATION WARNING
                  </Text>
                </View>
                {isConnected && (
                  <View style={styles.liveBadge}>
                    <View style={styles.liveDot} />
                    <Text style={styles.liveText}>LIVE</Text>
                  </View>
                )}
                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Decorative Border Line */}
              <View style={styles.divider} />

              {/* Center Counter Box (Dynamic Continuous Sitting Duration) */}
              <View style={styles.centerBoxContainer}>
                <View style={styles.centerBox}>
                  <Text style={styles.centerBoxMain}>
                    {activeCurrentMinutes} MINS
                  </Text>
                  <Text style={styles.centerBoxSub}>
                    of {activeLimitMinutes}m limit
                  </Text>
                </View>
              </View>

              {/* Informational Message */}
              <View style={styles.messageBox}>
                {activeQuestMessage ? (
                  <Text style={styles.messageText}>{activeQuestMessage}</Text>
                ) : (
                  <Text style={styles.messageText}>
                    Take a{' '}
                    <Text style={styles.highlightText}>
                      {walkDurationSec}-sec walk (~{pacesCount} paces)
                    </Text>{' '}
                    in the next{' '}
                    <Text style={styles.highlightAmber}>
                      {activeMinsUntilPenalty} mins
                    </Text>{' '}
                    to block a{' '}
                    <Text style={styles.highlightRed}>
                      +{activePenaltyPoints.toFixed(1)} S-DEX penalty!
                    </Text>
                  </Text>
                )}
              </View>

              {/* Action Button: Mute Phone Alerts */}
              <TouchableOpacity
                style={[
                  styles.muteButton,
                  isMeetingMute && styles.muteButtonActive,
                ]}
                activeOpacity={0.8}
                onPress={handleMute}
              >
                <Text
                  style={[
                    styles.muteButtonText,
                    isMeetingMute && styles.muteButtonTextActive,
                  ]}
                >
                  {isMeetingMute
                    ? '[ 🔕 Meeting Mute Active (2 Hrs) ]'
                    : '[ 🔕 Mute Phone Alerts 2 Hrs (In a Meeting) ]'}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#475569',
    paddingHorizontal: 20,
    paddingVertical: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 6,
  },
  warningIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 4,
  },
  liveText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 0.5,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  closeBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
    marginBottom: 18,
  },
  centerBoxContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  centerBox: {
    borderWidth: 1.5,
    borderColor: '#64748B',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
  },
  centerBoxMain: {
    fontSize: 26,
    fontWeight: '900',
    color: '#F8FAFC',
    letterSpacing: 1,
  },
  centerBoxSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 3,
    letterSpacing: 0.3,
  },
  messageBox: {
    marginTop: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  messageText: {
    fontSize: 13.5,
    color: '#CBD5E1',
    lineHeight: 21,
    textAlign: 'center',
    fontWeight: '500',
  },
  highlightText: {
    fontWeight: '700',
    color: '#F8FAFC',
  },
  highlightAmber: {
    fontWeight: '700',
    color: '#FBBF24',
  },
  highlightRed: {
    fontWeight: '700',
    color: '#F87171',
  },
  muteButton: {
    borderWidth: 1.5,
    borderColor: '#64748B',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 13,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muteButtonActive: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  muteButtonText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#F1F5F9',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  muteButtonTextActive: {
    color: '#FBBF24',
  },
});
