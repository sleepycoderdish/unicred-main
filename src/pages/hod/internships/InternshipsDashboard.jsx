// src/pages/hod/internships/InternshipsDashboard.jsx
//
// Read-only list of every internship logged by students in the HOD's
// department. Each row shows the linked achievement's status if there
// is one — internships don't have their own approve/reject step.

import { useState } from "react";
import { useDepartmentInternships } from "../../../hooks/useInternships";
import { PageHeader } from "@/components/ui/PageHeader";
import { FlatCard } from "@/components/ui/GlassCard";
import { Pager } from "@/components/ui/Pager";
import { CardLoader } from "@/components/ui/Loader";
import Badge from "../../../components/ui/Badge";

const th = { textAlign: "left", padding: "10px 12px", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", color: "var(--text-muted)" };
const td = { padding: "12px", fontSize: "0.85rem", color: "var(--text-secondary)", borderTop: "1px solid var(--border-subtle)" };

export default function InternshipsDashboard() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useDepartmentInternships({ page, limit: 20 });

  const items = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Department Internships"
        subtitle="Every internship logged by students in your department"
      />

      {isLoading ? (
        <CardLoader lines={4} />
      ) : error ? (
        <p style={{ color: "var(--danger)" }}>Couldn't load the dashboard.</p>
      ) : items.length === 0 ? (
        <FlatCard style={{ textAlign: "center", padding: "64px 20px" }}>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>No internships logged yet.</p>
        </FlatCard>
      ) : (
        <FlatCard padding="4px 8px">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Student</th>
                <th style={th}>Company</th>
                <th style={th}>Role</th>
                <th style={th}>Stipend</th>
                <th style={th}>Linked Achievement</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td style={{ ...td, color: "var(--text-primary)" }}>
                    {i.student?.user?.name} <span style={{ color: "var(--text-muted)" }}>({i.student?.rollNo})</span>
                  </td>
                  <td style={td}>{i.companyName}</td>
                  <td style={td}>{i.role}</td>
                  <td style={td}>{i.stipend != null ? `₹${i.stipend}/mo` : "—"}</td>
                  <td style={td}>
                    {i.achievement ? (
                      <Badge type="status" value={i.achievement.status} />
                    ) : (
                      <span style={{ color: "var(--text-muted)" }}>Not linked</span>
                    )}
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
