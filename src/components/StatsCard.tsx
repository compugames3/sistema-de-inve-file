import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconProps } from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<IconProps>;
  iconColor?: string;
}

export function StatsCard({ title, value, icon: Icon, iconColor = 'text-primary' }: StatsCardProps) {
  const getBackgroundColor = (color: string) => {
    if (color.includes('primary')) return 'bg-primary/10 border-primary/20';
    if (color.includes('warning')) return 'bg-warning/10 border-warning/20';
    if (color.includes('success')) return 'bg-success/10 border-success/20';
    if (color.includes('accent')) return 'bg-accent/10 border-accent/20';
    return 'bg-primary/10 border-primary/20';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <Card className="relative overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl" />
        <CardHeader className="flex flex-row items-center justify-between pb-3 relative z-10">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {title}
          </CardTitle>
          <div className={`w-12 h-12 rounded-xl ${getBackgroundColor(iconColor)} flex items-center justify-center border-2 shadow-sm`}>
            <Icon className={`w-6 h-6 ${iconColor}`} weight="duotone" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="text-3xl font-bold bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            {value}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
