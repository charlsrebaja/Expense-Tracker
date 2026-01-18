"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type FilterPreset =
  | "all"
  | "this-month"
  | "last-month"
  | "last-3-months"
  | "custom";

export function DateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const initialFrom = searchParams.get("from") || "";
  const initialTo = searchParams.get("to") || "";
  const initialPreset: FilterPreset =
    initialFrom && initialTo ? "custom" : "all";

  const [preset, setPreset] = useState<FilterPreset>(initialPreset);
  const [startDate, setStartDate] = useState(initialFrom);
  const [endDate, setEndDate] = useState(initialTo);

  const applyFilter = (newPreset: FilterPreset) => {
    const params = new URLSearchParams(searchParams.toString());
    const today = new Date();

    switch (newPreset) {
      case "all":
        params.delete("from");
        params.delete("to");
        setStartDate("");
        setEndDate("");
        break;
      case "this-month":
        const thisMonthStart = startOfMonth(today);
        const thisMonthEnd = endOfMonth(today);
        params.set("from", format(thisMonthStart, "yyyy-MM-dd"));
        params.set("to", format(thisMonthEnd, "yyyy-MM-dd"));
        setStartDate(format(thisMonthStart, "yyyy-MM-dd"));
        setEndDate(format(thisMonthEnd, "yyyy-MM-dd"));
        break;
      case "last-month":
        const lastMonth = subMonths(today, 1);
        const lastMonthStart = startOfMonth(lastMonth);
        const lastMonthEnd = endOfMonth(lastMonth);
        params.set("from", format(lastMonthStart, "yyyy-MM-dd"));
        params.set("to", format(lastMonthEnd, "yyyy-MM-dd"));
        setStartDate(format(lastMonthStart, "yyyy-MM-dd"));
        setEndDate(format(lastMonthEnd, "yyyy-MM-dd"));
        break;
      case "last-3-months":
        const threeMonthsAgo = subMonths(today, 3);
        params.set("from", format(startOfMonth(threeMonthsAgo), "yyyy-MM-dd"));
        params.set("to", format(endOfMonth(today), "yyyy-MM-dd"));
        setStartDate(format(startOfMonth(threeMonthsAgo), "yyyy-MM-dd"));
        setEndDate(format(endOfMonth(today), "yyyy-MM-dd"));
        break;
      case "custom":
        // Don't change dates for custom - user will input them
        break;
    }

    setPreset(newPreset);
    if (newPreset !== "custom") {
      router.push(`/?${params.toString()}`);
    }
  };

  const applyCustomRange = () => {
    if (!startDate || !endDate) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("from", startDate);
    params.set("to", endDate);
    router.push(`/?${params.toString()}`);
  };

  const clearFilter = () => {
    setPreset("all");
    setStartDate("");
    setEndDate("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("from");
    params.delete("to");
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="preset" className="text-xs font-medium">
            Quick Filter
          </Label>
          <Select
            id="preset"
            value={preset}
            onChange={(e) => applyFilter(e.target.value as FilterPreset)}
            className="w-[160px] h-9"
          >
            <option value="all">All Time</option>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="last-3-months">Last 3 Months</option>
            <option value="custom">Custom Range</option>
          </Select>
        </div>

        {preset === "custom" && (
          <div className="flex items-end gap-2 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="text-xs font-medium">
                From
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[140px] h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endDate" className="text-xs font-medium">
                To
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[140px] h-9"
              />
            </div>
            <Button
              onClick={applyCustomRange}
              disabled={!startDate || !endDate}
              size="sm"
              className="h-9"
            >
              Apply
            </Button>
          </div>
        )}

        {(startDate || endDate) && preset !== "all" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilter}
            className="h-9 px-3 text-muted-foreground hover:text-foreground"
          >
            Reset
          </Button>
        )}
      </div>

      {startDate && endDate && (
        <div className="flex items-center gap-2 text-sm text-primary/80 bg-primary/5 px-3 py-2 rounded-md border border-primary/10 w-fit">
          <span className="font-medium">Active Filter:</span>
          <span>
            {format(new Date(startDate), "MMM dd, yyyy")} –{" "}
            {format(new Date(endDate), "MMM dd, yyyy")}
          </span>
        </div>
      )}
    </div>
  );
}
