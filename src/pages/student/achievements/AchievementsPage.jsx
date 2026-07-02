// src/pages/student/achievements/AchievementsPage.jsx
//
// Student-facing page. Shows the student's own achievements as a list,
// lets them create a new one (with a faculty reviewer picker), and edit
// or delete any achievement that is still "pending".

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useMyAchievements,
  useCreateAchievement,
  useDeleteAchievement,
} from "../../../hooks/useAchievements";
import { getFaculties } from "../../../api/faculties.api"; // already exists in your project
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/ui/PageHeader";
import { FlatCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { Pager } from "@/components/ui/Pager";
import { CardLoader } from "@/components/ui/Loader";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import MultiSelect from "../../../components/ui/MultiSelect";
import FileUpload from "../../../components/ui/FileUpload";
import Badge from "../../../components/ui/Badge";
import { isUrl, facultyIdsValid } from "../../../utils/validators";

export default function AchievementsPage() {
  const navigate = useNavigate();
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

  const achievements = data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="My Achievements"
        subtitle="Submit achievements and track their verification"
        action={<Button variant="primary" onClick={() => setShowCreate(true)}>+ New Achievement</Button>}
      />

      {isLoading ? (
        <CardLoader lines={3} />
      ) : error ? (
        <p style={{ color: "var(--danger)" }}>Couldn't load achievements. Try refreshing.</p>
      ) : achievements.length === 0 ? (
        <FlatCard style={{ textAlign: "center", padding: "64px 20px" }}>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>No achievements yet. Add your first one above.</p>
        </FlatCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {achievements.map((a) => (
            <FlatCard key={a.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div
                onClick={() => navigate(`/student/achievements/${a.id}`)}
                style={{ cursor: "pointer", flex: 1, minWidth: 0 }}
              >
                <p style={{ margin: 0, fontWeight: 600, color: "var(--text-primary)" }}>{a.title}</p>
                <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>{a.category}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Badge type="status" value={a.status} />
                {/* Only pending achievements can be deleted — the backend
                    would 400 otherwise, so we hide the option entirely. */}
                {a.status === "pending" && (
                  <Button size="sm" variant="danger" onClick={() => handleDelete(a.id)} disabled={deleteMutation.isPending}>
                    Delete
                  </Button>
                )}
              </div>
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
    <Modal isOpen onClose={onClose} title="New Achievement" maxWidth={520}>
      <form onSubmit={handleSubmit} noValidate>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {errors.form && <p style={{ margin: 0, color: "var(--danger)", fontSize: "0.82rem" }}>{errors.form}</p>}

          <Input label="Title" value={form.title} error={errors.title}
            onChange={(e) => setField("title", e.target.value)} />
          <Input label="Category" value={form.category} error={errors.category}
            onChange={(e) => setField("category", e.target.value)} />
          <Input label="Description (optional)" value={form.description}
            onChange={(e) => setField("description", e.target.value)} />
          <FileUpload label="Certificate (optional)" value={form.certificateUrl} error={errors.certificateUrl}
            onChange={(url) => setField("certificateUrl", url)} />
          <FileUpload label="Proof (optional)" value={form.proofUrl} error={errors.proofUrl}
            onChange={(url) => setField("proofUrl", url)} />
          <MultiSelect label="Reviewers" options={facultyOptions} value={form.facultyIds} error={errors.facultyIds}
            onChange={(vals) => setField("facultyIds", vals)} />
        </div>

        <Modal.Footer>
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary" loading={createMutation.isPending} loadingText="Submitting...">
            Submit
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
