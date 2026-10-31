"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nav, rsvpLink, site } from "@/lib/site";

function Chevron() {
  return (
    <svg viewBox="0 0 10 6" aria-hidden="true">
      <path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function Monogram() {
  return (
    <>
      {site.couple.first.charAt(0)}
      <em>&amp;</em>
      {site.couple.second.charAt(0)}
    </>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Close menus whenever the page changes.
  useEffect(() => {
    setMenuOpen(false);
    setOpenSub(null);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Desktop dropdowns: close on outside click or Escape.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenSub(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenSub(null);
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Stop the page scrolling behind the open mobile menu.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const isCurrent = (href: string) => pathname === href;

  return (
    <header className="site-header" data-scrolled={scrolled}>
      <div className="wrap site-header__inner">
        <Link href="/" className="monogram" aria-label={`${site.couple.first} and ${site.couple.second}, home`}>
          <Monogram />
        </Link>

        <button
          type="button"
          className="menu-button"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
          <span className="visually-hidden">Menu</span>
        </button>

        <nav id="site-nav" className="nav" aria-label="Main" data-open={menuOpen} ref={navRef}>
          <ul>
            {nav.map((item) =>
              "children" in item ? (
                <li className="nav__item" key={item.label}>
                  <button
                    type="button"
                    className="nav__toggle"
                    aria-expanded={openSub === item.label || menuOpen}
                    data-active={item.children.some((c) => isCurrent(c.href))}
                    onClick={() => setOpenSub((s) => (s === item.label ? null : item.label))}
                  >
                    {item.label}
                    <Chevron />
                  </button>
                  {/* On mobile both groups are always expanded; on desktop they open on click. */}
                  <ul className="nav__sub" hidden={!(openSub === item.label || menuOpen)}>
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} aria-current={isCurrent(c.href) ? "page" : undefined}>
                          {c.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li className="nav__item" key={item.href}>
                  <Link
                    href={item.href}
                    className="nav__link"
                    aria-current={isCurrent(item.href) ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
          <Link href={rsvpLink.href} className="btn btn--small" aria-current={isCurrent(rsvpLink.href) ? "page" : undefined}>
            {rsvpLink.label}
          </Link>
        </nav>
      </div>
    </header>
  );
}
