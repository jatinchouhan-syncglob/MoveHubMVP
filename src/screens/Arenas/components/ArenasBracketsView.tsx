import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { TOURNAMENT_STAGES } from '../constants';
import { ISegmentConfig } from '../types';
import { SegmentStandingsCard } from './SegmentStandingsCard';

interface ArenasBracketsViewProps {
  config: ISegmentConfig;
}

export const ArenasBracketsView: React.FC<ArenasBracketsViewProps> = ({ config }) => {
  const [selectedStageNumber, setSelectedStageNumber] = useState<number>(1);
  const theme = config.theme;

  const activeStage =
    TOURNAMENT_STAGES.find(s => s.stageNumber === selectedStageNumber) ||
    TOURNAMENT_STAGES[0];

  return (
    <ScrollView
      style={styles.bracketsContainer}
      contentContainerStyle={styles.bracketsScrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Banner */}
      <View
        style={[
          styles.bracketsHeroBanner,
          { borderColor: theme.coreAccent, backgroundColor: theme.cardBg },
        ]}
      >
        <Text style={[styles.bracketsHeroTag, { color: theme.coreAccent }]}>
          QUADRANT 1: THE INTERACTIVE TOURNAMENT LEDGER & PLAYBOOK
        </Text>
        <Text style={styles.bracketsHeroTitle}>
          ECFL™ Tournament Knockout Roadmap
        </Text>
        <Text style={styles.bracketsHeroDesc}>
          Gamified roadmap showing weekly knockout brackets. Track your progress, compare your pace to the division leader, and survive each knockout stage.
        </Text>
      </View>

      {/* 1. Top Stage Tabs (Stage 1, 2, 3) */}
      <View style={styles.bracketsStageTabsRow}>
        {TOURNAMENT_STAGES.map(stage => {
          const isActive = selectedStageNumber === stage.stageNumber;
          return (
            <TouchableOpacity
              key={`stage-tab-${stage.stageNumber}`}
              style={[
                styles.bracketsStageTabBtn,
                isActive && {
                  borderColor: stage.accentColor,
                  backgroundColor: `${stage.accentColor}18`,
                  borderWidth: 1.5,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => setSelectedStageNumber(stage.stageNumber)}
            >
              <Text
                style={[
                  styles.bracketsStageTabTitle,
                  isActive && { color: stage.accentColor },
                ]}
              >
                Stage {stage.stageNumber}
              </Text>
              <Text style={styles.bracketsStageTabSub}>{stage.daysRange}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 2. Common Comparison Cards: Top Leader vs Your Score */}
      <View
        style={[
          styles.bracketsComparisonSection,
          { borderColor: theme.mutedBorders },
        ]}
      >
        <View style={styles.bracketsComparisonHeader}>
          <Text
            style={[
              styles.bracketsComparisonTitle,
              { color: theme.coreAccent },
            ]}
          >
            ⚡ Stage {selectedStageNumber} Comparison
          </Text>
          <Text style={styles.bracketsComparisonTag}>LIVE BENCHMARK</Text>
        </View>

        <View style={styles.bracketsComparisonRow}>
          {/* Card 1: Top Leader */}
          <View
            style={[
              styles.bracketsComparisonCard,
              { borderColor: '#F59E0B' },
            ]}
          >
            <View
              style={[
                styles.bracketsComparisonCardBadge,
                { backgroundColor: 'rgba(245, 158, 11, 0.18)' },
              ]}
            >
              <Text
                style={[
                  styles.bracketsComparisonCardBadgeText,
                  { color: '#F59E0B' },
                ]}
              >
                🏆 #1 LEADER
              </Text>
            </View>
            <Text style={styles.bracketsComparisonCardName} numberOfLines={1}>
              Rohan V. (Squad Alpha)
            </Text>
            <Text
              style={[
                styles.bracketsComparisonCardScore,
                { color: '#F59E0B' },
              ]}
            >
              2,840 PTS
            </Text>
            <Text style={styles.bracketsComparisonCardMetric}>
              Cadence: 124 spm • 0.00
            </Text>
            <Text
              style={[
                styles.bracketsComparisonCardStatus,
                { color: '#10B981' },
              ]}
            >
              🟢 Podium Lock
            </Text>
          </View>

          {/* Card 2: Your Score */}
          <View
            style={[
              styles.bracketsComparisonCard,
              { borderColor: theme.coreAccent },
            ]}
          >
            <View
              style={[
                styles.bracketsComparisonCardBadge,
                { backgroundColor: theme.badgeBg },
              ]}
            >
              <Text
                style={[
                  styles.bracketsComparisonCardBadgeText,
                  { color: theme.coreAccent },
                ]}
              >
                👤 YOUR STANDING
              </Text>
            </View>
            <Text style={styles.bracketsComparisonCardName} numberOfLines={1}>
              You (Rank #14)
            </Text>
            <Text
              style={[
                styles.bracketsComparisonCardScore,
                { color: theme.coreAccent },
              ]}
            >
              2,150 PTS
            </Text>
            <Text style={styles.bracketsComparisonCardMetric}>
              Cadence: 118 spm • 0.05
            </Text>
            <Text
              style={[
                styles.bracketsComparisonCardStatus,
                { color: theme.coreAccent },
              ]}
            >
              🛡️ Safe Zone (+420 Gate)
            </Text>
          </View>
        </View>

        {/* Comparative Progress Bar */}
        <View style={styles.bracketsComparisonProgressTrack}>
          <View
            style={[
              styles.bracketsComparisonProgressFill,
              { width: '76%', backgroundColor: theme.coreAccent },
            ]}
          />
        </View>
        <Text style={styles.bracketsComparisonDiffText}>
          ⚡ You are 690 pts behind #1 Leader • 76% Pace of Stage Benchmark
        </Text>
      </View>

      {/* 3. Selected Stage Details Card */}
      <View
        style={[
          styles.bracketsStageCard,
          { borderColor: activeStage.accentColor },
        ]}
      >
        <View style={styles.bracketsStageTop}>
          <Text style={[styles.bracketsStageTitle, { color: activeStage.accentColor }]}>
            {activeStage.title}
          </Text>
          <View style={styles.bracketsDaysBadge}>
            <Text style={styles.bracketsDaysText}>{activeStage.daysRange}</Text>
          </View>
        </View>

        <View style={styles.bracketsCutoffRow}>
          <Text style={styles.bracketsCutoffText}>
            🎯 {activeStage.cutoffText}
          </Text>
        </View>

        <View
          style={[
            styles.bracketsDropBadge,
            { backgroundColor: `${activeStage.accentColor}20` },
          ]}
        >
          <Text style={[styles.bracketsDropText, { color: activeStage.accentColor }]}>
            ⚡ {activeStage.dropPercent}
          </Text>
        </View>

        <Text style={styles.bracketsRulesText}>
          {activeStage.survivalRules}
        </Text>

        <View
          style={[
            styles.bracketsResetBox,
            { borderColor: `${activeStage.accentColor}40` },
          ]}
        >
          <Text style={styles.bracketsResetText}>
            🔄 Bracket Reset: {activeStage.bracketResetDetails}
          </Text>
        </View>
      </View>

      {/* Embedded Live Standings / Division Ledger */}
      <View style={styles.bracketsStandingsSection}>
        <Text style={styles.bracketsStandingsTitle}>
          CURRENT BRACKET STANDINGS & DIVISION LEADERS
        </Text>
        <SegmentStandingsCard config={config} />
      </View>
    </ScrollView>
  );
};

export default ArenasBracketsView;
