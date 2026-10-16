import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../../navigation/navigationTypes';
import { IArena, IReferralEntity } from '../types';

export type JoinChallengeRouteProp = RouteProp<RootStackParamList, 'JoinChallenge'>;

export type JoinChallengeTab = 'search' | 'nominate';

export interface SelectedEntityState {
  entity: IReferralEntity;
  unitOrFlatNumber: string;
}

export interface JoinSuccessData {
  type: 'associate' | 'nominate';
  entityName: string;
  referralCode?: string;
  entityType?: string;
  city?: string;
  location?: string;
  message?: string;
}
