// src/pages/student/achievements/AchievementsPage.jsx
//
// Student-facing page. Shows the student's own achievements as a list,
// lets them create a new one (with a faculty reviewer picker), and edit
// or delete any achievement that is still "pending".
//
// Assumed reusable components already in your project (per the file map):
//   <Modal open={bool} onClose={fn}>...</Modal>
//   <Input label="" value="" onChange={fn} error="" />
//   <Select label="" options={[{value,label}]} value multiple onChange />
//   <Toast /> — assumed to be a global toast system with a `useToast()`
//               hook or similar; adjust the import to match your app.
//   <Badge type="status" value="pending|approved|rejected" />

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  useMyAchievements,
  useCreateAchievement,
  useDeleteAchievement,
} from "../../../hooks/useAchievements";
import { getFaculties } from "../../../api/faculties.api"; // already exists in your project
import { useQuery } from "@tanstack/react-query";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import MultiSelect from "../../../components/ui/MultiSelect";
import FileUpload from "../../../components/ui/FileUpload";
import Badge from "../../../components/ui/Badge";
import { isUrl, facultyIdsValid } from "../../../utils/validators";

export default function AchievementsPage() {
  // Pagination is basic here — bump `page` when the user clicks Next/Prev.
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useMyAchievements({ page, limit: 20 });

  // Controls whether the "create achievement" modal is visible.
  const [showCreate, setShowCreate] = useState(false);

  const deleteMutation = useDeleteAchievement();

  // Simple confirm-then-delete. Only ever called from a pending row because
  // we hide the Delete button otherwise.
  function handleDelete(id) {
    if (window.confirm("Delete this achievement? This cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  }

  if (isLoading) return <p className="p-4">Loading your achievements…</p>;
  if (error) return <p className="p-4 text-red-600">Couldn't load achievements. Try refreshing.</p>;

  const achievements = data?.items ?? [];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">My Achievements</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowCreate(true)}
        >
          + New Achievement
        </button>
      </div>

      {achievements.length === 0 && (
        <p className="text-gray-500">No achievements yet. Add your first one above.</p>
      )}

      <ul className="space-y-3">
        {achievements.map((a) => (
          <li key={a.id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <Link to={`/student/achievements/${a.id}`} className="font-medium hover:underline">
                {a.title}
              </Link>
              <p className="text-sm text-gray-500">{a.category}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge type="status" value={a.status} />
              {/* Only pending achievements can be deleted — the backend
                  would 400 otherwise, so we hide the option entirely. */}
              {a.status === "pending" && (
                <button
                  className="text-red-600 text-sm"
                  onClick={() => handleDelete(a.id)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* Basic pager driven by the backend's pagination object */}
      {data?.pagination && (
        <div className="flex justify-between mt-4 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </button>
          <span>
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <button
            disabled={page >= data.pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}

      {showCreate && <CreateAchievementModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

/**
 * CreateAchievementModal
 * A separate component keeps AchievementsPage from becoming a giant blob.
 * Handles its own form state, validation, and submission.
 */
function CreateAchievementModal({ onClose }) {
  const createMutation = useCreateAchievement();

  // Faculty list for the reviewer picker. `getFaculties` already exists
  // in your project's api/faculties.api.js — we just query it here.
  const { data: facultyRes } = useQuery({
    queryKey: ["faculties", "all"],
    queryFn: () => getFaculties().then((res) => res.data),
  });
  const facultyOptions =
    facultyRes?.map((f) => ({ value: f.id, label: `${f.user?.name} (${f.designation})` })) ?? [];

  const [form, setForm] = useState({
    title: "",
    category: "",
    description: "",
    certificateUrl: "",
    proofUrl: "",
    facultyIds: [],
  });
  const [errors, setErrors] = useState({});

  // Update one field in the form state without retyping the whole object
  // every time — a common React pattern for controlled forms.
  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  // Mirrors the backend's validation rules so the user sees errors
  // instantly instead of waiting for a 400 response.
  function validate() {
    const next = {};
    if (!form.title.trim()) next.title = "Title is required.";
    if (!form.category.trim()) next.category = "Category is required.";
    if (!isUrl(form.certificateUrl)) next.certificateUrl = "Must be a valid http(s) link.";
    if (!isUrl(form.proofUrl)) next.proofUrl = "Must be a valid http(s) link.";
    if (!facultyIdsValid(form.facultyIds)) next.facultyIds = "Pick at least one reviewer.";
    setErrors(next);
    return Object.keys(next).length === 0; // true = no errors = safe to submit
  }

  function handleSubmit(e) {
    e.preventDefault(); // stop the browser's default full-page form submit
    if (!validate()) return;

    // The backend rejects an empty string for the optional URL fields
    // ("" is not a valid http(s) URL). Only send them when a file was
    // actually uploaded — otherwise omit the key so the backend stores null.
    const payload = { ...form };
    if (!payload.certificateUrl) delete payload.certificateUrl;
    if (!payload.proofUrl) delete payload.proofUrl;
    if (!payload.description) delete payload.description;

    createMutation.mutate(payload, {
      onSuccess: () => onClose(),
      // If the backend still rejects it (e.g. a facultyId became invalid
      // in the meantime), surface that message instead of failing silently.
      onError: (err) => {
        setErrors({ form: err?.response?.data?.message ?? "Something went wrong." });
      },
    });
  }

  return (
    <Modal isOpen onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <h2 className="text-lg font-semibold">New Achievement</h2>

        {errors.form && <p className="text-red-600 text-sm">{errors.form}</p>}

        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          error={errors.title}
        />
        <Input
          label="Category"
          value={form.category}
          onChange={(e) => setField("category", e.target.value)}
          error={errors.category}
        />
        <Input
          label="Description (optional)"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
        />
        <FileUpload
          label="Certificate (optional)"
          value={form.certificateUrl}
          onChange={(url) => setField("certificateUrl", url)}
          error={errors.certificateUrl}
        />
        <FileUpload
          label="Proof (optional)"
          value={form.proofUrl}
          onChange={(url) => setField("proofUrl", url)}
          error={errors.proofUrl}
        />
        <MultiSelect
          label="Reviewers"
          options={facultyOptions}
          value={form.facultyIds}
          onChange={(vals) => setField("facultyIds", vals)}
          error={errors.facultyIds}
        />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2">
            Cancel
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Submitting…" : "Submit"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
