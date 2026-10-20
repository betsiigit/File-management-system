
"use client";

import { useMemo, useState, type FormEvent } from "react";

type JobEntry = {
  id: number;
  date: string;
  quantity: number;
  remarks: string;
  loggedBy: string;
};

function getToday() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function VariousJobs() {
  const [jobs, setJobs] = useState<JobEntry[]>([]);
  const [date, setDate] = useState(getToday());
  const [quantity, setQuantity] = useState("");
  const [remarks, setRemarks] = useState("");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  const total = useMemo(
    () => jobs.reduce((sum, job) => sum + job.quantity, 0),
    [jobs],
  );

  const visibleJobs = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return jobs;

    return jobs.filter(
      (job) =>
        job.date.toLowerCase().includes(term) ||
        job.remarks.toLowerCase().includes(term) ||
        job.loggedBy.toLowerCase().includes(term),
    );
  }, [jobs, search]);

  function resetForm() {
    setDate(getToday());
    setQuantity("");
    setRemarks("");
    setNotice("");
  }

  function handleAddJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");

    const amount = Number(quantity);

    if (!date || !quantity || !Number.isInteger(amount) || amount < 1) {
      setNotice(
        "Please enter a date and a whole-number quantity greater than zero.",
      );
      return;
    }

    const newJob: JobEntry = {
      id: Date.now(),
      date,
      quantity: amount,
      remarks: remarks.trim(),
      loggedBy: "Admin",
    };

    setJobs((current) => [newJob, ...current]);
    resetForm();
    setNotice("Job entry added successfully.");
  }

  function handleDelete(id: number) {
    setJobs((current) => current.filter((job) => job.id !== id));
    setNotice("Job entry deleted.");
  }

  function handleClearAll() {
    if (jobs.length === 0) {
      setNotice("There are no job entries to clear.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to clear all job entries? This cannot be undone.",
    );

    if (confirmed) {
      setJobs([]);
      setSearch("");
      setNotice("All job entries have been cleared.");
    }
  }

  const inputClass =
    "w-full rounded-lg border border-[#D6E2E8] bg-white px-4 py-3 text-sm text-[#292D32] outline-none transition-colors duration-200 placeholder:text-[#9298A1] focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/10";

  const labelClass =
    "mb-2 block text-sm font-semibold text-[#454B54]";

  return (
    <div className="various-jobs-page space-y-6">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#E7F1F5] text-2xl text-[#0A506E]">
            ▤
          </span>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#292D32]">
              Various Jobs
            </h2>
            <p className="mt-1 text-sm text-[#737B86]">
              Record, track, and manage daily office job entries.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-[#D6E2E8] bg-white px-5 py-2.5 text-sm font-semibold text-[#0A506E] transition-colors duration-200 hover:border-[#0A506E] hover:bg-[#E7F1F5] active:bg-[#D9EAF0] print:hidden"
        >
          ▣ Print
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#ECEFF2] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#D6E2E8] hover:shadow-md">
          <p className="text-sm font-medium text-[#737B86]">
            Total Job Entries
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#292D32]">
            {jobs.length}
          </p>
          <p className="mt-1 text-sm text-[#9298A1]">
            All recorded jobs
          </p>
        </div>

        <div className="rounded-xl border border-[#ECEFF2] bg-white p-5 shadow-sm transition-all duration-200 hover:border-[#D6E2E8] hover:shadow-md">
          <p className="text-sm font-medium text-[#737B86]">
            Total Quantity
          </p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-[#0A506E]">
            {total.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-[#9298A1]">
            Combined quantity of all job entries
          </p>
        </div>
      </div>

      {/* Entry form */}
      <section className="overflow-hidden rounded-xl border border-[#ECEFF2] bg-white shadow-sm">
        <div className="border-b border-[#ECEFF2] px-6 py-5">
          <h3 className="text-lg font-bold text-[#292D32]">
            Log Job Entries
          </h3>
          <p className="mt-1 text-sm text-[#737B86]">
            Enter the job details below to add a record.
          </p>
        </div>

        <form onSubmit={handleAddJob} className="space-y-5 p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="job-date" className={labelClass}>
                Date (Eth) <span className="text-red-600">*</span>
              </label>
              <input
                id="job-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="job-quantity" className={labelClass}>
                Quantity <span className="text-red-600">*</span>
              </label>
              <input
                id="job-quantity"
                type="number"
                min="1"
                step="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
                className={inputClass}
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="job-remarks" className={labelClass}>
                Remarks
              </label>
              <textarea
                id="job-remarks"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter job description or additional remarks..."
                className={`${inputClass} resize-y`}
              />
            </div>
          </div>

          {notice && (
            <p
              role="status"
              aria-live="polite"
              className={`rounded-lg border p-3 text-sm ${
                notice.includes("successfully") ||
                notice.includes("deleted.") ||
                notice.includes("cleared.")
                  ? "border-[#D6E2E8] bg-[#E7F1F5] text-[#0A506E]"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              {notice}
            </p>
          )}

          <div className="flex flex-wrap gap-3 print:hidden">
            <button
              type="submit"
              className="rounded-lg bg-[#0A506E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#176A87] active:bg-[#135B74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A506E]/30"
            >
              + Add Job
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-[#D6E2E8] bg-white px-5 py-3 text-sm font-semibold text-[#454B54] transition-colors duration-200 hover:bg-[#F4F5F9] active:bg-[#ECEFF2]"
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {/* Job history */}
      <section className="overflow-hidden rounded-xl border border-[#ECEFF2] bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ECEFF2] p-5 md:p-6">
          <div>
            <h3 className="text-lg font-bold text-[#292D32]">
              Job History
            </h3>
            <p className="mt-1 text-sm text-[#737B86]">
              View and manage recorded job entries.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearAll}
            className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors duration-200 hover:bg-red-50 print:hidden"
          >
            Clear All
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-sm text-[#737B86]">
            Total: <strong className="text-[#292D32]">{total}</strong>
          </p>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search date, remarks, or employee..."
            aria-label="Search job entries"
            className={`${inputClass} sm:max-w-sm print:hidden`}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-[#F8FAFB] text-xs uppercase tracking-wide text-[#737B86]">
              <tr>
                {[
                  "#",
                  "Date (Eth)",
                  "Quantity",
                  "Remarks",
                  "Logged By",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    className="border-y border-[#ECEFF2] px-5 py-4 font-semibold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[#ECEFF2]">
              {visibleJobs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-[#737B86]"
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#F4F5F9] text-xl text-[#0A506E]">
                      ▤
                    </div>
                    <p className="font-semibold text-[#454B54]">
                      {jobs.length === 0
                        ? "No job entries yet."
                        : "No matching job entries."}
                    </p>
                    <p className="mt-1 text-xs text-[#9298A1]">
                      {jobs.length === 0
                        ? "Add a job using the form above."
                        : "Try a different search term."}
                    </p>
                  </td>
                </tr>
              ) : (
                visibleJobs.map((job, index) => (
                  <tr
                    key={job.id}
                    className="transition-colors duration-150 hover:bg-[#F8FAFB]"
                  >
                    <td className="px-5 py-4 text-[#9298A1]">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-[#454B54]">
                      {job.date}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-lg bg-[#E7F1F5] px-3 py-1.5 font-semibold text-[#0A506E]">
                        {job.quantity}
                      </span>
                    </td>
                    <td className="max-w-xs whitespace-pre-wrap px-5 py-4 text-[#737B86]">
                      {job.remarks || "—"}
                    </td>
                    <td className="px-5 py-4 text-[#454B54]">
                      {job.loggedBy}
                    </td>
                    <td className="px-5 py-4 print:hidden">
                      <button
                        type="button"
                        onClick={() => handleDelete(job.id)}
                        className="rounded-lg px-3 py-2 font-semibold text-red-700 transition-colors duration-200 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-[#ECEFF2] bg-[#F8FAFB] px-5 py-4 text-sm text-[#737B86]">
          Showing {visibleJobs.length} of {jobs.length} job entries
        </div>
      </section>

      <p className="text-xs text-[#9298A1]">
        Frontend demo · Job entries reset when the page is refreshed.
      </p>
    </div>
  );
}
