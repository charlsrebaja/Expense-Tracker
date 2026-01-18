import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  className?: string;
}

export function SummaryCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
}: SummaryCardProps) {
  return (
    <Card
      className={`rounded-3xl border-none shadow-sm transition-all hover:shadow-md ${className}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-semibold text-slate-600">
          {title}
        </CardTitle>
        {Icon && (
          <div className="p-2 bg-slate-50 rounded-full group-hover:bg-slate-100 transition-colors">
            <Icon className="h-4 w-4 text-slate-600" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900 mb-2">{value}</div>
        <div className="flex items-center gap-2">
          {trend && (
            <div
              className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                trend === "up"
                  ? "bg-emerald-100 text-emerald-700"
                  : trend === "down"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-slate-100 text-slate-700"
              }`}
            >
              {trend === "up" ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {trendValue || "0%"}
            </div>
          )}
          {description && (
            <p className="text-xs text-slate-500">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
