
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Building2,
  Plus,
  Pencil,
  Power,
  X,
  RefreshCw,
} from "lucide-react";

type Branch = {
  id: number;
  name: string;
  active: boolean;
};

export default function BranchManagement() {
  const API_URL = "http://localhost:8081/api/branches";

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchName, setBranchName] = useState("");
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadBranches() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Failed to load branches (${response.status}).`);
      }

      const data = await response.json();
      setBranches(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load branches."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBranches();
  }, []);

  async function handleSaveBranch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = branchName.trim();

    if (!name) {
      setError("Please enter a branch name.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        editingBranch
          ? `${API_URL}/${editingBranch.id}`
          : API_URL,
        {
          method: editingBranch ? "PUT" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        }
      );

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(
          responseText || `Failed to save branch (${response.status}).`
        );
      }

      setMessage(
        editingBranch
          ? "Branch updated successfully."
          : "Branch created successfully."
      );

      setBranchName("");
      setEditingBranch(null);

      await loadBranches();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save branch."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(branch: Branch) {
    setEditingBranch(branch);
    setBranchName(branch.name);
    setMessage("");
    setError("");
  }

  function handleCancelEdit() {
    setEditingBranch(null);
    setBranchName("");
    setError("");
  }

  async function handleToggleStatus(branch: Branch) {
    const action = branch.active ? "deactivate" : "activate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} ${branch.name}?`
      )
    ) {
      return;
    }

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/${branch.id}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            active: !branch.active,
          }),
        }
      );

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(
          responseText ||
            `Failed to update branch status (${response.status}).`
        );
      }

      setMessage(
        `Branch ${branch.active ? "deactivated" : "activated"} successfully.`
      );

      await loadBranches();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update branch status."
      );
    }
  }

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#292D32]">
            Branch Management
          </h2>
          <p className="mt-1 text-sm text-[#7B8492]">
            Create and manage Ethiopian Customs Commission branches.
          </p>
        </div>

        <button
          type="button"
          onClick={loadBranches}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-[#D6E2E8] bg-white px-4 py-2.5 text-sm font-medium text-[#0A506E] transition hover:bg-[#E7F1F5] disabled:opacity-50"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Notifications */}
      {message && (
        <div
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {/* Create or edit branch */}
      <div className="rounded-2xl border border-[#E7EAF0] bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7F1F5] text-[#0A506E]">
            <Building2 size={20} />
          </div>

          <div>
            <h3 className="font-semibold text-[#292D32]">
              {editingBranch ? "Edit Branch" : "Create New Branch"}
            </h3>
            <p className="text-sm text-[#7B8492]">
              {editingBranch
                ? "Update the selected branch name."
                : "Add a new branch to the system."}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSaveBranch}
          className="flex flex-wrap gap-3"
        >
          <input
            type="text"
            value={branchName}
            onChange={(event) => setBranchName(event.target.value)}
            placeholder="Enter branch name"
            maxLength={150}
            required
            className="min-w-[220px] flex-1 rounded-lg border border-[#D6E2E8] px-4 py-3 text-sm outline-none focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/10"
          />

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0A506E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#176A87] disabled:opacity-50"
          >
            <Plus size={17} />
            {saving
              ? "Saving..."
              : editingBranch
                ? "Save Changes"
                : "Create Branch"}
          </button>

          {editingBranch && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex items-center gap-2 rounded-lg border border-[#D6E2E8] px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <X size={16} />
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Branch list */}
      <div className="overflow-hidden rounded-2xl border border-[#E7EAF0] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#EDF0F4] p-5">
          <div>
            <h3 className="font-semibold text-[#292D32]">
              All Branches
            </h3>
            <p className="mt-1 text-sm text-[#7B8492]">
              {branches.length} branches registered
            </p>
          </div>
        </div>

        {loading ? (
          <p className="p-8 text-center text-sm text-[#7B8492]">
            Loading branches...
          </p>
        ) : branches.length === 0 ? (
          <p className="p-8 text-center text-sm text-[#7B8492]">
            No branches found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F8FAFC] text-[#64748B]">
                <tr>
                  <th className="px-5 py-4 font-semibold">Branch</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#EDF0F4]">
                {branches.map((branch) => (
                  <tr
                    key={branch.id}
                    className="transition hover:bg-[#FAFCFD]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Building2
                          size={18}
                          className="text-[#0A506E]"
                        />
                        <span className="font-medium text-[#292D32]">
                          {branch.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          branch.active
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {branch.active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(branch)}
                          title="Edit branch"
                          className="rounded-lg border border-[#D6E2E8] p-2 text-[#0A506E] hover:bg-[#E7F1F5]"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(branch)}
                          title={
                            branch.active
                              ? "Deactivate branch"
                              : "Activate branch"
                          }
                          className="rounded-lg border border-[#D6E2E8] p-2 text-slate-600 hover:bg-slate-100"
                        >
                          <Power size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
