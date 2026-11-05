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
  const currentDate = new Date().toLocaleDateString('en-GB');

  const renderTracker = (tracker: IFocusTracker, index: number) => {
    const isDummy =
      Boolean(tracker.isDummy) ||
      /\(dummy\)/i.test(tracker.value) ||
      /\bdummy\b/i.test(tracker.value);

    const displayValue = tracker.value
      .replace(/\s*\(dummy\)/i, '')
      .replace(/\s*dummy/i, '')
      .trim();

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
          <View style={styles.focusTrackerValueRow}>
            <Text
              style={[
                styles.focusTrackerValue,
                { color: config.theme.coreAccent },
              ]}
              numberOfLines={1}
            >
              {displayValue}
            </Text>

            {isDummy && (
              <View style={styles.focusTrackerDummyPill}>
                <View style={styles.focusTrackerDummyDot} />
                <Text style={styles.focusTrackerDummyText}>DUMMY</Text>
              </View>
            )}
          </View>

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

        {Boolean(tracker.statusBadge && tracker.statusBadge.trim()) && (
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
        )}
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
          YOUR FOCUS TRACKERS ({currentDate})
        </Text>
      </View>

      <View style={styles.focusTrackersRow}>
        {tracker1 && renderTracker(tracker1, 1)}
        {tracker2 && renderTracker(tracker2, 2)}
      </View>
    </View>
  );
};
