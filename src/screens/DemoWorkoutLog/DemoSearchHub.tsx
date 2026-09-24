import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  FlatList,
  SectionList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { ROUTES } from '../../constants/routes';

interface ExerciseItem {
  id: string;
  activityName: string;
  displayName: string;
  category: 'dancing' | 'gym';
  intensityBand: 'LIGHT' | 'MODERATE' | 'VIGOROUS';
  trackingPolicy: 'manual' | 'telemetry';
  baseMet: number;
  cardio: number;
  strength: number;
  balance: number;
  recovery: number;
  emoji: string;
}

const AEROBIC_CATALOG: ExerciseItem[] = [
  // DANCING
  {
    id: '03025',
    activityName: 'Aerobic dancing, general studio choreography',
    displayName: 'Studio Aerobic Dance Track',
    category: 'dancing',
    intensityBand: 'VIGOROUS',
    trackingPolicy: 'manual',
    baseMet: 6.0,
    cardio: 85,
    strength: 5,
    balance: 5,
    recovery: 5,
    emoji: '💃',
  },
  {
    id: '03026',
    activityName: 'Chinese square dance, aerobic dance',
    displayName: 'Chinese square dance - Aerobic workout variant',
    category: 'dancing',
    intensityBand: 'MODERATE',
    trackingPolicy: 'manual',
    baseMet: 4.5,
    cardio: 70,
    strength: 10,
    balance: 15,
    recovery: 5,
    emoji: '🏮',
  },
  {
    id: '03031',
    activityName: 'Zumba toning, aerobic dance wearing weights',
    displayName: 'Zumba Toning Class',
    category: 'dancing',
    intensityBand: 'VIGOROUS',
    trackingPolicy: 'manual',
    baseMet: 6.5,
    cardio: 75,
    strength: 15,
    balance: 5,
    recovery: 5,
    emoji: '🏋️‍♀️',
  },
  {
    id: '03033',
    activityName: 'Aqua zumba, water dance cardio class',
    displayName: 'Aqua Zumba Pool Class - Aerobic Workout',
    category: 'dancing',
    intensityBand: 'MODERATE',
    trackingPolicy: 'manual',
    baseMet: 4.0,
    cardio: 80,
    strength: 10,
    balance: 5,
    recovery: 5,
    emoji: '🏊‍♀️',
  },
  {
    id: '03042',
    activityName: 'Zumba, standard high tempo group class',
    displayName: 'Zumba Gold',
    category: 'dancing',
    intensityBand: 'MODERATE',
    trackingPolicy: 'manual',
    baseMet: 4.5,
    cardio: 80,
    strength: 10,
    balance: 5,
    recovery: 5,
    emoji: '✨',
  },
  {
    id: '03027',
    activityName: 'Aerobic dance, low impact',
    displayName: 'Aerobic Dance Floor Basics',
    category: 'dancing',
    intensityBand: 'LIGHT',
    trackingPolicy: 'manual',
    baseMet: 3.5,
    cardio: 70,
    strength: 5,
    balance: 15,
    recovery: 10,
    emoji: '🩰',
  },
  {
    id: '03028',
    activityName: 'Dance, ethnic or folk, moderate effort',
    displayName: 'Folk Dance Paced',
    category: 'dancing',
    intensityBand: 'LIGHT',
    trackingPolicy: 'manual',
    baseMet: 3.8,
    cardio: 65,
    strength: 5,
    balance: 20,
    recovery: 10,
    emoji: '🪕',
  },
  {
    id: '03045',
    activityName: 'Zumba Kids, aerobic dance for youth',
    displayName: 'Zumba Kids Class',
    category: 'dancing',
    intensityBand: 'LIGHT',
    trackingPolicy: 'manual',
    baseMet: 3.5,
    cardio: 70,
    strength: 5,
    balance: 15,
    recovery: 10,
    emoji: '🎈',
  },
  {
    id: '03046',
    activityName: 'Zumba Sentao, choreographic chair cardio',
    displayName: 'Zumba Sentao Fitness',
    category: 'dancing',
    intensityBand: 'VIGOROUS',
    trackingPolicy: 'manual',
    baseMet: 6.0,
    cardio: 75,
    strength: 15,
    balance: 5,
    recovery: 5,
    emoji: '🪑',
  },
  {
    id: '03047',
    activityName: 'Zumba In The Circuit, rapid dance intervals',
    displayName: 'Zumba Circuit Intervals',
    category: 'dancing',
    intensityBand: 'VIGOROUS',
    trackingPolicy: 'manual',
    baseMet: 6.8,
    cardio: 80,
    strength: 10,
    balance: 5,
    recovery: 5,
    emoji: '⚡',
  },
  // GYM & COND
  {
    id: '02001',
    activityName: 'Aerobic, general',
    displayName: 'Aerobic Routine General',
    category: 'gym',
    intensityBand: 'MODERATE',
    trackingPolicy: 'manual',
    baseMet: 5.0,
    cardio: 80,
    strength: 10,
    balance: 5,
    recovery: 5,
    emoji: '🎽',
  },
  {
    id: '02003',
    activityName: 'Aerobic, step, 4-inch platform',
    displayName: 'Step Platform Low Height',
    category: 'gym',
    intensityBand: 'MODERATE',
    trackingPolicy: 'telemetry',
    baseMet: 4.5,
    cardio: 80,
    strength: 10,
    balance: 5,
    recovery: 5,
    emoji: '🪜',
  },
  {
    id: '02004',
    activityName: 'Aerobic, step, 6-8 inch platform',
    displayName: 'Step Platform Medium Height',
    category: 'gym',
    intensityBand: 'VIGOROUS',
    trackingPolicy: 'telemetry',
    baseMet: 6.0,
    cardio: 85,
    strength: 10,
    balance: 2.5,
    recovery: 2.5,
    emoji: '🪜',
  },
  {
    id: '02005',
    activityName: 'Aerobic dance, step platform combo',
    displayName: 'Hybrid Circuit Step Combo',
    category: 'gym',
    intensityBand: 'VIGOROUS',
    trackingPolicy: 'telemetry',
    baseMet: 6.5,
    cardio: 80,
    strength: 15,
    balance: 2.5,
    recovery: 2.5,
    emoji: '👟',
  },
  {
    id: '02006',
    activityName: 'Aerobic dance, low impact, moderate effort',
    displayName: 'Dance Cardio Low Intensity',
    category: 'gym',
    intensityBand: 'LIGHT',
    trackingPolicy: 'manual',
    baseMet: 3.5,
    cardio: 70,
    strength: 5,
    balance: 15,
    recovery: 10,
    emoji: '🤸‍♀️',
  },
  {
    id: '02007',
    activityName: 'Aerobic dance, step combo, circuit, fitness',
    displayName: 'Hybrid Circuit Step Combo',
    category: 'gym',
    intensityBand: 'VIGOROUS',
    trackingPolicy: 'telemetry',
    baseMet: 7.0,
    cardio: 75,
    strength: 15,
    balance: 5,
    recovery: 5,
    emoji: '🏋️‍♂️',
  },
  {
    id: '02008',
    activityName: 'Aerobic dance, water fusion, cardio track',
    displayName: 'Pool Resistance Cardio',
    category: 'gym',
    intensityBand: 'MODERATE',
    trackingPolicy: 'manual',
    baseMet: 4.2,
    cardio: 80,
    strength: 10,
    balance: 5,
    recovery: 5,
    emoji: '🌊',
  },
  {
    id: '02009',
    activityName: 'Aerobic, step, 10-12 inch platform',
    displayName: 'Step Platform High Incline',
    category: 'gym',
    intensityBand: 'VIGOROUS',
    trackingPolicy: 'telemetry',
    baseMet: 7.5,
    cardio: 85,
    strength: 10,
    balance: 2.5,
    recovery: 2.5,
    emoji: '🪜',
  },
];

