import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { validateCar } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');

  const where: { agencyId: string; status?: string } = {
    agencyId: session.user.agencyId,
  };
  if (status) {
    where.status = status;
  }

  const cars = await prisma.car.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(cars);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { valid, errors } = validateCar(body);
  if (!valid) {
    return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
  }

  const car = await prisma.car.create({
    data: {
      make: body.make,
      model: body.model,
      year: body.year,
      price: body.price,
      mileage: body.mileage ?? 0,
      description: body.description ?? null,
      images: body.images ?? '[]',
      status: body.status ?? 'available',
      agencyId: session.user.agencyId,
    },
  });

  return NextResponse.json(car, { status: 201 });
}
