
"use client";

import { useState, type FormEvent } from "react";
import type { Employee } from "./EmployeeTable";

type EmployeeFormProps = {
  onSave: (employee: Omit<Employee, "id">) => void;
  onCancel: () => void;
};

export default function EmployeeForm({
  onSave,
  onCancel,
}: EmployeeFormProps) {
  const [employeeId, setEmployeeId] = useState("");
  const [fullName, setFullName] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !employeeId.trim() ||
      !fullName.trim() ||
      !department.trim() ||
      !position.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    setError("");

    onSave({
      employeeId: employeeId.trim(),
      fullName: fullName.trim(),
      department: department.trim(),
      position: position.trim(),
      status,
    });
  }

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

  return (
    <div className="max-w-3xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-[#092c45] p-6 text-white">
        <h2 className="text-xl font-bold">Register Employee</h2>
        <p className="mt-1 text-sm text-slate-300">
          Enter the employee's information below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              Employee ID *
            </label>
            <input
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="e.g. EMP-004"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Full Name *
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Department *
            </label>
            <input
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Finance"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Position *
            </label>
            <input
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="e.g. Accountant"
              className={inputClass}
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-sm font-semibold text-slate-700">
              Employment Status *
            </label>
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "Active" | "Inactive")
              }
              className={inputClass}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg bg-[#092c45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#123f5e]"
          >
            Save Employee
          </button>
        </div>
      </form>
    </div>
  );
}
