import { site } from "./site";

/**
 * Calendar links and the .ics file for the Ghana save the date.
 * Ghana is on UTC all year (no daylight saving), so Ghana times can be written as UTC directly.
 */

type CalendarEvent = {
  title: string;
  description: string;
  location: string;
  /** All-day: YYYYMMDD start (inclusive) and end (exclusive). Timed: UTC timestamps. */
  allDay: boolean;
  start: string;
  end: string;
};

const compact = (date: string) => date.replace(/-/g, "");
const addDays = (date: string, days: number) => {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
const addHours = (hhmm: string, hours: number) => {
  const [h, m] = hhmm.split(":").map(Number);
  return `${String(Math.min(h + hours, 23)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

export function ghanaEvent(siteUrl?: string): CalendarEvent {
  const c = site.ghana.calendar;
  const details =
    `Save the date for ${site.couple.first} & ${site.couple.second}'s wedding in ${c.location}.` +
    (c.startTime ? "" : " Ceremony time and venue to follow.") +
    (siteUrl ? `\n\nWedding details: ${siteUrl}/celebrations/ghana` : "");
  if (c.startTime) {
    const end = c.endTime || addHours(c.startTime, 3);
    return {
      title: c.title,
      description: details,
      location: c.location,
      allDay: false,
      start: `${compact(c.date)}T${c.startTime.replace(":", "")}00Z`,
      end: `${compact(c.date)}T${end.replace(":", "")}00Z`,
    };
  }
  return {
    title: c.title,
    description: details,
    location: c.location,
    allDay: true,
    start: compact(c.date),
    end: compact(addDays(c.date, 1)),
  };
}

/** YYYYMMDD or YYYYMMDDTHHMMSSZ -> ISO, for Outlook links. */
function iso(v: string) {
  const d = `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)}`;
  return v.length > 8 ? `${d}T${v.slice(9, 11)}:${v.slice(11, 13)}:00Z` : d;
}

export function googleCalendarUrl(e: CalendarEvent) {
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${e.start}/${e.end}`,
    details: e.description,
    location: e.location,
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

/** host: "outlook.live.com" for personal accounts, "outlook.office.com" for work or school. */
export function outlookCalendarUrl(e: CalendarEvent, host: "outlook.live.com" | "outlook.office.com") {
  const q = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: e.title,
    startdt: iso(e.start),
    enddt: iso(e.end),
    body: e.description,
    location: e.location,
  });
  if (e.allDay) q.set("allday", "true");
  return `https://${host}/calendar/0/deeplink/compose?${q}`;
}

/** iCalendar text escaping (RFC 5545). */
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Lines longer than 75 octets are folded, as the standard requires. */
function fold(line: string) {
  const out: string[] = [];
  let rest = line;
  while (rest.length > 74) {
    out.push(rest.slice(0, 74));
    rest = " " + rest.slice(74);
  }
  out.push(rest);
  return out.join("\r\n");
}

export function icsFile(e: CalendarEvent) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const when = e.allDay
    ? [`DTSTART;VALUE=DATE:${e.start}`, `DTEND;VALUE=DATE:${e.end}`]
    : [`DTSTART:${e.start}`, `DTEND:${e.end}`];
  return (
    [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Kwazi & Kwasi//Wedding website//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      // A fixed ID, so re-downloading updates the same entry instead of adding a second one.
      "UID:kwazi-kwasi-ghana-wedding-2027@wedding",
      `DTSTAMP:${stamp}`,
      ...when,
      `SUMMARY:${esc(e.title)}`,
      `DESCRIPTION:${esc(e.description)}`,
      `LOCATION:${esc(e.location)}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ]
      .map(fold)
      .join("\r\n") + "\r\n"
  );
}
