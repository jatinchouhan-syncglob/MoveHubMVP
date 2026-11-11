import { IQoLOption, IQoLSection } from './types';

export const QOL_INTRO_TEXT = {
  title: 'HR-Quality of Life (QoL)',
  instrument: 'THE WHOQOL-BREF',
  description:
    'This survey is done to assess your quality of life. This is an important measure of health as WHO defines quality of life as a person’s perception of their well-being in three domains (physical, mental, and social well-being). QoL is important as it can often determine outcomes in diseases like cancer.',
  instruction: 'Please fill out each question to the best of your ability.',
};

// Scale for Question 1 (G1)
export const QOL_RATING_OPTIONS: IQoLOption[] = [
  { label: 'Very poor', value: 1 },
  { label: 'Poor', value: 2 },
  { label: 'Neither poor nor good', value: 3 },
  { label: 'Good', value: 4 },
  { label: 'Very good', value: 5 },
];

// Scale for Question 2 (G4)
export const HEALTH_SATISFACTION_OPTIONS: IQoLOption[] = [
  { label: 'Very dissatisfied', value: 1 },
  { label: 'Dissatisfied', value: 2 },
  { label: 'Neither satisfied nor dissatisfied', value: 3 },
  { label: 'Satisfied', value: 4 },
  { label: 'Very satisfied', value: 5 },
];

// Scale for Questions 3-6 (F1.4, F11.3, F4.1, F24.2)
export const LAST_TWO_WEEKS_OPTIONS: IQoLOption[] = [
  { label: 'Not at all', value: 1 },
  { label: 'A little', value: 2 },
  { label: 'A moderate amount', value: 3 },
  { label: 'Very much', value: 4 },
  { label: 'An extreme amount', value: 5 },
];

export const QOL_SECTIONS: IQoLSection[] = [
  {
    id: 'general_wellbeing',
    title: 'General Well-Being & Health Perception',
    subtitle: 'Overall appraisal of life quality and health satisfaction',
    questions: [
      {
        id: 'q1',
        field: 'q1_qol_rating',
        qNumber: '1',
        code: 'G1',
        text: 'How would you rate your quality of life?',
        options: QOL_RATING_OPTIONS,
      },
      {
        id: 'q2',
        field: 'q2_health_satisfaction',
        qNumber: '2',
        code: 'G4',
        text: 'How satisfied are you with your health?',
        options: HEALTH_SATISFACTION_OPTIONS,
      },
    ],
  },
  {
    id: 'two_weeks_experience',
    title: 'Experiences in the Last Two Weeks',
    subtitle: 'Physical comfort, independence, daily function, and vitality',
    noticeBanner:
      'The following questions ask about how much you have experienced certain things in the last two weeks.',
    questions: [
      {
        id: 'q3',
        field: 'q3_physical_pain',
        qNumber: '3',
        code: 'F1.4',
        text: 'To what extent do you feel that (physical) pain prevents you from doing what you need to do?',
        options: LAST_TWO_WEEKS_OPTIONS,
      },
      {
        id: 'q4',
        field: 'q4_medical_treatment',
        qNumber: '4',
        code: 'F11.3',
        text: 'How much do you need any medical treatment to function in your daily life?',
        options: LAST_TWO_WEEKS_OPTIONS,
      },
      {
        id: 'q5',
        field: 'q5_enjoy_life',
        qNumber: '5',
        code: 'F4.1',
        text: 'How much do you enjoy life?',
        options: LAST_TWO_WEEKS_OPTIONS,
      },
      {
        id: 'q6',
        field: 'q6_meaningful_life',
        qNumber: '6',
        code: 'F24.2',
        text: 'To what extent do you feel your life to be meaningful?',
        options: LAST_TWO_WEEKS_OPTIONS,
      },
    ],
  },
];
