// src/pages/hod/internships/InternshipsDashboard.jsx
//
// Read-only list of every internship logged by students in the HOD's
// department. Each row shows the linked achievement's status if there
// is one — internships don't have their own approve/reject step.

import { useState } from "react";
import { useDepartmentInternships } from "../../../hooks/useInternships";
import Badge from "../../../components/ui/Badge";

export default function InternshipsDashboard() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useDepartmentInternships({ page, limit: 20 });

  if (isLoading) return <p className="p-4">Loading department internships…</p>;
  if (error) return <p className="p-4 text-red-600">Couldn't load the dashboard.</p>;

  const items = data?.items ?? [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Department Internships</h1>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Student</th>
            <th>Company</th>
            <th>Role</th>
            <th>Stipend</th>
            <th>Linked Achievement</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id} className="border-b">
              <td className="py-2">{i.student?.user?.name} ({i.student?.rollNo})</td>
              <td>{i.companyName}</td>
              <td>{i.role}</td>
              <td>{i.stipend != null ? `₹${i.stipend}/mo` : "—"}</td>
              <td>{i.achievement ? <Badge type="status" value={i.achievement.status} /> : "Not linked"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length === 0 && <p className="text-gray-500 mt-4">No internships logged yet.</p>}

      {data?.pagination && (
        <div className="flex justify-between mt-4 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button>
          <span>Page {data.pagination.page} of {data.pagination.totalPages}</span>
          <button disabled={page >= data.pagination.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
        </div>
      )}
    </div>
  );
}
