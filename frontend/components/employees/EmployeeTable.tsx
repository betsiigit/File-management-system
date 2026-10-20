
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
    <div className="overflow-hidden rounded-xl border border-[#ECEFF2] bg-white shadow-sm">
      <div className="border-b border-[#ECEFF2] p-5">
        <h2 className="text-lg font-bold tracking-tight text-[#292D32]">
          {status} Employees
        </h2>

        <p className="mt-1 text-sm text-[#737B86]">
          {filteredEmployees.length} {status.toLowerCase()} employees
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-[#F8FAFB] text-xs uppercase tracking-wide text-[#737B86]">
            <tr>
              <th className="px-5 py-4 font-semibold">Employee ID</th>
              <th className="px-5 py-4 font-semibold">Full Name</th>
              <th className="px-5 py-4 font-semibold">Department</th>
              <th className="px-5 py-4 font-semibold">Position</th>
              <th className="px-5 py-4 font-semibold">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#ECEFF2]">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-12 text-center text-[#737B86]"
                >
                  No {status.toLowerCase()} employees found.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((employee) => (
                <tr
                  key={employee.id}
                  className="transition-colors duration-150 hover:bg-[#F8FAFB]"
                >
                  <td className="whitespace-nowrap px-5 py-4 font-semibold text-[#0A506E]">
                    {employee.employeeId}
                  </td>

                  <td className="px-5 py-4 font-medium text-[#292D32]">
                    {employee.fullName}
                  </td>

                  <td className="px-5 py-4 text-[#737B86]">
                    {employee.department}
                  </td>

                  <td className="px-5 py-4 text-[#737B86]">
                    {employee.position}
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${
                        employee.status === "Active"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
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
