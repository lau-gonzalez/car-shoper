import { NextRequest, NextResponse } from 'next/server';
import { handlers } from '@/auth';
import { checkRateLimit, AUTH_RATE_LIMIT } from '@/lib/rate-limit';

export const { GET } = handlers;

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { allowed } = checkRateLimit(ip, AUTH_RATE_LIMIT, 'login');
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  return handlers.POST(request);
}
