
"use client";

import { useState, type FormEvent } from "react";
import type { Employee } from "./EmployeeTable";

type EmployeeFormProps = {
  onSave: (
    employee: Omit<Employee, "id">
  ) => void | Promise<void>;
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
  const [gender, setGender] = useState<
  "Female" | "Male" | ""
>("");
  const [error, setError] = useState("");

async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

await onSave({
  employeeId: employeeId.trim(),
  fullName: fullName.trim(),
  department: department.trim(),
  position: position.trim(),
  status,
  gender,
});
}

  const inputClass =
    "mt-2 w-full rounded-lg border border-[#D6E2E8] bg-white px-3 py-3 text-sm text-[#292D32] outline-none transition-colors duration-200 placeholder:text-[#9298A1] focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/10";

  const labelClass = "text-sm font-semibold text-[#454B54]";

  return (
    <div className="max-w-3xl overflow-hidden rounded-xl border border-[#ECEFF2] bg-white shadow-sm">
      <div className="bg-[#0A506E] p-6 text-white">
        <h2 className="text-xl font-bold tracking-tight">
          Register Employee
        </h2>
        <p className="mt-1 text-sm text-white/75">
          Enter the employee's information below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
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
            <label className={labelClass}>
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
            <label className={labelClass}>
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
  <label
    htmlFor="employee-gender"
    className="mb-2 block text-sm font-medium text-[#292D32]"
  >
    Gender
  </label>

  <select
    id="employee-gender"
    value={gender}
   onChange={(event) =>
  setGender(
    event.target.value as "Female" | "Male"  | ""
  )
}
    className="w-full rounded-lg border border-[#ECEFF2] bg-white px-3 py-2.5 text-sm text-[#292D32] outline-none focus:border-[#0A506E]"
  >
    <option value="">Select gender</option>
    <option value="Female">Female</option>
    <option value="Male">Male</option>
    <option value="Other">Other</option>
  </select>
</div>

          <div>
            <label className={labelClass}>
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
            <label className={labelClass}>
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
          <p
            role="alert"
            className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-[#ECEFF2] pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#D6E2E8] bg-white px-5 py-3 text-sm font-semibold text-[#454B54] transition-colors duration-200 hover:bg-[#F4F5F9] active:bg-[#ECEFF2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A506E]/30"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="rounded-lg bg-[#0A506E] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#176A87] active:bg-[#135B74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A506E]/30"
          >
            Save Employee
          </button>
        </div>
      </form>
    </div>
  );
}
