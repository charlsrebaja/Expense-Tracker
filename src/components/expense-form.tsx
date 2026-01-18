"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExpense } from "@/app/actions/expense-actions";
import { expenseSchema, ExpenseFormData } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const CATEGORIES = [
  "Food",
  "Drinks",
  "Transportation",
  "Rent",
  "Health",
  "Groceries",
  "Shopping",
  "Education",
  "Gift",
  "Insurance",
  "Savings",
  "Utilities",
  "Borrowed Money",
  "Investments",
] as const;

const CATEGORY_STYLES: Record<string, { bg: string; border: string; text: string; activeBg: string }> = {
  Food: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", activeBg: "bg-orange-500" },
  Drinks: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", activeBg: "bg-amber-500" },
  Transportation: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", activeBg: "bg-blue-500" },
  Rent: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", activeBg: "bg-purple-500" },
  Health: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", activeBg: "bg-red-500" },
  Groceries: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", activeBg: "bg-green-500" },
  Shopping: { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700", activeBg: "bg-pink-500" },
  Education: { bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700", activeBg: "bg-indigo-500" },
  Gift: { bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", activeBg: "bg-rose-500" },
  Insurance: { bg: "bg-cyan-50", border: "border-cyan-200", text: "text-cyan-700", activeBg: "bg-cyan-500" },
  Savings: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", activeBg: "bg-emerald-500" },
  Utilities: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", activeBg: "bg-yellow-500" },
  "Borrowed Money": { bg: "bg-slate-50", border: "border-slate-300", text: "text-slate-700", activeBg: "bg-slate-500" },
  Investments: { bg: "bg-teal-50", border: "border-teal-200", text: "text-teal-700", activeBg: "bg-teal-500" },
};

export function ExpenseForm() {
  const [isPending, startTransition] = useTransition();
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { description: "", amount: "", category: "", note: "" },
  });

  const categoryValue = watch("category");

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory("");
      setValue("category", "");
    } else {
      setSelectedCategory(category);
      setValue("category", category);
    }
  };

  const handleCategoryInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value;
    setValue("category", value);
    if (!CATEGORIES.includes(value as (typeof CATEGORIES)[number])) {
      setSelectedCategory("");
    } else {
      setSelectedCategory(value);
    }
  };

  const onSubmit = (data: ExpenseFormData) => {
    const formData = new FormData();
    formData.append("description", data.description);
    formData.append("amount", data.amount);
    if (data.category) formData.append("category", data.category);
    if (data.note) formData.append("note", data.note);

    startTransition(async () => {
      const result = await createExpense(formData);
      if (result.success) {
        toast.success(result.message);
        reset();
        setSelectedCategory("");
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            placeholder="What is this for?"
            {...register("description")}
            disabled={isPending}
            className="bg-background"
          />
          {errors.description && (
            <p className="text-xs text-red-500 font-medium">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (₱)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("amount")}
              disabled={isPending}
              className="font-mono bg-background"
            />
            {errors.amount && (
              <p className="text-xs text-red-500 font-medium">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              placeholder="Select..."
              value={categoryValue || ""}
              onChange={handleCategoryInputChange}
              disabled={isPending}
              className="bg-background"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="note">
            Note{" "}
            <span className="text-muted-foreground font-normal text-xs">
              (Optional)
            </span>
          </Label>
          <Input
            id="note"
            placeholder="Add details..."
            {...register("note")}
            disabled={isPending}
            className="bg-background"
          />
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full font-semibold shadow-sm"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Adding...
            </span>
          ) : (
            "Add Expense"
          )}
        </Button>
      </div>

      <div className="space-y-2.5 pt-2 border-t">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Quick Categories
        </Label>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((category) => {
            const styles = CATEGORY_STYLES[category];
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryClick(category)}
                disabled={isPending}
                className={`px-2.5 py-1 text-[10px] uppercase font-medium tracking-wide rounded-md border transition-all ${
                  isSelected
                    ? `${styles.activeBg} text-white border-transparent shadow-sm scale-105`
                    : `${styles.bg} ${styles.border} ${styles.text} hover:shadow-sm`
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>
    </form>
  );
}
