"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Pencil, RefreshCw, Shield, Trash2 } from "lucide-react";

import { useAuth } from "@/components/auth-provider";
import { API_BASE_URL, fetchWithError } from "@/lib/api";

type UserRecord = {
  id: string;
  email: string;
  full_name?: string | null;
  role?: string | null;
  created_at?: string;
};

type StatusMessage = {
  type: "success" | "error";
  text: string;
};

const roleOptions = ["user", "moderator", "admin"] as const;

function normalizeRole(role?: string | null): (typeof roleOptions)[number] {
  if (role && roleOptions.includes(role as (typeof roleOptions)[number])) {
    return role as (typeof roleOptions)[number];
  }
  return "user";
}

function formatDate(value?: string) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function AdminPage() {
  const { user, token, loading: authLoading } = useAuth();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ fullName: "", role: roleOptions[0] });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = useMemo(
    () => ["admin", "moderator"].includes(user?.role ?? ""),
    [user?.role],
  );

  const loadUsers = useCallback(async () => {
    if (!token) {
      setStatus({ type: "error", text: "You need to be signed in to view users." });
      setLoading(false);
      return;
    }

    setStatus(null);
    setLoading(true);
    try {
      const data = await fetchWithError<UserRecord[]>(`${API_BASE_URL}/api/v1/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(data);
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to load users.",
      });
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const startEditing = (record: UserRecord) => {
    setEditingUserId(record.id);
    setEditForm({ fullName: record.full_name ?? "", role: normalizeRole(record.role) });
    setStatus(null);
  };

  const handleEditChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveUser = async () => {
    if (!editingUserId) return;
    if (!token) {
      setStatus({ type: "error", text: "You must be signed in to update a user." });
      return;
    }

    setStatus(null);
    try {
      const payload = {
        full_name: editForm.fullName.trim() || null,
        role: editForm.role,
      };

      const updated = await fetchWithError<UserRecord>(
        `${API_BASE_URL}/api/v1/admin/users/${editingUserId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      setUsers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setStatus({ type: "success", text: "User updated successfully." });
      setEditingUserId(null);
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to save user.",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    if (!token) {
      setStatus({ type: "error", text: "You must be signed in to delete a user." });
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone.",
    );
    if (!confirmed) return;

    setDeletingId(userId);
    setStatus(null);

    try {
      await fetchWithError(`${API_BASE_URL}/api/v1/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers((prev) => prev.filter((item) => item.id !== userId));
      setStatus({ type: "success", text: "User deleted successfully." });
    } catch (error) {
      setStatus({
        type: "error",
        text: error instanceof Error ? error.message : "Unable to delete user.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
          <p className="text-sm font-semibold text-slate-700">Checking permissions…</p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-center shadow-sm">
          <Shield className="mx-auto mb-3 h-10 w-10 text-amber-500" />
          <h1 className="text-lg font-semibold text-amber-800">Access restricted</h1>
          <p className="mt-2 text-sm text-amber-700">
            You need an administrator account to manage users. If you believe this is a mistake, please contact support.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">Admin</p>
          <h1 className="text-3xl font-bold text-slate-900">User management</h1>
          <p className="mt-1 text-sm text-slate-600">
            View, edit, and remove users from the platform. Changes apply immediately.
          </p>
        </div>
        <button
          type="button"
          onClick={loadUsers}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh list
        </button>
      </div>

      {status ? (
        <div
          className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-sm ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <span className="text-base font-semibold">{status.type === "success" ? "Success" : "Error"}</span>
          <p className="leading-relaxed">{status.text}</p>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-[2fr,1.5fr,1fr,1fr] items-center border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
          <span>User</span>
          <span>Full name</span>
          <span>Role</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center px-6 py-10 text-sm font-semibold text-slate-600">
            <Loader2 className="mr-3 h-5 w-5 animate-spin" /> Loading users…
          </div>
        ) : users.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-600">
            No users found.
          </div>
        ) : (
          <ul className="divide-y divide-slate-200">
            {users.map((record) => {
              const isEditing = editingUserId === record.id;
              return (
                <li key={record.id} className="grid grid-cols-[2fr,1.5fr,1fr,1fr] items-center px-6 py-4 text-sm text-slate-800">
                  <div>
                    <p className="font-semibold text-slate-900">{record.email}</p>
                    <p className="text-xs text-slate-500">Joined {formatDate(record.created_at)}</p>
                  </div>

                  <div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="fullName"
                        value={editForm.fullName}
                        onChange={handleEditChange}
                        placeholder="Full name"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
                      />
                    ) : (
                      <p className="font-medium text-slate-800">{record.full_name || "—"}</p>
                    )}
                  </div>

                  <div>
                    {isEditing ? (
                      <select
                        name="role"
                        value={editForm.role}
                        onChange={handleEditChange}
                        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-400 focus:outline-none"
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700">
                        {record.role || "user"}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-3">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={saveUser}
                          className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingUserId(null)}
                          className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => startEditing(record)}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUser(record.id)}
                          disabled={deletingId === record.id}
                          className="inline-flex items-center gap-2 rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === record.id ? "Deleting…" : "Delete"}
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
