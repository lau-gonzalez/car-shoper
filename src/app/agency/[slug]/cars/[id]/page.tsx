import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ContactForm from './contact-form';

interface Props {
  params: Promise<{ slug: string; id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, id } = await params;
  const agency = await prisma.agency.findUnique({ where: { slug } });
  if (!agency) return { title: 'Not Found' };

  const car = await prisma.car.findFirst({
    where: { id, agencyId: agency.id, status: 'available' },
  });
  if (!car) return { title: 'Car Not Found' };

  return {
    title: `${car.year} ${car.make} ${car.model} - ${agency.name}`,
    description: car.description || `${car.year} ${car.make} ${car.model} for sale at ${agency.name}`,
  };
}

export default async function CarDetailPage({ params }: Props) {
  const { slug, id } = await params;

  const agency = await prisma.agency.findUnique({ where: { slug } });
  if (!agency) notFound();

  const car = await prisma.car.findFirst({
    where: { id, agencyId: agency.id, status: 'available' },
  });
  if (!car) notFound();

  let images: string[] = [];
  try {
    const parsed = JSON.parse(car.images);
    if (Array.isArray(parsed)) images = parsed;
  } catch {
    /* ignore */
  }

  return (
    <>
      <a href={`/agency/${slug}`} style={{ color: '#0070f3', marginBottom: 16, display: 'inline-block' }}>
        &larr; Back to listings
      </a>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 16 }}>
        <div>
          {images.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`${car.make} ${car.model} image ${i + 1}`}
                  style={{ width: '100%', borderRadius: 8, objectFit: 'cover' }}
                />
              ))}
            </div>
          ) : (
            <div
              style={{
                height: 300,
                background: '#f0f0f0',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#aaa',
              }}
            >
              No images available
            </div>
          )}
        </div>

        <div>
          <h1 style={{ margin: '0 0 8px' }}>
            {car.year} {car.make} {car.model}
          </h1>
          <p style={{ fontSize: 28, fontWeight: 700, color: '#0070f3', margin: '0 0 24px' }}>
            ${car.price.toLocaleString()}
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                ['Make', car.make],
                ['Model', car.model],
                ['Year', car.year],
                ['Mileage', `${car.mileage.toLocaleString()} miles`],
                ['Status', car.status],
              ].map(([label, value]) => (
                <tr key={String(label)}>
                  <td style={{ padding: '8px 0', fontWeight: 600, borderBottom: '1px solid #eee', width: 120 }}>
                    {String(label)}
                  </td>
                  <td style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    {String(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {car.description && (
            <div style={{ marginTop: 24 }}>
              <h3>Description</h3>
              <p style={{ lineHeight: 1.6 }}>{car.description}</p>
            </div>
          )}

          <div style={{ marginTop: 32, padding: 16, background: '#f8f8f8', borderRadius: 8 }}>
            <h3 style={{ margin: '0 0 8px' }}>Contact {agency.name}</h3>
            {agency.contactEmail && <p style={{ margin: '4px 0' }}>Email: {agency.contactEmail}</p>}
            {agency.phone && <p style={{ margin: '4px 0' }}>Phone: {agency.phone}</p>}
            {agency.address && <p style={{ margin: '4px 0' }}>Address: {agency.address}</p>}
            {!agency.contactEmail && !agency.phone && (
              <p style={{ color: '#888' }}>Contact information not available</p>
            )}
          </div>

          <ContactForm carId={car.id} />
        </div>
      </div>
    </>
  );
}
