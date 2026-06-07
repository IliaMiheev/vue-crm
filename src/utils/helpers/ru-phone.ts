const RU_PHONE_FORMAT_REGEX = /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/;

export const RU_PHONE_PLACEHOLDER = '+7 (999) 123-45-67';
export const RU_PHONE_MAX_LENGTH = 18;

export function formatRuPhone(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (!digits.length) return '';

  if (digits.startsWith('8')) {
    digits = '7' + digits.slice(1);
  } else if (!digits.startsWith('7')) {
    digits = '7' + digits;
  }

  digits = digits.slice(0, 11);

  const area = digits.slice(1, 4);
  const part1 = digits.slice(4, 7);
  const part2 = digits.slice(7, 9);
  const part3 = digits.slice(9, 11);

  let result = '+7';
  if (area.length) result += ` (${area}`;
  if (area.length === 3) result += ')';
  if (part1.length) result += ` ${part1}`;
  if (part2.length) result += `-${part2}`;
  if (part3.length) result += `-${part3}`;

  return result;
}

export function isValidRuPhone(value: string): boolean {
  return RU_PHONE_FORMAT_REGEX.test(value);
}

export function ruPhoneRule(value: string) {
  if (!value) return true;
  return isValidRuPhone(value) ? true : `Укажите телефон в формате ${RU_PHONE_PLACEHOLDER}`;
}
