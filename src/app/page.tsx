import { redirect } from "next/navigation";
import {
  getExpenses,
  getTotalSpending,
  getExpenseCount,
} from "@/app/actions/expense-actions";
import { getCurrentUser, logout } from "@/app/actions/auth-actions";
import { Dashboard } from "@/components/dashboard";
import { Button } from "@/components/ui/button";

interface HomePageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const from = params.from;
  const to = params.to;

  const [expenses, totalSpending, expenseCount] = await Promise.all([
    getExpenses(from, to),
    getTotalSpending(from, to),
    getExpenseCount(from, to),
  ]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 max-w-6xl">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Expense Tracker
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user.name}
            </p>
          </div>
          <form action={logout}>
            <Button variant="outline" type="submit">
              Sign out
            </Button>
          </form>
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
