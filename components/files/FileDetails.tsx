
"use client";

import type { OfficeFile } from "./FileTable";

type FileDetailsProps = {
  file: OfficeFile;
  onBack: () => void;
  canPrint?: boolean;
};

export default function FileDetails({
  file,
  onBack,
  canPrint = true,
}: FileDetailsProps) {
  function handlePrint() {
    window.print();
  }

  const detailRows = [
    { label: "File Type", value: file.fileType || "Not recorded" },
    { label: "Reference Number", value: file.reference },
    { label: "File Name / Subject", value: file.title },
    { label: "Registration Date", value: file.date },
    {
      label: "Number of Pages",
      value: file.pages != null ? String(file.pages) : "Not recorded",
    },
    { label: "Department", value: file.department },
    {
      label: "Assigned Officer",
      value: file.assignedOfficer || "Not assigned",
    },
    { label: "Remarks / Description", value: file.remarks || "No remarks" },
    {
      label: "Attachment",
      value: file.attachmentName || "No attachment recorded",
    },
  ];

  return (
    <div className="file-details-page max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#092c45] hover:bg-slate-50"
        >
          ← Back to Files
        </button>

        {canPrint && (
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg bg-[#092c45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#124766]"
          >
            Print Details
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm print:border-0 print:shadow-none">
        <div className="bg-[#092c45] p-6 text-white print:bg-white print:text-black">
          <p className="text-sm text-slate-300 print:text-slate-600">
            Office File Reference
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {file.reference}
          </h2>

          <p className="mt-2 text-sm text-slate-300 print:text-slate-600">
            Office File Details
          </p>

          <div className="mt-4">
            <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-sm font-semibold print:border print:border-slate-400 print:bg-white print:text-black">
              Status: {file.status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          {detailRows.map((item) => (
            <div
              key={item.label}
              className={
                item.label === "Remarks / Description"
                  ? "sm:col-span-2"
                  : ""
              }
            >
              <p className="text-sm text-slate-500 print:text-slate-700">
                {item.label}
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words font-semibold text-[#092c45] print:text-black">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 px-6 py-4 text-xs text-slate-500 print:text-slate-700">
          Office File Management System
        </div>
      </div>
    </div>
  );
}
