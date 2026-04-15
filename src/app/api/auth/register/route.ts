import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { parseBody } from '@/lib/parse-body';

export async function POST(request: NextRequest) {
  const { body, error: parseError } = await parseBody(request);
  if (!body) return parseError!;
  const { email, password, name, agencyName, agencySlug } = body;

  if (!email || !password || !name || !agencyName || !agencySlug) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 },
    );
  }

  const existingSeller = await prisma.seller.findUnique({ where: { email } });
  if (existingSeller) {
    return NextResponse.json(
      { error: 'Email already registered' },
      { status: 409 },
    );
  }

  const hashedPassword = await hash(password, 12);

  const agency = await prisma.agency.upsert({
    where: { slug: agencySlug },
    update: {},
    create: {
      name: agencyName,
      slug: agencySlug,
    },
  });

  const seller = await prisma.seller.create({
    data: {
      email,
      password: hashedPassword,
      name,
      agencyId: agency.id,
    },
  });

  return NextResponse.json(
    { id: seller.id, email: seller.email, name: seller.name },
    { status: 201 },
  );
}
