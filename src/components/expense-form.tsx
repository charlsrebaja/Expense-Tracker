"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExpense } from "@/app/actions/expense-actions";
import { expenseSchema, ExpenseFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function ExpenseForm() {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { description: "", amount: "", category: "" },
  });

  const onSubmit = (data: ExpenseFormData) => {
    const formData = new FormData();
    formData.append("description", data.description);
    formData.append("amount", data.amount);
    if (data.category) formData.append("category", data.category);

    startTransition(async () => {
      const result = await createExpense(formData);
      if (result.success) {
        toast.success(result.message);
        reset();
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 sm:flex-row sm:items-end sm:flex-wrap"
    >
      <div className="flex-1 min-w-[200px] space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Coffee, Groceries, etc."
          {...register("description")}
          disabled={isPending}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      <div className="w-full sm:w-32 space-y-2">
        <Label htmlFor="amount">Amount ($)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          {...register("amount")}
          disabled={isPending}
        />
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount.message}</p>
        )}
      </div>

      <div className="w-full sm:w-40 space-y-2">
        <Label htmlFor="category">Category (optional)</Label>
        <Input
          id="category"
          placeholder="Food, Transport..."
          {...register("category")}
          disabled={isPending}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
        {isPending ? "Adding..." : "Add Expense"}
      </Button>
    </form>
  );
}
