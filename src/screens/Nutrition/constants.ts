import dayjs from 'dayjs';

export interface MealEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  fibre: number;
}

export type MealFilter = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface FoodLogDay {
  id: string;
  dayLabel: string;
  dateLabel: string;
  fullDateLabel: string;
  calorieGoal: number;
  meals: Record<MealFilter, MealEntry[]>;
  planner: Record<MealFilter, string[]>;
  dailyAlert: string;
}

export interface SavedMealPlan {
  id: string;
  dayLabel: string;
  dateLabel: string;
  complianceStatus: 'compliant' | 'non-compliant';
  meals: Record<MealFilter, string[]>;
}

export const STATIC_MEALS: MealEntry[] = [
  { id: 'm1', name: 'Oatmeal with Bananas', calories: 350, protein: 12, fats: 5, carbs: 62, fibre: 7 },
  { id: 'm2', name: 'Grilled Chicken Salad', calories: 420, protein: 36, fats: 12, carbs: 16, fibre: 5 },
  { id: 'm3', name: 'Salmon with Quinoa', calories: 550, protein: 42, fats: 19, carbs: 48, fibre: 6 },
  { id: 'm4', name: 'Greek Yogurt with Honey', calories: 180, protein: 16, fats: 3, carbs: 22, fibre: 0 },
  { id: 'm5', name: 'Almond & Whey Shake', calories: 280, protein: 28, fats: 7, carbs: 12, fibre: 2 },
  { id: 'm6', name: 'Boiled Eggs & Toast', calories: 310, protein: 18, fats: 10, carbs: 28, fibre: 3 }
];

export const INITIAL_FOOD_LOG_DAYS: FoodLogDay[] = Array.from({ length: 7 }, (_, i) => {
  const d = dayjs().subtract(6 - i, 'day');
  const dateStr = d.format('YYYY-MM-DD');
  
  return {
    id: dateStr,
    dayLabel: i === 6 ? 'Today' : d.format('ddd'),
    dateLabel: d.format('MMM DD'),
    fullDateLabel: dateStr,
    calorieGoal: 2200,
    meals: {
      breakfast: i === 6 ? [
        { id: 'b1', name: 'Oatmeal with Bananas', calories: 350, protein: 12, fats: 5, carbs: 62, fibre: 7 }
      ] : [],
      lunch: i === 6 ? [
        { id: 'l1', name: 'Grilled Chicken Salad', calories: 420, protein: 36, fats: 12, carbs: 16, fibre: 5 }
      ] : [],
      dinner: [],
      snacks: []
    },
    planner: {
      breakfast: ['Oats', 'Eggs'],
      lunch: ['Chicken', 'Rice'],
      dinner: ['Fish', 'Salad'],
      snacks: ['Protein Shake']
    },
    dailyAlert: i === 6 
      ? 'Your current meals are rich in protein, but you have not logged any dinner yet. Plan a light dinner to meet your caloric target! 🥑' 
      : 'Caloric compliance score for this day was optimal.'
  };
});

export const INITIAL_SELECTED_DATE_ID = dayjs().format('YYYY-MM-DD');

export const INITIAL_SAVED_MEAL_PLANS: SavedMealPlan[] = [
  {
    id: 'plan-1',
    dayLabel: 'Weekday Mass Plan',
    dateLabel: 'July 10',
    complianceStatus: 'compliant',
    meals: {
      breakfast: ['Oats', 'Eggs'],
      lunch: ['Chicken', 'Rice'],
      dinner: ['Fish', 'Salad'],
      snacks: ['Protein Shake']
    }
  }
];

export const createGeneratedMealEntry = (name: string): MealEntry => {
  // Try to find a static meal to copy macro data, or create a random one
  const existing = STATIC_MEALS.find(m => m.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    return {
      ...existing,
      id: `gen-${Date.now()}-${Math.random()}`
    };
  }
  return {
    id: `gen-${Date.now()}-${Math.random()}`,
    name,
    calories: Math.round(180 + Math.random() * 250),
    protein: Math.round(8 + Math.random() * 20),
    fats: Math.round(3 + Math.random() * 10),
    carbs: Math.round(20 + Math.random() * 40),
    fibre: Math.round(Math.random() * 5)
  };
};

export const getMealFilterLabel = (filter: string): string => {
  return filter.charAt(0).toUpperCase() + filter.slice(1);
};

export const getPlannerSlotLabel = getMealFilterLabel;
export const getPlannerSlotLabelPlural = (filter: string) => `${getMealFilterLabel(filter)} Meals`;

export const replacePlannedMealValue = (meal: string) => `${meal} (Alternative)`;

export const buildSavedMealPlan = (day: FoodLogDay): SavedMealPlan => ({
  id: `plan-${day.id}-${Date.now()}`,
  dayLabel: `${day.dayLabel} Saved Plan`,
  dateLabel: day.dateLabel,
  complianceStatus: 'compliant',
  meals: {
    breakfast: [...day.planner.breakfast],
    lunch: [...day.planner.lunch],
    dinner: [...day.planner.dinner],
    snacks: [...day.planner.snacks]
  }
});

export const MEAL_FILTERS: MealFilter[] = ['breakfast', 'lunch', 'dinner', 'snacks'];
export const PLANNER_SLOTS = MEAL_FILTERS;

export const NUTRIENT_CONFIG = [
  { key: 'protein' as const, label: 'Protein', color: '#14b8a6' },
  { key: 'fats' as const, label: 'Fats', color: '#f59e0b' },
  { key: 'carbs' as const, label: 'Carbs', color: '#3b82f6' },
  { key: 'fibre' as const, label: 'Fibre', color: '#10b981' }
];

export interface INutritionSummary {
  calories: number;
  calorieGoal: number;
  protein: number;
  fats: number;
  carbs: number;
  fibre: number;
  activeDayLabel: string;
}
