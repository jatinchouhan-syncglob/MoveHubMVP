import { ICategoryMeta } from './types';

export const CATEGORIES_CONFIG: Record<string, ICategoryMeta> = {
  hospital: {
    key: 'hospital',
    title: 'Hospitals',
    instruction: 'Please list hospitals that you typically go for medical consultations.',
    icon: '🏥',
    accentColor: '#10B981', // Emerald
    badgeBg: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  lab: {
    key: 'lab',
    title: 'Labs/Test Centers',
    instruction: 'Please list Labs/ Test centers that you typically use for all your tests.',
    icon: '🧪',
    accentColor: '#06B6D4', // Cyan
    badgeBg: 'rgba(6, 182, 212, 0.15)',
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  physician: {
    key: 'physician',
    title: 'Physicians/Specialists',
    instruction: 'Please list all doctors that you typically see for all your medical consultations',
    icon: '👨‍⚕️',
    accentColor: '#F59E0B', // Amber
    badgeBg: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  gym: {
    key: 'gym',
    title: 'Gyms / Fitness Centers',
    instruction: 'Please list gyms, fitness clubs, or training centers you regularly train at.',
    icon: '🏋️‍♂️',
    accentColor: '#8B5CF6', // Purple
    badgeBg: 'rgba(139, 92, 246, 0.15)',
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
};
