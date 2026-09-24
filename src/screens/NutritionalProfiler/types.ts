export interface INBDPSketchPayload {
  processed_sugar_frequency: string;
  glycogen_substrate_source: string;
  pre_workout_fueling_status: string;
  post_workout_intake_window: string;
  daily_water_intake_liters: number;
  hydration_distribution_pattern: string;
  processed_sodium_exposure: string;
  table_salt_behavior: string;
  protein_intake_density: string;
  dominant_lipid_profile: string[];
  microbiome_substrate_frequency: string;
  late_night_ingestion_gap: string;
  dietary_archetype_profile: string[];
  satiety_volume_envelope: string;
}

export interface INBDPFinalPayload {
  uhid: string;
  timestamp_epoch: number;
  nutrition_sketch_payload: INBDPSketchPayload;
}

export interface IOption {
  label: string;
  value: string;
  description?: string;
  isFlag?: boolean;
}

export interface IQuestion {
  id: keyof INBDPSketchPayload;
  sectionNumber: number;
  sectionTitle: string;
  sectionSubtitle: string;
  questionNumber: number;
  title: string;
  description?: string;
  type: 'radio' | 'checkbox' | 'slider';
  options?: IOption[];
  min?: number;
  max?: number;
  step?: number;
}
