import React from 'react';
import { View, Text, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { CustomHeader } from '../../components/common/CustomHeader';
import { C, styles } from './style';
import DonutChart from '../../components/charts/DonutChart';
import { NutritionIcon } from './components';

export const WeeklyComplianceScreen: React.FC = () => {
  const route = useRoute<any>();
  const params = route.params || {};

  const fallbackData = [
    { day: 'Mon', value: 80 },
    { day: 'Tue', value: 65 },
    { day: 'Wed', value: 90 },
    { day: 'Thu', value: 75 },
    { day: 'Fri', value: 85 },
    { day: 'Sat', value: 50 },
    { day: 'Sun', value: 95 },
  ];

  const weeklyData =
    params.weeklyComplianceData?.length > 0
      ? params.weeklyComplianceData
      : fallbackData;

  const weeklyAverage = Math.round(
    weeklyData.reduce((sum: number, item: any) => sum + item.value, 0) /
      weeklyData.length
  );

  const bestDay = weeklyData.reduce((a: any, b: any) =>
    a.value > b.value ? a : b
  );

  const worstDay = weeklyData.reduce((a: any, b: any) =>
    a.value < b.value ? a : b
  );

  const consistency =
    weeklyAverage >= 80
      ? 'Excellent 🔥'
      : weeklyAverage >= 60
      ? 'Good 👍'
      : 'Needs Improvement ⚠️';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <CustomHeader
        title="Weekly Compliance"
        showDrawerButton
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        <View style={styles.darkCard}>
          <View style={styles.cardTitleRow}>
            <View style={styles.cardTitleWrap}>
              <View style={[styles.iconBubble, styles.blueIconBubble]}>
                <NutritionIcon name="chart-bar" size={18} color={C.blue} />
              </View>
              <Text style={styles.cardTitle}>Weekly Compliance Trends</Text>
            </View>
          </View>

          <View style={styles.complianceSection}>
            <View style={{ width: 120, height: 120, position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
              <DonutChart pct={weeklyAverage} size={120} strokeWidth={10} color={C.blue} />
              <View style={styles.donutOverlay}>
                <Text style={styles.donutValue}>{weeklyAverage}%</Text>
              </View>
            </View>
            <View style={{ height: 12 }} />
            <Text style={styles.complianceMetricValue}>Weekly Average</Text>
            <Text style={{ color: C.slate, marginTop: 4, fontWeight: '700' }}>{consistency}</Text>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.analysisTitle}>Weekly Metrics</Text>
            <Text style={{ color: C.slate, marginTop: 8, fontWeight: '600', fontSize: 13 }}>
              🌟 Best Day: {bestDay.day} ({bestDay.value}%)
            </Text>
            <Text style={{ color: C.slate, marginTop: 4, fontWeight: '600', fontSize: 13 }}>
              ⚠️ Worst Day: {worstDay.day} ({worstDay.value}%)
            </Text>
            <Text style={{ color: C.slate, marginTop: 4, fontWeight: '600', fontSize: 13 }}>
              📊 Consistency Score: {weeklyAverage}%
            </Text>
          </View>

          <View style={styles.analysisSection}>
            <Text style={[styles.analysisTitle, { marginBottom: 12 }]}>Daily breakdown</Text>
            {weeklyData.map((item: any, idx: number) => {
              const value = item.value;
              const color = value >= 80 ? C.green : value >= 60 ? C.teal : C.coral;

              return (
                <View key={`wday-${item.day}-${idx}`} style={{ marginVertical: 6 }}>
                  <View style={styles.analysisRow}>
                    <Text style={{ color: C.black, fontWeight: '700' }}>{item.day}</Text>
                    <Text style={{ color: color, fontWeight: '700' }}>{value}%</Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${value}%` },
                        { backgroundColor: color },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ marginTop: 24 }}>
            <Text style={styles.analysisTitle}>Weekly Insights</Text>
            <Text style={{ color: C.slate, marginTop: 8, fontSize: 13, lineHeight: 18 }}>
              • Weekend dip detected on {worstDay.day}. Focus on maintaining regular meal plans even during rest days.
            </Text>
            <Text style={{ color: C.slate, marginTop: 4, fontSize: 13, lineHeight: 18 }}>
              • Great energy loading on {bestDay.day}, which corresponds to optimal training performance.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WeeklyComplianceScreen;
