import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { parseBody } from '@/lib/parse-body';

const VALID_STATUSES = ['unread', 'read', 'responded'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const inquiry = await prisma.inquiry.findFirst({
    where: { id, agencyId: session.user.agencyId },
    include: { car: true },
  });

  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
  }

  return NextResponse.json(inquiry);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.agencyId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.inquiry.findFirst({
    where: { id, agencyId: session.user.agencyId },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
  }

  const { body, error: parseError } = await parseBody(request);
  if (!body) return parseError!;

  if (!body.status || !VALID_STATUSES.includes(body.status as string)) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(', ')}` },
      { status: 400 },
    );
  }

  const inquiry = await prisma.inquiry.update({
    where: { id },
    data: { status: body.status },
  });

  return NextResponse.json(inquiry);
}
