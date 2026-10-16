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

export type ReferralEntityType = 'GYM' | 'TOWER_SOCIETY' | 'CORPORATE' | 'OTHER';

export interface IReferralEntity {
  id: number;
  referralCode: string;
  entityType: ReferralEntityType | string;
  entityName: string;
  createdBy?: string | null;
  whereCreated?: string | null;
  city?: string;
  location?: string;
  usageCount?: number;
  isActive?: boolean;
  createdOn?: string;
}

export interface INominateEntityPayload {
  entityType: string;
  entityName: string;
  contactPersonName: string;
  email: string;
  phoneNumber: string;
  city: string;
  location: string;
  nominatedByName: string;
  nominatedByPhone: string;
  nominatedByEmail: string;
}

export interface IAssociateEntityPayload {
  uhid: string;
  referralCode: string;
  entityName: string;
  unitOrFlatNumber?: string;
  membershipId?: string;
}

