import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { CustomButton } from './CustomButton';
import { CustomHeader } from './CustomHeader';

interface UnderProgressProps {
  title?: string;
  description?: string;
  icon?: string;
  actionTitle?: string;
  onActionPress?: () => void;
  showHeader?: boolean;
  headerTitle?: string;
  showDrawerButton?: boolean;
  showBackButton?: boolean;
}

export const UnderProgress: React.FC<UnderProgressProps> = ({
  title = "Feature Under Development",
  description = "Our engineering team is currently conditioning this section to optimize your wellness journey. Check back soon for advanced insights!",
  icon = "🛠️",
  actionTitle,
  onActionPress,
  showHeader = true,
  headerTitle = "MoveHub",
  showDrawerButton = true,
  showBackButton = false,
}) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Floating Icon Animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2. Loop Shimmer Sweeping bar Animation
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, [floatAnim, shimmerAnim]);

  // Interpolate shimmer sweep translation (assuming track width is 200)
  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 100],
  });

  return (
    <SafeAreaView style={styles.container}>
      {showHeader && (
        <CustomHeader
          title={headerTitle}
          showDrawerButton={showDrawerButton}
          showBackButton={showBackButton}
        />
      )}
      <View style={styles.contentContainer}>
        {/* Background Subtle Gradient Rings */}
        <View style={styles.blurRing1} />
        <View style={styles.blurRing2} />

        <View style={styles.card}>
          {/* Animated Floating Icon Container */}
          <Animated.View
            style={[
              styles.iconWrapper,
              { transform: [{ translateY: floatAnim }] },
            ]}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>{icon}</Text>
            </View>
          </Animated.View>

          {/* Text details */}
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.descText}>{description}</Text>

          {/* Loop Shimmer Progress Bar */}
          <View style={styles.progressTrack}>
            <Animated.View
              style={[
                styles.progressFill,
                { transform: [{ translateX: shimmerTranslateX }] },
              ]}
            />
          </View>

          {/* Optional Action Button */}
          {actionTitle && onActionPress && (
            <CustomButton
              title={actionTitle}
              onPress={onActionPress}
              variant="primary"
              style={styles.actionButton}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    position: 'relative',
  },
  blurRing1: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.primaryLight + '30', // Very soft blur ring
    zIndex: -1,
  },
  blurRing2: {
    position: 'absolute',
    bottom: '20%',
    right: '10%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.secondary + '10', // Soft purple/pink tint blur ring
    zIndex: -1,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    // iOS shadow
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    // Android elevation
    elevation: 8,
  },
  iconWrapper: {
    marginBottom: theme.spacing.lg,
  },
  iconCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    // Glow shadow
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  iconText: {
    fontSize: 38,
  },
  titleText: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  descText: {
    fontSize: theme.fonts.sizes.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing.xl,
  },
  progressTrack: {
    width: 200,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.background,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
  },
  progressFill: {
    width: 100, // half width of track to translate inside it
    height: '100%',
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
  actionButton: {
    width: '100%',
    marginTop: theme.spacing.sm,
  },
});

export default UnderProgress;
