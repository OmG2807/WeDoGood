"use client";

import { useState, useEffect } from "react";
import { LayoutDashboard, Users, Calendar, IndianRupee, Building2, TrendingUp } from "lucide-react";
import { getDashboardData, getTrends } from "@/lib/api";
import type { DashboardData, MonthlyDashboardData, StatCardConfig } from "@/lib/types";
import { formatCurrency, formatNumber, formatMonth, getShortMonth, getCurrentMonth } from "@/lib/utils";
import { COLORS } from "@/lib/constants";
import { StatCard, StatCardSkeleton, Alert, PageHeader, MonthSelector, EmptyState } from "@/components/ui";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [trends, setTrends] = useState<MonthlyDashboardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data when month changes
  useEffect(() => {
    if (!selectedMonth) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [dashboardResponse, trendsResponse] = await Promise.all([
          getDashboardData(selectedMonth),
          getTrends(12)
        ]);

        if (dashboardResponse.success && dashboardResponse.data) {
          setDashboardData(dashboardResponse.data);
        } else {
          setError(dashboardResponse.error || "Failed to fetch dashboard data");
        }

        if (trendsResponse.success && trendsResponse.data) {
          setTrends(trendsResponse.data);
        }
      } catch {
        setError("Network error. Please check if the backend is running.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedMonth]);

  const statCards: StatCardConfig[] = dashboardData ? [
    { label: "NGOs Reporting", value: dashboardData.total_ngos_reporting, icon: Building2, color: "green", bgColor: COLORS.sage },
    { label: "People Helped", value: dashboardData.total_people_helped, icon: Users, color: "orange", bgColor: COLORS.terracotta },
    { label: "Events Conducted", value: dashboardData.total_events_conducted, icon: Calendar, color: "red", bgColor: COLORS.accentPrimary },
    { label: "Funds Utilized", value: dashboardData.total_funds_utilized, icon: IndianRupee, color: "cream", bgColor: COLORS.sand, isCurrency: true },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header with Month Selector */}
      <PageHeader
        icon={LayoutDashboard}
        iconColor={COLORS.accentPrimary}
        title="Impact Dashboard"
        subtitle="Aggregate impact data across all NGOs"
      >
        <MonthSelector
          value={selectedMonth}
          onChange={setSelectedMonth}
          onRefresh={() => setSelectedMonth(selectedMonth)}
          isLoading={isLoading}
        />
      </PageHeader>

      {/* Error State */}
      {error && <Alert variant="error" message={error} />}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in animate-delay-1">
        {isLoading
          ? [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((stat, index) => <StatCard key={index} {...stat} />)
        }
      </div>

      {/* Charts Section */}
      {trends.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in animate-delay-2">
          <TrendChart
            title="People Helped Trend"
            icon={<TrendingUp className="w-5 h-5 text-[var(--color-sage)]" />}
            data={trends}
            dataKey="total_people_helped"
            color={COLORS.sage}
            gradientId="colorPeople"
            formatter={formatNumber}
            tooltipLabel="People Helped"
          />
          <TrendChart
            title="Funds Utilized Trend"
            icon={<IndianRupee className="w-5 h-5 text-[var(--color-terracotta)]" />}
            data={trends}
            dataKey="total_funds_utilized"
            color={COLORS.terracotta}
            gradientId="colorFunds"
            formatter={formatCurrency}
            tooltipLabel="Funds Utilized"
          />
        </div>
      )}

      {/* Monthly Summary Table */}
      {trends.length > 0 && (
        <SummaryTable data={trends} selectedMonth={selectedMonth} />
      )}

      {/* No Data State */}
      {!isLoading && !error && dashboardData?.total_ngos_reporting === 0 && (
        <EmptyState
          icon={LayoutDashboard}
          title={`No Data for ${formatMonth(selectedMonth)}`}
          description="No reports have been submitted for this month yet."
        />
      )}
    </div>
  );
}

// Extracted TrendChart component
interface TrendChartProps {
  title: string;
  icon: React.ReactNode;
  data: MonthlyDashboardData[];
  dataKey: keyof MonthlyDashboardData;
  color: string;
  gradientId: string;
  formatter: (value: number) => string;
  tooltipLabel: string;
}

function TrendChart({ title, icon, data, dataKey, color, gradientId, formatter, tooltipLabel }: TrendChartProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        {icon}
        <h3 className="font-semibold text-[var(--color-text-primary)]">{title}</h3>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e0d5" />
            <XAxis dataKey="month" tickFormatter={getShortMonth} stroke="#a0a8ab" fontSize={12} />
            <YAxis stroke="#a0a8ab" fontSize={12} tickFormatter={formatter} />
            <Tooltip
              formatter={(value) => [formatter(Number(value) || 0), tooltipLabel]}
              labelFormatter={(label) => formatMonth(String(label))}
              contentStyle={{ backgroundColor: "white", border: "1px solid #e8e0d5", borderRadius: "8px" }}
            />
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#${gradientId})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Extracted SummaryTable component
interface SummaryTableProps {
  data: MonthlyDashboardData[];
  selectedMonth: string;
}

function SummaryTable({ data, selectedMonth }: SummaryTableProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm animate-fade-in animate-delay-3">
      <h3 className="font-semibold text-[var(--color-text-primary)] mb-4">Monthly Summary</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-bg-accent)]">
              {["Month", "NGOs", "People Helped", "Events", "Funds"].map((header, i) => (
                <th key={header} className={`${i === 0 ? "text-left" : "text-right"} py-3 px-4 text-sm font-semibold text-[var(--color-text-secondary)]`}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.slice().reverse().slice(0, 6).map((row) => (
              <tr
                key={row.month}
                className={`border-b border-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary)] transition-colors ${
                  row.month === selectedMonth ? "bg-[var(--color-sage)]/5" : ""
                }`}
              >
                <td className="py-3 px-4 text-sm font-medium text-[var(--color-text-primary)]">{formatMonth(row.month)}</td>
                <td className="py-3 px-4 text-sm text-right text-[var(--color-text-secondary)]">{row.total_ngos_reporting}</td>
                <td className="py-3 px-4 text-sm text-right text-[var(--color-text-secondary)]">{formatNumber(row.total_people_helped)}</td>
                <td className="py-3 px-4 text-sm text-right text-[var(--color-text-secondary)]">{formatNumber(row.total_events_conducted)}</td>
                <td className="py-3 px-4 text-sm text-right text-[var(--color-text-secondary)]">{formatCurrency(row.total_funds_utilized)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
