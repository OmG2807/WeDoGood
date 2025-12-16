"use client";

import { ChevronDown, RefreshCw } from "lucide-react";
import { getMonthOptions } from "@/lib/utils";

interface MonthSelectorProps {
  value: string;
  onChange: (month: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function MonthSelector({ value, onChange, onRefresh, isLoading }: MonthSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="appearance-none bg-white border-2 border-[var(--color-bg-accent)] rounded-xl px-4 py-3 pr-10 font-medium text-[var(--color-text-primary)] cursor-pointer hover:border-[var(--color-sage)] focus:border-[var(--color-sage)] focus:outline-none transition-colors"
        >
          {getMonthOptions().map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] pointer-events-none" />
      </div>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="p-3 bg-white border-2 border-[var(--color-bg-accent)] rounded-xl text-[var(--color-text-muted)] hover:border-[var(--color-sage)] hover:text-[var(--color-sage)] transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
}

