"use client";

import { useEffect, useRef, useState } from "react";
import { LIMITS, isEmail, isFullName } from "@/lib/validation";
import { site } from "@/lib/site";

type Attending = "accepts" | "declines" | "";

async function post(url: string, body: unknown) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    return json.ok ? { ok: true as const } : { ok: false as const, error: json.error || "Something went wrong. Please try again." };
  } catch {
    return { ok: false as const, error: "We couldn't reach the server. Check your connection and try again." };
  }
}

export function RsvpForm() {
  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(false);
  const [codeError, setCodeError] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState<Attending>("");
  const [bringingChildren, setBringingChildren] = useState<"yes" | "no" | "">("");
  const [childCount, setChildCount] = useState(1);
  const [children, setChildren] = useState<string[]>(["", "", "", ""]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { email: string; attending: Attending }>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  // Already unlocked on this device (e.g. via the invitation link)? Skip the code step.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/unlock", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { unlocked?: boolean }) => {
        if (!cancelled && j.unlocked) setVerified(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setCodeError("");
    if (!code.trim()) {
      setCodeError("Enter the invitation code from your invitation.");
      return;
    }
    setChecking(true);
    const r = await post("/api/rsvp/verify", { code });
    setChecking(false);
    if (r.ok) {
      setVerified(true);
      window.setTimeout(() => nameRef.current?.focus(), 50);
    } else {
      setCodeError(r.error);
    }
  }

  function chooseAttending(value: Attending) {
    setAttending(value);
    // The email rule depends on the answer, so drop stale messages when it changes.
    setErrors(({ attending: _a, email: _e, ...rest }) => rest);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!isFullName(fullName.trim())) e.fullName = "Please enter your full name (first and last).";
    if (!attending) e.attending = "Please choose one.";
    if (attending === "accepts" && !email.trim())
      e.email = "Please add your email so we can send you the official wedding details.";
    else if (email.trim() && !isEmail(email.trim())) e.email = "Please check your email address.";
    if (attending === "accepts") {
      if (!bringingChildren) e.bringingChildren = "Please choose one.";
      if (bringingChildren === "yes") {
        const names = children.slice(0, childCount).map((c) => c.trim());
        names.forEach((n, i) => {
          if (!isFullName(n)) e[`child${i}`] = "Please enter the child's full name.";
        });
        const lower = names.map((n) => n.toLowerCase()).filter(Boolean);
        if (new Set(lower).size !== lower.length) e.childDup = "Each child only needs to be listed once.";
      }
    }
    return e;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) {
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"], .choice-row[data-invalid="true"] input');
      first?.focus();
      return;
    }
    setSubmitting(true);
    const r = await post("/api/rsvp", {
      code,
      fullName: fullName.trim(),
      email: email.trim(),
      attending,
      children:
        attending === "accepts" && bringingChildren === "yes"
          ? children.slice(0, childCount).map((c) => c.trim())
          : [],
      website: honeypot.current?.value ?? "",
    });
    setSubmitting(false);
    if (r.ok) {
      setDone({ email: email.trim(), attending });
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      setFormError(r.error);
      if (/code/i.test(r.error)) setVerified(false);
    }
  }

  function reset() {
    setFullName("");
    setEmail("");
    setAttending("");
    setBringingChildren("");
    setChildCount(1);
    setChildren(["", "", "", ""]);
    setErrors({});
    setDone(null);
  }

  if (done) {
    return (
      <div className="form-shell confirmation" ref={topRef} role="status">
        <h2>Thank you for responding!</h2>
        <p>
          We truly appreciate you taking the time to RSVP. We look forward to celebrating with those who can join
          us and are grateful for the love and support of everyone who is part of our journey.
        </p>
        {done.attending === "accepts" && done.email && (
          <p className="receipt-note">
            We&rsquo;ll send the official wedding details to <strong>{done.email}</strong> closer to the day.
          </p>
        )}
        <p className="signoff">
          With love,
          <span>
            {site.couple.first} &amp; {site.couple.second}
          </span>
        </p>
        <button type="button" className="btn btn--ghost" onClick={reset} style={{ marginTop: "1rem" }}>
          RSVP for another adult
        </button>
      </div>
    );
  }

  return (
    <div className="form-shell" ref={topRef}>
      <h2>RSVP form</h2>
      <form onSubmit={verified ? submit : verify} noValidate>
      <ol className="steps" style={{ marginTop: "2rem" }}>
        <li className="step" data-done={verified}>
          <h3>Invitation verification</h3>
          {verified ? (
            <div className="verified">
              <span>Code accepted.</span>
              <button type="button" className="link-button" onClick={() => setVerified(false)}>
                Use a different code
              </button>
            </div>
          ) : (
            <>
              <div className="field">
                <label htmlFor="invite-code">Invitation code</label>
                <input
                  id="invite-code"
                  className="input input--code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  maxLength={40}
                  aria-invalid={Boolean(codeError)}
                  aria-describedby={codeError ? "code-error" : undefined}
                />
                {codeError && (
                  <p className="error-text" id="code-error" role="alert">
                    {codeError}
                  </p>
                )}
              </div>
              <button className="btn" type="submit" disabled={checking}>
                {checking ? "Checking…" : "Continue"}
              </button>
            </>
          )}
        </li>

        {verified && (
          <>
            <li className="step">
              <h3>Guest information</h3>
              <div className="field">
                <label htmlFor="full-name">Full name</label>
                <p className="hint" id="full-name-hint">
                  Each adult completes their own RSVP, including married couples.
                </p>
                <input
                  id="full-name"
                  ref={nameRef}
                  className="input"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors(({ fullName: _, ...rest }) => rest);
                  }}
                  autoComplete="name"
                  maxLength={LIMITS.name}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={`full-name-hint${errors.fullName ? " full-name-error" : ""}`}
                />
                {errors.fullName && (
                  <p className="error-text" id="full-name-error">
                    {errors.fullName}
                  </p>
                )}
              </div>

              <fieldset className="field">
                <legend>Will you be attending our wedding on {site.ghana.shortDate}?</legend>
                <div className="choice-row" data-invalid={Boolean(errors.attending)}>
                  <label className="choice">
                    <input
                      type="radio"
                      name="attending"
                      value="accepts"
                      checked={attending === "accepts"}
                      onChange={() => chooseAttending("accepts")}
                    />
                    <span>Joyfully accepts</span>
                  </label>
                  <label className="choice">
                    <input
                      type="radio"
                      name="attending"
                      value="declines"
                      checked={attending === "declines"}
                      onChange={() => chooseAttending("declines")}
                    />
                    <span>Regretfully declines</span>
                  </label>
                </div>
                {errors.attending && <p className="error-text">{errors.attending}</p>}
              </fieldset>

              {attending && (
                <div className="field">
                  <label htmlFor="rsvp-email">
                    Email {attending === "declines" && <span className="optional">(optional)</span>}
                  </label>
                  <p className="hint" id="rsvp-email-hint">
                    {attending === "accepts"
                      ? "We\u2019ll send the official wedding details to this address closer to the day."
                      : "Only if you\u2019d like to hear from us about the wedding."}
                  </p>
                  <input
                    id="rsvp-email"
                    className="input"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    spellCheck={false}
                    maxLength={LIMITS.email}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors(({ email: _, ...rest }) => rest);
                    }}
                    aria-invalid={Boolean(errors.email)}
                    aria-required={attending === "accepts"}
                    aria-describedby={`rsvp-email-hint${errors.email ? " rsvp-email-error" : ""}`}
                  />
                  {errors.email && (
                    <p className="error-text" id="rsvp-email-error">
                      {errors.email}
                    </p>
                  )}
                </div>
              )}
            </li>

            {attending === "accepts" && (
              <li className="step">
                <h3>Children attending</h3>
                <fieldset className="field">
                  <legend>Will you be bringing any children under 18?</legend>
                  <p className="hint">
                    One parent registers the children, up to {LIMITS.maxChildren}. Please list each child only once.
                  </p>
                  <div className="choice-row" data-invalid={Boolean(errors.bringingChildren)}>
                    <label className="choice choice--small">
                      <input
                        type="radio"
                        name="children"
                        checked={bringingChildren === "yes"}
                        onChange={() => setBringingChildren("yes")}
                      />
                      <span>Yes</span>
                    </label>
                    <label className="choice choice--small">
                      <input
                        type="radio"
                        name="children"
                        checked={bringingChildren === "no"}
                        onChange={() => setBringingChildren("no")}
                      />
                      <span>No</span>
                    </label>
                  </div>
                  {errors.bringingChildren && <p className="error-text">{errors.bringingChildren}</p>}
                </fieldset>

                {bringingChildren === "yes" && (
                  <>
                    <div className="field">
                      <label htmlFor="child-count">Number of children</label>
                      <select
                        id="child-count"
                        className="select"
                        value={childCount}
                        onChange={(e) => setChildCount(Number(e.target.value))}
                        style={{ maxWidth: "8rem" }}
                      >
                        {Array.from({ length: LIMITS.maxChildren }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>
                    {Array.from({ length: childCount }, (_, i) => (
                      <div className="field" key={i}>
                        <label htmlFor={`child-${i}`}>Child {i + 1}: full name</label>
                        <input
                          id={`child-${i}`}
                          className="input"
                          value={children[i]}
                          maxLength={LIMITS.name}
                          onChange={(e) =>
                            setChildren((cs) => cs.map((c, j) => (j === i ? e.target.value : c)))
                          }
                          aria-invalid={Boolean(errors[`child${i}`])}
                        />
                        {errors[`child${i}`] && <p className="error-text">{errors[`child${i}`]}</p>}
                      </div>
                    ))}
                    {errors.childDup && <p className="error-text">{errors.childDup}</p>}
                  </>
                )}
              </li>
            )}

            <li className="step">
              <h3>Submit RSVP</h3>
              {/* Hidden from people; bots tend to fill it in. */}
              <div className="honeypot" aria-hidden="true">
                <label>
                  Website
                  <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              {formError && (
                <div className="form-error" role="alert">
                  {formError}
                </div>
              )}
              <button className="btn" type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Submit RSVP"}
              </button>
            </li>
          </>
        )}
      </ol>
      </form>
    </div>
  );
}
