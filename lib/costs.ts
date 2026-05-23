/**
 * USD price per 1 million tokens, sourced from OpenAI pricing.
 * Keep this table tight — adding a model means adding a row, and any AI call
 * site that estimates cost must hit `estimateCost` so a typo throws.
 */
const PRICING_PER_1M_TOKENS = {
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4o": { input: 2.5, output: 10 },
} as const satisfies Record<string, { input: number; output: number }>;

export type CostModel = keyof typeof PRICING_PER_1M_TOKENS;

/**
 * Estimate the USD cost of an OpenAI completion.
 *
 * @param inputTokens  Prompt + system tokens charged at the input rate.
 * @param outputTokens Completion tokens charged at the output rate.
 * @param model        Model id that must exist in `PRICING_PER_1M_TOKENS`.
 * @returns USD cost rounded to 6 decimal places.
 * @throws If `model` is not a known pricing key.
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: string,
): number {
  const pricing = PRICING_PER_1M_TOKENS[model as CostModel];
  if (!pricing) {
    throw new Error(`Unknown model for cost estimation: ${model}`);
  }
  const cost =
    (inputTokens / 1_000_000) * pricing.input +
    (outputTokens / 1_000_000) * pricing.output;
  return Math.round(cost * 1_000_000) / 1_000_000;
}
