import {
  Building2,
  FileCheck,
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

export function getAdminSidebar(activeId: AdminRouteId): SidebarSection[] {
  const isActive = (id: AdminRouteId) => activeId === id;

  return [
    {
      label: 'Operations',
      items: [
        {
          id: 'overview',
          icon: <LayoutDashboard size={16} />,
          label: 'Overview',
          href: '/admin',
          active: isActive('overview'),
        },
        {
          id: 'review',
          icon: <FileCheck size={16} />,
          label: 'Content review',
          href: '/admin/review',
          count: 8,
          countVariant: 'urgent',
          active: isActive('review'),
        },
        {
          id: 'disputes',
          icon: <Flag size={16} />,
          label: 'Disputes',
          href: '/admin/disputes',
          count: 2,
          active: isActive('disputes'),
        },
        {
          id: 'payouts',
          icon: <Receipt size={16} />,
          label: 'Payouts',
          href: '/admin/payouts',
          count: 5,
          active: isActive('payouts'),
        },
      ],
    },
    {
      label: 'Directory',
      items: [
        {
          id: 'studios',
          icon: <Building2 size={16} />,
          label: 'Studios',
          href: '/admin/studios',
          active: isActive('studios'),
        },
        {
          id: 'creators',
          icon: <Users size={16} />,
          label: 'Creators',
          href: '/admin/creators',
          active: isActive('creators'),
        },
        {
          id: 'campaigns',
          icon: <Megaphone size={16} />,
          label: 'Campaigns',
          href: '/admin/campaigns',
          active: isActive('campaigns'),
        },
      ],
    },
    {
      label: 'Insights',
      items: [
        {
          id: 'revenue',
          icon: <LineChart size={16} />,
          label: 'Revenue',
          href: '/admin/revenue',
          active: isActive('revenue'),
        },
        {
          id: 'analytics',
          icon: <PieChart size={16} />,
          label: 'Analytics',
          href: '/admin/analytics',
          active: isActive('analytics'),
        },
      ],
    },
    {
      label: 'System',
      items: [
        {
          id: 'settings',
          icon: <Settings size={16} />,
          label: 'Settings',
          href: '/admin/settings',
          active: isActive('settings'),
        },
      ],
    },
  ];
}
