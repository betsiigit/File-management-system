
"use client";
"use client";

import { useEffect, useState } from "react";
import type { OfficeFile } from "./FileTable";

type OfficeFileAttachment = {
  id: number;
  fileName: string;
  documentPath: string;
};

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

  
const [attachments, setAttachments] = useState<OfficeFileAttachment[]>([]);
const [attachmentsLoaded, setAttachmentsLoaded] = useState(false);

useEffect(() => {
  let cancelled = false;

  setAttachments([]);
  setAttachmentsLoaded(false);

  fetch(`http://localhost:8081/api/office-files/${file.id}/attachments`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load attachments.");
      }

      return response.json();
    })
    .then((data: OfficeFileAttachment[]) => {
      if (!cancelled) {
        setAttachments(data);
        setAttachmentsLoaded(true);
      }
    })
    .catch((error) => {
      console.error("Failed to load attachments:", error);

      if (!cancelled) {
        setAttachmentsLoaded(true);
      }
    });

  return () => {
    cancelled = true;
  };
}, [file.id]);

const attachmentItems: OfficeFileAttachment[] =
  attachments.length > 0
    ? attachments
    : file.documentPath
      ? [
          {
            id: -1,
            fileName: file.attachmentNames?.[0] || "Attached PDF",
            documentPath: file.documentPath,
          },
        ]
      : [];


  const detailRows = [
    { label: "File Type", value: file.fileType || "Not recorded" },
    { label: "Reference Number", value: file.reference },
    { label: "File Name / Subject", value: file.title },
    { label: "Registration Date", value: file.date },
     { label: "Volume", value: file.volume || "Not recorded" },
    {
      label: "Number of Pages",
      value: file.pages != null ? String(file.pages) : "Not recorded",
    },
    { label: "Department", value: file.department },
      {
    label: "Outgoing Date",
    value: file.outgoing_date || "Not recorded",
  },
    {
      label: "Assigned Officer",
      value: file.assignedOfficer || "Not assigned",
    },
    {
      label: "Remarks / Description",
      value: file.remarks || "No remarks",
    },
  



{
  label: "Attachments",
  value: !attachmentsLoaded ? (
    <span>Loading attachments...</span>
  ) : attachmentItems.length > 0 ? (
    <div className="flex flex-col items-start gap-2">
      {attachmentItems.map((attachment) => (
        <a
          key={attachment.id}
          href={`http://localhost:8081${attachment.documentPath}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0A506E] underline hover:text-[#087EA4]"
        >
          {attachment.fileName || "Open attached PDF"}
        </a>
      ))}
    </div>
  ) : file.attachmentNames?.length ? (
    <span>{file.attachmentNames.join(", ")}</span>
  ) : (
    <span>No attachment recorded</span>
  ),
},

  ];

  return (
    <div className="file-details-page max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-[#D6E2E8] bg-white px-4 py-2 text-sm font-semibold text-[#0A506E] transition-colors duration-200 hover:border-[#0A506E] hover:bg-[#E7F1F5] active:bg-[#D9EAF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A506E]/30"
        >
          ← Back to Files
        </button>

        {canPrint && (
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg bg-[#0A506E] px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#176A87] active:bg-[#135B74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A506E]/30"
          >
            Print Details
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-[#ECEFF2] bg-white shadow-sm print:border-0 print:shadow-none">
        <div className="bg-[#0A506E] p-6 text-white print:bg-white print:text-black">
          <p className="text-sm text-white/75 print:text-[#737B86]">
            Office File Reference
          </p>

          <h2 className="mt-1 break-words text-2xl font-bold tracking-tight">
            {file.reference}
          </h2>

          <p className="mt-2 text-sm text-white/75 print:text-[#737B86]">
            Office File Details
          </p>

          <div className="mt-4">
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm font-semibold print:border print:border-[#D6E2E8] print:bg-white print:text-black">
              Status: {file.status}
            </span>
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-6 p-6 sm:grid-cols-2">
          {detailRows.map((item) => (
            <div
              key={item.label}
              className={
                item.label === "Remarks / Description"
                  ? "sm:col-span-2"
                  : ""
              }
            >
              <p className="text-sm font-medium text-[#737B86] print:text-[#737B86]">
                {item.label}
              </p>

              <p className="mt-1 whitespace-pre-wrap break-words text-sm font-semibold leading-6 text-[#292D32] print:text-black">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-[#ECEFF2] px-6 py-4 text-xs text-[#737B86] print:text-[#737B86]">
          Office File Management System
        </div>
      </div>
    </div>
  );
}
