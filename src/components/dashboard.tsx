import { Expense } from "@prisma/client";
import { ExpenseForm } from "./expense-form";
import { ExpenseTable } from "./expense-table";
import { SummaryCard } from "./summary-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardProps {
  expenses: Expense[];
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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          title="Total Spending"
          value={`$${totalSpending.toFixed(2)}`}
          description="All time total"
        />
        <SummaryCard
          title="Total Expenses"
          value={expenseCount}
          description="Number of records"
        />
        <SummaryCard
          title="Average Expense"
          value={`$${averageExpense.toFixed(2)}`}
          description="Per transaction"
        />
      </div>

      {/* Add Expense Form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Expense</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseForm />
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseTable expenses={expenses} />
        </CardContent>
      </Card>
    </div>
  );
}
