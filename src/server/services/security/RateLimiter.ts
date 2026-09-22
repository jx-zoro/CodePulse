export class RateLimiter {
  private static store = new Map<string, { count: number, resetTime: number }>();

  // Simple in-memory token bucket/fixed window rate limiter
  public static checkLimit(identifier: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.store.get(identifier);

    if (!record) {
      this.store.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (now > record.resetTime) {
      // Window expired, reset
      this.store.set(identifier, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (record.count >= limit) {
      return false;
    }

    record.count++;
    return true;
  }
}
