import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { STRINGS } from '../../constants/strings';
import { ROUTES } from '../../constants/routes';
import { CustomButton } from '../../components/common/CustomButton';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import { UserProfile } from '../../types';

export const SplashScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  // Animation Refs
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // 1. Trigger Logo Spring & Fade In Animations
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 30,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Perform Session Check after timer
    const checkSetupState = async () => {
      try {
        const cachedProfile = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
        if (cachedProfile?.isSetupComplete) {
          navigation.replace(ROUTES.DRAWER);
        } else {
          navigation.replace(ROUTES.PROFILE_SETUP);
        }
      } catch (error) {
        console.error('Failed to read profile in splash:', error);
        navigation.replace(ROUTES.PROFILE_SETUP);
      }
    };

    const timer = setTimeout(() => {
      checkSetupState();
    }, 2200); // slightly increased to let the beautiful animation finish playing

    return () => clearTimeout(timer);
  }, [navigation, scaleAnim, opacityAnim, slideUpAnim]);

  const handleSkip = async () => {
    try {
      const cachedProfile = await storageHelper.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE);
      if (cachedProfile?.isSetupComplete) {
        navigation.replace(ROUTES.DRAWER);
      } else {
        navigation.replace(ROUTES.PROFILE_SETUP);
      }
    } catch {
      navigation.replace(ROUTES.PROFILE_SETUP);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Soft Ambient glowing background spots */}
      <View style={styles.glowSpot1} />
      <View style={styles.glowSpot2} />

      <View style={styles.content}>
        {/* Animated scaling logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
          ]}
        >
          <View style={styles.logoCircle}>
            <Text style={styles.logoEmoji}>🏃‍♂️</Text>
          </View>
        </Animated.View>

        {/* Animated slide-up text elements */}
        <Animated.View
          style={{
            transform: [{ translateY: slideUpAnim }],
            opacity: opacityAnim,
            alignItems: 'center',
          }}
        >
          <View style={styles.titleRow}>
            <Text style={styles.title}>MoveHub</Text>
            <View style={styles.mvpBadge}>
              <Text style={styles.mvpText}>MVP</Text>
            </View>
          </View>
          <Text style={styles.tagline}>{STRINGS.SPLASH.TAGLINE}</Text>
        </Animated.View>
      </View>

      {/* Loading indicator text */}
      <Animated.View style={[styles.loadingContainer, { opacity: opacityAnim }]}>
        <Text style={styles.loadingText}>Initializing wellness stack...</Text>
      </Animated.View>
      
      <View style={styles.footer}>
        <CustomButton 
          title="Skip Intro" 
          onPress={handleSkip} 
          variant="text" 
          textStyle={styles.skipText}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: 'relative',
  },
  glowSpot1: {
    position: 'absolute',
    top: '-5%',
    right: '-10%',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: theme.colors.primaryLight + '40',
    zIndex: -1,
  },
  glowSpot2: {
    position: 'absolute',
    bottom: '15%',
    left: '-10%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.secondary + '10',
    zIndex: -1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  logoContainer: {
    marginBottom: theme.spacing.xl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    // Premium drop shadow
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 60,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: 34,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
  },
  mvpBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  mvpText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: theme.fonts.weights.bold as any,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 240,
  },
  loadingContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  loadingText: {
    fontSize: 12,
    color: theme.colors.textLight,
    fontStyle: 'italic',
  },
  footer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  skipText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
});

export default SplashScreen;
