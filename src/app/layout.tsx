import type { Metadata, Viewport } from "next";
import { Alex_Brush, Fahkwang, Prata } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DemoBanner } from "@/components/DemoBanner";
import { isDemoMode } from "@/lib/backend";
import { site } from "@/lib/site";

// Fonts are downloaded at build time and served from the site itself.
const prata = Prata({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-prata",
  display: "swap",
});

const fahkwang = Fahkwang({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-fahkwang",
  display: "swap",
});

const alexBrush = Alex_Brush({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-alex-brush",
  display: "swap",
});

const names = `${site.couple.first} & ${site.couple.second}`;

export const metadata: Metadata = {
  title: { default: names, template: `%s | ${names}` },
  description: `${site.tagline} Botswana, ${site.botswana.shortDate} · Ghana, ${site.ghana.shortDate}.`,
  // Keep the wedding site out of search engines; guests arrive by link.
  robots: { index: false, follow: false },
  openGraph: {
    title: names,
    description: site.tagline,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf8f1",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${prata.variable} ${fahkwang.variable} ${alexBrush.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {isDemoMode() && <DemoBanner />}
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
