import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';
import { ISegmentConfig } from '../types';

interface SegmentStandingsCardProps {
  config: ISegmentConfig;
}

export const SegmentStandingsCard: React.FC<SegmentStandingsCardProps> = ({
  config,
}) => {
  const standings = config.standings;

  return (
    <View
      style={[
        styles.standingsCard,
        {
          backgroundColor: config.theme.cardBg,
          borderColor: config.theme.mutedBorders,
        },
      ]}
    >
      <View style={styles.standingsTitleRow}>
        <Text
          style={[styles.standingsTitleText, { color: config.theme.coreAccent }]}
        >
          {standings.title}
        </Text>
      </View>

      {/* 1. Team vs Team Bracket Standings (Colleges, Residential Towers, Friends/Family) */}
      {standings.team1 && standings.team2 && (
        <View style={styles.teamsContainer}>
          {/* Team 1 */}
          <View style={styles.teamRow}>
            <View style={styles.teamInfoRow}>
              <Text
                style={[styles.teamNameText, { color: config.theme.textPrimary }]}
              >
                🏁 {standings.team1.name}
              </Text>
              <Text
                style={[
                  styles.teamPointsText,
                  { color: config.theme.coreAccent },
                ]}
              >
                {standings.team1.points}
              </Text>
            </View>
            <View
              style={[
                styles.progressBarTrack,
                { backgroundColor: config.theme.mutedBorders },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${standings.team1.progressPercent}%`,
                    backgroundColor: standings.team1.barColor,
                  },
                ]}
              />
            </View>
          </View>

          {/* Team 2 */}
          <View style={styles.teamRow}>
            <View style={styles.teamInfoRow}>
              <Text
                style={[styles.teamNameText, { color: config.theme.textPrimary }]}
              >
                ⚔️ {standings.team2.name}
              </Text>
              <Text
                style={[
                  styles.teamPointsText,
                  { color: config.theme.secondaryAura || config.theme.coreAccent },
                ]}
              >
                {standings.team2.points}
              </Text>
            </View>
            <View
              style={[
                styles.progressBarTrack,
                { backgroundColor: config.theme.mutedBorders },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${standings.team2.progressPercent}%`,
                    backgroundColor: standings.team2.barColor,
                  },
                ]}
              />
            </View>
          </View>
        </View>
      )}

      {/* 2. Clinical Biomarker Intersection (Healthcare Facilities) */}
      {standings.biomarkerIntersection && (
        <View style={styles.biomarkerCard}>
          <View style={styles.biomarkerRow}>
            <Text
              style={[
                styles.biomarkerLabel,
                { color: config.theme.textSecondary },
              ]}
            >
              🩸 {standings.biomarkerIntersection.gatewayLabel}
            </Text>
          </View>
          <View style={styles.biomarkerRow}>
            <Text
              style={[styles.biomarkerValue, { color: config.theme.textPrimary }]}
            >
              {standings.biomarkerIntersection.trendLabel}
            </Text>
            <View
              style={[
                styles.biomarkerTrendBadge,
                {
                  backgroundColor: config.theme.badgeBg,
                  borderColor: config.theme.coreAccent,
                },
              ]}
            >
              <Text
                style={[
                  styles.historyItemStatusText,
                  { color: config.theme.coreAccent },
                ]}
              >
                {standings.biomarkerIntersection.trendValue}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* 3. Retail Voucher Reward (Health Retail Outlets) */}
      {standings.rewardPill && (
        <View
          style={[
            styles.rewardPillBox,
            {
              backgroundColor: config.theme.badgeBg,
              borderColor: config.theme.coreAccent,
            },
          ]}
        >
          <Text
            style={[styles.rewardPillText, { color: config.theme.textPrimary }]}
          >
            🎁 {standings.rewardPill.text}
          </Text>
        </View>
      )}

      {/* 4. History Items List (Gym & Mass Professionals) */}
      {standings.historyItems && (
        <View style={styles.historyItemsList}>
          {standings.historyItems.map((item, idx) => (
            <View key={`hist-${idx}`} style={styles.historyItemRow}>
              <View>
                <Text
                  style={[
                    styles.historyItemLabel,
                    { color: config.theme.textPrimary },
                  ]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.historyItemDetail,
                    { color: config.theme.textSecondary },
                  ]}
                >
                  {item.detail}
                </Text>
              </View>
              <View
                style={[
                  styles.historyItemStatusBadge,
                  {
                    backgroundColor: config.theme.badgeBg,
                    borderColor: config.theme.mutedBorders,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.historyItemStatusText,
                    { color: config.theme.coreAccent },
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Footer Context Note */}
      {standings.bannerStatusText ? (
        <Text
          style={[
            styles.standingsFooterNote,
            { color: config.theme.textSecondary },
          ]}
        >
          💡 {standings.bannerStatusText}
        </Text>
      ) : null}
    </View>
  );
};
