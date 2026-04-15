import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '@/auth';
import { GET, PUT, DELETE } from './route';

const mockAuth = vi.mocked(auth);

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('/api/cars/[id]', () => {
  let agencyId: string;
  let carId: string;

  beforeEach(async () => {
    await prisma.car.deleteMany();
    await prisma.seller.deleteMany();
    await prisma.agency.deleteMany();
    const agency = await prisma.agency.create({
      data: { name: 'Test Agency', slug: 'test-agency' },
    });
    agencyId = agency.id;

    const car = await prisma.car.create({
      data: {
        make: 'Toyota',
        model: 'Camry',
        year: 2023,
        price: 25000,
        agencyId,
      },
    });
    carId = car.id;

    mockAuth.mockResolvedValue({
      user: {
        id: 'seller1',
        email: 'a@b.com',
        name: 'Seller',
        agencyId,
        agencyName: 'Test Agency',
      },
      expires: '',
    });
  });

  describe('GET', () => {
    it('returns the car', async () => {
      const req = new Request('http://localhost/api/cars/' + carId);
      const res = await GET(req as never, makeParams(carId));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.make).toBe('Toyota');
    });

    it('returns 404 for car from different agency', async () => {
      const other = await prisma.agency.create({
        data: { name: 'Other', slug: 'other' },
      });
      const otherCar = await prisma.car.create({
        data: {
          make: 'Ford',
          model: 'F150',
          year: 2023,
          price: 45000,
          agencyId: other.id,
        },
      });
      const req = new Request('http://localhost/api/cars/' + otherCar.id);
      const res = await GET(req as never, makeParams(otherCar.id));
      expect(res.status).toBe(404);
    });
  });

  describe('PUT', () => {
    it('updates the car', async () => {
      const req = new Request('http://localhost/api/cars/' + carId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: 23000, status: 'sold' }),
      });
      const res = await PUT(req as never, makeParams(carId));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.price).toBe(23000);
      expect(data.status).toBe('sold');
    });

    it('returns 400 for invalid data', async () => {
      const req = new Request('http://localhost/api/cars/' + carId, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: -100 }),
      });
      const res = await PUT(req as never, makeParams(carId));
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE', () => {
    it('deletes the car', async () => {
      const req = new Request('http://localhost/api/cars/' + carId, {
        method: 'DELETE',
      });
      const res = await DELETE(req as never, makeParams(carId));
      expect(res.status).toBe(200);

      const deleted = await prisma.car.findUnique({ where: { id: carId } });
      expect(deleted).toBeNull();
    });

    it('returns 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);
      const req = new Request('http://localhost/api/cars/' + carId, {
        method: 'DELETE',
      });
      const res = await DELETE(req as never, makeParams(carId));
      expect(res.status).toBe(401);
    });
  });
});
