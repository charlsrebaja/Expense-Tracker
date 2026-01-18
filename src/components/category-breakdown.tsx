"use client";

import { useMemo } from "react";
import { SerializedExpense } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";

interface CategoryBreakdownProps {
  expenses: SerializedExpense[];
}

interface CategoryData {
  name: string;
  amount: number;
  count: number;
  percentage: number;
}

const CATEGORY_STYLES: Record<
  string,
  { bar: string; bg: string; border: string; text: string }
> = {
  Food: {
    bar: "bg-orange-500",
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-700",
  },
  Drinks: {
    bar: "bg-amber-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-700",
  },
  Transportation: {
    bar: "bg-blue-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
  },
  Rent: {
    bar: "bg-purple-500",
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-700",
  },
  Health: {
    bar: "bg-red-500",
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
  },
  Groceries: {
    bar: "bg-green-500",
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
  },
  Shopping: {
    bar: "bg-pink-500",
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-700",
  },
  Education: {
    bar: "bg-indigo-500",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-700",
  },
  Gift: {
    bar: "bg-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-200",
    text: "text-rose-700",
  },
  Insurance: {
    bar: "bg-cyan-500",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    text: "text-cyan-700",
  },
  Savings: {
    bar: "bg-emerald-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-700",
  },
  Utilities: {
    bar: "bg-yellow-500",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-700",
  },
  "Borrowed Money": {
    bar: "bg-slate-500",
    bg: "bg-slate-50",
    border: "border-slate-200",
    text: "text-slate-700",
  },
  Investments: {
    bar: "bg-teal-500",
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-700",
  },
  Uncategorized: {
    bar: "bg-gray-400",
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-600",
  },
};

const DEFAULT_STYLE = {
  bar: "bg-gray-400",
  bg: "bg-gray-50",
  border: "border-gray-200",
  text: "text-gray-600",
};

export function CategoryBreakdown({ expenses }: CategoryBreakdownProps) {
  const categoryData = useMemo(() => {
    const data: Record<string, { amount: number; count: number }> = {};
    let total = 0;

    expenses.forEach((expense) => {
      const category = expense.category || "Uncategorized";
      const amount = Number(expense.amount);
      total += amount;

      if (!data[category]) {
        data[category] = { amount: 0, count: 0 };
      }
      data[category].amount += amount;
      data[category].count += 1;
    });

    const categories: CategoryData[] = Object.entries(data)
      .map(([name, { amount, count }]) => ({
        name,
        amount,
        count,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    return { categories, total };
  }, [expenses]);

  if (expenses.length === 0) {
    return null;
  }

  return (
    <Card className="border-none shadow-xl shadow-slate-200/60 rounded-3xl overflow-hidden bg-white">
      <CardHeader className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-violet-50 rounded-xl flex items-center justify-center border border-violet-100">
            <PieChart className="h-5 w-5 text-violet-600" />
          </div>
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Category Breakdown
            </CardTitle>
            <p className="text-sm text-slate-500">Spending by category</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-3">
          {categoryData.categories.map((category) => {
            const styles = CATEGORY_STYLES[category.name] || DEFAULT_STYLE;
            return (
              <div
                key={category.name}
                className={`p-3 rounded-xl border ${styles.bg} ${styles.border} transition-all hover:shadow-sm`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${styles.bar}`} />
                    <span className={`text-sm font-medium ${styles.text}`}>
                      {category.name}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({category.count})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800">
                      ₱{category.amount.toFixed(2)}
                    </span>
                    <span
                      className={`text-xs font-medium px-1.5 py-0.5 rounded-md ${styles.bg} ${styles.text}`}
                    >
                      {category.percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-white/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${styles.bar}`}
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            );
          })}

          <div className="pt-4 mt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-700">
                Total Spending
              </span>
              <span className="text-lg font-bold text-slate-900">
                ₱{categoryData.total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
