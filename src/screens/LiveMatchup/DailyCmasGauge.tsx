import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
} from 'react-native-svg';
import { CmasSatelliteNode } from './types';
import { SatelliteNodeIcon } from './CrestIcons';
import { styles } from './styles';

interface DailyCmasGaugeProps {
  percentage: number;
  satellites: CmasSatelliteNode[];
}

interface NodePlacement {
  id: string;
  top: number;
  left?: number;
  right?: number;
  align?: 'left' | 'right' | 'center';
}

const RING_SIZE = 186;
const STROKE_OUTER = 10;
const STROKE_INNER = 6;
const CENTER = RING_SIZE / 2;
const RADIUS_OUTER = CENTER - 12;
const RADIUS_INNER = CENTER - 27;
const CIRCUMFERENCE_OUTER = 2 * Math.PI * RADIUS_OUTER;
const CIRCUMFERENCE_INNER = 2 * Math.PI * RADIUS_INNER;

const NODE_PLACEMENTS: Record<string, NodePlacement> = {
  steps: { id: 'steps', top: 22, left: 0, align: 'left' },
  pulse: { id: 'pulse', top: 6, right: 2, align: 'right' },
  run: { id: 'run', top: 108, left: 18, align: 'center' },
  strength: { id: 'strength', top: 108, right: 16, align: 'center' },
  habits: { id: 'habits', top: 190, left: 2, align: 'left' },
  ecg: { id: 'ecg', top: 212, left: 108, align: 'center' },
  heart: { id: 'heart', top: 196, right: 24, align: 'right' },
};

export const DailyCmasGauge: React.FC<DailyCmasGaugeProps> = ({
  percentage,
  satellites,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    satellites[0]?.id || 'steps',
  );

  const clamped = Math.max(0, Math.min(100, percentage));
  const outerOffset = CIRCUMFERENCE_OUTER * (1 - clamped / 100);
  const innerOffset = CIRCUMFERENCE_INNER * (1 - Math.min(100, clamped + 6) / 100);

  const selectedSatellite =
    satellites.find(s => s.id === selectedId) || satellites[0];

  return (
    <View style={styles.gaugeSection}>
      <View style={styles.gaugeStage}>
        {/* Ambient outer orbital track */}
        <View style={styles.orbitRingOuter} />
        <View style={styles.orbitRingInner} />

        {/* Central Glowing Ring SVG */}
        <View style={styles.centerRingWrapper}>
          <Svg width={RING_SIZE} height={RING_SIZE} viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
            <Defs>
              <SvgLinearGradient id="cmasOuterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#00E5FF" />
                <Stop offset="55%" stopColor="#22D3EE" />
                <Stop offset="100%" stopColor="#4ADE80" />
              </SvgLinearGradient>
              <SvgLinearGradient id="cmasInnerGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#A3E635" />
                <Stop offset="100%" stopColor="#06B6D4" />
              </SvgLinearGradient>
            </Defs>

            {/* Background tracks */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS_OUTER}
              stroke="rgba(56, 189, 248, 0.14)"
              strokeWidth={STROKE_OUTER}
              fill="#061224"
            />
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS_INNER}
              stroke="rgba(74, 222, 128, 0.12)"
              strokeWidth={STROKE_INNER}
              fill="none"
            />

            {/* Primary CMAS Arc */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS_OUTER}
              stroke="url(#cmasOuterGrad)"
              strokeWidth={STROKE_OUTER}
              strokeDasharray={`${CIRCUMFERENCE_OUTER} ${CIRCUMFERENCE_OUTER}`}
              strokeDashoffset={outerOffset}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />

            {/* Secondary Inner Telemetry Arc */}
            <Circle
              cx={CENTER}
              cy={CENTER}
              r={RADIUS_INNER}
              stroke="url(#cmasInnerGrad)"
              strokeWidth={STROKE_INNER}
              strokeDasharray={`${CIRCUMFERENCE_INNER * 0.18} ${CIRCUMFERENCE_INNER * 0.04}`}
              strokeDashoffset={innerOffset}
              strokeLinecap="round"
              fill="none"
              transform={`rotate(-90 ${CENTER} ${CENTER})`}
            />
          </Svg>

          {/* Center Readout */}
          <View style={styles.gaugeCenterReadout}>
            <Text style={styles.gaugeKicker}>YOUR DAILY</Text>
            <Text style={styles.gaugeSubKicker}>CMAS</Text>
            <Text style={styles.gaugeValue}>{clamped}%</Text>
          </View>
        </View>

        {/* Satellite Activity Nodes */}
        {satellites.map(node => {
          const pos = NODE_PLACEMENTS[node.id];
          if (!pos) return null;
          const isSelected = node.id === selectedId;

          return (
            <TouchableOpacity
              key={node.id}
              activeOpacity={0.8}
              onPress={() => setSelectedId(node.id)}
              style={[
                styles.satelliteNodeContainer,
                {
                  top: pos.top,
                  ...(pos.left !== undefined ? { left: pos.left } : {}),
                  ...(pos.right !== undefined ? { right: pos.right } : {}),
                },
              ]}
            >
              <View
                style={[
                  styles.satelliteCircle,
                  {
                    borderColor: isSelected
                      ? '#FFFFFF'
                      : `${node.accentColor}BB`,
                    backgroundColor: isSelected
                      ? `${node.accentColor}2E`
                      : '#0A1931',
                    shadowColor: node.accentColor,
                  },
                ]}
              >
                <SatelliteNodeIcon
                  type={node.iconType}
                  color={node.accentColor}
                  size={17}
                />
              </View>
              {!!node.subLabel && (
                <Text
                  style={[
                    styles.satelliteLabel,
                    isSelected && { color: '#FFFFFF' },
                  ]}
                >
                  {node.subLabel}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Interactive Pillar Detail Pill */}
      {selectedSatellite && (
        <View style={styles.selectedPillarPill}>
          <View style={styles.selectedPillarLeft}>
            <View
              style={[
                styles.selectedPillarDot,
                { backgroundColor: selectedSatellite.accentColor },
              ]}
            />
            <Text style={styles.selectedPillarName}>
              {selectedSatellite.label}
            </Text>
          </View>
          <Text style={styles.selectedPillarMeta}>
            {selectedSatellite.targetText} •{' '}
            <Text style={{ color: selectedSatellite.accentColor, fontWeight: '800' }}>
              {selectedSatellite.score}%
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
};
