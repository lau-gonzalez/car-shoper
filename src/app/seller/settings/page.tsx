import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import SettingsForm from './settings-form';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.agencyId) {
    redirect('/login');
  }

  const agency = await prisma.agency.findUnique({
    where: { id: session.user.agencyId },
  });

  if (!agency) {
    redirect('/login');
  }

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: '0 16px' }}>
      <h1>Agency Settings</h1>
      <SettingsForm agency={agency} />
    </main>
  );
}
