import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { ARENA_THEMES } from '../constants';
import { IArena } from '../types';
import { ShareNodesIcon } from './ShareNodesIcon';

interface ArenaDetailsProps {
  arena: IArena;
  onShare?: (arena: IArena) => void;
}

export const ArenaDetails: React.FC<ArenaDetailsProps> = ({ arena, onShare }) => {
  const themeConfig = ARENA_THEMES[arena.themeColor] || ARENA_THEMES['arena-blue'];

  return (
    <View style={styles.detailsSection}>
      <View style={styles.categoryBadgeRow}>
        <View
          style={[
            styles.categoryBadge,
            {
              backgroundColor: themeConfig.badgeBg,
              borderColor: themeConfig.border,
            },
          ]}
        >
          <Text
            style={[
              styles.categoryBadgeText,
              { color: themeConfig.accent },
            ]}
          >
            {arena.category}
          </Text>
        </View>

        <Text
          style={[
            styles.arenaTaglineText,
            { color: themeConfig.accent },
          ]}
        >
          {arena.tagline}
        </Text>

        {onShare && (
          <TouchableOpacity
            style={styles.quickShareBtn}
            onPress={() => onShare(arena)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ShareNodesIcon color="#38BDF8" size={13} />
            <Text style={styles.quickShareText}>Share</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.arenaTitle}>{arena.name}</Text>

      {/* Facts Pills */}
      <View style={styles.factsContainer}>
        {arena.facts.map((fact, index) => (
          <View key={`${fact}-${index}`} style={styles.factPill}>
            <View
              style={[
                styles.factDot,
                { backgroundColor: themeConfig.primary },
              ]}
            />
            <Text style={styles.factText}>{fact}</Text>
          </View>
        ))}
      </View>

      {/* Arena Description */}
      <Text style={styles.summaryText}>{arena.summary}</Text>
    </View>
  );
};
