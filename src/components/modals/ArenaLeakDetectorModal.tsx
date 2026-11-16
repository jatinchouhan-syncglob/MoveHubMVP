import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { useQuestArena } from '../../context/QuestArenaContext';

export interface ArenaLeakDetectorModalProps {
  visible: boolean;
  onClose: () => void;
  currentStreakLeak?: string;
  currentStreakStatus?: string;
  cumulativeToday?: string;
  cumulativeBreaches?: string;
  nextMilestoneMins?: number;
  nextMilestoneInMins?: number;
  wakingWindowStart?: string;
  wakingWindowEnd?: string;
}

export const ArenaLeakDetectorModal: React.FC<ArenaLeakDetectorModalProps> = ({
  visible,
  onClose,
  currentStreakLeak: propCurrentStreakLeak,
  currentStreakStatus: propCurrentStreakStatus,
  cumulativeToday: propCumulativeToday,
  cumulativeBreaches: propCumulativeBreaches,
  nextMilestoneMins: propNextMilestoneMins,
  nextMilestoneInMins: propNextMilestoneInMins,
  wakingWindowStart: propWakingWindowStart,
  wakingWindowEnd: propWakingWindowEnd,
}) => {
  const { data: sseData, isConnected } = useQuestArena();

  // Dynamic values priority: props -> SSE data -> fallback defaults
  const activeCurrentStreakLeak =
    propCurrentStreakLeak ??
    sseData?.ARENA_LEAK_DETECTOR?.CURRENT_STREAK_DISPLAY ??
    (sseData?.ARENA_LEAK_DETECTOR?.CURRENT_STREAK_PENALTY_PTS !== undefined
      ? `${sseData.ARENA_LEAK_DETECTOR.CURRENT_STREAK_PENALTY_PTS > 0 ? '+' : ''}${sseData.ARENA_LEAK_DETECTOR.CURRENT_STREAK_PENALTY_PTS} pts`
      : '+5.0 pts');

  const activeCurrentStreakStatus =
    propCurrentStreakStatus ??
    (sseData?.ARENA_LEAK_DETECTOR?.CURRENT_STREAK_ACTIVE_BLOCK !== undefined
      ? sseData.ARENA_LEAK_DETECTOR.CURRENT_STREAK_ACTIVE_BLOCK
        ? '(Active Block)'
        : '(Normal)'
      : '(Active Block)');

  const activeCumulativeToday =
    propCumulativeToday ??
    sseData?.ARENA_LEAK_DETECTOR?.CUMULATIVE_DAILY_DISPLAY ??
    (sseData?.ARENA_LEAK_DETECTOR?.CUMULATIVE_DAILY_PENALTY_PTS !== undefined
      ? `${sseData.ARENA_LEAK_DETECTOR.CUMULATIVE_DAILY_PENALTY_PTS > 0 ? '+' : ''}${sseData.ARENA_LEAK_DETECTOR.CUMULATIVE_DAILY_PENALTY_PTS} pts`
      : '+15.0 pts');

  const activeCumulativeBreaches =
    propCumulativeBreaches ??
    (sseData?.ARENA_LEAK_DETECTOR?.TOTAL_BREACH_BLOCKS_TODAY !== undefined
      ? `(${sseData.ARENA_LEAK_DETECTOR.TOTAL_BREACH_BLOCKS_TODAY} Breaches Today)`
      : '(3 Breaches Today)');

  const activeNextMilestoneMins =
    propNextMilestoneMins ??
    sseData?.ARENA_LEAK_DETECTOR?.NEXT_PENALTY_AT_MINS ??
    60;

  const activeNextMilestoneInMins =
    propNextMilestoneInMins ??
    sseData?.ARENA_LEAK_DETECTOR?.MINS_UNTIL_NEXT_PENALTY ??
    8;

  const activeWakingStart =
    propWakingWindowStart ??
    sseData?.ARENA_LEAK_DETECTOR?.WAKING_WINDOW_START_DISPLAY ??
    '07:15 AM';

  const activeWakingEnd =
    propWakingWindowEnd ??
    sseData?.ARENA_LEAK_DETECTOR?.WAKING_WINDOW_BEDTIME_DISPLAY ??
    '10:30 PM Bedtime';

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
                  <Text style={styles.shieldIcon}>🛡️</Text>
                  <Text style={styles.headerTitle}>
                    ARENA LEAK DETECTOR (LIVE S-DEX PENALTIES)
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

              {/* 2-Column Stat Cards (Dynamic SSE Values) */}
              <View style={styles.statsRow}>
                {/* Left Card: Current Streak Leak */}
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>CURRENT STREAK LEAK</Text>
                  <Text style={styles.statValue}>{activeCurrentStreakLeak}</Text>
                  <Text style={styles.statSubText}>{activeCurrentStreakStatus}</Text>
                </View>

                {/* Right Card: Cumulative Today */}
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>CUMULATIVE TODAY</Text>
                  <Text style={styles.statValue}>{activeCumulativeToday}</Text>
                  <Text style={styles.statSubText}>{activeCumulativeBreaches}</Text>
                </View>
              </View>

              {/* Bullet Points Information */}
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    Next Penalty Milestone:{' '}
                    <Text style={styles.bulletHighlight}>
                      {activeNextMilestoneMins} mins (in {activeNextMilestoneInMins} mins)
                    </Text>
                  </Text>
                </View>

                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    Waking Window:{' '}
                    <Text style={styles.bulletHighlight}>
                      {activeWakingStart} ➔ {activeWakingEnd}
                    </Text>
                  </Text>
                </View>
              </View>

              {/* Acknowledge / Close Button */}
              <TouchableOpacity
                style={styles.actionButton}
                activeOpacity={0.8}
                onPress={onClose}
              >
                <Text style={styles.actionButtonText}>[ Acknowledge & Close ]</Text>
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
    paddingHorizontal: 16,
  },
  cardContainer: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#475569',
    paddingHorizontal: 18,
    paddingVertical: 20,
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
  shieldIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 12,
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
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  statBox: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#64748B',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#CBD5E1',
    letterSpacing: 0.4,
    textAlign: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#F87171',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  statSubText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  bulletList: {
    paddingHorizontal: 4,
    marginBottom: 18,
    gap: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletDot: {
    fontSize: 14,
    color: '#94A3B8',
    marginRight: 8,
    lineHeight: 20,
  },
  bulletText: {
    fontSize: 12.5,
    color: '#94A3B8',
    lineHeight: 20,
    flex: 1,
  },
  bulletHighlight: {
    fontWeight: '700',
    color: '#F1F5F9',
  },
  actionButton: {
    borderWidth: 1.5,
    borderColor: '#64748B',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F1F5F9',
    letterSpacing: 0.3,
  },
});
