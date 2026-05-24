import db from './mock.db';
import { devDB } from './mock.db.dev';

const CRM_DB_KEY = 'crm-database';
export const CRM_MODELS = ['customers', 'products', 'orders', 'blogs'] as const;
export type CrmModel = (typeof CRM_MODELS)[number];

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
