import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { theme } from '../../theme';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const getButtonStyles = (): StyleProp<ViewStyle> => {
    const base: ViewStyle = styles.button;
    if (disabled) {
      return [base, styles.disabledButton, style];
    }
    switch (variant) {
      case 'secondary':
        return [base, styles.secondaryButton, style];
      case 'outline':
        return [base, styles.outlineButton, style];
      case 'text':
        return [base, styles.textButton, style];
      case 'primary':
      default:
        return [base, styles.primaryButton, style];
    }
  };

  const getTextStyles = (): StyleProp<TextStyle> => {
    const base: TextStyle = styles.text;
    if (disabled) {
      return [base, styles.disabledText, textStyle];
    }
    switch (variant) {
      case 'secondary':
        return [base, styles.secondaryText, textStyle];
      case 'outline':
        return [base, styles.outlineText, textStyle];
      case 'text':
        return [base, styles.textText, textStyle];
      case 'primary':
      default:
        return [base, styles.primaryText, textStyle];
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.75}
      style={getButtonStyles()}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'text' ? theme.colors.primary : theme.colors.textOnPrimary}
        />
      ) : (
        <Text style={getTextStyles()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: theme.spacing.borderRadiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: theme.colors.primary,
  },
  secondaryButton: {
    backgroundColor: theme.colors.secondary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  textButton: {
    backgroundColor: 'transparent',
    height: 'auto',
    paddingHorizontal: 0,
  },
  disabledButton: {
    backgroundColor: theme.colors.border,
  },
  text: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: theme.fonts.weights.semibold as any,
  },
  primaryText: {
    color: theme.colors.textOnPrimary,
  },
  secondaryText: {
    color: theme.colors.textOnPrimary,
  },
  outlineText: {
    color: theme.colors.primary,
  },
  textText: {
    color: theme.colors.primary,
  },
  disabledText: {
    color: theme.colors.textLight,
  },
});
export default CustomButton;
