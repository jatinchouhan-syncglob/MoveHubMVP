import { ImageSourcePropType } from 'react-native';
import { UserSegmentKey } from '../../screens/Arenas/types';

export const ARENA_SEGMENT_IMAGES: Record<UserSegmentKey, ImageSourcePropType> = {
  COLLEGE_YOUTH: require('./college_youth.jpg'),
  CLINICAL_LABS: require('./clinical_labs.jpg'),
  RESIDENTIAL_COMPLEX: require('./residential_complex.jpg'),
  GYM_NETWORK: require('./gym_network.jpg'),
  MASS_INDIVIDUALS: require('./mass_individuals.jpg'),
  FRIENDS_FAMILY: require('./friends_family.jpg'),
  HEALTH_RETAIL: require('./health_retail.jpg'),
};

export default ARENA_SEGMENT_IMAGES;
