export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

// Serialized expense type (with amount as number instead of Decimal)
export type SerializedExpense = {
  id: string;
  description: string;
  amount: number;
  category: string | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
};
