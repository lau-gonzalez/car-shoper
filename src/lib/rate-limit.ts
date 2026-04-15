interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
};

const stores = new Map<string, Map<string, { count: number; resetAt: number }>>();

function getStore(namespace: string) {
  if (!stores.has(namespace)) {
    stores.set(namespace, new Map());
  }
  return stores.get(namespace)!;
}

export function checkRateLimit(
  ip: string,
  config: RateLimitConfig = DEFAULT_CONFIG,
  namespace = 'default',
): { allowed: boolean } {
  const now = Date.now();
  const store = getStore(namespace);

  // Clean stale entries
  for (const [key, value] of store) {
    if (value.resetAt <= now) store.delete(key);
  }

  const entry = store.get(ip);

  if (!entry || entry.resetAt <= now) {
    store.set(ip, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false };
  }

  entry.count++;
  return { allowed: true };
}

export function resetRateLimit(namespace?: string) {
  if (namespace) {
    stores.get(namespace)?.clear();
  } else {
    stores.clear();
  }
}

// Pre-configured rate limiters for common endpoints
export const AUTH_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10,
};

export const INQUIRY_RATE_LIMIT: RateLimitConfig = {
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5,
};
