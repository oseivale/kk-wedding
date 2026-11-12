import type { Metadata } from "next";
import Link from "next/link";
import { ArchPhoto, Note, PageHead } from "@/components/ui";
import { DetailCard } from "@/components/DetailCard";
import { Countdown } from "@/components/Countdown";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Botswana wedding" };

export default function BotswanaWeddingPage() {
  const w = site.botswana;
  return (
    <>
      <PageHead
        kicker="Wedding Celebrations"
        title="Botswana"
        meta={w.dateLabel}
      />

      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap story-preview">
          <ArchPhoto src={site.photos.botswana} alt={`${site.couple.first} and ${site.couple.second}`} label="Botswana photo" vine="left" />
          <div>
            <div className="prose prose--letter">
              <p>
                Our wedding celebrations begin in beautiful Botswana, where we will gather with our loved ones to
                honour family, culture, and the traditions that have shaped us.
              </p>
              <p>
                We look forward to sharing this meaningful occasion with you as we celebrate the joining of our
                families and the beginning of our journey together.
              </p>
            </div>
            <Countdown to={w.startsAt} label="the Botswana wedding" />
          </div>
        </div>
      </section>

      <section className="band band--linen">
        <div className="wrap details-split">
          <div className="details-grid">
            <DetailCard
              title="Ceremony details"
              rows={[
                ["Venue", w.ceremony.venue],
                ["Location", w.ceremony.location],
                ["Date", w.dateLabel],
                ["Time", w.ceremony.time],
              ]}
              mapUrl={w.ceremony.mapUrl}
            />
          </div>

          <div className="notes">
            <h2 style={{ fontSize: "var(--step-2)", marginBottom: "0.25rem" }}>Guest information</h2>
            <Note icon="children">
              Children are welcome. We kindly ask parents and guardians to keep a watchful eye on their little
              ones throughout the celebration.
            </Note>
            <Note icon="attire">Formal, elegant attire is encouraged.</Note>
            <Note icon="rsvp">No RSVP is required for our Botswana wedding.</Note>
            <Note icon="plane">
              Travelling internationally? Visit{" "}
              <Link href="/travel/botswana">First time in Botswana?</Link> for helpful travel information.
            </Note>
          </div>
        </div>
      </section>
    </>
  );
}
