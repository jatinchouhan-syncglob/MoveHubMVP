import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { styles } from '../styles';
import { ISegmentConfig } from '../types';

interface GlobalTickerProps {
  config: ISegmentConfig;
}

export const GlobalTicker: React.FC<GlobalTickerProps> = ({ config }) => {
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    setTickerIndex(0);
    const interval = setInterval(() => {
      setTickerIndex(prev => (prev + 1) % config.tickerStream.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [config]);

  const currentMessage = config.tickerStream[tickerIndex] || config.initialTicker;

  return (
    <View
      style={[
        styles.tickerCard,
        {
          backgroundColor: config.theme.cardBg,
          borderColor: config.theme.mutedBorders,
        },
      ]}
    >
      <View
        style={[
          styles.tickerLiveDot,
          { backgroundColor: config.theme.coreAccent },
        ]}
      />
      <Text
        style={[styles.tickerText, { color: config.theme.textPrimary }]}
        numberOfLines={1}
      >
        {currentMessage}
      </Text>
    </View>
  );
};
