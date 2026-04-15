'use client';

import { useRouter } from 'next/navigation';

export default function DeleteCarButton({ carId }: { carId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this car?')) return;

    const res = await fetch(`/api/cars/${carId}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <button
      onClick={handleDelete}
      style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
    >
      Delete
    </button>
  );
}
