import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Circle } from 'react-native-svg';
import { theme } from '../../theme';
import { ROUTES } from '../../constants/routes';

export const DemoWearableSyncScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {
    activityName = 'Workout Session',
    baseMet = 4.5,
    cardio = 80,
    strength = 10,
    balance = 5,
    recovery = 5,
  } = route.params || {};

  const [syncStep, setSyncStep] = useState<'connecting' | 'syncing' | 'completed'>('connecting');

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Pulsing heart icon animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.25,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // 2. Spinning loading ring animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Sync flow timing
    const connectingTimer = setTimeout(() => {
      setSyncStep('syncing');
    }, 1800);

    const completionTimer = setTimeout(() => {
      setSyncStep('completed');
      // Scale up success checkmark
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }, 4500);

    return () => {
      clearTimeout(connectingTimer);
      clearTimeout(completionTimer);
    };
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleCommit = () => {
    Alert.alert(
      'Telemetry Committed',
      `${activityName} details have been written directly to PostgreSQL Ledger via Kafka consumer.`,
      [
        {
          text: 'Awesome!',
          onPress: () =>
            navigation.navigate(ROUTES.DEMO_POST_WORKOUT_SUMMARY, {
              activityName,
              baseMet,
              cardio,
              strength,
              balance,
              recovery,
              duration: 35, // Mocked 35 mins active logged from wearable telemetry
              showBenefitsNext: true,
            }),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Smartwatch Telemetry</Text>
      </View>

      {/* Sync Body */}
      <View style={styles.body}>
        <Text style={styles.activityTitle}>{activityName}</Text>
        
        {syncStep !== 'completed' ? (
          <Text style={styles.syncStatus}>
            {syncStep === 'connecting' ? 'Establishing secure link to Apple Watch...' : 'Extracting sensor telemetry payload...'}
          </Text>
        ) : (
          <Text style={styles.syncStatusSuccess}>
            Telemetry extracted successfully!
          </Text>
        )}

        {/* Animated circle container */}
        <View style={styles.animationContainer}>
          {syncStep !== 'completed' ? (
            <Animated.View style={[styles.ringContainer, { transform: [{ rotate: spin }] }]}>
              <Svg width={180} height={180} viewBox="0 0 180 180">
                <Circle
                  cx={90}
                  cy={90}
                  r={70}
                  stroke="#1E293B"
                  strokeWidth={8}
                  fill="transparent"
                />
                <Circle
                  cx={90}
                  cy={90}
                  r={70}
                  stroke="#3B82F6"
                  strokeWidth={8}
                  fill="transparent"
                  strokeDasharray="440"
                  strokeDashoffset="150"
                  strokeLinecap="round"
                />
              </Svg>
            </Animated.View>
          ) : (
            <Animated.View style={[styles.successCircle, { transform: [{ scale: scaleAnim }] }]}>
              <Text style={styles.successCheck}>✓</Text>
            </Animated.View>
          )}

          {/* Heart Beat Emoji center */}
          <Animated.View style={[styles.centerHeart, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.heartText}>{syncStep === 'completed' ? '💯' : '❤️'}</Text>
          </Animated.View>
        </View>

        {/* Metrics Grid */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>HEART RATE</Text>
            <Text style={styles.metricVal}>{syncStep === 'completed' ? '138 BPM' : 'Measuring...'}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>DURATION</Text>
            <Text style={styles.metricVal}>{syncStep === 'completed' ? '32 Mins' : 'Tracking...'}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>CALORIES</Text>
            <Text style={styles.metricVal}>{syncStep === 'completed' ? '280 Kcal' : 'Syncing...'}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>DEVICE</Text>
            <Text style={styles.metricVal}>Apple Watch v9</Text>
          </View>
        </View>
      </View>

      {/* Button Commit */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.commitButton, syncStep !== 'completed' && styles.commitButtonDisabled]}
          disabled={syncStep !== 'completed'}
          onPress={handleCommit}
          activeOpacity={0.9}
        >
          <Text style={styles.commitButtonText}>
            {syncStep === 'completed' ? 'COMMIT TELEMETRY TO LEDGER' : 'SYNCING IN PROGRESS...'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  body: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
  },
  activityTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 8,
  },
  syncStatus: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 36,
  },
  syncStatusSuccess: {
    fontSize: 15,
    fontWeight: '700',
    color: '#10B981',
    textAlign: 'center',
    marginBottom: 36,
  },
  animationContainer: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 36,
  },
  ringContainer: {
    position: 'absolute',
    width: 180,
    height: 180,
  },
  successCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
    borderWidth: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successCheck: {
    fontSize: 70,
    color: '#10B981',
    fontWeight: '800',
  },
  centerHeart: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  heartText: {
    fontSize: 36,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  metricCard: {
    width: '45%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  commitButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commitButtonDisabled: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  commitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default DemoWearableSyncScreen;
