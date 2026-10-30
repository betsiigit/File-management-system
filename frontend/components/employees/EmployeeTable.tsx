
"use client";

import { useState } from "react";
import {
  Eye,
  X,
  UserRound,
  Building2,
  BriefcaseBusiness,
  VenusAndMars,
  BadgeCheck,
  CalendarDays,
  FileText,
  UserRoundX,
  UserRoundCheck,
  LoaderCircle,
} from "lucide-react";

export type Employee = {
  id: number;
  employeeId: string;
  fullName: string;
  department: string;
  position: string;
  branch?: {
    id: number;
    name: string;
    active: boolean;
  } | null;
  status: "Active" | "Inactive";
  gender?: "Male" | "Female" | "Other" | "";
  inactiveReason?:
    | "Retired"
    | "Resigned"
    | "Deceased"
    | "Transferred"
    | "Other"
    | "";
  inactiveDate?: string;
  inactiveRemarks?: string;
};

export type EmployeeStatusUpdate = {
  status: "Active" | "Inactive";
  inactiveReason?: string;
  inactiveDate?: string;
  inactiveRemarks?: string;
};

type EmployeeTableProps = {
  employees: Employee[];
  status: "Active" | "Inactive";
  onUpdateStatus: (
    employeeId: number,
    update: EmployeeStatusUpdate
  ) => Promise<void>;
};

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UserRound;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-[#ECEFF2] p-4">
      <div className="mt-0.5 rounded-lg bg-[#E7F1F5] p-2 text-[#0A506E]">
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-[#737B86]">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-semibold text-[#292D32]">
          {value?.trim() || "Not recorded"}
        </p>
      </div>
    </div>
  );
}

