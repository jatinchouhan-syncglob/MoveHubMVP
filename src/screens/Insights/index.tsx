import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { scale, verticalScale } from 'react-native-size-matters';
import Svg, {
  Line,
  Path,
  Circle,
  Text as SvgText,
  Defs,
  LinearGradient as SvgLinearGradient,
  Stop,
  G,
  Rect,
} from 'react-native-svg';

import { theme } from '../../theme';
import { CustomHeader } from '../../components/common/CustomHeader';
import { apiService } from '../../services/api';
import { Activity } from '../../types';
import {
  smoothPath,
  areaPath,
  lerp,
} from '../../components/charts/CustomSvgCharts';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CHART_WIDTH = screenWidth - scale(32); // margin horizontal (16 * 2)
const CHART_HEIGHT = verticalScale(185);

// Colors map matching the screenshots
const C = {
  blue: '#06b6d4',      // Cyan
  purple: '#ec4899',    // Pink / Purple
  orange: '#f97316',    // Orange
  neonGreen: '#10b981', // Emerald
  textGray: '#64748b',  // Slate-500
  gridLine: '#e2e8f0',  // Slate-200
  darkBg: '#0f172a',    // Slate-900
};

// 7 Days Base Mock Data (pre-populated so screen always looks beautiful, adding active user logs)
const BASE_7_DAYS = [
  { label: 'Mon', steps: 4200, calories: 180, hr: 72 },
  { label: 'Tue', steps: 5600, calories: 290, hr: 78 },
  { label: 'Wed', steps: 3100, calories: 150, hr: 71 },
  { label: 'Thu', steps: 6800, calories: 380, hr: 79 },
  { label: 'Fri', steps: 8400, calories: 480, hr: 82 },
  { label: 'Sat', steps: 7100, calories: 390, hr: 76 },
  { label: 'Sun', steps: 0,    calories: 0,   hr: 70 }, // Today (gets overwritten by active logs)
];

// 4 Weeks Mock Data
const BASE_4_WEEKS = [
  { label: 'Wk 41', steps: 28000, calories: 1200, hr: 74 },
  { label: 'Wk 42', steps: 35000, calories: 1600, hr: 76 },
  { label: 'Wk 43', steps: 42000, calories: 2150, hr: 78 }, // Peak shown in screenshot
  { label: 'Wk 44', steps: 31000, calories: 1400, hr: 73 },
];


const generateMonthsList = () => {
  const list: string[] = [];
  const startYear = 2024;
  const endYear = 2026;
  const currentMonthIdx = 5; // June (0-indexed: 5)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let year = startYear; year <= endYear; year++) {
    const maxMonth = year === endYear ? currentMonthIdx : 11;
    for (let m = 0; m <= maxMonth; m++) {
      list.push(`${monthNames[m]} ${year}`);
    }
  }
  return list.reverse();
};

const MONTHS_LIST = generateMonthsList();

const getMonthMultiplier = (monthStr: string) => {
  const parts = monthStr.split(' ');
  const monthName = parts[0];
  const year = parseInt(parts[1] || '2026', 10);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthIdx = monthNames.indexOf(monthName);
  
  const monthIndexFromStart = (year - 2024) * 12 + monthIdx;
  const multiplier = 0.8 + (monthIndexFromStart % 10) * 0.05;
  return parseFloat(multiplier.toFixed(2));
};

const getMonthsSequence = (selectedMonthStr: string, count: number) => {
  const parts = selectedMonthStr.split(' ');
  const monthName = parts[0];
  const year = parseInt(parts[1] || '2026', 10);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let monthIdx = monthNames.indexOf(monthName);
  let currentYear = year;

  const result: { label: string; year: number }[] = [];
  for (let i = 0; i < count; i++) {
    result.push({
      label: monthNames[monthIdx],
      year: currentYear,
    });
    monthIdx--;
    if (monthIdx < 0) {
      monthIdx = 11;
      currentYear--;
    }
  }
  return result.reverse();
};

const getMonthlyDataPoint = (monthName: string, year: number) => {
  const monthKey = `${monthName} ${year}`;
  const mult = getMonthMultiplier(monthKey);
  
  return {
    label: `${monthName} '${String(year).slice(-2)}`,
    steps: Math.round(145000 * mult),
    calories: Math.round(6800 * mult),
    hr: Math.round(75 * (0.95 + (mult - 1) * 0.1)),
  };
};

