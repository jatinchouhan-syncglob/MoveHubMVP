import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Path, Circle, Polygon } from 'react-native-svg';
import { TeamCrestId, CmasSatelliteNode } from './types';

interface TeamCrestProps {
  crest: TeamCrestId;
  size?: number;
}

export const TeamCrest: React.FC<TeamCrestProps> = ({ crest, size = 34 }) => {
  const palette: Record<
    TeamCrestId,
    { ring: string; bg: string; fg: string; accent: string }
  > = {
    lion: {
      ring: '#38BDF8',
      bg: '#0D1E3A',
      fg: '#E0F2FE',
      accent: '#818CF8',
    },
    wolf: {
      ring: '#94A3B8',
      bg: '#0D1B2E',
      fg: '#CBD5E1',
      accent: '#22D3EE',
    },
    phoenix: {
      ring: '#F97316',
      bg: '#2A1208',
      fg: '#FB923C',
      accent: '#FACC15',
    },
    titan: {
      ring: '#CBD5E1',
      bg: '#132238',
      fg: '#E2E8F0',
      accent: '#38BDF8',
    },
    kraken: {
      ring: '#2DD4BF',
      bg: '#08262B',
      fg: '#5EEAD4',
      accent: '#38BDF8',
    },
  };

  const c = palette[crest];

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: c.bg,
        borderWidth: 1.5,
        borderColor: c.ring,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: c.ring,
        shadowOpacity: 0.45,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      <Svg width={size * 0.68} height={size * 0.68} viewBox="0 0 24 24" fill="none">
        {crest === 'lion' && (
          <>
            <Path
              d="M12 2.5L15 5l3.2-.8L19 7.5l2.5 2-1.2 3.2 1.2 3-2.5 2-.8 3.1-3.2-.7L12 22l-3-1.9-3.2.7-.8-3.1-2.5-2 1.2-3-1.2-3.2 2.5-2L5.8 4.2 9 5l3-2.5z"
              stroke={c.fg}
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
            <Path
              d="M8.5 10.5l1.5 1.2L12 10l2 1.7 1.5-1.2M9.5 15.2l2.5 1.8 2.5-1.8M12 13v2"
              stroke={c.accent}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        {crest === 'wolf' && (
          <>
            <Path
              d="M5 4l3.5 4.2L12 7l3.5 1.2L19 4l-1.5 6.8L20 14l-3.2 2.4L12 21l-4.8-4.6L4 14l2.5-3.2L5 4z"
              stroke={c.fg}
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
            <Path
              d="M8.8 11.5l1.8.8M15.2 11.5l-1.8.8M10.5 16l1.5 1.4 1.5-1.4"
              stroke={c.accent}
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        {crest === 'phoenix' && (
          <>
            <Path
              d="M12 3c1.8 2.4 1.8 4.6 0 6.5 2.5-1.5 5.8-2.2 8.5-.5-2.2 1.8-4.1 3.5-5.5 6.2 1.5-.3 2.8.4 3.5 1.8-2.4-.2-4.8.8-6.5 4-1.7-3.2-4.1-4.2-6.5-4 .7-1.4 2-2.1 3.5-1.8-1.4-2.7-3.3-4.4-5.5-6.2 2.7-1.7 6-1 8.5.5C10.2 7.6 10.2 5.4 12 3z"
              fill={c.fg}
              stroke={c.accent}
              strokeWidth={1.1}
              strokeLinejoin="round"
            />
          </>
        )}
        {crest === 'titan' && (
          <>
            <Polygon
              points="12,3 19,6.5 18,14.5 12,21 6,14.5 5,6.5"
              stroke={c.fg}
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
            <Path
              d="M8.5 9.5h7M12 9.5v7.5M9 13l3-1.2 3 1.2"
              stroke={c.accent}
              strokeWidth={1.7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}
        {crest === 'kraken' && (
          <>
            <Circle cx="12" cy="8.5" r="4.5" stroke={c.fg} strokeWidth={1.6} />
            <Path
              d="M7.5 12c-2 2.2-3 4.8-1.5 7.5M10 13c-.8 2.8-.6 5.5.5 8M14 13c.8 2.8.6 5.5-.5 8M16.5 12c2 2.2 3 4.8 1.5 7.5"
              stroke={c.accent}
              strokeWidth={1.6}
              strokeLinecap="round"
            />
            <Circle cx="10.3" cy="8.8" r="0.9" fill={c.accent} />
            <Circle cx="13.7" cy="8.8" r="0.9" fill={c.accent} />
          </>
        )}
      </Svg>
    </View>
  );
};

export const SatelliteNodeIcon: React.FC<{
  type: CmasSatelliteNode['iconType'];
  color: string;
  size?: number;
}> = ({ type, color, size = 18 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {type === 'steps' && (
      <>
        <Circle cx="13.5" cy="4.5" r="2" fill={color} />
        <Path
          d="M9.5 20l2.2-6 2.8 2.5v3.5M12.5 8.5l-2.5 4.2-3-.7M12.5 8.5l3.5 2.5 2.5-1.2"
          stroke={color}
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
    {type === 'pulse' && (
      <>
        <Path
          d="M12 20.5s-7.5-4.8-7.5-10.2C4.5 7.2 6.8 5 9.6 5c1.1 0 2 .5 2.4 1.3.4-.8 1.3-1.3 2.4-1.3 2.8 0 5.1 2.2 5.1 5.3 0 5.4-7.5 10.2-7.5 10.2z"
          stroke={color}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <Path
          d="M7.5 11.5h2.2l1.2-2.2 1.8 4.2 1.2-2h2.4"
          stroke={color}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
    {type === 'run' && (
      <>
        <Circle cx="14.5" cy="4.5" r="2" fill={color} />
        <Path
          d="M6.5 19.5l3.2-4.8 3.3 1.8-1 4M11 10.2l3.8 1.3 3.2-2M9 12.2l2-3.2 4 .2"
          stroke={color}
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
    {type === 'strength' && (
      <Path
        d="M6 17c-1.5-2.5-1-6.5 1.5-8.5 1.8-1.4 4.2-1.2 5.5.3.8.9 1.1 2.1.8 3.2h3.7c1.6 0 2.5 1.4 2.5 3 0 2.2-1.8 3.5-4.5 3.5H9.5C7.8 18.5 6.7 18 6 17z"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
    {type === 'habits' && (
      <>
        <Circle cx="12" cy="12" r="8" stroke={color} strokeWidth={1.8} />
        <Path
          d="M12 7.8v4.5l3 1.8"
          stroke={color}
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    )}
    {type === 'ecg' && (
      <Path
        d="M3 12h4l2.2-5 3.4 10 2.4-6.5 1.8 1.5H21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
    {type === 'heart' && (
      <Path
        d="M12 20s-7-4.5-7-9.8C5 7.3 7.2 5 9.8 5c1.2 0 1.9.6 2.2 1.2.3-.6 1-1.2 2.2-1.2C16.8 5 19 7.3 19 10.2c0 5.3-7 9.8-7 9.8z"
        stroke={color}
        strokeWidth={1.9}
        fill={`${color}33`}
      />
    )}
  </Svg>
);

export const GenderBadgeIcon: React.FC<{
  gender: 'female' | 'male';
  size?: number;
}> = ({ gender, size = 14 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {gender === 'female' ? (
      <>
        <Circle cx="12" cy="7.5" r="3" fill="#EC4899" />
        <Path
          d="M9 12.5c0-1.2 1.3-2 3-2s3 .8 3 2l1.2 5h-2.1v3.5h-4.2V17.5H7.8l1.2-5z"
          fill="#EC4899"
        />
      </>
    ) : (
      <>
        <Circle cx="12" cy="7.5" r="3" fill="#38BDF8" />
        <Path
          d="M8.5 12.5c0-1.1 1.4-2 3.5-2s3.5.9 3.5 2v4.8h-1.8V21h-3.4v-3.7H8.5v-4.8z"
          fill="#38BDF8"
        />
      </>
    )}
  </Svg>
);

export const BellNotificationIcon: React.FC<{ count?: number }> = ({
  count = 1,
}) => (
  <View style={{ position: 'relative', padding: 4 }}>
    <Svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9zM13.73 21a2 2 0 01-3.46 0"
        stroke="#94A3B8"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
    {count > 0 && (
      <View
        style={{
          position: 'absolute',
          top: 1,
          right: 1,
          minWidth: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: '#EF4444',
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 3,
        }}
      >
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 9,
            fontWeight: '800',
            lineHeight: 11,
          }}
        >
          {count}
        </Text>
      </View>
    )}
  </View>
);
