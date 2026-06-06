import {
  BarChart3,
  Compass,
  FileText,
  LayoutDashboard,
  Settings,
  TrendingUp,
  UserSearch,
  Users,
  Wallet,
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
          label: '내 캠페인',
          href: '/studio',
          active: isActive('my-campaigns'),
        },
        {
          id: 'applicants',
          icon: <Users size={16} />,
          label: '지원자',
          href: '/studio/applicants',
          count: 3,
          active: isActive('applicants'),
        },
        {
          id: 'review',
          icon: <FileText size={16} />,
          label: '콘텐츠 검수',
          href: '/studio/review',
          count: 8,
          countVariant: 'urgent',
          active: isActive('review'),
        },
      ],
    },
    {
      label: '탐색',
      items: [
        {
          id: 'explore',
          icon: <Compass size={16} />,
          label: '전체 캠페인',
          href: '/studio/explore',
          active: isActive('explore'),
        },
        {
          id: 'creators',
          icon: <UserSearch size={16} />,
          label: '크리에이터 목록',
          href: '/studio/creators',
          active: isActive('creators'),
        },
        {
          id: 'insights',
          icon: <TrendingUp size={16} />,
          label: '마켓 인사이트',
          href: '/studio/insights',
          active: isActive('insights'),
        },
      ],
    },
    {
      label: '정산',
      items: [
        {
          id: 'payments',
          icon: <Wallet size={16} />,
          label: '결제·정산',
          href: '/studio/payments',
          active: isActive('payments'),
        },
        {
          id: 'analytics',
          icon: <BarChart3 size={16} />,
          label: '분석',
          href: '/studio/analytics',
          active: isActive('analytics'),
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
