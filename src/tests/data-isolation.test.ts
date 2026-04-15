import { describe, it, expect, beforeEach, vi } from 'vitest';
import { prisma } from '@/lib/prisma';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

import { auth } from '@/auth';
import { GET as getCars, POST as createCar } from '@/app/api/cars/route';
import { GET as getCar, PUT as updateCar, DELETE as deleteCar } from '@/app/api/cars/[id]/route';
import { GET as getSettings, PUT as updateSettings } from '@/app/api/agency/settings/route';

const mockAuth = vi.mocked(auth);

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe('Cross-agency data isolation', () => {
  let agencyA: { id: string };
  let agencyB: { id: string };
  let carA: { id: string };
  let carB: { id: string };

  beforeEach(async () => {
    await prisma.car.deleteMany();
    await prisma.seller.deleteMany();
    await prisma.agency.deleteMany();

    agencyA = await prisma.agency.create({
      data: { name: 'Agency A', slug: 'agency-a' },
    });
    agencyB = await prisma.agency.create({
      data: { name: 'Agency B', slug: 'agency-b' },
    });

    carA = await prisma.car.create({
      data: { make: 'Toyota', model: 'Camry', year: 2023, price: 25000, agencyId: agencyA.id },
    });
    carB = await prisma.car.create({
      data: { make: 'Honda', model: 'Civic', year: 2023, price: 22000, agencyId: agencyB.id },
    });
  });

  function mockAsAgencyA() {
    mockAuth.mockResolvedValue({
      user: { id: 'sellerA', email: 'a@test.com', name: 'Seller A', agencyId: agencyA.id, agencyName: 'Agency A' },
      expires: '',
    });
  }

  describe('Car listing isolation', () => {
    it('GET /api/cars returns only own agency cars', async () => {
      mockAsAgencyA();
      const res = await getCars(new Request('http://localhost/api/cars') as never);
      const data = await res.json();
      expect(data).toHaveLength(1);
      expect(data[0].id).toBe(carA.id);
    });

    it('POST /api/cars creates car scoped to own agency', async () => {
      mockAsAgencyA();
      const res = await createCar(new Request('http://localhost/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ make: 'Ford', model: 'F150', year: 2024, price: 45000 }),
      }) as never);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.agencyId).toBe(agencyA.id);
    });
  });

  describe('Car detail isolation', () => {
    it('GET /api/cars/[id] returns 404 for other agency car', async () => {
      mockAsAgencyA();
      const req = new Request('http://localhost/api/cars/' + carB.id);
      const res = await getCar(req as never, makeParams(carB.id));
      expect(res.status).toBe(404);
    });

    it('PUT /api/cars/[id] returns 404 for other agency car', async () => {
      mockAsAgencyA();
      const req = new Request('http://localhost/api/cars/' + carB.id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: 99999 }),
      });
      const res = await updateCar(req as never, makeParams(carB.id));
      expect(res.status).toBe(404);

      const unchanged = await prisma.car.findUnique({ where: { id: carB.id } });
      expect(unchanged!.price).toBe(22000);
    });

    it('DELETE /api/cars/[id] returns 404 for other agency car', async () => {
      mockAsAgencyA();
      const req = new Request('http://localhost/api/cars/' + carB.id, { method: 'DELETE' });
      const res = await deleteCar(req as never, makeParams(carB.id));
      expect(res.status).toBe(404);

      const stillExists = await prisma.car.findUnique({ where: { id: carB.id } });
      expect(stillExists).not.toBeNull();
    });
  });

  describe('Agency settings isolation', () => {
    it('GET /api/agency/settings returns only own agency', async () => {
      mockAsAgencyA();
      const res = await getSettings();
      const data = await res.json();
      expect(data.id).toBe(agencyA.id);
      expect(data.name).toBe('Agency A');
    });

    it('PUT /api/agency/settings updates only own agency', async () => {
      mockAsAgencyA();
      const req = new Request('http://localhost/api/agency/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Agency A Updated' }),
      });
      const res = await updateSettings(req as never);
      expect(res.status).toBe(200);

      const agencyBUnchanged = await prisma.agency.findUnique({ where: { id: agencyB.id } });
      expect(agencyBUnchanged!.name).toBe('Agency B');
    });
  });
});
