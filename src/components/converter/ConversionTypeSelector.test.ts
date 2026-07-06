import assert from "node:assert/strict";
import test from "node:test";
import { CONVERSION_ROUTES } from "./ConversionTypeSelector";

type CategoryRoute = {
  label: string;
  options: Array<{
    label: string;
    conversionType: string;
  }>;
};

test("exposes exactly the four homepage conversion categories", () => {
  const routes = CONVERSION_ROUTES as unknown as CategoryRoute[];

  assert.deepEqual(
    routes.map(({ label }) => label),
    ["Doc Convert", "Image Convert", "PDF Merge", "PDF Image"],
  );
});

test("maps category labels to existing conversion type keys", () => {
  const routes = CONVERSION_ROUTES as unknown as CategoryRoute[];

  assert.deepEqual(
    routes.map(({ options }) => options),
    [
      [
        { label: "PDF to Word", conversionType: "pdf-word" },
        { label: "Word to PDF", conversionType: "word-pdf" },
      ],
      [
        { label: "Compress Image", conversionType: "image-compress" },
        { label: "Convert Image Format", conversionType: "image-format" },
      ],
      [
        { label: "Merge PDF", conversionType: "pdf-merge" },
        { label: "Split PDF", conversionType: "pdf-split" },
      ],
      [
        { label: "PDF to Images", conversionType: "pdf-image" },
        { label: "Images to PDF", conversionType: "images-pdf" },
      ],
    ],
  );
});
