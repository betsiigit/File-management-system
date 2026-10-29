
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Employee } from "@/components/employees/EmployeeTable";

type ReportFile = {
  id: number;
  reference: string;
  title: string;
  department: string;
  date: string;
  status: "Pending" | "Approved" | "Archived";
  fileType?: "Incoming" | "Outgoing";
  pages?: number;
  assignedOfficer?: string;
};

type ReportSummary = {
  totalFiles: number;
  incomingFiles: number;
  outgoingFiles: number;
  pendingFiles: number;
  approvedFiles: number;
  archivedFiles: number;
};

type Props = {
  employees: Employee[];
  files: ReportFile[];
};

function MetricCard({
  label,
  value,
  color = "blue",
}: {
  label: string;
  value: number | string;
  color?: "blue" | "green" | "red" | "amber" | "purple";
}) {
  const colors = {
    blue: "border-blue-200 bg-blue-50 text-blue-900",
    green: "border-green-200 bg-green-50 text-green-900",
    red: "border-red-200 bg-red-50 text-red-900",
    amber: "border-amber-200 bg-amber-50 text-amber-900",
    purple: "border-purple-200 bg-purple-50 text-purple-900",
  };

  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div>
      <h3 className="text-lg font-bold text-[#092c45]">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      )}
    </div>
  );
}

