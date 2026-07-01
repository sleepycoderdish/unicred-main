// src/pages/student/internships/InternshipsPage.jsx
//
// Student-facing page for internships. An internship has NO review
// lifecycle of its own — its "verified" badge just mirrors whatever
// status the LINKED achievement has (or shows "Not linked" if none).
//
// Three things a student can do here:
//   1. Create a new internship (optionally linking an achievement right away)
//   2. Edit or delete an existing internship (no status lock, unlike achievements)
//   3. Link an achievement to an internship AFTER it was already created

import { useState } from "react";
import {
  useMyInternships,
  useCreateInternship,
  useUpdateInternship,
  useDeleteInternship,
  useLinkAchievement,
} from "../../../hooks/useInternships";
import { useMyAchievements } from "../../../hooks/useAchievements";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import FileUpload from "../../../components/ui/FileUpload";
import Badge from "../../../components/ui/Badge";
import { isUrl, isNonNegative, dateOrderValid } from "../../../utils/validators";

export default function InternshipsPage() {
  const { data, isLoading, error } = useMyInternships();
  const [showForm, setShowForm] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null); // null = creating new
  const [linkingInternship, setLinkingInternship] = useState(null); // internship being linked to an achievement
  const deleteMutation = useDeleteInternship();

  // window.confirm is a built-in browser function that pops up a native
  // OK/Cancel dialog and pauses the script until the user picks one. It
  // returns true if they clicked OK, false if Cancel.
  function handleDelete(id) {
    if (window.confirm("Delete this internship record?")) {
      deleteMutation.mutate(id);
    }
  }

  if (isLoading) return <p className="p-4">Loading internships…</p>;
  if (error) return <p className="p-4 text-red-600">Couldn't load internships.</p>;

  const internships = data?.items ?? [];

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold">My Internships</h1>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => {
            setEditingInternship(null);
            setShowForm(true);
          }}
        >
          + New Internship
        </button>
      </div>

      {internships.length === 0 && <p className="text-gray-500">No internships added yet.</p>}

      <ul className="space-y-3">
        {internships.map((i) => (
          <li key={i.id} className="border rounded p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{i.companyName} — {i.role}</p>
              {i.stipend != null && <p className="text-sm text-gray-500">₹{i.stipend}/mo</p>}
            </div>
            <div className="flex items-center gap-3 text-sm">
              {/* The internship itself has no status — this badge shows
                  the linked achievement's status, or a neutral "Not
                  linked" label if there isn't one. */}
              {i.achievement ? (
                <Badge type="status" value={i.achievement.status} />
              ) : (
                <button className="text-blue-600" onClick={() => setLinkingInternship(i)}>
                  Link achievement
                </button>
              )}
              <button
                className="text-blue-600"
                onClick={() => {
                  setEditingInternship(i);
                  setShowForm(true);
                }}
              >
                Edit
              </button>
              <button className="text-red-600" onClick={() => handleDelete(i.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showForm && (
        <InternshipFormModal
          internship={editingInternship}
          onClose={() => setShowForm(false)}
        />
      )}

      {linkingInternship && (
        <LinkAchievementModal
          internship={linkingInternship}
          onClose={() => setLinkingInternship(null)}
        />
      )}
    </div>
  );
}

/** Shared create/edit form. Pass `internship` to edit, or omit to create. */
function InternshipFormModal({ internship, onClose }) {
  const isEditing = Boolean(internship);
  const createMutation = useCreateInternship();
  const updateMutation = useUpdateInternship(internship?.id);

  // Achievements the student could link right at creation time. Only
  // approved ones make sense (a hackathon win that isn't verified yet
  // shouldn't back an internship claim), and only ones not already
  // linked to a different internship.
  const { data: achievementsData } = useMyAchievements({ limit: 100 });
  const linkableAchievements =
    achievementsData?.items?.filter((a) => a.status === "approved") ?? [];

  // `?.slice(0, 10)` trims an ISO datetime string like
  // "2026-05-01T00:00:00.000Z" down to just "2026-05-01", which is the
  // format an <input type="date"> expects.
  const [form, setForm] = useState({
    companyName: internship?.companyName ?? "",
    role: internship?.role ?? "",
    stipend: internship?.stipend ?? "",
    startDate: internship?.startDate?.slice(0, 10) ?? "",
    endDate: internship?.endDate?.slice(0, 10) ?? "",
    offerLetterUrl: internship?.offerLetterUrl ?? "",
    certificateUrl: internship?.certificateUrl ?? "",
    achievementId: internship?.achievementId ?? null,
  });
  const [errors, setErrors] = useState({});

  // Mirrors every backend validation rule so the user sees mistakes
  // instantly instead of waiting for a 400 response.
  function validate() {
    const next = {};
    if (!form.companyName.trim()) next.companyName = "Company name is required.";
    if (!form.role.trim()) next.role = "Role is required.";
    if (!isUrl(form.offerLetterUrl)) next.offerLetterUrl = "Must be a valid http(s) link.";
    if (!isUrl(form.certificateUrl)) next.certificateUrl = "Must be a valid http(s) link.";
    if (!isNonNegative(form.stipend)) next.stipend = "Stipend can't be negative.";
    if (!dateOrderValid(form.startDate, form.endDate)) next.endDate = "End date must be on or after the start date.";
    setErrors(next);
    // Object.keys(next).length === 0 means the `next` errors object is
    // empty — i.e. nothing failed validation, so it's safe to submit.
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault(); // stops the browser from doing a full-page reload on form submit
    if (!validate()) return;

    // Empty-string stipend means "not entered" — send it as null instead
    // of "" so the backend doesn't try to parse an empty string as a number.
    const payload = { ...form, stipend: form.stipend === "" ? null : Number(form.stipend) };

    // The backend rejects "" for the optional URL fields ("" isn't a valid
    // http(s) URL). Omit them unless a file was actually uploaded.
    if (!payload.offerLetterUrl) delete payload.offerLetterUrl;
    if (!payload.certificateUrl) delete payload.certificateUrl;

    if (isEditing) {
      updateMutation.mutate(payload, {
        onSuccess: () => onClose(),
        onError: (err) => setErrors({ form: err?.response?.data?.message ?? "Something went wrong." }),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => onClose(),
        onError: (err) => setErrors({ form: err?.response?.data?.message ?? "Something went wrong." }),
      });
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 p-4">
        <h2 className="text-lg font-semibold">{isEditing ? "Edit" : "New"} Internship</h2>

        {errors.form && <p className="text-red-600 text-sm">{errors.form}</p>}

        <Input label="Company Name" value={form.companyName} error={errors.companyName}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        <Input label="Role" value={form.role} error={errors.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })} />
        <Input label="Stipend (optional)" type="number" value={form.stipend} error={errors.stipend}
          onChange={(e) => setForm({ ...form, stipend: e.target.value })} />
        <Input label="Start Date (optional)" type="date" value={form.startDate}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
        <Input label="End Date (optional)" type="date" value={form.endDate} error={errors.endDate}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
        <FileUpload label="Offer Letter (optional)" value={form.offerLetterUrl} error={errors.offerLetterUrl}
          onChange={(url) => setForm({ ...form, offerLetterUrl: url })} />
        <FileUpload label="Certificate (optional)" value={form.certificateUrl} error={errors.certificateUrl}
          onChange={(url) => setForm({ ...form, certificateUrl: url })} />

        {/* Only offered when CREATING — once an internship exists, linking
            goes through the dedicated "Link achievement" button/modal
            instead, which hits the backend's link-achievement endpoint. */}
        {!isEditing && (
          <Select
            label="Link an Achievement (optional)"
            placeholder="No achievement linked"
            options={linkableAchievements.map((a) => ({ value: a.id, label: a.title }))}
            value={form.achievementId ?? ""}
            onChange={(e) =>
              setForm({ ...form, achievementId: e.target.value ? Number(e.target.value) : null })
            }
          />
        )}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

/**
 * LinkAchievementModal
 * Lets the student attach an approved achievement to an internship that
 * was created without one. Calls the dedicated link-achievement endpoint
 * (PATCH /internships/:id/link-achievement) rather than a generic edit.
 */
function LinkAchievementModal({ internship, onClose }) {
  const linkMutation = useLinkAchievement(internship.id);
  const [achievementId, setAchievementId] = useState(null);
  const [error, setError] = useState("");

  const { data: achievementsData } = useMyAchievements({ limit: 100 });
  const linkableAchievements =
    achievementsData?.items?.filter((a) => a.status === "approved") ?? [];

  function handleLink() {
    if (!achievementId) {
      setError("Pick an achievement to link.");
      return;
    }
    linkMutation.mutate(achievementId, {
      onSuccess: () => onClose(),
      // 409 means that achievement is already linked to a different
      // internship — the backend tells us in the message.
      onError: (err) => setError(err?.response?.data?.message ?? "Couldn't link that achievement."),
    });
  }

  return (
    <Modal isOpen onClose={onClose}>
      <div className="space-y-4 p-4">
        <h2 className="text-lg font-semibold">Link an Achievement</h2>
        <p className="text-sm text-gray-500">
          Linking to {internship.companyName} — {internship.role}
        </p>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <Select
          label="Achievement"
          placeholder="Select an achievement"
          options={linkableAchievements.map((a) => ({ value: a.id, label: a.title }))}
          value={achievementId ?? ""}
          onChange={(e) => setAchievementId(e.target.value ? Number(e.target.value) : null)}
        />

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose}>Cancel</button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleLink}
            disabled={linkMutation.isPending}
          >
            {linkMutation.isPending ? "Linking…" : "Link"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
