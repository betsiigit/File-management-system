
"use client";

import { useMemo, useState } from "react";



export type OfficeFile = {
  id: number;
  reference: string;
  title: string;
  department: string;
  date: string;
  status: "Pending" | "Approved" | "Archived";
  fileType?: "Incoming" | "Outgoing";
  pages?: number;
  assignedOfficer?: string;
  remarks?: string;
  attachmentName?: string;
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

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const matchesSearch = [
        file.reference,
        file.title,
        file.department,
      ].some((value) =>
        value.toLowerCase().includes(search.toLowerCase())
      );

      return (
        matchesSearch &&
        (statusFilter === "All" || file.status === statusFilter)
      );
    });
  }, [files, search, statusFilter]);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search reference, file name, department..."
          aria-label="Search office files"
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-amber-500"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          aria-label="Filter files by status"
          className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Archived">Archived</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-4">Reference No.</th>
              <th className="px-5 py-4">File Name</th>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredFiles.map((file) => (
              <tr key={file.id} className="hover:bg-slate-50">
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#124766]">
                  {file.reference}
                </td>
                <td className="px-5 py-4 font-medium text-slate-800">
                  {file.title}
                </td>
                <td className="px-5 py-4 text-slate-600">
                  {file.department}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                  {file.date}
                </td>
               
<td className="px-5 py-4">
  <button
    type="button"
    onClick={() => onViewFile(file)}
    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-[#092c45] hover:bg-slate-50"
  >
    View Details
  </button>

  <span
    className={`rounded-full px-3 py-1 text-xs font-semibold ${
      file.status === "Approved"
        ? "bg-emerald-100 text-emerald-700"
        : file.status === "Pending"
          ? "bg-amber-100 text-amber-800"
          : "bg-slate-200 text-slate-600"
    }`}
  >
    {file.status}
  </span>
</td>

              </tr>
            ))}

            {filteredFiles.length === 0 && (
              <tr>
  <td
    colSpan={6}
    className="px-5 py-12 text-center text-slate-500"
  >
    No files found. Try another search.
  </td>
</tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-slate-200 px-5 py-4 text-xs text-slate-500">
        Showing {filteredFiles.length} of {files.length} files
      </div>
    </div>
  );
}
