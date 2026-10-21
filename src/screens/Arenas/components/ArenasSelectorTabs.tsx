import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { styles } from '../styles';
import { SEGMENT_CONFIGS } from '../constants';
import { ISegmentConfig, UserSegmentKey } from '../types';

interface ArenasSelectorTabsProps {
  segments: ISegmentConfig[];
  selectedSegmentKey: UserSegmentKey;
  onSelectSegment: (key: UserSegmentKey) => void;
}

export const ArenasSelectorTabs: React.FC<ArenasSelectorTabsProps> = ({
  segments,
  selectedSegmentKey,
  onSelectSegment,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const tabPositions = useRef<{ [key: string]: number }>({});

  const activeIndex = segments.findIndex(s => s.key === selectedSegmentKey);

  // Auto-scroll the tabs so active tab stays centered and visible
  useEffect(() => {
    const targetX = tabPositions.current[selectedSegmentKey];
    if (scrollRef.current && targetX !== undefined) {
      scrollRef.current.scrollTo({
        x: Math.max(0, targetX - 24),
        animated: true,
      });
    }
  }, [selectedSegmentKey]);

  return (
    <View style={styles.selectorSection}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScrollContent}
      >
        {segments.map((segment, index) => {
          const isSelected = selectedSegmentKey === segment.key;
          const themeConfig = segment.theme;
          const shortName = `${segment.segmentNumber} ${segment.shortLabel.toUpperCase()}`;
          const tagline = segment.category || segment.statusTag;

          return (
            <TouchableOpacity
              key={segment.key}
              activeOpacity={0.8}
              onLayout={e => {
                tabPositions.current[segment.key] = e.nativeEvent.layout.x;
              }}
              onPress={() => onSelectSegment(segment.key)}
              style={[
                styles.tabItem,
                isSelected && [
                  styles.tabItemSelected,
                  {
                    borderColor: themeConfig.coreAccent,
                    backgroundColor: themeConfig.cardBg,
                  },
                ],
              ]}
            >
              <View style={styles.tabItemTopRow}>
                <Text
                  style={[
                    styles.tabName,
                    isSelected && [
                      styles.activeTabName,
                      { color: themeConfig.coreAccent },
                    ],
                  ]}
                  numberOfLines={1}
                >
                  {segment.icon} {shortName}
                </Text>

                {isSelected && (
                  <View style={styles.tabCheckWrapper}>
                    <Svg width={14} height={14} viewBox="0 0 20 20" fill="none">
                      <Path
                        d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm-2 15l-5-5 1.41-1.41L8 12.17l7.59-7.59L17 6l-9 9z"
                        fill={themeConfig.coreAccent}
                      />
                    </Svg>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.tabTagline,
                  isSelected && { color: themeConfig.textSecondary },
                ]}
                numberOfLines={1}
              >
                {tagline}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ArenasSelectorTabs;
