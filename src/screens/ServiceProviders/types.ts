export type ProviderCategory = 'hospital' | 'lab' | 'physician' | 'gym';

export interface IServiceProvider {
  id: string;
  category: ProviderCategory;
  name: string;
  subtext?: string;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  area?: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  isPrimary?: boolean;
  isSelected?: boolean;
  createdAt?: string;
}

export interface ICategoryMeta {
  key: ProviderCategory;
  title: string;
  instruction: string;
  icon: string;
  accentColor: string;
  badgeBg: string;
  borderColor: string;
}

export interface IServiceProvidersDirectory {
  hospitals: IServiceProvider[];
  labs: IServiceProvider[];
  physicians: IServiceProvider[];
  gyms: IServiceProvider[];
}

export interface ICustomProviderPayload {
  category: string;
  name: string;
  specialty?: string;
  address?: string;
  state?: string;
  city?: string;
  pincode?: string;
  area?: string;
  uhid?: string;
  phone?: string;
}

export interface IRegisterProvidersPayload {
  uhid?: string;
  selectedProviderIds: string[];
  customProviders: ICustomProviderPayload[];
}
