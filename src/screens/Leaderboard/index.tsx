import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
  Animated,
  Modal,
  TextInput,
  Platform,
  UIManager,
  LayoutAnimation,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DrawerContext from '../../navigation/DrawerContext';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ROUTES } from '../../constants/routes';
import { CustomHeader } from '../../components/common/CustomHeader';
import { apiService } from '../../services/api';
import { UserProfile, Activity } from '../../types';
import Svg, { Path } from 'react-native-svg';
import { IMAGES } from '../../assets/images';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Screen Dimensions
const { width } = Dimensions.get('window');

// SVG Components for vibrant card icons
const ActiveCrewSvg = ({ color }: { color: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path
      d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"
      fill={color}
    />
  </Svg>
);

const BenchmarkSvg = ({ color }: { color: string }) => (
  <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      fill={color}
    />
  </Svg>
);

// Types & Data Architecture for 3-Phase Tournament
export type TournamentPhase = 1 | 2 | 3;

export interface TrackSubMetric {
  title: string;
  weight: string;
  value: string;
  percentageScore?: string;
  avgScore?: string;
  statusTag?: string;
  isDanger?: boolean;
}

export interface PhaseTrack {
  id: string;
  trackNumber: 1 | 2 | 3;
  name: string; // "Track 1: Behavioral Track", "Track 2: Physiological Track", "Track 3: Structural Track"
  shortName: string; // "Track 1: Behavioral", "Track 2: Physiological", "Track 3: Structural"
  icon: string; // "🧬", "💓", "🦴"
  weightLabel: string;
  overallStatus: string;
  statusColor?: string;
  subMetrics: TrackSubMetric[];
  clinicalInference: {
    title: string;
    text: string;
  };
}

export interface PhasePlayer {
  id: string;
  name: string;
  userId: string;
  department: string;
  isCurrentUser?: boolean;
  masterScore: number;
  scoreDisplay?: string;
  status: 'ACTIVE' | 'CHAMPION' | 'PODIUM' | 'IN DANGER';
  statusLabel?: string;
  isDanger?: boolean;
  breakdown?: {
    cmas?: number;
    bse?: number;
    ffs?: number;
  };
  matrixTitle: string;
  tracks: PhaseTrack[];
}

// 21 Days Metadata
export interface DayConfig {
  dayNumber: number;
  phase: TournamentPhase;
  title: string;
}

export const TOURNAMENT_DAYS: DayConfig[] = Array.from({ length: 21 }, (_, i) => {
  const day = i + 1;
  const phase: TournamentPhase = day <= 7 ? 1 : day <= 14 ? 2 : 3;
  return {
    dayNumber: day,
    phase,
    title: `Day ${day}`,
  };
});

// Phase Static Configurations
export const PHASE_CONFIGS: Record<
  TournamentPhase,
  {
    phaseNumber: number;
    title: string;
    focus: string;
    masterScoreKey: string;
    formulaLabel: string;
    axeLineCutRank: number;
    axeLineLabel: string;
    participantsCount: string;
    avgBenchmarkScore: string;
    benchmarkUnit: string;
  }
> = {
  1: {
    phaseNumber: 1,
    title: 'THE GAUNTLET: PHASE 1',
    focus: 'BEHAVIORAL FOUNDATION',
    masterScoreKey: 'CUMULATIVE CMAS / 100',
    formulaLabel: 'Master Sorting Key: Cumulative CMAS / 100 (1 Track Active)',
    axeLineCutRank: 2,
    axeLineLabel: '🩸 TOURNAMENT AXE LINE (ELIMINATION DANGER ZONE)',
    participantsCount: '104,210',
    avgBenchmarkScore: '68.4',
    benchmarkUnit: 'Avg CMAS',
  },
  2: {
    phaseNumber: 2,
    title: 'THE GAUNTLET: PHASE 2',
    focus: 'ELITE BIOMETRIC NEXUS',
    masterScoreKey: 'MASTER COMPOUND SCORE',
    formulaLabel: 'Master Key: 50/50 Compound (Behavioral + Physiological)',
    axeLineCutRank: 2,
    axeLineLabel: '🩸 TOURNAMENT AXE LINE (ELIMINATION DANGER ZONE)',
    participantsCount: '52,105',
    avgBenchmarkScore: '72.8',
    benchmarkUnit: 'Avg Compound',
  },
  3: {
    phaseNumber: 3,
    title: 'THE GAUNTLET: PHASE 3',
    focus: 'THE GRAND OLYMPUS CHAMPIONSHIP',
    masterScoreKey: 'MASTER CHAMPIONSHIP SCORE',
    formulaLabel: 'Master Key: 3-Axis Score (Behavioral + Physiological + Structural)',
    axeLineCutRank: 3,
    axeLineLabel: '🩸 CHAMPIONSHIP CUT (TOP 3 AWARD PODIUM ZONE)',
    participantsCount: '26,050',
    avgBenchmarkScore: '78.5',
    benchmarkUnit: 'Avg Championship',
  },
};

// ==========================================
// REUSABLE TRACK TEMPLATES FOR PHASES
// ==========================================

// Phase 1 Mock Data (Days 1–7): 1 Track (Behavioral)
const PHASE_1_PLAYERS: PhasePlayer[] = [
  {
    id: 'p1-aligned',
    userId: 'ALIGNED_B65F',
    name: 'ALIGNED_B65F',
    department: 'DevOps & Infra',
    masterScore: 75.4,
    status: 'ACTIVE',
    matrixTitle: 'BEHAVIORAL FOUNDATION MATRIX',
    tracks: [
      {
        id: 't-beh-1',
        trackNumber: 1,
        name: 'Track 1: Behavioral Track (Behavioral Foundation)',
        shortName: 'Track 1: Behavioral',
        icon: '🧬',
        weightLabel: '100% Phase 1 Master Key',
        overallStatus: 'OPTIMAL PACE',
        statusColor: '#10B981',
        subMetrics: [
          { title: 'Step Volume Allocation', weight: '40% Weight', value: '92.5% (Avg: 9,250 / 10,000 steps)', statusTag: 'OPTIMAL' },
          { title: 'Heart Points Allocation', weight: '40% Weight', value: '85.0% (Avg: 18.2 / 21.4 HP)', statusTag: 'AEROBIC PEAK' },
          { title: 'Sedentary S-DEX Score', weight: '20% Weight', value: '18.0 / 100 [LOW HAZARD]', statusTag: 'ACTIVE BREAKS' },
        ],
        clinicalInference: {
          title: '3-Day Cumulative Behavioral Health Inference [AHA]',
          text: 'User demonstrates high adherence to baseline volume metrics. Micro-breaks taken during sustained work hours effectively mitigated vascular pooling risks.',
        },
      },
    ],
  },
  {
    id: 'p1-techpro',
    userId: 'TECH_PRO_M',
    name: 'TECH_PRO_M',
    department: 'Engineering',
    masterScore: 71.0,
    status: 'ACTIVE',
    matrixTitle: 'BEHAVIORAL FOUNDATION MATRIX',
    tracks: [
      {
        id: 't-beh-2',
        trackNumber: 1,
        name: 'Track 1: Behavioral Track (Behavioral Foundation)',
        shortName: 'Track 1: Behavioral',
        icon: '🧬',
        weightLabel: '100% Phase 1 Master Key',
        overallStatus: 'STEADY PACE',
        statusColor: '#10B981',
        subMetrics: [
          { title: 'Step Volume Allocation', weight: '40% Weight', value: '88.0% (Avg: 8,800 / 10,000 steps)', statusTag: 'STEADY' },
          { title: 'Heart Points Allocation', weight: '40% Weight', value: '78.5% (Avg: 16.8 / 21.4 HP)', statusTag: 'CONSISTENT' },
          { title: 'Sedentary S-DEX Score', weight: '20% Weight', value: '24.5 / 100 [LOW HAZARD]', statusTag: 'LOW RISK' },
        ],
        clinicalInference: {
          title: '3-Day Cumulative Behavioral Health Inference [AHA]',
          text: 'Consistent circadian exertion profile with optimal cardiovascular stimulation and adequate muscular micro-recovery.',
        },
      },
    ],
  },
  {
    id: 'p1-runner',
    userId: 'RUNNER_A_25M',
    name: 'RUNNER_A_25M',
    department: 'Product Design',
    masterScore: 44.0,
    scoreDisplay: '[ 44.0 ]',
    status: 'IN DANGER',
    isDanger: true,
    matrixTitle: 'BEHAVIORAL FOUNDATION MATRIX',
    tracks: [
      {
        id: 't-beh-3',
        trackNumber: 1,
        name: 'Track 1: Behavioral Track (Behavioral Foundation)',
        shortName: 'Track 1: Behavioral',
        icon: '🧬',
        weightLabel: '100% Phase 1 Master Key',
        overallStatus: 'CRITICAL DEFICIT',
        statusColor: '#EF4444',
        subMetrics: [
          { title: 'Step Volume Allocation', weight: '40% Weight', value: '41.0% (Avg: 4,100 / 10,000 steps)', statusTag: 'DEFICIT', isDanger: true },
          { title: 'Heart Points Allocation', weight: '40% Weight', value: '0.0% (Avg: 0.0 / 21.4 HP)', statusTag: '🚨 ZERO CARDIO', isDanger: true },
          { title: 'Sedentary S-DEX Score', weight: '20% Weight', value: '100.0 / 100 [MAX HAZARD]', statusTag: '🚨 >6H SITTING', isDanger: true },
        ],
        clinicalInference: {
          title: '3-Day Cumulative Behavioral Health Inference [AHA]',
          text: 'Participant exhibits extreme sedentary stagnation during work hours with zero moderate-to-vigorous physical activity (MVPA). Immediate 5.4 HP micro-dosing protocol recommended to escape elimination zone.',
        },
      },
    ],
  },
  {
    id: 'p1-stagn',
    userId: 'STAGN_42M',
    name: 'STAGN_42M',
    department: 'Operations',
    masterScore: 10.8,
    scoreDisplay: '[ 10.8 ]',
    status: 'IN DANGER',
    isDanger: true,
    matrixTitle: 'BEHAVIORAL FOUNDATION MATRIX',
    tracks: [
      {
        id: 't-beh-4',
        trackNumber: 1,
        name: 'Track 1: Behavioral Track (Behavioral Foundation)',
        shortName: 'Track 1: Behavioral',
        icon: '🧬',
        weightLabel: '100% Phase 1 Master Key',
        overallStatus: 'CRITICAL ATROPHY',
        statusColor: '#EF4444',
        subMetrics: [
          { title: 'Step Volume Allocation', weight: '40% Weight', value: '15.0% (Avg: 1,500 / 10,000 steps)', statusTag: 'CRITICAL', isDanger: true },
          { title: 'Heart Points Allocation', weight: '40% Weight', value: '0.0% (Avg: 0.0 / 21.4 HP)', statusTag: 'ZERO CARDIO', isDanger: true },
          { title: 'Sedentary S-DEX Score', weight: '20% Weight', value: '98.0 / 100 [MAX HAZARD]', statusTag: 'MAX RISK', isDanger: true },
        ],
        clinicalInference: {
          title: '3-Day Cumulative Behavioral Health Inference [AHA]',
          text: 'Severe risk of vascular compression; zero exertion logged over 72 hours. Urgent postural realignment necessary.',
        },
      },
    ],
  },
];

// Phase 2 Mock Data (Days 8–14): 2 Tracks (Behavioral + Physiological)
const PHASE_2_PLAYERS: PhasePlayer[] = [
  {
    id: 'p2-aligned',
    userId: 'ALIGNED_B65F',
    name: 'ALIGNED_B65F',
    department: 'DevOps & Infra',
    masterScore: 84.1,
    status: 'ACTIVE',
    breakdown: { cmas: 82.5, bse: 85.7 },
    matrixTitle: 'BIOMETRIC NEXUS MATRIX',
    tracks: [
      {
        id: 't-beh-p2-1',
        trackNumber: 1,
        name: 'Track 1: Behavioral Track (Cumulative CMAS)',
        shortName: 'Track 1: Behavioral',
        icon: '🧬',
        weightLabel: '50% Compound Weight',
        overallStatus: 'OPTIMAL COMPLIANCE',
        statusColor: '#10B981',
        subMetrics: [
          { title: 'Cumulative Step Volume', weight: '40% Sub-Weight', value: '94.0% (Avg: 9,400 / 10,000 steps)', statusTag: 'OPTIMAL' },
          { title: 'Cumulative Heart Points', weight: '40% Sub-Weight', value: '88.5% (Avg: 19.0 / 21.4 HP)', statusTag: 'AEROBIC PEAK' },
          { title: 'Sedentary S-DEX Score', weight: '20% Sub-Weight', value: '15.0 / 100 [LOW HAZARD]', statusTag: 'LOW HAZARD' },
        ],
        clinicalInference: {
          title: 'Cumulative Behavioral Foundation Synthesis [AHA]',
          text: 'Superb volume stability maintained throughout sprint intervals with prompt circadian resets.',
        },
      },
      {
        id: 't-phy-p2-1',
        trackNumber: 2,
        name: 'Track 2: Physiological Track (Elite Biometric Nexus)',
        shortName: 'Track 2: Physiological',
        icon: '💓',
        weightLabel: '50% Compound Weight',
        overallStatus: 'PEAK BUFFERING',
        statusColor: '#10B981',
        subMetrics: [
          { title: 'Peak Power Index (PPI)', weight: '35% Weight', value: '88.0% [⚡ OPTIMAL]', statusTag: 'OPTIMAL' },
          { title: 'Exertion Efficiency Ratio (E3)', weight: '35% Weight', value: '86.5% [⚡ PRIME]', statusTag: 'PRIME' },
          { title: 'Intra-Day Stability (IS)', weight: '30% Weight', value: '82.0% [⚡ STABLE]', statusTag: 'HOMEOSTATIC' },
        ],
        clinicalInference: {
          title: 'Multi-Week Physiological Recovery Inference [AHA]',
          text: 'Superior metabolic flexibility observed. Post-exertion recovery latency under 18 minutes indicates elite cardiovascular buffering.',
        },
      },
    ],
  },
  {
    id: 'p2-techpro',
    userId: 'TECH_PRO_M',
    name: 'TECH_PRO_M',
    department: 'Engineering',
    masterScore: 79.5,
    status: 'ACTIVE',
    breakdown: { cmas: 78.0, bse: 81.0 },
    matrixTitle: 'BIOMETRIC NEXUS MATRIX',
    tracks: [
      {
        id: 't-beh-p2-2',
        trackNumber: 1,
        name: 'Track 1: Behavioral Track (Cumulative CMAS)',
        shortName: 'Track 1: Behavioral',
        icon: '🧬',
        weightLabel: '50% Compound Weight',
        overallStatus: 'STEADY COMPLIANCE',
        statusColor: '#10B981',
        subMetrics: [
          { title: 'Cumulative Step Volume', weight: '40% Sub-Weight', value: '86.0% (Avg: 8,600 steps)', statusTag: 'STEADY' },
          { title: 'Cumulative Heart Points', weight: '40% Sub-Weight', value: '80.0% (Avg: 17.1 HP)', statusTag: 'CONSISTENT' },
          { title: 'Sedentary S-DEX Score', weight: '20% Sub-Weight', value: '22.0 / 100 [LOW HAZARD]', statusTag: 'LOW HAZARD' },
        ],
        clinicalInference: {
          title: 'Cumulative Behavioral Foundation Synthesis [AHA]',
          text: 'High sustained activity output across working sprint cycles.',
        },
      },
      {
        id: 't-phy-p2-2',
        trackNumber: 2,
        name: 'Track 2: Physiological Track (Elite Biometric Nexus)',
        shortName: 'Track 2: Physiological',
        icon: '💓',
        weightLabel: '50% Compound Weight',
        overallStatus: 'STRONG RECOVERY',
        statusColor: '#10B981',
        subMetrics: [
          { title: 'Peak Power Index (PPI)', weight: '35% Weight', value: '82.0% [⚡ OPTIMAL]', statusTag: 'STRONG' },
          { title: 'Exertion Efficiency Ratio (E3)', weight: '35% Weight', value: '80.0% [⚡ PRIME]', statusTag: 'EFFICIENT' },
          { title: 'Intra-Day Stability (IS)', weight: '30% Weight', value: '81.0% [⚡ STABLE]', statusTag: 'STABLE' },
        ],
        clinicalInference: {
          title: 'Multi-Week Physiological Recovery Inference [AHA]',
          text: 'Balanced sympathetic/parasympathetic tone during high work stress intervals. Excellent recovery resilience.',
        },
      },
    ],
  },
  {
    id: 'p2-runner',
    userId: 'RUNNER_A_25M',
    name: 'RUNNER_A_25M',
    department: 'Product Design',
    masterScore: 38.2,
    scoreDisplay: '[ 38.2 ]',
    status: 'IN DANGER',
    isDanger: true,
    breakdown: { cmas: 29.3, bse: 47.0 },
    matrixTitle: 'BIOMETRIC NEXUS MATRIX',
    tracks: [
      {
        id: 't-beh-p2-3',
        trackNumber: 1,
        name: 'Track 1: Behavioral Track (Cumulative CMAS)',
        shortName: 'Track 1: Behavioral',
        icon: '🧬',
        weightLabel: '50% Compound Weight',
        overallStatus: 'CRITICAL DEFICIT',
        statusColor: '#EF4444',
        subMetrics: [
          { title: 'Cumulative Step Volume', weight: '40% Sub-Weight', value: '38.0% (Avg: 3,800 steps)', statusTag: 'DEFICIT', isDanger: true },
          { title: 'Cumulative Heart Points', weight: '40% Sub-Weight', value: '0.0% (Avg: 0.0 HP)', statusTag: 'ZERO CARDIO', isDanger: true },
          { title: 'Sedentary S-DEX Score', weight: '20% Sub-Weight', value: '98.0 / 100 [MAX HAZARD]', statusTag: 'MAX RISK', isDanger: true },
        ],
        clinicalInference: {
          title: 'Cumulative Behavioral Foundation Synthesis [AHA]',
          text: 'Persistent behavioral stagnation elevates deep vein thrombosis risk profile.',
        },
      },
      {
        id: 't-phy-p2-3',
        trackNumber: 2,
        name: 'Track 2: Physiological Track (Elite Biometric Nexus)',
        shortName: 'Track 2: Physiological',
        icon: '💓',
        weightLabel: '50% Compound Weight',
        overallStatus: 'CRITICAL STRAIN',
        statusColor: '#EF4444',
        subMetrics: [
          { title: 'Peak Power Index (PPI)', weight: '35% Weight', value: '40.0% [🚨 CRITICAL]', statusTag: 'STRAIN', isDanger: true },
          { title: 'Exertion Efficiency Ratio (E3)', weight: '35% Weight', value: '65.0% [⚠️ SLACKING]', statusTag: 'SUB-OPTIMAL', isDanger: true },
          { title: 'Intra-Day Stability (IS)', weight: '30% Weight', value: '45.0% [🚨 DRIFTING]', statusTag: 'HIGH DRIFT', isDanger: true },
        ],
        clinicalInference: {
          title: 'Multi-Week Physiological Recovery Inference [AHA]',
          text: 'Significant autonomic fatigue detected with erratic circadian energy dips. High intra-day volatility elevates neuromuscular burnout risk.',
        },
      },
    ],
  },
];

// Phase 3 Mock Data (Days 15–21): 3 Tracks (Behavioral + Physiological + Structural)
const PHASE_3_PLAYERS: PhasePlayer[] = [
  {
    id: 'p3-aligned',
    userId: 'ALIGNED_B65F',
    name: 'ALIGNED_B65F',
    department: 'DevOps & Infra',
    masterScore: 87.9,
    status: 'CHAMPION',
    statusLabel: '👑 CHAMPION',
    breakdown: { cmas: 88.0, bse: 89.2, ffs: 86.5 },
    matrixTitle: 'GRAND OLYMPUS CHAMPIONSHIP MATRIX',
    tracks: [
      {
        id: 't-beh-p3-1',
        trackNumber: 1,
        name: 'Track 1: Behavioral Track (21-Day Cumulative CMAS)',
        shortName: 'Track 1: Behavioral',
        icon: '🧬',
        weightLabel: '40% Championship Weight',
        overallStatus: 'ELITE CONSISTENCY',
        statusColor: '#10B981',
        subMetrics: [
          { title: '21-Day Step Compliance', weight: '40% Sub-Weight', value: '96.0% (Avg: 9,600 steps/day)', statusTag: 'ELITE' },
          { title: '21-Day Heart Points Adherence', weight: '40% Sub-Weight', value: '91.0% (Avg: 19.5 HP/day)', statusTag: 'AEROBIC PEAK' },
          { title: '21-Day S-DEX Sedentary Mitigation', weight: '20% Sub-Weight', value: '12.0 / 100 [OPTIMAL]', statusTag: 'PROTECTED' },
        ],
        clinicalInference: {
          title: '21-Day Behavioral Kinematic Continuity [AHA]',
          text: 'Continuous behavioral adherence established durable anti-stagnation circadian reflexes.',
        },
      },
      {
        id: 't-phy-p3-1',
        trackNumber: 2,
        name: 'Track 2: Physiological Track (21-Day Biometric Nexus)',
        shortName: 'Track 2: Physiological',
        icon: '💓',
        weightLabel: '30% Championship Weight',
        overallStatus: 'ELITE RECOVERY',
        statusColor: '#10B981',
        subMetrics: [
          { title: '21-Day Peak Power Index (PPI)', weight: '35% Sub-Weight', value: '92.0% [⚡ OPTIMAL]', statusTag: 'PEAK' },
          { title: '21-Day Exertion Efficiency (E3)', weight: '35% Sub-Weight', value: '89.5% [⚡ PRIME]', statusTag: 'PRIME' },
          { title: '21-Day Intra-Day Stability (IS)', weight: '30% Sub-Weight', value: '86.0% [⚡ STABLE]', statusTag: 'HOMEOSTATIC' },
        ],
        clinicalInference: {
          title: '21-Day Autonomic Homeostasis Synthesis [AHA]',
          text: 'Parasympathetic tone restored within minimal post-exertion windows across all three weeks.',
        },
      },
      {
        id: 't-str-p3-1',
        trackNumber: 3,
        name: 'Track 3: Structural Track (Grand Olympus Kinematics)',
        shortName: 'Track 3: Structural',
        icon: '🦴',
        weightLabel: '30% Championship Weight',
        overallStatus: 'ALL-AXIS PRIME',
        statusColor: '#FACC15',
        subMetrics: [
          { title: '4-Axis Kinematic Distribution', weight: 'Cardio, Muscle, Spine, Neuro', value: 'Cardio: 94% | Muscle: 88.5% | Spine: 91% | Neuro: 85%', statusTag: 'BALANCED' },
          { title: '21-Day Compliance Rate', weight: 'Gauntlet Threshold', value: '98.4% [🥇 ELITE ASCENSION]', statusTag: 'ELITE' },
          { title: 'Cumulative FFS Matrix Score', weight: 'Functional Fitness', value: '86.5 / 100 [CHAMPION TIER]', statusTag: 'CHAMPION' },
        ],
        clinicalInference: {
          title: '21-Day Grand Olympus Synthesis [AHA]',
          text: 'Flawless kinematic and cardiovascular harmony achieved across all 3 functional axes. Peak performance index verified with minimum biological wear.',
        },
      },
    ],
  },
  {
    id: 'p3-techpro',
    userId: 'TECH_PRO_M',
    name: 'TECH_PRO_M',
    department: 'Engineering',
    masterScore: 76.4,
    status: 'PODIUM',
    statusLabel: '🥈 PODIUM',
    breakdown: { cmas: 78.5, bse: 76.0, ffs: 74.5 },
    matrixTitle: 'GRAND OLYMPUS CHAMPIONSHIP MATRIX',
    tracks: [
      {
        id: 't-beh-p3-2',
        trackNumber: 1,
        name: 'Track 1: Behavioral Track (21-Day Cumulative CMAS)',
        shortName: 'Track 1: Behavioral',
        icon: '🧬',
        weightLabel: '40% Championship Weight',
        overallStatus: 'HIGH CONSISTENCY',
        statusColor: '#10B981',
        subMetrics: [
          { title: '21-Day Step Compliance', weight: '40% Sub-Weight', value: '88.0% (Avg: 8,800 steps/day)', statusTag: 'HIGH' },
          { title: '21-Day Heart Points Adherence', weight: '40% Sub-Weight', value: '82.0% (Avg: 17.5 HP/day)', statusTag: 'STEADY' },
          { title: '21-Day S-DEX Sedentary Mitigation', weight: '20% Sub-Weight', value: '18.0 / 100 [LOW HAZARD]', statusTag: 'LOW RISK' },
        ],
        clinicalInference: {
          title: '21-Day Behavioral Kinematic Continuity [AHA]',
          text: 'Solid behavioral habits maintained across prolonged development sprints.',
        },
      },
      {
        id: 't-phy-p3-2',
        trackNumber: 2,
        name: 'Track 2: Physiological Track (21-Day Biometric Nexus)',
        shortName: 'Track 2: Physiological',
        icon: '💓',
        weightLabel: '30% Championship Weight',
        overallStatus: 'STRONG RECOVERY',
        statusColor: '#10B981',
        subMetrics: [
          { title: '21-Day Peak Power Index (PPI)', weight: '35% Sub-Weight', value: '84.0% [⚡ OPTIMAL]', statusTag: 'STRONG' },
          { title: '21-Day Exertion Efficiency (E3)', weight: '35% Sub-Weight', value: '82.0% [⚡ PRIME]', statusTag: 'PRIME' },
          { title: '21-Day Intra-Day Stability (IS)', weight: '30% Sub-Weight', value: '80.0% [⚡ STABLE]', statusTag: 'STABLE' },
        ],
        clinicalInference: {
          title: '21-Day Autonomic Homeostasis Synthesis [AHA]',
          text: 'High recovery ceiling with minimal metabolic strain.',
        },
      },
      {
        id: 't-str-p3-2',
        trackNumber: 3,
        name: 'Track 3: Structural Track (Grand Olympus Kinematics)',
        shortName: 'Track 3: Structural',
        icon: '🦴',
        weightLabel: '30% Championship Weight',
        overallStatus: 'PODIUM TIER',
        statusColor: '#94A3B8',
        subMetrics: [
          { title: '4-Axis Kinematic Distribution', weight: 'Cardio, Muscle, Spine, Neuro', value: 'Cardio: 80% | Muscle: 75% | Spine: 78% | Neuro: 72%', statusTag: 'BALANCED' },
          { title: '21-Day Compliance Rate', weight: 'Gauntlet Threshold', value: '86.5% [🥈 PODIUM TIER]', statusTag: 'PODIUM' },
          { title: 'Cumulative FFS Matrix Score', weight: 'Functional Fitness', value: '74.5 / 100 [HIGH RESILIENCE]', statusTag: 'RESILIENT' },
        ],
        clinicalInference: {
          title: '21-Day Grand Olympus Synthesis [AHA]',
          text: 'High postural resilience and sustained endurance throughout the 21-day gauntlet.',
        },
      },
    ],
  },
  {
    id: 'p3-runner',
    userId: 'RUNNER_A_25M',
    name: 'RUNNER_A_25M',
    department: 'Product Design',
    masterScore: 30.0,
    scoreDisplay: '[ 30.0 ]',
    status: 'IN DANGER',
    isDanger: true,
    breakdown: { cmas: 29.3, bse: 43.5, ffs: 4.2 },
    matrixTitle: 'GRAND OLYMPUS CHAMPIONSHIP MATRIX',
    tracks: [
      {
        id: 't-beh-p3-3',
        trackNumber: 1,
        name: 'Track 1: Behavioral Track (21-Day Cumulative CMAS)',
        shortName: 'Track 1: Behavioral',
        icon: '🧬',
        weightLabel: '40% Championship Weight',
        overallStatus: 'CRITICAL DEFICIT',
        statusColor: '#EF4444',
        subMetrics: [
          { title: '21-Day Step Compliance', weight: '40% Sub-Weight', value: '32.0% (Avg: 3,200 steps/day)', statusTag: 'DEFICIT', isDanger: true },
          { title: '21-Day Heart Points Adherence', weight: '40% Sub-Weight', value: '0.0% (Avg: 0.0 HP/day)', statusTag: 'ZERO CARDIO', isDanger: true },
          { title: '21-Day S-DEX Sedentary Mitigation', weight: '20% Sub-Weight', value: '100.0 / 100 [MAX HAZARD]', statusTag: 'MAX HAZARD', isDanger: true },
        ],
        clinicalInference: {
          title: '21-Day Behavioral Kinematic Continuity [AHA]',
          text: 'Prolonged sitting without cardiovascular reset elevates musculoskeletal degradation.',
        },
      },
      {
        id: 't-phy-p3-3',
        trackNumber: 2,
        name: 'Track 2: Physiological Track (21-Day Biometric Nexus)',
        shortName: 'Track 2: Physiological',
        icon: '💓',
        weightLabel: '30% Championship Weight',
        overallStatus: 'AUTONOMIC BURNOUT',
        statusColor: '#EF4444',
        subMetrics: [
          { title: '21-Day Peak Power Index (PPI)', weight: '35% Sub-Weight', value: '38.0% [🚨 CRITICAL]', statusTag: 'CRITICAL', isDanger: true },
          { title: '21-Day Exertion Efficiency (E3)', weight: '35% Sub-Weight', value: '60.0% [⚠️ SLACKING]', statusTag: 'LOW', isDanger: true },
          { title: '21-Day Intra-Day Stability (IS)', weight: '30% Sub-Weight', value: '40.0% [🚨 DRIFTING]', statusTag: 'DRIFTING', isDanger: true },
        ],
        clinicalInference: {
          title: '21-Day Autonomic Homeostasis Synthesis [AHA]',
          text: 'Severe autonomic exhaustion with frequent sympathetic overloads.',
        },
      },
      {
        id: 't-str-p3-3',
        trackNumber: 3,
        name: 'Track 3: Structural Track (Grand Olympus Kinematics)',
        shortName: 'Track 3: Structural',
        icon: '🦴',
        weightLabel: '30% Championship Weight',
        overallStatus: 'CRITICAL ATROPHY',
        statusColor: '#EF4444',
        subMetrics: [
          { title: '4-Axis Kinematic Distribution', weight: 'Cardio, Muscle, Spine, Neuro', value: 'Cardio: 0% | Muscle: 22.2% | Spine: 0% | Neuro: 0%', statusTag: 'ATROPHY RISK', isDanger: true },
          { title: '21-Day Compliance Rate', weight: 'Gauntlet Threshold', value: '46.8% [🚨 CRITICAL DEFICIT]', statusTag: 'DEFICIT', isDanger: true },
          { title: 'Cumulative FFS Matrix Score', weight: 'Functional Fitness', value: '4.2 / 100 [🚨 CRITICAL DEFICIT]', statusTag: 'FAIL THRESHOLD', isDanger: true },
        ],
        clinicalInference: {
          title: 'Anthropometric Structural Integrity Inference [AHA]',
          text: 'Extreme structural deconditioning with prolonged postural collapse observed. Failed 21-day kinematic adaptation threshold. Ergonomic rehabilitation mandated.',
        },
      },
    ],
  },
];

// Gold Particle Animation for Rank Up Modal
const GoldParticle: React.FC<{ delay: number }> = ({ delay }) => {
  const scale = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const angle = Math.random() * 2 * Math.PI;
    const distance = 30 + Math.random() * 90;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;

    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.4 + Math.random() * 0.8,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: destX,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: destY,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, scale, translateX, translateY, opacity]);

  return (
    <Animated.View
      style={[
        styles.goldParticle,
        {
          transform: [{ translateX }, { translateY }, { scale }],
          opacity,
        },
      ]}
    />
  );
};

