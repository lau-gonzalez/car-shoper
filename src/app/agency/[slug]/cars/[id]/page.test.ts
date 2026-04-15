import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('Car detail data access', () => {
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
        mileage: 10000,
        description: 'Great car',
        images: '["https://example.com/img1.jpg","https://example.com/img2.jpg"]',
        status: 'available',
        agencyId,
      },
    });
    carId = car.id;
  });

  it('returns available car for the correct agency', async () => {
    const car = await prisma.car.findFirst({
      where: { id: carId, agencyId, status: 'available' },
    });
    expect(car).not.toBeNull();
    expect(car!.make).toBe('Toyota');
  });

  it('returns null for sold car', async () => {
    await prisma.car.update({
      where: { id: carId },
      data: { status: 'sold' },
    });

    const car = await prisma.car.findFirst({
      where: { id: carId, agencyId, status: 'available' },
    });
    expect(car).toBeNull();
  });

  it('returns null for car from different agency', async () => {
    const other = await prisma.agency.create({
      data: { name: 'Other', slug: 'other' },
    });

    const car = await prisma.car.findFirst({
      where: { id: carId, agencyId: other.id, status: 'available' },
    });
    expect(car).toBeNull();
  });

  it('parses images JSON correctly', async () => {
    const car = await prisma.car.findFirst({
      where: { id: carId },
    });
    const images = JSON.parse(car!.images);
    expect(images).toHaveLength(2);
    expect(images[0]).toBe('https://example.com/img1.jpg');
  });
});
