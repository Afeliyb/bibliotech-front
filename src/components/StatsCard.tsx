import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  glowColor?: "primary" | "accent" | "success" | "destructive";
}

const glowStyles = {
  primary: "border-primary/20 hover:border-primary/40 hover:glow-primary",
  accent: "border-accent/20 hover:border-accent/40 hover:glow-accent",
  success: "border-success/20 hover:border-success/40",
  destructive: "border-destructive/20 hover:border-destructive/40",
};

const iconBgStyles = {
  primary: "bg-primary/15 text-primary",
  accent: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  destructive: "bg-destructive/15 text-destructive",
};

const StatsCard = ({ title, value, change, changeType = "neutral", icon: Icon, glowColor = "primary" }: StatsCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={cn(
        "rounded-xl border bg-card p-5 transition-all duration-300",
        glowStyles[glowColor]
      )}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-display font-bold mt-2">{value}</p>
            {change && (
              <p className={cn(
                "text-xs mt-1 font-medium",
                changeType === "positive" && "text-success",
                changeType === "negative" && "text-destructive",
                changeType === "neutral" && "text-muted-foreground"
              )}>
                {change}
              </p>
            )}
          </div>
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", iconBgStyles[glowColor])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
