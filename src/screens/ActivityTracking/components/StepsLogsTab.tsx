import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop, Path } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';





// 2. SVG Mini Icons Helper to prevent font link issues
const MiniIcon = ({ name, color = '#FFFFFF', size = 16 }: { name: string; color?: string; size?: number }) => {
  switch (name) {
    case 'dumbbell':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M6 5h2v14H6zm10 0h2v14h-2zM2 9h4v6H2zm16 0h4v6h-4zM8 11h8v2H8z" fill={color} />
        </Svg>
      );
    case 'chart-line':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" fill={color} />
        </Svg>
      );
    case 'view-dashboard':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill={color} />
        </Svg>
      );
    case 'weather-sunny':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
          <Circle cx="12" cy="12" r="5" />
          <Path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </Svg>
      );
    case 'weather-sunset-up':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
          <Path d="M17 18a5 5 0 0 0-10 0M12 2v7M12 2l-3 3M12 2l3 3M2 22h20" />
        </Svg>
      );
    case 'weather-night':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12.3 22c-5.52 0-10-4.48-10-10S6.78 2 12.3 2c.48 0 .96.03 1.43.1-.73.9-1.13 2.02-1.13 3.2 0 2.98 2.42 5.4 5.4 5.4 1.18 0 2.3-.4 3.2-1.13.07.47.1.95.1 1.43 0 5.52-4.48 10-10 10z" fill={color} />
        </Svg>
      );
    case 'run-fast':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 21.5h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </Svg>
      );
    case 'map-marker-path':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <Path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
          <Circle cx="12" cy="10" r="3" />
        </Svg>
      );
    case 'clock':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <Circle cx="12" cy="12" r="10" />
          <Path d="M12 6v6l4 2" />
        </Svg>
      );
    case 'fire':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <Path d="M12 2C7.03 2 5 6.03 5 9.75c0 3.32 2.19 6.25 5.25 7.03-.66-1.5-.75-3.03-.25-4.5.56-1.66 1.88-2.91 2.22-4.53.31 1.5 1.5 2.5 1.81 4 .59 2.88-.75 4.88-1.53 5.94 3.34-.84 5.5-3.66 5.5-6.94C19 6.03 16.97 2 12 2z" fill={color} />
        </Svg>
      );
    case 'shoe-print':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <Path d="M4 16c0-3 3-5 5-5s5 2 5 5M12 18c0-3 3-5 5-5s5 2 5 5" strokeLinecap="round" />
        </Svg>
      );
    case 'check-bold':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M20 6L9 17l-5-5" />
        </Svg>
      );
    case 'chevron-up':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M18 15l-6-6-6 6" />
        </Svg>
      );
    case 'chevron-down':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M6 9l6 6 6-6" />
        </Svg>
      );
    case 'chevron-right':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M9 18l6-6-6-6" />
        </Svg>
      );
    case 'calendar-check':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M19 4H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" />
        </Svg>
      );
    case 'eye-off-outline':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
        </Svg>
      );
    case 'history':
      return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
          <Path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <Path d="M3 3v5h5M12 7v5l4 2" />
        </Svg>
      );
    default:
      return null;
  }
};

// 3. Static Color Themes
const activityCardColorTheme = {
  THEMES: {
    morning: {
      gradient: ['#1e1b4b', '#311042'],
      border: '#431407',
      shadow: '#f97316',
      glow: 'rgba(249, 115, 22, 0.05)',
      accent: '#f97316',
      badge: 'rgba(249, 115, 22, 0.15)',
      badgeBorder: 'rgba(249, 115, 22, 0.3)',
      iconColor: '#fdba74',
      ring: '#f97316',
      statIcon: 'rgba(249, 115, 22, 0.1)',
    },
    afternoon: {
      gradient: ['#172554', '#1e1b4b'],
      border: '#1e3a8a',
      shadow: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.05)',
      accent: '#3b82f6',
      badge: 'rgba(59, 130, 246, 0.15)',
      badgeBorder: 'rgba(59, 130, 246, 0.3)',
      iconColor: '#93c5fd',
      ring: '#3b82f6',
      statIcon: 'rgba(59, 130, 246, 0.1)',
    },
    evening: {
      gradient: ['#1e1b4b', '#180029'],
      border: '#3b0764',
      shadow: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.05)',
      accent: '#a855f7',
      badge: 'rgba(168, 85, 247, 0.15)',
      badgeBorder: 'rgba(168, 85, 247, 0.3)',
      iconColor: '#e9d5ff',
      ring: '#a855f7',
      statIcon: 'rgba(168, 85, 247, 0.1)',
    },
    night: {
      gradient: ['#0f172a', '#020617'],
      border: '#1e293b',
      shadow: '#64748b',
      glow: 'rgba(100, 116, 139, 0.05)',
      accent: '#64748b',
      badge: 'rgba(100, 116, 139, 0.15)',
      badgeBorder: 'rgba(100, 116, 139, 0.3)',
      iconColor: '#cbd5e1',
      ring: '#475569',
      statIcon: 'rgba(100, 116, 139, 0.1)',
    },
  }
} as const;

