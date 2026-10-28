import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import { useDrawer } from '../../../navigation/DrawerContext';
import { INITIAL_GYM_QUEST_CARD } from '../../ExercisePrescription/mockData';
import { styles } from './styles';

type QuestTabType = 'daily' | 'gym' | 'ongoing' | 'archive';

interface EmptyStateProps {
  icon: string;
  badge?: string;
  title: string;
  description: string;
  actionText?: string;
  onActionPress?: () => void;
}

const EmptyStateCard: React.FC<EmptyStateProps> = ({
  icon,
  badge = 'DATA NOT AVAILABLE',
  title,
  description,
  actionText,
  onActionPress,
}) => (
  <View style={styles.emptyStateContainer}>
    <View style={styles.emptyStateIconCircle}>
      <Text style={styles.emptyStateIcon}>{icon}</Text>
    </View>

    <View style={styles.emptyStateBadge}>
      <Text style={styles.emptyStateBadgeText}>{badge}</Text>
    </View>

    <Text style={styles.emptyStateTitle}>{title}</Text>
    <Text style={styles.emptyStateDesc}>{description}</Text>

    {actionText && onActionPress && (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.emptyStateButton}
        onPress={onActionPress}
      >
        <Text style={styles.emptyStateButtonText}>{actionText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const MyQuestsScreen: React.FC = () => {
  const { openDrawer } = useDrawer();
  const [activeTab, setActiveTab] = useState<QuestTabType>('daily');

  // Gym Quest Completion state
  const [gymQuestCompleted, setGymQuestCompleted] = useState<boolean>(false);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E17" />

      {/* Screen Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuButton} onPress={openDrawer}>
            <Text style={{ fontSize: 18, color: '#FFFFFF' }}>☰</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>My Quests</Text>
            <Text style={styles.headerSubtitle}>Active Directives & Machine Protocol</Text>
          </View>
        </View>

        <View style={styles.headerXpBadge}>
          <Text style={styles.headerXpText}>⚡ Quests Hub</Text>
        </View>
      </View>

      {/* 4-Way Mode Switcher Tabs */}
      <View style={styles.tabScrollContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScrollContent}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tabBtn, activeTab === 'daily' && styles.tabBtnActive]}
            onPress={() => setActiveTab('daily')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'daily' && styles.tabBtnTextActive,
              ]}
            >
              📅 Daily Quest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tabBtn, activeTab === 'gym' && styles.tabBtnActive]}
            onPress={() => setActiveTab('gym')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'gym' && styles.tabBtnTextActive,
              ]}
            >
              🏋️ Daily Gym Quest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tabBtn, activeTab === 'ongoing' && styles.tabBtnActive]}
            onPress={() => setActiveTab('ongoing')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'ongoing' && styles.tabBtnTextActive,
              ]}
            >
              ⚡ Ongoing Quest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.tabBtn, activeTab === 'archive' && styles.tabBtnActive]}
            onPress={() => setActiveTab('archive')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'archive' && styles.tabBtnTextActive,
              ]}
            >
              📦 Archive
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================================= */}
        {/* TAB 1: DAILY QUEST (EMPTY STATE)                                          */}
        {/* ========================================================================= */}
        {activeTab === 'daily' && (
          <EmptyStateCard
            icon="🎯"
            badge="DATA NOT AVAILABLE"
            title="No Daily Quests Available"
            description="There are currently no active daily directives or habit protocols assigned for today. Check back during the next synchronization cycle."
            actionText="🔄 Check for Updates"
            onActionPress={() =>
              Alert.alert(
                'Sync Status',
                'Your daily quest protocol is up to date. No new directives found for your profile at this time.',
              )
            }
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DAILY GYM QUEST (Transferred from ExercisePrescriptionScreen)       */}
        {/* ========================================================================= */}
        {activeTab === 'gym' && (
          <View>
            {/* Header Card */}
            <View style={styles.gymHeaderCard}>
              <View style={styles.gymBadgeRow}>
                <View style={styles.gymPillBadge}>
                  <Text style={styles.gymPillText}>24-HOUR ADAPTIVE INGRESS</Text>
                </View>
                <View style={styles.gymActiveStatusPill}>
                  <View style={styles.gymGreenDot} />
                  <Text style={styles.gymActiveStatusText}>RENDER ACTIVE GYM QUEST</Text>
                </View>
              </View>

              <Text style={styles.gymPrescriptionTitle}>
                {INITIAL_GYM_QUEST_CARD.prescriptionCardType}
              </Text>
              <Text style={styles.gymAllocationText}>
                Target Allocation:{' '}
                <Text style={{ color: '#10B981', fontWeight: '800' }}>
                  {INITIAL_GYM_QUEST_CARD.targetAllocation}
                </Text>
              </Text>
            </View>

            {/* Biomechanical Assessment Card */}
            <View style={styles.gymCardSection}>
              <View style={styles.gymSectionHeaderRow}>
                <Text style={styles.gymSectionIcon}>🧬</Text>
                <Text style={styles.gymSectionTitle}>Biomechanical Assessment</Text>
              </View>

              <View style={styles.gymPillGrid}>
                <View style={styles.gymInfoChip}>
                  <Text style={styles.gymChipLabel}>Somatotype Frame</Text>
                  <Text style={styles.gymChipValue}>
                    {INITIAL_GYM_QUEST_CARD.biomechanicalAssessment.somatotypeFrame}
                  </Text>
                </View>

                <View style={styles.gymInfoChip}>
                  <Text style={styles.gymChipLabel}>Metabolic Target Track</Text>
                  <Text style={[styles.gymChipValue, { color: '#F59E0B' }]}>
                    {INITIAL_GYM_QUEST_CARD.biomechanicalAssessment.metabolicTargetTrack}
                  </Text>
                </View>
              </View>

              <View style={styles.gymClinicalReasoningBox}>
                <Text style={styles.gymClinicalTitle}>Clinical Determination:</Text>
                <Text style={styles.gymClinicalText}>
                  {INITIAL_GYM_QUEST_CARD.biomechanicalAssessment.clinicalReasoning}
                </Text>
              </View>
            </View>

            {/* Tonight's Machine Quest Selection */}
            <View style={styles.gymExerciseHeroCard}>
              <View style={styles.heroExerciseBadgeRow}>
                <View style={styles.exerciseTargetBadge}>
                  <Text style={styles.exerciseTargetBadgeText}>TONIGHT'S MACHINE QUEST</Text>
                </View>
                <View style={styles.metPill}>
                  <Text style={styles.metPillText}>
                    ⚡ {INITIAL_GYM_QUEST_CARD.exerciseSelection.metabolicBurdenMets} METs
                  </Text>
                </View>
              </View>

              <Text style={styles.heroExerciseName}>
                {INITIAL_GYM_QUEST_CARD.exerciseSelection.exerciseName}
              </Text>

              <View style={styles.exerciseDetailBox}>
                <View style={styles.exerciseDetailRowItem}>
                  <Text style={styles.exerciseDetailLabel}>🏋️ Equipment:</Text>
                  <Text style={styles.exerciseDetailValue}>
                    {INITIAL_GYM_QUEST_CARD.exerciseSelection.equipmentNeeded}
                  </Text>
                </View>
                <View style={styles.exerciseDetailDivider} />
                <View style={styles.exerciseDetailRowItem}>
                  <Text style={styles.exerciseDetailLabel}>🎯 Prescribed Volume:</Text>
                  <Text style={[styles.exerciseDetailValue, { color: '#34D399' }]}>
                    {INITIAL_GYM_QUEST_CARD.exerciseSelection.prescribedVolumeString}
                  </Text>
                </View>
              </View>

              {/* Safety Precaution */}
              <View style={styles.safetyPrecautionBox}>
                <Text style={styles.safetyPrecautionTitle}>
                  🛡️ Hydro-Static Safety & Pain Protocol:
                </Text>
                <Text style={styles.safetyPrecautionText}>
                  • <Text style={{ fontWeight: '700' }}>Heart Ceiling:</Text>{' '}
                  {INITIAL_GYM_QUEST_CARD.safetyAndPainRemediation.heartSafetyCeiling}
                </Text>
                <Text style={styles.safetyPrecautionText}>
                  • <Text style={{ fontWeight: '700' }}>Joint Protection:</Text>{' '}
                  {INITIAL_GYM_QUEST_CARD.safetyAndPainRemediation.clinicalPainInstruction}
                </Text>
              </View>

              {/* Coaching Video Link */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.videoDemoBtn}
                onPress={() =>
                  Alert.alert(
                    'Streaming Coaching Video',
                    'Connecting to RepDB 512px WebP Demonstration for Seated Cable Rows technique.',
                  )
                }
              >
                <Text style={styles.videoDemoBtnText}>
                  ▶ Watch Form & Biomechanics Demo (RepDB)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tournament Impact Metadata */}
            <View style={styles.gymCardSection}>
              <View style={styles.gymSectionHeaderRow}>
                <Text style={styles.gymSectionIcon}>🏆</Text>
                <Text style={styles.gymSectionTitle}>Quest Tournament Impact Metadata</Text>
              </View>

              <View style={styles.impactCard}>
                <Text style={styles.impactTitle}>• BSE Impact</Text>
                <Text style={styles.impactDesc}>
                  {INITIAL_GYM_QUEST_CARD.tournamentImpact.bseImpact}
                </Text>
              </View>

              <View style={styles.impactCard}>
                <Text style={styles.impactTitle}>• PPI & E3 Optimization</Text>
                <Text style={styles.impactDesc}>
                  {INITIAL_GYM_QUEST_CARD.tournamentImpact.ppiE3Impact}
                </Text>
              </View>

              <View style={styles.impactCard}>
                <Text style={styles.impactTitle}>• Stamina Boost (IS)</Text>
                <Text style={styles.impactDesc}>
                  {INITIAL_GYM_QUEST_CARD.tournamentImpact.staminaImpact}
                </Text>
              </View>
            </View>

            {/* Quest Completion Action */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.questCompleteBtn,
                gymQuestCompleted && styles.questCompleteBtnDone,
              ]}
              onPress={() => {
                const nextState = !gymQuestCompleted;
                setGymQuestCompleted(nextState);
                if (nextState) {
                  Alert.alert(
                    'Gym Quest Completed! 🏆',
                    'Your daily resistance volume has been recorded. Your required daily steps target has been scaled down by 30%!',
                  );
                }
              }}
            >
              <Text style={styles.questCompleteBtnText}>
                {gymQuestCompleted
                  ? '✓ Quest Completed for Today'
                  : "✓ Mark Tonight's Quest Completed"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ONGOING QUEST (EMPTY STATE)                                        */}
        {/* ========================================================================= */}
        {activeTab === 'ongoing' && (
          <EmptyStateCard
            icon="⚡"
            badge="DATA NOT AVAILABLE"
            title="No Ongoing Quests Found"
            description="You are not currently enrolled in any active multi-day tournament challenges or sprint brackets. Active quests will appear here once announced."
            actionText="🏆 Explore Arenas"
            onActionPress={() =>
              Alert.alert(
                'Arenas Status',
                'New corporate tournament brackets and endurance sprints will be announced soon in the Arenas hub.',
              )
            }
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ARCHIVE (EMPTY STATE)                                              */}
        {/* ========================================================================= */}
        {activeTab === 'archive' && (
          <EmptyStateCard
            icon="📦"
            badge="DATA NOT AVAILABLE"
            title="No Archived Quests"
            description="No completed or expired quest history is available yet. Once you complete daily or tournament quests, their permanent records will be safely archived here."
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MyQuestsScreen;
