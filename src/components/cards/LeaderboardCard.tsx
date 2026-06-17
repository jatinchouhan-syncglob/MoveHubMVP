import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { theme } from '../../theme';
import { LeaderboardEntry } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({ entry }) => {
  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1: return { emoji: '🥇', style: styles.rankGold };
      case 2: return { emoji: '🥈', style: styles.rankSilver };
      case 3: return { emoji: '🥉', style: styles.rankBronze };
      default: return null;
    }
  };

  const rankBadge = getRankBadge(entry.rank);

  return (
    <View style={[styles.card, entry.isCurrentUser && styles.currentUserCard]}>
      <View style={styles.rankContainer}>
        {rankBadge ? (
          <Text style={styles.rankBadgeText}>{rankBadge.emoji}</Text>
        ) : (
          <Text style={styles.rankNumber}>{entry.rank}</Text>
        )}
      </View>
      
      {entry.avatarUrl ? (
        <Image source={{ uri: entry.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarInitials}>
            {entry.name.substring(0, 2).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.nameContainer}>
        <Text 
          numberOfLines={1} 
          style={[styles.name, entry.isCurrentUser && styles.currentUserName]}
        >
          {entry.name} {entry.isCurrentUser && '(You)'}
        </Text>
      </View>

      <View style={styles.pointsContainer}>
        <Text style={styles.points}>{formatNumber(entry.points)}</Text>
        <Text style={styles.pointsUnit}> pts</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.cardBg,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.spacing.borderRadiusMd,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  currentUserCard: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  rankContainer: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: {
    fontSize: 20,
  },
  rankNumber: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.textSecondary,
  },
  rankGold: {},
  rankSilver: {},
  rankBronze: {},
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.border,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.textOnPrimary,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontSize: theme.fonts.sizes.base,
    color: theme.colors.text,
    fontWeight: theme.fonts.weights.medium as any,
  },
  currentUserName: {
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  points: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.primary,
  },
  pointsUnit: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
  },
});

export default LeaderboardCard;
