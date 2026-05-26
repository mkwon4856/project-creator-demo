import {
  Compass,
  FileText,
  PlaySquare,
  Radio,
  Settings,
  Tv,
  UserCircle,
  Wallet,
} from 'lucide-react';

import type { SidebarSection } from '@/components/layout';

export type CreatorRouteId =
  | 'browse'
  | 'activity'
  | 'earnings'
  | 'profile'
  | 'settings';

export function getCreatorSidebar(activeId: CreatorRouteId): SidebarSection[] {
  const isActive = (id: CreatorRouteId) => activeId === id;

  return [
    {
      label: 'Creator',
      items: [
        {
          id: 'browse',
          icon: <Compass size={16} />,
          label: 'Browse campaigns',
          href: '/creator',
          active: isActive('browse'),
        },
        {
          id: 'activity',
          icon: <FileText size={16} />,
          label: 'My activity',
          href: '/creator/activity',
          count: 3,
          active: isActive('activity'),
        },
        {
          id: 'earnings',
          icon: <Wallet size={16} />,
          label: 'Earnings',
          href: '/creator/earnings',
          active: isActive('earnings'),
        },
        {
          id: 'profile',
          icon: <UserCircle size={16} />,
          label: 'Profile',
          href: '/creator/profile',
          active: isActive('profile'),
        },
      ],
    },
    {
      label: 'Connect',
      items: [
        { id: 'youtube', icon: <PlaySquare size={16} />, label: 'YouTube', href: '#' },
        { id: 'soop', icon: <Radio size={16} />, label: 'SOOP', href: '#' },
        { id: 'chzzk', icon: <Tv size={16} />, label: 'Chzzk', href: '#' },
      ],
    },
    {
      label: 'Account',
      items: [
        {
          id: 'settings',
          icon: <Settings size={16} />,
          label: 'Settings',
          href: '/creator/settings',
          active: isActive('settings'),
        },
      ],
    },
  ];
}
