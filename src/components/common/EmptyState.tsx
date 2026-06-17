import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../theme';
import { CustomButton } from './CustomButton';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  actionTitle?: string;
  onActionPress?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = '📭',
  actionTitle,
  onActionPress,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionTitle && onActionPress && (
        <CustomButton
          title={actionTitle}
          onPress={onActionPress}
          variant="outline"
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xxl,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadiusLg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    margin: theme.spacing.md,
  },
  icon: {
    fontSize: 48,
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.fonts.sizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  button: {
    paddingHorizontal: theme.spacing.xl,
  },
});

export default EmptyState;
