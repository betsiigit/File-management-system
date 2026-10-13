
"use client";

export type Employee = {
  id: number;
  employeeId: string;
  fullName: string;
  department: string;
  position: string;
  status: "Active" | "Inactive";
};

type EmployeeTableProps = {
  employees: Employee[];
  status: "Active" | "Inactive";
};

export default function EmployeeTable({
  employees,
  status,
}: EmployeeTableProps) {
  const filteredEmployees = employees.filter(
    (employee) => employee.status === status
  );

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 className="text-lg font-bold text-[#092c45]">
          {status} Employees
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {filteredEmployees.length} {status.toLowerCase()} employees
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-4">Employee ID</th>
              <th className="px-5 py-4">Full Name</th>
              <th className="px-5 py-4">Department</th>
              <th className="px-5 py-4">Position</th>
              <th className="px-5 py-4">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-10 text-center text-slate-500"
                >
                  No {status.toLowerCase()} employees found.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium">
                    {employee.employeeId}
                  </td>
                  <td className="px-5 py-4">{employee.fullName}</td>
                  <td className="px-5 py-4">{employee.department}</td>
                  <td className="px-5 py-4">{employee.position}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        status === "Active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
