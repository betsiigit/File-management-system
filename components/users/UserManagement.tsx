
"use client";

import { useState, type FormEvent } from "react";

type Role = "hr_manager" | "admin";

type Permissions = {
  registerDocs: boolean;
  deleteDocs: boolean;
  manageUsers: boolean;
  editDocs: boolean;
  manageOfficers: boolean;
};

type User = {
  id: number;
  username: string;
  fullName: string;
  role: Role;
  permissions: Permissions;
};

const permissionOptions: {
  key: keyof Permissions;
  label: string;
  description: string;
}[] = [
  {
    key: "registerDocs",
    label: "Register Documents",
    description: "Files, jobs, letters, transfers",
  },
  {
    key: "deleteDocs",
    label: "Delete Documents",
    description: "Jobs, letters, transfers, employees",
  },
  {
    key: "manageUsers",
    label: "Manage Users",
    description: "Create, edit, delete",
  },
  {
    key: "editDocs",
    label: "Edit Documents",
    description: "Return files, edit entries",
  },
  {
    key: "manageOfficers",
    label: "Manage Officers",
    description: "Register, edit, delete",
  },
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("hr_manager");
  const [permissions, setPermissions] = useState<Permissions>({
    registerDocs: false,
    deleteDocs: false,
    manageUsers: false,
    editDocs: false,
    manageOfficers: false,
  });
  const [notice, setNotice] = useState("");

  function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      users.some(
        (user) =>
          user.username.toLowerCase() === username.trim().toLowerCase()
      )
    ) {
      setNotice("That username already exists.");
      return;
    }

    if (password.length < 8) {
      setNotice("Password must contain at least 8 characters.");
      return;
    }

    const newUser: User = {
      id: users.length
        ? Math.max(...users.map((user) => user.id)) + 1
        : 1,
      username: username.trim(),
      fullName: fullName.trim(),
      role,
      permissions:
        role === "admin"
          ? {
              registerDocs: true,
              deleteDocs: true,
              manageUsers: true,
              editDocs: true,
              manageOfficers: true,
            }
          : { ...permissions },
    };

    setUsers((current) => [...current, newUser]);
    setUsername("");
    setFullName("");
    setPassword("");
    setRole("hr_manager");
    setPermissions({
      registerDocs: false,
      deleteDocs: false,
      manageUsers: false,
      editDocs: false,
      manageOfficers: false,
    });
    setNotice("User created successfully.");
  }

  function deleteUser(id: number) {
    setUsers((current) => current.filter((user) => user.id !== id));
    setNotice("User removed from this demo.");
  }

  const inputClass =
    "w-full rounded-lg border border-[#D6E2E8] bg-white px-3 py-3 text-sm text-[#292D32] outline-none transition-colors duration-200 placeholder:text-[#9298A1] focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/10";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight text-[#292D32]">
          User Management
        </h3>
        <p className="mt-1 text-sm text-[#737B86]">
          Create users and configure their system permissions.
        </p>
      </div>

      {/* Create user form */}
      <div className="overflow-hidden rounded-xl border border-[#ECEFF2] bg-white shadow-sm">
        <div className="border-b border-[#ECEFF2] p-5">
          <h4 className="font-bold text-[#292D32]">
            Create New User
          </h4>
          <p className="mt-1 text-sm text-[#737B86]">
            Complete the fields and select the permissions for this user.
          </p>
        </div>

        <form onSubmit={createUser} className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="new-username" className="mb-2 block text-sm font-medium text-[#454B54]">
                Username *
              </label>
              <input
                id="new-username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className={inputClass}
              />
            </div>

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
              <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-[#454B54]">
                Password *
              </label>
              <input
                id="new-password"
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
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
                <option value="hr_manager">HR Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div>
            <h5 className="mb-3 font-semibold text-[#292D32]">
              Permissions
            </h5>

            <div className="grid gap-3 sm:grid-cols-2">
              {permissionOptions.map((permission) => (
                <label
                  key={permission.key}
                  className={`flex items-start gap-3 rounded-lg border p-3 transition-colors duration-150 ${
                    role === "admin"
                      ? "border-[#D6E2E8] bg-[#F8FAFB]"
                      : "border-[#ECEFF2] hover:border-[#D6E2E8] hover:bg-[#F8FAFB]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={
                      role === "admin" || permissions[permission.key]
                    }
                    disabled={role === "admin"}
                    onChange={(e) =>
                      setPermissions((current) => ({
                        ...current,
                        [permission.key]: e.target.checked,
                      }))
                    }
                    className="mt-1 h-4 w-4 accent-[#0A506E]"
                  />

                  <span>
                    <span className="block text-sm font-semibold text-[#292D32]">
                      {permission.label}
                    </span>
                    <span className="text-xs text-[#737B86]">
                      {permission.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>

            {role === "admin" && (
              <p className="mt-3 rounded-lg bg-[#E7F1F5] p-3 text-xs text-[#0A506E]">
                Admin users receive all permissions in this demo.
              </p>
            )}
          </div>

          {notice && (
            <p
              role="status"
              aria-live="polite"
              className={`rounded-lg border p-3 text-sm ${
                notice === "User created successfully."
                  ? "border-[#D6E2E8] bg-[#E7F1F5] text-[#0A506E]"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {notice}
            </p>
          )}

          <button
            type="submit"
            className="rounded-lg bg-[#0A506E] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#176A87] active:bg-[#135B74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A506E]/30"
          >
            + Create User
          </button>
        </form>
      </div>

      {/* System users table */}
      <div className="overflow-hidden rounded-xl border border-[#ECEFF2] bg-white shadow-sm">
        <div className="border-b border-[#ECEFF2] p-5">
          <h4 className="font-bold text-[#292D32]">
            System Users
          </h4>
          <p className="mt-1 text-sm text-[#737B86]">
            {users.length} {users.length === 1 ? "user" : "users"} created
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-[#F8FAFB] text-xs uppercase tracking-wide text-[#737B86]">
              <tr>
                <th className="px-4 py-4 font-semibold">#</th>
                <th className="px-4 py-4 font-semibold">Username</th>
                <th className="px-4 py-4 font-semibold">Full Name</th>
                <th className="px-4 py-4 font-semibold">Role</th>
                <th className="px-4 py-4 font-semibold">Permissions</th>
                <th className="px-4 py-4 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#ECEFF2]">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-[#737B86]"
                  >
                    <p className="font-semibold text-[#454B54]">
                      No users found.
                    </p>
                    <p className="mt-1 text-xs text-[#9298A1]">
                      Create your first user using the form above.
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors duration-150 hover:bg-[#F8FAFB]"
                  >
                    <td className="px-4 py-4 text-[#9298A1]">
                      {user.id}
                    </td>

                    <td className="px-4 py-4 font-semibold text-[#0A506E]">
                      {user.username}
                    </td>

                    <td className="px-4 py-4 font-medium text-[#292D32]">
                      {user.fullName}
                    </td>

                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-full bg-[#E7F1F5] px-3 py-1 text-xs font-semibold text-[#0A506E]">
                        {user.role === "admin" ? "Admin" : "HR Manager"}
                      </span>
                    </td>

                    <td className="max-w-xs whitespace-normal px-4 py-4 text-[#737B86]">
                      {user.role === "admin"
                        ? "All permissions"
                        : permissionOptions
                            .filter((p) => user.permissions[p.key])
                            .map((p) => p.label)
                            .join(", ") || "None"}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => deleteUser(user.id)}
                        className="rounded-lg px-3 py-2 font-semibold text-red-700 transition-colors duration-150 hover:bg-red-50"
                      >
                        Delete
                      </button>
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
