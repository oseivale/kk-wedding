"use client";

import { useEffect, useRef, useState } from "react";
import {
  ALLOWED_FILE_TYPES,
  LIMITS,
  isFlightNumber,
  isFullName,
  isIsoDate,
  isTime,
  isWhatsApp,
} from "@/lib/validation";
import { site } from "@/lib/site";

export function PickupForm() {
  const [values, setValues] = useState({
    fullName: "",
    whatsapp: "",
    needsPickup: "" as "" | "yes" | "no",
    airline: "",
    flightNumber: "",
    arrivalDate: "",
    arrivalTime: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState<null | { updated: boolean }>(null);
  // Decided after mount so server and browser render the same markup.
  const [pastDeadline, setPastDeadline] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const honeypot = useRef<HTMLInputElement>(null);
  const shell = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPastDeadline(Date.now() > new Date(site.travel.pickupDeadline).getTime());
  }, []);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setErrors((er) => ({ ...er, file: "" }));
    if (f && f.size > LIMITS.fileBytes) {
      setErrors((er) => ({ ...er, file: "That file is over 4 MB. Please upload a smaller screenshot." }));
      e.target.value = "";
      setFile(null);
      return;
    }
    if (f && f.type && !ALLOWED_FILE_TYPES.includes(f.type)) {
      setErrors((er) => ({ ...er, file: "Please upload a JPG, PNG, HEIC or PDF." }));
      e.target.value = "";
      setFile(null);
      return;
    }
    setFile(f);
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!isFullName(values.fullName.trim())) e.fullName = "Please enter your full name (first and last).";
    if (!isWhatsApp(values.whatsapp.trim()))
      e.whatsapp = "Include your country code, e.g. +1 416 555 0123.";
    if (!values.needsPickup) e.needsPickup = "Please choose one.";
    if (values.needsPickup === "yes") {
      if (!values.airline.trim()) e.airline = "Please enter your airline.";
      if (!isFlightNumber(values.flightNumber.trim())) e.flightNumber = "Please check the flight number, e.g. KQ 512.";
      if (!isIsoDate(values.arrivalDate)) e.arrivalDate = "Please choose your arrival date.";
      if (!isTime(values.arrivalTime)) e.arrivalTime = "Please enter your arrival time.";
    }
    return e;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) {
      shell.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }
    const body = new FormData();
    Object.entries(values).forEach(([k, val]) => body.append(k, val.trim()));
    if (values.needsPickup === "yes" && file) body.append("itinerary", file);
    body.append("website", honeypot.current?.value ?? "");

    setSubmitting(true);
    try {
      const res = await fetch("/api/pickup", { method: "POST", body });
      const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; updated?: boolean };
      if (json.ok) {
        setDone({ updated: Boolean(json.updated) });
        shell.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        setFormError(json.error || "Something went wrong. Please try again.");
      }
    } catch {
      setFormError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function startOver() {
    setDone(null);
    setFile(null);
    setValues((v) => ({ ...v, airline: "", flightNumber: "", arrivalDate: "", arrivalTime: "" }));
  }

  if (done) {
    return (
      <div className="form-shell confirmation" ref={shell} role="status">
        <h2>{done.updated ? "Your flight details are updated" : "Thank you, we have your details"}</h2>
        <p>
          We&rsquo;ll be in touch on WhatsApp to confirm your airport pickup individually. Submitting this form
          doesn&rsquo;t automatically guarantee a pickup.
        </p>
        <p>If your flight changes, come back to this page and send the form again with the same WhatsApp number.</p>
        <button type="button" className="btn btn--ghost" onClick={startOver}>
          Update my flight details
        </button>
      </div>
    );
  }

  const err = (k: string) =>
    errors[k] ? (
      <p className="error-text" id={`${k}-error`}>
        {errors[k]}
      </p>
    ) : null;
  const a11y = (k: string) => ({
    "aria-invalid": Boolean(errors[k]),
    "aria-describedby": errors[k] ? `${k}-error` : undefined,
  });

  return (
    <div className="form-shell" ref={shell}>
      <h2>Airport pickup request</h2>
      {pastDeadline ? (
        <p className="callout">
          <span>
            The deadline for new requests has passed. If you already sent a request, use the same WhatsApp
            number below to update your flight details.
          </span>
        </p>
      ) : (
        <p className="center" style={{ color: "var(--muted)" }}>
          Already sent it and your flight changed? Send it again with the same WhatsApp number and we&rsquo;ll
          update your details.
        </p>
      )}

      <form onSubmit={submit} noValidate style={{ marginTop: "1.75rem" }}>
        <h3 style={{ fontFamily: "var(--font-body)", fontSize: "1.05rem", fontWeight: 500 }}>Guest information</h3>
        <div className="field">
          <label htmlFor="p-name">Full name</label>
          <input id="p-name" className="input" autoComplete="name" maxLength={LIMITS.name} value={values.fullName} onChange={set("fullName")} {...a11y("fullName")} />
          {err("fullName")}
        </div>
        <div className="field">
          <label htmlFor="p-whatsapp">WhatsApp number (including country code)</label>
          <input
            id="p-whatsapp"
            className="input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+1 416 555 0123"
            maxLength={LIMITS.whatsapp}
            value={values.whatsapp}
            onChange={set("whatsapp")}
            {...a11y("whatsapp")}
          />
          {err("whatsapp")}
        </div>
        <fieldset className="field">
          <legend>Will you require airport pickup assistance?</legend>
          <div className="choice-row">
            {(["yes", "no"] as const).map((opt) => (
              <label className="choice choice--small" key={opt}>
                <input
                  type="radio"
                  name="needsPickup"
                  value={opt}
                  checked={values.needsPickup === opt}
                  onChange={() => setValues((v) => ({ ...v, needsPickup: opt }))}
                  aria-invalid={Boolean(errors.needsPickup)}
                />
                <span>{opt === "yes" ? "Yes" : "No"}</span>
              </label>
            ))}
          </div>
          {err("needsPickup")}
        </fieldset>

        {values.needsPickup === "yes" && (
          <>
            <h3 style={{ fontFamily: "var(--font-body)", fontSize: "1.05rem", fontWeight: 500, marginTop: "2rem" }}>
              Your flight
            </h3>
            <div className="field">
              <label htmlFor="p-airline">Airline</label>
              <input id="p-airline" className="input" maxLength={LIMITS.airline} value={values.airline} onChange={set("airline")} {...a11y("airline")} />
              {err("airline")}
            </div>
            <div className="field">
              <label htmlFor="p-flight">Flight number</label>
              <input
                id="p-flight"
                className="input"
                autoCapitalize="characters"
                placeholder="e.g. KQ 512"
                maxLength={LIMITS.flight}
                value={values.flightNumber}
                onChange={set("flightNumber")}
                {...a11y("flightNumber")}
              />
              {err("flightNumber")}
            </div>
            <div className="field-pair">
              <div className="field">
                <label htmlFor="p-date">Scheduled arrival date</label>
                <input id="p-date" className="input" type="date" min="2027-01-01" max="2027-03-31" value={values.arrivalDate} onChange={set("arrivalDate")} {...a11y("arrivalDate")} />
                {err("arrivalDate")}
              </div>
              <div className="field">
                <label htmlFor="p-time">Arrival time (Ghana local time)</label>
                <input id="p-time" className="input" type="time" value={values.arrivalTime} onChange={set("arrivalTime")} {...a11y("arrivalTime")} />
                {err("arrivalTime")}
              </div>
            </div>
            <div className="field">
              <label htmlFor="p-file">Screenshot of your flight itinerary (optional)</label>
              <p className="hint" id="p-file-hint">
                JPG, PNG, HEIC or PDF, up to 4 MB. Please crop out or cover your booking reference and any payment
                details before uploading.
              </p>
              <div className="file-drop">
                <input
                  id="p-file"
                  ref={fileInput}
                  type="file"
                  accept={ALLOWED_FILE_TYPES.join(",")}
                  onChange={onFile}
                  aria-describedby="p-file-hint"
                />
              </div>
              {err("file")}
            </div>
            <p className="callout">
              <span>
                <strong>Please double-check your flight details.</strong> If your travel plans change after you send
                this, send the form again with the same WhatsApp number so we can update your arrival information.
              </span>
            </p>
          </>
        )}

        <div className="honeypot" aria-hidden="true">
          <label>
            Website
            <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {formError && (
          <div className="form-error" role="alert" style={{ marginTop: "1.5rem" }}>
            {formError}
          </div>
        )}
        <button className="btn" type="submit" disabled={submitting} style={{ marginTop: "1.5rem" }}>
          {submitting ? "Sending…" : pastDeadline ? "Update my flight details" : "Send pickup request"}
        </button>
      </form>
    </div>
  );
}
