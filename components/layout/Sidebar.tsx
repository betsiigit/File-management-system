"use client";
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

type SidebarProps = {
  activeMenu: string;
  onNavigate: (menu: string) => void;
  language?: "English" | "Amharic";
};

export default function Sidebar({
  activeMenu,
  onNavigate,
  language = "English",
}: SidebarProps) {
  const st = sidebarTranslations[language];

  const mainMenuItems = [
    { key: "Dashboard", label: st.Dashboard, icon: "⌂" },
    { key: "Register File", label: st["Register File"], icon: "✎" },
    { key: "All Files", label: st["All Files"], icon: "▤" },
    { key: "File Transfers", label: st["File Transfers"], icon: "⇄" },
    { key: "Various Jobs", label: st["Various Jobs"], icon: "↔" },
    { key: "Active Employees", label: st["Active Employees"], icon: "♙" },
    { key: "Inactive Employees", label: st["Inactive Employees"], icon: "♙" },
    { key: "Reports", label: st.Reports, icon: "▥" },
  ];

  const adminMenuItems = [
    { key: "User Management", label: st["User Management"], icon: "⚙" },
    { key: "About", label: st.About, icon: "ⓘ" },
  ];

  const renderMenuItems = (
    items: typeof mainMenuItems
  ) =>
    items.map((item) => {
      const isActive =
        activeMenu === item.key || activeMenu === item.label;

      return (
        <button
          key={item.key}
          type="button"
          onClick={() => onNavigate(item.key)}
          aria-current={isActive ? "page" : undefined}
          className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition ${
            isActive
              ? "bg-amber-400 font-semibold text-[#092c45]"
              : "text-slate-200 hover:bg-white/10"
          }`}
        >
          <span className="w-5 text-center text-lg">
            {item.icon}
          </span>
        {item.label}
        </button>
      );
    });

  return (
    <aside className="sidebar-scroll flex w-full shrink-0 flex-col bg-[#092c45] text-white md:fixed md:inset-y-0 md:left-0 md:h-screen md:w-64 md:overflow-y-auto">
      <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-400 text-2xl font-bold text-[#092c45]">
          F
        </div>

        <div>
          <h1 className="font-bold">{st["Office Files"]}</h1>
          <p className="text-xs text-slate-300">
            {st["Management System"]}
          </p>
        </div>
      </div>

      <div className="px-4 py-5">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          {st["Main Menu"]}
        </p>

        <nav className="grid grid-cols-2 gap-1 md:grid-cols-1">
          {renderMenuItems(mainMenuItems)}
        </nav>

        <p className="mb-3 mt-7 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          {st.Admin}
        </p>

        <nav className="grid grid-cols-2 gap-1 md:grid-cols-1">
          {renderMenuItems(adminMenuItems)}
        </nav>
      </div>

      <div className="mt-auto hidden border-t border-white/10 p-5 text-xs text-slate-400 md:block">
        Office File Management
        <br />
        Frontend Demo · v1.0
      </div>
    </aside>
  );
}