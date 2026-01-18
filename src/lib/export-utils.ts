import { SerializedExpense } from "@/types";
import { format } from "date-fns";

export function exportToCSV(expenses: SerializedExpense[], filename?: string) {
  if (expenses.length === 0) {
    throw new Error("No expenses to export");
  }

  const headers = ["Date", "Description", "Category", "Note", "Amount"];

  const rows = expenses.map((expense) => [
    format(new Date(expense.createdAt), "yyyy-MM-dd"),
    `"${expense.description.replace(/"/g, '""')}"`,
    expense.category || "",
    expense.note ? `"${expense.note.replace(/"/g, '""')}"` : "",
    expense.amount.toFixed(2),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  const exportFilename =
    filename || `expenses-${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.setAttribute("href", url);
  link.setAttribute("download", exportFilename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generatePDFContent(expenses: SerializedExpense[]): string {
  if (expenses.length === 0) {
    throw new Error("No expenses to export");
  }

  const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const categoryTotals: Record<string, number> = {};

  expenses.forEach((expense) => {
    const category = expense.category || "Uncategorized";
    categoryTotals[category] =
      (categoryTotals[category] || 0) + Number(expense.amount);
  });

  // Generate HTML content for printing
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Expense Report</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
        h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
        h2 { color: #666; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: bold; }
        tr:nth-child(even) { background-color: #fafafa; }
        .amount { text-align: right; font-family: monospace; }
        .total-row { font-weight: bold; background-color: #e8e8e8 !important; }
        .summary { display: flex; gap: 40px; margin-bottom: 30px; }
        .summary-item { background: #f5f5f5; padding: 15px; border-radius: 8px; }
        .summary-value { font-size: 24px; font-weight: bold; color: #333; }
        .summary-label { color: #666; font-size: 14px; }
        .category-breakdown { margin-top: 30px; }
        .category-item { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <h1>Expense Report</h1>
      <p>Generated on ${format(new Date(), "MMMM dd, yyyy 'at' h:mm a")}</p>
      
      <div class="summary">
        <div class="summary-item">
          <div class="summary-value">₱${total.toFixed(2)}</div>
          <div class="summary-label">Total Spending</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${expenses.length}</div>
          <div class="summary-label">Total Expenses</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">₱${(total / expenses.length).toFixed(2)}</div>
          <div class="summary-label">Average per Expense</div>
        </div>
      </div>

      <h2>Category Breakdown</h2>
      <div class="category-breakdown">
        ${Object.entries(categoryTotals)
          .sort(([, a], [, b]) => b - a)
          .map(
            ([category, amount]) => `
          <div class="category-item">
            <span>${category}</span>
            <span class="amount">₱${amount.toFixed(2)} (${((amount / total) * 100).toFixed(1)}%)</span>
          </div>
        `,
          )
          .join("")}
      </div>

      <h2>All Expenses</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Note</th>
            <th class="amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${expenses
            .map(
              (expense) => `
            <tr>
              <td>${format(new Date(expense.createdAt), "MMM dd, yyyy")}</td>
              <td>${expense.description}</td>
              <td>${expense.category || "-"}</td>
              <td>${expense.note || "-"}</td>
              <td class="amount">₱${Number(expense.amount).toFixed(2)}</td>
            </tr>
          `,
            )
            .join("")}
          <tr class="total-row">
            <td colspan="4">Total</td>
            <td class="amount">₱${total.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </body>
    </html>
  `;

  return html;
}

export function exportToPDF(expenses: SerializedExpense[]) {
  const html = generatePDFContent(expenses);

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}
