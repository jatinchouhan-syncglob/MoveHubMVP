import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from '../styles';
import { IArena } from '../types';
import { ShareNodesIcon } from './ShareNodesIcon';

interface ArenaActionsProps {
  arena: IArena;
  onExplore: () => void;
  onShare: (arena: IArena) => void;
  onJoinChallenge: (arena: IArena) => void;
}

export const ArenaActions: React.FC<ArenaActionsProps> = ({
  arena,
  onExplore,
  onShare,
  onJoinChallenge,
}) => {
  return (
    <View style={styles.actionsSection}>
      {/* Primary Join Challenge CTA Button */}
      <TouchableOpacity
        style={styles.joinChallengeButton}
        activeOpacity={0.85}
        onPress={() => onJoinChallenge(arena)}
      >
        <LinearGradient
          colors={['#2563EB', '#1D4ED8', '#1E40AF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.joinChallengeGradient}
        >
          <Text style={styles.joinChallengeBolt}>⚡</Text>
          <Text style={styles.joinChallengeButtonText}>JOIN CHALLENGE</Text>
          <Text style={styles.joinChallengeArrow}>→</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Secondary Explore CTA Button */}
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

      {/* Social Share Button */}
      <TouchableOpacity
        style={styles.shareButton}
        activeOpacity={0.85}
        onPress={() => onShare(arena)}
      >
        <LinearGradient
          colors={['#1E293B', '#0F172A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shareGradient}
        >
          <ShareNodesIcon color="#38BDF8" size={16} />
          <Text style={styles.shareButtonText}>SHARE ARENA CHALLENGE</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

