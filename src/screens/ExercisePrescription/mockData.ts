import {
  IntakeQuestion,
  MasterExercise,
  BiometricResetCardData,
  GymQuestCardData,
} from './types';

export const INTAKE_QUESTIONS: IntakeQuestion[] = [
  {
    id: 'q1',
    number: 1,
    category: 'Fitness Goal & Focus Area',
    icon: '📊',
    title: 'Fitness Goal & Focus Area',
    questionText: 'What is your main target for this tournament?',
    aiBackendTranslation:
      'Maps workout architecture directly to high-volume cardiorespiratory pathways, progressive overload loops, or active recovery tracks.',
    options: [
      {
        id: 'q1_fat_loss',
        text: 'Burn Fat & Lean Down',
        subtext: 'I want to burn fat, lose inches, and lean down.',
        icon: '🔥',
        aiMapping: 'High-Volume Cardiorespiratory',
      },
      {
        id: 'q1_strength',
        text: 'Build Strength & Muscle',
        subtext: 'I want to build strength, shape muscle, and tone up.',
        icon: '💪',
        aiMapping: 'Structural Progressive Overload',
      },
      {
        id: 'q1_energy',
        text: 'Daily Energy & Vitality',
        subtext: 'I want to improve my daily energy and stay active.',
        icon: '⚡',
        aiMapping: 'Endurance & Active Momentum',
      },
      {
        id: 'q1_posture',
        text: 'Mobility & Posture Alignment',
        subtext: 'I want to reduce joint stiffness and fix my posture.',
        icon: '🧘',
        aiMapping: 'Low-Intensity Active Recovery',
      },
    ],
  },
  {
    id: 'q2',
    number: 2,
    category: 'Body Frame Structure',
    icon: '🖼️',
    title: 'Body Frame Structure',
    questionText: 'Which silhouette best matches your natural body frame?',
    aiBackendTranslation:
      'Logs structural variables (Ectomorph, Mesomorph, Endomorph) to automatically calibrate baseline skeletal joint load limits.',
    options: [
      {
        id: 'q2_ectomorph',
        text: 'Naturally Lean (Ectomorph)',
        subtext: 'Narrower bone structure; find it tough to gain weight/muscle.',
        icon: '🏃‍♂️',
        aiMapping: 'Speed Variant • Lower Axial Limit',
      },
      {
        id: 'q2_mesomorph',
        text: 'Naturally Athletic (Mesomorph)',
        subtext: 'Medium bone density; responds quickly to progressive training.',
        icon: '🏋️‍♂️',
        aiMapping: 'Responsive • Standard Loading',
      },
      {
        id: 'q2_endomorph',
        text: 'Naturally Broad (Endomorph)',
        subtext: 'Sturdy, larger bone framework; holds onto mass easily.',
        icon: '🛡️',
        aiMapping: 'High Force Output • Decompression Priority',
      },
    ],
  },
  {
    id: 'q3',
    number: 3,
    category: 'Pain & Joint Strain Matrix',
    icon: '🤕',
    title: 'The Pain & Joint Strain Matrix',
    questionText: 'Are you currently dealing with any persistent joint discomfort or pain?',
    aiBackendTranslation:
      'Activates the Hard Constraint Pain-Mitigation Engine. Filters 650+ Master Exercises, stripping away contra-indicated movements.',
    options: [
      {
        id: 'q3_lower_back',
        text: 'Lower Back',
        subtext: 'Stiffness/ache from long sitting or standing runs.',
        icon: '⚡',
        aiMapping: 'Forces Axial Decompression Only',
      },
      {
        id: 'q3_knees',
        text: 'Knees',
        subtext: 'Discomfort when bending, squatting, or taking stairs.',
        icon: '🦵',
        aiMapping: 'Filters Patellofemoral Stress',
      },
      {
        id: 'q3_shoulders',
        text: 'Shoulders',
        subtext: 'Aching when lifting overhead or rotating limbs.',
        icon: '🦾',
        aiMapping: 'Filters Overhead Impingement',
      },
      {
        id: 'q3_none',
        text: 'No Present Pain',
        subtext: 'My joints feel completely healthy and ready to move.',
        icon: '✅',
        aiMapping: 'Unrestricted Master Database Access',
      },
    ],
  },
  {
    id: 'q4',
    number: 4,
    category: 'Training Experience Level',
    icon: '🏋️',
    title: 'Training Experience Level',
    questionText: 'How familiar are you with lifting weights or gym workouts?',
    aiBackendTranslation:
      'Calibrates training age parameter to control movement complexity, set volume constraints, and adjust overload steepness.',
    options: [
      {
        id: 'q4_beginner',
        text: 'Complete Beginner',
        subtext: 'I rarely go to the gym or lift weights.',
        icon: '🌱',
        aiMapping: 'Base Motor Patterning • 2-3 Sets',
      },
      {
        id: 'q4_intermediate',
        text: 'Intermediate',
        subtext: 'I have worked out consistently for a few months/years.',
        icon: '⭐',
        aiMapping: 'Progressive Overload • 3-4 Sets',
      },
      {
        id: 'q4_advanced',
        text: 'Advanced',
        subtext: 'I lift regularly and understand complex gym routines.',
        icon: '🏆',
        aiMapping: 'High Volume Density • 4-5 Sets',
      },
    ],
  },
  {
    id: 'q5',
    number: 5,
    category: 'Daily Work Routine & Sitting Habits',
    icon: '🪑',
    title: 'Daily Work Routine & Sitting Habits',
    questionText: 'How do you spend the majority of your working day?',
    aiBackendTranslation:
      'Baseline calibration for the S-DEX™ engine. Anticipates acute lower-limb blood pooling or postural deconditioning.',
    options: [
      {
        id: 'q5_desk',
        text: 'Completely Desk-Bound',
        subtext: 'I sit in front of a laptop for 6+ hours a day.',
        icon: '💻',
        aiMapping: 'S-DEX™ Stasis Break Walk Required',
      },
      {
        id: 'q5_standing',
        text: 'Standing on the Floor',
        subtext: 'I am on my feet in one spot for most of my shift.',
        icon: '🧍',
        aiMapping: 'Venous Return & Lumbar Relief Protocols',
      },
      {
        id: 'q5_moving',
        text: 'Constantly on the Move',
        subtext: 'I am walking around or traveling throughout the day.',
        icon: '🚶',
        aiMapping: 'High Ambient Steps • Fatigue Monitoring',
      },
    ],
  },
  {
    id: 'q6',
    number: 6,
    category: 'Sleep & Waking Fatigue',
    icon: '😴',
    title: 'Sleep & Waking Fatigue',
    questionText: 'How do you typically feel when your morning alarm rings?',
    aiBackendTranslation:
      'Establishes baseline for BSE™ (Bio-Sync Efficiency) calculator to protect from sympathetic nervous system strain.',
    options: [
      {
        id: 'q6_exhausted',
        text: 'Exhausted',
        subtext: 'I sleep less than 6 hours or wake up feeling tired.',
        icon: '🥱',
        aiMapping: 'Autonomic Deload (-30% Intensity)',
      },
      {
        id: 'q6_restless',
        text: 'Restless',
        subtext: 'I sleep but wake up multiple times during the night.',
        icon: '🌙',
        aiMapping: 'Circadian Pacing Focus',
      },
      {
        id: 'q6_refreshed',
        text: 'Refreshed & Ready',
        subtext: 'I sleep soundly and wake up with steady energy.',
        icon: '☀️',
        aiMapping: 'Full Workload Capacity Approved',
      },
    ],
  },
  {
    id: 'q7',
    number: 7,
    category: 'Stress & Mental Workload',
    icon: '🧠',
    title: 'Stress & Mental Workload',
    questionText: 'How would you describe your current mental and professional stress load?',
    aiBackendTranslation:
      'Calibrates the AlloSync Clinical Core to map allostatic load markers, preventing cortisol-induced metabolic block.',
    options: [
      {
        id: 'q7_high',
        text: 'Very High Stress',
        subtext: 'Heavy deadlines, long commutes, or acute anxiety.',
        icon: '🌪️',
        aiMapping: 'Cortisol Dampening • Parasympathetic Walks',
      },
      {
        id: 'q7_moderate',
        text: 'Moderate Pressure',
        subtext: 'Typical daily pressures but I manage them well.',
        icon: '⚖️',
        aiMapping: 'Standard Adaptogenic Volume',
      },
      {
        id: 'q7_low',
        text: 'Low & Calm',
        subtext: 'My daily routine feels balanced, relaxed, and stable.',
        icon: '🌿',
        aiMapping: 'High Neuro-Muscular Drive Capable',
      },
    ],
  },
  {
    id: 'q8',
    number: 8,
    category: 'Nutritional Patterns & Fueling',
    icon: '🍏',
    title: 'Nutritional Patterns & Fueling',
    questionText: 'How would you describe your current eating schedule?',
    aiBackendTranslation:
      'Assesses available glycogen and nutritional recovery capacity to safely regulate exercise intensity and duration.',
    options: [
      {
        id: 'q8_regular',
        text: 'Regular & Plentiful',
        subtext: 'I eat full, consistent meals throughout the day.',
        icon: '🥗',
        aiMapping: 'Full Glycogen Replenished State',
      },
      {
        id: 'q8_calorie_controlled',
        text: 'Calorie-Controlled / Deficit',
        subtext: 'I am actively cutting down on portions or dieting.',
        icon: '📉',
        aiMapping: 'Fat Oxidation Optimization Mode',
      },
      {
        id: 'q8_fasting',
        text: 'Intermittent Fasting',
        subtext: 'I skip meals frequently or go long windows without eating.',
        icon: '⏳',
        aiMapping: 'Hydration & Electrolyte Protection',
      },
    ],
  },
  {
    id: 'q9',
    number: 9,
    category: 'Gym Equipment Access',
    icon: '🏢',
    title: 'Gym Equipment Access',
    questionText: 'What equipment can you access right now for your workouts?',
    aiBackendTranslation:
      'Applies a definitive equipment filter, ensuring the system never recommends machines physically unavailable to user.',
    options: [
      {
        id: 'q9_commercial',
        text: 'Full Commercial Gym Floor',
        subtext: 'Barbells, Dumbbells, Cables, and Machines available.',
        icon: '🏋️‍♂️',
        aiMapping: 'Gym Resistance Stream Activated (100%)',
      },
      {
        id: 'q9_home',
        text: 'Basic Home / Office Setup',
        subtext: 'Only Dumbbells or Resistance Cables available.',
        icon: '🏡',
        aiMapping: 'Compact Free-Weight Module',
      },
      {
        id: 'q9_zero',
        text: 'Zero Equipment (Bodyweight)',
        subtext: 'Just my own bodyweight and a floor mat.',
        icon: '🧘',
        aiMapping: 'Calisthenics & Vascular Pacing Mode',
      },
    ],
  },
];

