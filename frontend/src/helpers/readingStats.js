export function stripHtml(html) {
  if (typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, '');
}

export function countPlainTextChars(htmlContent) {
  const plainText = stripHtml(htmlContent);
  return plainText.length;
}

export function calculateReadingTimeMinutes(charCount) {
  const safeCount = Math.max(0, Number.isFinite(charCount) ? charCount : 0);
  if (safeCount === 0) return 0;
  return Math.ceil(safeCount / 200);
}

export function getReadingStats(articleBodyHtml) {
  const charCount = countPlainTextChars(articleBodyHtml);
  const readingTimeMinutes = calculateReadingTimeMinutes(charCount);
  return {
    charCount,
    readingTimeMinutes,
  };
}
