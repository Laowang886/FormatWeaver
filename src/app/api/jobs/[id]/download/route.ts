import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const p = await context.params;
  const id = p.id;

  const content = `FormatWeaver demo result for job ${id}\nThis is a placeholder file.`;
  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="formatweaver-result-${id}.txt"`,
    },
  });
}
