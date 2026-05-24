import { devDB } from './mock.db.dev'
import db from './mock.db'
export { fakeBackend };


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
    firstName: 'Admin',
    lastName: 'Test',
    role: 'admin',
    token: 'token'
  },
  {
    id: 2,
    username: 'admin.test@test.com',
    password: 'password',
    firstName: 'Admin',
    lastName: 'Test',
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

function loadUsers(): AuthUser[] {
  const users = DEFAULT_USERS.map((u) => ({ ...u }));
  try {
    const stored = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!stored) return users;
    const registered: AuthUser[] = JSON.parse(stored);
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

function persistRegisteredUser(user: AuthUser) {
  if (DEFAULT_USERS.some((u) => u.username.toLowerCase() === user.username.toLowerCase())) {
    return;
  }
  try {
    const stored = localStorage.getItem(REGISTERED_USERS_KEY);
    const registered: AuthUser[] = stored ? JSON.parse(stored) : [];
    if (!registered.some((u) => u.username.toLowerCase() === user.username.toLowerCase())) {
      registered.push(user);
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registered));
    }
  } catch {
    /* ignore storage errors */
  }
}

function loadDevDB() {
  // console.log(' import.meta.env.API_URL ', import.meta.env.API_URL)
  if (import.meta.env.DEV 
      || (import.meta.env.API_URL && import.meta.env.API_URL.startswith("http://localhost"))) {
    return devDB
  }
  return db
}

function fakeBackend() {
  const users: AuthUser[] = loadUsers();
  let cache: any = Object.assign({}, loadDevDB());
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
        persistRegisteredUser(newUser);
        cache = Object.assign({}, loadDevDB());

        return ok(toSessionUser(newUser));
      }

      function authenticate() {
        const { username, password } = body();
        const email = username?.trim().toLowerCase();
        const user = users.find((x) => x.username.toLowerCase() === email && x.password === password);
        if (!user) return error('Неверный логин или пароль');
        normalizeUser(user);
        cache = Object.assign({}, loadDevDB());
        return ok(toSessionUser(user));
      }

      function getUsers() {
        if (!isAuthenticated()) return unauthorized();
        return ok(users);
      }

      function getAllData(model:string) {
        if (!isAuthenticated()) return unauthorized();
        const customers = cache[model]
        return ok(customers);
      }

      function getDataById(model:string, id: string) {
        if (!isAuthenticated()) return unauthorized();
        const customer = cache[model].find((c: any) => c.id === id)
        return ok(customer);
      }

      function deleteDataById(model:string, id: string) {
        if (!isAuthenticated()) return unauthorized();
        const idx = cache[model].findIndex((c: any) => c.id === id)
        if (idx > -1) cache[model].splice(idx, 1)
        return ok({ status: '204' } as any);
      }

      function saveData(model:string, id: string, data: any) {
        if (!isAuthenticated()) return unauthorized();
        if (id) {
          const idx = cache[model].findIndex((c: any) => c.id === id)
          if (idx > -1) cache[model][idx] = Object.assign({}, data)
        }
        else {
          data.id = String(cache[model].length);
          cache[model][cache[model].length] = Object.assign({}, data)
        }
        return ok({ status: '204' } as any);
      }

      // helper functions
      function ok(body: AuthUser[] | ResponseBody): void {
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
