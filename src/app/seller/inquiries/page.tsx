import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import InquiryActions from './inquiry-actions';

export default async function InquiriesPage() {
  const session = await auth();
  if (!session?.user?.agencyId) {
    redirect('/login');
  }

  const inquiries = await prisma.inquiry.findMany({
    where: { agencyId: session.user.agencyId },
    include: { car: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main style={{ maxWidth: 900, margin: '40px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Inquiries</h1>
        <a href="/seller/dashboard">Back to Dashboard</a>
      </div>

      {inquiries.length === 0 ? (
        <p>No inquiries yet.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 20 }}>
          <thead>
            <tr>
              {['Customer', 'Email', 'Car', 'Status', 'Date', 'Actions'].map((h) => (
                <th key={h} style={{ borderBottom: '2px solid #ddd', padding: 8, textAlign: 'left' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.id} style={{ background: inquiry.status === 'unread' ? '#fffde7' : 'transparent' }}>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  <strong>{inquiry.customerName}</strong>
                  {inquiry.phone && <br />}
                  {inquiry.phone && <span style={{ fontSize: 12, color: '#666' }}>{inquiry.phone}</span>}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>{inquiry.email}</td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  {inquiry.car.year} {inquiry.car.make} {inquiry.car.model}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  <span
                    style={{
                      padding: '2px 8px',
                      borderRadius: 4,
                      fontSize: 12,
                      background: inquiry.status === 'unread' ? '#ffd54f' : inquiry.status === 'read' ? '#90caf9' : '#a5d6a7',
                    }}
                  >
                    {inquiry.status}
                  </span>
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee', fontSize: 13 }}>
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: 8, borderBottom: '1px solid #eee' }}>
                  <InquiryActions inquiryId={inquiry.id} currentStatus={inquiry.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
