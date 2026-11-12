import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { CopyButton } from "@/components/CopyButton";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Wedding Gifts" };

export default function GiftsPage() {
  const email = site.gifts.etransferEmail;
  return (
    <>
      <PageHead title="Wedding Gifts" />
      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="prose prose--letter center">
            <p>
              Your love, prayers, and presence as we celebrate this beautiful new chapter mean so much to us.
            </p>
            <p>
              For those who wish to bless us with a gift, we would be grateful for monetary gifts as we begin our life
              together.
            </p>
            <p>Cash gifts may be presented in person at either of our wedding celebrations.</p>
            <p>For guests who are unable to give cash in person, monetary gifts may also be sent by e-transfer.</p>
          </div>

          <div className="gift-box">
            <p style={{ margin: 0, color: "var(--muted)" }}>E-transfer email</p>
            {email ? (
              <>
                <p className="gift-box__email">{email}</p>
                <CopyButton text={email} label="Copy email address" />
              </>
            ) : (
              <p className="gift-box__email tbc">Coming soon</p>
            )}
          </div>

          <p className="signoff center">
            With love and gratitude,
            <span>
              {site.couple.first} &amp; {site.couple.second}
            </span>
          </p>
        </div>
      </section>
    </>
  );
}
