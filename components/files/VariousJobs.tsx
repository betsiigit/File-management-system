
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
      setNotice("Please enter a date and a whole-number quantity greater than zero.");
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

  return (
    <div className="various-jobs-page space-y-6">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl text-[#092c45]">
              ▤
            </span>
            <div>
              <h2 className="text-2xl font-bold text-[#092c45]">
                Various Jobs
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Record, track, and manage daily office job entries.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl border-2 border-[#092c45] px-5 py-2.5 font-semibold text-[#092c45] transition hover:bg-slate-50 print:hidden"
        >
          ▣ Print
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Job Entries
          </p>
          <p className="mt-2 text-3xl font-bold text-[#092c45]">
            {jobs.length}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            All recorded jobs
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Quantity
          </p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {total.toLocaleString()}
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Combined quantity of all job entries
          </p>
        </div>
      </div>

      {/* Entry form */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-6 py-5">
          <h3 className="text-lg font-bold text-[#092c45]">
            Log Job Entries
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Enter the job details below to add a record.
          </p>
        </div>

        <form onSubmit={handleAddJob} className="space-y-5 p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label
                htmlFor="job-date"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Date (Eth) <span className="text-red-600">*</span>
              </label>
              <input
                id="job-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#092c45] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label
                htmlFor="job-quantity"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
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
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#092c45] focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="md:col-span-2">
              <label
                htmlFor="job-remarks"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Remarks
              </label>
              <textarea
                id="job-remarks"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter job description or additional remarks..."
                className="w-full resize-y rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-[#092c45] focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {notice && (
            <p
              role="status"
              className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800"
            >
              {notice}
            </p>
          )}

          <div className="flex flex-wrap gap-3 print:hidden">
            <button
              type="submit"
              className="rounded-xl bg-[#092c45] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#124766]"
            >
              + Add Job
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {/* Job history */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 md:p-6">
          <div>
            <h3 className="text-lg font-bold text-[#092c45]">
              Job History
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              View and manage recorded job entries.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClearAll}
            className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 print:hidden"
          >
            Clear All
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 p-5">
          <p className="text-sm text-slate-600">
            Total: <strong className="text-[#092c45]">{total}</strong>
          </p>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search date, remarks, or employee..."
            aria-label="Search job entries"
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#092c45] sm:max-w-sm print:hidden"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-slate-50 text-[#092c45]">
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
                    className="border-y border-slate-200 px-5 py-4 font-bold"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visibleJobs.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                      ▤
                    </div>
                    <p className="font-semibold text-slate-600">
                      {jobs.length === 0
                        ? "No job entries yet."
                        : "No matching job entries."}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
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
                    className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-slate-500">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap px-5 py-4">
                      {job.date}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-blue-50 px-3 py-1.5 font-semibold text-[#092c45]">
                        {job.quantity}
                      </span>
                    </td>
                    <td className="max-w-xs whitespace-pre-wrap px-5 py-4 text-slate-600">
                      {job.remarks || "—"}
                    </td>
                    <td className="px-5 py-4">{job.loggedBy}</td>
                    <td className="px-5 py-4 print:hidden">
                      <button
                        type="button"
                        onClick={() => handleDelete(job.id)}
                        className="rounded-lg px-3 py-2 font-semibold text-red-700 transition hover:bg-red-50"
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

        <div className="border-t border-slate-100 bg-slate-50 px-5 py-4 text-sm text-slate-500">
          Showing {visibleJobs.length} of {jobs.length} job entries
        </div>
      </section>

      <p className="text-xs text-slate-400">
        Frontend demo · Job entries reset when the page is refreshed.
      </p>
    </div>
  );
}
