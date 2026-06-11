import {
  LayoutDashboard,
  Plus,
  Settings,
} from 'lucide-react';

import type { SidebarSection } from '@/components/layout';

export type StudioRouteId =
  | 'my-campaigns'
  | 'applicants'
  | 'review'
  | 'explore'
  | 'creators'
  | 'insights'
  | 'payments'
  | 'analytics'
  | 'settings';

export function getStudioSidebar(activeId: StudioRouteId): SidebarSection[] {
  const isActive = (id: StudioRouteId) => activeId === id;

  return [
    {
      label: '게임사',
      items: [
        {
          id: 'my-campaigns',
          icon: <LayoutDashboard size={16} />,
          label: '대시보드',
          href: '/studio',
          active: isActive('my-campaigns'),
        },
        {
          id: 'new',
          icon: <Plus size={16} />,
          label: '캠페인 만들기',
          href: '/studio/new',
          active: false,
        },
      ],
    },
    {
      label: '계정',
      items: [
        {
          id: 'settings',
          icon: <Settings size={16} />,
          label: '설정',
          href: '/studio/settings',
          active: isActive('settings'),
        },
      ],
    },
  ];
}
