import React, { useContext, useEffect, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import DrawerContext from '../../navigation/DrawerContext';
import {
  CmasSatelliteNode,
  HeadToHeadTeam,
  LiveMatchupTab,
  MatchRecordEntry,
  MatchStatComparisonRow,
  TournamentMeta,
  UpcomingFixtureEntry,
} from './types';
import {
  BellNotificationIcon,
  GenderBadgeIcon,
  TeamCrest,
} from './CrestIcons';
import { DailyCmasGauge } from './DailyCmasGauge';
import { styles } from './styles';

const TOURNAMENT_META: TournamentMeta = {
  phaseBanner: 'WEEK 1: OPEN GROUP STAGE QUALIFIERS',
  dayTracker: 'DAY 3 / 7',
  communitySegment: 'Universities/Colleges',
  dayOfTournament: 4,
  stage: 'Open League (Week 1)',
  dateLabel: 'Nov 19, 2026',
  currentTimeLabel: '06:45 PM',
  lastSyncTime: '06:30 PM',
};

const LEFT_TEAM: HeadToHeadTeam = {
  id: 'alpha',
  name: 'TEAM ALPHA',
  crest: 'lion',
  cmasScore: 84.5,
  accentColors: ['#6366F1', '#00E5FF'],
  borderColor: '#38BDF8',
  glowColor: 'rgba(56, 189, 248, 0.22)',
};

const RIGHT_TEAM: HeadToHeadTeam = {
  id: 'beta',
  name: 'TEAM BETA',
  crest: 'wolf',
  cmasScore: 79.1,
  accentColors: ['#10B981', '#22D3EE'],
  borderColor: '#34D399',
  glowColor: 'rgba(52, 211, 153, 0.2)',
};

const DAILY_CMAS_SCORE = 78;

const SATELLITE_NODES: CmasSatelliteNode[] = [
  {
    id: 'steps',
    label: 'Metabolic Steps',
    subLabel: 'Metabolic\nSteps',
    score: 84,
    targetText: '8,420 / 10,000 steps',
    accentColor: '#38BDF8',
    iconType: 'steps',
  },
  {
    id: 'pulse',
    label: 'Cardio Pulse',
    subLabel: 'Cardio\nPulse',
    score: 76,
    targetText: '38 / 50 Heart Pts',
    accentColor: '#4ADE80',
    iconType: 'pulse',
  },
  {
    id: 'run',
    label: 'Active Cadence',
    score: 81,
    targetText: '42 / 50 active mins',
    accentColor: '#22D3EE',
    iconType: 'run',
  },
  {
    id: 'strength',
    label: 'Strength & MHP',
    score: 74,
    targetText: '25 / 34 MHP',
    accentColor: '#A3E635',
    iconType: 'strength',
  },
  {
    id: 'habits',
    label: 'Longevity Habits',
    subLabel: 'Longevity\nHabits',
    score: 79,
    targetText: '4 / 5 daily habits',
    accentColor: '#38BDF8',
    iconType: 'habits',
  },
  {
    id: 'ecg',
    label: 'Zone Rhythm',
    score: 80,
    targetText: 'Steady telemetry sync',
    accentColor: '#2DD4BF',
    iconType: 'ecg',
  },
  {
    id: 'heart',
    label: 'Recovery Vitality',
    score: 75,
    targetText: 'RHR optimal baseline',
    accentColor: '#4ADE80',
    iconType: 'heart',
  },
];

const MATCH_STATS_ROWS: MatchStatComparisonRow[] = [
  {
    id: 'total_players',
    label: 'Total Players',
    leftValue: '25',
    rightValue: '85',
  },
  {
    id: 'female_players',
    label: 'Female Players',
    leftValue: '24',
    rightValue: '39',
  },
  {
    id: 'male_players',
    label: 'Male Players',
    leftValue: '35',
    rightValue: '36',
  },
  {
    id: 'avg_steps',
    label: 'Average Steps Per Player',
    leftValue: '12,450',
    rightValue: '11,870',
    highlighted: true,
  },
  {
    id: 'avg_heart',
    label: 'Average Heart Points Per Player',
    leftValue: '37.5',
    rightValue: '127.5',
    highlighted: true,
  },
  {
    id: 'avg_mhp',
    label: 'Average MHP Per Player',
    leftValue: '25',
    rightValue: '32.9',
    highlighted: true,
  },
  {
    id: 'sdex_penalty',
    label: 'Total S-DEX Penalty Points',
    leftValue: '25',
    rightValue: '29',
    highlighted: true,
  },
];

const RECORD_HISTORY: MatchRecordEntry[] = [
  {
    id: 'rec_1',
    date: 'Nov 16, 2026',
    result: 'WIN',
    leftTeam: 'TEAM ALPHA',
    leftCrest: 'lion',
    leftScore: '84.5%',
    rightTeam: 'TEAM BETA',
    rightCrest: 'wolf',
    rightScore: '79.1%',
  },
  {
    id: 'rec_2',
    date: 'Nov 17, 2026',
    result: 'LOSS',
    leftTeam: 'TEAM ALPHA',
    leftCrest: 'lion',
    leftScore: '71.2%',
    rightTeam: 'TEAM OMEGA',
    rightCrest: 'wolf',
    rightScore: '75.8%',
  },
  {
    id: 'rec_3',
    date: 'Nov 18, 2026',
    result: 'WIN',
    leftTeam: 'TEAM ALPHA',
    leftCrest: 'lion',
    leftScore: '86.1%',
    rightTeam: 'TEAM DELTA',
    rightCrest: 'wolf',
    rightScore: '82.3%',
  },
];

const UPCOMING_FIXTURES: UpcomingFixtureEntry[] = [
  {
    id: 'fix_1',
    dateFull: 'Nov 20, 2026',
    dateShort: 'NOV 20',
    leftTeam: 'TEAM ALPHA',
    leftCrest: 'lion',
    rightTeam: 'TEAM PHOENIX',
    rightCrest: 'phoenix',
    matchBanner: 'MATCH 5: 06:00 AM SWEEP',
    femaleCount: 42,
    maleCount: 58,
  },
  {
    id: 'fix_2',
    dateFull: 'Nov 21, 2026',
    dateShort: 'NOV 21',
    leftTeam: 'TEAM ALPHA',
    leftCrest: 'lion',
    leftScorePlaceholder: '--',
    rightTeam: 'TEAM TITANS',
    rightCrest: 'titan',
    rightScorePlaceholder: '--',
    femaleCount: 39,
    maleCount: 61,
  },
  {
    id: 'fix_3',
    dateFull: 'Nov 22, 2026',
    dateShort: 'NOV 22',
    leftTeam: 'TEAM ALPHA',
    leftCrest: 'lion',
    leftScorePlaceholder: '--',
    rightTeam: 'TEAM KRAKEN',
    rightCrest: 'kraken',
    rightScorePlaceholder: '--',
    femaleCount: 45,
    maleCount: 55,
  },
];

const formatCountdownToSixAmSweep = (): string => {
  const now = new Date();
  const nextSweep = new Date(now);
  nextSweep.setHours(6, 0, 0, 0);
  if (now >= nextSweep) {
    nextSweep.setDate(nextSweep.getDate() + 1);
  }
  const diffSeconds = Math.max(
    0,
    Math.floor((nextSweep.getTime() - now.getTime()) / 1000),
  );
  const hrs = Math.floor(diffSeconds / 3600)
    .toString()
    .padStart(2, '0');
  const mins = Math.floor((diffSeconds % 3600) / 60)
    .toString()
    .padStart(2, '0');
  const secs = (diffSeconds % 60).toString().padStart(2, '0');
  return `${hrs}:${mins}:${secs}`;
};

const TABS: { key: LiveMatchupTab; label: string }[] = [
  { key: 'live', label: 'Live Match' },
  { key: 'stats', label: 'Match Stats' },
  { key: 'record', label: 'Record' },
  { key: 'upcoming', label: 'Upcoming' },
];

export const LiveMatchupScreen: React.FC = () => {
  const drawer = useContext(DrawerContext);
  const [activeTab, setActiveTab] = useState<LiveMatchupTab>('live');
  const [countdown, setCountdown] = useState<string>(
    formatCountdownToSixAmSweep,
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatCountdownToSixAmSweep());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const leadMargin = (LEFT_TEAM.cmasScore - RIGHT_TEAM.cmasScore).toFixed(1);

  const renderLiveMatchTab = () => (
    <>
      {/* Top Tournament Metadata & 6:00 AM Count-Down Sweep */}
      <View style={styles.metaCardBox}>
        <View style={styles.metaTopRow}>
          <Text style={styles.metaSegmentLabel}>
            Community Segment:{' '}
            <Text style={styles.metaSegmentBold}>
              {TOURNAMENT_META.communitySegment}
            </Text>
          </Text>
        </View>

        <View style={styles.metaBottomGrid}>
          <View style={styles.metaLeftDetails}>
            <Text style={styles.metaDetailLine}>
              Day of Tournament:{' '}
              <Text style={styles.metaDetailValue}>
                {TOURNAMENT_META.dayOfTournament}
              </Text>
            </Text>
            <Text style={styles.metaDetailLine}>
              Stage:{' '}
              <Text style={styles.metaDetailValue}>{TOURNAMENT_META.stage}</Text>
            </Text>
            <Text style={styles.metaDetailLine}>
              Date:{' '}
              <Text style={styles.metaDetailValue}>
                {TOURNAMENT_META.dateLabel}
              </Text>
            </Text>
          </View>

          <View style={styles.sweepClockContainer}>
            <View style={styles.sweepClockTopRow}>
              <Svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <Circle
                  cx="12"
                  cy="12"
                  r="9"
                  stroke="#34D399"
                  strokeWidth={2}
                />
                <Path
                  d="M12 7v5l3.2 2"
                  stroke="#34D399"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </Svg>
              <Text style={styles.sweepClockValue}>{countdown}</Text>
            </View>
            <Text style={styles.sweepClockSubLabel}>TO 06:00 AM SWEEP</Text>
            <Text style={styles.currentTimeSub}>06:15 PM IST</Text>
          </View>
        </View>
      </View>

      {/* Head to Head Matchup Card */}
      <View style={styles.h2hCard}>
        <View style={styles.h2hHeaderRow}>
          <Text style={styles.h2hTitle}>Head to Head Matchup</Text>
          <Text style={styles.h2hTelemetrySubtitle}>
            LIVE SENSOR TELEMETRY • COLLECTIVE CMAS
          </Text>
        </View>

        <View style={styles.h2hMatchRow}>
          {/* Left Team */}
          <View style={styles.h2hTeamCol}>
            <View style={styles.h2hTeamIdentityRow}>
              <TeamCrest crest={LEFT_TEAM.crest} size={32} />
              <Text style={styles.h2hTeamName} numberOfLines={1}>
                {LEFT_TEAM.name}
              </Text>
            </View>
            <View
              style={[
                styles.h2hScoreBox,
                {
                  borderColor: LEFT_TEAM.borderColor,
                  backgroundColor: LEFT_TEAM.glowColor,
                },
              ]}
            >
              <LinearGradient
                colors={LEFT_TEAM.accentColors}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[
                  styles.h2hScoreFill,
                  { width: `${LEFT_TEAM.cmasScore}%` },
                ]}
              />
              <Text style={styles.h2hScoreText}>
                {LEFT_TEAM.cmasScore.toFixed(1)}%
              </Text>
            </View>
          </View>

          {/* Center VS */}
          <View style={styles.h2hVsBadge}>
            <Text style={styles.h2hVsText}>VS</Text>
          </View>

          {/* Right Team */}
          <View style={styles.h2hTeamCol}>
            <View
              style={[
                styles.h2hTeamIdentityRow,
                styles.h2hTeamIdentityRowRight,
              ]}
            >
              <Text style={styles.h2hTeamName} numberOfLines={1}>
                {RIGHT_TEAM.name}
              </Text>
              <TeamCrest crest={RIGHT_TEAM.crest} size={32} />
            </View>
            <View
              style={[
                styles.h2hScoreBox,
                {
                  borderColor: RIGHT_TEAM.borderColor,
                  backgroundColor: RIGHT_TEAM.glowColor,
                },
              ]}
            >
              <LinearGradient
                colors={RIGHT_TEAM.accentColors}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[
                  styles.h2hScoreFill,
                  { width: `${RIGHT_TEAM.cmasScore}%` },
                ]}
              />
              <Text style={styles.h2hScoreText}>
                {RIGHT_TEAM.cmasScore.toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.h2hProgressFooter}>
          <View style={styles.h2hLeadPill}>
            <Text style={styles.h2hLeadText}>
              {LEFT_TEAM.name} +{leadMargin}% LEAD
            </Text>
          </View>
          <Text style={styles.h2hSyncPulseText}>
            Auto-syncing background telemetry
          </Text>
        </View>
      </View>

      {/* Hyper-Personalized Target Progress Ring */}
      <DailyCmasGauge
        percentage={DAILY_CMAS_SCORE}
        satellites={SATELLITE_NODES}
      />
    </>
  );

  const renderMatchStatsTab = () => (
    <>
      <View style={styles.metaCardBox}>
        <View style={styles.metaTopRow}>
          <Text style={styles.metaSegmentLabel}>
            Community Segment:{' '}
            <Text style={styles.metaSegmentBold}>
              {TOURNAMENT_META.communitySegment}
            </Text>
          </Text>
        </View>
        <View style={styles.metaBottomGrid}>
          <Text style={styles.metaDetailLine}>
            Day of Tournament:{' '}
            <Text style={styles.metaDetailValue}>
              {TOURNAMENT_META.dayOfTournament}
            </Text>
          </Text>
          <Text style={styles.metaDetailLine}>
            Current Time:{' '}
            <Text style={styles.metaDetailValue}>
              {TOURNAMENT_META.currentTimeLabel}
            </Text>
          </Text>
        </View>
        <Text style={[styles.metaDetailLine, { marginTop: 3 }]}>
          Date:{' '}
          <Text style={styles.metaDetailValue}>{TOURNAMENT_META.dateLabel}</Text>
        </Text>
      </View>

      <Text style={styles.statsSyncNote}>
        Stats shown below are as of last sync at {TOURNAMENT_META.lastSyncTime}
      </Text>

      <View style={styles.statsTeamHeaderRow}>
        <View style={styles.statsTeamHeaderCardLeft}>
          <TeamCrest crest="lion" size={28} />
          <Text style={styles.statsTeamHeaderTitle} numberOfLines={1}>
            TEAM ALPHA
          </Text>
        </View>
        <View style={styles.statsTeamHeaderCardRight}>
          <Text style={styles.statsTeamHeaderTitle} numberOfLines={1}>
            TEAM PHOENIX
          </Text>
          <TeamCrest crest="phoenix" size={28} />
        </View>
      </View>

      {MATCH_STATS_ROWS.map(row => (
        <View
          key={row.id}
          style={[
            styles.statRow,
            row.highlighted && styles.statRowHighlighted,
          ]}
        >
          <View
            style={
              row.highlighted ? styles.statValueBoxLeft : styles.statValueBoxPlain
            }
          >
            <Text style={styles.statLeftValText}>{row.leftValue}</Text>
          </View>

          <Text style={styles.statLabelCenter}>{row.label}</Text>

          <View
            style={
              row.highlighted
                ? styles.statValueBoxRight
                : styles.statValueBoxPlain
            }
          >
            <Text style={styles.statRightValText}>{row.rightValue}</Text>
          </View>
        </View>
      ))}
    </>
  );

  const renderRecordTab = () => (
    <>
      <View style={styles.recordSectionHeader}>
        <Text style={styles.recordSectionTitle}>Record</Text>
      </View>

      <View style={styles.recordSummaryBanner}>
        <Text style={styles.recordSummaryText}>
          TOTAL WINS: <Text style={styles.recordWinsNum}>5</Text>
          {'  |  '}TOTAL LOSSES:{' '}
          <Text style={styles.recordLossesNum}>2</Text>
        </Text>
      </View>

      {RECORD_HISTORY.map(entry => {
        const isWin = entry.result === 'WIN';
        return (
          <View
            key={entry.id}
            style={[
              styles.recordCard,
              !isWin && styles.recordCardLossBorder,
            ]}
          >
            <View style={styles.recordCardHeader}>
              <Text style={styles.recordDateText}>{entry.date}</Text>
              <View style={isWin ? styles.winBadge : styles.lossBadge}>
                <Text style={styles.resultBadgeText}>{entry.result}</Text>
              </View>
            </View>

            <View style={styles.recordMatchRow}>
              <View style={styles.recordTeamSide}>
                <TeamCrest crest={entry.leftCrest} size={32} />
                <View>
                  <Text style={styles.recordTeamName}>{entry.leftTeam}</Text>
                  <Text style={styles.recordTeamPct}>{entry.leftScore}</Text>
                </View>
              </View>

              <Text style={styles.recordVsText}>VS</Text>

              <View style={[styles.recordTeamSide, styles.recordTeamSideRight]}>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.recordTeamName}>{entry.rightTeam}</Text>
                  <Text style={styles.recordTeamPct}>{entry.rightScore}</Text>
                </View>
                <TeamCrest crest={entry.rightCrest} size={32} />
              </View>
            </View>
          </View>
        );
      })}
    </>
  );

  const renderUpcomingTab = () => (
    <>
      <View style={styles.upcomingHeaderWrap}>
        <Text style={styles.upcomingKicker}>
          UPCOMING RIVALS | WEEK 1 OPEN LEAGUE
        </Text>
        <Text style={styles.upcomingTitle}>TEAM ALPHA FIXTURES</Text>
      </View>

      {UPCOMING_FIXTURES.map(fixture => (
        <View key={fixture.id} style={styles.fixtureCard}>
          <Text style={styles.fixtureDateLabel}>{fixture.dateFull}</Text>

          <View style={styles.fixtureTeamsRow}>
            <View style={styles.fixtureTeamGroup}>
              <TeamCrest crest={fixture.leftCrest} size={32} />
              <View>
                <Text style={styles.fixtureTeamName}>{fixture.leftTeam}</Text>
                {!!fixture.leftScorePlaceholder && (
                  <Text style={styles.fixturePlaceholder}>
                    {fixture.leftScorePlaceholder}
                  </Text>
                )}
              </View>
            </View>

            <Text style={styles.fixtureVs}>VS</Text>

            <View
              style={[styles.fixtureTeamGroup, styles.fixtureTeamGroupRight]}
            >
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.fixtureTeamName}>{fixture.rightTeam}</Text>
                {!!fixture.rightScorePlaceholder && (
                  <Text style={styles.fixturePlaceholder}>
                    {fixture.rightScorePlaceholder}
                  </Text>
                )}
              </View>
              <TeamCrest crest={fixture.rightCrest} size={32} />
            </View>
          </View>

          {!!fixture.matchBanner && (
            <View style={styles.fixtureMatchBannerWrap}>
              <Text style={styles.fixtureMatchBannerText}>
                {fixture.matchBanner}
              </Text>
            </View>
          )}

          <View style={styles.fixtureDivider} />

          <View style={styles.fixtureFooterRow}>
            <View style={styles.fixtureFooterDateCol}>
              <Text style={styles.fixtureFooterLabel}>DATE:</Text>
              <Text style={styles.fixtureFooterDateVal}>
                {fixture.dateShort}
              </Text>
            </View>

            <View style={styles.fixtureFooterCompCol}>
              <Text style={styles.fixtureFooterLabel}>TEAM COMPOSITION:</Text>
              <View style={styles.fixtureCompRow}>
                <View style={styles.fixtureCompItem}>
                  <Text style={styles.fixtureCompText}>
                    FEMALE: {fixture.femaleCount}
                  </Text>
                  <GenderBadgeIcon gender="female" size={13} />
                </View>
                <Text style={styles.fixtureCompSep}>|</Text>
                <View style={styles.fixtureCompItem}>
                  <Text style={styles.fixtureCompText}>
                    MALE: {fixture.maleCount}
                  </Text>
                  <GenderBadgeIcon gender="male" size={13} />
                </View>
              </View>
            </View>
          </View>
        </View>
      ))}
    </>
  );

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#050C1B" />
      <LinearGradient
        colors={['#040A17', '#08152B', '#050D1E']}
        style={styles.bgGradient}
      >
        {/* Top Bar with Drawer Trigger & Live Indicator */}
        <View style={styles.topNavBar}>
          <TouchableOpacity
            style={styles.navIconBtn}
            activeOpacity={0.75}
            onPress={() => drawer?.openDrawer()}
          >
            <Svg width="19" height="19" viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="#22D3EE"
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            </Svg>
          </TouchableOpacity>

          <View style={styles.navTitleWrap}>
            <View style={styles.navLiveRow}>
              <View style={styles.liveDot} />
              <Text style={styles.navTitleText}>LIVE MATCHUP</Text>
            </View>
          </View>

          <View style={styles.navRightActions}>
            <TouchableOpacity
              style={styles.navIconBtn}
              activeOpacity={0.75}
              onPress={() => setActiveTab('record')}
            >
              <BellNotificationIcon count={1} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bold Locked Phase Header Bar */}
        <View style={styles.phaseBannerBar}>
          <Text style={styles.phaseBannerText} numberOfLines={1}>
            {TOURNAMENT_META.phaseBanner}
          </Text>
          <View style={styles.dayTrackerPill}>
            <Text style={styles.dayTrackerText}>
              {TOURNAMENT_META.dayTracker}
            </Text>
          </View>
        </View>

        {/* Main Tabbed Content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'live' && renderLiveMatchTab()}
          {activeTab === 'stats' && renderMatchStatsTab()}
          {activeTab === 'record' && renderRecordTab()}
          {activeTab === 'upcoming' && renderUpcomingTab()}
        </ScrollView>

        {/* Bottom 4-Tab Bar */}
        <View style={styles.bottomTabBar}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                activeOpacity={0.8}
                onPress={() => setActiveTab(tab.key)}
                style={[
                  styles.bottomTabItem,
                  isActive && styles.bottomTabItemActive,
                ]}
              >
                <Text
                  style={[
                    styles.bottomTabText,
                    isActive && styles.bottomTabTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default LiveMatchupScreen;
