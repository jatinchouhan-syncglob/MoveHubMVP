import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';
import { ARENA_HEADLINES } from '../constants';
import { IArena } from '../types';

interface ArenaHeaderProps {
  currentArena: IArena;
}

export const ArenaHeader: React.FC<ArenaHeaderProps> = ({ currentArena }) => {
  const headline =
    ARENA_HEADLINES[currentArena.id] ||
    ARENA_HEADLINES[currentArena.slug] ||
    'THE GAUNTLET.';

  return (
    <View style={styles.headerSection}>
      <View style={styles.eyebrowRow}>
        <View style={styles.eyebrowBar} />
        <Text style={styles.eyebrowText}>
          ELITE COMMUNITY FITNESS & LONGEVITY (ECFL)
        </Text>
      </View>

      <Text style={styles.mainHeadline}>{headline}</Text>

      <Text style={styles.subHeadline}>
        21 DAYS.{' '}
        <Text style={styles.subHeadlineHighlight}>5 ARENAS.</Text>
        {' '}1 NATIONAL PODIUM.
      </Text>
    </View>
  );
};
