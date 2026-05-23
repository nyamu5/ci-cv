import { PDFParse } from "pdf-parse";

/**
 * Result of parsing a CV PDF into plain text.
 *
 * Why a quality warning instead of failing the upload:
 * PDFs are a notoriously unreliable text source — multi-column layouts bleed
 * column 1 into column 2 mid-sentence, ligatures and custom fonts come out as
 * private-use codepoints, and "designer" CVs are often half-image. We could fix
 * this with vision-based parsing (gpt-4o on the rendered page) but that costs
 * orders of magnitude more per analysis and we want to keep the per-CV spend at
 * fractions of a cent for the gatekeeper stage. So instead we cheap-extract
 * with pdf-parse and surface a `qualityWarning: true` in the UI so the user can
 * choose to paste their CV text directly.
 */
export type ExtractedPDF = {
  text: string;
  pageCount: number;
  qualityWarning: boolean;
};

/**
 * Heuristic check for low-quality PDF text extraction.
 *
 * Flags text as garbled when either:
 *   - alphanumeric character ratio < 0.6 (lots of replacement chars / glyphs)
 *   - average word length > 15 (column-bleed or missing word boundaries)
 *
 * Pure function, no side effects — exported separately so tests can hit it
 * without a real PDF buffer.
 */
export function isLikelyGarbled(text: string): boolean {
  if (text.length === 0) return false;

  const alphanumericCount = (text.match(/[a-zA-Z0-9]/g) ?? []).length;
  const ratio = alphanumericCount / text.length;

  const words = text.split(/\s+/).filter(Boolean);
  const avgWordLength =
    words.length === 0
      ? text.length
      : words.reduce((sum, w) => sum + w.length, 0) / words.length;

  return ratio < 0.6 || avgWordLength > 15;
}

export async function extractTextFromPDF(buffer: Buffer): Promise<ExtractedPDF> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const text = result.text.trim();
    return {
      text,
      pageCount: result.pages.length,
      qualityWarning: isLikelyGarbled(text),
    };
  } finally {
    await parser.destroy();
  }
}
