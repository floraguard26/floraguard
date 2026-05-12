"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { formatDate, humanizeLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { Search, Trash2, ImageIcon } from "lucide-react";

interface ScanRow {
  id: string;
  user_id: string;
  created_at: string;
  top_label: string | null;
  status: string;
  imageUrl: string | null;
  model_version: string | null;
}

export default function AdminScansPage() {
  const { toast } = useToast();
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  const fetchScans = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(LIMIT), ...(search ? { search } : {}) });
    const res = await fetch(`/api/admin/scans?${params}`);
    const json = await res.json();
    if (json.ok) { setScans(json.scans); setTotal(json.total); }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchScans(); }, [fetchScans]);

  async function handleDelete(scanId: string) {
    if (!confirm("Delete this scan? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/scans/${scanId}`, { method: "DELETE" });
    if (res.ok) { toast("success", "Scan deleted."); fetchScans(); }
    else toast("error", "Delete failed.");
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scans</h1>
        <p className="text-sm text-gray-500 mt-1">{total.toLocaleString()} total scans</p>
      </div>

      <div className="max-w-sm">
        <Input placeholder="Search by disease label…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} leftIcon={<Search className="h-4 w-4" />} aria-label="Search scans" />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200" aria-label="Scans table">
            <thead className="bg-gray-50">
              <tr>
                {["Image", "Disease", "Status", "User ID", "Date", "Model", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {scans.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="relative h-12 w-16 rounded overflow-hidden bg-gray-100">
                      {s.imageUrl ? (
                        <Image src={s.imageUrl} alt="scan thumbnail" fill className="object-cover" />
                      ) : (
                        <ImageIcon className="h-5 w-5 text-gray-300 m-auto mt-3" aria-hidden="true" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.top_label ? humanizeLabel(s.top_label) : "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={s.status === "completed" ? "success" : s.status === "failed" ? "error" : "warning"}>{s.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{s.user_id.slice(0, 8)}…</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{formatDate(s.created_at)}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{s.model_version ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} aria-label="Delete scan">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
              {scans.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No scans found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</Button>
          <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Next →</Button>
        </div>
      )}
    </div>
  );
}
