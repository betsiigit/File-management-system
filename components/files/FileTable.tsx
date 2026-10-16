
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
    const query = search.trim().toLowerCase();

    return files.filter((file) => {
      const matchesSearch = [
        file.reference,
        file.title,
        file.department,
      ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (statusFilter === "All" || file.status === statusFilter)
      );
    });
  }, [files, search, statusFilter]);

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
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-[#F8FAFB] text-xs uppercase tracking-wide text-[#737B86]">
            <tr>
              <th className="px-5 py-4 font-semibold">Reference No.</th>
              <th className="px-5 py-4 font-semibold">File Name</th>
              <th className="px-5 py-4 font-semibold">Department</th>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#ECEFF2]">
            {filteredFiles.map((file) => (
              <tr
                key={file.id}
                className="transition-colors duration-150 hover:bg-[#F8FAFB]"
              >
                <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#0A506E]">
                  {file.reference}
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
                    {file.status}
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
                  colSpan={6}
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
