export type ArenaThemeKey =
  | 'arena-blue'
  | 'arena-magenta'
  | 'arena-green'
  | 'arena-orange'
  | 'arena-teal';

export interface IArena {
  id: string;
  name: string;
  slug: string;
  category: string;
  tagline: string;
  summary: string;
  facts: string[];
  heroImage: string;
  bannerImage: string;
  explorerImage: string;
  themeColor: ArenaThemeKey;
  status: string;
}

export interface ArenaThemeConfig {
  primary: string;
  glow: string;
  border: string;
  accent: string;
  badgeBg: string;
  gradient: [string, string];
}
