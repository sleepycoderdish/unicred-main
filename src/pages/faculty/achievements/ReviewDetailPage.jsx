// src/pages/faculty/achievements/ReviewDetailPage.jsx
//
// The screen a faculty member sees when reviewing one achievement:
// the achievement's details, what OTHER assigned faculty have already
// decided, and buttons to approve or reject (their own verdict only).
//
// Note: the achievement is only marked "approved" once EVERY assigned
// reviewer approves; a single rejection rejects it outright.

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useAchievementReview,
  useVerifyAchievement,
  useRejectAchievement,
} from "../../../hooks/useAchievements";
import { PageHeader } from "@/components/ui/PageHeader";
import { FlatCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { CardLoader } from "@/components/ui/Loader";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";

const fileLink = { color: "var(--text-accent)", textDecoration: "none", fontWeight: 500, fontSize: "0.85rem" };

export default function ReviewDetailPage() {
  const { id } = useParams();
  const achievementId = Number(id);
  const navigate = useNavigate();

  const { data, isLoading, error } = useAchievementReview(achievementId);
  const verifyMutation = useVerifyAchievement(achievementId);
  const rejectMutation = useRejectAchievement(achievementId);

  const [remark, setRemark] = useState("");
  const [rejectError, setRejectError] = useState("");

  if (isLoading) return <div><CardLoader lines={4} /></div>;
  if (error || !data) return <p style={{ color: "var(--danger)" }}>Couldn't load this review.</p>;

  const { achievement, myReview, otherReviews, isFirstResponder, message } = data;

  // The reviewer can only act while BOTH the achievement overall AND their
  // own review are still pending. The backend enforces the same guard and
  // returns 409 otherwise, so mirror it here to avoid showing dead buttons.
  const achievementSettled = achievement.status !== "pending";
  const alreadyResponded = myReview.status !== "pending";
  const canReview = !achievementSettled && !alreadyResponded;

  function handleApprove() {
    verifyMutation.mutate(remark || undefined, {
      onSuccess: () => navigate("/faculty/achievements"),
    });
  }

  function handleReject() {
    // Backend requires a non-empty remark on reject — check before sending.
    if (!remark.trim()) {
      setRejectError("A reason is required to reject.");
      return;
    }
    setRejectError("");
    rejectMutation.mutate(remark, {
      onSuccess: () => navigate("/faculty/achievements"),
    });
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        breadcrumb="Achievement Reviews"
        title={achievement.title}
        subtitle={`${achievement.category} · Submitted by ${achievement.student?.user?.name ?? "—"}`}
        action={<Badge type="status" value={achievement.status} />}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Achievement details the reviewer needs to make a decision:
            the description plus the supporting files the student attached. */}
        <FlatCard style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {achievement.description && (
            <p style={{ margin: 0, fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              {achievement.description}
            </p>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
            {achievement.certificateUrl ? (
              <a style={fileLink} href={achievement.certificateUrl} target="_blank" rel="noreferrer">View certificate</a>
            ) : (
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No certificate attached</span>
            )}
            {achievement.proofUrl ? (
              <a style={fileLink} href={achievement.proofUrl} target="_blank" rel="noreferrer">View proof</a>
            ) : (
              <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No proof attached</span>
            )}
          </div>
        </FlatCard>

        {/* isFirstResponder tells us whether anyone else has weighed in yet */}
        <p style={{
          margin: 0, fontSize: "0.8rem", padding: "10px 14px", borderRadius: "var(--radius-sm)",
          background: isFirstResponder ? "var(--accent-light)" : "var(--bg-elevated)",
          color: isFirstResponder ? "var(--text-accent)" : "var(--text-secondary)",
          border: `1px solid ${isFirstResponder ? "var(--accent-border)" : "var(--border-subtle)"}`,
        }}>
          {isFirstResponder ? "You are the first to review this." : message}
        </p>

        {otherReviews.length > 0 && (
          <div>
            <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 10px" }}>
              Other Reviewers
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {otherReviews.map((r) => (
                <FlatCard key={r.facultyId} padding="12px 16px">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <p style={{ margin: 0, fontWeight: 500, color: "var(--text-primary)" }}>
                      {r.facultyName} <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>({r.designation})</span>
                    </p>
                    <Badge type="status" value={r.status} />
                  </div>
                  {r.remark && (
                    <p style={{ margin: "6px 0 0", fontSize: "0.82rem", fontStyle: "italic", color: "var(--text-secondary)" }}>
                      "{r.remark}"
                    </p>
                  )}
                </FlatCard>
              ))}
            </div>
          </div>
        )}

        {!canReview ? (
          <p style={{ color: "var(--text-muted)" }}>
            {alreadyResponded
              ? `You already ${myReview.status} this achievement.`
              : `This achievement is already ${achievement.status} — no action needed.`}
          </p>
        ) : (
          <FlatCard style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input
              label="Remark (required to reject, optional to approve)"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              error={rejectError}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="primary" onClick={handleApprove} loading={verifyMutation.isPending} loadingText="Approving...">
                Approve
              </Button>
              <Button variant="danger" onClick={handleReject} loading={rejectMutation.isPending} loadingText="Rejecting...">
                Reject
              </Button>
            </div>
          </FlatCard>
        )}
      </div>
    </div>
  );
}
