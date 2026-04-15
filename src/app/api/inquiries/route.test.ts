import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { resetRateLimit } from '@/lib/rate-limit';
import { POST } from './route';

function makeRequest(body: Record<string, unknown>) {
  return new Request('http://localhost/api/inquiries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': '127.0.0.1',
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/inquiries', () => {
  let carId: string;

  beforeEach(async () => {
    resetRateLimit();
    await prisma.inquiry.deleteMany();
    await prisma.car.deleteMany();
    await prisma.seller.deleteMany();
    await prisma.agency.deleteMany();

    const agency = await prisma.agency.create({
      data: { name: 'Test Agency', slug: 'test-agency' },
    });
    const car = await prisma.car.create({
      data: {
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        price: 25000,
        agencyId: agency.id,
      },
    });
    carId = car.id;
  });

  const validBody = () => ({
    customerName: 'John Doe',
    email: 'john@example.com',
    message: 'I am interested in this car.',
    carId,
  });

  it('creates an inquiry and returns 201', async () => {
    const res = await POST(makeRequest(validBody()) as never);
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.id).toBeDefined();

    const count = await prisma.inquiry.count();
    expect(count).toBe(1);
  });

  it('returns 400 for missing required fields', async () => {
    const res = await POST(
      makeRequest({ customerName: 'John' }) as never,
    );
    expect(res.status).toBe(400);
  });

  it('returns 404 for non-existent car', async () => {
    const res = await POST(
      makeRequest({ ...validBody(), carId: 'nonexistent' }) as never,
    );
    expect(res.status).toBe(404);
  });

  it('silently accepts honeypot submissions without storing', async () => {
    const res = await POST(
      makeRequest({ ...validBody(), _hp: 'bot-filled' }) as never,
    );
    expect(res.status).toBe(201);

    const count = await prisma.inquiry.count();
    expect(count).toBe(0);
  });

  it('returns 429 after rate limit exceeded', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await POST(makeRequest(validBody()) as never);
      expect(res.status).toBe(201);
    }

    const res = await POST(makeRequest(validBody()) as never);
    expect(res.status).toBe(429);
  });
});
