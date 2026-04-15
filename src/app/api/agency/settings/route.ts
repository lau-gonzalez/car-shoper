import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const agency = await prisma.agency.findUnique({
    where: { id: session.user.agencyId },
  });

  if (!agency) {
    return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
  }

  return NextResponse.json(agency);
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const errors: string[] = [];

  if (body.name !== undefined && (!body.name || typeof body.name !== 'string')) {
    errors.push('name is required');
  }

  if (
    body.primaryColor !== undefined &&
    body.primaryColor !== null &&
    !/^#[0-9a-fA-F]{6}$/.test(body.primaryColor)
  ) {
    errors.push('primaryColor must be a valid hex color (e.g. #0070f3)');
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
  }

  const agency = await prisma.agency.update({
    where: { id: session.user.agencyId },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.contactEmail !== undefined && { contactEmail: body.contactEmail || null }),
      ...(body.phone !== undefined && { phone: body.phone || null }),
      ...(body.address !== undefined && { address: body.address || null }),
      ...(body.logo !== undefined && { logo: body.logo || null }),
      ...(body.primaryColor !== undefined && { primaryColor: body.primaryColor }),
    },
  });

  return NextResponse.json(agency);
}
