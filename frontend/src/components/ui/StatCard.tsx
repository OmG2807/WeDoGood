"use client";

import { formatCurrency, formatNumber } from "@/lib/utils";
import type { StatCardConfig } from "@/lib/types";

interface StatCardProps extends StatCardConfig {}

export function StatCard({ label, value, icon: Icon, color, bgColor, isCurrency }: StatCardProps) {
  return (
    <div className={`stat-card ${color} p-6 shadow-sm card-hover`}>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ backgroundColor: `${bgColor}15` }}
      >
        <Icon className="w-6 h-6" style={{ color: bgColor }} />
      </div>
      <p className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">
        {isCurrency ? formatCurrency(value) : formatNumber(value)}
      </p>
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="h-12 w-12 bg-[var(--color-bg-secondary)] rounded-xl mb-4" />
      <div className="h-8 w-24 bg-[var(--color-bg-secondary)] rounded mb-2" />
      <div className="h-4 w-20 bg-[var(--color-bg-secondary)] rounded" />
    </div>
  );
}