const parseSubMetric = (sm: TrackSubMetric) => {
  if (sm.percentageScore !== undefined && sm.avgScore !== undefined) {
    return { percentage: sm.percentageScore, avg: sm.avgScore };
  }
  const val = (sm.value || '').trim();

  // Pattern 1: "89.0% (Avg: 8,900 / 10,000 steps)" or "82.0% (Avg: 17.5 / 21.4 HP)" or "96.0% (Avg: 9,600 steps/day)"
  const parenMatch = val.match(/^(.*?)\s*\((.*?)\)$/);
  if (parenMatch) {
    const rawAvg = parenMatch[2].trim();
    return {
      percentage: parenMatch[1].trim(),
      avg: rawAvg.toLowerCase().startsWith('avg') ? rawAvg : `Avg: ${rawAvg}`,
    };
  }

  // Pattern 2: "21.0 / 100 [LOW HAZARD]" or "100.0 / 100 [MAX HAZARD]" or "18.0 / 100 [LOW HAZARD]"
  const hazardMatch = val.match(/^(.*?)\s*(\[.*?\])$/);
  if (hazardMatch) {
    return {
      percentage: hazardMatch[1].trim(),
      avg: hazardMatch[2].trim(),
    };
  }

  // Pattern 3: "88.0% [⚡ OPTIMAL]" or "98.4% [🥇 ELITE ASCENSION]"
  const bracketMatch = val.match(/^(.*?)\s*\[(.*?)\]$/);
  if (bracketMatch) {
    return {
      percentage: bracketMatch[1].trim(),
      avg: `[${bracketMatch[2].trim()}]`,
    };
  }

  // Pattern 4: "Cardio: 94% | Muscle: 88.5% | Spine: 91% | Neuro: 85%"
  if (val.includes('|')) {
    return {
      percentage: '',
      avg: val,
    };
  }

  return {
    percentage: val,
    avg: '',
  };
};

