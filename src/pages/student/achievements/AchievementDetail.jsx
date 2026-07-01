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
import Badge from "../../../components/ui/Badge";
import Input from "../../../components/ui/Input";
import MultiSelect from "../../../components/ui/MultiSelect";
import FileUpload from "../../../components/ui/FileUpload";
import { isUrl } from "../../../utils/validators";

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

  if (isLoading) return <p className="p-4">Loading…</p>;
  if (error || !achievement) return <p className="p-4 text-red-600">Achievement not found.</p>;

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
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{achievement.title}</h1>
        <Badge type="status" value={achievement.status} />
      </div>

      {editing ? (
        <div className="space-y-3 border rounded p-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            error={errors.title}
          />
          <Input
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            error={errors.category}
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <FileUpload
            label="Certificate"
            value={form.certificateUrl}
            onChange={(url) => setForm({ ...form, certificateUrl: url })}
            error={errors.certificateUrl}
          />
          <FileUpload
            label="Proof"
            value={form.proofUrl}
            onChange={(url) => setForm({ ...form, proofUrl: url })}
            error={errors.proofUrl}
          />
          <div className="flex gap-2">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={handleSave}
              disabled={updateMutation.isPending}
            >
              Save
            </button>
            <button onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <p><span className="text-gray-500">Category:</span> {achievement.category}</p>
          {achievement.description && <p>{achievement.description}</p>}
          {achievement.certificateUrl && (
            <p><a className="text-blue-600 underline" href={achievement.certificateUrl} target="_blank" rel="noreferrer">Certificate</a></p>
          )}
          {achievement.proofUrl && (
            <p><a className="text-blue-600 underline" href={achievement.proofUrl} target="_blank" rel="noreferrer">Proof</a></p>
          )}
          {/* Edit is only offered while pending — matches backend rules. */}
          {isPending && <button className="text-blue-600 text-sm" onClick={startEditing}>Edit</button>}
        </div>
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
  );
}

/** Renders each faculty's review row: name, their verdict, and remark if any. */
function ReviewerList({ achievement, isPending, onRemove, removing }) {
  return (
    <div>
      <h2 className="font-medium mb-2">Reviewers</h2>
      <ul className="space-y-2">
        {achievement.reviews.map((r) => (
          <li key={r.id} className="border rounded p-3 flex items-center justify-between">
            <div>
              <p className="font-medium">{r.faculty?.user?.name}</p>
              <p className="text-sm text-gray-500">{r.faculty?.designation}</p>
              {r.remark && <p className="text-sm italic">"{r.remark}"</p>}
            </div>
            <div className="flex items-center gap-3">
              <Badge type="status" value={r.status} />
              {/* Backend only allows removing a reviewer who hasn't
                  responded yet, and only if at least one would remain —
                  disable rather than let it 400. */}
              {isPending && r.status === "pending" && achievement.reviews.length > 1 && (
                <button
                  className="text-red-600 text-sm"
                  onClick={() => onRemove(r.facultyId)}
                  disabled={removing}
                >
                  Remove
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
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
    <div className="border rounded p-3 space-y-2">
      <MultiSelect label="Add reviewer(s)" options={options} value={selected} onChange={setSelected} />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleAdd}
        disabled={adding || selected.length === 0}
      >
        {adding ? "Adding…" : "Add"}
      </button>
    </div>
  );
}
