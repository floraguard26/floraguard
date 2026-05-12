import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/utils";
import { Users, ScanLine, ShoppingBag, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCharts } from "./charts";

export const metadata: Metadata = { title: "Admin Dashboard" };

async function getKPIs() {
  const db = createAdminClient();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    { count: totalUsers },
    { count: scansToday },
    { count: scansWeek },
    { count: salesNew },
    { data: topLabels },
  ] = await Promise.all([
    db.from("profiles").select("*", { count: "exact", head: true }).eq("role", "user"),
    db.from("scans").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    db.from("scans").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString()),
    db.from("sales_inquiries").select("*", { count: "exact", head: true }).eq("status", "new"),
    db.from("scans").select("top_label").not("top_label", "is", null).limit(100),
  ]);

  // Aggregate top labels
  const labelCounts: Record<string, number> = {};
  (topLabels ?? []).forEach(({ top_label }) => {
    if (top_label) labelCounts[top_label] = (labelCounts[top_label] ?? 0) + 1;
  });
  const topLabelsSorted = Object.entries(labelCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));

  return {
    totalUsers: totalUsers ?? 0,
    scansToday: scansToday ?? 0,
    scansWeek: scansWeek ?? 0,
    salesNew: salesNew ?? 0,
    topLabels: topLabelsSorted,
  };
}

export default async function AdminDashboardPage() {
  const kpis = await getKPIs();

  const KPI_CARDS = [
    { title: "Total Users", value: kpis.totalUsers, icon: Users, color: "text-blue-600" },
    { title: "Scans Today", value: kpis.scansToday, icon: ScanLine, color: "text-flora-600" },
    { title: "Scans This Week", value: kpis.scansWeek, icon: TrendingUp, color: "text-violet-600" },
    { title: "New Sales Inquiries", value: kpis.salesNew, icon: ShoppingBag, color: "text-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of FloraGuard activity.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map(({ title, value, icon: Icon, color }) => (
          <Card key={title}>
            <CardContent className="flex items-center gap-4 py-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value.toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <AdminCharts topLabels={kpis.topLabels} />

      {/* Top labels table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Detected Diseases</CardTitle>
        </CardHeader>
        <CardContent>
          {kpis.topLabels.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">No scan data yet.</p>
          ) : (
            <div className="space-y-2">
              {kpis.topLabels.map(({ label, count }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm font-medium text-gray-700">
                    {label.replace(/_/g, " ")}
                  </span>
                  <span className="text-sm text-gray-500">{count} scans</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
