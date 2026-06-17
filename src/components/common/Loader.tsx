import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { theme } from '../../theme';
import { STRINGS } from '../../constants/strings';

interface LoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export const Loader: React.FC<LoaderProps> = ({
  message = STRINGS.COMMON.LOADING,
  fullScreen = false,
}) => {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && <Text style={styles.text}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  text: {
    marginTop: theme.spacing.md,
    fontSize: theme.fonts.sizes.base,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weights.medium as any,
  },
});

export default Loader;
