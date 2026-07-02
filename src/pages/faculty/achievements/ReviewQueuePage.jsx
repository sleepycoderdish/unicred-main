// src/pages/faculty/achievements/ReviewQueuePage.jsx
//
// Faculty's review queue: achievements that were sent to THIS faculty for
// verification. Defaults to showing only "pending" ones (nothing to do
// on approved/rejected ones), with a filter to see other statuses.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssignedAchievements } from "../../../hooks/useAchievements";
import { PageHeader } from "@/components/ui/PageHeader";
import { FlatCard } from "@/components/ui/GlassCard";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { Pager } from "@/components/ui/Pager";
import { CardLoader } from "@/components/ui/Loader";
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
  const navigate = useNavigate();

  const { data, isLoading, error } = useAssignedAchievements({ status, page, limit: 20 });

  // Reset back to page 1 whenever the status filter changes, otherwise the
  // user could land on an out-of-range page for the new filter.
  function changeStatus(next) {
    setStatus(next);
    setPage(1);
  }

  const items = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Achievement Reviews"
        subtitle="Achievements students have sent you to verify"
      />

      <FilterTabs tabs={STATUS_TABS} value={status} onChange={changeStatus} />

      {isLoading ? (
        <CardLoader lines={3} />
      ) : error ? (
        <p style={{ color: "var(--danger)" }}>Couldn't load the review queue.</p>
      ) : items.length === 0 ? (
        <FlatCard style={{ textAlign: "center", padding: "64px 20px" }}>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Nothing here.</p>
        </FlatCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item) => (
            <FlatCard
              key={item.id}
              onClick={() => navigate(`/faculty/achievements/${item.achievement.id}/review`)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 16, cursor: "pointer",
              }}
            >
              <div>
                <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>
                  {item.achievement.title}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {item.achievement.category} · {item.achievement.student?.user?.name} ({item.achievement.student?.rollNo})
                </p>
              </div>
              {/* Show the achievement's OVERALL status — that's what the
                  queue is filtered by and what the reviewer cares about. */}
              <Badge type="status" value={item.achievement.status} />
            </FlatCard>
          ))}
        </div>
      )}

      <Pager
        page={page}
        totalPages={data?.pagination?.totalPages}
        onPrev={() => setPage((p) => p - 1)}
        onNext={() => setPage((p) => p + 1)}
      />
    </div>
  );
}
