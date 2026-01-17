"use client";

import { useState, useTransition } from "react";
import { Expense } from "@prisma/client";
import { format } from "date-fns";
import { deleteExpense, updateExpense } from "@/app/actions/expense-actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ExpenseTableProps {
  expenses: Expense[];
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  const [isPending, startTransition] = useTransition();
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    category: "",
  });

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteExpense(id);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setEditForm({
      description: expense.description,
      amount: String(expense.amount),
      category: expense.category || "",
    });
  };

  const handleUpdate = () => {
    if (!editingExpense) return;

    const formData = new FormData();
    formData.append("description", editForm.description);
    formData.append("amount", editForm.amount);
    formData.append("category", editForm.category);

    startTransition(async () => {
      const result = await updateExpense(editingExpense.id, formData);
      if (result.success) {
        toast.success(result.message);
        setEditingExpense(null);
      } else {
        toast.error(result.message);
      }
    });
  };

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          No expenses recorded yet. Add your first expense above!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell className="text-muted-foreground">
                  {format(new Date(expense.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="font-medium">
                  {expense.description}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {expense.category || "-"}
                </TableCell>
                <TableCell className="text-right font-mono">
                  ${Number(expense.amount).toFixed(2)}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(expense)}
                    disabled={isPending}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(expense.id)}
                    disabled={isPending}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={editingExpense !== null}
        onOpenChange={() => setEditingExpense(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editForm.description}
                onChange={(e) =>
                  setEditForm({ ...editForm, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Amount ($)</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                min="0"
                value={editForm.amount}
                onChange={(e) =>
                  setEditForm({ ...editForm, amount: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category (optional)</Label>
              <Input
                id="edit-category"
                value={editForm.category}
                onChange={(e) =>
                  setEditForm({ ...editForm, category: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingExpense(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isPending}>
              {isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
