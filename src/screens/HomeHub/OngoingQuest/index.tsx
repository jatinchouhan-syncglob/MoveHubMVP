import React, { useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScaledSheet } from 'react-native-size-matters';
import { theme } from '../../../theme';
import { apiService } from '../../../services/api';
import { UserProfile } from '../../../types';
import { CustomHeader } from '../../../components/common/CustomHeader';

type Quest = {
  id: string;
  icon: string;
  category: string;
  subtitle: string;
  progressPercent?: number;
  xp: number;
  isDaily?: boolean;
  type?: string;
  startDate?: string;
  endDate?: string;
};

const ProgressBar = ({ percent }: { percent: number }) => (
  <View style={styles.progressTrack}>
    <View style={[styles.progressFill, { width: `${percent}%` as any }]} />
  </View>
);

const QuestCard = ({ quest }: { quest: Quest }) => {
  return (
    <TouchableOpacity activeOpacity={1} style={styles.card}>
      <View style={styles.accentBar} />

      <View style={styles.iconWrap}>
        <Text style={styles.iconEmoji}>{quest.icon}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardCategory}>{quest.category}</Text>
        <Text style={styles.cardSubtitle}>{quest.subtitle}</Text>
        {quest.startDate && quest.endDate && (
          <Text style={styles.dateText}>
            📅 {quest.startDate} → {quest.endDate}
          </Text>
        )}
        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <ProgressBar percent={quest.progressPercent ?? 0} />
            <Text style={styles.progressPercLabel}>
              {quest.progressPercent ?? 0}%
            </Text>
          </View>
          <View style={styles.progressMeta}>
            <Text style={styles.xpLabel}>+{quest.xp} XP</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SuggestionCardItem = ({ item }: any) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[styles.suggestionCard, { overflow: 'hidden' }]}>
      <View>
        <View style={styles.suggestionTop}>
          <Text style={styles.suggestionIcon}>{item.icon}</Text>
          <View
            style={[
              styles.suggestionTagWrap,
              { backgroundColor: item.tagColor },
            ]}>
            <Text style={styles.suggestionTag}>{item.tag}</Text>
          </View>
        </View>
        <Text style={styles.suggestionTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.suggestionDesc} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.suggestionFooter}>
          <Text style={styles.suggestionXp}>+{item.xp} XP</Text>
          <Text style={styles.suggestionArrow}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SectionHeader = ({ title, action }: any) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>

    {action && (
      <TouchableOpacity>
        <Text style={styles.sectionAction}>{action}</Text>
      </TouchableOpacity>
    )}
  </View>
);

