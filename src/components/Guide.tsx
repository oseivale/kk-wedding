import type { ReactNode } from "react";

/** Numbered travel checklist. The numbers are real: guests work through these in order. */
export function Guide({ items }: { items: { title: string; body: ReactNode }[] }) {
  return (
    <ol className="guide" style={{ listStyle: "none", padding: 0 }}>
      {items.map((item, i) => (
        <li className="guide__item" key={item.title}>
          <span className="guide__num" aria-hidden="true">
            {i + 1}
          </span>
          <div>
            <h2>{item.title}</h2>
            {item.body}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
