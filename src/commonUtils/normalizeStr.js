export function normalizeStr(str) {
  if (typeof str === 'string') {
    return String(str).replace(/\s+/g, ' ').trim();
  } else {
    return str;
  }
}