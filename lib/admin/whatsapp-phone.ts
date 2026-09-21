/** Digits internationaux pour https://wa.me/<digits> (sans +). Studio Tunisie. */
const TUNISIA_COUNTRY_CODE = "216";

export function toWhatsAppPhoneDigits(rawPhone: string | null | undefined): string | null {
  if (!rawPhone?.trim()) return null;
  let digits = rawPhone.replace(/\D/g, "");
  if (digits.length < 6) return null;

  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith(TUNISIA_COUNTRY_CODE) && digits.length >= 10) return digits;
  if (digits.startsWith("0") && digits.length >= 8) {
    return `${TUNISIA_COUNTRY_CODE}${digits.slice(1)}`;
  }
  if (digits.length === 8) return `${TUNISIA_COUNTRY_CODE}${digits}`;
  return digits;
}

export function buildWaMeUrl(phoneDigits: string, message: string): string {
  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}
