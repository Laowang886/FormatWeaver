import fs from "fs/promises";
import path from "path";

const storageRoot = path.resolve(process.env.STORAGE_DIR ?? "storage");

export function getStorageRoot() {
  return storageRoot;
}

export function getJobDirectory(jobId: string) {
  return path.join(storageRoot, "jobs", jobId);
}

export function getJobInputDirectory(jobId: string) {
  return path.join(getJobDirectory(jobId), "inputs");
}

export function getJobOutputDirectory(jobId: string) {
  return path.join(getJobDirectory(jobId), "outputs");
}

export async function ensureJobDirectories(jobId: string) {
  await fs.mkdir(getJobInputDirectory(jobId), { recursive: true });
  await fs.mkdir(getJobOutputDirectory(jobId), { recursive: true });
}

function safeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]+/g, "_");
}

function inferMimeType(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();

  switch (ext) {
    case ".pdf":
      return "application/pdf";
    case ".docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case ".xlsx":
      return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case ".csv":
      return "text/csv";
    case ".txt":
      return "text/plain";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".zip":
      return "application/zip";
    default:
      return "application/octet-stream";
  }
}

export async function saveUploadFiles(jobId: string, files: File[]) {
  await ensureJobDirectories(jobId);

  const saved = [] as Array<{
    originalName: string;
    storedName: string;
    storedPath: string;
    mimeType: string;
    size: number;
  }>;

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const baseName = safeFileName(file.name || `input-${index + 1}`);
    const storedName = `${index + 1}-${baseName}`;
    const storedPath = path.join(getJobInputDirectory(jobId), storedName);
    const bytes = Buffer.from(await file.arrayBuffer());

    await fs.writeFile(storedPath, bytes);

    saved.push({
      originalName: file.name,
      storedName,
      storedPath,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
    });
  }

  return saved;
}

export async function writeJobOutputFile(
  jobId: string,
  fileName: string,
  content: Buffer | string,
  mimeType = inferMimeType(fileName),
) {
  await fs.mkdir(getJobOutputDirectory(jobId), { recursive: true });
  const filePath = path.join(getJobOutputDirectory(jobId), fileName);
  await fs.writeFile(filePath, content);
  const stats = await fs.stat(filePath);

  return { fileName, filePath, mimeType, size: stats.size };
}

export async function readJobFile(filePath: string) {
  return fs.readFile(filePath);
}

export async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function listJobOutputs(jobId: string) {
  const dir = getJobOutputDirectory(jobId);
  try {
    return await fs.readdir(dir);
  } catch {
    return [] as string[];
  }
}
