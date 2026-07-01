// src/pages/faculty/achievements/ReviewQueuePage.jsx
//
// Faculty's review queue: achievements that were sent to THIS faculty for
// verification. Defaults to showing only "pending" ones (nothing to do
// on approved/rejected ones), with a filter to see other statuses.

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAssignedAchievements } from "../../../hooks/useAchievements";
import Badge from "../../../components/ui/Badge";

const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

export default function ReviewQueuePage() {
  const [status, setStatus] = useState("pending");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useAssignedAchievements({ status, page, limit: 20 });

  // Reset back to page 1 whenever the status filter changes, otherwise the
  // user could land on an out-of-range page for the new filter.
  function changeStatus(next) {
    setStatus(next);
    setPage(1);
  }

  if (isLoading) return <p className="p-4">Loading your review queue…</p>;
  if (error) return <p className="p-4 text-red-600">Couldn't load the review queue.</p>;

  const items = data?.items ?? [];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Achievement Reviews</h1>

      <div className="flex gap-2 mb-4">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            className={`px-3 py-1 rounded text-sm ${
              status === tab.value ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-100"
            }`}
            onClick={() => changeStatus(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {items.length === 0 && <p className="text-gray-500">Nothing here.</p>}

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <Link
                to={`/faculty/achievements/${item.achievement.id}/review`}
                className="font-medium hover:underline"
              >
                {item.achievement.title}
              </Link>
              <p className="text-sm text-gray-500">
                {item.achievement.category} · {item.achievement.student?.user?.name} ({item.achievement.student?.rollNo})
              </p>
            </div>
            {/* `item.status` is THIS faculty's own verdict on the row —
                not necessarily the achievement's overall status. */}
            <Badge type="status" value={item.status} />
          </li>
        ))}
      </ul>

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
