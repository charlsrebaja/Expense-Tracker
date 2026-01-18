"use client";

import { useState, useTransition, useMemo } from "react";
import { SerializedExpense } from "@/types";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { toast } from "sonner";
import { Edit2, Trash2 } from "lucide-react";

type SortField = "date" | "amount" | "description" | "category";
type SortOrder = "asc" | "desc";

interface ExpenseTableProps {
  expenses: SerializedExpense[];
}

export function ExpenseTable({ expenses }: ExpenseTableProps) {
  const [isPending, startTransition] = useTransition();
  const [editingExpense, setEditingExpense] =
    useState<SerializedExpense | null>(null);
  const [editForm, setEditForm] = useState({
    description: "",
    amount: "",
    category: "",
    note: "",
  });

  // Search and Sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    let result = [...expenses];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (expense) =>
          expense.description.toLowerCase().includes(query) ||
          (expense.category?.toLowerCase() || "").includes(query) ||
          (expense.note?.toLowerCase() || "").includes(query),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "date":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "amount":
          comparison = Number(a.amount) - Number(b.amount);
          break;
        case "description":
          comparison = a.description.localeCompare(b.description);
          break;
        case "category":
          comparison = (a.category || "").localeCompare(b.category || "");
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [expenses, searchQuery, sortField, sortOrder]);

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

  const openEditDialog = (expense: SerializedExpense) => {
    setEditingExpense(expense);
    setEditForm({
      description: expense.description,
      amount: String(expense.amount),
      category: expense.category || "",
      note: expense.note || "",
    });
  };

  const handleUpdate = () => {
    if (!editingExpense) return;

    const formData = new FormData();
    formData.append("description", editForm.description);
    formData.append("amount", editForm.amount);
    formData.append("category", editForm.category);
    formData.append("note", editForm.note);

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <>
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder="Search by description, category, or note..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>
        <div className="flex items-center gap-2">
          <Label
            htmlFor="sort"
            className="text-sm text-muted-foreground whitespace-nowrap"
          >
            Sort by:
          </Label>
          <Select
            id="sort"
            value={`${sortField}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("-") as [
                SortField,
                SortOrder,
              ];
              setSortField(field);
              setSortOrder(order);
            }}
            className="w-[180px]"
          >
            <option value="date-desc">Date (Newest)</option>
            <option value="date-asc">Date (Oldest)</option>
            <option value="amount-desc">Amount (High to Low)</option>
            <option value="amount-asc">Amount (Low to High)</option>
            <option value="description-asc">Description (A-Z)</option>
            <option value="description-desc">Description (Z-A)</option>
            <option value="category-asc">Category (A-Z)</option>
            <option value="category-desc">Category (Z-A)</option>
          </Select>
        </div>
      </div>

      {searchQuery && (
        <p className="text-sm text-muted-foreground mb-4">
          Found {filteredAndSortedExpenses.length} of {expenses.length} expenses
        </p>
      )}

      {filteredAndSortedExpenses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No expenses match your search.
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("date")}
                >
                  Date
                  {renderSortIcon("date")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("description")}
                >
                  Description
                  {renderSortIcon("description")}
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("category")}
                >
                  Category
                  {renderSortIcon("category")}
                </TableHead>
                <TableHead>Note</TableHead>
                <TableHead
                  className="text-right cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort("amount")}
                >
                  Amount
                  {renderSortIcon("amount")}
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedExpenses.map((expense) => (
                <TableRow key={expense.id} className="group">
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {format(new Date(expense.createdAt), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell className="font-medium text-foreground">
                    {expense.description}
                  </TableCell>
                  <TableCell>
                    {expense.category ? (
                      <Badge
                        variant="secondary"
                        className="font-normal text-[11px]"
                      >
                        {expense.category}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell
                    className="text-muted-foreground max-w-[200px] truncate"
                    title={expense.note || ""}
                  >
                    {expense.note || "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium">
                    ₱{Number(expense.amount).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => openEditDialog(expense)}
                        disabled={isPending}
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(expense.id)}
                        disabled={isPending}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

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
              <Label htmlFor="edit-amount">Amount (₱)</Label>
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
            <div className="space-y-2">
              <Label htmlFor="edit-note">Note (optional)</Label>
              <Input
                id="edit-note"
                value={editForm.note}
                onChange={(e) =>
                  setEditForm({ ...editForm, note: e.target.value })
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
