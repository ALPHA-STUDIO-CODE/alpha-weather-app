function localDateString(dt, utcOffsetSeconds) {
  const localMs = (dt + utcOffsetSeconds) * 1000;
  return new Date(localMs).toISOString().slice(0, 10);
}

function localHourFraction(dt, utcOffsetSeconds) {
  const localMs = (dt + utcOffsetSeconds) * 1000;
  const date = new Date(localMs);
  return date.getUTCHours() + date.getUTCMinutes() / 60;
}

export function groupByDay(entries, utcOffsetSeconds) {
  const groups = {};
  for (const entry of entries) {
    const key = localDateString(entry.dt, utcOffsetSeconds);
    if (!groups[key]) groups[key] = [];
    groups[key].push(entry);
  }
  return groups;
}

export function dailySummary(dayEntries, utcOffsetSeconds) {
  const temps = dayEntries.map((e) => e.main.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const date = localDateString(dayEntries[0].dt, utcOffsetSeconds);

  const MIDDAY_TARGET = 13.5; // center of the 12:00-15:00 window
  let representative = dayEntries[0];
  let bestDistance = Infinity;
  for (const e of dayEntries) {
    const hour = localHourFraction(e.dt, utcOffsetSeconds);
    const distance = Math.abs(hour - MIDDAY_TARGET);
    if (distance < bestDistance) {
      bestDistance = distance;
      representative = e;
    }
  }

  return {
    date,
    min,
    max,
    icon: representative.weather[0].icon,
    condition: representative.weather[0].description,
  };
}
