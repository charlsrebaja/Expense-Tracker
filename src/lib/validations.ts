import { z } from "zod";

export const expenseSchema = z.object({
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description must be less than 255 characters"),
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  category: z.string().max(50).optional(),
});

export type ExpenseFormData = z.infer<typeof expenseSchema>;