export const MASTER_EXERCISES_SAMPLE: MasterExercise[] = [
  {
    exercise_id: 101,
    exercise_name: 'Seated Cable Rows',
    equipment_required: 'Commercial Cables',
    met_value: 6.0,
    muscle_group_category: 'Posterior_Pull',
    primary_joint_involved: 'Glenohumeral_Shoulder',
    compression_load_type: 'DECOMPRESSION',
    safety_precaution_text:
      'Maintain an upright spine; squeeze the shoulder blades together without rounding the lower back.',
    video_asset_url: 'https://assets.uncurl.health/demos/seated-cable-rows.mp4',
  },
  {
    exercise_id: 102,
    exercise_name: 'Leg Press Machine',
    equipment_required: 'Full commercial gym floor',
    met_value: 6.8,
    muscle_group_category: 'Quad_Dominant',
    primary_joint_involved: 'Patellofemoral_Knee',
    compression_load_type: 'DECOMPRESSION',
    safety_precaution_text:
      'Do NOT lock your knees at peak extension. Exhale smoothly as you push the foot platform.',
    video_asset_url: 'https://assets.uncurl.health/demos/leg-press-machine.mp4',
  },
  {
    exercise_id: 103,
    exercise_name: 'Dumbbell Romanian Deadlift',
    equipment_required: 'Dumbbells',
    met_value: 5.8,
    muscle_group_category: 'Posterior_Chain',
    primary_joint_involved: 'Lumbar_Spine',
    compression_load_type: 'NEUTRAL_HINGE',
    safety_precaution_text:
      'Hinge at your hips while keeping weights glued close to your shins to protect your lumbar joints.',
    video_asset_url: 'https://assets.uncurl.health/demos/dumbbell-rdl.mp4',
  },
  {
    exercise_id: 104,
    exercise_name: 'Lat Pulldown (Neutral Grip)',
    equipment_required: 'Commercial Cables',
    met_value: 6.2,
    muscle_group_category: 'Posterior_Pull',
    primary_joint_involved: 'Glenohumeral_Shoulder',
    compression_load_type: 'DECOMPRESSION',
    safety_precaution_text:
      'Pull elbows down towards your ribs. Avoid leaning back excessively to avoid spinal compression.',
    video_asset_url: 'https://assets.uncurl.health/demos/lat-pulldown.mp4',
  },
];

