export type ProviderCategory = 'hospital' | 'lab' | 'physician' | 'gym';

export interface IServiceProvider {
  id: string;
  category: ProviderCategory;
  name: string;
  subtext?: string; // e.g. Specialty or Facility Type
  address?: string; // Location or City
  phone?: string;   // Contact number
  notes?: string;   // Custom remarks/instructions
  tags?: string[];  // e.g. ['Primary', '24/7 Emergency']
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
  phone?: string;
}

export interface IRegisterProvidersPayload {
  selectedProviderIds: string[];
  customProviders: ICustomProviderPayload[];
}
