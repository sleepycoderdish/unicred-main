// src/pages/hod/achievements/AchievementsDashboard.jsx
//
// Read-only view for the HOD: every achievement submitted by students in
// their department, filterable by status. No approve/reject here — that
// stays with the faculty who were actually assigned.

import { useState } from "react";
import { useDepartmentAchievements } from "../../../hooks/useAchievements";
import Badge from "../../../components/ui/Badge";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AchievementsDashboard() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  // Omit the "status" param entirely when the filter is "All" — the
  // backend treats a missing status as "give me everything".
  const params = { page, limit: 20, ...(status ? { status } : {}) };
  const { data, isLoading, error } = useDepartmentAchievements(params);

  if (isLoading) return <p className="p-4">Loading department achievements…</p>;
  if (error) return <p className="p-4 text-red-600">Couldn't load the dashboard.</p>;

  const items = data?.items ?? [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Department Achievements</h1>

      <div className="flex gap-2 mb-4">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`px-3 py-1 rounded text-sm ${
              status === opt.value ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"
            }`}
            onClick={() => {
              setStatus(opt.value);
              setPage(1); // reset paging when the filter changes
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2">Student</th>
            <th>Title</th>
            <th>Category</th>
            <th>Status</th>
            <th>Files</th>
          </tr>
        </thead>
        <tbody>
          {items.map((a) => (
            <tr key={a.id} className="border-b">
              <td className="py-2">{a.student?.user?.name} ({a.student?.rollNo})</td>
              <td>{a.title}</td>
              <td>{a.category}</td>
              <td><Badge type="status" value={a.status} /></td>
              <td>
                <div className="flex gap-3">
                  {a.certificateUrl && (
                    <a className="text-blue-400 underline" href={a.certificateUrl} target="_blank" rel="noreferrer">Certificate</a>
                  )}
                  {a.proofUrl && (
                    <a className="text-blue-400 underline" href={a.proofUrl} target="_blank" rel="noreferrer">Proof</a>
                  )}
                  {!a.certificateUrl && !a.proofUrl && <span className="text-gray-500">—</span>}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {items.length === 0 && <p className="text-gray-500 mt-4">No achievements match this filter.</p>}

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
