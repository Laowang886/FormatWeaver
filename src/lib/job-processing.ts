import path from "path";
import fs from "fs/promises";
import JSZip from "jszip";
import PDFDocument from "pdfkit";
import { PDFDocument as PdfLibDocument } from "pdf-lib";
import mammoth from "mammoth";
import { Document, Packer, Paragraph, TextRun } from "docx";
import pdfParse from "pdf-parse";
import * as XLSX from "xlsx";
import sharp from "sharp";
import type {
  ConversionType,
  ConversionOptionsState,
} from "@/components/converter/conversion-types";
import type { JobInputFile, JobOutput } from "@/lib/job-types";
import {
  materializeJobInputFiles,
  readJobFile,
  writeJobOutputFile,
} from "@/lib/job-storage";

function sortInputs(
  files: JobInputFile[],
  order: ConversionOptionsState["mergeOrder"],
) {
  const list = [...files];
  if (order === "filename-asc") {
    return list.sort((a, b) => a.originalName.localeCompare(b.originalName));
  }
  if (order === "filename-desc") {
    return list.sort((a, b) => b.originalName.localeCompare(a.originalName));
  }
  return list;
}

async function createPdfFromText(text: string, title: string) {
  const doc = new PDFDocument({ size: "A4", margin: 40 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) =>
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)),
  );

  doc.fontSize(20).text(title, { underline: false });
  doc.moveDown();
  doc.fontSize(12).text(text, { align: "left" });
  doc.end();

  await new Promise<void>((resolve) => doc.on("end", () => resolve()));
  return Buffer.concat(chunks);
}

async function convertTxtToPdf(inputPath: string, title: string) {
  const text = await fs.readFile(inputPath, "utf8");
  return createPdfFromText(text, title);
}

async function convertPdfToTxt(inputPath: string) {
  const buffer = await readJobFile(inputPath);
  const parsed = await pdfParse(buffer);
  return Buffer.from(parsed.text || "", "utf8");
}

async function pdfToDocx(inputPath: string) {
  const buffer = await readJobFile(inputPath);
  const parsed = await pdfParse(buffer);
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: parsed.text || "Converted from PDF",
                bold: true,
              }),
            ],
          }),
        ],
      },
    ],
  });
  return Packer.toBuffer(doc);
}

async function docxToPdf(inputPath: string) {
  const buffer = await readJobFile(inputPath);
  const result = await mammoth.extractRawText({ buffer });
  return createPdfFromText(
    result.value || "Converted from DOCX",
    "Word to PDF",
  );
}