export const OngoingQuestScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'all' | 'daily' | 'past' | 'ongoing' | 'upcoming'>('all');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const p = await apiService.getProfile();
        setProfile(p);
      } catch (e) {
        console.error('Failed to load profile in OngoingQuest:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const customQuests: Quest[] = [
    // DAILY QUESTS (Active today, July 28, 2026)
    {
      id: 'daily_water',
      icon: '💧',
      category: 'DAILY HYDRATION',
      subtitle: 'Drink at least 3 Liters of water today',
      progressPercent: 60,
      xp: 20,
      isDaily: true,
      type: 'daily',
      startDate: 'July 28',
      endDate: 'July 28',
    },
    {
      id: 'daily_steps',
      icon: '👣',
      category: 'DAILY ACTIVE WALK',
      subtitle: 'Complete 8,000 steps today',
      progressPercent: 45,
      xp: 30,
      isDaily: true,
      type: 'daily',
      startDate: 'July 28',
      endDate: 'July 28',
    },

    // ONGOING QUESTS (Active today and spanning across multiple days in July 2026)
    {
      id: 'steps_7d',
      icon: '👣',
      category: '7-DAYS TOTAL STEPS CHALLENGE',
      subtitle: 'Track your 7-Days total steps challenges',
      progressPercent: 80,
      xp: 100,
      isDaily: false,
      type: 'ongoing',
      startDate: 'July 25',
      endDate: 'August 01',
    },
    {
      id: 'trial_5d',
      icon: '🏃',
      category: '5 DAYS TRIAL RUN',
      subtitle: 'Complete 5-Day Trial Run',
      progressPercent: 100,
      xp: 100,
      isDaily: false,
      type: 'ongoing',
      startDate: 'July 26',
      endDate: 'July 30',
    },
    {
      id: 'shift_1p',
      icon: '⚡',
      category: '1% SHIFT MASTER CLASS',
      subtitle: 'Improve daily performance by 1%',
      progressPercent: 50,
      xp: 100,
      isDaily: false,
      type: 'ongoing',
      startDate: 'July 27',
      endDate: 'July 31',
    },

    // PAST QUESTS (Ended in the past, before July 28, 2026)
    {
      id: 'past_sleep',
      icon: '🌙',
      category: 'WEEKLY SLEEP GOAL',
      subtitle: 'Maintain 7+ hours of sleep for 5 days',
      progressPercent: 100,
      xp: 80,
      isDaily: false,
      type: 'past',
      startDate: 'July 15',
      endDate: 'July 22',
    },
    {
      id: 'past_cardio',
      icon: '🚴',
      category: 'CARDIO INTENSIVE WEEK',
      subtitle: 'Log 150 minutes of moderate cardio activity',
      progressPercent: 100,
      xp: 120,
      isDaily: false,
      type: 'past',
      startDate: 'July 10',
      endDate: 'July 17',
    },

    // UPCOMING QUESTS (Starting in the future, after July 28, 2026)
    {
      id: 'up_strength',
      icon: '🏋️‍♂️',
      category: 'STRENGTH PROGRESSION W1',
      subtitle: '3 full-body strength workouts scheduled',
      progressPercent: 0,
      xp: 150,
      isDaily: false,
      type: 'upcoming',
      startDate: 'August 01',
      endDate: 'August 08',
    },
    {
      id: 'up_marathon',
      icon: '🏅',
      category: 'INOX MINI MARATHON',
      subtitle: 'Register and prepare for the 5K run',
      progressPercent: 0,
      xp: 200,
      isDaily: false,
      type: 'upcoming',
      startDate: 'August 05',
      endDate: 'August 12',
    },
  ];

  const suggestions = [
    {
      id: 's1',
      title: 'Morning Stretch Routine',
      description: '5-min daily stretch to boost flexibility',
      icon: '🧘',
      tag: 'MOVE',
      tagColor: '#0A4020',
      xp: 10,
    },
    {
      id: 's2',
      title: 'Heart Rate Check',
      description: "Sync your wearable for today's reading",
      icon: '❤️',
      tag: 'VITALITY',
      tagColor: '#0A1A40',
      xp: 15,
    },
    {
      id: 's3',
      title: 'Stress Level Log',
      description: 'Rate your stress and track patterns',
      icon: '🧠',
      tag: 'MINDSET',
      tagColor: '#20103A',
      xp: 10,
    },
    {
      id: 's4',
      title: 'Weekly Risk Report',
      description: 'Review your updated health risk profile',
      icon: '📋',
      tag: 'SHIELD',
      tagColor: '#302005',
      xp: 25,
    },
  ];

  const filteredQuests = customQuests.filter(q => {
    if (selectedTab === 'all') return true;
    return q.type === selectedTab;
  });

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <CustomHeader title="Ongoing Quests" showDrawerButton={true} />

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              WELCOME, {profile?.name?.toUpperCase() || 'USER'}
            </Text>
          </View>

          <SectionHeader title={`${selectedTab.toUpperCase()} QUESTS`} />
          
          <ScrollView horizontal style={styles.tabWrapper} showsHorizontalScrollIndicator={false}>
            <View style={styles.tabContainer}>
              {['all', 'daily', 'past', 'ongoing', 'upcoming'].map(tab => {
                const isActive = tab === selectedTab;
                return (
                  <TouchableOpacity
                    key={tab}
                    activeOpacity={0.8}
                    onPress={() => setSelectedTab(tab as any)}
                    style={[
                      styles.tabButton,
                      isActive && styles.activeTabButton,
                      { overflow: 'hidden' },
                    ]}>
                    <Text
                      style={[styles.tabText, isActive && styles.activeTabText]}>
                      {tab.toUpperCase()}
                    </Text>
                    {!isActive && (
                      <View
                        style={[
                          StyleSheet.absoluteFill,
                          { backgroundColor: 'rgba(255,255,255,0.08)' }
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {filteredQuests.length > 0 ? (
            filteredQuests.map(q => (
              <QuestCard key={q.id} quest={q} />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No quests found in this category.</Text>
            </View>
          )}

          <SectionHeader title="SUGGESTED FOR YOU" action="See More" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.suggestionsRow}>
            {suggestions.map(s => (
              <SuggestionCardItem key={s.id} item={s} />
            ))}
          </ScrollView>

          <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              ⚠️ MEDICAL DISCLAIMER: MoveHub physical tracking calculations are intended for motivational purposes only. Always consult a physician before pursuing rigorous routines.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default OngoingQuestScreen;

const TEAL = theme.colors.secondary;
const DARK_BG = theme.colors.background;
const CARD_BG = theme.colors.surface;
const BORDER = theme.colors.border;
const SLATE = theme.colors.textSecondary;
const AMBER = theme.colors.warning;
const GREEN = theme.colors.success;
const RED = theme.colors.error;

const styles = ScaledSheet.create({
  root: { flex: 1, backgroundColor: DARK_BG },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabWrapper: {
    marginVertical: '10@ms',
    paddingVertical: '8@ms',
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: '14@ms',
    padding: '4@ms',
    gap: '15@ms',
    paddingHorizontal: '16@ms',
  },
  tabButton: {
    paddingVertical: '8@ms',
    paddingHorizontal: '12@ms',
    borderRadius: '16@ms',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: '70@ms',
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: TEAL,
    borderColor: TEAL,
    shadowColor: TEAL,
    shadowOpacity: 0.4,
    shadowRadius: '6@ms',
    elevation: 4,
  },
  tabText: {
    color: SLATE,
    fontSize: '12@ms',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: '16@ms',
    paddingTop: '16@ms',
    paddingBottom: '8@ms',
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: '20@ms',
    fontWeight: '800',
    letterSpacing: '1@ms',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '16@ms',
    marginBottom: '10@ms',
    marginTop: '12@ms',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: '13@ms',
    fontWeight: '800',
    letterSpacing: '1.5@ms',
  },
  sectionAction: { color: TEAL, fontSize: '11@ms', fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { paddingTop: '4@ms', paddingBottom: '24@ms' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: '14@ms',
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    paddingRight: '12@ms',
    paddingVertical: '14@ms',
    marginHorizontal: '16@ms',
    marginBottom: '10@ms',
  },
  accentBar: {
    width: '4@ms',
    alignSelf: 'stretch',
    backgroundColor: TEAL,
    marginRight: '12@ms',
  },
  iconWrap: {
    width: '46@ms',
    height: '46@ms',
    borderRadius: '23@ms',
    backgroundColor: DARK_BG,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12@ms',
    position: 'relative',
  },
  iconEmoji: { fontSize: '20@ms' },
  cardBody: { flex: 1, gap: '3@ms' },
  cardCategory: {
    color: theme.colors.text,
    fontSize: '12@ms',
    fontWeight: '800',
    letterSpacing: '0.4@ms',
  },
  cardSubtitle: { color: SLATE, fontSize: '11@ms', fontWeight: '500' },
  dateText: {
    fontSize: '11@ms',
    color: SLATE,
    marginTop: '4@ms',
  },
  progressSection: { marginTop: '6@ms', gap: '4@ms' },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: '8@ms' },
  progressTrack: {
    flex: 1,
    height: '4@ms',
    backgroundColor: theme.colors.border,
    borderRadius: '2@ms',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: TEAL, borderRadius: '2@ms' },
  progressPercLabel: {
    color: SLATE,
    fontSize: '10@ms',
    fontWeight: '600',
    minWidth: '28@ms',
    textAlign: 'right',
  },
  progressMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  xpLabel: { color: TEAL, fontSize: '11@ms', fontWeight: '700' },
  suggestionsRow: {
    paddingHorizontal: '16@ms',
    gap: '12@ms',
    paddingBottom: '4@ms',
  },
  suggestionCard: {
    width: '160@ms',
    backgroundColor: CARD_BG,
    borderRadius: '14@ms',
    borderWidth: 1,
    borderColor: BORDER,
    padding: '14@ms',
    gap: '8@ms',
  },
  suggestionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  suggestionIcon: { fontSize: '24@ms' },
  suggestionTagWrap: {
    paddingHorizontal: '8@ms',
    paddingVertical: '3@ms',
    borderRadius: '6@ms',
  },
  suggestionTag: {
    fontSize: '9@ms',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '0.5@ms',
  },
  suggestionTitle: {
    color: theme.colors.text,
    fontSize: '13@ms',
    fontWeight: '800',
    lineHeight: '18@ms',
  },
  suggestionDesc: {
    color: SLATE,
    fontSize: '11@ms',
    fontWeight: '500',
    lineHeight: '15@ms',
  },
  suggestionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '2@ms',
  },
  suggestionXp: { color: TEAL, fontSize: '12@ms', fontWeight: '800' },
  suggestionArrow: { color: SLATE, fontSize: '16@ms' },
  emptyContainer: {
    padding: '30@ms',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: '16@ms',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: BORDER,
    borderRadius: '14@ms',
    backgroundColor: CARD_BG,
    marginVertical: '10@ms',
  },
  emptyText: {
    color: SLATE,
    fontSize: '13@ms',
    fontWeight: '500',
  },
  disclaimerContainer: {
    marginHorizontal: '16@ms',
    marginTop: '20@ms',
    padding: '12@ms',
    borderRadius: '10@ms',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
  },
  disclaimerText: {
    fontSize: '11@ms',
    color: RED,
    lineHeight: '16@ms',
    fontWeight: '500',
  },
});
