
"use client";

import { useState, type FormEvent } from "react";
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

type OfficeFile = {
  id: number;
  reference: string;
  title: string;
  department: string;
  date: string;
  status: "Pending" | "Approved" | "Archived";
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
  const [files, setFiles] = useState<OfficeFile[]>(initialFiles);
 const [employees, setEmployees] =
  useState<Employee[]>(initialEmployees);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Administration");
  const [notice, setNotice] = useState("");
  const [selectedFile, setSelectedFile] = useState<OfficeFile | null>(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
const [employeeNotice, setEmployeeNotice] = useState("");

  const pending = files.filter(
    (file) => file.status === "Pending"
  ).length;

  const approved = files.filter(
    (file) => file.status === "Approved"
  ).length;

  const archived = files.filter(
    (file) => file.status === "Archived"
  ).length;

  function handleNavigate(menu: string) {
    setActiveMenu(menu);
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
  };

  setFiles((currentFiles) => [newFile, ...currentFiles]);
  setShowForm(false);
  setActiveMenu("Dashboard");
  setNotice(`File "${newFile.title}" registered successfully.`);
}

  return (
    <main className="min-h-screen bg-slate-100 text-slate-800 md:flex">
      <Sidebar
        activeMenu={activeMenu}
        onNavigate={handleNavigate}
      />

      <section className="min-w-0 flex-1">
        <Header title={activeMenu} />

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
                  Welcome back!
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Here is an overview of your office files.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  label="Total Files"
                  value={files.length}
                  icon="▤"
                  description="All registered files"
                />

                <StatCard
                  label="Pending Files"
                  value={pending}
                  icon="◷"
                  description="Awaiting action"
                />

                <StatCard
                  label="Approved Files"
                  value={approved}
                  icon="✓"
                  description="Approved records"
                />

                <StatCard
                  label="Archived Files"
                  value={archived}
                  icon="▣"
                  description="Archived records"
                />
              </div>
            </>
 )}
          
         
{activeMenu === "Active Employees" && (
  <div className="space-y-6">
   
<div className="flex flex-wrap items-center justify-between gap-4">
  <div>
    <h3 className="text-2xl font-bold text-[#092c45]">
      Active Employees
    </h3>
    <p className="mt-1 text-sm text-slate-500">
      Employees currently active in the office.
    </p>
  </div>

  <button
    type="button"
    onClick={() => {
      setShowEmployeeForm(true);
      setEmployeeNotice("");
    }}
    className="rounded-lg bg-[#092c45] px-5 py-3 text-sm font-semibold text-white hover:bg-[#123f5e]"
  >
    + Add Employee
  </button>
</div>


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

    
{showEmployeeForm ? (
  <EmployeeForm
    onSave={handleSaveEmployee}
    onCancel={() => setShowEmployeeForm(false)}
  />
) : (
  <EmployeeTable employees={employees} status="Active" />
)}

  </div>
)}


         
{activeMenu === "Inactive Employees" && (
  <div className="space-y-6">
    <div>
      <h3 className="text-2xl font-bold text-[#092c45]">
        Inactive Employees
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Employees who are currently inactive.
      </p>
    </div>

    <EmployeeTable employees={employees} status="Inactive" />
  </div>
)}

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
        </div>
      </section>
    </main>
  );
}
