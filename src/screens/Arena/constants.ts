import { IArena, ArenaThemeConfig, ArenaThemeKey } from './types';

export const ARENA_THEMES: Record<ArenaThemeKey, ArenaThemeConfig> = {
  'arena-blue': {
    primary: '#3B82F6',
    glow: 'rgba(59, 130, 246, 0.35)',
    border: '#2563EB',
    accent: '#60A5FA',
    badgeBg: '#0E1B33',
    gradient: ['#1E3A8A', '#0F172A'],
  },
  'arena-magenta': {
    primary: '#D946EF',
    glow: 'rgba(217, 70, 239, 0.35)',
    border: '#C026D3',
    accent: '#F472B6',
    badgeBg: '#241029',
    gradient: ['#701A75', '#0F172A'],
  },
  'arena-green': {
    primary: '#10B981',
    glow: 'rgba(16, 185, 129, 0.35)',
    border: '#059669',
    accent: '#34D399',
    badgeBg: '#0A231A',
    gradient: ['#064E3B', '#0F172A'],
  },
  'arena-orange': {
    primary: '#F59E0B',
    glow: 'rgba(245, 158, 11, 0.35)',
    border: '#D97706',
    accent: '#FBBF24',
    badgeBg: '#291B08',
    gradient: ['#78350F', '#0F172A'],
  },
  'arena-teal': {
    primary: '#14B8A6',
    glow: 'rgba(20, 184, 166, 0.35)',
    border: '#0D9488',
    accent: '#2DD4BF',
    badgeBg: '#0A2322',
    gradient: ['#134E4A', '#0F172A'],
  },
};

export const ARENA_HEADLINES: Record<string, string> = {
  '01': 'THE GAUNTLET.',
  '02': 'STRONGER TOGETHER.',
  '03': 'REP YOUR GYM.',
  '04': 'MAKE YOUR MARK.',
  '05': 'HEALTHCARE FACILITY.',
  solo: 'THE GAUNTLET.',
  'inner-circle': 'STRONGER TOGETHER.',
  gym: 'REP YOUR GYM.',
  residential: 'MAKE YOUR MARK.',
  healthcare: 'HEALTHCARE FACILITY.',
};

export const ARENA_SHORT_NAMES: Record<string, string> = {
  '01': '01 SOLO',
  '02': '02 INNER CIRCLE',
  '03': '03 GYM',
  '04': '04 RESIDENTIAL ENCLAVES',
  '05': '05 HEALTHCARE FACILITY',
};

export const FALLBACK_ARENAS: IArena[] = [
  {
    id: '01',
    name: 'Global Field',
    slug: 'solo',
    category: 'Solo Contender',
    tagline: 'YOU vs INDIA',
    summary:
      'Enter as an individual. Build your score, survive every stage, and see where you stand across the national field.',
    facts: ['21 DAYS', 'National ranking', 'Individual competition'],
    heroImage:
      'https://ecfl-challenge-images.s3.amazonaws.com/ecfl-stadium-sprint.png',
    bannerImage:
      'https://ecfl-challenge-images.s3.amazonaws.com/the_gauntlet.png',
    explorerImage:
      'https://ecfl-challenge-images.s3.amazonaws.com/arena-golden-hour.png',
    themeColor: 'arena-blue',
    status: 'REGISTRATION OPENING SOON',
  },
  {
    id: '02',
    name: 'The Inner Circle',
    slug: 'inner-circle',
    category: 'Your Crew',
    tagline: 'YOUR CREW vs THE FIELD',
    summary:
      'Compete with friends, family, or colleagues with age-adjusted handicap curves.',
    facts: [
      '3–8 Contenders',
      'Handicap equalized',
      'Private Squad Bracket',
    ],
    heroImage:
      'https://ecfl-challenge-images.s3.amazonaws.com/hero-friends-family.png',
    bannerImage:
      'https://ecfl-challenge-images.s3.amazonaws.com/the_gauntlet.png',
    explorerImage:
      'https://ecfl-challenge-images.s3.amazonaws.com/arena-golden-hour.png',
    themeColor: 'arena-magenta',
    status: 'REGISTRATION OPENING SOON',
  },
  {
    id: '03',
    name: 'Commercial Gyms',
    slug: 'gym',
    category: 'Club Rivalry',
    tagline: 'YOUR GYM vs EVERY GYM',
    summary:
      'Rally your gym box members to aggregate scores and claim the national equipment grant.',
    facts: [
      'Top 5 Aggregation',
      '200 Member Threshold',
      '₹2.5L Grant Pool',
    ],
    heroImage:
      'https://ecfl-challenge-images.s3.amazonaws.com/hero-commercial-gyms.png',
    bannerImage:
      'https://ecfl-challenge-images.s3.amazonaws.com/the_gauntlet.png',
    explorerImage:
      'https://ecfl-challenge-images.s3.amazonaws.com/arena-golden-hour.png',
    themeColor: 'arena-green',
    status: 'REGISTRATION OPENING SOON',
  },
  {
    id: '04',
    name: 'Residential Enclaves',
    slug: 'residential',
    category: 'Neighbourhood Pride',
    tagline: 'YOUR COMMUNITY vs THE CITY',
    summary:
      'Inter-floor and society duels competing for the estate honor shield and society park upgrade grant.',
    facts: [
      'Floor Density Multiplier',
      '150 Resident Target',
      'Society Wellness Grant',
    ],
    heroImage:
      'https://ecfl-challenge-images.s3.amazonaws.com/hero-residential-towers.png',
    bannerImage:
      'https://ecfl-challenge-images.s3.amazonaws.com/the_gauntlet.png',
    explorerImage:
      'https://ecfl-challenge-images.s3.amazonaws.com/arena-golden-hour.png',
    themeColor: 'arena-orange',
    status: 'REGISTRATION OPENING SOON',
  },
  {
    id: '05',
    name: 'Healthcare Facility',
    slug: 'healthcare',
    category: 'Medical Guild',
    tagline: 'HOSPITALS / CLINICS / LABS',
    summary:
      'Exclusive competitive arena for doctors, nurses, surgeons, and healthcare workers.',
    facts: [
      'Duty-Shift Normalizer',
      'Hospital Pride Shield',
      'Wellness Lab Grant',
    ],
    heroImage:
      'https://ecfl-challenge-images.s3.amazonaws.com/healthcare-campus-at-sunset.png',
    bannerImage:
      'https://ecfl-challenge-images.s3.amazonaws.com/the_gauntlet.png',
    explorerImage:
      'https://ecfl-challenge-images.s3.amazonaws.com/arena-golden-hour.png',
    themeColor: 'arena-teal',
    status: 'REGISTRATION OPENING SOON',
  },
];
