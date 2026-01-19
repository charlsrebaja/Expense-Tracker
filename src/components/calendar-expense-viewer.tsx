"use client";

import { useState, useMemo } from "react";
import { SerializedExpense } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Receipt } from "lucide-react";
import { format, isSameDay } from "date-fns";

interface CalendarExpenseViewerProps {
  expenses: SerializedExpense[];
}

export function CalendarExpenseViewer({
  expenses,
}: CalendarExpenseViewerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [open, setOpen] = useState(false);

  // Get expenses for selected date
  const expensesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    return expenses.filter((expense) =>
      isSameDay(new Date(expense.createdAt), selectedDate),
    );
  }, [expenses, selectedDate]);

  // Calculate total for selected date
  const totalForSelectedDate = useMemo(() => {
    return expensesForSelectedDate.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
  }, [expensesForSelectedDate]);

  // Get dates that have expenses (for highlighting in calendar)
  const datesWithExpenses = useMemo(() => {
    return expenses.map((expense) => new Date(expense.createdAt));
  }, [expenses]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <CalendarDays className="h-4 w-4" />
          <span className="sr-only">View calendar</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-125 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-indigo-600" />
            Daily Expense Calendar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Calendar */}
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{
                hasExpense: datesWithExpenses,
              }}
              modifiersClassNames={{
                hasExpense:
                  "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-indigo-500 after:rounded-full",
              }}
              className="rounded-md border"
            />
          </div>

          {/* Selected Date Info */}
          {selectedDate && (
            <Card className="border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">
                    {format(selectedDate, "MMMM d, yyyy")}
                  </h3>
                  <Badge
                    variant="secondary"
                    className="bg-indigo-50 text-indigo-700"
                  >
                    ₱{totalForSelectedDate.toFixed(2)}
                  </Badge>
                </div>

                {expensesForSelectedDate.length > 0 ? (
                  <div className="space-y-2 max-h-50 overflow-y-auto">
                    {expensesForSelectedDate.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                            <Receipt className="h-4 w-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-900">
                              {expense.description}
                            </p>
                            {expense.category && (
                              <Badge
                                variant="outline"
                                className="text-xs mt-0.5"
                              >
                                {expense.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold text-sm text-slate-700">
                          ₱{expense.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-slate-500">
                    <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No expenses on this day</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
