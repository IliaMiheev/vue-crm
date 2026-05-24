import type { UserRole } from './fake-backend';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Администратор',
  user: 'Пользователь'
};

const ADMIN_USERNAMES = ['admin@test.com', 'admin.test@test.com'];

export function resolveRole(user: { role?: UserRole; username?: string } | null): UserRole {
  if (user?.role) return user.role;
  if (user?.username && ADMIN_USERNAMES.includes(user.username.toLowerCase())) {
    return 'admin';
  }
  return 'user';
}

export function getRoleLabel(user: { role?: UserRole; username?: string } | null): string {
  return ROLE_LABELS[resolveRole(user)];
}

export function getDisplayName(user: {
  firstName?: string;
  lastName?: string;
  username?: string;
} | null): string {
  if (!user) return 'Гость';
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.username || 'Гость';
}
