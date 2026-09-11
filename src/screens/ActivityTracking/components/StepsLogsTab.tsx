import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Switch,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  getHealthConnectAccessState,
  requestHealthConnectPermissions,
  openHealthConnectAppSettings,
  syncHealthConnectAnalytics,
} from '../../../services/healthConnect';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop, Path } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import { apiService } from '../../../services/api';
import { storageHelper } from '../../../storage/storageHelper';
import { STORAGE_KEYS } from '../../../storage/storageKeys';
import { UserProfile } from '../../../types';





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
  hp: number | string;
  goal: number;
  steps: number | string;
  km: number | string;
  cal: number | string;
  time: string;
  isActive: boolean;
  duration: number | string;
  cardTierLabel?: string;
  timeRangeHint?: string;
  status?: string;
}> = ({
  hp,
  goal = 5.4,
  steps,
  km,
  cal,
  time,
  isActive,
  duration,
  cardTierLabel,
  timeRangeHint,
  status,
}) => {
  const theme =
    activityCardColorTheme.THEMES[time.toLowerCase() as keyof typeof activityCardColorTheme.THEMES] ||
    activityCardColorTheme.THEMES.night;
  
  const hpNum = typeof hp === 'number' ? hp : parseFloat(String(hp)) || 0;
  const targetGoal = goal || 5.4;
  const progress = Math.min(hpNum / targetGoal, 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const timeScale = timeRangeHint || getScaleForTime(time);

  // Status badge display
  const isRunning = status === 'IN_PROGRESS' || isActive;
  const statusLabel = status === 'IN_PROGRESS' ? 'IN PROGRESS' : isActive ? 'ACTIVE' : status;

  // Format steps
  const stepsNum = typeof steps === 'number' ? steps : (steps !== '--' && steps !== '' && steps !== null && steps !== undefined ? parseFloat(String(steps)) : NaN);
  const stepsDisplay = !isNaN(stepsNum) ? Math.round(stepsNum).toLocaleString() : (steps || '--');
  // Format distance
  const kmNum = typeof km === 'number' ? km : (km !== '--' && km !== '' && km !== null && km !== undefined ? parseFloat(String(km)) : NaN);
  const kmDisplay = !isNaN(kmNum) ? `${kmNum.toFixed(1)} km` : (km || '--');
  // Format duration
  const durNum = typeof duration === 'number' ? duration : (duration !== '--' && duration !== '' && duration !== null && duration !== undefined ? parseFloat(String(duration)) : NaN);
  const durationDisplay = !isNaN(durNum) ? `${Math.round(durNum)} min` : (duration || '--');
  // Format cal / E3
  const calNum = typeof cal === 'number' ? cal : (cal !== '--' && cal !== '' && cal !== null && cal !== undefined ? parseFloat(String(cal)) : NaN);
  const calDisplay = !isNaN(calNum) ? `${Math.round(calNum)} kcal` : (cal || '--');
  // Format hp
  const hpNumVal = typeof hp === 'number' ? hp : (hp !== '--' && hp !== '' && hp !== null && hp !== undefined ? parseFloat(String(hp)) : NaN);
  const hpDisplay = !isNaN(hpNumVal) ? String(Math.round(hpNumVal)) : (hp !== undefined && hp !== null && hp !== '' ? hp : '--');

  return (
    <View style={cardStyles.wrapper}>
      <GradientCard
        defaultColors={theme.gradient}
        borderColorOverride={theme.border}
        style={[
          cardStyles.container,
          isRunning && {
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
              {cardTierLabel || `${time} Activity`}
            </Text>
          </View>

          {isRunning && (
            <View style={cardStyles.activeIndicator}>
              <View style={cardStyles.pulseDot} />
              <Text style={cardStyles.activeText}>{statusLabel}</Text>
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
                stroke={isRunning ? `url(#ringGrad-${time})` : theme.ring}
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
                opacity={isRunning ? 1 : 0.55}
              />
            </Svg>
            <View style={cardStyles.centerText}>
              <Text style={cardStyles.hpText}>{hpDisplay}</Text>
              <Text style={[cardStyles.goalText, { color: theme.iconColor }]}>HP</Text>
            </View>
          </View>

          <View style={cardStyles.statsColumn}>
            <View style={cardStyles.statsRow}>
              <StatRow icon="run-fast" value={stepsDisplay} label="Steps" theme={theme} />
              <StatRow icon="map-marker-path" value={kmDisplay} label="Distance" theme={theme} />
            </View>
            <View style={[cardStyles.statsRow, { marginTop: 8 }]}>
              <StatRow icon="clock" value={durationDisplay} label="Duration" theme={theme} />
              <StatRow icon="fire" value={calDisplay} label="Energy" theme={theme} />
            </View>
          </View>
        </View>
      </GradientCard>
    </View>
  );
};

const DailyQuestsCard: React.FC = () => {
  const getCurrentPhase = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hrs = new Date().getHours();
    if (hrs >= 6 && hrs < 12) return 'morning';
    if (hrs >= 12 && hrs < 17) return 'afternoon';
    if (hrs >= 17 && hrs < 21) return 'evening';
    return 'night';
  };

  const currentPhase = getCurrentPhase();
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
          <View style={[questStyles.circleIcon, { backgroundColor: theme.dimColor }]}>
            <MiniIcon name={theme.icon} size={14} color={theme.accent} />
          </View>
          <View style={questStyles.titleContainer}>
            <Text style={questStyles.sectionTitle}>{theme.label}</Text>
            <Text style={questStyles.timeBadgeRange}>{theme.timeRange}</Text>
          </View>
        </View>
        
        <View style={questStyles.headerRight}>
          <View style={questStyles.goalBadge}>
            <Text style={[questStyles.goalBadgeText, { color: theme.accent }]}>
              {currentIndex}/4 Done
            </Text>
          </View>
          <View style={[questStyles.chevronCircle, { borderColor: theme.borderColor }]}>
            <MiniIcon name={expanded ? 'chevron-up' : 'chevron-down'} size={12} color={theme.accent} />
          </View>
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
  summary: any;
}> = ({ summary }) => {
  if (!summary) {
    return (
      <View style={[detailStyles.container, { padding: 24, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator size="small" color="#14B8A6" />
        <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 8 }}>
          Loading previous day details...
        </Text>
      </View>
    );
  }

  const formatDate = (hintOrDate?: string) => {
    if (!hintOrDate) return 'Yesterday';
    try {
      const match = hintOrDate.match(/\d{4}-\d{2}-\d{2}/);
      const dateStr = match ? match[0] : hintOrDate;
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return hintOrDate;
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
      return `Yesterday, ${d.toLocaleDateString('en-US', options)}`;
    } catch (e) {
      return 'Yesterday';
    }
  };

  const date = formatDate(summary.time_range_hint || summary.activityDate);

  // Parse sessions from new Pull API (`sessions` array) or fallback to legacy `sessionList`
  const rawSessions = summary.sessions || summary.sessionList || [];

  const parsedSessions = rawSessions.map((s: any) => {
    const sessionName = s.session || s.title || '';
    const m = s.metrics || {};
    
    // Heart points
    let hp: number | string = 0;
    if (m['Heart Points'] !== undefined) {
      hp = m['Heart Points'] === '--' ? '--' : (typeof m['Heart Points'] === 'number' ? m['Heart Points'] : parseFloat(m['Heart Points']) || 0);
    } else if (s.heartPoint !== undefined) {
      hp = typeof s.heartPoint === 'number' ? s.heartPoint : parseFloat(s.heartPoint) || 0;
    }

    // Steps
    let steps: number | string = 0;
    const rawSteps: any = m.steps !== undefined ? m.steps : s.steps;
    if (rawSteps !== undefined) {
      steps = rawSteps === '--' ? '--' : (typeof rawSteps === 'number' ? rawSteps : parseInt(rawSteps, 10) || 0);
    }

    // Distance (km)
    let km: number | string = 0;
    const rawKm: any = m.km !== undefined ? m.km : s.distance;
    if (rawKm !== undefined) {
      km = rawKm === '--' ? '--' : (typeof rawKm === 'number' ? rawKm : parseFloat(rawKm) || 0);
    }

    // Duration (min)
    let duration: number | string = 0;
    const rawMin: any = m.min !== undefined ? m.min : s.duration;
    if (rawMin !== undefined) {
      duration = rawMin === '--' ? '--' : (typeof rawMin === 'number' ? rawMin : parseFloat(rawMin) || 0);
    }

    // Energy (E3/kcal)
    let energy: number | string = 0;
    const rawE3: any = m.E3 !== undefined ? m.E3 : (m.energy_expended_kcal !== undefined ? m.energy_expended_kcal : s.energyExpended);
    if (rawE3 !== undefined) {
      energy = rawE3 === '--' ? '--' : (typeof rawE3 === 'number' ? rawE3 : parseFloat(rawE3) || 0);
    }

    const hpNum = typeof hp === 'number' ? hp : 0;
    const stepsNum = typeof steps === 'number' ? steps : 0;
    const kmNum = typeof km === 'number' ? km : 0;
    const durationNum = typeof duration === 'number' ? duration : 0;
    const energyNum = typeof energy === 'number' ? energy : 0;

    return {
      session: sessionName,
      hp,
      hpNum,
      steps,
      stepsNum,
      km,
      kmNum,
      duration,
      durationNum,
      energy,
      energyNum,
      rawMetrics: m,
    };
  });

  // Calculate totals
  let totalSteps = Math.round(parsedSessions.reduce((acc: number, curr: any) => acc + curr.stepsNum, 0));
  let totalDistance = parseFloat(parsedSessions.reduce((acc: number, curr: any) => acc + curr.kmNum, 0).toFixed(1));
  let totalEnergy = Math.round(parsedSessions.reduce((acc: number, curr: any) => acc + curr.energyNum, 0));
  let totalHp = Math.round(parsedSessions.reduce((acc: number, curr: any) => acc + curr.hpNum, 0));
  let totalDuration = Math.round(parsedSessions.reduce((acc: number, curr: any) => acc + curr.durationNum, 0));

  if (typeof summary.totalSteps === 'number' && summary.totalSteps > 0) totalSteps = Math.round(summary.totalSteps);
  else if (summary.totalSteps && !isNaN(Number(summary.totalSteps))) totalSteps = Math.round(Number(summary.totalSteps));

  if (typeof summary.totalDistance === 'number' && summary.totalDistance > 0) totalDistance = parseFloat(summary.totalDistance.toFixed(1));
  else if (summary.totalDistance && !isNaN(Number(summary.totalDistance))) totalDistance = parseFloat(Number(summary.totalDistance).toFixed(1));

  if (typeof summary.totalEnergyExpended === 'number' && summary.totalEnergyExpended > 0) totalEnergy = Math.round(summary.totalEnergyExpended);
  else if (summary.totalEnergyExpended && !isNaN(Number(summary.totalEnergyExpended))) totalEnergy = Math.round(Number(summary.totalEnergyExpended));

  if (typeof summary.totalHeartPoint === 'number' && summary.totalHeartPoint > 0) totalHp = Math.round(summary.totalHeartPoint);
  else if (summary.totalHeartPoint && !isNaN(Number(summary.totalHeartPoint))) totalHp = Math.round(Number(summary.totalHeartPoint));

  const hpGoal = 21.4;
  const goalReached = totalHp >= hpGoal;

  // Calculate dynamic chartData map from parsedSessions
  const chartData: Record<string, number> = {
    Morning: 0,
    Afternoon: 0,
    Evening: 0,
    Night: 0,
  };

  parsedSessions.forEach((s: any) => {
    const key = s.session ? s.session.charAt(0).toUpperCase() + s.session.slice(1).toLowerCase() : '';
    if (key in chartData) {
      chartData[key] = s.hpNum;
    }
  });

  // Calculate dynamic peak time block key based on highest heartPoint
  let peakKey = 'Evening';
  let maxHp = 0;
  parsedSessions.forEach((s: any) => {
    if (s.hpNum > maxHp) {
      maxHp = s.hpNum;
      peakKey = s.session ? s.session.charAt(0).toUpperCase() + s.session.slice(1).toLowerCase() : 'Evening';
    }
  });

  const maxScale = Math.max(Math.ceil(maxHp / 25) * 25, 50);

  const yLabels = [
    String(maxScale),
    String(Math.round(maxScale * 0.75)),
    String(Math.round(maxScale * 0.5)),
    String(Math.round(maxScale * 0.25)),
    '0',
  ];

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
            <Text style={[detailStyles.statVal, { color: '#10B981' }]}>{Math.round(totalHp)} HP</Text>
          </View>
          <View style={[detailStyles.statPill, { backgroundColor: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)' }]}>
            <Text style={[detailStyles.statVal, { color: '#F59E0B' }]}>{Math.round(totalDuration)} Min</Text>
          </View>
          <View style={[detailStyles.statPill, { backgroundColor: 'rgba(20, 184, 166, 0.1)', borderColor: 'rgba(20, 184, 166, 0.2)' }]}>
            <Text style={[detailStyles.statVal, { color: '#14B8A6' }]}>{Math.round(totalSteps).toLocaleString()} Steps</Text>
          </View>
        </View>
        <View style={[detailStyles.statRow, { marginTop: 8 }]}>
          <View style={[detailStyles.statPill, { backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.2)' }]}>
            <Text style={[detailStyles.statVal, { color: '#3B82F6' }]}>{totalDistance.toFixed(1)} Km</Text>
          </View>
          <View style={[detailStyles.statPill, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }]}>
            <Text style={[detailStyles.statVal, { color: '#EF4444' }]}>{Math.round(totalEnergy)} Kcal</Text>
          </View>
        </View>
      </View>

      <View style={detailStyles.summaryRow}>
        <View style={detailStyles.hpBlock}>
          <Text style={detailStyles.hpNumber}>{Math.round(totalHp)}</Text>
          <View style={detailStyles.hpMeta}>
            <Text style={detailStyles.hpUnit}>HEART POINTS</Text>
          </View>
        </View>
        <View style={detailStyles.vDivider} />
      </View>

      <View style={detailStyles.sectionRow}>
        <Text style={detailStyles.sectionLabel}>HEART POINTS BY TIME</Text>
        <Text style={detailStyles.sectionSub}>MAX SCALE {maxScale}</Text>
      </View>

      {/* Bar Chart Representation */}
      <View style={detailStyles.chartWrapper}>
        <View style={detailStyles.yAxis}>
          {yLabels.map(v => (
            <Text key={v} style={detailStyles.yLabel}>{v}</Text>
          ))}
        </View>
        <View style={detailStyles.chartArea}>
          {[0, 25, 50, 75, 100].map(pct => (
            <View key={pct} style={[detailStyles.gridLine, { bottom: `${pct}%` }]} />
          ))}
          
          <View style={detailStyles.barsRow}>
            {FitnessActivityBlocks.map(block => {
              const val = chartData[block.key] || 0;
              const barPct = Math.min((val / maxScale) * 100, 100);
              const isPeak = block.key === peakKey && maxHp > 0;

              return (
                <View key={block.key} style={detailStyles.barCol}>
                  <Text style={[detailStyles.barVal, { color: isPeak ? block.color : '#FFFFFF' }]}>
                    {Math.round(val)}
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
          const isPeak = block.key === peakKey && maxHp > 0;

          // Fetch dynamic stats for this block
          const session = parsedSessions.find((s: any) => 
            s.session?.toLowerCase() === block.key.toLowerCase()
          );

          const sMinDisplay = session ? (session.duration === '--' ? '-- min' : `${Math.round(session.durationNum)} min`) : '0 min';
          const sStepsDisplay = session ? (session.steps === '--' ? '-- steps' : `${Math.round(session.stepsNum).toLocaleString()} steps`) : '0 steps';
          const sDistDisplay = session ? (session.km === '--' ? '-- km' : `${session.kmNum.toFixed(1)} km`) : '0.0 km';
          const sCalDisplay = session ? (session.energy === '--' ? '-- kcal' : `${Math.round(session.energyNum)} kcal`) : '0 kcal';
          const sHpDisplay = session ? (session.hp === '--' ? '--' : `${Math.round(session.hpNum)}`) : '0';

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
                  <Text style={detailStyles.timeRangeInline}>
                    ({block.timeRange})
                  </Text>
                  {isPeak && (
                    <View style={[detailStyles.peakBadge, { backgroundColor: block.dimColor, borderColor: block.borderColor }]}>
                      <Text style={[detailStyles.peakBadgeText, { color: block.color }]}>PEAK</Text>
                    </View>
                  )}
                </View>
                <Text style={detailStyles.timeRange}>
                  {sMinDisplay} • {sStepsDisplay} • {sDistDisplay} • {sCalDisplay}
                </Text>
              </View>

              <View style={detailStyles.detailStat}>
                <Text style={[detailStyles.detailStatVal, { color: block.color }]}>{sHpDisplay}</Text>
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
  const [activeUhid, setActiveUhid] = useState('SAUSHA9775');
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);
  const [pullStepsLogs, setPullStepsLogs] = useState<any>(null);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasPermissions, setHasPermissions] = useState<boolean>(true);
  const [bypassCheck, setBypassCheck] = useState<boolean>(false);
  const [dailyDisplayBlock, setDailyDisplayBlock] = useState<any>(null);

  const fetchHealthActivities = useCallback(async (isRefresh = false, forceBypass = false) => {
    if (!isRefresh) setLoadingLogs(true);
    try {
      const access = await getHealthConnectAccessState();
      const hasPerms = access.hasAllPermissions || forceBypass;
      setHasPermissions(hasPerms);

      const cachedProfile = await storageHelper.getItem<UserProfile>(
        STORAGE_KEYS.USER_PROFILE,
      );
      const targetUhid = cachedProfile?.uhid || 'SAUSHA9775';
      setActiveUhid(targetUhid);

      if (hasPerms) {
        try {
          console.log('[StepsLogsTab] Performing fast foreground Health Connect sync...');
          await syncHealthConnectAnalytics();
        } catch (syncErr) {
          console.warn('[StepsLogsTab] Foreground sync before fetching logs failed:', syncErr);
        }

        try {
          console.log(`Fetching getPullStepsLogs for ${targetUhid}...`);
          const pullRes = await apiService.getPullStepsLogs(targetUhid);
          console.log('getPullStepsLogs Response in StepsLogsTab:', JSON.stringify(pullRes, null, 2));
          if (pullRes && pullRes.data?.steplogs?.data) {
            setPullStepsLogs(pullRes.data.steplogs.data);
          } else {
            setPullStepsLogs(null);
          }
        } catch (pullErr) {
          console.warn('Error fetching getPullStepsLogs in StepsLogsTab:', pullErr);
          setPullStepsLogs(null);
        }

        console.log(`Fetching Health Connect activities for ${targetUhid}...`);
        const response = await apiService.getHealthConnectActivities(targetUhid);
        console.log('GET Health Connect Activities Response in StepsLogsTab:', response);

        console.log(`Fetching Workout Logs for ${targetUhid}...`);
        const workoutLogResponse = await apiService.getWorkoutLog(targetUhid);
        console.log('GET Workout Log Response in StepsLogsTab:', JSON.stringify(workoutLogResponse, null, 2));

        if (workoutLogResponse && workoutLogResponse.status === 'Success' && Array.isArray(workoutLogResponse.data)) {
          setWorkoutLogs(workoutLogResponse.data);
        } else {
          setWorkoutLogs([]);
        }

        try {
          const sysDate = new Date();
          const sysY = sysDate.getFullYear();
          const sysM = String(sysDate.getMonth() + 1).padStart(2, '0');
          const sysD = String(sysDate.getDate()).padStart(2, '0');
          const systemDateStr = `${sysY}-${sysM}-${sysD}`;

          console.log(`Fetching getDailyDisplayBlock for ${targetUhid} on Date: ${systemDateStr}...`);
          const displayBlockRes = await apiService.getDailyDisplayBlock(targetUhid, systemDateStr);
          console.log('getDailyDisplayBlock Response in StepsLogsTab:', JSON.stringify(displayBlockRes, null, 2));
          if (displayBlockRes) {
            setDailyDisplayBlock(displayBlockRes);
          } else {
            setDailyDisplayBlock(null);
          }
        } catch (displayBlockErr) {
          console.warn('Error fetching getDailyDisplayBlock in StepsLogsTab:', displayBlockErr);
          setDailyDisplayBlock(null);
        }
      } else {
        setWorkoutLogs([]);
        setDailyDisplayBlock(null);
        setPullStepsLogs(null);
      }
    } catch (error) {
      console.error('Error fetching Health Connect / Workout logs in StepsLogsTab:', error);
    } finally {
      setLoadingLogs(false);
      setRefreshing(false);
    }
  }, []);

  // Scheduled Auto-Refresh Times (6:00:05 AM, 12:00:05 PM, 5:00:05 PM, 9:00:05 PM)
  const SCHEDULED_REFRESH_TIMES = [
    '06:00:05', // Morning (06:00:05 AM)
    '12:00:05', // Afternoon (12:00:05 PM)
    '17:00:05', // Evening (05:00:05 PM)
    '21:00:05', // Night (09:00:05 PM)
  ];

  useFocusEffect(
    useCallback(() => {
      // 1. Initial fetch on screen focus
      fetchHealthActivities(false, bypassCheck);

      // 2. Setup timers for scheduled auto-refresh when user stays on this screen
      const timeouts: ReturnType<typeof setTimeout>[] = [];
      const executedTimes = new Set<string>();

      SCHEDULED_REFRESH_TIMES.forEach(timeStr => {
        const [h, m, s] = timeStr.split(':').map(Number);
        const now = new Date();
        const target = new Date();
        target.setHours(h, m, s, 0);

        const delay = target.getTime() - now.getTime();
        // If the target time is in the future today
        if (delay > 0) {
          console.log(`[StepsLogsTab] Scheduled auto-refresh for ${timeStr} in ${(delay / 1000).toFixed(1)}s`);
          const timeoutId = setTimeout(() => {
            console.log(`[StepsLogsTab] ⏰ Auto-triggering scheduled API hit at ${timeStr}`);
            fetchHealthActivities(true, bypassCheck);
            executedTimes.add(timeStr);
          }, delay);
          timeouts.push(timeoutId);
        }
      });

      // 3. Fallback interval check every 1 second to ensure exact second precision even if device sleep/wake happens
      const intervalId = setInterval(() => {
        const now = new Date();
        const currentH = String(now.getHours()).padStart(2, '0');
        const currentM = String(now.getMinutes()).padStart(2, '0');
        const currentS = String(now.getSeconds()).padStart(2, '0');
        const currentTimeKey = `${currentH}:${currentM}:${currentS}`;

        if (SCHEDULED_REFRESH_TIMES.includes(currentTimeKey) && !executedTimes.has(currentTimeKey)) {
          console.log(`[StepsLogsTab] ⏰ Interval detected target time: ${currentTimeKey}. Triggering auto-fetch...`);
          executedTimes.add(currentTimeKey);
          fetchHealthActivities(true, bypassCheck);
        }
      }, 1000);

      return () => {
        timeouts.forEach(t => clearTimeout(t));
        clearInterval(intervalId);
      };
    }, [fetchHealthActivities, bypassCheck])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHealthActivities(true, bypassCheck);
  };

  const handleGrantPermissions = async () => {
    try {
      const access = await requestHealthConnectPermissions();
      setHasPermissions(access.hasAllPermissions);
      if (access.hasAllPermissions) {
        fetchHealthActivities(true);
      }
    } catch (err) {
      console.warn('Failed to request permissions:', err);
    }
  };

  return (
    <View style={styles.mainWrapper}>
      {/* Static Info Bar (UHID & Date) */}
      <View style={styles.topHeader}>
        <View style={styles.leftSection}>
          <Text style={styles.userId}>UHID: {activeUhid}</Text>
        </View>
        <View style={styles.rightSection}>
          <Text style={styles.dateText}>
            {(() => {
              const sysDate = new Date();
              const sysY = sysDate.getFullYear();
              const sysM = String(sysDate.getMonth() + 1).padStart(2, '0');
              const sysD = String(sysDate.getDate()).padStart(2, '0');
              
              let hours = sysDate.getHours();
              const ampm = hours >= 12 ? 'PM' : 'AM';
              hours = hours % 12;
              hours = hours ? hours : 12; // 0 should be 12
              
              const sysH = String(hours).padStart(2, '0');
              const sysMin = String(sysDate.getMinutes()).padStart(2, '0');
              return `${sysY}-${sysM}-${sysD} ${sysH}:${sysMin} ${ampm}`;
            })()}
          </Text>
        </View>
        {/* <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ color: '#94a3b8', fontSize: 11, marginRight: 6 }}>Bypass Check</Text>
          <Switch
            value={bypassCheck}
            onValueChange={(val) => {
              setBypassCheck(val);
              fetchHealthActivities(true, val);
            }}
            trackColor={{ false: '#334155', true: '#6366f1' }}
            thumbColor={bypassCheck ? '#ffffff' : '#94a3b8'}
          />
        </View> */}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
      >
        <View>
          {/* Dynamic Activity Logs */}
          {loadingLogs ? (
            <View style={{ paddingVertical: 40, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={{ marginTop: 12, color: '#94a3b8', fontSize: 13, fontWeight: '500' }}>
                Fetching dynamic time blocks...
              </Text>
            </View>
          ) : !hasPermissions ? (
            <View style={{ paddingVertical: 45, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#ef4444', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>
                ⚠️ Health Connect Permissions Missing
              </Text>
              <Text style={{ color: '#94a3b8', fontSize: 12, marginTop: 8, textAlign: 'center', lineHeight: 18 }}>
                MoveHub is not authorized to access your fitness records. Please grant permissions to sync your steps and activities.
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 18 }}>
                <TouchableOpacity
                  onPress={handleGrantPermissions}
                  style={{
                    backgroundColor: '#6366f1',
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                    marginRight: 8,
                  }}
                >
                  <Text style={{ color: '#ffffff', fontSize: 13, fontWeight: '600' }}>Grant Permissions</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={openHealthConnectAppSettings}
                  style={{
                    backgroundColor: '#334155',
                    paddingVertical: 10,
                    paddingHorizontal: 16,
                    borderRadius: 20,
                  }}
                >
                  <Text style={{ color: '#94a3b8', fontSize: 13, fontWeight: '600' }}>Open Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (() => {
            const cardsStack = pullStepsLogs?.cards_stack || [];
            const timeCards = cardsStack.filter((c: any) => {
              const label = (c.card_tier_label || '').toLowerCase();
              return !label.includes('previous day') && !label.includes('accordion');
            });

            if (timeCards.length === 0 && workoutLogs.length === 0) {
              return (
                <View style={{ paddingVertical: 45, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: '600', textAlign: 'center' }}>
                    No synced activities for today yet.
                  </Text>
                  <Text style={{ color: '#64748b', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                    Ensure Google Fit integration is connected and active.
                  </Text>
                </View>
              );
            }

            const getTimeFromCard = (card: any): string => {
              const label = (card.card_tier_label || '').toLowerCase();
              if (label.includes('morning')) return 'Morning';
              if (label.includes('afternoon')) return 'Afternoon';
              if (label.includes('evening')) return 'Evening';
              if (label.includes('night')) return 'Night';
              return 'Morning';
            };

            // Sort so newest block is on top (Night > Evening > Afternoon > Morning)
            const blockWeights: Record<string, number> = {
              night: 4,
              evening: 3,
              afternoon: 2,
              morning: 1,
            };

            const sortedTimeCards = [...timeCards].sort((a: any, b: any) => {
              const getWeight = (c: any) => {
                const l = (c.card_tier_label || '').toLowerCase();
                if (l.includes('night')) return blockWeights.night;
                if (l.includes('evening')) return blockWeights.evening;
                if (l.includes('afternoon')) return blockWeights.afternoon;
                if (l.includes('morning')) return blockWeights.morning;
                return 0;
              };
              return getWeight(b) - getWeight(a);
            });

            if (sortedTimeCards.length > 0) {
              return sortedTimeCards.map((card: any, index: number) => {
                const formattedTime = getTimeFromCard(card);
                const isRunning = card.status === 'IN_PROGRESS' || card.status === 'RUNNING';
                const metrics = card.metrics || {};

                const hpVal =
                  metrics['Heart Points'] !== undefined
                    ? metrics['Heart Points']
                    : metrics['heart_points'] ?? '--';
                const stepsVal = metrics['steps'] !== undefined ? metrics['steps'] : '--';
                const distanceVal = metrics['km'] !== undefined ? metrics['km'] : '--';
                const durationVal = metrics['min'] !== undefined ? metrics['min'] : '--';
                const calVal =
                  metrics['E3'] !== undefined
                    ? metrics['E3']
                    : metrics['energy_expended_kcal'] ?? metrics['cal'] ?? '--';

                return (
                  <ActivityCard
                    key={card.card_tier_label || index}
                    time={formattedTime}
                    hp={hpVal}
                    goal={5.4}
                    steps={stepsVal}
                    km={distanceVal}
                    cal={calVal}
                    duration={durationVal}
                    isActive={isRunning}
                    cardTierLabel={card.card_tier_label}
                    timeRangeHint={card.time_range_hint}
                    status={card.status}
                  />
                );
              });
            }

            // Fallback to active workout log if cards_stack was empty
            const now = new Date();
            const hrs = now.getHours();
            let activeBlock: 'morning' | 'afternoon' | 'evening' | 'night' = 'night';
            if (hrs >= 6 && hrs < 12) activeBlock = 'morning';
            else if (hrs >= 12 && hrs < 17) activeBlock = 'afternoon';
            else if (hrs >= 17 && hrs < 21) activeBlock = 'evening';

            const defaultLog = workoutLogs.find(log => (log.title || '').toLowerCase() === activeBlock);
            const formattedTime = activeBlock.charAt(0).toUpperCase() + activeBlock.slice(1);

            return (
              <ActivityCard
                key={activeBlock}
                time={formattedTime}
                hp={defaultLog?.heartPoint ?? '--'}
                goal={defaultLog?.targetHeartPoint || 5.4}
                steps={defaultLog?.steps ?? '--'}
                km={defaultLog?.distance ?? '--'}
                cal={defaultLog?.energyExpended ?? '--'}
                duration={defaultLog?.duration ?? '--'}
                isActive={true}
              />
            );
          })()}

          {/* Toggleable Previous Day Details */}
          {(() => {
            const prevDayCard = (pullStepsLogs?.cards_stack || []).find((c: any) =>
              (c.card_tier_label || '').toLowerCase().includes('previous day')
            );
            const prevHint = prevDayCard?.time_range_hint;
            const prevTitle = prevDayCard?.card_tier_label || (showDetail ? 'Hide Activity Detail' : 'Previous Day Detail');

            return (
              <>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.previousButton}
                  onPress={() => setShowDetail(!showDetail)}
                >
                  <View style={styles.buttonContent}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.buttonText}>
                        {showDetail ? 'Hide Activity Detail' : prevTitle}
                      </Text>
                      {prevHint ? (
                        <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 2, fontWeight: '600' }}>
                          {prevHint}
                        </Text>
                      ) : null}
                    </View>
                    <MiniIcon name={showDetail ? 'chevron-up' : 'chevron-down'} size={18} color="#FFFFFF" />
                  </View>
                </TouchableOpacity>

                {showDetail && (
                  <FitnessActivityCard
                    summary={prevDayCard}
                  />
                )}
              </>
            );
          })()}
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
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
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
    gap: 12,
    flex: 1,
  },
  circleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'column',
  },
  timeBadgeRange: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 2,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: 8,
  },
  goalBadge: {
    borderRadius: 8,
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  goalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  chevronCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
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
  timeRangeInline: {
    color: '#94A3B8',
    fontSize: 9.5,
    fontWeight: '600',
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



