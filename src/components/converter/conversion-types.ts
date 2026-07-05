export type ConversionType =
  | "pdf-word"
  | "pdf-image"
  | "word-pdf"
  | "excel-csv"
  | "images-pdf"
  | "pdf-split"
  | "pdf-merge"
  | "image-compress"
  | "image-format"
  | "txt-pdf";

export type MergeOrder = "upload-order" | "filename-asc" | "filename-desc";

export type TargetImageFormat = "png" | "jpg" | "webp";

export type ConversionOptionsState = {
  pageRange: string;
  compressionQuality: number;
  targetFormat: TargetImageFormat;
  mergeOrder: MergeOrder;
};

export const DEFAULT_CONVERSION_OPTIONS: ConversionOptionsState = {
  pageRange: "1-3",
  compressionQuality: 82,
  targetFormat: "png",
  mergeOrder: "upload-order",
};

export type ConversionOptionField =
  | {
      kind: "pageRange";
      key: "pageRange";
      label: string;
      placeholder: string;
      helperText: string;
    }
  | {
      kind: "quality";
      key: "compressionQuality";
      label: string;
      helperText: string;
      min: number;
      max: number;
      step: number;
    }
  | {
      kind: "select";
      key: "targetFormat" | "mergeOrder";
      label: string;
      helperText: string;
      options: Array<{ label: string; value: string }>;
    };

export type ConversionTypeConfig = {
  id: ConversionType;
  title: string;
  description: string;
  accept: string;
  uploadTitle: string;
  uploadSubtitle: string;
  buttonLabel: string;
  allowMultipleFiles: boolean;
  optionFields: ConversionOptionField[];
};

