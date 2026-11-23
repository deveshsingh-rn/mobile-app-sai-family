import { apiClient } from "./api";

/**
 * Direct (presigned) upload: the phone PUTs the file straight to the storage bucket, then the post
 * is created with just the object key. Large videos no longer pass through nginx / the load
 * balancer / our API, which used to cut long uploads ("The network connection was lost.").
 *
 * The native uploader streams the file from disk (it is never read into JS memory) and reports
 * progress. Returns null when the backend cannot sign uploads (e.g. Azure storage), so the caller
 * falls back to the old multipart upload.
 */

type UploadTicket = {
  key: string;
  method: "PUT";
  uploadUrl: string;
  headers: Record<string, string>;
  expiresAt: string;
  maxBytes: number;
};

export class DirectUploadError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "DirectUploadError";
  }
}

async function fileSize(uri: string) {
  const FileSystem = await import("expo-file-system/legacy");
  const info = await FileSystem.getInfoAsync(uri);
  return info.exists && typeof info.size === "number" ? info.size : 0;
}

export async function uploadFileDirect(
  file: { uri: string; mimeType: string },
  onProgress?: (fraction: number) => void
): Promise<string | null> {
  const sizeBytes = await fileSize(file.uri);
  if (!sizeBytes) throw new DirectUploadError("The selected file could not be read.");

  let ticket: UploadTicket;
  try {
    const { data } = await apiClient.post<UploadTicket>("/api/media/upload-url", {
      contentType: file.mimeType,
      sizeBytes,
    });
    ticket = data;
  } catch (error) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    if (status === 501 || status === 404) return null; // backend cannot sign → multipart fallback
    throw error;
  }

  const FileSystem = await import("expo-file-system/legacy");
  const task = FileSystem.createUploadTask(
    ticket.uploadUrl,
    file.uri,
    {
      headers: ticket.headers,
      httpMethod: "PUT",
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    },
    (progress) => {
      if (progress.totalBytesExpectedToSend > 0) {
        onProgress?.(progress.totalBytesSent / progress.totalBytesExpectedToSend);
      }
    }
  );

  const result = await task.uploadAsync();
  if (!result || result.status < 200 || result.status >= 300) {
    const status = result?.status;
    throw new DirectUploadError(
      status === 400 ? "This file is too large. Please choose a smaller file." : "The upload did not finish. Please try again.",
      status === 400 ? 413 : status
    );
  }
  onProgress?.(1);
  return ticket.key;
}
