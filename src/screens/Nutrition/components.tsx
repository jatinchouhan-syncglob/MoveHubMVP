import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { C, styles } from './style';
import { MealEntry, MealFilter, SavedMealPlan, NUTRIENT_CONFIG, getMealFilterLabel } from './constants';
import DonutChart from '../../components/charts/DonutChart';

// 1. Local Svg Icon Provider to bypass font linking issues
export const NutritionIcon: React.FC<{
  name: string;
  size?: number;
  color?: string;
}> = ({ name, size = 16, color = '#64748B' }) => {
  // Return simple unicode emoji or custom shapes for premium look
  const emojiMap: Record<string, string> = {
    'coffee-outline': '☕',
    'food-variant': '🥗',
    'silverware-fork-knife': '🍽️',
    'food-apple-outline': '🍎',
    'silverware-variant': '🍴',
    'bell-alert-outline': '🔔',
    'shield-check-outline': '🛡️',
    'nutrition': '🥑',
    'calendar-month-outline': '📅',
    'chart-bar': '📊',
    'chevron-left': '◀',
    'chevron-right': '▶',
    'food-outline': '🍲',
  };

  const symbol = emojiMap[name] || '🍽️';
  return (
    <Text style={{ fontSize: size, color, textAlign: 'center', lineHeight: size + 4 }}>
      {symbol}
    </Text>
  );
};

