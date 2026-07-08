import React from 'react';
import {ScrollView, Text, View} from 'react-native';

import {
  BarChart,
  SegmentedGauge,
  SingleLineChart,
} from '../../components/charts/CustomSvgCharts';
import {
  healthVitalityColors as C,
  speedometerColor,
  dashboardColors as DC,
} from '../../theme/dashboardColors';
import {styles} from './styles';
import {IFitnessTabProps} from '../../types';

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

const EmptyChart = ({title}: {title: string}) => (
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
    <View style={{width: visibleWidth}}>
      {dataLength > 7 && (
        <View style={styles.scrollIndicatorContainer}>
          <Text style={styles.scrollIndicatorText}>Scroll for more</Text>
          <Text style={styles.scrollIndicatorArrow}>→</Text>
        </View>
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{flexGrow: 1}}>
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
  totalHeartPoint = 0,
  totalDailySdex = 0,
  dailyHeartPointsCharts,
  dailySdexCharts,
  dailyStepsBreakdownCharts,
  energyExpandedCharts,
}: IFitnessTabProps) => {
  const stepsMax = getDynamicMax(dailyStepsBreakdown?.values || []);

  const heartPointsMax = getDynamicMax(dailyHeartPoints?.values || []);

  const sdexMax = getDynamicMax(
    sdexActivity?.values?.length ? sdexActivity.values : [0],
  );

  const isINOXuser = false; // Mocked GJBARCCIN1 check since promo code logic is not used in current codebase

  return (
    <>
      <View style={[styles.card, styles.performanceCard, {gap: 5}]}>
        <View style={styles.cardTitleRow}>
          <View
            style={[
              styles.cardIconContainer,
              {backgroundColor: DC.purpleLight},
            ]}>
            <Text style={styles.emptyChartIcon}>📊</Text>
          </View>
          <Text style={styles.cardTitle}>Weekly Performance</Text>
        </View>

        <View style={styles.speedometerRow}>
          <View style={styles.speedometerCard}>
            <Text style={styles.speedometerLabel}>
              Heart Points{`\n`}(Weekly Total)
            </Text>
            <SegmentedGauge
              value={totalHeartPoint}
              size={!isINOXuser ? 130 : 200}
              segments={[
                {maxValue: 74, color: speedometerColor.light},
                {maxValue: 159, color: speedometerColor.base},
                {maxValue: 299, color: speedometerColor.light100},
                {maxValue: 400, color: speedometerColor.medium},
              ]}
            />
            <Text style={styles.speedometerValueLabel}>{totalHeartPoint}</Text>
            <View style={styles.legendContainer}>
              <View style={styles.legendRows}>
                <View
                  style={[
                    styles.legendDot,
                    {backgroundColor: speedometerColor.light},
                  ]}
                />
                <Text style={styles.legendText}>0-74 Bronze / High Risk</Text>
              </View>

              <View style={styles.legendRows}>
                <View
                  style={[
                    styles.legendDot,
                    {backgroundColor: speedometerColor.base},
                  ]}
                />
                <Text style={styles.legendText}>
                  75-159 Silver / Moderate Risk
                </Text>
              </View>

              <View style={styles.legendRows}>
                <View
                  style={[
                    styles.legendDot,
                    {backgroundColor: speedometerColor.light100},
                  ]}
                />
                <Text style={styles.legendText}>150-299 Gold / Low Risk</Text>
              </View>

              <View style={styles.legendRows}>
                <View
                  style={[
                    styles.legendDot,
                    {backgroundColor: speedometerColor.medium},
                  ]}
                />
                <Text style={styles.legendText}>
                  300+ Platinum / Very Low Risk
                </Text>
              </View>
            </View>
          </View>

          {!isINOXuser && (
            <View style={styles.speedometerCard}>
              <Text style={styles.speedometerLabel}>
                S-DEX SCORE{`\n`}(Average)
              </Text>
              <SegmentedGauge
                value={totalDailySdex}
                size={130}
                segments={[
                  {maxValue: 40, color: speedometerColor.light100},
                  {maxValue: 65, color: speedometerColor.base},
                  {maxValue: 100, color: speedometerColor.light},
                ]}
              />
              <Text style={styles.speedometerValueLabel}>{totalDailySdex}</Text>
              <View style={styles.legendContainer}>
                <View style={styles.legendRows}>
                  <View
                    style={[
                      styles.legendDot,
                      {backgroundColor: speedometerColor.light100},
                    ]}
                  />
                  <Text style={styles.legendText}>
                    {'<40: Low Risk\nHigh Cardiovascular mobility'}
                  </Text>
                </View>

                <View style={styles.legendRows}>
                  <View
                    style={[
                      styles.legendDot,
                      {backgroundColor: speedometerColor.base},
                    ]}
                  />
                  <Text style={styles.legendText}>
                    {'40-65: Moderate Risk\nBorderline Risk Profile'}
                  </Text>
                </View>

                <View style={styles.legendRows}>
                  <View
                    style={[
                      styles.legendDot,
                      {backgroundColor: speedometerColor.light},
                    ]}
                  />
                  <Text style={styles.legendText}>
                    {
                      '>65: High Risk\nHigh Arterial Loading and Reconditioning Risk'
                    }
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.card, styles.stepsCard]}>
        <View style={styles.cardTitleRow}>
          <View
            style={[styles.cardIconContainer, {backgroundColor: DC.blueLight}]}>
            <Text style={styles.emptyChartIcon}>👣</Text>
          </View>
          <Text style={styles.cardTitle}>Daily Steps Breakdown</Text>
        </View>

        <View style={styles.chartWrapper}>
          {dailyStepsBreakdown?.values?.some(v => v > 0) ? (
            <ScrollableChart
              dataLength={dailyStepsBreakdown?.values?.length || 0}
              visibleWidth={chartWidth}>
              {computedWidth => (
                <BarChart
                  values={dailyStepsBreakdown.values}
                  labels={dailyStepsBreakdown.labels}
                  width={computedWidth}
                  height={180}
                  maxY={stepsMax}
                  yTicks={getDynamicTicks(stepsMax)}
                />
              )}
            </ScrollableChart>
          ) : (
            <EmptyChart title="steps" />
          )}
        </View>

        <Text style={styles.caption}>Total daily steps across the week.</Text>

        {dailyStepsBreakdownCharts && (
          <View style={styles.summaryMetricsRow}>
            <Text style={styles.summaryMetricTarget}>
              Target: {dailyStepsBreakdownCharts.target}
            </Text>
            <Text style={styles.summaryMetricActual}>
              Actual: {dailyStepsBreakdownCharts.actual}
            </Text>
            <Text style={styles.summaryMetricPerformance}>
              Performance: {dailyStepsBreakdownCharts.performance}%
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.card, styles.heartPointsCard]}>
        <View style={styles.cardTitleRow}>
          <View
            style={[styles.cardIconContainer, {backgroundColor: DC.roseLight}]}>
            <Text style={styles.emptyChartIcon}>❤️</Text>
          </View>
          <Text style={styles.cardTitle}>Daily Heart Points Breakdown</Text>
        </View>

        <View style={styles.chartWrapper}>
          {dailyHeartPoints?.values?.some(v => v > 0) ? (
            <ScrollableChart
              dataLength={dailyHeartPoints?.values?.length || 0}
              visibleWidth={chartWidth}>
              {computedWidth => (
                <BarChart
                  values={dailyHeartPoints.values}
                  labels={dailyHeartPoints.labels}
                  width={computedWidth}
                  height={180}
                  maxY={heartPointsMax}
                  yTicks={getDynamicTicks(heartPointsMax)}
                />
              )}
            </ScrollableChart>
          ) : (
            <EmptyChart title="heart point" />
          )}
        </View>

        <Text style={styles.caption}>Heart point progress for each day.</Text>

        {dailyHeartPointsCharts && (
          <View style={styles.summaryMetricsRow}>
            <Text style={styles.summaryMetricTarget}>
              Target: {dailyHeartPointsCharts.target}
            </Text>
            <Text style={styles.summaryMetricActual}>
              Actual: {dailyHeartPointsCharts.actual}
            </Text>
            <Text style={styles.summaryMetricPerformance}>
              Performance: {dailyHeartPointsCharts.performance}%
            </Text>
          </View>
        )}
      </View>
      {!isINOXuser && (
        <>
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Energy Expended</Text>

            <View style={styles.chartWrapper}>
              {energyExpended?.values?.some(v => v > 0) ? (
                <ScrollableChart
                  dataLength={energyExpended?.values?.length || 0}
                  visibleWidth={chartWidth}>
                  {computedWidth => (
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
                      color={C.primary}
                      filled={
                        energyExpended.values?.length > 1 &&
                        energyExpended.values?.some(v => v > 0)
                      }
                    />
                  )}
                </ScrollableChart>
              ) : (
                <EmptyChart title="energy expended" />
              )}
            </View>
            <Text style={styles.caption}>
              Energy expended performance across the week.
            </Text>

            {energyExpandedCharts && (
              <View style={styles.summaryMetricsRow}>
                <Text style={styles.summaryMetricTarget}>
                  Target: {energyExpandedCharts.target}
                </Text>
                <Text style={styles.summaryMetricActual}>
                  Actual: {energyExpandedCharts.actual}
                </Text>
                <Text style={styles.summaryMetricPerformance}>
                  Performance: {energyExpandedCharts.performance}%
                </Text>
              </View>
            )}
          </View>
          <View style={[styles.card, styles.sdexCard]}>
            <View style={styles.cardTitleRow}>
              <View
                style={[
                  styles.cardIconContainer,
                  {backgroundColor: DC.tealLight},
                ]}>
                <Text style={styles.emptyChartIcon}>⚡</Text>
              </View>
              <Text style={styles.cardTitle}>
                Daily S-DEX Activity Breakdown
              </Text>
            </View>

            <View style={styles.chartWrapper}>
              {sdexActivity?.values?.some(v => v > 0) ? (
                <ScrollableChart
                  dataLength={sdexActivity?.values?.length || 0}
                  visibleWidth={chartWidth}>
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

            {dailySdexCharts && (
              <View style={styles.summaryMetricsRow}>
                <Text style={styles.summaryMetricTarget}>
                  Target: {dailySdexCharts.target}
                </Text>
                <Text style={styles.summaryMetricActual}>
                  Actual: {dailySdexCharts.actual}
                </Text>
                <Text style={styles.summaryMetricPerformance}>
                  Performance: {dailySdexCharts.performance}%
                </Text>
              </View>
            )}
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Insights & Alerts</Text>
            <View style={styles.insightContainer}>
              <View style={styles.insightItem}>
                <Text style={[styles.insightText, {color: DC.skyBrand}]}>
                  Your activity insights and personalized health alerts will
                  appear here based on your trends.
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </>
  );
};

export {FitnessTab};
