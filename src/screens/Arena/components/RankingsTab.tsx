import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { apiService } from '../../../services/api';
import {
  IChallengeLeaderboardResponse,
  IChallengeLiveFeedItem,
  IChallengeMyRankSummary,
} from '../../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Trend SVG Icons matching the graphic design
const TrendUpSvg = ({ color = '#10B981' }: { color?: string }) => (
  <Svg width="18" height="14" viewBox="0 0 24 16" fill="none">
    <Path
      d="M2 13L8 7L13 11L21 2M21 2H15M21 2V8"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TrendDownSvg = ({ color = '#EC4899' }: { color?: string }) => (
  <Svg width="18" height="14" viewBox="0 0 24 16" fill="none">
    <Path
      d="M2 3L8 9L13 5L21 14M21 14H15M21 14V8"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TrendStableSvg = ({ color = '#64748B' }: { color?: string }) => (
  <Svg width="18" height="14" viewBox="0 0 24 16" fill="none">
    <Path
      d="M3 8H21M21 8L16 4M21 8L16 12"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export interface RankingsTabProps {
  refreshTrigger?: number;
}

export const RankingsTab: React.FC<RankingsTabProps> = ({ refreshTrigger = 0 }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<IChallengeLeaderboardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setError(null);
      const res = await apiService.getChallengeLeaderboard({
        category: 'gym',
        stage: 1,
        page: 1,
        limit: 10,
      });
      setData(res);
    } catch (err: any) {
      console.warn('[RankingsTab] Failed to fetch leaderboard:', err?.message || err);
      setError(err?.message || 'Failed to load live rankings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard();
  }, [fetchLeaderboard, refreshTrigger]);

  const liveFeed = data?.liveFeed || [];
  const myRankSummary = data?.myRankSummary;

  // Find user item in live feed to get dynamic delta or fallback
  const userFeedItem = liveFeed.find(item => item.isUser || item.name.toUpperCase() === 'YOU');
  const deltaText = userFeedItem?.delta || '+7';
  const isNegativeDelta = deltaText.startsWith('-');
  const numericDelta = deltaText.replace(/^[+-]/, '');
  const displayScore = myRankSummary?.score ?? userFeedItem?.score ?? 886;
  const displayRank = myRankSummary?.rankDisplay ?? `#${String(myRankSummary?.rank || 47).padStart(3, '0')}`;

  return (
    <View style={styles.container}>
      {/* ================= HEADER SECTION ================= */}
      <View style={styles.headerSection}>
        {/* Eyebrow */}
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowBar} />
          <Text style={styles.eyebrowText}>COMPETITION & RANKING</Text>
        </View>

        {/* Main Title */}
        <Text style={styles.mainTitleWhite}>EVERY MOVE</Text>
        <Text style={styles.mainTitleGradient}>SHIFTS THE FIELD.</Text>

        {/* Subtitle */}
        <Text style={styles.subtitleText}>
          Your score changes. Your rank changes. The field never stops moving.
        </Text>
      </View>

      {/* Loading State */}
      {loading && !data ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Fetching live rankings feed...</Text>
        </View>
      ) : error && !data ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>Failed to Load Rankings</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={fetchLeaderboard}
          >
            <Text style={styles.retryBtnText}>Retry ⟳</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* ================= CARD 1: YOUR RANK CARD ================= */}
          <View style={styles.yourRankCard}>
            <View style={styles.yourRankTopRow}>
              <Text style={styles.yourRankLabel}>YOUR RANK</Text>
              {myRankSummary?.cutoffStatus && (
                <View style={styles.cutoffStatusBadge}>
                  <Text style={styles.cutoffStatusText}>
                    {myRankSummary.cutoffStatus.replace('_', ' ')}
                  </Text>
                </View>
              )}
            </View>

            {/* Giant Rank Number */}
            <Text style={styles.yourRankValue}>{displayRank}</Text>

            {/* Bottom Metrics Bar */}
            <View style={styles.yourRankBottomRow}>
              <View style={styles.scoreGroup}>
                <Text style={styles.scoreNum}>{displayScore}</Text>
                <Text style={styles.scoreUnit}>SCORE</Text>
              </View>

              <View style={styles.deltaGroup}>
                <Text style={[styles.deltaArrow, isNegativeDelta && { color: '#EC4899' }]}>
                  {isNegativeDelta ? '↘' : '↗'}
                </Text>
                <Text style={[styles.deltaValue, isNegativeDelta && { color: '#EC4899' }]}>
                  {numericDelta} PLACES
                </Text>
              </View>
            </View>
          </View>

          {/* ================= CARD 2: FIELD IN MOTION CARD ================= */}
          <View style={styles.motionCardWrapper}>
            {/* 3D Offset Background Shadow */}
            <View style={styles.motionCardBackdrop} />

            {/* Main Card */}
            <View style={styles.motionCard}>
              {/* Card Header */}
              <View style={styles.motionCardHeader}>
                <View style={styles.motionTitleLeft}>
                  <View style={styles.greenPulseDot} />
                  <Text style={styles.motionTitleText}>FIELD IN MOTION</Text>
                </View>
                <View style={styles.previewTagRow}>
                  <Text style={styles.motionPreviewTag}>ILLUSTRATIVE</Text>
                  <View style={styles.previewTagGap} />
                  <Text style={styles.motionPreviewTag}>PREVIEW</Text>
                </View>
              </View>

              {/* Leaderboard Rows */}
              <View style={styles.feedRowsContainer}>
                {liveFeed.map((item: IChallengeLiveFeedItem) => {
                  const isUser = !!item.isUser || item.name.toUpperCase() === 'YOU';
                  const isUp = item.trend === 'UP';
                  const isDown = item.trend === 'DOWN';
                  const rankString = `#${String(item.rank).padStart(2, '0')}`;

                  return (
                    <View
                      key={`rank-${item.rank}-${item.name}`}
                      style={[
                        styles.feedRow,
                        isUser && styles.feedRowUser,
                      ]}
                    >
                      {/* Left Amber Accent Bar for User */}
                      {isUser && <View style={styles.userAccentBar} />}

                      {/* Rank Number */}
                      <Text
                        style={[
                          styles.feedRankText,
                          isUser && styles.feedRankTextUser,
                        ]}
                      >
                        {rankString}
                      </Text>

                      {/* Athlete Name */}
                      <Text
                        style={[
                          styles.feedNameText,
                          isUser && styles.feedNameTextUser,
                        ]}
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>

                      {/* Trend Icon */}
                      <View style={styles.feedTrendContainer}>
                        {isUp ? (
                          <TrendUpSvg color="#10B981" />
                        ) : isDown ? (
                          <TrendDownSvg color="#EC4899" />
                        ) : (
                          <TrendStableSvg color="#64748B" />
                        )}
                      </View>

                      {/* Score */}
                      <Text
                        style={[
                          styles.feedScoreText,
                          isUser && styles.feedScoreTextUser,
                        ]}
                      >
                        {item.score}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Card Footer */}
              <View style={styles.motionCardFooter}>
                <Text style={styles.footerNoteText}>
                  Preview only — not live standings.
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: '#080A0F',
  },

  // Header Section
  headerSection: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  eyebrowBar: {
    width: 3,
    height: 13,
    backgroundColor: '#F59E0B',
    borderRadius: 2,
    marginRight: 8,
  },
  eyebrowText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  mainTitleWhite: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  mainTitleGradient: {
    color: '#A855F7', // Electric Violet matching the gradient
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: 8,
  },
  subtitleText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
    marginBottom: 16,
  },

  // Card 1: YOUR RANK
  yourRankCard: {
    backgroundColor: '#0B0F17',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D97706', // Rich amber border
    padding: 20,
    marginBottom: 20,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  yourRankTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  yourRankLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  cutoffStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  cutoffStatusText: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  yourRankValue: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 16,
  },
  yourRankBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  scoreGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  scoreNum: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  scoreUnit: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  deltaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deltaArrow: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '900',
  },
  deltaValue: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  // Card 2: FIELD IN MOTION (3D Layered Card)
  motionCardWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  motionCardBackdrop: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: '#1E3A8A', // Deep blue offset layer from image
    borderRadius: 16,
    zIndex: 0,
  },
  motionCard: {
    backgroundColor: '#0D1527',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    zIndex: 1,
  },
  motionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0E172B',
  },
  motionTitleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  motionTitleText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  previewTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewTagGap: {
    width: 8,
  },
  motionPreviewTag: {
    color: '#64748B',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Feed Rows
  feedRowsContainer: {
    backgroundColor: '#0D1527',
  },
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A2338',
    position: 'relative',
  },
  feedRowUser: {
    backgroundColor: 'rgba(245, 158, 11, 0.08)', // Golden highlighted row from image
  },
  userAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#F59E0B', // Amber vertical bar
  },
  feedRankText: {
    width: 48,
    color: '#64748B',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  feedRankTextUser: {
    color: '#F59E0B',
    fontWeight: '900',
  },
  feedNameText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  feedNameTextUser: {
    color: '#F59E0B',
    fontWeight: '900',
  },
  feedTrendContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedScoreText: {
    width: 60,
    textAlign: 'right',
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  feedScoreTextUser: {
    color: '#F59E0B',
  },

  // Footer
  motionCardFooter: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#0B1120',
  },
  footerNoteText: {
    color: '#64748B',
    fontSize: 11,
    fontStyle: 'italic',
    fontWeight: '500',
  },

  // Loading & Error States
  loadingBox: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  errorBox: {
    padding: 24,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    marginVertical: 20,
  },
  errorIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  errorTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  errorSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 14,
  },
  retryBtn: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
