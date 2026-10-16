
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import StatCard from "@/components/dashboard/StatCard";
import FileTable from "@/components/files/FileTable";
import FileDetails from "@/components/files/FileDetails";
import EmployeeTable, {
  type Employee,
} from "@/components/employees/EmployeeTable";
import EmployeeForm from "@/components/employees/EmployeeForm";
import FileRegistrationForm, {
  type RegisteredFileData,
} from "@/components/files/FileRegistrationForm";
import FileTransfers from "@/components/files/FileTransfers";
import VariousJobs from "@/components/files/VariousJobs";
import UserManagement from "@/components/users/UserManagement";
import About from "@/components/About";
import Reports from "@/components/reports/Reports";


type OfficeFile = {
  id: number;
  reference: string;
  title: string;
  department: string;
  date: string;
  status: "Pending" | "Approved" | "Archived";
  fileType?: "Incoming" | "Outgoing";
  pages?: number;
  assignedOfficer?: string;
  remarks?: string;
  attachmentName?: string;
};

const initialFiles: OfficeFile[] = [
  {
    id: 1,
    reference: "OFF-2026-001",
    title: "Annual Procurement Plan",
    department: "Procurement",
    date: "2026-10-01",
    status: "Approved",
  },
  {
    id: 2,
    reference: "OFF-2026-002",
    title: "Staff Training Report",
    department: "Human Resources",
    date: "2026-10-03",
    status: "Pending",
  },
  {
    id: 3,
    reference: "OFF-2026-003",
    title: "Budget Review Document",
    department: "Finance",
    date: "2026-10-05",
    status: "Approved",
  },
  {
    id: 4,
    reference: "OFF-2026-004",
    title: "IT Equipment Inventory",
    department: "Information Technology",
    date: "2026-10-07",
    status: "Archived",
  },
];

