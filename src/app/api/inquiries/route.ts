import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateInquiry } from '@/lib/validation';
import { checkRateLimit } from '@/lib/rate-limit';
import { parseBody } from '@/lib/parse-body';

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  const { allowed } = checkRateLimit(ip);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429 },
    );
  }

  const { body, error: parseError } = await parseBody(request);
  if (!body) return parseError!;

  // Honeypot: if _hp field is filled, silently accept but don't store
  if (body._hp) {
    return NextResponse.json({ success: true }, { status: 201 });
  }

  const { valid, errors } = validateInquiry(body);
  if (!valid) {
    return NextResponse.json({ error: errors.join(', ') }, { status: 400 });
  }

  const car = await prisma.car.findUnique({ where: { id: body.carId } });
  if (!car) {
    return NextResponse.json({ error: 'Car not found' }, { status: 404 });
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      customerName: body.customerName,
      email: body.email,
      phone: body.phone || null,
      message: body.message,
      carId: car.id,
      agencyId: car.agencyId,
    },
  });

  // Email notification placeholder
  console.log(
    `[Inquiry] New inquiry from ${body.customerName} (${body.email}) for ${car.make} ${car.model} at agency ${car.agencyId}`,
  );

  return NextResponse.json(
    {
      id: inquiry.id,
      success: true,
      note: 'Email notification is not yet configured.',
    },
    { status: 201 },
  );
}
