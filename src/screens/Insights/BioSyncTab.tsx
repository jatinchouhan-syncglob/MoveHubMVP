import React from 'react';
import {ScrollView, Text, View} from 'react-native';

import {
  BarChart,
  DonutChart,
  DualLineChart,
  LegendItem,
  moveHubColor,
} from '../../components/charts/CustomSvgCharts';
import {
  speedometerColor,
  dashboardColors as DC,
} from '../../theme/dashboardColors';
import {styles} from './styles';
import {IBioSyncTabProps, PillarHealthItem} from '../../types';

const colors = {
  ...moveHubColor,
  amber: '#f59e0b',
  purple: '#a855f7',
};

// Simple self-contained layout components
const Card = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.card}>{children}</View>
);

const Spacing = ({ top = 0, left = 0 }: { top?: number; left?: number }) => (
  <View style={{ height: top, width: left }} />
);

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
      <Text style={styles.emptyChartIcon}>🧬</Text>
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

const getStatusDetails = (
  statusProp?: string,
  pillarData?: PillarHealthItem[],
) => {
  let status = statusProp?.toLowerCase();

  if (!status && pillarData && pillarData.length > 0) {
    const droppedCount = pillarData.filter(p => p.value < 90).length;
    if (droppedCount === 0) {
      status = 'green';
    } else if (droppedCount === 1) {
      status = 'amber';
    } else {
      status = 'red';
    }
  }

  if (!status) {
    status = 'green';
  }

  switch (status) {
    case 'green':
      return {
        color: '#22C55E',
        bgColor: 'rgba(34, 197, 94, 0.1)',
        textColor: '#15803D',
        text: 'Optimal Burn',
      };
    case 'red':
      return {
        color: '#EF4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        textColor: '#B91C1C',
        text: 'Metabolic Stall Risk',
      };
    case 'amber':
    default:
      return {
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        textColor: '#B45309',
        text: 'Moderate Fluctuations',
      };
  }
};

const renderTrendIndicator = (trend?: string, value?: number | string) => {
  const trendLower = trend ? trend.toLowerCase() : '';
  if (trendLower === 'increase') {
    return (
      <View style={styles.metricTrendBox}>
        <Text style={[styles.metricArrow, { color: '#22c55e', fontSize: 12 }]}>▲</Text>
        <Text style={{ color: '#22c55e', fontSize: 9.5, fontWeight: '700', marginLeft: 2 }}>Increase</Text>
      </View>
    );
  }
  if (trendLower === 'decrease') {
    return (
      <View style={styles.metricTrendBox}>
        <Text style={[styles.metricArrow, styles.metricArrowDown, { color: '#ef4444', fontSize: 12 }]}>▼</Text>
        <Text style={{ color: '#ef4444', fontSize: 9.5, fontWeight: '700', marginLeft: 2 }}>Decrease</Text>
      </View>
    );
  }
  return (
    <View style={styles.metricTrendBox}>
      <Text style={{ color: '#94a3b8', fontSize: 9.5, fontWeight: '600' }}>—</Text>
    </View>
  );
};

