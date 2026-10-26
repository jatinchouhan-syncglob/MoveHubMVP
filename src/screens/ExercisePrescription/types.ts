export interface QuestionOption {
  id: string;
  text: string;
  subtext?: string;
  icon?: string;
  aiMapping?: string;
}

export interface IntakeQuestion {
  id: string;
  number: number;
  category: string;
  icon: string;
  title: string;
  questionText: string;
  aiBackendTranslation: string;
  options: QuestionOption[];
}

export interface MasterExercise {
  exercise_id: number;
  exercise_name: string;
  equipment_required: string;
  met_value: number;
  muscle_group_category: string;
  primary_joint_involved: string;
  compression_load_type: string;
  safety_precaution_text: string;
  video_asset_url: string;
}

export interface BiometricChecklistItem {
  id: number;
  name: string;
  schedule: string;
  duration: string;
  ruleDescription: string;
  status: 'verified' | 'pending';
}

export interface BiometricResetCardData {
  uhid: string;
  age: number;
  sex: string;
  profileMode: string;
  rangeStart: string;
  rangeEnd: string;
  resetsInDays: number;
  bseAdaptiveTarget: number;
  coreTargets: {
    bseEfficiency: { target: number; base: number };
    sedentaryIndex: { target: number; base: number };
    pulsePacePPI: { target: number; base: number };
    moveEconomyKcalKm: { target: number; base: number };
    staminaIS: { target: number; base: number };
    ahaHeartVolPts: { target: number; base: number };
  };
  safetyCeilings: {
    maxHeartRateBpm: number;
    continuousSittingMaxMins: number;
    stasisBreakRule: string;
  };
  checklist: BiometricChecklistItem[];
  clinicalRationale: string;
}

export interface GymQuestCardData {
  uhid: string;
  prescriptionCardType: string;
  viewportStatus: string;
  targetAllocation: string;
  biomechanicalAssessment: {
    somatotypeFrame: string;
    metabolicTargetTrack: string;
    clinicalReasoning: string;
  };
  exerciseSelection: {
    exerciseName: string;
    equipmentNeeded: string;
    metabolicBurdenMets: number;
    prescribedVolumeString: string;
  };
  safetyAndPainRemediation: {
    heartSafetyCeiling: string;
    clinicalPainInstruction: string;
    coachingVideoUrl: string;
  };
  tournamentImpact: {
    bseImpact: string;
    ppiE3Impact: string;
    staminaImpact: string;
  };
}
