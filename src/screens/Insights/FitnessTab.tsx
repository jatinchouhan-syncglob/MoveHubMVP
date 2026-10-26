import React, { useRef, useEffect } from 'react';
import RNLinearGradient from 'react-native-linear-gradient';
import { ScrollView, Text, View, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

import {
  BarChart,
  SingleLineChart,
  DonutChart,
} from '../../components/charts/CustomSvgCharts';
import {
  healthVitalityColors as C,
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
  totalHeartPoint = 0,
  totalDailySdex = 0,
  totalActiveMinutes = 0,
  dailyHeartPointsCharts,
  dailySdexCharts,
  dailyStepsBreakdownCharts,
  energyExpandedCharts,
  dailyActiveMinutesCharts,
  dailyInsightText,
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

  const stepsMax = getDynamicMax(dailyStepsBreakdown?.values || []);

  const heartPointsMax = getDynamicMax(dailyHeartPoints?.values || []);

  const staticMhpData = {
    labels:
      dailyHeartPoints?.labels && dailyHeartPoints.labels.length > 0
        ? dailyHeartPoints.labels
        : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    values: [18.5, 24.0, 31.2, 22.8, 27.5, 36.0, 29.4],
  };
  const mhpMax = getDynamicMax(staticMhpData.values);

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
      {/* Cardio Metabolic Score (CMAS) Card */}
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
            padding: 16,
          },
        ]}
      >
        <View style={[styles.cardTitleRow, { justifyContent: 'space-between', marginBottom: 14 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
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
                Cardio Metabolic Score (CMAS)
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                borderColor: '#10B981',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
              },
            ]}>
            <Text style={[styles.statusText, { color: '#047857', fontSize: 10, fontWeight: '800' }]}>
              OPTIMAL
            </Text>
          </View>
        </View>

        <View style={[styles.donutContainer, { marginTop: 4, alignItems: 'center' }]}>
          <View style={[styles.donutChartWrapper, { backgroundColor: '#FFFFFF', borderRadius: 60, padding: 6, shadowColor: '#059669', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }]}>
            <DonutChart
              pct={82}
              size={100}
              color="#059669"
              trackColor="#A7F3D0"
            />
            <View style={styles.donutScoreContainer}>
              <View
                style={[
                  styles.trafficLightDot,
                  { backgroundColor: '#10B981' },
                ]}
              />
              <Text style={[styles.donutScoreValue, { color: '#064E3B', fontWeight: '900' }]}>
                82
              </Text>
              <Text style={[styles.donutScorePercent, { color: '#059669', fontWeight: '700' }]}>%</Text>
            </View>
          </View>

          <View style={{ flex: 1, paddingLeft: 8 }}>
            <Text
              style={[
                styles.cardSub,
                { color: '#065F46', fontSize: 12.5, lineHeight: 18, fontWeight: '500' },
              ]}>
              Cardio Metabolic Score (CMAS) performance based on your weekly health trends.
            </Text>
          </View>
        </View>
      </RNLinearGradient>

      <View style={[styles.card, styles.performanceCard, { gap: 5 }]}>
        <View style={styles.cardTitleRow}>
          <View
            style={[
              styles.cardIconContainer,
              { backgroundColor: DC.purpleLight },
            ]}
          >
            <Text style={styles.emptyChartIcon}>📊</Text>
          </View>
          <Text style={styles.cardTitle}>Daily Performance</Text>
        </View>

        <View style={styles.hpCardRow}>
          <View style={styles.hpCard}>
            <Text style={styles.speedometerLabel}>
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
            <View style={styles.recommendationFooter}>
              <Text style={styles.recommendationFooterText}>
                Daily target: 21.4 HP (equivalent to WHO recommendation of 150 weekly Heart Points to improve cardiovascular health).
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[styles.card, styles.stepsCard]}>
        <View style={styles.cardTitleRow}>
          <View
            style={[
              styles.cardIconContainer,
              { backgroundColor: METRIC_COLORS.steps.light },
            ]}
          >
            <Text style={styles.emptyChartIcon}>👣</Text>
          </View>
          <Text style={styles.cardTitle}>Daily Steps Breakdown</Text>
        </View>

        <View style={styles.chartWrapper}>
          {dailyStepsBreakdown?.values &&
          dailyStepsBreakdown.values.length > 0 ? (
            <ScrollableChart
              dataLength={dailyStepsBreakdown?.values?.length || 0}
              visibleWidth={chartWidth}
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

        <Text style={styles.caption}>Total daily steps across the week.</Text>

        {dailyStepsBreakdownCharts &&
          (dailyStepsBreakdownCharts.target !== undefined ||
            dailyStepsBreakdownCharts.actual !== undefined ||
            dailyStepsBreakdownCharts.performance !== undefined) && (
            <View style={styles.summaryMetricsRow}>
              {dailyStepsBreakdownCharts.target !== undefined &&
                dailyStepsBreakdownCharts.target !== null && (
                  <Text style={styles.summaryMetricTarget}>
                    Target: {dailyStepsBreakdownCharts.target}
                  </Text>
                )}
              {dailyStepsBreakdownCharts.actual !== undefined &&
                dailyStepsBreakdownCharts.actual !== null && (
                  <Text style={styles.summaryMetricActual}>
                    Actual: {dailyStepsBreakdownCharts.actual}
                  </Text>
                )}
              {dailyStepsBreakdownCharts.performance !== undefined &&
                dailyStepsBreakdownCharts.performance !== null && (
                  <Text style={styles.summaryMetricPerformance}>
                    Performance: {dailyStepsBreakdownCharts.performance}%
                  </Text>
                )}
            </View>
          )}
      </View>

      <View style={[styles.card, styles.heartPointsCard]}>
        <View style={styles.cardTitleRow}>
          <View
            style={[
              styles.cardIconContainer,
              { backgroundColor: METRIC_COLORS.heartPoints.light },
            ]}
          >
            <Text style={styles.emptyChartIcon}>❤️</Text>
          </View>
          <Text style={styles.cardTitle}>Daily Heart Points (HP) Breakdown</Text>
        </View>

        <View style={styles.chartWrapper}>
          {dailyHeartPoints?.values && dailyHeartPoints.values.length > 0 ? (
            <ScrollableChart
              dataLength={dailyHeartPoints?.values?.length || 0}
              visibleWidth={chartWidth}
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

        <Text style={styles.caption}>Heart Points (HP) progress for each day.</Text>

        {dailyHeartPointsCharts &&
          (dailyHeartPointsCharts.target !== undefined ||
            dailyHeartPointsCharts.actual !== undefined ||
            dailyHeartPointsCharts.performance !== undefined) && (
            <View style={styles.summaryMetricsRow}>
              {dailyHeartPointsCharts.target !== undefined &&
                dailyHeartPointsCharts.target !== null && (
                  <Text style={styles.summaryMetricTarget}>
                    Target: {dailyHeartPointsCharts.target}
                  </Text>
                )}
              {dailyHeartPointsCharts.actual !== undefined &&
                dailyHeartPointsCharts.actual !== null && (
                  <Text style={styles.summaryMetricActual}>
                    Actual: {dailyHeartPointsCharts.actual}
                  </Text>
                )}
              {dailyHeartPointsCharts.performance !== undefined &&
                dailyHeartPointsCharts.performance !== null && (
                  <Text style={styles.summaryMetricPerformance}>
                    Performance: {dailyHeartPointsCharts.performance}%
                  </Text>
                )}
            </View>
          )}
      </View>

      {/* Modified Heart Point (MHP) Card */}
      <View style={[styles.card, styles.heartPointsCard]}>
        <View style={styles.cardTitleRow}>
          <View
            style={[
              styles.cardIconContainer,
              { backgroundColor: '#FEE2E2' },
            ]}
          >
            <Text style={styles.emptyChartIcon}>💓</Text>
          </View>
          <Text style={styles.cardTitle}>Modified Heart Point (MHP)</Text>
        </View>

        <View style={styles.chartWrapper}>
          <ScrollableChart
            dataLength={staticMhpData.values.length}
            visibleWidth={chartWidth}
          >
            {computedWidth => (
              <BarChart
                values={staticMhpData.values}
                labels={staticMhpData.labels}
                width={computedWidth}
                height={180}
                maxY={mhpMax}
                yTicks={getDynamicTicks(mhpMax)}
                color="#E11D48"
              />
            )}
          </ScrollableChart>
        </View>

        <Text style={styles.caption}>Modified Heart Point (MHP) progress across active recovery days.</Text>
      </View>
      {!isINOXuser && (
        <>
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: METRIC_COLORS.calories.light },
                ]}
              >
                <Text style={styles.emptyChartIcon}>🔥</Text>
              </View>
              <Text style={styles.cardTitle}>Daily Energy Expended Breakdown</Text>
            </View>

            <View style={styles.chartWrapper}>
              {energyExpended?.values && energyExpended.values.length > 0 ? (
                <ScrollableChart
                  dataLength={energyExpended?.values?.length || 0}
                  visibleWidth={chartWidth}
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
            <Text style={styles.caption}>
              Energy expended performance across the week.
            </Text>

            {energyExpandedCharts &&
              (energyExpandedCharts.target !== undefined ||
                energyExpandedCharts.actual !== undefined ||
                energyExpandedCharts.performance !== undefined) && (
                <View style={styles.summaryMetricsRow}>
                  {energyExpandedCharts.target !== undefined &&
                    energyExpandedCharts.target !== null && (
                      <Text style={styles.summaryMetricTarget}>
                        Target: {energyExpandedCharts.target}
                      </Text>
                    )}
                  {energyExpandedCharts.actual !== undefined &&
                    energyExpandedCharts.actual !== null && (
                      <Text style={styles.summaryMetricActual}>
                        Actual: {energyExpandedCharts.actual}
                      </Text>
                    )}
                  {energyExpandedCharts.performance !== undefined &&
                    energyExpandedCharts.performance !== null && (
                      <Text style={styles.summaryMetricPerformance}>
                        Performance: {energyExpandedCharts.performance}%
                      </Text>
                    )}
                </View>
              )}
          </View>
          <View style={[styles.card, styles.sdexCard]}>
            <View style={styles.cardTitleRow}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: DC.tealLight },
                ]}
              >
                <Text style={styles.emptyChartIcon}>⚡</Text>
              </View>
              <Text style={styles.cardTitle}>
                Daily S-DEX Activity Breakdown
              </Text>
            </View>

            <View style={styles.chartWrapper}>
              {sdexActivity?.values && sdexActivity.values.length > 0 ? (
                <ScrollableChart
                  dataLength={sdexActivity?.values?.length || 0}
                  visibleWidth={chartWidth}
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
                    />
                  )}
                </ScrollableChart>
              ) : (
                <EmptyChart title="S-DEX" />
              )}
            </View>
            <Text style={styles.caption}>
              S-DEX activity trend across the week.
            </Text>

            {dailySdexCharts &&
              (dailySdexCharts.target !== undefined ||
                dailySdexCharts.actual !== undefined ||
                dailySdexCharts.performance !== undefined) && (
                <View style={styles.summaryMetricsRow}>
                  {dailySdexCharts.target !== undefined &&
                    dailySdexCharts.target !== null && (
                      <Text style={styles.summaryMetricTarget}>
                        Target: {dailySdexCharts.target}
                      </Text>
                    )}
                  {dailySdexCharts.actual !== undefined &&
                    dailySdexCharts.actual !== null && (
                      <Text style={styles.summaryMetricActual}>
                        Actual: {dailySdexCharts.actual}
                      </Text>
                    )}
                  {dailySdexCharts.performance !== undefined &&
                    dailySdexCharts.performance !== null && (
                      <Text style={styles.summaryMetricPerformance}>
                        Performance: {dailySdexCharts.performance}%
                      </Text>
                    )}
                </View>
              )}
          </View>
          <View style={[styles.card, { borderLeftWidth: 4, borderLeftColor: METRIC_COLORS.minutes.main }]}>
            <View style={styles.cardTitleRow}>
              <View
                style={[
                  styles.cardIconContainer,
                  { backgroundColor: METRIC_COLORS.minutes.light },
                ]}
              >
                <Text style={styles.emptyChartIcon}>⏱️</Text>
              </View>
              <Text style={styles.cardTitle}>
                Daily Active Minutes Breakdown
              </Text>
            </View>

            <View style={styles.chartWrapper}>
              {dailyActiveMinutes?.values && dailyActiveMinutes.values.length > 0 ? (
                <ScrollableChart
                  dataLength={dailyActiveMinutes?.values?.length || 0}
                  visibleWidth={chartWidth}
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
            <Text style={styles.caption}>
              Active minutes recorded across the week.
            </Text>

            {dailyActiveMinutesCharts &&
              (dailyActiveMinutesCharts.target !== undefined ||
                dailyActiveMinutesCharts.actual !== undefined ||
                dailyActiveMinutesCharts.performance !== undefined) && (
                <View style={styles.summaryMetricsRow}>
                  {dailyActiveMinutesCharts.target !== undefined &&
                    dailyActiveMinutesCharts.target !== null && (
                      <Text style={styles.summaryMetricTarget}>
                        Target: {dailyActiveMinutesCharts.target}
                      </Text>
                    )}
                  {dailyActiveMinutesCharts.actual !== undefined &&
                    dailyActiveMinutesCharts.actual !== null && (
                      <Text style={styles.summaryMetricActual}>
                        Actual: {dailyActiveMinutesCharts.actual} min
                      </Text>
                    )}
                  {dailyActiveMinutesCharts.performance !== undefined &&
                    dailyActiveMinutesCharts.performance !== null && (
                      <Text style={styles.summaryMetricPerformance}>
                        Performance: {dailyActiveMinutesCharts.performance}%
                      </Text>
                    )}
                </View>
              )}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Insights & Alerts</Text>
            <View style={styles.insightContainer}>
              <View style={styles.insightItem}>
                <Text style={[styles.insightText, { color: DC.skyBrand }]}>
                  {dailyInsightText || "Your activity insights and personalized health alerts will appear here based on your trends."}
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </>
  );
};

export { FitnessTab };
