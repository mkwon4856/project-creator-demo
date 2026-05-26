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
      label: 'Studio',
      items: [
        {
          id: 'my-campaigns',
          icon: <LayoutDashboard size={16} />,
          label: 'My campaigns',
          href: '/studio',
          active: isActive('my-campaigns'),
        },
        {
          id: 'applicants',
          icon: <Users size={16} />,
          label: 'Applicants',
          href: '/studio/applicants',
          count: 3,
          active: isActive('applicants'),
        },
        {
          id: 'review',
          icon: <FileText size={16} />,
          label: 'Content review',
          href: '/studio/review',
          count: 8,
          countVariant: 'urgent',
          active: isActive('review'),
        },
      ],
    },
    {
      label: 'Explore',
      items: [
        {
          id: 'explore',
          icon: <Compass size={16} />,
          label: 'All campaigns',
          href: '/studio/explore',
          active: isActive('explore'),
        },
        {
          id: 'creators',
          icon: <UserSearch size={16} />,
          label: 'Creator directory',
          href: '/studio/creators',
          active: isActive('creators'),
        },
        {
          id: 'insights',
          icon: <TrendingUp size={16} />,
          label: 'Market insights',
          href: '/studio/insights',
          active: isActive('insights'),
        },
      ],
    },
    {
      label: 'Finance',
      items: [
        {
          id: 'payments',
          icon: <Wallet size={16} />,
          label: 'Payments',
          href: '/studio/payments',
          active: isActive('payments'),
        },
        {
          id: 'analytics',
          icon: <BarChart3 size={16} />,
          label: 'Analytics',
          href: '/studio/analytics',
          active: isActive('analytics'),
        },
      ],
    },
    {
      label: 'Account',
      items: [
        {
          id: 'settings',
          icon: <Settings size={16} />,
          label: 'Settings',
          href: '/studio/settings',
          active: isActive('settings'),
        },
      ],
    },
  ];
}
