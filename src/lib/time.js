export function formatLocalTime(unixTimestamp, utcOffsetSeconds) {
  const localMs = (unixTimestamp + utcOffsetSeconds) * 1000;
  const date = new Date(localMs);

  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  if (hours === 0) hours = 12;

  const paddedMinutes = String(minutes).padStart(2, "0");
  return `${hours}:${paddedMinutes} ${period}`;
}
