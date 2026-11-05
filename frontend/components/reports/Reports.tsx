
"use client";

import { useEffect, useMemo, useState } from "react";
import type { Employee } from "@/components/employees/EmployeeTable";
import { toGC, toEC } from "kenat";
import EthiopianDatePicker from "@/components/reports/EthiopianDatePicker";

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

type DepartmentStructure = {
  label: string;
  departments: Record<
    string,
    {
      label: string;
      workProcesses: Record<string, string>;
    }
  >;
};

type Props = {
  employees: Employee[];
  files: ReportFile[];
  departmentStructure: Record<string, DepartmentStructure>;
};

type ReportType =
  | "Complete"
  | "Files"
  | "Employees"
  | "Jobs"
  | "Transfers"
  | "Letters";

const emptySummary: ReportSummary = {
  totalFiles: 0,
  incomingFiles: 0,
  outgoingFiles: 0,
  pendingFiles: 0,
  approvedFiles: 0,
  archivedFiles: 0,
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

function formatReportDate(date: string) {
  if (!date) return "Not specified";

  const parts = date.slice(0, 10).split("-").map(Number);

  if (
    parts.length !== 3 ||
    parts.some((part) => !Number.isInteger(part) || part <= 0)
  ) {
    return date;
  }

  try {
    const ethiopian = toEC(parts[0], parts[1], parts[2]);

    return [
      ethiopian.year,
      String(ethiopian.month).padStart(2, "0"),
      String(ethiopian.day).padStart(2, "0"),
    ].join("/");
  } catch {
    return date;
  }
}

function convertEthiopianToGregorian(date: string): string {
  const parts = date.split("/").map(Number);

  if (
    parts.length !== 3 ||
    parts.some((part) => !Number.isInteger(part) || part <= 0)
  ) {
    throw new Error("Invalid Ethiopian date.");
  }

  const [year, month, day] = parts;
  const gregorian = toGC(year, month, day);

  return [
    gregorian.year,
    String(gregorian.month).padStart(2, "0"),
    String(gregorian.day).padStart(2, "0"),
  ].join("-");
}

export default function Reports({
  employees,
  files,
  departmentStructure,
}: Props) {
  const [refreshKey, setRefreshKey] = useState(0);

  const [reportType, setReportType] =
    useState<ReportType>("Complete");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [appliedFrom, setAppliedFrom] = useState("");
  const [appliedTo, setAppliedTo] = useState("");

  const [appliedFromEth, setAppliedFromEth] = useState("");
  const [appliedToEth, setAppliedToEth] = useState("");

  const [dateError, setDateError] = useState("");

  // Cascading Sector -> Department -> Work Process filters.
  const [selectedSector, setSelectedSector] = useState("All");
  const [selectedDepartment, setSelectedDepartment] =
    useState("All");
  const [selectedWorkProcess, setSelectedWorkProcess] =
    useState("All");

  const [summary, setSummary] =
    useState<ReportSummary>(emptySummary);

  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [generatedDate, setGeneratedDate] = useState("");

  const isReportVisible = (type: ReportType) =>
    reportType === "Complete" || reportType === type;

  // Map department and work-process codes to their sector.
  const sectorByDepartmentCode = useMemo(() => {
    const mapping = new Map<string, string>();

    Object.entries(departmentStructure).forEach(
      ([sectorCode, sector]) => {
        mapping.set(sectorCode, sectorCode);

        Object.entries(sector.departments).forEach(
          ([departmentCode, department]) => {
            mapping.set(departmentCode, sectorCode);

            Object.keys(department.workProcesses).forEach(
              (workProcessCode) => {
                mapping.set(workProcessCode, sectorCode);
              }
            );
          }
        );
      }
    );

    return mapping;
  }, [departmentStructure]);

  // Map work-process codes to their parent department.
  const departmentByWorkProcessCode = useMemo(() => {
    const mapping = new Map<string, string>();

    Object.values(departmentStructure).forEach((sector) => {
      Object.entries(sector.departments).forEach(
        ([departmentCode, department]) => {
          Object.keys(department.workProcesses).forEach(
            (workProcessCode) => {
              mapping.set(workProcessCode, departmentCode);
            }
          );
        }
      );
    });

    return mapping;
  }, [departmentStructure]);

  const selectedSectorLabel =
    selectedSector === "All"
      ? "All Sectors"
      : departmentStructure[selectedSector]?.label ??
        selectedSector;

  // Departments belonging to the selected sector.
  const departmentOptions = useMemo(() => {
    return Object.entries(departmentStructure).flatMap(
      ([sectorCode, sector]) => {
        if (
          selectedSector !== "All" &&
          selectedSector !== sectorCode
        ) {
          return [];
        }

        return Object.entries(sector.departments).map(
          ([code, department]) => ({
            code,
            label: department.label,
          })
        );
      }
    );
  }, [departmentStructure, selectedSector]);

  // Work processes belonging to the selected department.
  const workProcessOptions = useMemo(() => {
    if (selectedDepartment === "All") return [];

    for (const sector of Object.values(departmentStructure)) {
      const department =
        sector.departments[selectedDepartment];

      if (department) {
        return Object.entries(department.workProcesses).map(
          ([code, label]) => ({
            code,
            label,
          })
        );
      }
    }

    return [];
  }, [departmentStructure, selectedDepartment]);

  useEffect(() => {
    const today = new Date();

    setGeneratedDate(
      formatReportDate(
        [
          today.getFullYear(),
          String(today.getMonth() + 1).padStart(2, "0"),
          String(today.getDate()).padStart(2, "0"),
        ].join("-")
      )
    );
  }, []);

  // Load backend file summary.
  // Backend credentials keep branch users restricted to their branch.
  useEffect(() => {
    let cancelled = false;

    async function loadSummary() {
      setSummaryLoading(true);
      setSummaryError("");

      try {
        const params = new URLSearchParams();

        if (appliedFrom) {
          params.set("startDate", appliedFrom);
        }

        if (appliedTo) {
          params.set("endDate", appliedTo);
        }

        if (selectedSector !== "All") {
          params.set("sector", selectedSector);
        }

        const query = params.toString();

        const url = `http://localhost:8081/api/reports/summary${
          query ? `?${query}` : ""
        }`;

        const response = await fetch(url, {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error(
            `Failed to load report (${response.status})`
          );
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
  }, [appliedFrom, appliedTo, selectedSector, refreshKey]);

  // Calculate branch-loaded employee and file information.
  const report = useMemo(() => {
    const active = employees.filter(
      (employee) => employee.status === "Active"
    );

    const inactive = employees.filter(
      (employee) => employee.status === "Inactive"
    );

    const filteredFiles = files.filter((file) => {
      const departmentCode =
        file.department?.trim() ?? "";

      const fileSector =
        sectorByDepartmentCode.get(departmentCode) ?? "";

      if (
        selectedSector !== "All" &&
        fileSector !== selectedSector
      ) {
        return false;
      }

      const fileDepartment =
        departmentByWorkProcessCode.get(departmentCode) ??
        (departmentStructure[selectedSector]?.departments[
          departmentCode
        ]
          ? departmentCode
          : "");

      if (
        selectedDepartment !== "All" &&
        fileDepartment !== selectedDepartment
      ) {
        return false;
      }

      if (
        selectedWorkProcess !== "All" &&
        departmentCode !== selectedWorkProcess
      ) {
        return false;
      }

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
  }, [
    employees,
    files,
    appliedFrom,
    appliedTo,
    selectedSector,
    selectedDepartment,
    selectedWorkProcess,
    sectorByDepartmentCode,
    departmentByWorkProcessCode,
    departmentStructure,
  ]);


 // Use filtered file records whenever a sector,
// department, or work process is selected.
const displaySummary = useMemo<ReportSummary>(() => {
  const useBackendSummary =
    selectedSector === "All" &&
    selectedDepartment === "All" &&
    selectedWorkProcess === "All";

  if (useBackendSummary && !summaryError) {
    return summary;
  }

  return {
    totalFiles: report.files.length,
    incomingFiles: report.incoming,
    outgoingFiles: report.outgoing,
    pendingFiles: report.pending,
    approvedFiles: report.approved,
    archivedFiles: report.archived,
  };
}, [
  summary,
  summaryError,
  selectedSector,
  selectedDepartment,
  selectedWorkProcess,
  report,
]);
  // Employee gender statistics.
  const genderStats = useMemo(() => {
    const countGender = (
      list: Employee[],
      gender: "Male" | "Female" | "Other"
    ) =>
      list.filter(
        (employee) =>
          employee.gender?.trim().toLowerCase() ===
          gender.toLowerCase()
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

  // Inactive employee reasons.
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

  const otherInactiveReasons =
    report.inactive.length -
    inactiveReasonStats.retired -
    inactiveReasonStats.resigned -
    inactiveReasonStats.deceased -
    inactiveReasonStats.transferred;

  function generateReport() {
    if (Boolean(fromDate) !== Boolean(toDate)) {
      setDateError(
        "Please select both a From date and a To date, or clear both dates."
      );
      return;
    }

    try {
      const gregorianFrom = fromDate
        ? convertEthiopianToGregorian(fromDate)
        : "";

      const gregorianTo = toDate
        ? convertEthiopianToGregorian(toDate)
        : "";

      if (
        gregorianFrom &&
        gregorianTo &&
        gregorianFrom > gregorianTo
      ) {
        setDateError(
          "The From date must be before or equal to the To date."
        );
        return;
      }

      setDateError("");

      setAppliedFrom(gregorianFrom);
      setAppliedTo(gregorianTo);

      setAppliedFromEth(fromDate);
      setAppliedToEth(toDate);
    } catch {
      setDateError(
        "Please select valid Ethiopian calendar dates."
      );
    }
  }

  function resetReport() {
    setFromDate("");
    setToDate("");

    setAppliedFrom("");
    setAppliedTo("");

    setAppliedFromEth("");
    setAppliedToEth("");

    setSelectedSector("All");
    setSelectedDepartment("All");
    setSelectedWorkProcess("All");

    setReportType("Complete");
    setDateError("");
  }

  function refreshReport() {
    setRefreshKey((key) => key + 1);
  }

  // Export only the selected report sections.
  async function exportToExcel() {
    try {
      const XLSX = await import("xlsx");

      const workbook = XLSX.utils.book_new();

      const includeComplete = reportType === "Complete";
      const includeFiles =
        includeComplete || reportType === "Files";
      const includeEmployees =
        includeComplete || reportType === "Employees";
      const includeJobs =
        includeComplete || reportType === "Jobs";
      const includeTransfers =
        includeComplete || reportType === "Transfers";
      const includeLetters =
        includeComplete || reportType === "Letters";

      const reportTitle = includeComplete
        ? "Complete Management Report"
        : `${reportType} Report`;

      // Report information.
      const reportInfo = [
        ["ETHIOPIAN CUSTOMS COMMISSION"],
        [reportTitle],
        [],
        ["Report Information", "Value"],
        ["Sector", selectedSectorLabel],
        [
          "Department",
          selectedDepartment === "All"
            ? "All Departments"
            : departmentOptions.find(
                (item) => item.code === selectedDepartment
              )?.label ?? selectedDepartment,
        ],
        [
          "Work Process",
          selectedWorkProcess === "All"
            ? "All Work Processes"
            : workProcessOptions.find(
                (item) => item.code === selectedWorkProcess
              )?.label ?? selectedWorkProcess,
        ],
        ["From Date (Ethiopian)", appliedFromEth || "All dates"],
        ["To Date (Ethiopian)", appliedToEth || "All dates"],
        ["Generated On (Ethiopian)", generatedDate],
      ];

      if (includeFiles) {
        reportInfo.push(
          [],
          ["File Statistics", "Count"],
         ["Total Files", String(report.files.length)],
          ["Incoming Files", String(report.incoming)],
          ["Outgoing Files", String(report.outgoing)],
          ["Pending Files", String(report.pending)],
          ["Approved Files", String(report.approved)],
          ["Archived Files", String(report.archived)],
          ["Total Recorded Pages", String(report.totalPages)]
        );
      }

      if (includeEmployees) {
        reportInfo.push(
          [],
          ["Employee Statistics", "Count"],
          ["Total Employees", String(employees.length)],
          ["Active Employees", String(report.active.length)],
          ["Inactive Employees", String(report.inactive.length)]
        );
      }

      const infoSheet = XLSX.utils.aoa_to_sheet(reportInfo);

      infoSheet["!cols"] = [
        { wch: 35 },
        { wch: 40 },
      ];

      XLSX.utils.book_append_sheet(
        workbook,
        infoSheet,
        "Report Information"
      );

      // FILE ACTIVITY AND FILE REGISTER.
      if (includeFiles) {
        const activityRows = [
          ["FILE ACTIVITY SUMMARY"],
          [],
          ["Category", "Count"],
          ["Total Files", report.files.length],
          ["Incoming", report.incoming],
          ["Outgoing", report.outgoing],
          ["Pending", report.pending],
          ["Approved", report.approved],
          ["Archived", report.archived],
          ["Total Recorded Pages", report.totalPages],
        ];

        const activitySheet =
          XLSX.utils.aoa_to_sheet(activityRows);

        XLSX.utils.book_append_sheet(
          workbook,
          activitySheet,
          "File Activity"
        );

        const fileRows = report.files.map(
          (file, index) => ({
            No: index + 1,
            Reference: file.reference || "",
            Title: file.title || "",
            Sector:
              departmentStructure[
                sectorByDepartmentCode.get(
                  file.department?.trim() ?? ""
                ) ?? ""
              ]?.label ?? "",
            Department: file.department || "",
            AssignedOfficer: file.assignedOfficer || "",
            Pages: file.pages ?? 0,
            RegistrationDateEthiopian:
              formatReportDate(file.date),
            FileType: file.fileType || "",
            Status: file.status || "",
          })
        );

        const fileSheet =
          XLSX.utils.json_to_sheet(fileRows);

        fileSheet["!cols"] = [
          { wch: 8 },
          { wch: 20 },
          { wch: 35 },
          { wch: 30 },
          { wch: 20 },
          { wch: 25 },
          { wch: 10 },
          { wch: 24 },
          { wch: 15 },
          { wch: 15 },
        ];

        XLSX.utils.book_append_sheet(
          workbook,
          fileSheet,
          "File Register"
        );
      }

      // EMPLOYEE REPORT.
      if (includeEmployees) {
        const employeeRows = employees.map(
          (employee, index) => ({
            No: index + 1,
            Employee: employee.fullName || "",
            Gender: employee.gender || "",
            Status: employee.status || "",
            InactiveReason: employee.inactiveReason || "",
          })
        );

        const employeeSheet =
          XLSX.utils.json_to_sheet(employeeRows);

        XLSX.utils.book_append_sheet(
          workbook,
          employeeSheet,
          "Employees"
        );

        const genderRows = [
          ["Employee Category", "Male", "Female", "Other", "Not Recorded", "Total"],
          [
            "Active",
            genderStats.activeMale,
            genderStats.activeFemale,
            genderStats.activeOther,
            report.active.length -
              genderStats.activeMale -
              genderStats.activeFemale -
              genderStats.activeOther,
            report.active.length,
          ],
          [
            "Inactive",
            genderStats.inactiveMale,
            genderStats.inactiveFemale,
            genderStats.inactiveOther,
            report.inactive.length -
              genderStats.inactiveMale -
              genderStats.inactiveFemale -
              genderStats.inactiveOther,
            report.inactive.length,
          ],
        ];

        XLSX.utils.book_append_sheet(
          workbook,
          XLSX.utils.aoa_to_sheet(genderRows),
          "Gender Statistics"
        );

        const reasonRows = [
          ["Inactive Reason", "Number of Employees"],
          ["Retired", inactiveReasonStats.retired],
          ["Resigned", inactiveReasonStats.resigned],
          ["Deceased", inactiveReasonStats.deceased],
          ["Transferred", inactiveReasonStats.transferred],
          ["Other / Not Recorded", otherInactiveReasons],
        ];

        XLSX.utils.book_append_sheet(
          workbook,
          XLSX.utils.aoa_to_sheet(reasonRows),
          "Inactive Reasons"
        );
      }

      // JOB REPORT.
      if (includeJobs) {
        const jobRows = [
          ["Job Activity"],
          ["Data", "Status"],
          ["Job records", "Not connected yet"],
          ["Total quantity", "Unavailable"],
        ];

        XLSX.utils.book_append_sheet(
          workbook,
          XLSX.utils.aoa_to_sheet(jobRows),
          "Job Activity"
        );
      }

      // TRANSFER REPORT.
      if (includeTransfers) {
        const transferRows = [
          ["Transfer Activity"],
          ["Data", "Status"],
          ["Total transfers", "Not connected yet"],
          ["Received", "Unavailable"],
          ["Sent", "Unavailable"],
          ["Pages transferred", "Unavailable"],
        ];

        XLSX.utils.book_append_sheet(
          workbook,
          XLSX.utils.aoa_to_sheet(transferRows),
          "Transfer Activity"
        );
      }

      // LETTER REPORT.
      if (includeLetters) {
        const letterRows = [
          ["Letter Activity"],
          ["Data", "Status"],
          ["Total letters", "Not connected yet"],
          ["Incoming", "Unavailable"],
          ["Outgoing", "Unavailable"],
          ["Email", "Unavailable"],
          ["Hand Delivered", "Unavailable"],
        ];

        XLSX.utils.book_append_sheet(
          workbook,
          XLSX.utils.aoa_to_sheet(letterRows),
          "Letter Activity"
        );
      }

      const fileName =
        `ECC_${reportType}_Report_${generatedDate.replaceAll("/", "-")}.xlsx`;

      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Excel export failed:", error);

      window.alert(
        "Could not export the Excel report. Please try again."
      );
    }
  }

  function handlePrint() {
    const needsFileSummary =
      reportType === "Complete" || reportType === "Files";

    if (needsFileSummary && summaryLoading) return;

    if (needsFileSummary && summaryError) {
      const confirmed = window.confirm(
        "The file summary could not be loaded. The report may contain incomplete file statistics. Do you want to continue?"
      );

      if (!confirmed) return;
    }

    window.print();
  }

  return (
    <>
      <style jsx global>{`
        .report-print-area {
          display: none;
        }

        @page {
          size: A4 landscape;
          margin: 12mm;
        }

        @media print {
          html,
          body {
            background: #ffffff !important;
            color: #111827 !important;
            print-color-adjust: exact !important;
            -webkit-print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          .report-print-area,
          .report-print-area * {
            visibility: visible !important;
          }

          .report-print-area {
            display: block !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: white !important;
            color: #111827 !important;
            font-family: Arial, Helvetica, sans-serif !important;
            font-size: 10px !important;
          }

          .no-print {
            display: none !important;
          }

          .print-header {
            display: grid !important;
            grid-template-columns: 75px 1fr 100px !important;
            align-items: center !important;
            gap: 15px !important;
            margin-bottom: 12px !important;
          }

          .report-logo {
            width: 65px !important;
            height: 65px !important;
            object-fit: contain !important;
          }

          .print-heading {
            text-align: center !important;
          }

          .print-heading h1 {
            margin: 0 0 5px !important;
            color: #092c45 !important;
            font-size: 19px !important;
            font-weight: 800 !important;
          }

          .print-heading h2 {
            margin: 0 0 5px !important;
            color: #092c45 !important;
            font-size: 13px !important;
            font-weight: 700 !important;
          }

          .print-heading p {
            margin: 0 !important;
            font-size: 10px !important;
            font-weight: 700 !important;
            letter-spacing: 2px !important;
          }

          .print-document-label {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 5px !important;
            border: 1px solid #092c45 !important;
            padding: 10px 5px !important;
            color: #092c45 !important;
            text-align: center !important;
          }

          .print-document-label strong {
            font-size: 14px !important;
          }

          .print-document-label span {
            font-size: 8px !important;
          }

          .print-divider {
            height: 3px !important;
            margin: 10px 0 15px !important;
            background: #092c45 !important;
          }

          .print-information {
            display: grid !important;
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 10px 20px !important;
            margin-bottom: 20px !important;
            padding: 12px !important;
            border: 1px solid #cbd5e1 !important;
            background: #f8fafc !important;
          }

          .print-information div {
            display: flex !important;
            flex-direction: column !important;
            gap: 4px !important;
          }

          .print-information span {
            color: #64748b !important;
            font-size: 8px !important;
            text-transform: uppercase !important;
          }

          .print-information strong {
            color: #092c45 !important;
            font-size: 10px !important;
          }

          .print-section {
            margin-bottom: 20px !important;
            page-break-inside: auto !important;
          }

          .print-section h2 {
            margin: 0 0 9px !important;
            padding: 7px 9px !important;
            border-left: 4px solid #092c45 !important;
            background: #edf2f7 !important;
            color: #092c45 !important;
            font-size: 11px !important;
            font-weight: 800 !important;
            page-break-after: avoid !important;
          }

          .print-table {
            width: 100% !important;
            border-collapse: collapse !important;
            table-layout: auto !important;
            font-size: 9px !important;
          }

          .print-table th,
          .print-table td {
            border: 1px solid #cbd5e1 !important;
            padding: 6px 7px !important;
            text-align: left !important;
            vertical-align: top !important;
            overflow-wrap: anywhere !important;
          }

          .print-table th {
            background: #e8eef4 !important;
            color: #092c45 !important;
            font-weight: 700 !important;
          }

          .print-table thead {
            display: table-header-group !important;
          }

          .print-table tr {
            page-break-inside: avoid !important;
          }

          .print-total-row td {
            background: #f1f5f9 !important;
            font-weight: 800 !important;
          }

          .print-warning {
            margin-top: 8px !important;
            color: #991b1b !important;
            font-weight: 700 !important;
          }

          .print-signatures {
            display: grid !important;
            grid-template-columns: 1fr 1fr 1fr !important;
            gap: 35px !important;
            margin-top: 35px !important;
            page-break-inside: avoid !important;
          }

          .print-signature {
            padding-top: 25px !important;
            border-top: 1px solid #334155 !important;
            text-align: center !important;
          }

          .print-signature strong {
            display: block !important;
            margin-bottom: 5px !important;
            color: #092c45 !important;
            font-size: 10px !important;
          }

          .print-signature span {
            font-size: 9px !important;
          }

          .print-footer {
            margin-top: 20px !important;
            padding-top: 8px !important;
            border-top: 1px solid #cbd5e1 !important;
            color: #64748b !important;
            font-size: 8px !important;
            text-align: center !important;
          }
        }
      `}</style>

      {/* REPORT DASHBOARD */}
      <div className="reports-screen space-y-8">

        {/* Page header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#092c45]">
              Reports &amp; Analytics
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Office activity, employee statistics, files, jobs,
              transfers, and letters.
            </p>
          </div>
        </div>

        {/* Export and print buttons - only one print button */}
        <div className="no-print flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportToExcel}
            className="rounded-lg border border-[#4B8B45] px-4 py-2 text-sm font-semibold text-[#4B8B45] hover:bg-green-50"
          >
            Export Excel
          </button>

          <button
            type="button"
            onClick={handlePrint}
            disabled={
              summaryLoading &&
              (reportType === "Complete" ||
                reportType === "Files")
            }
            className="rounded-lg bg-[#0A506E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#124766] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {summaryLoading &&
            (reportType === "Complete" ||
              reportType === "Files")
              ? "Loading report..."
              : "Print Official Report"}
          </button>
        </div>

        {/* Report filters */}
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 font-semibold text-[#092c45]">
            Report Filters
          </h3>

          <p className="mb-4 text-sm text-slate-500">
            Choose an Ethiopian date range, sector, department,
            and work process to filter the reports.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">

            <label className="text-sm font-medium text-slate-700">
              Report Type

              <select
                value={reportType}
                onChange={(event) =>
                  setReportType(
                    event.target.value as ReportType
                  )
                }
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-2.5"
              >
                <option value="Complete">Complete Report</option>
                <option value="Files">File Report</option>
                <option value="Employees">Employee Report</option>
                <option value="Jobs">Job Report</option>
                <option value="Transfers">Transfer Report</option>
                <option value="Letters">Letter Report</option>
              </select>
            </label>

            <EthiopianDatePicker
              label="From"
              value={fromDate}
              onChange={setFromDate}
            />

            <EthiopianDatePicker
              label="To"
              value={toDate}
              onChange={setToDate}
            />

            {/* Sector */}
            <label className="text-sm font-medium text-slate-700">
              Sector

              <select
                value={selectedSector}
                onChange={(event) => {
                  setSelectedSector(event.target.value);
                  setSelectedDepartment("All");
                  setSelectedWorkProcess("All");
                }}
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-2.5"
              >
                <option value="All">All Sectors</option>

                {Object.entries(departmentStructure).map(
                  ([sectorCode, sector]) => (
                    <option
                      key={sectorCode}
                      value={sectorCode}
                    >
                      {sector.label}
                    </option>
                  )
                )}
              </select>
            </label>

            {/* Department */}
            <label className="text-sm font-medium text-slate-700">
              Department

              <select
                value={selectedDepartment}
                onChange={(event) => {
                  setSelectedDepartment(event.target.value);
                  setSelectedWorkProcess("All");
                }}
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-2.5"
              >
                <option value="All">All Departments</option>

                {departmentOptions.map((department) => (
                  <option
                    key={department.code}
                    value={department.code}
                  >
                    {department.label}
                  </option>
                ))}
              </select>
            </label>

            {/* Work Process */}
            <label className="text-sm font-medium text-slate-700">
              Work Process

              <select
                value={selectedWorkProcess}
                onChange={(event) =>
                  setSelectedWorkProcess(event.target.value)
                }
                disabled={selectedDepartment === "All"}
                className="mt-2 block w-full rounded-lg border border-slate-300 bg-white p-2.5 disabled:bg-slate-100"
              >
                <option value="All">All Work Processes</option>

                {workProcessOptions.map((process) => (
                  <option
                    key={process.code}
                    value={process.code}
                  >
                    {process.label}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="button"
              onClick={generateReport}
              className="self-end rounded-lg bg-[#0A506E] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#124766]"
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
            <p className="mt-3 text-sm text-red-600">
              {dateError}
            </p>
          )}

          {summaryLoading && (
            <p className="mt-3 text-sm text-slate-500">
              Loading file report...
            </p>
          )}

          {summaryError && (
            <p className="mt-3 text-sm text-red-600">
              {summaryError}
            </p>
          )}
        </section>

        {/* User Activity */}
        <section
          className="space-y-4"
          style={{
            display:
              reportType === "Complete" ? undefined : "none",
          }}
        >
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
            User activity requires audit or activity-log data.
            It is not calculated from file totals.
          </p>
        </section>

        {/* Gender Distribution */}
        <section
          className="space-y-4"
          style={{
            display: isReportVisible("Employees")
              ? undefined
              : "none",
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Employees"
              value={employees.length}
            />

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
            Gender statistics are calculated from employee records
            currently loaded by the application.
          </p>
        </section>

        {/* Inactive Employees by Reason */}
        <section
          className="space-y-4"
          style={{
            display: isReportVisible("Employees")
              ? undefined
              : "none",
          }}
        >
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
                  value: otherInactiveReasons,
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
            </div>
          </div>
        </section>

        {/* File Activity */}
        <section
          className="space-y-4"
          style={{
            display: isReportVisible("Files")
              ? undefined
              : "none",
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard
              label="Total Files"
              value={displaySummary.totalFiles}
            />

            <MetricCard
              label="Incoming"
              value={displaySummary.incomingFiles}
              color="green"
            />

            <MetricCard
              label="Outgoing"
              value={displaySummary.outgoingFiles}
              color="red"
            />

            <MetricCard
              label="Pending"
              value={displaySummary.pendingFiles}
              color="amber"
            />

            <MetricCard
              label="Approved"
              value={displaySummary.approvedFiles}
              color="purple"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <BarChart
              title="File Activity Chart"
              items={[
                {
                  label: "Incoming",
                  value: displaySummary.incomingFiles,
                  color: "bg-green-500",
                },
                {
                  label: "Outgoing",
                  value: displaySummary.outgoingFiles,
                  color: "bg-red-500",
                },
                {
                  label: "Pending",
                  value: displaySummary.pendingFiles,
                  color: "bg-amber-500",
                },
                {
                  label: "Approved",
                  value: displaySummary.approvedFiles,
                  color: "bg-purple-500",
                },
                {
                  label: "Archived",
                  value: displaySummary.archivedFiles,
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
                  <strong>{displaySummary.totalFiles}</strong>
                </p>

                <p className="flex justify-between">
                  <span>Incoming</span>
                  <strong>{displaySummary.incomingFiles}</strong>
                </p>

                <p className="flex justify-between">
                  <span>Outgoing</span>
                  <strong>{displaySummary.outgoingFiles}</strong>
                </p>

                <p className="flex justify-between">
                  <span>Pending</span>
                  <strong>{displaySummary.pendingFiles}</strong>
                </p>

                <p className="flex justify-between">
                  <span>Approved</span>
                  <strong>{displaySummary.approvedFiles}</strong>
                </p>

                <p className="flex justify-between">
                  <span>Archived</span>
                  <strong>{displaySummary.archivedFiles}</strong>
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
                      No files match the selected branch and filters.
                    </td>
                  </tr>
                ) : (
                  report.files.map((file, index) => (
                    <tr
                      key={file.id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-4 py-3">{index + 1}</td>

                      <td className="px-4 py-3">
                        {file.reference || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {file.title || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {file.department || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {file.assignedOfficer || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {file.pages ?? 0}
                      </td>

                      <td className="px-4 py-3">
                        {formatReportDate(file.date)}
                      </td>

                      <td className="px-4 py-3">
                        {file.fileType || "—"}
                      </td>

                      <td className="px-4 py-3">
                        {file.status || "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Job Activity */}
        <section
          className="space-y-4"
          style={{
            display: isReportVisible("Jobs")
              ? undefined
              : "none",
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Jobs"
              value="Unavailable"
            />

            <MetricCard
              label="Total Quantity"
              value="Unavailable"
              color="green"
            />

            <MetricCard
              label="Average per Job"
              value="Unavailable"
              color="purple"
            />

            <MetricCard
              label="Unique Dates"
              value="Unavailable"
              color="amber"
            />
          </div>

          <EmptyTable
            headers={[
              "#",
              "Date (Eth)",
              "Quantity",
              "Remarks",
              "Logged By",
            ]}
            message="Job data source is not connected yet."
          />
        </section>

        {/* Transfer Activity */}
        <section
          className="space-y-4"
          style={{
            display: isReportVisible("Transfers")
              ? undefined
              : "none",
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Transfers"
              value="Unavailable"
            />

            <MetricCard
              label="Received"
              value="Unavailable"
              color="green"
            />

            <MetricCard
              label="Sent"
              value="Unavailable"
              color="purple"
            />

            <MetricCard
              label="Pages Transferred"
              value="Unavailable"
              color="amber"
            />
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
                {[
                  "Total transfers",
                  "Received",
                  "Sent",
                  "Pages received",
                  "Pages sent",
                ].map((label) => (
                  <p
                    key={label}
                    className="flex justify-between"
                  >
                    <span>{label}</span>
                    <strong>Unavailable</strong>
                  </p>
                ))}
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
        <section
          className="space-y-4"
          style={{
            display: isReportVisible("Letters")
              ? undefined
              : "none",
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <MetricCard
              label="Total Letters"
              value="Unavailable"
            />

            <MetricCard
              label="Incoming"
              value="Unavailable"
              color="green"
            />

            <MetricCard
              label="Outgoing"
              value="Unavailable"
              color="blue"
            />

            <MetricCard
              label="Email"
              value="Unavailable"
              color="purple"
            />

            <MetricCard
              label="Hand Delivered"
              value="Unavailable"
              color="amber"
            />
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
                {[
                  "Total letters",
                  "Incoming",
                  "Outgoing",
                  "Email",
                  "Hand delivered",
                ].map((label) => (
                  <p
                    key={label}
                    className="flex justify-between"
                  >
                    <span>{label}</span>
                    <strong>Unavailable</strong>
                  </p>
                ))}
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

      {/* OFFICIAL PRINT REPORT */}
      <div className="report-print-area">

        {/* Official Header */}
        <header className="print-header">
          <img
            src="/logo.png"
            alt="Ethiopian Customs Commission Logo"
            className="report-logo"
          />

          <div className="print-heading">
            <h1>ETHIOPIAN CUSTOMS COMMISSION</h1>

            <h2>Official Management Report</h2>

            <p>
              {reportType === "Complete"
                ? "COMPLETE MANAGEMENT REPORT"
                : `${reportType.toUpperCase()} REPORT`}
            </p>
          </div>

          <div className="print-document-label">
            <strong>REPORT</strong>
            <span>OFFICIAL COPY</span>
          </div>
        </header>

        <div className="print-divider" />

        {/* Report Information */}
        <section className="print-information">
          <div>
            <span>Report Title</span>
            <strong>
              {reportType === "Complete"
                ? "Office Activity and Analytics Report"
                : reportType === "Files"
                  ? "File Management Report"
                  : reportType === "Employees"
                    ? "Employee Statistics Report"
                    : reportType === "Jobs"
                      ? "Job Activity Report"
                      : reportType === "Transfers"
                        ? "Transfer Activity Report"
                        : "Letter Activity Report"}
            </strong>
          </div>

          <div>
            <span>Sector</span>
            <strong>{selectedSectorLabel}</strong>
          </div>

          <div>
            <span>Department</span>
            <strong>
              {selectedDepartment === "All"
                ? "All Departments"
                : departmentOptions.find(
                    (item) => item.code === selectedDepartment
                  )?.label ?? selectedDepartment}
            </strong>
          </div>

          <div>
            <span>Work Process</span>
            <strong>
              {selectedWorkProcess === "All"
                ? "All Work Processes"
                : workProcessOptions.find(
                    (item) =>
                      item.code === selectedWorkProcess
                  )?.label ?? selectedWorkProcess}
            </strong>
          </div>

          <div>
            <span>From Date</span>
            <strong>{appliedFromEth || "All dates"}</strong>
          </div>

          <div>
            <span>To Date</span>
            <strong>{appliedToEth || "All dates"}</strong>
          </div>

          <div>
            <span>Generated On</span>
            <strong>{generatedDate || "—"}</strong>
          </div>

          <div>
            <span>Report Status</span>
            <strong>
              {summaryError ? "File summary unavailable" : "Generated"}
            </strong>
          </div>
        </section>

        {/* 1. User Activity */}
        {reportType === "Complete" && (
          <section className="print-section">
            <h2>1. USER ACTIVITY REPORT</h2>

            <table className="print-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th>Files</th>
                  <th>Jobs</th>
                  <th>Letters</th>
                  <th>Transfers</th>
                  <th>Employees</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan={8}>
                    User activity data is not currently available.
                    An audit or activity-log data source is required.
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* 2. Employee Statistics */}
        {isReportVisible("Employees") && (
          <section className="print-section">
            <h2>2. EMPLOYEE STATISTICS</h2>

            <table className="print-table">
              <thead>
                <tr>
                  <th>Employee Category</th>
                  <th>Male</th>
                  <th>Female</th>
                  <th>Other</th>
                  <th>Not Recorded</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Active Employees</td>
                  <td>{genderStats.activeMale}</td>
                  <td>{genderStats.activeFemale}</td>
                  <td>{genderStats.activeOther}</td>
                  <td>
                    {report.active.length -
                      genderStats.activeMale -
                      genderStats.activeFemale -
                      genderStats.activeOther}
                  </td>
                  <td>{report.active.length}</td>
                </tr>

                <tr>
                  <td>Inactive Employees</td>
                  <td>{genderStats.inactiveMale}</td>
                  <td>{genderStats.inactiveFemale}</td>
                  <td>{genderStats.inactiveOther}</td>
                  <td>
                    {report.inactive.length -
                      genderStats.inactiveMale -
                      genderStats.inactiveFemale -
                      genderStats.inactiveOther}
                  </td>
                  <td>{report.inactive.length}</td>
                </tr>

                <tr className="print-total-row">
                  <td>Total Employees</td>
                  <td>
                    {genderStats.activeMale +
                      genderStats.inactiveMale}
                  </td>
                  <td>
                    {genderStats.activeFemale +
                      genderStats.inactiveFemale}
                  </td>
                  <td>
                    {genderStats.activeOther +
                      genderStats.inactiveOther}
                  </td>
                  <td>{genderStats.notRecorded}</td>
                  <td>{employees.length}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* 3. Inactive Employees */}
        {isReportVisible("Employees") && (
          <section className="print-section">
            <h2>3. INACTIVE EMPLOYEES BY REASON</h2>

            <table className="print-table">
              <thead>
                <tr>
                  <th>Reason</th>
                  <th>Number of Employees</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Retired</td>
                  <td>{inactiveReasonStats.retired}</td>
                </tr>

                <tr>
                  <td>Resigned</td>
                  <td>{inactiveReasonStats.resigned}</td>
                </tr>

                <tr>
                  <td>Deceased</td>
                  <td>{inactiveReasonStats.deceased}</td>
                </tr>

                <tr>
                  <td>Transferred</td>
                  <td>{inactiveReasonStats.transferred}</td>
                </tr>

                <tr>
                  <td>Other / Not Recorded</td>
                  <td>{otherInactiveReasons}</td>
                </tr>

                <tr className="print-total-row">
                  <td>Total Inactive Employees</td>
                  <td>{report.inactive.length}</td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* 4. File Activity */}
        {isReportVisible("Files") && (
          <section className="print-section">
            <h2>4. FILE ACTIVITY SUMMARY</h2>

            <table className="print-table">
              <thead>
                <tr>
                  <th>Total Files</th>
                  <th>Incoming</th>
                  <th>Outgoing</th>
                  <th>Pending</th>
                  <th>Approved</th>
                  <th>Archived</th>
                  <th>Total Pages</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>{displaySummary.totalFiles}</td>
                  <td>{displaySummary.incomingFiles}</td>
                  <td>{displaySummary.outgoingFiles}</td>
                  <td>{displaySummary.pendingFiles}</td>
                  <td>{displaySummary.approvedFiles}</td>
                  <td>{displaySummary.archivedFiles}</td>
                  <td>{report.totalPages}</td>
                </tr>
              </tbody>
            </table>

            {summaryError && (
              <p className="print-warning">
                File summary could not be retrieved from the backend.
                Some file statistics may be incomplete.
              </p>
            )}
          </section>
        )}

        {/* 5. File Register */}
        {isReportVisible("Files") && (
          <section className="print-section">
            <h2>5. FILE REGISTER DETAILS</h2>

            <table className="print-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Reference</th>
                  <th>Title</th>
                  <th>Department</th>
                  <th>Assigned Officer</th>
                  <th>Pages</th>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {report.files.length === 0 ? (
                  <tr>
                    <td colSpan={9}>
                      No files match the selected branch and filters.
                    </td>
                  </tr>
                ) : (
                  report.files.map((file, index) => (
                    <tr key={file.id}>
                      <td>{index + 1}</td>
                      <td>{file.reference || "—"}</td>
                      <td>{file.title || "—"}</td>
                      <td>{file.department || "—"}</td>
                      <td>{file.assignedOfficer || "—"}</td>
                      <td>{file.pages ?? 0}</td>
                      <td>{formatReportDate(file.date)}</td>
                      <td>{file.fileType || "—"}</td>
                      <td>{file.status || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            <p className="print-note">
              Total records listed: {report.files.length} |
              Total recorded pages: {report.totalPages}
            </p>
          </section>
        )}

        {/* 6. Job Activity */}
        {isReportVisible("Jobs") && (
          <section className="print-section">
            <h2>6. JOB ACTIVITY</h2>

            <table className="print-table">
              <thead>
                <tr>
                  <th>Total Jobs</th>
                  <th>Total Quantity</th>
                  <th>Average per Job</th>
                  <th>Unique Dates</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan={4}>
                    Unavailable — job records are not connected
                    to the reporting source yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* 7. Transfer Activity */}
        {isReportVisible("Transfers") && (
          <section className="print-section">
            <h2>7. TRANSFER ACTIVITY</h2>

            <table className="print-table">
              <thead>
                <tr>
                  <th>Total Transfers</th>
                  <th>Received</th>
                  <th>Sent</th>
                  <th>Pages Transferred</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan={4}>
                    Unavailable — transfer records are not connected
                    to the reporting source yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* 8. Letter Activity */}
        {isReportVisible("Letters") && (
          <section className="print-section">
            <h2>8. LETTER ACTIVITY</h2>

            <table className="print-table">
              <thead>
                <tr>
                  <th>Total Letters</th>
                  <th>Incoming</th>
                  <th>Outgoing</th>
                  <th>Email</th>
                  <th>Hand Delivered</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td colSpan={5}>
                    Unavailable — letter records are not connected
                    to the reporting source yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </section>
        )}

        {/* Signatures */}
        <section className="print-signatures">
          <div className="print-signature">
            <strong>Prepared By</strong>
            <span>Name / Signature / Date</span>
          </div>

          <div className="print-signature">
            <strong>Checked By</strong>
            <span>Name / Signature / Date</span>
          </div>

          <div className="print-signature">
            <strong>Approved By</strong>
            <span>Name / Signature / Date</span>
          </div>
        </section>

        <footer className="print-footer">
          Ethiopian Customs Commission | Office File Management
          System | Official Management Report
        </footer>
      </div>
    </>
  );
}
