
"use client";

import { useMemo, useState, type FormEvent } from "react";

type TransferRecord = {
  id: number;
  employeeName: string;
  pages: number;
  otherParty: string;
  date: string;
  attachmentName: string;
  attachmentUrl?: string;
  direction: "Receive" | "Send";
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const allowedExtensions = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx",
  ".txt", ".png", ".jpg", ".jpeg", ".webp",
];

function todayEthiopianDate() {
  // Use the current local calendar date as the initial form value.
  // The input uses ISO date format, just like the screenshot.
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

type TransferFormProps = {
  direction: "Receive" | "Send";
  onSave: (record: Omit<TransferRecord, "id">) => void;
};

function TransferForm({ direction, onSave }: TransferFormProps) {
  const [employeeName, setEmployeeName] = useState("");
  const [pages, setPages] = useState("");
  const [otherParty, setOtherParty] = useState("");
  const [date, setDate] = useState(todayEthiopianDate());
  const [attachment, setAttachment] = useState<File | null>(null);
  const [error, setError] = useState("");

  const isReceive = direction === "Receive";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!employeeName.trim() || !otherParty.trim() || !pages || !date) {
      setError("Please complete all required fields.");
      return;
    }

    const pageCount = Number(pages);

    if (!Number.isInteger(pageCount) || pageCount < 1) {
      setError("Page count must be a whole number greater than zero.");
      return;
    }

    if (attachment) {
      const extension = attachment.name
        .slice(attachment.name.lastIndexOf("."))
        .toLowerCase();

      if (attachment.size > MAX_FILE_SIZE) {
        setError("The attachment must be 5 MB or smaller.");
        return;
      }

      if (!allowedExtensions.includes(extension)) {
        setError("Please attach a PDF, Word, Excel, text, or image file.");
        return;
      }
    }

    onSave({
      employeeName: employeeName.trim(),
      pages: pageCount,
      otherParty: otherParty.trim(),
      date,
      attachmentName: attachment?.name || "",
      attachmentUrl: attachment ? URL.createObjectURL(attachment) : undefined,
      direction,
    });

    setEmployeeName("");
    setPages("");
    setOtherParty("");
    setDate(todayEthiopianDate());
    setAttachment(null);

    const fileInput = event.currentTarget.querySelector(
      'input[type="file"]',
    ) as HTMLInputElement | null;

    if (fileInput) fileInput.value = "";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h3 className="flex items-center gap-2 text-xl font-bold text-[#092c45]">
        <span className={isReceive ? "text-emerald-600" : "text-red-600"}>
          {isReceive ? "↓" : "↑"}
        </span>
        {isReceive ? "Receive Files" : "Send Files"}
      </h3>

      <div>
        <label className="mb-2 block text-sm font-semibold">
          Employee Name <span className="text-red-600">*</span>
        </label>
        <input
          required
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
          placeholder="e.g. Abdul Kasim"
          className="w-full rounded-xl border border-slate-200 px-5 py-3 outline-none focus:border-[#092c45] focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">
          Page Count <span className="text-red-600">*</span>
        </label>
        <input
          required
          type="number"
          min="1"
          step="1"
          value={pages}
          onChange={(e) => setPages(e.target.value)}
          placeholder="Number of pages"
          className="w-full rounded-xl border border-slate-200 px-5 py-3 outline-none focus:border-[#092c45] focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">
          {isReceive ? "Received From" : "Sent To"}{" "}
          <span className="text-red-600">*</span>
        </label>
        <input
          required
          value={otherParty}
          onChange={(e) => setOtherParty(e.target.value)}
          placeholder={isReceive ? "e.g. Ministry" : "e.g. Authority"}
          className="w-full rounded-xl border border-slate-200 px-5 py-3 outline-none focus:border-[#092c45] focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">
          Date (Eth) <span className="text-red-600">*</span>
        </label>
        <input
          required
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-5 py-3 outline-none focus:border-[#092c45] focus:ring-2 focus:ring-blue-100"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold">
          📎 Attach Document (optional)
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-4 hover:bg-slate-100">
          <span className="min-w-0 truncate text-sm text-slate-600">
            📎 {attachment ? attachment.name : "Choose a file..."}
          </span>
          <span className="shrink-0 rounded-full border bg-white px-3 py-1 text-xs text-slate-500">
            Max 5MB
          </span>
          <input
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.png,.jpg,.jpeg,.webp"
            className="sr-only"
            onChange={(e) => {
              setError("");
              setAttachment(e.target.files?.[0] || null);
            }}
          />
        </label>
        <p className="mt-2 text-sm text-slate-500">
          Supported: PDF, Word, Excel, Text, Images
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white ${
          isReceive
            ? "bg-emerald-700 hover:bg-emerald-800"
            : "bg-[#092c45] hover:bg-[#124766]"
        }`}
      >
        ▣ Record {direction}
      </button>
    </form>
  );
}

type TransferTableProps = {
  records: TransferRecord[];
  direction: "Receive" | "Send";
  onDelete: (id: number) => void;
};

function TransferTable({ records, direction, onDelete }: TransferTableProps) {
  const [showConfirm, setShowConfirm] = useState<number | null>(null);

  const filtered = records.filter((record) => record.direction === direction);

  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full min-w-[650px] text-left text-sm">
        <thead className="bg-slate-50 text-[#092c45]">
          <tr>
            {["#", "Name", "Pages", direction === "Receive" ? "From" : "To", "Date", "Attachment", "Action"].map((heading) => (
              <th key={heading} className="border-b border-slate-200 px-4 py-4 font-bold">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-4 py-7 text-center text-slate-500">
                No {direction.toLowerCase()}ed files.
              </td>
            </tr>
          ) : (
            filtered.map((record, index) => (
              <tr key={record.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-4">{index + 1}</td>
                <td className="px-4 py-4 font-medium">{record.employeeName}</td>
                <td className="px-4 py-4">{record.pages}</td>
                <td className="px-4 py-4">{record.otherParty}</td>
                <td className="px-4 py-4">{record.date}</td>
                <td className="px-4 py-4">
                  {record.attachmentName ? (
                    <a
                      href={record.attachmentUrl}
                      download={record.attachmentName}
                      className="text-blue-700 underline"
                    >
                      {record.attachmentName}
                    </a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  {showConfirm === record.id ? (
                    <span className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onDelete(record.id);
                          setShowConfirm(null);
                        }}
                        className="font-semibold text-red-700"
                      >
                        Confirm
                      </button>
                      <button type="button" onClick={() => setShowConfirm(null)}>
                        Cancel
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowConfirm(record.id)}
                      className="font-semibold text-red-700 hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default function FileTransfers() {
  const [records, setRecords] = useState<TransferRecord[]>([]);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const visibleRecords = useMemo(
    () =>
      records.filter((record) =>
        record.employeeName.toLowerCase().includes(submittedSearch.toLowerCase()),
      ),
    [records, submittedSearch],
  );

  function saveRecord(record: Omit<TransferRecord, "id">) {
    setRecords((current) => [
      { ...record, id: Date.now() },
      ...current,
    ]);
  }

  function deleteRecord(id: number) {
    setRecords((current) => {
      const record = current.find((item) => item.id === id);
      if (record?.attachmentUrl) URL.revokeObjectURL(record.attachmentUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  return (
    <div className="file-transfers-page space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 text-2xl font-bold text-[#092c45]">
          <span className="text-amber-600">↔</span>
          Sending and Receiving Files
        </h2>
        <span className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-500">
          Incoming &amp; outgoing · Attachments supported
        </span>
        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl border-2 border-[#092c45] px-5 py-2 font-semibold text-[#092c45] hover:bg-slate-50 print:hidden"
        >
          ▣ Print
        </button>
      </div>

      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmittedSearch(search.trim());
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 outline-none focus:border-[#092c45] focus:ring-2 focus:ring-blue-100"
        />
        <button
          type="submit"
          className="rounded-xl bg-[#092c45] px-6 py-3 font-semibold text-white hover:bg-[#124766]"
        >
          🔎 Search
        </button>
        {submittedSearch && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSubmittedSearch("");
            }}
            className="rounded-xl border px-4 py-3 text-slate-600"
          >
            Clear
          </button>
        )}
      </form>

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
          <TransferForm direction="Receive" onSave={saveRecord} />
          <TransferTable
            records={visibleRecords}
            direction="Receive"
            onDelete={deleteRecord}
          />
        </section>

        <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
          <TransferForm direction="Send" onSave={saveRecord} />
          <TransferTable
            records={visibleRecords}
            direction="Send"
            onDelete={deleteRecord}
          />
        </section>
      </div>

      <p className="text-xs text-slate-400">
        Frontend demo · Transfer records reset when the page is refreshed. Files are held temporarily in this browser session.
      </p>
    </div>
  );
}
