import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Animated,
  Alert,
  PanResponder,
} from 'react-native';
import { pushToPythonWriteEngine } from '../../services/WriteApiService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Svg, { Circle, G, Path } from 'react-native-svg';
import { theme } from '../../theme';
import { ROUTES } from '../../constants/routes';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const ITEM_HEIGHT = 60;
const MINUTES_LIST = Array.from({ length: 90 }, (_, i) => i + 1);
const PICKER_DATA = ['', ...MINUTES_LIST, ''];

export const DemoWorkoutLogScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const {
    activityCode = '03042',
    activityName = 'Zumba Gold',
    category = 'Low-Impact Cardio',
    baseMet = 4.5,
    cardio = 80,
    strength = 10,
    balance = 5,
    recovery = 5,
  } = route.params || {};

  const [selectedValue, setSelectedValue] = useState(30);
  const [rpe, setRpe] = useState(5);
  const trackRef = useRef<View>(null);
  const trackLeftOffset = useRef(0);
  const trackWidth = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        trackRef.current?.measure((x, y, width, height, pageXOffset) => {
          if (width > 0) {
            trackLeftOffset.current = pageXOffset;
            trackWidth.current = width;
            const relativeX = evt.nativeEvent.pageX - pageXOffset;
            let pct = relativeX / width;
            pct = Math.max(0, Math.min(1, pct));
            const val = Math.round(pct * 9) + 1; // 1 to 10
            setRpe(val);
          }
        });
      },
      onPanResponderMove: (evt, gestureState) => {
        if (trackWidth.current > 0) {
          const relativeX = gestureState.moveX - trackLeftOffset.current;
          let pct = relativeX / trackWidth.current;
          pct = Math.max(0, Math.min(1, pct));
          const val = Math.round(pct * 9) + 1; // 1 to 10
          setRpe(val);
        }
      },
    })
  ).current;

  const getRpeDescription = (val: number) => {
    if (val <= 2) return 'Easy / Rest';
    if (val <= 4) return 'Moderate Effort';
    if (val <= 6) return 'Hard / Challenging';
    if (val <= 8) return 'Very Hard';
    return 'Max Effort / Peak';
  };
  const flatListRef = useRef<FlatList>(null);

  // SVG Animation values
  const animValue = useRef(new Animated.Value(0)).current;

  // Sync animation on mount
  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, []);

  // Radius = 45, Circumference = 2 * Math.PI * 45 ≈ 282.74
  const radius = 45;
  const circumference = 2 * Math.PI * radius;

  // Segment allocations dynamically computed
  const pCardio = cardio / 100;
  const pStrength = strength / 100;
  const pBalance = balance / 100;
  const pRecovery = recovery / 100;

  const segments = {
    cardio: { percentage: pCardio, color: '#EF4444', label: `Cardio (${cardio}%)`, rotation: -90 },
    strength: { percentage: pStrength, color: '#EAB308', label: `Strength (${strength}%)`, rotation: -90 + (360 * pCardio) },
    balance: { percentage: pBalance, color: '#3B82F6', label: `Balance (${balance}%)`, rotation: -90 + (360 * (pCardio + pStrength)) },
    recovery: { percentage: pRecovery, color: '#94A3B8', label: `Recovery (${recovery}%)`, rotation: -90 + (360 * (pCardio + pStrength + pBalance)) },
  };

  const getInterpolatedOffset = (percentage: number) => {
    const targetOffset = circumference - (circumference * percentage);
    return animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [circumference, targetOffset],
    });
  };

  const handleScroll = (event: any) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const index = Math.round(yOffset / ITEM_HEIGHT);
    const value = MINUTES_LIST[index];
    if (value !== undefined) {
      setSelectedValue(value);
    }
  };

  const handleCommit = async () => {
    // Simulate transaction commit to secure Python WRITE pipeline
    const success = await pushToPythonWriteEngine(activityCode, selectedValue, rpe);
    
    if (success) {
      Alert.alert(
        'Workout Committed',
        `Your ${activityName} session of ${selectedValue} minutes (RPE: ${rpe}) has been logged successfully to the ledger!`,
        [
          {
            text: 'Great!',
            onPress: () =>
              navigation.navigate(ROUTES.DEMO_POST_WORKOUT_SUMMARY, {
                activityName,
                baseMet,
                cardio,
                strength,
                balance,
                recovery,
                duration: selectedValue,
              }),
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>‹ Log Workout</Text>
        </TouchableOpacity>
      </View>

      {/* Title block */}
      <View style={styles.titleContainer}>
        <View style={{ flex: 1, marginRight: 16 }}>
          <Text style={styles.titleText} numberOfLines={2}>{activityName}</Text>
        </View>
        {/* Zumba badge icon exactly like screenshot */}
        <View style={styles.zumbaBadge}>
          <View style={styles.zumbaBadgeInner}>
            <Text style={styles.zumbaBadgeText} numberOfLines={1} adjustsFontSizeToFit>
              {activityName.toLowerCase().includes('zumba') ? 'ZUMBA' : 'FIT'}
            </Text>
            <Text style={styles.zumbaBadgeSub} numberOfLines={1} adjustsFontSizeToFit>
              {activityName.toLowerCase().includes('zumba') ? 'GOLD' : 'FLOW'}
            </Text>
          </View>
        </View>
      </View>

      {/* Main card */}
      <View style={styles.mainCard}>
        <Text style={styles.pickerHeader}>Enter Minutes Active</Text>

        {/* Scroll picker wheel container */}
        <View style={styles.pickerContainer}>
          {/* Active selection background overlay box */}
          <View style={styles.activeSelectionBox} />

          <FlatList
            ref={flatListRef}
            data={PICKER_DATA}
            keyExtractor={(_, index) => `min-${index}`}
            renderItem={({ item, index }) => {
              const isSelected = item === selectedValue;
              if (item === '') {
                return <View style={{ height: ITEM_HEIGHT }} />;
              }
              return (
                <View style={styles.pickerItem}>
                  <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextActive]}>
                    {item}
                  </Text>
                  {isSelected && (
                    <Text style={styles.minutesLabel}>MINUTES</Text>
                  )}
                </View>
              );
            }}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onScroll={handleScroll}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: ITEM_HEIGHT,
              offset: ITEM_HEIGHT * index,
              index,
            })}
            initialScrollIndex={29} // Index 29 maps to value 30
            contentContainerStyle={styles.pickerContent}
          />
        </View>

        {/* RPE Scale Section */}
        <View style={styles.rpeSection}>
          <View style={styles.rpeLabelRow}>
            <Text style={styles.rpeTitle}>RPE Scale (Intensity)</Text>
            <View style={styles.rpeBadge}>
              <Text style={styles.rpeBadgeText}>
                {rpe} - {getRpeDescription(rpe)}
              </Text>
            </View>
          </View>
          <View 
            ref={trackRef}
            onLayout={(e) => {
              trackWidth.current = e.nativeEvent.layout.width;
            }}
            style={styles.rpeTrack}
            {...panResponder.panHandlers}
          >
            {/* Active filled track */}
            <View 
              style={[
                styles.rpeFill, 
                { width: `${((rpe - 1) / 9) * 100}%` }
              ]} 
            />
            {/* Thumb */}
            <View 
              style={[
                styles.rpeThumb, 
                { left: `${((rpe - 1) / 9) * 100}%` }
              ]} 
            />
          </View>
          <View style={styles.rpeScaleLabels}>
            <Text style={styles.scaleLabelText}>1</Text>
            <Text style={styles.scaleLabelText}>3</Text>
            <Text style={styles.scaleLabelText}>5</Text>
            <Text style={styles.scaleLabelText}>7</Text>
            <Text style={styles.scaleLabelText}>10</Text>
          </View>
        </View>

        {/* Session Type Description */}
        <Text style={styles.sessionTypeText}>
          Session Type: {category} (Base MET: {baseMet})
        </Text>

        {/* Circular breakdown ring card */}
        <View style={styles.breakdownCard}>
          {/* SVG Segmented Donut Ring */}
          <View style={styles.svgWrapper}>
            <Svg width={110} height={110} viewBox="0 0 110 110">
              <G transform="rotate(-90, 55, 55)">
                {/* Background static base ring */}
                <Circle
                  cx={55}
                  cy={55}
                  r={radius}
                  stroke="#E2E8F0"
                  strokeWidth={10}
                  fill="transparent"
                />
                
                {/* Segment 1: Cardio (80%) */}
                <G transform={`rotate(${segments.cardio.rotation}, 55, 55)`}>
                  <AnimatedCircle
                    cx={55}
                    cy={55}
                    r={radius}
                    stroke={segments.cardio.color}
                    strokeWidth={10}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={getInterpolatedOffset(segments.cardio.percentage)}
                    strokeLinecap="round"
                  />
                </G>

                {/* Segment 2: Strength (10%) */}
                <G transform={`rotate(${segments.strength.rotation}, 55, 55)`}>
                  <AnimatedCircle
                    cx={55}
                    cy={55}
                    r={radius}
                    stroke={segments.strength.color}
                    strokeWidth={10}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={getInterpolatedOffset(segments.strength.percentage)}
                    strokeLinecap="round"
                  />
                </G>

                {/* Segment 3: Balance (5%) */}
                <G transform={`rotate(${segments.balance.rotation}, 55, 55)`}>
                  <AnimatedCircle
                    cx={55}
                    cy={55}
                    r={radius}
                    stroke={segments.balance.color}
                    strokeWidth={10}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={getInterpolatedOffset(segments.balance.percentage)}
                    strokeLinecap="round"
                  />
                </G>

                {/* Segment 4: Recovery (5%) */}
                <G transform={`rotate(${segments.recovery.rotation}, 55, 55)`}>
                  <AnimatedCircle
                    cx={55}
                    cy={55}
                    r={radius}
                    stroke={segments.recovery.color}
                    strokeWidth={10}
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={getInterpolatedOffset(segments.recovery.percentage)}
                    strokeLinecap="round"
                  />
                </G>
              </G>
            </Svg>
          </View>

          {/* Legend Grid */}
          <View style={styles.legendWrapper}>
            {Object.values(segments).map((seg, idx) => (
              <View key={idx} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
                <Text style={styles.legendText}>{seg.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Footer commit triggers */}
      <View style={styles.footerContainer}>
        <TouchableOpacity style={styles.commitButton} onPress={handleCommit} activeOpacity={0.9}>
          <Text style={styles.commitButtonText}>COMMIT WORKOUT TO LEDGER</Text>
        </TouchableOpacity>

        <View style={styles.syncStatusRow}>
          <Text style={styles.syncStatusText}>Data Sync: Ready</Text>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth={2}>
            <Path d="M17.5 19A5.5 5.5 0 0 0 18 8h-1.26A8 8 0 1 0 3 16.28V17a5 5 0 0 0 5 5h9" />
            <Path d="M12 12v6M9 15l3 3 3-3" />
          </Svg>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF', // Standard Apple Blue color
    fontWeight: '500',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
    marginBottom: 16,
  },
  titleText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  zumbaBadge: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  zumbaBadgeInner: {
    alignItems: 'center',
  },
  zumbaBadgeText: {
    color: '#EAB308', // Gold yellow
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  zumbaBadgeSub: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '700',
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    alignItems: 'center',
  },
  pickerHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
    textAlign: 'center',
  },
  pickerContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  activeSelectionBox: {
    position: 'absolute',
    height: ITEM_HEIGHT,
    width: '100%',
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1.5,
    borderRadius: 16,
  },
  pickerContent: {
    paddingVertical: 0,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerItemText: {
    fontSize: 26,
    fontWeight: '600',
    color: '#94A3B8',
  },
  pickerItemTextActive: {
    fontSize: 32,
    fontWeight: '800',
    color: '#007AFF', // Highlighting active selection
  },
  minutesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 1,
    marginTop: 2,
  },
  rpeSection: {
    width: '100%',
    marginVertical: 16,
    paddingHorizontal: 4,
  },
  rpeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rpeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  rpeBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rpeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  rpeTrack: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    position: 'relative',
    justifyContent: 'center',
  },
  rpeFill: {
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  rpeThumb: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#3B82F6',
    marginLeft: -12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  rpeScaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: 6,
  },
  scaleLabelText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  sessionTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 24,
  },
  breakdownCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
  },
  svgWrapper: {
    marginRight: 24,
  },
  legendWrapper: {
    justifyContent: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '500',
  },
  footerContainer: {
    marginTop: 'auto',
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  commitButton: {
    backgroundColor: '#10B981', // Direct green commit color from screenshot
    borderRadius: 16,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 16,
  },
  commitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  syncStatusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  syncStatusText: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
});

export default DemoWorkoutLogScreen;
