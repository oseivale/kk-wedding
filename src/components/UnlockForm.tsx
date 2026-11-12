"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "./PageLoader";

/** Fired whenever a correct code is entered anywhere, so the gate pop-up stops asking. */
export const UNLOCKED_EVENT = "kk:unlocked";

/** Code entry for the gated pages. The server checks the code and sets a cookie. */
export function UnlockForm({
  next,
  initialError = false,
  onSuccess,
  submitLabel = "View the wedding details",
}: {
  next: string;
  initialError?: boolean;
  /** Called after a correct code instead of navigating (used by the pop-up). */
  onSuccess?: (next: string) => void;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState(initialError ? "That code doesn't match. Check your invitation and try again." : "");
  const [checking, setChecking] = useState(false);
  const [leaving, setLeaving] = useState(false); // correct code: show the loader until the next page opens
  const input = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      setError("Enter the invitation code from your invitation.");
      input.current?.focus();
      return;
    }
    setChecking(true);
    setError("");
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (json.ok) {
        window.dispatchEvent(new Event(UNLOCKED_EVENT)); // lets the pop-up know
        if (onSuccess) {
          onSuccess(next);
        } else {
          setLeaving(true);
          router.replace(next);
          router.refresh();
        }
        return;
      }
      setError(json.error || "Something went wrong. Please try again.");
      input.current?.focus();
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <form className="unlock-form" onSubmit={submit} noValidate>
      {leaving && <PageLoader label="Opening the wedding details" />}
      <div className="field">
        <label htmlFor="unlock-code">Invitation code</label>
        <input
          id="unlock-code"
          ref={input}
          className="input input--code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (error) setError("");
          }}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={40}
          autoFocus
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "unlock-error" : undefined}
        />
        {error && (
          <p className="error-text" id="unlock-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <button className="btn" type="submit" disabled={checking}>
        {checking ? "Checking…" : submitLabel}
      </button>
    </form>
  );
}