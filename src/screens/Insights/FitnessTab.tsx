import React, { useRef, useEffect } from 'react';
import RNLinearGradient from 'react-native-linear-gradient';
import { ScrollView, Text, View, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

import {
  BarChart,
  SingleLineChart,
  DonutChart,
} from '../../components/charts/CustomSvgCharts';
import {
  dashboardColors as DC,
  speedometerColor,
} from '../../theme/dashboardColors';
import { METRIC_COLORS } from '../../theme';
import { styles } from './styles';
import { IFitnessTabProps } from '../../types';

const getDynamicMax = (values: number[]) => {
  const max = Math.max(...values, 0);

  if (max === 0) {
    return 5;
  }

  if (max <= 10) {
    return max + 5;
  }

  if (max <= 100) {
    return Math.ceil((max + 20) / 10) * 10;
  }

  if (max <= 1000) {
    return Math.ceil((max + 100) / 50) * 50;
  }

  if (max <= 10000) {
    return Math.ceil((max + 500) / 100) * 100;
  }

  return Math.ceil((max + 1000) / 500) * 500;
};

const getDynamicTicks = (max: number) => {
  if (max <= 5) {
    return [0, 1, 2, 3, 4, 5];
  }

  if (max <= 10) {
    return [0, 2, 4, 6, 8, 10];
  }

  return [
    0,
    Math.round(max * 0.25),
    Math.round(max * 0.5),
    Math.round(max * 0.75),
    max,
  ];
};

const EmptyChart = ({ title }: { title: string }) => (
  <View style={styles.emptyChartContainer}>
    <View style={styles.emptyChartIconContainer}>
      <Text style={styles.emptyChartIcon}>📊</Text>
    </View>
    <Text style={styles.emptyChartTitle}>No {title} data available</Text>
  </View>
);

const ScrollableChart = ({
  children,
  dataLength,
  visibleWidth,
}: {
  children: (width: number) => React.ReactNode;
  dataLength: number;
  visibleWidth: number;
}) => {
  const itemWidth = visibleWidth / 7;
  const totalWidth = dataLength > 7 ? itemWidth * dataLength : visibleWidth;

  return (
    <View style={{ width: visibleWidth }}>
      {dataLength > 7 && (
        <View style={styles.scrollIndicatorContainer}>
          <Text style={styles.scrollIndicatorText}>Scroll for more</Text>
          <Text style={styles.scrollIndicatorArrow}>→</Text>
        </View>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {children(totalWidth)}
      </ScrollView>
    </View>
  );
};

const FitnessTab = ({
  chartWidth,
  dailyStepsBreakdown,
  dailyHeartPoints,
  sdexActivity,
  energyExpended,
  dailyActiveMinutes,
  dailyModifiedHeartPoints,
  totalHeartPoint = 0,
  dailyHeartPointsCharts,
  dailySdexCharts,
  dailyStepsBreakdownCharts,
  energyExpandedCharts,
  dailyActiveMinutesCharts,
  dailyModifiedHeartPointsCharts,
  dailyInsightText,
  cmasData,
}: IFitnessTabProps) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    animValue.setValue(0);
    Animated.timing(animValue, {
      toValue: 1,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [totalHeartPoint]);

  const innerChartWidth = chartWidth - 24;

  const stepsMax = getDynamicMax(dailyStepsBreakdown?.values || []);

  const heartPointsMax = getDynamicMax(dailyHeartPoints?.values || []);

  const mhpValues = dailyModifiedHeartPoints?.values || [];
  const mhpLabels =
    dailyModifiedHeartPoints?.labels && dailyModifiedHeartPoints.labels.length > 0
      ? dailyModifiedHeartPoints.labels
      : (dailyHeartPoints?.labels && dailyHeartPoints.labels.length > 0
          ? dailyHeartPoints.labels
          : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
  const mhpMax = getDynamicMax(mhpValues.length > 0 ? mhpValues : [10]);

  // CMAS Score and Status Calculations
  const hasCmas = cmasData !== undefined && cmasData !== null && cmasData.value !== undefined && cmasData.value !== null;
  const cmasValue = hasCmas ? Number(cmasData.value) : null;
  const cmasTarget = (cmasData?.target !== undefined && cmasData.target !== null && Number(cmasData.target) > 0)
    ? Number(cmasData.target)
    : 100;

  const cmasPct = hasCmas && cmasValue !== null
    ? (cmasData?.performance_percent !== undefined
        ? Number(cmasData.performance_percent)
        : cmasData?.percent !== undefined
          ? Number(cmasData.percent)
          : Math.min(100, Math.max(0, Math.round((cmasValue / cmasTarget) * 100))))
    : 0;

  const getCmasStatus = () => {
    if (cmasData?.status) {
      return String(cmasData.status).toUpperCase();
    }
    if (hasCmas && cmasValue !== null) {
      if (cmasValue >= 75) return 'OPTIMAL';
      if (cmasValue >= 50) return 'MODERATE';
      if (cmasValue > 0) return 'DEFICIT';
    }
    return 'N/A';
  };

  const cmasStatus = getCmasStatus();

  const getCmasStatusStyle = (status: string) => {
    switch (status) {
      case 'OPTIMAL':
        return {
          bg: 'rgba(34, 197, 94, 0.15)',
          border: '#10B981',
          text: '#047857',
        };
      case 'MODERATE':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          border: '#F59E0B',
          text: '#B45309',
        };
      case 'DEFICIT':
      case 'NEEDS ATTENTION':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          border: '#EF4444',
          text: '#B91C1C',
        };
      default:
        return {
          bg: 'rgba(100, 116, 139, 0.12)',
          border: '#94A3B8',
          text: '#475569',
        };
    }
  };

  const cmasStatusStyle = getCmasStatusStyle(cmasStatus);

  const getCmasScoreColors = (status: string, score: number | null) => {
    if (score === null || status === 'N/A') {
      return {
        ring: '#94A3B8',
        track: '#E2E8F0',
        dot: '#94A3B8',
        text: '#475569',
        percent: '#64748B',
      };
    }
    if (score >= 75 || status === 'OPTIMAL') {
      return {
        ring: '#059669',
        track: '#A7F3D0',
        dot: '#10B981',
        text: '#064E3B',
        percent: '#059669',
      };
    }
    if (score >= 50 || status === 'MODERATE') {
      return {
        ring: '#D97706',
        track: '#FDE68A',
        dot: '#F59E0B',
        text: '#78350F',
        percent: '#B45309',
      };
    }
    return {
      ring: '#E11D48',
      track: '#FECDD3',
      dot: '#F43F5E',
      text: '#881337',
      percent: '#E11D48',
    };
  };

  const cmasScoreColors = getCmasScoreColors(cmasStatus, cmasValue);

  const sdexMax = getDynamicMax(sdexActivity?.values || []);

  const energyExpendedMax = getDynamicMax(energyExpended?.values || []);

  const activeMinutesMax = getDynamicMax(dailyActiveMinutes?.values || []);

  const isINOXuser = false;

  const DAILY_HP_TARGET = 21.4;

  const getHeartPointColor = (points: number) => {
    if (points < 10.7) return speedometerColor.light;
    if (points < 21.4) return speedometerColor.base;
    if (points < 42.8) return speedometerColor.light100;
    return speedometerColor.medium;
  };

  const SIZE = 140;
  const STROKE = 10;
  const RADIUS = 50;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const progress = Math.min(totalHeartPoint / DAILY_HP_TARGET, 1);
  const strokeDashoffset = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, CIRCUMFERENCE * (1 - progress)],
  });

  const percentage =
    dailyHeartPointsCharts?.performance !== undefined &&
    dailyHeartPointsCharts?.performance !== null
      ? dailyHeartPointsCharts.performance
      : Math.round((totalHeartPoint / DAILY_HP_TARGET) * 100);

  const activeColor = getHeartPointColor(totalHeartPoint);

  return (
    <>
      {/* 1. Cardio Metabolic Score (CMAS) Card */}
      <RNLinearGradient
        colors={['#ECFDF5', '#D1FAE5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderWidth: 1.5,
            borderColor: '#A7F3D0',
            shadowColor: '#059669',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 3,
            paddingHorizontal: 12,
            paddingVertical: 14,
          },
        ]}
      >
        <View style={[styles.cardTitleRow, { justifyContent: 'space-between', marginBottom: 14 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, paddingRight: 8 }}>
            <View
              style={[
                styles.cardIconContainer,
                {
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: '#A7F3D0',
                  shadowColor: '#059669',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}>
              <Text style={styles.emptyChartIcon}>🫀</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: '#064E3B', fontSize: 15, fontWeight: '800' }]}>
                Cardio Metabolic Alignment Score (CMAS)
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: cmasStatusStyle.bg,
                borderColor: cmasStatusStyle.border,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
              },
            ]}>
            <Text style={[styles.statusText, { color: cmasStatusStyle.text, fontSize: 10, fontWeight: '800' }]}>
              {cmasStatus}
            </Text>
          </View>
        </View>

        <View style={[styles.donutContainer, { marginTop: 4, alignItems: 'center' }]}>
          <View style={[styles.donutChartWrapper, { backgroundColor: '#FFFFFF', borderRadius: 60, padding: 6, shadowColor: '#059669', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }]}>
            <DonutChart
              pct={cmasPct}
              size={100}
              color={cmasScoreColors.ring}
              trackColor={cmasScoreColors.track}
            />
            <View style={styles.donutScoreContainer}>
              <View
                style={[
                  styles.trafficLightDot,
                  { backgroundColor: cmasScoreColors.dot },
                ]}
              />
              <Text style={[styles.donutScoreValue, { color: cmasScoreColors.text, fontWeight: '900' }]}>
                {hasCmas && cmasValue !== null ? Math.round(cmasValue) : 'N/A'}
              </Text>
              {hasCmas && cmasValue !== null && (
                <Text style={[styles.donutScorePercent, { color: cmasScoreColors.percent, fontWeight: '700' }]}>%</Text>
              )}
            </View>
          </View>

          <View style={{ flex: 1, paddingLeft: 8 }}>
            <Text
              style={[
                styles.cardSub,
                { color: '#065F46', fontSize: 12.5, lineHeight: 18, fontWeight: '500' },
              ]}>
              Cardio Metabolic Alignment Score (CMAS) performance based on your Daily Metrics.
            </Text>
          </View>
        </View>
      </RNLinearGradient>

      {/* 2. Daily Performance Card */}
      <RNLinearGradient
        colors={['#F5F3FF', '#EDE9FE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderWidth: 1.5,
            borderColor: '#DDD6FE',
            shadowColor: '#7C3AED',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.09,
            shadowRadius: 10,
            elevation: 3,
            paddingHorizontal: 12,
            paddingVertical: 14,
          },
        ]}
      >
        <View style={styles.cardTitleRow}>
          <View
            style={[
              styles.cardIconContainer,
              {
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#DDD6FE',
                shadowColor: '#7C3AED',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
          >
            <Text style={styles.emptyChartIcon}>📊</Text>
          </View>
          <Text style={[styles.cardTitle, { color: '#4C1D95', fontSize: 15, fontWeight: '800' }]}>
            Daily Performance
          </Text>
        </View>

        <View style={styles.hpCardRow}>
          <View style={styles.hpCard}>
            <Text style={[styles.speedometerLabel, { color: '#4C1D95', fontWeight: '800' }]}>
              Heart Points (HP){`\n`}(Daily Target: 21.4)
            </Text>

            <View style={styles.ringContainer}>
              <Svg width={SIZE} height={SIZE}>
                {/* Background base circle */}
                <Circle
                  stroke="#E2E8F0"
                  fill="none"
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  strokeWidth={STROKE}
                />
                {/* Animated active progress circle with color matching current category */}
                <AnimatedCircle
                  stroke={activeColor}
                  fill="none"
                  cx={SIZE / 2}
                  cy={SIZE / 2}
                  r={RADIUS}
                  strokeWidth={STROKE}
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  rotation="-90"
                  origin={`${SIZE / 2}, ${SIZE / 2}`}
                />
              </Svg>
              <View style={styles.ringTextContainer}>
                <Text style={styles.ringValueText}>
                  {totalHeartPoint}
                </Text>
                <Text style={[styles.ringPercentageText, { color: activeColor }]}>
                  HP ({percentage}%)
                </Text>
              </View>
            </View>

            {/* Category Ranges Legend */}
            <View style={styles.hpLegendContainer}>
              <View style={styles.legendRows}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: speedometerColor.light },
                  ]}
                />
                <Text style={styles.legendText}>0-10.6 Bronze / High Risk</Text>
              </View>

              <View style={styles.legendRows}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: speedometerColor.base },
                  ]}
                />
                <Text style={styles.legendText}>10.7-21.3 Silver / Moderate Risk</Text>
              </View>

              <View style={styles.legendRows}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: speedometerColor.light100 },
                  ]}
                />
                <Text style={styles.legendText}>21.4-42.8 Gold / Low Risk</Text>
              </View>

              <View style={styles.legendRows}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: speedometerColor.medium },
                  ]}
                />
                <Text style={styles.legendText}>42.9+ Platinum / Very Low Risk</Text>
              </View>
            </View>

            {/* Recommendation footer */}
            <View style={[styles.recommendationFooter, { backgroundColor: 'rgba(124, 58, 237, 0.06)', borderRadius: 8, padding: 8, marginTop: 10 }]}>
              <Text style={[styles.recommendationFooterText, { color: '#5B21B6' }]}>
                Daily target: 21.4 HP (equivalent to WHO recommendation of 150 weekly Heart Points to improve cardiovascular health).
              </Text>
            </View>
          </View>
        </View>
      </RNLinearGradient>

      {/* 3. Daily Steps Breakdown Card */}
      <RNLinearGradient
        colors={['#F0FDF4', '#DCFCE7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderWidth: 1.5,
            borderColor: '#A7F3D0',
            shadowColor: '#059669',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.09,
            shadowRadius: 10,
            elevation: 3,
            paddingHorizontal: 12,
            paddingVertical: 14,
          },
        ]}
      >
        <View style={styles.cardTitleRow}>
          <View
            style={[
              styles.cardIconContainer,
              {
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#A7F3D0',
                shadowColor: '#059669',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
          >
            <Text style={styles.emptyChartIcon}>👣</Text>
          </View>
          <Text style={[styles.cardTitle, { color: '#064E3B', fontSize: 15, fontWeight: '800' }]}>
            Daily Steps Breakdown
          </Text>
        </View>

        <View style={[styles.chartCanvasBox, { borderColor: 'rgba(5, 150, 105, 0.15)', shadowColor: '#059669' }]}>
          {dailyStepsBreakdown?.values &&
          dailyStepsBreakdown.values.length > 0 ? (
            <ScrollableChart
              dataLength={dailyStepsBreakdown?.values?.length || 0}
              visibleWidth={innerChartWidth}
            >
              {computedWidth => (
                <BarChart
                  values={dailyStepsBreakdown.values}
                  labels={dailyStepsBreakdown.labels}
                  width={computedWidth}
                  height={180}
                  maxY={stepsMax}
                  yTicks={getDynamicTicks(stepsMax)}
                  color={METRIC_COLORS.steps.main}
                />
              )}
            </ScrollableChart>
          ) : (
            <EmptyChart title="steps" />
          )}
        </View>

        <Text style={[styles.caption, { color: '#065F46' }]}>Total daily steps across the week.</Text>

        {dailyStepsBreakdownCharts &&
          (dailyStepsBreakdownCharts.target !== undefined ||
            dailyStepsBreakdownCharts.actual !== undefined ||
            dailyStepsBreakdownCharts.performance !== undefined) && (
            <View style={[styles.modernSummaryRow, { borderColor: '#A7F3D0' }]}>
              {dailyStepsBreakdownCharts.target !== undefined &&
                dailyStepsBreakdownCharts.target !== null && (
                  <View style={styles.modernSummaryItem}>
                    <Text style={styles.modernSummaryLabel}>Target:{`<`} </Text>
                    <Text style={styles.modernSummaryValue}>{dailyStepsBreakdownCharts.target}</Text>
                  </View>
                )}
              {dailyStepsBreakdownCharts.actual !== undefined &&
                dailyStepsBreakdownCharts.actual !== null && (
                  <View style={styles.modernSummaryItem}>
                    <Text style={styles.modernSummaryLabel}>Actual: </Text>
                    <Text style={styles.modernSummaryValue}>{dailyStepsBreakdownCharts.actual}</Text>
                  </View>
                )}
              {dailyStepsBreakdownCharts.performance !== undefined &&
                dailyStepsBreakdownCharts.performance !== null && (
                  <View style={styles.modernPerformanceBadge}>
                    <Text style={styles.modernPerformanceText}>
                      Performance: {dailyStepsBreakdownCharts.performance}%
                    </Text>
                  </View>
                )}
            </View>
          )}
      </RNLinearGradient>

      {/* 4. Daily Heart Points (HP) Breakdown Card */}
      <RNLinearGradient
        colors={['#FFF1F2', '#FFE4E6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderWidth: 1.5,
            borderColor: '#FECDD3',
            shadowColor: '#E11D48',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.09,
            shadowRadius: 10,
            elevation: 3,
            paddingHorizontal: 12,
            paddingVertical: 14,
          },
        ]}
      >
        <View style={styles.cardTitleRow}>
          <View
            style={[
              styles.cardIconContainer,
              {
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#FECDD3',
                shadowColor: '#E11D48',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
          >
            <Text style={styles.emptyChartIcon}>❤️</Text>
          </View>
          <Text style={[styles.cardTitle, { color: '#881337', fontSize: 15, fontWeight: '800' }]}>
            Daily Heart Points (HP) Breakdown
          </Text>
        </View>

        <View style={[styles.chartCanvasBox, { borderColor: 'rgba(225, 29, 72, 0.15)', shadowColor: '#E11D48' }]}>
          {dailyHeartPoints?.values && dailyHeartPoints.values.length > 0 ? (
            <ScrollableChart
              dataLength={dailyHeartPoints?.values?.length || 0}
              visibleWidth={innerChartWidth}
            >
              {computedWidth => (
                <BarChart
                  values={dailyHeartPoints.values}
                  labels={dailyHeartPoints.labels}
                  width={computedWidth}
                  height={180}
                  maxY={heartPointsMax}
                  yTicks={getDynamicTicks(heartPointsMax)}
                  color={METRIC_COLORS.heartPoints.main}
                />
              )}
            </ScrollableChart>
          ) : (
            <EmptyChart title="Heart Points (HP)" />
          )}
        </View>

        <Text style={[styles.caption, { color: '#9F1239' }]}>Heart Points (HP) progress for each day.</Text>

        {dailyHeartPointsCharts &&
          (dailyHeartPointsCharts.target !== undefined ||
            dailyHeartPointsCharts.actual !== undefined ||
            dailyHeartPointsCharts.performance !== undefined) && (
            <View style={[styles.modernSummaryRow, { borderColor: '#FECDD3' }]}>
              {dailyHeartPointsCharts.target !== undefined &&
                dailyHeartPointsCharts.target !== null && (
                  <View style={styles.modernSummaryItem}>
                    <Text style={styles.modernSummaryLabel}>Target: </Text>
                    <Text style={styles.modernSummaryValue}>{dailyHeartPointsCharts.target}</Text>
                  </View>
                )}
              {dailyHeartPointsCharts.actual !== undefined &&
                dailyHeartPointsCharts.actual !== null && (
                  <View style={styles.modernSummaryItem}>
                    <Text style={styles.modernSummaryLabel}>Actual: </Text>
                    <Text style={styles.modernSummaryValue}>{dailyHeartPointsCharts.actual}</Text>
                  </View>
                )}
              {dailyHeartPointsCharts.performance !== undefined &&
                dailyHeartPointsCharts.performance !== null && (
                  <View style={styles.modernPerformanceBadge}>
                    <Text style={styles.modernPerformanceText}>
                      Performance: {dailyHeartPointsCharts.performance}%
                    </Text>
                  </View>
                )}
            </View>
          )}
      </RNLinearGradient>

      {/* 5. Modified Heart Point (MHP) Card */}
      <RNLinearGradient
        colors={['#FFF7ED', '#FFEDD5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderWidth: 1.5,
            borderColor: '#FED7AA',
            shadowColor: '#EA580C',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.09,
            shadowRadius: 10,
            elevation: 3,
            paddingHorizontal: 12,
            paddingVertical: 14,
          },
        ]}
      >
        <View style={styles.cardTitleRow}>
          <View
            style={[
              styles.cardIconContainer,
              {
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#FED7AA',
                shadowColor: '#EA580C',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}
          >
            <Text style={styles.emptyChartIcon}>💓</Text>
          </View>
          <Text style={[styles.cardTitle, { color: '#7C2D12', fontSize: 15, fontWeight: '800' }]}>
            Modified Heart Points (MHP)
          </Text>
        </View>

        <View style={[styles.chartCanvasBox, { borderColor: 'rgba(234, 88, 12, 0.15)', shadowColor: '#EA580C' }]}>
          {mhpValues.length > 0 ? (
            <ScrollableChart
              dataLength={mhpValues.length}
              visibleWidth={innerChartWidth}
            >
              {computedWidth => (
                <BarChart
                  values={mhpValues}
                  labels={mhpLabels}
                  width={computedWidth}
                  height={180}
                  maxY={mhpMax}
                  yTicks={getDynamicTicks(mhpMax)}
                  color="#EA580C"
                />
              )}
            </ScrollableChart>
          ) : (
            <EmptyChart title="Modified Heart Points (MHP)" />
          )}
        </View>

        <Text style={[styles.caption, { color: '#9A3412' }]}>
          Modified Heart Points (MHP) progress across active recovery days.
        </Text>

        {dailyModifiedHeartPointsCharts && (
          <View style={styles.modernSummaryRow}>
            {dailyModifiedHeartPointsCharts.target !== undefined &&
              dailyModifiedHeartPointsCharts.target !== null && (
                <View style={styles.modernSummaryItem}>
                  <Text style={styles.modernSummaryLabel}>Target: </Text>
                  <Text style={styles.modernSummaryValue}>{dailyModifiedHeartPointsCharts.target}</Text>
                </View>
              )}
            {dailyModifiedHeartPointsCharts.actual !== undefined &&
              dailyModifiedHeartPointsCharts.actual !== null && (
                <View style={styles.modernSummaryItem}>
                  <Text style={styles.modernSummaryLabel}>Actual: </Text>
                  <Text style={styles.modernSummaryValue}>{dailyModifiedHeartPointsCharts.actual}</Text>
                </View>
              )}
            {dailyModifiedHeartPointsCharts.performance !== undefined &&
              dailyModifiedHeartPointsCharts.performance !== null && (
                <View style={styles.modernPerformanceBadge}>
                  <Text style={styles.modernPerformanceText}>
                    Performance: {dailyModifiedHeartPointsCharts.performance}%
                  </Text>
                </View>
              )}
          </View>
        )}
      </RNLinearGradient>

      {!isINOXuser && (
        <>
          {/* 6. Daily Energy Expended Breakdown Card */}
          <RNLinearGradient
            colors={['#FEF2F2', '#FEE2E2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.card,
              {
                borderWidth: 1.5,
                borderColor: '#FECACA',
                shadowColor: '#DC2626',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.09,
                shadowRadius: 10,
                elevation: 3,
                paddingHorizontal: 12,
                paddingVertical: 14,
              },
            ]}
          >
            <View style={styles.cardTitleRow}>
              <View
                style={[
                  styles.cardIconContainer,
                  {
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#FECACA',
                    shadowColor: '#DC2626',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 2,
                  },
                ]}
              >
                <Text style={styles.emptyChartIcon}>🔥</Text>
              </View>
              <Text style={[styles.cardTitle, { color: '#7F1D1D', fontSize: 15, fontWeight: '800' }]}>
                Daily Energy Expended Breakdown
              </Text>
            </View>

            <View style={[styles.chartCanvasBox, { borderColor: 'rgba(220, 38, 38, 0.15)', shadowColor: '#DC2626' }]}>
              {energyExpended?.values && energyExpended.values.length > 0 ? (
                <ScrollableChart
                  dataLength={energyExpended?.values?.length || 0}
                  visibleWidth={innerChartWidth}
                >
                  {computedWidth =>
                    (energyExpended.values?.length || 0) >= 5 ? (
                      <SingleLineChart
                        values={
                          energyExpended.values?.length
                            ? energyExpended.values
                            : [0]
                        }
                        labels={
                          energyExpended.labels?.length
                            ? energyExpended.labels
                            : ['No Data']
                        }
                        width={computedWidth}
                        height={180}
                        color={METRIC_COLORS.calories.main}
                        filled={
                          energyExpended.values?.length > 1 &&
                          energyExpended.values?.some(v => v > 0)
                        }
                      />
                    ) : (
                      <BarChart
                        values={
                          energyExpended.values?.length
                            ? energyExpended.values
                            : [0]
                        }
                        labels={
                          energyExpended.labels?.length
                            ? energyExpended.labels
                            : ['No Data']
                        }
                        width={computedWidth}
                        height={180}
                        maxY={energyExpendedMax}
                        yTicks={getDynamicTicks(energyExpendedMax)}
                        color={METRIC_COLORS.calories.main}
                      />
                    )
                  }
                </ScrollableChart>
              ) : (
                <EmptyChart title="energy expended" />
              )}
            </View>
            <Text style={[styles.caption, { color: '#991B1B' }]}>
              Energy expended performance across the week.
            </Text>

            {energyExpandedCharts &&
              (energyExpandedCharts.target !== undefined ||
                energyExpandedCharts.actual !== undefined ||
                energyExpandedCharts.performance !== undefined) && (
                <View style={[styles.modernSummaryRow, { borderColor: '#FECACA' }]}>
                  {energyExpandedCharts.target !== undefined &&
                    energyExpandedCharts.target !== null && (
                      <View style={styles.modernSummaryItem}>
                        <Text style={styles.modernSummaryLabel}>Target: {`<`}</Text>
                        <Text style={styles.modernSummaryValue}>{energyExpandedCharts.target}</Text>
                      </View>
                    )}
                  {energyExpandedCharts.actual !== undefined &&
                    energyExpandedCharts.actual !== null && (
                      <View style={styles.modernSummaryItem}>
                        <Text style={styles.modernSummaryLabel}>Actual: </Text>
                        <Text style={styles.modernSummaryValue}>{energyExpandedCharts.actual}</Text>
                      </View>
                    )}
                  {energyExpandedCharts.performance !== undefined &&
                    energyExpandedCharts.performance !== null && (
                      <View style={styles.modernPerformanceBadge}>
                        <Text style={styles.modernPerformanceText}>
                          Performance: {energyExpandedCharts.performance}%
                        </Text>
                      </View>
                    )}
                </View>
              )}
          </RNLinearGradient>

          {/* 7. Daily S-DEX Activity Breakdown Card */}
          <RNLinearGradient
            colors={['#F0FDFA', '#CCFBF1']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.card,
              {
                borderWidth: 1.5,
                borderColor: '#99F6E4',
                shadowColor: '#0D9488',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.09,
                shadowRadius: 10,
                elevation: 3,
                paddingHorizontal: 12,
                paddingVertical: 14,
              },
            ]}
          >
            <View style={styles.cardTitleRow}>
              <View
                style={[
                  styles.cardIconContainer,
                  {
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#99F6E4',
                    shadowColor: '#0D9488',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 2,
                  },
                ]}
              >
                <Text style={styles.emptyChartIcon}>⚡</Text>
              </View>
              <Text style={[styles.cardTitle, { color: '#134E4A', fontSize: 15, fontWeight: '800' }]}>
                Daily S-DEX Activity Breakdown
              </Text>
            </View>

            <View style={[styles.chartCanvasBox, { borderColor: 'rgba(13, 148, 136, 0.15)', shadowColor: '#0D9488' }]}>
              {sdexActivity?.values && sdexActivity.values.length > 0 ? (
                <ScrollableChart
                  dataLength={sdexActivity?.values?.length || 0}
                  visibleWidth={innerChartWidth}
                >
                  {computedWidth => (
                    <BarChart
                      values={
                        sdexActivity.values?.length ? sdexActivity.values : [0]
                      }
                      labels={sdexActivity.labels}
                      width={computedWidth}
                      height={180}
                      maxY={sdexMax}
                      yTicks={getDynamicTicks(sdexMax)}
                      color={DC.tealDark}
                    />
                  )}
                </ScrollableChart>
              ) : (
                <EmptyChart title="S-DEX" />
              )}
            </View>
            <Text style={[styles.caption, { color: '#115E59' }]}>
              S-DEX activity trend across the week.
            </Text>

            {dailySdexCharts &&
              (dailySdexCharts.target !== undefined ||
                dailySdexCharts.actual !== undefined ||
                dailySdexCharts.performance !== undefined) && (
                <View style={[styles.modernSummaryRow, { borderColor: '#99F6E4' }]}>
                  {dailySdexCharts.target !== undefined &&
                    dailySdexCharts.target !== null && (
                      <View style={styles.modernSummaryItem}>
                        <Text style={styles.modernSummaryLabel}>Target: {`<`}</Text>
                        <Text style={styles.modernSummaryValue}>{dailySdexCharts.target}</Text>
                      </View>
                    )}
                  {dailySdexCharts.actual !== undefined &&
                    dailySdexCharts.actual !== null && (
                      <View style={styles.modernSummaryItem}>
                        <Text style={styles.modernSummaryLabel}>Actual: </Text>
                        <Text style={styles.modernSummaryValue}>{dailySdexCharts.actual}</Text>
                      </View>
                    )}
                  {dailySdexCharts.performance !== undefined &&
                    dailySdexCharts.performance !== null && (
                      <View style={styles.modernPerformanceBadge}>
                        <Text style={styles.modernPerformanceText}>
                          Performance: {dailySdexCharts.performance}%
                        </Text>
                      </View>
                    )}
                </View>
              )}
          </RNLinearGradient>

          {/* 8. Daily Active Minutes Breakdown Card */}
          <RNLinearGradient
            colors={['#FDF4FF', '#FAE8FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.card,
              {
                borderWidth: 1.5,
                borderColor: '#F5D0FE',
                shadowColor: '#C026D3',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.09,
                shadowRadius: 10,
                elevation: 3,
                paddingHorizontal: 12,
                paddingVertical: 14,
              },
            ]}
          >
            <View style={styles.cardTitleRow}>
              <View
                style={[
                  styles.cardIconContainer,
                  {
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#F5D0FE',
                    shadowColor: '#C026D3',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 2,
                  },
                ]}
              >
                <Text style={styles.emptyChartIcon}>⏱️</Text>
              </View>
              <Text style={[styles.cardTitle, { color: '#701A75', fontSize: 15, fontWeight: '800' }]}>
                Daily Active Minutes Breakdown
              </Text>
            </View>

            <View style={[styles.chartCanvasBox, { borderColor: 'rgba(192, 38, 211, 0.15)', shadowColor: '#C026D3' }]}>
              {dailyActiveMinutes?.values && dailyActiveMinutes.values.length > 0 ? (
                <ScrollableChart
                  dataLength={dailyActiveMinutes?.values?.length || 0}
                  visibleWidth={innerChartWidth}
                >
                  {computedWidth => (
                    <BarChart
                      values={
                        dailyActiveMinutes.values?.length ? dailyActiveMinutes.values : [0]
                      }
                      labels={dailyActiveMinutes.labels}
                      width={computedWidth}
                      height={180}
                      maxY={activeMinutesMax}
                      yTicks={getDynamicTicks(activeMinutesMax)}
                      color={METRIC_COLORS.minutes.main}
                    />
                  )}
                </ScrollableChart>
              ) : (
                <EmptyChart title="active minutes" />
              )}
            </View>
            <Text style={[styles.caption, { color: '#86198F' }]}>
              Active minutes recorded across the week.
            </Text>

            {dailyActiveMinutesCharts &&
              (dailyActiveMinutesCharts.target !== undefined ||
                dailyActiveMinutesCharts.actual !== undefined ||
                dailyActiveMinutesCharts.performance !== undefined) && (
                <View style={[styles.modernSummaryRow, { borderColor: '#F5D0FE' }]}>
                  {dailyActiveMinutesCharts.target !== undefined &&
                    dailyActiveMinutesCharts.target !== null && (
                      <View style={styles.modernSummaryItem}>
                        <Text style={styles.modernSummaryLabel}>Target: </Text>
                        <Text style={styles.modernSummaryValue}>{dailyActiveMinutesCharts.target}</Text>
                      </View>
                    )}
                  {dailyActiveMinutesCharts.actual !== undefined &&
                    dailyActiveMinutesCharts.actual !== null && (
                      <View style={styles.modernSummaryItem}>
                        <Text style={styles.modernSummaryLabel}>Actual: </Text>
                        <Text style={styles.modernSummaryValue}>{dailyActiveMinutesCharts.actual} min</Text>
                      </View>
                    )}
                  {dailyActiveMinutesCharts.performance !== undefined &&
                    dailyActiveMinutesCharts.performance !== null && (
                      <View style={styles.modernPerformanceBadge}>
                        <Text style={styles.modernPerformanceText}>
                          Performance: {dailyActiveMinutesCharts.performance}%
                        </Text>
                      </View>
                    )}
                </View>
              )}
          </RNLinearGradient>

          {/* 9. Insights & Alerts Card */}
          <RNLinearGradient
            colors={['#EFF6FF', '#DBEAFE']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.card,
              {
                borderWidth: 1.5,
                borderColor: '#BFDBFE',
                shadowColor: '#2563EB',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.09,
                shadowRadius: 10,
                elevation: 3,
                paddingHorizontal: 12,
                paddingVertical: 14,
              },
            ]}
          >
            <View style={styles.cardTitleRow}>
              <View
                style={[
                  styles.cardIconContainer,
                  {
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#BFDBFE',
                    shadowColor: '#2563EB',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 4,
                    elevation: 2,
                  },
                ]}
              >
                <Text style={styles.emptyChartIcon}>💡</Text>
              </View>
              <Text style={[styles.cardTitle, { color: '#1E3A8A', fontSize: 15, fontWeight: '800' }]}>
                Insights & Alerts
              </Text>
            </View>

            <View style={[styles.insightContainer, { backgroundColor: '#FFFFFF', borderColor: 'rgba(37, 99, 235, 0.12)', borderRadius: 12, padding: 14, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }]}>
              <View style={styles.insightItem}>
                <Text style={[styles.insightText, { color: '#1E40AF', fontSize: 12.5, lineHeight: 19, fontWeight: '500' }]}>
                  {dailyInsightText || "Your activity insights and personalized health alerts will appear here based on your trends."}
                </Text>
              </View>
            </View>
          </RNLinearGradient>
        </>
      )}
    </>
  );
};

export { FitnessTab };
