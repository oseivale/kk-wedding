import Link from "next/link";
import { nav, rsvpLink, site } from "@/lib/site";
import { Monogram } from "./SiteHeader";
import { Botanical } from "./Botanical";

export function SiteFooter() {
  const links = [
    ...nav.flatMap((item) => ("children" in item ? item.children : [item])),
    rsvpLink,
  ];
  return (
    <footer className="site-footer">
      {site.decorations.botanicals && (
        <>
          <Botanical variant="corner" className="corner-sprig corner-sprig--top-left" />
          <Botanical variant="corner" className="corner-sprig corner-sprig--top-right" />
        </>
      )}
      <div className="wrap">
        <Link href="/" className="monogram" aria-label="Home">
          <Monogram />
        </Link>
        <p className="site-footer__dates">
          Botswana, {site.botswana.shortDate}
          <br />
          Ghana, {site.ghana.shortDate}
        </p>
        <nav aria-label="Footer">
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <p className="site-footer__thanks">Thank you for being part of our journey.</p>
      </div>
    </footer>
  );
}
