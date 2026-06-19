import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import Svg, {
  Line,
  Path,
  Circle,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  G,
  Rect,
} from 'react-native-svg';
import { theme } from '../../theme';

// MoveHub custom charting colors
export const moveHubColor = {
  blue: '#6366f1', // Indigo
  teal: '#14b8a6', // Teal
  graphBlue: '#3b82f6', // Blue
  green: '#10b981', // Emerald
  textGray: '#64748b', // Slate-500
  gridLine: '#e2e8f0', // Slate-200
};

const C = moveHubColor;

// Math & SVG Path helpers
export const lerp = (value: number, inMin: number, inMax: number, outMin: number, outMax: number) => {
  if (inMax === inMin) return outMin;
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
};

export const smoothPath = (points: { x: number; y: number }[]): string => {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cp1x = p0.x + (p1.x - p0.x) / 3;
    const cp1y = p0.y;
    const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
    const cp2y = p1.y;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }
  return path;
};

export const areaPath = (points: { x: number; y: number }[], baseY: number): string => {
  if (!points || points.length === 0) return '';
  const line = smoothPath(points);
  const first = points[0];
  const last = points[points.length - 1];
  return `${line} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
};

// Chart types
export interface BarChartProps {
  values: number[];
  labels: string[];
  width: number;
  height: number;
  maxY?: number;
  yTicks?: number[];
  tierLines?: { value: number; color: string }[];
  peakIndex?: number;
}

export interface LineChartProps {
  series: {
    values: number[];
    color: string;
    gradId: string;
    dashed?: boolean;
    filled?: boolean;
  }[];
  labels: string[];
  width: number;
  height: number;
}

export interface DonutProps {
  pct: number;
  size: number;
  color: string | { pct: number; color: string }[];
  trackColor?: string;
}

// 1. Bar Chart Component
export const BarChart: React.FC<BarChartProps> = ({
  values,
  labels,
  width,
  height,
  maxY = 320,
  yTicks = [0, 75, 150, 300],
  tierLines = [],
  peakIndex,
}) => {
  const pL = scale(28);
  const pR = scale(8);
  const pT = verticalScale(12);
  const pB = verticalScale(28);
  const cW = width - pL - pR;
  const cH = height - pT - pB;
  const n = values.length;
  const slot = cW / n;
  const barW = slot * 0.54;

  const toY = (v: number) => pT + cH - lerp(v, 0, maxY, 0, cH);

  const barColor = (v: number, i: number) =>
    i === peakIndex
      ? C.blue
      : v >= 150
        ? C.teal
        : v >= 75
          ? C.graphBlue
          : C.green;

  return (
    <Svg width={width} height={height}>
      <Defs>
        {values.map((v, i) => {
          const col = barColor(v, i);
          return (
            <LinearGradient
              key={`bg${i}`}
              id={`bg${i}`}
              x1="0"
              y1="0"
              x2="0"
              y2="1">
              <Stop offset="0%" stopColor={col} stopOpacity="1" />
              <Stop offset="100%" stopColor={col} stopOpacity="0.6" />
            </LinearGradient>
          );
        })}
      </Defs>

      {yTicks.map(v => {
        const y = toY(v);
        const tier = tierLines.find(t => t.value === v);
        return (
          <G key={v}>
            <Line
              x1={pL}
              y1={y}
              x2={width - pR}
              y2={y}
              stroke={tier ? tier.color : '#E2E8F0'}
              strokeWidth={tier ? 1.5 : 0.8}
              strokeDasharray={tier ? '4,3' : undefined}
              opacity={tier ? 0.8 : 0.4}
            />
            <SvgText
              x={pL - scale(3)}
              y={y + moderateScale(3.5)}
              textAnchor="end"
              fontSize={moderateScale(7.5)}
              fill={C.textGray}>
              {String(v)}
            </SvgText>
          </G>
        );
      })}

      {values.map((v, i) => {
        const col = barColor(v, i);
        const bH = lerp(v, 0, maxY, 0, cH);
        const x = pL + i * slot + (slot - barW) / 2;
        const y = pT + cH - bH;
        const r = moderateScale(4);

        return (
          <G key={i}>
            <Rect
              x={x}
              y={y}
              width={barW}
              height={bH}
              rx={r}
              ry={r}
              fill={`url(#bg${i})`}
              stroke={col}
              strokeWidth={0.5}
            />

            <SvgText
              x={x + barW / 2}
              y={y - verticalScale(4)}
              textAnchor="middle"
              fontSize={moderateScale(9)}
              fontWeight={i === peakIndex ? '800' : '600'}
              fill={i === peakIndex ? col : C.textGray}>
              {String(v)}
            </SvgText>
          </G>
        );
      })}

      {labels.map((l, i) => (
        <SvgText
          key={l}
          x={pL + i * slot + slot / 2}
          y={height - verticalScale(5)}
          textAnchor="middle"
          fontSize={moderateScale(8)}
          fill={i === peakIndex ? C.teal : C.textGray}
          fontWeight={i === peakIndex ? '700' : '400'}>
          {l}
        </SvgText>
      ))}
    </Svg>
  );
};

