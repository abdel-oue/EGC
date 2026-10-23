// Convert wall-clock input in Casablanca using Intl, including Ramadan UTC changes.
export function casablancaDateTime(value) {
  if (!value) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) {
    throw new Error("Invalid date");
  }

  const desired = Date.parse(value + ":00Z");
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Africa/Casablanca",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  });

  for (const offset of [0, 60]) {
    const candidate = new Date(desired - offset * 60000);

    if (formatter.format(candidate).replace(" ", "T") === value) {
      return candidate.toISOString();
    }
  }

  throw new Error("Invalid local time");
}

export function dateTimeInput(value) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Africa/Casablanca",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(new Date(value)).replace(" ", "T");
}
