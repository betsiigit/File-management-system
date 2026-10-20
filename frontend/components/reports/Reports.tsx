
"use client";

import { useMemo, useState } from "react";
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
                style={{ width: `${(item.value / max) * 100}%` }}
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
  message = "Generate report to see data.",
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

export default function Reports({ employees, files }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");
  const [dateError, setDateError] = useState("");

  const report = useMemo(() => {
    const active = employees.filter((e) => e.status === "Active");
    const inactive = employees.filter((e) => e.status === "Inactive");

    const filteredFiles = files.filter((file) => {
      // Only filter dates when the stored file date is YYYY-MM-DD.
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
      pending: filteredFiles.filter((f) => f.status === "Pending").length,
      approved: filteredFiles.filter((f) => f.status === "Approved").length,
      archived: filteredFiles.filter((f) => f.status === "Archived").length,
      incoming: filteredFiles.filter((f) => f.fileType === "Incoming").length,
      outgoing: filteredFiles.filter((f) => f.fileType === "Outgoing").length,
      totalPages: filteredFiles.reduce((sum, f) => sum + (f.pages ?? 0), 0),
    };
  }, [employees, files, appliedFrom, appliedTo, refreshKey]);

  function generateReport() {
    if (fromDate && toDate && fromDate > toDate) {
      setDateError("The From date must be before or equal to the To date.");
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

  return (
    <div className="space-y-8">
      {/* Header and report controls */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#092c45]">
            Reports &amp; Analytics
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Office activity, employee statistics, files, jobs, transfers, and letters.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="rounded-lg bg-[#092c45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#124766]"
        >
          Print
        </button>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 font-semibold text-[#092c45]">
          Report Filters
        </h3>
        <p className="mb-4 text-sm text-slate-500">
          Select a date range. These date inputs currently use the browser's
          Gregorian date format; Ethiopian calendar conversion can be connected separately.
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm font-medium text-slate-700">
            From
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-slate-300 p-2.5"
            />
          </label>

          <label className="text-sm font-medium text-slate-700">
            To
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-slate-300 p-2.5"
            />
          </label>

          <button
            onClick={generateReport}
            className="self-end rounded-lg bg-[#092c45] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#124766]"
          >
            Generate
          </button>

          <div className="flex gap-2 self-end">
            <button
              onClick={resetReport}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              Reset
            </button>
            <button
              onClick={() => setRefreshKey((key) => key + 1)}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {dateError && (
          <p className="mt-3 text-sm text-red-600">{dateError}</p>
        )}
      </section>

      {/* User Activity Report */}
      <section className="space-y-4">
        <SectionTitle
          title="User Activity Report"
          description="User activity summary with rankings."
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
          Activity rankings require user activity logs. These are not currently
          available in the connected data.
        </p>
      </section>

      {/* Gender Distribution */}
      <section className="space-y-4">
        <SectionTitle title="Gender Distribution" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Active Male" value={0} color="blue" />
          <MetricCard label="Active Female" value={0} color="purple" />
          <MetricCard label="Inactive Male" value={0} color="amber" />
          <MetricCard label="Inactive Female" value={0} color="red" />
          <MetricCard label="Unknown Gender" value={employees.length} />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart
            title="Active Employees by Gender"
            items={[
              { label: "Male", value: 0, color: "bg-blue-500" },
              { label: "Female", value: 0, color: "bg-purple-500" },
              { label: "Unknown", value: report.active.length, color: "bg-slate-400" },
            ]}
          />
          <BarChart
            title="Inactive Employees by Gender"
            items={[
              { label: "Male", value: 0, color: "bg-blue-500" },
              { label: "Female", value: 0, color: "bg-purple-500" },
              { label: "Unknown", value: report.inactive.length, color: "bg-slate-400" },
            ]}
          />
        </div>
        <p className="text-xs text-slate-500">
          Gender is not part of the current Employee type. Unknown counts
          represent employees whose gender has not been recorded in this model.
        </p>
      </section>

      {/* Inactive Employees by Reason */}
      <section className="space-y-4">
        <SectionTitle title="Inactive Employees by Reason" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Retired" value={0} color="blue" />
          <MetricCard label="Resigned" value={0} color="amber" />
          <MetricCard label="Deceased" value={0} color="red" />
          <MetricCard label="Transferred" value={0} color="purple" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart
            title="Inactive Reasons Distribution"
            items={[
              { label: "Retired", value: 0, color: "bg-blue-500" },
              { label: "Resigned", value: 0, color: "bg-amber-500" },
              { label: "Deceased", value: 0, color: "bg-red-500" },
              { label: "Transferred", value: 0, color: "bg-purple-500" },
            ]}
          />
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="mb-4 font-semibold text-[#092c45]">
              Inactive Summary
            </h4>
            <div className="space-y-3 text-sm">
              <p className="flex justify-between"><span>Retired</span><strong>0</strong></p>
              <p className="flex justify-between"><span>Resigned</span><strong>0</strong></p>
              <p className="flex justify-between"><span>Deceased</span><strong>0</strong></p>
              <p className="flex justify-between"><span>Transferred</span><strong>0</strong></p>
              <p className="flex justify-between border-t pt-3"><span>Total inactive employees</span><strong>{report.inactive.length}</strong></p>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              Inactive reasons require a reason field in employee records.
            </p>
          </div>
        </div>
      </section>

      {/* File Activity */}
      <section className="space-y-4">
        <SectionTitle title="File Activity" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Total Files" value={report.files.length} />
          <MetricCard label="Income" value={report.incoming} color="green" />
          <MetricCard label="Expense" value={report.outgoing} color="red" />
          <MetricCard label="Returned" value={0} color="amber" />
          <MetricCard label="Taken" value={0} color="purple" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart
            title="File Activity Chart"
            items={[
              { label: "Income", value: report.incoming, color: "bg-green-500" },
              { label: "Expense", value: report.outgoing, color: "bg-red-500" },
              { label: "Returned", value: 0, color: "bg-amber-500" },
              { label: "Taken", value: 0, color: "bg-purple-500" },
            ]}
          />
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="mb-4 font-semibold text-[#092c45]">File Summary</h4>
            <div className="space-y-3 text-sm">
              <p className="flex justify-between"><span>Total Files</span><strong>{report.files.length}</strong></p>
              <p className="flex justify-between"><span>Income</span><strong>{report.incoming}</strong></p>
              <p className="flex justify-between"><span>Expense</span><strong>{report.outgoing}</strong></p>
              <p className="flex justify-between"><span>Returned</span><strong>0</strong></p>
              <p className="flex justify-between"><span>Taken</span><strong>0</strong></p>
              <p className="flex justify-between border-t pt-3"><span>Recorded pages</span><strong>{report.totalPages}</strong></p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                {["#", "Employee", "Page", "Date", "Type", "Taken By", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.files.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-500">Generate report to see data.</td></tr>
              ) : report.files.map((file, index) => (
                <tr key={file.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{file.assignedOfficer || "—"}</td>
                  <td className="px-4 py-3">{file.pages ?? 0}</td>
                  <td className="px-4 py-3">{file.date}</td>
                  <td className="px-4 py-3">{file.fileType || "—"}</td>
                  <td className="px-4 py-3">—</td>
                  <td className="px-4 py-3">{file.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Job Activity */}
      <section className="space-y-4">
        <SectionTitle title="Job Activity" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Total Jobs" value={0} />
          <MetricCard label="Total Qty" value={0} color="green" />
          <MetricCard label="Avg per Job" value={0} color="purple" />
          <MetricCard label="Unique Dates" value={0} color="amber" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart
            title="Job Quantity Trend"
            items={[{ label: "No job data", value: 0, color: "bg-blue-500" }]}
          />
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="mb-4 font-semibold text-[#092c45]">Job Summary</h4>
            <div className="space-y-3 text-sm">
              <p className="flex justify-between"><span>Total Jobs</span><strong>0</strong></p>
              <p className="flex justify-between"><span>Total Qty</span><strong>0</strong></p>
              <p className="flex justify-between"><span>Avg per Job</span><strong>0</strong></p>
              <p className="flex justify-between"><span>Unique Dates</span><strong>0</strong></p>
            </div>
          </div>
        </div>
        <EmptyTable headers={["#", "Date (Eth)", "Quantity", "Remarks", "Logged By"]} />
      </section>

      {/* Transfer Activity */}
      <section className="space-y-4">
        <SectionTitle title="Transfer Activity" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Received" value={0} color="green" />
          <MetricCard label="Sent" value={0} color="blue" />
          <MetricCard label="Pages Received" value={0} color="purple" />
          <MetricCard label="Pages Sent" value={0} color="amber" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart
            title="Transfer Distribution"
            items={[
              { label: "Received", value: 0, color: "bg-green-500" },
              { label: "Sent", value: 0, color: "bg-blue-500" },
            ]}
          />
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="mb-4 font-semibold text-[#092c45]">Transfer Summary</h4>
            <p className="mb-3 text-sm">Total: <strong>0</strong></p>
            <p className="mb-3 text-sm">Received: <strong>0 (0%)</strong></p>
            <p className="text-sm">Sent: <strong>0 (0%)</strong></p>
            <hr className="my-4" />
            <p className="mb-3 text-sm">Pages Received: <strong>0</strong></p>
            <p className="text-sm">Pages Sent: <strong>0</strong></p>
          </div>
        </div>
        <EmptyTable headers={["#", "Employee", "Pages", "Institution", "Direction", "Date"]} />
      </section>

      {/* Letter Activity */}
      <section className="space-y-4">
        <SectionTitle title="Letter Activity" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <MetricCard label="Total Letters" value={0} />
          <MetricCard label="Incoming" value={0} color="green" />
          <MetricCard label="Outgoing" value={0} color="blue" />
          <MetricCard label="Email" value={0} color="purple" />
          <MetricCard label="Hand" value={0} color="amber" />
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <BarChart
            title="Letter Distribution"
            items={[
              { label: "Incoming Email", value: 0, color: "bg-blue-500" },
              { label: "Incoming Hand", value: 0, color: "bg-cyan-500" },
              { label: "Outgoing Email", value: 0, color: "bg-violet-500" },
              { label: "Outgoing Hand", value: 0, color: "bg-amber-500" },
            ]}
          />
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h4 className="mb-4 font-semibold text-[#092c45]">Letter Summary</h4>
            <div className="space-y-3 text-sm">
              <p className="flex justify-between"><span>Total Letters</span><strong>0</strong></p>
              <p className="flex justify-between"><span>Incoming</span><strong>0</strong></p>
              <p className="flex justify-between"><span>Outgoing</span><strong>0</strong></p>
              <p className="flex justify-between"><span>Email</span><strong>0</strong></p>
              <p className="flex justify-between"><span>Hand</span><strong>0</strong></p>
            </div>
            <hr className="my-4" />
            <div className="space-y-3 text-sm">
              <p className="flex justify-between"><span>Incoming Email</span><strong>0</strong></p>
              <p className="flex justify-between"><span>Incoming Hand</span><strong>0</strong></p>
              <p className="flex justify-between"><span>Outgoing Email</span><strong>0</strong></p>
              <p className="flex justify-between"><span>Outgoing Hand</span><strong>0</strong></p>
            </div>
          </div>
        </div>
        <EmptyTable
          headers={["#", "Type", "Number", "Date", "Qty", "Department", "Delivery", "Contact"]}
        />
      </section>
    </div>
  );
}