// 2. Dual Line Chart
export const DualLineChart: React.FC<LineChartProps> = ({
  series,
  labels,
  width,
  height,
}) => {
  const pL = scale(18);
  const pR = scale(18);
  const pT = verticalScale(8);
  const pB = verticalScale(22);
  const cW = width - pL - pR;
  const cH = height - pT - pB;
  const n = labels.length;
  const allVals = series.flatMap(s => s.values);
  const rawMax = allVals?.length > 0 ? Math.max(...allVals) : 0;
  const maxV = rawMax === 0 ? 5 : rawMax * 1.18;
  const baseY = pT + cH;

  const xs = labels.map((_, i) =>
    n <= 1 ? pL + cW / 2 : pL + (i / (n - 1)) * cW,
  );
  const toY = (v: number) => pT + cH - lerp(v, 0, maxV, 0, cH);

  const pts = (vals: number[]) => vals.map((v, i) => ({ x: xs[i], y: toY(v) }));

  return (
    <Svg width={width} height={height}>
      <Defs>
        {series.map((s, index) => (
          <LinearGradient
            key={s.gradId || `grad-${index}`}
            id={s.gradId || `grad-${index}`}
            x1="0"
            y1="0"
            x2="0"
            y2="1">
            <Stop offset="0%" stopColor={s.color} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={s.color} stopOpacity="0.02" />
          </LinearGradient>
        ))}
      </Defs>

      {/* Grid lines */}
      {[0.25, 0.5, 0.75, 1].map(f => {
        const y = pT + cH * (1 - f);
        return (
          <Line
            key={f}
            x1={pL}
            y1={y}
            x2={width - pR}
            y2={y}
            stroke={'#E2E8F0'}
            strokeWidth={0.8}
            opacity={0.3}
          />
        );
      })}

      {series.map((s, index) =>
        s.filled !== false && s.gradId ? (
          <Path
            key={`a${s.gradId || index}`}
            d={areaPath(pts(s.values), baseY)}
            fill={`url(#${s.gradId})`}
          />
        ) : null,
      )}

      {series.map((s, index) => (
        <Path
          key={`l${s.gradId || index}`}
          d={smoothPath(pts(s.values))}
          stroke={s.color}
          strokeWidth={moderateScale(2.5)}
          fill="none"
          strokeDasharray={s.dashed ? '5,3' : undefined}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {series.map((s, index) =>
        pts(s.values).map((p, i) => (
          <Circle
            key={`d${s.gradId || index}${i}`}
            cx={p.x}
            cy={p.y}
            r={moderateScale(3.5)}
            fill="white"
            stroke={s.color}
            strokeWidth={2}
          />
        )),
      )}

      {labels.map((l, i) => (
        <SvgText
          key={l}
          x={xs[i]}
          y={height - verticalScale(4)}
          textAnchor="middle"
          fontSize={moderateScale(7.5)}
          fill={C.textGray}>
          {l}
        </SvgText>
      ))}
    </Svg>
  );
};

// 3. Single Line Chart
export const SingleLineChart = ({
  values,
  labels,
  width,
  height,
  color,
  filled,
}: {
  values: number[];
  labels: string[];
  width: number;
  height: number;
  color: string;
  filled?: boolean;
}) => {
  const pR = 10;
  const pT = 10;
  const pB = 20;
  const n = values.length;
  const rawMax = Math.max(...values, 0);
  const maxV = rawMax === 0 ? 5 : Math.ceil((rawMax + rawMax * 0.2) * 10) / 10;
  const maxLabelLength = String(Math.round(maxV)).length;

  const pL =
    maxLabelLength <= 2
      ? 24
      : maxLabelLength <= 4
        ? 32
        : maxLabelLength <= 6
          ? 44
          : 66;

  const cW = width - pL - pR;
  const cH = height - pT - pB;

  const xsPoints = values.map((_, i) =>
    n === 1 ? pL + cW / 2 : pL + (i / (n - 1)) * cW,
  );

  const toY = (v: number) => pT + cH - (v / maxV) * cH;

  const points = values.map((v, i) => ({
    x: xsPoints[i],
    y: toY(v),
  }));

  const linePath = smoothPath(points);

  const baseY = pT + cH;
  const fillId = `lineFill${color.replace(/[^a-zA-Z0-9]/g, '')}`;

  // dynamic Y-axis
  const steps = 4;
  const yValues = Array.from({ length: steps }, (_, i) =>
    Number(((maxV / steps) * (i + 1)).toFixed(2)),
  );

  const xsLabels = labels.map((_, i) =>
    labels.length === 1 ? pL + cW / 2 : pL + (i / (labels.length - 1)) * cW,
  );

  return (
    <Svg width={width} height={height}>
      <Defs>
        {filled && (
          <LinearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </LinearGradient>
        )}
      </Defs>

      {/* Grid + Y labels */}
      {yValues.map(v => {
        const y = toY(v);
        return (
          <React.Fragment key={v}>
            <SvgText
              x={pL - 4}
              y={y + 3}
              fontSize={7}
              textAnchor="end"
              fill={C.textGray}>
              {String(Math.round(v))}
            </SvgText>
            <Line
              x1={pL}
              y1={y}
              x2={width - pR}
              y2={y}
              stroke={'#E2E8F0'}
              strokeWidth={0.8}
              opacity={0.3}
            />
          </React.Fragment>
        );
      })}

      {filled && <Path d={areaPath(points, baseY)} fill={`url(#${fillId})`} />}

      {/* Line */}
      <Path d={linePath} stroke={color} strokeWidth={3} fill="none" />

      {/* Dots */}
      {points.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={3.5} fill={color} />
      ))}

      {/* Labels */}
      {labels.map((l, i) => (
        <SvgText
          key={`${l}-${i}`}
          x={xsLabels[i]}
          y={height - verticalScale(4)}
          textAnchor={
            i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'
          }
          fontSize={moderateScale(7.5)}
          fill={C.textGray}>
          {l}
        </SvgText>
      ))}
    </Svg>
  );
};

// 4. Donut Chart
export const DonutChart: React.FC<DonutProps> = ({
  pct,
  size,
  color,
  trackColor = '#cbd5e1',
}) => {
  const sw = size * 0.13;
  const r = (size - sw) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;

  const isMulti = Array.isArray(color);

  return (
    <Svg width={size} height={size}>
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={trackColor}
        strokeWidth={sw}
        fill="none"
      />
      {!isMulti && typeof color === 'string' && (
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={color}
          strokeWidth={sw}
          fill="none"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          strokeLinecap="round"
          rotation={-90}
          origin={`${cx},${cy}`}
        />
      )}
      {isMulti &&
        color.map((item, index) => {
          const segmentPct = item.pct;
          const dash = (segmentPct / 100) * circ;

          const offset =
            (color.slice(0, index).reduce((acc, cur) => acc + cur.pct, 0) /
              100) *
            circ;

          return (
            <Circle
              key={index}
              cx={cx}
              cy={cy}
              r={r}
              stroke={item.color}
              strokeWidth={sw}
              fill="none"
              strokeDasharray={`${dash} ${circ}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
              rotation={-90}
              origin={`${cx},${cy}`}
            />
          );
        })}
    </Svg>
  );
};

// 5. Multi Donut Chart
export const MultiDonutChart = ({
  segments,
  size = 100,
  strokeWidth = 14,
}: {
  segments: { value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  let cumulative = 0;

  return (
    <Svg width={size} height={size}>
      <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
        {segments.map((seg, i) => {
          const percent = total > 0 ? seg.value / total : 0;
          const strokeDasharray = `${circumference * percent} ${circumference}`;
          const strokeDashoffset = -cumulative * circumference;

          cumulative += percent;

          return (
            <Circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={seg.color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="butt"
            />
          );
        })}
      </G>
    </Svg>
  );
};

// 6. Segmented Gauge
export const SegmentedGauge = ({
  value,
  segments,
  size = 180,
  strokeWidth = 18,
}: {
  value: number;
  segments: { maxValue: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}) => {
  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const totalMax = segments[segments.length - 1].maxValue;

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    r: number,
    angleInDegrees: number,
  ) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
    return {
      x: centerX + r * Math.cos(angleInRadians),
      y: centerY + r * Math.sin(angleInRadians),
    };
  };

  const describeArc = (
    x: number,
    y: number,
    r: number,
    startAngle: number,
    endAngle: number,
  ) => {
    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return [
      'M',
      start.x,
      start.y,
      'A',
      r,
      r,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(' ');
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size * 0.6}>
        {/* Background Track */}
        <Path
          d={describeArc(cx, cy, radius, 0, 180)}
          stroke="#F1F5F9"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Segments */}
        {segments.map((seg, i) => {
          const prevMax = i === 0 ? 0 : segments[i - 1].maxValue;
          const startAngle = (prevMax / totalMax) * 180;
          const endAngle = (seg.maxValue / totalMax) * 180;

          return (
            <Path
              key={i}
              d={describeArc(cx, cy, radius, startAngle, endAngle)}
              stroke={seg.color}
              strokeWidth={strokeWidth}
              fill="none"
            />
          );
        })}

        {/* Needle */}
        {(() => {
          const angle = (Math.min(value, totalMax) / totalMax) * 180;
          const needleLen = radius - 5;
          const needleEnd = polarToCartesian(cx, cy, needleLen, angle);

          return (
            <G>
              <Line
                x1={cx}
                y1={cy}
                x2={needleEnd.x}
                y2={needleEnd.y}
                stroke="#1E293B"
                strokeWidth={4}
                strokeLinecap="round"
              />
              <Circle cx={cx} cy={cy} r={8} fill="#1E293B" />
              <Circle cx={cx} cy={cy} r={4} fill="#64748B" />
            </G>
          );
        })()}
      </Svg>
    </View>
  );
};

// Custom layout components referenced by dashboard
export const Card: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.card}>{children}</View>
);

export const CardHeader: React.FC<{ title: string; subtitle: string }> = ({
  title,
  subtitle,
}) => (
  <View style={styles.cardHeaderContainer}>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardSub}>{subtitle}</Text>
  </View>
);

export const AlertBox: React.FC<{
  text: string;
  bg: string;
  color: string;
  icon: string;
}> = ({ text, bg, color, icon }) => (
  <View style={[styles.alertBox, { backgroundColor: bg }]}>
    <Text style={styles.alertIcon}>{icon}</Text>
    <Text style={[styles.alertText, { color }]}>{text}</Text>
  </View>
);

export const SectionLabel: React.FC<{ text: string; center?: boolean }> = ({
  text,
  center,
}) => (
  <Text style={[styles.sectionLabel, center && { textAlign: 'center' }]}>
    {text}
  </Text>
);

export const LegendItem: React.FC<{
  color: string;
  label: string;
  dashed?: boolean;
}> = ({ color, label, dashed }) => (
  <View style={styles.legendItem}>
    <View
      style={[
        styles.legendDot,
        {
          backgroundColor: color,
          opacity: dashed ? 0.7 : 1,
        },
      ]}
    />
    <Text style={styles.legendText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.lg,
    marginVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeaderContainer: {
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
  },
  cardSub: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  alertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.spacing.borderRadiusMd,
    marginVertical: theme.spacing.sm,
  },
  alertIcon: {
    fontSize: 18,
    marginRight: theme.spacing.sm,
  },
  alertText: {
    fontSize: 12.5,
    fontWeight: '600',
    flex: 1,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginVertical: theme.spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginLeft: 6,
    fontWeight: '500',
  },
});
