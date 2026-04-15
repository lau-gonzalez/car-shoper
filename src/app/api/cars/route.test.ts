import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '@/auth';
import { GET, POST } from './route';

const mockAuth = vi.mocked(auth);

const testAgency = {
  name: 'Test Agency',
  slug: 'test-agency',
};

function makeRequest(body: Record<string, unknown>, url = 'http://localhost/api/cars') {
  return new Request(url, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeGetRequest(url = 'http://localhost/api/cars') {
  return new Request(url, { method: 'GET' });
}

describe('POST /api/cars', () => {
  let agencyId: string;

  beforeEach(async () => {
    await prisma.car.deleteMany();
    await prisma.seller.deleteMany();
    await prisma.agency.deleteMany();
    const agency = await prisma.agency.create({ data: testAgency });
    agencyId = agency.id;
    mockAuth.mockResolvedValue({
      user: { id: 'seller1', email: 'a@b.com', name: 'Seller', agencyId, agencyName: 'Test Agency' },
      expires: '',
    });
  });

  it('creates a car and returns 201', async () => {
    const res = await POST(makeRequest({
      make: 'Toyota', model: 'Camry', year: 2023, price: 25000,
    }) as never);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.make).toBe('Toyota');
    expect(data.agencyId).toBe(agencyId);
  });

  it('returns 400 for missing required fields', async () => {
    const res = await POST(makeRequest({ make: 'Toyota' }) as never);
    expect(res.status).toBe(400);
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await POST(makeRequest({
      make: 'Toyota', model: 'Camry', year: 2023, price: 25000,
    }) as never);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/cars', () => {
  let agencyId: string;

  beforeEach(async () => {
    await prisma.car.deleteMany();
    await prisma.seller.deleteMany();
    await prisma.agency.deleteMany();
    const agency = await prisma.agency.create({ data: testAgency });
    agencyId = agency.id;

    const otherAgency = await prisma.agency.create({ data: { name: 'Other', slug: 'other' } });

    await prisma.car.createMany({
      data: [
        { make: 'Toyota', model: 'Camry', year: 2023, price: 25000, agencyId },
        { make: 'Honda', model: 'Civic', year: 2022, price: 22000, agencyId },
        { make: 'Ford', model: 'F150', year: 2023, price: 45000, agencyId: otherAgency.id },
      ],
    });

    mockAuth.mockResolvedValue({
      user: { id: 'seller1', email: 'a@b.com', name: 'Seller', agencyId, agencyName: 'Test Agency' },
      expires: '',
    });
  });

  it('returns only cars from the seller agency', async () => {
    const res = await GET(makeGetRequest() as never);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveLength(2);
    expect(data.every((c: { agencyId: string }) => c.agencyId === agencyId)).toBe(true);
  });
});

describe('POST /api/cars - malformed body', () => {
  beforeEach(async () => {
    mockAuth.mockResolvedValue({
      user: { id: 'seller1', email: 'a@b.com', name: 'Seller', agencyId: 'test', agencyName: 'Test' },
      expires: '',
    });
  });

  it('returns 400 for invalid JSON', async () => {
    const request = new Request('http://localhost/api/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{broken json',
    });
    const res = await POST(request as never);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Invalid request body');
  });
});
