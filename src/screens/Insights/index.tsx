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
  ActivityIndicator,
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
import { Activity, UserProfile } from '../../types';
import { storageHelper } from '../../storage/storageHelper';
import { STORAGE_KEYS } from '../../storage/storageKeys';
import {
  smoothPath,
  areaPath,
  lerp,
} from '../../components/charts/CustomSvgCharts';
import { FitnessTab } from './FitnessTab';
import { BioSyncTab } from './BioSyncTab';

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
  const currentYear = new Date().getFullYear();
  const endYear = Math.max(2026, currentYear);
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  for (let year = startYear; year <= endYear; year++) {
    for (let m = 0; m <= 11; m++) {
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

// Static data for Fitness Tab
const FITNESS_DAILY_STEPS = {
  values: [6200, 8100, 5400, 7800, 9200, 11000, 4800],
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};
const FITNESS_DAILY_HEART_POINTS = {
  values: [22, 35, 18, 30, 42, 55, 15],
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};
const FITNESS_SDEX_ACTIVITY = {
  values: [45, 58, 42, 60, 72, 85, 38],
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};
const FITNESS_ENERGY_EXPENDED = {
  values: [240, 310, 210, 290, 350, 420, 180],
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};
const FITNESS_HEART_POINTS_CHARTS = { target: '21.4', actual: '22', performance: '103' };
const FITNESS_SDEX_CHARTS = { target: '50', actual: '57', performance: '114' };
const FITNESS_STEPS_CHARTS = { target: '45,000', actual: '52,900', performance: '117' };
const FITNESS_ENERGY_EXPANDED_CHARTS = { target: '1,800', actual: '2,000', performance: '111' };

// Static data for Bio-sync Tab
const BIOSYNC_ENERGY_EFFICIENCY = {
  values: [4.1, 3.7, 4.3, 3.8, 3.9, 3.5, 4.2],
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};
const BIOSYNC_INTEGRATED_STAMINA = {
  values: [88, 85, 90, 86, 87, 92, 84],
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
};
const BIOSYNC_WEEKLY_PERFORMANCE = {
  labels: ['Wk 41', 'Wk 42', 'Wk 43', 'Wk 44'],
  cys: [75, 78, 80, 83],
  eeKm: [4.0, 3.9, 3.8, 3.7],
  is: [84, 85, 86, 88],
};
const BIOSYNC_WEEKLY_PERFORMANCE_SUMMARY = { eeKmAvg: '3.85', isAvg: '85.7', cysTotal: '316' };
const BIOSYNC_PILLAR_HEALTH_DATA = [
  { label: 'Sleep Consistency', value: 94, color: '#22C55E' },
  { label: 'Physical Activity', value: 89, color: '#3B82F6' },
  { label: 'Circadian Alignment', value: 87, color: '#F59E0B' },
];
const BIOSYNC_CARDIO_YIELD_DATA = [
  { day: 'Mon', trend: '+3%', stacks: [18, 22, 24, 12] },
  { day: 'Tue', trend: '+5%', stacks: [20, 24, 26, 14] },
  { day: 'Wed', trend: '-2%', stacks: [15, 18, 20, 10] },
  { day: 'Thu', trend: '+4%', stacks: [19, 22, 25, 12] },
  { day: 'Fri', trend: '+8%', stacks: [26, 28, 32, 16] },
  { day: 'Sat', trend: '+6%', stacks: [24, 26, 30, 15] },
  { day: 'Sun', trend: '+2%', stacks: [17, 20, 22, 11] },
];
const BIOSYNC_EE_PER_KM_CHARTS = { target: '4.0', actual: '3.85', performance: '104' };
const BIOSYNC_INTEGRATED_STAMINA_CHARTS = { target: '82', actual: '85.7', performance: '104' };
const BIOSYNC_WEEKLY_TREND_CHARTS = { target: '78', actual: '83', performance: '106' };
const BIOSYNC_CARDIO_YIELD_PER_STEP_CHARTS = { target: '70', actual: '73', performance: '104' };

const formatDateLabel = (dateStr?: string, fallbackDay?: string): string => {
  if (dateStr) {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}`;
      }
    } catch {
      // fallback
    }
  }
  if (fallbackDay) {
    return fallbackDay.slice(0, 3);
  }
  return '';
};

const parseFitnessTrendArray = (arr?: any[]) => {
  if (!arr || arr.length === 0) return undefined;
  const values = arr.map(item =>
    item.active_minutes !== undefined
      ? item.active_minutes
      : item.total !== undefined
      ? item.total
      : (item.values ?? 0)
  );
  const labels = arr.map(item => formatDateLabel(item.date, item.day));
  return { values, labels };
};

const parseWeeklyPerformance = (weeklyTrend?: any[]) => {
  if (!weeklyTrend || weeklyTrend.length === 0) return undefined;
  const labels = weeklyTrend.map(item => formatDateLabel(item.date, item.day));
  const cys = weeklyTrend.map(item => item.cys ?? 0);
  const eeKm = weeklyTrend.map(item => item.eeKm ?? 0);
  const is = weeklyTrend.map(item => item.isAvg ?? 0);
  return { labels, cys, eeKm, is };
};

const parseCardioYieldData = (arr?: any[]) => {
  if (!arr || arr.length === 0) return [];
  return arr.map(item => {
    const dayLabel = formatDateLabel(item.date, item.day) || `Day ${item.day || ''}`;
    const totalVal = item.total !== undefined ? item.total : (item.values ?? 0);
    const stacks = item.stacks || [
      item.morning !== undefined ? item.morning : totalVal,
      item.afternoon ?? 0,
      item.evening ?? 0,
      item.night ?? 0
    ];
    return {
      day: dayLabel,
      trend: item.trend || '',
      stacks
    };
  });
};

const formatChartSummary = (summaryObj?: any) => {
  if (!summaryObj) return undefined;
  const target = summaryObj.target !== undefined && summaryObj.target !== null ? summaryObj.target : undefined;
  const actual = summaryObj.value !== undefined ? summaryObj.value : (summaryObj.actual !== undefined && summaryObj.actual !== null ? summaryObj.actual : undefined);
  let perf = summaryObj.performance_percent !== undefined ? summaryObj.performance_percent : (summaryObj.performance !== undefined && summaryObj.performance !== null ? summaryObj.performance : summaryObj.percent);
  if (typeof perf === 'string' && perf.endsWith('%')) {
    perf = perf.slice(0, -1);
  }
  if (target === undefined && actual === undefined && perf === undefined) {
    return undefined;
  }
  return {
    target,
    actual,
    performance: perf !== undefined ? (typeof perf === 'number' ? Math.round(perf * 100) / 100 : perf) : undefined,
  };
};

const getDynamicMax = (values: number[]) => {
  const max = Math.max(...values, 0);

  if (max === 0) {
    return 5;
  }

  if (max <= 10) {
    return max + 5;
  }

  if (max <= 100) {
    return Math.ceil((max + 20) / 10) * 10;
  }

  if (max <= 1000) {
    return Math.ceil((max + 100) / 50) * 50;
  }

  if (max <= 10000) {
    return Math.ceil((max + 500) / 100) * 100;
  }

  return Math.ceil((max + 1000) / 500) * 500;
};

const getBioSyncStatus = (score?: number) => {
  if (score === undefined || score === null) return 'green';
  if (score >= 90) return 'green';
  if (score >= 70) return 'amber';
  return 'red';
};

export const InsightsScreen: React.FC = () => {
  const [activeScreenTab, setActiveScreenTab] = useState<'fitness' | 'bio-sync' | 'trends' | 'transformation'>('fitness');
  const [activeTimeframe, setActiveTimeframe] = useState<'7days' | '4weeks' | '3months' | '6months' | '9months' | '12months'>('7days');
  const [refreshing, setRefreshing] = useState(false);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [fitnessTrend, setFitnessTrend] = useState<any>(null);
  const [bioSyncTrend, setBioSyncTrend] = useState<any>(null);
  const [loadingTrends, setLoadingTrends] = useState<boolean>(true);
  const [targetUhid, setTargetUhid] = useState<string>('JATCHO5525');
  const [targetDate, setTargetDate] = useState<string>('');

  // Interactive index for Activity Trends tooltip selection
  const [selectedTrendIdx, setSelectedTrendIdx] = useState<number>(2); // Default to Wednesday

  // Transformation states
  const [showGreenLine, setShowGreenLine] = useState(true);
  const [showEmeraldGradient, setShowEmeraldGradient] = useState(true);

  // Month selection states
  const [selectedMonth, setSelectedMonth] = useState<string>('Sep 2026');
  const [showMonthDropdown, setShowMonthDropdown] = useState<boolean>(false);

  // Weekly Report Dynamic API Data states
  const [weeklyReportLoading, setWeeklyReportLoading] = useState(false);
  const [weeklyReportData, setWeeklyReportData] = useState<any>(null);

  // Scroll & Ref states for horizontal see-more chart
  const chartScrollViewRef = React.useRef<ScrollView>(null);
  const [chartScrollX, setChartScrollX] = useState(0);

  const loadWeeklyReportData = async () => {
    setWeeklyReportLoading(true);
    try {
      const cachedProfile = await storageHelper.getItem<any>(STORAGE_KEYS.USER_PROFILE);
      const activeUhid = cachedProfile?.uhid || 'JATCHO5525';

      const res = await apiService.getWeeklyReport(activeUhid);
      console.log('[InsightsScreen] getWeeklyReport Response:', JSON.stringify(res, null, 2));

      if (res) {
        setWeeklyReportData(res);
      }
    } catch (error) {
      console.error('Failed to load weekly report data:', error);
    } finally {
      setWeeklyReportLoading(false);
    }
  };

  useEffect(() => {
    if (activeScreenTab === 'transformation') {
      loadWeeklyReportData();
    }
  }, [activeScreenTab]);

  const loadTrendsLogs = async () => {
    try {
      const cachedProfile = await storageHelper.getItem<any>(STORAGE_KEYS.USER_PROFILE);
      const activeUhid = cachedProfile?.uhid || 'JATCHO5525';
      setTargetUhid(activeUhid);

      try {
        const dailyChartsRes = await apiService.getDailyCharts(activeUhid);
        console.log('[Insights] daily-charts API SUCCESS:', JSON.stringify(dailyChartsRes, null, 2));

        if (dailyChartsRes) {
          if (dailyChartsRes.uhid) {
            setTargetUhid(dailyChartsRes.uhid);
          }
          if (dailyChartsRes.target_date) {
            setTargetDate(dailyChartsRes.target_date);
            try {
              const td = new Date(dailyChartsRes.target_date);
              if (!isNaN(td.getTime())) {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                setSelectedMonth(`${monthNames[td.getMonth()]} ${td.getFullYear()}`);
              }
            } catch {
              // fallback
            }
          }
          const metrics = dailyChartsRes.daily_metrics || {};
          const heartPointsObj = metrics.heart_points || {};
          const energyExpendedObj = metrics.energy_expended_kcal || {};
          const sdexObj = metrics.sdex || {};
          const activeMinutesObj = metrics.active_minutes || {};
          const stepsBreakdownObj = dailyChartsRes.daily_steps_breakdown || {};
          const bioSyncObj = dailyChartsRes.bio_sync_charts || {};
          const labelDate = dailyChartsRes.target_date || 'Today';

          const hpValue = heartPointsObj.value ?? (typeof heartPointsObj === 'number' ? heartPointsObj : 0);
          const sdexValue = sdexObj.value ?? (typeof sdexObj === 'number' ? sdexObj : 0);
          const energyExpendedValue = energyExpendedObj.value ?? (typeof energyExpendedObj === 'number' ? energyExpendedObj : 0);
          const activeMinutesValue = activeMinutesObj.value ?? (typeof activeMinutesObj === 'number' ? activeMinutesObj : 0);
          const totalSteps = stepsBreakdownObj.total_steps ?? metrics.steps ?? 0;

          // Days arrays for 7-day charts
          const stepsDays = stepsBreakdownObj.days || [{ date: labelDate, day: 'Today', total: totalSteps }];
          const hpDays = heartPointsObj.days || [{ date: labelDate, day: 'Today', total: hpValue }];
          const sdexDays = sdexObj.days || [{ date: labelDate, day: 'Today', total: sdexValue }];
          const energyDays = energyExpendedObj.days || [{ date: labelDate, day: 'Today', total: energyExpendedValue }];
          const activeMinutesDays = activeMinutesObj.days || [{ date: labelDate, day: 'Today', active_minutes: activeMinutesValue }];

          const mappedFitnessTrend = {
            dailyStepsBreakdown: stepsDays,
            dailyHeartPoints: hpDays,
            dailySdex: sdexDays,
            energyExpanded: energyDays,
            dailyActiveMinutes: activeMinutesDays,
            totalHeartPoint: hpValue,
            totalDailySdex: sdexValue,
            totalActiveMinutes: activeMinutesValue,
            dailyInsightText: dailyChartsRes.daily_insight_text || dailyChartsRes.daily_insight?.text || '',
            dailyHeartPointsCharts: {
              target: heartPointsObj.target ?? 21.4,
              value: hpValue,
              performance_percent: heartPointsObj.performance_percent ?? heartPointsObj.percent ?? Math.round((hpValue / 21.4) * 100),
            },
            dailySdexCharts: {
              target: sdexObj.target,
              value: sdexValue,
              performance_percent: sdexObj.performance_percent ?? sdexObj.percent,
            },
            dailyStepsBreakdownCharts: {
              target: stepsBreakdownObj.target,
              value: totalSteps,
              performance_percent: stepsBreakdownObj.performance_percent ?? stepsBreakdownObj.percent,
            },
            energyExpandedCharts: {
              target: energyExpendedObj.target,
              value: energyExpendedValue,
              performance_percent: energyExpendedObj.performance_percent ?? energyExpendedObj.percent,
            },
            dailyActiveMinutesCharts: {
              target: activeMinutesObj.target,
              value: activeMinutesValue,
              performance_percent: activeMinutesObj.performance_percent ?? activeMinutesObj.percent,
            }
          };

          const ppiObj = bioSyncObj.ppi || {};
          const e3Obj = bioSyncObj.e3 || {};
          const isObj = bioSyncObj.is || {};
          const bioSyncScoreObj = bioSyncObj.bio_sync || {};

          const ppiVal = ppiObj.value ?? 0;
          const e3Val = e3Obj.value ?? 0;
          const isVal = isObj.value ?? 0;
          const bioSyncScore = bioSyncScoreObj.value ?? 0;

          const e3Days = e3Obj.days || [{ date: labelDate, day: 'Today', total: e3Val }];
          const isDays = isObj.days || [{ date: labelDate, day: 'Today', total: isVal }];
          const ppiDays = ppiObj.days || [{ date: labelDate, day: 'Today', total: ppiVal }];

          // Build weeklyTrend array combining the 7 days
          const baseDays = bioSyncScoreObj.days || e3Days || isDays || ppiDays;
          const weeklyTrendCombined = baseDays.map((dayItem: any, idx: number) => {
            return {
              date: dayItem.date,
              day: dayItem.day,
              cys: ppiDays[idx]?.total ?? ppiVal,
              eeKm: e3Days[idx]?.total ?? e3Val,
              isAvg: isDays[idx]?.total ?? isVal,
            };
          });

          const mappedBioSyncTrend = {
            weeklyTrend: weeklyTrendCombined,
            e3Days: e3Days,
            integratedStamina: isDays,
            ppiDays: ppiDays,
            eeKmAvg: bioSyncObj.weekly_avg_e3?.value ?? e3Val,
            eeKmTrend: bioSyncObj.weekly_avg_e3?.trend,
            isAvg: bioSyncObj.weekly_avg_is?.value ?? isVal,
            isTrend: bioSyncObj.weekly_avg_is?.trend,
            cysTotal: bioSyncObj.weekly_avg_ppi?.value ?? ppiVal,
            cysTrend: bioSyncObj.weekly_avg_ppi?.trend,
            stability: isObj.performance_percent ?? isObj.percent ?? isVal,
            intensity: ppiObj.performance_percent ?? ppiObj.percent ?? ppiVal,
            metabolic: e3Obj.performance_percent ?? e3Obj.percent ?? 0,
            cardioYieldPerStep: ppiDays,
            weeklyBioSyncEfficiencyScore: bioSyncScore,
            eePerKmCharts: {
              target: e3Obj.target,
              value: e3Val,
              performance_percent: e3Obj.performance_percent ?? e3Obj.percent,
            },
            integratedStaminaCharts: {
              target: isObj.target,
              value: isVal,
              performance_percent: isObj.performance_percent ?? isObj.percent,
            },
            weeklyTrendCharts: {
              target: bioSyncScoreObj.target,
              value: bioSyncScore,
              performance_percent: bioSyncScoreObj.performance_percent ?? bioSyncScoreObj.percent,
            },
            cardioYieldPerStepCharts: {
              target: ppiObj.target,
              value: ppiVal,
              performance_percent: ppiObj.performance_percent ?? ppiObj.percent,
            },
            dailyInsightText: dailyChartsRes.daily_insight?.text || dailyChartsRes.daily_insight_text || ''
          };

          setFitnessTrend(mappedFitnessTrend);
          setBioSyncTrend(mappedBioSyncTrend);
        }
      } catch (dailyChartsError) {
        console.error('[Insights] daily-charts API ERROR:', dailyChartsError);
      }
    } catch (error) {
      console.error('[Insights] Error fetching daily trend APIs:', error);
    }
  };

  const loadData = async () => {
    setLoadingTrends(true);
    try {
      const logs = await apiService.getActivities();
      setActivities(logs);
      await loadTrendsLogs();
    } catch (error) {
      console.error('Failed to load insights trends activities:', error);
    } finally {
      setRefreshing(false);
      setLoadingTrends(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const isDataForSelectedMonth = () => {
    if (!fitnessTrend || !fitnessTrend.dailyStepsBreakdown || fitnessTrend.dailyStepsBreakdown.length === 0) {
      return false;
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const [selMonthName, selYearStr] = selectedMonth.split(' ');
    const selMonthIdx = monthNames.indexOf(selMonthName);
    const selYear = parseInt(selYearStr, 10);

    if (selMonthIdx === -1 || isNaN(selYear)) return false;

    // Check targetDate
    if (targetDate) {
      try {
        const td = new Date(targetDate);
        if (!isNaN(td.getTime())) {
          if (td.getMonth() === selMonthIdx && td.getFullYear() === selYear) {
            return true;
          }
        }
      } catch {
        // ignore
      }
    }

    // Check individual dates in dailyStepsBreakdown
    return fitnessTrend.dailyStepsBreakdown.some((item: any) => {
      if (item.date) {
        try {
          const d = new Date(item.date);
          if (!isNaN(d.getTime())) {
            return d.getMonth() === selMonthIdx && d.getFullYear() === selYear;
          }
        } catch {
          return false;
        }
      }
      return false;
    });
  };

  const getTrendsData = () => {
    if (activeTimeframe === '7days') {
      if (isDataForSelectedMonth() && fitnessTrend && fitnessTrend.dailyStepsBreakdown && fitnessTrend.dailyStepsBreakdown.length > 0) {
        return fitnessTrend.dailyStepsBreakdown.map((item: any, idx: number) => {
          const steps = item.total !== undefined ? item.total : (item.values ?? 0);
          const hr = fitnessTrend.dailyHeartPoints?.[idx]?.total !== undefined
            ? fitnessTrend.dailyHeartPoints?.[idx]?.total
            : (fitnessTrend.dailyHeartPoints?.[idx]?.values ?? 0);
          const calories = fitnessTrend.energyExpanded?.[idx]?.total !== undefined
            ? fitnessTrend.energyExpanded?.[idx]?.total
            : (fitnessTrend.energyExpanded?.[idx]?.values ?? 0);

          const activeMin = fitnessTrend.dailyActiveMinutes?.[idx]?.active_minutes !== undefined
            ? fitnessTrend.dailyActiveMinutes?.[idx]?.active_minutes
            : fitnessTrend.dailyActiveMinutes?.[idx]?.total !== undefined
            ? fitnessTrend.dailyActiveMinutes?.[idx]?.total
            : (fitnessTrend.dailyActiveMinutes?.[idx]?.values ?? 0);

          const label = formatDateLabel(item.date, item.day) || `Day ${idx + 1}`;

          return {
            label,
            date: item.date,
            day: item.day,
            steps,
            calories,
            hr,
            activeMinutes: activeMin,
          };
        });
      }
    }
    return [];
  };

  const trendPoints = getTrendsData();

  // Clamp selected index to bounds of current dataset
  useEffect(() => {
    if (selectedTrendIdx >= trendPoints.length) {
      setSelectedTrendIdx(Math.max(0, trendPoints.length - 1));
    }
  }, [activeTimeframe, trendPoints.length, selectedTrendIdx]);

  // Dynamic values based on selected index in chart
  const activePoint = trendPoints[selectedTrendIdx >= 0 && selectedTrendIdx < trendPoints.length ? selectedTrendIdx : 0] || trendPoints[0];

  const getSummaryMetrics = () => {
    let totalDistance: string | number = 0.0;
    let distanceDiff = '';
    let activeMinutes: string | number = 0;
    let activeMinutesDiff = '';

    const isDataAvailable = trendPoints && trendPoints.length > 0;

    if (isDataAvailable && fitnessTrend && fitnessTrend.dailyStepsBreakdown) {
      const safeIdx = selectedTrendIdx >= 0 && selectedTrendIdx < trendPoints.length ? selectedTrendIdx : 0;
      const point = trendPoints[safeIdx];

      if (point) {
        totalDistance = parseFloat(((point.steps || 0) * 0.0008).toFixed(1));
        activeMinutes = point.activeMinutes !== undefined ? point.activeMinutes : 0;
      } else {
        const stepsSum = trendPoints.reduce((sum: number, p: any) => sum + (p.steps || 0), 0);
        totalDistance = parseFloat((stepsSum * 0.0008).toFixed(1));
        const minsArray = fitnessTrend.dailyActiveMinutes || [];
        activeMinutes = minsArray.reduce((sum: number, p: any) => sum + (p.active_minutes ?? p.total ?? p.values ?? 0), 0);
      }
    } else {
      totalDistance = '--';
      activeMinutes = '--';
    }

    return { totalDistance, distanceDiff, activeMinutes, activeMinutesDiff };
  };

  const summary = getSummaryMetrics();

  // Draw Activity SVG Chart
  const renderActivityTrendsChart = () => {
    const isDataAvailable = trendPoints && trendPoints.length > 0;

    if (!isDataAvailable) {
      return (
        <View
          style={[
            styles.chartOuterContainer,
            {
              height: CHART_HEIGHT,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              borderRadius: 20,
              paddingHorizontal: 24,
            },
          ]}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}>
            <Text style={{ fontSize: 24 }}>📅</Text>
          </View>
          <Text
            style={{
              color: '#1e293b',
              fontSize: 15,
              fontWeight: '700',
              textAlign: 'center',
              marginBottom: 4,
            }}>
            Data not available for {selectedMonth}
          </Text>
          <Text
            style={{
              color: '#94a3b8',
              fontSize: 12.5,
              fontWeight: '500',
              textAlign: 'center',
            }}>
            No activity records found for this timeframe.
          </Text>
        </View>
      );
    }

    const pL = scale(46);
    const pR = scale(34);
    const pT = verticalScale(34); // extra space at top for tooltip
    const pB = verticalScale(20);
    const cW = CHART_WIDTH - pL - pR;
    const cH = CHART_HEIGHT - pT - pB;
    const n = trendPoints.length;

    // Calculate dynamic upper bounds from trendPoints data
    const dataMaxSteps = Math.max(0, ...trendPoints.map((p: any) => p.steps || 0));
    const dataMaxCal = Math.max(0, ...trendPoints.map((p: any) => p.calories || 0));
    const dataMaxHR = Math.max(0, ...trendPoints.map((p: any) => p.hr || 0));

    // Dynamic scale upper limits rounded to clean values
    const maxSteps = Math.max(100, getDynamicMax([dataMaxSteps]));
    const maxCal = Math.max(100, getDynamicMax([dataMaxCal]));
    const maxHR = Math.max(10, getDynamicMax([dataMaxHR]));

    const toYSteps = (v: number) => pT + cH - lerp(v, 0, maxSteps, 0, cH);
    const toYCal = (v: number) => pT + cH - lerp(v, 0, maxCal, 0, cH);
    const toYHR = (v: number) => pT + cH - lerp(v, 0, maxHR, 0, cH);

    const xs = trendPoints.map((_: any, i: number) =>
      n <= 1 ? pL + cW / 2 : pL + (i / (n - 1)) * cW
    );

    const safeIdx = (selectedTrendIdx >= 0 && selectedTrendIdx < n)
      ? selectedTrendIdx
      : Math.min(2, Math.max(0, n - 1));
    const currActivePoint = trendPoints[safeIdx] || activePoint || { steps: 0, calories: 0, hr: 0, label: 'Today' };

    const stepPts = trendPoints.map((p: any, i: number) => ({ x: xs[i], y: toYSteps(p.steps) }));
    const calPts = trendPoints.map((p: any, i: number) => ({ x: xs[i], y: toYCal(p.calories) }));
    const hrPts = trendPoints.map((p: any, i: number) => ({ x: xs[i], y: toYHR(p.hr) }));

    const stepPath = smoothPath(stepPts);
    const calPath = smoothPath(calPts);
    const hrPath = smoothPath(hrPts);

    const baseY = pT + cH;

    // Tooltip formatting
    const getTooltipDate = () => {
      if (currActivePoint?.date) {
        try {
          const d = new Date(currActivePoint.date);
          return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        } catch {
          // fallback
        }
      }
      return currActivePoint?.day || currActivePoint?.label || 'Today';
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
            x1={xs[safeIdx]}
            y1={pT}
            x2={xs[safeIdx]}
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
            cx={xs[safeIdx]}
            cy={toYSteps(currActivePoint.steps)}
            r={5.5}
            fill="#ffffff"
            stroke={C.blue}
            strokeWidth={2.5}
          />
          <Circle
            cx={xs[safeIdx]}
            cy={toYCal(currActivePoint.calories)}
            r={5.5}
            fill="#ffffff"
            stroke={C.purple}
            strokeWidth={2.5}
          />
          <Circle
            cx={xs[safeIdx]}
            cy={toYHR(currActivePoint.hr)}
            r={5.5}
            fill="#ffffff"
            stroke={C.orange}
            strokeWidth={2.5}
          />

          {/* X Labels */}
          {trendPoints.map((p: any, i: number) => {
            const showLabel = trendPoints.length <= 6 || i % 2 === 0 || i === safeIdx;
            if (!showLabel) return null;

            return (
              <SvgText
                key={i}
                x={xs[i]}
                y={CHART_HEIGHT - 4}
                textAnchor="middle"
                fontSize={trendPoints.length > 6 ? 7.5 : 8.5}
                fill={i === safeIdx ? C.blue : C.textGray}
                fontWeight={i === safeIdx ? '800' : '500'}
              >
                {p.label}
              </SvgText>
            );
          })}

          {/* Top Floating Tooltip Card */}
          {(() => {
            const tx = xs[safeIdx];
            const tooltipW = scale(250);
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
                  fontSize={7.8}
                  fill="#ffffff"
                  fontWeight="700"
                >
                  {`${getTooltipDate()}: ${currActivePoint.steps.toLocaleString()} Steps, ${currActivePoint.calories.toLocaleString()} Cal, ${currActivePoint.hr} HP, ${currActivePoint.activeMinutes ?? 0}m Active`}
                </SvgText>
              </G>
            );
          })()}

          {/* Interactive touch grid columns */}
          {trendPoints.map((_: any, i: number) => {
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

  // Markdown renderer helper for bold (**text**) and italic (*text*)
  const renderInlineMarkdown = (text: string, baseStyle?: any) => {
    if (!text) return null;
    const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return tokens.map((token, idx) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        const boldText = token.slice(2, -2);
        return (
          <Text key={idx} style={[baseStyle, styles.mdBold]}>
            {boldText}
          </Text>
        );
      }
      if (token.startsWith('*') && token.endsWith('*')) {
        const italicText = token.slice(1, -1);
        return (
          <Text key={idx} style={[baseStyle, styles.mdItalic]}>
            {italicText}
          </Text>
        );
      }
      return (
        <Text key={idx} style={baseStyle}>
          {token}
        </Text>
      );
    });
  };

  const renderWeeklyReportSections = (rawText: string) => {
    if (!rawText) return null;
    const rawSections = rawText
      .split(/\n\s*---\s*\n|(?:\r?\n){2,}---(?:\r?\n){1,}/)
      .filter((s) => s.trim().length > 0);

    return rawSections.map((sectionStr, index) => {
      const lines = sectionStr
        .trim()
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      if (lines.length === 0) return null;

      let headerLine = '';
      let contentLines: string[] = [];

      if (lines[0].startsWith('###')) {
        headerLine = lines[0].replace(/^###\s*/, '').trim();
        contentLines = lines.slice(1);
      } else {
        contentLines = lines;
      }

      let cardAccentColor = '#0284c7'; // default blue
      let cardBg = '#ffffff';
      let cardBorderColor = '#E2E8F0';

      if (headerLine.includes('PART 1') || headerLine.includes('🟢') || headerLine.includes('Scorecard')) {
        cardAccentColor = '#059669'; // emerald
        cardBorderColor = '#A7F3D0';
        cardBg = '#F0FDF4';
      } else if (headerLine.includes('PART 2') || headerLine.includes('🌟') || headerLine.includes('Success')) {
        cardAccentColor = '#2563eb'; // blue
        cardBorderColor = '#BFDBFE';
        cardBg = '#EFF6FF';
      } else if (headerLine.includes('PART 3') || headerLine.includes('🚨') || headerLine.includes('Shortcoming') || headerLine.includes('Focus')) {
        cardAccentColor = '#d97706'; // amber
        cardBorderColor = '#FDE68A';
        cardBg = '#FFFBEB';
      } else if (headerLine.includes('BIO-SYNC') || headerLine.includes('REPORT')) {
        cardAccentColor = '#4F46E5'; // indigo
        cardBorderColor = '#C7D2FE';
        cardBg = '#EEF2FF';
      }

      return (
        <View
          key={`report-section-${index}`}
          style={[
            styles.weeklySectionCard,
            { borderColor: cardBorderColor, backgroundColor: cardBg },
          ]}
        >
          {headerLine ? (
            <View style={[styles.weeklySectionHeaderRow, { borderBottomColor: cardBorderColor }]}>
              <Text style={[styles.weeklySectionTitle, { color: cardAccentColor }]}>
                {headerLine}
              </Text>
            </View>
          ) : null}

          <View style={styles.weeklySectionBody}>
            {contentLines.map((line, lIdx) => {
              const isBullet = line.startsWith('*') || line.startsWith('-');
              const cleanLine = isBullet ? line.replace(/^[\*\-]\s*/, '') : line;

              // Check if metric row: e.g. "**1. Bio-Sync Efficiency (BSE):** **21.4 / 100**"
              const isMetricRow = isBullet && (cleanLine.includes(':**') || cleanLine.includes(':'));

              if (isMetricRow) {
                return (
                  <View key={`metric-${lIdx}`} style={styles.weeklyMetricRow}>
                    <Text style={[styles.bulletDot, { color: cardAccentColor }]}>●</Text>
                    <Text style={styles.weeklyMetricText}>
                      {renderInlineMarkdown(cleanLine, styles.weeklyMetricBaseText)}
                    </Text>
                  </View>
                );
              }

              if (isBullet) {
                return (
                  <View key={`bullet-${lIdx}`} style={styles.weeklyBulletRow}>
                    <Text style={[styles.bulletPointIcon, { color: cardAccentColor }]}>•</Text>
                    <Text style={styles.weeklyBulletContent}>
                      {renderInlineMarkdown(cleanLine, styles.weeklyBulletText)}
                    </Text>
                  </View>
                );
              }

              return (
                <Text key={`para-${lIdx}`} style={styles.weeklyParagraphText}>
                  {renderInlineMarkdown(line, styles.weeklyParagraphText)}
                </Text>
              );
            })}
          </View>
        </View>
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="Fitness Insights & Trends" showDrawerButton />
      <View style={styles.glowSpot1} />
      <View style={styles.glowSpot2} />

      <View style={styles.tabScrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContainer}
        >
          <TouchableOpacity
            onPress={() => setActiveScreenTab('fitness')}
            activeOpacity={0.8}
            style={[styles.tabBtn, activeScreenTab === 'fitness' && styles.tabActiveBtn]}
          >
            <Text style={[styles.tabBtnText, activeScreenTab === 'fitness' && styles.tabActiveText]}>
              Daily Metrics
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveScreenTab('bio-sync')}
            activeOpacity={0.8}
            style={[styles.tabBtn, activeScreenTab === 'bio-sync' && styles.tabActiveBtn]}
          >
            <Text style={[styles.tabBtnText, activeScreenTab === 'bio-sync' && styles.tabActiveText]}>
              Bio-Sync
            </Text>
          </TouchableOpacity>
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
              Weekly Report
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Target Date & UHID Info Banner (Rendered below tabs, only for Daily Metrics and Bio-Sync) */}
      {(activeScreenTab === 'fitness' || activeScreenTab === 'bio-sync') && (
        <View style={styles.topInfoBar}>
          <View style={styles.infoBarChip}>
            <Text style={styles.infoBarLabel}>UHID: </Text>
            <Text style={styles.infoBarValue}>{targetUhid}</Text>
          </View>
          <View style={styles.infoBarChip}>
            <Text style={styles.infoBarLabel}>Target Date: </Text>
            <Text style={styles.infoBarDateValue}>{targetDate || 'Today'}</Text>
          </View>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
        }
      >
        {activeScreenTab === 'fitness' && (
          loadingTrends ? (
            <View style={{ paddingVertical: 80, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 12 }}>
                Loading fitness insights...
              </Text>
            </View>
          ) : (
            <FitnessTab
              chartWidth={CHART_WIDTH}
              dailyStepsBreakdown={parseFitnessTrendArray(fitnessTrend?.dailyStepsBreakdown)}
              dailyHeartPoints={parseFitnessTrendArray(fitnessTrend?.dailyHeartPoints)}
              sdexActivity={parseFitnessTrendArray(fitnessTrend?.dailySdex)}
              energyExpended={parseFitnessTrendArray(fitnessTrend?.energyExpanded)}
              dailyActiveMinutes={parseFitnessTrendArray(fitnessTrend?.dailyActiveMinutes)}
              totalHeartPoint={fitnessTrend?.totalHeartPoint ?? 0}
              totalDailySdex={fitnessTrend?.totalDailySdex ?? 0}
              totalActiveMinutes={fitnessTrend?.totalActiveMinutes ?? 0}
              dailyHeartPointsCharts={formatChartSummary(fitnessTrend?.dailyHeartPointsCharts)}
              dailySdexCharts={formatChartSummary(fitnessTrend?.dailySdexCharts)}
              dailyStepsBreakdownCharts={formatChartSummary(fitnessTrend?.dailyStepsBreakdownCharts)}
              energyExpandedCharts={formatChartSummary(fitnessTrend?.energyExpandedCharts)}
              dailyActiveMinutesCharts={formatChartSummary(fitnessTrend?.dailyActiveMinutesCharts)}
              dailyInsightText={fitnessTrend?.dailyInsightText}
            />
          )
        )}

        {activeScreenTab === 'bio-sync' && (
          loadingTrends ? (
            <View style={{ paddingVertical: 80, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 12 }}>
                Loading bio-sync data...
              </Text>
            </View>
          ) : (
            <BioSyncTab
              chartWidth={CHART_WIDTH}
              energyEfficiency={parseFitnessTrendArray(
                bioSyncTrend?.e3Days ||
                bioSyncTrend?.weeklyTrend?.map((item: any) => ({
                  ...item,
                  total: item.eeKm,
                }))
              )}
              integratedStamina={parseFitnessTrendArray(bioSyncTrend?.integratedStamina)}
              pulsePaceIndex={parseFitnessTrendArray(bioSyncTrend?.ppiDays)}
              weeklyPerformance={parseWeeklyPerformance(bioSyncTrend?.weeklyTrend)}
              weeklyPerformanceSummary={{
                eeKmAvg: bioSyncTrend?.eeKmAvg ?? 0,
                eeKmTrend: bioSyncTrend?.eeKmTrend,
                isAvg: bioSyncTrend?.isAvg ?? 0,
                isTrend: bioSyncTrend?.isTrend,
                cysTotal: bioSyncTrend?.cysTotal ?? 0,
                cysTrend: bioSyncTrend?.cysTrend,
              }}
              pillarHealthData={[
                { label: 'Stamina (IS)', value: bioSyncTrend?.stability ?? 0, color: '#22C55E' },
                { label: 'Intensity (PPI)', value: bioSyncTrend?.intensity ?? 0, color: '#3B82F6' },
                { label: 'Metabolic (E3)', value: bioSyncTrend?.metabolic ?? 0, color: '#F59E0B' },
              ]}
              cardioYieldData={parseCardioYieldData(bioSyncTrend?.cardioYieldPerStep)}
              weeklyBioSyncEfficiencyScore={bioSyncTrend?.weeklyBioSyncEfficiencyScore ?? 0}
              eePerKmCharts={formatChartSummary(bioSyncTrend?.eePerKmCharts)}
              integratedStaminaCharts={formatChartSummary(bioSyncTrend?.integratedStaminaCharts)}
              weeklyTrendCharts={formatChartSummary(bioSyncTrend?.weeklyTrendCharts)}
              cardioYieldPerStepCharts={formatChartSummary(bioSyncTrend?.cardioYieldPerStepCharts)}
              status={getBioSyncStatus(bioSyncTrend?.weeklyBioSyncEfficiencyScore)}
              dailyInsightText={bioSyncTrend?.dailyInsightText || fitnessTrend?.dailyInsightText}
            />
          )
        )}

        {activeScreenTab === 'trends' && (
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
                  <Text style={styles.summaryValue}>
                    {summary.totalDistance === '--' ? '--' : `${summary.totalDistance} km`}
                  </Text>
                  {!!summary.distanceDiff && (
                    <Text style={styles.summarySubtext}>
                      <Text style={styles.positiveGrowthText}>{summary.distanceDiff}</Text> vs last mth
                    </Text>
                  )}
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
                  <Text style={styles.summaryValue}>
                    {summary.activeMinutes === '--' ? '--' : `${summary.activeMinutes} min`}
                  </Text>
                  {!!summary.activeMinutesDiff && (
                    <Text style={styles.summarySubtext}>
                      <Text style={styles.positiveGrowthText}>{summary.activeMinutesDiff}</Text> vs last mth
                    </Text>
                  )}
                </View>
              </LinearGradient>
            </View>
          </View>
        )}

        {activeScreenTab === 'transformation' && (
          /* View: Your Weekly Fitness Transformation */
          <View style={styles.weeklyReportContainer}>
            <Text style={styles.transformationHeaderTitle}>Your Weekly Fitness Transformation</Text>

            {weeklyReportLoading ? (
              <View style={{ paddingVertical: 80, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{ color: '#94a3b8', fontSize: 13, marginTop: 12 }}>
                  Loading weekly fitness transformation report...
                </Text>
              </View>
            ) : weeklyReportData ? (
              <View style={{ gap: verticalScale(14) }}>
                {/* Meta summary chip row if metadata exists */}
                {weeklyReportData.report_metadata && (
                  <View style={styles.weeklyMetaHeader}>
                    {weeklyReportData.user_id ? (
                      <View style={styles.weeklyMetaBadge}>
                        <Text style={styles.weeklyMetaLabel}>UHID: </Text>
                        <Text style={styles.weeklyMetaValue}>{weeklyReportData.user_id}</Text>
                      </View>
                    ) : null}
                    {weeklyReportData.report_metadata.week_code ? (
                      <View style={styles.weeklyMetaBadge}>
                        <Text style={styles.weeklyMetaLabel}>Week: </Text>
                        <Text style={styles.weeklyMetaValue}>{weeklyReportData.report_metadata.week_code}</Text>
                      </View>
                    ) : null}
                    {weeklyReportData.report_metadata.generation_timestamp_utc ? (
                      <View style={styles.weeklyMetaBadge}>
                        <Text style={styles.weeklyMetaLabel}>Generated: </Text>
                        <Text style={styles.weeklyMetaValue}>
                          {new Date(weeklyReportData.report_metadata.generation_timestamp_utc).toLocaleDateString()}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                )}

                {/* Render sections parsed from raw_body_text */}
                {renderWeeklyReportSections(weeklyReportData.ui_rendering_payload?.raw_body_text || '')}
              </View>
            ) : (
              <View style={[styles.transformCard, { alignItems: 'center', paddingVertical: 40 }]}>
                <Text style={{ fontSize: 32, marginBottom: 12 }}>📋</Text>
                <Text style={{ color: '#64748b', fontSize: 14, fontWeight: '600' }}>
                  No weekly report available at this moment.
                </Text>
              </View>
            )}
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
  tabScrollContainer: {
    paddingHorizontal: theme.spacing.containerPadding,
    marginTop: theme.spacing.md,
    height: 48,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(99, 102, 241, 0.06)',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.12)',
    alignItems: 'center',
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 4,
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
  scrollChartContainer: {
    position: 'relative',
    width: '100%',
    height: CHART_HEIGHT,
  },
  seeMoreBtnRight: {
    position: 'absolute',
    right: 8,
    bottom: 24,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  seeMoreBtnLeft: {
    position: 'absolute',
    left: scale(36),
    bottom: 24,
    backgroundColor: 'rgba(100, 116, 139, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#64748b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  seeMoreText: {
    color: '#ffffff',
    fontSize: 9.5,
    fontWeight: '800',
  },
  topInfoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: scale(16),
    marginTop: verticalScale(4),
    marginBottom: verticalScale(8),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(6),
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  infoBarChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoBarLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748b',
  },
  infoBarValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
  },
  infoBarDateValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0284c7',
  },
  weeklyReportContainer: {
    paddingBottom: verticalScale(20),
  },
  weeklyMetaHeader: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: verticalScale(4),
  },
  weeklyMetaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  weeklyMetaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  weeklyMetaValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  weeklySectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: scale(16),
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  weeklySectionHeaderRow: {
    paddingBottom: verticalScale(10),
    marginBottom: verticalScale(10),
    borderBottomWidth: 1,
  },
  weeklySectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  weeklySectionBody: {
    gap: verticalScale(8),
  },
  weeklyMetricRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  bulletDot: {
    fontSize: 10,
    marginRight: scale(8),
    marginTop: verticalScale(2),
  },
  weeklyMetricText: {
    flex: 1,
  },
  weeklyMetricBaseText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  weeklyBulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bulletPointIcon: {
    fontSize: 16,
    marginRight: scale(8),
    marginTop: verticalScale(-2),
  },
  weeklyBulletContent: {
    flex: 1,
  },
  weeklyBulletText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  weeklyParagraphText: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
  mdBold: {
    fontWeight: '800',
    color: '#0F172A',
  },
  mdItalic: {
    fontStyle: 'italic',
    color: '#64748B',
  },
});

export default InsightsScreen;