export const INITIAL_BIOMETRIC_RESET_CARD: BiometricResetCardData = {
  uhid: 'JATCH05525',
  age: 45,
  sex: 'M',
  profileMode: 'CARDIOVASCULAR PACING MODE',
  rangeStart: '24-10-2026',
  rangeEnd: '31-10-2026',
  resetsInDays: 7,
  bseAdaptiveTarget: 75.0,
  coreTargets: {
    bseEfficiency: { target: 75.0, base: 64.2 },
    sedentaryIndex: { target: 35.0, base: 68.5 },
    pulsePacePPI: { target: 2.8, base: 3.6 },
    moveEconomyKcalKm: { target: 92.0, base: 108.4 },
    staminaIS: { target: 80.0, base: 68.0 },
    ahaHeartVolPts: { target: 150.0, base: 110.0 },
  },
  safetyCeilings: {
    maxHeartRateBpm: 140,
    continuousSittingMaxMins: 60,
    stasisBreakRule:
      'Vascular Breakout Walk: Complete a 90-second walk with phone in pocket to trigger lower-limb clearing.',
  },
  checklist: [
    {
      id: 1,
      name: 'Vascular Breakout Walk',
      schedule: 'EVERY HOUR',
      duration: '90 Secs continuous',
      ruleDescription: 'Office/Field Rule: Walk with phone in pocket to activate calf venous return pump.',
      status: 'verified',
    },
    {
      id: 2,
      name: 'Zone-2 Cadence Walk',
      schedule: 'ONCE DAILY',
      duration: '21 Mins (Slashed 30%)',
      ruleDescription: 'Adaptive daily volume blocks to accelerate cellular glucose uptake.',
      status: 'pending',
    },
    {
      id: 3,
      name: 'Core Prone Planks',
      schedule: 'ONCE DAILY',
      duration: '3 Sets x 45 Secs',
      ruleDescription: 'Pre-walk postural alignment to stabilize pelvis and decompress spine.',
      status: 'pending',
    },
    {
      id: 4,
      name: 'Evening Hatha Yoga',
      schedule: 'EVERY NIGHT',
      duration: '15 Mins',
      ruleDescription: 'Rest-window autonomic wind-down to lower bedtime cortisol and improve deep sleep.',
      status: 'pending',
    },
  ],
  clinicalRationale:
    'Rhythmic moderate aerobic muscle activation increases cellular glucose transport pathways, while short, unbroken functional stretching sets remove localized pooling fluids to protect vascular endothelial walls [AHA].',
};

