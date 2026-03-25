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
    if (color.includes('primary')) return 'bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30';
    if (color.includes('warning')) return 'bg-gradient-to-br from-warning/20 to-warning/10 border-warning/30';
    if (color.includes('success')) return 'bg-gradient-to-br from-success/20 to-success/10 border-success/30';
    if (color.includes('accent')) return 'bg-gradient-to-br from-accent/20 to-accent/10 border-accent/30';
    return 'bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30';
  };

  const getGlowColor = (color: string) => {
    if (color.includes('primary')) return 'from-primary/10';
    if (color.includes('warning')) return 'from-warning/10';
    if (color.includes('success')) return 'from-success/10';
    if (color.includes('accent')) return 'from-accent/10';
    return 'from-primary/10';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 100 }}
    >
      <Card className="relative overflow-hidden border-2 border-border/40 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white">
        <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${getGlowColor(iconColor)} to-transparent rounded-full blur-3xl opacity-60`} />
        <CardHeader className="flex flex-row items-center justify-between pb-4 relative z-10">
          <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
            {title}
          </CardTitle>
          <div className={`w-14 h-14 rounded-2xl ${getBackgroundColor(iconColor)} flex items-center justify-center border-2 shadow-lg`}>
            <Icon className={`w-7 h-7 ${iconColor}`} weight="duotone" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10 pt-2">
          <div className="text-4xl font-extrabold text-foreground tracking-tight">
            {value}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
