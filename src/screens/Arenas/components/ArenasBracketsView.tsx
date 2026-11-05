import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { styles } from '../styles';
import { TOURNAMENT_STAGES } from '../constants';
import { ISegmentConfig } from '../types';

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
          Gamified roadmap showing weekly knockout brackets. Visual timeline indicates target thresholds to survive the Week 1 25% Knockout Gate and Week 2 1v1 match resets.
        </Text>
      </View>

      {/* Top Stage Tabs (Stage 1, 2, 3) */}
      <View style={styles.bracketsStageTabsRow}>
        {TOURNAMENT_STAGES.map(stage => {
          const isSelected = selectedStageNumber === stage.stageNumber;
          const isEnabled = stage.stageNumber === 1; // Only Stage 1 is active/enabled for now

          return (
            <TouchableOpacity
              key={`stage-tab-${stage.stageNumber}`}
              style={[
                styles.bracketsStageTabBtn,
                isSelected && {
                  borderColor: stage.accentColor,
                  backgroundColor: `${stage.accentColor}18`,
                  borderWidth: 1.5,
                },
                !isEnabled && styles.bracketsStageTabBtnDisabled,
              ]}
              activeOpacity={isEnabled ? 0.75 : 1}
              disabled={!isEnabled}
              onPress={() => {
                if (isEnabled) {
                  setSelectedStageNumber(stage.stageNumber);
                }
              }}
            >
              <View style={styles.bracketsStageTabHeader}>
                <Text
                  style={[
                    styles.bracketsStageTabTitle,
                    isSelected && { color: stage.accentColor },
                    !isEnabled && styles.bracketsStageTabTitleDisabled,
                  ]}
                >
                  {isEnabled ? `Stage ${stage.stageNumber}` : `🔒 Stage ${stage.stageNumber}`}
                </Text>
              </View>
              <Text
                style={[
                  styles.bracketsStageTabSub,
                  isSelected && { color: '#E2E8F0', fontWeight: '800' },
                  !isEnabled && styles.bracketsStageTabSubDisabled,
                ]}
              >
                {stage.daysRange}
              </Text>
              {isSelected && (
                <View
                  style={[
                    styles.bracketsStageActivePill,
                    { backgroundColor: `${stage.accentColor}25`, borderColor: stage.accentColor },
                  ]}
                >
                  <Text style={[styles.bracketsStageActivePillText, { color: stage.accentColor }]}>
                    ACTIVE
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Active Tournament Knockout Stage Card */}
      <View
        key={`stage-${activeStage.stageNumber}`}
        style={[
          styles.bracketsStageCard,
          { borderColor: activeStage.accentColor },
        ]}
      >
        {/* Stage Title and Days Badge */}
        <View style={styles.bracketsStageTop}>
          <Text
            style={[
              styles.bracketsStageTitle,
              { color: activeStage.accentColor, flex: 1, marginRight: 8 },
            ]}
          >
            {activeStage.title}
          </Text>
          <View style={styles.bracketsDaysBadge}>
            <Text style={styles.bracketsDaysText}>{activeStage.daysRange}</Text>
          </View>
        </View>

        {/* 1. The Survival Gate */}
        {activeStage.survivalGate && (
          <View style={styles.bracketsSectionBlock}>
            <Text style={styles.bracketsSectionLabel}>🎯 The Survival Gate:</Text>
            <Text
              style={[
                styles.bracketsSectionValue,
                { color: activeStage.accentColor, fontWeight: '800' },
              ]}
            >
              {activeStage.survivalGate}
            </Text>
          </View>
        )}

        {/* 2. What We Measure */}
        {activeStage.whatWeMeasure && (
          <View style={styles.bracketsSectionBlock}>
            <Text style={styles.bracketsSectionLabel}>📊 What We Measure:</Text>
            <Text style={styles.bracketsSectionValue}>{activeStage.whatWeMeasure}</Text>
          </View>
        )}

        {/* 3. How the Score is Calculated */}
        {activeStage.howScoreCalculated && (
          <View style={styles.bracketsSectionBlock}>
            <Text style={styles.bracketsSectionLabel}>
              🧮 How the Score is Calculated:
            </Text>
            <Text style={styles.bracketsSectionValue}>
              {activeStage.howScoreCalculated}
            </Text>
          </View>
        )}

        {/* 4. How to Score High & Progress / Win */}
        {activeStage.howToScoreHigh && (
          <View
            style={[
              styles.bracketsActionBox,
              {
                borderColor: `${activeStage.accentColor}35`,
                backgroundColor: `${activeStage.accentColor}12`,
              },
            ]}
          >
            <Text
              style={[
                styles.bracketsActionLabel,
                { color: activeStage.accentColor },
              ]}
            >
              {activeStage.stageNumber === 3
                ? '🏆 How to Score High & Win:'
                : '⚡ How to Score High & Progress:'}
            </Text>
            <Text style={styles.bracketsActionValue}>
              {activeStage.howToScoreHigh}
            </Text>
          </View>
        )}
      </View>

      {/* Note: Current Bracket Standings & Division Leaders removed as requested (to be reminded later) */}
    </ScrollView>
  );
};

export default ArenasBracketsView;
