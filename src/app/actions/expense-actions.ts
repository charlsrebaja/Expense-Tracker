"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { expenseSchema } from "@/lib/validations";
import { ActionState } from "@/types";

// CREATE
export async function createExpense(formData: FormData): Promise<ActionState> {
  const rawData = {
    description: formData.get("description") as string,
    amount: formData.get("amount") as string,
    category: (formData.get("category") as string) || undefined,
  };

  const validated = expenseSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    await db.expense.create({
      data: {
        description: validated.data.description,
        amount: parseFloat(validated.data.amount),
        category: validated.data.category,
      },
    });

    revalidatePath("/");
    return { success: true, message: "Expense created successfully" };
  } catch (error) {
    console.error("Failed to create expense:", error);
    return { success: false, message: "Failed to create expense" };
  }
}

// READ - Get all expenses
export async function getExpenses() {
  try {
    return await db.expense.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return [];
  }
}

// READ - Get single expense by ID
export async function getExpenseById(id: string) {
  try {
    return await db.expense.findUnique({ where: { id } });
  } catch (error) {
    console.error("Failed to fetch expense:", error);
    return null;
  }
}

// UPDATE
export async function updateExpense(
  id: string,
  formData: FormData,
): Promise<ActionState> {
  const rawData = {
    description: formData.get("description") as string,
    amount: formData.get("amount") as string,
    category: (formData.get("category") as string) || undefined,
  };

  const validated = expenseSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  try {
    await db.expense.update({
      where: { id },
      data: {
        description: validated.data.description,
        amount: parseFloat(validated.data.amount),
        category: validated.data.category,
      },
    });

    revalidatePath("/");
    return { success: true, message: "Expense updated successfully" };
  } catch (error) {
    console.error("Failed to update expense:", error);
    return { success: false, message: "Failed to update expense" };
  }
}

// DELETE
export async function deleteExpense(id: string): Promise<ActionState> {
  try {
    await db.expense.delete({ where: { id } });
    revalidatePath("/");
    return { success: true, message: "Expense deleted successfully" };
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return { success: false, message: "Failed to delete expense" };
  }
}

// AGGREGATE - Get total spending
export async function getTotalSpending(): Promise<number> {
  try {
    const result = await db.expense.aggregate({
      _sum: { amount: true },
    });
    return Number(result._sum.amount) || 0;
  } catch (error) {
    console.error("Failed to get total spending:", error);
    return 0;
  }
}

// AGGREGATE - Get expense count
export async function getExpenseCount(): Promise<number> {
  try {
    return await db.expense.count();
  } catch (error) {
    console.error("Failed to get expense count:", error);
    return 0;
  }
}
