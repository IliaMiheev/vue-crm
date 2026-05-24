export function isCreateRoute(id: string | string[] | undefined): boolean {
  if (Array.isArray(id)) return id.length === 0 || id[0] === 'new';
  return !id || id === 'new';
}

export function routeEntityId(id: string | string[] | undefined): string {
  if (Array.isArray(id)) return id[0] ?? '';
  return id ?? '';
}

export function isApiSuccess(response: { status?: string | boolean } | null | undefined): boolean {
  return response?.status === '204' || response?.status === true;
}
