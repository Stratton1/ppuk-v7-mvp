/**
 * @deprecated Use AppKPI from '@/components/app/AppKPI' instead.
 * This re-export exists for backwards compatibility.
 */
import { AppKPI } from '@/components/app/AppKPI';

type KpiCardProps = {
  title: string;
  value: string | number;
  description?: string;
};

export const KpiCard = ({ title, value, description }: KpiCardProps) => (
  <AppKPI label={title} value={value} hint={description} />
);
