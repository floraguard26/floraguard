"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { SkeletonCard } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatDate, humanizeLabel } from "@/lib/utils";
import { Search, ImageIcon, Leaf } from "lucide-react";

interface ScanRow {
  id: string;
  created_at: string;
  top_label: string | null;
  status: string;
  imageUrl: string | null;
  model_version: string | null;
}

export default function HistoryPage() {
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 12;

  const fetchScans = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(LIMIT),
        ...(search ? { search } : {}),
      });
      const res = await fetch(`/api/scans?${params}`);
      const json = await res.json();
      if (json.ok) {
        setScans(json.scans);
        setTotal(json.total);
      }
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchScans(); }, [fetchScans]);

  // Debounced search
  useEffect(() => {
    const id = setTimeout(() => { setPage(1); fetchScans(); }, 400);
    return () => clearTimeout(id);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Scan History</h1>
          <p className="mt-1 text-gray-500">All your plant scans in one place.</p>
        </div>
        <Button asChild>
          <Link href="/try">
            <Leaf className="h-4 w-4" aria-hidden="true" />
            New Scan
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-sm">
        <Input
          placeholder="Search by disease label…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          aria-label="Search scans"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : scans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ImageIcon className="h-12 w-12 text-gray-300 mb-4" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-gray-700">No scans yet</h2>
          <p className="mt-2 text-sm text-gray-400">
            {search ? "No scans match your search." : "Upload your first plant photo to get started."}
          </p>
          {!search && (
            <Button className="mt-6" asChild>
              <Link href="/try">Analyze a Plant</Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {scans.map((scan) => (
              <Link
                key={scan.id}
                href={`/history/${scan.id}`}
                className="group rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:border-flora-300 hover:shadow-md transition-all"
                aria-label={`Scan from ${formatDate(scan.created_at)}: ${scan.top_label ?? "no label"}`}
              >
                <div className="relative h-44 bg-gray-100">
                  {scan.imageUrl ? (
                    <Image
                      src={scan.imageUrl}
                      alt={`Plant scan thumbnail`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="h-10 w-10 text-gray-300" aria-hidden="true" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={
                        scan.status === "completed"
                          ? "success"
                          : scan.status === "failed"
                          ? "error"
                          : "warning"
                      }
                    >
                      {scan.status}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {scan.top_label ? humanizeLabel(scan.top_label) : "No disease detected"}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{formatDate(scan.created_at)}</p>
                  {scan.model_version && (
                    <p className="mt-1 text-xs text-gray-400">Model v{scan.model_version}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                aria-label="Previous page"
              >
                ← Prev
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                aria-label="Next page"
              >
                Next →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
