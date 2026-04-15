import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { resetRateLimit } from '@/lib/rate-limit';
import { POST } from './route';

function makeRequest(body: Record<string, string>) {
  return new Request('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test Seller',
  agencyName: 'Test Agency',
  agencySlug: 'test-agency',
};

describe('POST /api/auth/register', () => {
  beforeEach(async () => {
    resetRateLimit();
    await prisma.seller.deleteMany();
    await prisma.agency.deleteMany();
  });

  it('creates a seller and agency and returns 201', async () => {
    const request = makeRequest(validBody);
    const response = await POST(request as never);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.email).toBe('test@example.com');
    expect(data.name).toBe('Test Seller');
    expect(data.id).toBeDefined();

    const agency = await prisma.agency.findUnique({
      where: { slug: 'test-agency' },
    });
    expect(agency).not.toBeNull();
    expect(agency!.name).toBe('Test Agency');
  });

  it('returns 409 for duplicate email', async () => {
    const request1 = makeRequest(validBody);
    await POST(request1 as never);

    const request2 = makeRequest({ ...validBody, agencySlug: 'other-agency' });
    const response = await POST(request2 as never);

    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toBe('Email already registered');
  });

  it('returns 400 for missing fields', async () => {
    const request = makeRequest({ email: 'test@example.com' });
    const response = await POST(request as never);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Missing required fields');
  });

  it('returns 400 for password shorter than 8 characters', async () => {
    const request = makeRequest({ ...validBody, password: 'short' });
    const response = await POST(request as never);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Password must be at least 8 characters');
  });

  it('returns 429 after rate limit exceeded', async () => {
    for (let i = 0; i < 10; i++) {
      const request = makeRequest({
        ...validBody,
        email: `user${i}@example.com`,
        agencySlug: `agency-${i}`,
      });
      await POST(request as never);
    }

    const request = makeRequest({
      ...validBody,
      email: 'blocked@example.com',
      agencySlug: 'blocked-agency',
    });
    const response = await POST(request as never);
    expect(response.status).toBe(429);
  });

  it('returns 400 for malformed JSON body', async () => {
    const request = new Request('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json',
    });
    const response = await POST(request as never);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('Invalid request body');
  });
});
