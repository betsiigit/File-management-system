
"use client";

import { useEffect, useRef, useState } from "react";


type HeaderProps = {
  title: string;
  language: "English" | "Amharic";
  onLanguageChange: (language: "English" | "Amharic") => void;
};


export default function Header({
  title,
  language,
  onLanguageChange,
}: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleMenuAction(action: string) {
    setIsOpen(false);

    window.dispatchEvent(
      new CustomEvent("office-header-action", {
        detail: { action },
      })
    );
  }

  function handleLogout() {
    setIsOpen(false);

    if (window.confirm("Are you sure you want to log out?")) {
      window.location.href = "/login";
    }
  }

  return (
    <header className="relative z-40 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 md:px-8">
      {/* Page title */}
      <div className="min-w-0">
        <p className="text-sm text-slate-500">
          Office File Management / {title}
        </p>

        <h2 className="mt-1 text-xl font-bold text-[#092c45]">
          {title}
        </h2>
      </div>

      {/* Language and administrator menu */}
      <div className="ml-auto flex shrink-0 items-center gap-3">
        {/* Language selector - left of profile */}
        <select
          aria-label="Select language"
          value={language}
          
onChange={(event) =>
  onLanguageChange(event.target.value as "English" | "Amharic")
}

          className="max-w-28 cursor-pointer rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-700 outline-none transition hover:bg-slate-50 focus:border-sky-400 sm:max-w-none sm:px-3"
        >
          <option value="English">English</option>
          <option value="Amharic">አማርኛ</option>
        </select>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-haspopup="true"
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 pr-3 transition hover:bg-slate-50"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dce8ef] font-semibold text-[#092c45]">
              A
            </span>

            <span className="hidden text-left sm:block">
              <span className="block text-sm font-semibold text-[#092c45]">
                Office Administrator
              </span>
              <span className="block text-xs text-slate-500">
                Administrator
              </span>
            </span>

            <svg
              className={`h-4 w-4 text-slate-500 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m5 7.5 5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Simple floating menu */}
          {isOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl shadow-slate-900/10"
            >
              <button
                type="button"
                role="menuitem"
                onClick={() => handleMenuAction("profile")}
                className="flex w-full items-center gap-4 px-5 py-3 text-left text-slate-700 transition hover:bg-slate-50"
              >
                <svg
                  className="h-5 w-5 text-slate-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="8"
                    r="3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M5 20c.5-4 3-6 7-6s6.5 2 7 6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
                <span>My Profile</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => handleMenuAction("edit-profile")}
                className="flex w-full items-center gap-4 px-5 py-3 text-left text-slate-700 transition hover:bg-slate-50"
              >
                <svg
                  className="h-5 w-5 text-slate-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="m14 5 5 5M4 20l4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Edit Profile</span>
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => handleMenuAction("settings")}
                className="flex w-full items-center gap-4 px-5 py-3 text-left text-slate-700 transition hover:bg-slate-50"
              >
                <svg
                  className="h-5 w-5 text-slate-500"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="m19 13 2-1-2-1-.5-2 1-2-2-2-2 1-2-.5-1-2-1 2-2 .5-2-1-2 2 1 2-.5 2-2 1 2 1 .5 2-1 2 2 2 2-1 2 .5 1 2 1-2 2-.5 2 1 2-2-1-2 .5-2Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Settings</span>
              </button>

              <div className="my-2 border-t border-slate-200" />

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-4 px-5 py-3 text-left text-slate-700 transition hover:bg-red-50 hover:text-red-600"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M10 17l5-5-5-5M15 12H3m9-8h6a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
