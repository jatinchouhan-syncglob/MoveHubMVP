import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../styles';
import { TOURNAMENT_STAGES } from '../constants';
import { ISegmentTheme } from '../types';

interface TournamentPlaybookModalProps {
  visible: boolean;
  onClose: () => void;
  activeTheme?: ISegmentTheme;
}

export const TournamentPlaybookModal: React.FC<TournamentPlaybookModalProps> = ({
  visible,
  onClose,
}) => {
  const [expandedStage, setExpandedStage] = useState<number>(1);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>TOURNAMENT PLAYBOOK & LEDGER</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalScroll}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {TOURNAMENT_STAGES.map(stage => {
              const isExpanded = expandedStage === stage.stageNumber;
              return (
                <TouchableOpacity
                  key={`stage-${stage.stageNumber}`}
                  style={[
                    styles.playbookStageCard,
                    isExpanded && { borderColor: stage.accentColor },
                  ]}
                  activeOpacity={0.9}
                  onPress={() =>
                    setExpandedStage(isExpanded ? 0 : stage.stageNumber)
                  }
                >
                  <View style={styles.playbookStageHeader}>
                    <Text
                      style={[
                        styles.playbookStageTitle,
                        { color: stage.accentColor },
                      ]}
                    >
                      {stage.title}
                    </Text>
                    <View style={styles.playbookDaysBadge}>
                      <Text style={styles.playbookDaysText}>
                        {stage.daysRange}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.playbookCutoffText}>
                    🎯 {stage.cutoffText}
                  </Text>
                  <Text
                    style={[
                      styles.playbookDropText,
                      { color: stage.accentColor },
                    ]}
                  >
                    ⚡ {stage.dropPercent}
                  </Text>

                  <Text style={styles.playbookRulesText}>
                    {stage.survivalRules}
                  </Text>

                  {isExpanded && (
                    <View style={styles.playbookResetBox}>
                      <Text style={styles.playbookResetText}>
                        🔄 Bracket Reset: {stage.bracketResetDetails}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
