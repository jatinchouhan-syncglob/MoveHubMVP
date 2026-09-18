export interface ILifestyleSketchPayload {
  // Block 1: Cardiovascular & Metabolic Baseline (Personal History)
  diagnosed_cardiovascular_conditions: string; // 'Yes' | 'No' | ''
  metabolic_disorders: string;
  respiratory_system_health: string;
  structural_orthopedic_conditions: string;

  // Block 2: Genetic Vulnerabilities (Family History)
  early_onset_cardiovascular_disease: string;
  familial_diabetes_track: string;
  neurological_decline_track: string;
  familial_bone_density_deficits: string;

  // Block 3: Lifestyle Choices & Habits (Biophysical Depletors)
  tobacco_nicotine_exposure: string;
  alcohol_consumption_volume: string;
  sedentary_off_work_habits: string;
  chronic_sleep_duration: string;

  // Block 4: Nutrition & Metabolic Inputs
  ultra_processed_food_frequency: string;
  daily_protein_allocation: string;
  hydration_baseline: string;
  chronic_caloric_mismatch: string;
}

export interface ILifestyleFinalPayload {
  uhid: string;
  timestamp_epoch: number;
  lifestyle_questionnaire_payload: ILifestyleSketchPayload;
}

export interface IOption {
  label: string;
  value: string;
  isFlag?: boolean;
}

export interface IQuestion {
  id: keyof ILifestyleSketchPayload;
  questionNumber: number;
  blockNumber: number;
  blockTitle: string;
  title: string;
  description: string;
  options: IOption[];
}

export interface IStep {
  stepIndex: number;
  blockNumber: number;
  blockTitle: string;
  blockSubtitle: string;
  questionIds: (keyof ILifestyleSketchPayload)[];
}
