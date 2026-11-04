export type LikertValue = 'Always' | 'Often' | 'Sometimes' | 'Rarely' | 'Never';

export interface IMentalHealthPayload {
  // Part 1: Anxiety (anx1 - anx6), Depression (dep1 - dep6), Stress (str1 - str6)
  anx1?: LikertValue;
  anx2?: LikertValue;
  anx3?: LikertValue;
  anx4?: LikertValue;
  anx5?: LikertValue;
  anx6?: LikertValue;

  dep1?: LikertValue;
  dep2?: LikertValue;
  dep3?: LikertValue;
  dep4?: LikertValue;
  dep5?: LikertValue;
  dep6?: LikertValue;

  str1?: LikertValue;
  str2?: LikertValue;
  str3?: LikertValue;
  str4?: LikertValue;
  str5?: LikertValue;
  str6?: LikertValue;

  // Part 2: Sleep Patterns (sle1 - sle6), Substance Use (sub1 - sub6), Emotional Regulation (emo1 - emo6)
  sle1?: LikertValue;
  sle2?: LikertValue;
  sle3?: LikertValue;
  sle4?: LikertValue;
  sle5?: LikertValue;
  sle6?: LikertValue;

  sub1?: LikertValue;
  sub2?: LikertValue;
  sub3?: LikertValue;
  sub4?: LikertValue;
  sub5?: LikertValue;
  sub6?: LikertValue;

  emo1?: LikertValue;
  emo2?: LikertValue;
  emo3?: LikertValue;
  emo4?: LikertValue;
  emo5?: LikertValue;
  emo6?: LikertValue;

  mentalHealthScreeningCompleteFlag?: boolean;
}

export interface IMentalHealthQuestion {
  id: string;
  field: keyof IMentalHealthPayload;
  qNumber: string;
  text: string;
}

export interface IMentalHealthCategory {
  id: string;
  title: string;
  icon: string;
  subtitle: string;
  noticeBanner?: string;
  questions: IMentalHealthQuestion[];
}

export interface IMentalHealthPart {
  partNumber: number;
  partTitle: string;
  partSubtitle: string;
  badge: string;
  categories: IMentalHealthCategory[];
}
