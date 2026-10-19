import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { ISegmentConfig } from '../types';

interface SegmentSelectorHeaderProps {
  config: ISegmentConfig;
  onOpenPicker: () => void;
}

export const SegmentSelectorHeader: React.FC<SegmentSelectorHeaderProps> = ({
  config,
  onOpenPicker,
}) => {
  return (
    <View>
      {/* Top Segment Dropdown Bar */}
      <TouchableOpacity
        style={[
          styles.segmentBarCard,
          {
            backgroundColor: config.theme.cardBg,
            borderColor: config.theme.mutedBorders,
          },
        ]}
        onPress={onOpenPicker}
        activeOpacity={0.8}
      >
        <View style={styles.segmentBarRow}>
          <View style={styles.segmentBarLeft}>
            <Text style={styles.segmentBarIcon}>{config.icon}</Text>
            <View style={styles.segmentBarLabelGroup}>
              <Text
                style={[
                  styles.segmentBarEyebrow,
                  { color: config.theme.coreAccent },
                ]}
              >
                USER SEGMENT • {config.segmentNumber}
              </Text>
              <Text
                style={[
                  styles.segmentBarTitle,
                  { color: config.theme.textPrimary },
                ]}
                numberOfLines={1}
              >
                {config.name}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.segmentSwitchPill,
              {
                backgroundColor: config.theme.badgeBg,
                borderColor: config.theme.coreAccent,
              },
            ]}
          >
            <Text
              style={[
                styles.segmentSwitchText,
                { color: config.theme.coreAccent },
              ]}
            >
              SWITCH
            </Text>
            <Text
              style={[
                styles.segmentSwitchArrow,
                { color: config.theme.coreAccent },
              ]}
            >
              ▼
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Main Segment Header Card */}
      <View
        style={[
          styles.segmentHeaderCard,
          {
            backgroundColor: config.theme.cardBg,
            borderColor: config.theme.mutedBorders,
          },
        ]}
      >
        <View style={styles.segmentHeaderTopRow}>
          <View style={styles.segmentBadgeRow}>
            <View
              style={[
                styles.segmentNumberBadge,
                { backgroundColor: config.theme.badgeBg },
              ]}
            >
              <Text
                style={[
                  styles.segmentNumberText,
                  { color: config.theme.coreAccent },
                ]}
              >
                SEGMENT {config.segmentNumber}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.statusTagBadge,
              {
                backgroundColor: config.theme.badgeBg,
                borderColor: config.theme.mutedBorders,
              },
            ]}
          >
            {config.statusIcon ? (
              <Text style={styles.statusTagEmoji}>{config.statusIcon}</Text>
            ) : null}
            <Text
              style={[
                styles.statusTagText,
                { color: config.theme.coreAccent },
              ]}
            >
              {config.statusTag}
            </Text>
          </View>
        </View>

        <Text
          style={[styles.segmentMainTitle, { color: config.theme.textPrimary }]}
        >
          {config.title}
        </Text>
        <Text
          style={[styles.segmentSubTitle, { color: config.theme.textSecondary }]}
        >
          {config.targetAudience}
        </Text>
      </View>
    </View>
  );
};
