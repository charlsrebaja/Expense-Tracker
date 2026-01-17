import {
  getExpenses,
  getTotalSpending,
  getExpenseCount,
} from "@/app/actions/expense-actions";
import { Dashboard } from "@/components/dashboard";

export default async function HomePage() {
  const [expenses, totalSpending, expenseCount] = await Promise.all([
    getExpenses(),
    getTotalSpending(),
    getExpenseCount(),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Expense Tracker</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage your daily expenses
          </p>
        </header>
        <Dashboard
          expenses={expenses}
          totalSpending={totalSpending}
          expenseCount={expenseCount}
        />
      </div>
    </main>
  );
}
