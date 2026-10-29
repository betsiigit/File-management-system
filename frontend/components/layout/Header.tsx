
"use client";

import { useEffect, useRef, useState } from "react";
import {
  UserRound,
  Pencil,
  Settings,
  LogOut,
  ChevronDown,
  Globe,
  Sun,
  Moon,
} from "lucide-react";

import { useTheme } from "@/components/providers/ThemeProvider";
const pageDescriptions: Record<string, string> = {
  Dashboard: "Get an overview of office files and activities.",
  "Office Files": "View, search, and manage registered office files.",
  "Register File": "Register new files and record their details.",
  "Various Jobs": "Track and manage various office activities.",
  "Active Employees": "View and manage active employees.",
  "Inactive Employees": "Review records of inactive employees.",
  "User Management": "Manage system users and their access permissions.",
  About: "Learn more about the ECC File Management System.",
};

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


  function formatRole(role?: string) {
  const roles: Record<string, string> = {
    ADMIN: "Administrator",
    REGISTRAR: "Registrar",
    OFFICER: "Officer",
    VIEWER: "Viewer",
  };

  return role ? roles[role.toUpperCase()] || role : "";
}
  const [isOpen, setIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
  fullName: string;
  role: string;
  branchName?: string | null;
} | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        event.target instanceof Node &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
  try {
    const savedUser = localStorage.getItem("currentUser");

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  } catch (error) {
    console.error("Unable to load current user profile:", error);
  }
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
    <header className="sticky top-0 z-40 flex min-h-[64px] items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-2.5 md:px-8">
      <div className="min-w-0">
        {/* <p className="text-xs font-medium text-[#9298A1] sm:text-sm">
          Office File Management
          <span className="mx-2 text-[#D5D9DF]">/</span>
          <span className="text-[#737B86]">{title}</span>
        </p> */}

        <h2 className="mt-1 text-lg font-semibold tracking-tight text-[#292D32] sm:text-xl">
          {title}
        </h2>
         <p className="mt-1 text-sm text-[#737B86]">
    {pageDescriptions[title] ?? "Manage and organize office files efficiently."}
  </p>
      </div>
      <div className="ml-auto flex shrink-0 items-center gap-3">
        <button
  type="button"
  onClick={toggleTheme}
  aria-label={
    theme === "light"
      ? "Switch to dark mode"
      : "Switch to light mode"
  }
  title={
    theme === "light"
      ? "Switch to dark mode"
      : "Switch to light mode"
  }
  className="flex h-10 w-10 items-center justify-center rounded-lg text-[#737B86] transition-colors duration-200 hover:bg-[#E7F1F5] hover:text-[#0A506E]"
>
  {theme === "light" ? (
    <Moon size={20} strokeWidth={1.7} />
  ) : (
    <Sun size={20} strokeWidth={1.7} />
  )}
</button>
        <div className="relative">
  <button
    type="button"
    aria-label="Choose language"
    aria-expanded={isLanguageOpen}
    title="Choose language"
    onClick={() => setIsLanguageOpen((open) => !open)}
    className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors duration-200 ${
      isLanguageOpen
        ? "bg-[#E7F1F5] text-[#0A506E]"
        : "text-[#737B86] hover:bg-[#E7F1F5] hover:text-[#0A506E]"
    }`}
  >
    <Globe size={20} strokeWidth={1.7} />
  </button>

  <div
    className={`absolute right-0 top-full z-50 mt-2 origin-top-right transition-all duration-200 ease-out ${
      isLanguageOpen
        ? "visible translate-y-0 scale-100 opacity-100"
        : "invisible -translate-y-2 scale-95 opacity-0"
    }`}
  >
    <div className="flex items-center gap-1 rounded-xl border border-[#ECEFF2] bg-white p-1.5 shadow-lg shadow-slate-900/[0.07]">
      <button
        type="button"
        onClick={() => {
          onLanguageChange("English");
          setIsLanguageOpen(false);
        }}
        className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
          language === "English"
            ? "bg-[#E7F1F5] text-[#0A506E]"
            : "text-[#737B86] hover:bg-[#F4F5F9] hover:text-[#292D32]"
        }`}
      >
        EN
      </button>

      <button
        type="button"
        onClick={() => {
          onLanguageChange("Amharic");
          setIsLanguageOpen(false);
        }}
        className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors duration-200 ${
          language === "Amharic"
            ? "bg-[#E7F1F5] text-[#0A506E]"
            : "text-[#737B86] hover:bg-[#F4F5F9] hover:text-[#292D32]"
        }`}
      >
        AM
      </button>
    </div>
  </div>
</div>

        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen((open) => !open)}
            aria-expanded={isOpen}
            aria-haspopup="true"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-200 ${
  isOpen
    ? "bg-[#E7F1F5]"
    : "hover:bg-[#F4F5F9]"
}`}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E7F1F5] text-[#0A506E]">
              <UserRound size={19} strokeWidth={1.7} />
            </span>

           <span className="hidden text-right sm:block">
  <span className="block text-sm font-semibold text-[#292D32]">
   {currentUser?.fullName || "Loading profile..."}
  </span>
  <span className="mt-0.5 block text-xs text-[#737B86]">
 {formatRole(currentUser?.role)}
  </span>
</span>

<ChevronDown
  size={16}
  strokeWidth={1.7}
  className={`text-[#737B86] transition-transform duration-200 ${
    isOpen ? "rotate-180" : ""
  }`}
/>
          </button>

          {isOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-[#ECEFF2] bg-white py-2 shadow-lg shadow-slate-900/[0.07]"
            >
              <div className="border-b border-[#ECEFF2] px-4 py-3">
                <p className="text-sm font-semibold text-[#292D32]">
                  {currentUser?.fullName || "Loading profile..."}
                </p>
                <p className="mt-0.5 text-xs text-[#9298A1]">
                {formatRole(currentUser?.role)}
                </p>
              </div>

              <button
                type="button"
                role="menuitem"
                onClick={() => handleMenuAction("profile")}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#454B54] transition-colors duration-200 hover:bg-[#E7F1F5] hover:text-[#0A506E]"
              >
                <UserRound size={18} strokeWidth={1.7} />
                My Profile
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => handleMenuAction("edit-profile")}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#454B54] transition-colors duration-200 hover:bg-[#E7F1F5] hover:text-[#0A506E]"
              >
                <Pencil size={18} strokeWidth={1.7} />
                Edit Profile
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => handleMenuAction("settings")}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#454B54] transition-colors duration-200 hover:bg-[#E7F1F5] hover:text-[#0A506E]"
              >
                <Settings size={18} strokeWidth={1.7} />
                Settings
              </button>

              <div className="my-1 border-t border-[#ECEFF2]" />

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#454B54] transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
              >
                <LogOut size={18} strokeWidth={1.7} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}