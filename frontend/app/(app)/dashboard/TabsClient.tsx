'use client';

import dynamic from 'next/dynamic';
import type { DashboardTabsProps } from '@/components/dashboard/DashboardTabs';

const DashboardTabs = dynamic(() => import('@/components/dashboard/DashboardTabs').then((mod) => mod.DashboardTabs), {
  ssr: false,
});

export function DashboardTabsClient(props: DashboardTabsProps) {
  return <DashboardTabs {...props} />;
}
