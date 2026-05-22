/**
 * Renders a score as an ASCII block progress bar.
 * Example: asciiBar(74, 20) → '██████████████░░░░░░'
 */
export function asciiBar(score: number, width = 20): string {
  const clamped = Math.max(0, Math.min(100, score));
  const filled = Math.round((clamped / 100) * width);
  return "█".repeat(filled) + "░".repeat(width - filled);
}

/**
 * Returns the CSS class for a score value.
 * Use with the .score-high / .score-mid / .score-low utility classes.
 */
export function scoreClass(score: number): string {
  if (score >= 75) return "score-high";
  if (score >= 50) return "score-mid";
  return "score-low";
}

/**
 * Formats a job ID from a UUID for display.
 * Example: 'job_7f3a2b' from '7f3a2b91-...'
 */
export function formatJobId(uuid: string): string {
  return `job_${uuid.slice(0, 6)}`;
}
