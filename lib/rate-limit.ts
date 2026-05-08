type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  maxRequests: number;
  windowMs: number;
};

const inMemoryStore = new Map<string, RateLimitEntry>();

export function checkRateLimit(key: string, options: RateLimitOptions) {
  const now = Date.now();
  const existing = inMemoryStore.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + options.windowMs;
    inMemoryStore.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: Math.max(0, options.maxRequests - 1),
      resetAt,
      retryAfterSeconds: Math.ceil(options.windowMs / 1000),
    };
  }

  const nextCount = existing.count + 1;
  const allowed = nextCount <= options.maxRequests;

  inMemoryStore.set(key, {
    count: nextCount,
    resetAt: existing.resetAt,
  });

  const retryAfterSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));

  return {
    allowed,
    remaining: Math.max(0, options.maxRequests - nextCount),
    resetAt: existing.resetAt,
    retryAfterSeconds,
  };
}
