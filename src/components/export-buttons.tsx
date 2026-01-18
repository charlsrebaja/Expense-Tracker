"use client";

import { Button } from "@/components/ui/button";
import { SerializedExpense } from "@/types";
import { exportToCSV, exportToPDF } from "@/lib/export-utils";
import { toast } from "sonner";

interface ExportButtonsProps {
  expenses: SerializedExpense[];
}

export function ExportButtons({ expenses }: ExportButtonsProps) {
  const handleExportCSV = () => {
    try {
      exportToCSV(expenses);
      toast.success("CSV exported successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to export CSV",
      );
    }
  };

  const handleExportPDF = () => {
    try {
      exportToPDF(expenses);
      toast.success("PDF report opened in new window");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate PDF",
      );
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        disabled={expenses.length === 0}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
        Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPDF}
        disabled={expenses.length === 0}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        Export PDF
      </Button>
    </div>
  );
}
