import Image from "next/image";
import type { ReactNode } from "react";
import { site } from "@/lib/site";
import { Botanical } from "./Botanical";

/** Arched photo frame. Shows a monogram placeholder until a photo path is set in site.ts. */
export function ArchPhoto({
  src,
  alt,
  className = "",
  priority = false,
  label = "Photo coming soon",
}: {
  src: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  label?: string;
}) {
  return (
    <div className={`arch ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill sizes="(max-width: 767px) 80vw, 420px" priority={priority} />
      ) : (
        <div className="arch__placeholder" aria-hidden="true">
          <strong>
            {site.couple.first.charAt(0)}&amp;{site.couple.second.charAt(0)}
          </strong>
          <small>{label}</small>
        </div>
      )}
    </div>
  );
}

export function Ornament() {
  const diamond = (
    <svg className="ornament__diamond" viewBox="0 0 10 10">
      <path d="M5 0L10 5 5 10 0 5z" fill="currentColor" />
    </svg>
  );
  if (!site.decorations.botanicals) {
    return (
      <div className="ornament ornament--lines" aria-hidden="true">
        {diamond}
      </div>
    );
  }
  return (
    <div className="ornament" aria-hidden="true">
      <Botanical variant="divider" className="ornament__sprig ornament__sprig--left" />
      {diamond}
      <Botanical variant="divider" className="ornament__sprig" />
    </div>
  );
}

export function PageHead({ kicker, title, meta }: { kicker?: string; title: string; meta?: ReactNode }) {
  return (
    <header className="page-head wrap">
      {kicker && <p className="page-head__kicker">{kicker}</p>}
      <h1>{title}</h1>
      {meta && <p className="page-head__meta">{meta}</p>}
      <Ornament />
    </header>
  );
}

const icons = {
  children: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <circle cx="8" cy="7" r="3" />
      <circle cx="17" cy="9" r="2.3" />
      <path d="M2.5 20c0-3.3 2.5-6 5.5-6s5.5 2.7 5.5 6M13.5 20c.2-2.6 1.7-4.6 3.5-4.6s3.4 2 3.5 4.6" />
    </svg>
  ),
  attire: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M8 3l4 4 4-4M8 3L4 6l2 4 2-1v12h8V9l2 1 2-4-4-3" />
    </svg>
  ),
  rsvp: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 6l9 7 9-7" />
    </svg>
  ),
  plane: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <path d="M21 15.5l-8-5V4.5a1.5 1.5 0 00-3 0v6l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-4l8 2.5z" />
    </svg>
  ),
};

export function Note({ icon, children }: { icon: keyof typeof icons; children: ReactNode }) {
  return (
    <div className="note">
      {icons[icon]}
      <p>{children}</p>
    </div>
  );
}

export function TBC({ children = "To be confirmed" }: { children?: ReactNode }) {
  return <span className="tbc">{children}</span>;
}

/** Shows "To be confirmed" in muted italics, otherwise the value. */
export function Val({ v }: { v: string }) {
  return v.toLowerCase() === "to be confirmed" ? <TBC /> : <>{v}</>;
}
