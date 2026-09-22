export class AIRedactionService {
  private static sensitiveHeaders = [
    "authorization",
    "cookie",
    "set-cookie",
    "x-api-key",
    "apikey",
    "token",
    "session",
  ];

  private static sensitiveKeys = [
    "password",
    "secret",
    "token",
    "apikey",
    "client_secret",
    "access_token",
    "refresh_token",
  ];

  static redactHeaders(headers: Record<string, string> | any[]): any {
    if (Array.isArray(headers)) {
      return headers.map(h => ({
        ...h,
        value: this.sensitiveHeaders.includes(h.key?.toLowerCase()) ? "[REDACTED]" : h.value
      }));
    }

    const redacted: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (this.sensitiveHeaders.includes(key.toLowerCase())) {
        redacted[key] = "[REDACTED]";
      } else {
        redacted[key] = value;
      }
    }
    return redacted;
  }

  static redactJson(data: any): any {
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        return JSON.stringify(this.redactObject(parsed), null, 2);
      } catch (e) {
        return this.redactString(data);
      }
    }
    return this.redactObject(data);
  }

  private static redactObject(obj: any): any {
    if (!obj || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) {
      return obj.map(item => this.redactObject(item));
    }

    const redacted: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (this.isSensitiveKey(key)) {
        redacted[key] = "[REDACTED]";
      } else if (typeof value === "object") {
        redacted[key] = this.redactObject(value);
      } else if (typeof value === "string") {
        redacted[key] = this.redactString(value);
      } else {
        redacted[key] = value;
      }
    }
    return redacted;
  }

  private static isSensitiveKey(key: string): boolean {
    const k = key.toLowerCase();
    return this.sensitiveKeys.some(s => k.includes(s));
  }

  private static redactString(str: string): string {
    // Redact JWTs
    let result = str.replace(/ey[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, "[REDACTED_JWT]");
    // Redact Bearer tokens
    result = result.replace(/Bearer\s+[A-Za-z0-9-_.+]+/ig, "Bearer [REDACTED]");
    return result;
  }
}
