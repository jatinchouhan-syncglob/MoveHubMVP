import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';
import { ISegmentConfig, IFocusTracker } from '../types';

interface FocusTrackersGridProps {
  config: ISegmentConfig;
}

export const FocusTrackersGrid: React.FC<FocusTrackersGridProps> = ({
  config,
}) => {
  const [tracker1, tracker2] = config.focusTrackers;

  const renderTracker = (tracker: IFocusTracker, index: number) => {
    return (
      <View
        key={`tracker-${index}`}
        style={[
          styles.focusTrackerCard,
          {
            backgroundColor: config.theme.cardBg,
            borderColor: config.theme.mutedBorders,
          },
        ]}
      >
        <Text
          style={[
            styles.focusTrackerTitle,
            { color: config.theme.textSecondary },
          ]}
          numberOfLines={1}
        >
          {tracker.title}
        </Text>

        <View style={styles.focusTrackerValueGroup}>
          <Text
            style={[
              styles.focusTrackerValue,
              { color: config.theme.coreAccent },
            ]}
          >
            {tracker.value}
          </Text>
          <Text
            style={[
              styles.focusTrackerSubLabel,
              { color: config.theme.textSecondary },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {tracker.subLabel}
          </Text>
        </View>

        <View
          style={[
            styles.focusTrackerBadge,
            {
              backgroundColor: config.theme.badgeBg,
              borderColor: config.theme.mutedBorders,
            },
          ]}
        >
          <Text
            style={[
              styles.focusTrackerBadgeText,
              { color: config.theme.coreAccent },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {tracker.statusBadge}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View>
      <View style={styles.sectionHeadingRow}>
        <Text
          style={[
            styles.sectionHeadingText,
            { color: config.theme.coreAccent },
          ]}
        >
          YOUR FOCUS TRACKERS
        </Text>
      </View>

      <View style={styles.focusTrackersRow}>
        {renderTracker(tracker1, 1)}
        {renderTracker(tracker2, 2)}
      </View>
    </View>
  );
};
