
export default function About() {
  const features = [
    "Office file management and tracking",
    "Active and inactive employee tracking",
    "Various jobs logging with quantity",
    "File transfer records and attachments",
    "Letter tracking and document attachments",
    "Reports and charts",
    "Detailed employee information management",
    "Document management for each employee",
    "Bulk employee addition",
  ];

  return (
    <div className="space-y-6">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-[#292D32]">
            About This System
          </h3>
          <p className="mt-1 text-sm text-[#737B86]">
            System information, features, and usage notice.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-[#D6E2E8] bg-white px-4 py-2 text-sm font-semibold text-[#0A506E] transition-colors duration-200 hover:bg-[#E7F1F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A506E]/30 print:hidden"
        >
          Print
        </button>
      </div>

      {/* System information */}
      <section className="overflow-hidden rounded-xl border border-[#ECEFF2] bg-white shadow-sm">
        <div className="bg-[#0A506E] p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/15 text-xl">
              <span aria-hidden="true">▤</span>
            </div>

            <div>
              <h4 className="text-lg font-bold">
                Official Registration &amp; Certification
              </h4>
              <p className="mt-1 text-sm text-white/80">
                Office File Management System
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5 leading-7 text-[#454B54]">
          <p>
            This software is intended to support office file management,
            employee records, file transfers, letter tracking, and related
            administrative tasks.
          </p>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Legal notice</p>
            <p className="mt-1">
              Use, copying, and distribution of this software must comply
              with the applicable ownership, licensing, and intellectual
              property permissions.
            </p>
          </div>

          <div className="rounded-lg border border-[#ECEFF2] bg-[#F8FAFB] p-4 text-sm">
            <p className="font-semibold text-[#292D32]">
              Registration details
            </p>
            <p className="mt-1 text-[#737B86]">
              Add the verified copyright holder, certification authority,
              and registration date here when those details have been
              confirmed for this project.
            </p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="rounded-xl border border-[#ECEFF2] bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h4 className="text-lg font-bold text-[#292D32]">
            System Features
          </h4>
          <p className="mt-1 text-sm text-[#737B86]">
            An overview of the system's main capabilities.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature}
              className="flex items-start gap-3 rounded-lg border border-[#ECEFF2] bg-[#F8FAFB] p-3 transition-colors duration-200 hover:border-[#D6E2E8] hover:bg-[#E7F1F5]"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#E7F1F5] text-xs font-bold text-[#0A506E]">
                ✓
              </span>

              <span className="text-sm leading-6 text-[#454B54]">
                {feature}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Ownership notice */}
      <section className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 font-bold">
            !
          </span>

          <div>
            <h4 className="font-bold">Usage and Ownership Notice</h4>
            <p className="mt-2 leading-6">
              Unauthorized use or distribution may violate applicable
              permissions or laws. Confirm the system's ownership and
              licensing terms before publishing an official legal notice.
            </p>
          </div>
        </div>
      </section>

      {/* Data storage notice */}
      <section className="rounded-xl border border-[#D6E2E8] bg-[#E7F1F5] p-5 text-sm text-[#0A506E]">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-lg">
            ⓘ
          </span>

          <div>
            <h4 className="font-bold">Data Storage</h4>
            <p className="mt-2 leading-6">
              This version is a frontend demo. Records are held in application
              memory and may reset when the page refreshes. Persistent storage
              and server-side authentication will be added when the backend is
              connected.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
