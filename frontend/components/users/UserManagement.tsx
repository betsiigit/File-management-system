
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type Role = "ADMIN" | "REGISTRAR" | "OFFICER" | "VIEWER";


type UserManagementProps = {
  userRole: Role;
};

type User = {
  id: number;
  fullName: string;
  email: string;
  role: Role;
 
  active: boolean;
  branchId: number | null;
  branchName?: string | null;
};

type Branch = {
  id: number;
  name: string;
  active: boolean;
};

const inputClass =
  "w-full rounded-lg border border-[#D6E2E8] bg-white px-3 py-3 text-sm text-[#292D32] outline-none transition-colors placeholder:text-[#9298A1] focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/10";

const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  REGISTRAR: "Registrar",
  OFFICER: "Officer",
  VIEWER: "Viewer",
};

export default function UserManagement({
  userRole,
}: UserManagementProps) {
  if (userRole !== "ADMIN") {
    return (
      <div className="rounded-xl border border-[#ECEFF2] bg-white p-6">
        <h3 className="text-lg font-bold text-[#292D32]">
          Access Restricted
        </h3>
        <p className="mt-2 text-sm text-[#737B86]">
          Only administrators can access User Management.
        </p>
      </div>
    );
  }
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  const [branchId, setBranchId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("OFFICER");

  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Reset password state
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [confirmResetPassword, setConfirmResetPassword] = useState("");
  const [resetSaving, setResetSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8081/api/users", {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Unable to load users (${response.status}).`);
      }

      const data: User[] = await response.json();
      setUsers(data);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Unable to load users.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBranches = useCallback(async () => {
    try {
      const response = await fetch("http://localhost:8081/api/branches", {
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Unable to load branches (${response.status}).`);
      }

      const data: Branch[] = await response.json();
      setBranches(data.filter((branch) => branch.active));
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Unable to load branches.",
      );
    }
  }, []);

  useEffect(() => {
    void loadUsers();
    void loadBranches();
  }, [loadUsers, loadBranches]);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    if (!branchId) {
      setNotice("Please select a branch.");
      return;
    }

    if (password.length < 12) {
      setNotice("The password must contain at least 12 characters.");
      return;
    }

    if (new TextEncoder().encode(password).length > 72) {
      setNotice("The password is too long. Use at most 72 UTF-8 bytes.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("http://localhost:8081/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          password,
          role,
          branchId: Number(branchId),
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ?? `Unable to create user (${response.status}).`,
        );
      }

      setNotice(result?.message ?? "User created successfully.");
      setFullName("");
      setEmail("");
      setPassword("");
      setBranchId("");
      setRole("OFFICER");

      await loadUsers();
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Unable to create user.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function resetUserPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    if (!resetUser) return;

    if (resetPassword.length < 8) {
      setNotice("The new password must contain at least 8 characters.");
      return;
    }

    if (new TextEncoder().encode(resetPassword).length > 72) {
      setNotice("The new password is too long. Use at most 72 UTF-8 bytes.");
      return;
    }

    if (resetPassword !== confirmResetPassword) {
      setNotice("The new passwords do not match.");
      return;
    }

    setResetSaving(true);

    try {
      const response = await fetch(
        `http://localhost:8081/api/auth/admin-reset-password/${resetUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            newPassword: resetPassword,
            confirmPassword: confirmResetPassword,
          }),
        },
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ??
            `Could not reset password (${response.status}).`,
        );
      }

      setNotice(
        result?.message ?? `Password reset for ${resetUser.fullName}.`,
      );

      setResetUser(null);
      setResetPassword("");
      setConfirmResetPassword("");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to reset the password. Please try again.",
      );
    } finally {
      setResetSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-[#292D32]">
          User Management
        </h3>
        <p className="mt-1 text-sm text-[#737B86]">
          Create accounts and manage system users.
        </p>
      </div>

      {/* Create user */}
      <div className="overflow-hidden rounded-xl border border-[#ECEFF2] bg-white shadow-sm">
        <div className="border-b border-[#ECEFF2] p-5">
          <h4 className="font-bold text-[#292D32]">Create New User</h4>
          <p className="mt-1 text-sm text-[#737B86]">
            Complete the fields to create a new account.
          </p>
        </div>

        <form onSubmit={createUser} className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label
                htmlFor="new-full-name"
                className="mb-2 block text-sm font-medium text-[#454B54]"
              >
                Full Name *
              </label>
              <input
                id="new-full-name"
                required
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Enter full name"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="new-email"
                className="mb-2 block text-sm font-medium text-[#454B54]"
              >
                Email *
              </label>
              <input
                id="new-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="user@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="new-password"
                className="mb-2 block text-sm font-medium text-[#454B54]"
              >
                Password *
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 12 characters"
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="new-role"
                className="mb-2 block text-sm font-medium text-[#454B54]"
              >
                Role *
              </label>
              <select
                id="new-role"
                value={role}
                onChange={(event) => setRole(event.target.value as Role)}
                className={inputClass}
              >
                <option value="REGISTRAR">Registrar</option>
                <option value="OFFICER">Officer</option>
                <option value="VIEWER">Viewer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="branch"
              className="mb-2 block text-sm font-medium text-[#292D32]"
            >
              Branch <span className="text-red-500">*</span>
            </label>
            <select
              id="branch"
              value={branchId}
              onChange={(event) => setBranchId(event.target.value)}
              className={inputClass}
              required
            >
              <option value="">Select a branch</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>

          {notice && (
            <p
              role="status"
              aria-live="polite"
              className="rounded-lg border border-[#D6E2E8] bg-[#F8FAFB] p-3 text-sm text-[#454B54]"
            >
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#0A506E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#176A87] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Creating..." : "+ Create User"}
          </button>
        </form>
      </div>

      {/* System users table */}
      <div className="overflow-hidden rounded-xl border border-[#ECEFF2] bg-white shadow-sm">
        <div className="border-b border-[#ECEFF2] p-5">
          <h4 className="font-bold text-[#292D32]">System Users</h4>
          <p className="mt-1 text-sm text-[#737B86]">
            {users.length} {users.length === 1 ? "user" : "users"} found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-[#F8FAFB] text-xs uppercase tracking-wide text-[#737B86]">
              <tr>
                <th className="px-4 py-4 font-semibold">ID</th>
                <th className="px-4 py-4 font-semibold">Full Name</th>
                <th className="px-4 py-4 font-semibold">Email</th>
                <th className="px-4 py-4 font-semibold">Role</th>
                <th className="px-4 py-4 font-semibold">Status</th>
                <th className="px-4 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#ECEFF2]">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-[#737B86]"
                  >
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-[#737B86]"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-[#F8FAFB]"
                  >
                    <td className="px-4 py-4 text-[#9298A1]">{user.id}</td>

                    <td className="px-4 py-4 font-medium text-[#292D32]">
                      {user.fullName}
                    </td>

                    <td className="px-4 py-4 text-[#454B54]">{user.email}</td>

                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-[#E7F1F5] px-3 py-1 text-xs font-semibold text-[#0A506E]">
                        {roleLabels[user.role] ?? user.role}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          user.active
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => {
                          setNotice("");
                          setResetUser(user);
                          setResetPassword("");
                          setConfirmResetPassword("");
                        }}
                        className="whitespace-nowrap rounded-lg border border-[#D6E2E8] px-3 py-2 text-xs font-semibold text-[#0A506E] transition-colors hover:border-[#0A506E] hover:bg-[#E7F1F5]"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset password modal */}
      {resetUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={(event) => {
            if (event.target === event.currentTarget && !resetSaving) {
              setResetUser(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <h4
              id="reset-password-title"
              className="text-xl font-bold text-[#292D32]"
            >
              Reset Password
            </h4>

            <p className="mt-2 text-sm text-[#737B86]">
              Set a new password for <strong>{resetUser.fullName}</strong>.
              They will need to use it at their next login.
            </p>

            <form
              onSubmit={resetUserPassword}
              className="mt-6 space-y-4"
            >
              <div>
                <label
                  htmlFor="reset-new-password"
                  className="mb-2 block text-sm font-medium text-[#454B54]"
                >
                  New Password
                </label>
                <input
                  id="reset-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={resetPassword}
                  onChange={(event) => setResetPassword(event.target.value)}
                  minLength={8}
                  required
                  className={inputClass}
                  disabled={resetSaving}
                />
              </div>

              <div>
                <label
                  htmlFor="reset-confirm-password"
                  className="mb-2 block text-sm font-medium text-[#454B54]"
                >
                  Confirm New Password
                </label>
                <input
                  id="reset-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirmResetPassword}
                  onChange={(event) =>
                    setConfirmResetPassword(event.target.value)
                  }
                  minLength={8}
                  required
                  className={inputClass}
                  disabled={resetSaving}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={resetSaving}
                  onClick={() => setResetUser(null)}
                  className="rounded-lg border border-[#D6E2E8] px-4 py-2.5 text-sm font-medium text-[#454B54] hover:bg-[#F8FAFB] disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={resetSaving}
                  className="rounded-lg bg-[#0A506E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#176A87] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resetSaving ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
