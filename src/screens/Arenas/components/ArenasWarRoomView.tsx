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

type MetricCategoryFilter = 'all' | 'volume' | 'cardiovascular' | 'metabolic' | 'circadian';

const CATEGORY_TABS: Array<{ key: MetricCategoryFilter; label: string }> = [
  { key: 'all', label: 'All (11)' },
  { key: 'cardiovascular', label: 'Cardio (4)' },
  { key: 'metabolic', label: 'Metabolic (3)' },
  { key: 'volume', label: 'Volume (2)' },
  { key: 'circadian', label: 'Circadian (2)' },
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
        <Text style={styles.warRoomHeaderTitle}>
          🛡️ THE METRIC DEEP-DIVE & STRATEGY SANDBOX
        </Text>
        <Text style={styles.warRoomHeaderSub}>
          Breaks down the 11 metrics (like S-DEX™, PPI™, and BARI™) into simple, actionable strategies so you know exactly how to score high and maximize performance.
        </Text>
      </View>

      {/* Segment Directive Hook Card */}
      <View
        style={[
          styles.warRoomDirectiveCard,
          { borderColor: theme.coreAccent, backgroundColor: theme.cardBg },
        ]}
      >
        <Text style={[styles.warRoomDirectiveTag, { color: theme.coreAccent }]}>
          🎯 TAILORED CONTENT HOOK • {config.segmentNumber} {config.name.toUpperCase()}
        </Text>
        <Text style={[styles.warRoomDirectiveBody, { color: theme.textSecondary }]}>
          {config.summary || config.psychologicalHook}
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
        <Text style={styles.warRoomActionBtnText}>
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
