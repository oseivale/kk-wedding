"use client";

import { useState } from "react";

export function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    window.setTimeout(() => setState("idle"), 2500);
  }

  return (
    <button type="button" className="btn btn--ghost btn--small" onClick={copy}>
      <span aria-live="polite">
        {state === "copied" ? "Copied" : state === "failed" ? "Select and copy the address above" : label}
      </span>
    </button>
  );
}
