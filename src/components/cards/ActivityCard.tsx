import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { Activity } from '../../types';
import { formatFriendlyDate, formatDuration } from '../../utils/formatters';
import { WELLNESS_ACTIVITIES_REGISTRY } from '../../constants/activityTypes';

interface ActivityCardProps {
  activity: Activity;
  isDark?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, isDark = false }) => {
  const getActivityEmoji = (type: string): string => {
    const found = WELLNESS_ACTIVITIES_REGISTRY.find(
      (act) => act.name.toLowerCase() === type.toLowerCase()
    );
    return found ? found.emoji : '💪';
  };

  const getActivityColor = (type: string): string => {
    const found = WELLNESS_ACTIVITIES_REGISTRY.find(
      (act) => act.name.toLowerCase() === type.toLowerCase()
    );
    return found ? found.color : theme.colors.primary;
  };

  const activeColor = getActivityColor(activity.type);

  return (
    <View style={[styles.card, isDark && { backgroundColor: '#151E33', borderColor: '#1E293B', shadowColor: '#000' }]}>
      {/* Decorative vertical accent bar matching workout intensity color */}
      <View style={[styles.accentLine, { backgroundColor: activeColor }]} />

      <View style={[styles.iconContainer, { backgroundColor: activeColor + '15' }]}>
        <Text style={styles.emoji}>{getActivityEmoji(activity.type)}</Text>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.row}>
          <Text style={[styles.type, isDark && { color: '#FFFFFF' }]}>{activity.type}</Text>
          <Text style={[styles.value, { color: activeColor }]}>
            {activity.value.toLocaleString()} {activity.metric}
          </Text>
        </View>
        
        <View style={styles.row}>
          <Text style={[styles.time, isDark && { color: '#94A3B8' }]}>{formatFriendlyDate(activity.timestamp)}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.metaText, isDark && { color: '#94A3B8' }]}>{formatDuration(activity.durationMinutes)}</Text>
            <Text style={[styles.dot, isDark && { color: '#64748B' }]}>•</Text>
            <Text style={[styles.metaText, isDark && { color: '#94A3B8' }]}>{activity.caloriesBurned} kcal</Text>
          </View>
        </View>

        {activity.notes && (
          <Text numberOfLines={2} style={[styles.notes, isDark && { color: '#94A3B8', borderTopColor: '#1E293B' }]}>
            "{activity.notes}"
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.spacing.borderRadiusLg, // elevated to rounded borders
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    // iOS shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    marginLeft: 4, // spacing from accent line
  },
  emoji: {
    fontSize: 24,
  },
  contentContainer: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  type: {
    fontSize: 15,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
  },
  value: {
    fontSize: 15,
    fontWeight: theme.fonts.weights.bold as any,
  },
  time: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12.5,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weights.medium as any,
  },
  dot: {
    marginHorizontal: theme.spacing.xs,
    color: theme.colors.textLight,
  },
  notes: {
    fontSize: 12.5,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border,
  },
});

export default ActivityCard;
