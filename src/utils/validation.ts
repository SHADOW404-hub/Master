/**
 * Utility functions for security, sanitization, and input formatting
 */

// Format phone number to +998 (XX) XXX-XX-XX
export function formatUzbekPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits.startsWith('998') && digits.length > 0) {
    return '+998 ';
  }
  let formatted = '+';
  if (digits.length >= 3) formatted += digits.slice(0, 3) + ' ';
  if (digits.length >= 5) formatted += digits.slice(3, 5) + ' ';
  if (digits.length >= 8) formatted += digits.slice(5, 8) + ' ';
  if (digits.length >= 10) formatted += digits.slice(8, 10) + ' ';
  if (digits.length >= 12) formatted += digits.slice(10, 12);
  return formatted.trim();
}

// Validate Uzbek phone (+998 90 123 45 67)
export function validateUzbekPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 12 && cleaned.startsWith('998');
}

// Format 16-digit plastic card (Uzcard 8600 / Humo 9860)
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

// Detect card type (Uzcard / Humo / Other)
export function getCardType(cardNumber: string): 'uzcard' | 'humo' | 'unknown' {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.startsWith('8600')) return 'uzcard';
  if (cleaned.startsWith('9860') || cleaned.startsWith('8600')) return 'humo';
  return 'unknown';
}

// Validate plastic card
export function validateCardNumber(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');
  return cleaned.length === 16;
}

// Validate Passport series (e.g. FA1234567, AA1234567)
export function validatePassportSeries(passport: string): boolean {
  const regex = /^[A-Za-z]{2}\d{7}$/;
  return regex.test(passport.trim());
}

// Basic HTML sanitization to prevent XSS
export function sanitizeText(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
