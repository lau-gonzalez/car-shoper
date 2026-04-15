'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function InquiryActions({
  inquiryId,
  currentStatus,
}: {
  inquiryId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [error, setError] = useState('');

  async function updateStatus(status: string) {
    setError('');
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Failed to update status');
      }
    } catch {
      setError('Network error');
    }
  }

  return (
    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {currentStatus !== 'read' && (
        <button
          onClick={() => updateStatus('read')}
          style={{ fontSize: 12, padding: '2px 8px', cursor: 'pointer' }}
        >
          Mark Read
        </button>
      )}
      {currentStatus !== 'responded' && (
        <button
          onClick={() => updateStatus('responded')}
          style={{ fontSize: 12, padding: '2px 8px', cursor: 'pointer' }}
        >
          Responded
        </button>
      )}
      {error && (
        <span style={{ color: 'red', fontSize: 11 }}>{error}</span>
      )}
    </span>
  );
}
