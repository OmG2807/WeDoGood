"use client";

import { AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertVariant = 'error' | 'success' | 'warning' | 'info';

interface AlertProps {
  variant: AlertVariant;
  message: string;
  className?: string;
}

const variantConfig = {
  error: {
    icon: AlertCircle,
    classes: 'bg-[var(--color-error)]/10 text-[var(--color-error)]',
  },
  success: {
    icon: CheckCircle,
    classes: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
  },
  info: {
    icon: Info,
    classes: 'bg-[var(--color-sage)]/10 text-[var(--color-sage)]',
  },
};

export function Alert({ variant, message, className }: AlertProps) {
  const { icon: Icon, classes } = variantConfig[variant];

  return (
    <div className={cn('flex items-center gap-3 p-4 rounded-xl animate-fade-in', classes, className)}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

