const pkrFormatter = new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 });

/** Formats an amount in Pakistani Rupees, e.g. 12500 -> "Rs. 12,500" */
export function formatPKR(amount: number): string {
  return `Rs. ${pkrFormatter.format(Math.round(Number(amount) || 0))}`;
}

/**
 * Normalises a Pakistani phone number to international digits for wa.me links.
 * "0300 1234567" / "+92 300 1234567" / "3001234567" -> "923001234567"
 */
export function toWhatsAppDigits(phone: string): string {
  let digits = (phone || '').replace(/\D/g, '');
  if (digits.startsWith('0092')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `92${digits.slice(1)}`;
  if (digits.length === 10 && digits.startsWith('3')) digits = `92${digits}`;
  return digits;
}

/** Returns a wa.me link, or null when no WhatsApp number is configured. */
export function whatsappLink(phone: string, text?: string): string | null {
  const digits = toWhatsAppDigits(phone);
  if (digits.length < 10) return null;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

/** Validates a Pakistani mobile number (03XX XXXXXXX, with or without +92). */
export function isValidPakistaniMobile(phone: string): boolean {
  const digits = (phone || '').replace(/[\s\-()]/g, '');
  return /^(\+92|0092|92|0)?3\d{9}$/.test(digits);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Splits "a, b ,c" into ['a','b','c'] */
export function splitList(text: string): string[] {
  return text.split(',').map(s => s.trim()).filter(Boolean);
}

export const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar',
  'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur', 'Sargodha', 'Sukkur',
  'Abbottabad', 'Gujrat', 'Sahiwal', 'Mardan', 'Rahim Yar Khan', 'Jhelum', 'Okara',
  'Sheikhupura', 'Kasur', 'Dera Ghazi Khan', 'Larkana', 'Mirpur (AJK)', 'Muzaffarabad',
];
