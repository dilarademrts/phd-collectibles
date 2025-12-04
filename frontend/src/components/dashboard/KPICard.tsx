import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  gradient?: string;
}

export const KPICard = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  gradient = "gradient-card",
}: KPICardProps) => {
  const trendColor = trend === "up" ? "text-success" : "text-destructive";

  return (
    <Card className={`${gradient} border-border/50 p-6 floating-card hover-lift`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold mb-2">{value}</h3>
          <p className={`text-sm font-medium ${trendColor}`}>{change}</p>
        </div>
        <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center glow-primary">
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>
      </div>
    </Card>
  );
};
