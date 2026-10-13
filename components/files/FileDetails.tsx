
"use client";

import type { OfficeFile } from "./FileTable";

type FileDetailsProps = {
  file: OfficeFile;
  onBack: () => void;
};

export default function FileDetails({
  file,
  onBack,
}: FileDetailsProps) {
  return (
    <div className="max-w-3xl space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-[#092c45] hover:bg-slate-50"
      >
        ← Back to Files
      </button>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[#092c45] p-6 text-white">
          <p className="text-sm text-slate-300">
            File Reference
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            {file.reference}
          </h2>

          <p className="mt-2 text-sm text-slate-300">
            Office File Details
          </p>
        </div>

        <div className="grid gap-6 p-6 sm:grid-cols-2">
          <div>
            <p className="text-sm text-slate-500">File Name</p>
            <p className="mt-1 font-semibold text-[#092c45]">
              {file.title}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Department</p>
            <p className="mt-1 font-semibold text-[#092c45]">
              {file.department}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Registration Date
            </p>
            <p className="mt-1 font-semibold text-[#092c45]">
              {file.date}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Status</p>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                file.status === "Approved"
                  ? "bg-emerald-100 text-emerald-700"
                  : file.status === "Pending"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-200 text-slate-600"
              }`}
            >
              {file.status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
