import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { ISegmentConfig } from '../types';

interface CoreQuadrantsBarProps {
  config: ISegmentConfig;
  onOpenPlaybook: () => void;
  onOpenSandbox: () => void;
  onOpenReferral: () => void;
  onOpenCalibration: () => void;
  onOpenDisclaimer: () => void;
}

export const CoreQuadrantsBar: React.FC<CoreQuadrantsBarProps> = ({
  config,
  onOpenPlaybook,
  onOpenSandbox,
  onOpenReferral,
  onOpenCalibration,
  onOpenDisclaimer,
}) => {
  const quadrants = [
    {
      id: 'playbook',
      label: 'Tournament Playbook',
      icon: '📖',
      onPress: onOpenPlaybook,
    },
    {
      id: 'sandbox',
      label: 'Metric Sandbox',
      icon: '⚡',
      onPress: onOpenSandbox,
    },
    {
      id: 'referral',
      label: '4-Way Referral Node',
      icon: '🔗',
      onPress: onOpenReferral,
    },
    {
      id: 'calibration',
      label: 'Biophysical Calibration',
      icon: '🔬',
      onPress: onOpenCalibration,
    },
    {
      id: 'disclaimer',
      label: 'Medical Disclaimer',
      icon: '📋',
      onPress: onOpenDisclaimer,
    },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.quadrantsBarScroll}
      contentContainerStyle={styles.quadrantsBarContainer}
    >
      {quadrants.map(item => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.quadrantChip,
            {
              backgroundColor: config.theme.cardBg,
              borderColor: config.theme.mutedBorders,
            },
          ]}
          activeOpacity={0.8}
          onPress={item.onPress}
        >
          <Text style={styles.quadrantChipIcon}>{item.icon}</Text>
          <Text
            style={[styles.quadrantChipText, { color: config.theme.textPrimary }]}
          >
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