export default function EmployeeTable({
  employees,
  status,
  onUpdateStatus,
}: EmployeeTableProps) {
  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const [showDeactivateForm, setShowDeactivateForm] = useState(false);
  const [inactiveReason, setInactiveReason] = useState("");
  const [inactiveDate, setInactiveDate] = useState("");
  const [inactiveRemarks, setInactiveRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState("");

  const filteredEmployees = employees.filter(
    (employee) => employee.status === status
  );

  function closeDetails() {
    if (saving) return;

    setSelectedEmployee(null);
    setShowDeactivateForm(false);
    setInactiveReason("");
    setInactiveDate("");
    setInactiveRemarks("");
    setActionError("");
  }

  async function handleDeactivate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedEmployee) return;

    if (!inactiveReason || !inactiveDate) {
      setActionError("Please select a reason and effective date.");
      return;
    }

    setSaving(true);
    setActionError("");

    try {
      await onUpdateStatus(selectedEmployee.id, {
        status: "Inactive",
        inactiveReason,
        inactiveDate,
        inactiveRemarks: inactiveRemarks.trim(),
      });

      closeDetails();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to deactivate this employee. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleReactivate() {
    if (!selectedEmployee) return;

    const confirmed = window.confirm(
      `Reactivate ${selectedEmployee.fullName}? Their current inactive details will be cleared.`
    );

    if (!confirmed) return;

    setSaving(true);
    setActionError("");

    try {
      await onUpdateStatus(selectedEmployee.id, {
        status: "Active",
      });

      closeDetails();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to reactivate this employee. Please try again."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-[#ECEFF2] bg-white shadow-sm">
        <div className="border-b border-[#ECEFF2] p-5">
          <h2 className="text-lg font-bold tracking-tight text-[#292D32]">
            {status} Employees
          </h2>

          <p className="mt-1 text-sm text-[#737B86]">
            {filteredEmployees.length} {status.toLowerCase()} employees
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left text-sm">
            <thead className="bg-[#F8FAFB] text-xs uppercase tracking-wide text-[#737B86]">
              <tr>
                <th className="px-5 py-4 font-semibold">Employee ID</th>
                <th className="px-5 py-4 font-semibold">Full Name</th>
                <th className="px-5 py-4 font-semibold">Department</th>
                <th className="px-5 py-4 font-semibold">Branch</th>
                <th className="px-5 py-4 font-semibold">Position</th>
                <th className="px-5 py-4 font-semibold">Gender</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#ECEFF2]">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center text-[#737B86]"
                  >
                    No {status.toLowerCase()} employees found.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="transition-colors duration-150 hover:bg-[#F8FAFB]"
                  >
                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#0A506E]">
                      {employee.employeeId}
                    </td>

                    <td className="px-5 py-4 font-medium text-[#292D32]">
                      {employee.fullName}
                    </td>

                    <td className="px-5 py-4 text-[#737B86]">
                      {employee.department}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-[#E7F1F5] px-3 py-1 text-xs font-semibold text-[#0A506E]">
                        <Building2 size={14} />
                        {employee.branch?.name || "Not assigned"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-[#737B86]">
                      {employee.position}
                    </td>

                    <td className="px-5 py-4 text-[#737B86]">
                      {employee.gender || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                          employee.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {employee.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedEmployee(employee);
                          setActionError("");
                          setShowDeactivateForm(false);
                        }}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#D6E2E8] bg-white px-3 py-2 text-xs font-semibold text-[#0A506E] transition hover:border-[#0A506E] hover:bg-[#E7F1F5]"
                        aria-label={`View details for ${employee.fullName}`}
                      >
                        <Eye size={15} />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEmployee && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDetails();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-details-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-[#ECEFF2] p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#E7F1F5] text-[#0A506E]">
                  <UserRound size={27} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#737B86]">
                    Employee Profile
                  </p>
                  <h2
                    id="employee-details-title"
                    className="mt-1 text-xl font-bold text-[#292D32]"
                  >
                    {selectedEmployee.fullName}
                  </h2>
                  <p className="mt-1 text-sm text-[#737B86]">
                    {selectedEmployee.employeeId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeDetails}
                disabled={saving}
                className="rounded-lg p-2 text-[#737B86] transition hover:bg-[#F1F4F6] hover:text-[#292D32] disabled:opacity-50"
                aria-label="Close employee details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <h3 className="mb-3 text-sm font-bold text-[#292D32]">
                  Personal and Employment Details
                </h3>

                <div className="grid gap-3 sm:grid-cols-2">
                  <DetailRow
                    icon={UserRound}
                    label="Full Name"
                    value={selectedEmployee.fullName}
                  />
                  <DetailRow
                    icon={BadgeCheck}
                    label="Employee ID"
                    value={selectedEmployee.employeeId}
                  />
                  <DetailRow
                    icon={Building2}
                    label="Department"
                    value={selectedEmployee.department}
                  />
                  <DetailRow
                    icon={Building2}
                    label="Branch"
                    value={selectedEmployee.branch?.name}
                  />
                  <DetailRow
                    icon={BriefcaseBusiness}
                    label="Position"
                    value={selectedEmployee.position}
                  />
                  <DetailRow
                    icon={VenusAndMars}
                    label="Gender"
                    value={selectedEmployee.gender}
                  />

                  <div className="flex items-start gap-3 rounded-xl border border-[#ECEFF2] p-4">
                    <div className="mt-0.5 rounded-lg bg-[#E7F1F5] p-2 text-[#0A506E]">
                      <BadgeCheck size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#737B86]">
                        Employment Status
                      </p>
                      <span
                        className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          selectedEmployee.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {selectedEmployee.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedEmployee.status === "Inactive" && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-[#0A506E]" />
                    <h3 className="text-sm font-bold text-[#292D32]">
                      Inactive Employee Information
                    </h3>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <DetailRow
                      icon={FileText}
                      label="Reason for Inactivation"
                      value={selectedEmployee.inactiveReason}
                    />
                    <DetailRow
                      icon={CalendarDays}
                      label="Effective Date"
                      value={selectedEmployee.inactiveDate}
                    />
                  </div>

                  <div className="mt-3 rounded-xl border border-[#ECEFF2] p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-[#737B86]">
                      Remarks
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#292D32]">
                      {selectedEmployee.inactiveRemarks?.trim() ||
                        "No remarks recorded."}
                    </p>
                  </div>
                </div>
              )}

              {actionError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {actionError}
                </p>
              )}

              {showDeactivateForm &&
                selectedEmployee.status === "Active" && (
                  <form
                    onSubmit={handleDeactivate}
                    className="space-y-4 rounded-xl border border-[#D6E2E8] bg-[#F8FAFB] p-5"
                  >
                    <div>
                      <h3 className="font-bold text-[#292D32]">
                        Deactivate Employee
                      </h3>
                      <p className="mt-1 text-sm text-[#737B86]">
                        Record the reason and effective date before saving.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="inactiveReason"
                        className="mb-1.5 block text-sm font-medium text-[#292D32]"
                      >
                        Reason <span className="text-red-600">*</span>
                      </label>
                      <select
                        id="inactiveReason"
                        value={inactiveReason}
                        onChange={(event) =>
                          setInactiveReason(event.target.value)
                        }
                        required
                        disabled={saving}
                        className="w-full rounded-lg border border-[#D6E2E8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/15"
                      >
                        <option value="">Select a reason</option>
                        <option value="Retired">Retired</option>
                        <option value="Resigned">Resigned</option>
                        <option value="Deceased">Deceased</option>
                        <option value="Transferred">Transferred</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="inactiveDate"
                        className="mb-1.5 block text-sm font-medium text-[#292D32]"
                      >
                        Effective Date <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="inactiveDate"
                        type="date"
                        value={inactiveDate}
                        onChange={(event) =>
                          setInactiveDate(event.target.value)
                        }
                        required
                        disabled={saving}
                        className="w-full rounded-lg border border-[#D6E2E8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/15"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="inactiveRemarks"
                        className="mb-1.5 block text-sm font-medium text-[#292D32]"
                      >
                        Remarks <span className="text-[#737B86]">(Optional)</span>
                      </label>
                      <textarea
                        id="inactiveRemarks"
                        value={inactiveRemarks}
                        onChange={(event) =>
                          setInactiveRemarks(event.target.value)
                        }
                        rows={3}
                        maxLength={2000}
                        disabled={saving}
                        placeholder="Add any relevant notes..."
                        className="w-full resize-y rounded-lg border border-[#D6E2E8] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/15"
                      />
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeactivateForm(false);
                          setActionError("");
                        }}
                        disabled={saving}
                        className="rounded-lg border border-[#D6E2E8] bg-white px-4 py-2.5 text-sm font-semibold text-[#292D32] hover:bg-[#F1F4F6] disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#0A506E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#176A87] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving && (
                          <LoaderCircle size={16} className="animate-spin" />
                        )}
                        {saving ? "Saving..." : "Confirm Deactivation"}
                      </button>
                    </div>
                  </form>
                )}
            </div>

            {!showDeactivateForm && (
              <div className="flex flex-wrap justify-between gap-3 border-t border-[#ECEFF2] bg-[#F8FAFB] p-5">
                <div>
                  {selectedEmployee.status === "Active" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setInactiveReason("");
                        setInactiveDate("");
                        setInactiveRemarks("");
                        setActionError("");
                        setShowDeactivateForm(true);
                      }}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <UserRoundX size={16} />
                      Deactivate Employee
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleReactivate}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {saving ? (
                        <LoaderCircle size={16} className="animate-spin" />
                      ) : (
                        <UserRoundCheck size={16} />
                      )}
                      {saving ? "Saving..." : "Reactivate Employee"}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={closeDetails}
                  disabled={saving}
                  className="rounded-lg border border-[#D6E2E8] bg-white px-5 py-2.5 text-sm font-semibold text-[#292D32] transition hover:bg-[#F1F4F6] disabled:opacity-50"
                >
                  Close
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}
