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
      label: '크리에이터',
      items: [
        {
          id: 'browse',
          icon: <Compass size={16} />,
          label: '캠페인 둘러보기',
          href: '/creator',
          active: isActive('browse'),
        },
        {
          id: 'activity',
          icon: <FileText size={16} />,
          label: '내 활동',
          href: '/creator/activity',
          count: 3,
          active: isActive('activity'),
        },
        {
          id: 'earnings',
          icon: <Wallet size={16} />,
          label: '수익',
          href: '/creator/earnings',
          active: isActive('earnings'),
        },
        {
          id: 'profile',
          icon: <UserCircle size={16} />,
          label: '프로필',
          href: '/creator/profile',
          active: isActive('profile'),
        },
      ],
    },
    {
      label: '연결',
      items: [
        { id: 'youtube', icon: <PlaySquare size={16} />, label: '유튜브', href: '#' },
        { id: 'soop', icon: <Radio size={16} />, label: 'SOOP', href: '#' },
        { id: 'chzzk', icon: <Tv size={16} />, label: '치지직', href: '#' },
      ],
    },
    {
      label: '계정',
      items: [
        {
          id: 'settings',
          icon: <Settings size={16} />,
          label: '설정',
          href: '/creator/settings',
          active: isActive('settings'),
        },
      ],
    },
  ];
}
