import React from 'react';
import { View, Text, TouchableOpacity, Share, Platform } from 'react-native';
import { styles } from '../styles';
import { ISegmentConfig } from '../types';
import { ShareNodesIcon } from '../../Arena/components/ShareNodesIcon';

interface ArenasDetailsCardProps {
  config: ISegmentConfig;
}

export const ArenasDetailsCard: React.FC<ArenasDetailsCardProps> = ({ config }) => {
  const themeConfig = config.theme;

  const handleShare = async () => {
    try {
      const factsText =
        config.facts && config.facts.length > 0
          ? config.facts.map(f => `⚡ ${f}`).join('\n')
          : '';

      const shareMessage =
        `🏆 ${config.title} - MoveHub Arenas\n\n` +
        `🔥 Segment: ${config.name} (${config.shortLabel})\n` +
        `📍 Status: ${config.statusTag}\n\n` +
        `"${config.tagline || config.summary}"\n\n` +
        (factsText ? `Key Directives:\n${factsText}\n\n` : '') +
        `Join our cardiometabolic habit war room, calibrate your sensor profile, and conquer the National Podium!\n\n` +
        `👉 Compete now: https://movehub.app/arenas?segment=${config.key}`;

      await Share.share(
        Platform.OS === 'ios'
          ? {
              title: `${config.name} | MoveHub Arenas`,
              message: shareMessage,
              url: `https://movehub.app/arenas?segment=${config.key}`,
            }
          : {
              title: `${config.name} | MoveHub Arenas`,
              message: shareMessage,
            },
      );
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <View style={styles.detailsSection}>
      {/* Category & Quick Share */}
      <View style={styles.categoryBadgeRow}>
        <View
          style={[
            styles.categoryBadge,
            {
              backgroundColor: themeConfig.badgeBg,
              borderColor: themeConfig.mutedBorders,
            },
          ]}
        >
          <Text
            style={[
              styles.categoryBadgeText,
              { color: themeConfig.coreAccent },
            ]}
          >
            CORE FOCUS
          </Text>
        </View>

        <TouchableOpacity
          style={styles.quickShareBtn}
          onPress={handleShare}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ShareNodesIcon color="#38BDF8" size={13} />
          <Text style={styles.quickShareText}>Share</Text>
        </TouchableOpacity>
      </View>

      {/* Facts Pills */}
      {config.facts && config.facts.length > 0 && (
        <View style={styles.factsContainer}>
          {config.facts.map((fact, index) => (
            <View key={`${fact}-${index}`} style={styles.factPill}>
              <View
                style={[
                  styles.factDot,
                  { backgroundColor: themeConfig.coreAccent },
                ]}
              />
              <Text style={styles.factText}>{fact}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Description / Summary */}
      <Text style={[styles.summaryText, { color: themeConfig.textSecondary }]}>
        {config.summary || config.psychologicalHook}
      </Text>
    </View>
  );
};

export default ArenasDetailsCard;
