import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {
  BarChart,
  DonutChart,
  DualLineChart,
  LegendItem,
} from '../../components/charts/CustomSvgCharts';
import {
  dashboardColors as DC,
} from '../../theme/dashboardColors';
import {styles} from './styles';
import {IBioSyncTabProps, PillarHealthItem} from '../../types';

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

const renderTrendIndicator = (
  trend?: string,
  value?: number | string,
  isStamina?: boolean,
) => {
  const trendLower = trend ? trend.toLowerCase() : '';
  if (trendLower === 'increase') {
    const arrowColor = isStamina ? '#ef4444' : '#22c55e';
    return (
      <View style={styles.metricTrendBox}>
        <Text style={[styles.metricArrow, { color: arrowColor, fontSize: 12 }]}>▲</Text>
        <Text style={{ color: arrowColor, fontSize: 9.5, fontWeight: '700', marginLeft: 2 }}>Increase</Text>
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
  const innerChartWidth = chartWidth - 24;

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
      {/* 1. Bio Sync Efficiency (BSE) Card */}
      <LinearGradient
        colors={['#EEF2FF', '#E0E7FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderWidth: 1.5,
            borderColor: '#C7D2FE',
            shadowColor: '#4F46E5',
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
                  borderColor: '#C7D2FE',
                  shadowColor: '#4F46E5',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.08,
                  shadowRadius: 4,
                  elevation: 2,
                },
              ]}>
              <Text style={styles.emptyChartIcon}>✨</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: '#312E81', fontSize: 15, fontWeight: '800' }]}>
                Bio Sync Efficiency (BSE)
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: statusDetails.bgColor,
                borderColor: statusDetails.color,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 20,
              },
            ]}>
            <Text style={[styles.statusText, { color: statusDetails.textColor, fontSize: 10, fontWeight: '800' }]}>
              {statusDetails.text.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={[styles.donutContainer, { marginTop: 4, alignItems: 'center' }]}>
          <View style={[styles.donutChartWrapper, { backgroundColor: '#FFFFFF', borderRadius: 60, padding: 6, shadowColor: '#4F46E5', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 }]}>
            <DonutChart
              pct={weeklyBioSyncEfficiencyScore}
              size={100}
              color={DC.indigoBrand}
              trackColor="#C7D2FE"
            />
            <View style={styles.donutScoreContainer}>
              <View
                style={[
                  styles.trafficLightDot,
                  { backgroundColor: statusDetails.color },
                ]}
              />
              <Text style={[styles.donutScoreValue, { color: '#1E1B4B', fontWeight: '900' }]}>
                {weeklyBioSyncEfficiencyScore}
              </Text>
              <Text style={[styles.donutScorePercent, { color: '#6366F1', fontWeight: '700' }]}>%</Text>
            </View>
          </View>

          <View style={{ flex: 1, paddingLeft: 8 }}>
            <Text
              style={[
                styles.cardSub,
                { color: '#3730A3', fontSize: 12.5, lineHeight: 18, fontWeight: '500' },
              ]}>
              Bio Sync Efficiency (BSE) performance based on your weekly health trends.
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* 2. Pillar Health Analysis Card */}
      <LinearGradient
        colors={['#F8FAFC', '#F1F5F9']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderWidth: 1.5,
            borderColor: '#CBD5E1',
            shadowColor: '#64748B',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
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
                borderColor: '#CBD5E1',
                shadowColor: '#64748B',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}>
            <Text style={styles.emptyChartIcon}>🏛️</Text>
          </View>
          <Text style={[styles.cardTitle, { color: '#1E293B', fontSize: 15, fontWeight: '800' }]}>
            Pillar Health Analysis
          </Text>
        </View>

        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 }}>
          <View style={styles.pillarCardContent}>
            {pillarHealthData.map((item, idx) => (
              <View key={`pillar-${item.label}-${idx}`}>
                <View style={styles.pillarRowHeader}>
                  <Text style={[styles.pillarLabel, { fontWeight: '700', color: '#1E293B' }]}>{item.label}</Text>

                  <Text
                    style={[
                      styles.pillarValue,
                      {
                        color: item.color,
                        fontWeight: '800',
                      },
                    ]}>
                    {item.value}%
                  </Text>
                </View>

                <View
                  style={[
                    styles.pillarProgressBackground,
                    { height: 10, backgroundColor: '#F1F5F9', borderRadius: 6 },
                  ]}>
                  <View
                    style={[
                      styles.pillarProgressFill,
                      {
                        width: `${item.value}%`,
                        backgroundColor: item.color,
                        height: '100%',
                        borderRadius: 6,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>
      </LinearGradient>

      {/* 3. Energy Expenditure Economy (EE/KM) - E3 Card */}
      <LinearGradient
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
            ]}>
            <Text style={styles.emptyChartIcon}>⚡</Text>
          </View>
          <Text style={[styles.cardTitle, { color: '#064E3B', fontSize: 15, fontWeight: '800' }]}>
            Energy Expenditure Economy (EE/KM) - E3
          </Text>
        </View>

        <View style={[styles.chartCanvasBox, { borderColor: 'rgba(5, 150, 105, 0.15)', shadowColor: '#059669' }]}>
          {energyEfficiency?.values && energyEfficiency.values.length > 0 ? (
            <ScrollableChart
              dataLength={energyEfficiency?.values?.length || 0}
              visibleWidth={innerChartWidth}>
              {computedWidth => (
                <BarChart
                  values={energyEfficiency.values}
                  labels={energyEfficiency.labels}
                  width={computedWidth}
                  height={170}
                  maxY={energyEfficiencyMax}
                  yTicks={getDynamicTicks(energyEfficiencyMax)}
                  color="#10B981"
                />
              )}
            </ScrollableChart>
          ) : (
            <EmptyChart title="Energy Expenditure Economy (EE/KM)" />
          )}
        </View>
        <Text style={[styles.caption, { color: '#065F46' }]}>
          Lower energy per km (EE/KM - E3) indicates higher metabolic economy.
        </Text>

        {eePerKmCharts &&
          (eePerKmCharts.target !== undefined ||
            eePerKmCharts.actual !== undefined ||
            eePerKmCharts.performance !== undefined) && (
            <View style={[styles.modernSummaryRow, { borderColor: '#A7F3D0' }]}>
              {eePerKmCharts.target !== undefined &&
                eePerKmCharts.target !== null && (
                  <View style={styles.modernSummaryItem}>
                    <Text style={styles.modernSummaryLabel}>Target: </Text>
                    <Text style={styles.modernSummaryValue}>{eePerKmCharts.target}</Text>
                  </View>
                )}
              {eePerKmCharts.actual !== undefined &&
                eePerKmCharts.actual !== null && (
                  <View style={styles.modernSummaryItem}>
                    <Text style={styles.modernSummaryLabel}>Actual: </Text>
                    <Text style={styles.modernSummaryValue}>{eePerKmCharts.actual}</Text>
                  </View>
                )}
              {eePerKmCharts.performance !== undefined &&
                eePerKmCharts.performance !== null && (
                  <View style={styles.modernPerformanceBadge}>
                    <Text style={styles.modernPerformanceText}>
                      Performance: {eePerKmCharts.performance}%
                    </Text>
                  </View>
                )}
            </View>
          )}
      </LinearGradient>

      {/* 4. Pulse Pace Index (PPI) - Intensity Card */}
      <LinearGradient
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
            ]}>
            <Text style={styles.emptyChartIcon}>🏃</Text>
          </View>
          <Text style={[styles.cardTitle, { color: '#1E3A8A', fontSize: 15, fontWeight: '800' }]}>
            Pulse Pace Index (PPI) - Intensity
          </Text>
        </View>

        <View style={[styles.chartCanvasBox, { borderColor: 'rgba(37, 99, 235, 0.15)', shadowColor: '#2563EB' }]}>
          {ppiData?.values && ppiData.values.length > 0 ? (
            <ScrollableChart
              dataLength={ppiData.values.length}
              visibleWidth={innerChartWidth}>
              {computedWidth => (
                <BarChart
                  values={ppiData.values}
                  labels={ppiData.labels}
                  width={computedWidth}
                  height={170}
                  maxY={pulsePaceIndexMax}
                  yTicks={getDynamicTicks(pulsePaceIndexMax)}
                  color="#3B82F6"
                />
              )}
            </ScrollableChart>
          ) : (
            <EmptyChart title="Pulse Pace Index (PPI)" />
          )}
        </View>
        <Text style={[styles.caption, { color: '#1E40AF' }]}>
          Pulse Pace Index (PPI) measures cardiovascular workout intensity over time.
        </Text>

        {cardioYieldPerStepCharts &&
          (cardioYieldPerStepCharts.target !== undefined ||
            cardioYieldPerStepCharts.actual !== undefined ||
            cardioYieldPerStepCharts.performance !== undefined) && (
            <View style={[styles.modernSummaryRow, { borderColor: '#BFDBFE' }]}>
              {cardioYieldPerStepCharts.target !== undefined &&
                cardioYieldPerStepCharts.target !== null && (
                  <View style={styles.modernSummaryItem}>
                    <Text style={styles.modernSummaryLabel}>Target: </Text>
                    <Text style={styles.modernSummaryValue}>{cardioYieldPerStepCharts.target}</Text>
                  </View>
                )}
              {cardioYieldPerStepCharts.actual !== undefined &&
                cardioYieldPerStepCharts.actual !== null && (
                  <View style={styles.modernSummaryItem}>
                    <Text style={styles.modernSummaryLabel}>Actual: </Text>
                    <Text style={styles.modernSummaryValue}>{cardioYieldPerStepCharts.actual}</Text>
                  </View>
                )}
              {cardioYieldPerStepCharts.performance !== undefined &&
                cardioYieldPerStepCharts.performance !== null && (
                  <View style={styles.modernPerformanceBadge}>
                    <Text style={styles.modernPerformanceText}>
                      Performance: {cardioYieldPerStepCharts.performance}%
                    </Text>
                  </View>
                )}
            </View>
          )}
      </LinearGradient>

      {/* 5. Interdaily Stamina (IS) Card */}
      <LinearGradient
        colors={['#FFFBEB', '#FEF3C7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderWidth: 1.5,
            borderColor: '#FDE68A',
            shadowColor: '#D97706',
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
                borderColor: '#FDE68A',
                shadowColor: '#D97706',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}>
              <Text style={styles.emptyChartIcon}>🔋</Text>
            </View>
          <Text style={[styles.cardTitle, { color: '#78350F', fontSize: 15, fontWeight: '800' }]}>
            Interdaily Stamina (IS)
          </Text>
        </View>

        <View style={[styles.chartCanvasBox, { borderColor: 'rgba(217, 119, 6, 0.15)', shadowColor: '#D97706' }]}>
          {integratedStamina?.values && integratedStamina.values.length > 0 ? (
            <ScrollableChart
              dataLength={integratedStamina?.values?.length || 0}
              visibleWidth={innerChartWidth}>
              {computedWidth => (
                <BarChart
                  values={integratedStamina.values}
                  labels={integratedStamina.labels}
                  width={computedWidth}
                  height={170}
                  maxY={integratedStaminaMax}
                  yTicks={getDynamicTicks(integratedStaminaMax)}
                  color="#F59E0B"
                />
              )}
            </ScrollableChart>
          ) : (
            <EmptyChart title="Interdaily Stamina (IS)" />
          )}
        </View>
        <Text style={[styles.caption, { color: '#92400E' }]}>
          Interdaily Stamina (IS) is tracked across the week.
        </Text>

        <View style={{ backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#FDE68A', marginTop: 12, shadowColor: '#D97706', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
          <Text style={[styles.consistencyGuideTitle, { marginTop: 0, color: '#78350F' }]}>
            CONSISTENCY RATING GUIDE
          </Text>

          <View style={styles.consistencyItem}>
            <View
              style={[
                styles.consistencyIconBox,
                {
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  borderColor: '#10B981',
                },
              ]}>
              <Text style={[styles.consistencyIconText, { color: '#047857' }]}>
                A
              </Text>
            </View>
            <View style={styles.consistencyInfo}>
              <Text style={[styles.consistencyLabel, { color: '#1E293B' }]}>Daily Commuter</Text>
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
                  backgroundColor: 'rgba(59, 130, 246, 0.15)',
                  borderColor: '#3B82F6',
                },
              ]}>
              <Text style={[styles.consistencyIconText, { color: '#1D4ED8' }]}>
                A-
              </Text>
            </View>
            <View style={styles.consistencyInfo}>
              <Text style={[styles.consistencyLabel, { color: '#1E293B' }]}>Power Streak</Text>
              <Text style={styles.consistencyDescription}>
                50+ points on 3+ days
              </Text>
            </View>
          </View>

          <View style={[styles.consistencyItem, { marginBottom: 0 }]}>
            <View
              style={[
                styles.consistencyIconBox,
                {
                  backgroundColor: 'rgba(217, 119, 6, 0.15)',
                  borderColor: '#F59E0B',
                },
              ]}>
              <Text style={[styles.consistencyIconText, { color: '#B45309' }]}>
                B-
              </Text>
            </View>
            <View style={styles.consistencyInfo}>
              <Text style={[styles.consistencyLabel, { color: '#1E293B' }]}>Weekend Warrior</Text>
              <Text style={styles.consistencyDescription}>
                75+ pts Sat & Sun, low weekdays
              </Text>
            </View>
          </View>
        </View>

        {integratedStaminaCharts &&
          (integratedStaminaCharts.target !== undefined ||
            integratedStaminaCharts.actual !== undefined ||
            integratedStaminaCharts.performance !== undefined) && (
            <View style={[styles.modernSummaryRow, { borderColor: '#FDE68A' }]}>
              {integratedStaminaCharts.target !== undefined &&
                integratedStaminaCharts.target !== null && (
                  <View style={styles.modernSummaryItem}>
                    <Text style={styles.modernSummaryLabel}>Target: </Text>
                    <Text style={styles.modernSummaryValue}>{integratedStaminaCharts.target}</Text>
                  </View>
                )}
              {integratedStaminaCharts.actual !== undefined &&
                integratedStaminaCharts.actual !== null && (
                  <View style={styles.modernSummaryItem}>
                    <Text style={styles.modernSummaryLabel}>Actual: </Text>
                    <Text style={styles.modernSummaryValue}>{integratedStaminaCharts.actual}</Text>
                  </View>
                )}
              {integratedStaminaCharts.performance !== undefined &&
                integratedStaminaCharts.performance !== null && (
                  <View style={styles.modernPerformanceBadge}>
                    <Text style={styles.modernPerformanceText}>
                      Performance: {integratedStaminaCharts.performance}%
                    </Text>
                  </View>
                )}
            </View>
          )}
      </LinearGradient>

      {/* 6. Weekly Performance Metrics Card */}
      <LinearGradient
        colors={['#F8FAFC', '#EEF2FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderWidth: 1.5,
            borderColor: '#C7D2FE',
            shadowColor: '#4F46E5',
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
                borderColor: '#C7D2FE',
                shadowColor: '#4F46E5',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 4,
                elevation: 2,
              },
            ]}>
            <Text style={styles.emptyChartIcon}>📈</Text>
          </View>
          <Text style={[styles.cardTitle, { color: '#312E81', fontSize: 15, fontWeight: '800' }]}>
            Weekly Performance Metrics
          </Text>
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
            {renderTrendIndicator(weeklyPerformanceSummary.isTrend, weeklyPerformanceSummary.isAvg, true)}
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

        <View style={[styles.chartCanvasBox, { borderColor: 'rgba(79, 70, 229, 0.15)', shadowColor: '#4F46E5' }]}>
          {weeklyPerformance?.labels && weeklyPerformance.labels.length > 0 ? (
            <ScrollableChart
              dataLength={weeklyPerformance.labels.length}
              visibleWidth={innerChartWidth}>
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

        <View style={[styles.legendRow, { backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 12, alignSelf: 'center', borderWidth: 1, borderColor: '#E2E8F0', marginTop: 8 }]}>
          <LegendItem color="#F97316" label="EE/KM (E3)" dashed />
          <LegendItem color="#10B981" label="IS (Stamina)" />
          <LegendItem color="#3B82F6" label="PPI (Intensity)" />
        </View>

        <Text style={[styles.caption, { color: '#4338CA', marginTop: 8 }]}>
          Weekly trend for EE/KM (E3), IS (Stamina) and PPI (Intensity) performance.
        </Text>

        {weeklyTrendCharts &&
          (weeklyTrendCharts.target !== undefined ||
            weeklyTrendCharts.actual !== undefined ||
            weeklyTrendCharts.performance !== undefined) && (
            <View style={[styles.modernSummaryRow, { borderColor: '#C7D2FE' }]}>
              {weeklyTrendCharts.target !== undefined &&
                weeklyTrendCharts.target !== null && (
                  <View style={styles.modernSummaryItem}>
                    <Text style={styles.modernSummaryLabel}>Target: </Text>
                    <Text style={styles.modernSummaryValue}>{weeklyTrendCharts.target}</Text>
                  </View>
                )}
              {weeklyTrendCharts.actual !== undefined &&
                weeklyTrendCharts.actual !== null && (
                  <View style={styles.modernSummaryItem}>
                    <Text style={styles.modernSummaryLabel}>Actual: </Text>
                    <Text style={styles.modernSummaryValue}>{weeklyTrendCharts.actual}</Text>
                  </View>
                )}
              {weeklyTrendCharts.performance !== undefined &&
                weeklyTrendCharts.performance !== null && (
                  <View style={styles.modernPerformanceBadge}>
                    <Text style={styles.modernPerformanceText}>
                      Performance: {weeklyTrendCharts.performance}%
                    </Text>
                  </View>
                )}
            </View>
          )}
      </LinearGradient>

      {/* 7. Future Insights & Recommendations Card */}
      <LinearGradient
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
            ]}>
            <Text style={styles.emptyChartIcon}>🔮</Text>
          </View>
          <Text style={[styles.cardTitle, { color: '#1E3A8A', fontSize: 15, fontWeight: '800' }]}>
            Future Insights & Recommendations
          </Text>
        </View>

        <View style={[styles.recommendationContainer, { backgroundColor: '#FFFFFF', borderColor: 'rgba(37, 99, 235, 0.12)', borderRadius: 12, padding: 14, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }]}>
          <Text style={[styles.cardSub, styles.recommendationText, { color: '#1E40AF', fontSize: 12.5, lineHeight: 19, fontWeight: '500' }]}>
            {dailyInsightText ||
              'Personalized sleep, recovery and nutrition recommendations will appear here based on your Bio-Sync trends.'}
          </Text>
        </View>
      </LinearGradient>
    </>
  );
};

export {BioSyncTab};
