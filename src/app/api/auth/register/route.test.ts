import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
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
});
