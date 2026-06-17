import { Activity } from '../types';

/**
 * Calculate BMI (Body Mass Index) given weight (kg) and height (cm)
 */
export const calculateBMI = (weight: number, heightCm: number): number => {
  if (weight <= 0 || heightCm <= 0) return 0;
  const heightMeters = heightCm / 100;
  const bmi = weight / (heightMeters * heightMeters);
  return Math.round(bmi * 10) / 10; // 1 decimal place
};

/**
 * Get BMI status string
 */
export const getBMIStatus = (bmi: number): 'Underweight' | 'Normal' | 'Overweight' | 'Obese' | 'Unknown' => {
  if (bmi <= 0) return 'Unknown';
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25.0) return 'Normal';
  if (bmi < 30.0) return 'Overweight';
  return 'Obese';
};

/**
 * Calculate percentage completion towards a goal (returns number between 0 and 100)
 */
export const calculateGoalPercentage = (current: number, goal: number): number => {
  if (goal <= 0) return 0;
  const percentage = (current / goal) * 100;
  return Math.min(Math.round(percentage), 100);
};

/**
 * Sum up calories burned from a list of activities
 */
export const sumCaloriesBurned = (activities: Activity[]): number => {
  return activities.reduce((sum, activity) => sum + (activity.caloriesBurned || 0), 0);
};

/**
 * Sum up duration minutes from a list of activities
 */
export const sumActiveMinutes = (activities: Activity[]): number => {
  return activities.reduce((sum, activity) => sum + (activity.durationMinutes || 0), 0);
};
