import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { Insight } from '../../types';

interface InsightCardProps {
  insight: Insight;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const getThemeConfig = () => {
    switch (insight.type) {
      case 'success':
        return {
          icon: '✅',
          border: theme.colors.success,
          bg: theme.colors.successLight,
          color: theme.colors.success,
        };
      case 'warning':
        return {
          icon: '⚠️',
          border: theme.colors.warning,
          bg: theme.colors.warningLight,
          color: theme.colors.warning,
        };
      case 'info':
      default:
        return {
          icon: '💡',
          border: theme.colors.primary,
          bg: theme.colors.primaryLight,
          color: theme.colors.primary,
        };
    }
  };

  const styleConfig = getThemeConfig();

  const getCategoryEmoji = (category: string): string => {
    switch (category.toLowerCase()) {
      case 'fitness': return '🏃';
      case 'nutrition': return '🥗';
      case 'wellness': return '🧘';
      default: return '🛡️';
    }
  };

  const getCategoryBadgeStyles = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fitness':
        return { bg: '#FEF2F2', border: '#FEE2E2', text: '#EF4444' };
      case 'nutrition':
        return { bg: '#F0FDF4', border: '#DCFCE7', text: '#16A34A' };
      case 'wellness':
        return { bg: '#F0FDFA', border: '#CCFBF1', text: '#0D9488' };
      default:
        return { bg: '#F8FAFC', border: '#E2E8F0', text: '#64748B' };
    }
  };

  const badgeColors = getCategoryBadgeStyles(insight.category);

  return (
    <View style={[styles.card, { borderLeftColor: styleConfig.border }]}>
      <View style={styles.header}>
        <View style={[
          styles.badgeContainer,
          { backgroundColor: badgeColors.bg, borderColor: badgeColors.border }
        ]}>
          <Text style={[styles.badgeText, { color: badgeColors.text }]}>
            {getCategoryEmoji(insight.category)} {insight.category.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.typeIcon}>{styleConfig.icon}</Text>
      </View>

      <Text style={styles.title}>{insight.title}</Text>
      <Text style={styles.description}>{insight.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderLeftWidth: 4,
    // Soft card shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  badgeContainer: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800' as any,
  },
  typeIcon: {
    fontSize: 16,
  },
  title: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.fonts.sizes.base,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

export default InsightCard;
