import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PageHead } from "@/components/ui";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Frequently asked questions" };

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "Are children welcome?",
    a: (
      <>
        <p>
          Yes! Children are welcome at both our Botswana and Ghana wedding celebrations. We kindly ask parents and
          guardians to keep a watchful eye on their little ones throughout the celebrations.
        </p>
        <p>For our Ghana wedding, please include any children under 18 in your RSVP. Each child should only be registered once.</p>
      </>
    ),
  },
  {
    q: "Is there a dress code?",
    a: <p>Yes! We would love for our guests to dress in formal, elegant attire.</p>,
  },
  {
    q: "Do I need to RSVP for both weddings?",
    a: (
      <>
        <p>
          No. An RSVP is only required for our <Link href="/rsvp">Ghana wedding</Link> on {site.ghana.shortDate}.
        </p>
        <p>No RSVP is required for our Botswana celebration on {site.botswana.shortDate}.</p>
      </>
    ),
  },
  {
    q: "Where can I find travel information?",
    a: (
      <p>
        We&rsquo;ve prepared separate travel guides for guests visiting Botswana and Ghana. Please visit{" "}
        <Link href="/travel/botswana">First time in Botswana?</Link> or{" "}
        <Link href="/travel/ghana">First time in Ghana?</Link> for helpful travel information and entry requirements.
      </p>
    ),
  },
  {
    q: "Will airport pickup be available in Ghana?",
    a: (
      <p>
        Airport pickup assistance may be available for guests visiting Ghana for the first time. Please complete the{" "}
        <Link href="/travel/ghana#airport-pickup">airport pickup form</Link> by {site.travel.pickupDeadlineLabel}. All
        arrangements will be confirmed individually.
      </p>
    ),
  },
  {
    q: "What if my travel plans change?",
    a: (
      <p>
        If your flight details change after you send an airport pickup request, please let us know as soon as possible
        so we can update your arrival information. You can send the{" "}
        <Link href="/travel/ghana#airport-pickup">pickup form</Link> again with the same WhatsApp number at any time.
      </p>
    ),
  },
];

export default function FaqPage() {
  return (
    <>
      <PageHead title="Frequently asked questions" />
      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="faq">
            {faqs.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}</summary>
                <div className="faq__answer">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
