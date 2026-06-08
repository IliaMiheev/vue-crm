import db from './mock.db';
import { idbSet, migrateLocalStorageKey } from './indexed-db';

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

const ORDER_REF_BASE = 1737500000000;

const LEGACY_ORDER_CUSTOMERS: Record<string, string> = {
  'Lillie Schultz': 'Лилия Шульц',
  'Billy Stoltenberg': 'Алексей Иванов',
  'Eloise Ebert': 'Мария Петрова',
  'Teresa Luettgen': 'Ольга Смирнова',
  'Salvador Mayert': 'Дмитрий Козлов',
  'Dr. Guadalupe Rath': 'Игорь Соколов',
  'Kelvin Pouros': 'Наталья Морозова',
  'Thelma Langworth': 'Сергей Новиков',
  'Kristen Wunsch': 'Анна Кузнецова',
  'Steve Welch': 'Павел Орлов',
  'Brian Jacobs': 'Виктория Белова'
};

function looksLikeLegacyCustomer(row: unknown): boolean {
  if (!row || typeof row !== 'object') return false;
  const customer = row as Record<string, unknown>;
  const email = String(customer.email ?? '');
  const firstname = String(customer.firstname ?? '');
  return email.includes('@test.com') || /^[A-Za-z]/.test(firstname);
}

function shouldReplaceCustomersFromBase(stored: unknown): boolean {
  if (!Array.isArray(stored) || stored.length === 0) return false;
  return stored.some(looksLikeLegacyCustomer);
}

const LEGACY_PRODUCT_NAME =
  /Anta|Nike|XTEP|Li-Ning|Jordan|Zoom Freak|Adidas Air|Air Jordan|Backetball|Track and Field|Aerobic Exercise/i;

function looksLikeLegacyProduct(row: unknown): boolean {
  if (!row || typeof row !== 'object') return false;
  const product = row as Record<string, unknown>;
  const name = String(product.name ?? '');
  const category = String(product.category ?? '');
  const price = Number(product.price);
  return LEGACY_PRODUCT_NAME.test(name) || LEGACY_PRODUCT_NAME.test(category) || (price > 0 && price < 500);
}

function shouldReplaceProductsFromBase(stored: unknown): boolean {
  if (!Array.isArray(stored) || stored.length === 0) return false;
  return stored.some(looksLikeLegacyProduct);
}

function looksLikeLegacyLineItem(row: unknown): boolean {
  if (!row || typeof row !== 'object') return false;
  const item = row as Record<string, unknown>;
  return LEGACY_PRODUCT_NAME.test(String(item.name ?? '')) || Number(item.price) < 500;
}

function syncOrderLineItemsWithProducts(orders: unknown, products: unknown) {
  if (!Array.isArray(orders) || !Array.isArray(products)) return;

  const catalog = new Map<string, Record<string, unknown>>();
  products.forEach((row) => {
    if (!row || typeof row !== 'object') return;
    const product = row as Record<string, unknown>;
    catalog.set(String(product.id), product);
  });

  orders.forEach((row) => {
    if (!row || typeof row !== 'object') return;
    const order = row as Record<string, unknown>;
    const lineItems = order.lineItems;
    if (!Array.isArray(lineItems)) return;

    let amount = 0;
    let touched = false;

    lineItems.forEach((lineRow) => {
      if (!lineRow || typeof lineRow !== 'object') return;
      const lineItem = lineRow as Record<string, unknown>;
      if (!looksLikeLegacyLineItem(lineItem)) {
        amount += Number(lineItem.price) || 0;
        return;
      }

      const product = catalog.get(String(lineItem.id));
      if (!product) {
        amount += Number(lineItem.price) || 0;
        return;
      }

      lineItem.name = product.name;
      lineItem.category = product.category;
      lineItem.price = product.price;
      if (product.status) lineItem.status = product.status;
      if (product.imageUri) lineItem.imageUri = product.imageUri;
      amount += Number(product.price) || 0;
      touched = true;
    });

    if (touched) order.amount = amount;
  });
}

function looksLikeLegacyOrderRef(value: unknown): boolean {
  const s = String(value ?? '');
  return s.length > 0 && !/^ORD-\d+$/.test(s);
}

function normalizeOrderReferences(orders: unknown) {
  if (!Array.isArray(orders)) return;
  orders.forEach((row, index) => {
    if (!row || typeof row !== 'object') return;
    const order = row as Record<string, unknown>;
    if (!looksLikeLegacyOrderRef(order.reference)) return;
    order.reference = `ORD-${ORDER_REF_BASE + index * 1000}`;
  });
}

function normalizeOrderCustomers(orders: unknown) {
  if (!Array.isArray(orders)) return;
  orders.forEach((row) => {
    if (!row || typeof row !== 'object') return;
    const order = row as Record<string, unknown>;
    const customer = String(order.customer ?? '');
    const mapped = LEGACY_ORDER_CUSTOMERS[customer];
    if (mapped) order.customer = mapped;
  });
}

