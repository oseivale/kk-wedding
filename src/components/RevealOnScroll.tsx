"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Plays an entrance animation once, the first time this element scrolls into view.
 * It sets data-reveal="waiting" until then, and "shown" once visible. The CSS keys off that attribute.
 * Without JavaScript the attribute is never set, so the content simply shows as normal.
 */
export function RevealOnScroll({
  as: Tag = "div",
  className,
  children,
}: {
  as?: "div" | "figure" | "section";
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<"waiting" | "shown" | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setState("shown");
      return;
    }
    setState("waiting");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setState("shown");
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Tag ref={ref as any} className={className} data-reveal={state}>
      {children}
    </Tag>
  );
}
