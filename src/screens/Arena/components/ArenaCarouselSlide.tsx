import React from 'react';
import { View, Text, Image } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { styles } from '../styles';
import { ARENA_THEMES } from '../constants';
import { IArena } from '../types';

interface ArenaCarouselSlideProps {
  arena: IArena;
}

export const ArenaCarouselSlide: React.FC<ArenaCarouselSlideProps> = ({ arena }) => {
  const themeConfig = ARENA_THEMES[arena.themeColor] || ARENA_THEMES['arena-blue'];

  return (
    <View style={styles.slideWrapper}>
      <View
        style={[
          styles.slideCard,
          {
            shadowColor: themeConfig.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
            elevation: 6,
          },
        ]}
      >
        <Image
          source={{ uri: arena.heroImage }}
          style={styles.slideImage}
          resizeMode="cover"
        />

        {/* Top Vignette Gradient */}
        <LinearGradient
          colors={['rgba(8, 10, 15, 0.7)', 'transparent']}
          style={styles.slideGradientTop}
        />

        {/* Bottom Vignette Gradient */}
        <LinearGradient
          colors={['transparent', 'rgba(8, 10, 15, 0.85)', '#080A0F']}
          style={styles.slideGradientBottom}
        >
          <View style={styles.slideOverlayContent}>
            <View
              style={[
                styles.slideArenaBadge,
                {
                  backgroundColor: themeConfig.badgeBg,
                  borderColor: themeConfig.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.slideArenaBadgeText,
                  { color: themeConfig.accent },
                ]}
              >
                ARENA {arena.id}
              </Text>
            </View>

            <Text style={styles.slideCategoryText}>{arena.category}</Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
};
