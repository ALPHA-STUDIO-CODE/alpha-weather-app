import { formatLocalTime } from "./time.js";

/**
 * Formats a sunrise/sunset UTC timestamp as a 12-hour local time
 * string, using the city's own UTC offset — never the viewer's
 * device clock (spec §4.2).
 *
 * Both functions delegate straight through to the already-tested
 * formatLocalTime (time.js) rather than reimplementing the
 * conversion. This is the point, not an implementation shortcut:
 * spec §4.2 explicitly requires sunrise/sunset to use "the exact same
 * conversion approach as the existing local-time display," so that
 * sunrise/sunset and "current local time" can never drift out of
 * sync for the same city. A separate implementation, even a
 * byte-identical one, would risk exactly that drift the first time
 * either one gets modified independently.
 */
export function formatSunrise(sunriseUnixTimestamp, utcOffsetSeconds) {
  return formatLocalTime(sunriseUnixTimestamp, utcOffsetSeconds);
}

export function formatSunset(sunsetUnixTimestamp, utcOffsetSeconds) {
  return formatLocalTime(sunsetUnixTimestamp, utcOffsetSeconds);
}
