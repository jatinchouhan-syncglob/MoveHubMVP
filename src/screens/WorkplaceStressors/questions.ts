export const YES_NO_OPTIONS = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

export const LEVEL_STRESS_OPTIONS = [
  { label: 'Negligible', value: 'Negligible', emoji: '😌', desc: 'Minimal or no job stress experienced' },
  { label: 'Mild', value: 'Mild', emoji: '🙂', desc: 'Occasional manageable pressure' },
  { label: 'Moderate', value: 'Moderate', emoji: '😐', desc: 'Noticeable stress affecting daily work' },
  { label: 'Severe', value: 'Severe', emoji: '😰', desc: 'High persistent pressure draining energy' },
  { label: 'Extreme', value: 'Extreme', emoji: '🚨', desc: 'Overwhelming, near burnout limits' },
];

export const FREQUENCY_STRESS_OPTIONS = [
  { label: 'Always', value: 'Always' },
  { label: 'Too often', value: 'Too often' },
  { label: 'Sometimes', value: 'Sometimes' },
  { label: 'Rarely', value: 'Rarely' },
];

export const DURATION_STRESS_OPTIONS = [
  { label: 'Less Than a Month', value: 'Less Than a Month' },
  { label: '2 months', value: '2 months' },
  { label: '3 months', value: '3 months' },
  { label: '4 months', value: '4 months' },
  { label: '5 months', value: '5 months' },
  { label: 'More than 1 year', value: 'More than 1 year' },
];

export const SYMPTOM_FREQUENCY_OPTIONS = [
  { label: 'Always', value: 'Always' },
  { label: 'Very often', value: 'Very often' },
  { label: 'Sometimes', value: 'Sometimes' },
  { label: 'Rarely', value: 'Rarely' },
  { label: 'Never', value: 'Never' },
];

export const STRESS_SYMPTOMS = [
  { key: 'frequentHeadaches', label: 'Frequent headaches', icon: '🤕' },
  { key: 'prolongedFatigue', label: 'Prolonged fatigue & exhaustion', icon: '🔋' },
  { key: 'irritability', label: 'Irritability & low frustration tolerance', icon: '😤' },
  { key: 'lossOfAppetite', label: 'Loss of appetite or skipped meals', icon: '🍽️' },
  { key: 'overSensitivity', label: 'Over-sensitivity to critique or noise', icon: '⚡' },
  { key: 'insomnia', label: 'Insomnia or broken, restless sleep', icon: '🌙' },
  { key: 'anxiety', label: 'Anxiety or continuous nervous tension', icon: '💭' },
  { key: 'depression', label: 'Depression, low mood or apathy', icon: '🌧️' },
] as const;

export const PART_TWO_QUESTIONS = [
  {
    key: 'roleAlignmentWithOrganizationalGoals' as const,
    number: 'Q1',
    title: 'Role Alignment with Goals',
    subtitle: 'Do you feel your personal role and day-to-day work align with company objectives?',
    icon: '🎯',
  },
  {
    key: 'demandsOfYourJob' as const,
    number: 'Q2',
    title: 'Demands of your job?',
    subtitle: 'e.g. Too much work, insufficient time, long working hours, or not enough rest breaks',
    icon: '⏳',
  },
  {
    key: 'lackOfControl' as const,
    number: 'Q3',
    title: 'Lack of control & high pressure?',
    subtitle: 'e.g. Unrealistic deadlines, unremitting performance pressure, micro-management',
    icon: '⚖️',
  },
  {
    key: 'relationshipsAtWork' as const,
    number: 'Q4',
    title: 'Relationships at work?',
    subtitle: 'e.g. Friction, harassment, conflict, lack of healthy communication or support',
    icon: '🤝',
  },
  {
    key: 'change' as const,
    number: 'Q5',
    title: 'Workplace Change & Uncertainty?',
    subtitle: 'e.g. Uncertainty about your future, frequent restructuring, lack of consultation over changes',
    icon: '🔄',
  },
  {
    key: 'workingEnvironment' as const,
    number: 'Q6',
    title: 'Working Environment & Ergonomics?',
    subtitle: 'e.g. Bad ergonomics, temperature issues, noisy/cramped desk, uncomfortable workstations',
    icon: '🖥️',
  },
  {
    key: 'learningOpportunities' as const,
    number: 'Q7',
    title: 'Learning & Growth Opportunities?',
    subtitle: 'e.g. Insufficient time, lack of guidance or resources for training and skill development',
    icon: '📈',
  },
];
