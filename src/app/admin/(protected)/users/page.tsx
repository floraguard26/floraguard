"use client";
import { useEffect, useState, useCallback } from "react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { Search, UserX, ShieldCheck } from "lucide-react";

interface UserRow {
  id: string;
  phone: string | null;
  email: string | null;
  name: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      limit: String(LIMIT),
      ...(search ? { search } : {}),
    });
    const res = await fetch(`/api/admin/users?${params}`);
    const json = await res.json();
    if (json.ok) { setUsers(json.users); setTotal(json.total); }
    setLoading(false);
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function toggleActive(user: UserRow) {
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: !user.is_active }),
    });
    if (res.ok) {
      toast("success", `User ${user.is_active ? "disabled" : "enabled"}.`);
      fetchUsers();
    } else {
      toast("error", "Update failed.");
    }
  }

  async function setAdmin(user: UserRow) {
    if (!confirm(`Make ${user.phone ?? user.email} an admin?`)) return;
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "admin" }),
    });
    if (res.ok) { toast("success", "Role updated."); fetchUsers(); }
    else toast("error", "Update failed.");
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-500 mt-1">{total.toLocaleString()} total users</p>
      </div>

      <div className="max-w-sm">
        <Input
          placeholder="Search by phone or name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          leftIcon={<Search className="h-4 w-4" />}
          aria-label="Search users"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <table className="min-w-full divide-y divide-gray-200" aria-label="Users table">
            <thead className="bg-gray-50">
              <tr>
                {["Phone / Email", "Name", "Role", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700">{u.phone ?? u.email ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{u.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge variant={u.role === "admin" ? "info" : "default"}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={u.is_active ? "success" : "error"}>
                      {u.is_active ? "active" : "disabled"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive(u)}
                        aria-label={u.is_active ? "Disable user" : "Enable user"}
                        title={u.is_active ? "Disable" : "Enable"}
                      >
                        <UserX className="h-4 w-4" />
                      </Button>
                      {u.role !== "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAdmin(u)}
                          aria-label="Promote to admin"
                          title="Make admin"
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                    No users found.
                  </td>
                </tr>
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
