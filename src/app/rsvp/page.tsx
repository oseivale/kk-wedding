import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { RsvpForm } from "@/components/RsvpForm";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Ghana RSVP" };

export default function RsvpPage() {
  return (
    <>
      <PageHead
        kicker={`${site.couple.first} & ${site.couple.second} | Ghana wedding`}
        title="Ghana RSVP"
        meta={site.ghana.dateLabel}
      />
      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap rsvp-layout">
          <div className="rsvp-layout__info">
            <div className="prose prose--letter rsvp-intro">
              <p>We are so excited to celebrate this special day with you!</p>
              <p>
                As we prepare for our wedding, we kindly ask all invited guests to confirm their attendance using the
                RSVP form.
              </p>
              {site.rsvp.deadlineLabel && (
                <p className="deadline">
                  Please respond by <strong>{site.rsvp.deadlineLabel}</strong>
                </p>
              )}
            </div>

            <h2 className="rsvp-layout__heading">Before you RSVP</h2>
            <ul className="rules">
              <li>Please enter the invitation code shared with you to open the RSVP form.</li>
              <li>Each adult guest completes their own RSVP, including married couples.</li>
              <li>
                Children under 18 are welcome and may be included under one parent&rsquo;s RSVP, up to{" "}
                {site.rsvp.maxChildren} children per submission.
              </li>
              <li>Please register each child only once to avoid duplicate entries.</li>
              <li>
                If you&rsquo;re joining us, please include your email. We&rsquo;ll send the official wedding details
                to all confirmed guests closer to the day.
              </li>
            </ul>

            <p className="rsvp-layout__note">
              Our Botswana celebration on {site.botswana.shortDate} doesn&rsquo;t need an RSVP.
            </p>
          </div>

          <div className="rsvp-layout__form">
            <RsvpForm />
          </div>
        </div>
      </section>
    </>
  );
}