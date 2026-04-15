import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '@/auth';
import { GET, PUT } from './route';

const mockAuth = vi.mocked(auth);

describe('/api/agency/settings', () => {
  let agencyId: string;

  beforeEach(async () => {
    await prisma.car.deleteMany();
    await prisma.seller.deleteMany();
    await prisma.agency.deleteMany();

    const agency = await prisma.agency.create({
      data: {
        name: 'Test Agency',
        slug: 'test-agency',
        primaryColor: '#0070f3',
      },
    });
    agencyId = agency.id;

    mockAuth.mockResolvedValue({
      user: { id: 'seller1', email: 'a@b.com', name: 'Seller', agencyId, agencyName: 'Test Agency' },
      expires: '',
    });
  });

  it('GET returns agency settings', async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('Test Agency');
    expect(data.primaryColor).toBe('#0070f3');
  });

  it('PUT updates agency settings', async () => {
    const req = new Request('http://localhost/api/agency/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Updated Agency',
        contactEmail: 'contact@test.com',
        primaryColor: '#ff0000',
      }),
    });
    const res = await PUT(req as never);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.name).toBe('Updated Agency');
    expect(data.contactEmail).toBe('contact@test.com');
    expect(data.primaryColor).toBe('#ff0000');
  });

  it('PUT returns 400 for invalid color', async () => {
    const req = new Request('http://localhost/api/agency/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ primaryColor: 'notacolor' }),
    });
    const res = await PUT(req as never);
    expect(res.status).toBe(400);
  });

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });
});
