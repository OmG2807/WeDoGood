"use client";

import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function PageHeader({ icon: Icon, iconColor, title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>
        <div>
          <h1 className="font-['Playfair_Display'] text-3xl font-bold text-[var(--color-text-primary)]">
            {title}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">{subtitle}</p>
        </div>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

