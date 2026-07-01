// src/pages/faculty/achievements/ReviewDetailPage.jsx
//
// The screen a faculty member sees when reviewing one achievement:
// the achievement's details, what OTHER assigned faculty have already
// decided, and buttons to approve or reject (their own verdict only).

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useAchievementReview,
  useVerifyAchievement,
  useRejectAchievement,
} from "../../../hooks/useAchievements";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";

export default function ReviewDetailPage() {
  const { id } = useParams();
  const achievementId = Number(id);
  const navigate = useNavigate();

  const { data, isLoading, error } = useAchievementReview(achievementId);
  const verifyMutation = useVerifyAchievement(achievementId);
  const rejectMutation = useRejectAchievement(achievementId);

  const [remark, setRemark] = useState("");
  const [rejectError, setRejectError] = useState("");

  if (isLoading) return <p className="p-4">Loading…</p>;
  if (error || !data) return <p className="p-4 text-red-600">Couldn't load this review.</p>;

  const { achievement, myReview, otherReviews, isFirstResponder, message } = data;

  // Once THIS faculty has already approved or rejected, there's nothing
  // left to do here — the backend would return 409 on another attempt.
  const alreadyResponded = myReview.status !== "pending";

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
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{achievement.title}</h1>
        <Badge type="status" value={achievement.status} />
      </div>

      <p className="text-sm text-gray-500">
        {achievement.category} · Submitted by {achievement.student?.user?.name}
      </p>

      {/* Achievement details the reviewer needs to make a decision:
          the description plus the supporting files the student attached. */}
      <div className="border rounded p-4 space-y-2">
        {achievement.description && <p className="text-sm">{achievement.description}</p>}
        <div className="flex flex-wrap gap-4 text-sm">
          {achievement.certificateUrl ? (
            <a className="text-blue-400 underline" href={achievement.certificateUrl} target="_blank" rel="noreferrer">
              View certificate
            </a>
          ) : (
            <span className="text-gray-500">No certificate attached</span>
          )}
          {achievement.proofUrl ? (
            <a className="text-blue-400 underline" href={achievement.proofUrl} target="_blank" rel="noreferrer">
              View proof
            </a>
          ) : (
            <span className="text-gray-500">No proof attached</span>
          )}
        </div>
      </div>

      {/* isFirstResponder tells us whether anyone else has weighed in yet */}
      {isFirstResponder ? (
        <p className="text-sm bg-blue-50 text-blue-700 p-2 rounded">You are the first to review this.</p>
      ) : (
        <p className="text-sm bg-gray-50 p-2 rounded">{message}</p>
      )}

      {otherReviews.length > 0 && (
        <div>
          <h2 className="font-medium mb-2">Other Reviewers</h2>
          <ul className="space-y-2">
            {otherReviews.map((r) => (
              <li key={r.facultyId} className="border rounded p-3">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{r.facultyName} <span className="text-gray-500 text-sm">({r.designation})</span></p>
                  <Badge type="status" value={r.status} />
                </div>
                {r.remark && <p className="text-sm italic mt-1">"{r.remark}"</p>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {alreadyResponded ? (
        <p className="text-gray-500">You already {myReview.status} this achievement.</p>
      ) : (
        <div className="border rounded p-4 space-y-3">
          <Input
            label="Remark (required to reject, optional to approve)"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            error={rejectError}
          />
          <div className="flex gap-2">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded"
              onClick={handleApprove}
              disabled={verifyMutation.isPending}
            >
              Approve
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              Reject
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
