function getZonedParts(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .filter((part) => part.type !== "literal");

  return Object.fromEntries(
    parts.map(({ type, value }) => [type, Number(value)])
  );
}

function localPartsToUtc(parts, timeZone) {
  const desiredUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour || 0,
    parts.minute || 0,
    parts.second || 0
  );
  let timestamp = desiredUtc;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actual = getZonedParts(new Date(timestamp), timeZone);
    const actualAsUtc = Date.UTC(
      actual.year,
      actual.month - 1,
      actual.day,
      actual.hour,
      actual.minute,
      actual.second
    );
    const difference = desiredUtc - actualAsUtc;

    timestamp += difference;

    if (difference === 0) break;
  }

  return new Date(timestamp);
}

function addCalendarDays(date, days, timeZone) {
  const local = getZonedParts(date, timeZone);
  const targetDay = new Date(
    Date.UTC(local.year, local.month - 1, local.day + days)
  );

  return localPartsToUtc(
    {
      year: targetDay.getUTCFullYear(),
      month: targetDay.getUTCMonth() + 1,
      day: targetDay.getUTCDate(),
      hour: local.hour,
      minute: local.minute,
      second: local.second,
    },
    timeZone
  );
}

function getCalendarDayWindow(daysAhead, timeZone) {
  const today = getZonedParts(new Date(), timeZone);
  const targetDay = new Date(
    Date.UTC(today.year, today.month - 1, today.day + daysAhead)
  );
  const nextDay = new Date(targetDay);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);

  const start = localPartsToUtc(
    {
      year: targetDay.getUTCFullYear(),
      month: targetDay.getUTCMonth() + 1,
      day: targetDay.getUTCDate(),
      hour: 0,
    },
    timeZone
  );
  const end = localPartsToUtc(
    {
      year: nextDay.getUTCFullYear(),
      month: nextDay.getUTCMonth() + 1,
      day: nextDay.getUTCDate(),
      hour: 0,
    },
    timeZone
  );

  return { start, end };
}

module.exports = { addCalendarDays, getCalendarDayWindow };
