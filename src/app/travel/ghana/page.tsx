import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { ExternalLink, Guide } from "@/components/Guide";
import { PickupForm } from "@/components/PickupForm";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "First time in Ghana?" };

export default function GhanaTravelPage() {
  return (
    <>
      <PageHead
        kicker="Travel information"
        title="First time in Ghana?"
        meta={`Accra on ${site.ghana.shortDate}`}
      />
      <section className="band" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Guide
            items={[
              {
                title: "Passport requirements",
                body: (
                  <p>
                    Guests should ensure their passports have at least six months of remaining validity beyond their
                    planned departure from Ghana.
                  </p>
                ),
              },
              {
                title: "Visa and travel authorization",
                body: (
                  <>
                    <p>
                      Visa and entry requirements depend on nationality and passport type. Please check whether you
                      require a visa or other travel authorization before departure.
                    </p>
                    <p>
                      <ExternalLink href={site.travel.ghanaEvisaUrl}>Check your Ghana visa and entry requirements</ExternalLink>
                    </p>
                  </>
                ),
              },
              {
                title: "Yellow fever vaccination",
                body: (
                  <>
                    <p>Proof of yellow fever vaccination is required for travellers entering Ghana aged nine months and older.</p>
                    <p>
                      Please ensure you receive your vaccination at least 10 days before departure and have your valid
                      International Certificate of Vaccination (Yellow Card) available when travelling.
                    </p>
                    <div className="callout">
                      <p>
                        <strong>A helpful tip for guests travelling from Canada:</strong> if you have health benefits
                        through your employer, check with your insurance provider before booking your vaccination
                        appointment. Some extended health insurance plans may cover part or all of the cost of the
                        yellow fever vaccine, depending on your coverage.
                      </p>
                    </div>
                  </>
                ),
              },
              {
                title: "Health and travel preparation",
                body: (
                  <>
                    <p>
                      Guests should consult a healthcare professional about malaria prevention and recommended
                      vaccinations. Travel medical insurance is also advisable.
                    </p>
                    <p className="deadline">
                      Travel health deadline <strong>{site.travel.ghanaHealthDeadline}</strong>
                    </p>
                    <p style={{ marginTop: "0.75rem" }}>
                      We recommend arranging a travel health consultation by this date to allow sufficient time for
                      recommended vaccinations and preventive measures.
                    </p>
                  </>
                ),
              },
              {
                title: "Arrival documents",
                body: (
                  <>
                    <p>
                      Keep your return or onward flight itinerary, accommodation details, and applicable travel
                      authorizations easy to reach when you land.
                    </p>
                    <p>
                      Before you arrive, complete Ghana&rsquo;s traveller health declaration. You&rsquo;ll receive a QR
                      code to show at the Port Health counter.
                    </p>
                    <p>
                      <ExternalLink href={site.travel.ghanaHealthDeclarationUrl}>
                        Complete the Ghana health declaration
                      </ExternalLink>
                    </p>
                  </>
                ),
              },
            ]}
          />
        </div>
      </section>

      <section className="band band--linen" id="airport-pickup" aria-labelledby="pickup-title">
        <div className="wrap">
          <div className="prose center" style={{ marginBottom: "2.5rem" }}>
            <h2 id="pickup-title">Ghana airport pickup</h2>
            <p className="lede">
              For guests visiting Ghana for the first time, we would love to help make your arrival as smooth and
              welcoming as possible.
            </p>
            <p>
              If you need airport pickup, please fill in the form below once your flights are confirmed. Sending the
              form doesn&rsquo;t automatically guarantee a pickup; we&rsquo;ll confirm transport with each guest
              individually.
            </p>
            <p className="deadline">
              Pickup request deadline <strong>{site.travel.pickupDeadlineLabel}</strong>
            </p>
          </div>
          <PickupForm />
        </div>
      </section>
    </>
  );
}
