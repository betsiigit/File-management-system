
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";

type Role = "ADMIN" | "REGISTRAR" | "OFFICER" | "VIEWER";


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


const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  REGISTRAR: "Registrar",
  OFFICER: "Officer",
  VIEWER: "Viewer",
};

const inputClass =
  "w-full rounded-lg border border-[#D6E2E8] bg-white px-3 py-3 text-sm text-[#292D32] outline-none transition-colors placeholder:text-[#9298A1] focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/10";

export default function UserManagement() {
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

  const loadUsers = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8081/api/users", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401 || response.status === 403
            ? "You must be logged in as an Admin to manage users."
            : `Could not load users (${response.status}).`,
        );
      }

      const data: User[] = await response.json();
      setUsers(data);
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to connect to the backend.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    if (password.length < 12) {
      setNotice("Password must contain at least 12 characters.");
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
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message ?? `Could not create user (${response.status}).`,
        );
      }

      const savedUser = result as User;

      setUsers((current) => [
        ...current.filter((user) => user.id !== savedUser.id),
        savedUser,
      ].sort((a, b) => a.id - b.id));

      setFullName("");
      setEmail("");
      setPassword("");
      setRole("OFFICER");
      setNotice("User created successfully and saved to the database.");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Unable to create user. Please try again.",
      );
    } finally {
      setSaving(false);
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
              <label htmlFor="new-full-name" className="mb-2 block text-sm font-medium text-[#454B54]">
                Full Name *
              </label>
              <input
                id="new-full-name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="new-email" className="mb-2 block text-sm font-medium text-[#454B54]">
                Email *
              </label>
              <input
                id="new-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-[#454B54]">
                Password *
              </label>
              <input
                id="new-password"
                type="password"
                required
                minLength={12}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 12 characters"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="new-role" className="mb-2 block text-sm font-medium text-[#454B54]">
                Role *
              </label>
              <select
                id="new-role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
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

      <div className="overflow-hidden rounded-xl border border-[#ECEFF2] bg-white shadow-sm">
        <div className="border-b border-[#ECEFF2] p-5">
          <h4 className="font-bold text-[#292D32]">System Users</h4>
          <p className="mt-1 text-sm text-[#737B86]">
            {users.length} {users.length === 1 ? "user" : "users"} found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-[#F8FAFB] text-xs uppercase tracking-wide text-[#737B86]">
              <tr>
                <th className="px-4 py-4 font-semibold">ID</th>
                <th className="px-4 py-4 font-semibold">Full Name</th>
                <th className="px-4 py-4 font-semibold">Email</th>
                <th className="px-4 py-4 font-semibold">Role</th>
                <th className="px-4 py-4 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#ECEFF2]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#737B86]">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-[#737B86]">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-[#F8FAFB]">
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
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                        user.active
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
