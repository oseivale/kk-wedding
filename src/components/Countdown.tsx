"use client";

import { useEffect, useState } from "react";

type Parts = { days: number; hours: number; minutes: number; seconds: number };

function partsUntil(target: number): Parts | null {
  const ms = target - Date.now();
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/**
 * Live countdown to an ISO date. Renders dashes on the server and fills in
 * after hydration, so server and browser markup always match.
 */
export function Countdown({ to, label }: { to: string; label: string }) {
  const target = new Date(to).getTime();
  const [parts, setParts] = useState<Parts | null | undefined>(undefined);

  useEffect(() => {
    const tick = () => setParts(partsUntil(target));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (parts === null) {
    return <p className="countdown__done">The celebration has begun</p>;
  }

  const fmt = (n: number | undefined, pad = true) =>
    n === undefined ? "–" : pad ? String(n).padStart(2, "0") : String(n);

  return (
    <dl className="countdown" aria-label={`Time until ${label}`}>
      <div>
        <dt>days</dt>
        <dd>{fmt(parts?.days, false)}</dd>
      </div>
      <div>
        <dt>hours</dt>
        <dd>{fmt(parts?.hours)}</dd>
      </div>
      <div>
        <dt>minutes</dt>
        <dd>{fmt(parts?.minutes)}</dd>
      </div>
      <div aria-hidden="true">
        <dt>seconds</dt>
        <dd>{fmt(parts?.seconds)}</dd>
      </div>
    </dl>
  );
}
