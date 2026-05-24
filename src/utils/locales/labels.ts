const DELIVERY_LABELS: Record<string, string> = {
  packing: 'Упаковка',
  shipping: 'Доставка',
  'customs-clearance': 'Таможня',
  delivered: 'Доставлен'
};

const MEMBERSHIP_LABELS: Record<string, string> = {
  standard: 'Стандарт',
  vip: 'VIP'
};

export const MEMBERSHIP_OPTIONS = [
  { title: 'Стандарт', value: 'standard' },
  { title: 'VIP', value: 'vip' }
] as const;

export function formatDeliveryStatus(status: string | undefined): string {
  if (!status) return '';
  return DELIVERY_LABELS[status] ?? status;
}

export function formatMembership(value: string | undefined): string {
  if (!value) return '';
  return MEMBERSHIP_LABELS[value] ?? value;
}
