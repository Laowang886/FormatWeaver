import assert from "node:assert/strict";
import test from "node:test";

import {
  encodeConversionMetadata,
  historyRecordFromJob,
} from "../src/lib/job-history-metadata.ts";

test("encodes conversion metadata and maps a database job to history", () => {
  const description = encodeConversionMetadata({
    sourceFormat: "pdf",
    targetFormat: "docx",
    conversionType: "pdf-to-docx",
  });

  assert.deepEqual(
    historyRecordFromJob({
      id: 42,
      title: "report.pdf",
      description,
      status: "completed",
      createdAt: new Date("2026-07-04T12:00:00.000Z"),
    }),
    {
      id: "42",
      fileName: "report.pdf",
      sourceFormat: "pdf",
      targetFormat: "docx",
      conversionType: "pdf-to-docx",
      status: "completed",
      createdAt: "2026-07-04T12:00:00.000Z",
      downloadUrl: "/api/jobs/42/download",
    },
  );
});

test("maps queued jobs to processing history records", () => {
  const description = encodeConversionMetadata({
    sourceFormat: "docx",
    targetFormat: "pdf",
    conversionType: "docx-to-pdf",
  });

  const record = historyRecordFromJob({
    id: 7,
    title: "draft.docx",
    description,
    status: "queued",
    createdAt: new Date("2026-07-04T13:00:00.000Z"),
  });

  assert.equal(record?.status, "processing");
});

test("rejects malformed or unsupported database history metadata", () => {
  assert.equal(
    historyRecordFromJob({
      id: 9,
      title: "unknown.bin",
      description: '{"conversionType":"bin-to-pdf"}',
      status: "completed",
      createdAt: new Date("2026-07-04T14:00:00.000Z"),
    }),
    null,
  );
});
