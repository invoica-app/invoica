export interface PhoneCountry {
  name: string;
  iso: string;
  dialCode: string;
  flag: string;
}

/** Convert a 2-letter ISO code to its flag emoji. */
function isoToFlag(iso: string): string {
  return [...iso.toUpperCase()]
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

function c(name: string, iso: string, dialCode: string): PhoneCountry {
  return { name, iso, dialCode, flag: isoToFlag(iso) };
}

/**
 * Curated list of countries for the phone input dropdown.
 * Ghana is first (default), then Africa-focused, then global.
 */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  // Ghana first (default)
  c("Ghana", "GH", "+233"),
  // West Africa
  c("Nigeria", "NG", "+234"),
  c("Ivory Coast", "CI", "+225"),
  c("Senegal", "SN", "+221"),
  c("Cameroon", "CM", "+237"),
  c("Benin", "BJ", "+229"),
  c("Togo", "TG", "+228"),
  c("Burkina Faso", "BF", "+226"),
  // East Africa
  c("Kenya", "KE", "+254"),
  c("Tanzania", "TZ", "+255"),
  c("Uganda", "UG", "+256"),
  c("Rwanda", "RW", "+250"),
  c("Ethiopia", "ET", "+251"),
  // Southern / North Africa
  c("South Africa", "ZA", "+27"),
  c("Egypt", "EG", "+20"),
  c("Morocco", "MA", "+212"),
  // Europe
  c("United Kingdom", "GB", "+44"),
  c("Germany", "DE", "+49"),
  c("France", "FR", "+33"),
  c("Netherlands", "NL", "+31"),
  // Americas
  c("United States", "US", "+1"),
  c("Canada", "CA", "+1"),
  // Asia / Middle East
  c("India", "IN", "+91"),
  c("China", "CN", "+86"),
  c("Japan", "JP", "+81"),
  c("United Arab Emirates", "AE", "+971"),
];

/** Find a PhoneCountry by ISO code, country name, or dial code. */
export function findPhoneCountry(
  query: string
): PhoneCountry | undefined {
  const q = query.trim();
  return PHONE_COUNTRIES.find(
    (c) =>
      c.iso === q.toUpperCase() ||
      c.name.toLowerCase() === q.toLowerCase() ||
      c.dialCode === q
  );
}

/** Get the default phone country (Ghana). */
export function getDefaultPhoneCountry(): PhoneCountry {
  return PHONE_COUNTRIES[0];
}
