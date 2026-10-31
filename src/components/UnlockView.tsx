import Link from "next/link";
import { Ornament } from "./ui";
import { UnlockForm } from "./UnlockForm";
import { site } from "@/lib/site";

export function UnlockView({ next, error = false }: { next: string; error?: boolean }) {
  return (
    <section className="unlock">
      <div className="unlock__card">
        <p className="page-head__kicker">For our guests</p>
        <h1>Enter your invitation code</h1>
        <Ornament />
        <p className="unlock__intro">
          Our wedding details, travel guides and gift information are just for our guests. You&rsquo;ll find the code in
          your invitation email. You&rsquo;ll only need to enter it once on this device.
        </p>
        <UnlockForm next={next} initialError={error} />
        <p className="unlock__help">
          {site.gate.contact ? (
            <>Can&rsquo;t find your code? {site.gate.contact}</>
          ) : (
            <>
              Can&rsquo;t find your code? Ask {site.couple.first} or {site.couple.second} and they&rsquo;ll send it to
              you.
            </>
          )}
        </p>
        <p className="unlock__back">
          <Link href="/">Back to the home page</Link>
        </p>
      </div>
    </section>
  );
}
