import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { validateCar } from '@/lib/validation';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const car = await prisma.car.findFirst({
    where: { id, agencyId: session.user.agencyId },
  });

  if (!car) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 });
  }

  return NextResponse.json(car);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.car.findFirst({
    where: { id, agencyId: session.user.agencyId },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 });
  }

  const body = await request.json();
  const { valid, errors } = validateCar(body, true);
  if (!valid) {
    return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
  }

  const car = await prisma.car.update({
    where: { id },
    data: {
      ...(body.make !== undefined && { make: body.make }),
      ...(body.model !== undefined && { model: body.model }),
      ...(body.year !== undefined && { year: body.year }),
      ...(body.price !== undefined && { price: body.price }),
      ...(body.mileage !== undefined && { mileage: body.mileage }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.images !== undefined && { images: body.images }),
      ...(body.status !== undefined && { status: body.status }),
    },
  });

  return NextResponse.json(car);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.car.findFirst({
    where: { id, agencyId: session.user.agencyId },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 });
  }

  await prisma.car.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
