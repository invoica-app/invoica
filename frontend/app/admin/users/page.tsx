"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Loader2, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { ErrorBanner } from "@/components/ui/error-banner";
import { useAdminApi } from "@/lib/hooks/use-admin-api";
import { AdminUser } from "@/lib/admin-api";

const providerBadgeStyles: Record<string, string> = {
  GOOGLE: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  MICROSOFT: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  GUEST: "bg-muted text-muted-foreground",
};

export default function AdminUsersPage() {
  const api = useAdminApi();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const debounceRef = useRef<NodeJS.Timeout>(undefined);
  const pageSize = 20;

  const fetchUsers = useCallback(async (p: number, q: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getUsers(p, pageSize, q || undefined);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchUsers(page, search);
  }, [page, fetchUsers]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(0);
      fetchUsers(0, value);
    }, 300);
  };

  const handleToggleStatus = async (user: AdminUser) => {
    setTogglingId(user.id);
    try {
      const updated = await api.updateUserStatus(user.id, !user.isDisabled);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update user status");
    } finally {
      setTogglingId(null);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-lg font-semibold mb-0.5">Users</h1>
          <p className="text-sm text-muted-foreground">Manage platform users.</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {error && (
          <ErrorBanner message={error} onRetry={() => fetchUsers(page, search)} className="mb-4" />
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Name</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Email</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Provider</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Invoices</th>
                      <th className="text-right px-4 py-2.5 font-medium text-muted-foreground">Revenue</th>
                      <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Joined</th>
                      <th className="text-center px-4 py-2.5 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-2.5 font-medium">{user.name}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{user.email}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${providerBadgeStyles[user.provider] || "bg-muted text-muted-foreground"}`}>
                            {user.provider}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right tabular-nums">{user.invoiceCount}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums">${Number(user.totalRevenue).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            onClick={() => handleToggleStatus(user)}
                            disabled={togglingId === user.id}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
                              user.isDisabled ? "bg-muted" : "bg-primary"
                            }`}
                          >
                            <span
                              className={`pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                                user.isDisabled ? "translate-x-0" : "translate-x-4"
                              }`}
                            />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  {total} user{total !== 1 ? "s" : ""} total
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="p-1.5 rounded-md border border-border hover:bg-accent/50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm tabular-nums">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="p-1.5 rounded-md border border-border hover:bg-accent/50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
