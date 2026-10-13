import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { styles } from '../styles';
import { ARENA_THEMES, ARENA_SHORT_NAMES } from '../constants';
import { IArena } from '../types';

interface ArenaSelectorTabsProps {
  arenas: IArena[];
  selectedIndex: number;
  onSelectArena: (index: number) => void;
}

export const ArenaSelectorTabs: React.FC<ArenaSelectorTabsProps> = ({
  arenas,
  selectedIndex,
  onSelectArena,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const tabPositions = useRef<{ [key: number]: number }>({});

  // Auto-scroll the tabs so active tab stays centered and visible
  useEffect(() => {
    const targetX = tabPositions.current[selectedIndex];
    if (scrollRef.current && targetX !== undefined) {
      scrollRef.current.scrollTo({
        x: Math.max(0, targetX - 24),
        animated: true,
      });
    }
  }, [selectedIndex]);

  return (
    <View style={styles.selectorSection}>
      <View style={styles.selectorHeaderRow}>
        <Text style={styles.selectorLabel}>WHO ARE YOU COMPETING AS?</Text>
        <View style={styles.selectorCountBadge}>
          <Text style={styles.selectorCountText}>{arenas.length} ARENAS</Text>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsScrollContent}
      >
        {arenas.map((arena, index) => {
          const isSelected = selectedIndex === index;
          const themeConfig =
            ARENA_THEMES[arena.themeColor] || ARENA_THEMES['arena-blue'];
          const shortName =
            ARENA_SHORT_NAMES[arena.id] ||
            `${arena.id} ${arena.name.toUpperCase()}`;

          return (
            <TouchableOpacity
              key={arena.id || arena.slug || index}
              activeOpacity={0.8}
              onLayout={e => {
                tabPositions.current[index] = e.nativeEvent.layout.x;
              }}
              onPress={() => onSelectArena(index)}
              style={[
                styles.tabItem,
                isSelected && {
                  borderColor: themeConfig.border,
                  backgroundColor: themeConfig.badgeBg,
                },
              ]}
            >
              <View style={styles.tabItemTopRow}>
                <Text
                  style={[
                    styles.tabName,
                    isSelected && [
                      styles.activeTabName,
                      { color: themeConfig.accent },
                    ],
                  ]}
                >
                  {shortName}
                </Text>
                {isSelected && (
                  <View style={styles.tabCheckWrapper}>
                    <Svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <Path
                        d="M20 6L9 17l-5-5"
                        stroke={themeConfig.accent}
                        strokeWidth={3}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </Svg>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.tabTagline,
                  isSelected && { color: '#E2E8F0' },
                ]}
              >
                {arena.tagline}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
