/**
 * Everything the couple is likely to change lives in this file:
 * names, dates, venues, map links, deadlines, photos and the e-transfer email.
 * Pages read from here, so an update in one place shows up everywhere.
 */

const mapsLink = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

export const site = {
  couple: { first: "Kwazi", second: "Kwasi" },
  tagline: "Two hearts. Two cultures. One beautiful beginning.",

  /**
   * Photos. Drop image files into /public/images and put the path here,
   * e.g. "/images/hero.jpg". Leave as null to show the monogram placeholder.
   * Portrait photos (about 3:4) suit the arched frames best.
   */
  photos: {
    hero: "/images/couple-hero.jpg" as string | null,
    story: "/images/couple-story.jpg" as string | null,
    botswana: "/images/couple-botswana.jpg" as string | null,
    ghana: "/images/couple-ghana.jpg" as string | null,
  },

  botswana: {
    country: "Botswana",
    dateLabel: "Saturday, February 13, 2027",
    shortDate: "February 13, 2027",
    // Countdown target. Botswana is UTC+2. Counts to the start of the day until a time is confirmed.
    startsAt: "2027-02-13T00:00:00+02:00",
    ceremony: {
      venue: "Heavenly Gardens",
      location: "Matshelagabedi Road, Francistown, Botswana",
      time: "To be confirmed",
      mapUrl: mapsLink("Heavenly Gardens, Matshelagabedi Road, Francistown, Botswana"),
    },
  },

  ghana: {
    country: "Ghana",
    dateLabel: "Saturday, February 20, 2027",
    shortDate: "February 20, 2027",
    // Countdown target. Ghana is UTC+0. Counts to the start of the day until a time is confirmed.
    startsAt: "2027-02-20T00:00:00Z",
    ceremony: {
      venue: "ICGC Holy Ghost Temple",
      location: "Accra, Ghana",
      time: "To be confirmed",
      mapUrl: mapsLink("ICGC Holy Ghost Temple Accra, Ghana"),
    },
    reception: {
      venue: "To be confirmed",
      location: "Accra, Ghana",
      time: "5:00 PM – 10:00 PM",
      mapUrl: null as string | null, // add once the venue is confirmed
    },
    /**
     * Save the date + "Add to calendar". This is on the public home page, so it uses the city only
     * (no venue). Times are Ghana time, which is the same as UTC all year.
     */
    calendar: {
      title: "Kwazi & Kwasi's wedding in Ghana",
      date: "2027-02-20",
      /** e.g. "14:00" once the ceremony time is confirmed. Leave null for an all-day event. */
      startTime: null as string | null,
      /** e.g. "22:00". Used only when startTime is set; defaults to 3 hours after the start. */
      endTime: null as string | null,
      location: "Accra, Ghana",
    },
  },

  rsvp: {
    /** e.g. "January 15, 2027". Shown on the RSVP page once set. */
    deadlineLabel: null as string | null,
    maxChildren: 4,
  },

  travel: {
    ghanaHealthDeadline: "January 9, 2027",
    pickupDeadlineLabel: "January 15, 2027",
    // End of January 15 in Accra (UTC+0). New requests close after this; updates are still accepted.
    pickupDeadline: "2027-01-15T23:59:59Z",
    botswanaEvisaUrl: "https://evisa.gov.bw/",
    ghanaEvisaUrl: "https://evisa.immigration.gov.gh/",
  },

  /**
   * Invitation-code gate. These pages (and everything under them) need the code;
   * Home, Our story and the RSVP page stay public. One code unlocks both events.
   */
  gate: {
    protectedPaths: ["/celebrations", "/travel", "/faq", "/gifts"],
    /** Shown on the code screen for guests who can't find their code, e.g. "WhatsApp Kwazi on +1 416 555 0123". */
    contact: null as string | null,
    /** How long a browser stays unlocked after entering the code. */
    rememberDays: 180,
  },

  /**
   * Decorative extras. Set botanicals to true to bring back the olive leaf-and-vine
   * line art (around the home photo, in section dividers and in corners).
   */
  decorations: {
    botanicals: false as boolean,
  },

  gifts: {
    /** The e-transfer email. Leave null until the couple confirms it. */
    etransferEmail: null as string | null,
  },
} as const;

/** True if this path needs the invitation code. */
export const isProtectedPath = (path: string) =>
  site.gate.protectedPaths.some((p) => path === p || path.startsWith(p + "/"));

/** Only allow redirects back to our own pages (never to another site). */
export const safeNext = (next: unknown) => {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") ? n : "/celebrations/botswana";
};

export type Wedding = typeof site.botswana | typeof site.ghana;

export const nav = [
  { label: "Home", href: "/" },
  { label: "Our story", href: "/our-story" },
  {
    label: "Wedding celebrations",
    children: [
      { label: "Botswana Ceremony", href: "/celebrations/botswana" },
      { label: "Ghana Ceremony", href: "/celebrations/ghana" },
    ],
  },
  {
    label: "Travel information",
    children: [
      { label: "Botswana Travel", href: "/travel/botswana" },
      { label: "Ghana Travel", href: "/travel/ghana" },
    ],
  },
  { label: "FAQ", href: "/faq" },
  { label: "Wedding gifts", href: "/gifts" },
] as const;

export const rsvpLink = { label: "Ghana RSVP", href: "/rsvp" } as const;

/**
 * Footer links: their own order, and names that make sense without the menu headings.
 * On desktop they fill a 3 × 3 grid left to right; on phones, column 1 then column 2.
 */
export const footerNav: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "Our Story", href: "/our-story" },
  { label: "FAQ", href: "/faq" },
  { label: "Wedding Gifts", href: "/gifts" },
  { label: "Botswana Wedding", href: "/celebrations/botswana" },
  { label: "Botswana Travel", href: "/travel/botswana" },
  { label: "Ghana Wedding", href: "/celebrations/ghana" },
  { label: "Ghana Travel", href: "/travel/ghana" },
  { label: "Ghana RSVP", href: "/rsvp" },
];