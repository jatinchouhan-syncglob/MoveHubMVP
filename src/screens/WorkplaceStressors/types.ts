export interface IWorkplaceStressorsPayload {
  uhid?: string;
  // Part 1: Workplace Environment & Stress Load
  stressedByWork?: boolean;
  stressUnacceptableToYou?: boolean;
  physicalMentalHarmDistress?: boolean;
  rateLevelOfJobStress?: string; // 'Negligible' | 'Mild' | 'Moderate' | 'Severe' | 'Extreme'
  howOftenYouFeelHighlyStressedFromJob?: string;
  howLongHaveYouBeenExperiencingStressFromWork?: string;
  frequentHeadaches?: string;
  prolongedFatigue?: string;
  irritability?: string;
  lossOfAppetite?: string;
  overSensitivity?: string;
  insomnia?: string;
  anxiety?: string;
  depression?: string;

  // Part 2: Identifying Root Stressors
  roleAlignmentWithOrganizationalGoals?: boolean | null;
  demandsOfYourJob?: boolean | null;
  lackOfControl?: boolean | null;
  relationshipsAtWork?: boolean | null;
  change?: boolean | null;
  workingEnvironment?: boolean | null;
  learningOpportunities?: boolean | null;
  workPlaceStressCompleteFlag?: boolean;
}
