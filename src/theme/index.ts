import { COLORS } from './colors';
import { FONTS } from './fonts';
import { SPACING } from './spacing';
import { METRIC_COLORS } from './metricsColors';

export const theme = {
  colors: COLORS,
  fonts: FONTS,
  spacing: SPACING,
  metricColors: METRIC_COLORS,
};

export type ThemeType = typeof theme;

export { COLORS } from './colors';
export { FONTS } from './fonts';
export { SPACING } from './spacing';
export { METRIC_COLORS } from './metricsColors';

