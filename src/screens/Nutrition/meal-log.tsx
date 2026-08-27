import React, { useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Modal,
  Pressable,
  StatusBar,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomHeader } from '../../components/common/CustomHeader';
import { C, styles } from './style';
import {
  INITIAL_FOOD_LOG_DAYS,
  INITIAL_SELECTED_DATE_ID,
  createGeneratedMealEntry,
  getMealFilterLabel,
  STATIC_MEALS,
  FoodLogDay,
  MealEntry,
  MealFilter,
} from './constants';
import {
  DateNavigation,
  MealFilterTabs,
  MealLogItem,
  NutritionSummaryCard,
  NutritionIcon,
} from './components';

export const MealLogScreen: React.FC = () => {
  const [foodLogDays, setFoodLogDays] = useState<FoodLogDay[]>(INITIAL_FOOD_LOG_DAYS);
  const [selectedDateId, setSelectedDateId] = useState<string>(INITIAL_SELECTED_DATE_ID);
  const [selectedMealFilter, setSelectedMealFilter] = useState<MealFilter>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [mealInput, setMealInput] = useState('');
  const [showAddMealModal, setShowAddMealModal] = useState(false);

  // Use local state for selections instead of react-hook-form to prevent package dependencies
  const [selectedMealIds, setSelectedMealIds] = useState<string[]>([]);

  const toggleMealSelection = (id: string) => {
    setSelectedMealIds(prev =>
      prev.includes(id) ? prev.filter(mid => mid !== id) : [...prev, id]
    );
  };

  const generateUniqueMealName = (baseName: string, existingMeals: MealEntry[]): string => {
    const regex = new RegExp(
      `^${baseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?: \\((\\d+)\\))?$`
    );
    let maxCount = 0;
    existingMeals.forEach(meal => {
      const match = meal.name.match(regex);
      if (match) {
        const count = match[1] ? parseInt(match[1], 10) : 1;
        if (count > maxCount) maxCount = count;
      }
    });
    return maxCount === 0 ? baseName : `${baseName} (${maxCount + 1})`;
  };

  const matchingMeals = searchQuery.trim()
    ? STATIC_MEALS.filter(meal =>
        meal.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const selectedDateIndex = foodLogDays.findIndex(day => day.id === selectedDateId);
  const selectedDay = foodLogDays[selectedDateIndex >= 0 ? selectedDateIndex : 0];

  const allMeals = Object.values(selectedDay.meals).reduce<MealEntry[]>(
    (accumulator, mealList) => [...accumulator, ...mealList],
    []
  );

  const filteredMeals = selectedDay.meals[selectedMealFilter].filter(meal => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) {
      return true;
    }
    return meal.name.toLowerCase().includes(normalizedQuery);
  });

  const nutritionTotals = allMeals.reduce(
    (accumulator, meal) => ({
      calories: accumulator.calories + meal.calories,
      protein: accumulator.protein + meal.protein,
      fats: accumulator.fats + meal.fats,
      carbs: accumulator.carbs + meal.carbs,
      fibre: accumulator.fibre + meal.fibre,
    }),
    { calories: 0, protein: 0, fats: 0, carbs: 0, fibre: 0 }
  );

  const updateSelectedDay = (nextIndex: number) => {
    const nextDay = foodLogDays[nextIndex];
    if (nextDay) {
      setSelectedDateId(nextDay.id);
    }
  };

  const updateFoodLogDay = (updater: (currentDay: FoodLogDay) => FoodLogDay) => {
    setFoodLogDays(previousDays =>
      previousDays.map(day => {
        if (day.id !== selectedDay.id) {
          return day;
        }
        return updater(day);
      })
    );
  };

  const handleAddSelectedMeals = () => {
    const selectedMeals = STATIC_MEALS.filter(meal => selectedMealIds.includes(meal.id));
    updateFoodLogDay(day => {
      const newMeals = selectedMeals.map(meal => {
        const uniqueName = generateUniqueMealName(meal.name, day.meals[selectedMealFilter]);
        return {
          id: `${meal.id}-${Date.now()}-${Math.random()}`,
          name: uniqueName,
          calories: meal.calories,
          protein: meal.protein,
          fats: meal.fats,
          carbs: meal.carbs,
          fibre: meal.fibre,
        };
      });
      return {
        ...day,
        meals: {
          ...day.meals,
          [selectedMealFilter]: [...newMeals, ...day.meals[selectedMealFilter]],
        },
      };
    });
    setSelectedMealIds([]);
    setSearchQuery('');
  };

  const handleAddMealLog = () => {
    const trimmedMeal = mealInput.trim();
    if (!trimmedMeal) {
      return;
    }

    updateFoodLogDay(day => {
      const uniqueName = generateUniqueMealName(trimmedMeal, day.meals[selectedMealFilter]);
      return {
        ...day,
        meals: {
          ...day.meals,
          [selectedMealFilter]: [
            createGeneratedMealEntry(uniqueName),
            ...day.meals[selectedMealFilter],
          ],
        },
      };
    });

    setMealInput('');
  };

  // const handleTakePhoto = () => {
  //   Alert.alert(
  //     'Meal Photo Recognition',
  //     'Select a photo of your food. AI will analyze the calories and log it automatically.',
  //     [
  //       {
  //         text: 'Choose from Gallery',
  //         onPress: () => {
  //           const mockFood = ['Fruit Bowl', 'Chicken Salad', 'Eggs and Toast', 'Protein Bar'][Math.floor(Math.random() * 4)];
  //           updateFoodLogDay(day => ({
  //             ...day,
  //             meals: {
  //               ...day.meals,
  //               [selectedMealFilter]: [
  //                 createGeneratedMealEntry(`AI: ${mockFood}`),
  //                 ...day.meals[selectedMealFilter],
  //               ],
  //             },
  //           }));
  //           Alert.alert('AI Recognized', `Recognized "${mockFood}" successfully. Meal added to your log.`);
  //         }
  //       },
  //       { text: 'Cancel', style: 'cancel' }
  //     ]
  //   );
  // };

  const renderMealItem: ListRenderItem<MealEntry> = ({ item }) => {
    return <MealLogItem item={item} mealFilter={selectedMealFilter} />;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <CustomHeader
        title="Daily Meal Log"
        showDrawerButton
        containerStyle={styles.headerContainer}
        titleStyle={styles.headerTitle}
        buttonStyle={styles.headerButton}
        iconStyle={styles.headerIcon}
      />
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <FlatList
        data={filteredMeals}
        keyExtractor={item => item.id}
        renderItem={renderMealItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        ListHeaderComponent={
          <>
            <DateNavigation
              dayLabel={selectedDay.dayLabel}
              dateLabel={selectedDay.dateLabel}
              fullDateLabel={selectedDay.fullDateLabel}
              disablePrevious={selectedDateIndex <= 0}
              disableNext={selectedDateIndex >= foodLogDays.length - 1}
              onPrevious={() => updateSelectedDay(selectedDateIndex - 1)}
              onNext={() => updateSelectedDay(selectedDateIndex + 1)}
            />
            <NutritionSummaryCard
              calories={nutritionTotals.calories}
              calorieGoal={selectedDay.calorieGoal}
              protein={nutritionTotals.protein}
              fats={nutritionTotals.fats}
              carbs={nutritionTotals.carbs}
              fibre={nutritionTotals.fibre}
              activeDayLabel={selectedDay.dayLabel}
            />
            <View style={styles.inputSectionCard}>
              {/* <TouchableOpacity
                onPress={handleTakePhoto}
                style={styles.photoButton}
                activeOpacity={0.8}
              >
                <Text style={styles.photoButtonText}>📸 Click Pic of Meal</Text>
              </TouchableOpacity> */}
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search food or meals..."
                placeholderTextColor={C.slate}
                style={styles.searchInput}
              />
              {matchingMeals.map(meal => {
                const isSelected = selectedMealIds.includes(meal.id);
                return (
                  <TouchableOpacity
                    key={meal.id}
                    style={styles.checkboxRow}
                    onPress={() => toggleMealSelection(meal.id)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                      {isSelected && <Text style={styles.checkboxCheck}>✓</Text>}
                    </View>
                    <Text style={styles.checkboxLabel}>{meal.name}</Text>
                  </TouchableOpacity>
                );
              })}
              {selectedMealIds.length > 0 && (
                <TouchableOpacity
                  onPress={handleAddSelectedMeals}
                  style={styles.addButton}
                  activeOpacity={0.8}
                >
                  <Text style={styles.addButtonText}>Add Selected Meals</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionTitleWrap}>
                <View style={styles.iconBubble}>
                  <NutritionIcon name="silverware-variant" size={18} color={C.blue} />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>Logged Meals</Text>
                  <Text style={styles.cardSubtitle}>
                    Meals for {selectedDay.fullDateLabel}
                  </Text>
                </View>
              </View>
              <Text style={styles.sectionCount}>
                {filteredMeals.length} Meals Found
              </Text>
            </View>
            <MealFilterTabs
              selectedFilter={selectedMealFilter}
              onSelect={setSelectedMealFilter}
            />
            <View style={{ marginVertical: 8 }}>
              <TouchableOpacity
                onPress={() => setShowAddMealModal(true)}
                style={[styles.addButton, { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: C.teal }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.addButtonText, { color: C.teal }]}>
                  + Add Custom {getMealFilterLabel(selectedMealFilter)} Meal
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{ height: 10 }} />
            <Modal
              visible={showAddMealModal}
              transparent
              animationType="slide"
              onRequestClose={() => setShowAddMealModal(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                  <Text style={styles.cardTitle}>
                    Add Custom {getMealFilterLabel(selectedMealFilter)} Meal
                  </Text>
                  <View style={{ height: 16 }} />
                  <TextInput
                    value={mealInput}
                    onChangeText={setMealInput}
                    placeholder="Type meal name here..."
                    placeholderTextColor={C.slate}
                    style={[styles.searchInput, { width: '100%' }]}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      handleAddMealLog();
                      setShowAddMealModal(false);
                    }}
                    style={[styles.addButton, { width: '100%' }]}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.addButtonText}>Add Item</Text>
                  </TouchableOpacity>
                  <Pressable onPress={() => setShowAddMealModal(false)}>
                    <Text style={styles.cancel}>Cancel</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No meals logged under this filter yet.</Text>
          </View>
        }
        ListFooterComponent={
          <View style={[styles.darkCard, styles.sectionSpacing]}>
            <View style={styles.cardTitleRow}>
              <View style={styles.cardTitleWrap}>
                <View style={[styles.iconBubble, styles.redIconBubble]}>
                  <NutritionIcon name="bell-alert-outline" size={18} color={C.coral} />
                </View>
                <Text style={styles.cardTitle}>Daily Alert</Text>
              </View>
            </View>
            <Text style={styles.alertText}>{selectedDay.dailyAlert}</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default MealLogScreen;