async function mergePdfs(
  inputs: JobInputFile[],
  order: ConversionOptionsState["mergeOrder"],
  jobId: string,
) {
  const merged = await PdfLibDocument.create();
  const sorted = sortInputs(inputs, order);

  for (const file of sorted) {
    const pdfBytes = await readJobFile(file.storedPath);
    const src = await PdfLibDocument.load(pdfBytes);
    const pages = await merged.copyPages(src, src.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }

  const outputBytes = await merged.save();
  return writeJobOutputFile(jobId, "merged.pdf", Buffer.from(outputBytes));
}

async function splitPdf(inputPath: string, pageRange: string, jobId: string) {
  const bytes = await readJobFile(inputPath);
  const src = await PdfLibDocument.load(bytes);
  const totalPages = src.getPageCount();
  const ranges = parsePageRange(pageRange, totalPages);
  const zip = new JSZip();

  for (const pageIndex of ranges) {
    const out = await PdfLibDocument.create();
    const [copiedPage] = await out.copyPages(src, [pageIndex - 1]);
    out.addPage(copiedPage);
    const pdfBytes = await out.save();
    zip.file(`page-${pageIndex}.pdf`, pdfBytes);
  }

  const zipBytes = await zip.generateAsync({ type: "nodebuffer" });
  return writeJobOutputFile(jobId, "split-pages.zip", zipBytes);
}

async function imagesToPdf(
  inputs: JobInputFile[],
  order: ConversionOptionsState["mergeOrder"],
  jobId: string,
) {
  const merged = await PdfLibDocument.create();
  const sorted = sortInputs(inputs, order);

  for (const file of sorted) {
    const imageBytes = await readJobFile(file.storedPath);
    const embedded = file.mimeType.includes("png")
      ? await merged.embedPng(imageBytes)
      : await merged.embedJpg(imageBytes);
    const page = merged.addPage([embedded.width, embedded.height]);
    page.drawImage(embedded, {
      x: 0,
      y: 0,
      width: embedded.width,
      height: embedded.height,
    });
  }

  const outputBytes = await merged.save();
  return writeJobOutputFile(
    jobId,
    "images-to-pdf.pdf",
    Buffer.from(outputBytes),
  );
}

async function pdfToImages(
  inputPath: string,
  targetFormat: ConversionOptionsState["targetFormat"],
  jobId: string,
) {
  const buffer = await readJobFile(inputPath);
  const parsed = await pdfParse(buffer);
  const zip = new JSZip();
  const pageText = (parsed.text || "No text extracted from PDF").trim();
  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900">
      <rect width="100%" height="100%" fill="#0f172a" />
      <text x="60" y="100" fill="#e2e8f0" font-size="44" font-family="Arial">${escapeXml(
        path.basename(inputPath),
      )}</text>
      <text x="60" y="180" fill="#94a3b8" font-size="28" font-family="Arial">PDF to ${targetFormat.toUpperCase()} preview</text>
      <text x="60" y="260" fill="#cbd5e1" font-size="22" font-family="Arial">${escapeXml(
        pageText.slice(0, 700),
      )}</text>
    </svg>`,
  );

  const imageBuffer = await sharp(svg)
    .resize({ width: 1600, height: 900, fit: "cover" })
    .toFormat(targetFormat)
    .toBuffer();

  zip.file(`page-1.${targetFormat}`, imageBuffer);
  const zipBytes = await zip.generateAsync({ type: "nodebuffer" });
  return writeJobOutputFile(
    jobId,
    `pdf-to-images-${targetFormat}.zip`,
    zipBytes,
  );
}

async function compressImage(
  inputPath: string,
  quality: number,
  jobId: string,
) {
  const source = await readJobFile(inputPath);
  const output = await sharp(source)
    .rotate()
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();
  return writeJobOutputFile(jobId, "compressed-image.jpg", output);
}

async function convertImageFormat(
  inputPath: string,
  targetFormat: ConversionOptionsState["targetFormat"],
  jobId: string,
) {
  const source = await readJobFile(inputPath);
  const output = await sharp(source).rotate().toFormat(targetFormat).toBuffer();
  return writeJobOutputFile(jobId, `converted-image.${targetFormat}`, output);
}

async function excelToCsv(inputPath: string, jobId: string) {
  const workbook = XLSX.readFile(inputPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const csv = XLSX.utils.sheet_to_csv(sheet);
  return writeJobOutputFile(jobId, "sheet.csv", Buffer.from(csv, "utf8"));
}

async function csvToExcel(inputPath: string, jobId: string) {
  const csv = await fs.readFile(inputPath, "utf8");
  const workbook = XLSX.read(csv, { type: "string" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];
  const outWorkbook = XLSX.utils.book_new();
  const outSheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(outWorkbook, outSheet, "Sheet1");
  const output = XLSX.write(outWorkbook, { bookType: "xlsx", type: "buffer" });
  return writeJobOutputFile(jobId, "sheet.xlsx", output);
}

async function excelToCsvOrReverse(inputPath: string, jobId: string) {
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === ".csv") {
    return csvToExcel(inputPath, jobId);
  }
  return excelToCsv(inputPath, jobId);
}

function parsePageRange(pageRange: string, totalPages: number) {
  if (!pageRange.trim()) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>();
  const parts = pageRange
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part.split("-").map((value) => Number(value.trim()));
      if (!Number.isNaN(start) && !Number.isNaN(end)) {
        for (
          let page = Math.max(1, start);
          page <= Math.min(totalPages, end);
          page += 1
        ) {
          pages.add(page);
        }
      }
      continue;
    }

    const page = Number(part);
    if (!Number.isNaN(page) && page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function processJobConversion(params: {
  jobId: string;
  type: ConversionType;
  options: ConversionOptionsState;
  files: JobInputFile[];
}): Promise<JobOutput> {
  const { jobId, type, options } = params;
  const files = await materializeJobInputFiles(jobId, params.files);

  if (type === "pdf-merge") {
    const output = await mergePdfs(files, options.mergeOrder, jobId);
    return {
      artifacts: [output],
      primaryArtifact: output,
      message: "Merged PDFs successfully.",
    };
  }

  if (type === "images-pdf") {
    const output = await imagesToPdf(files, options.mergeOrder, jobId);
    return {
      artifacts: [output],
      primaryArtifact: output,
      message: "Merged images into PDF.",
    };
  }

  if (type === "pdf-split") {
    const output = await splitPdf(
      files[0].storedPath,
      options.pageRange,
      jobId,
    );
    return {
      artifacts: [output],
      primaryArtifact: output,
      message: "Split PDF into page files.",
    };
  }

  if (type === "image-compress") {
    const output = await compressImage(
      files[0].storedPath,
      options.compressionQuality,
      jobId,
    );
    return {
      artifacts: [output],
      primaryArtifact: output,
      message: "Compressed image successfully.",
    };
  }

  if (type === "image-format") {
    const output = await convertImageFormat(
      files[0].storedPath,
      options.targetFormat,
      jobId,
    );
    return {
      artifacts: [output],
      primaryArtifact: output,
      message: "Converted image format successfully.",
    };
  }

  if (type === "excel-csv") {
    const output = await excelToCsvOrReverse(files[0].storedPath, jobId);
    return {
      artifacts: [output],
      primaryArtifact: output,
      message: "Converted spreadsheet successfully.",
    };
  }

  if (type === "txt-pdf") {
    const ext = path.extname(files[0].storedPath).toLowerCase();
    if (ext === ".pdf") {
      const outputBytes = await convertPdfToTxt(files[0].storedPath);
      const output = await writeJobOutputFile(
        jobId,
        "document.txt",
        outputBytes,
      );
      return {
        artifacts: [output],
        primaryArtifact: output,
        message: "Converted PDF to TXT.",
      };
    }

    const outputBytes = await convertTxtToPdf(
      files[0].storedPath,
      "TXT to PDF",
    );
    const output = await writeJobOutputFile(jobId, "document.pdf", outputBytes);
    return {
      artifacts: [output],
      primaryArtifact: output,
      message: "Converted TXT to PDF.",
    };
  }

  if (type === "pdf-word") {
    const ext = path.extname(files[0].storedPath).toLowerCase();
    if (ext === ".pdf") {
      const outputBytes = await pdfToDocx(files[0].storedPath);
      const output = await writeJobOutputFile(
        jobId,
        "document.docx",
        outputBytes,
      );
      return {
        artifacts: [output],
        primaryArtifact: output,
        message: "Converted PDF to DOCX.",
      };
    }

    const outputBytes = await docxToPdf(files[0].storedPath);
    const output = await writeJobOutputFile(jobId, "document.pdf", outputBytes);
    return {
      artifacts: [output],
      primaryArtifact: output,
      message: "Converted DOCX to PDF.",
    };
  }

  if (type === "word-pdf") {
    const ext = path.extname(files[0].storedPath).toLowerCase();
    if (ext === ".pdf") {
      const outputBytes = await pdfToDocx(files[0].storedPath);
      const output = await writeJobOutputFile(
        jobId,
        "document.docx",
        outputBytes,
      );
      return {
        artifacts: [output],
        primaryArtifact: output,
        message: "Converted PDF to DOCX.",
      };
    }

    const outputBytes = await docxToPdf(files[0].storedPath);
    const output = await writeJobOutputFile(jobId, "document.pdf", outputBytes);
    return {
      artifacts: [output],
      primaryArtifact: output,
      message: "Converted DOCX to PDF.",
    };
  }

  if (type === "pdf-image") {
    const firstExt = path.extname(files[0].storedPath).toLowerCase();
    if (firstExt === ".pdf") {
      const output = await pdfToImages(
        files[0].storedPath,
        options.targetFormat,
        jobId,
      );
      return {
        artifacts: [output],
        primaryArtifact: output,
        message: "Converted PDF to image previews.",
      };
    }

    const output = await imagesToPdf(files, options.mergeOrder, jobId);
    return {
      artifacts: [output],
      primaryArtifact: output,
      message: "Converted images into PDF.",
    };
  }

  const fallback = await writeJobOutputFile(
    jobId,
    "result.txt",
    `Unsupported conversion type: ${type}`,
  );
  return {
    artifacts: [fallback],
    primaryArtifact: fallback,
    message: "Created fallback result.",
  };
}
