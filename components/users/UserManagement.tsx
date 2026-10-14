
"use client";

import { useState } from "react";

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

  function createUser(event: React.FormEvent<HTMLFormElement>) {
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

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-[#092c45]">
          User Management
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Create users and configure their system permissions.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <h4 className="font-bold text-[#092c45]">
            Create New User
          </h4>
          <p className="mt-1 text-sm text-slate-500">
            Complete the fields and select the permissions for this user.
          </p>
        </div>

        <form onSubmit={createUser} className="space-y-5 p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <input
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="rounded-lg border border-slate-300 px-3 py-3 text-sm"
            />
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="rounded-lg border border-slate-300 px-3 py-3 text-sm"
            />
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min. 8 characters)"
              className="rounded-lg border border-slate-300 px-3 py-3 text-sm"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm"
            >
              <option value="hr_manager">HR Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <h5 className="mb-3 font-semibold text-slate-700">
              Permissions
            </h5>
            <div className="grid gap-3 sm:grid-cols-2">
              {permissionOptions.map((permission) => (
                <label
                  key={permission.key}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 p-3"
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
                    className="mt-1 accent-[#092c45]"
                  />
                  <span>
                    <span className="block text-sm font-semibold">
                      {permission.label}
                    </span>
                    <span className="text-xs text-slate-500">
                      {permission.description}
                    </span>
                  </span>
                </label>
              ))}
            </div>
            {role === "admin" && (
              <p className="mt-2 text-xs text-slate-500">
                Admin users receive all permissions in this demo.
              </p>
            )}
          </div>

          {notice && (
            <p role="status" className="text-sm text-[#092c45]">
              {notice}
            </p>
          )}

          <button
            type="submit"
            className="rounded-lg bg-[#092c45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#123f5e]"
          >
            + Create User
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 p-5">
          <h4 className="font-bold text-[#092c45]">System Users</h4>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No users found. Create your first user above.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="px-4 py-4">{user.id}</td>
                    <td className="px-4 py-4 font-medium">
                      {user.username}
                    </td>
                    <td className="px-4 py-4">{user.fullName}</td>
                    <td className="px-4 py-4">
                      {user.role === "admin" ? "Admin" : "HR Manager"}
                    </td>
                    <td className="px-4 py-4">
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
                        className="font-semibold text-red-600 hover:underline"
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
