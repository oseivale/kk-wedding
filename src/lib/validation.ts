/** Shared limits and checks used by both the forms (in the browser) and the API routes (on the server). */

export const LIMITS = {
  name: 100,
  email: 254,
  airline: 60,
  flight: 12,
  whatsapp: 25,
  maxChildren: 4,
  fileBytes: 4 * 1024 * 1024, // 4 MB (Vercel caps request bodies at 4.5 MB)
};

export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
];

export const clean = (v: unknown, max: number) =>
  String(v ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

export const isFullName = (v: string) => v.length >= 3 && /\p{L}/u.test(v) && v.includes(" ");

/** Digits with an optional leading +, at least 8 digits overall. */
export const isWhatsApp = (v: string) => /^\+?[\d\s().-]{8,25}$/.test(v) && v.replace(/\D/g, "").length >= 8;

export const isFlightNumber = (v: string) => /^[A-Za-z0-9]{2,3}\s?\d{1,5}[A-Za-z]?$/.test(v);

export const isIsoDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));

/** Simple, permissive email check: something@domain.tld, no spaces. */
export const isEmail = (v: string) => v.length <= 254 && /^[^\s@<>(),;:"\[\]]+@[^\s@<>(),;:"\[\]]+\.[a-z]{2,}$/i.test(v);

export const isTime = (v: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(v);

export type RsvpPayload = {
  code: string;
  fullName: string;
  attending: "accepts" | "declines";
  children: string[];
  email?: string;
};

export type PickupPayload = {
  fullName: string;
  whatsapp: string;
  needsPickup: boolean;
  airline?: string;
  flightNumber?: string;
  arrivalDate?: string;
  arrivalTime?: string;
};
