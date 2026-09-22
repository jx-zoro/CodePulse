import { NextResponse } from 'next/server';
import { SSRFProtector } from '@/server/services/security/SSRFProtector';
import { RateLimiter } from '@/server/services/security/RateLimiter';

export async function POST(req: Request) {
  try {
    const { url, method, headers, body } = await req.json();

    // Rate Limiting (50 requests per 1 minute per IP/Session)
    // In Edge/App router without a real reverse proxy, we use a crude fallback to headers or 'global' if unavailable.
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const isAllowed = RateLimiter.checkLimit("proxy_" + ip, 50, 60000);
    if (!isAllowed) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // SSRF Protection
    const isSafeUrl = await SSRFProtector.validateUrl(url);
    if (!isSafeUrl) {
      return NextResponse.json({ error: 'URL blocked by security policy. Internal IP ranges and localhosts are forbidden.' }, { status: 403 });
    }

    const fetchOptions: RequestInit = {
      method,
      headers: headers || {},
      // Don't include body for GET/HEAD
      ...(method !== 'GET' && method !== 'HEAD' && body ? { body } : {}),
      // Don't follow redirects automatically so we can see 3xx responses
      redirect: 'manual', 
    };

    const startTime = performance.now();
    const response = await fetch(url, fetchOptions);
    const endTime = performance.now();

    // Get response body
    const contentType = response.headers.get('content-type') || '';
    let responseBody = '';
    
    // Convert arrayBuffer to string to handle both text and binary safely
    const arrayBuffer = await response.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    responseBody = decoder.decode(arrayBuffer);

    // Convert Headers object to plain record
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return NextResponse.json({
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: responseBody,
      time: endTime - startTime,
      size: arrayBuffer.byteLength,
      contentType
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to execute proxy request";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}




