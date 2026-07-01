// src/components/ui/FileUpload.jsx
// ─────────────────────────────────────────────────────────────
// A single-file uploader for certificates / proofs / offer letters.
//
// The student picks a file → it's uploaded to Cloudinary through our own
// backend (/api/uploads) → the returned hosted URL is handed back via
// onChange(url). The parent form stores that URL in its existing
// certificateUrl / proofUrl / offerLetterUrl field, and the normal
// create/update request persists it — no other form logic changes.
//
//   <FileUpload
//     label="Certificate (optional)"
//     value={form.certificateUrl}
//     onChange={(url) => setField("certificateUrl", url)}
//     error={errors.certificateUrl}
//   />
// ─────────────────────────────────────────────────────────────

import { useRef, useState } from "react";
import { uploadFile } from "../../api/uploads.api";

export function FileUpload({
  label,
  value,                 // current URL (may be "" or undefined)
  onChange,              // onChange(url) — "" clears it
  error,                 // validation error from the parent form
  accept = "image/png,image/jpeg,image/webp,application/pdf",
  disabled,
  style = {},
}) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState(""); // upload-specific error

  const hasError = !!(error || localError);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    // Reset the input so picking the SAME file again still fires onChange.
    e.target.value = "";
    if (!file) return;

    setLocalError("");
    setUploading(true);
    try {
      const res = await uploadFile(file);
      const url = res?.data?.url;
      if (!url) throw new Error("Upload succeeded but no URL was returned.");
      onChange?.(url);
    } catch (err) {
      setLocalError(err?.response?.data?.message ?? err?.message ?? "Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, width: "100%", ...style }}>
      {label && (
        <span style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-secondary)" }}>
          {label}
        </span>
      )}

      {/* Hidden native input, driven by the styled button below */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFile}
        disabled={disabled || uploading}
        style={{ display: "none" }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          style={{
            fontSize:     "0.8rem",
            fontWeight:    500,
            padding:      "8px 14px",
            borderRadius: "var(--radius-sm)",
            cursor:        disabled || uploading ? "not-allowed" : "pointer",
            color:        "var(--text-accent)",
            background:   "var(--accent-light)",
            border:       "1px solid var(--accent-border)",
            opacity:       disabled || uploading ? 0.6 : 1,
          }}
        >
          {uploading ? "Uploading…" : value ? "Replace file" : "Upload file"}
        </button>

        {/* Once uploaded, show a link to the hosted file + a way to clear it */}
        {value && !uploading && (
          <>
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: "0.8rem", color: "var(--text-accent)", textDecoration: "underline" }}
            >
              View uploaded file
            </a>
            <button
              type="button"
              onClick={() => { setLocalError(""); onChange?.(""); }}
              disabled={disabled}
              style={{
                fontSize:   "0.8rem",
                color:      "var(--danger)",
                background: "none",
                border:     "none",
                cursor:     "pointer",
                padding:     0,
              }}
            >
              Remove
            </button>
          </>
        )}
      </div>

      {hasError && (
        <p style={{ fontSize: "0.75rem", color: "var(--danger)", margin: 0 }}>
          {error || localError}
        </p>
      )}
    </div>
  );
}

export default FileUpload;
