const VALID_STATUSES = ['available', 'sold', 'reserved'];

interface CarInput {
  make?: string;
  model?: string;
  year?: number;
  price?: number;
  mileage?: number;
  description?: string;
  images?: string;
  status?: string;
}

export function validateCar(
  body: CarInput,
  partial = false,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!partial || body.make !== undefined) {
    if (!body.make || typeof body.make !== 'string' || !body.make.trim()) {
      errors.push('make is required');
    }
  }

  if (!partial || body.model !== undefined) {
    if (!body.model || typeof body.model !== 'string' || !body.model.trim()) {
      errors.push('model is required');
    }
  }

  if (!partial || body.year !== undefined) {
    if (
      body.year === undefined ||
      typeof body.year !== 'number' ||
      body.year < 1900 ||
      body.year > 2100
    ) {
      errors.push('year must be a number between 1900 and 2100');
    }
  }

  if (!partial || body.price !== undefined) {
    if (
      body.price === undefined ||
      typeof body.price !== 'number' ||
      body.price <= 0
    ) {
      errors.push('price must be a positive number');
    }
  }

  if (body.mileage !== undefined) {
    if (typeof body.mileage !== 'number' || body.mileage < 0) {
      errors.push('mileage must be a non-negative number');
    }
  }

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface InquiryInput {
  customerName?: string;
  email?: string;
  phone?: string;
  message?: string;
  carId?: string;
}

export function validateInquiry(body: InquiryInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!body.customerName || typeof body.customerName !== 'string' || !body.customerName.trim()) {
    errors.push('customerName is required');
  }

  if (!body.email || typeof body.email !== 'string' || !EMAIL_REGEX.test(body.email)) {
    errors.push('a valid email is required');
  }

  if (!body.message || typeof body.message !== 'string' || !body.message.trim()) {
    errors.push('message is required');
  } else if (body.message.length > 2000) {
    errors.push('message must be under 2000 characters');
  }

  if (!body.carId || typeof body.carId !== 'string') {
    errors.push('carId is required');
  }

  return { valid: errors.length === 0, errors };
}
