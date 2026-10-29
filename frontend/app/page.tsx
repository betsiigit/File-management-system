
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
import { ThemeProvider } from "@/components/providers/ThemeProvider";
type UserRole = "ADMIN" | "REGISTRAR" | "OFFICER" | "VIEWER";


type OfficeFile = {
  
  id: number;
  reference: string;
  volume: string;
  title: string;
  department: string;
  date: string;
  outgoing_date: string;
  status: "Pending" | "Approved" | "Archived";
  fileType?: "Incoming" | "Outgoing";
  pages?: number;
  assignedOfficer?: string;
  remarks?: string;
 attachmentNames?: string[];
};

const initialFiles: OfficeFile[] = [
  {
    id: 1,
    reference: "OFF-2026-001",
    title: "Annual Procurement Plan",
    department: "Procurement",
    date: "2026-10-01",
    status: "Approved",
    volume: "Volume 1",
    outgoing_date: "2026-10-15",
  },
  {
    id: 2,
    reference: "OFF-2026-002",
    title: "Staff Training Report",
    department: "Human Resources",
    date: "2026-10-03",
    status: "Pending",
    volume: "Volume 1",
    outgoing_date: "2026-10-20",
  },
  {
    id: 3,
    reference: "OFF-2026-003",
    title: "Budget Review Document",
    department: "Finance",
    date: "2026-10-05",
    status: "Approved",
    volume: "Volume 1",
    outgoing_date: "2026-10-25",
  },
  {
    id: 4,
    reference: "OFF-2026-004",
    title: "IT Equipment Inventory",
    department: "Information Technology",
    date: "2026-10-07",
    status: "Archived",
    volume: "Volume 1",
    outgoing_date: "",
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

function handleLanguageChange(nextLanguage: "English" | "Amharic") {
  setLanguage(nextLanguage);

  try {
    localStorage.setItem("officeLanguage", nextLanguage);
  } catch (error) {
    console.error("Could not save language preference:", error);
  }
}

  
const [profile, setProfile] = useState({
  fullName: "",
  email: "",
  role: "" as UserRole | "",
  branchName: null as string | null,
  department: "Administration",
});
const [editProfile, setEditProfile] = useState(profile);
const [profileMessage, setProfileMessage] = useState("");

  const [files, setFiles] = useState<OfficeFile[]>(initialFiles);
  const [selectedVolume, setSelectedVolume] = useState("All");
 const [employees, setEmployees] = useState<Employee[]>([]);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [profileView, setProfileView] = useState<
  "profile" | "edit-profile" | "settings" | null
>(null);

const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [passwordSaving, setPasswordSaving] = useState(false);
const [passwordMessage, setPasswordMessage] = useState("");
const [passwordMessageType, setPasswordMessageType] = useState<
  "success" | "error" | ""
>("");


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
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);


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

useEffect(() => {
  try {
    const savedUser = localStorage.getItem("currentUser");

    if (!savedUser) return;

    const user = JSON.parse(savedUser);

    const updatedProfile = {
      fullName: user.fullName ?? "",
      email: user.email ?? "",
      role: user.role ?? "",
      branchName: user.branchName ?? null,
      department: user.branchName ?? "Not assigned",
    };

    setProfile(updatedProfile);
    setEditProfile(updatedProfile);
  } catch (error) {
    console.error("Unable to load profile:", error);
  }
}, []);


useEffect(() => {
  try {
    const savedLanguage = localStorage.getItem("officeLanguage");

    if (savedLanguage === "English" || savedLanguage === "Amharic") {
      setLanguage(savedLanguage);
    }
  } catch (error) {
    console.error("Could not load language preference:", error);
  }
}, []);

useEffect(() => {
  
async function loadFiles() {
  try {
  const response = await fetch(
  "http://localhost:8081/api/office-files",
  {
    credentials: "include",
  }
);

    if (!response.ok) {
      throw new Error(`Failed to load files (${response.status})`);
    }

    const savedFiles = await response.json();

    const mappedFiles: OfficeFile[] = await Promise.all(
      savedFiles.map(
        async (file: {
          id: number;
          referenceNumber: string;
          title: string;
          fileType: "Incoming" | "Outgoing";
          registrationDate: string | null;
          outgoingDate: string | null;
          numberOfPages: number | null;
          department: string | null;
          assignedOfficer: string | null;
          remarks: string | null;
          volume: string | null;
          status: string | null;
          documentPath: string | null;
        }) => {
          const existingFile = files.find(
            (item) => item.id === file.id
          );

          let attachmentNames: string[] = [];

        
try {
  const attachmentResponse = await fetch(
    `http://localhost:8081/api/office-files/${file.id}/attachments`,
    {
      credentials: "include",
    }
  );

            if (attachmentResponse.ok) {
              const attachments = await attachmentResponse.json();

              if (Array.isArray(attachments)) {
                attachmentNames = attachments
                  .map(
                    (attachment: {
                      fileName?: string;
                      filename?: string;
                      originalFilename?: string;
                    }) =>
                      attachment.fileName ??
                      attachment.originalFilename ??
                      attachment.filename
                  )
                  .filter(
                    (name: string | undefined): name is string =>
                      Boolean(name)
                  );
              }
            }
          } catch (attachmentError) {
            console.error(
              `Could not load attachments for file ${file.id}:`,
              attachmentError
            );
          }

          // Preserve the legacy single-document attachment if present.
          if (
            attachmentNames.length === 0 &&
            file.documentPath
          ) {
            attachmentNames = [
              file.documentPath.split(/[\\/]/).pop() || file.documentPath,
            ];
          }

          return {
            id: file.id,
            reference: file.referenceNumber,
            volume: file.volume ?? existingFile?.volume ?? "",
            title: file.title,
            department: file.department ?? "",
            date: file.registrationDate ?? "",
            outgoing_date:
              file.outgoingDate ?? existingFile?.outgoing_date ?? "",
            status:
              file.status ?? existingFile?.status ?? "Pending",
            fileType: file.fileType,
            pages: file.numberOfPages ?? 0,
            assignedOfficer: file.assignedOfficer ?? "",
            remarks: file.remarks ?? "",
            attachmentNames,
            documentPath: file.documentPath ?? "",
          };
        }
      )
    );

    setFiles([...mappedFiles].sort((a, b) => b.id - a.id));
  } catch (error) {
    console.error("Failed to load office files:", error);
    setNotice(
      "Could not load files from the backend. Please check that the backend is running."
    );
  }
}


  loadFiles();
    loadEmployees();
}, []);

async function handleChangePassword(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();
  setPasswordMessage("");
  setPasswordMessageType("");

  if (newPassword !== confirmPassword) {
    setPasswordMessage("Your new passwords do not match.");
    setPasswordMessageType("error");
    return;
  }

  if (newPassword.length < 8) {
    setPasswordMessage(
      "Your new password must contain at least 8 characters.",
    );
    setPasswordMessageType("error");
    return;
  }

  setPasswordSaving(true);

  try {
    const response = await fetch(
      "http://localhost:8081/api/auth/change-password",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      },
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(
        result?.message ??
          `Could not change password (${response.status}).`,
      );
    }

    setPasswordMessage(
      result?.message ?? "Password changed successfully.",
    );
    setPasswordMessageType("success");

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  } catch (error) {
    setPasswordMessage(
      error instanceof Error
        ? error.message
        : "Unable to change your password. Please try again.",
    );
    setPasswordMessageType("error");
  } finally {
    setPasswordSaving(false);
  }
}

