import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../navigation/navigationTypes';
import { PhasePlayer, PhaseTrack, TrackSubMetric } from './index';

type LeaderboardDetailsRouteProp = RouteProp<RootStackParamList, 'LeaderboardDetails'>;

const parseSubMetric = (sm: TrackSubMetric) => {
  if (sm.percentageScore !== undefined && sm.avgScore !== undefined) {
    return { percentage: sm.percentageScore, avg: sm.avgScore };
  }
  const val = (sm.value || '').trim();

  // Pattern 1: "89.0% (Avg: 8,900 / 10,000 steps)" or "82.0% (Avg: 17.5 / 21.4 HP)"
  const parenMatch = val.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const rawAvg = parenMatch[2].trim();
    return {
      percentage: parenMatch[1].trim(),
      avg: rawAvg.toLowerCase().startsWith('avg') ? rawAvg : `Avg: ${rawAvg}`,
    };
  }

  // Pattern 2: "21.0 / 100 [LOW HAZARD]"
  const hazardMatch = val.match(/^(.*?)\s*(\[.*?\])$/);
  if (hazardMatch) {
    return {
      percentage: hazardMatch[1].trim(),
      avg: hazardMatch[2].trim(),
    };
  }

  // Pattern 3: "88.0% [⚡ OPTIMAL]"
  const bracketMatch = val.match(/^(.*?)\s*\[(.*?)\]$/);
  if (bracketMatch) {
    return {
      percentage: bracketMatch[1].trim(),
      avg: `[${bracketMatch[2].trim()}]`,
    };
  }

  // Pattern 4: "Cardio: 94% | Muscle: 88.5% | Spine: 91% | Neuro: 85%"
  if (val.includes('|')) {
    return {
      percentage: '',
      avg: val,
    };
  }

  return {
    percentage: val,
    avg: '',
  };
};

