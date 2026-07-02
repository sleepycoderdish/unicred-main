// src/pages/student/achievements/AchievementDetail.jsx
//
// Detail page for one achievement, owned by the logged-in student.
// Shows the core fields, every faculty's review verdict, and — only
// while status is "pending" — lets the student edit fields, add a
// reviewer, or remove one.

import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  useAchievement,
  useUpdateAchievement,
  useAddReviewers,
  useRemoveReviewer,
} from "../../../hooks/useAchievements";
import { getFaculties } from "../../../api/faculties.api";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/PageHeader";
import { FlatCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { CardLoader } from "@/components/ui/Loader";
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import MultiSelect from "../../../components/ui/MultiSelect";
import FileUpload from "../../../components/ui/FileUpload";
import { isUrl } from "../../../utils/validators";

const fileLink = { color: "var(--text-accent)", textDecoration: "none", fontWeight: 500, fontSize: "0.85rem" };

export default function AchievementDetail() {
  // `useParams` (from react-router-dom) reads the ":id" segment out of the
  // current URL, e.g. /student/achievements/12 → id === "12".
  const { id } = useParams();
  const achievementId = Number(id);

  const { data: achievement, isLoading, error } = useAchievement(achievementId);
  const updateMutation = useUpdateAchievement(achievementId);
  const addReviewersMutation = useAddReviewers(achievementId);
  const removeReviewerMutation = useRemoveReviewer(achievementId);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null); // populated from `achievement` when edit starts
  const [errors, setErrors] = useState({});

  if (isLoading) return <div><CardLoader lines={4} /></div>;
  if (error || !achievement) return <p style={{ color: "var(--danger)" }}>Achievement not found.</p>;

  const isPending = achievement.status === "pending";

  function startEditing() {
    // Seed the form with the current values so unchanged fields are kept.
    setForm({
      title: achievement.title,
      category: achievement.category,
      description: achievement.description ?? "",
      certificateUrl: achievement.certificateUrl ?? "",
      proofUrl: achievement.proofUrl ?? "",
    });
    setEditing(true);
  }

  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.category.trim()) next.category = "Category is required.";
    if (!isUrl(form.certificateUrl)) next.certificateUrl = "Must be a valid http(s) link.";
    if (!isUrl(form.proofUrl)) next.proofUrl = "Must be a valid http(s) link.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    // Backend treats "" as an invalid URL — omit empty optional URL fields
    // so an un-attached certificate/proof is sent as "unchanged" rather than
    // triggering a 400.
    const payload = { ...form };
    if (!payload.certificateUrl) delete payload.certificateUrl;
    if (!payload.proofUrl) delete payload.proofUrl;
    updateMutation.mutate(payload, { onSuccess: () => setEditing(false) });
  }

  return (
    <div style={{ maxWidth: 720 }}>
      <PageHeader
        breadcrumb="My Achievements"
        title={achievement.title}
        subtitle={achievement.category}
        action={<Badge type="status" value={achievement.status} />}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {editing ? (
          <FlatCard style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input label="Title" value={form.title} error={errors.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input label="Category" value={form.category} error={errors.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Input label="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <FileUpload label="Certificate" value={form.certificateUrl} error={errors.certificateUrl}
              onChange={(url) => setForm({ ...form, certificateUrl: url })} />
            <FileUpload label="Proof" value={form.proofUrl} error={errors.proofUrl}
              onChange={(url) => setForm({ ...form, proofUrl: url })} />
            <div style={{ display: "flex", gap: 10 }}>
              <Button variant="primary" onClick={handleSave} loading={updateMutation.isPending} loadingText="Saving...">
                Save
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
            </div>
          </FlatCard>
        ) : (
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
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No certificate</span>
              )}
              {achievement.proofUrl ? (
                <a style={fileLink} href={achievement.proofUrl} target="_blank" rel="noreferrer">View proof</a>
              ) : (
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>No proof</span>
              )}
            </div>
            {/* Edit is only offered while pending — matches backend rules. */}
            {isPending && (
              <div>
                <Button size="sm" variant="secondary" onClick={startEditing}>Edit</Button>
              </div>
            )}
          </FlatCard>
        )}

        <ReviewerList
          achievement={achievement}
          isPending={isPending}
          onRemove={(facultyId) => removeReviewerMutation.mutate(facultyId)}
          removing={removeReviewerMutation.isPending}
        />

        {isPending && (
          <AddReviewerForm
            existingFacultyIds={achievement.reviews.map((r) => r.facultyId)}
            onAdd={(facultyIds) => addReviewersMutation.mutate(facultyIds)}
            adding={addReviewersMutation.isPending}
          />
        )}
      </div>
    </div>
  );
}

/** Renders each faculty's review row: name, their verdict, and remark if any. */
function ReviewerList({ achievement, isPending, onRemove, removing }) {
  return (
    <div>
      <h2 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-primary)", margin: "0 0 10px" }}>
        Reviewers
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {achievement.reviews.map((r) => (
          <FlatCard key={r.id} padding="12px 16px" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div>
              <p style={{ margin: 0, fontWeight: 500, color: "var(--text-primary)" }}>{r.faculty?.user?.name}</p>
              <p style={{ margin: "2px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>{r.faculty?.designation}</p>
              {r.remark && (
                <p style={{ margin: "6px 0 0", fontSize: "0.82rem", fontStyle: "italic", color: "var(--text-secondary)" }}>"{r.remark}"</p>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Badge type="status" value={r.status} />
              {/* Backend only allows removing a reviewer who hasn't
                  responded yet, and only if at least one would remain —
                  disable rather than let it 400. */}
              {isPending && r.status === "pending" && achievement.reviews.length > 1 && (
                <Button size="sm" variant="danger" onClick={() => onRemove(r.facultyId)} disabled={removing}>
                  Remove
                </Button>
              )}
            </div>
          </FlatCard>
        ))}
      </div>
    </div>
  );
}

/** Small form to add one or more new reviewers to a pending achievement. */
function AddReviewerForm({ existingFacultyIds, onAdd, adding }) {
  const [selected, setSelected] = useState([]);

  const { data: facultyRes } = useQuery({
    queryKey: ["faculties", "all"],
    queryFn: () => getFaculties().then((res) => res.data),
  });

  // Don't let the student pick someone who's already a reviewer — the
  // backend would just skip them anyway, so filtering here avoids confusion.
  const options =
    facultyRes
      ?.filter((f) => !existingFacultyIds.includes(f.id))
      .map((f) => ({ value: f.id, label: `${f.user?.name} (${f.designation})` })) ?? [];

  function handleAdd() {
    if (selected.length === 0) return;
    onAdd(selected);
    setSelected([]);
  }

  return (
    <FlatCard style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <MultiSelect label="Add reviewer(s)" options={options} value={selected} onChange={setSelected} />
      <div>
        <Button variant="primary" onClick={handleAdd} disabled={adding || selected.length === 0} loading={adding} loadingText="Adding...">
          Add
        </Button>
      </div>
    </FlatCard>
  );
}