async function loadEmployees() {
  try {
    const response = await fetch(
  "http://localhost:8081/api/employees",
  {
    credentials: "include",
  }
);

    if (!response.ok) {
      throw new Error("Failed to load employees");
    }

    const data: Employee[] = await response.json();
    setEmployees(data);
  } catch (error) {
    console.error("Error loading employees:", error);
  }
}

  function handleNavigate(menu: string) {
    setActiveMenu(menu);
    setProfileView(null);
    setNotice("");
    setShowForm(menu === "Register File");
  }
  

async function handleSaveEmployee(
  employee: Omit<Employee, "id">
) {
  try {
    const duplicateId = employees.some(
      (existing) =>
        existing.employeeId.toLowerCase() ===
        employee.employeeId.trim().toLowerCase()
    );

    if (duplicateId) {
      setEmployeeNotice(
        "This employee ID already exists. Please use a different ID."
      );
      return;
    }

    const response = await fetch(
      "http://localhost:8081/api/employees",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...employee,
          employeeId: employee.employeeId.trim(),
          fullName: employee.fullName.trim(),
          department: employee.department.trim(),
          position: employee.position.trim(),
        }),
      }
    );

    if (response.status === 409) {
      setEmployeeNotice(
        "This employee ID already exists. Please use a different ID."
      );
      return;
    }

