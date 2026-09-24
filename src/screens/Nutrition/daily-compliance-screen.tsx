import React from 'react';
import { Text, View, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { CustomHeader } from '../../components/common/CustomHeader';
import { C, styles } from './style';
import DonutChart from '../../components/charts/DonutChart';
import { NutritionIcon } from './components';

export const DailyComplianceScreen: React.FC = () => {
  const route = useRoute<any>();
  const params = route.params || {};

  const fallbackMeals = {
    breakfast: [{ id: 1 }],
    lunch: [{ id: 2 }],
    dinner: [],
    snacks: [],
  };

  const fallbackCalories = {
    calories: 1450,
  };

  const fallbackGoal = 2200;

  const nutritionTotals =
    params.nutritionTotals?.calories > 0
      ? params.nutritionTotals
      : fallbackCalories;

  const calorieGoal =
    params.calorieGoal > 0 ? params.calorieGoal : fallbackGoal;

  const meals =
    Object.keys(params.meals || {}).length > 0 ? params.meals : fallbackMeals;

  const plannerComplianceStatus = params.plannerComplianceStatus || 'compliant';
  const plannerComplianceText = params.plannerComplianceText || 'On Track ✅';

  const caloriePct = Math.min(
    (nutritionTotals.calories / calorieGoal) * 100,
    100
  );

  const mealEntries = Object.entries(meals);
  const completedMeals = mealEntries.filter(
    ([, list]: any) => list.length > 0
  ).length;
  const totalMeals = mealEntries.length;
  const complianceScore = Math.round((completedMeals / totalMeals) * 100);

  const calorieStatus =
    caloriePct >= 95
      ? 'Goal Achieved 🎯'
      : caloriePct >= 75
      ? 'On Track 👍'
      : 'Below Target ⚠️';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <CustomHeader
        title="Daily Compliance"
        showDrawerButton
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <View style={styles.darkCard}>
          <View style={styles.cardTitleRow}>
            <View style={styles.cardTitleWrap}>
              <View style={[styles.iconBubble, styles.tealIconBubble]}>
                <NutritionIcon name="shield-check-outline" size={18} color={C.teal} />
              </View>
              <Text style={styles.cardTitle}>Daily Compliance Summary</Text>
            </View>
            <View
              style={[
                styles.complianceBadge,
                plannerComplianceStatus === 'compliant'
                  ? styles.compliantBadge
                  : styles.notCompliantBadge,
              ]}
            >
              <Text
                style={[
                  styles.complianceText,
                  plannerComplianceStatus === 'compliant'
                    ? styles.compliantText
                    : styles.notCompliantText,
                ]}
              >
                {plannerComplianceText}
              </Text>
            </View>
          </View>

          <View style={styles.complianceSection}>
            <View style={{ width: 120, height: 120, position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
              <DonutChart pct={caloriePct} size={120} strokeWidth={10} color={C.teal} />
              <View style={styles.donutOverlay}>
                <Text style={styles.donutValue}>{Math.round(caloriePct)}%</Text>
              </View>
            </View>
            <View style={{ height: 12 }} />
            <Text style={styles.complianceMetricValue}>
              {nutritionTotals.calories} / {calorieGoal} kcal
            </Text>
            <Text style={{ color: C.slate, marginTop: 4, fontWeight: '700' }}>{calorieStatus}</Text>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.analysisTitle}>Daily Insights</Text>
            <Text style={{ color: C.slate, marginTop: 6, fontWeight: '600' }}>
              🍽️ Meals Completed: {completedMeals} / {totalMeals}
            </Text>
            <Text style={{ color: C.slate, fontWeight: '600', marginTop: 4 }}>
              📊 Compliance Score: {complianceScore}%
            </Text>
            <Text style={{ color: C.slate, fontWeight: '600', marginTop: 4 }}>
              ⏱️ Consistency: {complianceScore >= 75 ? 'Good 👍' : 'Improve ⚠️'}
            </Text>
          </View>

          <View style={styles.analysisSection}>
            {mealEntries.map(([key, mealList]: any) => {
              const isCompleted = mealList.length > 0;
              const pct = isCompleted ? 100 : 20;

              return (
                <View key={key} style={{ marginVertical: 6 }}>
                  <View style={styles.analysisRow}>
                    <Text
                      style={{
                        color: C.black,
                        textTransform: 'capitalize',
                        fontWeight: '700',
                      }}
                    >
                      {key}
                    </Text>
                    <Text style={{ color: isCompleted ? C.green : C.slate, fontWeight: '700' }}>
                      {isCompleted ? 'Completed ✅' : 'Pending ⏳'}
                    </Text>
                  </View>
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${pct}%` },
                        {
                          backgroundColor: isCompleted ? C.teal : C.border,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>

          <View style={{ marginTop: 24 }}>
            <Text style={styles.analysisTitle}>Recommendations</Text>
            <Text style={{ color: C.slate, marginTop: 8, fontSize: 13, lineHeight: 18 }}>
              • Try to complete all 4 planned meals for better training consistency
            </Text>
            <Text style={{ color: C.slate, marginTop: 4, fontSize: 13, lineHeight: 18 }}>
              • Maintain calorie balance throughout the day to avoid metabolic spikes
            </Text>
            <Text style={{ color: C.slate, marginTop: 4, fontSize: 13, lineHeight: 18 }}>
              • Avoid skipping breakfast for better fat oxidation and metabolism
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DailyComplianceScreen;
