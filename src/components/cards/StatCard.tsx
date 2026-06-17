import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: string;
  progress?: number;
  progressColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  unit,
  icon,
  progress,
  progressColor = theme.colors.primary,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        {icon && <Text style={styles.icon}>{icon}</Text>}
      </View>
      
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  width: `${Math.min(progress * 100, 100)}%`,
                  backgroundColor: progressColor,
                }
              ]} 
            />
          </View>
          <Text style={styles.percentageText}>{Math.round(progress * 100)}% of goal</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.cardPadding,
    margin: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: theme.fonts.weights.semibold as any,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  icon: {
    fontSize: 18,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.md,
  },
  value: {
    fontSize: theme.fonts.sizes.xxl,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
  },
  unit: {
    fontSize: theme.fonts.sizes.xs,
    fontWeight: theme.fonts.weights.semibold as any,
    color: theme.colors.textLight,
    marginLeft: theme.spacing.xs,
  },
  progressContainer: {
    marginTop: 'auto',
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.border,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  percentageText: {
    fontSize: theme.fonts.sizes.xs,
    color: theme.colors.textSecondary,
  },
});

export default StatCard;
