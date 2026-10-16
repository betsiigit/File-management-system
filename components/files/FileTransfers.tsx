
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
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".txt",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

function todayEthiopianDate() {
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

  const inputClass =
    "w-full rounded-lg border border-[#D6E2E8] bg-white px-4 py-3 text-sm text-[#292D32] outline-none transition-colors placeholder:text-[#9298A1] focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/10";

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
      attachmentUrl: attachment
        ? URL.createObjectURL(attachment)
        : undefined,
      direction,
    });

    setEmployeeName("");
    setPages("");
    setOtherParty("");
    setDate(todayEthiopianDate());
    setAttachment(null);

    const fileInput = event.currentTarget.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement | null;

    if (fileInput) fileInput.value = "";
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-lg text-xl ${
            isReceive
              ? "bg-[#E7F1F5] text-[#0A506E]"
              : "bg-[#E7F1F5] text-[#0A506E]"
          }`}
        >
          {isReceive ? "↓" : "↑"}
        </span>

        <div>
          <h3 className="text-lg font-bold text-[#292D32]">
            {isReceive ? "Receive Files" : "Send Files"}
          </h3>
          <p className="text-xs text-[#737B86]">
            {isReceive
              ? "Record documents received from another party."
              : "Record documents sent to another party."}
          </p>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#454B54]">
          Employee Name <span className="text-red-600">*</span>
        </label>
        <input
          required
          value={employeeName}
          onChange={(e) => setEmployeeName(e.target.value)}
          placeholder="e.g. Abdul Kasim"
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#454B54]">
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
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#454B54]">
          {isReceive ? "Received From" : "Sent To"}{" "}
          <span className="text-red-600">*</span>
        </label>
        <input
          required
          value={otherParty}
          onChange={(e) => setOtherParty(e.target.value)}
          placeholder={isReceive ? "e.g. Ministry" : "e.g. Authority"}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#454B54]">
          Date (Eth) <span className="text-red-600">*</span>
        </label>
        <input
          required
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-[#454B54]">
          Attachment <span className="text-[#9298A1]">(optional)</span>
        </label>

        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-[#D6E2E8] bg-[#F8FAFB] px-4 py-4 transition-colors hover:border-[#0A506E] hover:bg-[#E7F1F5]">
          <span className="min-w-0 truncate text-sm text-[#454B54]">
            📎 {attachment ? attachment.name : "Choose a document..."}
          </span>

          <span className="shrink-0 rounded-md border border-[#D6E2E8] bg-white px-3 py-1 text-xs text-[#737B86]">
            Max 5 MB
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

        <p className="mt-2 text-xs text-[#9298A1]">
          Supported formats: PDF, Word, Excel, text, and images.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        className="rounded-lg bg-[#0A506E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#176A87] active:bg-[#135B74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A506E]/30"
      >
        {isReceive ? "↓ Record Received File" : "↑ Record Sent File"}
      </button>
    </form>
  );
}

type TransferTableProps = {
  records: TransferRecord[];
  direction: "Receive" | "Send";
  onDelete: (id: number) => void;
};

function TransferTable({
  records,
  direction,
  onDelete,
}: TransferTableProps) {
  const [showConfirm, setShowConfirm] = useState<number | null>(null);

  const filtered = records.filter(
    (record) => record.direction === direction
  );

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-[#ECEFF2]">
      <div className="border-b border-[#ECEFF2] bg-[#F8FAFB] px-4 py-3">
        <h4 className="text-sm font-semibold text-[#292D32]">
          {direction === "Receive" ? "Received Records" : "Sent Records"}
        </h4>
        <p className="mt-1 text-xs text-[#737B86]">
          {filtered.length} {filtered.length === 1 ? "record" : "records"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-white text-xs uppercase tracking-wide text-[#737B86]">
            <tr>
              {[
                "#",
                "Name",
                "Pages",
                direction === "Receive" ? "From" : "To",
                "Date",
                "Attachment",
                "Action",
              ].map((heading) => (
                <th
                  key={heading}
                  className="border-b border-[#ECEFF2] px-4 py-3 font-semibold"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-[#ECEFF2]">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-[#737B86]"
                >
                  No {direction === "Receive" ? "received" : "sent"} files
                  found.
                </td>
              </tr>
            ) : (
              filtered.map((record, index) => (
                <tr
                  key={record.id}
                  className="transition-colors hover:bg-[#F8FAFB]"
                >
                  <td className="px-4 py-4 text-[#9298A1]">
                    {index + 1}
                  </td>
                  <td className="px-4 py-4 font-medium text-[#292D32]">
                    {record.employeeName}
                  </td>
                  <td className="px-4 py-4 text-[#454B54]">
                    {record.pages}
                  </td>
                  <td className="px-4 py-4 text-[#454B54]">
                    {record.otherParty}
                  </td>
                  <td className="px-4 py-4 text-[#737B86]">
                    {record.date}
                  </td>
                  <td className="max-w-[180px] px-4 py-4">
                    {record.attachmentName ? (
                      <a
                        href={record.attachmentUrl}
                        download={record.attachmentName}
                        className="break-words font-medium text-[#0A506E] underline decoration-[#D6E2E8] underline-offset-2 hover:text-[#176A87]"
                      >
                        {record.attachmentName}
                      </a>
                    ) : (
                      <span className="text-[#9298A1]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {showConfirm === record.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onDelete(record.id);
                            setShowConfirm(null);
                          }}
                          className="rounded-md bg-red-50 px-2 py-1 font-semibold text-red-700 hover:bg-red-100"
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowConfirm(null)}
                          className="rounded-md px-2 py-1 text-[#737B86] hover:bg-[#E7F1F5]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowConfirm(record.id)}
                        className="rounded-md px-2 py-1 font-semibold text-red-700 transition-colors hover:bg-red-50"
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
        record.employeeName
          .toLowerCase()
          .includes(submittedSearch.toLowerCase())
      ),
    [records, submittedSearch]
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

      if (record?.attachmentUrl) {
        URL.revokeObjectURL(record.attachmentUrl);
      }

      return current.filter((item) => item.id !== id);
    });
  }

  return (
    <div className="file-transfers-page space-y-6">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-3 text-2xl font-bold tracking-tight text-[#292D32]">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#E7F1F5] text-xl text-[#0A506E]">
              ↔
            </span>
            Sending and Receiving Files
          </h2>
          <p className="mt-2 text-sm text-[#737B86]">
            Manage incoming and outgoing documents and their attachments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-[#D6E2E8] bg-white px-4 py-2 text-sm font-semibold text-[#0A506E] transition-colors hover:bg-[#E7F1F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A506E]/30 print:hidden"
        >
          Print
        </button>
      </div>

      {/* Search */}
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
          placeholder="Search by employee name..."
          aria-label="Search by employee name"
          className="min-w-0 flex-1 rounded-lg border border-[#D6E2E8] bg-white px-4 py-3 text-sm text-[#292D32] outline-none placeholder:text-[#9298A1] focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/10"
        />

        <button
          type="submit"
          className="rounded-lg bg-[#0A506E] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#176A87] active:bg-[#135B74]"
        >
          Search
        </button>

        {submittedSearch && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setSubmittedSearch("");
            }}
            className="rounded-lg border border-[#D6E2E8] bg-white px-4 py-3 text-sm font-semibold text-[#454B54] transition-colors hover:bg-[#F8FAFB]"
          >
            Clear
          </button>
        )}
      </form>

      {/* Receive and Send panels */}
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <section className="min-w-0 rounded-xl border border-[#ECEFF2] bg-white p-5 shadow-sm md:p-6">
          <TransferForm direction="Receive" onSave={saveRecord} />
          <TransferTable
            records={visibleRecords}
            direction="Receive"
            onDelete={deleteRecord}
          />
        </section>

        <section className="min-w-0 rounded-xl border border-[#ECEFF2] bg-white p-5 shadow-sm md:p-6">
          <TransferForm direction="Send" onSave={saveRecord} />
          <TransferTable
            records={visibleRecords}
            direction="Send"
            onDelete={deleteRecord}
          />
        </section>
      </div>

      <p className="text-xs text-[#9298A1]">
        Frontend demo · Transfer records reset when the page is refreshed.
        Attachments are held temporarily in the browser.
      </p>
    </div>
  );
}
