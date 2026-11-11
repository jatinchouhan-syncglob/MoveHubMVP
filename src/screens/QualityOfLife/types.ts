export type QoLScore = 1 | 2 | 3 | 4 | 5;

export interface IQoLOption {
  label: string;
  value: QoLScore;
}

export interface IQoLQuestion {
  id: string;
  field: keyof IQoLAnswers;
  qNumber: string;
  code: string;
  text: string;
  options: IQoLOption[];
}

export interface IQoLSection {
  id: string;
  title: string;
  subtitle?: string;
  noticeBanner?: string;
  questions: IQoLQuestion[];
}

export interface IQoLAnswers {
  q1_qol_rating?: QoLScore;
  q2_health_satisfaction?: QoLScore;
  q3_physical_pain?: QoLScore;
  q4_medical_treatment?: QoLScore;
  q5_enjoy_life?: QoLScore;
  q6_meaningful_life?: QoLScore;
  completedAt?: string;
}
