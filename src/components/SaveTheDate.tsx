import { AddToCalendar } from "./AddToCalendar";
import { site } from "@/lib/site";

/** Save the date for the Ghana wedding. Public (home page), so city only, no venue. */
export function SaveTheDate() {
  const c = site.ghana.calendar;
  const d = new Date(c.date + "T12:00:00Z");
  const weekday = d.toLocaleDateString("en-CA", { weekday: "long", timeZone: "UTC" });
  const day = d.getUTCDate();
  const monthYear = d.toLocaleDateString("en-CA", { month: "long", year: "numeric", timeZone: "UTC" });
  const time = c.startTime
    ? new Date(`${c.date}T${c.startTime}:00Z`).toLocaleTimeString("en-CA", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      })
    : null;

  return (
    <section className="save-the-date" aria-labelledby="save-the-date-title">
      <div className="wrap save-the-date__inner">
        <p className="save-the-date__kicker">Save the date</p>
        <h2 id="save-the-date-title" className="save-the-date__names">
          {site.couple.first} <span>&amp;</span> {site.couple.second}
        </h2>
        <p className="save-the-date__lede">are getting married in Ghana</p>

        <div className="save-the-date__date">
          <span className="save-the-date__side">{weekday}</span>
          <span className="save-the-date__day">{day}</span>
          <span className="save-the-date__side">{monthYear}</span>
        </div>

        <p className="save-the-date__place">{c.location}</p>
        <p className="save-the-date__note">
          {time ? `Ceremony at ${time} (Ghana time)` : "Ceremony time and venue details to follow"}
        </p>

        <AddToCalendar />
      </div>
    </section>
  );
}
