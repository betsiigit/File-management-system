
"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { OfficeFile } from "./FileTable";

type OfficeFileAttachment = {
  id: number;
  fileName: string;
  documentPath: string;
};

type FileDetailsProps = {
  file: OfficeFile;
  onBack: () => void;
  onFileUpdated: (updatedFile: OfficeFile) => void;
  onFileDeleted: (deletedId: number) => void;
  canPrint?: boolean;
};

type EditableFile = {
  reference: string;
  title: string;
  fileType: "Incoming" | "Outgoing";
  date: string;
  outgoing_date: string;
  pages: string;
  department: string;
  assignedOfficer: string;
  remarks: string;
  volume: string;
  status: "Pending" | "Approved" | "Archived";
};

const inputClass =
  "mt-2 w-full rounded-lg border border-[#D6E2E8] bg-white px-3 py-2.5 text-sm text-[#292D32] outline-none focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/10";

const labelClass = "text-sm font-semibold text-[#454B54]";

export default function FileDetails({
  file,
  onBack,
  onFileUpdated,
  onFileDeleted,
  canPrint = true,
}: FileDetailsProps) {
  const [attachments, setAttachments] = useState<OfficeFileAttachment[]>([]);
  const [attachmentsLoaded, setAttachmentsLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState<EditableFile>(() => ({
    reference: file.reference ?? "",
    title: file.title ?? "",
    fileType: file.fileType ?? "Incoming",
    date: file.date ?? "",
    outgoing_date: file.outgoing_date ?? "",
    pages: file.pages != null ? String(file.pages) : "",
    department: file.department ?? "",
    assignedOfficer: file.assignedOfficer ?? "",
    remarks: file.remarks ?? "",
    volume: file.volume ?? "",
    status: file.status ?? "Pending",
  }));

  useEffect(() => {
    setAttachments([]);
    setAttachmentsLoaded(false);

    let cancelled = false;

    fetch(`http://localhost:8081/api/office-files/${file.id}/attachments`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load attachments.");
        }
        return response.json();
      })
      .then((data: OfficeFileAttachment[]) => {
        if (!cancelled) {
          setAttachments(Array.isArray(data) ? data : []);
          setAttachmentsLoaded(true);
        }
      })
      .catch((attachmentError) => {
        console.error("Failed to load attachments:", attachmentError);
        if (!cancelled) {
          setAttachmentsLoaded(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [file.id]);

  function updateField<K extends keyof EditableFile>(
    field: K,
    value: EditableFile[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleCancelEdit() {
    setForm({
      reference: file.reference ?? "",
      title: file.title ?? "",
      fileType: file.fileType ?? "Incoming",
      date: file.date ?? "",
      outgoing_date: file.outgoing_date ?? "",
      pages: file.pages != null ? String(file.pages) : "",
      department: file.department ?? "",
      assignedOfficer: file.assignedOfficer ?? "",
      remarks: file.remarks ?? "",
      volume: file.volume ?? "",
      status: file.status ?? "Pending",
    });
    setError("");
    setMessage("");
    setIsEditing(false);
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (
      !form.reference.trim() ||
      !form.title.trim() ||
      !form.date ||
      !form.department.trim() ||
      !form.pages ||
      !Number.isInteger(Number(form.pages)) ||
      Number(form.pages) < 1
    ) {
      setError(
        "Please complete the required fields and enter a valid page count."
      );
      return;
    }

    if (form.fileType === "Outgoing" && !form.outgoing_date) {
      setError("Please enter the outgoing date for this outgoing file.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(
        `http://localhost:8081/api/office-files/${file.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            referenceNumber: form.reference.trim(),
            title: form.title.trim(),
            fileType: form.fileType,
            registrationDate: form.date || null,
            outgoingDate:
              form.fileType === "Outgoing"
                ? form.outgoing_date || null
                : null,
            numberOfPages: Number(form.pages),
            department: form.department.trim(),
            assignedOfficer: form.assignedOfficer.trim() || null,
            remarks: form.remarks.trim() || null,
            volume: form.volume.trim() || null,
            status: form.status,
            documentPath:
              "documentPath" in file ? file.documentPath ?? null : null,
          }),
        }
      );

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(
          responseText || `Update failed (${response.status}).`
        );
      }

      const saved = await response.json();

      const updatedFile = {
        ...file,
        reference: saved.referenceNumber ?? form.reference.trim(),
        title: saved.title ?? form.title.trim(),
        fileType: saved.fileType ?? form.fileType,
        date: saved.registrationDate ?? form.date,
        outgoing_date: saved.outgoingDate ?? form.outgoing_date,
        pages: saved.numberOfPages ?? Number(form.pages),
        department: saved.department ?? form.department.trim(),
        assignedOfficer:
          saved.assignedOfficer ?? form.assignedOfficer.trim(),
        remarks: saved.remarks ?? form.remarks.trim(),
        volume: saved.volume ?? form.volume.trim(),
        status: saved.status ?? form.status,
      } as OfficeFile;

      onFileUpdated(updatedFile);
      setIsEditing(false);
      setMessage("File updated successfully.");
    } catch (saveError) {
      console.error("Failed to update file:", saveError);
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not update the file. Please try again."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete file "${file.reference}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
    setIsDeleting(true);

    try {
      const response = await fetch(
        `http://localhost:8081/api/office-files/${file.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(
          responseText || `Delete failed (${response.status}).`
        );
      }

      onFileDeleted(file.id);
    } catch (deleteError) {
      console.error("Failed to delete file:", deleteError);
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete the file. Please try again."
      );
    } finally {
      setIsDeleting(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  const legacyDocumentPath =
    "documentPath" in file ? file.documentPath : undefined;

  const attachmentItems: OfficeFileAttachment[] =
    attachments.length > 0
      ? attachments
      : legacyDocumentPath
        ? [
            {
              id: -1,
              fileName: file.attachmentNames?.[0] || "Attached PDF",
              documentPath: legacyDocumentPath,
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
    { label: "Department", value: file.department || "Not recorded" },
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
  ];

  return (
    <div className="file-details-page max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-[#D6E2E8] bg-white px-4 py-2.5 text-sm font-medium text-[#0A506E] transition hover:bg-[#E7F1F5]"
        >
          ← Back to Files
        </button>

        <div className="flex flex-wrap gap-2">
          {!isEditing && (
            <>
              <button
                type="button"
                onClick={() => {
                  setMessage("");
                  setError("");
                  setIsEditing(true);
                }}
                className="rounded-lg bg-[#0A506E] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#176A87]"
              >
                Edit File
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete File"}
              </button>
            </>
          )}

          {canPrint && !isEditing && (
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-lg border border-[#D6E2E8] bg-white px-4 py-2.5 text-sm font-medium text-[#0A506E] transition hover:bg-[#E7F1F5]"
            >
              Print Details
            </button>
          )}
        </div>
      </div>

      {message && (
        <p
          role="status"
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 print:hidden"
        >
          {message}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 print:hidden"
        >
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-[#E2E6ED] bg-white shadow-sm">
        <div className="bg-[#0A506E] p-6 text-white">
          <p className="text-sm text-white/75">Office File Reference</p>
          <h2 className="mt-1 text-2xl font-bold">{file.reference}</h2>
          <p className="mt-3 text-sm text-white/80">Office File Details</p>
          <div className="mt-3">
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-sm">
              Status: {file.status}
            </span>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-5 p-6 print:hidden">
            <h3 className="text-lg font-semibold text-[#292D32]">
              Edit Office File
            </h3>

            <p className="text-sm text-[#7B8492]">
              Update the file information below. Existing attachments will be
              kept.
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className={labelClass}>
                File Type *
                <select
                  className={inputClass}
                  value={form.fileType}
                  onChange={(event) =>
                    updateField(
                      "fileType",
                      event.target.value as "Incoming" | "Outgoing"
                    )
                  }
                >
                  <option value="Incoming">Incoming</option>
                  <option value="Outgoing">Outgoing</option>
                </select>
              </label>

              <label className={labelClass}>
                Reference Number *
                <input
                  required
                  className={inputClass}
                  value={form.reference}
                  onChange={(event) =>
                    updateField("reference", event.target.value)
                  }
                />
              </label>

              <label className={labelClass}>
                File Name / Subject *
                <input
                  required
                  className={inputClass}
                  value={form.title}
                  onChange={(event) =>
                    updateField("title", event.target.value)
                  }
                />
              </label>

              <label className={labelClass}>
                Registration Date *
                <input
                  required
                  type="date"
                  className={inputClass}
                  value={form.date}
                  onChange={(event) =>
                    updateField("date", event.target.value)
                  }
                />
              </label>

              {form.fileType === "Outgoing" && (
                <label className={labelClass}>
                  Outgoing Date *
                  <input
                    required
                    type="date"
                    className={inputClass}
                    value={form.outgoing_date}
                    onChange={(event) =>
                      updateField("outgoing_date", event.target.value)
                    }
                  />
                </label>
              )}

              <label className={labelClass}>
                Volume
                <input
                  className={inputClass}
                  value={form.volume}
                  onChange={(event) =>
                    updateField("volume", event.target.value)
                  }
                />
              </label>

              <label className={labelClass}>
                Number of Pages *
                <input
                  required
                  type="number"
                  min="1"
                  step="1"
                  className={inputClass}
                  value={form.pages}
                  onChange={(event) =>
                    updateField("pages", event.target.value)
                  }
                />
              </label>

              <label className={labelClass}>
                Department *
                <input
                  required
                  className={inputClass}
                  value={form.department}
                  onChange={(event) =>
                    updateField("department", event.target.value)
                  }
                />
              </label>

              <label className={labelClass}>
                Assigned Officer
                <input
                  className={inputClass}
                  value={form.assignedOfficer}
                  onChange={(event) =>
                    updateField("assignedOfficer", event.target.value)
                  }
                />
              </label>

              <label className={labelClass}>
                Status *
                <select
                  className={inputClass}
                  value={form.status}
                  onChange={(event) =>
                    updateField(
                      "status",
                      event.target.value as EditableFile["status"]
                    )
                  }
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Archived">Archived</option>
                </select>
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                Remarks / Description
                <textarea
                  rows={4}
                  className={inputClass}
                  value={form.remarks}
                  onChange={(event) =>
                    updateField("remarks", event.target.value)
                  }
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3 border-t border-[#ECEFF2] pt-5">
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-[#0A506E] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#176A87] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>

              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="rounded-lg border border-[#D6E2E8] bg-white px-5 py-2.5 text-sm font-medium text-[#454B54] transition hover:bg-[#F4F7FA]"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="grid gap-5 p-6 sm:grid-cols-2">
              {detailRows.map((item) => (
                <div
                  key={item.label}
                  className={
                    item.label === "Remarks / Description"
                      ? "sm:col-span-2"
                      : ""
                  }
                >
                  <p className="text-sm text-[#7B8492]">{item.label}</p>
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm font-medium text-[#292D32]">
                    {item.value}
                  </p>
                </div>
              ))}

              <div className="sm:col-span-2">
                <p className="text-sm text-[#7B8492]">Attachments</p>

                {!attachmentsLoaded ? (
                  <p className="mt-2 text-sm text-[#7B8492]">
                    Loading attachments...
                  </p>
                ) : attachmentItems.length > 0 ? (
                  <div className="mt-2 flex flex-col items-start gap-2">
                    {attachmentItems.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={`http://localhost:8081${attachment.documentPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-sm text-[#0A506E] underline hover:text-[#087EA4]"
                      >
                        {attachment.fileName || "Open attached PDF"}
                      </a>
                    ))}
                  </div>
                ) : file.attachmentNames?.length ? (
                  <p className="mt-1 text-sm text-[#292D32]">
                    {file.attachmentNames.join(", ")}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-[#9298A1]">
                    No attachment recorded
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-[#ECEFF2] bg-[#F8FAFC] px-6 py-4 text-center text-xs text-[#7B8492]">
              Office File Management System
            </div>
          </>
        )}
      </div>
    </div>
  );
}
