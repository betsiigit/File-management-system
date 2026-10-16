
"use client";

import {
  LayoutDashboard,
  FilePlus2,
  Files,
  ArrowLeftRight,
  BriefcaseBusiness,
  UserRound,
  UserRoundX,
  ChartNoAxesColumn,
  Users,
  Info,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Image from "next/image";

const sidebarTranslations = {
  English: {
    Dashboard: "Dashboard",
    "Register File": "Register File",
    "All Files": "All Files",
    "File Transfers": "File Transfers",
    "Various Jobs": "Various Jobs",
    "Active Employees": "Active Employees",
    "Inactive Employees": "Inactive Employees",
    Reports: "Reports",
    "User Management": "User Management",
    About: "About",
    "Main Menu": "Main Menu",
    Admin: "Admin",
    "Office Files": "Office Files",
    "Management System": "Management System",
  },
  Amharic: {
    Dashboard: "ዳሽቦርድ",
    "Register File": "ፋይል መዝግብ",
    "All Files": "ሁሉም ፋይሎች",
    "File Transfers": "የፋይል ማስተላለፊያ",
    "Various Jobs": "የተለያዩ ስራዎች",
    "Active Employees": "ንቁ ሰራተኞች",
    "Inactive Employees": "ንቁ ያልሆኑ ሰራተኞች",
    Reports: "ሪፖርቶች",
    "User Management": "የተጠቃሚ አስተዳደር",
    About: "ስለ ስርዓቱ",
    "Main Menu": "ዋና ምናሌ",
    Admin: "አስተዳዳሪ",
    "Office Files": "የቢሮ ፋይሎች",
    "Management System": "የአስተዳደር ስርዓት",
  },
};

type Language = "English" | "Amharic";

type SidebarProps = {
  activeMenu: string;
  onNavigate: (menu: string) => void;
  language?: Language;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export default function Sidebar({
  activeMenu,
  onNavigate,
  language = "English",
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const st = sidebarTranslations[language];

  const mainMenuItems = [
    { key: "Dashboard", label: st.Dashboard, icon: LayoutDashboard },
    { key: "Register File", label: st["Register File"], icon: FilePlus2 },
    { key: "All Files", label: st["All Files"], icon: Files },
    {
      key: "File Transfers",
      label: st["File Transfers"],
      icon: ArrowLeftRight,
    },
    {
      key: "Various Jobs",
      label: st["Various Jobs"],
      icon: BriefcaseBusiness,
    },
    {
      key: "Active Employees",
      label: st["Active Employees"],
      icon: UserRound,
    },
    {
      key: "Inactive Employees",
      label: st["Inactive Employees"],
      icon: UserRoundX,
    },
    { key: "Reports", label: st.Reports, icon: ChartNoAxesColumn },
  ];

  const adminMenuItems = [
    { key: "User Management", label: st["User Management"], icon: Users },
    { key: "About", label: st.About, icon: Info },
  ];

  const renderMenuItems = (
    items: typeof mainMenuItems | typeof adminMenuItems
  ) =>
    items.map((item) => {
      const isActive =
        activeMenu === item.key || activeMenu === item.label;
      const Icon = item.icon;

      return (
        <button
          key={item.key}
          type="button"
          onClick={() => onNavigate(item.key)}
          title={collapsed ? item.label : undefined}
          aria-current={isActive ? "page" : undefined}
          className={`flex w-full items-center rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A506E]/30 ${
            collapsed ? "justify-center" : "gap-3"
          } ${
            isActive
              ? "bg-[#0A506E] text-white"
              : "text-[#454B54] hover:bg-[#E7F1F5] hover:text-[#0A506E]"
          }`}
        >
          <Icon
            size={18}
            strokeWidth={1.7}
            className={
              isActive
                ? "shrink-0 text-white"
                : "shrink-0 text-[#737B86]"
            }
          />

          {!collapsed && <span>{item.label}</span>}
        </button>
      );
    });

  return (
    <aside
      className={`sidebar-scroll flex w-full shrink-0 flex-col border-r border-[#ECEFF2] bg-white text-[#292D32] transition-[width] duration-300 md:fixed md:inset-y-0 md:left-0 md:h-screen md:overflow-y-auto ${
        collapsed ? "md:w-20" : "md:w-64"
      }`}
    >
      
      {/* Logo and system name */}
      <div
        className={`flex border-b border-[#ECEFF2] py-5 ${
          collapsed
            ? "flex-col items-center gap-3 px-3"
            : "flex-row items-center justify-between gap-3 px-5"
        }`}
      >
        <div
          className={`flex min-w-0 items-center gap-3 ${
            collapsed ? "justify-center" : ""
          }`}
        >
         <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white">
  <Image
    src="/logo.png"
    alt="ECC logo"
    fill
    sizes="40px"
    className="object-contain"
    priority
  />
</div>

         {!collapsed && (
  <div className="min-w-0">
    <h1 className="text-sm font-semibold tracking-tight text-[#292D32]">
      ECC .FMS
    </h1>

    <p className="mt-0.5 text-[11px] text-[#737B86]">
      Ethiopian Customs Commission
    </p>
  </div>
)}
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#737B86] transition-colors hover:bg-[#E7F1F5] hover:text-[#0A506E]"
          >
            {collapsed ? (
              <PanelLeftOpen size={18} strokeWidth={1.7} />
            ) : (
              <PanelLeftClose size={18} strokeWidth={1.7} />
            )}
          </button>
        )}
      </div>


      {/* Navigation */}
      <div className="flex-1 px-3 py-5">
        {!collapsed && (
          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9298A1]">
            {st["Main Menu"]}
          </p>
        )}

        <nav className="flex flex-col gap-1">
          {renderMenuItems(mainMenuItems)}
        </nav>

        {!collapsed && (
          <p className="mb-3 mt-7 px-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9298A1]">
            {st.Admin}
          </p>
        )}

        <nav className={`flex flex-col gap-1 ${collapsed ? "mt-4" : ""}`}>
          {renderMenuItems(adminMenuItems)}
        </nav>
      </div>

      {/* Sidebar footer */}
      {!collapsed && (
        <div className="border-t border-[#ECEFF2] px-5 py-4 text-[11px] text-[#9298A1]">
          <p>Office File Management</p>
          <p className="mt-1">Frontend Demo · v1.0</p>
        </div>
      )}
    </aside>
  );
}