const POPULAR_WORKOUTS: ExerciseItem[] = [
  AEROBIC_CATALOG[4], // Zumba Gold
  AEROBIC_CATALOG[7], // Aerobic General
  {
    id: '01270',
    activityName: 'Bicycling, stationary, rpm',
    displayName: 'High Rhythm Spin Studio',
    category: 'gym',
    intensityBand: 'VIGOROUS',
    trackingPolicy: 'telemetry',
    baseMet: 6.8,
    cardio: 90,
    strength: 5,
    balance: 2.5,
    recovery: 2.5,
    emoji: '🚴‍♂️',
  },
  {
    id: '17151',
    activityName: 'Walking, brisk walking',
    displayName: 'Intense Cardio Stride Pace',
    category: 'gym',
    intensityBand: 'MODERATE',
    trackingPolicy: 'manual',
    baseMet: 4.3,
    cardio: 80,
    strength: 5,
    balance: 10,
    recovery: 5,
    emoji: '🚶‍♂️',
  },
];

export const DemoSearchHubScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPill, setSelectedPill] = useState<'ALL' | 'DANCING' | 'GYM' | null>(null);

  useEffect(() => {
    // Auto-select 'ALL' tab and search when user starts typing, reset to popular list if empty
    if (searchQuery.trim().length > 0) {
      setSelectedPill('ALL');
    } else {
      setSelectedPill(null);
    }
  }, [searchQuery]);

  const getFilteredList = () => {
    const query = searchQuery.trim().toLowerCase();
    const filteredBySearch = AEROBIC_CATALOG.filter(
      e => e.displayName.toLowerCase().includes(query) || e.activityName.toLowerCase().includes(query)
    );

    if (selectedPill === 'DANCING') {
      return filteredBySearch.filter(e => e.category === 'dancing');
    }
    if (selectedPill === 'GYM') {
      return filteredBySearch.filter(e => e.category === 'gym');
    }
    return filteredBySearch;
  };

  const getCountsForQuery = () => {
    const query = searchQuery.trim().toLowerCase();
    const filteredBySearch = AEROBIC_CATALOG.filter(
      e => e.displayName.toLowerCase().includes(query) || e.activityName.toLowerCase().includes(query)
    );
    return {
      ALL: filteredBySearch.length,
      DANCING: filteredBySearch.filter(e => e.category === 'dancing').length,
      GYM: filteredBySearch.filter(e => e.category === 'gym').length,
    };
  };

  const counts = getCountsForQuery();

  const handleSelectExercise = (item: ExerciseItem) => {
    if (item.trackingPolicy === 'telemetry') {
      navigation.navigate(ROUTES.DEMO_WEARABLE_SYNC, {
        activityName: item.displayName,
        baseMet: item.baseMet,
        cardio: item.cardio,
        strength: item.strength,
        balance: item.balance,
        recovery: item.recovery,
      });
    } else {
      navigation.navigate(ROUTES.DEMO_WORKOUT_LOG, {
        activityCode: item.id,
        activityName: item.displayName,
        category: item.category === 'dancing' ? 'Low-Impact Cardio' : 'Conditioning & Gym',
        baseMet: item.baseMet,
        cardio: item.cardio,
        strength: item.strength,
        balance: item.balance,
        recovery: item.recovery,
      });
    }
  };

  const currentList = getFilteredList();

  // Create section data for SectionList (used ONLY if ALL is selected, as count is 15 > 8)
  const getSectionData = () => {
    const light = currentList.filter(e => e.intensityBand === 'LIGHT');
    const moderate = currentList.filter(e => e.intensityBand === 'MODERATE');
    const vigorous = currentList.filter(e => e.intensityBand === 'VIGOROUS');

    return [
      { title: '🟢 LIGHT INTENSITY', data: light },
      { title: '🟡 MODERATE INTENSITY', data: moderate },
      { title: '🔴 VIGOROUS INTENSITY', data: vigorous },
    ].filter(sec => sec.data.length > 0);
  };

  const renderCard = ({ item }: { item: ExerciseItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSelectExercise(item)}
      activeOpacity={0.8}
    >
      <Text style={styles.cardEmoji}>{item.emoji}</Text>
      <View style={styles.cardTextWrapper}>
        <Text style={styles.cardTitle}>{item.displayName}</Text>
        <Text style={styles.cardSub}>{item.activityName}</Text>
      </View>
      <View style={[styles.badge, item.trackingPolicy === 'telemetry' ? styles.badgeTelemetry : styles.badgeManual]}>
        <Text style={styles.badgeText}>
          {item.trackingPolicy === 'telemetry' ? '⌚ Auto' : '✍️ Manual'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <Text style={styles.modalTitle}>🔍 All Activity Types</Text>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search activity..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Master Category Pills */}
      <View style={{ maxHeight: 60, marginBottom: 8 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContainer}
        >
          <TouchableOpacity
            style={[styles.pill, selectedPill === 'ALL' && styles.pillActive]}
            onPress={() => setSelectedPill('ALL')}
          >
            <Text style={[styles.pillText, selectedPill === 'ALL' && styles.pillTextActive]}>
              🎽 ALL ({counts.ALL})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, selectedPill === 'DANCING' && styles.pillActive]}
            onPress={() => setSelectedPill('DANCING')}
          >
            <Text style={[styles.pillText, selectedPill === 'DANCING' && styles.pillTextActive]}>
              💃 DANCING ({counts.DANCING})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.pill, selectedPill === 'GYM' && styles.pillActive]}
            onPress={() => setSelectedPill('GYM')}
          >
            <Text style={[styles.pillText, selectedPill === 'GYM' && styles.pillTextActive]}>
              🐀 GYM & CONDITION ({counts.GYM})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main content body */}
      <View style={styles.contentBody}>
        {selectedPill === null ? (
          /* Popular Workouts Block (Visible ONLY before any pill selection) */
          <View style={styles.popularBlock}>
            <Text style={styles.sectionTitle}>🔥 POPULAR WORKOUTS RIGHT NOW</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.popularList}>
                {POPULAR_WORKOUTS.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.card}
                    onPress={() => handleSelectExercise(item)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cardEmoji}>{item.emoji}</Text>
                    <View style={styles.cardTextWrapper}>
                      <Text style={styles.cardTitle}>{item.displayName}</Text>
                      <Text style={styles.cardSub}>{item.activityName}</Text>
                    </View>
                    <View style={[styles.badge, item.trackingPolicy === 'telemetry' ? styles.badgeTelemetry : styles.badgeManual]}>
                      <Text style={styles.badgeText}>
                        {item.trackingPolicy === 'telemetry' ? '⌚ Auto' : '✍️ Manual'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        ) : (selectedPill === 'DANCING' || selectedPill === 'GYM') && counts[selectedPill] > 8 ? (
          /* Rule 2: If count > 8, render structured SectionList */
          <SectionList
            sections={getSectionData()}
            keyExtractor={item => item.id}
            renderItem={renderCard}
            renderSectionHeader={({ section: { title } }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          /* Rule 2: If count <= 8, render clean simple FlatList (no headers) */
          <FlatList
            data={currentList}
            keyExtractor={item => item.id}
            renderItem={renderCard}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Sleek dark theme matching search modal design
  },
  searchHeader: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  searchBar: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInput: {
    color: '#F8FAFC',
    fontSize: 15,
  },
  pillsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingRight: 32,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  pillActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#60A5FA',
  },
  pillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  contentBody: {
    flex: 1,
    paddingHorizontal: 16,
  },
  popularBlock: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F59E0B',
    letterSpacing: 1,
    marginBottom: 12,
  },
  popularList: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTextWrapper: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  cardSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeTelemetry: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  badgeManual: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: '#0F172A',
  },
  sectionHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.5,
  },
});