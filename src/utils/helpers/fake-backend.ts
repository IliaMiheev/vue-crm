import { loadCrmDatabase, persistCrmDatabase } from './crm-db-storage';
import { idbGet, idbSet, migrateLocalStorageKey } from './indexed-db';

export { initFakeBackend };


export type UserRole = 'admin' | 'user';

export interface AuthUser {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  token: string;
}

export interface SessionUser {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  token: string;
}

interface ResponseBody extends SessionUser {}

export interface RegisterPayload {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

const REGISTERED_USERS_KEY = 'crm-registered-users';

const DEFAULT_USERS: AuthUser[] = [
  {
    id: 1,
    username: 'admin@test.com',
    password: 'password',
    firstName: 'Админ',
    lastName: 'Системы',
    role: 'admin',
    token: 'token'
  },
  {
    id: 2,
    username: 'admin.test@test.com',
    password: 'password',
    firstName: 'Админ',
    lastName: 'Системы',
    role: 'admin',
    token: 'token'
  }
];

function normalizeUser(user: AuthUser): AuthUser {
  if (!user.role) {
    const isDefault = DEFAULT_USERS.some((d) => d.username.toLowerCase() === user.username.toLowerCase());
    user.role = isDefault ? 'admin' : 'user';
  }
  return user;
}

function toSessionUser(user: AuthUser): ResponseBody {
  return {
    id: user.id,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    token: 'fake-jwt-token'
  };
}

async function loadUsers(): Promise<AuthUser[]> {
  const users = DEFAULT_USERS.map((u) => ({ ...u }));
  try {
    const registered = await migrateLocalStorageKey<AuthUser[]>(REGISTERED_USERS_KEY);
    if (!registered) return users;
    for (const user of registered) {
      if (!users.some((u) => u.username.toLowerCase() === user.username.toLowerCase())) {
        users.push(normalizeUser(user));
      }
    }
  } catch {
    /* ignore corrupted storage */
  }
  return users;
}

async function persistRegisteredUser(user: AuthUser) {
  if (DEFAULT_USERS.some((u) => u.username.toLowerCase() === user.username.toLowerCase())) {
    return;
  }
  try {
    const registered = (await idbGet<AuthUser[]>(REGISTERED_USERS_KEY)) ?? [];
    if (!registered.some((u) => u.username.toLowerCase() === user.username.toLowerCase())) {
      registered.push(user);
      await idbSet(REGISTERED_USERS_KEY, registered);
    }
  } catch {
    /* ignore storage errors */
  }
}

async function initFakeBackend() {
  const users: AuthUser[] = await loadUsers();
  let cache: Record<string, unknown> = await loadCrmDatabase();
  const realFetch = window.fetch;

  window.fetch = function (url: string, opts: { method: string; headers: { [key: string]: string }; body?: string }) {
    return new Promise<Response>((resolve, reject) => {
      // wrap in timeout to simulate server api call
      setTimeout(handleRoute, 500);

      function handleRoute() {
        switch (true) {
          case url.endsWith('/users/register') && opts.method === 'POST':
            return registerUser();
          case url.endsWith('/users/authenticate') && opts.method === 'POST':
            return authenticate();
          case url.endsWith('/users') && opts.method === 'GET':
            return getUsers();
          //------------------- Customer ----------------------
          case url.endsWith('/customers') && opts.method === 'GET':
            return getAllData('customers');
          case url.endsWith('/customers') && opts.method === 'POST':
            return saveData('customers','', body());
          case url.lastIndexOf('/customers') > 0 && !url.endsWith('/customers')
            && opts.method === 'GET':
            return getDataById('customers', getId(url));
          case url.lastIndexOf('/customers') > 0 && !url.endsWith('/customers') && opts.method === 'DELETE':
            return deleteDataById('customers',getId(url));
          case url.lastIndexOf('/customers') > 0 && !url.endsWith('/customers') && opts.method === 'PUT':
            return saveData('customers', getId(url), body());
          //------------------- Product ----------------------
          case url.endsWith('/products') && opts.method === 'GET':
            return getAllData('products');
          case url.endsWith('/products') && opts.method === 'POST':
            return saveData('products','', body());
          case url.lastIndexOf('/products') > 0 && !url.endsWith('/products')
            && opts.method === 'GET':
            return getDataById('products', getId(url));
          case url.lastIndexOf('/products') > 0 && !url.endsWith('/products') && opts.method === 'DELETE':
            return deleteDataById('products',getId(url));
          case url.lastIndexOf('/products') > 0 && !url.endsWith('/products') && opts.method === 'PUT':
            return saveData('products',getId(url), body());
          //------------------- Order ----------------------
          case url.endsWith('/orders') && opts.method === 'GET':
            return getAllData('orders');
          case url.endsWith('/orders') && opts.method === 'POST':
            return saveData('orders','', body());
          case url.lastIndexOf('/orders') > 0 && !url.endsWith('/orders')
            && opts.method === 'GET':
            return getDataById('orders', getId(url));
          case url.lastIndexOf('/orders') > 0 && !url.endsWith('/orders') && opts.method === 'DELETE':
            return deleteDataById('orders',getId(url));
          case url.lastIndexOf('/orders') > 0 && !url.endsWith('/orders') && opts.method === 'PUT':
            return saveData('orders',getId(url), body());
          //------------------- Blog ----------------------
          case url.endsWith('/blogs') && opts.method === 'GET':
            return getAllData('blogs');
          case url.endsWith('/blogs') && opts.method === 'POST':
            return saveData('blogs','', body());
          case url.lastIndexOf('/blogs') > 0 && !url.endsWith('/blogs')
            && opts.method === 'GET':
            return getDataById('blogs', getId(url));
          case url.lastIndexOf('/blogs') > 0 && !url.endsWith('/blogs') && opts.method === 'DELETE':
            return deleteDataById('blogs',getId(url));
          case url.lastIndexOf('/blogs') > 0 && !url.endsWith('/blogs') && opts.method === 'PUT':
            return saveData('blogs',getId(url), body());

          default:
            // pass through any requests not handled above
            return realFetch(url, opts)
              .then((response) => resolve(response))
              .catch((error) => reject(error));
        }
      }

      // route functions
      function registerUser() {
        const { username, password, firstName, lastName } = body() as RegisterPayload;

        if (!username?.trim()) return error('Укажите почту');
        if (!firstName?.trim() || !lastName?.trim()) return error('Укажите имя и фамилию');
        if (!password || password.length < 6) return error('Пароль должен быть не менее 6 символов');
        if (password.length > 32) return error('Пароль не должен превышать 32 символа');

        const email = username.trim().toLowerCase();
        if (!/.+@.+\..+/.test(email)) return error('Некорректный адрес почты');

        if (users.some((u) => u.username.toLowerCase() === email)) {
          return error('Пользователь с такой почтой уже зарегистрирован');
        }

        const newUser: AuthUser = {
          id: Math.max(0, ...users.map((u) => u.id)) + 1,
          username: email,
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          role: 'user',
          token: 'token'
        };

        users.push(newUser);
        void persistRegisteredUser(newUser);

        return ok(toSessionUser(newUser));
      }

      function authenticate() {
        const { username, password } = body();
        const email = username?.trim().toLowerCase();
        const user = users.find((x) => x.username.toLowerCase() === email && x.password === password);
        if (!user) return error('Неверный логин или пароль');
        normalizeUser(user);
        return ok(toSessionUser(user));
      }

      function getUsers() {
        if (!isAuthenticated()) return unauthorized();
        return ok(users);
      }

      function getAllData(model: string) {
        if (!isAuthenticated()) return unauthorized();
        const collection = cache[model] as unknown[];
        return ok(collection);
      }

      function getDataById(model: string, id: string) {
        if (!isAuthenticated()) return unauthorized();
        const collection = cache[model] as { id?: string | number }[];
        const item = collection.find((c) => String(c.id) === String(id));
        if (!item) return error('Запись не найдена');
        return ok(item);
      }

      function deleteDataById(model: string, id: string) {
        if (!isAuthenticated()) return unauthorized();
        const collection = cache[model] as { id?: string | number }[];
        const idx = collection.findIndex((c) => String(c.id) === String(id));
        if (idx === -1) return error('Запись не найдена');
        collection.splice(idx, 1);
        void persistCrmDatabase(cache);
        return ok({ status: '204' });
      }

      function nextEntityId(model: string): string {
        const items = (cache[model] || []) as { id?: string | number }[];
        const maxId = items.reduce((max, item) => {
          const numericId = Number(item.id);
          return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
        }, 0);
        return String(maxId + 1);
      }

      function saveData(model: string, id: string, data: Record<string, unknown>) {
        if (!isAuthenticated()) return unauthorized();
        const collection = cache[model] as Record<string, unknown>[];
        if (id) {
          const idx = collection.findIndex((c) => String(c.id) === String(id));
          if (idx === -1) return error('Запись не найдена');
          collection[idx] = Object.assign({}, collection[idx], data, { id: collection[idx].id });
        } else {
          const payload = Object.assign({}, data);
          payload.id = payload.id || nextEntityId(model);
          collection.push(payload);
        }
        void persistCrmDatabase(cache);
        return ok({ status: '204' });
      }

      // helper functions
      function ok(body: unknown): void {
        resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(body)) } as Response);
      }

      function unauthorized() {
        resolve({ status: 401, text: () => Promise.resolve(JSON.stringify({ message: 'Unauthorized' })) } as Response);
      }

      function error(message: string) {
        resolve({ status: 400, text: () => Promise.resolve(JSON.stringify({ message })) } as Response);
      }

      function isAuthenticated() {
        return opts.headers['Authorization'] === 'Bearer fake-jwt-token';
      }

      function body() {
        return opts.body && JSON.parse(opts.body);
      }

      function getId(url: string): string {
        const ldx = url.lastIndexOf('/')
        if (ldx + 1 < url.length) {
          return url.substring(ldx + 1, url.length)
        }
        return ''
      }
    });
  } as typeof window.fetch; // Type assertion here
}
