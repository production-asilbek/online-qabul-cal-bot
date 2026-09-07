export function normalizePhone(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function isValidUzbekPhone(value: string) {
  return /^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/.test(normalizePhone(value));
}

export function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function formatPhoneDisplay(value: string) {
  const digits = digitsOnly(value);
  if (digits.startsWith("998") && digits.length === 12) {
    return `+998 ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10, 12)}`;
  }
  return value;
}

export function telHref(value: string) {
  return `tel:+${digitsOnly(value)}`;
}
