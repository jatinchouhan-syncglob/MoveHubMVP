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
          borderLeftColor: config.theme.coreAccent,
        },
      ]}
    >
      <View style={styles.tickerHeaderRow}>
        <View style={styles.tickerBadgeLeft}>
          <View
            style={[
              styles.tickerLiveDot,
              { backgroundColor: config.theme.coreAccent },
            ]}
          />
          <Text
            style={[
              styles.tickerTagText,
              { color: config.theme.coreAccent },
            ]}
          >
            LIVE TELEMETRY ALERT
          </Text>
        </View>
        <Text style={styles.tickerTimeText}>REAL-TIME SYNC • JUST NOW</Text>
      </View>

      <Text
        style={[styles.tickerText, { color: config.theme.textPrimary }]}
      >
        {currentMessage}
      </Text>
    </View>
  );
};