export const INITIAL_GYM_QUEST_CARD: GymQuestCardData = {
  uhid: 'JATCH05525',
  prescriptionCardType: 'C-MELA™ SPECIALIZED GYM RESISTANCE PRESCRIPTION',
  viewportStatus: 'RENDER_ACTIVE_GYM_QUEST',
  targetAllocation: '60% Daily MET Workload Capacity',
  biomechanicalAssessment: {
    somatotypeFrame: 'Mesomorph Frame (Highly Responsive)',
    metabolicTargetTrack: 'GLUCOSE VACUUM (INTENSE)',
    clinicalReasoning:
      'Your Stage 2 Lifestyle Sketch records an HbA1c of 5.7%+, meaning early insulin resistance is active. Your Gym QUEST is set to intense compound leg mechanics to activate massive muscle glucose vacuums, pulling sugar straight out of your blood [AHA].',
  },
  exerciseSelection: {
    exerciseName: 'Seated Cable Rows (Decompression Mode)',
    equipmentNeeded: 'Commercial Cables / Machine',
    metabolicBurdenMets: 6.0,
    prescribedVolumeString: '4 Sets x 12 Reps (Optimal Volume)',
  },
  safetyAndPainRemediation: {
    heartSafetyCeiling:
      'Exhale smoothly as you pull the weight; do NOT hold your breath to keep blood pressure stable.',
    clinicalPainInstruction:
      'Decompression axial load: Avoid spinal compression while maximizing scapular recruitment.',
    coachingVideoUrl: 'https://assets.uncurl.health/demos/seated-cable-rows.mp4',
  },
  tournamentImpact: {
    bseImpact:
      'BSE Efficiency: Completing tonight\'s sets improves evening muscle fatigue, optimizing your sleep uniformity score to protect your Stage 2 rank.',
    ppiE3Impact:
      'PPI & E3 Optimization: Compound resistance conditions your cardiac pacing index (PPI) and drops your net metabolic energy cost per kilometer (Move Economy - E3).',
    staminaImpact:
      'Stamina Boost: Active glucose clearing expands your trailing durability percentage (Stamina - IS) safely above the upcoming weekend knockout line.',
  },
};
