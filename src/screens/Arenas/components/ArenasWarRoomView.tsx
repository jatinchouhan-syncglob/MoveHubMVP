import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { METRIC_STRATEGIES } from '../constants';
import { ISegmentConfig } from '../types';

interface ArenasWarRoomViewProps {
  config: ISegmentConfig;
  onOpenCalibration: () => void;
  onOpenDisclaimer: () => void;
}

type MetricCategoryFilter = 'all' | 'cardiovascular' | 'metabolic';

const CATEGORY_TABS: Array<{ key: MetricCategoryFilter; label: string }> = [
  { key: 'all', label: 'ALL (3)' },
  { key: 'cardiovascular', label: 'Cardio (1)' },
  { key: 'metabolic', label: 'Metabolic (2)' },
];

export const ArenasWarRoomView: React.FC<ArenasWarRoomViewProps> = ({
  config,
  onOpenCalibration,
  onOpenDisclaimer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MetricCategoryFilter>('all');
  const theme = config.theme;

  const filteredMetrics = useMemo(() => {
    if (selectedCategory === 'all') {
      return METRIC_STRATEGIES;
    }
    return METRIC_STRATEGIES.filter(m => m.category === selectedCategory);
  }, [selectedCategory]);

  return (
    <ScrollView
      style={styles.warRoomContainer}
      contentContainerStyle={styles.warRoomScrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Header Info */}
      <View style={styles.warRoomHeader}>
        <View
          style={[
            styles.warRoomPhaseBadge,
            {
              backgroundColor: theme.badgeBg,
              borderColor: theme.coreAccent,
            },
          ]}
        >
          <Text style={[styles.warRoomPhaseBadgeText, { color: theme.coreAccent }]}>
            WAR ROOM for PHASE-1
          </Text>
        </View>
        <Text style={styles.warRoomHeaderTitle}>
          🛡️ THE METRIC DEEP-DIVE & STRATEGY SANDBOX
        </Text>
        <Text style={[styles.warRoomHeaderSubtitle, { color: theme.coreAccent }]}>
          PHASE-1: The Cardiovascular Shield
        </Text>
        <Text style={styles.warRoomHeaderSub}>
          Breaks down the core metrics used in Phase-1 of the tournament, to track your fitness and longevity into simple, actionable strategies so you know how to score high and maximize your performance.
        </Text>
      </View>

      {/* 🏆 THE GAUNTLET: PHASE 1 Card */}
      <View
        style={[
          styles.warRoomDirectiveCard,
          { borderColor: theme.coreAccent, backgroundColor: theme.cardBg },
        ]}
      >
        <Text style={[styles.warRoomDirectiveTag, { color: theme.coreAccent }]}>
          🏆 THE GAUNTLET: PHASE 1 (BEHAVIORAL FOUNDATION)
        </Text>
        <Text style={[styles.warRoomDirectiveBody, { color: theme.textSecondary }]}>
          The primary goal of Phase 1 is to build your foundational cardiovascular shield and eliminate the hidden dangers of physical stagnation. By measuring your daily CMAS™ (Cardio-Metabolic Activation Score), the system evaluates the real-time quality, quantity, and hourly consistency of your movements completely through your smartphone. The core objective is to break up continuous 60-minute immobility blocks, up-regulate your muscle glucose vacuums, and optimize active insulin sensitivity—whether you are working at an office desk, moving across a retail floor, or operating on a factory line. It establishes the un-gameable behavioural discipline required to protect your blood vessels and secure your rank safely above the high-stakes Tournament Axe Line.
        </Text>
      </View>

      {/* Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.warRoomFilterScroll}
      >
        <View style={styles.warRoomFilterRow}>
          {CATEGORY_TABS.map(tab => {
            const isActive = selectedCategory === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.warRoomFilterChip,
                  isActive && styles.warRoomFilterChipActive,
                  isActive && { borderColor: theme.coreAccent, backgroundColor: theme.badgeBg },
                ]}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(tab.key)}
              >
                <Text
                  style={[
                    styles.warRoomFilterText,
                    isActive && styles.warRoomFilterTextActive,
                    isActive && { color: theme.coreAccent },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* 11 Metric Cards */}
      {filteredMetrics.map(metric => (
        <View
          key={metric.id}
          style={[
            styles.warRoomMetricCard,
            { borderColor: metric.accentColor },
          ]}
        >
          <View style={styles.warRoomMetricTop}>
            <Text style={[styles.warRoomMetricCode, { color: metric.accentColor }]}>
              {metric.code}
            </Text>
            <View style={styles.warRoomMetricBadge}>
              <Text style={styles.warRoomMetricBadgeText}>{metric.target}</Text>
            </View>
          </View>

          <Text style={styles.warRoomMetricName}>{metric.name}</Text>

          <View
            style={[
              styles.warRoomRuleBox,
              {
                borderColor: `${metric.accentColor}40`,
                backgroundColor: `${metric.accentColor}12`,
              },
            ]}
          >
            <Text style={[styles.warRoomRuleText, { color: metric.accentColor }]}>
              💡 Rule: {metric.simpleRule}
            </Text>
          </View>

          <View style={styles.warRoomStrategyBox}>
            <Text style={styles.warRoomStrategyText}>
              🎯 How to Maximize: {metric.actionStrategy}
            </Text>
          </View>
        </View>
      ))}

      {/* Biophysical Sensor Calibration Action */}
      <TouchableOpacity
        style={[styles.warRoomActionBtn, { backgroundColor: theme.coreAccent }]}
        activeOpacity={0.8}
        onPress={onOpenCalibration}
      >
        <Text style={[styles.warRoomActionBtnText, { color: '#080C15', fontWeight: '900' }]}>
          ⚙️ Calibrate Biophysical Sensors (Drift Audit)
        </Text>
      </TouchableOpacity>

      {/* Medical Disclaimer Action */}
      <TouchableOpacity
        style={[
          styles.warRoomActionBtn,
          styles.warRoomActionBtnOutline,
          { borderColor: theme.mutedBorders },
        ]}
        activeOpacity={0.8}
        onPress={onOpenDisclaimer}
      >
        <Text style={[styles.warRoomActionBtnText, { color: theme.textSecondary }]}>
          ℹ️ Read Clinical & Medical Safety Disclaimer
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ArenasWarRoomView;
