import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { parseBody } from '@/lib/parse-body';

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

  const { body, error: parseError } = await parseBody(request);
  if (!body) return parseError!;
  const errors: string[] = [];

  if (body.name !== undefined && (!body.name || typeof body.name !== 'string')) {
    errors.push('name is required');
  }

  if (
    body.contactEmail !== undefined &&
    body.contactEmail !== null &&
    body.contactEmail !== '' &&
    (typeof body.contactEmail !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.contactEmail))
  ) {
    errors.push('contactEmail must be a valid email address');
  }

  if (body.phone !== undefined && body.phone !== null && body.phone !== '') {
    if (typeof body.phone !== 'string' || body.phone.length > 30) {
      errors.push('phone must be a string of at most 30 characters');
    }
  }

  if (body.address !== undefined && body.address !== null && body.address !== '') {
    if (typeof body.address !== 'string' || body.address.length > 200) {
      errors.push('address must be a string of at most 200 characters');
    }
  }

  if (body.logo !== undefined && body.logo !== null && body.logo !== '') {
    if (typeof body.logo !== 'string') {
      errors.push('logo must be a string');
    } else {
      try {
        new URL(body.logo);
      } catch {
        errors.push('logo must be a valid URL');
      }
    }
  }

  if (
    body.primaryColor !== undefined &&
    body.primaryColor !== null &&
    (typeof body.primaryColor !== 'string' ||
      !/^#[0-9a-fA-F]{6}$/.test(body.primaryColor))
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
