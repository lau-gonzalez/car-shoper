import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <main style={{ maxWidth: 600, margin: '80px auto', padding: '0 16px' }}>
      <h1>Seller Profile</h1>
      <dl>
        <dt>
          <strong>Name</strong>
        </dt>
        <dd>{session.user.name}</dd>
        <dt>
          <strong>Email</strong>
        </dt>
        <dd>{session.user.email}</dd>
        <dt>
          <strong>Agency</strong>
        </dt>
        <dd>{session.user.agencyName}</dd>
      </dl>
      <form
        action={async () => {
          'use server';
          const { signOut } = await import('@/auth');
          await signOut({ redirectTo: '/login' });
        }}
      >
        <button type="submit" style={{ padding: '8px 16px', marginTop: 16 }}>
          Sign Out
        </button>
      </form>
    </main>
  );
}
