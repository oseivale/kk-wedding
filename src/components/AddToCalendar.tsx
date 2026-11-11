"use client";

import { useEffect, useRef, useState } from "react";
import { ghanaEvent, googleCalendarUrl, outlookCalendarUrl } from "@/lib/calendar";

/** "Add to calendar" button with a small menu of calendar apps. */
export function AddToCalendar({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  // The site address goes into the event description; it's only known in the browser.
  const [origin, setOrigin] = useState<string | undefined>(undefined);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => setOrigin(window.location.origin), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const event = ghanaEvent(origin);
  const options = [
    { label: "Google Calendar", href: googleCalendarUrl(event), external: true },
    { label: "Apple Calendar", href: "/calendar/ghana.ics", external: false },
    { label: "Outlook.com", href: outlookCalendarUrl(event, "outlook.live.com"), external: true },
    { label: "Outlook (work or school)", href: outlookCalendarUrl(event, "outlook.office.com"), external: true },
    { label: "Other calendar (.ics file)", href: "/calendar/ghana.ics", external: false },
  ];

  return (
    <div className={`add-to-calendar ${className}`} ref={wrap}>
      <button
        type="button"
        className="btn add-to-calendar__button"
        aria-expanded={open}
        aria-controls="add-to-calendar-menu"
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <rect x="3" y="4.5" width="14" height="12.5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M3 8.5h14M7 2.5v4M13 2.5v4" fill="none" stroke="currentColor" strokeWidth="1.3" />
        </svg>
        Add to calendar
      </button>
      <ul id="add-to-calendar-menu" className="add-to-calendar__menu" hidden={!open}>
        {options.map((o) => (
          <li key={o.label}>
            <a
              href={o.href}
              {...(o.external ? { target: "_blank", rel: "noopener noreferrer" } : { download: true })}
              onClick={() => setOpen(false)}
            >
              {o.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
