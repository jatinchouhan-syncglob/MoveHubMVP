import React, { useState } from 'react';
import {
  Text,
  View,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomHeader } from '../../components/common/CustomHeader';
import { C, styles } from './style';
import DonutChart from '../../components/charts/DonutChart';
import { NutritionIcon } from './components';

const TABS = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export const MealAnalysisScreen: React.FC = () => {
  const [selectedMeal, setSelectedMeal] = useState('Breakfast');

  const mealsData: Record<string, { protein: number; carbs: number; fats: number }> = {
    Breakfast: { protein: 12, carbs: 62, fats: 5 },
    Lunch: { protein: 36, carbs: 16, fats: 12 },
    Dinner: { protein: 40, carbs: 30, fats: 15 },
    Snacks: { protein: 10, carbs: 20, fats: 8 },
  };

  const { protein, carbs, fats } = mealsData[selectedMeal];
  const total = protein + carbs + fats || 1;

  const proteinPct = Math.round((protein / total) * 100);
  const carbsPct = Math.round((carbs / total) * 100);
  const fatsPct = Math.round((fats / total) * 100);

  const calories = protein * 4 + carbs * 4 + fats * 9;
  const mealScore = Math.min(
    Math.round(proteinPct * 0.4 + (100 - carbsPct) * 0.3 + (100 - fatsPct) * 0.3),
    100
  );

  const mealQuality =
    mealScore >= 80
      ? 'Excellent 🔥'
      : mealScore >= 60
      ? 'Good 👍'
      : 'Needs Improvement ⚠️';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <CustomHeader
        title="Meal Analysis"
        showDrawerButton
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={{ flexDirection: 'row', padding: 12, gap: 8, backgroundColor: C.surfaceAlt, borderBottomWidth: 1, borderBottomColor: C.border }}>
        {TABS.map(tab => {
          const isActive = selectedMeal === tab;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setSelectedMeal(tab)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: isActive ? C.teal : '#f1f5f9',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: isActive ? C.teal : C.border,
              }}
              activeOpacity={0.7}
            >
              <Text
                style={{
                  color: isActive ? '#ffffff' : C.slate,
                  fontWeight: '700',
                  fontSize: 13,
                }}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
        <View style={styles.darkCard}>
          <View style={{ alignItems: 'center', marginVertical: 12 }}>
            <DonutChart
              pct={[
                { color: C.teal, pct: proteinPct },
                { color: C.blue, pct: carbsPct },
                { color: C.amber, pct: fatsPct },
              ]}
              size={160}
              strokeWidth={14}
            />
            <View style={{ height: 16 }} />
            <Text style={styles.donutValue}>{selectedMeal} Macros</Text>
            <Text style={{ color: C.slate, marginTop: 4, fontWeight: '600', fontSize: 13 }}>
              Balanced nutrition breakdown
            </Text>
          </View>

          <View style={{ gap: 12, marginTop: 20 }}>
            <View style={styles.analysisRow}>
              <Text style={{ color: C.teal, fontWeight: '800' }}>Protein</Text>
              <Text style={styles.analysisValue}>
                {proteinPct}% ({protein}g)
              </Text>
            </View>
            <View style={styles.analysisRow}>
              <Text style={{ color: C.blue, fontWeight: '800' }}>Carbs</Text>
              <Text style={styles.analysisValue}>
                {carbsPct}% ({carbs}g)
              </Text>
            </View>
            <View style={styles.analysisRow}>
              <Text style={{ color: C.amber, fontWeight: '800' }}>Fat</Text>
              <Text style={styles.analysisValue}>
                {fatsPct}% ({fats}g)
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 24, gap: 10 }}>
            <Text style={styles.analysisTitle}>Meal Insights</Text>
            <Text style={{ color: C.slate, fontWeight: '600', fontSize: 13 }}>
              🔥 Estimated Calories: {calories} kcal
            </Text>
            <Text style={{ color: C.slate, fontWeight: '600', fontSize: 13 }}>
              📊 Meal Quality Score: {mealScore}/100 ({mealQuality})
            </Text>
            <Text style={{ color: C.slate, fontWeight: '600', fontSize: 13 }}>
              💧 Hydration Tip: Drink at least 1–2 glasses of water with this meal
            </Text>
            <Text style={{ color: C.slate, fontWeight: '600', fontSize: 13 }}>
              🌾 Fibre Suggestion: Add vegetables or fruits for better digestion
            </Text>
          </View>

          <View style={{ marginTop: 24, gap: 12 }}>
            <View style={styles.analysisCardTeal}>
              <Text style={styles.analysisTitle}>Protein Intake</Text>
              <Text style={styles.analysisSub}>
                {proteinPct >= 25
                  ? 'Muscle support optimized 💪'
                  : 'Consider adding eggs, chicken, or tofu to boost protein ⚠️'}
              </Text>
            </View>
            <View style={styles.analysisCardRed}>
              <Text style={styles.analysisTitle}>Carb Loading</Text>
              <Text style={styles.analysisSub}>
                {carbsPct > 55
                  ? 'High carbs detected. Consider swapping refined carbs for vegetables ❌'
                  : 'Balanced energy source. Complex carb levels are optimal ⚡'}
              </Text>
            </View>
            <View style={styles.analysisCardGreen}>
              <Text style={styles.analysisTitle}>Healthy Fats</Text>
              <Text style={styles.analysisSub}>
                {fatsPct < 15
                  ? 'Consider adding healthy fats like nuts, seeds, or olive oil 🥑'
                  : 'Healthy fat intake levels are supportive for hormone production 👍'}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 24 }}>
            <Text style={styles.analysisTitle}>Recommendations</Text>
            <Text style={{ color: C.slate, marginTop: 6 }}>
              • Include more whole foods instead of processed items
            </Text>
            <Text style={{ color: C.slate }}>
              • Maintain balanced macro ratio for better performance
            </Text>
            <Text style={{ color: C.slate }}>
              • Add greens for micronutrients
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MealAnalysisScreen;
