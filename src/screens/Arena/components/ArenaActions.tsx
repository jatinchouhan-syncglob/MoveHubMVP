import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from '../styles';
import { IArena } from '../types';

interface ArenaActionsProps {
  arena: IArena;
  onExplore: () => void;
}

export const ArenaActions: React.FC<ArenaActionsProps> = ({
  arena,
  onExplore,
}) => {
  return (
    <View style={styles.actionsSection}>
      {/* Primary CTA Button */}
      <TouchableOpacity
        style={styles.ctaButton}
        activeOpacity={0.85}
        onPress={onExplore}
      >
        <LinearGradient
          colors={['#EC4899', '#DB2777', '#BE185D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.ctaGradient}
        >
          <Text style={styles.ctaButtonText}>EXPLORE THIS ARENA</Text>
          <Text style={styles.ctaArrow}>→</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Status Badge */}
      <View style={styles.statusBadge}>
        <View style={styles.statusPulseDot} />
        <Text style={styles.statusText}>{arena.status}</Text>
      </View>
    </View>
  );
};