if (!response.ok) {
  const errorText = await response.text();

  console.error("Employee registration failed");
  console.error("HTTP status:", response.status);
  console.error("Response body:", errorText);

  throw new Error(
    `Failed to register employee (${response.status}). ${errorText}`
  );
}

    await loadEmployees();

    setShowEmployeeForm(false);
    setEmployeeNotice("Employee registered successfully.");
  } catch (error) {
    console.error("Error registering employee:", error);
    setEmployeeNotice(
      "Could not register employee. Please check that the backend is running."
    );
  }
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

async function registerFile(data: RegisteredFileData) {
  const duplicateReference = files.some(
    (file) =>
      file.reference.toLowerCase() === data.reference.toLowerCase()
  );

  if (duplicateReference) {
    setNotice(`Reference number "${data.reference}" already exists.`);
    return;
  }

  try {
    setNotice("Registering file...");

let documentPath: string | null = null;

// if (data.attachments.length > 0) {
//   const uploadForm = new FormData();
//   uploadForm.append("files", data.attachments[0]);

//   const uploadResponse = await fetch(
//     "http://localhost:8081/api/attachments",
//     {
//       method: "POST",
//       body: uploadForm,
//     }
//   );

//   if (!uploadResponse.ok) {
//     throw new Error("Failed to upload the PDF attachment.");
//   }

//   const uploadedPaths: string[] = await uploadResponse.json();
//   documentPath = uploadedPaths[0] ?? null;
// }

const response = await fetch(
  "http://localhost:8081/api/office-files",
  {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      referenceNumber: data.reference,
      title: data.title,
      fileType: data.fileType,
      registrationDate: data.date,
      outgoingDate: data.outgoing_date || null,
      numberOfPages: data.pages,
      department: data.department,
      assignedOfficer: data.assignedOfficer || null,
      remarks: data.remarks || null,
      volume: data.volume?.trim() || null,
      status: data.status || "Pending",
      documentPath: null,
    }),
  }
);


    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || `Request failed (${response.status})`);
    }

    const savedFile = await response.json();

let uploadedAttachments: {
  id: number;
  fileName: string;
  documentPath: string;
}[] = [];

let attachmentUploadFailed = false;