// 30-Day Vitality Index climb values (from 20 to 83)
const VITALITY_INDEX_DATA = [
  20, 21, 23, 25, 30, 32, 35, 41, 46, 52,
  55, 54, 53, 58, 62, 70, 68, 67, 69, 71,
  69, 68, 72, 76, 82, 90, 88, 85, 83, 83
];

const VITALITY_INDEX_LABELS = ['Day 1', '5', '10', '15', '20', '25', '30'];

export const InsightsScreen: React.FC = () => {
  const [activeScreenTab, setActiveScreenTab] = useState<'trends' | 'transformation'>('trends');
  const [activeTimeframe, setActiveTimeframe] = useState<'7days' | '4weeks' | '3months' | '6months' | '9months' | '12months'>('4weeks');
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Interactive index for Activity Trends tooltip selection
  const [selectedTrendIdx, setSelectedTrendIdx] = useState<number>(2); // Default to index 2 (e.g. Wk 43)

  // Transformation states
  const [showGreenLine, setShowGreenLine] = useState(true);
  const [showEmeraldGradient, setShowEmeraldGradient] = useState(true);

  // Month selection states
  const [selectedMonth, setSelectedMonth] = useState<string>('Jun 2026');
  const [showMonthDropdown, setShowMonthDropdown] = useState<boolean>(false);

  const loadData = async () => {
    try {
      const logs = await apiService.getActivities();
      setActivities(logs);
    } catch (error) {
      console.error('Failed to load insights trends activities:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // Compile active trends data
  const getTrendsData = () => {
    const mult = getMonthMultiplier(selectedMonth);

    if (activeTimeframe === '7days') {
      const compiled = BASE_7_DAYS.map(p => ({
        ...p,
        steps: Math.round(p.steps * mult),
        calories: Math.round(p.calories * mult),
        hr: Math.min(200, Math.round(p.hr * (0.95 + (mult - 1) * 0.2))),
      }));
      
      // Calculate today's steps/calories from user logs
      const todayStart = new Date().setHours(0, 0, 0, 0);
      const todayEnd = new Date().setHours(23, 59, 59, 999);
      
      const todayWalkActivities = activities.filter(
        (a) => a.type === 'Walking' && new Date(a.timestamp).getTime() >= todayStart && new Date(a.timestamp).getTime() <= todayEnd
      );
      const todaySteps = todayWalkActivities.reduce((sum, a) => sum + a.value, 0);
      
      const todayAllActivities = activities.filter(
        (a) => new Date(a.timestamp).getTime() >= todayStart && new Date(a.timestamp).getTime() <= todayEnd
      );
      const todayCalories = todayAllActivities.reduce((sum, a) => sum + a.caloriesBurned, 0);
      
      // Heart Rate estimation
      let todayHR = 70;
      if (todayAllActivities.length > 0) {
        todayHR = 80; // active heart rate average
      }

      compiled[6] = {
        label: 'Sun', // today
        steps: todaySteps ? Math.round(todaySteps * mult) : Math.round(4800 * mult),
        calories: todayCalories ? Math.round(todayCalories * mult) : Math.round(210 * mult),
        hr: todayHR,
      };

      return compiled;
    } else if (activeTimeframe === '4weeks') {
      const labels = ['Wk 01', 'Wk 02', 'Wk 03', 'Wk 04'];
      const compiled = BASE_4_WEEKS.map((p, idx) => ({
        label: labels[idx],
        steps: Math.round(p.steps * mult),
        calories: Math.round(p.calories * mult),
        hr: Math.min(200, Math.round(p.hr * (0.95 + (mult - 1) * 0.2))),
      }));

      // Add active logs to the last week if selectedMonth matches current month and activities are present
      const currentYear = new Date().getFullYear();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonthName = monthNames[new Date().getMonth()];
      const isCurrentMonth = selectedMonth === `${currentMonthName} ${currentYear}`;

      if (isCurrentMonth) {
        const week4Steps = activities.reduce((sum, a) => sum + (a.type === 'Walking' ? a.value : 0), 0);
        const week4Calories = activities.reduce((sum, a) => sum + a.caloriesBurned, 0);
        if (week4Steps > 0 || week4Calories > 0) {
          compiled[3] = {
            label: labels[3],
            steps: Math.round(Math.max(31000, week4Steps) * mult),
            calories: Math.round(Math.max(1400, week4Calories) * mult),
            hr: 75,
          };
        }
      }
      return compiled;
    } else {
      let count = 3;
      if (activeTimeframe === '6months') count = 6;
      else if (activeTimeframe === '9months') count = 9;
      else if (activeTimeframe === '12months') count = 12;

      return getMonthsSequence(selectedMonth, count).map(item => getMonthlyDataPoint(item.label, item.year));
    }
  };

  const trendPoints = getTrendsData();

  // Clamp selected index to bounds of current dataset
  useEffect(() => {
    if (selectedTrendIdx >= trendPoints.length) {
      setSelectedTrendIdx(trendPoints.length - 1);
    }
  }, [activeTimeframe, trendPoints.length, selectedTrendIdx]);

  // Dynamic values based on selected index in chart
  const activePoint = trendPoints[selectedTrendIdx] || trendPoints[0];

  // Helper values for distance & active minutes summary
  const getSummaryMetrics = () => {
    const mult = getMonthMultiplier(selectedMonth);
    let totalDistance = 112.5;
    let distanceDiff = '+12%';
    let activeMinutes = 980;
    let activeMinutesDiff = '+8%';

    if (activeTimeframe === '7days') {
      const stepsSum = trendPoints.reduce((sum, p) => sum + p.steps, 0);
      totalDistance = parseFloat((stepsSum * 0.0008).toFixed(1));
      distanceDiff = '+4%';
      activeMinutes = activities.reduce((sum, a) => sum + a.durationMinutes, 0) || 180;
      activeMinutesDiff = '+3%';
    } else if (activeTimeframe === '4weeks') {
      totalDistance = parseFloat((112.5 * mult).toFixed(1));
      activeMinutes = Math.round(980 * mult);
      distanceDiff = mult >= 1.0 ? `+${Math.round(12 * mult)}%` : `+${Math.round(12 * mult)}%`;
      activeMinutesDiff = mult >= 1.0 ? `+${Math.round(8 * mult)}%` : `+${Math.round(8 * mult)}%`;
    } else if (activeTimeframe === '3months' || activeTimeframe === '6months' || activeTimeframe === '9months' || activeTimeframe === '12months') {
      let baseDistance = 384.2;
      let baseMinutes = 3450;
      let factor = 1.0;
      
      if (activeTimeframe === '6months') factor = 2.0;
      else if (activeTimeframe === '9months') factor = 3.0;
      else if (activeTimeframe === '12months') factor = 4.0;

      totalDistance = parseFloat((baseDistance * factor * mult).toFixed(1));
      activeMinutes = Math.round(baseMinutes * factor * mult);
      distanceDiff = mult >= 1.0 ? `+${Math.round(18 * mult)}%` : `+${Math.round(18 * mult)}%`;
      activeMinutesDiff = mult >= 1.0 ? `+${Math.round(15 * mult)}%` : `+${Math.round(15 * mult)}%`;
    }

    return { totalDistance, distanceDiff, activeMinutes, activeMinutesDiff };
  };

  const summary = getSummaryMetrics();

  // Draw Activity SVG Chart
  const renderActivityTrendsChart = () => {
    const pL = scale(46);
    const pR = scale(34);
    const pT = verticalScale(34); // extra space at top for tooltip
    const pB = verticalScale(20);
    const cW = CHART_WIDTH - pL - pR;
    const cH = CHART_HEIGHT - pT - pB;
    const n = trendPoints.length;

    // Steps values mapping (Left axis scale max)
    const isMonthlyView = activeTimeframe === '3months' || activeTimeframe === '6months' || activeTimeframe === '9months' || activeTimeframe === '12months';
    const maxSteps = isMonthlyView ? 200000 : activeTimeframe === '4weeks' ? 50000 : 15000;
    const toYSteps = (v: number) => pT + cH - lerp(v, 0, maxSteps, 0, cH);

    // Calories mapping (Right axis scale max)
    const maxCal = isMonthlyView ? 10000 : activeTimeframe === '4weeks' ? 3000 : 600;
    const toYCal = (v: number) => pT + cH - lerp(v, 0, maxCal, 0, cH);

    // Heart Rate mapping (scale: 0 to 200)
    const toYHR = (v: number) => pT + cH - lerp(v, 0, 200, 0, cH);

    const xs = trendPoints.map((_, i) =>
      n <= 1 ? pL + cW / 2 : pL + (i / (n - 1)) * cW
    );

    const stepPts = trendPoints.map((p, i) => ({ x: xs[i], y: toYSteps(p.steps) }));
    const calPts = trendPoints.map((p, i) => ({ x: xs[i], y: toYCal(p.calories) }));
    const hrPts = trendPoints.map((p, i) => ({ x: xs[i], y: toYHR(p.hr) }));

    const stepPath = smoothPath(stepPts);
    const calPath = smoothPath(calPts);
    const hrPath = smoothPath(hrPts);

    const baseY = pT + cH;

    // Tooltip formatting
    const getTooltipDate = () => {
      if (activeTimeframe === '7days') {
        const parts = selectedMonth.split(' ');
        const monthName = parts[0];
        const year = parts[1];
        return `${monthName} 14, ${year}`;
      }
      return activePoint.label;
    };

    return (
      <View style={styles.chartOuterContainer}>
        {/* Legends Row */}
        <View style={styles.legendsRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: C.blue }]} />
            <Text style={styles.legendText}>Steps</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: C.purple }]} />
            <Text style={styles.legendText}>Calories</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: C.orange }]} />
            <Text style={styles.legendText}>Heart Points (avg)</Text>
          </View>
        </View>

        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <SvgLinearGradient id="stepsFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={C.blue} stopOpacity="0.4" />
              <Stop offset="100%" stopColor={C.blue} stopOpacity="0.01" />
            </SvgLinearGradient>
            <SvgLinearGradient id="calFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={C.purple} stopOpacity="0.3" />
              <Stop offset="100%" stopColor={C.purple} stopOpacity="0.01" />
            </SvgLinearGradient>
          </Defs>

          {/* Grid lines (4 horizontal slots) */}
          {[0, 0.33, 0.66, 1].map((f, i) => {
            const y = pT + cH * f;
            const stepsVal = Math.round(maxSteps - maxSteps * f);
            const calVal = Math.round(maxCal - maxCal * f);
            return (
              <G key={i}>
                <Line
                  x1={pL}
                  y1={y}
                  x2={CHART_WIDTH - pR}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth={0.8}
                  opacity={0.12}
                />
                {/* Left Y Axis values (Steps) */}
                <SvgText
                  x={pL - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={8}
                  fill={C.textGray}
                  fontWeight="600"
                >
                  {stepsVal.toLocaleString()}
                </SvgText>

                {/* Right Y Axis values (Calories) */}
                <SvgText
                  x={CHART_WIDTH - pR + 4}
                  y={y + 3}
                  textAnchor="start"
                  fontSize={8}
                  fill={C.textGray}
                  fontWeight="600"
                >
                  {calVal.toLocaleString()}
                </SvgText>
              </G>
            );
          })}

          {/* Dotted indicator line for selected point */}
          <Line
            x1={xs[selectedTrendIdx]}
            y1={pT}
            x2={xs[selectedTrendIdx]}
            y2={baseY}
            stroke="#64748b"
            strokeWidth={1.2}
            strokeDasharray="4,3"
            opacity={0.5}
          />

          {/* 1. Steps Area Gradient & Line */}
          <Path d={areaPath(stepPts, baseY)} fill="url(#stepsFill)" />
          <Path d={stepPath} stroke={C.blue} strokeWidth={2.5} fill="none" />

          {/* 2. Calories Area Gradient & Line */}
          <Path d={areaPath(calPts, baseY)} fill="url(#calFill)" />
          <Path d={calPath} stroke={C.purple} strokeWidth={2.5} fill="none" />

          {/* 3. Heart Rate Line (No Fill) */}
          <Path d={hrPath} stroke={C.orange} strokeWidth={2} fill="none" />

          {/* Highlight circles on selected points */}
          <Circle
            cx={xs[selectedTrendIdx]}
            cy={toYSteps(activePoint.steps)}
            r={5.5}
            fill="#ffffff"
            stroke={C.blue}
            strokeWidth={2.5}
          />
          <Circle
            cx={xs[selectedTrendIdx]}
            cy={toYCal(activePoint.calories)}
            r={5.5}
            fill="#ffffff"
            stroke={C.purple}
            strokeWidth={2.5}
          />
          <Circle
            cx={xs[selectedTrendIdx]}
            cy={toYHR(activePoint.hr)}
            r={5.5}
            fill="#ffffff"
            stroke={C.orange}
            strokeWidth={2.5}
          />

          {/* X Labels */}
          {trendPoints.map((p, i) => {
            const showLabel = trendPoints.length <= 6 || i % 2 === 0 || i === selectedTrendIdx;
            if (!showLabel) return null;

            return (
              <SvgText
                key={i}
                x={xs[i]}
                y={CHART_HEIGHT - 4}
                textAnchor="middle"
                fontSize={trendPoints.length > 6 ? 7.5 : 8.5}
                fill={i === selectedTrendIdx ? C.blue : C.textGray}
                fontWeight={i === selectedTrendIdx ? '800' : '500'}
              >
                {p.label}
              </SvgText>
            );
          })}

          {/* Top Floating Tooltip Card */}
          {(() => {
            const tx = xs[selectedTrendIdx];
            const tooltipW = scale(230);
            let rectX = tx - tooltipW / 2;
            // clamp left & right boundaries
            if (rectX < pL) rectX = pL;
            if (rectX + tooltipW > CHART_WIDTH - pR) rectX = CHART_WIDTH - pR - tooltipW;

            return (
              <G>
                <Rect
                  x={rectX}
                  y={4}
                  width={tooltipW}
                  height={verticalScale(24)}
                  rx={6}
                  fill="#1e293b" // Slate-800
                  stroke="#334155"
                  strokeWidth={1}
                />
                <SvgText
                  x={rectX + tooltipW / 2}
                  y={19}
                  textAnchor="middle"
                  fontSize={8.2}
                  fill="#ffffff"
                  fontWeight="700"
                >
                  {`${getTooltipDate()}: ${activePoint.steps.toLocaleString()} Steps, ${activePoint.calories.toLocaleString()} Cal, ${activePoint.hr} Heart Points`}
                </SvgText>
              </G>
            );
          })()}

          {/* Interactive touch grid columns */}
          {trendPoints.map((_, i) => {
            const slotW = cW / n;
            const clickX = xs[i] - slotW / 2;
            return (
              <Rect
                key={`touch-${i}`}
                x={clickX}
                y={pT}
                width={slotW}
                height={cH}
                fill="transparent"
                onPress={() => setSelectedTrendIdx(i)}
              />
            );
          })}
        </Svg>
      </View>
    );
  };

  // Draw 30-Day Predictive Health View (Neon-Green)
  const renderPredictiveHealthChart = () => {
    const pL = scale(32);
    const pR = scale(20);
    const pT = verticalScale(16);
    const pB = verticalScale(20);
    const cW = CHART_WIDTH - pL - pR;
    const cH = CHART_HEIGHT - pT - pB;
    const n = VITALITY_INDEX_DATA.length;
    const baseY = pT + cH;

    const xsPoints = VITALITY_INDEX_DATA.map((_, i) =>
      pL + (i / (n - 1)) * cW
    );
    const toY = (v: number) => pT + cH - lerp(v, 0, 100, 0, cH);

    const points = VITALITY_INDEX_DATA.map((v, i) => ({
      x: xsPoints[i],
      y: toY(v),
    }));

    const linePath = smoothPath(points);

    // Map labels to align at Days 1, 5, 10, 15, 20, 25, 30
    const labelIndices = [0, 4, 9, 14, 19, 24, 29];
    const xsLabels = VITALITY_INDEX_LABELS.map((_, idx) => {
      const dataIdx = labelIndices[idx];
      return xsPoints[dataIdx];
    });

    return (
      <View style={styles.chartOuterContainer}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <SvgLinearGradient id="emeraldFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <Stop offset="100%" stopColor="#10b981" stopOpacity="0.01" />
            </SvgLinearGradient>
          </Defs>

          {/* Grid lines (Horizontal: 0, 20, 40, 60, 80, 100) */}
          {[0, 20, 40, 60, 80, 100].map((v) => {
            const y = toY(v);
            return (
              <G key={v}>
                <Line
                  x1={pL}
                  y1={y}
                  x2={CHART_WIDTH - pR}
                  y2={y}
                  stroke="#cbd5e1"
                  strokeWidth={0.8}
                  opacity={0.12}
                />
                <SvgText
                  x={pL - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize={8}
                  fill={C.textGray}
                  fontWeight="600"
                >
                  {String(v)}
                </SvgText>
              </G>
            );
          })}

          {/* Area Fill */}
          {showEmeraldGradient && (
            <Path d={areaPath(points, baseY)} fill="url(#emeraldFill)" />
          )}

          {/* Green Line */}
          <Path
            d={linePath}
            stroke={showGreenLine ? '#10b981' : '#64748b'}
            strokeWidth={3}
            fill="none"
          />

          {/* Key data point highlight dots */}
          {labelIndices.map((dataIdx, i) => {
            const p = points[dataIdx];
            return (
              <Circle
                key={i}
                cx={p.x}
                cy={p.y}
                r={4}
                fill={showGreenLine ? '#10b981' : '#64748b'}
              />
            );
          })}

          {/* X Axis Labels */}
          {VITALITY_INDEX_LABELS.map((l, i) => (
            <SvgText
              key={i}
              x={xsLabels[i]}
              y={CHART_HEIGHT - 4}
              textAnchor={i === 0 ? 'start' : i === VITALITY_INDEX_LABELS.length - 1 ? 'end' : 'middle'}
              fontSize={8}
              fill={C.textGray}
              fontWeight="600"
            >
              {l}
            </SvgText>
          ))}
        </Svg>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Health Insights & Trends" showDrawerButton />

      {/* Background Soft Glow Spots */}
      <View style={styles.glowSpot1} />
      <View style={styles.glowSpot2} />

      {/* Screen Segment Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveScreenTab('trends')}
          activeOpacity={0.8}
          style={[styles.tabBtn, activeScreenTab === 'trends' && styles.tabActiveBtn]}
        >
          <Text style={[styles.tabBtnText, activeScreenTab === 'trends' && styles.tabActiveText]}>
            Activity Trends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveScreenTab('transformation')}
          activeOpacity={0.8}
          style={[styles.tabBtn, activeScreenTab === 'transformation' && styles.tabActiveBtn]}
        >
          <Text style={[styles.tabBtnText, activeScreenTab === 'transformation' && styles.tabActiveText]}>
            Health Transformation
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      >
        {activeScreenTab === 'trends' ? (
          /* View 1: Activity Trends Chart */
          <View>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionMainTitle}>Activity Trends</Text>
              {/* Styled date filter dropdown badge */}
              <TouchableOpacity
                style={styles.dropdownBadge}
                activeOpacity={0.7}
                onPress={() => setShowMonthDropdown(true)}
              >
                <Svg
                  width={13}
                  height={13}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={theme.colors.textSecondary}
                  strokeWidth={2.5}
                  style={{ marginRight: 5 }}
                >
                  <Rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
                  <Line x1={16} y1={2} x2={16} y2={6} />
                  <Line x1={8} y1={2} x2={8} y2={6} />
                  <Line x1={3} y1={10} x2={21} y2={10} />
                </Svg>
                <Text style={styles.dropdownBadgeText}>{selectedMonth} ∨</Text>
              </TouchableOpacity>
            </View>

            {/* Timeframe switchers */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.timeframeSwitcherScroll}
              style={styles.timeframeSwitcherContainer}
            >
              <TouchableOpacity
                onPress={() => setActiveTimeframe('7days')}
                style={[styles.timeframeBtn, activeTimeframe === '7days' && styles.timeframeBtnActive]}
              >
                <Text style={[styles.timeframeText, activeTimeframe === '7days' && styles.timeframeTextActive]}>
                  7 Days
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTimeframe('4weeks')}
                style={[styles.timeframeBtn, activeTimeframe === '4weeks' && styles.timeframeBtnActive]}
              >
                <Text style={[styles.timeframeText, activeTimeframe === '4weeks' && styles.timeframeTextActive]}>
                  4 Weeks
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTimeframe('3months')}
                style={[styles.timeframeBtn, activeTimeframe === '3months' && styles.timeframeBtnActive]}
              >
                <Text style={[styles.timeframeText, activeTimeframe === '3months' && styles.timeframeTextActive]}>
                  3 Months
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTimeframe('6months')}
                style={[styles.timeframeBtn, activeTimeframe === '6months' && styles.timeframeBtnActive]}
              >
                <Text style={[styles.timeframeText, activeTimeframe === '6months' && styles.timeframeTextActive]}>
                  6 Months
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTimeframe('9months')}
                style={[styles.timeframeBtn, activeTimeframe === '9months' && styles.timeframeBtnActive]}
              >
                <Text style={[styles.timeframeText, activeTimeframe === '9months' && styles.timeframeTextActive]}>
                  9 Months
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setActiveTimeframe('12months')}
                style={[styles.timeframeBtn, activeTimeframe === '12months' && styles.timeframeBtnActive]}
              >
                <Text style={[styles.timeframeText, activeTimeframe === '12months' && styles.timeframeTextActive]}>
                  12 Months
                </Text>
              </TouchableOpacity>
            </ScrollView>

            {/* Render interactive multi-line SVG chart */}
            {renderActivityTrendsChart()}

            {/* Bottom summary metric cards */}
            <View style={styles.metricsGrid}>
              {/* Card 1: Total Distance */}
              <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.summaryMetricCard}
              >
                <View style={styles.summaryIconWrapper}>
                  <Text style={styles.summaryIcon}>📍</Text>
                </View>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryLabel}>Total Distance</Text>
                  <Text style={styles.summaryValue}>{summary.totalDistance} km</Text>
                  <Text style={styles.summarySubtext}>
                    <Text style={styles.positiveGrowthText}>{summary.distanceDiff}</Text> vs last mth
                  </Text>
                </View>
              </LinearGradient>

              {/* Card 2: Active Minutes */}
              <LinearGradient
                colors={['#ffffff', '#f8fafc']}
                style={styles.summaryMetricCard}
              >
                <View style={styles.summaryIconWrapper}>
                  <Text style={styles.summaryIcon}>⚡</Text>
                </View>
                <View style={styles.summaryContent}>
                  <Text style={styles.summaryLabel}>Active Minutes</Text>
                  <Text style={styles.summaryValue}>{summary.activeMinutes} min</Text>
                  <Text style={styles.summarySubtext}>
                    <Text style={styles.positiveGrowthText}>{summary.activeMinutesDiff}</Text> vs last mth
                  </Text>
                </View>
              </LinearGradient>
            </View>
          </View>
        ) : (
          /* View 2: Your 30-Day Health Transformation */
          <View>
            <Text style={styles.transformationHeaderTitle}>Your 30-Day Health Transformation</Text>

            <View style={styles.transformCard}>
              <View style={styles.transformCardHeader}>
                <Text style={styles.transformCardTitle}>30-Day Predictive Health View</Text>
                <Text style={styles.transformCardSub}>Trailing 30-day proactive lifestyle adaptation index.</Text>
              </View>

              <Text style={styles.chartTitleLabel}>Vitality Score (Last 30 days)</Text>

              {/* Render green SingleLine SVG chart */}
              {renderPredictiveHealthChart()}

              {/* Toggles check box row */}
              <View style={styles.togglesContainerRow}>
                {/* Checkbox 1: Green line */}
                <TouchableOpacity
                  onPress={() => setShowGreenLine(!showGreenLine)}
                  activeOpacity={0.8}
                  style={styles.checkboxWrapper}
                >
                  <View style={[styles.checkboxOutline, showGreenLine && styles.checkboxActive]}>
                    {showGreenLine && <Text style={styles.checkIcon}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Neon-Green SVG Trend Line</Text>
                </TouchableOpacity>

                {/* Checkbox 2: Soft gradient */}
                <TouchableOpacity
                  onPress={() => setShowEmeraldGradient(!showEmeraldGradient)}
                  activeOpacity={0.8}
                  style={styles.checkboxWrapper}
                >
                  <View style={[styles.checkboxOutline, showEmeraldGradient && styles.checkboxActive]}>
                    {showEmeraldGradient && <Text style={styles.checkIcon}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Soft Emerald Gradient</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Proactive Summary metrics */}
            <Text style={styles.groupLabel}>PROACTIVE MONTHLY SUMMARY METRICS</Text>
            <View style={styles.proactiveGrid}>
              <View style={styles.proactiveCard}>
                <View style={[styles.proactiveBadgeCircle, { backgroundColor: '#d1fae5' }]}>
                  <Text style={styles.proactiveBadgeText}>👍</Text>
                </View>
                <View style={styles.proactiveTextContainer}>
                  <Text style={styles.proactiveLabel}>Total Gain Points</Text>
                  <Text style={styles.proactiveValue}>15,240 pts</Text>
                </View>
              </View>

              <View style={styles.proactiveCard}>
                <View style={[styles.proactiveBadgeCircle, { backgroundColor: '#d1fae5' }]}>
                  <Text style={styles.proactiveBadgeText}>🌙</Text>
                </View>
                <View style={styles.proactiveTextContainer}>
                  <Text style={styles.proactiveLabel}>Avg Sleep Depth</Text>
                  <Text style={styles.proactiveValue}>7.6 hrs/night</Text>
                </View>
              </View>
            </View>

            {/* Layman Interpretation */}
            <View style={styles.transformCard}>
              <Text style={styles.interpretationTitle}>PRECISE LAYMAN INTERPRETATION</Text>
              <Text style={styles.interpretationSub}>What This Trend Means For You</Text>
              <Text style={styles.interpretationBody}>
                Your Vitality Score represents your overall cardio-respiratory efficiency, muscle endurance, and metabolic stability combined.
              </Text>
              
              <View style={styles.bulletRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bulletBold}>Your Heart is Getting Stronger (The Upward Curve):</Text> Notice how your trend line steadily climbs. This isn't random; it means as your heart pumps blood more efficiently per beat, your lungs utilize oxygen better, and your overall physical stamina has increased by about 10%.
                </Text>
              </View>

              <View style={styles.bulletRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.bulletBold}>Your Recovery Reserves are Locked In (The Safe Baselines):</Text> Even on harder weeks, your trend never plummets. Maintaining a 7.6-hour average sleep depth protects your nervous system and ensures that on shorter sleep days, our Auto-Pacing Mode steps in so you build up reserves rather than straining muscles.
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Month Selector Modal Overlay */}
      <Modal
        visible={showMonthDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMonthDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowMonthDropdown(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setShowMonthDropdown(false)}>
                <Text style={styles.modalCloseText}>Done</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              {MONTHS_LIST.map((month) => {
                const isSelected = selectedMonth === month;
                return (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.modalOption,
                      isSelected && styles.modalOptionActive,
                    ]}
                    onPress={() => {
                      setSelectedMonth(month);
                      setShowMonthDropdown(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        isSelected && styles.modalOptionTextActive,
                      ]}
                    >
                      {month}
                    </Text>
                    {isSelected && <Text style={styles.modalOptionCheck}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: 'relative',
  },
  glowSpot1: {
    position: 'absolute',
    top: '10%',
    right: '-15%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.primaryLight + '20',
    zIndex: -1,
  },
  glowSpot2: {
    position: 'absolute',
    bottom: '20%',
    left: '-15%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.secondary + '08',
    zIndex: -1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    borderRadius: 12,
    marginHorizontal: theme.spacing.containerPadding,
    marginTop: theme.spacing.md,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.12)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActiveBtn: {
    backgroundColor: theme.colors.primary,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  tabActiveText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  scrollContent: {
    padding: theme.spacing.containerPadding,
    paddingBottom: theme.spacing.xxl,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionMainTitle: {
    fontSize: 22,
    fontWeight: '800' as any,
    color: theme.colors.text,
  },
  dropdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dropdownBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  timeframeSwitcherContainer: {
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    marginBottom: theme.spacing.lg,
    padding: 3,
    alignSelf: 'stretch',
  },
  timeframeSwitcherScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeframeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
  timeframeBtnActive: {
    backgroundColor: '#14b8a6', // Teal active segment highlight
    shadowColor: '#14b8a6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  timeframeText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#64748b',
  },
  timeframeTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  chartOuterContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  legendsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginBottom: theme.spacing.sm,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  summaryMetricCard: {
    width: '48%',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 18,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  summaryIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  summaryIcon: {
    fontSize: 18,
  },
  summaryContent: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10,
    color: theme.colors.textLight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.text,
    marginVertical: 1,
  },
  summarySubtext: {
    fontSize: 9.5,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  positiveGrowthText: {
    color: '#10b981',
    fontWeight: '800',
  },
  transformationHeaderTitle: {
    fontSize: 22,
    fontWeight: '800' as any,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  transformCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
  },
  transformCardHeader: {
    marginBottom: theme.spacing.md,
  },
  transformCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  transformCardSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  chartTitleLabel: {
    fontSize: 13.5,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  togglesContainerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
  },
  checkboxOutline: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: theme.colors.borderDark,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxActive: {
    borderColor: '#10b981',
    backgroundColor: '#10b981',
  },
  checkIcon: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: '800' as any,
    color: theme.colors.textLight,
    letterSpacing: 0.8,
    marginBottom: theme.spacing.sm,
  },
  proactiveGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  proactiveCard: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 16,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  proactiveBadgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  proactiveBadgeText: {
    fontSize: 16,
  },
  proactiveTextContainer: {
    flex: 1,
  },
  proactiveLabel: {
    fontSize: 9.5,
    color: theme.colors.textLight,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  proactiveValue: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.text,
  },
  interpretationTitle: {
    fontSize: 11,
    fontWeight: '800' as any,
    color: theme.colors.textLight,
    letterSpacing: 0.8,
  },
  interpretationSub: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 2,
    marginBottom: theme.spacing.md,
  },
  interpretationBody: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
    marginBottom: theme.spacing.md,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#10b981',
    marginRight: 8,
    marginTop: -1,
  },
  bulletText: {
    flex: 1,
    fontSize: 12.5,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  },
  bulletBold: {
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    width: screenWidth - scale(64),
    height: screenHeight * 0.8,
    borderRadius: 20,
    padding: theme.spacing.lg,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalScroll: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
  },
  modalCloseText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginVertical: 2,
  },
  modalOptionActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  modalOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  modalOptionTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  modalOptionCheck: {
    fontSize: 14,
    fontWeight: '800',
    color: theme.colors.primary,
  },
});

export default InsightsScreen;
