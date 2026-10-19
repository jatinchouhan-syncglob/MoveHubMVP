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
  const [expandedStage, setExpandedStage] = useState<number>(1);
  const theme = config.theme;

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
          Gamified roadmap showing weekly knockout brackets. Visual timeline indicates target thresholds to survive the Week 1 25% Knockout Gate and Week 2 1v1 match resets.
        </Text>
      </View>

      {/* 3 Tournament Knockout Stages */}
      {TOURNAMENT_STAGES.map(stage => {
        const isExpanded = expandedStage === stage.stageNumber;
        return (
          <TouchableOpacity
            key={`stage-${stage.stageNumber}`}
            style={[
              styles.bracketsStageCard,
              { borderColor: isExpanded ? stage.accentColor : theme.mutedBorders },
            ]}
            activeOpacity={0.85}
            onPress={() => setExpandedStage(isExpanded ? 0 : stage.stageNumber)}
          >
            <View style={styles.bracketsStageTop}>
              <Text style={[styles.bracketsStageTitle, { color: stage.accentColor }]}>
                {stage.title}
              </Text>
              <View style={styles.bracketsDaysBadge}>
                <Text style={styles.bracketsDaysText}>{stage.daysRange}</Text>
              </View>
            </View>

            <View style={styles.bracketsCutoffRow}>
              <Text style={styles.bracketsCutoffText}>
                🎯 {stage.cutoffText}
              </Text>
            </View>

            <View
              style={[
                styles.bracketsDropBadge,
                { backgroundColor: `${stage.accentColor}20` },
              ]}
            >
              <Text style={[styles.bracketsDropText, { color: stage.accentColor }]}>
                ⚡ {stage.dropPercent}
              </Text>
            </View>

            <Text style={styles.bracketsRulesText}>
              {stage.survivalRules}
            </Text>

            {isExpanded && (
              <View
                style={[
                  styles.bracketsResetBox,
                  { borderColor: `${stage.accentColor}40` },
                ]}
              >
                <Text style={styles.bracketsResetText}>
                  🔄 Bracket Reset: {stage.bracketResetDetails}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

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
