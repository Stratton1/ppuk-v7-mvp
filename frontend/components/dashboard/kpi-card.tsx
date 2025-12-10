import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type KpiCardProps = {
  title: string;
  value: string | number;
  description?: string;
};

export const KpiCard = ({ title, value, description }: KpiCardProps) => (
  <Card>
    <CardHeader className="pb-2">
      <CardDescription>{title}</CardDescription>
      <CardTitle className="text-3xl">{value}</CardTitle>
    </CardHeader>
    {description ? (
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    ) : null}
  </Card>
);
