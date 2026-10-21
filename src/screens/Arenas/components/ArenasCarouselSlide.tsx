import React from 'react';
import { View, Text, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from '../styles';
import { ISegmentConfig } from '../types';
import { ARENA_SEGMENT_IMAGES } from '../../../assets/arenas';

interface ArenasCarouselSlideProps {
  config: ISegmentConfig;
}

export const ArenasCarouselSlide: React.FC<ArenasCarouselSlideProps> = ({ config }) => {
  const themeConfig = config.theme;
  const imageSource = ARENA_SEGMENT_IMAGES[config.key];

  return (
    <View style={styles.slideWrapper}>
      <View
        style={[
          styles.slideCard,
          {
            borderColor: themeConfig.mutedBorders,
            shadowColor: themeConfig.coreAccent,
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.35,
            shadowRadius: 14,
            elevation: 8,
          },
        ]}
      >
        {imageSource && (
          <Image
            source={imageSource}
            style={styles.slideImage}
            resizeMode="cover"
          />
        )}

        {/* Top Vignette Gradient */}
        <LinearGradient
          colors={['rgba(8, 10, 15, 0.75)', 'transparent']}
          style={styles.slideGradientTop}
        />

        {/* Top Floating Badges */}
        <View style={styles.slideTopBadgesRow}>
          <View
            style={[
              styles.slideArenaBadge,
              {
                backgroundColor: themeConfig.badgeBg,
                borderColor: themeConfig.coreAccent,
              },
            ]}
          >
            <Text
              style={[
                styles.slideArenaBadgeText,
                { color: themeConfig.coreAccent },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {config.shortLabel.toUpperCase()}
            </Text>
          </View>

          <View style={styles.slideStatusBadge}>
            <View
              style={[
                styles.slideStatusDot,
                { backgroundColor: themeConfig.coreAccent },
              ]}
            />
            <Text style={styles.slideStatusText} numberOfLines={1}>
              {config.statusIcon ? `${config.statusIcon} ` : ''}{config.statusTag}
            </Text>
          </View>
        </View>

      </View>
    </View>
  );
};

export default ArenasCarouselSlide;
