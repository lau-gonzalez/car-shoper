import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '@/auth';
import { GET, PATCH } from './route';

const mockAuth = vi.mocked(auth);

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('/api/inquiries/[id]', () => {
  let agencyId: string;
  let inquiryId: string;

  beforeEach(async () => {
    await prisma.inquiry.deleteMany();
    await prisma.car.deleteMany();
    await prisma.seller.deleteMany();
    await prisma.agency.deleteMany();

    const agency = await prisma.agency.create({
      data: { name: 'Test Agency', slug: 'test-agency' },
    });
    agencyId = agency.id;

    const car = await prisma.car.create({
      data: { make: 'Toyota', model: 'Camry', year: 2023, price: 25000, agencyId },
    });

    const inquiry = await prisma.inquiry.create({
      data: {
        customerName: 'John',
        email: 'john@test.com',
        message: 'Interested',
        carId: car.id,
        agencyId,
      },
    });
    inquiryId = inquiry.id;

    mockAuth.mockResolvedValue({
      user: { id: 'seller1', email: 'a@b.com', name: 'Seller', agencyId, agencyName: 'Test Agency' },
      expires: '',
    });
  });

  describe('GET', () => {
    it('returns the inquiry with car details', async () => {
      const req = new Request('http://localhost/api/inquiries/' + inquiryId);
      const res = await GET(req as never, makeParams(inquiryId));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.customerName).toBe('John');
      expect(data.car.make).toBe('Toyota');
    });

    it('returns 404 for other agency inquiry', async () => {
      const other = await prisma.agency.create({ data: { name: 'Other', slug: 'other' } });
      const car2 = await prisma.car.create({
        data: { make: 'Honda', model: 'Civic', year: 2023, price: 20000, agencyId: other.id },
      });
      const otherInquiry = await prisma.inquiry.create({
        data: { customerName: 'Jane', email: 'jane@test.com', message: 'Hi', carId: car2.id, agencyId: other.id },
      });

      const req = new Request('http://localhost/api/inquiries/' + otherInquiry.id);
      const res = await GET(req as never, makeParams(otherInquiry.id));
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH', () => {
    it('updates inquiry status to read', async () => {
      const req = new Request('http://localhost/api/inquiries/' + inquiryId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' }),
      });
      const res = await PATCH(req as never, makeParams(inquiryId));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('read');
    });

    it('updates inquiry status to responded', async () => {
      const req = new Request('http://localhost/api/inquiries/' + inquiryId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'responded' }),
      });
      const res = await PATCH(req as never, makeParams(inquiryId));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.status).toBe('responded');
    });

    it('returns 400 for invalid status', async () => {
      const req = new Request('http://localhost/api/inquiries/' + inquiryId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'invalid' }),
      });
      const res = await PATCH(req as never, makeParams(inquiryId));
      expect(res.status).toBe(400);
    });

    it('returns 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const req = new Request('http://localhost/api/inquiries/' + inquiryId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'read' }),
      });
      const res = await PATCH(req as never, makeParams(inquiryId));
      expect(res.status).toBe(401);
    });
  });
});