const BioSyncTab = ({
  chartWidth,
  energyEfficiency,
  integratedStamina,
  pulsePaceIndex,
  weeklyPerformance,
  weeklyPerformanceSummary,
  pillarHealthData,
  cardioYieldData,
  weeklyBioSyncEfficiencyScore,
  eePerKmCharts,
  integratedStaminaCharts,
  weeklyTrendCharts,
  cardioYieldPerStepCharts,
  status,
  dailyInsightText,
}: IBioSyncTabProps) => {
  const energyEfficiencyMax = getDynamicMax(energyEfficiency?.values || []);
  const integratedStaminaMax = getDynamicMax(integratedStamina?.values || []);

  const ppiData =
    pulsePaceIndex && pulsePaceIndex.values.length > 0
      ? pulsePaceIndex
      : {
          values: (cardioYieldData || []).map(item =>
            item.stacks.reduce((a, b) => a + b, 0),
          ),
          labels: (cardioYieldData || []).map(item => item.day),
        };
  const pulsePaceIndexMax = getDynamicMax(ppiData.values);

  const statusDetails = getStatusDetails(status, pillarHealthData);

  return (
    <>
      <View style={[styles.card, styles.efficiencyCard]}>
        <View style={styles.cardTitleRow}>
          <View
            style={[
              styles.cardIconContainer,
              {backgroundColor: DC.indigoLight},
            ]}>
            <Text style={styles.emptyChartIcon}>✨</Text>
          </View>
          <Text style={[styles.cardTitle, {color: DC.indigoBrand}]}>
            Bio Sync Efficiency (BSE)
          </Text>
        </View>
        <View style={styles.donutContainer}>
          <View style={styles.donutChartWrapper}>
            <DonutChart
              pct={weeklyBioSyncEfficiencyScore}
              size={100}
              color={DC.indigoBrand}
              trackColor={DC.indigoLight}
            />
            <View style={styles.donutScoreContainer}>
              {/* <View
                style={[
                  styles.trafficLightDot,
                  {backgroundColor: statusDetails.color},
                ]}
              /> */}
              <Text style={styles.donutScoreValue}>
                {weeklyBioSyncEfficiencyScore}
              </Text>
              <Text style={styles.donutScorePercent}>%</Text>
            </View>
          </View>
          <View style={{flex: 1}}>
            {/* <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: statusDetails.bgColor,
                  borderColor: statusDetails.textColor,
                },
              ]}>
              <Text style={[styles.statusText, {color: statusDetails.textColor}]}>
                STATUS: {statusDetails.text.toUpperCase()}
              </Text>
            </View> */}
            <Spacing top={8} />
            <Text
              style={[
                styles.cardSub,
                {color: DC.indigoBrand, opacity: 0.8, fontSize: 13},
              ]}>
              Bio Sync Efficiency (BSE) performance based on your weekly health trends.
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.card, {backgroundColor: DC.roseSoft}]}>
        <View style={styles.cardTitleRow}>
          <View
            style={[styles.cardIconContainer, {backgroundColor: DC.roseLight}]}>
            <Text style={styles.emptyChartIcon}>🏛️</Text>
          </View>
          <Text style={styles.cardTitle}>Pillar Health Analysis</Text>
        </View>

        <Card>
          <View style={styles.pillarCardContent}>
            {pillarHealthData.map((item, idx) => (
              <View key={`pillar-${item.label}-${idx}`}>
                <View style={styles.pillarRowHeader}>
                  <Text style={styles.pillarLabel}>{item.label}</Text>

                  <Text
                    style={[
                      styles.pillarValue,
                      {
                        color: item.color,
                      },
                    ]}>
                    {item.value}%
                  </Text>
                </View>

                <View
                  style={[
                    styles.pillarProgressBackground,
                    {height: 12, backgroundColor: DC.slateBackground},
                  ]}>
                  <View
                    style={[
                      styles.pillarProgressFill,
                      {
                        width: `${item.value}%`,
                        backgroundColor: item.color,
                        height: '100%',
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>

          {/* <Text style={styles.pillarHealthText}>
            Pillar Health{' '}
            {Number(
              ((pillarHealthData.reduce((acc, curr) => acc + curr.value, 0) ||
                0) / (pillarHealthData.length || 1)).toFixed(2),
            )}
            %
          </Text> */}
        </Card>
      </View>

      <View style={[styles.card, {backgroundColor: DC.emeraldLight}]}>
        <View style={styles.cardTitleRow}>
          <View
            style={[
              styles.cardIconContainer,
              {backgroundColor: DC.emeraldDark},
            ]}>
            <Text style={styles.emptyChartIcon}>⚡</Text>
          </View>
          <Text style={styles.cardTitle}>Energy Expenditure Economy (EE/KM) - E3</Text>
        </View>

        <View style={styles.chartWrapper}>
          {energyEfficiency?.values && energyEfficiency.values.length > 0 ? (
            <ScrollableChart
              dataLength={energyEfficiency?.values?.length || 0}
              visibleWidth={chartWidth}>
              {computedWidth => (
                <BarChart
                  values={energyEfficiency.values}
                  labels={energyEfficiency.labels}
                  width={computedWidth}
                  height={170}
                  maxY={energyEfficiencyMax}
                  yTicks={getDynamicTicks(energyEfficiencyMax)}
                />
              )}
            </ScrollableChart>
          ) : (
            <EmptyChart title="Energy Expenditure Economy (EE/KM)" />
          )}
        </View>
        <Text style={styles.caption}>
          Lower energy per km (EE/KM - E3) indicates higher metabolic economy.
        </Text>

        {eePerKmCharts &&
          (eePerKmCharts.target !== undefined ||
            eePerKmCharts.actual !== undefined ||
            eePerKmCharts.performance !== undefined) && (
            <View style={styles.summaryMetricsRow}>
              {eePerKmCharts.target !== undefined &&
                eePerKmCharts.target !== null && (
                  <Text style={styles.summaryMetricTarget}>
                    Target: {eePerKmCharts.target}
                  </Text>
                )}
              {eePerKmCharts.actual !== undefined &&
                eePerKmCharts.actual !== null && (
                  <Text style={styles.summaryMetricActual}>
                    Actual: {eePerKmCharts.actual}
                  </Text>
                )}
              {eePerKmCharts.performance !== undefined &&
                eePerKmCharts.performance !== null && (
                  <Text style={styles.summaryMetricPerformance}>
                    Performance: {eePerKmCharts.performance}%
                  </Text>
                )}
            </View>
          )}
      </View>
      <View style={[styles.card, {backgroundColor: DC.skyLight}]}>
        <View style={styles.cardTitleRow}>
          <View
            style={[styles.cardIconContainer, {backgroundColor: DC.blueLight}]}>
            <Text style={styles.emptyChartIcon}>🏃</Text>
          </View>
          <Text style={styles.cardTitle}>Pulse Pace Index (PPI) - Intensity</Text>
        </View>

        <View style={styles.chartWrapper}>
          {ppiData?.values && ppiData.values.length > 0 ? (
            <ScrollableChart
              dataLength={ppiData.values.length}
              visibleWidth={chartWidth}>
              {computedWidth => (
                <BarChart
                  values={ppiData.values}
                  labels={ppiData.labels}
                  width={computedWidth}
                  height={170}
                  maxY={pulsePaceIndexMax}
                  yTicks={getDynamicTicks(pulsePaceIndexMax)}
                />
              )}
            </ScrollableChart>
          ) : (
            <EmptyChart title="Pulse Pace Index (PPI)" />
          )}
        </View>
        <Text style={styles.caption}>
          Pulse Pace Index (PPI) measures cardiovascular workout intensity over time.
        </Text>

        {cardioYieldPerStepCharts &&
          (cardioYieldPerStepCharts.target !== undefined ||
            cardioYieldPerStepCharts.actual !== undefined ||
            cardioYieldPerStepCharts.performance !== undefined) && (
            <View style={styles.summaryMetricsRow}>
              {cardioYieldPerStepCharts.target !== undefined &&
                cardioYieldPerStepCharts.target !== null && (
                  <Text style={styles.summaryMetricTarget}>
                    Target: {cardioYieldPerStepCharts.target}
                  </Text>
                )}
              {cardioYieldPerStepCharts.actual !== undefined &&
                cardioYieldPerStepCharts.actual !== null && (
                  <Text style={styles.summaryMetricActual}>
                    Actual: {cardioYieldPerStepCharts.actual}
                  </Text>
                )}
              {cardioYieldPerStepCharts.performance !== undefined &&
                cardioYieldPerStepCharts.performance !== null && (
                  <Text style={styles.summaryMetricPerformance}>
                    Performance: {cardioYieldPerStepCharts.performance}%
                  </Text>
                )}
            </View>
          )}
      </View>
      <View style={[styles.card, {backgroundColor: DC.amberLight}]}>
        <View style={styles.cardTitleRow}>
          <View
            style={[styles.cardIconContainer, {backgroundColor: DC.amberDark}]}>
            <Text style={styles.emptyChartIcon}>🔋</Text>
          </View>
          <Text style={styles.cardTitle}>Interdaily Stamina (IS)</Text>
        </View>

        <View style={styles.chartWrapper}>
          {integratedStamina?.values && integratedStamina.values.length > 0 ? (
            <ScrollableChart
              dataLength={integratedStamina?.values?.length || 0}
              visibleWidth={chartWidth}>
              {computedWidth => (
                <BarChart
                  values={integratedStamina.values}
                  labels={integratedStamina.labels}
                  width={computedWidth}
                  height={170}
                  maxY={integratedStaminaMax}
                  yTicks={getDynamicTicks(integratedStaminaMax)}
                />
              )}
            </ScrollableChart>
          ) : (
            <EmptyChart title="Interdaily Stamina (IS)" />
          )}
        </View>
        <Text style={styles.caption}>Interdaily Stamina (IS) is tracked across the week.</Text>

        <Text style={styles.consistencyGuideTitle}>
          CONSISTENCY RATING GUIDE
        </Text>

        <View style={styles.consistencyItem}>
          <View
            style={[
              styles.consistencyIconBox,
              {
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                borderColor: DC.greenBright,
              },
            ]}>
            <Text style={[styles.consistencyIconText, {color: DC.greenDeep}]}>
              A
            </Text>
          </View>
          <View style={styles.consistencyInfo}>
            <Text style={styles.consistencyLabel}>Daily Commuter</Text>
            <Text style={styles.consistencyDescription}>
              ~22+ points every day
            </Text>
          </View>
        </View>

        <View style={styles.consistencyItem}>
          <View
            style={[
              styles.consistencyIconBox,
              {
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: DC.skyDark,
              },
            ]}>
            <Text style={[styles.consistencyIconText, {color: DC.skyBrand}]}>
              A-
            </Text>
          </View>
          <View style={styles.consistencyInfo}>
            <Text style={styles.consistencyLabel}>Power Streak</Text>
            <Text style={styles.consistencyDescription}>
              50+ points on 3+ days
            </Text>
          </View>
        </View>

        <View style={[styles.consistencyItem, {marginBottom: 0}]}>
          <View
            style={[
              styles.consistencyIconBox,
              {
                backgroundColor: 'rgba(180, 83, 9, 0.2)',
                borderColor: DC.goldDark,
              },
            ]}>
            <Text style={[styles.consistencyIconText, {color: DC.amberDeep}]}>
              B-
            </Text>
          </View>
          <View style={styles.consistencyInfo}>
            <Text style={styles.consistencyLabel}>Weekend Warrior</Text>
            <Text style={styles.consistencyDescription}>
              75+ pts Sat & Sun, low weekdays
            </Text>
          </View>
        </View>

        {integratedStaminaCharts &&
          (integratedStaminaCharts.target !== undefined ||
            integratedStaminaCharts.actual !== undefined ||
            integratedStaminaCharts.performance !== undefined) && (
            <View style={styles.summaryMetricsRow}>
              {integratedStaminaCharts.target !== undefined &&
                integratedStaminaCharts.target !== null && (
                  <Text style={styles.summaryMetricTarget}>
                    Target: {integratedStaminaCharts.target}
                  </Text>
                )}
              {integratedStaminaCharts.actual !== undefined &&
                integratedStaminaCharts.actual !== null && (
                  <Text style={styles.summaryMetricActual}>
                    Actual: {integratedStaminaCharts.actual}
                  </Text>
                )}
              {integratedStaminaCharts.performance !== undefined &&
                integratedStaminaCharts.performance !== null && (
                  <Text style={styles.summaryMetricPerformance}>
                    Performance: {integratedStaminaCharts.performance}%
                  </Text>
                )}
            </View>
          )}
      </View>
      <View style={[styles.card, {backgroundColor: DC.slateLight}]}>
        <View style={styles.cardTitleRow}>
          <View
            style={[
              styles.cardIconContainer,
              {backgroundColor: DC.slateMedium},
            ]}>
            <Text style={styles.emptyChartIcon}>📈</Text>
          </View>
          <Text style={styles.cardTitle}>Weekly Performance Metrics</Text>
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>
              {weeklyPerformanceSummary.eeKmAvg}
            </Text>
            {renderTrendIndicator(weeklyPerformanceSummary.eeKmTrend, weeklyPerformanceSummary.eeKmAvg)}
            <Text style={styles.metricLabel}>EE/KM (E3) Avg</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricValue}>
              {weeklyPerformanceSummary.isAvg}
            </Text>
            {renderTrendIndicator(weeklyPerformanceSummary.isTrend, weeklyPerformanceSummary.isAvg)}
            <Text style={styles.metricLabel}>IS (Stamina) Avg</Text>
          </View>
          <View style={[styles.metricItem, styles.metricItemLast]}>
            <Text style={styles.metricValue}>
              {weeklyPerformanceSummary.cysTotal}
            </Text>
            {renderTrendIndicator(weeklyPerformanceSummary.cysTrend, weeklyPerformanceSummary.cysTotal)}
            <Text style={styles.metricLabel}>PPI (Intensity) Total</Text>
          </View>
        </View>
        <View style={styles.chartWrapper}>
          {weeklyPerformance?.labels && weeklyPerformance.labels.length > 0 ? (
            <ScrollableChart
              dataLength={weeklyPerformance.labels.length}
              visibleWidth={chartWidth}>
              {computedWidth => (
                <DualLineChart
                  series={[
                    {
                      values: weeklyPerformance.eeKm,
                      color: '#F97316', // Power Orange for EE/KM (E3)
                      dashed: true,
                      filled: false,
                      gradId: 'gradEeKm',
                    },
                    {
                      values: weeklyPerformance.is,
                      color: '#10B981', // Emerald Green for IS (Stamina)
                      filled: false,
                      gradId: 'gradIs',
                    },
                    {
                      values: weeklyPerformance.cys,
                      color: '#3B82F6', // Electric Blue for PPI (Intensity)
                      filled: false,
                      gradId: 'gradCys',
                    },
                  ]}
                  labels={weeklyPerformance.labels}
                  width={computedWidth}
                  height={205}
                />
              )}
            </ScrollableChart>
          ) : (
            <EmptyChart title="Weekly Performance" />
          )}
        </View>

        <View style={styles.legendRow}>
          <LegendItem color="#F97316" label="EE/KM (E3)" dashed />

          <LegendItem color="#10B981" label="IS (Stamina)" />

          <LegendItem color="#3B82F6" label="PPI (Intensity)" />
        </View>

        <Text style={styles.caption}>
          Weekly trend for EE/KM (E3), IS (Stamina) and PPI (Intensity) performance.
        </Text>

        {weeklyTrendCharts &&
          (weeklyTrendCharts.target !== undefined ||
            weeklyTrendCharts.actual !== undefined ||
            weeklyTrendCharts.performance !== undefined) && (
            <View style={styles.summaryMetricsRow}>
              {weeklyTrendCharts.target !== undefined &&
                weeklyTrendCharts.target !== null && (
                  <Text style={styles.summaryMetricTarget}>
                    Target: {weeklyTrendCharts.target}
                  </Text>
                )}
              {weeklyTrendCharts.actual !== undefined &&
                weeklyTrendCharts.actual !== null && (
                  <Text style={styles.summaryMetricActual}>
                    Actual: {weeklyTrendCharts.actual}
                  </Text>
                )}
              {weeklyTrendCharts.performance !== undefined &&
                weeklyTrendCharts.performance !== null && (
                  <Text style={styles.summaryMetricPerformance}>
                    Performance: {weeklyTrendCharts.performance}%
                  </Text>
                )}
            </View>
          )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Future Insights & Recommendations</Text>
        <View style={styles.recommendationContainer}>
          <Text style={[styles.cardSub, styles.recommendationText, { color: DC.skyBrand, fontWeight: '500' }]}>
            {dailyInsightText ||
              'Personalized sleep, recovery and nutrition recommendations will appear here based on your Bio-Sync trends.'}
          </Text>
        </View>
      </View>
    </>
  );
};

export {BioSyncTab};
