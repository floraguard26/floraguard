"use client";
import { useEffect, useState, useCallback } from "react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import type { SalesInquiry, SalesStatus } from "@/types";

const STATUS_OPTIONS: SalesStatus[] = ["new", "contacted", "closed"];

const statusVariant: Record<SalesStatus, "warning" | "info" | "default"> = {
  new: "warning",
  contacted: "info",
  closed: "default",
};

export default function AdminSalesPage() {
  const { toast } = useToast();
  const [inquiries, setInquiries] = useState<SalesInquiry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/sales");
    const json = await res.json();
    if (json.ok) setInquiries(json.inquiries);
    setLoading(false);
  }, []);

  useEffect(() => { fetch_(); }, [fetch_]);

  async function updateStatus(id: string, status: SalesStatus) {
    const res = await fetch(`/api/admin/sales/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) { toast("success", "Status updated."); fetch_(); }
    else toast("error", "Update failed.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sales Inquiries</h1>
        <p className="text-sm text-gray-500 mt-1">{inquiries.length} total inquiries</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-3">
          {inquiries.length === 0 && (
            <div className="py-16 text-center text-gray-400">No inquiries yet.</div>
          )}
          {inquiries.map((inq) => (
            <div key={inq.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-gray-900">{inq.name}</p>
                  <p className="text-sm text-gray-500">{inq.email} · {inq.phone ?? "no phone"}</p>
                  {inq.company && <p className="text-sm text-gray-400">{inq.company}</p>}
                  <p className="mt-2 text-sm text-gray-600 max-w-xl">{inq.message}</p>
                  <p className="mt-2 text-xs text-gray-400">{formatDate(inq.created_at)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={statusVariant[inq.status]}>{inq.status}</Badge>
                  <div className="flex gap-2">
                    {STATUS_OPTIONS.filter((s) => s !== inq.status).map((s) => (
                      <Button key={s} variant="outline" size="sm" onClick={() => updateStatus(inq.id, s)}>
                        Mark {s}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
