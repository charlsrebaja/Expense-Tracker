"use client";

import { SerializedExpense } from "@/types";
import { ExpenseForm } from "./expense-form";
import { ExpenseTable } from "./expense-table";
import { SummaryCard } from "./summary-card";
import { DateFilter } from "./date-filter";
import { CategoryBreakdown } from "./category-breakdown";
import { ExportButtons } from "./export-buttons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  Receipt,
  TrendingUp,
  Filter,
  Plus,
  BarChart3,
} from "lucide-react";

interface DashboardProps {
  expenses: SerializedExpense[];
  totalSpending: number;
  expenseCount: number;
}

export function Dashboard({
  expenses,
  totalSpending,
  expenseCount,
}: DashboardProps) {
  const averageExpense = expenseCount > 0 ? totalSpending / expenseCount : 0;

  return (
    <div className="space-y-8 pb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Dashboard
          </h2>
          <p className="text-sm text-slate-500">
            Overview of your financial activity
          </p>
        </div>
        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          <DateFilter />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl opacity-20 blur transition duration-500 group-hover:opacity-60" />
          <SummaryCard
            title="Total Spending"
            value={`₱${totalSpending.toFixed(2)}`}
            description="Filtered period"
            icon={Wallet}
            className="relative bg-white h-full"
          />
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl opacity-20 blur transition duration-500 group-hover:opacity-60" />
          <SummaryCard
            title="Total Transactions"
            value={expenseCount}
            description="Number of records"
            icon={Receipt}
            className="relative bg-white h-full"
          />
        </div>

        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl opacity-20 blur transition duration-500 group-hover:opacity-60" />
          <SummaryCard
            title="Average Transaction"
            value={`₱${averageExpense.toFixed(2)}`}
            description="Per expense"
            icon={TrendingUp}
            className="relative bg-white h-full"
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Transactions (2/3 width) */}
        <div className="lg:col-span-2 space-y-6 lg:order-1 order-2">
          <Card className="border-none shadow-xl shadow-slate-200/60 rounded-3xl overflow-hidden bg-white h-full">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-8 pt-8 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100">
                  <BarChart3 className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-slate-900">
                    Recent Transactions
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    History of your expenses
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ExportButtons expenses={expenses} />
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8 pt-2">
              <ExpenseTable expenses={expenses} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Actions & Insights (1/3 width) */}
        <div className="space-y-6 lg:order-2 order-1">
          {/* Quick Add */}
          <Card className="border-none shadow-xl shadow-slate-200/60 rounded-3xl overflow-hidden bg-white">
            <CardHeader className="px-6 pt-6 pb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
                  <Plus className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Add New Expense
                  </CardTitle>
                  <p className="text-sm text-slate-500">
                    Log a new transaction
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <ExpenseForm />
            </CardContent>
          </Card>

          {/* Visualization */}
          <CategoryBreakdown expenses={expenses} />
        </div>
      </div>
    </div>
  );
}