// 2. Date Navigation Component
interface DateNavigationProps {
  dayLabel: string;
  dateLabel: string;
  fullDateLabel: string;
  disablePrevious: boolean;
  disableNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const DateNavigation: React.FC<DateNavigationProps> = ({
  dayLabel,
  dateLabel,
  fullDateLabel,
  disablePrevious,
  disableNext,
  onPrevious,
  onNext,
}) => {
  return (
    <View style={styles.dateHeaderCard}>
      <View style={styles.dateHeaderTopRow}>
        <Text style={styles.dateEyebrow}>Nutrition Log</Text>
      </View>
      <View style={styles.dateMainRow}>
        <TouchableOpacity
          onPress={onPrevious}
          disabled={disablePrevious}
          style={[styles.navButton, disablePrevious && styles.navButtonDisabled]}
          activeOpacity={0.7}
        >
          <NutritionIcon name="chevron-left" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.dateContent}>
          <Text style={styles.dateDay}>{dayLabel}</Text>
          <Text style={styles.dateText}>{dateLabel}</Text>
          <Text style={styles.dateHint}>{fullDateLabel}</Text>
        </View>
        <TouchableOpacity
          onPress={onNext}
          disabled={disableNext}
          style={[styles.navButton, disableNext && styles.navButtonDisabled]}
          activeOpacity={0.7}
        >
          <NutritionIcon name="chevron-right" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// 3. Nutrition Summary Card
interface NutritionSummaryProps {
  calories: number;
  calorieGoal: number;
  protein: number;
  fats: number;
  carbs: number;
  fibre: number;
  activeDayLabel: string;
}

const MAX_VALUES = {
  protein: 150,
  fats: 80,
  carbs: 250,
  fibre: 35,
};

export const NutritionSummaryCard: React.FC<NutritionSummaryProps> = ({
  calories,
  calorieGoal,
  protein,
  fats,
  carbs,
  fibre,
  activeDayLabel,
}) => {
  const values = { protein, fats, carbs, fibre };
  const size = 100;
  const sizeMin = 64;

  const pct = calorieGoal ? Math.min((calories / calorieGoal) * 100, 100) : 0;

  return (
    <View style={styles.darkCard}>
      <View style={styles.cardTitleRow}>
        <View style={styles.cardTitleWrap}>
          <View style={[styles.iconBubble, styles.tealIconBubble]}>
            <NutritionIcon name="nutrition" size={20} color={C.teal} />
          </View>
          <View>
            <Text style={styles.cardTitle}>Today's Nutrition</Text>
            <Text style={styles.cardSubtitle}>Logged meals for {activeDayLabel}</Text>
          </View>
        </View>
        <View style={{ width: size * 1.1, height: size * 1.1, position: 'relative' }}>
          <DonutChart pct={pct} size={size * 1.1} color={C.teal} />
          <View style={styles.donutOverlay}>
            <Text style={styles.donutValue}>{Math.round(pct)}%</Text>
            <Text style={styles.nutritionMeta}>{calories} / {calorieGoal} kcal</Text>
          </View>
        </View>
      </View>

      <View style={styles.nutrientGrid}>
        {NUTRIENT_CONFIG.map(item => {
          const value = values[item.key as keyof typeof values];
          const max = MAX_VALUES[item.key as keyof typeof MAX_VALUES];
          const percentage = max ? Math.min((value / max) * 100, 100) : 0;

          return (
            <View key={item.key} style={styles.nutrientTile}>
              <View style={styles.circleValuesContainer}>
                <DonutChart pct={percentage} size={sizeMin} color={item.color} />
                <View style={styles.donutOverlay}>
                  <Text style={[styles.donutValue, { fontSize: 13 }]}>{value}g</Text>
                  <Text style={[styles.nutrientName, { fontSize: 9 }]}>{item.label}</Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

// 4. Meal Filter Tabs
interface MealFilterTabsProps {
  selectedFilter: MealFilter;
  onSelect: (filter: MealFilter) => void;
}

const FILTER_ICONS: Record<MealFilter, string> = {
  breakfast: 'coffee-outline',
  lunch: 'food-variant',
  dinner: 'silverware-fork-knife',
  snacks: 'food-apple-outline',
};

export const MealFilterTabs: React.FC<MealFilterTabsProps> = ({ selectedFilter, onSelect }) => {
  const list: MealFilter[] = ['breakfast', 'lunch', 'dinner', 'snacks'];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterScrollContent}
    >
      {list.map(filter => {
        const isActive = filter === selectedFilter;
        return (
          <TouchableOpacity
            key={filter}
            onPress={() => onSelect(filter)}
            style={[styles.filterTab, isActive && styles.filterTabActive]}
            activeOpacity={0.7}
          >
            <View style={styles.filterIconWrap}>
              <NutritionIcon
                name={FILTER_ICONS[filter]}
                size={14}
                color={isActive ? '#FFFFFF' : C.slate}
              />
            </View>
            <Text style={[styles.filterLabel, isActive && styles.filterLabelActive]}>
              {getMealFilterLabel(filter)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

// 5. Meal Log Item
interface MealLogItemProps {
  item: MealEntry;
  mealFilter: MealFilter;
}

export const MealLogItem: React.FC<MealLogItemProps> = ({ item, mealFilter }) => {
  const macroChips = [
    `Protein: ${item.protein}g`,
    `Fats: ${item.fats}g`,
    `Carbs: ${item.carbs}g`,
    `Fibre: ${item.fibre}g`,
  ];

  const icons: Record<MealFilter, string> = {
    breakfast: 'coffee-outline',
    lunch: 'food-outline',
    dinner: 'silverware-fork-knife',
    snacks: 'food-apple-outline',
  };

  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <View style={styles.mealNameRow}>
          <View style={styles.iconBubble}>
            <NutritionIcon name={icons[mealFilter]} size={16} color={C.green} />
          </View>
          <Text style={styles.mealName}>{item.name}</Text>
        </View>
        <Text style={styles.mealCalories}>{item.calories} kcal</Text>
      </View>
      <View style={styles.macroRow}>
        {macroChips.map(chip => (
          <View key={chip} style={styles.macroChip}>
            <Text style={styles.macroChipText}>{chip}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

// 6. Saved Meal Plan Card
interface SavedMealPlanCardProps {
  plan: SavedMealPlan;
}

const PLANNER_SLOTS: MealFilter[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

export const SavedMealPlanCard: React.FC<SavedMealPlanCardProps> = ({ plan }) => {
  const isCompliant = plan.complianceStatus === 'compliant';
  return (
    <View style={styles.savedPlanCard}>
      <View style={styles.savedPlanHeader}>
        <View>
          <Text style={styles.savedPlanTitle}>{plan.dayLabel}</Text>
          <Text style={styles.savedPlanDate}>{plan.dateLabel}</Text>
        </View>
        <View
          style={[
            styles.complianceBadge,
            isCompliant ? styles.compliantBadge : styles.notCompliantBadge,
          ]}
        >
          <Text style={[styles.complianceText, isCompliant ? styles.compliantText : styles.notCompliantText]}>
            {isCompliant ? 'Compliant' : 'Non-Compliant'}
          </Text>
        </View>
      </View>

      {PLANNER_SLOTS.map(slot => {
        const value = plan.meals[slot]?.length
          ? plan.meals[slot].join(', ')
          : 'Not Planned';

        return (
          <View key={slot} style={styles.savedSlotRow}>
            <Text style={styles.savedSlotLabel}>{getMealFilterLabel(slot)}</Text>
            <Text style={styles.savedSlotValue}>{value}</Text>
          </View>
        );
      })}
    </View>
  );
};