export const LeaderboardScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const drawer = useContext(DrawerContext);
  const isDrawerOpen = drawer?.isOpen || false;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Day & Phase Selection State
  const [selectedDay, setSelectedDay] = useState<number>(3); // Default Day 3 (Phase 1)
  const activePhase: TournamentPhase = selectedDay <= 7 ? 1 : selectedDay <= 14 ? 2 : 3;
  const activePhaseConfig = PHASE_CONFIGS[activePhase];

  // Dropdown Open State
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Search Filter State
  const [searchQuery, setSearchQuery] = useState('');

  // Rank-up and celebration states
  const [rankUpVisible, setRankUpVisible] = useState(false);
  const [rankUpData, setRankUpData] = useState({
    oldRank: 4,
    newRank: 2,
    aheadOfName: 'RUNNER_A_25M',
    nextRankTargetText: '🔥 Keep pushing to beat ALIGNED_B65F (Rank #1)!',
  });
  const [celebrationVisible, setCelebrationVisible] = useState(false);

  // User Profile & Activity Data
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Close dropdown when drawer opens to prevent overlapping
  useEffect(() => {
    if (isDrawerOpen) {
      setDropdownOpen(false);
    }
  }, [isDrawerOpen]);

  // Load user data
  const loadData = async () => {
    try {
      const profileData = await apiService.getProfile();
      setUserProfile(profileData);
    } catch (error) {
      console.error('Failed to load user profile in leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // Generate Current User's dynamic tracks based on active phase
  const getUserTracksForPhase = (phase: TournamentPhase): PhaseTrack[] => {
    // Track 1: Behavioral Track (Present in Phase 1, Phase 2, Phase 3)
    const behavioralTrack: PhaseTrack = {
      id: `u-beh-p${phase}`,
      trackNumber: 1,
      name: phase === 1 ? 'Track 1: Behavioral Track (Foundation)' : 'Track 1: Behavioral Track (Cumulative CMAS)',
      shortName: 'Track 1: Behavioral',
      icon: '🧬',
      weightLabel: phase === 1 ? '100% Phase 1 Master Key' : phase === 2 ? '50% Compound Weight' : '40% Championship Weight',
      overallStatus: 'OPTIMAL PACE',
      statusColor: '#10B981',
      subMetrics: [
        { title: 'Step Volume Allocation', weight: '40% Weight', value: '89.0% (Avg: 8,900 / 10,000 steps)', statusTag: 'OPTIMAL' },
        { title: 'Heart Points Allocation', weight: '40% Weight', value: '82.0% (Avg: 17.5 / 21.4 HP)', statusTag: 'AEROBIC PEAK' },
        { title: 'Sedentary S-DEX Score', weight: '20% Weight', value: '21.0 / 100 [LOW HAZARD]', statusTag: 'LOW RISK' },
      ],
      clinicalInference: {
        title: '3-Day Cumulative Behavioral Health Inference [AHA]',
        text: 'User demonstrates high adherence to baseline volume metrics. Micro-breaks taken during sustained work hours effectively mitigated vascular pooling risks.',
      },
    };

    // Track 2: Physiological Track (Present in Phase 2 & Phase 3)
    const physiologicalTrack: PhaseTrack = {
      id: `u-phy-p${phase}`,
      trackNumber: 2,
      name: 'Track 2: Physiological Track (Elite Biometric Nexus)',
      shortName: 'Track 2: Physiological',
      icon: '💓',
      weightLabel: phase === 2 ? '50% Compound Weight' : '30% Championship Weight',
      overallStatus: 'PRIME RECOVERY',
      statusColor: '#10B981',
      subMetrics: [
        { title: 'Peak Power Index (PPI)', weight: '35% Weight', value: '81.5% [⚡ PRIME]', statusTag: 'OPTIMAL' },
        { title: 'Exertion Efficiency Ratio (E3)', weight: '35% Weight', value: '79.0% [⚡ PRIME]', statusTag: 'PRIME' },
        { title: 'Intra-Day Stability (IS)', weight: '30% Weight', value: '78.5% [⚡ STABLE]', statusTag: 'HOMEOSTATIC' },
      ],
      clinicalInference: {
        title: 'Multi-Week Physiological Recovery Inference [AHA]',
        text: 'Superior metabolic flexibility observed. Post-exertion recovery latency under 18 minutes indicates elite cardiovascular buffering.',
      },
    };

    // Track 3: Structural Track (Present in Phase 3 only)
    const structuralTrack: PhaseTrack = {
      id: `u-str-p${phase}`,
      trackNumber: 3,
      name: 'Track 3: Structural Track (Grand Olympus Kinematics)',
      shortName: 'Track 3: Structural',
      icon: '🦴',
      weightLabel: '30% Championship Weight',
      overallStatus: 'HIGH RESILIENCE',
      statusColor: '#38BDF8',
      subMetrics: [
        { title: '4-Axis Kinematic Distribution', weight: 'Cardio, Muscle, Spine, Neuro', value: 'Cardio: 78% | Muscle: 74% | Spine: 76% | Neuro: 70%', statusTag: 'BALANCED' },
        { title: '21-Day Compliance Rate', weight: 'Gauntlet Threshold', value: '84.0% [🥈 PODIUM TIER]', statusTag: 'PODIUM' },
        { title: 'Cumulative FFS Matrix Score', weight: 'Functional Fitness', value: '74.0 / 100 [HIGH RESILIENCE]', statusTag: 'RESILIENT' },
      ],
      clinicalInference: {
        title: '21-Day Grand Olympus Synthesis [AHA]',
        text: 'Balanced neuromuscular integration across core stabilizing chains with high kinematic resilience.',
      },
    };

    if (phase === 1) {
      return [behavioralTrack]; // 1 Track in Phase 1
    } else if (phase === 2) {
      return [behavioralTrack, physiologicalTrack]; // 2 Tracks in Phase 2
    } else {
      return [behavioralTrack, physiologicalTrack, structuralTrack]; // 3 Tracks in Phase 3
    }
  };

  // Get players list for current active phase
  const getPhasePlayers = (): PhasePlayer[] => {
    let baseList: PhasePlayer[] = [];
    if (activePhase === 1) {
      baseList = [...PHASE_1_PLAYERS];
    } else if (activePhase === 2) {
      baseList = [...PHASE_2_PLAYERS];
    } else {
      baseList = [...PHASE_3_PLAYERS];
    }

    const userName = userProfile?.name || 'You';
    const isUserAlreadyInList = baseList.some(p => p.isCurrentUser || p.userId === 'current-user');

    if (!isUserAlreadyInList) {
      let userScore = 73.2;
      let userStatus: 'ACTIVE' | 'CHAMPION' | 'PODIUM' | 'IN DANGER' = 'ACTIVE';
      if (activePhase === 1) {
        userScore = 73.2;
      } else if (activePhase === 2) {
        userScore = 77.8;
      } else {
        userScore = 74.0;
        userStatus = 'PODIUM';
      }

      const currentUserPlayer: PhasePlayer = {
        id: 'current-user-player',
        userId: `${userName.replace(/\s+/g, '_').toUpperCase()}`,
        name: `${userName} (You)`,
        department: 'Engineering',
        isCurrentUser: true,
        masterScore: userScore,
        status: userStatus,
        breakdown:
          activePhase === 2
            ? { cmas: 76.5, bse: 79.1 }
            : activePhase === 3
            ? { cmas: 76.0, bse: 75.0, ffs: 71.0 }
            : undefined,
        matrixTitle:
          activePhase === 1
            ? 'BEHAVIORAL FOUNDATION MATRIX'
            : activePhase === 2
            ? 'BIOMETRIC NEXUS MATRIX'
            : 'GRAND OLYMPUS CHAMPIONSHIP MATRIX',
        tracks: getUserTracksForPhase(activePhase),
      };

      baseList.push(currentUserPlayer);
    }

    // Sort descending by master score
    baseList.sort((a, b) => b.masterScore - a.masterScore);

    return baseList;
  };

  const playersList = getPhasePlayers();

  // Filter players by Search Query
  const filteredPlayers = playersList.filter(player => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      player.userId.toLowerCase().includes(query) ||
      player.name.toLowerCase().includes(query) ||
      player.department.toLowerCase().includes(query)
    );
  });

  // Open Dedicated Details Screen for Current User
  const handleOpenPlayerDetails = (player: PhasePlayer) => {
    if (!player.isCurrentUser) return;
    navigation.navigate(ROUTES.LEADERBOARD_DETAILS, {
      player,
      phase: activePhase,
      day: selectedDay,
    });
  };

  const handleSimulateRankUp = () => {
    if (activePhase === 3) {
      setCelebrationVisible(true);
    } else {
      setRankUpData({
        oldRank: 3,
        newRank: 2,
        aheadOfName: 'RUNNER_A_25M',
        nextRankTargetText: '🔥 You need only +3.2 points to beat ALIGNED_B65F (Rank #1)!',
      });
      setRankUpVisible(true);
    }
  };

  const themeColors = {
    containerBg: '#0B0F19',
    headerBg: '#0E1626',
    headerText: '#FFFFFF',
    headerBorder: '#1E293B',
    headerButtonBg: '#1E293B',
    headerButtonBorder: '#1E293B',
    headerButtonText: '#FFFFFF',
    textMain: '#FFFFFF',
    textSecondary: '#94A3B8',
    cardBg: '#151E33',
    cardBorder: '#1E293B',
    statBoxBg: '#0E1626',
    dropdownBg: '#151E33',
    dropdownBorder: '#1E293B',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.containerBg }]}>
      {/* Top Header */}
      <CustomHeader
        title="Leaderboard"
        showDrawerButton
        containerStyle={{
          backgroundColor: themeColors.headerBg,
          borderBottomColor: themeColors.headerBorder,
        }}
        titleStyle={{
          color: themeColors.headerText,
        }}
        buttonStyle={{
          backgroundColor: themeColors.headerButtonBg,
          borderColor: themeColors.headerButtonBorder,
        }}
        iconStyle={{
          color: themeColors.headerButtonText,
        }}
      />

      {/* Grouped Day / Phase Selector Dropdown */}
      <View style={[styles.dropdownWrapper, { zIndex: dropdownOpen ? 2000 : 1 }]}>
        <TouchableOpacity
          style={[
            styles.dropdownButton,
            {
              backgroundColor: themeColors.dropdownBg,
              borderColor: themeColors.dropdownBorder,
            },
          ]}
          onPress={() => setDropdownOpen(!dropdownOpen)}
          activeOpacity={0.9}
        >
          <View style={styles.dropdownSelectedRow}>
            <Text style={styles.dropdownPhaseBadge}>
              Phase {activePhaseConfig.phaseNumber}
            </Text>
            <Text style={[styles.dropdownButtonText, { color: themeColors.textMain }]}>
              Day {selectedDay} / 21 • {activePhaseConfig.focus}
            </Text>
          </View>
          <Text style={[styles.dropdownArrow, { color: themeColors.textSecondary }]}>
            {dropdownOpen ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>

        {dropdownOpen && (
          <View
            style={[
              styles.dropdownMenu,
              {
                backgroundColor: themeColors.dropdownBg,
                borderColor: themeColors.dropdownBorder,
              },
            ]}
          >
            <ScrollView style={styles.dropdownScrollView} showsVerticalScrollIndicator={true}>
              {/* Phase 1 Group */}
              <View style={styles.phaseGroupContainer}>
                <View style={styles.phaseGroupHeader}>
                  <Text style={styles.phaseGroupIcon}>🌱</Text>
                  <View style={styles.phaseGroupHeaderTexts}>
                    <Text style={styles.phaseGroupTitle}>Phase 1: Days 1–7</Text>
                    <Text style={styles.phaseGroupSubtitle}>
                      Behavioral Foundation • Track: Behavioral
                    </Text>
                  </View>
                </View>
                <View style={styles.daysGrid}>
                  {TOURNAMENT_DAYS.filter(d => d.phase === 1).map(dayObj => {
                    const isSelected = selectedDay === dayObj.dayNumber;
                    return (
                      <TouchableOpacity
                        key={dayObj.dayNumber}
                        style={[
                          styles.dayPill,
                          isSelected && styles.dayPillActive,
                        ]}
                        onPress={() => {
                          setSelectedDay(dayObj.dayNumber);
                          setDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dayPillText,
                            isSelected && styles.dayPillTextActive,
                          ]}
                        >
                          Day {dayObj.dayNumber}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.phaseDivider} />

              {/* Phase 2 Group */}
              <View style={styles.phaseGroupContainer}>
                <View style={styles.phaseGroupHeader}>
                  <Text style={styles.phaseGroupIcon}>⚡</Text>
                  <View style={styles.phaseGroupHeaderTexts}>
                    <Text style={styles.phaseGroupTitle}>Phase 2: Days 8–14</Text>
                    <Text style={styles.phaseGroupSubtitle}>
                      Elite Biometric Nexus • Tracks: Behavioral + Physiological
                    </Text>
                  </View>
                </View>
                <View style={styles.daysGrid}>
                  {TOURNAMENT_DAYS.filter(d => d.phase === 2).map(dayObj => {
                    const isSelected = selectedDay === dayObj.dayNumber;
                    return (
                      <TouchableOpacity
                        key={dayObj.dayNumber}
                        style={[
                          styles.dayPill,
                          isSelected && styles.dayPillActive,
                        ]}
                        onPress={() => {
                          setSelectedDay(dayObj.dayNumber);
                          setDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dayPillText,
                            isSelected && styles.dayPillTextActive,
                          ]}
                        >
                          Day {dayObj.dayNumber}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.phaseDivider} />

              {/* Phase 3 Group */}
              <View style={styles.phaseGroupContainer}>
                <View style={styles.phaseGroupHeader}>
                  <Text style={styles.phaseGroupIcon}>👑</Text>
                  <View style={styles.phaseGroupHeaderTexts}>
                    <Text style={styles.phaseGroupTitle}>Phase 3: Days 15–21</Text>
                    <Text style={styles.phaseGroupSubtitle}>
                      The Grand Olympus • Tracks: Behavioral + Physiological + Structural
                    </Text>
                  </View>
                </View>
                <View style={styles.daysGrid}>
                  {TOURNAMENT_DAYS.filter(d => d.phase === 3).map(dayObj => {
                    const isSelected = selectedDay === dayObj.dayNumber;
                    return (
                      <TouchableOpacity
                        key={dayObj.dayNumber}
                        style={[
                          styles.dayPill,
                          isSelected && styles.dayPillActive,
                          isSelected && styles.dayPillActiveGold,
                        ]}
                        onPress={() => {
                          setSelectedDay(dayObj.dayNumber);
                          setDropdownOpen(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.dayPillText,
                            isSelected && styles.dayPillTextActive,
                          ]}
                        >
                          Day {dayObj.dayNumber}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#FFFFFF"
            colors={['#3B82F6']}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Card with 2 Stat Boxes */}
        <View
          style={[
            styles.bannerCard,
            {
              backgroundColor: themeColors.cardBg,
              borderColor: themeColors.cardBorder,
            },
          ]}
        >
          <Image
            source={IMAGES.trialRunner}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.statsRow}>
            {/* Box 1: Active members count */}
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: themeColors.statBoxBg,
                  borderColor: themeColors.cardBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.statIconCircle,
                  { backgroundColor: 'rgba(20, 184, 166, 0.15)' },
                ]}
              >
                <ActiveCrewSvg color="#14B8A6" />
              </View>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                Active Crew
              </Text>
              <Text style={[styles.statLabelSub, { color: themeColors.textSecondary }]}>
                Participants
              </Text>
              <Text style={[styles.statValue, { color: themeColors.textMain }]}>
                {activePhaseConfig.participantsCount}
              </Text>
            </View>

            {/* Box 2: Master Benchmark Metric */}
            <View
              style={[
                styles.statBox,
                {
                  backgroundColor: themeColors.statBoxBg,
                  borderColor: themeColors.cardBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.statIconCircle,
                  {
                    backgroundColor:
                      activePhase === 1
                        ? 'rgba(59, 130, 246, 0.15)'
                        : activePhase === 2
                        ? 'rgba(168, 85, 247, 0.15)'
                        : 'rgba(234, 179, 8, 0.15)',
                  },
                ]}
              >
                <BenchmarkSvg
                  color={
                    activePhase === 1
                      ? '#3B82F6'
                      : activePhase === 2
                      ? '#A855F7'
                      : '#EAB308'
                  }
                />
              </View>
              <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                {activePhaseConfig.benchmarkUnit.split(' ')[0]}
              </Text>
              <Text style={[styles.statLabelSub, { color: themeColors.textSecondary }]}>
                {activePhaseConfig.benchmarkUnit.split(' ').slice(1).join(' ') || 'Score'}
              </Text>
              <Text style={[styles.statValue, { color: themeColors.textMain }]}>
                {activePhaseConfig.avgBenchmarkScore}
              </Text>
            </View>
          </View>
        </View>

        {/* Tournament Phase Title Card */}
        <View style={styles.phaseHeaderCard}>
          <View style={styles.phaseHeaderTopRow}>
            <View style={styles.phasePill}>
              <Text style={styles.phasePillText}>PHASE {activePhaseConfig.phaseNumber}</Text>
            </View>
            <Text style={styles.phaseActiveDayText}>
              Active Day: {selectedDay}/{activePhase === 1 ? 7 : 21}
            </Text>
          </View>
          <Text style={styles.phaseFocusTitle}>{activePhaseConfig.title}</Text>
          <Text style={styles.phaseFormulaText}>{activePhaseConfig.formulaLabel}</Text>
        </View>

        {/* Real-time Search Input Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search participant ID or department..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Section Table Header (Layer 1 Header) */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.tableColHeader, { width: 44 }]}>RANK</Text>
          <Text style={[styles.tableColHeader, { flex: 1, paddingLeft: 4 }]} numberOfLines={1}>
            PARTICIPANT
          </Text>
          <Text
            style={[styles.tableColHeader, { width: 95, textAlign: 'right', marginRight: 10 }]}
            numberOfLines={1}
          >
            {activePhase === 1 ? 'CMAS / 100' : activePhase === 2 ? 'COMPOUND' : 'CHAMPIONSHIP'}
          </Text>
          <Text style={[styles.tableColHeader, { width: 80, textAlign: 'right' }]}>STATUS</Text>
        </View>

        {/* Leaderboard Rows with Progressive Disclosure */}
        {filteredPlayers.map((player, index) => {
          const rankNumber = index + 1;
          const isUser = !!player.isCurrentUser;
          const isDanger = !!player.isDanger || player.status === 'IN DANGER';

          // Check if we need to render the Axe Line after this row
          const isAxeLineAfterThisRow = rankNumber === activePhaseConfig.axeLineCutRank;

          return (
            <React.Fragment key={player.id}>
              {/* Layer 1: Viewport Grid Row */}
              <TouchableOpacity
                style={[
                  styles.playerRowCard,
                  isUser && styles.userRowHighlight,
                  isDanger && styles.dangerRowHighlight,
                ]}
                onPress={() => handleOpenPlayerDetails(player)}
                activeOpacity={isUser ? 0.75 : 1}
                disabled={!isUser}
              >
                <View style={styles.rowMain}>
                  {/* Rank Badge */}
                  <View
                    style={[
                      styles.rankBadge,
                      rankNumber === 1 && styles.rankBadgeFirst,
                      rankNumber === 2 && styles.rankBadgeSecond,
                      rankNumber === 3 && styles.rankBadgeThird,
                      isDanger && styles.rankBadgeDanger,
                    ]}
                  >
                    <Text
                      style={[
                        styles.rankBadgeText,
                        rankNumber === 1 && styles.rankTextFirst,
                        isDanger && styles.rankTextDanger,
                      ]}
                    >
                      {rankNumber === 1 ? '🥇' : rankNumber === 2 ? '🥈' : rankNumber === 3 ? '🥉' : `#${rankNumber}`}
                    </Text>
                  </View>

                  {/* User ID & Department */}
                  <View style={styles.userCol}>
                    <View style={styles.userIdRow}>
                      <Text
                        style={[
                          styles.userIdText,
                          isUser && styles.userIdUserText,
                          isDanger && styles.userIdDangerText,
                        ]}
                        numberOfLines={1}
                      >
                        {player.userId}
                      </Text>
                      {isUser && (
                        <View style={styles.youBadge}>
                          <Text style={styles.youBadgeText}>YOU</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.deptText} numberOfLines={1}>
                      {player.department}
                    </Text>
                  </View>

                  {/* Master Score */}
                  <View style={styles.scoreCol}>
                    {isDanger ? (
                      <View style={styles.dangerScoreBlock}>
                        <Text style={styles.dangerScoreText}>
                          {player.scoreDisplay || `[ ${player.masterScore.toFixed(1)} ]`}
                        </Text>
                      </View>
                    ) : (
                      <Text
                        style={[
                          styles.masterScoreText,
                          rankNumber === 1 && styles.masterScoreFirst,
                        ]}
                      >
                        {player.masterScore.toFixed(1)}
                      </Text>
                    )}
                  </View>

                  {/* Status Pill */}
                  <View style={styles.statusCol}>
                    <View
                      style={[
                        styles.statusPill,
                        player.status === 'ACTIVE' && styles.statusPillActive,
                        player.status === 'CHAMPION' && styles.statusPillChampion,
                        player.status === 'PODIUM' && styles.statusPillPodium,
                        isDanger && styles.statusPillDanger,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusPillText,
                          player.status === 'ACTIVE' && styles.statusTextActive,
                          player.status === 'CHAMPION' && styles.statusTextChampion,
                          player.status === 'PODIUM' && styles.statusTextPodium,
                          isDanger && styles.statusTextDanger,
                        ]}
                      >
                        {player.statusLabel || (isDanger ? '🚨 IN DANGER' : player.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Direct Action Indicator */}
                <View style={styles.expandChevronRow}>
                  {isUser ? (
                    <View style={styles.userExpandPrompt}>
                      <Text style={styles.userExpandChevronText}>
                        📊 Tap to view personalized biometric details ➔
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.lockedRowContainer}>
                      <Text style={styles.lockedRowText}>
                        🔒 Detailed Biometric Matrix Private to Participant
                      </Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>

              {/* High-Stakes Neon Axe Line */}
              {isAxeLineAfterThisRow && (
                <View
                  style={[
                    styles.axeLineContainer,
                    activePhase === 3 && styles.axeLineContainerGold,
                  ]}
                >
                  <View
                    style={[
                      styles.axeLineBar,
                      activePhase === 3 && styles.axeLineBarGold,
                    ]}
                  />
                  <View
                    style={[
                      styles.axeLineBadge,
                      activePhase === 3 && styles.axeLineBadgeGold,
                    ]}
                  >
                    <Text
                      style={[
                        styles.axeLineText,
                        activePhase === 3 && styles.axeLineTextGold,
                      ]}
                    >
                      {activePhaseConfig.axeLineLabel}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.axeLineBar,
                      activePhase === 3 && styles.axeLineBarGold,
                    ]}
                  />
                </View>
              )}
            </React.Fragment>
          );
        })}
      </ScrollView>

      {/* Floating Simulation Trigger Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={handleSimulateRankUp}
        activeOpacity={0.8}
      >
        <Text style={styles.floatingButtonEmoji}>⚡</Text>
        <Text style={styles.floatingButtonText}>Simulate Rank Up</Text>
      </TouchableOpacity>

      {/* Standard Rank Up Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={rankUpVisible}
        onRequestClose={() => setRankUpVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.burstCenter}>
              {Array.from({ length: 12 }).map((_, i) => (
                <GoldParticle key={i} delay={i * 40} />
              ))}
            </View>

            <Text style={styles.trophyIcon}>⚡</Text>
            <Text style={styles.rankUpTitle}>RANK UP SUCCESS!</Text>
            <Text style={styles.rankUpMetric}>Phase {activePhase} Gauntlet</Text>

            <View style={styles.comparisonRow}>
              <View style={styles.rankPill}>
                <Text style={styles.rankPillOld}>Rank #{rankUpData.oldRank}</Text>
              </View>
              <Text style={styles.comparisonArrow}>➔</Text>
              <View style={[styles.rankPill, styles.rankPillNew]}>
                <Text style={styles.rankPillNewText}>Rank #{rankUpData.newRank}</Text>
              </View>
            </View>

            <Text style={styles.rankUpMessage}>
              Awesome effort! You pushed ahead of{' '}
              <Text style={styles.boldWhiteText}>{rankUpData.aheadOfName}</Text> to claim Rank #
              {rankUpData.newRank}. Keep your movement momentum!
            </Text>

            {!!rankUpData.nextRankTargetText && (
              <View style={styles.modalMotivateContainer}>
                <Text style={styles.modalMotivateText}>
                  {rankUpData.nextRankTargetText}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setRankUpVisible(false)}
            >
              <Text style={styles.modalButtonText}>Awesome! ⚡</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Rank #1 / Phase 3 Celebration Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={celebrationVisible}
        onRequestClose={() => setCelebrationVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, styles.celebrationCard]}>
            <View style={styles.burstCenter}>
              {Array.from({ length: 30 }).map((_, i) => (
                <GoldParticle key={i} delay={i * 20} />
              ))}
            </View>

            <Text style={styles.crownIcon}>👑 🏆</Text>
            <Text style={styles.celebrationTitle}>GRAND OLYMPUS CHAMPION!</Text>
            <Text style={styles.celebrationSubtitle}>PODIUM ASCENSION ACHIEVED</Text>

            <Text style={styles.celebrationMessage}>
              Incredible performance across all 21 days! Your balanced adherence to CMAS, BSE, and
              Functional Fitness Score puts you at the summit of the crew! 🚀
            </Text>

            <TouchableOpacity
              style={[styles.modalButton, styles.celebrationButton]}
              onPress={() => setCelebrationVisible(false)}
            >
              <Text style={styles.celebrationButtonText}>Claim Champion Title! 👑</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  dropdownWrapper: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  dropdownButton: {
    height: 52,
    backgroundColor: '#151E33',
    borderColor: '#1E293B',
    borderWidth: 1,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  dropdownSelectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  dropdownPhaseBadge: {
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  dropdownButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 6,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    maxHeight: 380,
    backgroundColor: '#151E33',
    borderColor: '#1E293B',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  dropdownScrollView: {
    padding: 12,
  },
  phaseGroupContainer: {
    marginVertical: 4,
  },
  phaseGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  phaseGroupIcon: {
    fontSize: 18,
  },
  phaseGroupHeaderTexts: {
    flex: 1,
  },
  phaseGroupTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  phaseGroupSubtitle: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginLeft: 26,
  },
  dayPill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#0E1626',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  dayPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  dayPillActiveGold: {
    backgroundColor: '#D97706',
    borderColor: '#F59E0B',
  },
  dayPillText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  dayPillTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  phaseDivider: {
    height: 1,
    backgroundColor: '#1E293B',
    marginVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 60,
  },
  bannerCard: {
    backgroundColor: '#151E33',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    marginBottom: 16,
  },
  bannerImage: {
    width: '100%',
    height: 140,
  },
  statsRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0E1626',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statLabelSub: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: -2,
  },
  statValue: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 4,
  },
  phaseHeaderCard: {
    backgroundColor: '#151F38',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A3C63',
    borderLeftWidth: 4,
    borderLeftColor: '#38BDF8',
    marginBottom: 14,
  },
  phaseHeaderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  phasePill: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  phasePillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#38BDF8',
  },
  phaseActiveDayText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  phaseFocusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  phaseFormulaText: {
    fontSize: 11,
    color: '#FBBF24',
    marginTop: 3,
    fontWeight: '500',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151E33',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 14,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  searchClear: {
    fontSize: 14,
    color: '#94A3B8',
    padding: 4,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginBottom: 6,
  },
  tableColHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  playerRowCard: {
    backgroundColor: '#151E33',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
    overflow: 'hidden',
  },
  userRowHighlight: {
    borderColor: '#14B8A6',
    borderWidth: 1.5,
    backgroundColor: 'rgba(20, 184, 166, 0.05)',
  },
  dangerRowHighlight: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  expandedRowBorder: {
    borderColor: '#38BDF8',
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  rankBadgeFirst: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
  },
  rankBadgeSecond: {
    backgroundColor: 'rgba(148, 163, 184, 0.2)',
  },
  rankBadgeThird: {
    backgroundColor: 'rgba(180, 83, 9, 0.2)',
  },
  rankBadgeDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  rankBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rankTextFirst: {
    color: '#FACC15',
  },
  rankTextDanger: {
    color: '#EF4444',
  },
  userCol: {
    flex: 1,
  },
  userIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userIdText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userIdUserText: {
    color: '#14B8A6',
  },
  userIdDangerText: {
    color: '#FCA5A5',
  },
  youBadge: {
    backgroundColor: '#14B8A6',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  youBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#090D16',
  },
  deptText: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  scoreCol: {
    width: 80,
    alignItems: 'flex-end',
    marginRight: 8,
  },
  masterScoreText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#34D399',
  },
  masterScoreFirst: {
    color: '#FACC15',
  },
  dangerScoreBlock: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  dangerScoreText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  statusCol: {
    width: 85,
    alignItems: 'flex-end',
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  statusPillActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusPillChampion: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
  },
  statusPillPodium: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  statusPillDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 0.5,
    borderColor: '#EF4444',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8',
  },
  statusTextActive: {
    color: '#34D399',
  },
  statusTextChampion: {
    color: '#FACC15',
  },
  statusTextPodium: {
    color: '#38BDF8',
  },
  statusTextDanger: {
    color: '#EF4444',
  },
  expandChevronRow: {
    alignItems: 'center',
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  userExpandPrompt: {
    backgroundColor: 'rgba(20, 184, 166, 0.12)',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(20, 184, 166, 0.3)',
    width: '100%',
    alignItems: 'center',
  },
  userExpandChevronText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#14B8A6',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  lockedRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },
  lockedRowText: {
    fontSize: 9,
    color: '#64748B',
    fontStyle: 'italic',
  },
  drawerContainer: {
    backgroundColor: '#0E1626',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    padding: 12,
  },
  drawerMatrixTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#38BDF8',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  breakdownBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  breakdownChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151E33',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 4,
  },
  breakdownChipLabel: {
    fontSize: 10,
    color: '#94A3B8',
  },
  breakdownChipVal: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  tracksTabBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  trackTabBtn: {
    flex: 1,
    backgroundColor: '#151E33',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackTabBtnSelected: {
    backgroundColor: '#1E293B',
    borderColor: '#38BDF8',
    borderWidth: 1.5,
  },
  trackTabBtnDanger: {
    borderColor: '#EF4444',
  },
  trackTabBtnText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
  },
  trackTabBtnTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  layer3SubTray: {
    backgroundColor: '#151E33',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  layer3SubTrayDanger: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
    backgroundColor: '#1C1521',
  },
  trackHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  trackNameCol: {
    flex: 1,
    marginRight: 8,
  },
  trackNameTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  trackWeightText: {
    fontSize: 9,
    color: '#FBBF24',
    marginTop: 1,
  },
  trackStatusTag: {
    backgroundColor: '#0E1626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  trackStatusTagDanger: {
    borderColor: '#EF4444',
  },
  trackStatusTagText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  subMetricsContainer: {
    marginTop: 4,
    marginBottom: 8,
    gap: 6,
  },
  subMetricCard: {
    backgroundColor: '#0E1626',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  subMetricTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subMetricTitleCol: {
    flex: 1,
    marginRight: 8,
  },
  subMetricTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subMetricWeight: {
    fontSize: 9.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  subMetricPercentageScore: {
    fontSize: 13,
    fontWeight: '800',
    color: '#34D399',
    textAlign: 'right',
  },
  subMetricCenterRow: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  subMetricAvgScore: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    textAlign: 'center',
  },
  subMetricValueDanger: {
    color: '#EF4444',
  },
  clinicalInferenceCard: {
    marginTop: 6,
    backgroundColor: '#0E1626',
    borderRadius: 8,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  clinicalInferenceCardDanger: {
    borderLeftColor: '#EF4444',
    backgroundColor: '#20121A',
  },
  clinicalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  clinicalIcon: {
    fontSize: 11,
  },
  clinicalTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  clinicalText: {
    fontSize: 10,
    color: '#94A3B8',
    fontStyle: 'italic',
    lineHeight: 14,
  },
  axeLineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  axeLineContainerGold: {
    marginVertical: 12,
  },
  axeLineBar: {
    flex: 1,
    height: 1.5,
    backgroundColor: '#EF4444',
  },
  axeLineBarGold: {
    backgroundColor: '#F59E0B',
  },
  axeLineBadge: {
    backgroundColor: '#2B1115',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginHorizontal: 8,
  },
  axeLineBadgeGold: {
    backgroundColor: '#2E2211',
    borderColor: '#F59E0B',
  },
  axeLineText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#EF4444',
    letterSpacing: 0.5,
  },
  axeLineTextGold: {
    color: '#F59E0B',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 999,
  },
  floatingButtonEmoji: {
    fontSize: 13,
    marginRight: 6,
  },
  floatingButtonText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 16, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: width * 0.85,
    backgroundColor: '#151E33',
    borderColor: '#1E293B',
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    position: 'relative',
  },
  celebrationCard: {
    borderColor: '#FACC15',
    borderWidth: 2,
    shadowColor: '#FACC15',
    shadowOpacity: 0.25,
  },
  burstCenter: {
    position: 'absolute',
    top: '35%',
    left: '50%',
    width: 1,
    height: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldParticle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FACC15',
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  trophyIcon: {
    fontSize: 44,
    marginBottom: 10,
  },
  crownIcon: {
    fontSize: 52,
    marginBottom: 10,
  },
  rankUpTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    letterSpacing: 1,
  },
  celebrationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FACC15',
    letterSpacing: 1,
    textAlign: 'center',
  },
  rankUpMetric: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
    marginBottom: 14,
    textTransform: 'uppercase',
  },
  celebrationSubtitle: {
    fontSize: 11,
    color: '#A7F3D0',
    fontWeight: 'bold',
    marginTop: 4,
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  rankPill: {
    backgroundColor: '#0E1626',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 14,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  rankPillNew: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#3B82F6',
  },
  rankPillOld: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  rankPillNewText: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  comparisonArrow: {
    fontSize: 15,
    color: '#64748B',
  },
  rankUpMessage: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  celebrationMessage: {
    fontSize: 14,
    color: '#E2E8F0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalButton: {
    width: '100%',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  celebrationButton: {
    backgroundColor: '#EAB308',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  celebrationButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#090D16',
  },
  modalMotivateContainer: {
    backgroundColor: '#1E1B4B',
    borderColor: '#3730A3',
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  modalMotivateText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FBBF24',
    textAlign: 'center',
    lineHeight: 15,
  },
  boldWhiteText: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export { LeaderboardDetailsScreen } from './LeaderboardDetailsScreen';
export default LeaderboardScreen;

