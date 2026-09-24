import React from 'react';
import Svg, { Circle, G } from 'react-native-svg';

interface Segment {
  color: string;
  pct: number;
}

interface DonutChartProps {
  pct: number | Segment[];
  size?: number;
  strokeWidth?: number;
  color?: string; // used if pct is a number
}

export const DonutChart: React.FC<DonutChartProps> = ({
  pct,
  size = 120,
  strokeWidth = 10,
  color = '#14B8A6',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  if (typeof pct === 'number') {
    const strokeDashoffset = circumference - (pct / 100) * circumference;
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Active progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
          />
        </G>
      </Svg>
    );
  } else {
    // Multi-segment donut chart
    let currentOffset = 0;
    return (
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1E293B"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {pct.map((segment, index) => {
            const segmentOffset = circumference - (segment.pct / 100) * circumference;
            const strokeDashoffset = circumference - (segment.pct / 100) * circumference + currentOffset;
            currentOffset -= (segment.pct / 100) * circumference;
            
            return (
              <Circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                fill="none"
              />
            );
          })}
        </G>
      </Svg>
    );
  }
};

export default DonutChart;
