import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DeleteCarButton from './delete-car-button';

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.agencyId) {
    redirect('/login');
  }

  const cars = await prisma.car.findMany({
    where: { agencyId: session.user.agencyId },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: '0 16px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1>Dashboard - {session.user.agencyName}</h1>
        <a
          href="/seller/cars/new"
          style={{
            padding: '8px 16px',
            background: '#0070f3',
            color: 'white',
            textDecoration: 'none',
            borderRadius: 4,
          }}
        >
          Add Car
        </a>
      </div>

      {cars.length === 0 ? (
        <p>No cars listed yet. Add your first car!</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: 20,
          }}
        >
          <thead>
            <tr>
              {['Make', 'Model', 'Year', 'Price', 'Status', 'Actions'].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      borderBottom: '2px solid #ddd',
                      padding: 8,
                      textAlign: 'left',
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => (
              <tr key={car.id}>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  {car.make}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  {car.model}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  {car.year}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  ${car.price.toLocaleString()}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  {car.status}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  <a
                    href={`/seller/cars/${car.id}/edit`}
                    style={{ marginRight: 8 }}
                  >
                    Edit
                  </a>
                  <DeleteCarButton carId={car.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