const DailyQuestedCardThemes = {
  morning: {
    accent: '#f97316',
    dimColor: 'rgba(249, 115, 22, 0.08)',
    borderColor: 'rgba(249, 115, 22, 0.2)',
    icon: 'weather-sunny',
    timeRange: '06:00 AM - 12:00 PM',
    label: 'Morning Quest',
  },
  afternoon: {
    accent: '#3b82f6',
    dimColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    icon: 'weather-sunny',
    timeRange: '12:00 PM - 05:00 PM',
    label: 'Afternoon Quest',
  },
  evening: {
    accent: '#a855f7',
    dimColor: 'rgba(168, 85, 247, 0.08)',
    borderColor: 'rgba(168, 85, 247, 0.2)',
    icon: 'weather-sunset-up',
    timeRange: '05:00 PM - 09:00 PM',
    label: 'Evening Quest',
  },
  night: {
    accent: '#64748b',
    dimColor: 'rgba(100, 116, 139, 0.08)',
    borderColor: 'rgba(100, 116, 139, 0.2)',
    icon: 'weather-night',
    timeRange: '09:00 PM - 06:00 AM',
    label: 'Night Quest',
  },
} as const;

const ICON_KEYS = {
  morning: { icon: 'weather-sunny' },
  afternoon: { icon: 'weather-sunny' },
  evening: { icon: 'weather-sunset-up' },
  night: { icon: 'weather-night' },
} as const;

const FitnessActivityBlocks = [
  {
    key: 'Morning' as const,
    label: 'Morn',
    fullLabel: 'Morning Block',
    icon: 'weather-sunny',
    color: '#f97316',
    dimColor: 'rgba(249, 115, 22, 0.08)',
    borderColor: 'rgba(249, 115, 22, 0.2)',
    timeRange: '06:00 AM - 12:00 PM',
  },
  {
    key: 'Afternoon' as const,
    label: 'Aft',
    fullLabel: 'Afternoon Block',
    icon: 'weather-sunny',
    color: '#3b82f6',
    dimColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
    timeRange: '12:00 PM - 05:00 PM',
  },
  {
    key: 'Evening' as const,
    label: 'Eve',
    fullLabel: 'Evening Block',
    icon: 'weather-sunset-up',
    color: '#a855f7',
    dimColor: 'rgba(168, 85, 247, 0.08)',
    borderColor: 'rgba(168, 85, 247, 0.2)',
    timeRange: '05:00 PM - 09:00 PM',
  },
  {
    key: 'Night' as const,
    label: 'Ngt',
    fullLabel: 'Night Block',
    icon: 'weather-night',
    color: '#64748b',
    dimColor: 'rgba(100, 116, 139, 0.08)',
    borderColor: 'rgba(100, 116, 139, 0.2)',
    timeRange: '09:00 PM - 06:00 AM',
  },
];

// Ring Circle calculations
const RADIUS = 28;
const STROKE = 6;
const SIZE = (RADIUS + STROKE) * 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const getScaleForTime = (title: string) => {
  switch (title.toLowerCase()) {
    case 'morning':
      return '06:00 AM - 12:00 PM';
    case 'afternoon':
      return '12:00 PM - 05:00 PM';
    case 'evening':
      return '05:00 PM - 09:00 PM';
    case 'night':
      return '09:00 PM - 06:00 AM';
    default:
      return '';
  }
};

