import db from './mock.db';
import { devDB } from './mock.db.dev';

const CRM_DB_KEY = 'crm-database';
export const CRM_MODELS = ['customers', 'products', 'orders', 'blogs'] as const;
export type CrmModel = (typeof CRM_MODELS)[number];

const DEMO_RU_PHONES = [
  { phone: '+7 (495) 123-45-67', mobile: '+7 (495) 123-45-68' },
  { phone: '+7 (812) 234-56-78', mobile: '+7 (812) 234-56-79' },
  { phone: '+7 (343) 345-67-89', mobile: '+7 (343) 345-67-90' },
  { phone: '+7 (383) 456-78-90', mobile: '+7 (383) 456-78-91' },
  { phone: '+7 (843) 567-89-01', mobile: '+7 (843) 567-89-02' },
  { phone: '+7 (351) 678-90-12', mobile: '+7 (351) 678-90-13' },
  { phone: '+7 (391) 789-01-23', mobile: '+7 (391) 789-01-24' },
  { phone: '+7 (863) 890-12-34', mobile: '+7 (863) 890-12-35' },
  { phone: '+7 (381) 901-23-45', mobile: '+7 (381) 901-23-46' },
  { phone: '+7 (421) 012-34-56', mobile: '+7 (421) 012-34-57' },
  { phone: '+7 (473) 123-45-67', mobile: '+7 (473) 123-45-68' },
  { phone: '+7 (845) 234-56-78', mobile: '+7 (845) 234-56-79' }
];

function looksLikeLegacyPhone(value: unknown): boolean {
  const s = String(value ?? '');
  return /x\d|^\(\d{3}\)|^\d{3}[-.]?\d{3}[-.]?\d{4}|^1[-\s(]/.test(s);
}

function localizeCustomerPhones(customers: unknown) {
  if (!Array.isArray(customers)) return;
  customers.forEach((row, index) => {
    if (!row || typeof row !== 'object') return;
    const customer = row as Record<string, unknown>;
    if (!looksLikeLegacyPhone(customer.phone) && !looksLikeLegacyPhone(customer.mobile)) return;
    const sample = DEMO_RU_PHONES[index % DEMO_RU_PHONES.length];
    customer.phone = sample.phone;
    customer.mobile = sample.mobile;
  });
}

function getBaseDb(): Record<string, unknown> {
  if (
    import.meta.env.DEV ||
    (import.meta.env.API_URL && String(import.meta.env.API_URL).startsWith('http://localhost'))
  ) {
    return devDB as Record<string, unknown>;
  }
  return db as Record<string, unknown>;
}

export function loadCrmDatabase(): Record<string, unknown> {
  const cache = JSON.parse(JSON.stringify(getBaseDb())) as Record<string, unknown>;

  try {
    const stored = localStorage.getItem(CRM_DB_KEY);
    if (!stored) return cache;

    const parsed = JSON.parse(stored) as Partial<Record<CrmModel, unknown[]>>;
    for (const model of CRM_MODELS) {
      if (Array.isArray(parsed[model])) {
        cache[model] = parsed[model];
      }
    }
  } catch {
    /* ignore corrupted storage */
  }

  localizeCustomerPhones(cache.customers);

  return cache;
}

export function persistCrmDatabase(cache: Record<string, unknown>) {
  try {
    const payload: Partial<Record<CrmModel, unknown[]>> = {};
    for (const model of CRM_MODELS) {
      if (Array.isArray(cache[model])) {
        payload[model] = cache[model] as unknown[];
      }
    }
    localStorage.setItem(CRM_DB_KEY, JSON.stringify(payload));
  } catch {
    /* ignore storage errors */
  }
}
