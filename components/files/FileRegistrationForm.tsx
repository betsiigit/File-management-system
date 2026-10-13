
"use client";

import { useState, type FormEvent } from "react";

export type RegisteredFileData = {
  fileType: "Incoming" | "Outgoing";
  reference: string;
  date: string;
  pages: number;
  department: string;
  assignedOfficer: string;
  title: string;
  remarks: string;
  attachment: File | null;
};

type FileRegistrationFormProps = {
  departments: string[];
  officers?: string[];
  onRegister: (file: RegisteredFileData) => void;
  onCancel?: () => void;
};

export default function FileRegistrationForm({
  departments,
  officers = [],
  onRegister,
  onCancel,
}: FileRegistrationFormProps) {
  const [fileType, setFileType] = useState<"Incoming" | "Outgoing">("Incoming");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState("");
  const [pages, setPages] = useState("1");
  const [department, setDepartment] = useState("");
  const [assignedOfficer, setAssignedOfficer] = useState("");
  const [title, setTitle] = useState("");
  const [remarks, setRemarks] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [error, setError] = useState("");

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !reference.trim() ||
      !date ||
      !department ||
      !title.trim() ||
      !pages ||
      Number(pages) < 1 ||
      !Number.isInteger(Number(pages))
    ) {
      setError("Please complete all required fields with valid values.");
      return;
    }

    setError("");

    onRegister({
  fileType,
  reference: reference.trim(),
  date,
  pages: Number(pages),
  department,
  assignedOfficer,
  title: title.trim(),
  remarks: remarks.trim(),
  attachment,
});
  }

  function handleClear() {
    setFileType("Incoming");
    setReference("");
    setDate("");
    setPages("1");
    setDepartment("");
    setAssignedOfficer("");
    setTitle("");
    setRemarks("");
    setAttachment(null);
    setError("");
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-[#092c45] px-6 py-5 text-white">
        <h2 className="text-xl font-bold">Register File</h2>
        <p className="mt-1 text-sm text-slate-300">
          Register and assign an incoming or outgoing office file.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">
              File Type *
            </label>
            <select
              value={fileType}
              onChange={(e) =>
                setFileType(e.target.value as "Incoming" | "Outgoing")
              }
              className={inputClass}
              required
            >
              <option value="Incoming">Incoming</option>
              <option value="Outgoing">Outgoing</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Reference Number *
            </label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g. REF-001"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Registration Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Number of Pages *
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="e.g. 3"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Department *
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">Select department</option>
              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Assigned Officer
            </label>
            <select
              value={assignedOfficer}
              onChange={(e) => setAssignedOfficer(e.target.value)}
              className={inputClass}
            >
              <option value="">Select officer</option>
              {officers.map((officer) => (
                <option key={officer} value={officer}>
                  {officer}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-5 border-t border-slate-200 pt-5">
          <h3 className="font-bold text-[#092c45]">Additional Details</h3>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Subject / File Title *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter subject or file title"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Remarks and Description
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter additional details..."
              rows={4}
              maxLength={2000}
              className={inputClass}
            />
            <p className="mt-1 text-right text-xs text-slate-400">
              {remarks.length}/2000 characters
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">
              Attach Document (optional)
            </label>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={(e) =>
                setAttachment(e.target.files?.[0] ?? null)
              }
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500">
              PDF files only. The attachment is selected locally for now.
            </p>
          </div>
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Clear
          </button>

          <button
            type="submit"
            className="rounded-lg bg-[#092c45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#123f5e]"
          >
            Register File
          </button>
        </div>
      </form>
    </div>
  );
}
