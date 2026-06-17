export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Custom context spaces
  containerPadding: 16,
  cardPadding: 16,
  borderRadiusSm: 8,
  borderRadiusMd: 12,
  borderRadiusLg: 16,
  borderRadiusRound: 9999,
} as const;

export type SpacingType = typeof SPACING;
