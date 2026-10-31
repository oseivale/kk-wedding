"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

/** Code entry for the gated pages. The server checks the code and sets a cookie. */
export function UnlockForm({ next, initialError = false }: { next: string; initialError?: boolean }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState(initialError ? "That code doesn't match. Check your invitation and try again." : "");
  const [checking, setChecking] = useState(false);
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
        router.replace(next);
        router.refresh();
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
        {checking ? "Checking…" : "View the wedding details"}
      </button>
    </form>
  );
}
