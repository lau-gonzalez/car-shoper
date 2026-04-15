import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

export default async function AgencyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const agency = await prisma.agency.findUnique({ where: { slug } });

  if (!agency) {
    notFound();
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <header
        style={{
          borderBottom: '1px solid #ddd',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <a
          href={`/agency/${slug}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <h2 style={{ margin: 0 }}>{agency.name}</h2>
        </a>
        {agency.contactEmail && (
          <span style={{ color: '#666', fontSize: 14 }}>
            {agency.contactEmail}
          </span>
        )}
      </header>
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
        {children}
      </main>
    </div>
  );
}