const DEMO_RU_SHIPPING_ADDRESSES = [
  { street: 'ул. Муравьёва-Амурского, д. 28, кв. 45', city: 'Хабаровск', zipcode: '680000', country: 'Россия' },
  { street: 'ул. Тверская, д. 8, кв. 74', city: 'Москва', zipcode: '125009', country: 'Россия' },
  { street: 'Невский проспект, д. 50, кв. 12', city: 'Санкт-Петербург', zipcode: '191025', country: 'Россия' },
  { street: 'ул. Малышева, д. 36, оф. 702', city: 'Екатеринбург', zipcode: '620014', country: 'Россия' },
  { street: 'ул. Красный проспект, д. 77', city: 'Новосибирск', zipcode: '630007', country: 'Россия' },
  { street: 'ул. Кирова, д. 159, кв. 9', city: 'Челябинск', zipcode: '454091', country: 'Россия' },
  { street: 'пр. Мира, д. 187', city: 'Красноярск', zipcode: '660049', country: 'Россия' },
  { street: 'ул. Большая Садовая, д. 123', city: 'Ростов-на-Дону', zipcode: '344002', country: 'Россия' },
  { street: 'ул. Ленина, д. 62', city: 'Омск', zipcode: '644043', country: 'Россия' },
  { street: 'пр. Революции, д. 9', city: 'Воронеж', zipcode: '394018', country: 'Россия' },
  { street: 'ул. Московское шоссе, д. 15, корп. 2', city: 'Самара', zipcode: '443086', country: 'Россия' }
];

function looksLikeLegacyShippingAddress(addr: unknown): boolean {
  if (!addr || typeof addr !== 'object') return false;
  const a = addr as Record<string, unknown>;
  const country = String(a.country ?? '');
  if (country === 'Россия') return false;
  if (/^[A-Za-z]/.test(String(a.city ?? ''))) return true;
  return /India|Hong Kong|Malaysia|Austria|Sierra Leone|Romania|Mali|Spain|Haiti|Ethiopia|Anguilla|USA|China/i.test(
    country
  );
}

function normalizeShippingAddresses(orders: unknown) {
  if (!Array.isArray(orders)) return;
  orders.forEach((row, index) => {
    if (!row || typeof row !== 'object') return;
    const order = row as Record<string, unknown>;
    const addr = order.shippingAddress;
    if (!looksLikeLegacyShippingAddress(addr)) return;
    const sample = DEMO_RU_SHIPPING_ADDRESSES[index % DEMO_RU_SHIPPING_ADDRESSES.length];
    order.shippingAddress = { ...(addr as object), ...sample };
  });
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

function normalizeImagePath(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  if (value.startsWith('/src/assets/images/')) return value.slice('/src/'.length);
  if (value.startsWith('/assets/images/')) return value.slice(1);
  return value;
}

function normalizeImagePathsInRecords(records: unknown, keys: string[]) {
  if (!Array.isArray(records)) return;
  for (const record of records) {
    if (!record || typeof record !== 'object') continue;
    for (const key of keys) {
      if (key in record) {
        (record as Record<string, unknown>)[key] = normalizeImagePath(
          (record as Record<string, unknown>)[key]
        );
      }
    }
  }
}

function normalizeImagePaths(cache: Record<string, unknown>) {
  normalizeImagePathsInRecords(cache.customers, ['avatar']);
  normalizeImagePathsInRecords(cache.products, ['imageUri']);
  normalizeImagePathsInRecords(cache.blogs, ['coverUrl']);

  if (Array.isArray(cache.blogs)) {
    for (const blog of cache.blogs) {
      if (!blog || typeof blog !== 'object') continue;
      const author = (blog as Record<string, unknown>).author;
      if (author && typeof author === 'object' && 'avatar' in author) {
        (author as Record<string, unknown>).avatar = normalizeImagePath(
          (author as Record<string, unknown>).avatar
        );
      }
    }
  }

  if (Array.isArray(cache.orders)) {
    for (const order of cache.orders) {
      if (!order || typeof order !== 'object') continue;
      const lineItems = (order as Record<string, unknown>).lineItems;
      if (!Array.isArray(lineItems)) continue;
      for (const item of lineItems) {
        if (item && typeof item === 'object' && 'imageUri' in item) {
          (item as Record<string, unknown>).imageUri = normalizeImagePath(
            (item as Record<string, unknown>).imageUri
          );
        }
      }
    }
  }

  return cache;
}

function getBaseDb(): Record<string, unknown> {
  return db as Record<string, unknown>;
}

function applyNormalizations(cache: Record<string, unknown>) {
  normalizeImagePaths(cache);
  localizeCustomerPhones(cache.customers);
  normalizeOrderReferences(cache.orders);
  normalizeOrderCustomers(cache.orders);
  normalizeShippingAddresses(cache.orders);
  syncOrderLineItemsWithProducts(cache.orders, cache.products);
  return cache;
}

function mergeStoredData(cache: Record<string, unknown>, parsed: Partial<Record<CrmModel, unknown[]>>) {
  for (const model of CRM_MODELS) {
    if (!Array.isArray(parsed[model])) continue;
    if (model === 'customers' && shouldReplaceCustomersFromBase(parsed.customers)) {
      continue;
    }
    if (model === 'products' && shouldReplaceProductsFromBase(parsed.products)) {
      continue;
    }
    cache[model] = parsed[model];
  }
  return cache;
}

export async function loadCrmDatabase(): Promise<Record<string, unknown>> {
  const cache = JSON.parse(JSON.stringify(getBaseDb())) as Record<string, unknown>;

  try {
    const parsed = await migrateLocalStorageKey<Partial<Record<CrmModel, unknown[]>>>(CRM_DB_KEY);
    if (!parsed) return applyNormalizations(cache);
    mergeStoredData(cache, parsed);
  } catch {
    /* ignore corrupted storage */
  }

  return applyNormalizations(cache);
}

export async function persistCrmDatabase(cache: Record<string, unknown>): Promise<void> {
  try {
    const payload: Partial<Record<CrmModel, unknown[]>> = {};
    for (const model of CRM_MODELS) {
      if (Array.isArray(cache[model])) {
        payload[model] = cache[model] as unknown[];
      }
    }
    await idbSet(CRM_DB_KEY, payload);
  } catch {
    /* ignore storage errors */
  }
}
