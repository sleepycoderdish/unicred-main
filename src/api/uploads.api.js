// src/api/uploads.api.js
//
// Talks to the backend's /api/uploads route. The browser sends the raw file
// as multipart/form-data; the backend uploads it to Cloudinary (its own
// credentials) and returns the hosted URL. We never touch Cloudinary directly
// from the frontend — the secret stays server-side.
//
// Returns the standard envelope { success, message, data: { url } }; callers
// usually want `res.data.url`.

import client from "./client"; // shared axios instance (adds the auth token)

/**
 * uploadFile
 * Uploads a single file and resolves to the backend envelope.
 *
 * @param {File} file - a File object from an <input type="file">
 * @returns {Promise<{ success: boolean, message: string, data: { url: string } }>}
 */
export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("file", file); // field name MUST match upload.single("file")

  // We override the instance's default application/json header. axios detects
  // the FormData body and fills in the correct multipart boundary itself.
  return client
    .post("/api/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};
