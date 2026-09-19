const CDN_VERSION = "3.0.0-next.10";

const ICON_STYLE = "fill";

export function meteoconUrl(slug, { reducedMotion = false } = {}) {
  const format = reducedMotion ? "svg-static" : "svg";
  return `https://cdn.meteocons.com/${CDN_VERSION}/${format}/${ICON_STYLE}/${slug}.svg`;
}
