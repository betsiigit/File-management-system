
"use client";

import { useState, type FormEvent } from "react";

export type RegisteredFileData = {
  fileType: "Incoming" | "Outgoing";
  reference: string;
  volume:string;
  status: string;
  outgoing_date: string;
  date: string;
  pages: number;
  department: string;
  assignedOfficer: string;
  title: string;
  remarks: string;
  
attachments: File[];
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
  const [volume, setVolume] = useState("");
const [outgoing_date, setOutgoingDate] = useState("");
  const [date, setDate] = useState("");
  const [pages, setPages] = useState("1");
  const [department, setDepartment] = useState("");
  const [assignedOfficer, setAssignedOfficer] = useState("");
  const [title, setTitle] = useState("");
  const [remarks, setRemarks] = useState("");
 const [attachments, setAttachments] = useState<File[]>([]);
  const [error, setError] = useState("");

  const inputClass =
    "mt-2 w-full rounded-lg border border-[#D6E2E8] bg-white px-3 py-3 text-sm text-[#292D32] outline-none transition-colors duration-200 placeholder:text-[#9298A1] focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/10";

  const labelClass = "text-sm font-semibold text-[#454B54]";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !reference.trim() ||
      !volume.trim() ||
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
     attachments,
      volume: volume.trim(),
      outgoing_date: fileType === "Outgoing" ? date : "",
      status: "Pending",
    });
  }

  function handleClear() {
    setFileType("Incoming");
    setReference("");
    setVolume("");
    setOutgoingDate("");
    setDate("");
    setPages("1");
    setDepartment("");
    setAssignedOfficer("");
    setTitle("");
    setRemarks("");
    setAttachments([]);
    setError("");
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#ECEFF2] bg-white shadow-sm">
      <div className="border-b border-[#ECEFF2] bg-[#0A506E] px-6 py-5 text-white">
        <h2 className="text-xl font-bold tracking-tight">
          Register File
        </h2>
        <p className="mt-1 text-sm text-white/75">
          Register and assign an incoming or outgoing office file.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
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
            <label className={labelClass}>
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
  <label className={labelClass}>
    Volume *
  </label>
  <input
    type="text"
    value={volume}
    onChange={(e) => setVolume(e.target.value)}
    placeholder="e.g. Volume 1"
    className={inputClass}
    required
  />
</div>

          <div>
            <label className={labelClass}>
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
  <label className={labelClass}>
    Outgoing Date *
  </label>
  <input
    type="date"
    value={outgoing_date}
    onChange={(e) => setOutgoingDate(e.target.value)}
    className={inputClass}
  />
</div>

          <div>
            <label className={labelClass}>
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
            <label className={labelClass}>
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
            <label className={labelClass}>
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

        <div className="space-y-5 border-t border-[#ECEFF2] pt-5">
          <h3 className="font-bold text-[#292D32]">
            Additional Details
          </h3>

          <div>
            <label className={labelClass}>
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
            <label className={labelClass}>
              Remarks and Description
            </label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter additional details..."
              rows={4}
              maxLength={2000}
              className={`${inputClass} resize-y`}
            />
            <p className="mt-1 text-right text-xs text-[#9298A1]">
              {remarks.length}/2000 characters
            </p>
          </div>

          <div>
            <label className={labelClass}>
              Attach Document (optional)
            </label>
           
<input
  type="file"
  accept=".pdf,application/pdf"
  multiple
  onChange={(e) =>
    setAttachments(Array.from(e.target.files || []))
  }
  className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-[#E7F1F5] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#0A506E] hover:file:bg-[#D9EAF0]`}
/>

            <p className="mt-1 text-xs text-[#737B86]">
              PDF files only. The attachment is selected locally for now.
            </p>
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-700"
          >
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-[#ECEFF2] pt-5">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-[#D6E2E8] bg-white px-5 py-3 text-sm font-semibold text-[#454B54] transition-colors duration-200 hover:bg-[#F4F5F9] active:bg-[#ECEFF2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A506E]/30"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-[#D6E2E8] bg-white px-5 py-3 text-sm font-semibold text-[#0A506E] transition-colors duration-200 hover:border-[#0A506E] hover:bg-[#E7F1F5] active:bg-[#D9EAF0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A506E]/30"
          >
            Clear
          </button>

          <button
            type="submit"
            className="rounded-lg bg-[#0A506E] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#176A87] active:bg-[#135B74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A506E]/30"
          >
            Register File
          </button>
        </div>
      </form>
    </div>
  );
}
