"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, FileText, Upload, LayoutDashboard } from "lucide-react";

const navItems = [
  { href: "/submit", label: "Submit Report", icon: FileText },
  { href: "/upload", label: "Bulk Upload", icon: Upload },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-[var(--color-bg-accent)] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-sage)] to-[var(--color-accent-tertiary)] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Heart className="w-5 h-5 text-white" fill="currentColor" />
            </div>
            <div>
              <h1 className="font-['Playfair_Display'] text-xl font-bold text-[var(--color-text-primary)]">
                WeDoGood
              </h1>
              <p className="text-[10px] text-[var(--color-text-muted)] -mt-1 tracking-wider uppercase">
                Impact Tracker
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    nav-link px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium
                    transition-all duration-200
                    ${isActive 
                      ? "bg-[var(--color-sage)]/10 text-[var(--color-sage)]" 
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-sage)] hover:bg-[var(--color-bg-secondary)]"
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