export const LeaderboardDetailsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<LeaderboardDetailsRouteProp>();

  const player: PhasePlayer = route.params?.player;
  const phase: number = route.params?.phase || 1;
  const day: number = route.params?.day || 1;

  const tracks: PhaseTrack[] = player?.tracks || [];
  const [selectedTrackId, setSelectedTrackId] = useState<string>(
    tracks[0]?.id || ''
  );

  const currentTrack = tracks.find((t) => t.id === selectedTrackId) || tracks[0];
  const isDanger = player?.isDanger || player?.status === 'IN DANGER';

  if (!player) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No participant details found.</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#070B14" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <Path
              d="M15 19l-7-7 7-7"
              stroke="#38BDF8"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Biometric Matrix Details</Text>
          <Text style={styles.headerSubtitle}>
            Phase {phase} • Day {day} of 21
          </Text>
        </View>
        <View style={styles.headerRightPlaceholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Participant Identity Card */}
        <View
          style={[
            styles.identityCard,
            player.isCurrentUser && styles.identityCardUser,
            isDanger && styles.identityCardDanger,
          ]}
        >
          <View style={styles.identityTopRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarEmoji}>{player.isCurrentUser ? '👤' : '⚡'}</Text>
            </View>
            <View style={styles.identityInfoCol}>
              <View style={styles.nameRow}>
                <Text style={styles.userName} numberOfLines={1}>
                  {player.name}
                </Text>
                {player.isCurrentUser && (
                  <View style={styles.youBadge}>
                    <Text style={styles.youBadgeText}>YOU</Text>
                  </View>
                )}
              </View>
              <Text style={styles.deptText}>{player.department}</Text>
            </View>

            {/* Master Score */}
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>SCORE</Text>
              <Text
                style={[
                  styles.masterScoreText,
                  isDanger && styles.masterScoreDangerText,
                ]}
              >
                {player.scoreDisplay || player.masterScore.toFixed(1)}
              </Text>
            </View>
          </View>

          {/* Status & Matrix Banner */}
          <View style={styles.identityBottomRow}>
            <View
              style={[
                styles.statusPill,
                player.status === 'ACTIVE' && styles.statusPillActive,
                player.status === 'CHAMPION' && styles.statusPillChampion,
                player.status === 'PODIUM' && styles.statusPillPodium,
                isDanger && styles.statusPillDanger,
              ]}
            >
              <Text
                style={[
                  styles.statusPillText,
                  player.status === 'ACTIVE' && styles.statusTextActive,
                  player.status === 'CHAMPION' && styles.statusTextChampion,
                  player.status === 'PODIUM' && styles.statusTextPodium,
                  isDanger && styles.statusTextDanger,
                ]}
              >
                {player.statusLabel || (isDanger ? '🚨 IN DANGER' : player.status)}
              </Text>
            </View>
            <Text style={styles.activeTracksCount}>
              {tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'} Active
            </Text>
          </View>
        </View>

        {/* Breakdown Badges (Phase 2 / Phase 3) */}
        {player.breakdown && (
          <View style={styles.breakdownBadgesRow}>
            {player.breakdown.cmas !== undefined && (
              <View style={styles.breakdownChip}>
                <Text style={styles.breakdownChipLabel}>Cum CMAS</Text>
                <Text style={styles.breakdownChipVal}>
                  {player.breakdown.cmas.toFixed(1)}
                </Text>
              </View>
            )}
            {player.breakdown.bse !== undefined && (
              <View style={styles.breakdownChip}>
                <Text style={styles.breakdownChipLabel}>Cum BSE</Text>
                <Text style={styles.breakdownChipVal}>
                  {player.breakdown.bse.toFixed(1)}%
                </Text>
              </View>
            )}
            {player.breakdown.ffs !== undefined && (
              <View style={styles.breakdownChip}>
                <Text style={styles.breakdownChipLabel}>Cum FFS</Text>
                <Text style={styles.breakdownChipVal}>
                  {player.breakdown.ffs.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Matrix Header Banner */}
        <View style={styles.matrixSectionHeader}>
          <Text style={styles.matrixHeaderTitle}>
            📊 {player.matrixTitle}
          </Text>
        </View>

        {/* Track Selection Tabs */}
        {tracks.length > 1 && (
          <View style={styles.tracksTabBar}>
            {tracks.map((track) => {
              const isTrackSelected = track.id === (currentTrack?.id || '');
              return (
                <TouchableOpacity
                  key={track.id}
                  style={[
                    styles.trackTabBtn,
                    isTrackSelected && styles.trackTabBtnSelected,
                    isDanger && isTrackSelected && styles.trackTabBtnDanger,
                  ]}
                  onPress={() => setSelectedTrackId(track.id)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.trackTabBtnText,
                      isTrackSelected && styles.trackTabBtnTextSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {track.icon} {track.shortName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Track Deep-Dive Card */}
        {currentTrack && (
          <View
            style={[
              styles.trackDetailsCard,
              isDanger && styles.trackDetailsCardDanger,
            ]}
          >
            {/* Track Name Header */}
            <View style={styles.trackCardHeader}>
              <View style={styles.trackCardTitleCol}>
                <Text style={styles.trackCardTitle}>{currentTrack.name}</Text>
              </View>
            </View>

            {/* Sub-Metrics Cards List */}
            <View style={styles.subMetricsContainer}>
              {currentTrack.subMetrics.map((sm, smIdx) => {
                const { percentage, avg } = parseSubMetric(sm);
                return (
                  <View key={smIdx} style={styles.subMetricCard}>
                    {/* Top Row: Title + Weight on left, Percentage Score on right */}
                    <View style={styles.subMetricTopRow}>
                      <View style={styles.subMetricTitleCol}>
                        <Text style={styles.subMetricTitle}>{sm.title}</Text>
                        <Text style={styles.subMetricWeight}>({sm.weight})</Text>
                      </View>
                      {percentage ? (
                        <Text
                          style={[
                            styles.subMetricPercentageScore,
                            (sm.isDanger || isDanger) && styles.subMetricValueDanger,
                          ]}
                        >
                          {percentage}
                        </Text>
                      ) : null}
                    </View>

                    {/* Second Row: Centered Average / Metric Score */}
                    {avg ? (
                      <View style={styles.subMetricCenterRow}>
                        <Text
                          style={[
                            styles.subMetricAvgScore,
                            (sm.isDanger || isDanger) && styles.subMetricValueDanger,
                          ]}
                        >
                          {avg}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </View>

            {/* Clinical Health Inference Box [AHA] */}
            <View
              style={[
                styles.clinicalInferenceCard,
                isDanger && styles.clinicalInferenceCardDanger,
              ]}
            >
              <View style={styles.clinicalHeaderRow}>
                <Text style={styles.clinicalIcon}>🩺</Text>
                <Text style={styles.clinicalTitle}>
                  {currentTrack.clinicalInference.title}
                </Text>
              </View>
              <Text style={styles.clinicalText}>
                "{currentTrack.clinicalInference.text}"
              </Text>
            </View>
          </View>
        )}

        {/* Bottom Back Action Button */}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>Back to Leaderboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#070B14',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0B111E',
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCol: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#38BDF8',
    marginTop: 2,
  },
  headerRightPlaceholder: {
    width: 38,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  identityCard: {
    backgroundColor: '#0E1626',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 14,
  },
  identityCardUser: {
    borderColor: '#06B6D4',
    backgroundColor: '#081729',
  },
  identityCardDanger: {
    borderColor: '#EF4444',
    backgroundColor: '#1F1118',
  },
  identityTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  identityInfoCol: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  youBadge: {
    backgroundColor: '#06B6D4',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  youBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#070B14',
  },
  deptText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  masterScoreText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#10B981',
  },
  masterScoreDangerText: {
    color: '#EF4444',
  },
  identityBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  statusPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusPillChampion: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
  },
  statusPillPodium: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  statusPillDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusTextActive: {
    color: '#10B981',
  },
  statusTextChampion: {
    color: '#EAB308',
  },
  statusTextPodium: {
    color: '#38BDF8',
  },
  statusTextDanger: {
    color: '#EF4444',
  },
  activeTracksCount: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  breakdownBadgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  breakdownChip: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#0E1626',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  breakdownChipLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 2,
  },
  breakdownChipVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38BDF8',
  },
  matrixSectionHeader: {
    marginBottom: 10,
  },
  matrixHeaderTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#06B6D4',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tracksTabBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  trackTabBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#0E1626',
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackTabBtnSelected: {
    backgroundColor: '#0F273E',
    borderColor: '#06B6D4',
  },
  trackTabBtnDanger: {
    borderColor: '#EF4444',
    backgroundColor: '#2A141A',
  },
  trackTabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
  },
  trackTabBtnTextSelected: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  trackDetailsCard: {
    backgroundColor: '#0E1626',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
  },
  trackDetailsCardDanger: {
    borderColor: '#EF4444',
    backgroundColor: '#1B1118',
  },
  trackCardHeader: {
    marginBottom: 12,
  },
  trackCardTitleCol: {
    flex: 1,
  },
  trackCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  trackCardWeight: {
    fontSize: 11,
    color: '#EAB308',
    fontWeight: '600',
    marginTop: 2,
  },
  subMetricsContainer: {
    gap: 8,
    marginBottom: 12,
  },
  subMetricCard: {
    backgroundColor: '#090F1B',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  subMetricTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subMetricTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  subMetricTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subMetricWeight: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  subMetricPercentageScore: {
    fontSize: 14,
    fontWeight: '800',
    color: '#34D399',
    textAlign: 'right',
  },
  subMetricCenterRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  subMetricAvgScore: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  subMetricValueDanger: {
    color: '#EF4444',
  },
  clinicalInferenceCard: {
    marginTop: 4,
    backgroundColor: '#090F1B',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  clinicalInferenceCardDanger: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#20121A',
  },
  clinicalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  clinicalIcon: {
    fontSize: 14,
  },
  clinicalTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#10B981',
    flex: 1,
  },
  clinicalText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  doneButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 8,
  },
  doneButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#38BDF8',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: '#EF4444',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#38BDF8',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
