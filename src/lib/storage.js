export function getItem(key, fallback) {
  try {
    if (typeof localStorage === "undefined" || !localStorage) {
      return fallback;
    }
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) {
      return fallback;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    if (typeof localStorage === "undefined" || !localStorage) {
      return;
    }
    const serialized =
      typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch {}
}
