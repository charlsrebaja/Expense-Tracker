"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { expenseSchema } from "@/lib/validations";
import { ActionState } from "@/types";
import { getCurrentUser } from "./auth-actions";

// CREATE
export async function createExpense(formData: FormData): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const rawData = {
    description: formData.get("description") as string,
    amount: formData.get("amount") as string,
    category: (formData.get("category") as string) || undefined,
    note: (formData.get("note") as string) || undefined,
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
        note: validated.data.note,
        userId: user.id,
      },
    });

    revalidatePath("/");
    return { success: true, message: "Expense created successfully" };
  } catch (error) {
    console.error("Failed to create expense:", error);
    return { success: false, message: "Failed to create expense" };
  }
}

// READ - Get all expenses for current user with optional date filter
export async function getExpenses(from?: string, to?: string) {
  const user = await getCurrentUser();
  if (!user) {
    return [];
  }

  try {
    const whereClause: {
      userId: string;
      createdAt?: { gte?: Date; lte?: Date };
    } = {
      userId: user.id,
    };

    if (from || to) {
      whereClause.createdAt = {};
      if (from) {
        whereClause.createdAt.gte = new Date(from);
      }
      if (to) {
        // Add 1 day to include the entire end date
        const endDate = new Date(to);
        endDate.setDate(endDate.getDate() + 1);
        whereClause.createdAt.lte = endDate;
      }
    }

    const expenses = await db.expense.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });
    return expenses.map((expense) => ({
      ...expense,
      amount: Number(expense.amount),
    }));
  } catch (error) {
    console.error("Failed to fetch expenses:", error);
    return [];
  }
}

// READ - Get single expense by ID (only if belongs to current user)
export async function getExpenseById(id: string) {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  try {
    return await db.expense.findFirst({
      where: { id, userId: user.id },
    });
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
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const rawData = {
    description: formData.get("description") as string,
    amount: formData.get("amount") as string,
    category: (formData.get("category") as string) || undefined,
    note: (formData.get("note") as string) || undefined,
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
    // Ensure the expense belongs to the current user
    const expense = await db.expense.findFirst({
      where: { id, userId: user.id },
    });

    if (!expense) {
      return { success: false, message: "Expense not found" };
    }

    await db.expense.update({
      where: { id },
      data: {
        description: validated.data.description,
        amount: parseFloat(validated.data.amount),
        category: validated.data.category,
        note: validated.data.note,
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
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  try {
    // Ensure the expense belongs to the current user
    const expense = await db.expense.findFirst({
      where: { id, userId: user.id },
    });

    if (!expense) {
      return { success: false, message: "Expense not found" };
    }

    await db.expense.delete({ where: { id } });
    revalidatePath("/");
    return { success: true, message: "Expense deleted successfully" };
  } catch (error) {
    console.error("Failed to delete expense:", error);
    return { success: false, message: "Failed to delete expense" };
  }
}

// AGGREGATE - Get total spending for current user with optional date filter
export async function getTotalSpending(
  from?: string,
  to?: string,
): Promise<number> {
  const user = await getCurrentUser();
  if (!user) {
    return 0;
  }

  try {
    const whereClause: {
      userId: string;
      createdAt?: { gte?: Date; lte?: Date };
    } = {
      userId: user.id,
    };

    if (from || to) {
      whereClause.createdAt = {};
      if (from) {
        whereClause.createdAt.gte = new Date(from);
      }
      if (to) {
        const endDate = new Date(to);
        endDate.setDate(endDate.getDate() + 1);
        whereClause.createdAt.lte = endDate;
      }
    }

    const result = await db.expense.aggregate({
      where: whereClause,
      _sum: { amount: true },
    });
    return Number(result._sum.amount) || 0;
  } catch (error) {
    console.error("Failed to get total spending:", error);
    return 0;
  }
}

// AGGREGATE - Get expense count for current user with optional date filter
export async function getExpenseCount(
  from?: string,
  to?: string,
): Promise<number> {
  const user = await getCurrentUser();
  if (!user) {
    return 0;
  }

  try {
    const whereClause: {
      userId: string;
      createdAt?: { gte?: Date; lte?: Date };
    } = {
      userId: user.id,
    };

    if (from || to) {
      whereClause.createdAt = {};
      if (from) {
        whereClause.createdAt.gte = new Date(from);
      }
      if (to) {
        const endDate = new Date(to);
        endDate.setDate(endDate.getDate() + 1);
        whereClause.createdAt.lte = endDate;
      }
    }

    return await db.expense.count({
      where: whereClause,
    });
  } catch (error) {
    console.error("Failed to get expense count:", error);
    return 0;
  }
}