function BarChart({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: number; color: string }[];
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <h4 className="mb-5 font-semibold text-[#092c45]">{title}</h4>

      <div className="space-y-5">
        {items.map((item) => (
          <div key={item.label}>
            <div className="mb-2 flex justify-between gap-3 text-sm">
              <span className="text-slate-600">{item.label}</span>
              <strong>{item.value}</strong>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${item.color}`}
                style={{
                  width: `${(item.value / max) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyTable({
  headers,
  message = "No data available yet.",
}: {
  headers: string[];
  message?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full min-w-[750px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-4 py-3">
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          <tr>
            <td
              colSpan={headers.length}
              className="px-4 py-8 text-center text-slate-500"
            >
              {message}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

const emptySummary: ReportSummary = {
  totalFiles: 0,
  incomingFiles: 0,
  outgoingFiles: 0,
  pendingFiles: 0,
  approvedFiles: 0,
  archivedFiles: 0,
};

export default function Reports({ employees, files }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [dateError, setDateError] = useState("");

  const [summary, setSummary] = useState<ReportSummary>(emptySummary);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  // Load the real file summary from the Spring Boot backend.
  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setSummaryLoading(true);
      setSummaryError("");

      try {
        const params = new URLSearchParams();

        if (appliedFrom) params.set("startDate", appliedFrom);
        if (appliedTo) params.set("endDate", appliedTo);

        const query = params.toString();
        const url = `http://localhost:8081/api/reports/summary${
          query ? `?${query}` : ""
        }`;

        const response = await fetch(url, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(`Failed to load report (${response.status})`);
        }

        const data: ReportSummary = await response.json();

        if (!cancelled) {
          setSummary(data);
        }
      } catch (error) {
        console.error("Failed to load report summary:", error);

        if (!cancelled) {
          setSummaryError(
            "Could not load the file report. Check that the backend is running."
          );
        }
      } finally {
        if (!cancelled) {
          setSummaryLoading(false);
        }
      }
    }

    loadSummary();

    return () => {
      cancelled = true;
    };
  }, [appliedFrom, appliedTo, refreshKey]);

  // Calculate employee and file information for the selected date range.
  const report = useMemo(() => {
    const active = employees.filter(
      (employee) => employee.status === "Active"
    );

    const inactive = employees.filter(
      (employee) => employee.status === "Inactive"
    );

    const filteredFiles = files.filter((file) => {
      const date = file.date?.slice(0, 10);

      if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
        return !appliedFrom && !appliedTo;
      }

      if (appliedFrom && date < appliedFrom) return false;
      if (appliedTo && date > appliedTo) return false;

      return true;
    });

    return {
      active,
      inactive,
      files: filteredFiles,
      pending: filteredFiles.filter(
        (file) => file.status === "Pending"
      ).length,
      approved: filteredFiles.filter(
        (file) => file.status === "Approved"
      ).length,
      archived: filteredFiles.filter(
        (file) => file.status === "Archived"
      ).length,
      incoming: filteredFiles.filter(
        (file) => file.fileType === "Incoming"
      ).length,
      outgoing: filteredFiles.filter(
        (file) => file.fileType === "Outgoing"
      ).length,
      totalPages: filteredFiles.reduce(
        (total, file) => total + (file.pages ?? 0),
        0
      ),
    };
  }, [employees, files, appliedFrom, appliedTo]);

  // Calculate actual gender statistics from employee records.
  const genderStats = useMemo(() => {
    const countGender = (
      list: Employee[],
      gender: "Male" | "Female" | "Other"
    ) =>
      list.filter(
        (employee) =>
          employee.gender?.trim().toLowerCase() === gender.toLowerCase()
      ).length;

    const recorded = employees.filter((employee) =>
      ["male", "female", "other"].includes(
        employee.gender?.trim().toLowerCase() ?? ""
      )
    ).length;

    return {
      recorded,
      notRecorded: employees.length - recorded,
      activeMale: countGender(report.active, "Male"),
      activeFemale: countGender(report.active, "Female"),
      activeOther: countGender(report.active, "Other"),
      inactiveMale: countGender(report.inactive, "Male"),
      inactiveFemale: countGender(report.inactive, "Female"),
      inactiveOther: countGender(report.inactive, "Other"),
    };
  }, [employees, report.active, report.inactive]);

  // Calculate inactive employee reasons when available.
  const inactiveReasonStats = useMemo(() => {
    const countReason = (
      reason: "Retired" | "Resigned" | "Deceased" | "Transferred"
    ) =>
      report.inactive.filter(
        (employee) =>
          employee.inactiveReason?.trim().toLowerCase() ===
          reason.toLowerCase()
      ).length;

    return {
      retired: countReason("Retired"),
      resigned: countReason("Resigned"),
      deceased: countReason("Deceased"),
      transferred: countReason("Transferred"),
    };
  }, [report.inactive]);

  function generateReport() {
    // The backend currently expects both dates or neither date.
    if (Boolean(fromDate) !== Boolean(toDate)) {
      setDateError(
        "Please select both a From date and a To date, or clear both dates."
      );
      return;
    }

    if (fromDate && toDate && fromDate > toDate) {
      setDateError(
        "The From date must be before or equal to the To date."
      );
      return;
    }

    setDateError("");
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
  }

  function resetReport() {
    setFromDate("");
    setToDate("");
    setAppliedFrom("");
    setAppliedTo("");
    setDateError("");
  }

  function refreshReport() {
    setRefreshKey((key) => key + 1);
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#092c45]">
            Reports &amp; Analytics
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Office activity, employee statistics, files, jobs, transfers,
            and letters.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg bg-[#092c45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#124766]"
        >
          Print
        </button>
      </div>

      {/* Report filters */}
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 font-semibold text-[#092c45]">
          Report Filters
        </h3>

        <p className="mb-4 text-sm text-slate-500">
          Choose a date range to filter the reports. Dates currently use the
          browser&apos;s Gregorian calendar.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium text-slate-700">
            From
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="mt-2 block w-full rounded-lg border border-slate-300 p-2.5"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            To
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="mt-2 block w-full rounded-lg border border-slate-300 p-2.5"
            />
          </label>

          <button
            type="button"
            onClick={generateReport}
            className="self-end rounded-lg bg-[#092c45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#124766]"
          >
            Generate
          </button>

          <div className="flex gap-2 self-end">
            <button
              type="button"
              onClick={resetReport}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={refreshReport}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {dateError && (
          <p className="mt-3 text-sm text-red-600">{dateError}</p>
        )}

        {summaryLoading && (
          <p className="mt-3 text-sm text-slate-500">
            Loading file report...
          </p>
        )}

        {summaryError && (
          <p className="mt-3 text-sm text-red-600">{summaryError}</p>
        )}
      </section>

      {/* User Activity Report */}
      <section className="space-y-4">
        <SectionTitle
          title="User Activity Report"
          description="User rankings based on recorded system activity."
        />

        <EmptyTable
          headers={[
            "Rank",
            "User",
            "Files",
            "Jobs",
            "Letters",
            "Transfers",
            "Employees",
            "Total",
          ]}
          message="No user activity data available."
        />

        <p className="text-xs text-slate-500">
          User activity requires audit or activity-log data. It is not
          calculated from file totals.
        </p>
      </section>

      {/* Gender Distribution */}
      <section className="space-y-4">
        <SectionTitle
          title="Gender Distribution"
          description="Employee statistics based on recorded gender information."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Employees" value={employees.length} />
          <MetricCard
            label="Active Employees"
            value={report.active.length}
            color="green"
          />
          <MetricCard
            label="Inactive Employees"
            value={report.inactive.length}
            color="amber"
          />
          <MetricCard
            label="Gender Recorded"
            value={genderStats.recorded}
            color="purple"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart
            title="Active Employees by Gender"
            items={[
              {
                label: "Male",
                value: genderStats.activeMale,
                color: "bg-blue-500",
              },
              {
                label: "Female",
                value: genderStats.activeFemale,
                color: "bg-purple-500",
              },
              {
                label: "Other",
                value: genderStats.activeOther,
                color: "bg-green-500",
              },
              {
                label: "Not recorded",
                value:
                  report.active.length -
                  genderStats.activeMale -
                  genderStats.activeFemale -
                  genderStats.activeOther,
                color: "bg-slate-400",
              },
            ]}
          />

          <BarChart
            title="Inactive Employees by Gender"
            items={[
              {
                label: "Male",
                value: genderStats.inactiveMale,
                color: "bg-blue-500",
              },
              {
                label: "Female",
                value: genderStats.inactiveFemale,
                color: "bg-purple-500",
              },
              {
                label: "Other",
                value: genderStats.inactiveOther,
                color: "bg-green-500",
              },
              {
                label: "Not recorded",
                value:
                  report.inactive.length -
                  genderStats.inactiveMale -
                  genderStats.inactiveFemale -
                  genderStats.inactiveOther,
                color: "bg-slate-400",
              },
            ]}
          />
        </div>

        <p className="text-xs text-slate-500">
          Gender statistics are calculated from employee records currently
          loaded by the application. Not recorded includes missing or
          unrecognized gender values.
        </p>
      </section>

      {/* Inactive Employees by Reason */}
      <section className="space-y-4">
        <SectionTitle
          title="Inactive Employees by Reason"
          description="Inactive employee reasons are based on the values stored in employee records."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Retired"
            value={inactiveReasonStats.retired}
            color="blue"
          />
          <MetricCard
            label="Resigned"
            value={inactiveReasonStats.resigned}
            color="amber"
          />
          <MetricCard
            label="Deceased"
            value={inactiveReasonStats.deceased}
            color="red"
          />
          <MetricCard
            label="Transferred"
            value={inactiveReasonStats.transferred}
            color="purple"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart
            title="Inactive Reasons Distribution"
            items={[
              {
                label: "Retired",
                value: inactiveReasonStats.retired,
                color: "bg-blue-500",
              },
              {
                label: "Resigned",
                value: inactiveReasonStats.resigned,
                color: "bg-amber-500",
              },
              {
                label: "Deceased",
                value: inactiveReasonStats.deceased,
                color: "bg-red-500",
              },
              {
                label: "Transferred",
                value: inactiveReasonStats.transferred,
                color: "bg-purple-500",
              },
              {
                label: "Other / not recorded",
                value:
                  report.inactive.length -
                  inactiveReasonStats.retired -
                  inactiveReasonStats.resigned -
                  inactiveReasonStats.deceased -
                  inactiveReasonStats.transferred,
                color: "bg-slate-400",
              },
            ]}
          />

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="mb-4 font-semibold text-[#092c45]">
              Inactive Summary
            </h4>

            <div className="space-y-3 text-sm">
              <p className="flex justify-between">
                <span>Retired</span>
                <strong>{inactiveReasonStats.retired}</strong>
              </p>
              <p className="flex justify-between">
                <span>Resigned</span>
                <strong>{inactiveReasonStats.resigned}</strong>
              </p>
              <p className="flex justify-between">
                <span>Deceased</span>
                <strong>{inactiveReasonStats.deceased}</strong>
              </p>
              <p className="flex justify-between">
                <span>Transferred</span>
                <strong>{inactiveReasonStats.transferred}</strong>
              </p>
              <p className="flex justify-between border-t pt-3">
                <span>Total inactive employees</span>
                <strong>{report.inactive.length}</strong>
              </p>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Counts reflect the inactive-reason values available in the
              employee records loaded by the application.
            </p>
          </div>
        </div>
      </section>

      {/* File Activity */}
      <section className="space-y-4">
        <SectionTitle
          title="File Activity"
          description="Live file totals and statuses from the office-file backend."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Total Files" value={summary.totalFiles} />
          <MetricCard
            label="Incoming"
            value={summary.incomingFiles}
            color="green"
          />
          <MetricCard
            label="Outgoing"
            value={summary.outgoingFiles}
            color="red"
          />
          <MetricCard
            label="Pending"
            value={summary.pendingFiles}
            color="amber"
          />
          <MetricCard
            label="Approved"
            value={summary.approvedFiles}
            color="purple"
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart
            title="File Activity Chart"
            items={[
              {
                label: "Incoming",
                value: summary.incomingFiles,
                color: "bg-green-500",
              },
              {
                label: "Outgoing",
                value: summary.outgoingFiles,
                color: "bg-red-500",
              },
              {
                label: "Pending",
                value: summary.pendingFiles,
                color: "bg-amber-500",
              },
              {
                label: "Approved",
                value: summary.approvedFiles,
                color: "bg-purple-500",
              },
              {
                label: "Archived",
                value: summary.archivedFiles,
                color: "bg-slate-500",
              },
            ]}
          />

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="mb-4 font-semibold text-[#092c45]">
              File Summary
            </h4>

            <div className="space-y-3 text-sm">
              <p className="flex justify-between">
                <span>Total Files</span>
                <strong>{summary.totalFiles}</strong>
              </p>
              <p className="flex justify-between">
                <span>Incoming</span>
                <strong>{summary.incomingFiles}</strong>
              </p>
              <p className="flex justify-between">
                <span>Outgoing</span>
                <strong>{summary.outgoingFiles}</strong>
              </p>
              <p className="flex justify-between">
                <span>Pending</span>
                <strong>{summary.pendingFiles}</strong>
              </p>
              <p className="flex justify-between">
                <span>Approved</span>
                <strong>{summary.approvedFiles}</strong>
              </p>
              <p className="flex justify-between">
                <span>Archived</span>
                <strong>{summary.archivedFiles}</strong>
              </p>
              <p className="flex justify-between border-t pt-3">
                <span>Recorded pages in filtered files</span>
                <strong>{report.totalPages}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {[
                  "#",
                  "Reference",
                  "Title",
                  "Department",
                  "Assigned Officer",
                  "Pages",
                  "Date",
                  "Type",
                  "Status",
                ].map((header) => (
                  <th key={header} className="px-4 py-3">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {report.files.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    No files match the selected date range.
                  </td>
                </tr>
              ) : (
                report.files.map((file, index) => (
                  <tr key={file.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{file.reference || "—"}</td>
                    <td className="px-4 py-3">{file.title || "—"}</td>
                    <td className="px-4 py-3">{file.department || "—"}</td>
                    <td className="px-4 py-3">
                      {file.assignedOfficer || "—"}
                    </td>
                    <td className="px-4 py-3">{file.pages ?? 0}</td>
                    <td className="px-4 py-3">{file.date || "—"}</td>
                    <td className="px-4 py-3">{file.fileType || "—"}</td>
                    <td className="px-4 py-3">{file.status || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Job Activity */}
      <section className="space-y-4">
        <SectionTitle
          title="Job Activity"
          description="Job statistics require job records from a connected backend source."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Jobs" value="Unavailable" />
          <MetricCard label="Total Quantity" value="Unavailable" color="green" />
          <MetricCard label="Average per Job" value="Unavailable" color="purple" />
          <MetricCard label="Unique Dates" value="Unavailable" color="amber" />
        </div>

        <EmptyTable
          headers={["#", "Date (Eth)", "Quantity", "Remarks", "Logged By"]}
          message="Job data source is not connected yet."
        />
      </section>

      {/* Transfer Activity */}
      <section className="space-y-4">
        <SectionTitle
          title="Transfer Activity"
          description="Transfer statistics are separate from incoming and outgoing office files."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Transfers" value="Unavailable" />
          <MetricCard label="Received" value="Unavailable" color="green" />
          <MetricCard label="Sent" value="Unavailable" color="purple" />
          <MetricCard label="Pages Transferred" value="Unavailable" color="amber" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart
            title="Transfer Distribution"
            items={[
              {
                label: "Received",
                value: 0,
                color: "bg-green-500",
              },
              {
                label: "Sent",
                value: 0,
                color: "bg-blue-500",
              },
            ]}
          />

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="mb-4 font-semibold text-[#092c45]">
              Transfer Summary
            </h4>

            <div className="space-y-3 text-sm">
              <p className="flex justify-between">
                <span>Total transfers</span>
                <strong>Unavailable</strong>
              </p>
              <p className="flex justify-between">
                <span>Received</span>
                <strong>Unavailable</strong>
              </p>
              <p className="flex justify-between">
                <span>Sent</span>
                <strong>Unavailable</strong>
              </p>
              <p className="flex justify-between">
                <span>Pages received</span>
                <strong>Unavailable</strong>
              </p>
              <p className="flex justify-between">
                <span>Pages sent</span>
                <strong>Unavailable</strong>
              </p>
            </div>
          </div>
        </div>

        <EmptyTable
          headers={[
            "#",
            "Employee",
            "Pages",
            "Institution",
            "Direction",
            "Date",
          ]}
          message="Transfer data source is not connected yet."
        />
      </section>

      {/* Letter Activity */}
      <section className="space-y-4">
        <SectionTitle
          title="Letter Activity"
          description="Letter statistics require letter records from a connected backend source."
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Total Letters" value="Unavailable" />
          <MetricCard label="Incoming" value="Unavailable" color="green" />
          <MetricCard label="Outgoing" value="Unavailable" color="blue" />
          <MetricCard label="Email" value="Unavailable" color="purple" />
          <MetricCard label="Hand Delivered" value="Unavailable" color="amber" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart
            title="Letter Distribution"
            items={[
              {
                label: "Incoming email",
                value: 0,
                color: "bg-blue-500",
              },
              {
                label: "Incoming hand-delivered",
                value: 0,
                color: "bg-cyan-500",
              },
              {
                label: "Outgoing email",
                value: 0,
                color: "bg-violet-500",
              },
              {
                label: "Outgoing hand-delivered",
                value: 0,
                color: "bg-amber-500",
              },
            ]}
          />

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="mb-4 font-semibold text-[#092c45]">
              Letter Summary
            </h4>

            <div className="space-y-3 text-sm">
              <p className="flex justify-between">
                <span>Total letters</span>
                <strong>Unavailable</strong>
              </p>
              <p className="flex justify-between">
                <span>Incoming</span>
                <strong>Unavailable</strong>
              </p>
              <p className="flex justify-between">
                <span>Outgoing</span>
                <strong>Unavailable</strong>
              </p>
              <p className="flex justify-between">
                <span>Email</span>
                <strong>Unavailable</strong>
              </p>
              <p className="flex justify-between">
                <span>Hand delivered</span>
                <strong>Unavailable</strong>
              </p>
            </div>
          </div>
        </div>

        <EmptyTable
          headers={[
            "#",
            "Type",
            "Number",
            "Date",
            "Quantity",
            "Department",
            "Delivery",
            "Contact",
          ]}
          message="Letter data source is not connected yet."
        />
      </section>
    </div>
  );
}