// 4. Static Card Components
const GradientCard: React.FC<{
  defaultColors: readonly [string, string, ...string[]];
  borderColorOverride: string;
  style?: any;
  children?: React.ReactNode;
}> = ({ defaultColors, borderColorOverride, style, children }) => {
  return (
    <LinearGradient
      colors={[...defaultColors]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[style, { borderColor: borderColorOverride }]}
    >
      {children}
    </LinearGradient>
  );
};

const StatRow = ({ icon, value, label, theme }: any) => (
  <View style={cardStyles.statItem}>
    <View style={[cardStyles.statIconCircle, { backgroundColor: theme.statIcon, borderColor: theme.badgeBorder }]}>
      <MiniIcon name={icon} size={11} color={theme.iconColor} />
    </View>
    <View style={cardStyles.statLabelCol}>
      <Text style={cardStyles.statItemValue}>{value}</Text>
      <Text style={cardStyles.statItemLabel}>{label}</Text>
    </View>
  </View>
);

const ActivityCard: React.FC<{
  hp: number;
  goal: number;
  steps: number;
  km: number;
  cal: number;
  time: string;
  isActive: boolean;
  duration: number;
}> = ({ hp, goal, steps, km, cal, time, isActive, duration }) => {
  const theme =
    activityCardColorTheme.THEMES[time.toLowerCase() as keyof typeof activityCardColorTheme.THEMES] ||
    activityCardColorTheme.THEMES.night;
  
  const progress = Math.min(hp / goal, 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const timeScale = getScaleForTime(time);

  return (
    <View style={cardStyles.wrapper}>
      <GradientCard
        defaultColors={theme.gradient}
        borderColorOverride={theme.border}
        style={[
          cardStyles.container,
          isActive && {
            shadowColor: theme.shadow,
            shadowOpacity: 0.25,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 4 },
          },
        ]}
      >
        <View style={[cardStyles.glowEffect, { backgroundColor: theme.glow }]} />
        <View style={[cardStyles.accentLine, { backgroundColor: theme.accent }]} />
        
        <View style={cardStyles.header}>
          <View style={[cardStyles.timeBadge, { backgroundColor: theme.badge, borderColor: theme.badgeBorder }]}>
            <MiniIcon
              name={
                time.toLowerCase() === 'morning'
                  ? 'weather-sunny'
                  : time.toLowerCase() === 'afternoon'
                  ? 'weather-sunny'
                  : time.toLowerCase() === 'evening'
                  ? 'weather-sunset-up'
                  : 'weather-night'
              }
              size={12}
              color={theme.iconColor}
            />
            <Text style={[cardStyles.timeText, { color: theme.iconColor }]}>
              {time} Activity
            </Text>
          </View>

          {isActive && (
            <View style={cardStyles.activeIndicator}>
              <View style={cardStyles.pulseDot} />
              <Text style={cardStyles.activeText}>ACTIVE</Text>
            </View>
          )}
        </View>

        <Text style={[cardStyles.timeRange, { color: theme.accent }]}>
          {timeScale}
        </Text>

        <View style={cardStyles.contentRow}>
          <View style={cardStyles.circleWrapper}>
            <Svg width={SIZE} height={SIZE}>
              <Defs>
                <SvgGradient id={`ringGrad-${time}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={theme.ring} stopOpacity={1} />
                  <Stop offset="100%" stopColor={theme.accent} stopOpacity={0.5} />
                </SvgGradient>
              </Defs>
              <Circle
                stroke="#1E293B"
                fill="none"
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                strokeWidth={STROKE}
              />
              <Circle
                stroke={isActive ? `url(#ringGrad-${time})` : theme.ring}
                fill="none"
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                strokeWidth={STROKE}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${SIZE / 2}, ${SIZE / 2}`}
                opacity={isActive ? 1 : 0.55}
              />
            </Svg>
            <View style={cardStyles.centerText}>
              <Text style={cardStyles.hpText}>{hp}</Text>
              <Text style={[cardStyles.goalText, { color: theme.iconColor }]}>HP</Text>
            </View>
          </View>

          <View style={cardStyles.statsColumn}>
            <View style={cardStyles.statsRow}>
              <StatRow icon="run-fast" value={steps.toLocaleString()} label="Steps" theme={theme} />
              <StatRow icon="map-marker-path" value={`${km} km`} label="Distance" theme={theme} />
            </View>
            <View style={[cardStyles.statsRow, { marginTop: 8 }]}>
              <StatRow icon="clock" value={`${duration} min`} label="Duration" theme={theme} />
              <StatRow icon="fire" value={`${cal} kcal`} label="Energy" theme={theme} />
            </View>
          </View>
        </View>
      </GradientCard>
    </View>
  );
};

const DailyQuestsCard: React.FC = () => {
  const currentPhase = 'evening';
  const theme = DailyQuestedCardThemes[currentPhase] ?? DailyQuestedCardThemes.night;
  const PHASES = ['morning', 'afternoon', 'evening', 'night'] as const;
  const currentIndex = PHASES.indexOf(currentPhase);
  const [expanded, setExpanded] = useState(false);

  const progressPct = (currentIndex / PHASES.length) * 100;

  return (
    <View style={questStyles.container}>
      <View style={[questStyles.accentLine, { backgroundColor: theme.accent }]} />
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setExpanded(prev => !prev)}
        style={questStyles.header}
      >
        <View style={questStyles.headerLeft}>
          <View style={[questStyles.timeBadge, { backgroundColor: theme.dimColor, borderColor: theme.borderColor }]}>
            <MiniIcon name={theme.icon} size={11} color={theme.accent} />
            <Text style={[questStyles.timeBadgeText, { color: theme.accent }]}>
              {currentPhase.toUpperCase()}
            </Text>
            <Text style={questStyles.timeBadgeRange}>{theme.timeRange}</Text>
          </View>
          <Text style={questStyles.sectionTitle}>
            {theme.label}
          </Text>
        </View>
        
        <View style={questStyles.headerRight}>
          <View style={questStyles.goalBadge}>
            <Text style={[questStyles.goalBadgeText, { color: theme.accent }]}>
              {currentIndex}/4
            </Text>
          </View>
          <MiniIcon name={expanded ? 'chevron-up' : 'chevron-down'} size={14} color={theme.accent} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <>
          <View style={questStyles.progressWrap}>
            <View style={questStyles.progressBg}>
              <View
                style={[
                  questStyles.progressFill,
                  { width: `${progressPct}%`, backgroundColor: theme.accent },
                ]}
              />
            </View>
          </View>

          <View style={questStyles.list}>
            {PHASES.map((phase, idx) => {
              let status: 'DONE' | 'RUNNING' | 'PENDING' = 'PENDING';
              if (idx < currentIndex) status = 'DONE';
              else if (idx === currentIndex) status = 'RUNNING';

              return (
                <View key={phase} style={[questStyles.questRow, idx < PHASES.length - 1 && questStyles.questRowBorder]}>
                  <View
                    style={[
                      questStyles.questIcon,
                      {
                        backgroundColor:
                          status === 'DONE'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : status === 'RUNNING'
                            ? 'rgba(59, 130, 246, 0.15)'
                            : theme.dimColor,
                      },
                    ]}
                  >
                    <MiniIcon
                      name={ICON_KEYS[phase].icon}
                      size={14}
                      color={
                        status === 'DONE'
                          ? '#10B981'
                          : status === 'RUNNING'
                          ? '#3B82F6'
                          : theme.accent
                      }
                    />
                  </View>
                  <View style={questStyles.questTextCol}>
                    <Text style={questStyles.questTitle}>{phase.toUpperCase()}</Text>
                  </View>
                  <View style={questStyles.statusCol}>
                    {status === 'DONE' && (
                      <View style={questStyles.doneCircle}>
                        <MiniIcon name="check-bold" size={8} color="#000000" />
                      </View>
                    )}
                    {status === 'RUNNING' && (
                      <Text style={questStyles.runningText}>RUNNING</Text>
                    )}
                    {status === 'PENDING' && (
                      <View style={[questStyles.todoCircle, { borderColor: theme.borderColor }]} />
                    )}
                  </View>
                </View>
              );
            })}
          </View>

          <View style={questStyles.footer}>
            <View style={[questStyles.footerStat, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
              <Text style={questStyles.footerStatValDone}>{currentIndex}</Text>
              <Text style={questStyles.footerStatUnitDone}>Done</Text>
            </View>
            <View style={[questStyles.footerStat, { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
              <Text style={questStyles.footerStatValActive}>1</Text>
              <Text style={questStyles.footerStatUnitActive}>Running</Text>
            </View>
            <View style={[questStyles.footerStat, { backgroundColor: theme.dimColor, borderColor: theme.borderColor }]}>
              <Text style={[questStyles.footerStatVal, { color: theme.accent }]}>{4 - currentIndex - 1}</Text>
              <Text style={questStyles.footerStatUnit}>Pending</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

const FitnessActivityCard: React.FC<{
  date: string;
  distance: number;
  totalEnergy: number;
  steps: number;
  hp: number;
  duration: number;
}> = ({ date, distance, totalEnergy, steps, hp, duration }) => {
  const hpGoal = 150;
  const goalReached = hp >= hpGoal;

  const mockChartData = {
    Morning: 45,
    Afternoon: 30,
    Evening: 65,
    Night: 10,
  };

  return (
    <View style={detailStyles.container}>
      <View style={detailStyles.accentLine} />

      <View style={detailStyles.header}>
        <View style={detailStyles.headerLeft}>
          <View style={detailStyles.dateBadge}>
            <MiniIcon name="calendar-check" size={12} color="#14B8A6" />
            <Text style={detailStyles.dateText}>{date}</Text>
          </View>
          <Text style={detailStyles.sectionTitle}>PREVIOUS DAY DETAIL</Text>
        </View>
        {goalReached && (
          <View style={detailStyles.goalBadge}>
            <MiniIcon name="check-bold" size={10} color="#10B981" />
            <Text style={detailStyles.goalBadgeText}>GOAL MET</Text>
          </View>
        )}
      </View>

      <View style={detailStyles.statsCol}>
        <View style={detailStyles.statRow}>
          <View style={[detailStyles.statPill, { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.2)' }]}>
            <Text style={[detailStyles.statVal, { color: '#10B981' }]}>{hp} HP</Text>
          </View>
          <View style={[detailStyles.statPill, { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <Text style={[detailStyles.statVal, { color: '#F59E0B' }]}>{duration} Min</Text>
          </View>
          <View style={[detailStyles.statPill, { backgroundColor: 'rgba(20, 184, 166, 0.1)', borderColor: 'rgba(20, 184, 166, 0.2)' }]}>
            <Text style={[detailStyles.statVal, { color: '#14B8A6' }]}>{steps.toLocaleString()} Steps</Text>
          </View>
        </View>
        <View style={[detailStyles.statRow, { marginTop: 8 }]}>
          <View style={[detailStyles.statPill, { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
            <Text style={[detailStyles.statVal, { color: '#3B82F6' }]}>{distance} Km</Text>
          </View>
          <View style={[detailStyles.statPill, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
            <Text style={[detailStyles.statVal, { color: '#EF4444' }]}>{totalEnergy} Kcal</Text>
          </View>
        </View>
      </View>

      <View style={detailStyles.summaryRow}>
        <View style={detailStyles.hpBlock}>
          <Text style={detailStyles.hpNumber}>{hp}</Text>
          <View style={detailStyles.hpMeta}>
            <Text style={detailStyles.hpUnit}>HEART POINTS</Text>
          </View>
        </View>
        <View style={detailStyles.vDivider} />
      </View>

      <View style={detailStyles.sectionRow}>
        <Text style={detailStyles.sectionLabel}>HEART POINTS BY TIME</Text>
        <Text style={detailStyles.sectionSub}>MAX SCALE 200</Text>
      </View>

      {/* Bar Chart Representation */}
      <View style={detailStyles.chartWrapper}>
        <View style={detailStyles.yAxis}>
          {['200', '150', '100', '50', '0'].map(v => (
            <Text key={v} style={detailStyles.yLabel}>{v}</Text>
          ))}
        </View>
        <View style={detailStyles.chartArea}>
          {[0, 25, 50, 75, 100].map(pct => (
            <View key={pct} style={[detailStyles.gridLine, { bottom: `${pct}%` }]} />
          ))}
          
          <View style={detailStyles.barsRow}>
            {FitnessActivityBlocks.map(block => {
              const val = mockChartData[block.key];
              const barPct = Math.min((val / 200) * 100, 100);
              const isPeak = block.key === 'Evening';

              return (
                <View key={block.key} style={detailStyles.barCol}>
                  <Text style={[detailStyles.barVal, { color: isPeak ? block.color : '#FFFFFF' }]}>
                    {val}
                  </Text>
                  <View style={detailStyles.barTrack}>
                    <View
                      style={[
                        detailStyles.barFill,
                        {
                          height: `${barPct}%`,
                          backgroundColor: block.color,
                          opacity: isPeak ? 1 : 0.4,
                        },
                      ]}
                    />
                  </View>
                  <View style={[detailStyles.xPill, isPeak && { backgroundColor: block.dimColor, borderColor: block.borderColor, borderWidth: 1 }]}>
                    <MiniIcon name={block.icon} size={10} color={isPeak ? block.color : '#FFFFFF'} />
                    <Text style={[detailStyles.xLabel, { color: isPeak ? block.color : '#FFFFFF' }]}>
                      {block.label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      <View style={detailStyles.sectionRow}>
        <Text style={detailStyles.sectionLabel}>TIME BLOCK BREAKDOWN</Text>
      </View>

      <View style={detailStyles.detailList}>
        {FitnessActivityBlocks.map((block, idx) => {
          const val = mockChartData[block.key];
          const isPeak = block.key === 'Evening';
          return (
            <View
              key={block.key}
              style={[
                detailStyles.detailRow,
                idx < FitnessActivityBlocks.length - 1 && detailStyles.detailRowBorder,
                isPeak && { backgroundColor: block.dimColor, borderRadius: 10 },
              ]}
            >
              <View style={[detailStyles.detailIcon, { backgroundColor: block.dimColor }]}>
                <MiniIcon name={block.icon} size={14} color={block.color} />
              </View>
              <View style={detailStyles.detailLabelCol}>
                <View style={detailStyles.detailLabelRow}>
                  <Text style={[detailStyles.detailLabel, { color: block.color }]}>
                    {block.fullLabel}
                  </Text>
                  {isPeak && (
                    <View style={[detailStyles.peakBadge, { backgroundColor: block.dimColor, borderColor: block.borderColor }]}>
                      <Text style={[detailStyles.peakBadgeText, { color: block.color }]}>PEAK</Text>
                    </View>
                  )}
                </View>
                <Text style={detailStyles.timeRange}>{block.timeRange}</Text>
              </View>

              <View style={detailStyles.detailStat}>
                <Text style={[detailStyles.detailStatVal, { color: block.color }]}>{val}</Text>
                <Text style={[detailStyles.detailStatUnit, { color: block.color }]}>HP</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};



// 6. Main StepsLogsTab Wrapper Component
export const StepsLogsTab: React.FC = () => {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <View style={styles.mainWrapper}>
      {/* Static Info Bar (UHID & Date) */}
      <View style={styles.topHeader}>
        <View style={styles.leftSection}>
          <Text style={styles.userId}>UHID: MH-90234</Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.dateText}>19 Jun, Friday</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        <View>
          {/* Static Activity Logs */}
          <ActivityCard
            time="Morning"
            hp={45}
            goal={50}
            steps={4850}
            km={3.2}
            cal={280}
            duration={35}
            isActive={false}
          />
          <ActivityCard
            time="Afternoon"
            hp={30}
            goal={50}
            steps={2120}
            km={1.5}
            cal={150}
            duration={20}
            isActive={false}
          />
          <ActivityCard
            time="Evening"
            hp={65}
            goal={50}
            steps={5240}
            km={3.8}
            cal={320}
            duration={40}
            isActive={true}
          />
          <ActivityCard
            time="Night"
            hp={10}
            goal={50}
            steps={980}
            km={0.7}
            cal={80}
            duration={15}
            isActive={false}
          />

          {/* Daily Quests progression */}
          <DailyQuestsCard />

          {/* Toggleable Previous Day Details */}
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.previousButton}
            onPress={() => setShowDetail(!showDetail)}
          >
            <View style={styles.buttonContent}>
              <MiniIcon name={showDetail ? 'eye-off-outline' : 'history'} size={15} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {showDetail ? 'Hide Activity Detail' : 'Previous Day Detail'}
              </Text>
              <MiniIcon name={showDetail ? 'chevron-up' : 'chevron-right'} size={15} color="#FFFFFF" />
            </View>
          </TouchableOpacity>

          {showDetail && (
            <FitnessActivityCard
              date="Yesterday, 18 Jun"
              distance={9.2}
              totalEnergy={830}
              steps={13190}
              hp={150}
              duration={110}
            />
          )}
        </View>


      </ScrollView>
    </View>
  );
};

// 7. Styles definitions
const styles = StyleSheet.create({
  mainWrapper: {
    flex: 1,
    paddingTop: 8,
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 4,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'space-between',
    gap: 4,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  userId: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '700',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  previousButton: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

const cardStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  container: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  glowEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  accentLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  activeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  activeText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: 'bold',
  },
  timeRange: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleWrapper: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hpText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  goalText: {
    fontSize: 9,
    fontWeight: '800',
    marginTop: -2,
  },
  statsColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statLabelCol: {
    flex: 1,
  },
  statItemValue: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statItemLabel: {
    color: '#94A3B8',
    fontSize: 9.5,
  },
});

const questStyles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    position: 'relative',
    overflow: 'hidden',
    marginTop: 8,
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  timeBadgeRange: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 4,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  goalBadge: {
    borderRadius: 8,
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  goalBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  progressWrap: {
    marginVertical: 14,
  },
  progressBg: {
    height: 4,
    backgroundColor: '#1E293B',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  list: {
    marginTop: 4,
    gap: 2,
  },
  questRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  questRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  questIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  questTextCol: {
    flex: 1,
  },
  questTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statusCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  doneCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  runningText: {
    color: '#3B82F6',
    fontSize: 9.5,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  todoCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 14,
  },
  footerStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 4,
  },
  footerStatValDone: {
    color: '#10B981',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  footerStatUnitDone: {
    color: '#10B981',
    fontSize: 9.5,
  },
  footerStatValActive: {
    color: '#3B82F6',
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  footerStatUnitActive: {
    color: '#3B82F6',
    fontSize: 9.5,
  },
  footerStatVal: {
    fontSize: 11.5,
    fontWeight: 'bold',
  },
  footerStatUnit: {
    color: '#94A3B8',
    fontSize: 9.5,
    marginLeft: 2,
  },
});

const detailStyles = StyleSheet.create({
  container: {
    backgroundColor: '#0F172A',
    borderRadius: 22,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    position: 'relative',
    overflow: 'hidden',
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: '#14B8A6',
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    gap: 4,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(20, 184, 166, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  dateText: {
    color: '#14B8A6',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  goalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  goalBadgeText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statsCol: {
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statPill: {
    flex: 1,
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  statVal: {
    fontSize: 11,
    fontWeight: '700',
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 14,
  },
  hpBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hpNumber: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  hpMeta: {
    justifyContent: 'center',
  },
  hpUnit: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  vDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#1E293B',
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  sectionLabel: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 1,
  },
  sectionSub: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '600',
  },
  chartWrapper: {
    flexDirection: 'row',
    height: 140,
    marginBottom: 20,
  },
  yAxis: {
    justifyContent: 'space-between',
    paddingBottom: 22,
    marginRight: 8,
    width: 22,
  },
  yLabel: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '600',
    textAlign: 'right',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#1E293B',
  },
  barsRow: {
    position: 'absolute',
    bottom: 22,
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barVal: {
    fontSize: 9,
    fontWeight: '800',
    marginBottom: 3,
  },
  barTrack: {
    width: 12,
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'flex-end',
    marginBottom: 6,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  xPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 7,
  },
  xLabel: {
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  detailList: {
    gap: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  detailLabelCol: {
    flex: 1,
    gap: 2,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '800',
  },
  timeRange: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  peakBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  peakBadgeText: {
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  detailStat: {
    alignItems: 'center',
    gap: 2,
  },
  detailStatVal: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  detailStatUnit: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});



