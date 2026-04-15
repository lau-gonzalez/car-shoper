import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('Agency listing data access', () => {
  let agencyId: string;

  beforeEach(async () => {
    await prisma.car.deleteMany();
    await prisma.seller.deleteMany();
    await prisma.agency.deleteMany();

    const agency = await prisma.agency.create({
      data: { name: 'Test Agency', slug: 'test-agency' },
    });
    agencyId = agency.id;

    const otherAgency = await prisma.agency.create({
      data: { name: 'Other', slug: 'other' },
    });

    await prisma.car.createMany({
      data: [
        { make: 'Toyota', model: 'Camry', year: 2023, price: 25000, mileage: 10000, status: 'available', agencyId },
        { make: 'Honda', model: 'Civic', year: 2022, price: 22000, mileage: 20000, status: 'available', agencyId },
        { make: 'Toyota', model: 'Corolla', year: 2021, price: 18000, mileage: 30000, status: 'sold', agencyId },
        { make: 'Ford', model: 'F150', year: 2023, price: 45000, mileage: 5000, status: 'available', agencyId: otherAgency.id },
      ],
    });
  });

  it('only returns available cars for the agency', async () => {
    const cars = await prisma.car.findMany({
      where: { agencyId, status: 'available' },
    });
    expect(cars).toHaveLength(2);
    expect(cars.every((c) => c.status === 'available')).toBe(true);
    expect(cars.every((c) => c.agencyId === agencyId)).toBe(true);
  });

  it('filters by make', async () => {
    const cars = await prisma.car.findMany({
      where: { agencyId, status: 'available', make: { contains: 'Toyota' } },
    });
    expect(cars).toHaveLength(1);
    expect(cars[0].make).toBe('Toyota');
  });

  it('filters by price range', async () => {
    const cars = await prisma.car.findMany({
      where: {
        agencyId,
        status: 'available',
        price: { gte: 23000, lte: 30000 },
      },
    });
    expect(cars).toHaveLength(1);
    expect(cars[0].price).toBe(25000);
  });

  it('filters by year range', async () => {
    const cars = await prisma.car.findMany({
      where: {
        agencyId,
        status: 'available',
        year: { gte: 2023 },
      },
    });
    expect(cars).toHaveLength(1);
    expect(cars[0].year).toBe(2023);
  });

  it('paginates correctly', async () => {
    const page1 = await prisma.car.findMany({
      where: { agencyId, status: 'available' },
      take: 1,
      skip: 0,
      orderBy: { createdAt: 'desc' },
    });
    const page2 = await prisma.car.findMany({
      where: { agencyId, status: 'available' },
      take: 1,
      skip: 1,
      orderBy: { createdAt: 'desc' },
    });

    expect(page1).toHaveLength(1);
    expect(page2).toHaveLength(1);
    expect(page1[0].id).not.toBe(page2[0].id);
  });

  it('returns empty for non-existent agency', async () => {
    const agency = await prisma.agency.findUnique({
      where: { slug: 'nonexistent' },
    });
    expect(agency).toBeNull();
  });
});
