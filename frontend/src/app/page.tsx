"use client";

import Link from "next/link";
import { Heart, FileText, Upload, LayoutDashboard, ArrowRight, Users, Calendar, IndianRupee } from "lucide-react";

export default function Home() {
  const features = [
    {
      icon: FileText,
      title: "Submit Reports",
      description: "Easily submit monthly impact reports with key metrics like people helped and funds utilized.",
      href: "/submit",
      color: "green"
    },
    {
      icon: Upload,
      title: "Bulk Upload",
      description: "Upload CSV files to process multiple reports at once with real-time progress tracking.",
      href: "/upload",
      color: "orange"
    },
    {
      icon: LayoutDashboard,
      title: "View Dashboard",
      description: "Access aggregated analytics and insights across all NGOs for any selected month.",
      href: "/dashboard",
      color: "red"
    }
  ];

  const stats = [
    { icon: Users, label: "People Helped", value: "10,000+", color: "var(--color-sage)" },
    { icon: Calendar, label: "Events Conducted", value: "500+", color: "var(--color-terracotta)" },
    { icon: IndianRupee, label: "Funds Tracked", value: "₹50L+", color: "var(--color-accent-primary)" },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[var(--color-sage)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--color-terracotta)]/10 rounded-full blur-3xl" />
        </div>
        
        <div className="text-center py-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-cream)] rounded-full text-sm text-[var(--color-terracotta)] font-medium mb-6">
            <Heart className="w-4 h-4" fill="currentColor" />
            Empowering NGOs Across India
          </div>
          
          <h1 className="font-['Playfair_Display'] text-5xl md:text-6xl lg:text-7xl font-bold text-[var(--color-text-primary)] mb-6 leading-tight">
            Track Impact,<br />
            <span className="text-[var(--color-sage)]">Drive Change</span>
          </h1>
          
          <p className="text-xl text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10">
            A unified platform for NGOs to submit monthly reports and administrators to 
            visualize collective impact across communities.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/submit"
              className="btn-primary px-8 py-4 rounded-xl text-white font-semibold flex items-center gap-2 shadow-lg"
            >
              Submit a Report
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-xl border-2 border-[var(--color-bg-accent)] text-[var(--color-text-primary)] font-semibold hover:border-[var(--color-sage)] hover:text-[var(--color-sage)] transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Preview */}
      <section className="animate-fade-in animate-delay-1">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm card-hover flex items-center gap-4"
              >
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}15` }}
                >
                  <Icon className="w-7 h-7" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-3xl font-bold text-[var(--color-text-primary)]">{stat.value}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="animate-fade-in animate-delay-2">
        <div className="text-center mb-12">
          <h2 className="font-['Playfair_Display'] text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-4">
            Everything You Need
          </h2>
          <p className="text-[var(--color-text-secondary)] max-w-xl mx-auto">
            Simple, powerful tools designed to help NGOs report their impact and administrators track progress.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Link
                key={index}
                href={feature.href}
                className={`stat-card ${feature.color} p-8 card-hover group`}
              >
                <div className={`
                  w-14 h-14 rounded-2xl flex items-center justify-center mb-6
                  ${feature.color === 'green' ? 'bg-[var(--color-sage)]/10' : ''}
                  ${feature.color === 'orange' ? 'bg-[var(--color-terracotta)]/10' : ''}
                  ${feature.color === 'red' ? 'bg-[var(--color-accent-primary)]/10' : ''}
                `}>
                  <Icon className={`
                    w-7 h-7
                    ${feature.color === 'green' ? 'text-[var(--color-sage)]' : ''}
                    ${feature.color === 'orange' ? 'text-[var(--color-terracotta)]' : ''}
                    ${feature.color === 'red' ? 'text-[var(--color-accent-primary)]' : ''}
                  `} />
                </div>
                
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-3 group-hover:text-[var(--color-sage)] transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-[var(--color-text-secondary)] mb-4">
                  {feature.description}
                </p>
                
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-sage)]">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-[var(--color-bg-accent)]">
        <p className="text-[var(--color-text-muted)] text-sm">
          Built with ❤️ for NGOs making a difference
        </p>
      </footer>
    </div>
  );
}
