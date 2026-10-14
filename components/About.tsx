
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl font-bold text-[#092c45]">
            About This System
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            System information, features, and usage notice.
          </p>
        </div>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Print
        </button>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="bg-[#092c45] p-5 text-white">
          <h4 className="text-lg font-bold">
            Official Registration &amp; Certification
          </h4>
          <p className="mt-1 text-sm text-slate-200">
            Office File Management System
          </p>
        </div>

        <div className="space-y-4 p-5 leading-7 text-slate-700">
          <p>
            This software is intended to support office file management,
            employee records, file transfers, letter tracking, and related
            administrative tasks.
          </p>

          <p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm">
            <strong>Legal notice:</strong> Use, copying, and distribution
            of this software must comply with the applicable ownership,
            licensing, and intellectual property permissions.
          </p>

          <p className="text-sm">
            <strong>Registration details:</strong> Add the verified
            copyright holder, certification authority, and registration
            date here when those details have been confirmed for this
            project.
          </p>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h4 className="mb-4 text-lg font-bold text-[#092c45]">
          System Features
        </h4>
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature}
              className="flex items-start gap-3 rounded-lg bg-slate-50 p-3"
            >
              <span className="font-bold text-amber-600">✓</span>
              <span className="text-sm text-slate-700">{feature}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900">
        <h4 className="font-bold">Usage and ownership notice</h4>
        <p className="mt-2">
          Unauthorized use or distribution may violate applicable
          permissions or laws. Confirm the system's ownership and licensing
          terms before publishing an official legal notice.
        </p>
      </section>

      <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-950">
        <p className="font-semibold">Data storage</p>
        <p className="mt-1">
          This version is a frontend demo. Records are held in application
          memory and may reset when the page refreshes. Persistent storage
          and server-side authentication will be added when the backend is
          connected.
        </p>
      </section>
    </div>
  );
}
