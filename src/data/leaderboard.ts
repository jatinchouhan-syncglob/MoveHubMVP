import { LeaderboardEntry } from '../types';

export const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  {
    id: 'lead-1',
    rank: 1,
    name: 'Sarah Connor',
    points: 2950,
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  },
  {
    id: 'lead-2',
    rank: 2,
    name: 'Michael Chen',
    points: 2780,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
  },
  {
    id: 'lead-3',
    rank: 3,
    name: 'Alex Rivera', // Current User
    points: 2420,
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100',
    isCurrentUser: true,
  },
  {
    id: 'lead-4',
    rank: 4,
    name: 'Emma Watson',
    points: 2310,
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
  },
  {
    id: 'lead-5',
    rank: 5,
    name: 'David Beckham',
    points: 2150,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
  },
];
