/**
 * Attachment validation architecture (spec §29). Not yet wired to an upload
 * UI or Supabase Storage bucket — see README "Roadmap" — but the limits and
 * checks here are real and unit-tested, ready to gate a future upload route.
 */

export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const ALLOWED_ATTACHMENT_TYPES: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateAttachment(file: { name: string; type: string; size: number }): FileValidationResult {
  if (file.size <= 0) {
    return { valid: false, error: "The file is empty." };
  }
  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return { valid: false, error: "Files must be 10MB or smaller." };
  }

  const allowedExtensions = ALLOWED_ATTACHMENT_TYPES[file.type];
  if (!allowedExtensions) {
    return { valid: false, error: "Only PDF, DOCX, XLSX, JPG, and PNG files are supported." };
  }

  const lowerName = file.name.toLowerCase();
  if (!allowedExtensions.some((ext) => lowerName.endsWith(ext))) {
    return { valid: false, error: "The file extension doesn't match its type." };
  }

  return { valid: true };
}
