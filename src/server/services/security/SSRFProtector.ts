export class SSRFProtector {
  // Common internal IPv4 blocks (RFC 1918, RFC 1122, etc.)
  private static readonly BLOCKED_IP_RANGES = [
    /^127\./,           // localhost
    /^10\./,            // private class A
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // private class B
    /^192\.168\./,      // private class C
    /^169\.254\./,      // link-local (AWS metadata, etc)
    /^0\./              // "this" network
  ];

  // Blocked domains to prevent internal resolution
  private static readonly BLOCKED_DOMAINS = [
    "localhost",
    "metadata.google.internal",
    "instance-data"
  ];

  public static async validateUrl(url: string): Promise<boolean> {
    try {
      const parsed = new URL(url);

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return false;
      }

      const hostname = parsed.hostname.toLowerCase();

      // Check explicit blocked domains
      if (this.BLOCKED_DOMAINS.includes(hostname) || hostname.endsWith(".internal") || hostname.endsWith(".local")) {
        return false;
      }

      // Check IP matching
      for (const pattern of this.BLOCKED_IP_RANGES) {
        if (pattern.test(hostname)) {
          return false;
        }
      }

      // Note: A true production implementation would also resolve the DNS of the hostname 
      // and verify the resulting IP against BLOCKED_IP_RANGES to prevent DNS rebinding,
      // but standard Edge environments / simple fetch wrappers do not expose native DNS modules easily.
      // We will perform the static analysis here.
      
      return true;
    } catch (e) {
      return false; // Invalid URL
    }
  }
}
