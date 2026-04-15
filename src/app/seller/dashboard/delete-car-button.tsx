'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteCarButton({ carId }: { carId: string }) {
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this car?')) return;
    setError('');

    try {
      const res = await fetch(`/api/cars/${carId}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Failed to delete car');
      }
    } catch {
      setError('Network error');
    }
  }

  return (
    <>
      <button
        onClick={handleDelete}
        style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}
      >
        Delete
      </button>
      {error && (
        <span style={{ color: 'red', fontSize: 12, marginLeft: 4 }}>{error}</span>
      )}
    </>
  );
}
