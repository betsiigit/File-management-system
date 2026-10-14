"use client";

const mainMenuItems = [
  { label: "Dashboard", icon: "⌂" },
  { label: "Register File", icon: "✎" },
  { label: "All Files", icon: "▤" },
  { label: "File Transfers", icon: "⇄" },
  { label: "Various Jobs", icon: "↔" },
  { label: "Active Employees", icon: "♙" },
  { label: "Inactive Employees", icon: "♙" },
  { label: "Reports", icon: "▥" },
];

const adminMenuItems = [
  { label: "User Management", icon: "⚙" },
  { label: "About", icon: "ⓘ" },
];

type SidebarProps = {
  activeMenu: string;
  onNavigate: (menu: string) => void;
};

export default function Sidebar({
  activeMenu,
  onNavigate,
}: SidebarProps) {
  const renderMenuItems = (
    items: typeof mainMenuItems
  ) =>
    items.map((item) => {
      const isActive = activeMenu === item.label;

      return (
        <button
          key={item.label}
          type="button"
          onClick={() => onNavigate(item.label)}
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
          <h1 className="font-bold">Office Files</h1>
          <p className="text-xs text-slate-300">
            Management System
          </p>
        </div>
      </div>

      <div className="px-4 py-5">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Main Menu
        </p>

        <nav className="grid grid-cols-2 gap-1 md:grid-cols-1">
          {renderMenuItems(mainMenuItems)}
        </nav>

        <p className="mb-3 mt-7 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Admin
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