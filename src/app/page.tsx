import Link from "next/link";
import { ArchPhoto, Ornament } from "@/components/ui";
import { Countdown } from "@/components/Countdown";
import { SaveTheDate } from "@/components/SaveTheDate";
import { Botanical } from "@/components/Botanical";
import { site } from "@/lib/site";

function VenueArch({
  country,
  date,
  startsAt,
  place,
  href,
}: {
  country: string;
  date: string;
  startsAt: string;
  place: string;
  href: string;
}) {
  return (
    <article className="venue-arch">
      <h3>{country}</h3>
      <p className="venue-arch__date">{date}</p>
      <Countdown to={startsAt} label={`the ${country} wedding`} />
      <p className="venue-arch__place">{place}</p>
      <Link href={href} className="btn btn--ghost btn--small">
        {country} wedding details
      </Link>
    </article>
  );
}

export default function HomePage() {
  const { couple, botswana, ghana } = site;

  return (
    <>
      <section className="hero">
        <div className="wrap hero__grid">
          <div className="hero__figure">
            {site.decorations.botanicals && <Botanical variant="hero" className="hero__vine" />}
            <ArchPhoto
              src={site.photos.hero}
              alt={`${couple.first} and ${couple.second}`}
              className="hero__photo"
              priority
              label="Couple photo"
            />
          </div>
          <div>
            <h1 className="hero__names">
              <span>{couple.first}</span>
              <span className="hero__amp">&amp;</span>
              <span className="hero__second">{couple.second}</span>
            </h1>
            <p className="hero__tagline">{site.tagline}</p>
            <dl className="hero__dates">
              <dt>Botswana</dt>
              <dd>{botswana.shortDate}</dd>
              <dt>Ghana</dt>
              <dd>{ghana.shortDate}</dd>
            </dl>
            <div className="hero__actions">
              <Link href="/rsvp" className="btn">
                RSVP for Ghana
              </Link>
              <Link href="/our-story" className="btn btn--ghost">
                Read our story
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="band band--linen band--botanical" aria-labelledby="welcome-title">
        {site.decorations.botanicals && (
          <>
            <Botanical variant="corner" className="corner-sprig corner-sprig--top-left" />
            <Botanical variant="corner" className="corner-sprig corner-sprig--bottom-right" />
          </>
        )}
        <div className="wrap narrow center">
          <h2 id="welcome-title">A Warm Welcome</h2>
          <Ornament />
          <div className="prose prose--letter">
            <p>
              With grateful hearts and so much joy, we invite you to celebrate the beginning of our forever.
            </p>
            <p>
              Our journey has been one of love, faith, and God&rsquo;s beautiful faithfulness. As we bring
              together our families and cultures, we are honoured to share these special moments with the
              people who have loved, supported, and prayed for us along the way.
            </p>
            <p>
              From Botswana to Ghana, we look forward to celebrating not only our union, but the love and
              blessings that have brought us to this moment.
            </p>
          </div>
          <p className="signoff">
            With love,
            <span>
              {couple.first} &amp; {couple.second}
            </span>
          </p>
        </div>
      </section>

      <section className="band" aria-labelledby="journey-title">
        <div className="wrap center">
          <h2 id="journey-title">Two celebrations, one week apart</h2>
          <p className="lede" style={{ color: "var(--muted)", maxWidth: "32rem", marginInline: "auto" }}>
            We begin in Francistown and finish in Accra.
          </p>

          <div className="journey">
            <VenueArch
              country="Botswana"
              date={botswana.dateLabel}
              startsAt={botswana.startsAt}
              place="Francistown, Botswana"
              href="/celebrations/botswana"
            />
            <div className="journey__gap">
              <svg className="journey__line" viewBox="0 0 160 60" aria-hidden="true">
                <path
                  className="journey__path"
                  d="M4 50 C 50 -8, 110 -8, 156 50"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                />
                <circle cx="4" cy="50" r="3" fill="currentColor" />
                <circle cx="156" cy="50" r="3" fill="currentColor" />
              </svg>
              <span>seven days later</span>
            </div>
            <VenueArch
              country="Ghana"
              date={ghana.dateLabel}
              startsAt={ghana.startsAt}
              place="Accra, Ghana"
              href="/celebrations/ghana"
            />
          </div>
        </div>
      </section>

      <SaveTheDate />

      <section className="band band--linen" aria-labelledby="story-title">
        <div className="wrap story-preview story-preview--flip">
          <ArchPhoto src={site.photos.story} alt={`${couple.first} and ${couple.second} together`} label="Story photo" />
          <div>
            <p className="page-head__kicker">Our story</p>
            <h2 id="story-title">An unexpected beginning</h2>
            <p className="lede">
              Our story began with an unexpected encounter and a conversation that neither of us knew would lead
              to something so beautiful.
            </p>
            <p>
              What started as a simple connection quickly turned into daily conversations, shared laughter, and a
              growing excitement to know more about each other.
            </p>
            <Link href="/our-story" className="btn btn--ghost">
              Read the rest of our story
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