const departments = [
  "Administration",
  "Finance",
  "Human Resources",
  "Procurement",
  "Information Technology",
];
const initialEmployees: Employee[] = [
  {
    id: 1,
    employeeId: "EMP-001",
    fullName: "Abebe Kebede",
    department: "Administration",
    position: "Office Administrator",
    status: "Active",
  },
  {
    id: 2,
    employeeId: "EMP-002",
    fullName: "Sara Bekele",
    department: "Finance",
    position: "Accountant",
    status: "Active",
  },
  {
    id: 3,
    employeeId: "EMP-003",
    fullName: "Sample Inactive Employee",
    department: "Human Resources",
    position: "Former Officer",
    status: "Inactive",
  },
];
export default function Home() {
  const [language, setLanguage] = useState<"English" | "Amharic">("English");
  
const translations = {
  English: {
    dashboard: "Dashboard",
    welcome: "Welcome back!",
    overview: "Here is an overview of your office files.",
    totalFiles: "Total Files",
    pendingFiles: "Pending Files",
    approvedFiles: "Approved Files",
    archivedFiles: "Archived Files",
    recentFiles: "Recent Files",
    registerFile: "Register New File",
    profile: "My Profile",
    editProfile: "Edit Profile",
    settings: "Settings",
    back: "Back to Dashboard",
    userManagement: "User Management",
    employees: "Employees",
    reports: "Reports",
    variousJobs: "Various Jobs",
    about: "About",
  },
  Amharic: {
    dashboard: "ዳሽቦርድ",
    welcome: "እንኳን ደህና መጡ!",
    overview: "የቢሮዎ ፋይሎች አጠቃላይ ሁኔታ ይህ ነው።",
    totalFiles: "ጠቅላላ ፋይሎች",
    pendingFiles: "በመጠባበቅ ላይ ያሉ ፋይሎች",
    approvedFiles: "የጸደቁ ፋይሎች",
    archivedFiles: "የተመዘገቡ ፋይሎች",
    recentFiles: "የቅርብ ጊዜ ፋይሎች",
    registerFile: "አዲስ ፋይል መዝግብ",
    profile: "የእኔ መገለጫ",
    editProfile: "መገለጫ አርትዕ",
    settings: "ቅንብሮች",
    back: "ወደ ዳሽቦርድ ተመለስ",
    userManagement: "የተጠቃሚ አስተዳደር",
    employees: "ሰራተኞች",
    reports: "ሪፖርቶች",
    variousJobs: "የተለያዩ ስራዎች",
    about: "ስለ ስርዓቱ",
  },
};

const t = translations[language];

  
const [profile, setProfile] = useState({
  fullName: "Office Administrator",
  email: "admin@example.com",
  department: "Administration",
});

  
const [editProfile, setEditProfile] = useState(profile);
const [profileMessage, setProfileMessage] = useState("");

  const [files, setFiles] = useState<OfficeFile[]>(initialFiles);
 const [employees, setEmployees] =
  useState<Employee[]>(initialEmployees);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [profileView, setProfileView] = useState<
  "profile" | "edit-profile" | "settings" | null
>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Administration");
  const [notice, setNotice] = useState("");
  const [selectedFile, setSelectedFile] = useState<OfficeFile | null>(null);
 
const [showEmployeeForm, setShowEmployeeForm] = useState(false);
const [employeeFormStatus, setEmployeeFormStatus] =
  useState<"Active" | "Inactive">("Active");
const [employeeNotice, setEmployeeNotice] = useState("");
const [activeEmployeeSearch, setActiveEmployeeSearch] = useState("");
const [inactiveEmployeeSearch, setInactiveEmployeeSearch] = useState("");
const [showBulkEmployeeForm, setShowBulkEmployeeForm] = useState(false);
const [bulkEmployeeText, setBulkEmployeeText] = useState("");


  const pending = files.filter(
    (file) => file.status === "Pending"
  ).length;

  const approved = files.filter(
    (file) => file.status === "Approved"
  ).length;

  const archived = files.filter(
    (file) => file.status === "Archived"
  ).length;



  useEffect(() => {
  function handleHeaderAction(event: Event) {
    const customEvent = event as CustomEvent<{
      action: string;
    }>;

    const action = customEvent.detail?.action;

    if (
      action === "profile" ||
      action === "edit-profile" ||
      action === "settings"
    ) {
      setProfileView(action);
    }
  }

  window.addEventListener(
    "office-header-action",
    handleHeaderAction
  );

  return () => {
    window.removeEventListener(
      "office-header-action",
      handleHeaderAction
    );
  };
}, []);
  function handleNavigate(menu: string) {
    setActiveMenu(menu);
    setProfileView(null);
    setNotice("");
    setShowForm(menu === "Register File");
  }
  
function handleSaveEmployee(
  employee: Omit<Employee, "id">
) {
  const duplicateId = employees.some(
    (existing) =>
      existing.employeeId.toLowerCase() ===
      employee.employeeId.toLowerCase()
  );

  if (duplicateId) {
    setEmployeeNotice(
      "This employee ID already exists. Please use a different ID."
    );
    return;
  }

  const newEmployee: Employee = {
    ...employee,
    id:
      employees.length > 0
        ? Math.max(...employees.map((item) => item.id)) + 1
        : 1,
  };

  setEmployees((current) => [...current, newEmployee]);
  setShowEmployeeForm(false);
  setEmployeeNotice("Employee registered successfully.");
}

 
function exportEmployees(status: "Active" | "Inactive") {
  const rows = employees.filter(
    (employee) => employee.status === status
  );

  const escapeCsv = (value: string) =>
    `"${value.replace(/"/g, '""')}"`;

  const csv = [
    ["Employee ID", "Full Name", "Department", "Position", "Status"],
    ...rows.map((employee) => [
      employee.employeeId,
      employee.fullName,
      employee.department,
      employee.position,
      employee.status,
    ]),
  ]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${status.toLowerCase()}-employees.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function handleBulkAddEmployees() {
  const lines = bulkEmployeeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    setEmployeeNotice("Please enter employee records first.");
    return;
  }

  const parsed = lines.map((line) => {
    const [employeeId, fullName, department, position] =
      line.split(",").map((value) => value.trim());

    return {
      employeeId,
      fullName,
      department,
      position,
      status: "Active" as const,
    };
  });

  if (
    parsed.some(
      (employee) =>
        !employee.employeeId ||
        !employee.fullName ||
        !employee.department ||
        !employee.position
    )
  ) {
    setEmployeeNotice(
      "Each line must contain Employee ID, Full Name, Department, and Position."
    );
    return;
  }

  const existingIds = new Set(
    employees.map((employee) => employee.employeeId.toLowerCase())
  );
  const batchIds = new Set<string>();

  for (const employee of parsed) {
    const id = employee.employeeId.toLowerCase();

    if (existingIds.has(id) || batchIds.has(id)) {
      setEmployeeNotice(
        `Duplicate employee ID found: ${employee.employeeId}`
      );
      return;
    }

    batchIds.add(id);
  }

  const firstId =
    employees.length > 0
      ? Math.max(...employees.map((employee) => employee.id)) + 1
      : 1;

  const newEmployees: Employee[] = parsed.map((employee, index) => ({
    ...employee,
    id: firstId + index,
  }));

  setEmployees((current) => [...current, ...newEmployees]);
  setBulkEmployeeText("");
  setShowBulkEmployeeForm(false);
  setEmployeeNotice(`${newEmployees.length} employees added successfully.`);
}

function registerFile(data: RegisteredFileData) {
  const duplicateReference = files.some(
    (file) =>
      file.reference.toLowerCase() === data.reference.toLowerCase()
  );

  if (duplicateReference) {
    setNotice(`Reference number "${data.reference}" already exists.`);
    return;
  }

  const nextId =
    files.length > 0
      ? Math.max(...files.map((file) => file.id)) + 1
      : 1;


const newFile: OfficeFile = {
  id: nextId,
  reference: data.reference,
  title: data.title,
  department: data.department,
  date: data.date,
  status: "Pending",
  fileType: data.fileType,
  pages: data.pages,
  assignedOfficer: data.assignedOfficer,
  remarks: data.remarks,
  attachmentName: data.attachment?.name,
};


  setFiles((currentFiles) => [newFile, ...currentFiles]);
  setShowForm(false);
  setActiveMenu("Dashboard");
  setNotice(`File "${newFile.title}" registered successfully.`);
}

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800  md:ml-64">
      <Sidebar
        activeMenu={activeMenu}
        onNavigate={handleNavigate}
        language={language}
      />

  <section className="min-w-0 flex-1">
  <Header
    title={
      profileView
        ? profileView === "profile"
          ? "My Profile"
          : profileView === "edit-profile"
            ? "Edit Profile"
            : "Settings"
        : activeMenu
    }
    language={language}
    onLanguageChange={setLanguage}
  />

{profileView ? (
  <div className="space-y-4 p-5 md:p-8">
    <button
      type="button"
      onClick={() => setProfileView(null)}
      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
    >
      ← Back to {activeMenu}
    </button>

    {profileView === "profile" && (
  <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#dce8ef] text-2xl font-bold text-[#092c45]">
        A
      </div>
      <div>
        <h4 className="text-lg font-semibold text-[#092c45]">
          Administrator
        </h4>
        <p className="text-sm text-slate-500">
          Administrator · office Administrator
        </p>
      </div>
    </div>

    <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
      <div>
        <p className="text-sm text-slate-500">Username</p>
        <p className="mt-1 font-medium">admin</p>
      </div>
      <div>
        <p className="text-sm text-slate-500">Role</p>
        <p className="mt-1 font-medium">Administrator</p>
      </div>
      <div className="mt-4">
  <p className="text-sm text-slate-500">Email Address</p>
  <p className="mt-1 font-medium">{profile.email}</p>
</div>
      <div>
        <p className="text-sm text-slate-500">{profile.department}</p>
        <p className="mt-1 font-medium">Administration</p>
      </div>
      <div>
        <p className="text-sm text-slate-500">Account Status</p>
        <p className="mt-1 font-medium text-emerald-700">Active</p>
      </div>
    </div>

    <p className="mt-5 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
      Demo account details. Real account information will come from the backend.
    </p>
  </div>
)}


{profileView === "edit-profile" && (
  <div className="max-w-xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
    <h4 className="mb-5 text-lg font-semibold text-[#092c45]">
      Edit Profile
    </h4>

    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        setProfile(editProfile);
        setProfileMessage("Profile updated successfully!");
        setProfileView("profile");
      }}
    >
      <div>
        <label className="mb-1 block text-sm font-medium">
          Full Name
        </label>
        <input
          required
          value={editProfile.fullName}
          onChange={(event) =>
            setEditProfile({
              ...editProfile,
              fullName: event.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Email Address
        </label>
        <input
          required
          type="email"
          value={editProfile.email}
          onChange={(event) =>
            setEditProfile({
              ...editProfile,
              email: event.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Department
        </label>
        <input
          required
          value={editProfile.department}
          onChange={(event) =>
            setEditProfile({
              ...editProfile,
              department: event.target.value,
            })
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-[#092c45] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#124766]"
        >
          Save Changes
        </button>

        <button
          type="button"
          onClick={() => {
            setEditProfile(profile);
            setProfileView("profile");
          }}
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}



{profileView === "settings" && (
  <div className="max-w-2xl space-y-6">
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h4 className="text-lg font-semibold text-[#092c45]">
        General Settings
      </h4>
      <p className="mt-1 text-sm text-slate-500">
        Customize your application preferences.
      </p>

      <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="font-medium">Display Language</p>
          <p className="text-sm text-slate-500">
            Choose your preferred language.
          </p>
        </div>

        <select
          value={language}
          onChange={(event) =>
            setLanguage(event.target.value as "English" | "Amharic")
          }
          className="rounded-lg border border-slate-300 bg-white px-3 py-2"
        >
          <option value="English">English</option>
          <option value="Amharic">አማርኛ (Amharic)</option>
        </select>
      </div>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h4 className="text-lg font-semibold text-[#092c45]">
        Account Security
      </h4>
      <p className="mt-2 text-sm text-slate-500">
        Password changes and security controls will be available
        after backend authentication is implemented.
      </p>
      <span className="mt-3 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
        Coming soon
      </span>
    </div>
  </div>
)}

  </div>
) : (
  <div className="space-y-6 p-5 md:p-8">
          {notice && (
            <div
              role="status"
              className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"
            >
              {notice}
            </div>
          )}

          {activeMenu === "Dashboard" && !showForm && (
            <>
              <div>
                <h3 className="text-2xl font-bold text-[#092c45]">
                  {t.welcome}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                   {t.overview}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label={t.totalFiles}
                  value={files.length}
                  icon="▤"
                  description="All registered files"
                />

                <StatCard
                  label={t.pendingFiles}
                  value={pending}
                  icon="◷"
                  description="Awaiting action"
                />

                <StatCard
                  label={t.approvedFiles}
                  value={approved}
                  icon="✓"
                  description="Approved records"
                />

                <StatCard
                  label={t.archivedFiles}
                  value={archived}
                  icon="▣"
                  description="Archived records"
                />
              </div>
            </>
 )}
  
{activeMenu === "Active Employees" && (
  <div className="space-y-6">
    {/* Heading and action buttons */}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h3 className="text-2xl font-bold text-[#092c45]">
          Active Employees
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Employees currently active in the office.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => exportEmployees("Active")}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Export CSV
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Print
        </button>

        <button
          type="button"
          onClick={() => {
            setShowEmployeeForm(true);
            setEmployeeNotice("");
          }}
          className="rounded-lg bg-[#092c45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123f5e]"
        >
          + Add Employee
        </button>

        <button
          type="button"
          onClick={() => {
            setShowBulkEmployeeForm(true);
            setEmployeeNotice("");
          }}
          className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-[#092c45] hover:bg-amber-300"
        >
          Bulk Add
        </button>
      </div>
    </div>

    {/* Search */}
    <input
      type="search"
      value={activeEmployeeSearch}
      onChange={(event) =>
        setActiveEmployeeSearch(event.target.value)
      }
      placeholder="Search active employees..."
      className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
    />

    {/* Employee statistics */}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <StatCard
        label="Total Employees"
        value={employees.length}
        icon="♙"
        description="All employee records"
      />

      <StatCard
        label="Active Employees"
        value={employees.filter((e) => e.status === "Active").length}
        icon="✓"
        description="Currently active"
      />

      <StatCard
        label="Inactive Employees"
        value={employees.filter((e) => e.status === "Inactive").length}
        icon="○"
        description="Currently inactive"
      />
    </div>

    {/* Add employee or show table */}
    {showBulkEmployeeForm ? (
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h4 className="text-lg font-bold text-[#092c45]">
          Bulk Add Active Employees
        </h4>

        <p className="text-sm text-slate-500">
          Enter one employee per line: Employee ID, Full Name,
          Department, Position.
        </p>

        <textarea
          value={bulkEmployeeText}
          onChange={(event) =>
            setBulkEmployeeText(event.target.value)
          }
          rows={6}
          placeholder="EMP-004, Hana Tesfaye, Finance, Accountant"
          className="w-full rounded-lg border border-slate-300 p-3 text-sm"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBulkAddEmployees}
            className="rounded-lg bg-[#092c45] px-4 py-2 text-sm font-semibold text-white"
          >
            Add Employees
          </button>

          <button
            type="button"
            onClick={() => {
              setShowBulkEmployeeForm(false);
              setBulkEmployeeText("");
            }}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    ) : showEmployeeForm ? (
      <EmployeeForm
        onSave={handleSaveEmployee}
        onCancel={() => setShowEmployeeForm(false)}
      />
    ) : (
      <EmployeeTable
        employees={employees.filter(
          (employee) =>
            employee.status === "Active" &&
            [
              employee.employeeId,
              employee.fullName,
              employee.department,
              employee.position,
            ].some((value) =>
              value
                .toLowerCase()
                .includes(activeEmployeeSearch.toLowerCase())
            )
        )}
        status="Active"
      />
    )}
  </div>
)}


{activeMenu === "Inactive Employees" && (
  <div className="space-y-6">
    {/* Page heading and action buttons */}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h3 className="text-2xl font-bold text-[#092c45]">
          Inactive Employees
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Employees who are currently inactive.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => exportEmployees("Inactive")}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Export CSV
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-50"
        >
          Print
        </button>

        <button
          type="button"
          onClick={() => {
            setShowEmployeeForm(true);
            setEmployeeNotice("");
          }}
          className="rounded-lg bg-[#092c45] px-4 py-2 text-sm font-semibold text-white hover:bg-[#123f5e]"
        >
          + Add Inactive Employee
        </button>
      </div>
    </div>

    {/* Notification */}
    {employeeNotice && (
      <p
        role="status"
        className="rounded-lg bg-slate-100 p-3 text-sm text-[#092c45]"
      >
        {employeeNotice}
      </p>
    )}

    {/* Employee registration form or inactive employee table */}
    {showEmployeeForm ? (
      <EmployeeForm
        onSave={(employee) =>
          handleSaveEmployee({
            ...employee,
            status: "Inactive",
          })
        }
        onCancel={() => setShowEmployeeForm(false)}
      />
    ) : (
      <EmployeeTable
        employees={employees}
        status="Inactive"
      />
    )}
  </div>
)}

{activeMenu === "File Transfers" && <FileTransfers />}

{activeMenu === "Various Jobs" && <VariousJobs />}
{activeMenu === "User Management" && <UserManagement />}

{activeMenu === "About" && <About />}
{activeMenu === "Reports" ? (
  <Reports employees={employees} files={files} />
) : null}

{activeMenu !== "Active Employees" &&
  activeMenu !== "Inactive Employees" &&
  activeMenu !== "File Transfers" &&
  activeMenu !== "Various Jobs" &&
  activeMenu !== "User Management" &&
activeMenu !== "About" &&
  activeMenu !== "Reports" && (
    <>
    
      {showForm ? (
        <FileRegistrationForm
          departments={departments}
          onRegister={registerFile}
          onCancel={() => {
            setShowForm(false);
            setActiveMenu("Dashboard");
            setNotice("");
          }}
        />
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-[#092c45]">
                {activeMenu === "Dashboard"
                  ? "Recent Files"
                  : activeMenu}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Search and manage your office file records.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleNavigate("Register File")}
              className="rounded-lg bg-[#092c45] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#124766]"
            >
              + Register New File
            </button>
          </div>

          {selectedFile ? (
            <FileDetails
              file={selectedFile}
              onBack={() => setSelectedFile(null)}
            />
          ) : (
            <FileTable
              files={files}
              onViewFile={setSelectedFile}
            />
          )}
        </>
      )}

      <p className="text-xs text-slate-400">
        Frontend demo · Records are temporary and will reset on refresh.
      </p>
    </>
  )}

       
        </div>
      )}
      </section>
    </main>
  );
}