if (data.attachments.length > 0) {
  const uploadForm = new FormData();

  data.attachments.forEach((file) => {
    uploadForm.append("files", file);
  });

  try {
    const uploadResponse = await fetch(
      `http://localhost:8081/api/attachments/office-file/${savedFile.id}`,
      {
        method: "POST",
         credentials: "include",
        body: uploadForm,
      }
    );

    if (!uploadResponse.ok) {
      throw new Error("Attachment upload failed.");
    }

    uploadedAttachments = await uploadResponse.json();
  } catch (error) {
    console.error("Failed to upload attachments:", error);
    attachmentUploadFailed = true;
  }
}

  const newFile: OfficeFile = {
  id: savedFile.id,
  reference: savedFile.referenceNumber,
  volume: data.volume,
  title: savedFile.title,
  department: savedFile.department ?? "",
  date: savedFile.registrationDate ?? data.date,
  outgoing_date: data.outgoing_date,
  status: "Pending",
  fileType: savedFile.fileType,
  pages: savedFile.numberOfPages,
  assignedOfficer: savedFile.assignedOfficer ?? "",
  remarks: savedFile.remarks ?? "",
  attachmentNames: data.attachments.map((file) => file.name),
};
    setFiles((currentFiles) => [newFile, ...currentFiles]);
    setShowForm(false);
    setActiveMenu("Dashboard");
   setNotice(
  attachmentUploadFailed
    ? `File "${newFile.title}" registered, but its attachments could not all be uploaded.`
    : `File "${newFile.title}" registered successfully.`
);
  } catch (error) {
    console.error("Failed to register office file:", error);
    setNotice(
      error instanceof Error
        ? `Could not register file: ${error.message}`
        : "Could not register file. Please try again."
    );
  }
}


  return (
   
<main
  className={`min-h-screen bg-[var(--background)] text-[var(--text-primary)] transition-[margin] duration-300 ${
    sidebarCollapsed ? "md:ml-20" : "md:ml-64"
  }`}
>
<Sidebar
  activeMenu={activeMenu}
  onNavigate={setActiveMenu}
  language={language}
  collapsed={sidebarCollapsed}
  onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
  userRole={profile.role}
/>

  <section className="min-w-0 flex-1 bg-[var(--background)]">
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
     onLanguageChange={handleLanguageChange}
    />


{profileView ? (
  <div className="space-y-7 p-5 md:p-8 lg:p-9">
    <button
      type="button"
      onClick={() => setProfileView(null)}
      className="rounded-lg border border-[#E2E6ED] bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-[#F4F7FA]"
    >
      ← Back to {activeMenu}
    </button>

 {profileView === "profile" && (
  <div className="max-w-xl rounded-2xl border border-[#E7EAF0] bg-white p-6 shadow-[0_3px_14px_rgba(32,48,72,0.035)]">
    {profileMessage && (
      <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
        {profileMessage}
      </div>
    )}

    <div className="flex items-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F9FB] text-2xl font-semibold uppercase text-[#292D32]">
        {profile.fullName.trim().charAt(0) || "U"}
      </div>

      <div>
        <h4 className="text-lg font-semibold tracking-tight text-[#292D32]">
          {profile.fullName || "User"}
        </h4>
        <p className="text-sm text-[#7B8492]">
          {profile.role === "ADMIN"
            ? "Administrator"
            : profile.role === "REGISTRAR"
              ? "Registrar"
              : profile.role === "OFFICER"
                ? "Officer"
                : profile.role === "VIEWER"
                  ? "Viewer"
                  : profile.role || "Role not assigned"}
          {" · "}
          {profile.branchName || "No branch assigned"}
        </p>
      </div>
    </div>

    <div className="mt-6 grid gap-4 border-t border-[#EDF0F4] pt-5 sm:grid-cols-2">
      <div>
        <p className="text-sm text-[#7B8492]">Full Name</p>
        <p className="mt-1 font-medium">{profile.fullName || "—"}</p>
      </div>

      <div>
        <p className="text-sm text-[#7B8492]">Email Address</p>
        <p className="mt-1 break-words font-medium">{profile.email || "—"}</p>
      </div>

      <div>
        <p className="text-sm text-[#7B8492]">Role</p>
        <p className="mt-1 font-medium">{profile.role || "—"}</p>
      </div>

      <div>
        <p className="text-sm text-[#7B8492]">Assigned Branch</p>
        <p className="mt-1 font-medium">
          {profile.branchName || "No branch assigned"}
        </p>
      </div>
    </div>

    <button
      type="button"
      onClick={() => {
        setEditProfile(profile);
        setProfileMessage("");
        setProfileView("edit-profile");
      }}
      className="mt-6 rounded-lg bg-[#18B6C9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1595A5]"
    >
      Edit Profile
    </button>
  </div>
)}

{profileView === "edit-profile" && (
  <div className="max-w-xl rounded-2xl border border-[#E7EAF0] bg-white p-6 shadow-[0_3px_14px_rgba(32,48,72,0.035)]">
    <h4 className="mb-5 text-lg font-semibold tracking-tight text-[#292D32]">
      Edit Profile
    </h4>

    <form
    
onSubmit={async (event) => {
  event.preventDefault();
  setProfileMessage("");

  try {
    const response = await fetch(
      "http://localhost:8081/api/auth/profile",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          fullName: editProfile.fullName.trim(),
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || "Failed to update your profile."
      );
    }

    const updatedProfile = {
      ...profile,
      fullName: result.fullName,
      email: result.email,
      role: result.role,
      branchName: result.branchName ?? null,
      department: result.branchName ?? "Not assigned",
    };

    setProfile(updatedProfile);
    setEditProfile(updatedProfile);

    localStorage.setItem("currentUser", JSON.stringify(result));

    window.dispatchEvent(
      new CustomEvent("current-user-updated", {
        detail: result,
      })
    );

    setProfileMessage("Profile updated successfully!");
    setProfileView("profile");
  } catch (error) {
    setProfileMessage(
      error instanceof Error
        ? error.message
        : "Something went wrong while updating your profile."
    );
  }
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
          className="w-full rounded-xl border border-[#E2E6ED] bg-white px-3 py-2.5 text-sm outline-none transition duration-200 focus:border-[#18B6C9] focus:ring-2 focus:ring-[#18B6C9]/15"
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
          className="w-full rounded-xl border border-[#E2E6ED] bg-white px-3 py-2.5 text-sm outline-none transition duration-200 focus:border-[#18B6C9] focus:ring-2 focus:ring-[#18B6C9]/15"
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
          className="w-full rounded-xl border border-[#E2E6ED] bg-white px-3 py-2.5 text-sm outline-none transition duration-200 focus:border-[#18B6C9] focus:ring-2 focus:ring-[#18B6C9]/15"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="rounded-lg bg-[#18B6C9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1595A5]"
        >
          Save Changes
        </button>

        <button
          type="button"
          onClick={() => {
            setEditProfile(profile);
            setProfileView("profile");
          }}
          className="rounded-xl border border-[#E5E9ED] px-5 py-2.5 text-sm font-medium transition hover:bg-[#EAF9FB]"
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
)}



{profileView === "settings" && (
  <div className="max-w-2xl space-y-6">
    <div className="rounded-2xl border border-[#E7EAF0] bg-white p-6 shadow-[0_3px_14px_rgba(32,48,72,0.035)]">
      <h4 className="text-lg font-semibold tracking-tight text-[#292D32]">
        General Settings
      </h4>
      <p className="mt-1 text-sm text-[#7B8492]">
        Customize your application preferences.
      </p>

      <div className="mt-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="font-medium">Display Language</p>
          <p className="text-sm text-[#7B8492]">
            Choose your preferred language.
          </p>
        </div>

        <select
          value={language}
         onChange={(event) =>
  handleLanguageChange(event.target.value as "English" | "Amharic")
}
          className="rounded-lg border border-[#E2E6ED] bg-white px-3 py-2"
        >
          <option value="English">English</option>
          <option value="Amharic">አማርኛ (Amharic)</option>
        </select>
      </div>
    </div>

   
<div className="rounded-2xl border border-[#E7EAF0] bg-white p-6 shadow-[0_3px_14px_rgba(32,48,72,0.035)]">
  <div>
    <h4 className="text-lg font-semibold tracking-tight text-[#292D32]">
      Account Security
    </h4>
    <p className="mt-2 text-sm text-[#7B8492]">
      Update your password to keep your account secure.
    </p>
  </div>

  {passwordMessage && (
    <div
      role="status"
      aria-live="polite"
      className={`mt-5 rounded-lg border p-3 text-sm ${
        passwordMessageType === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {passwordMessage}
    </div>
  )}

  <form onSubmit={handleChangePassword} className="mt-6 space-y-5">
    <div>
      <label
        htmlFor="current-password"
        className="mb-2 block text-sm font-medium text-[#454B54]"
      >
        Current Password
      </label>
      <input
        id="current-password"
        type="password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(event) => setCurrentPassword(event.target.value)}
        required
        className="w-full rounded-lg border border-[#D6E2E8] bg-white px-3 py-3 text-sm text-[#292D32] outline-none focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/10"
      />
    </div>

    <div>
      <label
        htmlFor="new-password"
        className="mb-2 block text-sm font-medium text-[#454B54]"
      >
        New Password
      </label>
      <input
        id="new-password"
        type="password"
        autoComplete="new-password"
        value={newPassword}
        onChange={(event) => setNewPassword(event.target.value)}
        minLength={8}
        maxLength={72}
        required
        className="w-full rounded-lg border border-[#D6E2E8] bg-white px-3 py-3 text-sm text-[#292D32] outline-none focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/10"
      />
      <p className="mt-1 text-xs text-[#7B8492]">
        Use at least 8 characters.
      </p>
    </div>

    <div>
      <label
        htmlFor="confirm-new-password"
        className="mb-2 block text-sm font-medium text-[#454B54]"
      >
        Confirm New Password
      </label>
      <input
        id="confirm-new-password"
        type="password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        minLength={8}
        maxLength={72}
        required
        className="w-full rounded-lg border border-[#D6E2E8] bg-white px-3 py-3 text-sm text-[#292D32] outline-none focus:border-[#0A506E] focus:ring-2 focus:ring-[#0A506E]/10"
      />
    </div>

    <button
      type="submit"
      disabled={passwordSaving}
      className="rounded-lg bg-[#0A506E] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#176A87] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {passwordSaving ? "Updating Password..." : "Change Password"}
    </button>
  </form>
</div>

  </div>
)}

  </div>
) : (
  <div className="space-y-7 p-5 md:p-8 lg:p-9">
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
                <h3 className="text-2xl font-semibold tracking-tight text-[#292D32]">
                  {t.welcome}
                </h3>
               <p className="mt-1 text-sm text-[#9298A1]">
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
        <h3 className="text-2xl font-semibold tracking-tight text-[#292D32]">
          Active Employees
        </h3>
        <p className="mt-1 text-sm text-[#7B8492]">
          Employees currently active in the office.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => exportEmployees("Active")}
          className="rounded-xl border border-[#E5E9ED] bg-white px-4 py-2.5 text-sm font-medium text-[#4B5563] transition hover:bg-[#EAF9FB]"
        >
          Export CSV
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-xl border border-[#E5E9ED] bg-white px-4 py-2.5 text-sm font-medium text-[#4B5563] transition hover:bg-[#EAF9FB]"
        >
          Print
        </button>

        <button
          type="button"
          onClick={() => {
            setShowEmployeeForm(true);
            setEmployeeNotice("");
          }}
         className="rounded-lg bg-[#0A506E] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#176A87] active:bg-[#135B74]"
        >
          + Add Employee
        </button>

        <button
          type="button"
          onClick={() => {
            setShowBulkEmployeeForm(true);
            setEmployeeNotice("");
          }}
         className="rounded-lg bg-[#E7F1F5] px-4 py-2.5 text-sm font-semibold text-[#0A506E] transition-colors duration-200 hover:bg-[#D9EAF0]"
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
      className="w-full max-w-md rounded-xl border border-[#E5E9ED] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#18B6C9] focus:ring-2 focus:ring-[#18B6C9]/15"
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
      <div className="space-y-4 rounded-2xl border border-[#ECEFF2] bg-white p-5 shadow-sm">
        <h4 className="text-lg font-bold text-[#292D32]">
          Bulk Add Active Employees
        </h4>

        <p className="text-sm text-[#7B8492]">
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
          className="w-full rounded-xl border border-[#E2E6ED] bg-white p-3 text-sm outline-none transition duration-200 focus:border-[#18B6C9] focus:ring-2 focus:ring-[#18B6C9]/15"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleBulkAddEmployees}
           className="rounded-lg bg-[#0A506E] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#176A87] active:bg-[#135B74]"
          >
            Add Employees
          </button>

          <button
            type="button"
            onClick={() => {
              setShowBulkEmployeeForm(false);
              setBulkEmployeeText("");
            }}
            className="rounded-xl border border-[#E5E9ED] px-4 py-2 text-sm transition hover:bg-[#EAF9FB]"
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
        <h3 className="text-2xl font-semibold tracking-tight text-[#292D32]">
          Inactive Employees
        </h3>
        <p className="mt-1 text-sm text-[#7B8492]">
          Employees who are currently inactive.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => exportEmployees("Inactive")}
          className="rounded-lg border border-[#D6E2E8] bg-white px-4 py-2.5 text-sm font-medium text-[#0A506E] transition-colors duration-200 hover:border-[#0A506E] hover:bg-[#E7F1F5]"
        >
          Export CSV
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="rounded-lg border border-[#D6E2E8] bg-white px-4 py-2.5 text-sm font-medium text-[#0A506E] transition-colors duration-200 hover:border-[#0A506E] hover:bg-[#E7F1F5]"
        >
          Print
        </button>

        <button
          type="button"
          onClick={() => {
            setShowEmployeeForm(true);
            setEmployeeNotice("");
          }}
          className="rounded-lg bg-[#0A506E] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#176A87] active:bg-[#135B74]"
        >
          + Add Inactive Employee
        </button>
      </div>
    </div>

    {/* Notification */}
    {employeeNotice && (
      <p
        role="status"
        className="rounded-lg bg-slate-100 p-3 text-sm text-[#292D32]"
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
{activeMenu === "User Management" && profile.role === "ADMIN" && (
  <UserManagement userRole={profile.role} />
)}

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
              <h3 className="text-lg font-semibold tracking-tight text-[#292D32]">
                {activeMenu === "Dashboard"
                  ? "Recent Files"
                  : activeMenu}
              </h3>
              <p className="mt-1 text-sm text-[#7B8492]">
                Search and manage your office file records.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleNavigate("Register File")}
             className="rounded-lg bg-[#0A506E] px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#176A87] active:bg-[#135B74] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A506E]/30 focus-visible:ring-offset-2"
            >
              + Register New File
            </button>
          </div>

          
{selectedFile ? (
  <FileDetails
    file={selectedFile}
    onBack={() => setSelectedFile(null)}
    onFileUpdated={(updatedFile) => {
      setFiles((currentFiles) =>
        currentFiles.map((currentFile) =>
          currentFile.id === updatedFile.id
            ? { ...currentFile, ...updatedFile }
            : currentFile
        )
      );
      setSelectedFile(updatedFile);
      setNotice("File updated successfully.");
    }}
    onFileDeleted={(deletedId) => {
      setFiles((currentFiles) =>
        currentFiles.filter((currentFile) => currentFile.id !== deletedId)
      );
      setSelectedFile(null);
      setNotice("File deleted successfully.");
    }}
  />
) : (
  <FileTable
    files={files}
    onViewFile={setSelectedFile}
  />
)}

        </>
      )}

      <p className="text-xs text-[#929BA8]">
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

