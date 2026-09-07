export function cleanDisplayText(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/\s*\u00b7\s*(?:demo|demonstration)\b/gi, '')
    .replace(/\b(?:demo|demonstration)\b/gi, '')
    .replace(/\s{2,}/g, ' ').trim();
}