export const CONVERSION_TYPES: ConversionTypeConfig[] = [
  {
    id: "pdf-word",
    title: "PDF ⇄ Word",
    description: "Convert PDF files to editable Word documents and back.",
    accept: ".pdf,.docx",
    uploadTitle: "Drag and drop your PDF or DOCX file here",
    uploadSubtitle: "Supports PDF and DOCX files",
    buttonLabel: "Convert document",
    allowMultipleFiles: false,
    optionFields: [],
  },
  {
    id: "pdf-image",
    title: "PDF ⇄ Images (PNG, JPG)",
    description: "Turn PDFs into images or collect images into PDFs.",
    accept: ".pdf,.png,.jpg,.jpeg",
    uploadTitle: "Drag and drop your PDF or image file here",
    uploadSubtitle: "Supports PDF, PNG, and JPG files",
    buttonLabel: "Convert file",
    allowMultipleFiles: true,
    optionFields: [
      {
        kind: "select",
        key: "targetFormat",
        label: "Target image format",
        helperText: "Choose the output image format when converting PDF pages.",
        options: [
          { label: "PNG", value: "png" },
          { label: "JPG", value: "jpg" },
          { label: "WebP", value: "webp" },
        ],
      },
      {
        kind: "select",
        key: "mergeOrder",
        label: "Page / file order",
        helperText: "Use the upload order or sort by file name.",
        options: [
          { label: "Upload order", value: "upload-order" },
          { label: "File name A → Z", value: "filename-asc" },
          { label: "File name Z → A", value: "filename-desc" },
        ],
      },
    ],
  },
  {
    id: "word-pdf",
    title: "Word ⇄ PDF",
    description: "Convert Word documents to PDF or export PDF back to Word.",
    accept: ".docx,.pdf",
    uploadTitle: "Drag and drop your DOCX or PDF file here",
    uploadSubtitle: "Supports DOCX and PDF files",
    buttonLabel: "Convert document",
    allowMultipleFiles: false,
    optionFields: [],
  },
  {
    id: "excel-csv",
    title: "Excel ⇄ CSV",
    description: "Convert spreadsheets between Excel and CSV formats.",
    accept: ".xlsx,.xls,.csv",
    uploadTitle: "Drag and drop your Excel or CSV file here",
    uploadSubtitle: "Supports XLSX, XLS, and CSV files",
    buttonLabel: "Convert spreadsheet",
    allowMultipleFiles: false,
    optionFields: [],
  },
  {
    id: "images-pdf",
    title: "Images to PDF",
    description: "Merge one or more images into a single PDF document.",
    accept: ".png,.jpg,.jpeg,.webp",
    uploadTitle: "Drag and drop your image files here",
    uploadSubtitle: "Supports PNG, JPG, JPEG, and WebP files",
    buttonLabel: "Merge images to PDF",
    allowMultipleFiles: true,
    optionFields: [
      {
        kind: "select",
        key: "mergeOrder",
        label: "Image order",
        helperText: "Choose how images are arranged in the output PDF.",
        options: [
          { label: "Upload order", value: "upload-order" },
          { label: "File name A → Z", value: "filename-asc" },
          { label: "File name Z → A", value: "filename-desc" },
        ],
      },
    ],
  },
  {
    id: "pdf-split",
    title: "Split PDF",
    description: "Split a PDF into separate pages or ranges.",
    accept: ".pdf",
    uploadTitle: "Drag and drop your PDF file here",
    uploadSubtitle: "Supports PDF files",
    buttonLabel: "Split PDF",
    allowMultipleFiles: false,
    optionFields: [
      {
        kind: "pageRange",
        key: "pageRange",
        label: "Page range",
        placeholder: "1-3,5,8-10",
        helperText:
          "Leave blank to split all pages. Supports ranges like 1-3,5,8-10.",
      },
    ],
  },
  {
    id: "pdf-merge",
    title: "Merge PDF",
    description: "Combine multiple PDF files into one document.",
    accept: ".pdf",
    uploadTitle: "Drag and drop your PDF files here",
    uploadSubtitle: "Supports PDF files",
    buttonLabel: "Merge PDFs",
    allowMultipleFiles: true,
    optionFields: [
      {
        kind: "select",
        key: "mergeOrder",
        label: "PDF order",
        helperText: "Choose the order used when merging PDFs.",
        options: [
          { label: "Upload order", value: "upload-order" },
          { label: "File name A → Z", value: "filename-asc" },
          { label: "File name Z → A", value: "filename-desc" },
        ],
      },
    ],
  },
  {
    id: "image-compress",
    title: "Compress Image",
    description: "Reduce image size while preserving quality.",
    accept: ".png,.jpg,.jpeg,.webp",
    uploadTitle: "Drag and drop your image here",
    uploadSubtitle: "Supports PNG, JPG, JPEG, and WebP files",
    buttonLabel: "Compress image",
    allowMultipleFiles: false,
    optionFields: [
      {
        kind: "quality",
        key: "compressionQuality",
        label: "Compression quality",
        helperText: "Lower values compress more aggressively.",
        min: 10,
        max: 100,
        step: 1,
      },
    ],
  },
  {
    id: "image-format",
    title: "Convert Image Format (PNG/JPG/WebP)",
    description: "Convert images between PNG, JPG, and WebP.",
    accept: ".png,.jpg,.jpeg,.webp",
    uploadTitle: "Drag and drop your image file here",
    uploadSubtitle: "Supports PNG, JPG, JPEG, and WebP files",
    buttonLabel: "Convert image format",
    allowMultipleFiles: false,
    optionFields: [
      {
        kind: "select",
        key: "targetFormat",
        label: "Target format",
        helperText: "Choose the output format for the converted image.",
        options: [
          { label: "PNG", value: "png" },
          { label: "JPG", value: "jpg" },
          { label: "WebP", value: "webp" },
        ],
      },
    ],
  },
  {
    id: "txt-pdf",
    title: "TXT ⇄ PDF",
    description: "Convert plain text files to PDF or export PDF to text.",
    accept: ".txt,.pdf",
    uploadTitle: "Drag and drop your TXT or PDF file here",
    uploadSubtitle: "Supports TXT and PDF files",
    buttonLabel: "Convert text / PDF",
    allowMultipleFiles: false,
    optionFields: [],
  },
];

export function getConversionTypeConfig(type: ConversionType) {
  return (
    CONVERSION_TYPES.find((item) => item.id === type) ?? CONVERSION_TYPES[0]
  );
}
