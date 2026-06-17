import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, RefreshControl } from 'react-native';
import { theme } from '../../theme';
import { STRINGS } from '../../constants/strings';
import { CustomHeader } from '../../components/common/CustomHeader';
import { Loader } from '../../components/common/Loader';
import { InsightCard } from '../../components/cards/InsightCard';
import { TrendChart } from '../../components/charts/TrendChart';
import { apiService } from '../../services/api';
import { Insight, TrendData } from '../../types';

export const InsightsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [stepTrends, setStepTrends] = useState<TrendData | null>(null);

  const fetchInsightsData = async () => {
    try {
      const [insightsData, trendsData] = await Promise.all([
        apiService.getInsights(),
        apiService.getStepTrends(),
      ]);
      setInsights(insightsData);
      setStepTrends(trendsData);
    } catch (error) {
      console.error('Failed to fetch insights data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsightsData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInsightsData();
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={STRINGS.INSIGHTS.TITLE} showDrawerButton />
      
      {/* Background Soft Glow Spots */}
      <View style={styles.glowSpot1} />
      <View style={styles.glowSpot2} />

      {loading && insights.length === 0 ? (
        <Loader fullScreen message="Analyzing fitness logs..." />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={[theme.colors.primary]} />
          }
        >
          {/* Trend Chart */}
          {stepTrends && (
            <TrendChart
              title="Daily Steps Breakdown"
              trendData={stepTrends}
            />
          )}

          {/* Recommendations Header */}
          <Text style={styles.sectionTitle}>{STRINGS.INSIGHTS.RECOMMENDATION}</Text>

          {/* Insights List */}
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: 'relative',
  },
  glowSpot1: {
    position: 'absolute',
    top: '10%',
    right: '-15%',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: theme.colors.primaryLight + '20',
    zIndex: -1,
  },
  glowSpot2: {
    position: 'absolute',
    bottom: '20%',
    left: '-15%',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: theme.colors.secondary + '08',
    zIndex: -1,
  },
  scrollContent: {
    padding: theme.spacing.containerPadding,
  },
  sectionTitle: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
});

export default InsightsScreen;
