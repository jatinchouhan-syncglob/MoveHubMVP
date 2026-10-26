import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { styles } from '../styles';
import { TOURNAMENT_STAGES } from '../constants';
import { ISegmentConfig } from '../types';

interface ArenasBracketsViewProps {
  config: ISegmentConfig;
}

export const ArenasBracketsView: React.FC<ArenasBracketsViewProps> = ({ config }) => {
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
        return (
          <View
            key={`stage-${stage.stageNumber}`}
            style={[
              styles.bracketsStageCard,
              { borderColor: stage.accentColor },
            ]}
          >
            {/* Stage Title and Days Badge */}
            <View style={styles.bracketsStageTop}>
              <Text
                style={[
                  styles.bracketsStageTitle,
                  { color: stage.accentColor, flex: 1, marginRight: 8 },
                ]}
              >
                {stage.title}
              </Text>
              <View style={styles.bracketsDaysBadge}>
                <Text style={styles.bracketsDaysText}>{stage.daysRange}</Text>
              </View>
            </View>

            {/* 1. The Survival Gate */}
            {stage.survivalGate && (
              <View style={styles.bracketsSectionBlock}>
                <Text style={styles.bracketsSectionLabel}>🎯 The Survival Gate:</Text>
                <Text
                  style={[
                    styles.bracketsSectionValue,
                    { color: stage.accentColor, fontWeight: '800' },
                  ]}
                >
                  {stage.survivalGate}
                </Text>
              </View>
            )}

            {/* 2. What We Measure */}
            {stage.whatWeMeasure && (
              <View style={styles.bracketsSectionBlock}>
                <Text style={styles.bracketsSectionLabel}>📊 What We Measure:</Text>
                <Text style={styles.bracketsSectionValue}>{stage.whatWeMeasure}</Text>
              </View>
            )}

            {/* 3. How the Score is Calculated */}
            {stage.howScoreCalculated && (
              <View style={styles.bracketsSectionBlock}>
                <Text style={styles.bracketsSectionLabel}>
                  🧮 How the Score is Calculated:
                </Text>
                <Text style={styles.bracketsSectionValue}>
                  {stage.howScoreCalculated}
                </Text>
              </View>
            )}

            {/* 4. How to Score High & Progress / Win */}
            {stage.howToScoreHigh && (
              <View
                style={[
                  styles.bracketsActionBox,
                  {
                    borderColor: `${stage.accentColor}35`,
                    backgroundColor: `${stage.accentColor}12`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.bracketsActionLabel,
                    { color: stage.accentColor },
                  ]}
                >
                  {stage.stageNumber === 3
                    ? '🏆 How to Score High & Win:'
                    : '⚡ How to Score High & Progress:'}
                </Text>
                <Text style={styles.bracketsActionValue}>
                  {stage.howToScoreHigh}
                </Text>
              </View>
            )}
          </View>
        );
      })}

      {/* Note: Current Bracket Standings & Division Leaders removed as requested (to be reminded later) */}
    </ScrollView>
  );
};

export default ArenasBracketsView;
