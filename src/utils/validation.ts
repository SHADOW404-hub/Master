/**
 * Utility functions for security, sanitization, and input formatting
 */

// Format phone number to +998 XX XXX XX XX
// Foydalanuvchi yozgan raqamlarni to'g'ri formatlaydi
export function formatUzbekPhone(value: string): string {
  // Barcha raqam bo'lmagan belgilarni olib tashlaymiz
  let digits = value.replace(/\D/g, '');

  // Agar 998 bilan boshlanmasa, avvalga qaytaramiz
  if (digits.length === 0) return '+998 ';
  if (!digits.startsWith('998')) {
    digits = '998' + digits.replace(/^998/, '');
  }

  // Maksimal 12 ta raqam (998 + 9 ta)
  digits = digits.slice(0, 12);

  // Formatlash: +998 XX XXX XX XX
  let result = '+' + digits.slice(0, 3); // +998
  if (digits.length > 3) result += ' ' + digits.slice(3, 5);   // XX
  if (digits.length > 5) result += ' ' + digits.slice(5, 8);   // XXX
  if (digits.length > 8) result += ' ' + digits.slice(8, 10);  // XX
  if (digits.length > 10) result += ' ' + digits.slice(10, 12); // XX

  return result;
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

// Format card expiry (MM/YY)
export function formatCardExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
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
