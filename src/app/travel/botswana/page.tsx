import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/ui";
import { ExternalLink, Guide } from "@/components/Guide";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "First time in Botswana?" };

export default function BotswanaTravelPage() {
  return (
    <>
      <PageHead
        kicker="Travel information"
        title="First time in Botswana?"
        meta={`For our wedding in Francistown on ${site.botswana.shortDate}`}
      />
      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Guide
            items={[
              {
                title: "Passport requirements",
                body: <p>Please ensure your passport is valid and not expired before travelling to Botswana.</p>,
              },
              {
                title: "Visa and entry requirements",
                body: (
                  <>
                    <p>
                      Visa requirements vary depending on your nationality. Please check whether you need a visa to
                      enter Botswana and make any necessary arrangements before travelling.
                    </p>
                    <p>
                      <ExternalLink href={site.travel.botswanaEvisaUrl}>Official Botswana eVisa portal</ExternalLink>
                    </p>
                  </>
                ),
              },
              {
                title: "Vaccination requirements",
                body: (
                  <p>
                    Yellow fever vaccination is only required for guests arriving from or transiting through certain
                    countries. Please check the requirements for your travel route before departure.
                  </p>
                ),
              },
            ]}
          />
          <p className="center" style={{ marginTop: "2.5rem" }}>
            <Link href="/celebrations/botswana" className="btn btn--ghost">
              Botswana wedding details
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
