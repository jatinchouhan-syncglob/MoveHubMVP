import React, { useState } from 'react';
import { ScrollView, Text, View, StatusBar, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomHeader } from '../../components/common/CustomHeader';
import { C, styles } from './style';
import {
  INITIAL_FOOD_LOG_DAYS,
  INITIAL_SAVED_MEAL_PLANS,
  INITIAL_SELECTED_DATE_ID,
  buildSavedMealPlan,
  getMealFilterLabel,
  replacePlannedMealValue,
  FoodLogDay,
  SavedMealPlan,
  MealFilter,
} from './constants';
import { MealFilterTabs, SavedMealPlanCard, NutritionIcon } from './components';
import DonutChart from '../../components/charts/DonutChart';

export const MealPlannerScreen: React.FC = () => {
  const [days, setDays] = useState<FoodLogDay[]>(INITIAL_FOOD_LOG_DAYS);
  const [savedPlans, setSavedPlans] = useState<SavedMealPlan[]>(INITIAL_SAVED_MEAL_PLANS);
  const [selectedDayId, setSelectedDayId] = useState<string>(INITIAL_SELECTED_DATE_ID);
  const [plannerFilter, setPlannerFilter] = useState<MealFilter>('breakfast');
  const [plannerInput, setPlannerInput] = useState('');

  const selectedDay = days.find(day => day.id === selectedDayId) || days[0];
  const selectedMeals = selectedDay.planner[plannerFilter] || [];

  const updateDay = (updater: (currentDay: FoodLogDay) => FoodLogDay) => {
    setDays(prev =>
      prev.map(day => (day.id === selectedDay.id ? updater(day) : day))
    );
  };

  const handleAddMeal = () => {
    const value = plannerInput.trim();
    if (!value) return;
    if (selectedMeals.includes(value)) return;

    updateDay(day => ({
      ...day,
      planner: {
        ...day.planner,
        [plannerFilter]: [...day.planner[plannerFilter], value],
      },
    }));

    setPlannerInput('');
  };

  const handleReplaceMeal = (index: number) => {
    updateDay(day => ({
      ...day,
      planner: {
        ...day.planner,
        [plannerFilter]: day.planner[plannerFilter].map((meal, i) =>
          i === index ? replacePlannedMealValue(meal) : meal
        ),
      },
    }));
  };

  const handleDeleteMeal = (index: number) => {
    updateDay(day => ({
      ...day,
      planner: {
        ...day.planner,
        [plannerFilter]: day.planner[plannerFilter].filter((_, i) => i !== index),
      },
    }));
  };

  const handleSavePlan = () => {
    const plan = buildSavedMealPlan(selectedDay);
    setSavedPlans(prev => {
      const others = prev.filter(p => p.id !== plan.id);
      return [plan, ...others];
    });
    Alert.alert('Success', 'Meal plan saved successfully!');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <CustomHeader
        title="Meal Planner"
        showDrawerButton
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.darkCard}>
          <View style={styles.cardTitleRow}>
            <View style={styles.cardTitleWrap}>
              <View style={[styles.iconBubble, styles.tealIconBubble]}>
                <NutritionIcon name="calendar-month-outline" size={18} color={C.teal} />
              </View>
              <View>
                <Text style={styles.cardTitle}>Meal Planner</Text>
                <Text style={styles.cardSubtitle}>
                  Plan meals for {selectedDay.fullDateLabel}
                </Text>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 12 }}>
            {(['breakfast', 'lunch', 'dinner', 'snacks'] as MealFilter[]).map(type => {
              const count = selectedDay.planner[type]?.length || 0;
              const pct = Math.min(count * 25, 100);
              return (
                <View key={type} style={{ alignItems: 'center' }}>
                  <DonutChart pct={pct} size={50} strokeWidth={5} color={C.green} />
                  <Text style={{ color: C.slate, fontSize: 10, marginTop: 4, textTransform: 'capitalize' }}>
                    {type}
                  </Text>
                </View>
              );
            })}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.plannerCalendarRow}>
              {days.map(day => {
                const isActive = day.id === selectedDay.id;
                return (
                  <TouchableOpacity
                    key={day.id}
                    onPress={() => setSelectedDayId(day.id)}
                    style={[styles.plannerDateChip, isActive && styles.plannerDateChipActive]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.plannerDateDay, isActive && styles.plannerDateDayActive]}>
                      {day.dayLabel}
                    </Text>
                    <Text style={[styles.plannerDateText, isActive && styles.plannerDateTextActive]}>
                      {day.dateLabel.split(' ')[1]}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <MealFilterTabs selectedFilter={plannerFilter} onSelect={setPlannerFilter} />

          <View style={styles.plannerInputRow}>
            <TextInput
              value={plannerInput}
              onChangeText={setPlannerInput}
              placeholder="Add planned meal item..."
              placeholderTextColor={C.slate}
              style={[styles.searchInput, styles.flexInput]}
            />
            <TouchableOpacity
              onPress={handleAddMeal}
              style={[styles.addButton, { marginTop: 0, height: 48, paddingHorizontal: 16 }]}
              activeOpacity={0.8}
            >
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
            {['Oats', 'Eggs', 'Rice', 'Salad'].map(item => (
              <TouchableOpacity key={item} onPress={() => setPlannerInput(item)}>
                <Text style={{ color: C.teal, fontWeight: '700', fontSize: 13 }}>+ {item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ color: C.slate, marginBottom: 16, fontSize: 12 }}>
            💡 Tip: Add protein-rich meals for better training recovery
          </Text>

          <View style={styles.plannerListCard}>
            <Text style={[styles.cardTitle, { marginBottom: 12 }]}>
              Planned {getMealFilterLabel(plannerFilter)} Items
            </Text>

            {selectedMeals.length ? (
              selectedMeals.map((meal, index) => (
                <View key={index} style={styles.plannerMealRow}>
                  <Text style={styles.plannerMealName}>{meal}</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TouchableOpacity
                      onPress={() => handleReplaceMeal(index)}
                      style={styles.replaceButton}
                    >
                      <Text style={styles.replaceButtonText}>Replace</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteMeal(index)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No meals planned for this slot.</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSavePlan}
            style={styles.saveButton}
            activeOpacity={0.8}
          >
            <Text style={styles.saveButtonText}>Save Daily Plan</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.darkCard, styles.sectionSpacing]}>
          <Text style={[styles.cardTitle, { marginBottom: 12 }]}>Saved Meal Plans</Text>
          {savedPlans.length ? (
            savedPlans.map(plan => (
              <SavedMealPlanCard key={plan.id} plan={plan} />
            ))
          ) : (
            <Text style={styles.emptyText}>No saved meal plans available.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MealPlannerScreen;
