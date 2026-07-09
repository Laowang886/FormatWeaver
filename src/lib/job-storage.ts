import fs from "fs/promises";
import path from "path";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { JobInputFile } from "@/lib/job-types";

const storageRoot = path.resolve(process.env.STORAGE_DIR ?? "storage");
const r2Bucket = process.env.R2_BUCKET;

let r2Client: S3Client | undefined;

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

function getR2Endpoint() {
  if (process.env.R2_ENDPOINT) return process.env.R2_ENDPOINT;
  if (process.env.R2_ACCOUNT_ID) {
    return `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  }
  return undefined;
}

function getR2Client() {
  if (!r2Bucket) return undefined;

  const endpoint = getR2Endpoint();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) return undefined;

  if (!r2Client) {
    r2Client = new S3Client({
      region: "auto",
      endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  return r2Client;
}

export function isObjectStorageEnabled() {
  return Boolean(getR2Client() && r2Bucket);
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

function jobInputKey(jobId: string, storedName: string) {
  return `jobs/${jobId}/inputs/${storedName}`;
}

function jobOutputKey(jobId: string, fileName: string) {
  return `jobs/${jobId}/outputs/${safeFileName(fileName)}`;
}

async function uploadObject(key: string, body: Buffer, contentType: string) {
  const client = getR2Client();
  if (!client || !r2Bucket) return;

  await client.send(
    new PutObjectCommand({
      Bucket: r2Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );
}

async function bodyToBuffer(body: unknown) {
  if (!body) return Buffer.alloc(0);

  if (body instanceof Uint8Array) return Buffer.from(body);

  if (body instanceof Blob) {
    return Buffer.from(await body.arrayBuffer());
  }

  if (
    typeof body === "object" &&
    "transformToByteArray" in body &&
    typeof body.transformToByteArray === "function"
  ) {
    return Buffer.from(await body.transformToByteArray());
  }

  const chunks: Buffer[] = [];
  for await (const chunk of body as AsyncIterable<
    Buffer | Uint8Array | string
  >) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function readObject(key: string) {
  const client = getR2Client();
  if (!client || !r2Bucket) {
    throw new Error("R2 object storage is not configured");
  }

  const response = await client.send(
    new GetObjectCommand({
      Bucket: r2Bucket,
      Key: key,
    }),
  );

  return bodyToBuffer(response.Body);
}

export async function saveUploadFiles(jobId: string, files: File[]) {
  await ensureJobDirectories(jobId);

  const saved = [] as Array<{
    originalName: string;
    storedName: string;
    storedPath: string;
    storageKey?: string;
    mimeType: string;
    size: number;
  }>;

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const baseName = safeFileName(file.name || `input-${index + 1}`);
    const storedName = `${index + 1}-${baseName}`;
    const storedPath = path.join(getJobInputDirectory(jobId), storedName);
    const bytes = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "application/octet-stream";
    const storageKey = isObjectStorageEnabled()
      ? jobInputKey(jobId, storedName)
      : undefined;

    await fs.writeFile(storedPath, bytes);
    if (storageKey) await uploadObject(storageKey, bytes, mimeType);

    saved.push({
      originalName: file.name,
      storedName,
      storedPath,
      storageKey,
      mimeType,
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
  const bytes = Buffer.isBuffer(content) ? content : Buffer.from(content);
  await fs.writeFile(filePath, bytes);
  const storageKey = isObjectStorageEnabled()
    ? jobOutputKey(jobId, fileName)
    : undefined;
  if (storageKey) await uploadObject(storageKey, bytes, mimeType);
  const stats = await fs.stat(filePath);

  return { fileName, filePath, storageKey, mimeType, size: stats.size };
}

export async function readJobFile(filePath: string, storageKey?: string) {
  try {
    return await fs.readFile(filePath);
  } catch (error) {
    if (!storageKey) throw error;
    return readObject(storageKey);
  }
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

export async function materializeJobInputFiles(
  jobId: string,
  files: JobInputFile[],
) {
  await ensureJobDirectories(jobId);

  const materialized: JobInputFile[] = [];
  for (const file of files) {
    const localPath = path.join(getJobInputDirectory(jobId), file.storedName);

    if (!(await fileExists(localPath)) && file.storageKey) {
      const content = await readObject(file.storageKey);
      await fs.writeFile(localPath, content);
    }

    materialized.push({
      ...file,
      storedPath: localPath,
    });
  }

  return materialized;
}
