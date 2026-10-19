import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';
import { ISegmentConfig } from '../types';

interface ArenasHeroHeaderProps {
  config: ISegmentConfig;
}

export const ArenasHeroHeader: React.FC<ArenasHeroHeaderProps> = ({ config }) => {
  const headline = config.headline || config.title;

  return (
    <View style={styles.heroHeaderSection}>
      <View style={styles.eyebrowRow}>
        <View
          style={[
            styles.eyebrowBar,
            { backgroundColor: config.theme.coreAccent },
          ]}
        />
        <Text
          style={[
            styles.eyebrowText,
            { color: config.theme.coreAccent },
          ]}
        >
          THE ARENA • {config.segmentNumber} {config.name.toUpperCase()}
        </Text>
      </View>

      <Text style={styles.mainHeadline}>{headline}</Text>

      <Text style={[styles.subHeadline, { color: config.theme.textSecondary }]}>
        {config.tagline || 'THE ULTIMATE CARDIOMETABOLIC WAITING LOUNGE & HABIT WAR ROOM'}
      </Text>
    </View>
  );
};

export default ArenasHeroHeader;
