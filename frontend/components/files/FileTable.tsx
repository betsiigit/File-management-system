
"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";

export type OfficeFile = {
  id: number;
  reference: string;
  volume: string;
  title: string;
  department: string;
  date: string;
  outgoing_date: string;
  status: "Pending" | "Approved" | "Archived";
  fileType?: "Incoming" | "Outgoing";
  pages?: number;
  assignedOfficer?: string;
  remarks?: string;
  attachmentNames?: string[];
  documentPath?: string;
};

type FileTableProps = {
  files: OfficeFile[];
  onViewFile: (file: OfficeFile) => void;
};

export default function FileTable({
  files,
  onViewFile,
}: FileTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [volumeFilter, setVolumeFilter] = useState("All");
  const [importFile, setImportFile] = useState<File | null>(null);

 
  const filteredFiles = useMemo(() => {
    const query = search.trim().toLowerCase();

return files.filter((file) => {
  const volume = file.volume ?? "";
  const status = file.status ?? "Pending";

  const matchesSearch = [
    file.reference,
    file.title,
    file.department,
    volume,
  ].some((value) => (value ?? "").toLowerCase().includes(query));

  const matchesStatus =
    statusFilter === "All" || status === statusFilter;

  const matchesVolume =
    volumeFilter === "All" || volume === volumeFilter;

  return matchesSearch && matchesStatus && matchesVolume;
});

  }, [files, search, statusFilter, volumeFilter]);

 
const volumes = useMemo(
  () =>
    [...new Set(
      files
        .map((file) => file.volume ?? "")
        .filter((volume) => volume !== "")
    )].sort(),
  [files]
);



const volumeFiles = useMemo(() => {
  return files
    .filter(
      (file) =>
        volumeFilter === "All" || file.volume === volumeFilter
    )
    .sort((a, b) => b.id - a.id);
}, [files, volumeFilter]);



function handlePrintVolume() {
  if (volumeFilter === "All") {
    alert("Please select a volume before printing.");
    return;
  }

  if (volumeFiles.length === 0) {
    alert("This volume has no records to print.");
    return;
  }

  const printWindow = window.open("", "_blank", "width=1000,height=700");

  if (!printWindow) {
    alert("Please allow pop-ups for this website, then try again.");
    return;
  }

  const escapeHtml = (value: string | number) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const rows = volumeFiles
    .map(
      (file, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(file.reference)}</td>
          <td>${escapeHtml(file.outgoing_date || "")}</td>
          <td>${escapeHtml(file.date || "")}</td>
          <td>${escapeHtml(file.title)}</td>
          <td>${escapeHtml(file.remarks || "")}</td>
          <td>${file.attachmentNames?.length || 0}</td>
        </tr>
      `
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${escapeHtml(volumeFilter)} Register</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h2 {
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th, td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
          }
          th {
            background: #eee;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h2>${escapeHtml(volumeFilter)} Register</h2>
        <table>
          <thead>
            <tr>
              <th>No.</th>
              <th>Ref. No.</th>
              <th>Outgoing Date</th>
              <th>Date of Registration</th>
              <th>Title</th>
              <th>Description</th>
              <th>Bulk</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `);

  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}


function handleExportExcel() {
  if (volumeFilter === "All") {
    alert("Please select a volume before exporting.");
    return;
  }

  const exportData = volumeFiles.map((file, index) => ({
    "No.": index + 1,
    "Ref. No.": file.reference,
    "Outgoing Date": file.outgoing_date || "",
    "Date of Registration": file.date || "",
    Title: file.title,
    Description: file.remarks || "",
    Bulk: file.attachmentNames?.length || 0,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  worksheet["!cols"] = [
    { wch: 8 },
    { wch: 20 },
    { wch: 18 },
    { wch: 22 },
    { wch: 35 },
    { wch: 40 },
    { wch: 10 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Volume Register");

  const safeVolumeName = volumeFilter.replace(/[\\/:*?"<>|]/g, "_");

  XLSX.writeFile(workbook, `${safeVolumeName}_Register.xlsx`);
}

function handleImportExcel() {
  if (!importFile) {
    alert("Please select an Excel file first.");
    return;
  }

  const reader = new FileReader();

  reader.onload = (event) => {
    try {
      const data = event.target?.result;

      if (!data) {
        alert("Could not read the selected file.");
        return;
      }

      const workbook = XLSX.read(data, { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!firstSheet) {
        alert("The Excel file has no worksheet.");
        return;
      }

      const rows = XLSX.utils.sheet_to_json(firstSheet, {
        defval: "",
      });

      if (rows.length === 0) {
        alert("The selected worksheet has no records.");
        return;
      }

      console.log("Excel rows ready for validation:", rows);
      alert(`Read ${rows.length} rows. Next we'll validate them before importing.`);
    } catch {
      alert("Could not read this Excel file. Please check its format.");
    }
  };

  reader.readAsArrayBuffer(importFile);
}

  return (
    <div className="overflow-hidden rounded-xl border border-[#ECEFF2] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#ECEFF2] p-4 sm:flex-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search reference, file name, department..."
          aria-label="Search office files"
          className="min-w-0 flex-1 rounded-lg border border-[#D6E2E8] bg-white px-4 py-3 text-sm text-[#292D32] outline-none transition placeholder:text-[#9298A1] focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/10"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter files by status"
          className="rounded-lg border border-[#D6E2E8] bg-white px-4 py-3 text-sm text-[#454B54] outline-none transition focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/10"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Archived">Archived</option>
        </select>
        
  <select
    value={volumeFilter}
    onChange={(event) => setVolumeFilter(event.target.value)}
    aria-label="Filter files by volume"
    className="rounded-lg border border-[#D6E2E8] bg-white px-4 py-3 text-sm text-[#454B54] outline-none transition focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/10"
  >
    <option value="All">All Volumes</option>
    {volumes.map((volume) => (
      <option key={volume} value={volume}>
        {volume}
      </option>
    ))}
  </select>
  <button
  type="button"
  onClick={handleExportExcel}
  disabled={volumeFilter === "All"}
  className="rounded-lg border border-[#0A506E] bg-white px-4 py-3 text-sm font-semibold text-[#0A506E] disabled:cursor-not-allowed disabled:opacity-50"
>
  Export Excel
</button>
<label className="cursor-pointer rounded-lg border border-[#D6E2E8] bg-white px-4 py-3 text-sm font-semibold text-[#0A506E]">
  Choose Excel
  <input
    type="file"
    accept=".xlsx,.xls"
    className="hidden"
    onChange={(event) =>
      setImportFile(event.target.files?.[0] ?? null)
    }
  />
</label>
 <button
  type="button"
  onClick={handlePrintVolume}
  disabled={volumeFilter === "All"}
  className="rounded-lg bg-[#0A506E] px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
>
  Print Volume
</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[#F8FAFB] text-xs uppercase tracking-wide text-[#737B86]">
            <tr>
              <th className="px-5 py-4 font-semibold">Reference No.</th>
              <th className="px-5 py-4 font-semibold">Volume</th>
              <th className="px-5 py-4 font-semibold">File Name</th>
              <th className="px-5 py-4 font-semibold">Department</th>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Outgoing Date</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#ECEFF2]">
            {filteredFiles.map((file) => (
              <tr
                key={file.reference}
                className="transition-colors duration-150 hover:bg-[#F8FAFB]"
              >
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#0A506E]">
                  {file.reference}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-[#737B86]">
                   {file.volume || "—"}
                </td> 
                <td className="px-5 py-4 font-medium text-[#292D32]">
                  {file.title}
                </td>

                <td className="px-5 py-4 text-[#737B86]">
                  {file.department}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-[#737B86]">
                  {file.date}
                </td>

                <td className="whitespace-nowrap px-5 py-4 text-[#737B86]">
                   {file.outgoing_date}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                      file.status === "Approved"
                        ? "bg-emerald-50 text-emerald-700"
                        : file.status === "Pending"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {file.status || "Pending"}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onViewFile(file)}
                    className="whitespace-nowrap rounded-lg border border-[#D6E2E8] bg-white px-3 py-2 text-xs font-semibold text-[#0A506E] transition-colors duration-200 hover:border-[#0A506E] hover:bg-[#E7F1F5] active:bg-[#D9EAF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A506E]/30"
                  >
                    View Details
                  </button>

                </td>
              </tr>
            ))}

            {filteredFiles.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-12 text-center text-sm text-[#737B86]"
                >
                  No files found. Try another search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-[#ECEFF2] px-5 py-4 text-xs text-[#737B86]">
        Showing {filteredFiles.length} of {files.length} files
      </div>
    </div>
  );
}
