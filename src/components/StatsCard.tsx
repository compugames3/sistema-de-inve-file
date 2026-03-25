import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconProps } from '@phosphor-icons/react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<IconProps>;
  iconColor?: string;
}

export function StatsCard({ title, value, icon: Icon, iconColor = 'text-primary' }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className={`w-5 h-5 ${iconColor}`} weight="duotone" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}
