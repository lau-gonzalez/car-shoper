import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SearchForm from './search-form';

const PAGE_SIZE = 12;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const agency = await prisma.agency.findUnique({ where: { slug } });
  if (!agency) return { title: 'Agency Not Found' };
  return {
    title: `${agency.name} - Browse Cars`,
    description: `Browse available cars at ${agency.name}`,
  };
}

export default async function AgencyListingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;

  const agency = await prisma.agency.findUnique({ where: { slug } });
  if (!agency) notFound();

  const page = Math.max(1, Number(sp.page) || 1);
  const where: Record<string, unknown> = {
    agencyId: agency.id,
    status: 'available',
  };

  if (sp.make) where.make = { contains: String(sp.make) };
  if (sp.model) where.model = { contains: String(sp.model) };
  if (sp.minYear || sp.maxYear) {
    where.year = {
      ...(sp.minYear && { gte: Number(sp.minYear) }),
      ...(sp.maxYear && { lte: Number(sp.maxYear) }),
    };
  }
  if (sp.minPrice || sp.maxPrice) {
    where.price = {
      ...(sp.minPrice && { gte: Number(sp.minPrice) }),
      ...(sp.maxPrice && { lte: Number(sp.maxPrice) }),
    };
  }

  const [cars, total] = await Promise.all([
    prisma.car.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.car.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  function buildPageUrl(p: number) {
    const params = new URLSearchParams();
    if (sp.make) params.set('make', String(sp.make));
    if (sp.model) params.set('model', String(sp.model));
    if (sp.minYear) params.set('minYear', String(sp.minYear));
    if (sp.maxYear) params.set('maxYear', String(sp.maxYear));
    if (sp.minPrice) params.set('minPrice', String(sp.minPrice));
    if (sp.maxPrice) params.set('maxPrice', String(sp.maxPrice));
    if (p > 1) params.set('page', String(p));
    const qs = params.toString();
    return `/agency/${slug}${qs ? `?${qs}` : ''}`;
  }

  return (
    <>
      <SearchForm slug={slug} />

      <p style={{ color: '#666', marginBottom: 16 }}>
        {total} car{total !== 1 ? 's' : ''} found
      </p>

      {cars.length === 0 ? (
        <p>No cars match your search criteria.</p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 20,
          }}
        >
          {cars.map((car) => {
            let imageUrl: string | null = null;
            try {
              const imgs = JSON.parse(car.images);
              if (Array.isArray(imgs) && imgs.length > 0) imageUrl = imgs[0];
            } catch {
              /* ignore malformed */
            }

            return (
              <a
                key={car.id}
                href={`/agency/${slug}/cars/${car.id}`}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 8,
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div
                  style={{
                    height: 180,
                    background: '#f0f0f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`${car.make} ${car.model}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ color: '#aaa' }}>No image</span>
                  )}
                </div>
                <div style={{ padding: 12 }}>
                  <h3 style={{ margin: '0 0 4px' }}>
                    {car.year} {car.make} {car.model}
                  </h3>
                  <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#0070f3' }}>
                    ${car.price.toLocaleString()}
                  </p>
                  <p style={{ margin: 0, color: '#888', fontSize: 14 }}>
                    {car.mileage.toLocaleString()} miles
                  </p>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <nav style={{ marginTop: 32, textAlign: 'center' }}>
          {page > 1 && (
            <a href={buildPageUrl(page - 1)} style={{ marginRight: 12 }}>
              Previous
            </a>
          )}
          <span>
            Page {page} of {totalPages}
          </span>
          {page < totalPages && (
            <a href={buildPageUrl(page + 1)} style={{ marginLeft: 12 }}>
              Next
            </a>
          )}
        </nav>
      )}
    </>
  );
}
