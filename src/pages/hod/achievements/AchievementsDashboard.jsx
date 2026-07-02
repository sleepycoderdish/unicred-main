// src/pages/hod/achievements/AchievementsDashboard.jsx
//
// Read-only view for the HOD: every achievement submitted by students in
// their department, filterable by status. No approve/reject here — that
// stays with the faculty who were actually assigned.

import { useState } from "react";
import { useDepartmentAchievements } from "../../../hooks/useAchievements";
import { PageHeader } from "@/components/ui/PageHeader";
import { FlatCard } from "@/components/ui/GlassCard";
import { FilterTabs } from "@/components/ui/FilterTabs";
import { Pager } from "@/components/ui/Pager";
import { CardLoader } from "@/components/ui/Loader";
import Badge from "../../../components/ui/Badge";

const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const th = { textAlign: "left", padding: "10px 12px", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)" };
const td = { padding: "12px", fontSize: "0.85rem", color: "var(--text-secondary)", borderTop: "1px solid var(--border-subtle)" };
const linkStyle = { color: "var(--text-accent)", textDecoration: "none", fontWeight: 500 };

export default function AchievementsDashboard() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  // Omit the "status" param entirely when the filter is "All" — the
  // backend treats a missing status as "give me everything".
  const params = { page, limit: 20, ...(status ? { status } : {}) };
  const { data, isLoading, error } = useDepartmentAchievements(params);

  const items = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Department Achievements"
        subtitle="Every achievement submitted by students in your department"
      />

      <FilterTabs
        tabs={STATUS_OPTIONS}
        value={status}
        onChange={(next) => { setStatus(next); setPage(1); }}
      />

      {isLoading ? (
        <CardLoader lines={4} />
      ) : error ? (
        <p style={{ color: "var(--danger)" }}>Couldn't load the dashboard.</p>
      ) : items.length === 0 ? (
        <FlatCard style={{ textAlign: "center", padding: "64px 20px" }}>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>No achievements match this filter.</p>
        </FlatCard>
      ) : (
        <FlatCard padding="4px 8px">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Student</th>
                <th style={th}>Title</th>
                <th style={th}>Category</th>
                <th style={th}>Status</th>
                <th style={th}>Files</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td style={{ ...td, color: "var(--text-primary)" }}>
                    {a.student?.user?.name} <span style={{ color: "var(--text-muted)" }}>({a.student?.rollNo})</span>
                  </td>
                  <td style={td}>{a.title}</td>
                  <td style={td}>{a.category}</td>
                  <td style={td}><Badge type="status" value={a.status} /></td>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 14 }}>
                      {a.certificateUrl && (
                        <a style={linkStyle} href={a.certificateUrl} target="_blank" rel="noreferrer">Certificate</a>
                      )}
                      {a.proofUrl && (
                        <a style={linkStyle} href={a.proofUrl} target="_blank" rel="noreferrer">Proof</a>
                      )}
                      {!a.certificateUrl && !a.proofUrl && <span style={{ color: "var(--text-muted)" }}>—</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FlatCard>
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
