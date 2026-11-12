import type { Metadata } from "next";
import Link from "next/link";
import { ArchPhoto, Note, PageHead } from "@/components/ui";
import { DetailCard } from "@/components/DetailCard";
import { Countdown } from "@/components/Countdown";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Ghana wedding" };

export default function GhanaWeddingPage() {
  const w = site.ghana;
  return (
    <>
      <PageHead
        kicker="Wedding Celebrations"
        title="Ghana"
        meta={w.dateLabel}
      />

      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap story-preview">
          <ArchPhoto src={site.photos.ghana} alt={`${site.couple.first} and ${site.couple.second}`} label="Ghana photo" vine="left" />
          <div>
            <div className="prose prose--letter">
              <p>
                With grateful hearts, we look forward to celebrating the next chapter of our wedding journey in
                beautiful Ghana.
              </p>
              <p>
                As we bring our families and loved ones together, we are excited to share a day filled with love,
                joy, and thanksgiving to God for His faithfulness throughout our journey.
              </p>
            </div>
            <Countdown to={w.startsAt} label="the Ghana wedding" />
            <p style={{ marginTop: "2rem" }}>
              <Link href="/rsvp" className="btn">
                RSVP for the Ghana wedding
              </Link>
            </p>
          </div>
        </div>
      </section>

      <section className="band band--linen">
        <div className="wrap">
          <div className="details-grid">
            <DetailCard
              title="Wedding ceremony"
              rows={[
                ["Venue", w.ceremony.venue],
                ["Location", w.ceremony.location],
                ["Date", w.dateLabel],
                ["Time", w.ceremony.time],
              ]}
              mapUrl={w.ceremony.mapUrl}
            />
            <DetailCard
              title="Wedding reception"
              rows={[
                ["Venue", w.reception.venue],
                ["Location", w.reception.location],
                ["Time", w.reception.time],
              ]}
              mapUrl={w.reception.mapUrl}
            />
          </div>

          <div className="notes">
            <h2 style={{ fontSize: "var(--step-2)", marginBottom: "0.25rem" }}>Guest information</h2>
            <Note icon="children">
              Children are welcome. We kindly ask parents and guardians to keep a watchful eye on their little
              ones throughout the celebration.
            </Note>
            <Note icon="attire">Formal, elegant attire is encouraged.</Note>
            <Note icon="rsvp">
              Please confirm your attendance through our <Link href="/rsvp">Ghana RSVP page</Link> using the
              invitation code provided to you.
            </Note>
            <Note icon="plane">
              Travelling internationally? Visit <Link href="/travel/ghana">First time in Ghana?</Link> for travel
              information and airport pickup coordination.
            </Note>
          </div>
        </div>
      </section>
    </>
  );
}
