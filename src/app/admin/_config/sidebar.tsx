import {
  Building2,
  Flag,
  LayoutDashboard,
  LineChart,
  Megaphone,
  PieChart,
  Receipt,
  Settings,
  Users,
} from 'lucide-react';

import type { SidebarSection } from '@/components/layout';

export type AdminRouteId =
  | 'overview'
  | 'review'
  | 'disputes'
  | 'payouts'
  | 'studios'
  | 'creators'
  | 'campaigns'
  | 'revenue'
  | 'analytics'
  | 'settings';

export function getAdminSidebar(
  activeId: AdminRouteId,
  counts?: { review?: number; payouts?: number },
): SidebarSection[] {
  const isActive = (id: AdminRouteId) => activeId === id;

  return [
    {
      label: '운영',
      items: [
        {
          id: 'overview',
          icon: <LayoutDashboard size={16} />,
          label: '개요',
          href: '/admin',
          active: isActive('overview'),
        },
        {
          id: 'disputes',
          icon: <Flag size={16} />,
          label: '분쟁',
          href: '/admin/disputes',
          active: isActive('disputes'),
        },
        {
          id: 'payouts',
          icon: <Receipt size={16} />,
          label: '콘텐츠 검수',
          href: '/admin/payouts',
          ...(counts?.payouts ? { count: counts.payouts } : {}),
          active: isActive('payouts'),
        },
      ],
    },
    {
      label: '디렉터리',
      items: [
        {
          id: 'studios',
          icon: <Building2 size={16} />,
          label: '게임사',
          href: '/admin/studios',
          active: isActive('studios'),
        },
        {
          id: 'creators',
          icon: <Users size={16} />,
          label: '크리에이터',
          href: '/admin/creators',
          active: isActive('creators'),
        },
        {
          id: 'campaigns',
          icon: <Megaphone size={16} />,
          label: '캠페인',
          href: '/admin/campaigns',
          active: isActive('campaigns'),
        },
      ],
    },
    {
      label: '인사이트',
      items: [
        {
          id: 'revenue',
          icon: <LineChart size={16} />,
          label: '매출',
          href: '/admin/revenue',
          active: isActive('revenue'),
        },
        {
          id: 'analytics',
          icon: <PieChart size={16} />,
          label: '분석',
          href: '/admin/analytics',
          active: isActive('analytics'),
        },
      ],
    },
    {
      label: '시스템',
      items: [
        {
          id: 'settings',
          icon: <Settings size={16} />,
          label: '설정',
          href: '/admin/settings',
          active: isActive('settings'),
        },
      ],
    },
  ];
}
