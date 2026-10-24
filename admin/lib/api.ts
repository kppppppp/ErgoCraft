/**
 * Resolves the API base URL cleanly:
 * - If NEXT_PUBLIC_API_URL is unset or empty, defaults to local development: 'http://localhost:5000/api/v1'
 * - If set to 'https://ergocraft-1.onrender.com' (without /api/v1), normalizes to 'https://ergocraft-1.onrender.com/api/v1'
 * - If set to 'https://ergocraft-1.onrender.com/api/v1' (with /api/v1), preserves it without duplicate path segments
 * - Removes any trailing slashes cleanly
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!envUrl || !envUrl.trim()) {
    return 'http://localhost:5000/api/v1';
  }
  const trimmed = envUrl.trim().replace(/\/+$/, '');
  if (trimmed.endsWith('/api/v1')) {
    return trimmed;
  }
  if (trimmed.endsWith('/api')) {
    return `${trimmed}/v1`;
  }
  return `${trimmed}/api/v1`;
}

export function resolveApiUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // If the endpoint already begins with /api/v1/, avoid duplicating /api/v1
  if (cleanEndpoint.startsWith('/api/v1/')) {
    const root = base.replace(/\/api\/v1$/, '');
    return `${root}${cleanEndpoint}`;
  }

  return `${base}${cleanEndpoint}`;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: Array<{ field: string; message: string }>;

  constructor(message: string, statusCode: number, errors?: Array<{ field: string; message: string }>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export async function fetchApi<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; message?: string }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ergocraft_admin_token') : null;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type if not sending FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = resolveApiUrl(endpoint);

  const res = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(json.message || 'Request failed', res.status, json.errors);
  }

  return json;
}
