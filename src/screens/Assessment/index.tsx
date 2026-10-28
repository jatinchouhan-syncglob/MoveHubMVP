import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomHeader } from '../../components/common/CustomHeader';
import { LifestyleProfilerScreen } from '../LifestyleProfiler';
import { ExercisePrescriptionScreen } from '../ExercisePrescription';
import { NutritionalProfilerScreen } from '../NutritionalProfiler';

export type AssessmentTabType = 'lifestyle' | 'exercise' | 'nutritional';

interface TabItem {
  key: AssessmentTabType;
  label: string;
  icon: string;
}

const TABS: TabItem[] = [
  { key: 'lifestyle', label: 'Lifestyle Questionnaire', icon: '📋' },
  { key: 'exercise', label: 'Exercise Prescription', icon: '🏋️‍♂️' },
  { key: 'nutritional', label: 'Nutritional Profiler', icon: '🥗' },
];

export const AssessmentScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AssessmentTabType>('lifestyle');
  const scrollRef = useRef<ScrollView>(null);
  const tabPositions = useRef<{ [key: string]: number }>({});

  const scrollToTab = (tabKey: AssessmentTabType) => {
    const targetX = tabPositions.current[tabKey];
    if (scrollRef.current && targetX !== undefined) {
      if (tabKey === 'lifestyle') {
        scrollRef.current.scrollTo({ x: 0, animated: true });
      } else {
        scrollRef.current.scrollTo({
          x: Math.max(0, targetX - 24),
          animated: true,
        });
      }
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToTab(activeTab);
    }, 60);
    return () => clearTimeout(timer);
  }, [activeTab]);

  const handleTabPress = (tabKey: AssessmentTabType) => {
    setActiveTab(tabKey);
    scrollToTab(tabKey);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader
        title="Assessment"
        showDrawerButton
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />

      <View style={styles.tabBarWrapper}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabBarContent}
        >
          {TABS.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onLayout={e => {
                  tabPositions.current[tab.key] = e.nativeEvent.layout.x;
                }}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                onPress={() => handleTabPress(tab.key)}
                activeOpacity={0.75}
              >
                <Text style={styles.tabIcon}>{tab.icon}</Text>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {isActive && <View style={styles.activeIndicator} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Tab Viewport */}
      <View style={styles.contentViewport}>
        {activeTab === 'lifestyle' && (
          <LifestyleProfilerScreen
            isEmbedded={true}
            onComplete={() => setActiveTab('exercise')}
          />
        )}
        {activeTab === 'exercise' && (
          <ExercisePrescriptionScreen
            isEmbedded={true}
            onNext={() => setActiveTab('nutritional')}
          />
        )}
        {activeTab === 'nutritional' && (
          <NutritionalProfilerScreen
            isEmbedded={true}
            onComplete={() => {}}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E17',
  },
  headerContainer: {
    backgroundColor: '#0B0F19',
    borderBottomColor: '#1E293B',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerButton: {
    backgroundColor: '#0F172A',
    borderColor: '#1E293B',
  },
  headerIcon: {
    color: '#FFFFFF',
  },
  tabBarWrapper: {
    backgroundColor: '#0B0F19',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  tabBarContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: '#38BDF8',
  },
  tabIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  tabLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabLabelActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -10,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: '#38BDF8',
    borderRadius: 1,
  },
  contentViewport: {
    flex: 1,
  },
});

export default AssessmentScreen;
